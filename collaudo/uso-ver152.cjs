// uso-ver152 — budget, PERSONALE: per chi subentra (data di subentro o trasferimento ricevuto) «Ore tot.» ed «€ Finanz.» sono grigie e
// non si scrivono (le ore arrivano dal «Trasferisci»); «€/ora» resta giallina; con ore già scritte a mano resta scrivibile con un ⚠.
// Confronto con la ver151 in /uso151/. USO_APP=cartella (predefinita uso). USO_PNG=cartella salva l'anteprima. SOLO DATI INVENTATI.
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const APP = process.env.USO_APP || 'uso', PNG = process.env.USO_PNG || '';
const nY = 2, md = () => [[10, 10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0], Array(12).fill(0)];
const KV = () => ({ 'usoint-idx': [{ id: 'ps', title: 'SUB PROVA', start: '2026-01-01', end: '2027-12-31', vincolo: true }], 'usoint-p-ps': L.prog('ps', 'SUB PROVA', '2026-01-01', '2027-12-31', nY, { vincolo: true,
  personnel: [L.pers(nY, { nome: 'ALFA PROVA', voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: [250, 250], cessato: '2026-06-15', cessTipo: 'sub', md: md() }),
    L.pers(nY, { nome: 'BETA PROVA', voce: 'EDUCATORE', oreT: 0, eur: 20, aOre: [0, 0], subentro: '2026-06-16', subentroDi: 'ALFA PROVA' }),
    L.pers(nY, { nome: 'GAMMA PROVA', voce: 'EDUCATORE', oreT: 300, eur: 20, aOre: [150, 150] }),
    L.pers(nY, { nome: 'DELTA PROVA', voce: 'EDUCATORE', oreT: 50, eur: 20, aOre: [50, 0], subentro: '2026-09-01' })] }) });
async function apri(app) {
  const { ctx } = await L.contesto({ kv: KV(), dsf: PNG ? 2 : 1 }); const T = await L.pagina(ctx);
  await T.page.goto(L.BASE + app + '/index.html'); await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 30000 });
  await L.apriProgetto(T, 'SUB PROVA'); await L.aspetta(T, 400); return { ctx, T };
}
// riga i del blocco ore/€ del budget: [Ore tot., €/ora, € Finanz.] = 'in:valore' | testo della cella grigia
const riga = (T, i) => T.page.evaluate(i => { const hc = [...document.querySelectorAll('div')].find(d => d.children.length > 3 && /^Ore tot\./.test((d.innerText || '').trim()) && /Finanz/.test(d.innerText) && d.innerText.length < 120); if (!hc) return null; const rows = [...hc.parentElement.children].filter(x => x !== hc && x.children.length >= 6); const r = rows[i]; if (!r) return null; const sp = [...r.children]; const v = el => { const inp = el.querySelector('input'); return inp ? 'in:' + inp.value : el.innerText.replace(/\s+/g, ' ').trim(); }; return [v(sp[0]), v(sp[1]), v(sp[3])]; }, i);
(async () => {
  { const { ctx, T } = await apri('uso151');
    const b = await riga(T, 1);
    c('S00', 'ver151 (confronto): BETA subentrante senza trasferimento ha «Ore tot.» ed «€ Finanz.» gialline e scrivibili', 'in · in · in', JSON.stringify(b), b && /^in:/.test(b[0]) && /^in:/.test(b[2]));
    await ctx.close(); }
  const { ctx, T } = await apri(APP);
  let b = await riga(T, 1), g = await riga(T, 2), d = await riga(T, 3), a = await riga(T, 0);
  c('S01', 'BETA (subentrante, prima del trasferimento): Ore tot. grigia «da trasf.», € Finanz. grigia «—», €/ora giallina', 'da trasf. · in:20 · —', JSON.stringify(b), b && b[0] === 'da trasf.' && /^in:20/.test(b[1]) && b[2] === '—');
  c('S02', 'GAMMA (titolare): tutto come prima', 'in · in · in', JSON.stringify(g), g && /^in:300/.test(g[0]) && /^in:/.test(g[1]) && /^in:/.test(g[2]));
  c('S03', 'ALFA (cessata, titolare): tutto come prima', 'in · in · in', JSON.stringify(a), a && /^in:500/.test(a[0]) && /^in:/.test(a[2]));
  const warn = await T.page.locator('span[title^="Attenzione: questo subentrante ha ore scritte qui a mano"]').count();
  c('S04', 'DELTA (subentrante con 50 ore già scritte a mano): resta scrivibile, con ⚠', 'in:50 · 1 ⚠', JSON.stringify(d) + ' · ' + warn, d && /^in:50/.test(d[0]) && warn === 1);
  const tit = await T.page.locator('span[title^="Subentrante: le sue ore arrivano dal «Trasferisci»"]').count();
  c('S05', 'Le celle grigie spiegano perché', '2 suggerimenti (Ore tot. e Finanz. di BETA)', tit, tit === 2);
  if (PNG) { await T.page.evaluate(() => { const d = [...document.querySelectorAll('div')].find(x => x.innerText === 'PERSONALE — Budget'); d.scrollIntoView(); }); await L.aspetta(T, 200);
    const bb = await T.page.evaluate(() => { const r = [...document.querySelectorAll('div')].find(x => x.innerText === 'PERSONALE — Budget').getBoundingClientRect(); return { x: r.x, y: r.y }; });
    await T.page.screenshot({ path: PNG + '/Anteprima subentranti celle grigie - 27nov26 - ver152.png', clip: { x: bb.x, y: bb.y, width: 1000, height: 280 } }); }
  T.risposte.push({ re: /Trasferire/ }, { re: /subentra/ });
  await T.page.locator('button', { hasText: 'Trasferisci 2026' }).click(); await L.aspetta(T, 500);
  b = await riga(T, 1);
  c('S06', 'Dopo «Trasferisci 2026»: BETA mostra gli euro ricevuti (ver156: «€ 3.800,00 ric.») e resta grigia', '€ 3.800,00 ric. · … · —', JSON.stringify(b), b && /^€ 3\.800,00 ric\./.test(b[0]) && b[2] === '—');
  const tot = await T.page.evaluate(() => { const r = [...document.querySelectorAll('div')].filter(d => /^TOTALI PERSONALE/.test((d.innerText || '').trim()) && d.innerText.length < 400).pop(); const blk = r ? r.parentElement.parentElement.innerText : document.body.innerText; return (blk.match(/€\s?[\d.]+,\d\d/g) || []).join(' '); });
  c('S07', 'Il totale del budget del personale non cambia col trasferimento', 'compare € 17.000,00 (500+300+50 ore × 20)', tot.slice(0, 120), /17\.000,00/.test(tot));
  await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
  const P = JSON.parse(await L.ls(T, 'usoint-p-ps')).personnel;
  c('S08', 'Dati: BETA oreT 0, ricevuti 3.800 € (ver156: euro, non ore)', 'oreT 0 · ricevute 0 · ricEur 3800', P[1].oreT + ' · ' + P[1].ricevute + ' · ' + JSON.stringify(P[1].ricEur), P[1].oreT === 0 && P[1].ricevute === 0 && P[1].ricEur[0] === 3800);
  c('S09', 'Errori di pagina', '0', T.errori.length, T.errori.length === 0);
  await ctx.close(); await L.chiudi(); L.fine('uso-ver152');
})();
