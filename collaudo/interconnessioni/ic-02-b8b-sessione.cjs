// B8b — Accesso condiviso fra Fogli ore e Dipendenti (Dipendenti ver192, 20/11/2026). SOLO DATI INVENTATI.
// Un operatore che entra in Fogli ore nello stesso browser in cui Dipendenti è aperto NON deve essere buttato fuori:
// Dipendenti mostra «Accesso non consentito» ma non chiude l'accesso. Uso: PORTA=8340 node ic-02-b8b-sessione.cjs
const K = require('./ic-01-comune.cjs');
const { FO, ADMIN, PWD, ADMIN_UID, chk, riga } = K;
const seedDip = { dipendenti: [K.dipendente('d1', 'ROSSI MARIO')], dati: { '2026-10': { d1: { giorni: { '1': 5 } } } }, anni: [2026], version: 4 };
const seed = { id: 'ic02-b8b',
  [FO]: { reset: true, users: [{ email: ADMIN, password: PWD, uid: ADMIN_UID }, { email: 'rossi@prova.it', password: PWD, uid: 'W1' }],
    docs: Object.assign({}, K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'), K.utenteFO('W1', 'rossi@prova.it', 'ROSSI', 'MARIO'),
      K.servizioFO('W1', 2026, 10, 0, { '1': { t1f: '08:00', t1t: '13:00' } }), { ['report-ore-mensile/' + ADMIN_UID]: seedDip }) } };
const sessFO = p => p.evaluate(() => Object.keys(localStorage).filter(k => /__fakefb_sess__.*foglio-ore__\[DEFAULT\]/.test(k)).map(k => { try { return JSON.parse(localStorage.getItem(k)).email; } catch (e) { return '?'; } }).join(','));
(async () => {
  const browser = await K.chromium.launch();
  /* A) Dipendenti (admin) con una modifica non salvata; in un'altra scheda l'operatore entra in Fogli ore senza «Esci» prima */
  const ctx = await K.contesto(browser, { seed });
  const dip = await K.pagina(ctx);
  await K.loginDip(dip); await K.dipMese(dip, 'Ott');
  const c = dip.locator('.emp-card').first().locator('input.cell-in').nth(1); await c.click(); await c.fill('7'); await c.press('Tab'); await K.attesa(500);
  const fo = await K.pagina(ctx);
  await fo.goto(K.URL + 'fo/'); await fo.waitForSelector('#app-login:not(.hide) #email, #app-main:not(.hide)', { timeout: 20000 }); await K.attesa(800);
  await fo.evaluate(p => auth.signInWithEmailAndPassword('rossi@prova.it', p), PWD); await K.attesa(3500);
  const foA = await fo.evaluate(() => ({ chi: (typeof CU !== 'undefined' && CU) ? CU.email : '(nessuno)', dentro: !document.getElementById('app-main').classList.contains('hide') }));
  chk('B8b-01', 'Fogli ore (operatore entra)', 'Fogli ore', 'l\'operatore resta dentro', 'dentro come rossi@prova.it', foA.chi + ' · ' + (foA.dentro ? 'dentro' : 'FUORI'), foA.chi === 'rossi@prova.it' && foA.dentro);
  chk('B8b-02', 'Fogli ore (operatore entra)', 'sessione condivisa', 'nessuno ha chiuso l\'accesso', 'sessione di rossi@prova.it ancora presente', await sessFO(fo) || '(nessuna)', /rossi@prova\.it/.test(await sessFO(fo)));
  const tD = (await K.testo(dip)).replace(/\s+/g, ' ');
  chk('B8b-03', 'sessione condivisa', 'Dipendenti', '«Accesso non consentito» con la spiegazione', 'avviso + «quella scheda resta aperta e funziona»', tD.slice(0, 160), /Accesso non consentito per rossi@prova\.it/.test(tD) && /resta aperta e funziona/.test(tD));
  /* B) l'amministratore rientra in Dipendenti: la modifica non salvata c'è ancora */
  await dip.locator('button', { hasText: 'Accedi con un altro account' }).click(); await K.attesa(500);
  const i = dip.locator('.login-box input'); await i.nth(0).fill(ADMIN); await i.nth(1).fill(PWD); await dip.locator('.login-box button', { hasText: 'Entra' }).click();
  await dip.waitForSelector('.app-header', { timeout: 30000 }); await K.attesa(1200); await K.dipMese(dip, 'Ott');
  const val = await dip.locator('.emp-card').first().locator('input.cell-in').nth(1).inputValue().catch(() => '?');
  const spento = await dip.locator('button.btn-save').first().isDisabled().catch(() => null);
  chk('B8b-04', 'Dipendenti (rientro admin)', 'Dipendenti', 'la modifica non salvata (2 ott = 7) è ancora lì, 💾 acceso', '7 · 💾 acceso', '«' + val + '» · 💾 ' + (spento ? 'spento' : 'acceso'), /^7/.test(val) && spento === false);
  const db = await K.dump(dip, FO);
  chk('B8b-05', 'Dipendenti', 'cloud', 'senza 💾 la modifica NON è nel cloud', 'giorno 2 assente', JSON.stringify(db['report-ore-mensile/' + ADMIN_UID].dati['2026-10'].d1.giorni), !db['report-ore-mensile/' + ADMIN_UID].dati['2026-10'].d1.giorni['2']);
  await K.attesa(1500);
  const foB = await fo.evaluate(() => (typeof CU !== 'undefined' && CU) ? CU.email : '(nessuno)');
  riga('B8b-06', 'Dipendenti (rientro admin)', 'Fogli ore', 'accedendo come admin in Dipendenti anche Fogli ore passa all\'admin', 'documentato (un accesso per browser), detto nell\'avviso', 'Fogli ore ora: ' + foB, 'SUPERATO');
  /* C) Dipendenti aperto per la prima volta in un browser dove è già entrato un operatore */
  const ctx2 = await K.contesto(browser, { seed: Object.assign({}, seed, { id: 'ic02-b8b-c' }) });
  const fo2 = await K.pagina(ctx2); await K.loginFO(fo2, 'rossi@prova.it');
  const dip2 = await K.pagina(ctx2); await dip2.goto(K.URL + 'dip/');
  const vis = await dip2.waitForFunction(() => /Accesso non consentito/.test(document.body.innerText), null, { timeout: 20000 }).then(() => true).catch(() => false);
  chk('B8b-07', 'Fogli ore (operatore già dentro)', 'Dipendenti aperto dopo', 'mostra «Accesso non consentito» (non resta su «Caricamento…»)', 'avviso entro 20 s', vis ? 'avviso' : (await K.testo(dip2)).slice(0, 80), vis);
  await K.attesa(1500);
  const fo2In = await fo2.evaluate(() => !document.getElementById('app-main').classList.contains('hide') && CU && CU.email);
  chk('B8b-08', 'Dipendenti (avviso)', 'Fogli ore', 'l\'operatore resta dentro Fogli ore', 'dentro come rossi@prova.it', String(fo2In), fo2In === 'rossi@prova.it');
  const errs = [dip, fo, dip2, fo2].reduce((a, p) => a.concat(p.__errori || []), []).filter(e => /pageerror/.test(e));
  chk('B8b-09', '—', '—', 'errori di pagina', '0', errs.length + ' ' + errs.slice(0, 2).join(' | '), errs.length === 0);
  K.riepilogo('ic-02-b8b-sessione');
  await browser.close();
})().catch(e => { console.error('ERRORE SCRIPT', e); process.exit(1); });
