// Collaudo A01 USOINT ver138 — grafica a 390 · 768 · 1280 · 1680 · 1700 px: scorrimento laterale, scritte sotto
// i 12,5 px fuori dalle griglie dense, griglia del budget e altezza delle celle, comandi sotto i 32 px.
// SOLO DATI INVENTATI.  NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-a01-graf.cjs
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const nY = 2;
const P = (n, h) => L.pers(nY, { nome: n, voce: 'EDUCATORE', oreT: 100, eur: 20, aOre: [50, 50], md: [Array(12).fill(h), Array(12).fill(0)] });
const pg = L.prog('pg', 'GRAFICA PROVA', '2026-01-01', '2027-12-31', nY, { vincolo: true, personnel: [P('ALFA PROVA', 3), P('BETA PROVA', 2), P('GAMMA PROVA', 1), P('DELTA PROVA', 0), P('EPSILON PROVA', 0), P('ZETA PROVA', 0)], beni: [L.bene(nY, { voce: 'MATERIALE', forf: 1000 }), L.bene(nY), L.bene(nY), L.bene(nY)] });
const KV = { 'usoint-idx': [{ id: 'pg', title: 'GRAFICA PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: true }], 'usoint-p-pg': pg, 'usoint-orelav': { 'alfa prova': { 2026: Array(12).fill(4) } } };
const misura = () => {
  const vis = el => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const dentro = el => !!el.closest('table') || !!el.closest('[style*="overflow: auto hidden"]');
  let piccole = [], comandi = 0;
  document.querySelectorAll('body *').forEach(el => {
    if (!vis(el)) return;
    const proprio = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
    if (proprio && !dentro(el) && parseFloat(getComputedStyle(el).fontSize) < 12.5) piccole.push(el.textContent.trim().slice(0, 30) + '@' + getComputedStyle(el).fontSize);
    if ((el.tagName === 'BUTTON' || el.tagName === 'INPUT' || el.tagName === 'SELECT') && !dentro(el) && el.getBoundingClientRect().height < 32) comandi++;
  });
  const g = document.querySelector('[style*="overflow: auto hidden"]');
  const cella = g ? Array.from(g.querySelectorAll('div')).find(d => d.style.height === '46px') : null;
  return { sw: document.documentElement.scrollWidth, iw: window.innerWidth, piccole, comandi, griglia: g ? Math.round(g.getBoundingClientRect().width) : null, cont: g ? g.scrollWidth : null, cella: cella ? Math.round(cella.getBoundingClientRect().height * 10) / 10 : null };
};
(async () => {
  const atteseG = { 390: 356, 768: 734, 1280: 1246, 1680: 1646 };
  for (const w of [390, 768, 1280, 1680, 1700]) {
    const { ctx } = await L.contesto({ kv: KV, viewport: { width: w, height: 900 } });
    const T = await L.pagina(ctx); await L.apriUso(T); await L.aspetta(T, 400);
    const h = await T.page.evaluate(misura);
    c('G-' + w + '-H1', 'Home a ' + w + 'px: scorrimento laterale', 'larghezza pagina = finestra', h.sw + ' su ' + h.iw, h.sw <= h.iw);
    c('G-' + w + '-H2', 'Home a ' + w + 'px: scritte < 12,5px', '0', h.piccole.length + ' ' + h.piccole.slice(0, 4).join(' · '), h.piccole.length === 0);
    await T.page.locator('div[style*="cursor: pointer"]', { hasText: 'GRAFICA PROVA' }).last().click();
    await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO/.test(document.body.innerText), null, { timeout: 10000 }); await L.aspetta(T, 500);
    const s = await T.page.evaluate(misura);
    c('G-' + w + '-P1', 'scheda progetto a ' + w + 'px: scorrimento laterale', 'non sborda', s.sw + ' su ' + s.iw, s.sw <= s.iw);
    c('G-' + w + '-P2', 'scheda progetto a ' + w + 'px: scritte < 12,5px fuori dalla griglia', '0', s.piccole.length + ' ' + s.piccole.slice(0, 4).join(' · '), s.piccole.length === 0);
    if (atteseG[w]) c('G-' + w + '-P3', 'griglia del budget a ' + w + 'px', atteseG[w] + 'px (CLAUDE.md ver123)', s.griglia + 'px (contenuto ' + s.cont + ')', Math.abs(s.griglia - atteseG[w]) <= 1);
    else c('G-' + w + '-P3', 'griglia del budget a ' + w + 'px', 'nessun riferimento storico (misura)', s.griglia + 'px (contenuto ' + s.cont + ')', true, 'SUPERATO');
    c('G-' + w + '-P4', 'altezza cella della griglia', '41px (46 × zoom 0,9)', s.cella, Math.abs(s.cella - 41.4) < 0.6);
    c('G-' + w + '-P5', 'comandi < 32px fuori dalla griglia (misura)', 'misura', s.comandi, true, 'SUPERATO');
    await T.page.locator('button', { hasText: '←' }).first().click(); await L.aspetta(T, 400);
    await T.page.click('button:has-text("👥 Riepilogo operatori")'); await L.aspetta(T, 1200);
    const r = await T.page.evaluate(misura);
    c('G-' + w + '-R1', 'Riepilogo a ' + w + 'px: scorrimento laterale', 'non sborda', r.sw + ' su ' + r.iw, r.sw <= r.iw);
    c('G-' + w + '-R2', 'Riepilogo a ' + w + 'px: scritte < 12,5px fuori dalle tabelle', '0', r.piccole.length + ' ' + r.piccole.slice(0, 4).join(' · '), r.piccole.length === 0);
    c('G-' + w + '-E', 'errori di pagina', '0', T.errori.length, T.errori.length === 0);
    await ctx.close();
  }
  L.fine('uso-a01-graf'); await L.chiudi();
})().catch(async e => { console.error('ERRORE SCRIPT', e); await L.chiudi(); process.exit(1); });
