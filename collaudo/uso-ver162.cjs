// uso-ver162 (28/11/2026, Christian: «2b»): annualità tutte vuote = totale sulla prima annualità anche per le righe CESSATE, ma solo se non hanno
// passato ore col sistema vecchio (nessun trasferimento in ore su di loro, nessuna riga della stessa sezione con ore ricevute col sistema vecchio).
// Confronto con la ver161 in /uso161/. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso';
const P1 = L.prog('p1', 'CESSATI PROVA', '2026-01-01', '2027-12-31', 2, {
  personnel: [L.pers(2, { nome: 'ALFA PROVA', voce: 'REFERENTE', oreT: 50, eur: 20 }), L.pers(2, { nome: 'VERDI PROVA', voce: 'EDUCATORE', oreT: 100, eur: 20, cessato: '2026-06-30', md: [[10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], Array(12).fill(0)] })],
  beni: [L.bene(2, { voce: 'MATERIALI PROVA', forf: 300, cofin: 0, cessato: '2026-06-30' })] });
const P2 = L.prog('p2', 'PASSAGGIO PROVA', '2026-01-01', '2027-12-31', 2, {
  personnel: [L.pers(2, { nome: 'ROSSI PROVA', voce: 'EDUCATORE', oreT: 100, eur: 20, cessato: '2026-01-31' }),
    L.pers(2, { nome: 'BIANCHI PROVA', voce: 'EDUCATORE', oreT: 0, eur: 20, aOre: [100, 0], subentro: '2026-02-01', recBlk: [{ ore: 100, Iorig: 100 }], ricevute: 100, budgetRic: 2000 })] });
const P3 = L.prog('p3', 'TRASF PROVA', '2026-01-01', '2027-12-31', 2, {
  personnel: [L.pers(2, { nome: 'GAMMA PROVA', voce: 'EDUCATORE', oreT: 100, eur: 20, cessato: '2026-01-31', trasf: [{ k: 0, a: 'DELTA PROVA', imp: 2000, ore: 100, il: '2026-02-01' }] }),
    L.pers(2, { nome: 'DELTA PROVA', voce: 'EDUCATORE', oreT: 100, eur: 20, aOre: [100, 0] })] });
const kv = () => ({ 'usoint-idx': [P1, P2, P3].map(p => ({ id: p.id, title: p.title, start: p.start, end: p.end, vincolo: false })), 'usoint-p-p1': P1, 'usoint-p-p2': P2, 'usoint-p-p3': P3 });
async function apri(app, tit) { const { ctx } = await L.contesto({ kv: kv() }); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: 1500, height: 900 });
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await T.page.evaluate(t => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && d.innerText.includes(t)); el[el.length - 1].click(); }, tit); await L.aspetta(T, 800); return { ctx, T }; }
const auto = T => T.page.evaluate(() => [...document.querySelectorAll('span[title^="Automatico"]')].map(s => s.innerText.trim()));
const prev = T => T.page.evaluate(() => { const tr = [...document.querySelectorAll('tr')].find(x => x.cells && x.cells[0] && /^Quota Committente$/.test(x.cells[0].innerText.trim())); return tr ? [...tr.cells].map(x => x.innerText.trim()) : null; });
(async () => {
  { const { ctx, T } = await apri('uso161', 'CESSATI PROVA'); const a = await auto(T), q = await prev(T);
    c('C00', 'ver161 (confronto): la riga cessata VERDI e il bene cessato restano fuori, Previsto 2026 € 1.000,00 su € 3.300,00', '1 cella grigia · € 1.000,00', a.length + ' · ' + (q ? q[1] + ' / ' + q[7] : '?'), a.length === 1 && q && q[1] === '€ 1.000,00'); await ctx.close(); }
  { const { ctx, T } = await apri(APP, 'CESSATI PROVA'); const a = await auto(T), q = await prev(T);
    c('C01', 'Cessati senza passaggi: anche VERDI (100,00 h) e il bene cessato (€ 300,00) hanno il totale grigio sulla prima annualità', '3 celle: 50,00 · 100,00 · € 300,00', JSON.stringify(a), a.length === 3 && a.includes('50,00') && a.includes('100,00') && a.includes('€ 300,00'));
    c('C02', 'Previsto 2026 = Previsto del progetto (€ 3.300,00)', '€ 3.300,00 · € 3.300,00', q ? q[1] + ' · ' + q[7] : '?', q && q[1] === '€ 3.300,00' && q[7] === '€ 3.300,00');
    await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300); const d = JSON.parse(await L.ls(T, 'usoint-p-p1'));
    c('C03', 'Col 💾: VERDI [100,0] segnata automatica, bene [300,0]', '[100,0] true · [300,0] true', JSON.stringify([d.personnel[1].aOre, d.personnel[1].aAuto, d.beni[0].aImp, d.beni[0].aAuto]), d.personnel[1].aOre[0] === 100 && d.personnel[1].aAuto === true && d.beni[0].aImp[0] === 300 && d.beni[0].aAuto === true && !('_annOk' in d.personnel[1]));
    c('C01e', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0); await ctx.close(); }
  { const { ctx, T } = await apri(APP, 'PASSAGGIO PROVA'); const a = await auto(T), q = await prev(T);
    c('C04', 'Passaggio vecchio (BIANCHI ha ricevuto 100 h di ROSSI): ROSSI resta a 0, nessuna cella automatica, le ore non contano due volte', 'nessuna · € 2.000,00', a.length + ' · ' + (q ? q[1] : '?'), a.length === 0 && q && q[1] === '€ 2.000,00'); await ctx.close(); }
  { const { ctx, T } = await apri(APP, 'TRASF PROVA'); const a = await auto(T);
    c('C05', 'Cessato con un trasferimento in ore registrato (GAMMA → DELTA): resta a 0', 'nessuna cella automatica', a.length, a.length === 0); c('C05e', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0); await ctx.close(); }
  await L.chiudi(); L.fine('uso-ver162');
})();
