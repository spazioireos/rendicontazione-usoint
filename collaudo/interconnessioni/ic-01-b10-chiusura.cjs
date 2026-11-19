// B10 — CHIUSURA DEL MESE: Dipendenti (📤 dip:true) → Fogli ore (riquadro «🔒 Chiudi il mese», domanda sul
// completamento) → Dipendenti (pastiglia nel Tabellone) → Fogli ore admin (riapre) → Dipendenti. SOLO DATI INVENTATI.
// Versioni: Fogli ore rev 19 · Dipendenti ver187 (banco comune rigenerato: bash collaudo/comune/prepara-comune.sh).
// Data del dispositivo simulata per tutto il contesto: 1/12/2026 ore 9 (ctx.clock.setFixedTime, Playwright ≥ 1.45).
//   NODE_PATH=/opt/node-tools/node_modules node collaudo/interconnessioni/ic-01-b10-chiusura.cjs [porta]
const K = require('./ic-01-comune.cjs');
const { FO, ADMIN, PWD, ADMIN_UID, chk, riga } = K;
const DIC1 = new Date('2026-12-01T09:00:00');
const DOMANDA = 'Se non avessi raggiunto con le ore dichiarate lavorate in questo mese il dovuto contrattuale, vuoi che ti siano assegnati ferie/permessi a completamento o lasci così?';
const TITOLO = '🔒 Chiudi il mese di NOVEMBRE 2026';

/* ---------- semi ---------- */
const tet = [{ id: 't2026', ore: '400', periodo: 'scolastico', anno: '2026' }];
const MENS = { mensilizzato: true, mensilizzatoDal: '01/10/2026' };
const ST = { version: 4, anni: [2026], locked: {}, costoComune: {},
  dipendenti: [
    K.dipendente('d1', 'ROSSI MARIO', Object.assign({ foUid: 'W1', tettiAnnui: tet }, MENS)),   /* agganciato, CON massimale; risponde «Sì» */
    K.dipendente('d2', 'BIANCHI ANNA', Object.assign({ foUid: 'W2' }, MENS)),                   /* agganciata, SENZA massimale; risponde «No» */
    K.dipendente('d3', 'VERDI LUCA', Object.assign({ foUid: 'W3' }, MENS))                      /* agganciato, SENZA massimale; non chiude */
  ],
  dati: { '2026-11': { d1: { giorni: K.giorniFeriali(2026, 11, '4') }, d2: { giorni: K.giorniFeriali(2026, 11, '4') }, d3: { giorni: K.giorniFeriali(2026, 11, '4') } } } };
const g = (a, b) => ({ t1f: a, t1t: b });
const docs = Object.assign({},
  K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'),
  K.utenteFO('W1', 'rossi@prova.it', 'ROSSI', 'MARIO'), K.utenteFO('W2', 'bianchi@prova.it', 'BIANCHI', 'ANNA'),
  K.utenteFO('W3', 'verdi@prova.it', 'VERDI', 'LUCA'), K.utenteFO('W9', 'esterno@prova.it', 'ESTERNI', 'PIA'),
  K.servizioFO('W1', 2026, 11, 0, { 3: g('08:00', '12:00'), 4: { absence: 'FERIE' } }),
  K.servizioFO('W1', 2026, 11, 1, { 5: g('14:00', '16:00') }),
  K.servizioFO('W2', 2026, 11, 0, { 3: g('09:00', '13:00') }),
  K.servizioFO('W3', 2026, 11, 0, { 6: g('09:00', '12:00') }),
  K.servizioFO('W9', 2026, 11, 0, { 10: g('08:00', '11:00') }),
  { ['report-ore-mensile/' + ADMIN_UID]: ST });
const seed = { id: 'ic01-b10', [FO]: { reset: true, users: [
  { email: ADMIN, password: PWD, uid: ADMIN_UID }, { email: 'rossi@prova.it', password: PWD, uid: 'W1' }, { email: 'bianchi@prova.it', password: PWD, uid: 'W2' },
  { email: 'verdi@prova.it', password: PWD, uid: 'W3' }, { email: 'esterno@prova.it', password: PWD, uid: 'W9' }], docs } };
