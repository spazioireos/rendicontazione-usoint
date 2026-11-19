// B9 — Concorrenza: due schede di Dipendenti (timbro), due di USOINT (timbro dell'elenco e 💾 delle ore lavorate),
// e scritture contemporanee sullo stesso foglio di Fogli ore. SOLO DATI INVENTATI.
const K = require('./ic-01-comune.cjs');
const { FO, USO, ADMIN, PWD, ADMIN_UID, chk, riga } = K;
const seedDip = { dipendenti: [K.dipendente('d1', 'ROSSI MARIO')], dati: { '2026-10': { d1: { giorni: { '1': 5 } } } }, anni: [2026], version: 4 };
const prj = K.progettoUso('p1', 'PROGETTO PROVA', ['ROSSI MARIO']);
const seed = { id: 'ic01-b9',
  [FO]: { reset: true, users: [{ email: ADMIN, password: PWD, uid: ADMIN_UID }, { email: 'rossi@prova.it', password: PWD, uid: 'W1' }],
    docs: Object.assign({}, K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'), K.utenteFO('W1', 'rossi@prova.it', 'ROSSI', 'MARIO'),
      K.servizioFO('W1', 2026, 10, 0, { '1': { t1f: '08:00', t1t: '13:00' } }), { ['report-ore-mensile/' + ADMIN_UID]: seedDip }) },
  [USO]: { reset: true, users: [{ email: 'uso@prova.it', password: PWD, uid: 'USO0001' }], docs: Object.assign({}, K.kvUso('USO0001', 'usoint-idx', [{ id: 'p1', title: 'PROGETTO PROVA', start: '2026-01', end: '2026-12' }]), K.kvUso('USO0001', 'usoint-p-p1', prj)) } };
async function cella(dip, n, v) { const c = dip.locator('.emp-card').first().locator('input.cell-in').nth(n); await c.click(); await c.fill(v); await c.press('Tab'); await K.attesa(400); }

