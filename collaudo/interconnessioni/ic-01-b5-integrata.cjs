// B5 — Pagina integrata: le quattro app nell'iframe, dati condivisi, cambio sezione e modifiche non salvate.
// SOLO DATI INVENTATI.
const K = require('./ic-01-comune.cjs');
const { FO, USO, ADMIN, PWD, ADMIN_UID, chk, riga } = K;
const seedDip = { dipendenti: [K.dipendente('d1', 'ROSSI MARIO')], dati: { '2026-10': { d1: { giorni: { '1': 5 } } } }, anni: [2026], version: 4 };
const prj = K.progettoUso('p1', 'PROGETTO PROVA', ['ROSSI MARIO']);
const seed = { id: 'ic01-b5',
  [FO]: { reset: true, users: [{ email: ADMIN, password: PWD, uid: ADMIN_UID }], docs: Object.assign({}, K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'), K.utenteFO('W1', 'rossi@prova.it', 'ROSSI', 'MARIO'),
    K.servizioFO('W1', 2026, 10, 0, { '1': { t1f: '08:00', t1t: '13:00' } }), { ['report-ore-mensile/' + ADMIN_UID]: seedDip }) },
  [USO]: { reset: true, users: [{ email: 'uso@prova.it', password: PWD, uid: 'USO0001' }], docs: Object.assign({}, K.kvUso('USO0001', 'usoint-idx', [{ id: 'p1', title: 'PROGETTO PROVA', start: '2026-01', end: '2026-12' }]), K.kvUso('USO0001', 'usoint-p-p1', prj)) } };
const op = nome => ({ sheet: nome, name: nome, years: { '2026': { default_rate: 20, services: [{ name: 'SERVIZIO', residual: 0, hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], rate: 20 }], payments: [] } } });
const ls = { spazioireos_opoc: JSON.stringify([op('ROSSI MARIO')]), spazioireos_opoc_pin: '123456' };

const fr = (page, perc) => page.frames().find(f => f.url().includes(perc));
async function sezione(page, btn, perc) {
  await page.click('#' + btn); await K.attesa(600);
  const f = fr(page, perc); if (f) await f.waitForLoadState('load').catch(() => {});
  return f;
}

