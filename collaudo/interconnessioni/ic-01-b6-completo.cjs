// B6 — Flusso multi-app completo, dall'inizio alla fine, con un solo database finto condiviso. SOLO DATI INVENTATI.
//  esterno:    Fogli ore (operatore scrive) → Collaboratori («TS»)
//  dipendente: Dipendenti (Tabellone + 💾 + 📤) → residui → Fogli ore (🎯) ; cedOre → USOINT («Lavorate»)
const K = require('./ic-01-comune.cjs');
const { FO, USO, ADMIN, PWD, ADMIN_UID, chk, riga } = K;
const ottR = K.giorniFeriali(2026, 10, 3); ottR['31'] = 4.5;      /* 82,50 */
const seedDip = { dipendenti: [K.dipendente('d1', 'ROSSI MARIO', { mensilizzato: true, mensilizzatoDal: '01/10/2026', sigla: 'ROS1', tettiAnnui: [{ anno: 2026, ore: 300 }] })],
  dati: { '2026-09': { d1: { giorni: { '15': 4 } } }, '2026-10': { d1: { giorni: ottR } } }, anni: [2026], version: 4 };
const prj = K.progettoUso('p1', 'PROGETTO PROVA', ['ROSSI MARIO']);
const seed = { id: 'ic01-b6',
  [FO]: { reset: true, users: [{ email: ADMIN, password: PWD, uid: ADMIN_UID }, { email: 'esterno@prova.it', password: PWD, uid: 'W9' }, { email: 'rossi@prova.it', password: PWD, uid: 'W1' }],
    docs: Object.assign({}, K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'), K.utenteFO('W9', 'esterno@prova.it', 'ESTERNO', 'LUCA'), K.utenteFO('W1', 'rossi@prova.it', 'ROSSI', 'MARIO'),
      K.servizioFO('W9', 2026, 11, 0, {}), K.servizioFO('W1', 2026, 10, 0, {}), { ['report-ore-mensile/' + ADMIN_UID]: seedDip }) },
  [USO]: { reset: true, users: [{ email: 'uso@prova.it', password: PWD, uid: 'USO0001' }], docs: Object.assign({}, K.kvUso('USO0001', 'usoint-idx', [{ id: 'p1', title: 'PROGETTO PROVA', start: '2026-01', end: '2026-12' }]), K.kvUso('USO0001', 'usoint-p-p1', prj)) } };
const op = nome => ({ sheet: nome, name: nome, years: { '2026': { default_rate: 20, services: [{ name: 'SERVIZIO', residual: 0, hours: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], rate: 20 }], payments: [] } } });
const ls = { spazioireos_opoc: JSON.stringify([op('ESTERNO LUCA')]), spazioireos_opoc_pin: '123456' };

