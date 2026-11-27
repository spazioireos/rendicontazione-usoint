// uso-ver156 — audit A2 A3 A4 A7 A8 (Christian, 27/11/2026): il Trasferisci passa EURO; il «Previsto» dell'anno non cambia con chi va
// e chi arriva; le ore del subentrante = euro ÷ suo costo orario della vista mesi; residui e «sforato» in euro; data di subentro =
// giorno dopo la cessazione (automatica), avviso e «Allinea» per i dati di prima. Confronto con la ver155 in /uso155/. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso', PNG = process.env.USO_PNG || '';
const Z = () => Array(12).fill(0);
const mdA = [20, 20, 20, 20, 20, 0, 0, 0, 0, 0, 0, 0];
function kv(o) { o = o || {}; const vinc = o.vinc !== false;
  const B = Object.assign({ nome: 'BETA PROVA', voce: 'EDUCATORE', oreT: 0, eur: 0, aOre: [0] }, o.B || {});
  const pers = [L.pers(1, Object.assign({ nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 200, eur: 10, cofin: 400, aOre: [200], eurA: [15], cessato: '2026-05-31', cessTipo: 'sub', md: [mdA] }, o.A || {})), L.pers(1, B)];
  if (o.C) pers.push(L.pers(1, o.C));
  return { 'usoint-idx': [{ id: 'pv', title: 'SUB PROVA', start: '2026-01-01', end: '2026-12-31', vincolo: vinc }], 'usoint-p-pv': L.prog('pv', 'SUB PROVA', '2026-01-01', '2026-12-31', 1, { vincolo: vinc, personnel: pers }) };
}
async function apri(app, k) {
  const { ctx } = await L.contesto({ kv: k, dsf: PNG ? 2 : 1 }); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: 1500, height: 900 });
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await T.page.evaluate(() => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && /SUB PROVA/.test(d.innerText)); el[el.length - 1].click(); });
  await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO|Torna a budget/.test(document.body.innerText), null, { timeout: 15000 }); await L.aspetta(T, 300); return { ctx, T };
}
const tx = T => T.page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
const previsto = async T => ((await tx(T)).match(/Quota Committente (€ [\d.,]+) €/) || [])[1];
const box = T => T.page.locator('div:has(> div:has-text("Riassegnazione residui di operatori cessati"))').last();
const salva = async T => { await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300); return JSON.parse(await L.ls(T, 'usoint-p-pv')).personnel; };
const trasf = async T => { T.risposte.push({ re: /Trasferire/ }, { re: /subentra/ }); await T.page.locator('button', { hasText: /^Trasferisci/ }).first().click(); await L.aspetta(T, 500); };
(async () => {
  // A2 — confronto
  { const { ctx, T } = await apri('uso155', kv()); await trasf(T); const pv = await previsto(T);
    c('V00', 'ver155 (confronto): dopo il Trasferisci il Previsto 2026 scende', '€ 800,00', pv, pv === '€ 800,00'); await ctx.close(); }
  { const { ctx, T } = await apri(APP, kv()); const pv0 = await previsto(T);
    const t0 = (await box(T).innerText()).replace(/\s+/g, ' ');
    c('V01', 'Residuo del cessato in euro, ore come indicazione (500 € ÷ 15)', '€ 500,00 · 33,33', (t0.match(/Residuo: € [\d.,]+.*?ore non lavorate: [\d.,]+/) || [''])[0], /Residuo: € 500,00/.test(t0) && /ore non lavorate: 33,33/.test(t0));
    await trasf(T); const msg = T.dialoghi.map(d => d.msg).join(' | ');
    c('V02', 'Subentrante senza costo orario: riceve gli euro, le ore si vedranno col costo orario', 'riceve € 500,00 …', msg.slice(0, 160), /BETA PROVA riceve € 500,00: le ore si vedranno quando scrivi il suo costo orario/.test(msg));
    const pv1 = await previsto(T); const P = await salva(T);
    c('V03', 'A2: il Previsto 2026 non cambia col subentro', pv0 + ' → ' + pv0, pv0 + ' → ' + pv1, pv0 === '€ 1.600,00' && pv1 === pv0);
    c('V04', 'Chi cede tiene le sue ore di budget; il trasferimento è registrato in euro', 'A.aOre 200 · trasf € 500 eur', JSON.stringify(P[0].aOre) + ' · ' + JSON.stringify(P[0].trasf), P[0].aOre[0] === 200 && P[0].trasf.length === 1 && P[0].trasf[0].imp === 500 && P[0].trasf[0].eur === true);
    c('V05', 'Chi riceve ha 500 € (non 100 ore)', 'ricEur [500] · ricBlk 80% · aOre 0', JSON.stringify(P[1].ricEur) + ' · ' + JSON.stringify(P[1].ricBlk) + ' · ' + JSON.stringify(P[1].aOre), P[1].ricEur[0] === 500 && P[1].ricBlk[0].Iorig === 80 && P[1].aOre[0] === 0);
    const t1 = (await box(T).innerText()).replace(/\s+/g, ' ');
    c('V06', 'Dopo il Trasferisci il residuo è sbiadito con l\'importo', '✓ Trasferito € 500,00 a BETA PROVA', (t1.match(/✓ Trasferito[^)]*?(?=Residuo|$)/) || [''])[0].slice(0, 70), /✓ Trasferito € 500,00 a BETA PROVA/.test(t1));
    await ctx.close(); }
  // A3 — ore dalla tariffa della vista mesi; A4 — residuo in euro
  { const { ctx, T } = await apri(APP, kv({ B: { eurA: [15], md: [[0, 0, 0, 0, 0, 10, 10, 0, 0, 0, 0, 0]], subentro: '2026-06-01', subentroDi: 'ALFA PROVA' } })); await trasf(T);
    await T.page.locator('button', { hasText: /^2026$/ }).first().click(); await L.aspetta(T, 500);
    const r = await T.page.evaluate(() => { const tr = [...document.querySelectorAll('tr')].filter(x => /BETA PROVA/.test(x.innerText) && x.querySelector('td')); const t = tr[0]; const tds = [...t.querySelectorAll('td')].map(d => d.innerText.replace(/\s+/g, ' ')); return tds.slice(0, 6); });
    c('V07', 'A3: vista mesi del subentrante: Ore max = 500 € ÷ 15 € = 33,33; lavorate 20 h → nel budget', '33,33 · ✓ nel budget', JSON.stringify(r), r.some(x => /33,33/.test(x)) && r.some(x => /nel budget/.test(x)));
    await T.page.locator('button', { hasText: /Torna a budget|BUDGET/ }).first().click().catch(() => {}); await L.aspetta(T, 300);
    const t = await tx(T); const resE = (t.match(/BETA PROVA[\s\S]{0,40}/) || [''])[0];
    const P = await salva(T); const m = require('./audit-formule/motore.cjs'); const cy = m.calcCY('2026-01-01', '2026-12-31'); const yb = m.cP(P[1], cy, true, null).yrs[0];
    c('V08', 'A4: residuo del subentrante in euro = 500 − 300 spesi = 200 € = 13,33 h a 15', '200 € · 13,33 h', Math.round(yb.resE * 100) / 100 + ' € · ' + Math.round(yb.oR * 100) / 100 + ' h', Math.abs(yb.resE - 200) < 0.01 && Math.abs(yb.oR - 13.33) < 0.01);
    c('V09', 'Finanziato del subentrante = 80% dei 300 spesi', '240', Math.round(yb.fin * 100) / 100, Math.abs(yb.fin - 240) < 0.01);
    await ctx.close(); }
  { const m = require('./audit-formule/motore.cjs'); const cy = m.calcCY('2026-01-01', '2026-12-31');
    const y = m.cP({ nome: 'X', oreT: 200, eur: 10, cofin: 0, aOre: [200], aElim: [0], eurA: [15], recBlk: [], md: [[15, 15, 15, 15, 15, 15, 15, 15, 15, 15, 0, 0]] }, cy, true, null).yrs[0];
    c('V10', 'A4: 200 h a 10 € di budget, fatte 150 h a 15 € (2.250 €) → SFORATO di 250 €', 'sforato · residuo −250 €', (y.ov ? 'sforato' : 'non sforato') + ' · ' + Math.round(y.resE), y.ov && Math.abs(y.resE + 250) < 0.01); }
  // libero
  { const { ctx, T } = await apri(APP, kv({ vinc: false, B: { eurA: [25] } })); const t0 = (await box(T).innerText()).replace(/\s+/g, ' ');
    c('V11', 'Libero: residuo totale 500 €, ore non lavorate 33,33 (a 15 €)', '€ 500,00 · 33,33', (t0.match(/Residuo totale progetto: € [\d.,]+.*?ore non lavorate: [\d.,]+/) || [''])[0], /Residuo totale progetto: € 500,00/.test(t0) && /ore non lavorate: 33,33/.test(t0));
    const pv0 = await previsto(T); await trasf(T); const msg = T.dialoghi.map(d => d.msg).join(' | '); const pv1 = await previsto(T); const P = await salva(T);
    c('V12', 'Libero: a 25 €/h il subentrante potrà lavorare 20 ore; ricEur 500; Previsto invariato', '20,00 ore · [500] · ' + pv0, (msg.match(/lavorare [\d.,]+ ore/) || [''])[0] + ' · ' + JSON.stringify(P[1].ricEur) + ' · ' + pv1, /lavorare 20,00 ore/.test(msg) && P[1].ricEur[0] === 500 && pv1 === pv0 && P[1].budgetRic === 0);
    await ctx.close(); }
  // A8 — data automatica, A7 — avviso e Allinea, cambio della cessazione
  { const { ctx, T } = await apri(APP, kv()); const b = box(T);
    const g = await b.evaluate(x => [...x.querySelectorAll('span')].filter(s => /giorno dopo la cessazione: lo mette l'app/.test(s.title)).map(s => s.innerText));
    c('V13', 'A8: la data di subentro è grigia e vale il giorno dopo la cessazione', '01/06/2026', JSON.stringify(g), g.length === 1 && g[0] === '01/06/2026');
    await b.locator('select').nth(1).selectOption({ label: 'BETA PROVA' }); T.risposte.push({ re: /subentra a/ });
    await b.locator('button', { hasText: 'Imposta subentro' }).click(); await L.aspetta(T, 300); const P = await salva(T);
    c('V14', '«Imposta subentro» scrive il giorno dopo la cessazione', '2026-06-01', P[1].subentro, P[1].subentro === '2026-06-01' && P[1].subentroDi === 'ALFA PROVA');
    await ctx.close(); }
  { const { ctx, T } = await apri(APP, kv({ B: { subentro: '2026-09-01', subentroDi: 'ALFA PROVA' } })); const t = (await box(T).innerText()).replace(/\s+/g, ' ');
    c('V15', 'A7: dati di prima con la data non allineata: avviso', '⚠ … (01/09/2026) non è il giorno dopo … (01/06/2026)', (t.match(/⚠ La data di subentro[^.]*\./) || [''])[0], /⚠ La data di subentro di BETA PROVA \(01\/09\/2026\) non è il giorno dopo la cessazione \(01\/06\/2026\)/.test(t));
    T.risposte.push({ re: /Portare la data/ }); await box(T).locator('button', { hasText: 'Allinea' }).click(); await L.aspetta(T, 300); const P = await salva(T);
    c('V16', '«Allinea» porta il subentro al giorno dopo la cessazione', '2026-06-01', P[1].subentro, P[1].subentro === '2026-06-01');
    T.risposte.push({ re: /già cessata/ }, { re: /Nuova data/, text: '30/06/2026' }, { re: /Che tipo di fine/, text: '2' }, { re: /Cessazione spostata/ });
    await T.page.locator('button', { hasText: /CESSAZ\. CON SUBENTRO|CESS\./ }).first().click(); await L.aspetta(T, 400); const P2 = await salva(T);
    c('V17', 'Spostando la cessazione al 30/06 il subentro segue (01/07)', '2026-06-30 · 2026-07-01', P2[0].cessato + ' · ' + P2[1].subentro, P2[0].cessato === '2026-06-30' && P2[1].subentro === '2026-07-01');
    await ctx.close(); }
  // proponiSubentro: a chi ha già una data non chiede
  { const { ctx, T } = await apri(APP, kv({ B: { subentro: '2026-06-01', subentroDi: 'ALFA PROVA' } })); const nd = T.dialoghi.length; await trasf(T);
    const dd = T.dialoghi.slice(nd).map(d => d.msg.slice(0, 25));
    c('V18', 'Trasferisci a chi è già subentrante: nessuna domanda sul subentro', 'solo «Trasferire»', JSON.stringify(dd), dd.length === 1 && /Trasferire/.test(dd[0])); await ctx.close(); }
  // non regressione: progetto senza trasferimenti né costo dell'anno diverso
  { const k = kv({ A: { cessato: '', cessTipo: '', eurA: [0] }, B: { oreT: 50, eur: 20, cofin: 0, aOre: [50], md: [[5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]] } });
    const a = await apri('uso155', k), b = await apri(APP, k); const ta = await tx(a.T), tb = await tx(b.T);
    const pick = t => [(t.match(/RIEPILOGO PER ANNO.{0,400}/) || [''])[0], (t.match(/SALDO FINALE DA FATTURARE € [\d.,]+/) || [''])[0], (t.match(/QUADRO ANNO.{0,500}/) || [''])[0]].join(' | ');
    c('V19', 'Senza trasferimenti né tariffa dell\'anno diversa: riepilogo, saldo e quadro anno identici alla ver155', 'identici', pick(tb).slice(0, 120), pick(ta) === pick(tb));
    c('V20', 'Errori di pagina', '0', a.T.errori.length + b.T.errori.length, a.T.errori.length + b.T.errori.length === 0); await a.ctx.close(); await b.ctx.close(); }
  await L.chiudi(); L.fine('uso-ver156');
})();
