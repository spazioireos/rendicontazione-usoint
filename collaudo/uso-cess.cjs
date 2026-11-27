// uso-cess — Vm* del 27/11/2026: in USOINT le celle di una persona (e di una voce dei beni) si bloccano dopo la data di
// cessazione? Solo verifica, nessuna modifica all'app. SOLO DATI INVENTATI.
//   NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-cess.cjs
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const path = require('path'), fs = require('fs');
const XLSX = require(path.join(__dirname, 'comune/.banco/lib/xlsx-0.18.5.js'));
const nY = 2, dieci = () => [Array(12).fill(10), Array(12).fill(10)];
const p = L.prog('pc', 'CESS PROVA', '2026-01-01', '2027-12-31', nY, {
  personnel: [L.pers(nY, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: [250, 250], cessato: '2026-03-15', md: dieci() }),
    L.pers(nY, { nome: 'BETA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: [250, 250], md: dieci() })],
  beni: [L.bene(nY, { voce: 'MATERIALE', forf: 5000, aImp: [2500, 2500], cessato: '2026-06-30', md: [Array(12).fill(100), Array(12).fill(100)] })] });
const KV = { 'usoint-idx': [{ id: 'pc', title: 'CESS PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: false }], 'usoint-p-pc': p };
const MES = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
// per ogni riga della vista MESI col nome dato: per mese 'in' (casella), 'X' (bloccata per cessazione), '·' (altro)
async function mesiRiga(T, nome) {
  return T.page.evaluate(nome => {
    const tr = [...document.querySelectorAll('tr')].find(r => r.cells.length > 12 && r.cells[0] && r.cells[0].innerText.indexOf(nome) >= 0);
    if (!tr) return null;
    const out = [];
    for (const td of tr.cells) {
      const t = td.getAttribute('title') || '';
      if (/cessat[oa] il/.test(t)) out.push('X');
      else if (td.querySelector('input[type="text"], input:not([type])')) out.push('in');
    }
    return { celle: out.slice(-12), titolo: (tr.querySelector('td[title*="cessat"]') || {}).title || '' };
  }, nome);
}
async function apriMesi(T, anno) { await T.page.locator(`button[title="Apri i mesi del ${anno}"]`).click(); await L.aspetta(T, 500); }
async function torna(T) { await T.page.click('button:has-text("Torna a budget")'); await L.aspetta(T, 400); }
(async () => {
  const { ctx } = await L.contesto({ kv: KV });
  const T = await L.pagina(ctx); await L.apriUso(T);
  await T.page.locator('div[style*="cursor: pointer"]', { hasText: 'CESS PROVA' }).last().click();
  await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO/.test(document.body.innerText), null, { timeout: 10000 }); await L.aspetta(T, 400);
  /* budget: la riga cessata si vede */
  let t = await L.testo(T);
  c('Z01', 'Budget: segno di cessazione sulla riga', 'pulsante «CESS.» col titolo «Cessato il 15/03/2026»', await T.page.locator('button[title^="Cessato il 15/03/2026"]').count(), await T.page.locator('button[title^="Cessato il 15/03/2026"]').count() === 1);
  /* MESI 2026 */
  await apriMesi(T, 2026);
  let a = await mesiRiga(T, 'ALFA'), b = await mesiRiga(T, 'BETA'), m = await mesiRiga(T, 'MATERIALE');
  c('Z02', '2026 · ALFA cessata il 15/03: gen-mar compilabili, apr-dic bloccati', 'in×3 + X×9', a && a.celle.join(' '), a && a.celle.join(' ') === 'in in in X X X X X X X X X');
  c('Z03', 'Il mese di cessazione (marzo) resta compilabile', 'MAR = in', a && a.celle[2], a && a.celle[2] === 'in');
  c('Z04', 'Suggerimento della cella bloccata', '«Operatore cessato il 15/03/2026»', a && a.titolo, a && a.titolo === 'Operatore cessato il 15/03/2026');
  c('Z05', '2026 · BETA non cessata: tutti i mesi compilabili', 'in×12', b && b.celle.join(' '), b && b.celle.filter(x => x === 'in').length === 12 && !b.celle.includes('X'));
  c('Z06', '2026 · beni MATERIALE cessata il 30/06: gen-giu compilabili, lug-dic bloccati', 'in×6 + X×6', m && m.celle.join(' '), m && m.celle.join(' ') === 'in in in in in in X X X X X X');
  // totale del mese di aprile: solo BETA (10), anche se ALFA ha 10 ore scritte in archivio
  const totApr = await T.page.evaluate(() => { const tr = [...document.querySelectorAll('tr')].find(r => /^\s*TOT/.test((r.cells[0] || {}).innerText || '') && r.cells.length > 12); return tr ? [...tr.cells].map(x => x.innerText.replace(/\s+/g, ' ').trim()) : null; });
  c('Z07', 'Le ore già scritte dopo la cessazione non contano nel totale del mese', 'APR = 10 (solo BETA), GEN = 20', JSON.stringify(totApr && totApr.slice(0, 8)), !!totApr && totApr.some(x => /^10(,00)?\b/.test(x)) && totApr.some(x => /^20(,00)?\b/.test(x)));
  await torna(T);
  /* MESI 2027 */
  await apriMesi(T, 2027);
  a = await mesiRiga(T, 'ALFA'); m = await mesiRiga(T, 'MATERIALE');
  c('Z08', '2027 · ALFA: tutto l\'anno dopo la cessazione è bloccato', 'X×12', a && a.celle.join(' '), a && a.celle.filter(x => x === 'X').length === 12);
  c('Z09', '2027 · MATERIALE: tutto bloccato', 'X×12', m && m.celle.join(' '), m && m.celle.filter(x => x === 'X').length === 12);
  await torna(T);
  /* Excel dell'anno: «—» nei mesi dopo la cessazione */
  let xl = null;
  try {
    const [dl] = await Promise.all([T.page.waitForEvent('download', { timeout: 8000 }), T.page.click('button:has-text("📊 Excel")')]);
    const pth = path.join(require('os').tmpdir(), 'uso-cess.xlsx'); await dl.saveAs(pth);
    const wb = XLSX.read(fs.readFileSync(pth)); const ws = wb.Sheets[wb.SheetNames.find(n => /2026/.test(n)) || wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }); xl = rows.find(r => r && r[0] === 'ALFA PROVA');
  } catch (e) { xl = null; }
  c('Z10', 'Excel dell\'anno 2026: ALFA con «—» da aprile', 'GEN 10 … APR «—»', xl ? JSON.stringify(xl.slice(4, 12)) : 'Excel non letto', xl ? xl.slice(4, 12).filter(v => v === '—').length >= 2 && xl[4] === 10 : 'NON VERIFICATO', xl ? undefined : 'NON VERIFICATO');
  /* riattivare e ricessare con il pulsante */
  // dalla ver149 «CESS.» su chi è già cessato chiede: OK, casella vuota, conferma = cessazione tolta
  T.risposte.push({ re: /già cessata/ }, { re: /Nuova data/, text: '' }, { re: /Togliere la cessazione/ }, { re: /Data cessazione/, text: '31/02/2026' });
  await T.page.locator('button[title^="Cessato il 15/03/2026"]').click(); await L.aspetta(T, 200);   // riattiva
  await apriMesi(T, 2026); a = await mesiRiga(T, 'ALFA');
  c('Z11', 'Togliendo la cessazione la riga torna compilabile (ore di prima ancora lì)', 'in×12', a && a.celle.join(' '), a && a.celle.filter(x => x === 'in').length === 12);
  await torna(T);
  await T.page.locator('button[title="Segna come cessato"]').first().click(); await L.aspetta(T, 300);
  const al = T.dialoghi.filter(d => /Data non valida/.test(d.msg)).length;
  c('Z12', 'Data impossibile (31/02/2026) rifiutata', 'avviso «Data non valida», nessuna cessazione', al + ' avviso · ' + await T.page.locator('button[title^="Cessato il"]').count(), al === 1 && await T.page.locator('button[title^="Cessato il"]').count() === 1);
  T.risposte.push({ re: /Data cessazione/, text: '31/08/2026' });
  await T.page.locator('button[title="Segna come cessato"]').first().click(); await L.aspetta(T, 300);
  await apriMesi(T, 2026); a = await mesiRiga(T, 'ALFA');
  c('Z13', 'Cessazione 31/08/2026: bloccati da settembre', 'in×8 + X×4', a && a.celle.join(' '), a && a.celle.join(' ') === 'in in in in in in in in X X X X');
  await torna(T);
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 400);
  const sal = JSON.parse(await L.ls(T, 'usoint-p-pc'));
  c('Z14', 'Col 💾 la data di cessazione è salvata', 'cessato 2026-08-31', sal.personnel[0].cessato, sal.personnel[0].cessato === '2026-08-31');
  /* Riepilogo operatori: le ore dopo la cessazione non sono rendicontate */
  await T.page.click('button:has-text("←")').catch(() => {}); await L.aspetta(T, 400);
  await T.page.click('button:has-text("👥 Riepilogo operatori")').catch(() => {}); await L.aspetta(T, 900);
  const s = T.page.locator('select').first();
  const v = await s.evaluate(s => { const o = [...s.options].find(o => /ALFA PROVA/.test(o.text)); return o ? o.value : null; }).catch(() => null);
  if (v) { await s.selectOption(v); await L.aspetta(T, 400); }
  const cel = await T.page.locator('td[title="Clic: da quali progetti vengono queste ore"]').allInnerTexts().catch(() => []);
  t = await L.testo(T);
  const dopo = (t.match(/2026[\s\S]{0,2000}/) || [''])[0];
  c('Z15', 'Riepilogo operatori: ALFA rendicontate 2026 solo gen-ago (8 mesi × 10)', 'celle con ore = 8, nessuna da settembre', cel.join(' '), cel.filter(x => /^10,00$/.test(x)).length === 8, cel.length ? undefined : 'NON VERIFICATO');
  c('Z16', 'Errori di pagina', '0', T.errori.length + ' ' + T.errori.join(' | ').slice(0, 200), T.errori.length === 0);
  await ctx.close(); await L.chiudi(); L.fine('uso-cess');
})();
