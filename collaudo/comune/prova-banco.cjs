// Prova di FUMO del banco comune (finta Firebase): le 4 app + la pagina integrata si aprono, arrivano
// all'accesso, e il login con un utente seminato entra davvero. SOLO DATI INVENTATI.
//   bash collaudo/comune/prepara-comune.sh && node collaudo/comune/prova-banco.cjs [porta]
// Se `playwright` non si trova: NODE_PATH=/opt/node-tools/node_modules node ...
const { chromium } = require('playwright');
const PORTA = process.argv[2] || process.env.PORTA || '8340';
const URL = 'http://127.0.0.1:' + PORTA + '/';
const FO = 'spazio-ireos-foglio-ore', USO = 'rendicontazione-usoint';
const ADMIN = 'spazioireos@gmail.com', PWD = 'prova123';
let ok = 0, ko = 0;
function c(cond, desc, extra){ if (cond){ ok++; console.log('OK  ' + desc); } else { ko++; console.log('KO  ' + desc + (extra ? '  -> ' + extra : '')); } }

async function nuovo(browser, seed){
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const esterni = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith(URL) || u.startsWith('data:') || u.startsWith('blob:') || u === 'about:blank') return r.continue(); esterni.push(u); return r.abort(); });
  if (seed) await ctx.addInitScript(s => { window.__FAKEFB_SEED__ = s; }, seed);
  const page = await ctx.newPage();
  const errori = [];
  page.on('pageerror', e => errori.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errori.push('console: ' + m.text()); });
  page.on('dialog', async d => { errori.dialoghi = (errori.dialoghi || []); errori.dialoghi.push(d.type() + ': ' + d.message().slice(0, 80));
    if (d.type() === 'prompt') { const m = d.message(); return d.accept(/password/i.test(m) ? PWD : (d.defaultValue() || ADMIN)); }
    return d.accept(); });
  return { ctx, page, errori, esterni };
}
function fbErr(errori){ return errori.filter(e => /fakefb|firebase|is not a function|undefined is not|Cannot read propert/i.test(e)); }
async function fine(nome, t){
  c(t.esterni.length === 0, nome + ': nessuna richiesta verso l\'esterno', t.esterni.slice(0, 3).join(' | '));
  const fe = fbErr(t.errori);
  c(fe.length === 0, nome + ': nessun errore dovuto alla finta Firebase', fe.slice(0, 3).join(' | '));
  if (t.errori.length) console.log('    (errori di pagina/console: ' + t.errori.length + ') ' + t.errori.slice(0, 4).join(' | '));
  if (t.errori.dialoghi) console.log('    (dialoghi: ' + t.errori.dialoghi.join(' || ') + ')');
  await t.ctx.close();
}

