// B2 — Dipendenti → residui → Fogli ore (🎯 Le ore che ti restano quest'anno). SOLO DATI INVENTATI.
const K = require('./ic-01-comune.cjs');
const { FO, ADMIN, PWD, ADMIN_UID, chk, riga } = K;
const tet = [{ anno: 2026, ore: 400 }];
const seedDip = {
  dipendenti: [
    K.dipendente('d1', 'ROSSI MARIO', { tettiAnnui: tet }),
    K.dipendente('d3', 'VERDI ANNA', { tettiAnnui: tet }),
    K.dipendente('d4', 'GIALLI ALDO', { tettiAnnui: tet })      /* senza account in Fogli ore */
  ],
  dati: { '2026-10': { d1: { giorni: { '1': 5, '2': 3, '6': 4 } }, d3: { giorni: { '1': 2 } }, d4: { giorni: { '1': 2 } } } },
  anni: [2026], version: 4
};
const docs = Object.assign({},
  K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'),
  K.utenteFO('W1', 'rossi@prova.it', 'ROSSI', 'MARIO'),
  K.utenteFO('W2', 'collega@prova.it', 'COLLEGA', 'PIA'),
  K.utenteFO('W3', 'verdi1@prova.it', 'VERDI', 'ANNA'), K.utenteFO('W4', 'verdi2@prova.it', 'VERDI', 'ANNA'),
  K.servizioFO('W1', 2026, 10, 0, { '1': { t1f: '08:00', t1t: '13:00' } }), K.servizioFO('W2', 2026, 10, 0, {}),
  { ['report-ore-mensile/' + ADMIN_UID]: seedDip }
);
const seed = { id: 'ic01-b2', [FO]: { reset: true, users: [
  { email: ADMIN, password: PWD, uid: ADMIN_UID }, { email: 'rossi@prova.it', password: PWD, uid: 'W1' }, { email: 'collega@prova.it', password: PWD, uid: 'W2' }], docs } };

async function pannelloFO(page) {
  return page.evaluate(async () => { ws.view = 'servizi'; await renderWorker(); await new Promise(r => setTimeout(r, 900));
    const t = document.body.innerText; const i = t.indexOf('🎯 Le ore che ti restano'); return i < 0 ? '' : t.slice(i, i + 260).replace(/\s+/g, ' '); });
}
async function pubblica(dip) {
  const n0 = dip.__dialoghi.length;
  await dip.locator('button', { hasText: 'Pubblica i residui' }).first().click();
  for (let i = 0; i < 30; i++) { await K.attesa(300); if (dip.__dialoghi.slice(n0).some(d => /Pubblicati|Riusciti|niente da pubblicare|Nessun/.test(d.msg))) break; }
  return dip.__dialoghi.slice(n0).map(d => d.tipo + ': ' + d.msg);
}