(async () => {
  const browser = await K.chromium.launch();
  const ctx = await K.contesto(browser, { seed, ls });
  /* --- esterno: Fogli ore → Collaboratori --- */
  const fo = await K.pagina(ctx);
  await K.loginFO(fo, 'esterno@prova.it');
  await fo.evaluate(async () => { ws.view = 'foglio'; ws.year = 2026; ws.month = 11; ws.si = 0; await renderWorker();
    uD(2, 't1f', '900'); uD(2, 't1t', '1230'); uD(3, 't1f', '14.00'); uD(3, 't1t', '17h00'); await manualSave(); });
  await K.attesa(800);
  const tsW9 = (await K.dump(fo, FO))['timesheets/W9__2026_11_0'];
  chk('B6-01', 'Fogli ore (ESTERNO LUCA)', 'timesheets', 'ore di novembre salvate', 'g2 09:00-12:30, g3 14:00-17:00', JSON.stringify(tsW9 && tsW9.days), tsW9 && tsW9.days[2] && tsW9.days[2].t1t === '12:30' && tsW9.days[3].t1t === '17:00');
  await fo.evaluate(() => auth.signOut()); await K.attesa(400);
  const col = await K.pagina(ctx);
  await K.loginCol(col); await K.colCollega(col); await K.colScheda(col, 'ESTERNO LUCA'); await K.attesa(1500); await K.colScheda(col, 'ESTERNO LUCA');
  const ts = await K.colTS(col);
  chk('B6-02', 'Fogli ore', 'Collaboratori · ESTERNO LUCA', 'TS di novembre', 'Nov: TS 6,5', JSON.stringify(ts), ts[10] === 'TS 6,5' && ts.filter(Boolean).length === 1);
  await col.close();

  /* --- dipendente: Dipendenti → 💾 → 📤 --- */
  const dip = await K.pagina(ctx);
  await K.loginDip(dip); await K.dipMese(dip, 'Ott');
  const card = dip.locator('.emp-card', { hasText: 'ROSSI MARIO' }).first();
  const c1 = card.locator('input.cell-in').nth(0); await c1.click(); await c1.fill('9'); await c1.press('Tab'); await K.attesa(600);   /* 3 → 9 : 88,50 rese */
  await K.dipSalva(dip);
  const doc = (await K.dump(dip, FO))['report-ore-mensile/' + ADMIN_UID];
  const ced = doc.cedOre && doc.cedOre['2026-10'] && doc.cedOre['2026-10'].d1;
  const box = await dip.evaluate(() => { const c = [...document.querySelectorAll('.emp-card')].find(e => /ROSSI MARIO/.test(e.innerText)); const b = c && c.querySelector('.ced-box'); return b ? b.innerText.replace(/\s+/g, ' ') : ''; });
  const tetto = await dip.evaluate(() => { const t = document.body.innerText; const m = t.match(/Già usate[^\d]*([\d.,]+)/); return m ? m[1] : ''; });
  const n0 = dip.__dialoghi.length;
  await dip.locator('button', { hasText: 'Pubblica i residui' }).first().click();
  for (let i = 0; i < 30; i++) { await K.attesa(300); if (dip.__dialoghi.slice(n0).some(d => /Pubblicati|Riusciti/.test(d.msg))) break; }
  const res = (await K.dump(dip, FO))['residui/W1'];
  riga('B6-03', 'Dipendenti (88,50 rese, mensilizzato, 💾)', 'cedOre + box', 'ore a cedolino coerenti fra box e documento', 'box = cedOre', 'cedOre ' + ced + ' · box «' + (box.match(/supplementari ([\d.,]+)/) || [''])[0] + '»',
    ced != null && box.indexOf(String(ced).replace('.', ',')) >= 0 ? 'SUPERATO' : 'FALLITO');
  chk('B6-04', 'Dipendenti 🎯 Tetto annuo («Già usate»)', 'residui/W1.usate', 'il numero pubblicato è quello del Tabellone', tetto, JSON.stringify(res), res && Math.abs(res.usate - parseFloat(tetto.replace(/\./g, '').replace(',', '.'))) < 0.001 && Math.abs(res.restano - (300 - res.usate)) < 0.001);
  await dip.close();
  /* --- Fogli ore: il dipendente vede il residuo --- */
  await K.loginFO(fo, 'rossi@prova.it');
  const pan = await fo.evaluate(async () => { ws.view = 'servizi'; await renderWorker(); await new Promise(r => setTimeout(r, 900)); const t = document.body.innerText; const i = t.indexOf('🎯'); return i < 0 ? '' : t.slice(i, i + 220).replace(/\s+/g, ' '); });
  const att = res ? res.restano.toFixed(2).replace('.', ',') : '?';
  chk('B6-05', 'residui/W1', 'Fogli ore (ROSSI)', 'riquadro 🎯', 'Ti restano ' + att + ' h su 300,00', pan, pan.indexOf('Ti restano ' + att) >= 0 && /300,00 ore/.test(pan));
  await fo.evaluate(() => auth.signOut()); await K.attesa(400);
  /* --- USOINT legge cedOre --- */
  const uso = await K.pagina(ctx);
  await K.loginUso(uso); await K.usoRiepilogo(uso);
  await uso.locator('button', { hasText: 'Salva ore lavorate' }).first().click().catch(() => {}); await K.attesa(800);
  const lav = await K.usoLav(uso);
  const a = (lav['rossi mario'] || {})['2026'] || [];
  chk('B6-06', 'Dipendenti cedOre', 'USOINT rossi mario', 'ottobre = cedOre, settembre = celle', 'ott ' + ced + ' · set 4', 'ott ' + a[9] + ' · set ' + a[8], ced != null && Math.abs(a[9] - ced) < 0.001 && a[8] === 4);
  /* coerenza a tre: Dipendenti box = cedOre = USOINT ; Tetto = residui = Fogli ore */
  riga('B6-07', 'tutte', 'tutte', 'coerenza complessiva', 'box=cedOre=USOINT; Già usate=residui=Fogli ore; TS=ore Fogli ore', 'vedi B6-02…B6-06', [ts[10] === 'TS 6,5', ced != null && Math.abs(a[9] - ced) < 0.001, pan.indexOf('Ti restano ' + att) >= 0].every(Boolean) ? 'SUPERATO' : 'FALLITO');
  const errs = fo.__errori.concat(uso.__errori).filter(e => /pageerror/.test(e));
  chk('B6-08', '—', '—', 'errori di pagina', '0', errs.length + ' ' + errs.slice(0, 2).join(' | '), errs.length === 0);
  K.riepilogo('ic-01-b6-completo');
  await browser.close();
})().catch(e => { console.error('ERRORE SCRIPT', e); process.exit(1); });
