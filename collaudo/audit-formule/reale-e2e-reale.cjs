// E2E sui DATI VERI: ogni lavoro aperto nella ver158 (banco 8340), RIEPILOGO PER ANNO e CONSUNTIVO a video contro il ricalcolo indipendente
// (indip.cjs + rettifiche del finanziamento finAnno/rettFin rifatte qui dalla loro specifica). Non va nel repository.
const fs = require('fs'); const C = __dirname + '/../';
const L = require(C + 'uso-a01-lib.cjs'); process.env.APPF = process.argv[3]; const m = require(C + 'audit-formule/motore.cjs');
const { indipP, indipB, tariffa } = require(C + 'audit-formule/indip.cjs');
const BK = JSON.parse(fs.readFileSync(process.argv[2], 'utf8')); const idx = JSON.parse(BK['usoint-idx']), tar = JSON.parse(BK['usoint-tariffe'] || '{}');
const kv = {}; Object.keys(BK).filter(k => k.startsWith('usoint')).forEach(k => kv[k] = BK[k]);
const R2 = a => Math.round(Number((a * 100).toPrecision(12))) / 100; const num = s => (s === '—' || s === '-') ? 0 : s ? parseFloat(s.replace(/[€\s.]/g, '').replace(',', '.')) : NaN;
const S = (a, f) => a.reduce((x, y) => x + f(y), 0);
const fit = (p, cy, ks) => { const q = JSON.parse(JSON.stringify(p)); ks.forEach(k => q[k] = cy.map((_, yi) => (q[k] || [])[yi] || 0)); q.md = cy.map((_, yi) => (q.md || [])[yi] || Array(12).fill(0)); return q; };
(async () => { let ok = 0, ko = 0; const err = [];
  for (const it of idx) {
    const P = JSON.parse(BK['usoint-p-' + it.id]); const cy = m.calcCY(P.start, P.end), vin = P.vincolo, nY = cy.length;
    const PP = (P.personnel || []).map(p => fit(p, cy, ['aOre', 'aElim', 'eurA'])), BB = (P.beni || []).map(b => fit(b, cy, ['aImp', 'aElim']));
    // rettifiche (specifica: anticipo del Committente = finanziato per cassa − competenza, in parti uguali sulle voci cofinanziate con spesa, senza superare il loro cofinanziato;
    // rettifica positiva + riporto assorbiti in proporzione al finanziato delle stesse voci, al centesimo). Le voci si valutano SENZA Tariffario (come le calcola l'app).
    const X0 = PP.map(p => indipP(p, cy, vin)), Y0 = BB.map(b => indipB(b, cy, vin));
    const adjP = PP.map(() => Array(nY).fill(0)), adjB = BB.map(() => Array(nY).fill(0)); let carry = 0; const fa = P.finAnno || [], rf = P.rettFin || [];
    for (let yi = 0; yi < nY; yi++) {
      const eP = PP.map((p, i) => i).filter(i => ((PP[i].cofin || 0) > 0 || (PP[i].recBlk || []).some(b => b.Iorig < 100)) && X0[i][yi].costo > 0);
      const eB = BB.map((b, j) => j).filter(j => ((BB[j].cofin || 0) > 0 || (BB[j].recBlk || []).some(b => b.Iorig < 100)) && Y0[j][yi].spesa > 0); const N = eP.length + eB.length;
      const comp = S(X0, x => x[yi].fin) + S(Y0, y => y[yi].fin); const adv = fa[yi] > 0 ? Math.max(0, fa[yi] - comp) : 0;
      if (N > 0 && adv > 0) { eP.forEach(i => adjP[i][yi] -= Math.min(adv / N, X0[i][yi].costo - X0[i][yi].fin)); eB.forEach(j => adjB[j][yi] -= Math.min(adv / N, Y0[j][yi].spesa - Y0[j][yi].fin)); }
      const pot = Math.max(0, rf[yi] || 0) + carry;
      if (pot > 0.001 && N > 0) { const sf = S(eP, i => X0[i][yi].fin) + S(eB, j => Y0[j][yi].fin); const abs = Math.min(pot, sf); if (sf > 0) { eP.forEach(i => adjP[i][yi] += R2(abs * X0[i][yi].fin / sf)); eB.forEach(j => adjB[j][yi] += R2(abs * Y0[j][yi].fin / sf)); } carry = R2(pot - abs); } else carry = R2(pot);
    }
    const XP = PP.map((p, i) => indipP(tariffa(p, cy, tar), cy, vin).map((y, yi) => Object.assign({}, y, { fin: Math.min(Math.max(y.fin - adjP[i][yi], 0), y.costo) })));
    const XB = BB.map((b, j) => indipB(b, cy, vin).map((y, yi) => Object.assign({}, y, { fin: Math.min(Math.max(y.fin - adjB[j][yi], 0), y.spesa) })));
    const att = {}; cy.forEach((c, yi) => { att['P ore ' + c.year] = S(XP, x => x[yi].ore); att['P tot ' + c.year] = S(XP, x => x[yi].costo); att['P fin ' + c.year] = S(XP, x => x[yi].fin); att['P cof ' + c.year] = S(XP, x => x[yi].costo - x[yi].fin);
      att['B tot ' + c.year] = S(XB, x => x[yi].spesa); att['B fin ' + c.year] = S(XB, x => x[yi].fin); att['B cof ' + c.year] = S(XB, x => x[yi].spesa - x[yi].fin);
      att['T tot ' + c.year] = att['P tot ' + c.year] + att['B tot ' + c.year]; att['T fin ' + c.year] = att['P fin ' + c.year] + att['B fin ' + c.year];
      att['Prev com ' + c.year] = S(PP, p => { const F = p.oreT * p.eur, rb = p.recBlk || [], h = S(rb, b => b.ore); const Ip = F ? (F - p.cofin) / F : (h > 0 ? S(rb, b => b.ore * b.Iorig) / h / 100 : 0); const rB = p.eur > 0 ? p.eur : ((p.eurA[yi] || 0) > 0 ? p.eurA[yi] : p.eur); return (p.aOre[yi] || 0) * rB * Ip; }) + S(BB, b => (b.aImp[yi] || 0) * (b.forf ? (b.forf - b.cofin) / b.forf : 0)); });
    const budTot = S(PP, p => p.oreT * p.eur) + S(BB, b => b.forf), budCof = S(PP, p => p.cofin) + S(BB, b => b.cofin);
    const speso = S(XP, x => S(x, y => y.costo)) + S(XB, x => S(x, y => y.spesa)); const cofR = speso < budTot ? speso * budCof / budTot : budCof; const finSp = Math.min(speso - cofR, budTot - budCof);
    att['speso'] = speso; att['tua quota'] = cofR; att['finanziato'] = finSp; att['saldo'] = finSp - S(P.fatture || [], f => f.importo);
    const { ctx } = await L.contesto({ kv }); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: 1500, height: 900 });
    await T.page.goto(L.BASE + 'uso/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
    await T.page.evaluate(tt => { const el = [...document.querySelectorAll('div')].filter(x => getComputedStyle(x).cursor === 'pointer' && x.innerText.includes(tt)); el[el.length - 1].click(); }, it.title); await L.aspetta(T, 1000);
    const v = await T.page.evaluate(() => { const riga = re => { const tr = [...document.querySelectorAll('tr')].find(x => x.cells && x.cells[0] && re.test(x.cells[0].innerText.trim())); return tr ? [...tr.cells].map(c => c.innerText.trim()) : null; };
      const hdr = [...document.querySelectorAll('tr')].find(x => x.cells && x.cells[0] && /^Personale$/.test(x.cells[0].innerText.trim())); const head = hdr ? [...hdr.closest('table').querySelectorAll('tr')][0].innerText : '';
      const t = document.body.innerText; const dopo = lab => { const i = t.indexOf(lab); return i < 0 ? '' : (t.slice(i + lab.length).match(/-?€\s?-?[\d.]+,\d\d/) || [''])[0]; };
      return { head, P: riga(/^Personale$/), B: riga(/^Beni\/Servizi$/), TOT: riga(/^TOTALE$/), C: riga(/^Quota Committente$/), speso: dopo('Speso complessivo'), tua: dopo('Tua quota ('), fin: dopo('Finanziato che ti spetta'), saldo: dopo('SALDO FINALE DA FATTURARE'), inpiu: dopo('HAI GIÀ FATTURATO IN PIÙ'), alline: t.includes('FATTURAZIONE ALLINEATA') }; });
    const conf = (k, s) => { const a = att[k], x = num(s); if (!(Math.abs(x - R2(a)) <= 0.0051)) { ko++; err.push(`${it.title} · ${k}: video ${s} · atteso ${R2(a)}`); } else ok++; };
    if (!v.P) { ko++; err.push(`${it.title}: riepilogo per anno non trovato`); await ctx.close(); continue; }
    cy.forEach((c, yi) => { const o = yi * 4, y = c.year; conf('P ore ' + y, v.P[1 + o]); conf('P tot ' + y, v.P[2 + o]); conf('P fin ' + y, v.P[3 + o]); conf('P cof ' + y, v.P[4 + o]);
      conf('B tot ' + y, v.B[2 + o]); conf('B fin ' + y, v.B[3 + o]); conf('B cof ' + y, v.B[4 + o]); conf('T tot ' + y, v.TOT[2 + o]); conf('T fin ' + y, v.TOT[3 + o]); conf('Prev com ' + y, v.C[1 + yi * 3]); });
    conf('speso', v.speso); conf('tua quota', v.tua); conf('finanziato', v.fin);
    if (att.saldo > 0.01) conf('saldo', v.saldo); else if (att.saldo < -0.01) { att.saldo = -att.saldo; conf('saldo', v.inpiu); } else if (v.alline) ok++; else { ko++; err.push(`${it.title} saldo: atteso «ALLINEATA»`); }
    if (T.errori.length) { ko++; err.push(`${it.title}: errori di pagina ${T.errori.join(' | ')}`); }
    console.log(`${it.title}: speso ${R2(speso)} · finanziato ${R2(finSp)} · saldo ${R2(finSp - S(P.fatture || [], f => f.importo))} · rettifiche ${JSON.stringify(adjP.map(a => a.map(R2)).filter(a => a.some(x => x)))}`);
    await ctx.close(); }
  await L.chiudi(); console.log(`e2e-reale: ${idx.length} lavori · valori ${ok + ko} · uguali ${ok} · diversi ${ko}`); err.forEach(x => console.log('  ' + x)); })();
