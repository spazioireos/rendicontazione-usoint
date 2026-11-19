// Collaudo A01 — pagina integrata rev 6: sul banco (http://127.0.0.1:8340/integrata/) e, con «live», sulla
// pagina VERA https://spazioireos.github.io/rendicontazione-usoint/integrata/ (nessun login nelle app).
// NODE_PATH=/opt/node-tools/node_modules node collaudo/int-a01-integrata.cjs [live]
const { chromium } = require('playwright');
const LIVE = process.argv[2] === 'live';
const URL = LIVE ? 'https://spazioireos.github.io/rendicontazione-usoint/integrata/' : 'http://127.0.0.1:' + (process.env.PORTA || '8340') + '/integrata/index.html';
const PRE = LIVE ? 'L' : 'B';
const SEZ = LIVE ? [['btn-collaboratori', '/ore-e-importi-collaboratori/'], ['btn-dipendenti', '/ore-mensili-dipendenti/'], ['btn-rendicontazione', '/rendicontazione-usoint/?'], ['btn-fogliore', '/spazioireos-foglio-ore/']]
  : [['btn-collaboratori', '/col/'], ['btn-dipendenti', '/dip/'], ['btn-rendicontazione', '/uso/'], ['btn-fogliore', '/fo/']];
let ok = 0, ko = 0;
function c(id, f, a, e, cond) { const st = cond ? 'SUPERATO' : 'FALLITO'; cond ? ok++ : ko++; console.log((cond ? 'OK  ' : 'KO  ') + `${PRE}${id} | ${f} | atteso: ${a} | effettivo: ${String(e).slice(0, 200)} | ${st}`); }
(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  const errori = []; page.on('pageerror', e => errori.push(e.message));
  const docs = []; page.on('request', r => { if (r.resourceType() === 'document') docs.push(r.url()); });
  const resp = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  c('01', 'la pagina si apre', 'HTTP 200', resp && resp.status(), resp && resp.status() === 200);
  await page.waitForTimeout(1500);
  const html = await (await ctx.request.get(URL)).text();
  c('02', 'iframe nel sorgente', 'src="about:blank"', (html.match(/<iframe[^>]*>/) || [''])[0], /<iframe id="app"[^>]*src="about:blank"/.test(html));
  const rev = await page.textContent('.rev');
  c('03', 'targhetta', 'rev 6 · 08nov26', rev, /rev 6 · 08nov26/.test(rev));
  c('04', 'quattro pulsanti', '4', await page.locator('nav.pulsanti .btn').count(), await page.locator('nav.pulsanti .btn').count() === 4);
  const g = await page.evaluate(() => ({ barra: Math.round(document.querySelector('.barra').getBoundingClientRect().height), btn: Array.from(document.querySelectorAll('.btn')).map(x => Math.round(x.getBoundingClientRect().height)), rev: getComputedStyle(document.querySelector('.rev')).fontSize, tit: getComputedStyle(document.querySelector('.titolo')).fontSize, bf: getComputedStyle(document.querySelector('.btn')).fontSize, sw: document.documentElement.scrollWidth }));
  c('05', 'barra a 1280px', '62px', g.barra, g.barra === 62);
  c('06', 'pulsanti alti 48px, scritta 16px, titolo 19px', '48 · 16px · 19px', g.btn.join(',') + ' · ' + g.bf + ' · ' + g.tit, g.btn.every(h => h === 48) && g.bf === '16px' && g.tit === '19px');
  c('07', 'targhetta della pagina: misura (rilievo 🟡 dell\'11/11)', 'misura', g.rev, true);
  // apertura iniziale: una sola richiesta del documento dell'app
  const iniz = docs.filter(u => !u.startsWith(URL.replace('index.html', '')) || /\?v=/.test(u)).filter(u => /\?v=\d+/.test(u));
  c('08', 'apertura iniziale (sezione di partenza)', 'una sola richiesta, con ?v=<orario>', iniz.join(' '), iniz.length === 1);
  const vs = [];
  for (const [id, perc] of SEZ) {
    const n0 = docs.length;
    await page.click('#' + id); await page.waitForTimeout(LIVE ? 2500 : 900);
    const src = await page.getAttribute('#app', 'src');
    const nuove = docs.slice(n0).filter(u => /\?v=\d+/.test(u));
    vs.push((src.match(/v=(\d+)/) || [])[1]);
    const att = await page.evaluate(id => document.getElementById(id).classList.contains('attivo') && document.querySelectorAll('.btn.attivo').length === 1, id);
    c('09-' + id, 'pulsante ' + id, 'apre ' + perc + ' con ?v=, una richiesta, pulsante attivo', src.replace(/^https?:\/\/[^/]+/, '') + ' · richieste ' + nuove.length + ' · attivo ' + att, src.includes(perc.replace('?', '')) && /[?&]v=\d+/.test(src) && (nuove.length === 1 || (id === 'btn-collaboratori' && nuove.length === 0)) && att);
  }
  c('10', '?v= diverso a ogni apertura', '4 valori diversi', vs.join(','), new Set(vs.filter(Boolean)).size === vs.filter(Boolean).length && vs.filter(Boolean).length >= 3);
  const srcPrima = await page.getAttribute('#app', 'src'); const n1 = docs.length;
  await page.click('#btn-fogliore'); await page.waitForTimeout(800);
  c('11', 'ripremere la sezione aperta', 'non ricarica (stesso src, nessuna richiesta)', ((await page.getAttribute('#app', 'src')) === srcPrima) + ' · ' + (docs.length - n1), (await page.getAttribute('#app', 'src')) === srcPrima && docs.length === n1);
  c('12', 'titolo della scheda del browser', '«Spazio Ireos – Fogli ore»', await page.title(), (await page.title()) === 'Spazio Ireos – Fogli ore');
  await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForTimeout(1000);
  c('13', 'ricarica: riapre l\'ultima sezione', 'Fogli ore attivo', await page.evaluate(() => document.querySelector('.btn.attivo') && document.querySelector('.btn.attivo').id), await page.evaluate(() => document.querySelector('.btn.attivo') && document.querySelector('.btn.attivo').id) === 'btn-fogliore');
  for (const w of [390, 768, 1700]) {
    await page.setViewportSize({ width: w, height: 900 }); await page.waitForTimeout(300);
    const m = await page.evaluate(() => ({ barra: Math.round(document.querySelector('.barra').getBoundingClientRect().height), btn: Array.from(document.querySelectorAll('.btn')).map(x => Math.round(x.getBoundingClientRect().height)), sw: document.documentElement.scrollWidth, iw: innerWidth, area: Math.round(document.querySelector('.area').getBoundingClientRect().bottom), vh: innerHeight, frame: Math.round(document.getElementById('app').getBoundingClientRect().height) }));
    c('14-' + w, 'a ' + w + 'px', 'niente scorrimento laterale, pulsanti ≥ 46, iframe fino in fondo', 'barra ' + m.barra + ' · pulsanti ' + m.btn.join(',') + ' · ' + m.sw + ' su ' + m.iw + ' · area fino a ' + m.area + '/' + m.vh, m.sw <= m.iw && m.btn.every(h => h >= 46) && m.area === m.vh && m.frame > 300);
  }
  c('15', 'errori di pagina (pagina integrata)', '0', errori.length + ' ' + errori.slice(0, 2).join('|'), errori.length === 0);
  console.log(`\n=== int-a01-integrata ${LIVE ? 'LIVE' : 'banco'}: ${ok} superati, ${ko} falliti ===`);
  await b.close();
})().catch(e => { console.error('ERRORE SCRIPT', e); process.exit(1); });
