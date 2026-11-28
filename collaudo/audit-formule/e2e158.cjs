// V Formule App — USOINT: progetti casuali aperti nell'app vera (banco comune 8340); RIEPILOGO PER ANNO, Previsto/Usato e CONSUNTIVO FINALE
// letti a video e confrontati col ricalcolo indipendente (indip.cjs). SOLO DATI INVENTATI. Uso: node collaudo/audit-formule/e2e158.cjs [N]
const L = require('../uso-a01-lib.cjs');
const m = require('./motore.cjs');
const { indipP, indipB } = require('./indip.cjs');
const N = parseInt(process.argv[2] || '12', 10);
let seed = 777; const r = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }; const pick = a => a[Math.floor(r() * a.length)];
const it = v => { const x = Math.round((Math.abs(v) + 1e-9) * 100) / 100; const [i, d] = x.toFixed(2).split('.'); return (v < -0.004 ? '-' : '') + i.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ',' + d; };
const num = s => s ? parseFloat(s.replace(/[€\s.]/g, '').replace(',', '.')) : 0;
function progetto(t) {
  const n = 2, cy = m.calcCY('2026-01-01', '2027-12-31');
  const pers = Array.from({ length: 2 + Math.floor(r() * 2) }, (_, j) => { const eur = pick([10, 18.75, 22.99]), oreT = pick([200, 400, 800]);
    return L.pers(n, { nome: 'P' + j + ' PROVA', voce: 'EDUCATORE', oreT, eur, cofin: Math.round(oreT * eur * pick([0, 0.2, 0.3]) * 100) / 100, aOre: [oreT / 2, oreT / 2], eurA: [0, r() < .4 ? pick([20, 25]) : 0],
      eurDal: r() < .5 ? [{ yi: Math.floor(r() * 2), m: Math.floor(r() * 12), eur: pick([12.5, 21, 26]) }] : [], md: Array.from({ length: n }, () => Array.from({ length: 12 }, () => (r() < .7 ? Math.round(r() * 120) / 4 : 0))),
      cessato: r() < .2 ? '2027-0' + (1 + Math.floor(r() * 9)) + '-20' : '' }); });
  const beni = Array.from({ length: 1 + Math.floor(r() * 2) }, (_, j) => { const forf = pick([500, 1500, 4000]); return L.bene(n, { voce: 'B' + j, forf, cofin: forf * pick([0, 0.25]), aImp: [forf / 2, forf / 2], md: Array.from({ length: n }, () => Array.from({ length: 12 }, () => (r() < .4 ? Math.round(r() * 20000) / 100 : 0))) }); });
  const fatture = r() < .6 ? [{ data: '2026-06-30', numero: '1', tipo: 'acconto', importo: pick([500, 2000, 9000]) }] : [];
  const vin = r() < .5;
  return { cy, vin, d: L.prog('px', 'E2E ' + t, '2026-01-01', '2027-12-31', n, { vincolo: vin, personnel: pers, beni, fatture }) };
}
(async () => {
  let ok = 0, ko = 0; const err = [], centesimi = [];
  for (let t = 0; t < N; t++) {
    const { cy, vin, d } = progetto(t);
    const XP = d.personnel.map(p => indipP(JSON.parse(JSON.stringify(p)), cy, vin)), XB = d.beni.map(b => indipB(JSON.parse(JSON.stringify(b)), cy, vin));
    const att = {}; // atteso
    const somma = (arr, f) => arr.reduce((a, x) => a + f(x), 0);
    cy.forEach((c, yi) => { att['P ore ' + yi] = somma(XP, x => x[yi].ore); att['P tot ' + yi] = somma(XP, x => x[yi].costo); att['P fin ' + yi] = somma(XP, x => x[yi].fin); att['P cof ' + yi] = somma(XP, x => x[yi].costo - x[yi].fin);
      att['B tot ' + yi] = somma(XB, x => x[yi].spesa); att['B fin ' + yi] = somma(XB, x => x[yi].fin); att['B cof ' + yi] = somma(XB, x => x[yi].spesa - x[yi].fin);
      att['Prev com ' + yi] = somma(d.personnel, p => (p.aOre[yi] || 0) * p.eur * (p.oreT * p.eur ? (p.oreT * p.eur - p.cofin) / (p.oreT * p.eur) : 0)) + somma(d.beni, b => (b.aImp[yi] || 0) * (b.forf ? (b.forf - b.cofin) / b.forf : 0)); });
    const budTot = somma(d.personnel, p => p.oreT * p.eur) + somma(d.beni, b => b.forf), budCof = somma(d.personnel, p => p.cofin) + somma(d.beni, b => b.cofin);
    const speso = somma(XP, x => somma(x, y => y.costo)) + somma(XB, x => somma(x, y => y.spesa));
    const cofRich = speso < budTot ? speso * budCof / budTot : budCof; const finSp = Math.min(speso - cofRich, budTot - budCof);
    att['speso'] = speso; att['tua quota'] = cofRich; att['finanziato'] = finSp; att['saldo'] = finSp - somma(d.fatture, f => f.importo);
    const { ctx } = await L.contesto({ kv: { 'usoint-idx': [{ id: 'px', title: d.title, start: d.start, end: d.end, vincolo: vin }], 'usoint-p-px': d } }); const T = await L.pagina(ctx);
    await T.page.setViewportSize({ width: 1500, height: 900 }); await T.page.goto(L.BASE + 'uso/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
    await T.page.evaluate(tt => { const el = [...document.querySelectorAll('div')].filter(x => getComputedStyle(x).cursor === 'pointer' && x.innerText.includes(tt)); el[el.length - 1].click(); }, d.title); await L.aspetta(T, 800);
    const v = await T.page.evaluate(() => { const riga = re => { const tr = [...document.querySelectorAll('tr')].find(x => x.cells && x.cells[0] && re.test(x.cells[0].innerText.trim())); return tr ? [...tr.cells].map(c => c.innerText.trim()) : null; };
      const t = document.body.innerText; const dopo = (lab) => { const i = t.indexOf(lab); return i < 0 ? '' : (t.slice(i + lab.length).match(/-?€\s?-?[\d.]+,\d\d/) || [''])[0]; };
      return { P: riga(/^Personale$/), B: riga(/^Beni\/Servizi$/), TOT: riga(/^TOTALE$/), C: riga(/^Quota Committente$/), speso: dopo('Speso complessivo'), tua: dopo('Tua quota ('), fin: dopo('Finanziato che ti spetta'), saldo: dopo('SALDO FINALE DA FATTURARE'), inpiu: dopo('HAI GIÀ FATTURATO IN PIÙ'), alline: t.includes('FATTURAZIONE ALLINEATA') }; });
    const R2 = a => Math.round(Number((a * 100).toPrecision(12))) / 100; /* come R2 dell'app: toglie il rumore dei decimali e arrotonda a metà in su */
    const conf = (k, s) => { const a = att[k]; const x = num(s); if (Math.abs(x - R2(a)) > 0.0051) { ko++; err.push(`prog ${t} ${k}: video ${s} · atteso ${it(a)} (a=${a} x=${x})`); } else ok++; };
    cy.forEach((c, yi) => { const o = yi * 4; conf('P ore ' + yi, v.P[1 + o]); conf('P tot ' + yi, v.P[2 + o]); conf('P fin ' + yi, v.P[3 + o]); conf('P cof ' + yi, v.P[4 + o]);
      att['T tot ' + yi] = att['P tot ' + yi] + att['B tot ' + yi]; att['T fin ' + yi] = att['P fin ' + yi] + att['B fin ' + yi]; conf('T tot ' + yi, v.TOT[2 + o]); conf('T fin ' + yi, v.TOT[3 + o]);
      if (Math.abs(num(v.TOT[2 + o]) - num(v.P[2 + o]) - num(v.B[2 + o])) > 0.0051) centesimi.push(`prog ${t} anno ${yi}: TOTALE ${v.TOT[2 + o]} ≠ ${v.P[2 + o]} + ${v.B[2 + o]}`);
      conf('B tot ' + yi, v.B[2 + o]); conf('B fin ' + yi, v.B[3 + o]); conf('B cof ' + yi, v.B[4 + o]); conf('Prev com ' + yi, v.C[1 + yi * 3]); });
    conf('speso', v.speso); conf('tua quota', v.tua); conf('finanziato', v.fin); if (att['saldo'] > 0.01) conf('saldo', v.saldo); else if (att['saldo'] < -0.01) { att['saldo'] = -att['saldo']; conf('saldo', v.inpiu); } else { if (v.alline) ok++; else { ko++; err.push(`prog ${t} saldo: atteso «FATTURAZIONE ALLINEATA»`); } }
    if (T.errori.length) { ko++; err.push(`prog ${t}: errori di pagina ${T.errori.join(' | ')}`); }
    await ctx.close();
  }
  await L.chiudi(); console.log(`e2e158: ${N} progetti · valori confrontati ${ok + ko} · uguali ${ok} · diversi ${ko}`); err.slice(0, 20).forEach(x => console.log('  ' + x)); console.log(`righe di totale che differiscono di un centesimo dalla somma delle righe mostrate: ${centesimi.length}`); centesimi.slice(0, 5).forEach(x => console.log('  ' + x));
  process.exitCode = ko ? 1 : 0;
})();
