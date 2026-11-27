// uso-ver149 — la data di subentro si sceglie nel riquadro «Riassegnazione residui di operatori cessati» (nel budget resta solo
// ⚠️ dalla ver151 il primo select del riquadro è «Tipo di fine»: quello del subentrante è il secondo (nth(1)). Attesa aggiornata, non aggirata.
// l'etichetta «SUB. gg/mm»); ogni trasferimento registra a chi e quanto e la riga resta sbiadita; «CESS.» su chi è già cessato
// avvisa con data e subentrante; nel budget i subentranti rientrano (↳) e nome/ruolo sono al 90%. Confronto con la ver148 in /uso148/.
// USO_PNG=cartella salva le anteprime. SOLO DATI INVENTATI.   NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-ver149.cjs
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const PNG = process.env.USO_PNG || '';
const nY = 2, md = () => [[10, 10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0], Array(12).fill(0)];
function progetto(vinc, extra) {
  const per = [L.pers(nY, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: vinc ? [250, 250] : [500, 0], cessato: '2026-06-15', md: md() }),
    L.pers(nY, { nome: 'BETA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: vinc ? [250, 250] : [500, 0] }),
    L.pers(nY, { nome: 'GAMMA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: vinc ? [250, 250] : [500, 0] })];
  if (extra) extra(per);
  const p = L.prog('pr', 'RIASS PROVA', '2026-01-01', '2027-12-31', nY, { vincolo: vinc, personnel: per });
  return { 'usoint-idx': [{ id: 'pr', title: 'RIASS PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: vinc }], 'usoint-p-pr': p };
}
async function apri(app, kv, vp) {
  const { ctx } = await L.contesto({ kv, viewport: vp, dsf: PNG ? 2 : 1 }); const T = await L.pagina(ctx);
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await L.apriProgetto(T, 'RIASS PROVA'); await L.aspetta(T, 500); return { ctx, T };
}
const box = T => T.page.locator('div:has(> div:has-text("Riassegnazione residui di operatori cessati"))').last();
const testoBox = async T => (await box(T).count()) ? (await box(T).innerText()).replace(/\s+/g, ' ') : '';
const sbiaditi = T => T.page.evaluate(() => { const b = [...document.querySelectorAll('div')].filter(d => /^📋 Riassegnazione residui/.test(d.innerText || '') && /Subentra/.test(d.innerText || '')).pop(); if (!b) return []; return [...b.querySelectorAll('div')].filter(d => getComputedStyle(d).opacity === '0.5').map(d => d.innerText.replace(/\s+/g, ' ').trim()); });
const pers = async T => JSON.parse(await L.ls(T, 'usoint-p-pr')).personnel;
const salva = async T => { await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 400); };
(async () => {
  /* ver148 di confronto */
  { const { ctx, T } = await apri('uso148', progetto(true));
    const nSub = await T.page.locator('button[title="Imposta data di subentro (blocca i mesi precedenti)"]').count();
    T.risposte.push({ re: /Trasferire/ }, { re: /subentra/ });
    await T.page.locator('button', { hasText: 'Trasferisci 2026' }).click(); await L.aspetta(T, 400);
    const t = await testoBox(T);
    c('X00', 'ver148 (confronto): «Sub.» nel budget; dopo il trasferimento del 2026 la riga sparisce senza dire a chi', 'pulsante Sub. · nessun «Trasferito a»', nSub + ' · ' + t.slice(0, 120), nSub >= 1 && !/Trasferito .* a BETA/.test(t));
    await ctx.close(); }
  /* ver149 vincolato */
  const { ctx, T } = await apri('uso', progetto(true));
  c('X01', 'Budget: nessun pulsante «Sub.» da cliccare', '0', await T.page.locator('button[title="Imposta data di subentro (blocca i mesi precedenti)"]').count(), (await T.page.locator('button[title="Imposta data di subentro (blocca i mesi precedenti)"]').count()) === 0);
  let t = await testoBox(T);
  c('X02', 'Riquadro: riga del subentro con la data proposta al giorno dopo la cessazione', '«↳ Subentra:» · 16/06/2026 · nessun subentrante', t.slice(0, 220), /↳ Subentra:/.test(t) && /nessun subentrante scelto/.test(t) && await box(T).locator('input[placeholder="gg/mm/aaaa"]').inputValue() === '16/06/2026');
  // imposta BETA
  await box(T).locator('select').nth(1).selectOption({ label: 'BETA PROVA' });
  T.risposte.push({ re: /subentra a/ });
  await box(T).locator('button', { hasText: '✔ Imposta subentro' }).click(); await L.aspetta(T, 300);
  t = await testoBox(T);
  c('X03', 'Imposta subentro: «ora: BETA PROVA dal 16/06/2026»', 'ora: BETA PROVA dal 16/06/2026', (t.match(/ora: .{0,40}/) || [''])[0], /ora: BETA PROVA dal 16\/06\/2026/.test(t));
  const lab = await T.page.locator('span[title^="Subentra dal 16/06/2026"]').allInnerTexts();
  c('X04', 'Budget: etichetta «SUB. 16/06» (non si clicca) e ↳ davanti a BETA', 'SUB. 16/06 · ↳', lab.join(',') + ' · ↳ ' + await T.page.locator('span[title^="Subentrante"]').count(), lab.join() === 'SUB. 16/06' && await T.page.locator('span[title^="Subentrante"]').count() === 1);
  const mis = await T.page.evaluate(() => { const ins = [...document.querySelectorAll('input')]; const n = ins.find(x => x.value === 'BETA PROVA'), a = ins.find(x => x.value === 'ALFA PROVA'), v = ins.find(x => x.value === 'EDUCATORE'); return { nB: n && n.getBoundingClientRect().left, nA: a && a.getBoundingClientRect().left, fs: n && getComputedStyle(n).fontSize, fv: v && getComputedStyle(v).fontSize }; });
  c('X05', 'Budget: il subentrante rientra rispetto al titolare; nome 9px e ruolo 9,45px (90%)', 'BETA più a destra di ALFA · 9px · 9.45px', JSON.stringify(mis), mis.nB > mis.nA + 10 && mis.fs === '9px' && mis.fv === '9.45px');
  // trasferimento 2026
  T.risposte.push({ re: /Trasferire/ });
  await T.page.locator('button', { hasText: 'Trasferisci 2026' }).click(); await L.aspetta(T, 400);
  let sb = await sbiaditi(T);
  c('X06', 'Dopo il trasferimento del 2026: riga sbiadita con a chi e quanto; il 2027 resta da fare', '2026 ✓ Trasferito € 3.800,00 a BETA PROVA … · «Trasferisci 2027»', sb.join(' | '), sb.some(x => /2026.*✓ Trasferito € 3\.800,00 a BETA PROVA/.test(x)) && await T.page.locator('button', { hasText: 'Trasferisci 2027' }).count() === 1);
  T.risposte.push({ re: /Trasferire/ });
  await T.page.locator('button', { hasText: 'Trasferisci 2027' }).click(); await L.aspetta(T, 400);
  sb = await sbiaditi(T); t = await testoBox(T);
  c('X07', 'Dopo il 2027: nome sbiadito con «✓ residui trasferiti» e due righe sbiadite', 'ALFA … ✓ residui trasferiti · 2026 e 2027', sb.join(' | '), sb.some(x => /^ALFA PROVA.*✓ residui trasferiti/.test(x)) && sb.some(x => /2027.*a BETA PROVA/.test(x)) && sb.some(x => /2026.*a BETA PROVA/.test(x)));
  await salva(T);
  let P = await pers(T);
  c('X08', 'Col 💾: trasferimenti registrati e subentro salvati', '2 registrazioni · BETA subentro 2026-06-16 di ALFA', JSON.stringify(P[0].trasf) + ' · ' + P[1].subentro + ' ' + P[1].subentroDi, (P[0].trasf || []).length === 2 && P[0].trasf[0].a === 'BETA PROVA' && P[0].trasf[0].imp === 3800 && P[1].subentro === '2026-06-16' && P[1].subentroDi === 'ALFA PROVA');
  // cambio subentrante
  await box(T).locator('select').nth(1).selectOption({ label: 'GAMMA PROVA' });
  await box(T).locator('input[placeholder="gg/mm/aaaa"]').fill('01/07/2026');
  T.risposte.push({ re: /subentra a/ });
  await box(T).locator('button', { hasText: '✔ Imposta subentro' }).click(); await L.aspetta(T, 300); await salva(T);
  P = await pers(T);
  c('X09', 'Cambio subentrante: GAMMA dal 01/07/2026, BETA senza subentro', 'BETA «» · GAMMA 2026-07-01', 'BETA «' + P[1].subentro + '» · GAMMA ' + P[2].subentro, P[1].subentro === '' && P[2].subentro === '2026-07-01' && P[2].subentroDi === 'ALFA PROVA');
  const dlg = T.dialoghi.filter(d => /subentra a/.test(d.msg)).pop();
  c('X10', 'La domanda dice che BETA non sarà più il subentrante', '«non sarà più il subentrante»', (dlg || {}).msg, /BETA PROVA» non sarà più il subentrante/.test((dlg || {}).msg || ''));
  // ri-cessazione: annulla
  const nd = T.dialoghi.length;
  T.risposte.push({ re: /già cessata/, dismiss: true });
  await T.page.locator('button[title^="Cessato il 15/06/2026"]').click(); await L.aspetta(T, 300);
  const d0 = (T.dialoghi[nd] || {}).msg || '';
  c('X11', '«CESS.» su chi è già cessata: avviso con data e subentrante', 'già cessata il 15/06/2026 · Subentrante scelto: GAMMA PROVA (dal 01/07/2026)', d0.replace(/\n+/g, ' '), /già cessata il 15\/06\/2026/.test(d0) && /Subentrante scelto: GAMMA PROVA \(dal 01\/07\/2026\)/.test(d0));
  c('X12', 'Annullando non cambia niente', 'una sola domanda, cessazione ancora 15/06/2026', (T.dialoghi.length - nd) + ' · ' + await T.page.locator('button[title^="Cessato il 15/06/2026"]').count(), T.dialoghi.length - nd === 1 && await T.page.locator('button[title^="Cessato il 15/06/2026"]').count() === 1);
  // cambia data
  T.risposte.push({ re: /già cessata/ }, { re: /Nuova data/, text: '30/06/2026' }, { re: /Cessazione spostata/ });
  await T.page.locator('button[title^="Cessato il 15/06/2026"]').click(); await L.aspetta(T, 300);
  c('X13', 'OK e nuova data: cessazione al 30/06/2026, avviso sul subentro rimasto', 'Cessato il 30/06/2026 · avviso', await T.page.locator('button[title^="Cessato il 30/06/2026"]').count() + ' · ' + T.dialoghi.some(d => /Cessazione spostata al 30\/06\/2026/.test(d.msg)), await T.page.locator('button[title^="Cessato il 30/06/2026"]').count() === 1 && T.dialoghi.some(d => /Cessazione spostata/.test(d.msg)));
  // togli cessazione
  T.risposte.push({ re: /già cessata/ }, { re: /Nuova data/, text: '' }, { re: /Togliere la cessazione/ });
  await T.page.locator('button[title^="Cessato il 30/06/2026"]').click(); await L.aspetta(T, 300);
  c('X14', 'Casella vuota e conferma: cessazione tolta', 'nessun «Cessato il»', await T.page.locator('button[title^="Cessato il"]').count(), await T.page.locator('button[title^="Cessato il"]').count() === 0);
  // nuova cessazione (persona non cessata): domanda di prima
  T.risposte.push({ re: /Data cessazione/, text: '15/06/2026' });
  await T.page.locator('button[title="Segna come cessato"]').first().click(); await L.aspetta(T, 300);
  c('X15', 'Cessare chi non è cessato: la domanda di sempre', '«Data cessazione (gg/mm/aaaa):»', T.dialoghi.filter(d => /^Data cessazione/.test(d.msg)).length, T.dialoghi.filter(d => /^Data cessazione/.test(d.msg)).length === 1);
  // togli subentro
  T.risposte.push({ re: /Togliere il subentro/ });
  await box(T).locator('button', { hasText: 'Togli' }).click(); await L.aspetta(T, 300); await salva(T);
  P = await pers(T);
  c('X16', '«Togli» nel riquadro: subentro tolto', 'GAMMA «»', '«' + P[2].subentro + '»', P[2].subentro === '' && P[2].subentroDi === '');
  c('X17', 'Errori di pagina (vincolato)', '0', T.errori.length + ' ' + T.errori.join(' | ').slice(0, 200), T.errori.length === 0);
  await ctx.close();
  /* ver149 libero */
  { const { ctx, T } = await apri('uso', progetto(false));
    T.risposte.push({ re: /Trasferire/ }, { re: /subentra/ });
    await T.page.locator('button', { hasText: /^Trasferisci su prima annualità/ }).click(); await L.aspetta(T, 400);
    const sb = await sbiaditi(T); const t = await testoBox(T);
    c('X18', 'Libero: dopo il trasferimento riga sbiadita «✓ Trasferito € 8.800,00 a BETA PROVA», subentro proposto e messo', '✓ Trasferito € 8.800,00 a BETA PROVA · ora: BETA PROVA dal 16/06/2026', sb.join(' | ') + ' // ' + (t.match(/ora: .{0,40}/) || [''])[0], sb.some(x => /✓ Trasferito € 8\.800,00 a BETA PROVA/.test(x)) && /ora: BETA PROVA dal 16\/06\/2026/.test(t));
    if (PNG) await box(T).screenshot({ path: PNG + '/Anteprima riassegnazione libero - 27nov26 - ver149.png' });
    c('X19', 'Errori di pagina (libero)', '0', T.errori.length, T.errori.length === 0);
    await ctx.close(); }
  /* dati di prima: trasferimento già fatto senza registrazione, BETA subentrante per data */
  { const kv = progetto(false, per => { per[0].aOre = [60, 0]; per[1].subentro = '2026-06-16'; per[1].ricevute = 440; per[1].aOre = [940, 0]; });
    const { ctx, T } = await apri('uso', kv);
    const sb = await sbiaditi(T);
    c('X20', 'Trasferimento fatto prima della ver149: «a BETA PROVA (subentrante) — importo non registrato»', 'riga sbiadita', sb.join(' | '), sb.some(x => /Trasferito a BETA PROVA \(subentrante\) — importo non registrato/.test(x)) && sb.some(x => /✓ residui trasferiti/.test(x)));
    await ctx.close(); }
  /* anteprima vincolata a metà e budget; 390px */
  { const { ctx, T } = await apri('uso', progetto(true, per => { per[1].subentro = '2026-06-16'; per[1].subentroDi = 'ALFA PROVA'; }));
    T.risposte.push({ re: /Trasferire/ });
    await T.page.locator('button', { hasText: 'Trasferisci 2026' }).click(); await L.aspetta(T, 400);
    if (PNG) { await box(T).screenshot({ path: PNG + '/Anteprima riassegnazione - 27nov26 - ver149.png' });
      const bud = T.page.locator('div:has(> div:has-text("PERSONALE — Budget"))').first(); await bud.screenshot({ path: PNG + '/Anteprima budget subentranti - 27nov26 - ver149.png' }); }
    await ctx.close(); }
  { const { ctx, T } = await apri('uso', progetto(true), { width: 390, height: 844 });
    const ok = await T.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    c('X21', 'A 390px la pagina non scorre di lato', 'sì', ok, ok);
    await ctx.close(); }
  await L.chiudi(); L.fine('uso-ver149');
})();
