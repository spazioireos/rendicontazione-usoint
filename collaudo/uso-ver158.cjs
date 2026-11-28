// uso-ver158 — vista mesi (Christian, 28/11/2026): scritte incolonnate con interlinea stretta, nomi in grassetto, ore a 13px e importo
// orario a 12px, il simulatore di spalmatura col costo del mese, e «La cella certificata con la spunta deve essere difficilmente modificabile, per evitare errori».
// Confronto con la ver157 in /uso157/. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso';
function kv() {
  const pers = [L.pers(1, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 200, eur: 10, cofin: 400, aOre: [200], cessato: '2026-05-31', cessTipo: 'sub', md: [[20, 20, 20, 20, 20, 0, 0, 0, 0, 0, 0, 0]], mv: [[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]] })];
  const beni = [L.bene(1, { voce: 'MATERIALI', forf: 500, aImp: [500], md: [[100, 50, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]], mv: [[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]] })];
  return { 'usoint-idx': [{ id: 'pc', title: 'CERT PROVA', start: '2026-01-01', end: '2026-12-31', vincolo: true }], 'usoint-p-pc': L.prog('pc', 'CERT PROVA', '2026-01-01', '2026-12-31', 1, { vincolo: true, personnel: pers, beni }) };
}
async function apri(app) { const { ctx } = await L.contesto({ kv: kv() }); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: 1500, height: 900 });
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await T.page.evaluate(() => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && /CERT PROVA/.test(d.innerText)); el[el.length - 1].click(); });
  await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO|Torna a budget/.test(document.body.innerText), null, { timeout: 15000 });
  await T.page.locator('button', { hasText: /^2026$/ }).first().click(); await L.aspetta(T, 500); return { ctx, T }; }
