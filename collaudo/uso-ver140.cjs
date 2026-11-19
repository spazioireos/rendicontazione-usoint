// USOINT ver140 — le due correzioni, con CONFRONTO DIRETTO ver139 ↔ ver140. SOLO DATI INVENTATI.
//  1) vincolo 🔒/🔓 cambiato nella scheda + 💾 : l'elenco (usoint-idx) e il cartellino della Home lo seguono,
//     anche nel cloud finto; senza cambi l'elenco non si riscrive;
//  2) Duplica annullata dal timbro (due schede): nessun usoint-p-<id> orfano, né in localStorage né nel cloud,
//     e nessuna scheda aperta; confermando, la copia nasce come prima.
// Banco: bash collaudo/comune/prepara-comune.sh <porta>, più la ver139 localizzata in .banco/uso139/
//   (git show <commit ver139>:index.html > /tmp/x/index.html;
//    python3 collaudo/comune/localizza.py /tmp/x/index.html collaudo/comune/.banco/uso139/index.html)
// PORTA=8343 NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-ver140.cjs
const L = require('./uso-a01-lib.cjs');
const { c } = L;

function seme() {
  const nY = 2;
  const p1 = L.prog('p1', 'LAVORO UNO PROVA', '2026-01-01', '2027-12-31', nY, { vincolo: false, personnel: [L.pers(nY, { nome: 'ALFA PROVA', voce: 'EDUCATORE' })] });
  const p2 = L.prog('p2', 'LAVORO DUE PROVA', '2026-01-01', '2027-12-31', nY, { vincolo: true, personnel: [L.pers(nY, { nome: 'BETA PROVA', voce: 'EDUCATORE' })] });
  return {
    'usoint-idx': [
      { id: 'p1', title: 'LAVORO UNO PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: false, cadMesi: 3, colore: '#118AB2' },
      { id: 'p2', title: 'LAVORO DUE PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: true, cadMesi: 2, colore: '#E8336D' }],
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
async function cartellino(T, titolo) {
  // il riquadro più piccolo che contiene il titolo E il pulsante Duplica, cioè il cartellino di quel lavoro
  return T.page.evaluate(t => { const ds = Array.from(document.querySelectorAll('div')).filter(d => d.innerText.includes(t) && d.innerText.includes('Duplica')).sort((a, b) => a.innerText.length - b.innerText.length); const box = ds.length ? ds[0].innerText : ''; return /Vincolo/.test(box) ? 'Vincolo' : /Libero/.test(box) ? 'Libero' : '?'; }, titolo);
}
async function orfaniLS(T) { const ix = (await idxLS(T)).map(x => x.id); return T.page.evaluate(ids => Object.keys(localStorage).filter(k => k.indexOf('usoint-p-') === 0 && ids.indexOf(k.slice(9)) < 0), ix); }
async function orfaniCloud(T) {
  const ix = (await idxCloud(T)).map(x => x.id);
  return T.page.evaluate(([p, uid, ids]) => Object.keys(window.__fakefb.dump(p)).filter(k => k.indexOf('users/' + uid + '/kv/usoint-p-') === 0).map(k => k.split('/kv/')[1]).filter(k => ids.indexOf(k.slice(9)) < 0), [L.USO, L.UID, ix]);
}

/* ---------- 1: vincolo ---------- */
async function vincolo(dir) {
  const { ctx } = await L.contesto({ kv: seme() });
  const T = await L.pagina(ctx); await apri(T, dir);
  const r = { prima: await cartellino(T, 'LAVORO UNO PROVA') };
  await apriLavoro(T, 'LAVORO UNO PROVA');
  T.risposte.push({ re: /Stai passando a/ });
  await T.page.locator('button', { hasText: 'LIBERO — RICORDA' }).first().click(); await L.aspetta(T, 300);
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  await indietro(T); await L.aspetta(T, 2200);
  r.lavoro = JSON.parse(await L.ls(T, 'usoint-p-p1')).vincolo;
  const ls = await idxLS(T), cl = await idxCloud(T);
  r.ls = ls.find(x => x.id === 'p1').vincolo; r.cloud = cl.find(x => x.id === 'p1').vincolo;
  r.altro = JSON.stringify(ls.find(x => x.id === 'p2')) === JSON.stringify(seme()['usoint-idx'][1]);
  r.resto = ls.find(x => x.id === 'p1').cadMesi === 3 && ls.find(x => x.id === 'p1').colore === '#118AB2' && ls.find(x => x.id === 'p1').title === 'LAVORO UNO PROVA';
  r.home = await cartellino(T, 'LAVORO UNO PROVA');
  await T.page.reload(); await L.aspetta(T, 1500);
  r.ricarica = await cartellino(T, 'LAVORO UNO PROVA');
  // torno a LIBERO: l'elenco deve seguire anche all'indietro
  await apriLavoro(T, 'LAVORO UNO PROVA');
  T.risposte.push({ re: /Stai passando a/ });
  await T.page.locator('button', { hasText: 'VINCOLO — RICORDA' }).first().click(); await L.aspetta(T, 300);
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  r.indietro = (await idxLS(T)).find(x => x.id === 'p1').vincolo;
  await indietro(T); await L.aspetta(T, 400);
  r.homeIndietro = await cartellino(T, 'LAVORO UNO PROVA');
  // 💾 senza cambiare niente: l'elenco resta identico carattere per carattere
  const prima = await L.ls(T, 'usoint-idx');
  await apriLavoro(T, 'LAVORO DUE PROVA');
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  r.identico = (await L.ls(T, 'usoint-idx')) === prima;
  await indietro(T); await L.aspetta(T, 300);
  r.timbri = timbri(T); r.errori = T.errori.length;
  await ctx.close(); return r;
}
/* ---------- 2: duplica annullata / confermata dal timbro ---------- */
async function duplica(dir, risposta) {
  const { ctx } = await L.contesto({ kv: seme() });
  const T = await L.pagina(ctx); await apri(T, dir);
  const T2 = await L.pagina(ctx); await apri(T2, dir);
  await T2.page.locator('button', { hasText: 'Duplica' }).first().click(); await L.aspetta(T2, 500);
  await indietro(T2); await L.aspetta(T2, 400);
  const dopoT2 = await L.ls(T, 'usoint-idx');
  const pKeys = async () => T.page.evaluate(() => Object.keys(localStorage).filter(k => k.indexOf('usoint-p-') === 0));
  const kPrima = await pKeys(), nP = kPrima.length;
  T.risposte.push(risposta === 'annulla' ? { re: /altra scheda ha salvato/, dismiss: true } : { re: /altra scheda ha salvato/ });
  await T.page.locator('button', { hasText: 'Duplica' }).first().click(); await L.aspetta(T, 2300);
  const r = { avvisi: timbri(T), orfLS: await orfaniLS(T), orfCloud: await orfaniCloud(T),
    aperta: /BUDGET\/PREVENTIVO/.test(await L.testo(T)), idxUguale: (await L.ls(T, 'usoint-idx')) === dopoT2,
    nPdopo: (await pKeys()).length - nP, nIdx: (await idxLS(T)).length, errori: T.errori.length + T2.errori.length };
  const nuove = (await pKeys()).filter(k => kPrima.indexOf(k) < 0);
  r.nuovaInElenco = nuove.length === 1 && (await idxLS(T)).some(x => x.id === nuove[0].slice(9));
  r.copiaT2 = kPrima.filter(k => ['usoint-p-p1', 'usoint-p-p2'].indexOf(k) < 0);
  await ctx.close(); return r;
}
(async () => {
  const v139 = await vincolo('uso139'), v140 = await vincolo('uso');
  c('V01', 'ver139: elenco dopo vincolo cambiato + 💾', 'DIFETTO: usoint-idx resta false, Home «Libero»', 'lavoro ' + v139.lavoro + ' · idx ' + v139.ls + ' · Home ' + v139.home, v139.lavoro === true && v139.ls === false && v139.home === 'Libero');
  c('V02', 'ver140: lavoro e elenco (localStorage)', 'vincolo true in tutti e due', 'lavoro ' + v140.lavoro + ' · idx ' + v140.ls, v140.lavoro === true && v140.ls === true);
  c('V03', 'ver140: elenco nel cloud finto', 'vincolo true', v140.cloud, v140.cloud === true);
  c('V04', 'ver140: cartellino della Home subito e dopo ricarica', '«Vincolo» e «Vincolo»', v140.home + ' / ' + v140.ricarica, v140.home === 'Vincolo' && v140.ricarica === 'Vincolo');
  c('V05', 'ver140: titolo, cadenza, colore e l\'altra voce intatti', 'invariati', v140.resto + ' / ' + v140.altro, v140.resto && v140.altro);
  c('V06', 'ver140: di nuovo LIBERO + 💾', 'idx false, Home «Libero»', v140.indietro + ' / ' + v140.homeIndietro, v140.indietro === false && v140.homeIndietro === 'Libero');
  c('V07', 'ver140: 💾 senza cambi', 'usoint-idx identico carattere per carattere', v140.identico, v140.identico);
  c('V08', 'ver140: nessun avviso del timbro, nessun errore', '0 · 0', v140.timbri + ' · ' + v140.errori, v140.timbri === 0 && v140.errori === 0);
  const a139 = await duplica('uso139', 'annulla'), a140 = await duplica('uso', 'annulla');
  c('D01', 'ver139: Duplica annullata dal timbro', 'DIFETTO: un orfano in localStorage e copia aperta', 'orfani LS ' + JSON.stringify(a139.orfLS) + ' · cloud ' + JSON.stringify(a139.orfCloud) + ' · aperta ' + a139.aperta, a139.orfLS.length === 1 && a139.aperta);
  c('D02', 'ver140: Duplica annullata, avviso del timbro', '1 avviso', a140.avvisi, a140.avvisi === 1);
  c('D03', 'ver140: nessun orfano in localStorage', '[]', JSON.stringify(a140.orfLS) + ' · nuove chiavi p ' + a140.nPdopo, a140.orfLS.length === 0 && a140.nPdopo === 0);
  c('D04', 'ver140: nessun orfano nel cloud finto', '[]', JSON.stringify(a140.orfCloud), a140.orfCloud.length === 0);
  c('D05', 'ver140: non si apre niente, l\'elenco resta quello dell\'altra scheda', 'Home, elenco identico', 'aperta ' + a140.aperta + ' · idx identico ' + a140.idxUguale, !a140.aperta && a140.idxUguale);
  const s140 = await duplica('uso', 'ok');
  // confermando si sovrascrive l'elenco con quello di QUESTA scheda (+ la copia nuova): la copia fatta dall'altra
  // scheda esce dall'elenco. È la conseguenza dichiarata di «sovrascrivi» (ver131), non della ver140.
  c('D06', 'ver140: Duplica CONFERMATA dopo il timbro', 'avviso una volta, copia nuova scritta, nell\'elenco e aperta', 'avvisi ' + s140.avvisi + ' · nuove p ' + s140.nPdopo + ' · nell\'elenco ' + s140.nuovaInElenco + ' · aperta ' + s140.aperta, s140.avvisi === 1 && s140.nPdopo === 1 && s140.nuovaInElenco && s140.aperta);
  c('D06b', 'ver140: confermando, la copia dell\'altra scheda esce dall\'elenco (sovrascrittura voluta, ver131)', 'solo segnalato', 'fuori elenco: ' + JSON.stringify(s140.orfLS), true, 'SEGNALATO');
  c('D07', 'ver140: errori di pagina', '0', a140.errori + s140.errori, a140.errori + s140.errori === 0);
  L.fine('uso-ver140'); await L.chiudi();
})().catch(async e => { console.error('ERRORE SCRIPT', e); await L.chiudi(); process.exit(1); });
