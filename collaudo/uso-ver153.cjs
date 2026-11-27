// uso-ver153 — riquadro «Riassegnazione residui di operatori cessati»: con «FINE INCARICO PER ESAURIM. €» non c'è più la tendina dei
// subentranti (al suo posto «Nessun subentrante: …»), e dopo «Trasferisci» non si propone il subentro; se un subentrante risulta ancora
// legato compare un ⚠ con «Togli». Con «CESSAZ. CON SUBENTRO» o senza tipo tutto come prima. Confronto con la ver152 in /uso152/.
// Annualità (2026, 2027…) del budget grigie per i subentranti (le scrive il Trasferisci), con ore scritte a mano restano scrivibili.
// USO_APP=cartella (predefinita uso). USO_PNG=cartella salva l'anteprima. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso', PNG = process.env.USO_PNG || '';
const nY = 2, md = () => [[10, 10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0], Array(12).fill(0)];
const KV = (tipo, sub) => ({ 'usoint-idx': [{ id: 'pe', title: 'ESAUR PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: true }], 'usoint-p-pe': L.prog('pe', 'ESAUR PROVA', '2026-01-01', '2027-12-31', nY, { vincolo: true,
  personnel: [L.pers(nY, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: [250, 250], cessato: '2026-06-15', cessTipo: tipo, md: md() }),
    L.pers(nY, Object.assign({ nome: 'BETA PROVA', voce: 'EDUCATORE', oreT: 0, eur: 20, aOre: [0, 0] }, sub ? { subentro: '2026-06-16', subentroDi: 'ALFA PROVA' } : {}))] }) });
