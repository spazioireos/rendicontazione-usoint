// uso-ver151 — (1) vista MESI: una cella di ore (o di importo dei beni) confermata scrivendo 0 si blocca («🔒 0,00»), doppio clic +
// conferma la sblocca; (2) il tipo di fine si sceglie ogni volta: «FINE INCARICO PER ESAURIM. €» o «CESSAZ. CON SUBENTRO» (budget, mesi,
// riquadro Riassegnazione; senza tipo, dati di prima: «CESS.»). Confronto con la ver150 in /uso150/. USO_APP=cartella (predefinita uso).
// SOLO DATI INVENTATI.   NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-ver151.cjs
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso', PNG = process.env.USO_PNG || '';
const nY = 2, md = () => [[10, 10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0], Array(12).fill(0)];
const KV = () => ({ 'usoint-idx': [{ id: 'pz', title: 'ZERO PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: true }], 'usoint-p-pz': L.prog('pz', 'ZERO PROVA', '2026-01-01', '2027-12-31', nY, { vincolo: true,
  personnel: [L.pers(nY, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: [250, 250], cessato: '2026-06-15', md: md() }),
    L.pers(nY, { nome: 'BETA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: [250, 250] }),
    L.pers(nY, { nome: 'GAMMA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: [250, 250], md: md() })],
  beni: [L.bene(nY, { voce: 'MATERIALE', forf: 5000, aImp: [2500, 2500], md: [Array(12).fill(100), Array(12).fill(0)] })] }) });
async function apri(app, kv, vp) {
  const { ctx } = await L.contesto({ kv: kv || KV(), viewport: vp, dsf: PNG ? 2 : 1 }); const T = await L.pagina(ctx);
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await L.apriProgetto(T, 'ZERO PROVA'); await L.aspetta(T, 400); return { ctx, T };
}
const mesi = async T => { await T.page.locator('button[title="Apri i mesi del 2026"]').evaluate(b => b.click()); await L.aspetta(T, 500); };
const budget = async T => { await T.page.click('button:has-text("Torna a budget")'); await L.aspetta(T, 300); };
// la casella (o il lucchetto) del mese mi nella riga col nome dato: 'in' | 'lock' | altro
const cella = (T, nome, mi) => T.page.evaluate(([nome, mi]) => { const tr = [...document.querySelectorAll('tr')].find(r => r.cells.length > 12 && r.cells[0] && r.cells[0].innerText.indexOf(nome) >= 0); if (!tr) return 'nessuna riga'; const tds = [...tr.cells].filter(td => td.querySelector('input:not([type]),input[type="text"]') || /🔒 0,00/.test(td.innerText)).slice(-12); const td = tds[mi]; if (!td) return 'nessuna cella'; return /🔒 0,00/.test(td.innerText) ? 'lock' : 'in:' + td.querySelector('input').value; }, [nome, mi]);
const scrivi = async (T, nome, mi, testo) => { const h = await T.page.evaluateHandle(([nome, mi]) => { const tr = [...document.querySelectorAll('tr')].find(r => r.cells.length > 12 && r.cells[0] && r.cells[0].innerText.indexOf(nome) >= 0); const tds = [...tr.cells].filter(td => td.querySelector('input:not([type]),input[type="text"]') || /🔒 0,00/.test(td.innerText)).slice(-12); return tds[mi].querySelector('input'); }, [nome, mi]); const el = h.asElement(); await el.click(); await L.aspetta(T, 80); if (testo !== null) await T.page.keyboard.type(testo); await T.page.keyboard.press('Tab'); await L.aspetta(T, 250); };
const lucchetto = (T, nome, mi) => T.page.evaluateHandle(([nome, mi]) => { const tr = [...document.querySelectorAll('tr')].find(r => r.cells.length > 12 && r.cells[0] && r.cells[0].innerText.indexOf(nome) >= 0); const tds = [...tr.cells].filter(td => td.querySelector('input:not([type]),input[type="text"]') || /🔒 0,00/.test(td.innerText)).slice(-12); return [...tds[mi].querySelectorAll('span')].find(s => /🔒 0,00/.test(s.innerText)); }, [nome, mi]);
const salva = async T => { await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 400); };
const prog = async T => JSON.parse(await L.ls(T, 'usoint-p-pz'));
(async () => {
  /* ver150 di confronto */
  { const { ctx, T } = await apri('uso150'); await mesi(T); await scrivi(T, 'BETA', 0, '0');
    c('Y00', 'ver150 (confronto): uno 0 scritto e confermato lascia la cella compilabile', 'in:0', await cella(T, 'BETA', 0), /^in:/.test(await cella(T, 'BETA', 0)));
    await budget(T); c('Y00b', 'ver150: pulsante della persona cessata «CESS.»', 'CESS.', await T.page.locator('button[title^="Cessato il 15/06/2026"]').innerText(), (await T.page.locator('button[title^="Cessato il 15/06/2026"]').innerText()) === 'CESS.');
    await ctx.close(); }
  const { ctx, T } = await apri(APP);
  await mesi(T);
  await scrivi(T, 'BETA', 1, null);
  c('Y01', 'Entrare e uscire da una cella vuota senza scrivere: non si blocca', 'in:', await cella(T, 'BETA', 1), /^in:/.test(await cella(T, 'BETA', 1)));
  await scrivi(T, 'BETA', 0, '0');
  c('Y02', 'Scrivere 0 e confermare: la cella diventa «🔒 0,00»', 'lock', await cella(T, 'BETA', 0), (await cella(T, 'BETA', 0)) === 'lock');
  await scrivi(T, 'GAMMA', 2, '0');
  c('Y03', 'Una cella con 10 ore riscritta a 0: bloccata e il totale scende', 'lock', await cella(T, 'GAMMA', 2), (await cella(T, 'GAMMA', 2)) === 'lock');
  await scrivi(T, 'MATERIALE', 3, '0');
  c('Y04', 'Beni/servizi: importo riscritto a 0 → bloccato', 'lock', await cella(T, 'MATERIALE', 3), (await cella(T, 'MATERIALE', 3)) === 'lock');
  await scrivi(T, 'GAMMA', 4, '7');
  c('Y05', 'Un numero diverso da 0 non blocca niente', 'in:7,00', await cella(T, 'GAMMA', 4), /^in:7/.test(await cella(T, 'GAMMA', 4)));
  // sblocco: annulla
  let nd = T.dialoghi.length; T.risposte.push({ re: /Sbloccare la cella/, dismiss: true });
  await (await lucchetto(T, 'BETA', 0)).asElement().dblclick(); await L.aspetta(T, 250);
  c('Y06', 'Doppio clic: chiede «Sbloccare la cella di GEN 2026 (BETA PROVA)?»; annullando resta bloccata', 'domanda · lock', ((T.dialoghi[nd] || {}).msg || '').slice(0, 60) + ' · ' + await cella(T, 'BETA', 0), /Sbloccare la cella di GEN 2026 \(BETA PROVA\)/.test((T.dialoghi[nd] || {}).msg || '') && (await cella(T, 'BETA', 0)) === 'lock');
  await budget(T); await salva(T);
  let P = await prog(T);
  c('Y07', 'Col 💾 il blocco è salvato (personale e beni)', 'BETA zero 0-0 · GAMMA 0-2 · MATERIALE 0-3; ore GAMMA mar = 0', JSON.stringify([P.personnel[1].zero, P.personnel[2].zero, P.beni[0].zero, P.personnel[2].md[0][2]]), P.personnel[1].zero['0-0'] && P.personnel[2].zero['0-2'] && P.beni[0].zero['0-3'] && P.personnel[2].md[0][2] === 0);
  await T.page.reload(); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 }); await L.apriProgetto(T, 'ZERO PROVA'); await L.aspetta(T, 400); await mesi(T);
  c('Y08', 'Dopo il ricaricamento la cella è ancora bloccata', 'lock', await cella(T, 'BETA', 0), (await cella(T, 'BETA', 0)) === 'lock');
  T.risposte.push({ re: /Sbloccare la cella/ });
  await (await lucchetto(T, 'BETA', 0)).asElement().dblclick(); await L.aspetta(T, 250);
  c('Y09', 'Doppio clic e OK: la cella torna compilabile', 'in:', await cella(T, 'BETA', 0), /^in:/.test(await cella(T, 'BETA', 0)));
  await scrivi(T, 'BETA', 0, '5');
  c('Y10', 'Si può riscrivere un numero', 'in:5,00', await cella(T, 'BETA', 0), /^in:5/.test(await cella(T, 'BETA', 0)));
  await budget(T);
  /* tipo di fine */
  c('Y11', 'Dati di prima (nessun tipo): il pulsante dice ancora «CESS.»', 'CESS.', await T.page.locator('button[title^="Cessato il 15/06/2026"]').innerText(), (await T.page.locator('button[title^="Cessato il 15/06/2026"]').innerText()) === 'CESS.');
  T.risposte.push({ re: /Data cessazione/, text: '31/08/2026' }, { re: /Che tipo di fine/, text: '3' });
  await T.page.locator('button[title="Segna come cessato"]').nth(1).click(); await L.aspetta(T, 300);
  c('Y12', 'Tipo sbagliato («3»): avviso e nessuna cessazione', '«Scrivi 1 oppure 2.» · GAMMA non cessata', T.dialoghi.some(d => /Scrivi 1 oppure 2/.test(d.msg)) + ' · ' + await T.page.locator('button[title^="Cessato il 31/08/2026"]').count(), T.dialoghi.some(d => /Scrivi 1 oppure 2/.test(d.msg)) && (await T.page.locator('button[title^="Cessato il 31/08/2026"]').count()) === 0);
  T.risposte.push({ re: /Data cessazione/, text: '31/08/2026' }, { re: /Che tipo di fine/, text: '1' });
  await T.page.locator('button[title="Segna come cessato"]').nth(1).click(); await L.aspetta(T, 300);
  const t1 = await T.page.locator('button[title^="Cessato il 31/08/2026"]').innerText();
  c('Y13', 'Tipo 1: «FINE INCARICO PER ESAURIM. €»', 'FINE INCARICO PER ESAURIM. €', t1, t1 === 'FINE INCARICO PER ESAURIM. €');
  const domanda = (T.dialoghi.filter(d => /Che tipo di fine/.test(d.msg)).pop() || {}).msg || '';
  c('Y14', 'La domanda elenca le due scelte', '1 = FINE INCARICO PER ESAURIM. € · 2 = CESSAZ. CON SUBENTRO', domanda.replace(/\n/g, ' '), /1 = FINE INCARICO PER ESAURIM\. €/.test(domanda) && /2 = CESSAZ\. CON SUBENTRO/.test(domanda));
  // riquadro: cambio tipo di ALFA
  const box = T.page.locator('div:has(> div:has-text("Riassegnazione residui di operatori cessati"))').last();
  await box.locator('select').first().selectOption('sub'); await L.aspetta(T, 250);
  const t2 = await T.page.locator('button[title^="Cessato il 15/06/2026"]').innerText(); const tb = (await box.innerText()).replace(/\s+/g, ' ');
  c('Y15', 'Riquadro: «Tipo di fine» cambiato in CESSAZ. CON SUBENTRO, anche il pulsante del budget', 'CESSAZ. CON SUBENTRO (15/06/2026) · pulsante idem', t2 + ' // ' + (tb.match(/ALFA PROVA [^↳]{0,60}/) || [''])[0], t2 === 'CESSAZ. CON SUBENTRO' && /ALFA PROVA CESSAZ\. CON SUBENTRO \(15\/06\/2026\)/.test(tb));
  // re-cessazione con tipo
  T.risposte.push({ re: /già cessata/ }, { re: /Nuova data/, text: '30/09/2026' }, { re: /Che tipo di fine/, text: '2' });
  await T.page.locator('button[title^="Cessato il 31/08/2026"]').click(); await L.aspetta(T, 300);
  c('Y16', 'Già cessata: nuova data e tipo 2', 'Cessato il 30/09/2026 · CESSAZ. CON SUBENTRO', await T.page.locator('button[title^="Cessato il 30/09/2026"]').innerText().catch(() => 'nessuno'), (await T.page.locator('button[title^="Cessato il 30/09/2026"]').innerText().catch(() => '')) === 'CESSAZ. CON SUBENTRO');
  await mesi(T);
  const et = await T.page.evaluate(() => { const td = [...document.querySelectorAll('tr')].map(r => r.cells[0]).find(td => td && /GAMMA PROVA/.test(td.innerText)); return td ? td.innerText.replace(/\s+/g, ' ') : ''; });
  c('Y17', 'Vista mesi 2026: «CESSAZ. CON SUBENTRO 30/09» accanto al nome', 'GAMMA PROVA CESSAZ. CON SUBENTRO 30/09', et, /CESSAZ\. CON SUBENTRO 30\/09/.test(et));
  if (PNG) { await T.page.evaluate(() => { const tb = [...document.querySelectorAll('table')].find(t => /BETA PROVA/.test(t.innerText)); tb.setAttribute('data-ant', '1'); }); await T.page.locator('table[data-ant]').screenshot({ path: PNG + '/Anteprima zero bloccato - 27nov26 - ver151.png' }); }
  await budget(T);
  // togli la cessazione: toglie anche il tipo
  T.risposte.push({ re: /già cessata/ }, { re: /Nuova data/, text: '' }, { re: /Togliere la cessazione/ });
  await T.page.locator('button[title^="Cessato il 30/09/2026"]').click(); await L.aspetta(T, 300); await salva(T);
  P = await prog(T);
  c('Y18', 'Togliendo la cessazione si toglie anche il tipo', 'cessato «» · cessTipo «»', JSON.stringify([P.personnel[2].cessato, P.personnel[2].cessTipo]), P.personnel[2].cessato === '' && P.personnel[2].cessTipo === '' && P.personnel[0].cessTipo === 'sub');
  if (PNG) { const b2 = T.page.locator('div:has(> div:has-text("Riassegnazione residui di operatori cessati"))').last(); await b2.screenshot({ path: PNG + '/Anteprima tipo di fine - 27nov26 - ver151.png' }); }
  c('Y19', 'Errori di pagina', '0', T.errori.length + ' ' + T.errori.join(' | ').slice(0, 200), T.errori.length === 0);
  await ctx.close();
  { const { ctx, T } = await apri(APP, null, { width: 390, height: 844 });
    const ok = await T.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    c('Y20', 'A 390px la scheda (budget, riquadro Riassegnazione) non scorre di lato', 'sì', ok, ok && T.errori.length === 0); await ctx.close(); }
  await L.chiudi(); L.fine('uso-ver151');
})();
