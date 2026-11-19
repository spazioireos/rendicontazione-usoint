// USOINT ver141 — entrando in una casella di ore o importi il contenuto si seleziona TUTTO (Christian, 19/11/2026),
// con CONFRONTO DIRETTO ver140 ↔ ver141. SOLO DATI INVENTATI.
// Per ognuno dei quattro componenti numerici (NumIn budget · TarIn Tariffario · LavIn ore lavorate · SimIn simulatore):
//  clic su casella piena → selezionato tutto il testo mostrato; il primo tasto lo sostituisce e il 💾 salva il nuovo;
//  un secondo clic posiziona il cursore; Tab seleziona; entrare/uscire senza scrivere non cambia niente;
//  il «-» resta rifiutato; zero errori di pagina.
// Banco: bash collaudo/comune/prepara-comune.sh <porta>, più la ver140 localizzata in .banco/uso140/
//   (git show <commit ver140>:index.html > /tmp/x/index.html;
//    python3 collaudo/comune/localizza.py /tmp/x/index.html collaudo/comune/.banco/uso140/index.html)
// PORTA=8343 NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-ver141.cjs [cartella-png]
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const PNG = process.argv[2] || null;

function seme() {
  const nY = 1;
  const md = [Array(12).fill(0)]; md[0][0] = 10; md[0][1] = 12;
  const pA = L.prog('pa', 'PRJ SEL PROVA', '2026-01-01', '2026-12-31', nY, { personnel: [L.pers(nY, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 120, eur: 22.5, aOre: [120], md }), L.pers(nY, { nome: 'BETA PROVA', voce: 'COORDINATORE', oreT: 80, eur: 25, aOre: [80] })] });
  const lav = Array(12).fill(0); lav[0] = 14.5; lav[1] = 16;
  const h = Array(12).fill(0); h[0] = 6; h[1] = 7.5;
  return {
    'usoint-idx': [{ id: 'pa', title: 'PRJ SEL PROVA', start: '2026-01-01', end: '2026-12-31', vincolo: false }],
    'usoint-p-pa': pA,
    'usoint-tariffe': { 'alfa prova': { 2026: 21.75 } },
    'usoint-orelav': { 'alfa prova': { 2026: lav } },
    'usoint-simul': { 'alfa prova': { 2026: { 'PRJ SEL PROVA': { h, c: Array(12).fill(0) } } } }
  };
}
async function stato(loc) { return loc.evaluate(el => ({ v: el.value, s: el.selectionStart, e: el.selectionEnd, f: document.activeElement === el })); }
const tutto = st => st.f && st.v.length > 0 && st.s === 0 && st.e === st.v.length;
const fmt = st => `«${st.v}» sel ${st.s}-${st.e}${st.f ? '' : ' (non a fuoco)'}`;

/* prova di una casella: ritorna le misure, il valore dopo il primo tasto e quello salvato */
async function prova(T, loc, prevLoc, cifra) {
  const r = {};
  await loc.scrollIntoViewIfNeeded();
  const mostrato = await loc.inputValue();
  /* 1. clic → selezione */
  await loc.click(); await L.aspetta(T, 150);
  r.clic = await stato(loc); r.clicTutto = tutto(r.clic);
  /* 2. secondo clic vicino al bordo sinistro → cursore posizionato (selezione vuota) */
  const bb = await loc.boundingBox();
  await T.page.mouse.click(bb.x + 4, bb.y + bb.height / 2); await L.aspetta(T, 120);
  r.clic2 = await stato(loc); r.clic2Cursore = r.clic2.f && r.clic2.s === r.clic2.e;
  /* 3. esci senza scrivere */
  await loc.press('Tab'); await L.aspetta(T, 150);
  r.dopoVuoto = await loc.inputValue(); r.mostrato = mostrato;
  /* 4. Tab da quella prima → selezione */
  /*    si mette il fuoco sull'elemento che nell'ordine del Tab sta subito PRIMA della casella, poi si preme Tab */
  if (prevLoc) {
    await loc.evaluate(el => { const f = Array.from(document.querySelectorAll('input,select,button,textarea,a[href],[tabindex]')).filter(x => !x.disabled && x.tabIndex >= 0 && x.offsetParent !== null); const i = f.indexOf(el); if (i > 0) f[i - 1].focus(); });
    await L.aspetta(T, 80); await T.page.keyboard.press('Tab'); await L.aspetta(T, 150);
    r.tab = await stato(loc); r.tabTutto = tutto(r.tab);
    await T.page.keyboard.press('Tab'); await L.aspetta(T, 150);   // esce dalla casella (senza scrivere)
    r.dopoTab = await loc.inputValue();
  }
  /* 4b. chi scrive SUBITO dopo il clic (nessuna attesa) non perde caratteri; con Ctrl+A e «.» come prima */
  await loc.click(); await T.page.keyboard.type('34', { delay: 0 }); r.veloce = await loc.inputValue();
  await T.page.keyboard.press('Tab'); await L.aspetta(T, 150);
  await loc.click(); await T.page.keyboard.press('Control+a'); await T.page.keyboard.type('10.5', { delay: 15 }); r.ctrlA = await loc.inputValue();
  await T.page.keyboard.press('Tab'); await L.aspetta(T, 150);
  /* 5. «-» rifiutato, poi primo tasto che sostituisce */
  await loc.click(); await L.aspetta(T, 150);
  await T.page.keyboard.press('Minus'); await L.aspetta(T, 60);
  r.meno = await stato(loc);
  await T.page.keyboard.type(cifra); await L.aspetta(T, 60);
  r.scritto = await loc.inputValue();
  await loc.press('Tab'); await L.aspetta(T, 200);
  r.uscito = await loc.inputValue();
  return r;
}
async function home(T, dir) {
  await T.page.goto(L.BASE + dir + '/index.html');
  await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});
  await L.aspetta(T, 400);
}