const riga = (T, re) => T.page.evaluate(r => { const tr = [...document.querySelectorAll('tbody tr')].find(x => new RegExp(r).test(x.innerText)); const tds = [...tr.querySelectorAll('td')]; return tds.map(td => ({ inp: td.querySelectorAll('input').length, t: td.innerText.replace(/\s+/g, ' ').trim() })); }, re);
const P = async T => JSON.parse(await L.ls(T, 'usoint-p-pc'));
(async () => {
  { const { ctx, T } = await apri('uso157'); const r = await riga(T, 'ALFA PROVA'); c('V00', 'ver157 (confronto): GEN certificata ✓ ma ancora scrivibile (casella)', 'casella in GEN', r[6].inp, r[6].inp === 1); await ctx.close(); }
  const { ctx, T } = await apri(APP);
  let r = await riga(T, 'ALFA PROVA');
  c('V01', 'GEN certificata ✓: niente casella, valore 20,00 bloccato; FEB non certificata resta scrivibile', 'GEN 0 caselle · FEB 1', r[6].inp + ' · ' + r[7].inp + ' · ' + r[6].t.slice(0, 20), r[6].inp === 0 && /^✓ 20,00/.test(r[6].t) && r[7].inp === 1);
  const st = await T.page.evaluate(() => { const s = [...document.querySelectorAll('span[title^="Certificata ✓"]')][0]; const cs = getComputedStyle(s); return { bc: cs.borderColor, bg: cs.backgroundColor, fs: cs.fontSize }; });
  c('V02', 'Cella certificata: grigia, bordo verde, 13px', 'grigio · verde · 13px', JSON.stringify(st), st.bg === 'rgb(241, 245, 249)' && st.bc === 'rgb(22, 163, 74)' && st.fs === '13px');
  T.risposte.push({ re: /è certificata ✓/, dismiss: true });
  await T.page.locator('span[title^="Certificata ✓"]').first().dblclick(); await L.aspetta(T, 300); r = await riga(T, 'ALFA PROVA');
  c('V03', 'Doppio clic e Annulla: resta certificata e bloccata', 'domanda · 0 caselle', T.dialoghi.filter(d => /è certificata ✓/.test(d.msg)).length + ' · ' + r[6].inp, T.dialoghi.filter(d => /è certificata ✓/.test(d.msg)).length === 1 && r[6].inp === 0);
  T.risposte.push({ re: /è certificata ✓/ });
  await T.page.locator('span[title^="Certificata ✓"]').first().dblclick(); await L.aspetta(T, 300); r = await riga(T, 'ALFA PROVA');
  const v = await T.page.evaluate(() => { const tr = [...document.querySelectorAll('tbody tr')].find(x => /ALFA PROVA/.test(x.innerText)); return tr.querySelectorAll('td')[6].querySelector('input').value; });
  c('V04', 'Doppio clic e OK: tolta la ✓, la cella torna scrivibile col valore di prima', 'casella · 20,00 · ○', r[6].inp + ' · ' + v + ' · ' + r[6].t.slice(-1), r[6].inp === 1 && v === '20,00' && /○/.test(r[6].t));
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300); let d = await P(T);
  c('V05', 'Col 💾: mv di GEN a 0, ore 20 invariate', 'mv 0 · md 20', d.personnel[0].mv[0][0] + ' · ' + d.personnel[0].md[0][0], d.personnel[0].mv[0][0] === 0 && d.personnel[0].md[0][0] === 20);
  // beni
  let b = await riga(T, 'MATERIALI');
  const ib = b.findIndex(x => /€ 100,00/.test(x.t));
  c('V06', 'Beni/servizi: GEN certificata bloccata (€ 100,00), FEB scrivibile', 'GEN 0 caselle · FEB 1', ib >= 0 ? (b[ib].inp + ' · ' + b[ib + 1].inp) : 'non trovata', ib >= 0 && b[ib].inp === 0 && b[ib + 1].inp === 1);
  T.risposte.push({ re: /è certificata ✓/ }); await T.page.locator('span[title^="Certificata ✓"]').first().dblclick(); await L.aspetta(T, 300);
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300); d = await P(T);
  c('V07', 'Beni: doppio clic e OK toglie la ✓ (importo invariato)', 'mv 0 · md 100', d.beni[0].mv[0][0] + ' · ' + d.beni[0].md[0][0], d.beni[0].mv[0][0] === 0 && d.beni[0].md[0][0] === 100);
  // certificare di nuovo col ○: si blocca
  await T.page.evaluate(() => { const tr = [...document.querySelectorAll('tbody tr')].find(x => /ALFA PROVA/.test(x.innerText)); [...tr.querySelectorAll('td')[7].querySelectorAll('span')].find(s => s.innerText === '○').click(); }); await L.aspetta(T, 300);
  r = await riga(T, 'ALFA PROVA'); c('V08', 'Clic sul ○ di FEB: certificata e subito bloccata', '0 caselle', r[7].inp, r[7].inp === 0);
  // grafica
  const g = await T.page.evaluate(() => { const tr = [...document.querySelectorAll('tbody tr')].find(x => /ALFA PROVA/.test(x.innerText)); const tds = tr.querySelectorAll('td'); const nome = [...tds[0].querySelectorAll('span')][0]; const ore = tds[8].querySelector('input'); const eff = tds[3].querySelector('input,span'); const prev = tds[2].querySelector('span'); return { nomeW: getComputedStyle(nome).fontWeight, ore: getComputedStyle(ore).fontSize, eff: getComputedStyle(eff).fontSize, prev: getComputedStyle(prev).fontSize, sw: document.documentElement.scrollWidth }; });
  c('V09', 'Nome in grassetto (800), ore 13px, €/ora eff. 12px, €/ora prev. 12px', '800 · 13 · 12 · 12', JSON.stringify(g), g.nomeW === '800' && g.ore === '13px' && g.eff === '12px' && g.prev === '12px');
  const lab = await T.page.evaluate(() => { const tr = [...document.querySelectorAll('tbody tr')].find(x => /ALFA PROVA/.test(x.innerText)); const sp = [...tr.querySelectorAll('td')[0].querySelectorAll('span')]; return sp.map(s => Math.round(s.getBoundingClientRect().top)); });
  c('V10', 'Nominativo: nome, cessazione e ruolo uno sotto l\'altro', '3 righe crescenti', JSON.stringify(lab), lab.length === 3 && lab[0] < lab[1] && lab[1] < lab[2]);
  c('V11', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0);
  await ctx.close();
  // simulatore di spalmatura: le ore simulate si valutano col costo del mese (ver157: cambio «dal mese»)
  for (const app of ['uso157', APP]) {
    const pers = [L.pers(1, { nome: 'SIM PROVA', voce: 'EDUCATORE', oreT: 400, eur: 10, cofin: 0, aOre: [400], eurDal: [{ yi: 0, m: 6, eur: 15 }], md: [[10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]] })];
    const h = Array(12).fill(0); h[0] = 5; h[6] = 5;
    const k = { 'usoint-idx': [{ id: 'ps', title: 'SIM PRJ', start: '2026-01-01', end: '2026-12-31', vincolo: false }], 'usoint-p-ps': L.prog('ps', 'SIM PRJ', '2026-01-01', '2026-12-31', 1, { personnel: pers }), 'usoint-simul': { 'sim prova': { 2026: { 'SIM PRJ': { h, c: Array(12).fill(0) } } } } };
    const { ctx } = await L.contesto({ kv: k }); const T2 = await L.pagina(ctx); await T2.page.setViewportSize({ width: 1500, height: 900 });
    await T2.page.goto(L.BASE + app + '/index.html'); await T2.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
    await T2.page.click('button:has-text("👥 Riepilogo operatori")'); await L.aspetta(T2, 1200);
    const s0 = T2.page.locator('select').first(); const vv = await s0.evaluate(s => { const o = Array.from(s.options).find(o => o.text === 'SIM PROVA'); return o ? o.value : null; }); if (vv) { await s0.selectOption(vv); await L.aspetta(T2, 600); }
    const riga2 = await T2.page.evaluate(() => { const tr = [...document.querySelectorAll('tr')].find(x => /SIM PRJ/.test(x.innerText) && x.querySelector('input[style*="width: 38px"]')); return tr ? tr.innerText.replace(/\s+/g, ' ') : ''; });
    const e = (riga2.match(/€ [\d.]+,\d\d/) || [''])[0];
    if (app === 'uso157') c('V12', 'ver157 (confronto): simulatore 5 h a GEN + 5 h a LUG valutate tutte a 10 €', '€ 100,00', e, e === '€ 100,00');
    else c('V13', 'Simulatore: 5 h a GEN (10 €) + 5 h a LUG (15 €, cambio dal mese) = € 125,00', '€ 125,00', e, e === '€ 125,00');
    await ctx.close();
  }
  await L.chiudi(); L.fine('uso-ver158');
})();
