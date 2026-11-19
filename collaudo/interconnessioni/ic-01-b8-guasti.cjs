// B8 — Guasti trasversali: lettura caduta nelle destinazioni, uscita (logout) in un'app e sessioni delle altre.
// SOLO DATI INVENTATI. ⚠ La finta Firebase propaga la sessione fra le schede con l'evento «storage»; Firebase vero
// sincronizza lo stato di accesso fra le schede della stessa origine (IndexedDB): comportamento da confermare sul vero.
const K = require('./ic-01-comune.cjs');
const { FO, USO, ADMIN, PWD, ADMIN_UID, chk, riga } = K;
const seedDip = { dipendenti: [K.dipendente('d1', 'ROSSI MARIO')], dati: { '2026-10': { d1: { giorni: { '1': 5 } } } }, anni: [2026], version: 4 };
const prj = K.progettoUso('p1', 'PROGETTO PROVA', ['ROSSI MARIO']);
const seed = { id: 'ic01-b8',
  [FO]: { reset: true, users: [{ email: ADMIN, password: PWD, uid: ADMIN_UID }, { email: 'rossi@prova.it', password: PWD, uid: 'W1' }],
    docs: Object.assign({}, K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'), K.utenteFO('W1', 'rossi@prova.it', 'ROSSI', 'MARIO'),
      K.servizioFO('W1', 2026, 10, 0, { '1': { t1f: '08:00', t1t: '13:00' } }), { 'residui/W1': { tetto: 100, usate: 5, restano: 95, periodo: 'scolastico', anno: 2026 } }, { ['report-ore-mensile/' + ADMIN_UID]: seedDip }) },
  [USO]: { reset: true, users: [{ email: 'uso@prova.it', password: PWD, uid: 'USO0001' }], docs: Object.assign({}, K.kvUso('USO0001', 'usoint-idx', [{ id: 'p1', title: 'PROGETTO PROVA', start: '2026-01', end: '2026-12' }]), K.kvUso('USO0001', 'usoint-p-p1', prj)) } };
const op = nome => ({ sheet: nome, name: nome, years: { '2026': { default_rate: 20, services: [{ name: 'SERVIZIO', residual: 0, hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], rate: 20 }], payments: [] } } });
const ls = { spazioireos_opoc: JSON.stringify([op('ROSSI MARIO')]), spazioireos_opoc_pin: '123456' };

