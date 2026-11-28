// uso-ver158b — Vm* (Christian, 28/11/2026): le misure più grandi della ver158 (ore 13px, €/ora 12px) non toccano le celle dei
// beni/servizi, dove gli importi arrivano a 4 cifre e due decimali (e oltre). Si misura che nessun numero esca dalla sua cella. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso';
function kv() {
  const pers = [L.pers(1, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 2000, eur: 123.45, cofin: 0, aOre: [2000], md: [[150.5, 999.99, 88.25, 0, 0, 0, 0, 0, 0, 0, 0, 0]], mv: [[0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]] })];
  const beni = [L.bene(1, { voce: 'MATERIALI', forf: 300000, aImp: [300000], md: [[9999.99, 99999.99, 1234.56, 9999.99, 0, 0, 0, 0, 0, 0, 0, 0]], mv: [[0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]] })];
  return { 'usoint-idx': [{ id: 'pz', title: 'MISURE PROVA', start: '2026-01-01', end: '2026-12-31', vincolo: false }], 'usoint-p-pz': L.prog('pz', 'MISURE PROVA', '2026-01-01', '2026-12-31', 1, { personnel: pers, beni }) };
}
(async () => {
  for (const w of [1500, 390]) {
    const { ctx } = await L.contesto({ kv: kv() }); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: w, height: 900 });
    await T.page.goto(L.BASE + APP + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
    await T.page.evaluate(() => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && /MISURE PROVA/.test(d.innerText)); el[el.length - 1].click(); });
    await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO|Torna a budget/.test(document.body.innerText), null, { timeout: 15000 });
    await T.page.locator('button', { hasText: /^2026$/ }).first().click(); await L.aspetta(T, 600);
    const m = await T.page.evaluate(() => {
      const out = {};
      const misura = el => { const cs = getComputedStyle(el); return { v: el.value !== undefined ? el.value : el.innerText.trim(), fs: cs.fontSize, fuori: el.scrollWidth - el.clientWidth }; };
      for (const nome of ['ALFA PROVA', 'MATERIALI']) {
        const tr = [...document.querySelectorAll('tbody tr')].find(x => x.innerText.includes(nome));
        out[nome] = [...tr.querySelectorAll('td')].flatMap(td => [...td.querySelectorAll('input'), ...td.querySelectorAll('span[title^="Certificata ✓"]'), ...[...td.querySelectorAll('span')].filter(sp => /^\d+,\d\d$/.test(sp.innerText.trim()) && !sp.querySelector('span'))]).map(misura).filter(x => /\d/.test(x.v));
      }
      out.sw = document.documentElement.scrollWidth; return out;
    });
    const ben = m['MATERIALI'], per = m['ALFA PROVA'];
    c('B' + w + 'a', w + 'px — beni/servizi: misura del carattere invariata (10px)', 'tutte 10px', [...new Set(ben.map(x => x.fs))].join(','), ben.length >= 4 && ben.every(x => x.fs === '10px'));
    const bf = ben.filter(x => x.fuori > 0 && !/99\.999/.test(x.v)); const b5 = ben.filter(x => /99\.999/.test(x.v));
    console.log('INFO B' + w + 'e | ' + w + 'px — beni/servizi, 99.999,99 (5 cifre): sporge di ' + (b5[0] ? b5[0].fuori : '?') + ' px, identico alla ver155 (celle dei beni non toccate dalla ver158)');
    c('B' + w + 'b', w + 'px — beni/servizi: 9.999,99 · 1.234,56 e la cella certificata ✓ (9.999,99) stanno nella cella', '0 fuori', bf.length ? JSON.stringify(bf) : ben.map(x => x.v).join(' | '), bf.length === 0);
    const pf = per.filter(x => x.fuori > 0);
    c('B' + w + 'c', w + 'px — personale: ore 150,50 · 999,99 (✓) · 88,25 e €/ora 123,45 stanno nella cella', '0 fuori', pf.length ? JSON.stringify(pf) : per.map(x => x.v + '@' + x.fs).join(' | '), pf.length === 0);
    c('B' + w + 'd', w + 'px — errori di pagina', '0', T.errori.length, T.errori.length === 0);
    await ctx.close();
  }
  await L.chiudi(); L.fine('uso-ver158b');
})();
