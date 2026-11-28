// Audit sui DATI VERI (backup del 28/11): motore ver158 contro ricalcolo indipendente, e ver153 contro ver158. Non va nel repository.
const fs = require('fs'), path = require('path');
const R = __dirname + '/';
const BK = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const carica = f => { process.env.APPF = f; delete require.cache[require.resolve(R + 'motore.cjs')]; return require(R + 'motore.cjs'); };
const m158 = carica(process.argv[3]), m153 = carica(process.argv[4]);
const { indipP, indipB, tariffa } = require(R + 'indip.cjs');
const idx = JSON.parse(BK['usoint-idx']), tar = JSON.parse(BK['usoint-tariffe'] || '{}');
const d = (a, b) => Math.abs((a || 0) - (b || 0)) > 0.005;
let nRighe = 0, diffI = 0, diff153 = 0; const out = [], cambi = [];
for (const it of idx) {
  const P = JSON.parse(BK['usoint-p-' + it.id]); const cy = m158.calcCY(P.start, P.end), vin = P.vincolo;
  (P.personnel || []).forEach((p0, i) => { nRighe++;
    const p = JSON.parse(JSON.stringify(p0)); ['aOre', 'aElim', 'eurA'].forEach(k => { p[k] = cy.map((_, yi) => (p[k] || [])[yi] || 0); }); p.md = cy.map((_, yi) => ((p.md || [])[yi] || Array(12).fill(0)));
    const A = m158.cP(m158.applyTar(p, cy, tar), cy, vin, null), X = indipP(tariffa(p, cy, tar), cy, vin), B3 = m153.cP(m153.applyTar(p, cy, tar), cy, vin, null);
    A.yrs.forEach((y, yi) => { const x = X[yi], z = B3.yrs[yi];
      [['ore', y.oE, x.ore], ['costo', y.iE, x.costo], ['finanziato', y.fin, x.fin], ['disponibile €', y.avE, x.disp], ['residuo €', y.resE, x.res], ['ore che restano', y.oR, x.oreRes]].forEach(([f, a, b]) => { if (d(a, b)) { diffI++; out.push(`${P.title} · ${p.nome || '(senza nome)'} ${p.voce} · ${cy[yi].year} · ${f}: app ${a} · indip ${b}`); } });
      if (!!y.ov !== !!x.sfor) { diffI++; out.push(`${P.title} · ${p.nome} · ${cy[yi].year} · sforato: app ${y.ov} · indip ${x.sfor}`); }
      [['ore', y.oE, z.oE], ['costo', y.iE, z.iE], ['finanziato', y.fin, z.fin], ['ore che restano', y.oR, z.oR]].forEach(([f, a, b]) => { if (d(a, b)) { diff153++; cambi.push(`${P.title} · ${p.nome || '(senza nome)'} ${p.voce} · ${cy[yi].year} · ${f}: ver153 ${(+b).toFixed(2)} → ver158 ${(+a).toFixed(2)}`); } });
      if (!!y.ov !== !!z.ov) { diff153++; cambi.push(`${P.title} · ${p.nome} ${p.voce} · ${cy[yi].year} · sforato: ver153 ${z.ov} → ver158 ${y.ov}`); } });
  });
  (P.beni || []).forEach(b0 => { nRighe++; const b = JSON.parse(JSON.stringify(b0)); ['aImp', 'aElim'].forEach(k => { b[k] = cy.map((_, yi) => (b[k] || [])[yi] || 0); }); b.md = cy.map((_, yi) => ((b.md || [])[yi] || Array(12).fill(0)));
    const A = m158.cB(b, cy, vin, null), Y = indipB(b, cy, vin), Z = m153.cB(b, cy, vin, null);
    A.yrs.forEach((y, yi) => { const x = Y[yi], z = Z.yrs[yi]; [['spesa', y.iE, x.spesa], ['finanziato', y.fin, x.fin], ['residuo', y.iR, x.res]].forEach(([f, a, c]) => { if (d(a, c)) { diffI++; out.push(`${P.title} · ${b.voce} · ${cy[yi].year} · ${f}: app ${a} · indip ${c}`); } });
      [['spesa', y.iE, z.iE], ['finanziato', y.fin, z.fin]].forEach(([f, a, c]) => { if (d(a, c)) { diff153++; cambi.push(`${P.title} · ${b.voce} · ${cy[yi].year} · ${f}: ver153 ${c} → ver158 ${a}`); } }); });
  });
}
console.log(`righe ${nRighe} · differenze motore/indipendente ${diffI} · differenze ver153→ver158 ${diff153}`);
out.slice(0, 40).forEach(x => console.log('  I ' + x)); cambi.slice(0, 60).forEach(x => console.log('  C ' + x));
