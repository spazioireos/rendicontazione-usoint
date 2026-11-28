// uso-ver160 (28/11/2026, Christian: «quando tutte le annualità di una riga sono vuote, il totale vale come se fosse scritto sulla prima annualità,
// e lo mostra in grigio»). Confronto con la ver159 in /uso159/. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso';
const kv = () => ({ 'usoint-idx': [{ id: 'pa', title: 'ANNUALITA PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: false }], 'usoint-p-pa': L.prog('pa', 'ANNUALITA PROVA', '2026-01-01', '2027-12-31', 2, {
  personnel: [L.pers(2, { nome: 'ALFA PROVA', voce: 'REFERENTE', oreT: 60, eur: 20, cofin: 0, md: [[5, 5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], Array(12).fill(0)] }),
    L.pers(2, { nome: 'BETA PROVA', voce: 'EDUCATORE', oreT: 40, eur: 20, cofin: 0, cessato: '2026-03-31' })],
  beni: [L.bene(2, { voce: 'MATERIALI PROVA', forf: 334.4, cofin: 85 })] }) });
async function apri(app) { const { ctx } = await L.contesto({ kv: kv() }); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: 1500, height: 900 });
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await T.page.evaluate(() => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && d.innerText.includes('ANNUALITA PROVA')); el[el.length - 1].click(); }); await L.aspetta(T, 800); return { ctx, T }; }
const auto = T => T.page.evaluate(() => [...document.querySelectorAll('span[title^="Automatico"]')].map(s => s.innerText.trim() + '@' + getComputedStyle(s).backgroundColor));
const prev = T => T.page.evaluate(() => { const tr = [...document.querySelectorAll('tr')].find(x => x.cells && x.cells[0] && /^Quota Committente$/.test(x.cells[0].innerText.trim())); return tr ? [...tr.cells].map(x => x.innerText.trim()) : null; });
const P = async T => JSON.parse(await L.ls(T, 'usoint-p-pa'));
(async () => {
  { const { ctx, T } = await apri('uso159'); const a = await auto(T), q = await prev(T); c('A00', 'ver159 (confronto): nessuna annualità automatica, Previsto 2026 = 0', 'nessuna · —', a.length + ' · ' + (q ? q[1] : '?'), a.length === 0 && q && /^(—|€ 0,00)$/.test(q[1])); await ctx.close(); }
  const { ctx, T } = await apri(APP);
  let a = await auto(T);
  c('A01', 'Prima annualità grigia col totale: ALFA 60,00 h e MATERIALI € 334,40 (non la riga cessata)', '2 celle grigie', JSON.stringify(a), a.length === 2 && a.some(x => /^60,00@rgb\(241, 245, 249\)/.test(x)) && a.some(x => /^€ 334,40@/.test(x)));
  const q = await prev(T); c('A02', 'Quota Committente: Previsto 2026 = 60 × 20 + 334,40 − 85 = 1.449,40 (la riga cessata con annualità vuote resta fuori dagli anni: progetto 2.249,40)', '€ 1.449,40 · € 2.249,40', q ? q[1] + ' · ' + q[7] : 'riga assente', q && q[1] === '€ 1.449,40' && q[7] === '€ 2.249,40');
  let d = await P(T); c('A03', 'Senza 💾 i dati salvati non cambiano', 'aOre ancora [0,0]', JSON.stringify(d.personnel[0].aOre), d.personnel[0].aOre[0] === 0 && !d.personnel[0].aAuto);
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300); d = await P(T);
  c('A04', 'Col 💾: prima annualità 60 segnata automatica; la riga cessata resta a 0', 'ALFA [60,0] aAuto · BETA [0,0] · beni [334.4,0]', JSON.stringify([d.personnel[0].aOre, d.personnel[0].aAuto, d.personnel[1].aOre, d.beni[0].aImp, d.beni[0].aAuto]), d.personnel[0].aOre[0] === 60 && d.personnel[0].aAuto === true && d.personnel[1].aOre[0] === 0 && !d.personnel[1].aAuto && d.beni[0].aImp[0] === 334.4 && d.beni[0].aAuto === true);
  // cambiando le Ore tot. la prima annualità automatica segue
  const ot = T.page.locator('input').filter({ has: T.page.locator('xpath=.') }); // segnaposto
  await T.page.evaluate(() => { const i = [...document.querySelectorAll('input')].find(x => x.value === '60' || x.value === '60,00'); if (i) { i.focus(); } });
  await T.page.keyboard.press('Control+a'); await T.page.keyboard.type('80'); await T.page.keyboard.press('Tab'); await L.aspetta(T, 300);
  a = await auto(T); c('A05', 'Ore tot. da 60 a 80: la prima annualità grigia segue (80,00)', '80,00', JSON.stringify(a), a.some(x => /^80,00@/.test(x)));
  // doppio clic: diventa scrivibile, col valore di prima
  await T.page.locator('span[title^="Automatico"]').first().dblclick(); await L.aspetta(T, 300); a = await auto(T);
  c('A06', 'Doppio clic: la cella torna scrivibile (resta solo quella dei beni grigia)', '1 cella grigia', JSON.stringify(a), a.length === 1 && /^€ 334,40/.test(a[0]));
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300); d = await P(T);
  c('A07', 'Col 💾: ALFA [80,0] scritta a mano (non più automatica)', '[80,0] · false', JSON.stringify([d.personnel[0].aOre, d.personnel[0].aAuto]), d.personnel[0].aOre[0] === 80 && d.personnel[0].aAuto === false);
  c('A08', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0); await ctx.close();
  await L.chiudi(); L.fine('uso-ver160');
})();
