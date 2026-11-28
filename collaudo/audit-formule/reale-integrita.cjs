const fs = require('fs'); const R = __dirname + '/';
process.env.APPF = process.argv[3]; const m = require(R + 'motore.cjs');
const BK = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const idx = JSON.parse(BK['usoint-idx']); const lav = JSON.parse(BK['usoint-orelav']); const tar = JSON.parse(BK['usoint-tariffe']);
const norm = x => String(x || '').toLowerCase().trim().replace(/\s+/g, ' ');
const MESI = ["GEN","FEB","MAR","APR","MAG","GIU","LUG","AGO","SET","OTT","NOV","DIC"];
const rend = {}; const W = s => console.log(s);
for (const it of idx) {
  const P = JSON.parse(BK['usoint-p-' + it.id]); const cy = m.calcCY(P.start, P.end);
  ['title', 'start', 'end', 'vincolo', 'cadMesi'].forEach(k => { if (JSON.stringify(it[k]) !== JSON.stringify(P[k]) && !(k === 'cadMesi' && P[k] == null)) W(`IDX≠LAVORO · ${P.title} · ${k}: elenco ${JSON.stringify(it[k])} · lavoro ${JSON.stringify(P[k])}`); });
  (P.personnel || []).forEach(p => {
    if (p.nome !== (p.nome || '').trim()) W(`SPAZIO · ${P.title} · «${p.nome}» ha uno spazio in fondo`);
    const F = p.oreT * p.eur; if (p.cofin > F + 0.01) W(`COFIN>IMPORTO · ${P.title} · ${p.nome} ${p.voce}: cofin ${p.cofin} > ${F}`);
    if (P.cofinMode === 'pct' && Math.abs(p.cofin - F * P.cofinPct / 100) > 0.01) W(`PCT · ${P.title} · ${p.nome}: cofin ${p.cofin} ≠ ${F}×${P.cofinPct}% = ${(F * P.cofinPct / 100).toFixed(2)}`);
    const sA = (p.aOre || []).reduce((a, b) => a + b, 0); if (p.oreT > 0 && Math.abs(sA - p.oreT) > 0.01) W(`ANNUALITÀ · ${P.title} · ${p.nome} ${p.voce}: somma annualità ${sA} ≠ ore tot ${p.oreT}`);
    if ((p.md || []).length > cy.length) W(`ANNI IN PIÙ · ${P.title} · ${p.nome}: md ha ${p.md.length} anni, il lavoro ${cy.length}`);
    cy.forEach((c, yi) => { const row = (p.md || [])[yi] || []; row.forEach((h, mm) => { if (!h) return;
      const fuori = !c.months.some(x => x.month === mm && !x.disabled); const ces = m.isMeseCessato(p.cessato, c.year, mm), pre = m.isMesePreSubentro(p.subentro, c.year, mm);
      if (fuori || ces || pre) { W(`ORE NON CONTATE · ${P.title} · ${p.nome} ${p.voce} · ${MESI[mm]} ${c.year}: ${h} h (${fuori ? 'fuori dal periodo del lavoro' : ces ? 'dopo la cessazione ' + p.cessato : 'prima del subentro ' + p.subentro})`); return; }
      const k = norm(p.nome); if (!k) return; rend[k] = rend[k] || {}; const kk = c.year + '-' + mm; rend[k][kk] = (rend[k][kk] || 0) + h; }); });
    if (p.subentro && !p.subentroDi && p.subentro) {} 
    if (p.subentroDi && norm(p.subentroDi) === norm(p.nome)) W(`SUBENTRA A SÉ · ${P.title} · ${p.nome} subentra a «${p.subentroDi}»`);
    (p.trasf || []).forEach(t => { if (norm(t.a) === norm(p.nome)) W(`TRASFERITO A SÉ · ${P.title} · ${p.nome} ${p.voce}: € ${t.imp} (${t.ore} h) a «${t.a}» il ${t.il}`); });
    if (p.eur === 0 && p.ricevute > 0) W(`SUBENTR. SENZA €/ORA DI BUDGET · ${P.title} · ${p.nome} ${p.voce}: ricevute ${p.ricevute} h, budgetRic € ${p.budgetRic}, aOre ${JSON.stringify(p.aOre)}, eurA ${JSON.stringify(p.eurA)}`);
  });
  (P.beni || []).forEach(b => { if (b.cofin > b.forf + 0.01) W(`COFIN>IMPORTO beni · ${P.title} · ${b.voce}`); const sA = (b.aImp || []).reduce((a, x) => a + x, 0); if (b.forf > 0 && Math.abs(sA - b.forf) > 0.01) W(`ANNUALITÀ beni · ${P.title} · ${b.voce || '(senza nome)'}: somma ${sA.toFixed(2)} ≠ importo ${b.forf}`);
    if (P.cofinMode === 'pct' && Math.abs(b.cofin - b.forf * P.cofinPct / 100) > 0.01) W(`PCT beni · ${P.title} · ${b.voce}: cofin ${b.cofin} ≠ ${(b.forf * P.cofinPct / 100).toFixed(2)}`);
    cy.forEach((c, yi) => { ((b.md || [])[yi] || []).forEach((v, mm) => { if (!v) return; if (!c.months.some(x => x.month === mm && !x.disabled)) W(`IMPORTO NON CONTATO · ${P.title} · ${b.voce} · ${MESI[mm]} ${c.year}: € ${v} fuori dal periodo`); }); }); });
}
// rendicontate > lavorate
Object.keys(rend).forEach(k => Object.keys(rend[k]).forEach(kk => { const [y, mm] = kk.split('-').map(Number); const l = lav[k] && lav[k][y] ? lav[k][y][mm] : null;
  if (l == null) { if (rend[k][kk] > 0) W(`LAVORATE ASSENTI · ${k} · ${MESI[mm]} ${y}: rendicontate ${rend[k][kk]} h, lavorate non registrate`); }
  else if (rend[k][kk] > l + 0.005) W(`RENDICONTATE > LAVORATE · ${k} · ${MESI[mm]} ${y}: rendicontate ${rend[k][kk].toFixed(2)} h · lavorate ${l} h · +${(rend[k][kk] - l).toFixed(2)}`); }));
Object.keys(tar).forEach(k => { if (!rend[k] && !Object.keys(lav).includes(k)) W(`TARIFFARIO · «${k}» non è in nessun lavoro`); });
