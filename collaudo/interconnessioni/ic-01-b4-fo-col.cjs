// B4 — Fogli ore → Collaboratori («TS N» sopra i mesi, normali + light). SOLO DATI INVENTATI.
const K = require('./ic-01-comune.cjs');
const { FO, ADMIN, PWD, ADMIN_UID, chk, riga } = K;
const docs = Object.assign({},
  K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'),
  K.utenteFO('W1', 'rossi@prova.it', 'ROSSI', 'MARIO'),
  K.utenteFO('W6', 'neri1@prova.it', 'NERI', 'CARLA'), K.utenteFO('W7', 'neri2@prova.it', 'NERI', 'CARLA'),       /* omonimi ESATTI */
  K.utenteFO('W2', 'f1@prova.it', 'FERRARÈ', 'LUCA'), K.utenteFO('W3', 'f2@prova.it', "FERRARE'", 'LUCA'),         /* omonimi per accento */
  K.utenteFO('W8', 'blu@prova.it', 'BLU', 'LINO'),
  K.utenteFO('E1', 'editor@prova.it', 'EDITOR', 'UNO', 'editor'),
  K.servizioFO('W1', 2026, 1, 0, { '2': { t1f: '900', t1t: '1300' }, '5': { t1f: '14.30', t1t: '16h30' }, '8': { absence: 'FERIE' } }),
  K.servizioFO('W1', 2026, 1, 1, { '2': { t1f: '15:00', t1t: '16:00' }, '8': { absence: 'FERIE' } }),
  K.servizioFO('W1', 2026, 3, 0, { '3': { t1f: '8', t1t: '16' } }),
  K.servizioFO('W6', 2026, 1, 0, { '2': { t1f: '08:00', t1t: '10:00' } }), K.servizioFO('W7', 2026, 1, 0, { '2': { t1f: '08:00', t1t: '11:00' } }),
  K.servizioFO('W2', 2026, 1, 0, { '2': { t1f: '08:00', t1t: '09:00' } }), K.servizioFO('W3', 2026, 1, 0, { '2': { t1f: '08:00', t1t: '12:00' } }),
  K.servizioFO('W8', 2026, 1, 0, { '2': { t1f: '08:00', t1t: '10:00' } }),
  { 'lightsheets/L1': { editorUid: 'E1', editorName: 'EDITOR UNO', name: 'VERDI GIULIA', ruolo: '', retrib: '', materia: 'NUOTO', comune: '', sede: '', hours: { '2026': { '0': 3, '5': 3, '6': 2, '7': 4 } }, skip: {} },
    'lightsheets/L2': { editorUid: 'E1', editorName: 'EDITOR UNO', name: 'VERDI GIULIA', ruolo: '', retrib: '', materia: 'DANZA', comune: '', sede: '', hours: { '2026': { '0': 3 } }, skip: {} },
    'lightsheets/L3': { editorUid: 'E1', editorName: 'EDITOR UNO', name: 'BLU LINO', materia: 'CALCIO', hours: { '2026': { '0': 3 } }, skip: {} } }
);
const seed = { id: 'ic01-b4', [FO]: { reset: true, users: [{ email: ADMIN, password: PWD, uid: ADMIN_UID }], docs } };
const op = nome => ({ sheet: nome, name: nome, years: { '2026': { default_rate: 20, services: [{ name: 'SERVIZIO', residual: 0, hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], rate: 20 }], payments: [] } } });
const opoc = [op('BLU LINO'), op("FERRARE' LUCA"), op('NERI CARLA'), op('ROSSI MARIO'), op('VERDI GIULIA'), op('ZETA SENZACONTO')];
const ls = { spazioireos_opoc: JSON.stringify(opoc), spazioireos_opoc_pin: '123456' };
const M = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lug', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
const vis = a => a.map((x, i) => x ? M[i] + ':' + x : '').filter(Boolean).join(' ') || '(nessuno)';

