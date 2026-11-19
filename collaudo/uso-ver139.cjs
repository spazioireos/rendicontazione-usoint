// USOINT ver139 — le due correzioni, con CONFRONTO DIRETTO ver138 ↔ ver139. SOLO DATI INVENTATI.
//  1) rinomina + 💾 + ← : la Home mostra il titolo nuovo, e una Duplica successiva NON riscrive il titolo
//     vecchio né in localStorage né nel cloud (finto);
//  2) 📅 Proroga + 💾 : l'elenco (usoint-idx) ha la data nuova, anche nel cloud, e il Riepilogo operatori
//     vede le ore dell'anno aggiunto;
//  3) non regressione: avviso titoli doppi alla rinomina, timbro fra due schede, uscita con modifiche
//     non salvate, salvataggio senza modifiche che non tocca l'elenco, cadenza/colore/vincolo intatti.
// Banco: bash collaudo/comune/prepara-comune.sh <porta>, più la ver138 localizzata in .banco/uso138/
//   (python3 collaudo/comune/localizza.py <ver138>/index.html collaudo/comune/.banco/uso138/index.html)
// PORTA=8343 NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-ver139.cjs [cartella-PNG]
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const path = require('path');
const PNG = process.argv[2] || '';

function seme() {
  const nY = 2;
  const p1 = L.prog('p1', 'LAVORO UNO PROVA', '2026-01-01', '2027-12-31', nY, { personnel: [L.pers(nY, { nome: 'ALFA PROVA', voce: 'EDUCATORE' })] });
  const p2 = L.prog('p2', 'LAVORO DUE PROVA', '2026-01-01', '2027-12-31', nY, { personnel: [L.pers(nY, { nome: 'BETA PROVA', voce: 'EDUCATORE' })] });
  return {
    'usoint-idx': [
      { id: 'p1', title: 'LAVORO UNO PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: false, cadMesi: 3, colore: '#118AB2' },
      { id: 'p2', title: 'LAVORO DUE PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: false, cadMesi: 2, colore: '#E8336D' }],
    'usoint-p-p1': p1, 'usoint-p-p2': p2 };
}
async function apri(T, dir) {
  await T.page.goto(L.BASE + dir + '/index.html');
  await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});
  await L.aspetta(T, 400);
}
async function apriLavoro(T, titolo) {
  await T.page.locator('div[style*="cursor: pointer"]', { hasText: titolo }).last().click();
  await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO/.test(document.body.innerText), null, { timeout: 10000 }).catch(() => {});
  await L.aspetta(T, 300);
}
const indietro = T => T.page.locator('button', { hasText: '←' }).first().click();
const idxLS = async T => JSON.parse(await L.ls(T, 'usoint-idx'));
const idxCloud = async T => JSON.parse(await L.cloud(T, 'usoint-idx'));
const timbri = T => T.dialoghi.filter(d => /altra scheda ha salvato/.test(d.msg)).length;

