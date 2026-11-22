// B1 — Fogli ore → Dipendenti (riga di confronto non vincolante). SOLO DATI INVENTATI.
const K = require('./ic-01-comune.cjs');
const { FO, ADMIN, PWD, ADMIN_UID, chk, riga } = K;

const seedDip = {
  dipendenti: [
    K.dipendente('d1', 'ROSSI MARIO'),
    K.dipendente('d2', "FERRARE' LUCA"),
    K.dipendente('d3', 'VERDI ANNA'),
    K.dipendente('d5', 'BIANCHI PAOLO'),
    K.dipendente('d6', 'NERI CARLA'), K.dipendente('d7', 'NERI CARLA')
  ],
  dati: { '2026-10': { d1: { giorni: { '1': 5, '2': 3, '5': 'FERIE' } }, d2: { giorni: { '1': 4 } }, d5: { giorni: { '1': 5 } }, d6: { giorni: { '1': 2 } } } },
  anni: [2026], version: 4
};
const docs = Object.assign({},
  K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'),
  K.utenteFO('W1', 'rossi@prova.it', 'ROSSI', 'MARIO'),
  K.utenteFO('W2', 'ferrare@prova.it', 'FERRARÈ', 'LUCA'),
  K.utenteFO('W3', 'verdi1@prova.it', 'VERDI', 'ANNA'), K.utenteFO('W4', 'verdi2@prova.it', 'VERDÌ', 'ANNA'),
  K.utenteFO('W5', 'bianchi@prova.it', 'BIANCHI', 'PAOLO'),
  K.utenteFO('W6', 'neri@prova.it', 'NERI', 'CARLA'),
  K.servizioFO('W1', 2026, 10, 0, {}), K.servizioFO('W1', 2026, 10, 1, {}),
  /* formati storici scritti come stanno nel database: 900, 130->? , 14.30, 14h30, 9 */
  K.servizioFO('W2', 2026, 10, 0, { '1': { t1f: '900', t1t: '1300' }, '2': { t1f: '14.30', t1t: '16h30' }, '3': { t1f: '9', t1t: '1030' }, '6': { absence: 'MALATTIA' } }),
  K.servizioFO('W2', 2026, 10, 1, { '1': { t1f: '15:00', t1t: '16:00' }, '6': { absence: 'MALATTIA' } }),
  K.servizioFO('W3', 2026, 10, 0, { '1': { t1f: '08:00', t1t: '10:00' } }),
  K.servizioFO('W4', 2026, 10, 0, { '1': { t1f: '08:00', t1t: '11:00' } }),
  K.servizioFO('W5', 2026, 10, 0, { '1': { t1f: '08:00', t1t: '13:00' } }),
  K.servizioFO('W6', 2026, 10, 0, { '1': { t1f: '08:00', t1t: '10:00' } }),
  { ['report-ore-mensile/' + ADMIN_UID]: seedDip }
);
const seed = { id: 'ic01-b1', [FO]: { reset: true, users: [
  { email: ADMIN, password: PWD, uid: ADMIN_UID }, { email: 'rossi@prova.it', password: PWD, uid: 'W1' }], docs } };

async function righeConfronto(page) {
  return page.evaluate(() => {
    const out = {};
    document.querySelectorAll('div').forEach(d => {
      const t = d.innerText || '';
      if (/^ℹ️ Confronto con "Fogli ore"/.test(t) && d.children.length < 12) { const m = t.match(/— ([^·]+?) ·/); if (m) out[m[1].trim()] = t.replace(/\s+/g, ' '); }
      if (/^⚠️ Due persone con lo stesso nome/.test(t) && d.children.length < 12) { const m = t.match(/— ([^·]+?) ·/); if (m) out['OMON:' + m[1].trim()] = t.replace(/\s+/g, ' '); }
    });
    return out;
  });
}

