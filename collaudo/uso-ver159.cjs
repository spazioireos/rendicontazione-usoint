// uso-ver159 (28/11/2026, Christian: «voglio un sistema uniforme» → «1 sì, 2 libero, 3 LOMB, 4b, 5 sì, 6 sì»): conversione dei passaggi di ore
// fatti col sistema vecchio, allarme «sforato» che ignora gli scarti sotto 1 €, date lette nel fuso locale. Confronto con la ver158 in /uso158/. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso';
const N = 3;
function kvPass() {
  const pers = [
    L.pers(N, { nome: 'ALFA PROVA', voce: 'ESPERTO (SPORT)', oreT: 100, eur: 20, cofin: 200, aOre: [30, 0, 0], eurA: [20, 0, 0], cessato: '2024-12-31', md: [[0, 0, 0, 0, 0, 0, 0, 0, 0, 10, 10, 10], Array(12).fill(0), Array(12).fill(0)] }),
    L.pers(N, { nome: 'BETA PROVA', voce: 'ESPERTO (SPORT)', oreT: 0, eur: 0, cofin: 0, aOre: [70, 0, 0], eurA: [0, 25, 0], subentro: '2025-01-01', ricevute: 70, budgetRic: 1400, recBlk: [{ ore: 70, Iorig: 90 }], md: [Array(12).fill(0), [10, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0], Array(12).fill(0)] }),
    L.pers(N, { nome: 'GAMMA PROVA', voce: 'ESPERTO (ARTE)', oreT: 0, eur: 0, cofin: 0, aOre: [0, 0, 0], eurA: [0, 20, 0], subentro: '2025-03-01', ricevute: 20, budgetRic: 400, recBlk: [{ ore: 20, Iorig: 100 }] })];
  return { 'usoint-idx': [{ id: 'pp', title: 'PASSAGGI PROVA', start: '2024-06-01', end: '2026-05-31', vincolo: false }], 'usoint-p-pp': L.prog('pp', 'PASSAGGI PROVA', '2024-06-01', '2026-05-31', N, { personnel: pers, beni: [L.bene(N)] }) };
}
async function apri(app, kv, titolo, opz) { const { ctx } = await L.contesto(Object.assign({ kv }, opz || {})); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: 1500, height: 900 });
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await T.page.evaluate(t => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && d.innerText.includes(t)); el[el.length - 1].click(); }, titolo);
  await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO|Torna a budget/.test(document.body.innerText), null, { timeout: 15000 }); await L.aspetta(T, 500); return { ctx, T }; }
