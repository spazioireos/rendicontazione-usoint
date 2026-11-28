// V Formule App — USOINT (dalla ver158): confronto del motore vero (cP, cB, applyTar, rateM) con un ricalcolo INDIPENDENTE scritto dalla
// specifica (decisioni di Christian), su migliaia di casi casuali, più proprietà che devono valere sempre. SOLO DATI INVENTATI.
// Uso: node collaudo/audit-formule/prop158.cjs [N]
const m = require('./motore.cjs');
const N = parseInt(process.argv[2] || '4000', 10);
let seed = 12345; const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
const pick = a => a[Math.floor(r() * a.length)];
const EPS = 1e-6;
const { costoMese, tariffa, indipP, indipB } = require('./indip.cjs');
// --- generatore di casi ---
function caso() {
  const sy = 2025 + Math.floor(r() * 2), sm = 1 + Math.floor(r() * 12), ey = sy + Math.floor(r() * 3), em = 1 + Math.floor(r() * 12);
  if (ey === sy && em <= sm) return null;
  const cy = m.calcCY(`${sy}-${String(sm).padStart(2, '0')}-01`, `${ey}-${String(em).padStart(2, '0')}-28`); const n = cy.length;
  const eur = pick([0, 10, 15.5, 22.99, 18.75]), oreT = pick([0, 120, 400, 1000]);
  const p = { nome: 'X', oreT, eur, cofin: pick([0, 0.2, 0.35, 1]) * oreT * eur, aOre: Array.from({ length: n }, () => pick([0, 50, 200, 400])), aElim: Array.from({ length: n }, () => (r() < .15 ? pick([10, 40]) : 0)),
    eurA: Array.from({ length: n }, () => (r() < .35 ? pick([12, 18.75, 25, 30]) : 0)), md: Array.from({ length: n }, () => Array.from({ length: 12 }, () => (r() < .6 ? Math.round(r() * 160) / 4 : 0))),
    eurDal: r() < .45 ? Array.from({ length: 1 + Math.floor(r() * 2) }, () => ({ yi: Math.floor(r() * n), m: Math.floor(r() * 12), eur: pick([11, 14.5, 20, 27.25]) })) : [],
    recBlk: r() < .2 ? [{ ore: pick([20, 100]), Iorig: pick([60, 80, 100]) }] : [], ricEur: r() < .3 ? Array.from({ length: n }, () => (r() < .5 ? pick([300, 900]) : 0)) : [],
    ricBlk: r() < .3 ? [{ imp: pick([500, 1500]), Iorig: pick([70, 80]) }] : [], trasf: r() < .2 ? [{ k: 0, eur: true, imp: pick([100, 400]) }] : [],
    cessato: r() < .2 ? `${sy + Math.floor(r() * (ey - sy + 1))}-${String(1 + Math.floor(r() * 12)).padStart(2, '0')}-15` : '', subentro: r() < .15 ? `${sy}-${String(1 + Math.floor(r() * 12)).padStart(2, '0')}-01` : '' };
  { const vis = {}; p.eurDal = p.eurDal.filter(c => { const k = c.yi + '-' + c.m; if (vis[k]) return false; vis[k] = 1; return true; }); } // l'app non permette due cambi nello stesso mese (setDal sostituisce)
  const tar = r() < .25 ? { x: { [cy[Math.floor(r() * n)].year]: r() < .5 ? pick([19, 21.5]) : { eur: pick([19, 21.5]), dal: Math.floor(r() * 12) } } } : null;
  const b = { voce: 'B', forf: pick([0, 500, 3000]), cofin: 0, aImp: Array.from({ length: n }, () => pick([0, 200, 1000])), aElim: Array.from({ length: n }, () => (r() < .15 ? 50 : 0)), md: Array.from({ length: n }, () => Array.from({ length: 12 }, () => (r() < .5 ? Math.round(r() * 30000) / 100 : 0))), recBlk: r() < .2 ? [{ imp: 400, Iorig: 75 }] : [], cessato: r() < .15 ? `${sy}-${String(1 + Math.floor(r() * 12)).padStart(2, '0')}-10` : '' };
  b.cofin = b.forf * pick([0, 0.2, 0.5]);
  return { cy, p, b, tar, vin: r() < .5 };
}
// --- confronto ---
let casi = 0, diffP = 0, diffB = 0, prop = 0; const es = [];
const d = (a, b) => Math.abs((a || 0) - (b || 0)) > 1e-6 * Math.max(1, Math.abs(a || 0), Math.abs(b || 0));
for (let t = 0; t < N; t++) { const k = caso(); if (!k) continue; casi++;
  const pT = m.applyTar(k.p, k.cy, k.tar), A = m.cP(pT, k.cy, k.vin, null), X = indipP(tariffa(k.p, k.cy, k.tar), k.cy, k.vin);
  A.yrs.forEach((y, i) => { const x = X[i]; const c = [['ore', y.oE, x.ore], ['costo', y.iE, x.costo], ['disponibile', y.avE, x.disp], ['residuo', y.resE, x.res], ['oreDisp', y.oD, x.oreDisp], ['oreRes', y.oR, x.oreRes], ['finanziato', y.fin, x.fin], ['finMax', y.finMax, x.finMax]];
    c.forEach(([f, a, b]) => { if (d(a, b)) { diffP++; if (es.length < 8) es.push(`P caso ${t} anno ${k.cy[i].year} ${f}: app ${a} · indip ${b}`); } });
    if (!!y.ov !== !!x.sfor) { diffP++; if (es.length < 8) es.push(`P caso ${t} anno ${k.cy[i].year} sforato: app ${y.ov} · indip ${x.sfor}`); }
    // proprietà
    if (y.fin < -EPS || y.fin > y.iE + EPS) { prop++; es.push(`PROP fin fuori [0, costo] caso ${t}`); }
    if (Math.abs(y.cof - (y.iE - y.fin)) > EPS) { prop++; es.push(`PROP cof ≠ costo − fin caso ${t}`); }
    if (!(k.p.eurDal || []).length && !k.tar && Math.abs(y.iE - y.oE * y.eRate) > 1e-6 * Math.max(1, y.iE)) { prop++; es.push(`PROP costo ≠ ore × costo unico caso ${t}`); } });
  if (Math.abs(A.tI - A.yrs.reduce((a, y) => a + y.iE, 0)) > EPS || Math.abs(A.tO - A.yrs.reduce((a, y) => a + y.oE, 0)) > EPS || Math.abs(A.EX - A.yrs.reduce((a, y) => a + y.fin, 0)) > EPS) { prop++; es.push(`PROP totali ≠ somma degli anni caso ${t}`); }
  // finanziato complessivo con solo capitale proprio: = min(I × speso, G) (con spesa entro il budget)
  if (!k.p.recBlk.length && !k.p.ricBlk.length) { const sp = A.yrs.reduce((a, y) => a + y.iE, 0), F = k.p.oreT * k.p.eur, G = F - k.p.cofin, I = F ? G / F : 0; const att = Math.min(I * Math.min(sp, F), G); if (Math.abs(A.EX - att) > 1e-6 * Math.max(1, att)) { prop++; if (es.length < 12) es.push(`PROP finanziato totale ${A.EX} ≠ min(I×speso, G) ${att} caso ${t}`); } }
  // senza eliminazioni: residuo finale + speso = assegnato totale
  if (!k.p.aElim.some(x => x)) { const ass = A.yrs.reduce((a, y) => a + y.iAlloc, 0), sp = A.yrs.reduce((a, y) => a + y.iE, 0), rl = A.yrs[A.yrs.length - 1].resE; if (Math.abs(rl + sp - ass) > 1e-6 * Math.max(1, ass)) { prop++; es.push(`PROP residuo + speso ≠ assegnato caso ${t}`); } }
  const B = m.cB(k.b, k.cy, k.vin, null), Y = indipB(k.b, k.cy, k.vin);
  B.yrs.forEach((y, i) => { const x = Y[i]; [['spesa', y.iE, x.spesa], ['disponibile', y.iD, x.disp], ['residuo', y.iR, x.res], ['finanziato', y.fin, x.fin]].forEach(([f, a, b]) => { if (d(a, b)) { diffB++; if (es.length < 12) es.push(`B caso ${t} anno ${k.cy[i].year} ${f}: app ${a} · indip ${b}`); } });
    if (!!y.ov !== !!x.sfor) { diffB++; if (es.length < 12) es.push(`B caso ${t} sforato: app ${y.ov} · indip ${x.sfor}`); } });
}
console.log(`casi ${casi} · differenze personale ${diffP} · differenze beni ${diffB} · proprietà violate ${prop}`);
es.forEach(x => console.log('  ' + x));
// rateM: casi scritti a mano
const R = (p, yi, mm) => m.rateM(Object.assign({ eur: 10, eurA: [0, 0, 0] }, p), yi, mm);
const casiR = [
  ['nessun cambio', {}, 1, 5, 10], ['cambio dal LUG anno 0: GIU', { eurDal: [{ yi: 0, m: 6, eur: 15 }] }, 0, 5, 10], ['… LUG', { eurDal: [{ yi: 0, m: 6, eur: 15 }] }, 0, 6, 15],
  ['… anno dopo', { eurDal: [{ yi: 0, m: 6, eur: 15 }] }, 1, 0, 15], ['… anno dopo con costo dell\'anno 12', { eurA: [0, 12, 0], eurDal: [{ yi: 0, m: 6, eur: 15 }] }, 1, 3, 12],
  ['due cambi: il più recente', { eurDal: [{ yi: 0, m: 2, eur: 11 }, { yi: 0, m: 8, eur: 13 }] }, 0, 9, 13], ['Tariffario solo quell\'anno', { eurDal: [{ yi: 0, m: 4, eur: 19, solo: true }] }, 1, 0, 10],
  ['cambio a GEN = tutto l\'anno', { eurDal: [{ yi: 1, m: 0, eur: 9 }] }, 1, 0, 9], ['costo dell\'anno e cambio stesso anno', { eurA: [20, 0, 0], eurDal: [{ yi: 0, m: 10, eur: 25 }] }, 0, 9, 20]];
let okR = 0; casiR.forEach(([n, p, yi, mm, att]) => { const v = R(p, yi, mm); if (v === att) okR++; else console.log(`  rateM ${n}: ${v} (atteso ${att})`); });
console.log(`rateM: ${okR}/${casiR.length}`);
process.exitCode = (diffP + diffB + prop === 0 && okR === casiR.length) ? 0 : 1;
