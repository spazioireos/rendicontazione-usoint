// uso-ver148 — vista MESI: il nome di chi è cessato si barra solo negli anni interamente dopo la cessazione; nell'anno della
// cessazione resta normale con «CESS. gg/mm». Confronto con la ver147 congelata in /uso147/. USO_PNG=cartella salva l'anteprima.
// SOLO DATI INVENTATI.   NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-ver148.cjs
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const nY = 3, h = () => [Array(12).fill(10), Array(12).fill(10), Array(12).fill(10)];
const p = L.prog('pv', 'CESS ANNI', '2025-01-01', '2027-12-31', nY, {
  personnel: [L.pers(nY, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 900, eur: 20, cessato: '2026-06-15', md: h() }),
    L.pers(nY, { nome: 'BETA PROVA', voce: 'EDUCATORE', oreT: 900, eur: 20, cessato: '2025-03-10', md: h() }),
    L.pers(nY, { nome: 'GAMMA PROVA', voce: 'EDUCATORE', oreT: 900, eur: 20, md: h() })] });
const KV = { 'usoint-idx': [{ id: 'pv', title: 'CESS ANNI', start: '2025-01-01', end: '2027-12-31', vincolo: false }], 'usoint-p-pv': p };
async function etichetta(T, nome) {
  return T.page.evaluate(nome => {
    const td = [...document.querySelectorAll('tr')].map(r => r.cells[0]).find(td => td && td.querySelector('span') && td.querySelector('span').innerText === nome);
    if (!td) return null;
    const sp = td.querySelector('span');
    return { barrato: getComputedStyle(sp).textDecorationLine === 'line-through', testo: td.innerText.replace(/\s+/g, ' ').trim(), fondo: getComputedStyle(td).backgroundColor };
  }, nome);
}
async function celle(T, nome) {
  return T.page.evaluate(nome => { const tr = [...document.querySelectorAll('tr')].find(r => r.cells[0] && r.cells[0].querySelector('span') && r.cells[0].querySelector('span').innerText === nome); if (!tr) return -1; return [...tr.cells].filter(td => /cessat[oa] il/.test(td.getAttribute('title') || '')).length; }, nome);
}
async function vista(app, anno, cb, dsf) {
  const { ctx } = await L.contesto({ kv: KV, dsf });
  const T = await L.pagina(ctx);
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await L.apriProgetto(T, 'CESS ANNI'); await L.aspetta(T, 500);
  await T.page.locator(`button[title="Apri i mesi del ${anno}"]`).click(); await L.aspetta(T, 600);
  const r = await cb(T); const e = T.errori.length; await ctx.close(); return Object.assign(r, { e });
}
(async () => {
  const v147 = await vista('uso147', 2026, async T => ({ a: await etichetta(T, 'ALFA PROVA') }));
  c('W00', 'ver147 (confronto): 2026, ALFA cessata il 15/06/2026', 'nome barrato anche se ha lavorato gen-giu', JSON.stringify(v147.a), v147.a && v147.a.barrato);
  const v25 = await vista('uso', 2025, async T => ({ a: await etichetta(T, 'ALFA PROVA'), b: await etichetta(T, 'BETA PROVA'), cb: await celle(T, 'BETA PROVA') }));
  c('W01', '2025 (prima della cessazione di ALFA): nome normale, nessuna etichetta', 'non barrato, senza «CESS.»', JSON.stringify(v25.a), v25.a && !v25.a.barrato && !/CESS/.test(v25.a.testo));
  c('W02', '2025 (anno della cessazione di BETA, 10/03): nome normale e «CESS. 10/03»', 'non barrato · «CESS. 10/03»', JSON.stringify(v25.b), v25.b && !v25.b.barrato && /CESS\. 10\/03/.test(v25.b.testo));
  c('W03', '2025 · BETA: celle bloccate da aprile (invariato)', '9 celle «cessato il»', v25.cb, v25.cb === 9);
  const v26 = await vista('uso', 2026, async T => ({ a: await etichetta(T, 'ALFA PROVA'), b: await etichetta(T, 'BETA PROVA'), g: await etichetta(T, 'GAMMA PROVA'), ca: await celle(T, 'ALFA PROVA'), cb: await celle(T, 'BETA PROVA') }));
  c('W04', '2026 (anno della cessazione di ALFA, 15/06): nome normale e «CESS. 15/06»', 'non barrato · «CESS. 15/06» · fondo bianco', JSON.stringify(v26.a), v26.a && !v26.a.barrato && /CESS\. 15\/06/.test(v26.a.testo) && !/241, 245, 249/.test(v26.a.fondo));
  c('W05', '2026 · ALFA: celle bloccate da luglio (invariato)', '6 celle «cessato il»', v26.ca, v26.ca === 6);
  c('W06', '2026 (anno dopo la cessazione di BETA): barrato con «CESS.» e fondo grigio come prima', 'barrato · «CESS.» · fondo grigio', JSON.stringify(v26.b), v26.b && v26.b.barrato && /CESS\./.test(v26.b.testo) && /241, 245, 249/.test(v26.b.fondo));
  c('W07', '2026 · BETA: tutte le celle bloccate (invariato)', '12', v26.cb, v26.cb === 12);
  c('W08', 'GAMMA (mai cessata): come prima', 'non barrato, senza «CESS.»', JSON.stringify(v26.g), v26.g && !v26.g.barrato && !/CESS/.test(v26.g.testo));
  const v27 = await vista('uso', 2027, async T => ({ a: await etichetta(T, 'ALFA PROVA') }));
  c('W09', '2027 (anno dopo la cessazione di ALFA): barrato con «CESS.»', 'barrato', JSON.stringify(v27.a), v27.a && v27.a.barrato && /CESS\./.test(v27.a.testo));
  c('W10', 'Errori di pagina', '0', [v25.e, v26.e, v27.e].join(','), v25.e + v26.e + v27.e === 0);
  if (process.env.USO_PNG) {
    await vista('uso', 2026, async T => { const t = await T.page.evaluate(() => { const tb = [...document.querySelectorAll('table')].find(t => /ALFA PROVA/.test(t.innerText)); tb.setAttribute('data-ant', '1'); return 1; }); await T.page.locator('table[data-ant]').screenshot({ path: process.env.USO_PNG + '/Anteprima cessazione mesi - 27nov26 - ver148.png' }); return {}; }, 2);
  }
  await L.chiudi(); L.fine('uso-ver148');
})();
