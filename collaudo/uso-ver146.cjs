// uso-ver146 — P4: nel budget, mentre si scrive il nome di un operatore, compaiono i nomi di Dipendenti e Collaboratori
// (sola lettura, stesso browser) e, se il nome non corrisponde a nessuno, la casella tratteggiata arancio con «⚠» (titolo «Nome non trovato…»).
// Banco comune 8340 con finta Firebase (stessa origine: le app vedono lo stesso localStorage). SOLO DATI INVENTATI.
//   NODE_PATH=/opt/node-tools/node_modules USO_PNG=<cartella> node collaudo/uso-ver146.cjs
const K = require('./interconnessioni/ic-01-comune.cjs');
const { FO, USO, ADMIN, PWD, ADMIN_UID, chk } = K;
const PNG = process.env.USO_PNG || '';
const dipLS = { version: 4, anni: [2026], dati: {}, dipendenti: [K.dipendente('d1', 'ROSSI MARIO'), K.dipendente('d2', "FERRARE' LUCA")] };
const colLS = [{ name: 'VERDI GIULIA', years: {} }];
const prj = K.progettoUso('p1', 'PROGETTO PROVA', ['ROSSI MARIO', 'FERRARÈ LUCA', 'VERDI GIULIA', 'ROSI MARIO']);
const seedDip = { dipendenti: [K.dipendente('d1', 'ROSSI MARIO'), K.dipendente('d9', 'NERI ANNA')], dati: {}, anni: [2026], version: 4 };
const seed = { id: 'uso146',
  [FO]: { reset: true, users: [{ email: ADMIN, password: PWD, uid: ADMIN_UID }], docs: Object.assign({}, K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'), { ['report-ore-mensile/' + ADMIN_UID]: seedDip }) },
  [USO]: { reset: true, users: [{ email: 'uso@prova.it', password: PWD, uid: 'USO0001' }], docs: Object.assign({}, K.kvUso('USO0001', 'usoint-idx', [{ id: 'p1', title: 'PROGETTO PROVA', start: '2026-01', end: '2026-12' }]), K.kvUso('USO0001', 'usoint-p-p1', prj)) } };
const ls = { spazioireos_reportore_v1: JSON.stringify(dipLS), spazioireos_opoc: JSON.stringify(colLS) };

async function apriProgetto(p) { await p.locator('text=PROGETTO PROVA').first().click(); await K.aspettaTesto(p, /BUDGET|PREVENTIVO/, 20000); await K.attesa(800); }
const avvisi = (p) => p.evaluate(() => [...document.querySelectorAll('span')].filter(s => s.textContent === '⚠' && /^Nome non trovato/.test(s.title || '')).length);
const opzioni = (p) => p.evaluate(() => [...document.querySelectorAll('#uso-nomi-op option')].map(o => o.value));
const nomeInput = (p, i) => p.locator('input[list="uso-nomi-op"]').nth(i);
const rinfresca = (p) => p.evaluate(() => { window._NOMI_T = 0; });

(async () => {
  const browser = await K.chromium.launch();
  /* ---------- senza nessun nome nelle altre app: nessun avviso ---------- */
  {
    const ctx = await K.contesto(browser, { seed: Object.assign({}, seed, { id: 'uso146-vuoto' }) });
    const u = await K.pagina(ctx); await K.loginUso(u); await apriProgetto(u);
    chk('N00', 'USOINT', 'altre app mai aperte in questo browser', 'nessun avviso, elenco vuoto', '0 · 0', (await avvisi(u)) + ' · ' + (await opzioni(u)).length, (await avvisi(u)) === 0 && (await opzioni(u)).length === 0);
    await ctx.close();
  }
  const ctx = await K.contesto(browser, { seed, ls });
  const u = await K.pagina(ctx); await K.loginUso(u);
  const prima = await u.evaluate(() => [localStorage.getItem('spazioireos_reportore_v1'), localStorage.getItem('spazioireos_opoc')]);
  await apriProgetto(u);
  chk('N01', 'USOINT', 'targhetta', 'ver146', 'ver146', (await K.testo(u)).match(/ver\d+ · \d+[a-z]+\d+/)?.[0] || '', /ver146 · 23nov26/.test(await K.testo(u)));
  let o = await opzioni(u);
  chk('N02', 'Dipendenti + Collaboratori → USOINT', 'nomi suggeriti', 'i 3 nomi delle altre app, senza doppioni', "FERRARE' LUCA · ROSSI MARIO · VERDI GIULIA", o.join(' · '), o.length === 3 && o.includes('ROSSI MARIO') && o.includes('VERDI GIULIA') && o.includes("FERRARE' LUCA"));
  let a = await avvisi(u);
  const vicino = await u.evaluate(() => { const s = [...document.querySelectorAll('span')].find(x => x.textContent === '⚠' && /^Nome non trovato/.test(x.title || '')); const inp = s && s.parentElement && s.parentElement.querySelector('input'); return inp ? inp.value : ''; });
  chk('N03', 'USOINT', 'avviso', 'solo «ROSI MARIO» (FERRARÈ ≡ FERRARE\' per accenti e apostrofo)', '1 avviso, accanto a ROSI MARIO', a + ' · ' + vicino, a === 1 && vicino === 'ROSI MARIO');
  if (PNG) await u.screenshot({ path: PNG + '/uso146-avviso.png', clip: await u.locator('input[list="uso-nomi-op"]').nth(3).evaluate(e => { const r = e.closest('div').getBoundingClientRect(); return { x: 0, y: Math.max(0, r.top - 160), width: 900, height: 260 }; }) });
  /* 3 cicli: scrivere un nome sbagliato / giusto */
  const prove = [['BIANCHI PIA', 2], ['VERDI GIULIA', 1], ['ROSSI MARIO', 0]];
  for (let c = 0; c < 3; c++) {
    const inp = nomeInput(u, 3); await inp.click(); await inp.fill(prove[c][0]); await K.attesa(300);
    a = await avvisi(u);
    chk('N04.' + (c + 1), 'USOINT', 'scrivo «' + prove[c][0] + '» nella 4ª riga', 'avvisi aggiornati subito', String(prove[c][1] === 2 ? 1 : 0), String(a), a === (prove[c][1] === 2 ? 1 : 0));
  }
  /* un nome nuovo in Collaboratori (stesso browser) arriva entro 30 s, o subito ripulendo la memoria */
  await u.evaluate(() => { const c = JSON.parse(localStorage.getItem('spazioireos_opoc')); c.push({ name: 'BIANCHI PIA', years: {} }); localStorage.setItem('spazioireos_opoc', JSON.stringify(c)); });
  await rinfresca(u); const inp = nomeInput(u, 3); await inp.fill('BIANCHI PIA'); await K.attesa(300);
  chk('N05', 'Collaboratori → USOINT', 'nome aggiunto in Collaboratori', 'ora non c\'è più l\'avviso', '0', String(await avvisi(u)), (await avvisi(u)) === 0);
  await u.evaluate(() => { const c = JSON.parse(localStorage.getItem('spazioireos_opoc')); localStorage.setItem('spazioireos_opoc', JSON.stringify(c.slice(0, 1))); });
  /* l'import del Riepilogo operatori aggiunge i nomi del documento di Dipendenti (NERI ANNA) */
  const indietro = u.locator('button', { hasText: '←' }).first(); await indietro.click(); await K.attesa(800);
  await K.usoRiepilogo(u); await u.locator('button', { hasText: '←' }).first().click().catch(() => {}); await K.attesa(800);
  const nd = await u.evaluate(() => localStorage.getItem('uso-nomi-dip'));
  chk('N06', 'Dipendenti (cloud) → USOINT', 'dopo l\'import del Riepilogo', 'uso-nomi-dip con i nomi del documento', '["ROSSI MARIO","NERI ANNA"]', String(nd), nd === '["ROSSI MARIO","NERI ANNA"]');
  await K.attesa(500);
  if (!/BUDGET|PREVENTIVO/.test(await K.testo(u))) await apriProgetto(u);
  await rinfresca(u); await nomeInput(u, 3).fill('NERI ANNA'); await K.attesa(300);
  o = await opzioni(u);
  chk('N07', 'USOINT', 'nome solo nel documento di Dipendenti', 'suggerito e senza avviso', 'NERI ANNA in elenco · 0 avvisi', (o.includes('NERI ANNA') ? 'in elenco' : 'assente') + ' · ' + (await avvisi(u)), o.includes('NERI ANNA') && (await avvisi(u)) === 0);
  const dopo = await u.evaluate(() => [localStorage.getItem('spazioireos_reportore_v1'), localStorage.getItem('spazioireos_opoc')]);
  chk('N08', 'USOINT', 'dati di Dipendenti e Collaboratori', 'non toccati da USOINT', 'identici', dopo[0] === prima[0] && dopo[1] === prima[1] ? 'identici' : 'CAMBIATI', dopo[0] === prima[0] && dopo[1] === prima[1]);
  const cl = await K.dump(u, USO); const fuori = !Object.keys(cl).some(k => /uso-nomi-dip/.test(k));
  chk('N09', 'USOINT', 'cloud di USOINT', 'uso-nomi-dip NON nel cloud (resta fuori anche dal backup)', 'assente', fuori ? 'assente' : 'PRESENTE', fuori);
  const bk = await u.evaluate(() => Object.keys(localStorage).filter(k => /^usoint/.test(k)).some(k => k === 'uso-nomi-dip'));
  chk('N10', 'USOINT', 'errori di pagina', '0', '0', String(u.__errori.length) + ' ' + u.__errori.join(' | ').slice(0, 200), u.__errori.length === 0 && !bk);
  await browser.close();
  K.riepilogo('uso-ver146');
})();
