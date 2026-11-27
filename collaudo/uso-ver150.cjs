// uso-ver150 — budget, PERSONALE: i titolari stanno a sinistra e i subentranti rientrano (↳), anche quando la riga del
// subentrante è più lunga per le etichette («+190,00 h …», «SUB.»), che nella ver149 la spingevano a SINISTRA. Nome e ruolo al 90%.
// Confronto con la ver149 congelata in /uso149/. USO_APP=cartella da provare (predefinita: uso). USO_PNG=cartella salva l'anteprima.
// SOLO DATI INVENTATI.   NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-ver150.cjs
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso', PNG = process.env.USO_PNG || '';
const nY = 2, md = () => [[10, 10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0], Array(12).fill(0)];
const per = () => [L.pers(nY, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: [250, 250], cessato: '2026-06-15', md: md() }),
  L.pers(nY, { nome: 'BETA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: [250, 250], subentro: '2026-06-16', subentroDi: 'ALFA PROVA' }),
  L.pers(nY, { nome: 'GAMMA PROVA', voce: 'ASSISTENTE EDUCATIVO', oreT: 500, eur: 20, aOre: [250, 250] }),
  L.pers(nY, { nome: 'DELTA PROVA', voce: 'ASSISTENTE EDUCATIVO', oreT: 300, eur: 20, aOre: [150, 150], subentro: '2026-09-01' }),
  L.pers(nY, { nome: 'EPSILON PROVA', voce: 'EDUCATORE', oreT: 100, eur: 20, aOre: [100, 0], md: [Array(12).fill(0).map((x, i) => i < 10 ? 10 : 0), Array(12).fill(0)] })];
const KV = () => ({ 'usoint-idx': [{ id: 'pr', title: 'RIASS PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: true }], 'usoint-p-pr': L.prog('pr', 'RIASS PROVA', '2026-01-01', '2027-12-31', nY, { vincolo: true, personnel: per() }) });
async function misura(app, vp) {
  const { ctx } = await L.contesto({ kv: KV(), viewport: vp, dsf: PNG ? 2 : 1 }); const T = await L.pagina(ctx);
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await L.apriProgetto(T, 'RIASS PROVA'); await L.aspetta(T, 500);
  T.risposte.push({ re: /Trasferire/ }, { re: /subentra/ });
  await T.page.locator('button', { hasText: 'Trasferisci 2026' }).click(); await L.aspetta(T, 500);
  const m = await T.page.evaluate(() => { const ins = [...document.querySelectorAll('input')]; const o = {}; ['ALFA PROVA', 'BETA PROVA', 'GAMMA PROVA', 'DELTA PROVA', 'EPSILON PROVA'].forEach(n => { const x = ins.find(i => i.value === n); o[n.split(' ')[0]] = x ? { l: Math.round(x.getBoundingClientRect().left), fs: getComputedStyle(x).fontSize } : null; }); const v = ins.find(i => i.value === 'EDUCATORE'); o.voce = v ? { fs: getComputedStyle(v).fontSize, ls: getComputedStyle(v).letterSpacing } : null; o.largo = document.documentElement.scrollWidth <= innerWidth; return o; });
  if (PNG && !vp) { await T.page.evaluate(() => { const d = [...document.querySelectorAll('div')].find(x => x.innerText === 'PERSONALE — Budget'); d.scrollIntoView(); }); await L.aspetta(T, 200);
    const bb = await T.page.evaluate(() => { const r = [...document.querySelectorAll('div')].find(x => x.innerText === 'PERSONALE — Budget').getBoundingClientRect(); return { x: r.x, y: r.y }; });
    await T.page.screenshot({ path: PNG + '/Anteprima rientro subentranti - 27nov26 - ' + (app === 'uso149' ? 'ver149' : 'ver150') + '.png', clip: { x: bb.x, y: bb.y, width: 620, height: 300 } }); }
  m.err = T.errori.length; await ctx.close(); return m;
}
(async () => {
  const v149 = await misura('uso149');
  c('R00', 'ver149 (confronto): il subentrante con le etichette finisce a SINISTRA del titolare', 'BETA < ALFA', JSON.stringify({ ALFA: v149.ALFA.l, BETA: v149.BETA.l }), v149.BETA.l < v149.ALFA.l);
  const v = await misura(APP);
  c('R01', 'I titolari (ALFA cessata, GAMMA, EPSILON col ✓ di budget raggiunto) partono tutti dallo stesso punto', 'stessa x', [v.ALFA.l, v.GAMMA.l, v.EPSILON.l].join(' · '), v.ALFA.l === v.GAMMA.l && v.GAMMA.l === v.EPSILON.l);
  c('R02', 'I subentranti (BETA con etichette, DELTA senza) rientrano dello stesso tanto', 'BETA = DELTA = titolari + 20…32px', [v.BETA.l, v.DELTA.l, v.BETA.l - v.ALFA.l].join(' · '), v.BETA.l === v.DELTA.l && v.BETA.l - v.ALFA.l >= 20 && v.BETA.l - v.ALFA.l <= 32);
  c('R03', 'Nome al 90% (9px) e ruolo al 90% (9,45px) senza spaziatura in più', '9px · 9.45px · normal/0px', v.BETA.fs + ' · ' + v.voce.fs + ' · ' + v.voce.ls, v.BETA.fs === '9px' && v.voce.fs === '9.45px' && /normal|^0px/.test(v.voce.ls));
  c('R04', 'Errori di pagina', '0', v.err, v.err === 0);
  const t = await misura(APP, { width: 390, height: 844 });
  c('R05', 'A 390px la pagina non scorre di lato', 'sì', t.largo, t.largo && t.err === 0);
  await L.chiudi(); L.fine('uso-ver150');
})();
