// ver159: conversione dei passaggi vecchi sul backup passato come argomento (nessun dato qui). Per ogni lavoro: righe convertite / da sistemare a mano,
// costi e finanziato prima e dopo (devono restare uguali), Previsto del Committente (somma degli anni contro totale), residui delle righe convertite.
const fs = require('fs'); process.env.APPF = process.argv[3] || (__dirname + '/../../index.html'); const m = require(__dirname + '/motore.cjs');
const BK = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const idx = JSON.parse(BK['usoint-idx']), tar = JSON.parse(BK['usoint-tariffe'] || '{}');
const fit = (p, cy, ks) => { const q = JSON.parse(JSON.stringify(p)); ks.forEach(k => q[k] = cy.map((_, yi) => (q[k] || [])[yi] || 0)); q.md = cy.map((_, yi) => (q.md || [])[yi] || Array(12).fill(0)); return q; };
const Ip = p => { const F = p.oreT * p.eur; return F ? (F - p.cofin) / F : 0; };
let cambiCosti = 0;
for (const it of idx) { const P0 = JSON.parse(BK['usoint-p-' + it.id]); const cy = m.calcCY(P0.start, P0.end); const P = Object.assign({}, P0, { personnel: (P0.personnel || []).map(p => fit(p, cy, ['aOre', 'aElim', 'eurA'])) });
  const vp = m.vecchiPassaggi(P.personnel); if (!vp.conv.length && !vp.man.length) continue;
  const D = m.convertiPassaggi(JSON.parse(JSON.stringify(P)));
  console.log('== ' + P.title); vp.conv.forEach(r => console.log(`  CONVERTE ${P.personnel[r.c].nome} → ${P.personnel[r.j].nome}: ${r.h} h = € ${r.imp}`)); vp.man.forEach(r => console.log(`  A MANO   ${r.nome}: ${r.motivo}`));
  P.personnel.forEach((p, i) => { const A = m.cP(m.applyTar(p, cy, tar), cy, P.vincolo, null), B = m.cP(m.applyTar(D.personnel[i], cy, tar), cy, P.vincolo, null);
    A.yrs.forEach((y, yi) => { const z = B.yrs[yi]; if (Math.abs(y.iE - z.iE) > 0.005 || Math.abs(y.fin - z.fin) > 0.005 || Math.abs(y.oE - z.oE) > 0.005) { cambiCosti++; console.log(`  ⚠ COSTI CAMBIATI ${p.nome} ${cy[yi].year}: costo ${y.iE}→${z.iE} fin ${y.fin}→${z.fin}`); }
      if (Math.abs(y.resE - z.resE) > 0.005 || !!y.ov !== !!z.ov) console.log(`  residuo ${p.nome || '(senza nome)'} ${cy[yi].year}: € ${y.resE.toFixed(2)} (${y.oR.toFixed(2)} h) → € ${z.resE.toFixed(2)} (${z.oR.toFixed(2)} h)${y.ov !== z.ov ? ' sforato ' + y.ov + '→' + z.ov : ''}`); }); });
  const prev = (PP) => cy.map((c, yi) => PP.reduce((a, p) => a + (p.aOre[yi] || 0) * p.eur * Ip(p), 0)).reduce((a, b) => a + b, 0);
  const tot = P.personnel.reduce((a, p) => a + p.oreT * p.eur * Ip(p), 0);
  console.log(`  Previsto personale: progetto ${tot.toFixed(2)} · somma anni prima ${prev(P.personnel).toFixed(2)} · dopo ${prev(D.personnel).toFixed(2)}`); }
console.log(`righe con costi o finanziato cambiati: ${cambiCosti}`);