/* ---------- 1: rinomina ---------- */
async function rinomina(dir) {
  const { ctx } = await L.contesto({ kv: seme() });
  const T = await L.pagina(ctx); await apri(T, dir);
  await apriLavoro(T, 'LAVORO DUE PROVA');
  T.risposte.push({ re: /Rinomina il lavoro/, text: 'LAVORO QUATTRO PROVA' });
  await T.page.locator('span[title="Clicca per rinominare il lavoro"]').click(); await L.aspetta(T, 300);
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  await indietro(T); await L.aspetta(T, 500);
  const th = await L.testo(T);
  const r = { home: /LAVORO QUATTRO PROVA/.test(th) && !/LAVORO DUE PROVA/.test(th) };
  if (PNG && dir === 'uso') await T.page.screenshot({ path: path.join(PNG, 'uso139-home-dopo-rinomina.png'), fullPage: true });
  // altra operazione sull'elenco: Duplica del PRIMO lavoro, poi ← e attesa del cloud
  await T.page.locator('button', { hasText: 'Duplica' }).first().click(); await L.aspetta(T, 500);
  await indietro(T); await L.aspetta(T, 2200);
  const ls = await idxLS(T), cl = await idxCloud(T);
  const tit = a => a.map(x => x.title);
  r.ls = tit(ls); r.cloud = tit(cl);
  r.lsOk = ls.some(x => x.id === 'p2' && x.title === 'LAVORO QUATTRO PROVA') && !ls.some(x => x.title === 'LAVORO DUE PROVA') && ls.length === 3;
  r.cloudOk = cl.some(x => x.id === 'p2' && x.title === 'LAVORO QUATTRO PROVA') && !cl.some(x => x.title === 'LAVORO DUE PROVA') && cl.length === 3;
  r.timbri = timbri(T); r.errori = T.errori.length;
  await T.page.reload(); await L.aspetta(T, 1500);
  r.dopoRicarica = /LAVORO QUATTRO PROVA/.test(await L.testo(T));
  await ctx.close(); return r;
}
/* ---------- 2: proroga ---------- */
async function proroga(dir) {
  const { ctx } = await L.contesto({ kv: seme() });
  const T = await L.pagina(ctx); await apri(T, dir);
  await apriLavoro(T, 'LAVORO UNO PROVA');
  T.risposte.push({ re: /Nuova data fine/, text: '31/12/2028' });
  await T.page.click('button:has-text("📅 Proroga")'); await L.aspetta(T, 300);
  await T.page.locator('button[title="Apri i mesi del 2028"]').click(); await L.aspetta(T, 400);
  const cel = T.page.locator('input[style*="width: 48px"]').nth(0);
  await cel.click(); await cel.press('Control+a'); await cel.fill('9'); await cel.press('Tab'); await L.aspetta(T, 150);
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  const d = JSON.parse(await L.ls(T, 'usoint-p-p1'));
  await indietro(T); await L.aspetta(T, 2200);
  const ls = await idxLS(T), cl = await idxCloud(T);
  const v1 = ls.find(x => x.id === 'p1'), v2 = ls.find(x => x.id === 'p2'), c1 = cl.find(x => x.id === 'p1');
  const r = { md2028: d.personnel[0].md[2] && d.personnel[0].md[2][0], endLS: v1.end, endCloud: c1.end, startLS: v1.start,
    restoIntatto: v1.cadMesi === 3 && v1.colore === '#118AB2' && v1.vincolo === false && v1.title === 'LAVORO UNO PROVA' && JSON.stringify(v2) === JSON.stringify(seme()['usoint-idx'][1]) };
  const tHome = await L.testo(T);
  r.home2028 = /LAVORO UNO PROVA[\s\S]{0,80}2028/.test(tHome);
  await T.page.click('button:has-text("👥 Riepilogo operatori")'); await L.aspetta(T, 800);
  const opz = await T.page.locator('select').first().evaluate(s => Array.from(s.options).map(o => o.value + '=' + o.text)).catch(() => []);
  const kA = (opz.find(o => /ALFA PROVA/i.test(o)) || '').split('=')[0];
  if (kA) { await T.page.locator('select').first().selectOption(kA); await L.aspetta(T, 400); }
  r.riep2028 = /2028/.test(await L.testo(T));
  r.timbri = timbri(T); r.errori = T.errori.length;
  await ctx.close(); return r;
}
/* ---------- 3: non regressione (solo sulla ver139, salvo dove indicato) ---------- */
async function nonRegressione() {
  const { ctx } = await L.contesto({ kv: seme() });
  const T = await L.pagina(ctx); await apri(T, 'uso');
  // 3a: salvare SENZA cambiare titolo/date non tocca l'elenco
  const prima = await L.ls(T, 'usoint-idx');
  await apriLavoro(T, 'LAVORO UNO PROVA');
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  c('N01', '💾 senza rinomina né proroga', 'usoint-idx identico, carattere per carattere', (await L.ls(T, 'usoint-idx')) === prima, (await L.ls(T, 'usoint-idx')) === prima);
  // 3b: titolo doppio alla rinomina (ver127)
  T.risposte.push({ re: /Rinomina il lavoro/, text: 'lavoro due prova' });
  T.risposte.push({ re: /Esiste gi/, dismiss: true });
  await T.page.locator('span[title="Clicca per rinominare il lavoro"]').click(); await L.aspetta(T, 300);
  const dd = T.dialoghi.filter(d => /Esiste gi/.test(d.msg));
  c('N02', 'rinomina con titolo doppio (annulla)', 'avviso che parla di SOMMATE, titolo invariato', dd.length + ' avvisi · ' + /LAVORO UNO PROVA/.test(await L.testo(T)), dd.length === 1 && /SOMMATE/.test(dd[0].msg) && /LAVORO UNO PROVA/.test(await L.testo(T)));
  // 3c: uscita con modifiche non salvate (ver133)
  T.risposte.push({ re: /Rinomina il lavoro/, text: 'LAVORO CINQUE PROVA' });
  await T.page.locator('span[title="Clicca per rinominare il lavoro"]').click(); await L.aspetta(T, 300);
  T.risposte.push({ re: /modifiche non salvate/, dismiss: true });
  await indietro(T); await L.aspetta(T, 300);
  const resta = /BUDGET\/PREVENTIVO/.test(await L.testo(T));
  c('N03', '← con modifiche non salvate, annulla', 'avviso e si resta nella scheda', T.dialoghi.filter(d => /modifiche non salvate/.test(d.msg)).length + ' avvisi · nella scheda ' + resta, T.dialoghi.filter(d => /modifiche non salvate/.test(d.msg)).length === 1 && resta);
  T.risposte.push({ re: /modifiche non salvate/ });
  await indietro(T); await L.aspetta(T, 500);
  const th = await L.testo(T), idx = await idxLS(T);
  c('N04', '← con modifiche non salvate, conferma', 'Home col titolo di prima, elenco e lavoro non toccati', 'Home UNO ' + /LAVORO UNO PROVA/.test(th) + ' / CINQUE ' + /LAVORO CINQUE PROVA/.test(th) + ' · idx ' + idx[0].title, /LAVORO UNO PROVA/.test(th) && !/LAVORO CINQUE PROVA/.test(th) && idx[0].title === 'LAVORO UNO PROVA' && JSON.parse(await L.ls(T, 'usoint-p-p1')).title === 'LAVORO UNO PROVA');
  // 3d: timbro fra due schede (ver131): la seconda scheda salva, la prima non deve sovrascrivere in silenzio
  const T2 = await L.pagina(ctx); await apri(T2, 'uso');
  await T2.page.locator('button', { hasText: 'Duplica' }).first().click(); await L.aspetta(T2, 500);
  await indietro(T2); await L.aspetta(T2, 400);
  const dopoT2 = await L.ls(T, 'usoint-idx');
  c('N05', 'seconda scheda duplica', 'nessuna domanda nella seconda scheda, elenco a 3', timbri(T2) + ' domande · ' + JSON.parse(dopoT2).length + ' lavori', timbri(T2) === 0 && JSON.parse(dopoT2).length === 3);
  T.risposte.push({ re: /altra scheda ha salvato/, dismiss: true });
  await T.page.locator('button', { hasText: 'Duplica' }).first().click(); await L.aspetta(T, 500);
  c('N06', 'prima scheda duplica dopo l\'altra', 'avviso del timbro; annullando l\'elenco resta quello dell\'altra scheda', timbri(T) + ' avvisi · elenco identico ' + ((await L.ls(T, 'usoint-idx')) === dopoT2), timbri(T) === 1 && (await L.ls(T, 'usoint-idx')) === dopoT2);
  // 3d-bis (SOLO SEGNALATO, preesistente dalla ver131): `dp` scrive il lavoro copiato PRIMA di chiedere il timbro e
  //     apre la copia anche se si annulla; resta un usoint-p-<id> che l'elenco non conosce
  const orfani = async TT => { const ix = JSON.parse(await L.ls(TT, 'usoint-idx')).map(x => x.id); return TT.page.evaluate(ids => Object.keys(localStorage).filter(k => k.indexOf('usoint-p-') === 0 && ids.indexOf(k.slice(9)) < 0), ix); };
  const orf = await orfani(T), aperta = /BUDGET\/PREVENTIVO/.test(await L.testo(T));
  c('N06b', 'Duplica annullata dal timbro (preesistente, NON corretto)', 'segnalato: lavoro copiato scritto e aperto lo stesso', 'orfani ' + JSON.stringify(orf) + ' · scheda aperta ' + aperta, true, 'SEGNALATO');
  if (aperta) { await indietro(T); await L.aspetta(T, 500); }
  // 3e: la prima scheda apre un lavoro e torna con ←: la Home rilegge l'elenco (vede la copia dell'altra
  //     scheda) e il timbro CONTINUA ad avvisare, perché l'altra scheda ha comunque salvato dopo
  await apriLavoro(T, 'LAVORO UNO PROVA'); await indietro(T); await L.aspetta(T, 500);
  const thh = await L.testo(T);
  T.risposte.push({ re: /altra scheda ha salvato/, dismiss: true });
  await T.page.locator('button', { hasText: 'Duplica' }).first().click(); await L.aspetta(T, 500);
  c('N07', 'dopo ← la Home rilegge l\'elenco; il timbro avvisa ancora', 'la copia dell\'altra scheda a video, 2° avviso del timbro, elenco intatto', 'copia a video ' + /\(copia\)/.test(thh) + ' · avvisi ' + timbri(T) + ' · elenco identico ' + ((await L.ls(T, 'usoint-idx')) === dopoT2), /\(copia\)/.test(thh) && timbri(T) === 2 && (await L.ls(T, 'usoint-idx')) === dopoT2);
  // 3f: una scheda sola, dopo rinomina+💾+←, nessun falso avviso del timbro (coperto anche dal giro 1)
  c('N08', 'errori di pagina (due schede)', '0', (T.errori.length + T2.errori.length) + ' ' + T.errori.concat(T2.errori).slice(0, 2).join('|'), T.errori.length + T2.errori.length === 0);
  await ctx.close();
}
async function orfanoDup(dir) {
  const { ctx } = await L.contesto({ kv: seme() });
  const T = await L.pagina(ctx); await apri(T, dir);
  const T2 = await L.pagina(ctx); await apri(T2, dir);
  await T2.page.locator('button', { hasText: 'Duplica' }).first().click(); await L.aspetta(T2, 500);
  T.risposte.push({ re: /altra scheda ha salvato/, dismiss: true });
  await T.page.locator('button', { hasText: 'Duplica' }).first().click(); await L.aspetta(T, 500);
  const ix = JSON.parse(await L.ls(T, 'usoint-idx')).map(x => x.id);
  const orf = await T.page.evaluate(ids => Object.keys(localStorage).filter(k => k.indexOf('usoint-p-') === 0 && ids.indexOf(k.slice(9)) < 0), ix);
  await ctx.close(); return orf.length;
}
(async () => {
  c('N00', 'ver138: Duplica annullata dal timbro lascia un lavoro orfano?', 'misura del preesistente', (await orfanoDup('uso138')) + ' orfani', true, 'SEGNALATO');
  const r138 = await rinomina('uso138'), r139 = await rinomina('uso');
  c('R01', 'ver138: Home dopo rinomina+💾+←', 'DIFETTO: titolo vecchio', 'titolo nuovo a video ' + r138.home, r138.home === false);
  c('R02', 'ver139: Home dopo rinomina+💾+←', 'titolo nuovo LAVORO QUATTRO PROVA', 'titolo nuovo a video ' + r139.home, r139.home === true);
  c('R03', 'ver138: Duplica dopo la rinomina', 'DIFETTO: titolo vecchio riscritto in localStorage e nel cloud', 'ls ' + JSON.stringify(r138.ls) + ' · cloud ' + JSON.stringify(r138.cloud), !r138.lsOk && !r138.cloudOk);
  c('R04', 'ver139: Duplica dopo la rinomina (localStorage)', 'LAVORO QUATTRO PROVA, nessun LAVORO DUE PROVA, 3 lavori', JSON.stringify(r139.ls), r139.lsOk);
  c('R05', 'ver139: Duplica dopo la rinomina (cloud finto)', 'LAVORO QUATTRO PROVA, nessun LAVORO DUE PROVA, 3 lavori', JSON.stringify(r139.cloud), r139.cloudOk);
  c('R06', 'ver139: nessun falso avviso del timbro, nessun errore', '0 avvisi · 0 errori', r139.timbri + ' · ' + r139.errori, r139.timbri === 0 && r139.errori === 0);
  c('R07', 'ver139: Home dopo ricarica', 'titolo nuovo', r139.dopoRicarica, r139.dopoRicarica);
  const p138 = await proroga('uso138'), p139 = await proroga('uso');
  c('P01', 'ver138: elenco dopo proroga+💾', 'DIFETTO: fine ancora 2027-12-31; Riepilogo senza 2028', 'end ' + p138.endLS + ' · Riepilogo 2028 ' + p138.riep2028, p138.endLS === '2027-12-31' && !p138.riep2028);
  c('P02', 'ver139: elenco dopo proroga+💾 (localStorage)', 'end 2028-12-31, start invariato', p139.endLS + ' · ' + p139.startLS, p139.endLS === '2028-12-31' && p139.startLS === '2026-01-01');
  c('P03', 'ver139: elenco dopo proroga+💾 (cloud finto)', 'end 2028-12-31', p139.endCloud, p139.endCloud === '2028-12-31');
  c('P04', 'ver139: cadenza, colore, vincolo, titolo e l\'altra voce intatti', 'invariati', p139.restoIntatto, p139.restoIntatto);
  c('P05', 'ver139: Home dopo la proroga', 'cartellino fino al 2028', p139.home2028, p139.home2028);
  c('P06', 'ver139: Riepilogo operatori vede le ore del 2028', '9 h GEN 2028 salvate, anno 2028 a video', 'md2028=' + p139.md2028 + ' · 2028 a video ' + p139.riep2028, p139.md2028 === 9 && p139.riep2028);
  c('P07', 'ver139: nessun avviso del timbro, nessun errore', '0 · 0', p139.timbri + ' · ' + p139.errori, p139.timbri === 0 && p139.errori === 0);
  await nonRegressione();
  L.fine('uso-ver139'); await L.chiudi();
})().catch(async e => { console.error('ERRORE SCRIPT', e); await L.chiudi(); process.exit(1); });