async function giro(dir) {
  const R = { dir };
  const { ctx } = await L.contesto({ kv: seme(), dsf: (PNG && dir === 'uso') ? 2 : 1 });
  const T = await L.pagina(ctx); await home(T, dir);
  /* ---- NumIn: budget (Ore tot., width 53px) ---- */
  await T.page.locator('div[style*="cursor: pointer"]', { hasText: 'PRJ SEL PROVA' }).last().click();
  await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO/.test(document.body.innerText), null, { timeout: 10000 }).catch(() => {});
  await L.aspetta(T, 400);
  const oreT = T.page.locator('input[style*="width: 53px"]');
  R.num = await prova(T, oreT.nth(1), oreT.nth(0), '8');
  if (PNG && dir === 'uso') {
    await oreT.nth(0).click(); await L.aspetta(T, 200);
    const bb = await oreT.nth(0).boundingBox();
    await T.page.screenshot({ path: PNG + '/casella-selezionata.png', clip: { x: Math.max(0, bb.x - 260), y: Math.max(0, bb.y - 70), width: 620, height: 170 } });
    await oreT.nth(0).press('Escape'); await oreT.nth(0).press('Tab'); await L.aspetta(T, 150);
  }
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 400);
  R.numSalvato = JSON.parse(await L.ls(T, 'usoint-p-pa')).personnel.map(p => p.oreT);
  T.risposte.push({ re: /.*/ });
  await T.page.locator('button', { hasText: '←' }).first().click(); await L.aspetta(T, 500);
  /* ---- TarIn: Tariffario (width 82px) ---- */
  await T.page.click('button:has-text("📋 Tariffario costi orari")'); await L.aspetta(T, 500);
  const tar = T.page.locator('input[style*="width: 82px"]');
  R.nTar = await tar.count();
  R.tar = await prova(T, tar.nth(0), null, '9');
  await T.page.locator('button', { hasText: '💾 Salva' }).first().click(); await L.aspetta(T, 300);
  R.tarSalvato = JSON.parse(await L.ls(T, 'usoint-tariffe'));
  T.risposte.push({ re: /.*/ });
  await T.page.locator('button', { hasText: '← Indietro' }).first().click(); await L.aspetta(T, 500);
  /* ---- LavIn e SimIn: Riepilogo operatori, ALFA PROVA ---- */
  await T.page.click('button:has-text("👥 Riepilogo operatori")'); await L.aspetta(T, 1200);
  const s0 = T.page.locator('select').first();
  const v = await s0.evaluate(s => { const o = Array.from(s.options).find(o => o.text === 'ALFA PROVA'); return o ? o.value : null; });
  if (v) { await s0.selectOption(v); await L.aspetta(T, 500); }
  const lav = T.page.locator('input[style*="width: 54px"]');
  R.lav = await prova(T, lav.nth(1), lav.nth(0), '7');
  await T.page.locator('button', { hasText: '💾 Salva ore lavorate' }).last().click(); await L.aspetta(T, 300);
  R.lavSalvato = JSON.parse(await L.ls(T, 'usoint-orelav'))['alfa prova']['2026'].slice(0, 2);
  const sim = T.page.locator('input[style*="width: 38px"]');
  R.nSim = await sim.count();
  if (R.nSim > 1) {
    R.sim = await prova(T, sim.nth(1), sim.nth(0), '5');
    const bS = T.page.locator('button', { hasText: /💾/ }).filter({ hasNotText: 'ore lavorate' });
    const nb = await bS.count();
    for (let i = 0; i < nb; i++) { const tx = await bS.nth(i).innerText(); if (!/ore lavorate/.test(tx)) { await bS.nth(i).click(); break; } }
    await L.aspetta(T, 300);
    const sv = JSON.parse(await L.ls(T, 'usoint-simul') || '{}');
    R.simSalvato = ((((sv['alfa prova'] || {})['2026'] || {})['PRJ SEL PROVA'] || {}).h || []).slice(0, 2);
  }
  R.errori = L.err(T).slice();
  await ctx.close();
  return R;
}

