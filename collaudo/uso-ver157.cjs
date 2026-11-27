// uso-ver157 — audit A5 A6 (Christian, 27/11/2026: «il cambio vale dal mese (più semplice)», «il Tariffario non tocca più i mesi già
// lavorati prima del cambio»): il costo orario si cambia DAL MESE (anche negli anni dopo, finché non se ne scrive un altro); il Tariffario
// chiede da quale mese vale. Confronto con la ver156 in /uso156/. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso', PNG = process.env.USO_PNG || '';
const venti = () => Array(12).fill(20);
function kv() { const pers = [L.pers(2, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 480, eur: 10, cofin: 960, aOre: [240, 240], md: [venti(), venti()] })];
  return { 'usoint-idx': [{ id: 'pd', title: 'DAL PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: true }], 'usoint-p-pd': L.prog('pd', 'DAL PROVA', '2026-01-01', '2027-12-31', 2, { vincolo: true, personnel: pers }) }; }
async function apri(app, k, tar) { k = Object.assign({}, k); if (tar) k['usoint-tariffe'] = tar;
  const { ctx } = await L.contesto({ kv: k, dsf: PNG ? 2 : 1 }); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: 1500, height: 900 });
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  return { ctx, T }; }
async function progetto(T) { await T.page.evaluate(() => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && /DAL PROVA/.test(d.innerText)); el[el.length - 1].click(); });
  await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO|Torna a budget/.test(document.body.innerText), null, { timeout: 15000 }); await L.aspetta(T, 300); }