const TK = (uid, si) => 'timesheets/' + uid + '__2026_11_' + si;

/* ---------- aiuti ---------- */
const pagine = [];
const scrDip = [];      /* scritture fatte DALLE PAGINE DI DIPENDENTI (log in memoria di ogni pagina) */
async function apri(ctx) { const p = await K.pagina(ctx); pagine.push(p); return p; }
async function chiudiDip(dip) { try { const l = await dip.evaluate(() => (window.__fakefb ? __fakefb.log : []).filter(o => /set|update|delete|add|batch|commit/i.test(o.op)).map(o => o.op + ' ' + (o.path || ''))); scrDip.push(...l); } catch (e) {} await dip.close(); }
async function apriDip(ctx) { const d = await apri(ctx); await K.loginDip(d); await K.dipMese(d, 'Nov'); return d; }
async function pastiglie(dip) {
  await dip.waitForFunction(() => document.querySelectorAll('.emp-head .chiu-pill').length >= 1, null, { timeout: 15000 }).catch(() => {});
  await K.attesa(500);
  return dip.evaluate(() => { const o = {}; document.querySelectorAll('.emp-card').forEach(c => { const n = c.querySelector('.emp-head .nome'); if (!n) return;
    const p = c.querySelector('.emp-head .chiu-pill'); o[n.textContent.trim()] = p ? p.textContent.trim() : null; }); return o; });
}
async function pubblica(dip) {
  const n0 = dip.__dialoghi.length;
  await dip.locator('button', { hasText: 'Pubblica i residui' }).first().click();
  for (let i = 0; i < 40; i++) { await K.attesa(300); if (dip.__dialoghi.slice(n0).some(d => /Pubblicati|Riusciti|niente da pubblicare|Nessun residuo da pubblicare\./.test(d.msg) && !/Vuoi/.test(d.msg))) break; }
  return dip.__dialoghi.slice(n0).map(d => d.tipo + ': ' + d.msg);
}
async function velo(fo) { return fo.evaluate(() => { const v = document.getElementById('chiusura-velo'); return !!v && getComputedStyle(v).display !== 'none'; }); }
async function testoVelo(fo) { return fo.evaluate(() => { const v = document.getElementById('chiusura-velo'); return v ? v.innerText : ''; }); }
async function esciFO(fo) { await fo.evaluate(() => auth.signOut()).catch(() => {}); await K.attesa(700); }
async function entraFO(fo, email) { await K.loginFO(fo, email); await K.attesa(1200); }
async function chiudiNov(fo, risposta) {   /* risposta: 'si' | 'no' | null (esterno) */
  if (risposta) await fo.check('#chiu-box input[value=' + risposta + ']');
  await fo.check('#chiu-chk');
  const acceso = await fo.$eval('#chiu-ok', b => !b.disabled);
  await fo.click('#chiu-ok'); await K.attesa(1800);
  const dopo = await fo.evaluate(() => ({ velo: !!document.getElementById('chiusura-velo'), y: ws.year, m: ws.month, view: ws.view }));
  /* dicembre si apre e si compila: foglio del 1° servizio */
  await fo.evaluate(() => { ws.year = 2026; ws.month = 12; ws.view = 'foglio'; ws.si = 0; ws.fuExtra = {}; return renderWorker(); });
  await K.attesa(900);
  Object.assign(dopo, await fo.evaluate(() => ({ veloDic: !!document.getElementById('chiusura-velo'), scrivDic: [...document.querySelectorAll('.tbl tbody input.ti')].filter(i => !i.disabled).length })));
  return { acceso, dopo };
}
const campi = x => x ? { wc: x.workerConfirmed, mc: x.meseChiuso, at: typeof x.meseChiusoAt === 'string', comp: ('completamento' in x) ? x.completamento : '(assente)' } : null;