(async () => {
  const browser = await K.chromium.launch();
  const ctx = await K.contesto(browser, { seed });
  let dip = await K.pagina(ctx);
  await K.loginDip(dip); await K.dipMese(dip, 'Ott');
  /* 1) pubblicazione */
  let dl = await pubblica(dip);
  const conf = dl.find(d => /Vuoi pubblicare/.test(d)) || '';
  const mR = conf.match(/ROSSI MARIO: restano ([\d.,]+) h su ([\d.,]+)/);
  chk('B2-01', 'Dipendenti (📤)', 'conferma', 'conferma elenca ROSSI, salta GIALLI (senza account) e VERDI (omonimi)', 'ROSSI in elenco · GIALLI fra i SENZA ACCOUNT · VERDI fra gli OMONIMI', conf.replace(/\n/g, ' ').slice(0, 260),
    !!mR && /SENZA ACCOUNT[\s\S]*GIALLI/.test(conf) && /OMONIMI[\s\S]*VERDI ANNA/.test(conf));
  const db = await K.dump(dip, FO);
  const rW1 = db['residui/W1'];
  chk('B2-02', 'Dipendenti', 'residui/W1', 'documento scritto con soli numeri', 'tetto 400, restano = conferma, nessun nome', JSON.stringify(rW1),
    rW1 && rW1.tetto === 400 && mR && Math.abs(rW1.restano - parseFloat(mR[1].replace(/\./g, '').replace(',', '.'))) < 0.001 && !JSON.stringify(rW1).match(/ROSSI|MARIO/));
  chk('B2-03', 'Dipendenti', 'residui/W3, W4', 'omonimi NON pubblicati', 'nessun documento', String(!!db['residui/W3']) + '/' + String(!!db['residui/W4']), !db['residui/W3'] && !db['residui/W4']);
  /* 2) l'operatore vede il suo residuo in Fogli ore.
     ⚠ Dipendenti va CHIUSO prima: la sessione [DEFAULT] è condivisa e, se Dipendenti è aperto, al login
     di un operatore fa signOut() e butta fuori anche Fogli ore (vedi B8). */
  await dip.close();
  const fo = await K.pagina(ctx);
  await K.loginFO(fo, 'rossi@prova.it');
  let pan = await pannelloFO(fo);
  const restTxt = rW1 ? String(rW1.restano.toFixed(2)).replace('.', ',') : '?';
  chk('B2-04', 'residui/W1', 'Fogli ore (ROSSI) · I miei servizi', 'riquadro 🎯 con i numeri pubblicati', 'al massimo 400 ore · usate ' + (rW1 && rW1.usate) + ' · Ti restano ' + restTxt, pan,
    /400/.test(pan) && pan.indexOf(restTxt) >= 0 && /anno scolastico 2026\/27/.test(pan));
  const panU = await fo.evaluate(async () => { ws.view = 'unico'; await renderWorker(); await new Promise(r => setTimeout(r, 900)); return /Le ore che ti restano/.test(document.body.innerText); });
  chk('B2-05', 'residui/W1', 'Fogli ore · Foglio unico', 'riquadro anche nel foglio unico', 'presente', panU, panU);
  await fo.evaluate(() => auth.signOut()); await K.attesa(500);
  /* sessione condivisa: Dipendenti e Fogli ore stanno sullo stesso [DEFAULT] -> riaccedo in Dipendenti */
  dip = await K.pagina(ctx); await K.loginDip(dip); await K.dipMese(dip, 'Ott');

  /* 3) cambio ore in Dipendenti → promemoria */
  const card = dip.locator('.emp-card', { hasText: 'ROSSI MARIO' }).first();
  const inp = card.locator('input.cell-in').nth(7);   /* 8 ottobre (giovedì) */
  await inp.click(); await inp.fill('6'); await inp.press('Tab'); await K.attesa(800);
  let t = await K.testo(dip);
  const prom = (t.match(/I residui pubblicati non sono più aggiornati[^\n]*/) || [''])[0];
  chk('B2-06', 'Dipendenti (cella 8/10 = 6 h)', 'barra del Tabellone', 'promemoria di ripubblicare', 'nomina ROSSI MARIO', prom || '(nessun promemoria)', /ROSSI MARIO/.test(prom));
  await K.dipSalva(dip);
  dl = await pubblica(dip);
  const db2 = await K.dump(dip, FO);
  chk('B2-07', 'Dipendenti (ripubblica)', 'residui/W1', 'residuo aggiornato', 'usate +6 rispetto a prima', (rW1 && rW1.usate) + ' → ' + (db2['residui/W1'] && db2['residui/W1'].usate),
    rW1 && db2['residui/W1'] && Math.abs(db2['residui/W1'].usate - rW1.usate - 6) < 0.001);
  t = await K.testo(dip);
  const prom2 = (t.match(/I residui pubblicati non sono più aggiornati[^\n]*/) || [''])[0];
  chk('B2-08', 'Dipendenti', 'barra', 'promemoria dopo la ripubblicazione riuscita', 'sparito (o almeno senza chi non si può pubblicare)', prom2 || 'assente', !prom2);
  chk('B2-08b', 'Dipendenti', 'barra', 'ROSSI (ripubblicato) non più nominato', 'ROSSI assente dal promemoria', prom2 || 'assente', !/ROSSI MARIO/.test(prom2));

  /* 4) guasto in scrittura e permessi negati */
  await dip.evaluate(p => { window.__fakefb.deny = [{ project: p, coll: 'residui', op: 'write' }]; }, FO);
  dl = await pubblica(dip);
  const esD = dl.filter(d => /Riusciti|Pubblicati/.test(d)).join(' | ');
  chk('B2-09', 'Dipendenti (permission-denied su residui)', 'esito', 'l\'esito dice che non è riuscito e parla di permessi', '«Riusciti 0 su 1 … NON riusciti … permessi»', esD.replace(/\n/g, ' ').slice(0, 240), /Riusciti 0/.test(esD) && /permess/i.test(esD));
  await dip.evaluate(() => { window.__fakefb.deny = []; window.__fakefb.failWrites = true; });
  dl = await pubblica(dip);
  const esF = dl.filter(d => /Riusciti|Pubblicati/.test(d)).join(' | ');
  chk('B2-10', 'Dipendenti (scrittura caduta)', 'esito', 'l\'esito dice che non è riuscito', '«Riusciti 0 su 1»', esF.replace(/\n/g, ' ').slice(0, 240), /Riusciti 0/.test(esF));
  await dip.evaluate(() => { window.__fakefb.failWrites = false; });
  await dip.evaluate(p => { window.__fakefb.deny = [{ project: p, coll: 'residui', op: 'read' }]; }, FO);
  dl = await pubblica(dip);
  const confL = dl.find(d => /Vuoi pubblicare/.test(d)) || '';
  chk('B2-11', 'Dipendenti (lettura elenco residui negata)', 'conferma', 'avvisa che non toglie niente', '«Non sono riuscito a leggere l\'elenco»', confL.replace(/\n/g, ' ').slice(-200), /Non sono riuscito a leggere l'elenco/.test(confL));
  await dip.evaluate(() => { window.__fakefb.deny = []; });

  /* 5) togli il massimale → residuo cancellato e riquadro sparito */
  await dip.locator('.tab', { hasText: 'Anagrafica' }).first().click(); await K.attesa(800);
  await dip.locator('text=ROSSI MARIO').first().click(); await K.attesa(800);
  const x = dip.locator('button[title="Rimuovi questo massimale"]');
  const nX = await x.count();
  const nDlg0 = dip.__dialoghi.length;
  if (nX) await x.first().click();
  await K.attesa(500);
  const confDel = dip.__dialoghi.slice(nDlg0).map(d => d.msg).join(' | ');
  riga('B2-12', 'Dipendenti (✕ massimale)', '—', 'il ✕ del massimale chiede conferma? (§10.1, osservazione)', 'conferma', confDel ? confDel.slice(0, 120) : 'nessuna conferma: tolto subito (solo in memoria, serve 💾)', confDel ? 'SUPERATO' : 'PARZIALE');
  await K.dipSalva(dip);
  await K.dipMese(dip, 'Ott');
  dl = await pubblica(dip);
  const confT = dl.find(d => /Vuoi pubblicare|niente da pubblicare/.test(d)) || dl.join(' | ');
  const db3 = await K.dump(dip, FO);
  chk('B2-13', 'Dipendenti (massimale tolto)', 'residui/W1', 'residuo cancellato, conferma lo dice', 'documento assente · «VIENE TOLTO il residuo»', 'doc: ' + JSON.stringify(db3['residui/W1'] || null) + ' · ' + confT.replace(/\n/g, ' ').slice(0, 200),
    !db3['residui/W1'] && /TOLTO/.test(confT));
  await dip.close();
  await K.loginFO(fo, 'rossi@prova.it');
  pan = await pannelloFO(fo);
  chk('B2-14', 'residui/W1 cancellato', 'Fogli ore (ROSSI)', 'riquadro sparito', 'nessun riquadro 🎯', pan || '(assente)', !pan);

  /* 6) un worker non legge il residuo di un collega: solo con deny (la finta Firebase non ha regole) */
  await fo.evaluate(p => { window.__fakefb.seed(p, { 'residui/W2': { tetto: 100, usate: 10, restano: 90, periodo: 'scolastico', anno: 2026 } }); }, FO);
  const letto = await fo.evaluate(async () => { try { const d = await db.collection('residui').doc('W2').get(); return d.exists ? 'LETTO ' + JSON.stringify(d.data()) : 'assente'; } catch (e) { return 'NEGATO ' + e.code; } });
  riga('B2-15', 'Fogli ore (W1) legge residui/W2', '—', 'lettura del residuo di un collega (finta Firebase, senza regole)', 'negata dalle regole vere', letto + ' — la finta Firebase non applica regole: vedi ic-01-b2b-regole.cjs (emulatore)', 'NON VERIFICATO');
  const errs = [].concat(dip.__errori).concat(fo.__errori).filter(e => /pageerror/.test(e));
  chk('B2-16', '—', '—', 'errori di pagina', '0', errs.length + ' ' + errs.slice(0, 2).join(' | '), errs.length === 0);
  K.riepilogo('ic-01-b2-residui');
  await browser.close();
})().catch(e => { console.error('ERRORE SCRIPT', e); process.exit(1); });