(async () => {
  const browser = await K.chromium.launch();
  const ctx = await K.contesto(browser, { seed });
  /* 1) l'operatore registra le ore in Fogli ore, con il percorso dell'app (uD + 💾, onAbs) */
  const fo = await K.pagina(ctx);
  await K.loginFO(fo, 'rossi@prova.it');
  const esito = await fo.evaluate(async () => {
    ws.view = 'foglio'; ws.year = 2026; ws.month = 10; ws.si = 0; await renderWorker();
    uD(1, 't1f', '900'); uD(1, 't1t', '1300'); uD(2, 't1f', '14.30'); uD(2, 't1t', '16h30');
    await manualSave();
    ws.si = 1; await renderWorker();
    uD(1, 't1f', '15:00'); uD(1, 't1t', '16:00'); uD(2, 't1f', '9'); uD(2, 't1t', '10');
    await manualSave();
    await onAbs(5, 'FERIE');
    return document.getElementById('btn-save') ? document.getElementById('btn-save').textContent : '';
  });
  await K.attesa(1500);
  const db1 = await K.dump(fo, FO);
  const s0 = db1['timesheets/W1__2026_10_0'] || {}, s1 = db1['timesheets/W1__2026_10_1'] || {};
  chk('B1-01', 'Fogli ore (operatore)', 'timesheets', 'ore scritte dall\'operatore e salvate', 's0 g1 09:00-13:00, g2 14:30-16:30; s1 g1 15-16, g2 9-10',
    JSON.stringify([s0.days && s0.days[1], s0.days && s0.days[2], s1.days && s1.days[1], s1.days && s1.days[2]]),
    s0.days && s0.days[1] && s0.days[1].t1f === '09:00' && s0.days[2].t1t === '16:30' && s1.days[2] && s1.days[2].t1f === '09:00');
  chk('B1-02', 'Fogli ore (operatore)', 'timesheets', 'FERIE del 5 su tutti e due i servizi', 'absence FERIE su s0 e s1',
    (s0.days && s0.days[5] && s0.days[5].absence) + ' / ' + (s1.days && s1.days[5] && s1.days[5].absence),
    s0.days && s0.days[5] && s0.days[5].absence === 'FERIE' && s1.days[5] && s1.days[5].absence === 'FERIE');
  await fo.evaluate(() => auth.signOut()); await K.attesa(500);

  /* 2) l'admin apre Dipendenti, Ottobre 2026 */
  const dip = await K.pagina(ctx);
  await K.loginDip(dip);
  await K.dipMese(dip, 'Ott');
  await K.aspettaTesto(dip, /Confronto con "Fogli ore"/, 15000);
  let r = await righeConfronto(dip);
  const rr = r['ROSSI MARIO'] || '';
  chk('B1-03', 'Fogli ore', 'Dipendenti · Ott 2026', 'ore di ROSSI MARIO (2 servizi, formati 900/14.30/16h30/9)', '8,000 h', rr, /ore sul foglio ore: 8,000 h/.test(rr));
  chk('B1-04', 'Fogli ore', 'Dipendenti · Ott 2026', 'assenza su 2 servizi contata una volta', 'FERIE 1 gg', rr, /FERIE 1 gg/.test(rr) && !/FERIE 2 gg/.test(rr));
  chk('B1-05', 'Fogli ore', 'Dipendenti · Ott 2026', 'totale discordante (Dipendenti 8 h celle = 5+3)', 'nessun «totale mese» (8 = 8)', rr, !/totale mese/.test(rr));
  const rf = r["FERRARE' LUCA"] || '';
  chk('B1-06', 'Fogli ore (FERRARÈ LUCA)', 'Dipendenti (FERRARE\' LUCA)', 'abbinamento accento/apostrofo finale + formati storici 900/14.30/16h30/9-1030 + MALATTIA su 2 servizi', '8,500 h · MALATTIA 1 gg', rf,
    /8,500 h/.test(rf) && /MALATTIA 1 gg/.test(rf));
  const ro = r['OMON:VERDI ANNA'] || '';
  chk('B1-07', 'Fogli ore (VERDI ANNA + VERDÌ ANNA)', 'Dipendenti', 'omonimi (account) → riquadro rosso, confronto sospeso', 'riquadro «Due persone» e nessuna riga di confronto', ro.slice(0, 160) + ' | riga: ' + !!r['VERDI ANNA'],
    /2 account/.test(ro) && !r['VERDI ANNA']);
  const rn = r['OMON:NERI CARLA'] || '';
  chk('B1-08', 'Dipendenti (2 schede NERI CARLA)', 'Dipendenti', 'omonimi (schede) → riquadro rosso', '«2 schede» e nessun confronto', rn.slice(0, 160) + ' | riga: ' + !!r['NERI CARLA'], /2 schede/.test(rn) && !r['NERI CARLA']);
  const rb = r['BIANCHI PAOLO'] || '';
  chk('B1-09', 'Fogli ore', 'Dipendenti', 'BIANCHI PAOLO per nome', '5,000 h', rb, /5,000 h/.test(rb));

  /* 3) modifica successiva in Fogli ore mentre Dipendenti è aperto */
  await dip.evaluate(p => window.__fakefb.seed(p, { 'timesheets/W1__2026_10_0': Object.assign({}, window.__fakefb.get(p, 'timesheets/W1__2026_10_0'), { days: Object.assign({}, window.__fakefb.get(p, 'timesheets/W1__2026_10_0').days, { '7': { t1f: '08:00', t1t: '10:00' } }) }) }), FO);
  await K.dipMese(dip, 'Set'); await K.dipMese(dip, 'Ott'); await K.attesa(1500);
  r = await righeConfronto(dip);
  const senzaRic = r['ROSSI MARIO'] || '';
  riga('B1-10', 'Fogli ore (modifica +2 h)', 'Dipendenti già aperto', 'propagazione cambiando mese e tornando', '10,000 h (oppure dichiarato che serve ricaricare)', senzaRic,
    /10,000 h/.test(senzaRic) ? 'SUPERATO' : 'PARZIALE');
  await dip.reload(); await dip.waitForSelector('.app-header', { timeout: 40000 }); await K.dipMese(dip, 'Ott'); await K.aspettaTesto(dip, /Confronto con/, 15000); await K.attesa(800);
  r = await righeConfronto(dip);
  chk('B1-11', 'Fogli ore (modifica +2 h)', 'Dipendenti ricaricato', 'propagazione dopo ricarica', '10,000 h', r['ROSSI MARIO'] || '', /10,000 h/.test(r['ROSSI MARIO'] || ''));

  /* 4) account agganciato (foUid) e cambio di nome in Fogli ore */
  dip.__risposte.push({ re: /Aggancio l'account/, ok: true });
  await dip.locator('.tab', { hasText: 'Anagrafica' }).first().click(); await K.attesa(1000);
  await dip.locator('button', { hasText: 'Aggancia gli account di Fogli ore' }).first().click().catch(e => console.log('   click aggancia: ' + e.message.slice(0, 80)));
  await K.attesa(1500);
  const dlgAgg = dip.__dialoghi.filter(d => /Aggancio|agganciare/.test(d.msg)).map(d => d.msg).join(' || ');
  await K.dipSalva(dip); await K.attesa(1200);
  const docD = (await K.dump(dip, FO))['report-ore-mensile/' + ADMIN_UID] || {};
  const fu = {}; (docD.dipendenti || []).forEach(d => { fu[d.nome] = d.foUid || ''; });
  chk('B1-12', 'Dipendenti (🔗 Aggancia)', 'report-ore-mensile.dipendenti[].foUid', 'aggancio per nome, omonimi esclusi', 'ROSSI→W1, BIANCHI→W5, FERRARE\'→W2, VERDI e NERI vuoti', JSON.stringify(fu),
    fu['ROSSI MARIO'] === 'W1' && fu['BIANCHI PAOLO'] === 'W5' && fu["FERRARE' LUCA"] === 'W2' && !fu['VERDI ANNA'] && !fu['NERI CARLA']);
  if (!(fu['BIANCHI PAOLO'] === 'W5')) console.log('   dialogo aggancio: ' + dlgAgg.slice(0, 400));
  await dip.evaluate(p => { const u = window.__fakefb.get(p, 'users/W5'); window.__fakefb.seed(p, { 'users/W5': Object.assign({}, u, { cognome: 'BIANCHI-SERRA', nome: 'PAOLO', name: 'BIANCHI-SERRA PAOLO' }) }); }, FO);
  await dip.reload(); await dip.waitForSelector('.app-header', { timeout: 40000 }); await K.dipMese(dip, 'Ott'); await K.aspettaTesto(dip, /Confronto con/, 15000); await K.attesa(800);
  r = await righeConfronto(dip);
  chk('B1-13', 'Fogli ore (BIANCHI rinominato BIANCHI-SERRA)', 'Dipendenti (foUid W5)', 'il legame regge al cambio di nome', 'riga BIANCHI PAOLO 5,000 h', r['BIANCHI PAOLO'] || '(nessuna riga)', /5,000 h/.test(r['BIANCHI PAOLO'] || ''));

  /* 5) zero scritture di Dipendenti su users/timesheets (log della finestra di Dipendenti) */
  const ops = await dip.evaluate(() => window.__fakefb.log);
  const w = K.scritture(ops, o => o.project === FO && /^(users|timesheets|lightsheets)\//.test(o.path || ''));
  const letture = ops.filter(o => o.project === FO && /^(users|timesheets)/.test(o.path || '') && !/set|update|delete/.test(o.op)).length;
  chk('B1-14', 'Dipendenti', 'Fogli ore users/timesheets', 'scritture di Dipendenti su users/timesheets/lightsheets (log)', '0 (e qualche lettura)', 'scritture ' + w.length + ' · letture ' + letture + ' · ' + w.slice(0, 3).map(o => o.op + ' ' + o.path).join(' | '), w.length === 0 && letture > 0);

  /* 6) lettura caduta: che cosa dice la riga */
  await dip.evaluate(() => { window.__fakefb.failReads = true; });
  await K.dipMese(dip, 'Nov'); await K.attesa(1500);
  const tNov = await K.testo(dip);
  const msgErr = (tNov.match(/confronto Fogli ore non disponibile[^\n]*/) || [''])[0];
  /* ver207: con la linea caduta dice che manca il collegamento, non i permessi */
  chk('B1-15', 'Fogli ore (lettura caduta)', 'Dipendenti · Nov 2026', 'messaggio quando la lettura di timesheets cade', 'confronto non disponibile: non c\'è collegamento (niente «permessi»)', msgErr || '(niente a video)',
    /non c'è collegamento/.test(msgErr) && !/permessi/.test(msgErr));
  await dip.evaluate(() => { window.__fakefb.failReads = false; });
  /* ver207: con i permessi negati dice «permessi» */
  await dip.evaluate(p => { window.__fakefb.deny = [{ project: p, coll: 'timesheets', op: 'read' }]; }, FO);
  await K.dipMese(dip, 'Dic'); await K.attesa(1500);
  const msgDen = ((await K.testo(dip)).match(/confronto Fogli ore non disponibile[^\n]*/) || [''])[0];
  chk('B1-15b', 'Fogli ore (permessi negati)', 'Dipendenti · Dic 2026', 'messaggio quando le regole negano la lettura', 'confronto non disponibile (permessi)', msgDen || '(niente a video)', /\(permessi\)/.test(msgDen));
  await dip.evaluate(() => { window.__fakefb.deny = []; });
  const errs = fo.__errori.concat(dip.__errori);
  chk('B1-16', '—', '—', 'errori di pagina in Fogli ore e Dipendenti', '0', errs.length + ' ' + errs.slice(0, 3).join(' | '), errs.filter(e => /pageerror/.test(e)).length === 0);
  K.riepilogo('ic-01-b1-fo-dip');
  await browser.close();
})().catch(e => { console.error('ERRORE SCRIPT', e); process.exit(1); });
