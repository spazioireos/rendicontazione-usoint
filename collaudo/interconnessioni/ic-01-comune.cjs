// COLLAUDO DI LIVELLO B — INTERCONNESSIONI fra le app (modulo comune). SOLO DATI INVENTATI.
// Banco: collaudo/comune (finta Firebase, tutte le app sulla stessa origine http://127.0.0.1:8340/).
// Uso: NODE_PATH=/opt/node-tools/node_modules node collaudo/interconnessioni/ic-01-<flusso>.cjs [porta]
let pw; try { pw = require('playwright'); } catch (e) { pw = require('/opt/node-tools/node_modules/playwright'); }
const { chromium } = pw;
const PORTA = process.argv[2] || process.env.PORTA || '8340';
const URL = 'http://127.0.0.1:' + PORTA + '/';
const FO = 'spazio-ireos-foglio-ore', USO = 'rendicontazione-usoint';
const ADMIN = 'spazioireos@gmail.com', PWD = 'prova123', ADMIN_UID = 'ADMIN0001';

/* ---------------- matrice degli esiti ---------------- */
const righe = [];
let nOk = 0, nKo = 0, nPar = 0, nNv = 0;
function riga(id, orig, dest, dato, atteso, effettivo, stato) {
  stato = stato || 'FALLITO';
  righe.push({ id, orig, dest, dato, atteso, effettivo: String(effettivo).slice(0, 260), stato });
  if (stato === 'SUPERATO') nOk++; else if (stato === 'FALLITO') nKo++; else if (stato === 'PARZIALE') nPar++; else nNv++;
  console.log((stato === 'SUPERATO' ? 'OK ' : stato === 'FALLITO' ? 'KO ' : stato === 'PARZIALE' ? 'PAR' : 'NV ') + ' ' + id + ' | ' + dato + ' | atteso: ' + atteso + ' | effettivo: ' + String(effettivo).slice(0, 260));
}
function chk(id, orig, dest, dato, atteso, effettivo, cond) { riga(id, orig, dest, dato, atteso, effettivo, cond ? 'SUPERATO' : 'FALLITO'); return !!cond; }
function riepilogo(nome) {
  console.log('\n===== ' + nome + ': SUPERATI ' + nOk + ' · FALLITI ' + nKo + ' · PARZIALI ' + nPar + ' · NON VERIFICATI ' + nNv + ' =====');
  try {
    const fs = require('fs'), path = require('path');
    const dir = path.join(__dirname, '..', 'out'); fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, nome + '.json'), JSON.stringify({ nome, ok: nOk, ko: nKo, par: nPar, nv: nNv, righe }, null, 1));
  } catch (e) {}
}

/* ---------------- contesto del browser ---------------- */
async function contesto(browser, opz) {
  opz = opz || {};
  const ctx = await browser.newContext({ viewport: opz.viewport || { width: 1400, height: 900 }, acceptDownloads: true });
  const esterni = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith(URL) || u.startsWith('data:') || u.startsWith('blob:') || u === 'about:blank') return r.continue(); esterni.push(u); return r.abort(); });
  if (opz.seed) await ctx.addInitScript(s => { window.__FAKEFB_SEED__ = s; }, opz.seed);
  if (opz.ls) await ctx.addInitScript(o => { try { if (!localStorage.getItem('__ic_ls_fatto__')) { for (const k in o) localStorage.setItem(k, o[k]); localStorage.setItem('__ic_ls_fatto__', '1'); } } catch (e) {} }, opz.ls);
  await ctx.addInitScript(() => { window.__fakefb = Object.assign(window.__fakefb || {}, { persistLog: true }); });
  ctx.__esterni = esterni;
  return ctx;
}
/* una pagina con raccolta degli errori e risposte automatiche ai dialoghi (regole in pg.__risposte) */
async function pagina(ctx) {
  const page = await ctx.newPage();
  page.__errori = []; page.__dialoghi = []; page.__risposte = [];
  page.on('pageerror', e => page.__errori.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/BABEL|deoptimised/.test(m.text())) page.__errori.push('console: ' + m.text().slice(0, 200)); });
  page.on('dialog', async d => {
    const msg = d.message();
    page.__dialoghi.push({ tipo: d.type(), msg });
    for (const r of page.__risposte) {
      if (r.re.test(msg)) { if (d.type() === 'prompt') return d.accept(typeof r.val === 'function' ? r.val(msg) : (r.val || '')); return r.ok ? d.accept() : d.dismiss(); }
    }
    if (d.type() === 'prompt') { if (/password/i.test(msg)) return d.accept(PWD); return d.accept(d.defaultValue() || ADMIN); }
    if (d.type() === 'beforeunload') return d.accept();
    return d.accept();
  });
  return page;
}
const attesa = ms => new Promise(r => setTimeout(r, ms));
async function testo(page) { return page.evaluate(() => document.body.innerText).catch(() => ''); }
async function aspettaTesto(page, re, ms) { try { await page.waitForFunction(r => new RegExp(r[0], r[1]).test(document.body.innerText), [re.source, re.flags], { timeout: ms || 15000 }); return true; } catch (e) { return false; } }
/* operazioni registrate dalla finta Firebase in TUTTE le finestre (persistLog) */
async function logOps(page) { return page.evaluate(() => { try { return JSON.parse(localStorage.getItem('__fakefb_log__') || '[]'); } catch (e) { return []; } }); }
async function pulisciLog(page) { await page.evaluate(() => { localStorage.setItem('__fakefb_log__', '[]'); if (window.__fakefb) window.__fakefb.log.length = 0; }); }
function scritture(ops, filtro) { return ops.filter(o => /set|update|delete|add|batch|commit/i.test(o.op) && (!filtro || filtro(o))); }
async function dump(page, p) { return page.evaluate(p => window.__fakefb.dump(p), p); }