(async () => {
  const browser = await K.chromium.launch();
  const ctx = await K.contesto(browser, { seed });
  /* 1) due schede di Dipendenti */
  const A = await K.pagina(ctx), B = await K.pagina(ctx);
  await K.loginDip(A); await K.loginDip(B); await K.dipMese(A, 'Ott'); await K.dipMese(B, 'Ott');
  await cella(A, 1, '6'); await A.locator('button.btn-save').first().click(); await K.attesa(1200);
  await cella(B, 2, '7'); await B.locator('button.btn-save').first().click(); await K.attesa(1200);
  const tB = await K.testo(B);
  const avv = /Un'altra scheda ha salvato dopo di te/.test(tB);
  const docMid = (await K.dump(B, FO))['report-ore-mensile/' + ADMIN_UID].dati['2026-10'].d1.giorni;
  chk('B9-01', 'Dipendenti scheda A (💾 g2=6)', 'Dipendenti scheda B (aperta prima, 💾 g3=7)', 'timbro: B avvisa prima di sovrascrivere', 'avviso «Un\'altra scheda ha salvato dopo di te»; il 6 di A ancora nel cloud', 'avviso: ' + avv + ' · cloud ' + JSON.stringify(docMid), avv && String(docMid['2']) === '6' && !docMid['3']);
  const ann = B.locator('button', { hasText: 'Annulla' }); if (await ann.count()) { await ann.first().click(); await K.attesa(400); }
  const docAfter = (await K.dump(B, FO))['report-ore-mensile/' + ADMIN_UID].dati['2026-10'].d1.giorni;
  chk('B9-02', 'Dipendenti scheda B', 'cloud', 'Annulla → niente sovrascritto', '{1:5,2:6}', JSON.stringify(docAfter), String(docAfter['2']) === '6' && !docAfter['3']);
  /* Dipendenti → USOINT: il cloud che legge USOINT è quello di A */
  await A.close(); await B.close();

  /* 2) due schede di USOINT: timbro dell'elenco (📋 Duplica) */
  const U1 = await K.pagina(ctx), U2 = await K.pagina(ctx);
  await K.loginUso(U1); await K.loginUso(U2);
  await U1.locator('button', { hasText: 'Duplica' }).first().click(); await K.attesa(1200);
  U2.__risposte = [{ re: /Un'altra scheda ha salvato/, ok: false }];
  const n0 = U2.__dialoghi.length;
  await U2.locator('button', { hasText: 'Duplica' }).first().click(); await K.attesa(1200);
  const d2 = U2.__dialoghi.slice(n0).map(d => d.msg);
  const idx = JSON.parse(await U2.evaluate(() => localStorage.getItem('usoint-idx')));
  chk('B9-03', 'USOINT scheda 1 (📋 Duplica)', 'USOINT scheda 2 (aperta prima, 📋 Duplica)', 'timbro dell\'elenco', 'domanda «Un\'altra scheda ha salvato»; annullando l\'elenco resta di 2 lavori', (d2[0] || '(nessuna domanda)').slice(0, 70) + ' · lavori ' + idx.length, d2.some(m => /Un'altra scheda ha salvato/.test(m)) && idx.length === 2);
  /* 3) due schede di USOINT nel Riepilogo: il 💾 «Salva ore lavorate» */
  await U1.reload(); await K.aspettaTesto(U1, /I tuoi Progetti/, 30000); await U2.reload(); await K.aspettaTesto(U2, /I tuoi Progetti/, 30000);
  await K.usoRiepilogo(U1); await K.usoRiepilogo(U2);
  /* in Dipendenti (cloud) l'ottobre cambia: la scheda 1 rilegge e salva */
  await U1.evaluate(([p, u]) => { const x = window.__fakefb.get(p, 'report-ore-mensile/' + u); x.dati['2026-10'].d1.giorni['9'] = 10; window.__fakefb.seed(p, { ['report-ore-mensile/' + u]: x }); }, [FO, ADMIN_UID]);
  await U1.locator('button', { hasText: 'Rileggi le ore dai Dipendenti' }).first().click(); await K.attesa(1500);
  await U1.locator('button', { hasText: 'Salva ore lavorate' }).first().click(); await K.attesa(800);
  const v1 = JSON.parse(await U1.evaluate(() => localStorage.getItem('usoint-orelav')))['rossi mario']['2026'][9];
  /* la scheda 2 (import vecchio, non salvato) preme il suo 💾 */
  const n1 = U2.__dialoghi.length;
  await U2.locator('button', { hasText: 'Salva ore lavorate' }).first().click(); await K.attesa(800);
  const d3 = U2.__dialoghi.slice(n1).map(d => d.msg);
  const v2 = JSON.parse(await U2.evaluate(() => localStorage.getItem('usoint-orelav')))['rossi mario']['2026'][9];
  riga('B9-04', 'USOINT scheda 1 (ottobre 21 h, 💾)', 'USOINT scheda 2 (import vecchio 11 h, 💾 dopo)', 'il 💾 delle ore lavorate controlla il timbro?', 'avviso prima di sovrascrivere', 'scheda1 ' + v1 + ' → dopo il 💾 della scheda 2: ' + v2 + ' · domanda: ' + (d3[0] ? d3[0].slice(0, 60) : 'nessuna'),
    d3.some(m => /Un'altra scheda/.test(m)) ? 'SUPERATO' : (v2 === v1 ? 'SUPERATO' : 'FALLITO'));
  await U1.close(); await U2.close();

  /* 4) Fogli ore: l'operatore ha il mese aperto; nel frattempo un'altra persona/dispositivo scrive lo stesso documento */
  const F = await K.pagina(ctx);
  await K.loginFO(F, 'rossi@prova.it');
  await F.evaluate(async () => { ws.view = 'foglio'; ws.year = 2026; ws.month = 10; ws.si = 0; await renderWorker(); });
  /* scrittura «dall'altra parte» (admin su un altro computer): aggiunge il giorno 3 */
  await F.evaluate(p => { const x = window.__fakefb.get(p, 'timesheets/W1__2026_10_0'); x.days['3'] = { t1f: '09:00', t1t: '11:00' }; window.__fakefb.seed(p, { 'timesheets/W1__2026_10_0': x }); }, FO);
  await F.evaluate(async () => { uD(4, 't1f', '14:00'); uD(4, 't1t', '16:00'); await manualSave(); });
  await K.attesa(800);
  const days = (await K.dump(F, FO))['timesheets/W1__2026_10_0'].days;
  riga('B9-05', 'altro dispositivo (giorno 3 = 2 h)', 'Fogli ore operatore (mese già aperto, 💾 giorno 4)', 'scritture contemporanee sullo stesso foglio', 'nessuna perdita (o un avviso)', 'giorni nel database: ' + Object.keys(days).join(',') + (days['3'] ? '' : ' → il giorno 3 è stato SOVRASCRITTO senza avviso'), days['3'] ? 'SUPERATO' : 'FALLITO');
  const errs = F.__errori.filter(e => /pageerror/.test(e));
  chk('B9-06', '—', '—', 'errori di pagina', '0', errs.length, errs.length === 0);
  K.riepilogo('ic-01-b9-concorrenza');
  await browser.close();
})().catch(e => { console.error('ERRORE SCRIPT', e); process.exit(1); });
