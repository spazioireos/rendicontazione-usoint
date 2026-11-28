// V Formule App — USOINT: l'Excel del progetto (foglio dell'anno) contro i numeri a video e il ricalcolo indipendente. SOLO DATI INVENTATI.
const L = require('../uso-a01-lib.cjs');
const m = require('./motore.cjs');
const { indipP } = require('./indip.cjs');
const XLSX = require('/home/user/rendicontazione-usoint/collaudo/comune/.strumenti/node_modules/xlsx');
const APP = process.env.USO_APP || 'uso';
const cy = m.calcCY('2026-01-01', '2026-12-31');
const pers = [L.pers(1, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 240, eur: 10, cofin: 480, aOre: [240], eurDal: [{ yi: 0, m: 6, eur: 15 }], md: [Array(12).fill(20)] }),
  L.pers(1, { nome: 'BETA PROVA', voce: 'EDUCATORE', oreT: 100, eur: 20, cofin: 0, aOre: [100], md: [[10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]] })];
const d = L.prog('pe', 'XLS PROVA', '2026-01-01', '2026-12-31', 1, { vincolo: true, personnel: pers });
(async () => {
  const { ctx } = await L.contesto({ kv: { 'usoint-idx': [{ id: 'pe', title: 'XLS PROVA', start: '2026-01-01', end: '2026-12-31', vincolo: true }], 'usoint-p-pe': d } }); const T = await L.pagina(ctx);
  await T.page.setViewportSize({ width: 1500, height: 900 }); await T.page.goto(L.BASE + APP + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await T.page.evaluate(() => { const el = [...document.querySelectorAll('div')].filter(x => getComputedStyle(x).cursor === 'pointer' && /XLS PROVA/.test(x.innerText)); el[el.length - 1].click(); }); await L.aspetta(T, 700);
  await T.page.locator('button', { hasText: /^2026$/ }).first().click(); await L.aspetta(T, 500);
  const video = await T.page.evaluate(() => [...document.querySelectorAll('tbody tr')].filter(x => /PROVA/.test(x.innerText) && x.cells.length > 20).map(tr => { const c = [...tr.cells].map(x => x.innerText.trim()); return { nome: c[0].split('\n')[0], totE: c[c.length - 5], fin: c[c.length - 4], cof: c[c.length - 3], res: c[c.length - 2] }; }));
  const [dl] = await Promise.all([T.page.waitForEvent('download'), T.page.locator('button', { hasText: 'Excel' }).first().click()]);
  const f = await dl.path(); const wb = XLSX.readFile(f); const ws = wb.Sheets['2026']; const aoa = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const hdr = aoa[1]; const col = n => hdr.indexOf(n);
  const X = d.personnel.map(p => indipP(JSON.parse(JSON.stringify(p)), cy, true)[0]);
  const num = s => parseFloat(String(s).replace(/[€\s.]/g, '').replace(',', '.'));
  let ok = 0, ko = 0; const c = (id, a, b, cond) => { if (cond) ok++; else ko++; console.log((cond ? 'OK  ' : 'KO  ') + id + ' | ' + a + ' | ' + b); };
  d.personnel.forEach((p, i) => { const row = aoa.find(r => r[0] === p.nome); const v = video.find(x => x.nome === p.nome); const x = X[i];
    const mesiE = cy[0].months.map(mo => row[col(mo.label + ' €')]); const attMesi = cy[0].months.map(mo => (p.md[0][mo.month] || 0) * (mo.month >= 6 && (p.eurDal || []).length ? 15 : p.eurA[0] || p.eur));
    c(p.nome + ' € dei mesi (Excel)', JSON.stringify(mesiE.slice(5, 7)), 'atteso ' + JSON.stringify(attMesi.slice(5, 7)), mesiE.every((e, k) => Math.abs(e - attMesi[k]) < 0.005));
    c(p.nome + ' Tot.€ Excel = video = indipendente', row[col('Tot.€')] + ' · ' + v.totE, x.costo, Math.abs(row[col('Tot.€')] - x.costo) < 0.005 && Math.abs(num(v.totE) - x.costo) < 0.005);
    c(p.nome + ' € fin. Excel = video', row[col('€ fin.')] + ' · ' + v.fin, x.fin, Math.abs(row[col('€ fin.')] - x.fin) < 0.005 && Math.abs(num(v.fin) - x.fin) < 0.006);
    c(p.nome + ' Res.€ Excel = video (residuo in euro)', row[col('Res.€')] + ' · ' + v.res, x.res, Math.abs(row[col('Res.€')] - x.res) < 0.006 && Math.abs(num(v.res) - x.res) < 0.006);
  });
  console.log(`excel158: ${ok} superati, ${ko} falliti · errori di pagina ${T.errori.length}`); process.exitCode = ko || T.errori.length ? 1 : 0; await ctx.close(); await L.chiudi();
})();
