// uso-ver155 — Christian: «le cose che non sono da compilare non vanno mai in giallino, anche se potrei farlo».
// Grigie: Budget ric.€ (lo scrive il Trasferisci), € Finanz. col cofinanziamento unico in %, €/ora eff. della vista mesi quando è
// quello del budget (doppio clic per cambiarlo), Lavorate arrivate da Dipendenti (doppio clic per correggerle).
// Banco comune 8340, confronto con la ver154 in /uso154/. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const K = require('./interconnessioni/ic-01-comune.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso';
const Z = () => Array(12).fill(0);
const kvB = (pct) => ({ 'usoint-idx': [{ id: 'pg', title: 'GIAL PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: true }], 'usoint-p-pg': L.prog('pg', 'GIAL PROVA', '2026-01-01', '2027-12-31', 2, Object.assign({ vincolo: true,
  personnel: [L.pers(2, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, cofin: 2000, aOre: [250, 250], cessato: '2026-06-15', cessTipo: 'sub', md: [[10, 10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0], Z()] }),
    L.pers(2, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 0, eur: 0, aOre: [0, 0], subentro: '2026-06-16', subentroDi: 'ALFA PROVA' }),
    L.pers(2, { nome: 'GAMMA PROVA', voce: 'ANIMATORE', oreT: 100, eur: 18, cofin: 360, aOre: [50, 50], md: [[10, 10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0], Z()] })],
  beni: [{ voce: 'MATERIALI', forf: 1000, cofin: 200, aImp: [500, 500], aElim: [0, 0], cessato: '', ricevute: 0, budgetRic: 0, recBlk: [], md: [Z(), Z()] }] }, pct ? { cofinMode: 'pct', cofinPct: 20 } : {})) });