(async () => {
  const V140 = await giro('uso140');
  const V141 = await giro('uso');
  const comp = [['num', 'NumIn (budget, Ore tot.)', '120,00', [120, 8]], ['tar', 'TarIn (Tariffario)', '€ 21,75', null], ['lav', 'LavIn (ore lavorate)', '16,00', [14.5, 7]], ['sim', 'SimIn (simulatore)', '7,50', [6, 5]]];
  for (const [k, nome] of comp) {
    const a = V141[k], b = V140[k];
    if (!a) { c(k + '00', nome, 'casella trovata', 'non trovata', false); continue; }
    c(k + '01', nome + ': clic su casella piena', 'tutto il testo selezionato', fmt(a.clic), a.clicTutto);
    c(k + '02', nome + ': ver140 (confronto)', 'NESSUNA selezione (cursore)', b ? fmt(b.clic) : '—', b && !b.clicTutto, b && !b.clicTutto ? 'SUPERATO' : 'SEGNALATO');
    c(k + '03', nome + ': secondo clic', 'cursore posizionato (selezione vuota)', fmt(a.clic2), a.clic2Cursore);
    c(k + '04', nome + ': entrare e uscire senza scrivere (clic e Tab)', 'valore mostrato identico', a.mostrato + ' → ' + a.dopoVuoto + (a.dopoTab ? ' / ' + a.dopoTab : ''), a.mostrato === a.dopoVuoto && (!a.dopoTab || a.dopoTab === a.mostrato) && (!b || b.dopoVuoto === a.dopoVuoto));
    if (a.tab) c(k + '05', nome + ': ingresso con Tab', 'tutto selezionato', fmt(a.tab) + (b && b.tab ? ' (ver140: ' + fmt(b.tab) + ')' : ''), a.tabTutto);
    c(k + '09', nome + ': «34» scritto subito dopo il clic', '«34» (nessun carattere perso)', '«' + a.veloce + '» (ver140: «' + (b ? b.veloce : '—') + '»)', a.veloce === '34');
    c(k + '10', nome + ': Ctrl+A poi «10.5»', '«10,5» (il punto diventa virgola)', '«' + a.ctrlA + '»', a.ctrlA === '10,5');
    c(k + '06', nome + ': «-» battuto', 'non entra (resta selezionato)', fmt(a.meno), !/-/.test(a.meno.v) && tutto(a.meno));
    c(k + '07', nome + ': primo tasto dopo l\'ingresso', 'sostituisce tutto', '«' + a.scritto + '» → «' + a.uscito + '» (ver140: «' + (b ? b.scritto : '—') + '»)', a.scritto.replace(/[^\d]/g, '').length === 1);
  }
  c('num08', 'NumIn: valore salvato col 💾', 'oreT [120, 8]', JSON.stringify(V141.numSalvato), JSON.stringify(V141.numSalvato) === '[120,8]');
  c('tar08', 'TarIn: valore salvato col 💾', 'alfa prova 2026 = 9', JSON.stringify(V141.tarSalvato), V141.tarSalvato['alfa prova'] && V141.tarSalvato['alfa prova']['2026'] === 9);
  c('lav08', 'LavIn: valore salvato col 💾', 'GEN 14,5 · FEB 7', JSON.stringify(V141.lavSalvato), JSON.stringify(V141.lavSalvato) === '[14.5,7]');
  c('sim08', 'SimIn: valore salvato col 💾', 'GEN 6 · FEB 5', JSON.stringify(V141.simSalvato), JSON.stringify(V141.simSalvato) === '[6,5]');
  c('E01', 'errori di pagina ver141', 'zero', V141.errori.join(' | ') || '0', V141.errori.length === 0);
  c('E02', 'errori di pagina ver140 (confronto)', 'zero', V140.errori.join(' | ') || '0', V140.errori.length === 0, V140.errori.length ? 'SEGNALATO' : 'SUPERATO');
  L.fine('uso-ver141'); await L.chiudi();
})().catch(async e => { console.error(e); await L.chiudi(); process.exit(1); });