(async () => {
  const browser = await K.chromium.launch();
  const ctx = await K.contesto(browser, { seed, ls });
  const col = await K.pagina(ctx);
  await K.loginCol(col);
  /* scollegato: nessun TS */
  await K.colScheda(col, 'ROSSI MARIO');
  let ts = await K.colTS(col);
  chk('B4-01', 'Fogli ore', 'Collaboratori (scollegato)', 'nessun suggerimento senza collegamento', '(nessuno)', vis(ts), ts.every(x => !x));
  await K.colCollega(col);
  await K.colScheda(col, 'ROSSI MARIO'); await K.attesa(1500); await K.colScheda(col, 'ROSSI MARIO');
  ts = await K.colTS(col);
  chk('B4-02', 'Fogli ore (ROSSI, 2 servizi, formati 900/14.30/16h30/8-16, FERIE su 2 servizi)', 'Collaboratori · ROSSI MARIO', 'TS per mese', 'Gen:TS 7 Mar:TS 8', vis(ts), ts[0] === 'TS 7' && ts[2] === 'TS 8' && ts.filter(Boolean).length === 2);
  await K.colScheda(col, 'VERDI GIULIA'); ts = await K.colTS(col);
  chk('B4-03', 'Fogli ore lightsheets (2 materie; Giu inv 3 + est 2; Lug 4)', 'Collaboratori · VERDI GIULIA', 'TS light per mese', 'Gen:TS 6 Giu:TS 5 Lug:TS 4', vis(ts), ts[0] === 'TS 6' && ts[5] === 'TS 5' && ts[6] === 'TS 4');
  await K.colScheda(col, 'NERI CARLA'); ts = await K.colTS(col);
  riga('B4-04', 'Fogli ore (2 account «NERI CARLA», 2 h + 3 h)', 'Collaboratori · NERI CARLA', 'omonimi con nome IDENTICO', 'TS ? (come per gli accenti)', vis(ts), ts[0] === 'TS ?' ? 'SUPERATO' : 'FALLITO');
  await K.colScheda(col, "FERRARE' LUCA"); ts = await K.colTS(col);
  chk('B4-05', 'Fogli ore (FERRARÈ LUCA + FERRARE\' LUCA)', 'Collaboratori', 'omonimi per accento/apostrofo', 'TS ?', vis(ts), ts[0] === 'TS ?');
  await K.colScheda(col, 'BLU LINO'); ts = await K.colTS(col);
  chk('B4-06', 'Fogli ore (normale 2 h + light 3 h, stesso nome)', 'Collaboratori · BLU LINO', 'normali + light sommati', 'Gen:TS 5', vis(ts), ts[0] === 'TS 5');
  await K.colScheda(col, 'ZETA SENZACONTO'); ts = await K.colTS(col);
  chk('B4-07', '—', 'Collaboratori · ZETA SENZACONTO', 'nessun abbinamento', '(nessuno)', vis(ts), ts.every(x => !x));
  /* le celle non vengono toccate */
  const ore = await col.evaluate(() => JSON.parse(localStorage.getItem('spazioireos_opoc')).map(o => o.name + ':' + o.years['2026'].services[0].hours.reduce((a, b) => a + (+b || 0), 0)).join(' '));
  chk('B4-08', 'Fogli ore', 'Collaboratori dati (spazioireos_opoc)', 'nessuna cella riempita', 'tutte 0', ore, !/:[1-9]/.test(ore));
  /* modifica successiva in Fogli ore */
  await col.evaluate(p => { const x = window.__fakefb.get(p, 'timesheets/W1__2026_3_0'); x.days['4'] = { t1f: '08:00', t1t: '10:00' }; window.__fakefb.seed(p, { 'timesheets/W1__2026_3_0': x }); }, FO);
  await K.colScheda(col, 'ROSSI MARIO'); ts = await K.colTS(col);
  riga('B4-09', 'Fogli ore (ROSSI marzo +2 h)', 'Collaboratori già collegato', 'propagazione senza ricaricare', 'Mar:TS 10 (o dichiarato)', vis(ts), ts[2] === 'TS 10' ? 'SUPERATO' : 'PARZIALE');
  await col.reload(); await col.waitForSelector('#pinInput'); await col.fill('#pinInput', '123456'); await col.click('.pin-btn'); await K.attesa(1500);
  await K.colScheda(col, 'ROSSI MARIO'); await K.attesa(1500); await K.colScheda(col, 'ROSSI MARIO'); ts = await K.colTS(col);
  chk('B4-10', 'Fogli ore (ROSSI marzo +2 h)', 'Collaboratori ricaricato', 'propagazione dopo ricarica (sessione «fogliore» persistita)', 'Mar:TS 10', vis(ts), ts[2] === 'TS 10');
  /* nessuna scrittura su Fogli ore */
  const ops = await col.evaluate(() => window.__fakefb.log);
  const w = K.scritture(ops, o => o.project === FO);
  chk('B4-11', 'Collaboratori', 'Fogli ore (progetto spazio-ireos-foglio-ore)', 'scritture di Collaboratori', '0', w.length + ' ' + w.slice(0, 2).map(o => o.op + ' ' + o.path).join(' | '), w.length === 0);
  const bk = await col.evaluate(() => localStorage.getItem('spazioireos_opoc'));
  chk('B4-12', 'Collaboratori', 'backup dati', 'il dato di Collaboratori non contiene niente di Firebase', 'nessun «fogliore»/«firebase»', /fogliore|firebase/i.test(bk) ? 'contiene' : 'pulito', !/fogliore|firebase/i.test(bk));
  /* lettura caduta: che cosa si vede */
  await col.evaluate(() => { window.__fakefb.failReads = true; FOcacheAnno = {}; FOpending = {}; });
  await K.colScheda(col, 'ROSSI MARIO'); await K.attesa(1200); await K.colScheda(col, 'ROSSI MARIO');
  ts = await K.colTS(col); const tcol = await K.testo(col);
  riga('B4-13', 'Fogli ore (lettura caduta)', 'Collaboratori', 'cosa mostra con la lettura caduta', 'niente TS e nessun errore a video (dichiarato), dati intatti', vis(ts) + ' · avviso a video: ' + (/errore|non disponibile|offline/i.test(tcol) ? 'sì' : 'no'), ts.every(x => !x) ? 'SUPERATO' : 'FALLITO');
  await col.evaluate(() => { window.__fakefb.failReads = false; });
  const errs = col.__errori.filter(e => /pageerror/.test(e));
  chk('B4-14', '—', '—', 'errori di pagina', '0', errs.length + ' ' + errs.slice(0, 2).join(' | '), errs.length === 0);
  K.riepilogo('ic-01-b4-fo-col');
  await browser.close();
})().catch(e => { console.error('ERRORE SCRIPT', e); process.exit(1); });
