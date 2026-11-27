// uso-ver154 — CONSUNTIVO FINALE: il «Finanziato che ti spetta» e il «Saldo finale da fatturare» non superano mai la quota
// del Committente (Christian: «il finanziatore non mette mai più dell'impegnato»). Se lo speso supera il budget compare la riga
// che dice quanto resta a carico. Confronto con la ver153 in /uso153/. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso', PNG = process.env.USO_PNG || '';
const kv = (oreMese, fatt) => ({ 'usoint-idx': [{ id: 'pf', title: 'CONS PROVA', start: '2026-01-01', end: '2026-12-31', vincolo: false }],
  'usoint-p-pf': L.prog('pf', 'CONS PROVA', '2026-01-01', '2026-12-31', 1, { personnel: [L.pers(1, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 100, eur: 20, cofin: 400, aOre: [100], md: [Array(12).fill(0).map((x, i) => i < 10 ? oreMese : 0)] })],
    fatture: fatt ? [{ data: '2026-06-30', numero: '1', tipo: 'acconto', importo: fatt }] : [] }) });
async function leggi(app, k, shot) {
  const { ctx } = await L.contesto({ kv: k, dsf: PNG ? 2 : 1 }); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: 1400, height: 900 });
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await T.page.evaluate(() => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && /CONS PROVA/.test(d.innerText)); el[el.length - 1].click(); });
  await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO|Torna a budget/.test(document.body.innerText), null, { timeout: 15000 }); await L.aspetta(T, 300);
  const tx = await T.page.evaluate(() => document.body.innerText.replace(/\s+/g, ' '));
  const num = re => { const m = tx.match(re); return m ? m[1] : null; };
  const r = { saldo: num(/(?:SALDO FINALE DA FATTURARE|FATTURAZIONE ALLINEATA|HAI GIÀ FATTURATO IN PIÙ) (€ [\d.,]+)/), fin: num(/Finanziato che ti spetta (€ [\d.,]+)/), riga: (tx.match(/⚠ Lo speso supera il budget.*?insieme alla tua quota\./) || [''])[0], err: T.errori.length };
  if (PNG && shot) { const b = T.page.locator('div:has(> div:has-text("CONSUNTIVO FINALE"))').last(); await b.scrollIntoViewIfNeeded(); await b.screenshot({ path: PNG + '/Anteprima consuntivo - 27nov26 - ver154.png' }); }
  await ctx.close(); return r;
}
(async () => {
  // budget 100 h × 20 € = 2.000 €; cofin 400 (20%); Committente 1.600 €
  let a = await leggi('uso153', kv(15)), b = await leggi(APP, kv(15), true);
  c('C00', 'ver153 (confronto): speso 3.000 € > budget, il saldo supera la quota del Committente', '€ 2.600,00', a.saldo, a.saldo === '€ 2.600,00');
  c('C01', 'Speso 3.000 €: saldo e finanziato limitati alla quota del Committente', '€ 1.600,00 · € 1.600,00', b.saldo + ' · ' + b.fin, b.saldo === '€ 1.600,00' && b.fin === '€ 1.600,00');
  c('C02', 'Speso oltre il budget: la riga dice impegnato e parte a carico', '1.600,00 e 1.000,00', b.riga, /impegnato \(€ 1\.600,00\)/.test(b.riga) && /oltre \(€ 1\.000,00\)/.test(b.riga));
  a = await leggi('uso153', kv(5)); b = await leggi(APP, kv(5));
  c('C03', 'Speso 1.000 € sotto il budget: numeri identici alla ver153', a.saldo + ' · ' + a.fin, b.saldo + ' · ' + b.fin, a.saldo === b.saldo && a.fin === b.fin && b.saldo === '€ 800,00' && !b.riga);
  a = await leggi('uso153', kv(10)); b = await leggi(APP, kv(10));
  c('C04', 'Speso esattamente il budget (2.000 €): identico alla ver153, nessuna riga', a.saldo, b.saldo + (b.riga ? ' + riga' : ''), a.saldo === b.saldo && b.saldo === '€ 1.600,00' && !b.riga);
  b = await leggi(APP, kv(15, 500));
  c('C05', 'Oltre il budget con un acconto di 500 €: saldo = 1.600 − 500', '€ 1.100,00', b.saldo, b.saldo === '€ 1.100,00');
  b = await leggi(APP, kv(15, 2000));
  c('C06', 'Fatturato 2.000 € oltre l\'impegnato: «HAI GIÀ FATTURATO IN PIÙ» di 400 €', '€ 400,00', b.saldo, b.saldo === '€ 400,00');
  c('C07', 'Errori di pagina', '0', b.err, b.err === 0);
  await L.chiudi(); L.fine('uso-ver154');
})();