const testo = T => T.page.evaluate(() => document.body.innerText);
const riep = T => T.page.evaluate(() => { const tr = [...document.querySelectorAll('tr')].find(x => x.cells && x.cells[0] && /^Personale$/.test(x.cells[0].innerText.trim())); return tr ? [...tr.cells].map(x => x.innerText.trim()).join(' | ') : null; });
const P = async T => JSON.parse(await L.ls(T, 'usoint-p-pp'));
(async () => {
  { const { ctx, T } = await apri('uso158', kvPass(), 'PASSAGGI PROVA'); const t = await testo(T);
    c('V00', 'ver158 (confronto): nessun riquadro dei passaggi vecchi', 'assente', /Passaggi di ore fatti col sistema vecchio/.test(t), !/Passaggi di ore fatti col sistema vecchio/.test(t)); await ctx.close(); }
  const { ctx, T } = await apri(APP, kvPass(), 'PASSAGGI PROVA');
  let t = await testo(T);
  c('V01', 'Riquadro: da convertire ALFA → BETA 70 h = € 1.400,00', 'riga presente', (t.match(/ALFA PROVA → BETA PROVA[^\n]*/) || [''])[0], /ALFA PROVA → BETA PROVA: 70,00 h = € 1\.400,00/.test(t));
  c('V02', 'Riquadro: GAMMA da sistemare a mano, col motivo', 'riga presente', (t.match(/GAMMA PROVA: [^\n]*/) || [''])[0], /Da sistemare a mano/.test(t) && /GAMMA PROVA: nel budget della riga non ci sono le ore ricevute/.test(t));
  const r0 = await riep(T), d0 = await L.ls(T, 'usoint-p-pp');
  T.risposte.push({ re: /Convertire 1 passaggio/, dismiss: true }); await T.page.click('button:has-text("Converti nel sistema di oggi")'); await L.aspetta(T, 300);
  c('V03', 'Annulla: niente cambia (riquadro e dati)', 'uguale', (await testo(T)).includes('ALFA PROVA → BETA PROVA') + ' · ' + ((await L.ls(T, 'usoint-p-pp')) === d0), (await testo(T)).includes('ALFA PROVA → BETA PROVA') && (await L.ls(T, 'usoint-p-pp')) === d0);
  T.risposte.push({ re: /Convertire 1 passaggio/ }); await T.page.click('button:has-text("Converti nel sistema di oggi")'); await L.aspetta(T, 400);
  const dlg = T.dialoghi.filter(x => /Convertire 1 passaggio/.test(x.msg)).pop();
  c('V04', 'La domanda elenca il passaggio e dice che serve il 💾', 'ALFA → BETA · 💾', dlg ? dlg.msg.slice(0, 120) : 'nessuna', dlg && /• ALFA PROVA → BETA PROVA: 70,00 h = € 1\.400,00/.test(dlg.msg) && /Finché non premi 💾 Salva/.test(dlg.msg));
  t = await testo(T);
  c('V05', 'Dopo la conversione: resta solo GAMMA da sistemare a mano; dati non ancora scritti', 'senza riga · LS uguale', !/ALFA PROVA → BETA PROVA:/.test(t) + ' · ' + ((await L.ls(T, 'usoint-p-pp')) === d0), !/ALFA PROVA → BETA PROVA:/.test(t) && /GAMMA PROVA: nel budget/.test(t) && (await L.ls(T, 'usoint-p-pp')) === d0);
  const r1 = await riep(T); c('V06', 'Riepilogo per anno (Personale): ore, costi, finanziato identici', 'uguale', r1, r1 === r0);
  c('V07', 'Riassegnazione: «✓ Trasferito € 1.400,00 a BETA PROVA»', 'presente', (t.match(/✓ Trasferito € 1\.400,00 a BETA PROVA[^\n|]*/) || [''])[0], /✓ Trasferito € 1\.400,00 a BETA PROVA/.test(t));
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 400); const d = await P(T);
  c('V08', 'Col 💾: ALFA ritrova 100 h e cede € 1.400 in euro; BETA riceve € 1.400 al 90%', 'aOre 100 · trasf eur · ricEur 1400 · ricBlk 90%', JSON.stringify({ a: d.personnel[0].aOre, t: d.personnel[0].trasf, re: d.personnel[1].ricEur, rb: d.personnel[1].ricBlk, ao: d.personnel[1].aOre, rec: d.personnel[1].recBlk, sd: d.personnel[1].subentroDi }),
    d.personnel[0].aOre[0] === 100 && d.personnel[0].trasf.length === 1 && d.personnel[0].trasf[0].eur === true && d.personnel[0].trasf[0].imp === 1400 && d.personnel[1].ricEur[0] === 1400 && d.personnel[1].ricBlk[0].imp === 1400 && d.personnel[1].ricBlk[0].Iorig === 90 && d.personnel[1].aOre[0] === 0 && d.personnel[1].recBlk.length === 0 && d.personnel[1].subentroDi === 'ALFA PROVA' && d.personnel[2].recBlk.length === 1);
  await T.page.reload(); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await T.page.evaluate(() => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && d.innerText.includes('PASSAGGI PROVA')); el[el.length - 1].click(); }); await L.aspetta(T, 700);
  t = await testo(T); c('V09', 'Ricaricando: nessun passaggio da convertire, GAMMA resta da sistemare', 'solo GAMMA', !/Da convertire/.test(t) + ' · ' + /GAMMA PROVA: nel budget/.test(t), !/Da convertire/.test(t) && /GAMMA PROVA: nel budget/.test(t));
  c('V10', 'Riepilogo per anno ancora identico dopo il ricaricamento', 'uguale', await riep(T), (await riep(T)) === r0);
  c('V11', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0); await ctx.close();
  // 4b: l'allarme ignora gli scarti sotto 1 €
  const kvS = (h, eur, tar) => Object.assign({ 'usoint-idx': [{ id: 'ps', title: 'SOGLIA PROVA', start: '2026-01-01', end: '2026-12-31', vincolo: true }], 'usoint-p-ps': L.prog('ps', 'SOGLIA PROVA', '2026-01-01', '2026-12-31', 1, { vincolo: true, personnel: [L.pers(1, { nome: 'DELTA PROVA', voce: 'EDUCATORE', oreT: 46.5, eur: eur, cofin: 0, aOre: [46.5], md: [[0, 0, 0, 0, 0, 0, h, 0, 0, 0, 0, 0]] })], beni: [L.bene(1)] }) }, tar ? { 'usoint-tariffe': tar } : {});
  for (const [id, app, k, att, desc] of [['V12', 'uso158', kvS(46.5, 22.98, { 'delta prova': { 2026: 22.99 } }), true, 'ver158 (confronto): 0,47 € in più → ⛔'], ['V13', APP, kvS(46.5, 22.98, { 'delta prova': { 2026: 22.99 } }), false, '0,47 € in più (Tariffario 22,99 contro 22,98): niente ⛔'], ['V14', APP, kvS(46.6, 20, null), true, '2,00 € in più: ⛔']]) {
    const { ctx: cx, T: T2 } = await apri(app, k, 'SOGLIA PROVA'); const s = await testo(T2); c(id, desc, att ? '⛔' : 'niente ⛔', s.includes('⛔'), s.includes('⛔') === att); await cx.close(); }
  // 5: fuso orario (New York): un lavoro da maggio non deve aprire aprile
  const kvF = { 'usoint-idx': [{ id: 'pf', title: 'FUSO PROVA', start: '2024-05-01', end: '2025-04-30', vincolo: false }], 'usoint-p-pf': L.prog('pf', 'FUSO PROVA', '2024-05-01', '2025-04-30', 2, { personnel: [L.pers(2, { nome: 'ZETA PROVA', voce: 'EDUCATORE', oreT: 100, eur: 20, aOre: [100, 0] })] }) };
  const mesiAperti = async (app, tz) => { const { ctx: cx, T: T2 } = await apri(app, kvF, 'FUSO PROVA', tz ? { tz } : {}); await T2.page.locator('button', { hasText: /^2024$/ }).first().click(); await L.aspetta(T2, 500);
    const n = await T2.page.evaluate(() => { const tr = [...document.querySelectorAll('tbody tr')].find(x => /ZETA PROVA/.test(x.innerText)); return tr ? [...tr.querySelectorAll('td')].filter(td => td.querySelector('input') && td.querySelector('input').offsetWidth >= 50 && td.querySelector('input').offsetWidth <= 62).length : -1; }); await cx.close(); return n; };
  const nRoma = await mesiAperti(APP, 'Europe/Rome'), nNY = await mesiAperti(APP, 'America/New_York'), nNY8 = await mesiAperti('uso158', 'America/New_York');
  c('V15', 'Fuso di New York: mesi compilabili del 2024 uguali a Roma (MAG-DIC = 8); la ver158 apriva anche aprile', 'Roma 8 · NY 8 · ver158 NY 9', `Roma ${nRoma} · NY ${nNY} · ver158 NY ${nNY8}`, nRoma === 8 && nNY === 8 && nNY8 === 9);
  await L.chiudi(); L.fine('uso-ver159');
})();
