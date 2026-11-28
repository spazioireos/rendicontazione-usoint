// uso-ver161 (28/11/2026, Christian: «scatti!»): nel lavoro vincolato l'allarme «sforato» (⛔) scatta anche quando si spende in un anno
// senza budget. Confronto con la ver160 in /uso160/. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso';
const kv = (vin, mdP, mdB, p0, b0) => ({ 'usoint-idx': [{ id: 'pv', title: 'VINCOLO PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: vin }], 'usoint-p-pv': L.prog('pv', 'VINCOLO PROVA', '2026-01-01', '2027-12-31', 2, { vincolo: vin,
  personnel: [L.pers(2, { nome: 'ALFA PROVA', voce: 'REFERENTE', oreT: 100, eur: 20, cofin: 0, aOre: [100, 0], aAuto: false, md: [p0 || [50, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], mdP] })],
  beni: [L.bene(2, { voce: 'MATERIALI PROVA', forf: 500, cofin: 0, aImp: [500, 0], aAuto: false, md: [b0 || [500, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], mdB] })] }) });
async function apri(app, k) { const { ctx } = await L.contesto({ kv: k }); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: 1500, height: 900 });
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await T.page.evaluate(() => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && d.innerText.includes('VINCOLO PROVA')); el[el.length - 1].click(); }); await L.aspetta(T, 800);
  await T.page.locator('button', { hasText: /^2027$/ }).first().click(); await L.aspetta(T, 600); return { ctx, T }; }
const conta = T => T.page.evaluate(() => [...document.querySelectorAll('span')].filter(s => /^⛔ \+/.test(s.innerText.trim())).map(s => s.innerText.trim()));
const spesa = [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], zero = Array(12).fill(0), spB = [40, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
(async () => {
  const casi = [
    ['S00', 'uso160', kv(true, spesa, spB), 0, 'ver160 (confronto): vincolato, spesa nel 2027 senza budget → nessun ⛔'],
    ['S01', APP, kv(true, spesa, spB), 2, 'Vincolato, 2026 speso tutto (100 h, € 500), 2027 senza budget: 5 h di ALFA e € 40 di materiali → ⛔ su tutte e due le righe'],
    ['S02', APP, kv(false, spesa, spB), 0, 'Libero, stessa spesa: nessun ⛔ (il budget si sposta fra gli anni)'],
    ['S03', APP, kv(true, zero, zero), 0, 'Vincolato, 2027 senza budget e senza spesa: nessun ⛔'],
    ['S04', APP, kv(true, spesa, spB, [10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], [100, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]), 0, 'Vincolato, nel 2026 avanzano 80 h e € 400 che passano al 2027: la spesa del 2027 ci sta, nessun ⛔'] ];
  for (const [id, app, k, att, desc] of casi) { const { ctx, T } = await apri(app, k); const s = await conta(T);
    c(id, desc, att + ' ⛔', s.length + ' ' + JSON.stringify(s), s.length === att); if (id === 'S01') c('S01b', 'Gli importi del ⛔ sono la spesa oltre il disponibile', '⛔ +5,00 · ⛔ +€ 40,00', JSON.stringify(s), s.some(x => /5,00/.test(x)) && s.some(x => /40,00/.test(x)));
    if (app === APP) c(id + 'e', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0); await ctx.close(); }
  await L.chiudi(); L.fine('uso-ver161');
})();
