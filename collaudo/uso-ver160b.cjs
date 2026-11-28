// uso-ver160b (28/11/2026): la stessa persona cessata su due voci, con due subentranti dallo stesso giorno: nel riquadro Riassegnazione ognuna
// trova il subentrante della SUA voce (prima entrambe prendevano il primo). Confronto con la ver159 in /uso159/. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso';
const kv = () => ({ 'usoint-idx': [{ id: 'pv', title: 'VOCI PROVA', start: '2026-01-01', end: '2026-12-31', vincolo: false }], 'usoint-p-pv': L.prog('pv', 'VOCI PROVA', '2026-01-01', '2026-12-31', 1, { personnel: [
  L.pers(1, { nome: 'ALFA PROVA', voce: 'ESPERTO (SPORT)', oreT: 50, eur: 20, aOre: [50], cessato: '2026-05-31', cessTipo: 'sub' }),
  L.pers(1, { nome: 'BETA PROVA', voce: 'ESPERTO (SPORT)', oreT: 0, eur: 0, eurA: [22], subentro: '2026-06-01' }),
  L.pers(1, { nome: 'ALFA PROVA', voce: 'ESPERTO (ARTE)', oreT: 30, eur: 20, aOre: [30], cessato: '2026-05-31', cessTipo: 'sub' }),
  L.pers(1, { nome: 'GAMMA PROVA', voce: 'ESPERTO (ARTE)', oreT: 0, eur: 0, eurA: [22], subentro: '2026-06-01' })], beni: [L.bene(1)] }) });
const ora = T => T.page.evaluate(() => (document.body.innerText.match(/ora: [A-Z ]+ dal/g) || []));
(async () => {
  for (const [id, app, att] of [['B00', 'uso159', ['ora: BETA PROVA dal', 'ora: BETA PROVA dal']], ['B01', APP, ['ora: BETA PROVA dal', 'ora: GAMMA PROVA dal']]]) {
    const { ctx } = await L.contesto({ kv: kv() }); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: 1500, height: 900 });
    await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
    await T.page.evaluate(() => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && d.innerText.includes('VOCI PROVA')); el[el.length - 1].click(); }); await L.aspetta(T, 800);
    const o = await ora(T); c(id, app === APP ? 'ALFA (SPORT) → BETA, ALFA (ARTE) → GAMMA' : 'ver159 (confronto): tutte e due le righe di ALFA prendono BETA', JSON.stringify(att), JSON.stringify(o), JSON.stringify(o) === JSON.stringify(att));
    if (app === APP) c('B02', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0); await ctx.close(); }
  await L.chiudi(); L.fine('uso-ver160b');
})();