/* ---------------- accessi ---------------- */
async function loginFO(page, email, pwd) {
  await page.goto(URL + 'fo/');
  await page.waitForSelector('#app-login:not(.hide) #email, #app-main:not(.hide)', { timeout: 20000 });
  /* ⚠ sessione [DEFAULT] condivisa con Dipendenti (stessa origine, stessa apiKey): se è già dentro
     qualcun altro, esco (e questo fa uscire anche Dipendenti) */
  const dentro = await page.evaluate(() => (typeof CU !== 'undefined' && CU) ? CU.email : '');
  page.__eraDentro = dentro;
  if (dentro && dentro !== email) { await page.evaluate(() => auth.signOut()); }
  if (dentro === email) { await attesa(600); return; }
  await page.waitForSelector('#app-login:not(.hide) #email', { timeout: 15000 });
  await page.fill('#email', email); await page.fill('#password', pwd || PWD); await page.click('#auth-btn');
  await page.waitForSelector('#app-main:not(.hide)', { timeout: 20000 });
  await attesa(600);
}
async function loginDip(page) {
  await page.goto(URL + 'dip/');
  await page.waitForSelector('.login-box input, .app-header', { timeout: 40000 });
  if (await page.$('.login-box input[type=password]')) {
    const inp = page.locator('.login-box input');
    await inp.nth(0).fill(ADMIN); await inp.nth(1).fill(PWD); await page.click('.login-box button');
  }
  await page.waitForSelector('.app-header', { timeout: 40000 });
  await attesa(800);
}
async function dipMese(page, abbr) { await page.locator('.tabs .tab', { hasText: abbr }).first().click(); await attesa(1200); }
async function dipSalva(page) {
  const b = page.locator('button.btn-save').first();
  if (await b.isDisabled().catch(() => true)) { console.log('   (💾 di Dipendenti spento: niente da salvare)'); return false; }
  await b.click(); await attesa(900);
  const c = page.locator('button', { hasText: 'Salva lo stesso' });
  if (await c.count()) { await c.first().click(); await attesa(800); }
  return true;
}
async function loginUso(page, email) {
  await page.goto(URL + 'uso/');
  await page.waitForSelector('input[type=email], button', { timeout: 40000 });
  if (await page.$('input[type=password]')) {
    await page.fill('input[type=email]', email || 'uso@prova.it'); await page.fill('input[type=password]', PWD);
    await page.press('input[type=password]', 'Enter');
  }
  await aspettaTesto(page, /I tuoi Progetti/, 30000);
  await attesa(500);
}
async function usoRiepilogo(page) {
  await page.locator('button', { hasText: 'Riepilogo operatori' }).first().click();
  await aspettaTesto(page, /Gestionale Dipendenti/, 15000);
  await attesa(500);
  if (await page.$('input[placeholder=email]')) {
    await page.fill('input[placeholder=email]', ADMIN); await page.fill('input[placeholder=password]', PWD);
    await page.press('input[placeholder=password]', 'Enter');
  }
  await aspettaTesto(page, /importate|Nessun dato|non contiene|Import non riuscito|NON azzerati|stesso nome/, 20000);
  await attesa(800);
}
async function usoLav(page) { return page.evaluate(() => { try { return JSON.parse(localStorage.getItem('usoint-orelav') || '{}'); } catch (e) { return {}; } }); }
async function loginCol(page, pin) {
  await page.goto(URL + 'col/');
  await page.waitForSelector('#pinInput', { timeout: 15000 });
  await page.fill('#pinInput', pin || '123456'); await page.click('.pin-btn'); await attesa(500);
}
async function colCollega(page) {
  await page.evaluate(() => { A.v = 'cover'; render(); }); await attesa(300);
  const btn = page.locator('button', { hasText: 'Collega Fogli ore' });
  await btn.first().click();
  await aspettaTesto(page, /Fogli ore ✓/, 15000);
}
async function colScheda(page, nome) {
  await page.evaluate(n => { for (let i = 0; i < A.d.length; i++) if (A.d[i].name === n) { A.sel = i; A.v = 'sheet'; render(); return; } }, nome);
  await attesa(1500);
}
/* i «TS» sopra i mesi di una scheda di Collaboratori, per l'anno indicato: {Gen:'TS 7', ...} */
async function colTS(page) {
  /* i «TS» sopra i 12 mesi della tabella ORE EFFETTUATE della scheda aperta (prima tabella con th.month-hdr) */
  return page.evaluate(() => {
    const th = [...document.querySelectorAll('th.month-hdr')].slice(0, 12);
    return th.map(t => { const s = t.querySelector('.fo-sugg'); return s ? s.innerText.trim() : ''; });
  });
}