async function anno(T, y) { await T.page.locator('button', { hasText: new RegExp('^' + y + '$') }).first().click(); await L.aspetta(T, 500); }
/* celle dei mesi di ALFA nella vista mesi: il costo (€) sotto le ore */
const costi = T => T.page.evaluate(() => { const tr = [...document.querySelectorAll('tr')].find(x => /ALFA PROVA/.test(x.innerText) && x.querySelector('td')); const tds = [...tr.querySelectorAll('td')]; return tds.slice(6, 18).map(td => ((td.innerText.match(/€\s?[\d.]+,\d\d/) || [''])[0]).replace(/\s/g, ' ')); });
const ricTot = async T => { const t = (await T.page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '))); return (t.match(/RIEPILOGO PER ANNO.*?Personale ([\d.,]+) (€ [\d.,]+)/) || [])[2]; };
const salva = async T => { await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300); return JSON.parse(await L.ls(T, 'usoint-p-pd')).personnel; };
(async () => {
  // confronto ver156: Tariffario 2026 = 18 vale su tutti i mesi
  { const { ctx, T } = await apri('uso156', kv(), { 'alfa prova': { 2026: 18 } }); await progetto(T); await anno(T, 2026); const k = await costi(T);
    c('W00', 'ver156 (confronto): il Tariffario 2026 = 18 vale su tutti i mesi già lavorati (riepilogo 12×360), mentre la cella del mese diceva ancora € 200,00', '€ 4.320,00 · GEN € 200,00', (await ricTot(T)) + ' · GEN ' + k[0], (await ricTot(T)) === '€ 4.320,00' && k[0] === '€ 200,00'); await ctx.close(); }
  // cambio dal mese nella vista mesi
  { const { ctx, T } = await apri(APP, kv()); await progetto(T); await anno(T, 2026);
    let k = await costi(T); c('W01', 'Senza cambi: 20 h × 10 € = € 200,00 in ogni mese', '€ 200,00 × 12', JSON.stringify([k[0], k[11]]), k.every(x => x === '€ 200,00'));
    T.risposte.push({ re: /Nuovo costo orario di ALFA PROVA/, text: '15' }, { re: /Da quale mese del 2026/, text: '7' });
    await T.page.locator('button', { hasText: '⇢ dal mese…' }).first().click(); await L.aspetta(T, 400);
    k = await costi(T); c('W02', 'Dal LUG 15 €/h: GEN-GIU € 200,00, LUG-DIC € 300,00', 'GIU 200 · LUG 300', k[5] + ' · ' + k[6], k.slice(0, 6).every(x => x === '€ 200,00') && k.slice(6).every(x => x === '€ 300,00'));
    const chip = await T.page.locator('div', { hasText: /^dal LUG € 15,00/ }).count();
    c('W03', 'Sotto il €/ora eff. compare «dal LUG € 15,00 ✕»', '1', chip, chip >= 1);
    c('W04', 'RIEPILOGO PER ANNO 2026: personale € 3.000,00 (6×200 + 6×300)', '€ 3.000,00', await ricTot(T), (await ricTot(T)) === '€ 3.000,00');
    let P = await salva(T); c('W05', 'Col 💾: eurDal [{yi 0, m 6, eur 15}], eurA invariato', 'eurDal LUG 15 · eurA [0,0]', JSON.stringify(P[0].eurDal) + ' · ' + JSON.stringify(P[0].eurA), JSON.stringify(P[0].eurDal) === '[{"yi":0,"m":6,"eur":15}]' && P[0].eurA.every(x => !x));
    if (PNG) await T.page.screenshot({ path: PNG + '/v157-mesi.png', clip: { x: 0, y: 80, width: 1500, height: 330 } });
    await anno(T, 2027); k = await costi(T);
    const g = await T.page.locator('span[title*="da un cambio «dal mese»"]').allInnerTexts();
    c('W06', '2027: il cambio continua (15 €/h): € 300,00 ogni mese, €/ora eff. grigio 15,00', '€ 300,00 · 15,00', k[0] + ' · ' + JSON.stringify(g), k.every(x => x === '€ 300,00') && g.length === 1 && g[0] === '15,00');
    // un costo dell'anno scritto (eurA) ferma il cambio
    await anno(T, 2026); T.risposte.push({ re: /Togliere il cambio del costo orario dal LUG 2026/ });
    await T.page.locator('div', { hasText: /^dal LUG € 15,00/ }).locator('span', { hasText: '✕' }).first().click(); await L.aspetta(T, 400);
    k = await costi(T); P = await salva(T);
    c('W07', '✕ chiede conferma e toglie il cambio: tutti i mesi a € 200,00', 'conferma · € 200,00 · eurDal []', T.dialoghi.some(d => /Togliere il cambio/.test(d.msg)) + ' · ' + k[8] + ' · ' + JSON.stringify(P[0].eurDal), T.dialoghi.some(d => /Togliere il cambio/.test(d.msg)) && k.every(x => x === '€ 200,00') && P[0].eurDal.length === 0);
    // doppio clic sulla cella grigia
    T.risposte.push({ re: /Nuovo costo orario/, text: '12,5' }, { re: /Da quale mese/, text: '10' });
    await T.page.locator('span[title*="Doppio clic per cambiarlo da un mese in poi"]').first().dblclick(); await L.aspetta(T, 400); k = await costi(T);
    c('W08', 'Doppio clic sul €/ora grigio: 12,50 dal OTT', 'SET 200 · OTT 250', k[8] + ' · ' + k[9], k[8] === '€ 200,00' && k[9] === '€ 250,00');
    // valori non validi
    const n0 = (await salva(T))[0].eurDal.length;
    T.risposte.push({ re: /Nuovo costo orario/, text: 'abc' }); await T.page.locator('button', { hasText: '⇢ dal mese…' }).first().click(); await L.aspetta(T, 200);
    T.risposte.push({ re: /Nuovo costo orario/, text: '9' }, { re: /Da quale mese/, text: '13' }); await T.page.locator('button', { hasText: '⇢ dal mese…' }).first().click(); await L.aspetta(T, 200);
    const n1 = (await salva(T))[0].eurDal.length; const al = T.dialoghi.filter(d => d.tipo === 'alert').map(d => d.msg);
    c('W09', 'Costo non valido o mese 13: avviso e niente cambia', '2 avvisi · cambi ' + n0, al.length + ' · ' + n1, al.length >= 2 && n1 === n0);
    c('W10', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0); await ctx.close(); }
  // Tariffario dal mese (A5)
  { const { ctx, T } = await apri(APP, kv());
    await T.page.click('button:has-text("📋 Tariffario costi orari")'); await L.aspetta(T, 400);
    T.risposte.push({ re: /Da quale mese del 2026 vale € 18,00 per ALFA PROVA/, text: '9' });
    const inp = T.page.locator('tr', { hasText: 'ALFA PROVA' }).locator('input').first(); await inp.click(); await inp.fill('18'); await inp.press('Tab'); await L.aspetta(T, 300);
    const t = await T.page.locator('tr', { hasText: 'ALFA PROVA' }).innerText();
    c('W11', 'Tariffario: chiede da quale mese; sotto la casella «dal SET»', 'dal SET', t.replace(/\s+/g, ' '), /dal SET/.test(t));
    if (PNG) await T.page.screenshot({ path: PNG + '/v157-tariffario.png', clip: { x: 0, y: 0, width: 1100, height: 260 } });
    await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
    const tar = JSON.parse(await L.ls(T, 'usoint-tariffe'));
    c('W12', 'Salvato come {eur 18, dal 8}', '{"2026":{"eur":18,"dal":8}}', JSON.stringify(tar['alfa prova']), JSON.stringify(tar['alfa prova']) === '{"2026":{"eur":18,"dal":8}}');
    await T.page.click('button:has-text("← Indietro")'); await L.aspetta(T, 300); await progetto(T); await anno(T, 2026);
    const k = await costi(T); const lock = await T.page.locator('span', { hasText: /🔒 € 18,00 dal SET/ }).count();
    c('W13', 'Nel progetto: GEN-AGO restano € 200,00, SET-DIC € 360,00; lucchetto «🔒 € 18,00 dal SET»', 'AGO 200 · SET 360 · 🔒', k[7] + ' · ' + k[8] + ' · ' + lock, k.slice(0, 8).every(x => x === '€ 200,00') && k.slice(8).every(x => x === '€ 360,00') && lock === 1);
    if (PNG) await T.page.screenshot({ path: PNG + '/v157-tariffario-mesi.png', clip: { x: 0, y: 80, width: 1500, height: 330 } });
    c('W14', 'RIEPILOGO 2026: 8×200 + 4×360 = € 3.040,00', '€ 3.040,00', await ricTot(T), (await ricTot(T)) === '€ 3.040,00');
    await anno(T, 2027); const k27 = await costi(T);
    c('W15', '2027: il Tariffario del 2026 non continua (vale solo per quell\'anno): € 200,00', '€ 200,00', k27[0], k27.every(x => x === '€ 200,00'));
    c('W16', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0); await ctx.close(); }
  // non regressione: Tariffario scritto prima (numero) vale tutto l'anno, come prima
  { const { ctx, T } = await apri(APP, kv(), { 'alfa prova': { 2026: 18 } }); await progetto(T); await anno(T, 2026); const k = await costi(T);
    c('W17', 'Tariffario di prima (numero): vale tutto l\'anno come nella ver156', '€ 360,00 × 12', k[0] + ' · ' + k[11], k.every(x => x === '€ 360,00')); await ctx.close(); }
  { const a = await apri('uso156', kv()), b = await apri(APP, kv()); await progetto(a.T); await progetto(b.T);
    const pick = async T => { const t = await T.page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ')); return [(t.match(/RIEPILOGO PER ANNO.{0,400}/) || [''])[0], (t.match(/SALDO FINALE DA FATTURARE € [\d.,]+/) || [''])[0]].join(' | '); };
    const x = await pick(a.T), y = await pick(b.T);
    c('W18', 'Senza cambi: riepilogo e saldo identici alla ver156', 'identici', y.slice(0, 110), x === y);
    await a.ctx.close(); await b.ctx.close(); }
  await L.chiudi(); L.fine('uso-ver157');
})();