(async () => {
  const browser = await K.chromium.launch();
  const ctx = await K.contesto(browser, { seed });
  await ctx.clock.setFixedTime(DIC1);

  /* ===== 1. Dipendenti: 📤 Pubblica i residui → dip:true ===== */
  let dip = await apriDip(ctx);
  const targa = await dip.locator('.app-rev').innerText().catch(() => '');
  chk('B10-00a', '—', 'Dipendenti', 'versione servita dal banco', 'ver187', targa, /ver187/.test(targa));
  const P0 = await pastiglie(dip);
  chk('B10-01', 'Fogli ore (ore di novembre, mese aperto)', 'Dipendenti · Tabellone nov 2026', 'pastiglia PRIMA della chiusura', 'tutti e tre «Mese non ancora chiuso in Fogli ore»', JSON.stringify(P0),
    ['ROSSI MARIO', 'BIANCHI ANNA', 'VERDI LUCA'].every(n => P0[n] === 'Mese non ancora chiuso in Fogli ore'));
  const dl = await pubblica(dip);
  const conf = (dl.find(d => /Vuoi/.test(d)) || '').replace(/\n/g, ' ');
  const esito = (dl.filter(d => /Pubblicati|Segnalati|Nessun residuo/.test(d) && !/Vuoi/.test(d)).join(' | ')).replace(/\n/g, ' ');
  chk('B10-02', 'Dipendenti (📤)', 'conferma ed esito', 'la conferma segnala i 3 agganciati come DIPENDENTI; l\'esito li conta', '«viene anche segnalato che sono DIPENDENTI» · «Segnalati a Fogli ore come dipendenti: 3.»', conf.slice(conf.indexOf('Ai '), conf.indexOf('Ai ') + 160) + ' || ' + esito.slice(0, 160),
    /viene anche segnalato che sono DIPENDENTI/.test(conf) && /Segnalati a Fogli ore come dipendenti: 3\./.test(esito));
  let db = await K.dump(dip, FO);
  const r1 = db['residui/W1'], r2 = db['residui/W2'], r3 = db['residui/W3'], r9 = db['residui/W9'];
  chk('B10-03', 'Dipendenti', 'residui/W1 (ROSSI, con massimale)', 'residuo + dip', 'tetto 400 · dip:true', JSON.stringify(r1), r1 && r1.tetto === 400 && r1.dip === true);
  chk('B10-04', 'Dipendenti', 'residui/W2, W3 (senza massimale)', 'solo il segno di dipendente', '{dip:true, aggiornato}', JSON.stringify(r2) + ' · ' + JSON.stringify(r3),
    [r2, r3].every(r => r && r.dip === true && Object.keys(r).sort().join(',') === 'aggiornato,dip'));
  chk('B10-05', 'Dipendenti', 'residui/W9 (esterno, non in Dipendenti)', 'nessun dip per l\'esterno', 'documento assente (o senza dip)', JSON.stringify(r9 || null), !r9 || r9.dip !== true);
  await chiudiDip(dip);

  /* ===== 2. Fogli ore al 1/12/2026: ROSSI (dipendente) risponde «Sì» ===== */
  const fo = await apri(ctx);
  await entraFO(fo, 'rossi@prova.it');
  const targaFO = await fo.evaluate(() => (document.querySelector('.revtag') || {}).innerText || '');
  chk('B10-00b', '—', 'Fogli ore', 'versione servita dal banco', 'rev 19', targaFO, /rev 19/.test(targaFO));
  const dataPag = await fo.evaluate(() => new Date().toISOString());
  let tv = await testoVelo(fo);
  chk('B10-06', 'residui/W1 dip:true', 'Fogli ore (ROSSI, 1/12/2026)', 'riquadro bloccante CON la domanda', TITOLO + ' + domanda + 2 scelte', 'data=' + dataPag + ' velo=' + await velo(fo) + ' titolo=' + (tv.indexOf(TITOLO) >= 0) + ' domanda=' + (tv.indexOf(DOMANDA) >= 0) + ' scelte=' + (await fo.$$('#chiu-box input[name=chiu-comp]')).length,
    (await velo(fo)) && tv.indexOf(TITOLO) >= 0 && tv.indexOf(DOMANDA) >= 0 && tv.indexOf('Sì, assegnatemi ferie/permessi a completamento') >= 0 && (await fo.$$('#chiu-box input[name=chiu-comp]')).length === 2);
  let ch = await chiudiNov(fo, 'si');
  db = await K.dump(fo, FO);
  const a0 = db[TK('W1', 0)], a1 = db[TK('W1', 1)];
  chk('B10-07', 'Fogli ore (ROSSI chiude con «Sì»)', 'timesheets W1 nov (2 servizi)', 'meseChiuso + completamento "si" su ogni foglio', 'mc true · comp si · su 2 fogli', 'acceso=' + ch.acceso + ' ' + JSON.stringify([campi(a0), campi(a1)]),
    ch.acceso && [a0, a1].every(x => x && x.workerConfirmed === true && x.meseChiuso === true && typeof x.meseChiusoAt === 'string' && x.completamento === 'si'));
  chk('B10-08', 'Fogli ore', 'Fogli ore (ROSSI)', 'dopo la chiusura dicembre si apre', 'nessun riquadro, mese 12, foglio di dicembre scrivibile', JSON.stringify(ch.dopo), !ch.dopo.velo && ch.dopo.y === 2026 && ch.dopo.m === 12 && !ch.dopo.veloDic && ch.dopo.scrivDic > 20);
  await esciFO(fo);

  /* BIANCHI (dipendente) risponde «No» */
  await entraFO(fo, 'bianchi@prova.it');
  tv = await testoVelo(fo);
  const domB = tv.indexOf(DOMANDA) >= 0;
  ch = await chiudiNov(fo, 'no');
  db = await K.dump(fo, FO);
  const b0 = db[TK('W2', 0)];
  chk('B10-09', 'Fogli ore (BIANCHI chiude con «No»)', 'timesheets W2 nov', 'domanda presente · completamento "no"', 'domanda · mc true · comp no', 'domanda=' + domB + ' ' + JSON.stringify(campi(b0)) + ' dopo=' + JSON.stringify(ch.dopo),
    domB && b0 && b0.meseChiuso === true && b0.completamento === 'no' && !ch.dopo.velo && ch.dopo.m === 12 && ch.dopo.scrivDic > 20);
  await esciFO(fo);

  /* ===== 3. L'esterno: riquadro SENZA domanda ===== */
  await entraFO(fo, 'esterno@prova.it');
  tv = await testoVelo(fo);
  const vE = await velo(fo), domE = (await fo.$('#chiu-box .chiu-dom')) !== null || tv.indexOf('dovuto contrattuale') >= 0;
  chk('B10-10', 'residui/W9 assente', 'Fogli ore (esterno, 1/12/2026)', 'riquadro SENZA la domanda', 'riquadro · nessuna domanda', 'velo=' + vE + ' titolo=' + (tv.indexOf(TITOLO) >= 0) + ' domanda=' + domE, vE && tv.indexOf(TITOLO) >= 0 && !domE);
  ch = await chiudiNov(fo, null);
  db = await K.dump(fo, FO);
  const e0 = db[TK('W9', 0)];
  chk('B10-11', 'Fogli ore (esterno chiude)', 'timesheets W9 nov', 'meseChiuso senza completamento', 'mc true · completamento assente', 'acceso=' + ch.acceso + ' ' + JSON.stringify(campi(e0)) + ' dopo=' + JSON.stringify(ch.dopo),
    ch.acceso && e0 && e0.meseChiuso === true && !('completamento' in e0) && !ch.dopo.velo && ch.dopo.m === 12 && ch.dopo.scrivDic > 20);
  await esciFO(fo);

  /* VERDI (dipendente) entra, vede il riquadro con la domanda, ma esce senza chiudere */
  await entraFO(fo, 'verdi@prova.it');
  tv = await testoVelo(fo);
  const vV = await velo(fo), domV = tv.indexOf(DOMANDA) >= 0;
  await esciFO(fo);
  db = await K.dump(fo, FO);
  const v0 = db[TK('W3', 0)];
  chk('B10-12', 'Fogli ore (VERDI esce senza chiudere)', 'timesheets W3 nov', 'riquadro con domanda; nessun campo di chiusura scritto', 'velo+domanda · mc assente', 'velo=' + vV + ' domanda=' + domV + ' ' + JSON.stringify(campi(v0)), vV && domV && v0 && !v0.meseChiuso && !('completamento' in v0));

  /* ===== 4. Dipendenti: le pastiglie nel Tabellone di novembre ===== */
  dip = await apriDip(ctx);
  const P1 = await pastiglie(dip);
  chk('B10-13', 'timesheets W1 (si)', 'Dipendenti · ROSSI', 'pastiglia', '«📨 Chiede ferie/permessi a completamento»', P1['ROSSI MARIO'], P1['ROSSI MARIO'] === '📨 Chiede ferie/permessi a completamento');
  chk('B10-14', 'timesheets W2 (no)', 'Dipendenti · BIANCHI', 'pastiglia', '«Lascia così»', P1['BIANCHI ANNA'], P1['BIANCHI ANNA'] === 'Lascia così');
  chk('B10-15', 'timesheets W3 (non chiuso)', 'Dipendenti · VERDI', 'pastiglia', '«Mese non ancora chiuso in Fogli ore»', P1['VERDI LUCA'], P1['VERDI LUCA'] === 'Mese non ancora chiuso in Fogli ore');
  chk('B10-16', 'timesheets W9 (esterno)', 'Dipendenti', 'l\'esterno non compare nel Tabellone', 'nessuna scheda ESTERNI PIA', JSON.stringify(Object.keys(P1)), !('ESTERNI PIA' in P1));
  await chiudiDip(dip);

  /* ===== 5. Fogli ore admin riapre il mese di ROSSI (prima un servizio, poi l'altro) ===== */
  await entraFO(fo, ADMIN);
  const vA = await velo(fo);
  await fo.evaluate(() => { as.year = 2026; as.month = 11; });
  await fo.evaluate(() => adminReopenMonth('W1', 0)); await K.attesa(1200);
  db = await K.dump(fo, FO);
  const ra0 = db[TK('W1', 0)], ra1 = db[TK('W1', 1)];
  chk('B10-17', 'Fogli ore admin (adminReopenMonth W1 servizio 0)', 'timesheets W1 nov 0', 'chiusura tolta sul servizio 0, il servizio 1 resta chiuso', 'svc0: wc false · mc false · comp assente; svc1 invariato', 'adminVelo=' + vA + ' ' + JSON.stringify([campi(ra0), campi(ra1)]),
    !vA && ra0 && ra0.workerConfirmed === false && ra0.meseChiuso === false && ra0.meseChiusoAt === null && !('completamento' in ra0) && ra1 && ra1.meseChiuso === true && ra1.completamento === 'si');
  /* stato intermedio: un servizio riaperto e uno no. Fogli ore lo considera NON chiuso; che cosa dice Dipendenti? */
  await esciFO(fo);
  await entraFO(fo, 'rossi@prova.it');
  const vP = await velo(fo), domP = (await testoVelo(fo)).indexOf(DOMANDA) >= 0;
  await esciFO(fo);
  dip = await apriDip(ctx);
  const P2 = await pastiglie(dip);
  await chiudiDip(dip);
  const coerente = vP ? P2['ROSSI MARIO'] === 'Mese non ancora chiuso in Fogli ore' : P2['ROSSI MARIO'] !== 'Mese non ancora chiuso in Fogli ore';
  riga('B10-18', 'Fogli ore admin (riaperto SOLO il servizio 0 di 2)', 'Fogli ore (ROSSI) e Dipendenti (ROSSI)', 'le due app dicono la stessa cosa sul mese a metà riaperto? (osservazione)',
    'se Fogli ore ripresenta il riquadro, Dipendenti dovrebbe dire «non ancora chiuso»',
    'Fogli ore: riquadro=' + vP + ' domanda=' + domP + ' · Dipendenti: «' + P2['ROSSI MARIO'] + '»', coerente ? 'SUPERATO' : 'PARZIALE');
  await entraFO(fo, ADMIN);
  await fo.evaluate(() => { as.year = 2026; as.month = 11; });
  await fo.evaluate(() => adminReopenMonth('W1', 1)); await K.attesa(1200);
  db = await K.dump(fo, FO);
  const rb1 = db[TK('W1', 1)];
  chk('B10-19', 'Fogli ore admin (adminReopenMonth W1 servizio 1)', 'timesheets W1 nov 1', 'chiusura tolta anche sul servizio 1', 'wc false · mc false · comp assente', JSON.stringify(campi(rb1)),
    rb1 && rb1.workerConfirmed === false && rb1.meseChiuso === false && !('completamento' in rb1));
  await esciFO(fo);
  dip = await apriDip(ctx);
  const P3 = await pastiglie(dip);
  chk('B10-20', 'timesheets W1 riaperti', 'Dipendenti · ROSSI', 'la pastiglia torna «non ancora chiuso»; le altre due invariate', 'ROSSI «Mese non ancora chiuso in Fogli ore» · BIANCHI «Lascia così» · VERDI «non ancora chiuso»', JSON.stringify(P3),
    P3['ROSSI MARIO'] === 'Mese non ancora chiuso in Fogli ore' && P3['BIANCHI ANNA'] === 'Lascia così' && P3['VERDI LUCA'] === 'Mese non ancora chiuso in Fogli ore');
  await chiudiDip(dip);
  await entraFO(fo, 'rossi@prova.it');
  tv = await testoVelo(fo);
  chk('B10-21', 'timesheets W1 riaperti', 'Fogli ore (ROSSI rientra)', 'il riquadro ritorna con la domanda', 'riquadro + domanda', 'velo=' + await velo(fo) + ' domanda=' + (tv.indexOf(DOMANDA) >= 0), (await velo(fo)) && tv.indexOf(DOMANDA) >= 0 && tv.indexOf(TITOLO) >= 0);
  await esciFO(fo);

  /* ===== 6. spia e errori ===== */
  const wUT = scrDip.filter(x => / (users|timesheets)\//.test(x));
  chk('B10-22', 'Dipendenti (tutte le 4 pagine aperte)', 'Fogli ore: users/timesheets', 'ZERO scritture di Dipendenti in users/timesheets (log della finta Firebase)', '0', wUT.length + ' · scritture di Dipendenti: ' + scrDip.join(' · ').slice(0, 200), wUT.length === 0);
  chk('B10-23', 'Dipendenti', '—', 'le sole scritture di Dipendenti sono in residui/', 'tutte in residui/', scrDip.join(' · ').slice(0, 220), scrDip.length > 0 && scrDip.every(x => / residui\//.test(x)));
  const errs = [].concat(...pagine.map(p => p.__errori)).filter(e => /pageerror/.test(e));
  chk('B10-24', '—', '—', 'errori di pagina in tutte le pagine (' + pagine.length + ')', '0', errs.length + ' ' + errs.slice(0, 3).join(' | '), errs.length === 0);
  if (ctx.__esterni.length) riga('B10-25', '—', '—', 'richieste esterne bloccate', '0', ctx.__esterni.slice(0, 3).join(' | '), 'PARZIALE');
  K.riepilogo('ic-01-b10-chiusura');
  await browser.close();
})().catch(e => { console.error('ERRORE SCRIPT', e); process.exit(1); });