async function apri(app, kv) {
  const { ctx } = await L.contesto({ kv }); const T = await L.pagina(ctx); await T.page.setViewportSize({ width: 1400, height: 900 });
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await T.page.evaluate(() => { const el = [...document.querySelectorAll('div')].filter(d => getComputedStyle(d).cursor === 'pointer' && /GIAL PROVA/.test(d.innerText)); el[el.length - 1].click(); });
  await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO|Torna a budget/.test(document.body.innerText), null, { timeout: 15000 }); await L.aspetta(T, 300); return { ctx, T };
}
const grigi = (T, re) => T.page.evaluate(r => [...document.querySelectorAll('span')].filter(s => s.title && new RegExp(r).test(s.title) && getComputedStyle(s).backgroundColor === 'rgb(241, 245, 249)').map(s => s.innerText), re);
(async () => {
  // 1. Budget ric.€
  for (const app of ['uso154', APP]) {
    const { ctx, T } = await apri(app, kvB(false)); T.risposte.push({ re: /Trasferire/ }, { re: /subentra/ });
    await T.page.locator('button', { hasText: 'Trasferisci 2026' }).click(); await L.aspetta(T, 500);
    const g = await grigi(T, 'Importo ricevuto col «Trasferisci»'); const inp = await T.page.evaluate(() => [...document.querySelectorAll('input')].filter(e => e.value === '€ 0,00' && e.closest('span') && /Budget ric/.test(e.closest('span').innerText)).length);
    if (app === 'uso154') c('B00', 'ver154 (confronto): Budget ric.€ giallo e scrivibile, a 0', 'casella gialla', inp + ' caselle', inp === 1);
    else { const lab = await T.page.locator('span[title^="Euro ricevuti col «Trasferisci»"]').allInnerTexts(); c('B01', 'Dopo il Trasferisci nessuna casella gialla; dalla ver156 si legge «+€ 3.800,00 @ …%» (euro ricevuti)', '+€ 3.800,00 @ · 0 caselle', JSON.stringify(lab) + ' · ' + inp, lab.length === 1 && /^\+€ 3\.800,00 @/.test(lab[0]) && inp === 0); }
    await ctx.close();
  }
  // 2. € Finanz. col % unico
  { const { ctx, T } = await apri(APP, kvB(true)); const g = await grigi(T, 'percentuale unica del cofinanziamento');
    c('F01', '% unico: € Finanz. grigio per le 2 persone col budget e per il bene', '8.000,00 · 1.440,00 · 800,00', JSON.stringify(g), g.length === 3 && g.includes('8.000,00') && g.includes('1.440,00') && g.includes('800,00')); await ctx.close(); }
  { const { ctx, T } = await apri(APP, kvB(false)); const g = await grigi(T, 'percentuale unica del cofinanziamento');
    c('F02', 'Cofinanziamento «diverso per ogni voce»: € Finanz. resta scrivibile', 'nessuna grigia', JSON.stringify(g), g.length === 0); await ctx.close(); }
  // 3. €/ora eff. nella vista mesi
  { const { ctx, T } = await apri(APP, kvB(false)); await T.page.locator('button', { hasText: /^2026$/ }).first().click(); await L.aspetta(T, 500);
    let g = await grigi(T, 'Costo orario preso dal budget'); c('E01', 'Vista mesi: €/ora eff. preso dal budget grigio (ALFA 20, GAMMA 18)', '20,00 · 18,00', JSON.stringify(g), g.length === 2 && g.includes('20,00') && g.includes('18,00'));
    const giallo = await T.page.evaluate(() => [...document.querySelectorAll('input')].filter(e => getComputedStyle(e).backgroundColor === 'rgb(255, 253, 231)' && e.closest('td') && /0,00/.test(e.value) && e.getBoundingClientRect().x < 700).length);
    c('E02', 'Il subentrante senza costo orario resta da compilare (giallo)', '≥1 casella gialla', giallo, giallo >= 1);
    T.risposte.push({ re: /Nuovo costo orario di/, text: '25,5' }, { re: /Da quale mese del 2026/, text: '1' }); /* ver157: il doppio clic chiede anche da quale mese */
    await T.page.locator('span[title^="Costo orario preso dal budget (€ 18"]').dblclick(); await L.aspetta(T, 400);
    g = await grigi(T, 'Costo orario preso dal budget'); await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
    const P = JSON.parse(await L.ls(T, 'usoint-p-pg')).personnel;
    c('E03', 'Doppio clic e 25,5 dal mese 1 (ver157: cambio «dal mese», la casella resta grigia e mostra 25,50)', 'eurDal [{yi 0, m 0, eur 25,5}] · eurA invariato · grigia 25,50', JSON.stringify(P[2].eurDal) + ' · ' + JSON.stringify(P[2].eurA) + ' · ' + JSON.stringify(await T.page.locator('span[title*="da un cambio «dal mese»"]').allInnerTexts()), JSON.stringify(P[2].eurDal) === '[{"yi":0,"m":0,"eur":25.5}]' && P[2].eurA.every(x => !x) && (await T.page.locator('span[title*="da un cambio «dal mese»"]').allInnerTexts()).includes('25,50'));
    c('E04', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0); await ctx.close(); }
  // 4. Lavorate importate (finta Firebase dei Dipendenti)
  const { FO, USO, ADMIN, PWD, ADMIN_UID } = K;
  const prj = K.progettoUso('p1', 'PROGETTO PROVA', ['ROSSI MARIO', 'BIANCHI ANNA']); prj.start = '2026-01-01'; prj.end = '2026-12-31'; prj.personnel[0].md = [[2, 3, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0]]; prj.personnel[0].aOre = [100]; prj.personnel[1].md = [[1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]];
  const seed = { id: 'uso155', [FO]: { reset: true, users: [{ email: ADMIN, password: PWD, uid: ADMIN_UID }], docs: Object.assign({}, K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'), { ['report-ore-mensile/' + ADMIN_UID]: { dipendenti: [K.dipendente('d1', 'ROSSI MARIO', {})], dati: { '2026-01': { d1: { giorni: { '1': 3, '2': 4 } } }, '2026-02': { d1: { giorni: { '3': 5 } } } }, anni: [2026], version: 4 } }) },
    [USO]: { reset: true, users: [{ email: 'uso@prova.it', password: PWD, uid: 'USO0001' }], docs: Object.assign({}, K.kvUso('USO0001', 'usoint-idx', [{ id: 'p1', title: 'PROGETTO PROVA', start: '2026-01-01', end: '2026-12-31' }]), K.kvUso('USO0001', 'usoint-p-p1', prj)) } };
  const browser = await K.chromium.launch(); const ctx = await K.contesto(browser, { seed }); const uso = await K.pagina(ctx);
  await K.loginUso(uso); await K.usoRiepilogo(uso); await K.attesa(1500);
  const sel = async nm => { const s = uso.locator('select').first(); const v = await s.evaluate((s, n) => { const o = [...s.options].find(o => o.text === n); return o && o.value; }, nm); await s.selectOption(v); await K.attesa(500); };
  const gr = () => uso.evaluate(() => [...document.querySelectorAll('span[title^="Ore arrivate da Dipendenti"]')].map(x => x.innerText));
  await sel('ROSSI MARIO'); let g = await gr();
  c('L01', 'Riepilogo: le 12 caselle di ROSSI MARIO (in Dipendenti) sono grigie, GEN 7 e FEB 5', '7,00 · 5,00 · 10 «—»', JSON.stringify(g), g.length === 12 && g[0] === '7,00' && g[1] === '5,00' && g.slice(2).every(x => x === '—'));
  uso.__risposte.push({ re: /Ore lavorate di/, val: '8' });
  await uso.locator('span[title^="Ore arrivate da Dipendenti"]').nth(2).dblclick(); await K.attesa(400); g = await gr();
  const lv = await uso.evaluate(() => [...document.querySelectorAll('input')].filter(e => e.value === '8,00').length);
  c('L02', 'Doppio clic su MAR e 8: diventa una casella scritta a mano (gialla)', '11 grigie + 1 casella 8,00', g.length + ' grigie · ' + lv, g.length === 11 && lv === 1);
  await sel('BIANCHI ANNA'); g = await gr();
  c('L03', 'BIANCHI ANNA (non in Dipendenti): caselle gialle da compilare', '0 grigie', g.length, g.length === 0);
  c('L04', 'Errori di pagina', '0', uso.__errori.length, uso.__errori.length === 0);
  await browser.close(); await L.chiudi(); L.fine('uso-ver155');
})();