/* ---------------- semi ---------------- */
function utenteFO(uid, email, cognome, nome, role) { return { ['users/' + uid]: { email, cognome, nome, name: (cognome + ' ' + nome).trim(), role: role || 'worker' } }; }
function servizioFO(uid, y, m, si, days, extra) {
  return { ['timesheets/' + uid + '__' + y + '_' + m + '_' + si]: Object.assign({ workerUid: uid, workerName: '', year: y, month: m, serviceIdx: si,
    mansione: si === 0 ? 'Educatore/Assistente' : 'Insegnante/Istruttore', sede: si === 0 ? 'Scuola' : 'Casa di quartiere', dettagli: '', comune: 'COMUNE PROVA', alunno: '', days: days || {} }, extra || {}) };
}
/* dipendente minimo di Dipendenti */
function dipendente(id, nome, opz) {
  opz = opz || {};
  return Object.assign({ id, nome, livello: 'D1', oreSett: 19, tipoContratto: 'indeterminato', scadenza: '', proroghe: [], trasformazioni: [], orariTemp: [],
    mensilizzato: false, mensilizzatoDal: '', tettoAnnuo: '', tettoPeriodo: 'scolastico', tettiAnnui: [], ana: {}, dataAssunzione: '01/01/2024', dataCessazione: '', cessManuale: false, colore: '#00B0F0' }, opz);
}
/* giorni di un mese (lun-sab, esclusi domenica e festivi passati) riempiti con 'ore' */
function giorniFeriali(y, m, ore, salta) {
  const out = {}; const nd = new Date(y, m, 0).getDate(); salta = salta || [];
  for (let d = 1; d <= nd; d++) { const wd = new Date(y, m - 1, d).getDay(); if (wd === 0 || salta.indexOf(d) >= 0) continue; out[d] = ore; }
  return out;
}
/* progetto USOINT con una riga di personale per ogni nome */
function progettoUso(id, titolo, nomi) {
  const n = 1; const mkP = nome => ({ nome, voce: 'Educatore', inq: 'D1', oreT: 500, eur: 20, cofin: 0, aOre: [0], aElim: [0], cessato: '', subentro: '', eurA: [0], ricevute: 0, budgetRic: 0, recBlk: [], md: [Array(12).fill(0)] });
  const p = { id, title: titolo, start: '2026-01', end: '2026-12', vincolo: false, colore: '#e3f0fc', cadenza: 0, personnel: nomi.map(mkP), beni: [], fatture: [] };
  return p;
}
function kvUso(uid, chiave, val) { return { ['users/' + uid + '/kv/' + chiave]: { v: typeof val === 'string' ? val : JSON.stringify(val) } }; }

module.exports = { chromium, URL, FO, USO, ADMIN, PWD, ADMIN_UID, riga, chk, riepilogo, contesto, pagina, attesa, testo, aspettaTesto, logOps, pulisciLog, scritture, dump,
  loginFO, loginDip, dipMese, dipSalva, loginUso, usoRiepilogo, usoLav, loginCol, colCollega, colScheda, colTS,
  utenteFO, servizioFO, dipendente, giorniFeriali, progettoUso, kvUso, righe };
