// Ricalcolo INDIPENDENTE dalla specifica (decisioni di Christian) del motore di USOINT: non usa il codice dell'app. SOLO DATI INVENTATI.
// --- specifica indipendente ---
function attivo(p, y, mm, dis) { if (dis) return false;
  if (p.cessato) { const [cy, cm] = p.cessato.split('-').map(Number); if (y > cy || (y === cy && mm > cm - 1)) return false; }
  if (p.subentro) { const [sy, sm] = p.subentro.split('-').map(Number); if (y < sy || (y === sy && mm < sm - 1)) return false; }
  return true; }
function costoMese(p, yi, mm) { // ultimo cambio «dal mese» valido; un costo dell'anno scritto ferma i cambi degli anni prima; Tariffario «solo» quell'anno
  let best = null;
  for (const c of (p.eurDal || [])) { if (!(c.eur > 0)) continue; const pos = c.yi * 12 + c.m, qui = yi * 12 + mm; if (pos > qui) continue;
    if (c.yi < yi && (c.solo || (p.eurA[yi] > 0))) continue; if (!best || pos > best.yi * 12 + best.m || (pos === best.yi * 12 + best.m && c.tar)) best = c; }
  return best ? best.eur : (p.eurA[yi] > 0 ? p.eurA[yi] : p.eur); }
function tariffa(p, cy, tar) { const t = tar && tar[p.nome.toLowerCase()]; if (!t) return p; const q = JSON.parse(JSON.stringify(p));
  cy.forEach((c, yi) => { const v = t[c.year]; if (v == null) return; const e = typeof v === 'object' ? v.eur : v, d = typeof v === 'object' ? (v.dal || 0) : 0; if (!(e > 0)) return;
    if (d > 0) { q.eurDal = (q.eurDal || []).filter(x => !(x.yi === yi && x.m >= d)); q.eurDal.push({ yi, m: d, eur: e, solo: true, tar: true }); }
    else { q.eurA[yi] = e; q.eurDal = (q.eurDal || []).filter(x => x.yi !== yi); } }); return q; }
function indipP(p, cy, vin) {
  const F = p.oreT * p.eur, G = F - p.cofin, I = F ? G / F : 0;
  const ricW = (p.ricBlk || []).reduce((a, b) => a + b.imp, 0), IoRic = ricW > 0 ? (p.ricBlk.reduce((a, b) => a + b.imp * b.Iorig, 0) / ricW) / 100 : I;
  const ceduti = []; (p.trasf || []).forEach(t => { if (t.eur) { const k = t.k === 'glob' ? 0 : t.k; ceduti[k] = (ceduti[k] || 0) + t.imp; } });
  let carry = 0, ownLeft = F, cumOwn = 0, cumFin = 0; const hBlk = (p.recBlk || []).map(b => ({ h: b.ore, I: b.Iorig / 100 })), eBlk = (p.ricBlk || []).map(b => ({ e: b.imp, I: b.Iorig / 100 }));
  return cy.map((c, yi) => {
    const base = p.eurA[yi] > 0 ? p.eurA[yi] : p.eur; let ore = 0, costo = 0;
    c.months.forEach(mo => { if (!attivo(p, c.year, mo.month, mo.disabled)) return; const h = p.md[yi][mo.month] || 0; ore += h; costo += h * costoMese(p, yi, mo.month); });
    const rB = p.eur > 0 ? p.eur : base, ric = (p.ricEur || [])[yi] || 0, alloc = (p.aOre[yi] || 0) * rB + ric - (ceduti[yi] || 0), disp = alloc + carry;
    const rFine = costoMese(p, yi, 11), rD = rFine > 0 ? rFine : rB, oreDisp = rD > 0 ? disp / rD : (p.aOre[yi] || 0), res = disp - costo, oreRes = rD > 0 ? res / rD : oreDisp - ore; // «le ore che restano = euro rimasti ÷ costo orario» (A4)
    const sfor = vin && ((p.aOre[yi] || 0) > 0 || ric > 0) && (rD > 0 ? costo > disp + 0.995 : ore > oreDisp);
    // finanziamento: prima il capitale proprio (cumulato I×speso, al massimo G), poi i blocchi in ore (costo medio), poi i blocchi in euro
    const media = ore > 0 ? costo / ore : base; let restE = costo, restH = ore, fin = 0;
    const own = Math.min(ownLeft, restE); if (own > 0) { cumOwn += own; const nf = Math.min(I * cumOwn, G); fin += Math.max(0, nf - cumFin); cumFin = nf; ownLeft -= own; restE -= own; restH -= media > 0 ? own / media : 0; }
    for (const b of hBlk) { if (restH <= 0.0001) break; if (b.h <= 0.0001) continue; const h = Math.min(b.h, restH); fin += h * media * b.I; b.h -= h; restH -= h; restE -= h * media; }
    if (media > 0) for (const b of eBlk) { if (restH <= 0.0001) break; if (b.e <= 0.0001) continue; const s = Math.min(b.e, restE); fin += s * b.I; b.e -= s; restE -= s; restH -= s / media; }
    fin = Math.min(Math.max(fin, 0), costo);
    const finMax = ((p.aOre[yi] || 0) * rB - (ceduti[yi] || 0)) * I + ric * IoRic;
    carry = res - (p.aElim[yi] || 0) * rB;
    return { ore, costo, disp, res, oreDisp, oreRes, sfor, fin, finMax };
  });
}
function indipB(b, cy, vin) { const F = b.forf, G = F - b.cofin, I = F ? G / F : 0; let carry = 0, ownLeft = F, cumOwn = 0, cumFin = 0; const blk = (b.recBlk || []).map(x => ({ e: x.imp, I: x.Iorig / 100 }));
  return cy.map((c, yi) => { let spesa = 0; c.months.forEach(mo => { if (!attivo({ cessato: b.cessato }, c.year, mo.month, mo.disabled)) return; spesa += b.md[yi][mo.month] || 0; });
    const disp = (b.aImp[yi] || 0) + carry, res = disp - spesa; let rest = spesa, fin = 0; const own = Math.min(ownLeft, rest);
    if (own > 0) { cumOwn += own; const nf = Math.min(I * cumOwn, G); fin += Math.max(0, nf - cumFin); cumFin = nf; ownLeft -= own; rest -= own; }
    for (const x of blk) { if (rest <= 0.0001) break; if (x.e <= 0.0001) continue; const s = Math.min(x.e, rest); fin += s * x.I; x.e -= s; rest -= s; }
    fin = Math.min(Math.max(fin, 0), spesa); carry = res - (b.aElim[yi] || 0); return { spesa, disp, res, fin, sfor: vin && (b.aImp[yi] || 0) > 0 && spesa > disp + 0.995 }; }); }
module.exports = { attivo, costoMese, tariffa, indipP, indipB };
