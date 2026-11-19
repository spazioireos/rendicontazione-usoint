// Collaudo A01 USOINT ver138 — budget personale/beni, R2, negativi, cofinanziamento %, spalma, proroga,
// residui, vista MESI, fatture (✕ con conferma), export Excel. SOLO DATI INVENTATI.
// NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-a01-budget.cjs
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const path = require('path'), fs = require('fs');
const XLSX = require(path.join(__dirname, 'comune/.banco/lib/xlsx-0.18.5.js'));
async function scrivi(T, loc, txt, tastiera) {
  await loc.click(); await loc.press('Control+a');
  if (tastiera) await loc.pressSequentially(txt, { delay: 15 }); else await loc.fill(txt);
  await loc.press('Tab'); await T.page.waitForTimeout(120);
}
async function riga(loc) { return loc.evaluate(el => { let n = el; for (let i = 0; i < 6 && n; i++) { n = n.parentElement; if (n && n.style && n.style.height === '46px') return n.innerText; } return ''; }); }
(async () => {
  const nY = 2;
  const p = L.prog('pb', 'BUDGET PROVA', '2026-01-01', '2027-12-31', nY, { vincolo: true, personnel: [L.pers(nY, { nome: 'ALFA PROVA', voce: 'EDUCATORE' }), L.pers(nY, { nome: 'BETA PROVA', voce: 'COORDINATORE' })], beni: [L.bene(nY, { voce: 'MATERIALE' }), L.bene(nY, { voce: 'AFFITTO' })] });
  const kv = { 'usoint-idx': [{ id: 'pb', title: 'BUDGET PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: true }], 'usoint-p-pb': p };
  const { ctx } = await L.contesto({ kv });
  const T = await L.pagina(ctx); await L.apriUso(T);
  await T.page.locator('div[style*="cursor: pointer"]', { hasText: 'BUDGET PROVA' }).last().click();
  await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO/.test(document.body.innerText), null, { timeout: 10000 });
  await L.aspetta(T, 400);
  const oreT = i => T.page.locator('input[style*="width: 53px"]').nth(i);
  const eur = i => T.page.locator('input[style*="width: 74px"]').nth(i);
  const w70 = i => T.page.locator('input[style*="width: 70px"]').nth(i);  // 0..1 finanz. personale, 2..3 imp.prev. beni
  /* R2 */
  await scrivi(T, oreT(0), '67,5'); await scrivi(T, eur(0), '22,99');
  let r = await riga(oreT(0));
  c('D01', 'costo tot. 67,5 h × 22,99 € (R2)', '1.551,83', r.replace(/\n/g, ' ').slice(0, 80), /1\.551,83/.test(r));
  /* punto come virgola */
  await oreT(1).click(); await oreT(1).press('Control+a'); await oreT(1).pressSequentially('10.5', { delay: 15 }); await oreT(1).press('Tab'); await L.aspetta(T, 100);
  c('D02', 'il tasto «.» diventa virgola in NumIn', '10,5 → 10,50', await oreT(1).inputValue(), /^10,50?$/.test(await oreT(1).inputValue()));
  /* negativi */
  await scrivi(T, oreT(1), '-50', true);
  c('D03', 'NumIn: «-50» battuto', '50,00 (il meno non entra)', await oreT(1).inputValue(), /^50,00$/.test(await oreT(1).inputValue()));
  await scrivi(T, eur(1), '-33', false);
  c('D04', 'NumIn: «-33» incollato (€/ora)', '33 senza meno', await eur(1).inputValue(), !/-/.test(await eur(1).inputValue()) && /33/.test(await eur(1).inputValue()));
  await scrivi(T, w70(2), '1000'); await scrivi(T, w70(3), '500,50');
  /* vuoto e testo */
  await scrivi(T, eur(1), '');
  c('D05', 'casella vuota', '0 (nessun NaN)', await eur(1).inputValue(), !/NaN/.test(await eur(1).inputValue()));
  await scrivi(T, eur(1), 'abc');
  c('D06', 'testo in casella numerica', '0, nessun NaN', await eur(1).inputValue(), !/NaN/.test(await eur(1).inputValue()));
  await scrivi(T, eur(1), '20');
  /* cofinanziamento per voce: si scrive il finanziato, il cofinanziato è la differenza */
  await scrivi(T, w70(0), '1000');
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  let d0 = JSON.parse(await L.ls(T, 'usoint-p-pb'));
  r = await riga(oreT(0));
  c('D06b', 'cofin per voce: finanziato 1000 su 1.551,83', 'cofin 551,83 (salvato arrotondato) e a video 551,83', 'salvato ' + d0.personnel[0].cofin + ' · video ' + (r.match(/551,8\d/) || ['—'])[0], Math.abs(d0.personnel[0].cofin - 551.83) < 0.006 && /551,83/.test(r));
  c('D06c', 'valore salvato al centesimo', 'cofin con al massimo 2 decimali', d0.personnel[0].cofin, Math.round(d0.personnel[0].cofin * 100) / 100 === d0.personnel[0].cofin, Math.round(d0.personnel[0].cofin * 100) / 100 === d0.personnel[0].cofin ? 'SUPERATO' : 'PARZIALE');
  /* cofinanziamento in % */
  await T.page.locator('input[name=cofmode]').nth(1).check(); await L.aspetta(T, 200);
  await T.page.fill('input[placeholder="es. 20"]', '20'); await L.aspetta(T, 100);
  T.risposte.push({ re: /Sto per riscrivere/ });
  await T.page.click('button:has-text("Applica a tutte le voci")'); await L.aspetta(T, 300);
  const dA = T.dialoghi.filter(x => /Sto per riscrivere/.test(x.msg));
  c('D07', '«Applica a tutte le voci» chiede conferma', 'conferma con il numero di voci (4)', dA.length ? dA[0].msg.split('\n')[0] : 'nessuna', dA.length === 1 && /di 4 voci/.test(dA[0].msg));
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  let d = JSON.parse(await L.ls(T, 'usoint-p-pb'));
  c('D08', 'cofin al 20% (R2 su 310,365)', 'P1 310,37 · P2 200 (50×20) · beni 200 / 100,10', [d.personnel[0].cofin, d.personnel[1].cofin, d.beni[0].cofin, d.beni[1].cofin].join(' / '), d.personnel[0].cofin === 310.37 && d.personnel[1].cofin === 200 && d.beni[0].cofin === 200 && d.beni[1].cofin === 100.1);
  c('D09', 'modo e percentuale salvati', 'cofinMode pct, cofinPct 20', d.cofinMode + ' ' + d.cofinPct, d.cofinMode === 'pct' && String(d.cofinPct) === '20');
  await scrivi(T, oreT(1), '100');
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  d = JSON.parse(await L.ls(T, 'usoint-p-pb'));
  c('D10', 'in modo % il cofin segue le ore', 'P2 100 h × 20 € × 20% = 400', d.personnel[1].cofin, d.personnel[1].cofin === 400);
  T.risposte.push({ re: /Sto per riscrivere/, dismiss: true });
  await T.page.fill('input[placeholder="es. 20"]', '50');
  await T.page.click('button:has-text("Applica a tutte le voci")'); await L.aspetta(T, 300);
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  d = JSON.parse(await L.ls(T, 'usoint-p-pb'));
  c('D11', 'Applica annullato', 'cofin invariati (P1 310,37)', d.personnel[0].cofin, d.personnel[0].cofin === 310.37);
  /* spalma */
  const nSp = await T.page.locator('button', { hasText: '⇥ spalma' }).count();
  c('D12', '«⇥ spalma» presente (vincolato, 2 annualità)', '2 personale + 2 beni = 4', nSp, nSp === 4);
  await T.page.locator('button', { hasText: '⇥ spalma' }).nth(0).click(); await L.aspetta(T, 200);
  await T.page.locator('button', { hasText: '⇥ spalma' }).nth(3).click(); await L.aspetta(T, 200);
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  d = JSON.parse(await L.ls(T, 'usoint-p-pb'));
  c('D13', 'spalma ore 67,5 su 2 anni da 12 mesi', '[33,75 , 33,75]', JSON.stringify(d.personnel[0].aOre), d.personnel[0].aOre[0] === 33.75 && d.personnel[0].aOre[1] === 33.75);
  c('D14', 'spalma importo beni 500,50', '[250,25 , 250,25]', JSON.stringify(d.beni[1].aImp), d.beni[1].aImp[0] === 250.25 && d.beni[1].aImp[1] === 250.25);
  T.risposte.push({ re: /hanno gi/, dismiss: true });
  await T.page.locator('button', { hasText: '⇥ spalma' }).nth(0).click(); await L.aspetta(T, 200);
  c('D15', 'spalma con ore già presenti', 'chiede prima di sostituire', T.dialoghi.filter(x => /hanno gi/.test(x.msg)).length, T.dialoghi.filter(x => /hanno gi/.test(x.msg)).length === 1);
  await T.page.locator('button', { hasText: '⇥ spalma' }).nth(2).click(); await L.aspetta(T, 200);
  /* residui */
  await T.page.click('button:has-text("📊 Residui")'); await L.aspetta(T, 300);
  let t = await L.testo(T);
  c('D17', '📊 Residui apre il riepilogo', 'riquadro con le voci (EDUCATORE, MATERIALE)', /EDUCATORE/.test(t) && /MATERIALE/.test(t) && /Disponibile|non movimentata/.test(t), /EDUCATORE/.test(t) && /MATERIALE/.test(t));
  await T.page.mouse.click(5, 5); await L.aspetta(T, 200);
  /* vista MESI */
  await T.page.locator('button[title="Apri i mesi del 2026"]').click(); await L.aspetta(T, 400);
  t = await L.testo(T);
  c('D18', 'vista MESI 2026', 'tabella con GEN…DIC e «◄ Torna a budget»', /Torna a budget/.test(t) && /GEN/.test(t) && /DIC/.test(t), /Torna a budget/.test(t) && /GEN/.test(t));
  const m48 = T.page.locator('input[style*="width: 48px"]');
  c('D19', 'caselle ore mensili personale', '2 righe × 12 = 24', await m48.count(), await m48.count() === 24);
  await scrivi(T, m48.nth(0), '10'); await scrivi(T, m48.nth(1), '7,5');
  await scrivi(T, m48.nth(2), '-4', true);
  c('D20', 'cella mese: «-4» battuto', '4 senza meno', await m48.nth(2).inputValue(), !/-/.test(await m48.nth(2).inputValue()));
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  d = JSON.parse(await L.ls(T, 'usoint-p-pb'));
  c('D21', 'ore mese salvate', 'md[0] GEN 10, FEB 7,5, MAR 4', d.personnel[0].md[0].slice(0, 3).join(','), d.personnel[0].md[0][0] === 10 && d.personnel[0].md[0][1] === 7.5 && d.personnel[0].md[0][2] === 4);
  t = await L.testo(T);
  c('D22', 'totale ore anno nella riga', '21,50 e € 494,29 (21,5×22,99)', /21,50/.test(t) + ' ' + /494,29/.test(t), /21,50/.test(t) && /494,29/.test(t));
  /* fatture */
  let nf = await T.page.locator('button', { hasText: '+ Aggiungi fattura' }).count();
  c('D23', 'riquadro FATTURAZIONE nella vista MESI', '+ Aggiungi fattura presente', nf, nf === 1);
  if (nf) {
    await T.page.click('button:has-text("+ Aggiungi fattura")'); await T.page.click('button:has-text("+ Aggiungi fattura")'); await L.aspetta(T, 200);
    const f110 = T.page.locator('input[style*="width: 110px"]');
    await scrivi(T, f110.nth(0), '1234567,89'); await scrivi(T, f110.nth(1), '1000');
    await T.page.locator('input[style*="width: 100px"]').nth(0).fill('2026/777');
    T.risposte.push({ re: /Eliminare questa fattura/, dismiss: true });
    const xs = T.page.locator('td button', { hasText: '✕' });
    await xs.nth(0).click(); await L.aspetta(T, 200);
    const dF = T.dialoghi.filter(x => /Eliminare questa fattura/.test(x.msg));
    c('D24', '✕ fattura chiede conferma con importo formattato', '«n° 2026/777 · acconto · € 1.234.567,89»', dF.length ? dF[0].msg.split('\n')[2] : 'nessuna', dF.length === 1 && /€ 1\.234\.567,89/.test(dF[0].msg) && /2026\/777/.test(dF[0].msg));
    c('D25', 'annulla = la fattura resta', '2 righe', await f110.count(), await f110.count() === 2);
    T.risposte.push({ re: /Eliminare questa fattura/ });
    await xs.nth(1).click(); await L.aspetta(T, 200);
    const dF2 = T.dialoghi.filter(x => /Eliminare questa fattura/.test(x.msg));
    c('D26', '✕ fattura da 1000', '«€ 1.000,00»; confermata = 1 riga', (dF2[1] ? dF2[1].msg.split('\n')[2] : '') + ' / ' + await f110.count(), dF2[1] && /€ 1\.000,00/.test(dF2[1].msg) && await f110.count() === 1);
    t = await L.testo(T);
    c('D27', 'Totale fatturato', '€ 1.234.567,89', /Totale fatturato\s*€ 1\.234\.567,89/.test(t), /€ 1\.234\.567,89/.test(t));
    await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
    d = JSON.parse(await L.ls(T, 'usoint-p-pb'));
    c('D28', 'fattura salvata', 'importo 1234567,89', JSON.stringify(d.fatture), d.fatture.length === 1 && d.fatture[0].importo === 1234567.89);
  }
  await T.page.click('button:has-text("◄ Torna a budget")'); await L.aspetta(T, 300);
  /* proroga */
  T.risposte.push({ re: /Nuova data fine/, text: '31/02/2028' });
  await T.page.click('button:has-text("📅 Proroga")'); await L.aspetta(T, 300);
  c('D29', 'proroga con data impossibile 31/02/2028', 'avviso «Data non valida»', T.dialoghi.filter(x => /Data non valida/.test(x.msg)).length, T.dialoghi.filter(x => /Data non valida/.test(x.msg)).length === 1);
  T.risposte.push({ re: /Nuova data fine/, text: '30/06/2027' });
  await T.page.click('button:has-text("📅 Proroga")'); await L.aspetta(T, 300);
  c('D30', 'proroga con data precedente alla fine', 'avviso «deve essere successiva»', T.dialoghi.filter(x => /successiva/.test(x.msg)).length, T.dialoghi.filter(x => /successiva/.test(x.msg)).length === 1);
  T.risposte.push({ re: /Nuova data fine/, text: '31/12/2028' });
  await T.page.click('button:has-text("📅 Proroga")'); await L.aspetta(T, 300);
  c('D31', 'proroga al 31/12/2028', '«Aggiunti 1 anno/i», bottone 2028', T.dialoghi.filter(x => /Aggiunti 1 anno/.test(x.msg)).length + ' / ' + await T.page.locator('button[title="Apri i mesi del 2028"]').count(), T.dialoghi.filter(x => /Aggiunti 1 anno/.test(x.msg)).length === 1 && await T.page.locator('button[title="Apri i mesi del 2028"]').count() === 1);
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  d = JSON.parse(await L.ls(T, 'usoint-p-pb'));
  c('D32', 'proroga salvata', 'end 2028-12-31, aOre lunghi 3, md 3 anni, ore conservate', d.end + ' ' + d.personnel[0].aOre.length + ' ' + d.personnel[0].md.length + ' ' + d.personnel[0].md[0][0], d.end === '2028-12-31' && d.personnel[0].aOre.length === 3 && d.personnel[0].md.length === 3 && d.personnel[0].md[0][0] === 10);
  const idx = JSON.parse(await L.ls(T, 'usoint-idx'));
  c('D33', 'indice dopo la proroga', 'quale fine dice l\'elenco della Home', idx[0].end, idx[0].end === '2028-12-31');
  /* Excel */
  const [dl] = await Promise.all([T.page.waitForEvent('download', { timeout: 10000 }).catch(() => null), T.page.click('button:has-text("📊 Excel")')]);
  if (dl) {
    const f = path.join(__dirname, 'out-uso-a01.xlsx'); await dl.saveAs(f);
    const buf = fs.readFileSync(f); const wb = XLSX.read(buf, { type: 'buffer' });
    c('D34', 'export Excel vero .xlsx', 'firma PK, fogli Budget + anni', buf.slice(0, 2).toString() + ' · ' + wb.SheetNames.join(','), buf.slice(0, 2).toString() === 'PK' && wb.SheetNames[0] === 'Budget');
    c('D35', 'nome del file', 'convenzione «… ggmmmaa - ' + L.VER + ' - HH.MM.xlsx»', dl.suggestedFilename(), new RegExp('\\d{2}[a-z]{3}\\d{2} - ' + L.VER + ' - \\d{2}\\.\\d{2}\\.xlsx$').test(dl.suggestedFilename()));
    const ws = wb.Sheets.Budget; const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
    const rA = rows.find(x => x[0] === 'ALFA PROVA') || [];
    c('D36', 'riga ALFA PROVA nel foglio Budget', 'ore 67,5 €/h 22,99 costo 1551,825', rA.slice(3, 7).join(' | '), rA[3] === 67.5 && rA[4] === 22.99 && Math.abs(rA[5] - 1551.825) < 0.001);
    c('D37', 'autore nei metadati', 'Christian Canonica', (wb.Props || {}).Author, (wb.Props || {}).Author === 'Christian Canonica');
    fs.unlinkSync(f);
  } else c('D34', 'export Excel', 'download', 'nessun download', false);
  /* ore nell'anno aggiunto con la proroga: arrivano nel Riepilogo operatori? */
  await T.page.locator('button[title="Apri i mesi del 2028"]').click(); await L.aspetta(T, 400);
  await scrivi(T, T.page.locator('input[style*="width: 48px"]').nth(0), '9');
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  d = JSON.parse(await L.ls(T, 'usoint-p-pb'));
  await T.page.locator('button', { hasText: '←' }).first().click(); await L.aspetta(T, 400);
  const tHome = await L.testo(T);
  c('D39', 'Home dopo la proroga', 'periodo del cartellino fino al 2028', (tHome.match(/BUDGET PROVA[\s\S]{0,80}/) || [''])[0].replace(/\n/g, ' '), /2028/.test((tHome.match(/BUDGET PROVA[\s\S]{0,80}/) || [''])[0]));
  await T.page.click('button:has-text("👥 Riepilogo operatori")'); await L.aspetta(T, 800);
  const opz = await T.page.locator('select').first().evaluate(s => Array.from(s.options).map(o => o.value + '=' + o.text)).catch(() => []);
  const kA = (opz.find(o => /ALFA PROVA/i.test(o)) || '').split('=')[0];
  if (kA) { await T.page.locator('select').first().selectOption(kA); await L.aspetta(T, 400); }
  const tR = await L.testo(T);
  c('D40', 'ore del 2028 (anno di proroga, 9 h GEN) nel Riepilogo operatori', 'anno 2028 presente nel dettaglio per progetto', 'md2028=' + d.personnel[0].md[2][0] + ' · ALFA a video ' + /ALFA PROVA/.test(tR) + ' · 2026 a video ' + /2026/.test(tR) + ' · 2028 a video ' + /2028/.test(tR), /2028/.test(tR));
  c('D38', 'errori di pagina', '0', T.errori.length + ' ' + T.errori.slice(0, 2).join('|'), T.errori.length === 0);
  await ctx.close();
  L.fine('uso-a01-budget'); await L.chiudi();
})().catch(async e => { console.error('ERRORE SCRIPT', e); await L.chiudi(); process.exit(1); });