(async () => {
  const browser = await chromium.launch();

  /* ---------------- Fogli ore: accesso admin con users/{uid} role admin ---------------- */
  {
    const t = await nuovo(browser, { id: 'fumo-fo', [FO]: { users: [{ email: ADMIN, password: PWD, uid: 'ADMIN0001' }],
      docs: { 'users/ADMIN0001': { email: ADMIN, name: 'AMMINISTRAZIONE PROVA', cognome: 'AMMINISTRAZIONE', nome: 'PROVA', role: 'admin' } } } });
    await t.page.goto(URL + 'fo/');
    await t.page.waitForSelector('#app-login:not(.hide)', { timeout: 15000 }).catch(() => {});
    c(await t.page.isVisible('#email'), 'Fogli ore: schermata di accesso');
    c(await t.page.evaluate(() => !!(window.firebase && window.__fakefb && firebase.apps.length === 1)), 'Fogli ore: finta Firebase caricata (1 app)');
    await t.page.fill('#email', ADMIN); await t.page.fill('#password', 'sbagliata'); await t.page.click('#auth-btn');
    await t.page.waitForTimeout(400);
    c(/errat/i.test(await t.page.textContent('#auth-error').catch(() => '')), 'Fogli ore: password sbagliata -> «Email o password errati»');
    await t.page.fill('#password', PWD); await t.page.click('#auth-btn');
    await t.page.waitForSelector('#app-main:not(.hide)', { timeout: 15000 }).catch(() => {});
    c(await t.page.isVisible('#app-main'), 'Fogli ore: login admin entra (#app-main visibile)');
    c(await t.page.evaluate(() => document.body.classList.contains('admin-mode')), 'Fogli ore: ruolo admin riconosciuto (admin-mode)');
    await t.page.reload(); await t.page.waitForSelector('#app-main:not(.hide)', { timeout: 15000 }).catch(() => {});
    c(await t.page.isVisible('#app-main'), 'Fogli ore: la sessione resta dopo il ricaricamento');
    await fine('Fogli ore', t);
  }

  /* ---------------- Dipendenti: login admin + documento report-ore-mensile/{uid} ---------------- */
  {
    const doc = { dipendenti: [{ id: 'd1', nome: 'ROSSI MARIO', livello: 'D1', oreSett: 19, tipoContratto: 'indeterminato', proroghe: [], trasformazioni: [], orariTemp: [], ana: {}, colore: '#00B0F0', dataAssunzione: '01/01/2024' }],
      dati: { '2026-10': { d1: { giorni: { '1': 4, '2': '4,5', '3': 'FERIE' } } } }, anni: [2026] };
    const t = await nuovo(browser, { id: 'fumo-dip', [FO]: { users: [{ email: ADMIN, password: PWD, uid: 'ADMIN0001' }], docs: { 'report-ore-mensile/ADMIN0001': doc } } });
    await t.page.goto(URL + 'dip/');
    await t.page.waitForSelector('.login-box', { timeout: 30000 }).catch(() => {});
    c(await t.page.isVisible('.login-box input[type=password]'), 'Dipendenti: schermata di accesso (email/password)');
    const inp = t.page.locator('.login-box input');
    await inp.nth(0).fill(ADMIN); await inp.nth(1).fill(PWD); await t.page.click('.login-box button');
    await t.page.waitForSelector('.app-header', { timeout: 20000 }).catch(() => {});
    c(await t.page.isVisible('.app-header'), 'Dipendenti: login admin entra');
    const testo = await t.page.textContent('body');
    c(/cloud/.test(await t.page.textContent('.app-header .sub').catch(() => '')), 'Dipendenti: modalità «cloud» (FB_READY vero)');
    c(/ROSSI MARIO/.test(testo), 'Dipendenti: il documento seminato è stato letto (ROSSI MARIO a video)');
    await fine('Dipendenti', t);
  }

  /* ---------------- USOINT: login email/password ---------------- */
  {
    const t = await nuovo(browser, { id: 'fumo-uso', [USO]: { users: [{ email: 'uso@prova.it', password: PWD, uid: 'USO0001' }],
      docs: { 'users/USO0001/kv/usoint-idx': { v: JSON.stringify([{ id: 'p1', title: 'PROGETTO DI PROVA', start: '2026-01', end: '2026-12' }]) } } } });
    await t.page.goto(URL + 'uso/');
    await t.page.waitForSelector('input[type=email]', { timeout: 30000 }).catch(() => {});
    c(await t.page.isVisible('input[type=email]'), 'USOINT: schermata di accesso');
    await t.page.fill('input[type=email]', 'uso@prova.it'); await t.page.fill('input[type=password]', PWD);
    await t.page.press('input[type=password]', 'Enter');
    await t.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 20000 }).catch(() => {});
    c(/I tuoi Progetti/.test(await t.page.textContent('body')), 'USOINT: login entra nella Home');
    c(/PROGETTO DI PROVA/.test(await t.page.textContent('body')), 'USOINT: fbSync ha scaricato users/{uid}/kv (progetto seminato a video)');
    c(await t.page.evaluate(() => localStorage.getItem('usoint-idx') !== null), 'USOINT: kv copiato in localStorage');
    /* la seconda app «dip» (progetto di Fogli ore/Dipendenti), come la apre il Riepilogo operatori */
    const dip = await t.page.evaluate(async ([FO, ADMIN, PWD]) => {
      window.__fakefb.addUser(FO, { email: ADMIN, password: PWD, uid: 'ADMIN0001' });
      window.__fakefb.seed(FO, { 'report-ore-mensile/ADMIN0001': { dipendenti: [{ id: 'd1', nome: 'ROSSI MARIO' }], dati: {} } });
      let app = null; try { app = firebase.app('dip'); } catch (e) { app = null; }
      if (!app) app = firebase.initializeApp({ projectId: FO, apiKey: 'x' }, 'dip');
      const a = app.auth(); a.setPersistence(firebase.auth.Auth.Persistence.LOCAL);
      await a.signInWithEmailAndPassword(ADMIN, PWD);
      const s = await app.firestore().collection('report-ore-mensile').doc(a.currentUser.uid).get();
      return s.exists && s.data().dipendenti[0].nome + ' / default=' + firebase.app().options.projectId;
    }, [FO, ADMIN, PWD]).catch(e => 'ERRORE ' + e.message);
    c(/ROSSI MARIO \/ default=rendicontazione-usoint/.test(dip), 'USOINT: seconda app «dip» legge report-ore-mensile dal progetto di Fogli ore, senza toccare quella di default', dip);
    await fine('USOINT', t);
  }

  /* ---------------- Collaboratori: PIN locale, poi «☁ Collega Fogli ore» ---------------- */
  {
    const t = await nuovo(browser, { id: 'fumo-col', [FO]: { users: [{ email: ADMIN, password: PWD, uid: 'ADMIN0001' }] } });
    await t.page.goto(URL + 'col/');
    await t.page.waitForSelector('#pinInput', { timeout: 15000 }).catch(() => {});
    c(await t.page.isVisible('#pinInput'), 'Collaboratori: schermata del PIN');
    for (let i = 0; i < 2; i++) { await t.page.fill('#pinInput', '123456'); await t.page.click('.pin-btn'); await t.page.waitForTimeout(200); }
    /* browser vuoto: l'app propone il recupero; per la prova si parte da zero */
    const zero = t.page.locator('text=Inizia da zero');
    if (await zero.count()) { await zero.first().click(); await t.page.waitForTimeout(400); }
    const btn = t.page.locator('button', { hasText: 'Collega Fogli ore' });
    await btn.first().waitFor({ timeout: 10000 }).catch(() => {});
    c(await btn.count() > 0, 'Collaboratori: PIN impostato, copertina con «☁ Collega Fogli ore»');
    if (await btn.count()) await btn.first().click();
    await t.page.waitForFunction(() => /Fogli ore ✓/.test(document.body.innerText), null, { timeout: 10000 }).catch(() => {});
    c(/Fogli ore ✓/.test(await t.page.textContent('body')), 'Collaboratori: login admin a Fogli ore riuscito («☁ Fogli ore ✓»)');
    c(await t.page.evaluate(() => firebase.apps.map(a => a.name).join(',') === 'fogliore'), 'Collaboratori: app firebase con nome «fogliore»');
    await fine('Collaboratori', t);
  }

  /* ---------------- Pagina integrata: i quattro pulsanti aprono le app del banco ---------------- */
  {
    const t = await nuovo(browser, null);
    await t.page.goto(URL + 'integrata/');
    const sezioni = [['btn-collaboratori', '/col/'], ['btn-dipendenti', '/dip/'], ['btn-rendicontazione', '/uso/'], ['btn-fogliore', '/fo/']];
    for (const [b, perc] of sezioni) {
      await t.page.click('#' + b);
      await t.page.waitForTimeout(300);
      const fr = t.page.frames().find(f => f.url().includes(perc));
      let fake = false;
      if (fr) { await fr.waitForLoadState('load').catch(() => {}); fake = await fr.evaluate(() => !!window.__fakefb).catch(() => false); }
      c(!!fr && fake, 'Integrata: «' + b + '» apre ' + perc + ' (stessa origine, finta Firebase dentro)', fr ? fr.url() : 'nessun iframe');
    }
    await t.page.waitForTimeout(2500); /* Dipendenti/USOINT compilano JSX con Babel */
    await fine('Integrata', t);
  }

  /* ---------------- Interconnessione: la stessa origine condivide il database ---------------- */
  {
    const t = await nuovo(browser, null);
    await t.page.goto(URL + 'fo/');
    await t.page.evaluate(p => window.__fakefb.seed(p, { 'timesheets/X__2026_10_0': { workerUid: 'X', year: 2026, month: 10, days: {} } }), FO);
    const p2 = await t.ctx.newPage(); await p2.goto(URL + 'col/');
    const visto = await p2.evaluate(p => !!window.__fakefb.get(p, 'timesheets/X__2026_10_0'), FO);
    c(visto, 'Stessa origine: un documento scritto da una pagina si legge dall\'altra');
    await t.page.evaluate(() => { window.__fakefb.failWrites = true; });
    const err = await t.page.evaluate(() => firebase.firestore().doc('locks/2026_10').set({ locked: true }).then(() => 'scritto', e => e.code));
    c(err === 'unavailable', 'Guasto: failWrites rifiuta con code «unavailable»', err);
    await fine('Interconnessione', t);
  }

  await browser.close();
  console.log('\nRISULTATO: ' + ok + ' OK, ' + ko + ' KO');
  process.exit(ko ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
