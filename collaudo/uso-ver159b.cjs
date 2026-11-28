// uso-ver159b (28/11/2026, Christian: «quando imposto il subentro in usoint, sbiadisci la cella, altrimenti sembra che io non abbia impostato»):
// nel riquadro Riassegnazione, subentro già impostato = tendina, «dal», data e pulsante sbiaditi. Confronto con la ver158 in /uso158/. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso';
const kv = () => ({ 'usoint-idx': [{ id: 'pq', title: 'SUBENTRO PROVA', start: '2026-01-01', end: '2026-12-31', vincolo: false }], 'usoint-p-pq': L.prog('pq', 'SUBENTRO PROVA', '2026-01-01', '2026-12-31', 1, { personnel: [
  L.pers(1, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 100, eur: 20, aOre: [100], cessato: '2026-05-31', cessTipo: 'sub', md: [[10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0]] }),
  L.pers(1, { nome: 'BETA PROVA', voce: 'EDUCATORE', oreT: 0, eur: 0, eurA: [22], subentro: '2026-06-01', subentroDi: 'ALFA PROVA' }),
  L.pers(1, { nome: 'GAMMA PROVA', voce: 'EDUCATORE', oreT: 50, eur: 20, aOre: [50] })], beni: [L.bene(1)] }) });
const op = T => T.page.evaluate(() => { const s = [...document.querySelectorAll('select')].find(x => [...x.options].some(o => /— nessuno —/.test(o.text))); if (!s) return null; const sp = s.nextElementSibling, b = [...s.parentElement.querySelectorAll('button')].find(x => /Imposta subentro/.test(x.innerText));
  return { sel: getComputedStyle(s).opacity, dal: getComputedStyle(sp).opacity, btn: b ? getComputedStyle(b).opacity : null }; });
async function apri(app) { const { ctx } = await L.contesto({ kv: kv() }); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: 1500, height: 900 });
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await T.page.evaluate(() => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && d.innerText.includes('SUBENTRO PROVA')); el[el.length - 1].click(); }); await L.aspetta(T, 700); return { ctx, T }; }
(async () => {
  { const { ctx, T } = await apri('uso158'); const o = await op(T); c('S00', 'ver158 (confronto): subentro impostato ma tendina a piena intensità', 'opacità 1', JSON.stringify(o), o && o.sel === '1'); await ctx.close(); }
  const { ctx, T } = await apri(APP);
  let o = await op(T); c('S01', 'Subentro impostato: tendina, «dal» e pulsante sbiaditi', 'opacità 0.45', JSON.stringify(o), o && o.sel === '0.45' && o.dal === '0.45' && o.btn === '0.45');
  const t = await T.page.evaluate(() => document.body.innerText); c('S02', 'Resta leggibile «ora: BETA PROVA dal 01/06/2026»', 'presente', (t.match(/ora: BETA PROVA dal [^\s]+/) || [''])[0], /ora: BETA PROVA dal 01\/06\/2026/.test(t));
  const s = T.page.locator('select', { has: T.page.locator('option', { hasText: '— nessuno —' }) }).first();
  await s.selectOption({ label: 'GAMMA PROVA' }); await L.aspetta(T, 200); o = await op(T);
  c('S03', 'Scegliendo un altro nome (non ancora impostato) torna a piena intensità', 'opacità 1', JSON.stringify(o), o.sel === '1' && o.btn === '1');
  await s.selectOption({ label: 'BETA PROVA' }); await L.aspetta(T, 200); o = await op(T);
  c('S04', 'Tornando al subentrante impostato, di nuovo sbiadito', 'opacità 0.45', JSON.stringify(o), o.sel === '0.45');
  c('S05', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0); await ctx.close();
  await L.chiudi(); L.fine('uso-ver159b');
})();