(async () => {
  const browser = await K.chromium.launch();
  const ctx = await K.contesto(browser, { seed, ls });
  /* 1) Fogli ore con la lettura caduta: che cosa dice all'operatore, e niente viene cancellato */
  const fo = await K.pagina(ctx);
  await K.loginFO(fo, 'rossi@prova.it');
  const fr = await fo.evaluate(async () => { window.__fakefb.failReads = true; cache = {}; ws.view = 'foglio'; ws.year = 2026; ws.month = 10; ws.si = 0; await renderWorker(); await new Promise(r => setTimeout(r, 800));
    const b = document.getElementById('banda-lett'); const t1 = b && getComputedStyle(b).display !== 'none' ? b.innerText : '';
    ws.view = 'servizi'; await renderWorker(); await new Promise(r => setTimeout(r, 800)); const res = /Le ore che ti restano/.test(document.body.innerText);
    window.__fakefb.failReads = false; return { banda: t1, residuo: res }; });
  const dbFO = await K.dump(fo, FO);
  chk('B8-01', 'Fogli ore (lettura caduta)', 'operatore', 'banda blu «lettura» e dati intatti', 'banda presente · timesheets e residui intatti', 'banda: «' + fr.banda.slice(0, 90) + '» · 🎯: ' + fr.residuo + ' · ts g1 ' + JSON.stringify(dbFO['timesheets/W1__2026_10_0'].days[1]) + ' · residuo ' + (dbFO['residui/W1'] ? 'c\'è' : 'SPARITO'),
    !!fr.banda && dbFO['timesheets/W1__2026_10_0'].days[1].t1t === '13:00' && !!dbFO['residui/W1']);
  riga('B8-02', 'residui (lettura caduta)', 'Fogli ore 🎯', 'il riquadro del residuo con la lettura caduta', 'documentato: semplicemente non compare', fr.residuo ? 'compare' : 'non compare (nessun avviso specifico; la banda blu c\'è)', fr.residuo ? 'FALLITO' : 'SUPERATO');
  await fo.evaluate(() => auth.signOut()); await K.attesa(500);

  /* 2) Dipendenti aperto con una modifica NON salvata; in un'altra scheda Fogli ore (admin) preme «Esci» */
  const dip = await K.pagina(ctx);
  await K.loginDip(dip); await K.dipMese(dip, 'Ott');
  const c = dip.locator('.emp-card').first().locator('input.cell-in').nth(1); await c.click(); await c.fill('7'); await c.press('Tab'); await K.attesa(500);
  const fo2 = await K.pagina(ctx);
  await K.loginFO(fo2, ADMIN);
  chk('B8-03', 'Dipendenti (admin collegato)', 'Fogli ore in un\'altra scheda', 'sessione [DEFAULT] condivisa: Fogli ore entra già come admin, senza password', 'entra (documentato)', 'già dentro come: ' + (fo2.__eraDentro || '(nessuno)'), fo2.__eraDentro === ADMIN);
  await fo2.locator('button', { hasText: 'Esci' }).first().click(); await K.attesa(1500);
  const loginDip = await dip.isVisible('.login-box input[type=password]').catch(() => false);
  riga('B8-04', 'Fogli ore («Esci»)', 'Dipendenti nell\'altra scheda, con modifiche non salvate', 'uscire da Fogli ore fa uscire anche Dipendenti', 'Dipendenti resta dentro (o almeno avvisa)', loginDip ? 'Dipendenti è tornato alla schermata di accesso, senza nessun avviso' : 'Dipendenti è rimasto dentro', loginDip ? 'FALLITO' : 'SUPERATO');
  if (loginDip) { const i = dip.locator('.login-box input'); await i.nth(0).fill(ADMIN); await i.nth(1).fill(PWD); await dip.click('.login-box button'); await dip.waitForSelector('.app-header', { timeout: 30000 }); await K.attesa(1000); await K.dipMese(dip, 'Ott'); }
  const val = await dip.locator('.emp-card').first().locator('input.cell-in').nth(1).inputValue().catch(() => '?');
  const btnSave = await dip.locator('button.btn-save').first().isDisabled().catch(() => null);
  riga('B8-05', 'Fogli ore («Esci»)', 'Dipendenti dopo il nuovo accesso', 'la modifica non salvata (2 ott = 7) c\'è ancora?', '7 (o un avviso prima di perderla)', 'cella 2 ott = «' + val + '» · 💾 ' + (btnSave ? 'spento' : 'acceso'), /^7/.test(val) ? 'SUPERATO' : 'FALLITO');

  /* 3) Dipendenti aperto; un operatore entra in Fogli ore in un'altra scheda */
  const fo3 = await K.pagina(ctx);
  await fo3.goto(K.URL + 'fo/'); await fo3.waitForSelector('#app-login:not(.hide) #email, #app-main:not(.hide)', { timeout: 20000 });
  if (await fo3.evaluate(() => typeof CU !== 'undefined' && !!CU)) { await fo3.evaluate(() => auth.signOut()); await fo3.waitForSelector('#app-login:not(.hide) #email'); }
  await fo3.fill('#email', 'rossi@prova.it'); await fo3.fill('#password', PWD); await fo3.click('#auth-btn');
  await K.attesa(3500);
  const dentro3 = await fo3.evaluate(() => !document.getElementById('app-main').classList.contains('hide'));
  const dipStato = (await K.testo(dip)).slice(0, 160).replace(/\s+/g, ' ');
  riga('B8-06', 'Fogli ore (accesso operatore)', 'Fogli ore stesso + Dipendenti aperto in un\'altra scheda', 'l\'operatore resta dentro Fogli ore?', 'resta dentro', (dentro3 ? 'dentro' : 'BUTTATO FUORI (Dipendenti vede un non-admin e fa signOut della sessione condivisa)') + ' · Dipendenti: ' + dipStato, dentro3 ? 'SUPERATO' : 'FALLITO');
  await fo3.close(); await fo2.close();

  /* 4) logout di Dipendenti non tocca la sessione «dip» di USOINT né «fogliore» di Collaboratori */
  { const altro = dip.locator('button', { hasText: 'Accedi con un altro account' }); if (await altro.count()) { await altro.first().click(); await K.attesa(500); } }
  if (await dip.isVisible('.login-box input[type=password]').catch(() => false)) { const i = dip.locator('.login-box input'); await i.nth(0).fill(ADMIN); await i.nth(1).fill(PWD); await dip.click('.login-box button'); await dip.waitForSelector('.app-header', { timeout: 30000 }); }
  const uso = await K.pagina(ctx); await K.loginUso(uso); await K.usoRiepilogo(uso);
  const col = await K.pagina(ctx); await K.loginCol(col); await K.colCollega(col);
  dip.__risposte.push({ re: /non salvate/, ok: true });
  await dip.evaluate(() => firebase.auth().signOut()); await K.attesa(1500);
  await uso.locator('button', { hasText: 'Rileggi le ore dai Dipendenti' }).first().click(); await K.attesa(2000);
  const tU = await K.testo(uso);
  chk('B8-07', 'Dipendenti (logout [DEFAULT])', 'USOINT «dip»', 'l\'import di USOINT continua a funzionare', '«importate ✓»', (tU.match(/Ore lavorate importate[^\n]{0,60}|Nessun dato[^\n]{0,40}|Import non riuscito[^\n]{0,30}/) || ['-'])[0], /importate dai Dipendenti ✓/.test(tU));
  await col.reload(); await col.waitForSelector('#pinInput'); await col.fill('#pinInput', '123456'); await col.click('.pin-btn'); await K.attesa(1500);
  const tC = await K.testo(col);
  chk('B8-08', 'Dipendenti (logout [DEFAULT])', 'Collaboratori «fogliore»', 'Collaboratori resta collegato', '«☁ Fogli ore ✓»', /Fogli ore ✓/.test(tC) ? 'collegato' : 'scollegato', /Fogli ore ✓/.test(tC));
  /* 5) logout di Collaboratori («fogliore») non tocca Dipendenti */
  const altro = dip.locator('button', { hasText: 'Accedi con un altro account' }); if (await altro.count()) { await altro.first().click(); await K.attesa(500); }
  const i = dip.locator('.login-box input'); await i.nth(0).fill(ADMIN); await i.nth(1).fill(PWD); await dip.click('.login-box button'); await dip.waitForSelector('.app-header', { timeout: 30000 });
  await col.evaluate(() => foLogout()); await K.attesa(1200);
  const dipDentro = await dip.isVisible('.app-header');
  chk('B8-09', 'Collaboratori (scollega Fogli ore)', 'Dipendenti', 'Dipendenti resta dentro', 'dentro', dipDentro ? 'dentro' : 'fuori', dipDentro);
  /* 6) logout di USOINT (progetto suo) non tocca né Dipendenti né la sua app «dip» */
  await uso.evaluate(() => { try { fbAuth.signOut(); } catch (e) {} }); await K.attesa(1200);
  const sess = await uso.evaluate(() => Object.keys(localStorage).filter(k => /__fakefb_sess__/.test(k)));
  chk('B8-10', 'USOINT (logout)', 'sessioni', 'restano quelle di Dipendenti ([DEFAULT] FO) e di «dip»', 'FO [DEFAULT] e FO dip presenti, USO [DEFAULT] tolta', sess.join(' · '),
    sess.some(k => /foglio-ore__\[DEFAULT\]/.test(k)) && sess.some(k => /foglio-ore__dip/.test(k)) && !sess.some(k => /usoint__\[DEFAULT\]/.test(k)));
  const errs = [fo, dip, uso, col].reduce((a, p) => a.concat(p.__errori), []).filter(e => /pageerror/.test(e));
  chk('B8-11', '—', '—', 'errori di pagina', '0', errs.length + ' ' + errs.slice(0, 2).join(' | '), errs.length === 0);
  K.riepilogo('ic-01-b8-guasti');
  await browser.close();
})().catch(e => { console.error('ERRORE SCRIPT', e); process.exit(1); });