async function apri(app, kv) {
  const { ctx } = await L.contesto({ kv, dsf: PNG ? 2 : 1 }); const T = await L.pagina(ctx);
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await L.apriProgetto(T, 'ESAUR PROVA'); await L.aspetta(T, 400); return { ctx, T };
}
const box = T => T.page.locator('div:has(> div:has-text("Riassegnazione residui di operatori cessati"))').last();
const info = T => box(T).evaluate(b => ({ t: b.innerText.replace(/\s+/g, ' '), subSel: [...b.querySelectorAll('select')].some(s => [...s.options].some(o => o.text === '— nessuno —')) }));
(async () => {
  { const { ctx, T } = await apri('uso152', KV('esaur', false)); const i = await info(T);
    c('E00', 'ver152 (confronto): con FINE INCARICO PER ESAURIM. € c\'è ancora la tendina dei subentranti', 'tendina presente', i.subSel, i.subSel); await ctx.close(); }
  { const { ctx, T } = await apri(APP, KV('esaur', false)); let i = await info(T);
    c('E01', 'Esaurimento: niente tendina dei subentranti, al suo posto la frase', '«Nessun subentrante: l\'incarico finisce per esaurimento degli importi.»', i.t.slice(0, 200), !i.subSel && /Nessun subentrante: l'incarico finisce per esaurimento degli importi\./.test(i.t));
    const nd = T.dialoghi.length; T.risposte.push({ re: /Trasferire/ });
    await T.page.locator('button', { hasText: 'Trasferisci 2026' }).click(); await L.aspetta(T, 400);
    c('E02', 'Esaurimento: dopo «Trasferisci» nessuna domanda di subentro', 'solo «Trasferire …»', T.dialoghi.slice(nd).map(d => d.msg.slice(0, 30)).join(' | '), T.dialoghi.slice(nd).length === 1 && !T.dialoghi.slice(nd).some(d => /subentra/.test(d.msg)));
    if (PNG) await box(T).screenshot({ path: PNG + '/Anteprima fine per esaurimento - 27nov26 - ver153.png' });
    await box(T).locator('select').first().selectOption('sub'); await L.aspetta(T, 250); i = await info(T);
    c('E03', 'Cambiando il tipo in CESSAZ. CON SUBENTRO la tendina torna', 'tendina presente', i.subSel, i.subSel);
    c('E04', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0); await ctx.close(); }
  { const { ctx, T } = await apri(APP, KV('esaur', true)); const i = await info(T);
    c('E05', 'Esaurimento con un subentrante ancora legato: ⚠ col nome e «Togli»', '⚠ Risulta ancora un subentrante: BETA PROVA dal 16/06/2026', (i.t.match(/⚠ Risulta[^T]*/) || [''])[0], /⚠ Risulta ancora un subentrante: BETA PROVA dal 16\/06\/2026/.test(i.t) && !i.subSel);
    T.risposte.push({ re: /Togliere il subentro/ });
    await box(T).locator('button', { hasText: 'Togli' }).click(); await L.aspetta(T, 300); await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
    const P = JSON.parse(await L.ls(T, 'usoint-p-pe')).personnel;
    c('E06', '«Togli» toglie il subentro', 'BETA subentro «»', '«' + P[1].subentro + '»', P[1].subentro === '' && !/⚠ Risulta/.test((await info(T)).t));
    await ctx.close(); }
  { const { ctx, T } = await apri(APP, KV('sub', false)); const i = await info(T); const nd = T.dialoghi.length;
    c('E07', 'CESSAZ. CON SUBENTRO: tendina come prima', 'tendina presente', i.subSel, i.subSel && !/Nessun subentrante: l'incarico/.test(i.t));
    T.risposte.push({ re: /Trasferire/ }, { re: /subentra/ });
    await T.page.locator('button', { hasText: 'Trasferisci 2026' }).click(); await L.aspetta(T, 400);
    c('E08', 'CESSAZ. CON SUBENTRO: dopo «Trasferisci» si propone il subentro come prima', 'domanda «subentra»', T.dialoghi.slice(nd).some(d => /subentra/.test(d.msg)), T.dialoghi.slice(nd).some(d => /subentra/.test(d.msg)));
    await ctx.close(); }
  { const { ctx, T } = await apri(APP, KV('', false)); const i = await info(T);
    c('E09', 'Senza tipo (dati di prima): tendina come prima', 'tendina presente', i.subSel, i.subSel); await ctx.close(); }
  { const kv = KV('sub', true); kv['usoint-p-pe'].personnel.push(L.pers(nY, { nome: 'DELTA PROVA', voce: 'EDUCATORE', oreT: 50, eur: 20, aOre: [50, 0], subentro: '2026-09-01' }));
    const { ctx, T } = await apri(APP, kv);
    const ann = await T.page.evaluate(() => { const g = [...document.querySelectorAll('span[title^="Subentrante: le ore di questa annualità"]')].map(s => s.innerText); return g; });
    c('E10', 'Annualità del subentrante BETA grigie (2026 e 2027), non scrivibili', '2 caselle grigie «—» (zero)', JSON.stringify(ann), ann.length === 2 && ann.every(x => x === '—'));
    T.risposte.push({ re: /Trasferire/ });
    await T.page.locator('button', { hasText: 'Trasferisci 2026' }).click(); await L.aspetta(T, 400);
    const ann2 = await T.page.evaluate(() => [...document.querySelectorAll('span[title^="Subentrante: le ore di questa annualità"]')].map(s => s.innerText));
    c('E11', 'Dopo «Trasferisci 2026» la casella grigia 2026 mostra gli euro ricevuti (ver156)', '€ 3.800,00 · —', JSON.stringify(ann2), ann2[0] === '€ 3.800,00' && ann2[1] === '—');
    const inp = await T.page.evaluate(() => document.querySelectorAll('input').length);
    c('E12', 'Titolari e DELTA (ore scritte a mano) restano scrivibili; errori di pagina 0', 'caselle presenti · 0 errori', inp + ' · ' + T.errori.length, inp > 10 && T.errori.length === 0);
    if (PNG) { await T.page.evaluate(() => { const d = [...document.querySelectorAll('div')].find(x => x.innerText === 'PERSONALE — Budget'); d.scrollIntoView(); }); await L.aspetta(T, 200);
      const bb = await T.page.evaluate(() => { const r = [...document.querySelectorAll('div')].find(x => x.innerText === 'PERSONALE — Budget').getBoundingClientRect(); return { x: r.x, y: r.y }; });
      await T.page.screenshot({ path: PNG + '/Anteprima annualita grigie - 27nov26 - ver153.png', clip: { x: bb.x, y: bb.y, width: 1000, height: 260 } }); }
    await ctx.close(); }
  await L.chiudi(); L.fine('uso-ver153');
})();
