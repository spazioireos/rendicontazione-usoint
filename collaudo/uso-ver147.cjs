// uso-ver147 — vista MESI di un anno: le colonne dei mesi dei beni/servizi stanno esattamente sotto quelle del personale.
// Confronto con la ver146 congelata in /uso146/ (localizza.py su `git show <ver146>:index.html`). SOLO DATI INVENTATI.
//   NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-ver147.cjs
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const nY = 1; const md = (v) => [v.concat(Array(12 - v.length).fill(0))];
const p = L.prog('pm', 'MESI PROVA', '2026-01-01', '2026-12-31', nY, {
  personnel: [L.pers(nY, { nome: 'ALFA PROVA', voce: 'EDUCATORE', inq: 'DIP', oreT: 100, eur: 23.53, md: md([6, 6, 7.5, 7.5]) }), L.pers(nY, { nome: 'BETA PROVA', voce: 'COORD', inq: 'COLL', oreT: 100, eur: 25.64, md: md([2, 2, 3, 10]) })],
  beni: [L.bene(nY, { voce: 'MATERIALE', forf: 5000, md: md([1969.47, 0, 40.9, 1056.86]) }), L.bene(nY, { voce: 'AFFITTO', forf: 8000, md: md([530, 0, 500, 4648]) })] });
const p2 = L.prog('pq', 'MESI DA APRILE', '2026-04-01', '2026-12-31', nY, { personnel: [L.pers(nY, { nome: 'ALFA PROVA', oreT: 10, eur: 20 })], beni: [L.bene(nY, { voce: 'MATERIALE', forf: 100 })] });
async function colonne(app, W, titolo) {
  const { ctx } = await L.contesto({ kv: { 'usoint-idx': [{ id: 'pm', title: 'MESI PROVA', start: '2026-01-01', end: '2026-12-31' }, { id: 'pq', title: 'MESI DA APRILE', start: '2026-04-01', end: '2026-12-31' }], 'usoint-p-pm': p, 'usoint-p-pq': p2 }, viewport: { width: W, height: 900 } });
  const T = await L.pagina(ctx);
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await T.page.locator('div[style*="cursor: pointer"]', { hasText: titolo }).last().click(); await L.aspetta(T, 800);
  await T.page.locator('button[title="Apri i mesi del 2026"]').click(); await L.aspetta(T, 800);
  const r = await T.page.evaluate(() => [...document.querySelectorAll('table')].filter(t => /GEN|APR/.test(t.innerText) && /Alloc/.test(t.innerText)).map(t => {
    const o = {}; t.querySelector('tr').querySelectorAll('th').forEach(h => { const k = h.innerText.trim().replace(/^€ /, ''); if (/^(GEN|FEB|MAR|APR|MAG|GIU|LUG|AGO|SET|OTT|NOV|DIC|Stato)$/.test(k)) { const b = h.getBoundingClientRect(); o[k] = Math.round(b.left) + '+' + Math.round(b.width); } }); return o; }));
  const lato = await T.page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  const e = T.errori.length; await ctx.close(); return { r, lato, e };
}
(async () => {
  const v = await colonne('uso146', 1700, 'MESI PROVA');
  c('V00', 'ver146 (confronto): colonne dei mesi spostate', 'GEN dei beni ≠ GEN del personale', JSON.stringify([v.r[0].GEN, v.r[1].GEN]), v.r[0].GEN !== v.r[1].GEN);
  for (const W of [390, 1280, 1700, 2400]) {
    const n = await colonne('uso', W, 'MESI PROVA');
    const ok = Object.keys(n.r[0]).every(k => n.r[0][k] === n.r[1][k]);
    c('V01.' + W, 'larghezza ' + W + 'px: mesi e «Stato» allineati', '13 colonne nella stessa posizione', JSON.stringify(n.r[1]).slice(0, 120), ok && Object.keys(n.r[0]).length === 13);
    c('V02.' + W, 'larghezza ' + W + 'px: pagina senza scorrimento laterale, zero errori', 'no · 0', (n.lato ? 'sì' : 'no') + ' · ' + n.e, !n.lato && n.e === 0);
  }
  const q = await colonne('uso', 1700, 'MESI DA APRILE');
  const okq = Object.keys(q.r[0]).every(k => q.r[0][k] === q.r[1][k]);
  c('V03', 'progetto che parte ad aprile (GEN-MAR fuori periodo)', 'colonne allineate', JSON.stringify(q.r[1]).slice(0, 120), okq && Object.keys(q.r[0]).length === 13);
  await L.chiudi(); L.fine('uso-ver147');
})();