(async () => {
  const browser = await K.chromium.launch();
  const ctx = await K.contesto(browser, { seed, ls });
  const pg = await K.pagina(ctx);
  await pg.goto(K.URL + 'integrata/'); await K.attesa(800);
  /* Collaboratori (sezione iniziale) */
  let f = fr(pg, '/col/');
  chk('B5-01', 'integrata', 'iframe', 'sezione iniziale Collaboratori con indirizzo fresco (?v=)', '/col/?v=…', f ? f.url() : '(nessuno)', !!f && /\/col\/\?v=\d+/.test(f.url()));
  await f.waitForSelector('#pinInput'); await f.fill('#pinInput', '123456'); await f.click('.pin-btn'); await K.attesa(800);
  const urlCol = f.url();
  await f.evaluate(() => { window.__marcatore = 'resto'; });
  await pg.click('#btn-collaboratori'); await K.attesa(600);
  f = fr(pg, '/col/');
  const marc = f ? await f.evaluate(() => window.__marcatore).catch(() => '') : '';
  chk('B5-02', 'integrata', 'iframe Collaboratori', 'ripremere la sezione aperta NON ricarica', 'stesso indirizzo, marcatore JS ancora lì', (f && f.url() === urlCol) + ' / ' + marc, f && f.url() === urlCol && marc === 'resto');
  /* Collaboratori con modifica non salvata → cambio sezione */
  await f.evaluate(() => { A.d[0].years['2026'].services[0].hours[0] = 7; markD(); });
  await f.click('body'); /* attivazione utente nel frame */
  const nd0 = pg.__dialoghi.length;
  pg.__risposte = [{ re: /.*/, ok: false }];   /* beforeunload → «Resta» */
  await pg.click('#btn-dipendenti'); await K.attesa(1500);
  const dl1 = pg.__dialoghi.slice(nd0);
  const fCol = fr(pg, '/col/'), fDip = fr(pg, '/dip/');
  const attivo = await pg.evaluate(() => (document.querySelector('.btn.attivo') || {}).id + ' · sezione=' + document.getElementById('app').getAttribute('data-sezione'));
  riga('B5-03', 'Collaboratori (A.dirty)', 'integrata → Dipendenti', 'avviso del browser cambiando sezione con modifiche non salvate', 'avviso «beforeunload»', dl1.map(d => d.tipo).join(',') || 'nessun avviso',
    dl1.some(d => d.tipo === 'beforeunload') ? 'SUPERATO' : 'FALLITO');
  riga('B5-04', 'Collaboratori', 'integrata', 'rispondendo «Resta»: coerenza pulsante / app mostrata', 'pulsante attivo = app nell\'iframe', 'iframe: ' + (fCol ? '/col/' : fDip ? '/dip/' : '?') + ' · ' + attivo,
    (fCol && /btn-collaboratori/.test(attivo)) || (fDip && /btn-dipendenti/.test(attivo)) ? 'SUPERATO' : 'FALLITO');
  if (fCol) {   /* se è rimasta su Collaboratori: ripremo Dipendenti, ora accetto di uscire */
    pg.__risposte = [{ re: /.*/, ok: true }];
    await pg.click('#btn-dipendenti'); await K.attesa(1500);
    const ancora = fr(pg, '/col/');
    riga('B5-05', 'integrata', 'iframe', 'dopo «Resta», ripremere Dipendenti apre Dipendenti?', 'si apre Dipendenti', ancora ? 'resta Collaboratori: data-sezione dice già «dipendenti», il click non fa niente' : 'aperto Dipendenti', ancora ? 'FALLITO' : 'SUPERATO');
    if (ancora) { await pg.click('#btn-fogliore'); await K.attesa(1200); await pg.click('#btn-dipendenti'); await K.attesa(1500); }
  }
  /* Dipendenti nell'iframe */
  f = fr(pg, '/dip/');
  await f.waitForSelector('.login-box input, .app-header', { timeout: 40000 });
  if (await f.$('.login-box input[type=password]')) { const i = f.locator('.login-box input'); await i.nth(0).fill(ADMIN); await i.nth(1).fill(PWD); await f.click('.login-box button'); }
  await f.waitForSelector('.app-header', { timeout: 40000 }); await K.attesa(800);
  await f.locator('.tabs .tab', { hasText: 'Ott' }).first().click(); await K.attesa(1500);
  const tDip = await f.evaluate(() => document.body.innerText);
  chk('B5-06', 'Fogli ore (dati condivisi)', 'Dipendenti dentro l\'iframe', 'riga di confronto con le ore di Fogli ore', '5,00 h', (tDip.match(/ore sul foglio ore: [\d,]+ h/) || ['-'])[0], /ore sul foglio ore: 5,00 h/.test(tDip));
  /* modifica non salvata in Dipendenti → cambio sezione */
  const cell = f.locator('.emp-card', { hasText: 'ROSSI MARIO' }).first().locator('input.cell-in').nth(1);
  await cell.click(); await cell.fill('6'); await cell.press('Tab'); await K.attesa(500);
  pg.__risposte = [{ re: /.*/, ok: false }];
  const nd1 = pg.__dialoghi.length;
  await pg.click('#btn-fogliore'); await K.attesa(1500);
  const dl2 = pg.__dialoghi.slice(nd1);
  riga('B5-07', 'Dipendenti (dirty)', 'integrata → Fogli ore', 'avviso cambiando sezione con modifiche non salvate', 'avviso «beforeunload»', dl2.map(d => d.tipo).join(',') || 'nessun avviso',
    dl2.some(d => d.tipo === 'beforeunload') ? 'SUPERATO' : 'FALLITO');
  pg.__risposte = [];
  if (fr(pg, '/dip/')) { await pg.click('#btn-dipendenti'); await K.attesa(300); await pg.click('#btn-fogliore'); await K.attesa(1500); }
  const dbDip = await pg.evaluate(p => JSON.parse(localStorage.getItem('__fakefb__' + p))['report-ore-mensile/' + 'ADMIN0001'], FO);
  chk('B5-08', 'Dipendenti (uscito accettando)', 'cloud', 'la modifica non salvata NON arriva nel cloud (atteso: solo col 💾)', 'giorno 2 assente', JSON.stringify(dbDip.dati['2026-10'].d1.giorni), !dbDip.dati['2026-10'].d1.giorni['2']);
  /* Fogli ore: sessione [DEFAULT] condivisa con Dipendenti → entra già come admin */
  f = fr(pg, '/fo/');
  await f.waitForSelector('#app-main:not(.hide), #app-login:not(.hide) #email', { timeout: 20000 });
  const chi = await f.evaluate(() => (typeof CU !== 'undefined' && CU) ? CU.email : '(nessuno)');
  riga('B5-09', 'Dipendenti (login admin)', 'Fogli ore nell\'iframe', 'sessione Firebase [DEFAULT] condivisa (stessa origine e apiKey)', 'documentato: entra senza password come l\'admin di Dipendenti', 'dentro come ' + chi, chi === ADMIN ? 'SUPERATO' : 'PARZIALE');
  /* USOINT nell'iframe: import e 💾 non premuto → cambio sezione */
  f = await sezione(pg, 'btn-rendicontazione', '/uso/');
  await f.waitForSelector('input[type=email], button', { timeout: 40000 });
  if (await f.$('input[type=password]')) { await f.fill('input[type=email]', 'uso@prova.it'); await f.fill('input[type=password]', PWD); await f.press('input[type=password]', 'Enter'); }
  await f.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await f.locator('button', { hasText: 'Riepilogo operatori' }).first().click(); await K.attesa(1200);
  if (await f.$('input[placeholder=email]')) { await f.fill('input[placeholder=email]', ADMIN); await f.fill('input[placeholder=password]', PWD); await f.press('input[placeholder=password]', 'Enter'); }
  await f.waitForFunction(() => /importate|Nessun dato/.test(document.body.innerText), null, { timeout: 20000 }).catch(() => {});
  await f.waitForFunction(() => /non sono ancora salvate/.test(document.body.innerText), null, { timeout: 8000 }).catch(() => {});
  const tU = await f.evaluate(() => document.body.innerText);
  chk('B5-10', 'Dipendenti (cloud)', 'USOINT nell\'iframe', 'import dentro l\'iframe', '«importate ✓» + «non sono ancora salvate»', (tU.match(/Ore lavorate importate[^\n]*/) || ['-'])[0].slice(0, 120), /importate dai Dipendenti ✓/.test(tU) && /non sono ancora salvate/.test(tU));
  pg.__risposte = [{ re: /.*/, ok: false }];
  const nd2 = pg.__dialoghi.length;
  await pg.click('#btn-collaboratori'); await K.attesa(1500);
  const dl3 = pg.__dialoghi.slice(nd2);
  const lavDopo = await pg.evaluate(() => localStorage.getItem('usoint-orelav'));
  riga('B5-11', 'USOINT (ore importate, 💾 non premuto)', 'integrata → Collaboratori', 'avviso cambiando sezione', 'avviso (come «← Indietro» dentro l\'app)', (dl3.map(d => d.tipo).join(',') || 'nessun avviso') + ' · usoint-orelav=' + (lavDopo || 'assente'),
    dl3.some(d => d.tipo === 'beforeunload') ? 'SUPERATO' : (lavDopo ? 'PARZIALE' : 'FALLITO'));
  pg.__risposte = [];
  const errs = pg.__errori.filter(e => /pageerror/.test(e));
  chk('B5-12', '—', '—', 'errori di pagina (anche negli iframe)', '0', errs.length + ' ' + errs.slice(0, 2).join(' | '), errs.length === 0);
  K.riepilogo('ic-01-b5-integrata');
  await browser.close();
})().catch(e => { console.error('ERRORE SCRIPT', e); process.exit(1); });
