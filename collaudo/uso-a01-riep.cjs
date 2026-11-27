// Collaudo A01 USOINT ver138 — Riepilogo operatori (filtro, dettaglio, legenda, ore lavorate a mano, 💾,
// uscita) e IMPORT delle ore lavorate dai Dipendenti (seconda app «dip»). SOLO DATI INVENTATI.
// NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-a01-riep.cjs
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const MES = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
function md(o) { const a = [Array(12).fill(0)]; Object.keys(o).forEach(m => { a[0][MES.indexOf(m)] = o[m]; }); return a; }
const P = (nome, ore) => L.pers(1, { nome, voce: 'EDUCATORE', oreT: 500, eur: 20, aOre: [500], md: md(ore) });
const pA = L.prog('pa', 'PRJ A', '2026-01-01', '2026-12-31', 1, { personnel: [P('ALFA PROVA', { GEN: 10, GIU: 42 }), P('BETA PROVA', { GEN: 8 }), P('GAMMA PROVA', { GEN: 3 }), P('OMONIMO PROVA', { GEN: 1 })] });
const pB = L.prog('pb', 'PRJ B', '2026-01-01', '2026-12-31', 1, { personnel: [P('ALFA PROVA', { GEN: 5, GIU: 90 })] });
const KV = { 'usoint-idx': [{ id: 'pa', title: 'PRJ A', start: '2026-01-01', end: '2026-12-31', vincolo: false }, { id: 'pb', title: 'PRJ B', start: '2026-01-01', end: '2026-12-31', vincolo: false }], 'usoint-p-pa': pA, 'usoint-p-pb': pB };
const DIP = {
  dipendenti: [{ id: 'd1', nome: 'ALFA PROVA', sigla: 'ALF1' }, { id: 'd2', nome: 'BÈTA PROVA' }, { id: 'd3', nome: 'OMONIMO PROVA' }, { id: 'd4', nome: 'OMONIMO PROVA' }, { id: 'd5', nome: 'ESTRANEO PROVA' }, { id: 'd6', nome: 'GAMMA PROVA' }],
  dati: {
    '2026-01': { d1: { giorni: { 1: 4, 2: '4,5', 3: 'FERIE', 4: ' 4', 5: '.5', 6: ',5', 7: '-3', 8: 'MAL', 9: 'AN', 10: '--', 11: 'ASP 0h' } }, d2: { giorni: { 1: 6 } }, d3: { giorni: { 1: 70 } }, d4: { giorni: { 1: 77 } }, d5: { giorni: { 1: 3 } }, d6: { giorni: { 1: 2 } } },
    '2026-10': { d1: { giorni: { 1: 82.5 } } }
  },
  cedOre: { '2026-10': { d1: 79.33 } }
};
async function sel(T, label) { const s = T.page.locator('select').first(); const v = await s.evaluate((s, l) => { const o = Array.from(s.options).find(o => o.text === l); return o ? o.value : null; }, label); if (v) { await s.selectOption(v); await L.aspetta(T, 400); } return v; }
/* dalla ver155 le ore arrivate da Dipendenti sono grigie (span) e si correggono col doppio clic; le altre restano caselle */
const lavTd = (T, mi) => T.page.locator('table:has(th:has-text("rendicontate")) tbody tr').nth(mi).locator('td').nth(1);
async function lavVal(T, mi) { const td = lavTd(T, mi); if (await td.locator('input').count()) return td.locator('input').inputValue(); const t = (await td.innerText()).trim(); return t === '—' ? '' : t; }
async function lavSet(T, mi, txt) { T.risposte.push({ re: /Ore lavorate di/, text: txt }); await lavTd(T, mi).locator('span').dblclick(); await L.aspetta(T, 200); }
async function orelav(T) { return JSON.parse(await L.ls(T, 'usoint-orelav') || 'null'); }
async function rileggi(T) { await T.page.click('button:has-text("↻ Rileggi le ore dai Dipendenti")'); await L.aspetta(T, 900); }
async function riep(T) { await T.page.click('button:has-text("👥 Riepilogo operatori")'); await T.page.waitForFunction(() => /importate|Nessun dato|non contiene|Collega il gestionale|non riuscito/.test(document.body.innerText), null, { timeout: 10000 }).catch(() => {}); await L.aspetta(T, 400); }
(async () => {
  /* ===================== R: Riepilogo, filtro, dettaglio, legenda ===================== */
  {
    const { ctx } = await L.contesto({ kv: KV, dip: DIP });
    const T = await L.pagina(ctx); await L.apriUso(T); await riep(T);
    let t = await L.testo(T);
    c('I01', 'import automatico all\'apertura del Riepilogo', '«importate ✓ (… operatori aggiornati)»', (t.match(/Ore lavorate importate[^\n]*/) || ['—'])[0], /Ore lavorate importate dai Dipendenti ✓/.test(t));
    c('I02', 'cedOre dei mensilizzati (ver138)', '«ore pagate a cedolino (1 mese)»', /pagate a cedolino \(1 mese\)/.test(t), /pagate a cedolino \(1 mese\)/.test(t));
    c('I03', 'omonimi bloccati', 'riquadro rosso «OMONIMO PROVA (2 schede)»', /OMONIMO PROVA \(2 schede\)/.test(t), /STESSO nome in Dipendenti: OMONIMO PROVA \(2 schede\)/.test(t));
    c('I04', 'non abbinati', '«Non abbinati: ESTRANEO PROVA»', (t.match(/Non abbinati:[^\n]*/) || ['—'])[0], /Non abbinati: ESTRANEO PROVA/.test(t) && !/Non abbinati:[^\n]*BÈTA/.test(t));
    c('I05', 'codice operatore agganciato (ver136)', '«🔗 Codici agganciati: ALF1 → ALFA PROVA»', (t.match(/Codici agganciati:[^\n]*/) || ['—'])[0].slice(0, 80), /ALF1 → ALFA PROVA/.test(t));
    c('I06', 'import legato al 💾 (ver132)', 'riquadro «non sono ancora salvate»; usoint-orelav NON in archivio', /non sono ancora salvate/.test(t) + ' / ' + (await L.ls(T, 'usoint-orelav')), /non sono ancora salvate/.test(t) && (await L.ls(T, 'usoint-orelav')) === null);
    await sel(T, 'ALFA PROVA');
    c('I07', '_dipNum: 4 + «4,5» + « 4» + «.5» + «,5»; FERIE/MAL/AN/--/ASP 0h/«-3» = 0', 'GEN lavorate 13,50', await lavVal(T, 0), /^13,50?$/.test(await lavVal(T, 0)));
    c('I08', 'ottobre mensilizzato da cedOre', 'OTT 79,33 (non 82,50)', await lavVal(T, 9), /^79,33$/.test(await lavVal(T, 9)));
    /* uscita senza salvare */
    T.risposte.push({ re: /non sono salvate/, dismiss: true });
    await T.page.click('button:has-text("← Indietro")'); await L.aspetta(T, 300);
    c('I09', '← Indietro con ore non salvate', 'chiede; annulla = resta', T.dialoghi.filter(x => /non sono salvate/.test(x.msg)).length + ' / ' + /Riepilogo|Lavorate/.test(await L.testo(T)), T.dialoghi.filter(x => /non sono salvate/.test(x.msg)).length === 1 && /Lavorate/.test(await L.testo(T)));
    await T.page.click('button:has-text("💾 Salva ore lavorate")'); await L.aspetta(T, 300);
    let o = await orelav(T);
    c('I10', '💾 salva le ore importate', 'alfa prova 2026 GEN 13,5 OTT 79,33; bèta→beta prova 6; gamma 2', JSON.stringify([o && o['alfa prova'] && o['alfa prova']['2026'][0], o && o['alfa prova']['2026'][9], o && o['beta prova'] && o['beta prova']['2026'][0], o && o['gamma prova'] && o['gamma prova']['2026'][0]]), o && o['alfa prova']['2026'][0] === 13.5 && o['alfa prova']['2026'][9] === 79.33 && o['beta prova']['2026'][0] === 6 && o['gamma prova']['2026'][0] === 2 && !o['bèta prova']);
    c('I11', 'omonimo non importato, estraneo non creato', 'nessuna chiave omonimo/estraneo', Object.keys(o || {}).join(','), o && !o['omonimo prova'] && !o['estraneo prova']);
    const cod = JSON.parse(await L.ls(T, 'usoint-codici') || 'null');
    const orig = await L.ls(T, 'uso-import-orig');
    c('I12', 'col 💾: codici e provenienza', 'usoint-codici {ALF1: alfa prova}; uso-import-orig scritta', JSON.stringify(cod) + ' / orig ' + (orig ? 'sì' : 'no'), cod && cod.ALF1 === 'alfa prova' && !!orig);
    await L.aspetta(T, 1800);
    c('I13', 'cloud: orelav e codici sì, provenienza no', 'usoint-orelav, usoint-codici nel kv; uso-import-orig assente', !!(await L.cloud(T, 'usoint-orelav')) + ' ' + !!(await L.cloud(T, 'usoint-codici')) + ' ' + !!(await L.cloud(T, 'uso-import-orig')), !!(await L.cloud(T, 'usoint-orelav')) && !!(await L.cloud(T, 'usoint-codici')) && !(await L.cloud(T, 'uso-import-orig')));
    /* filtro e dettaglio */
    t = await L.testo(T);
    const cellG = () => T.page.locator('td[title="Clic: da quali progetti vengono queste ore"]');
    c('R01', 'tendina «Tutti i progetti» (ALFA in 2 progetti)', 'presente', await T.page.locator('select option', { hasText: 'Tutti i progetti' }).count(), await T.page.locator('select option', { hasText: 'Tutti i progetti' }).count() === 1);
    c('R02', 'legenda senza filtro', '«Avanzo = lavorate − totale rendicontate.»', /Avanzo = lavorate − totale rendicontate\./.test(t), /Avanzo = lavorate − totale rendicontate\./.test(t));
    const nCel = await cellG().count();
    const testiCel = await cellG().allInnerTexts();
    c('R03', 'rendicontate senza filtro', 'GEN 15,00 (10+5) e GIU 132,00 (42+90)', testiCel.join(' '), testiCel.includes('15,00') && testiCel.includes('132,00'));
    await cellG().filter({ hasText: '132,00' }).first().click(); await L.aspetta(T, 300);
    t = await L.testo(T);
    const pop1 = (t.match(/GIU 2026 — ALFA PROVA[\s\S]{0,120}/) || [''])[0].replace(/\n/g, ' ');
    c('R04', 'dettaglio GIU senza filtro', 'PRJ A 42 + PRJ B 90 = TOTALE 132', pop1, /PRJ A\s*42,00/.test(pop1) && /PRJ B\s*90,00/.test(pop1) && /TOTALE\s*132,00/.test(pop1));
    await T.page.mouse.click(3, 3); await L.aspetta(T, 200);
    await T.page.locator('select').nth(1).selectOption('PRJ B'); await L.aspetta(T, 400);
    t = await L.testo(T);
    c('R05', 'avviso del filtro', 'nomina rendicontate E Avanzo e «PRJ B»', /Filtro attivo: le colonne rendicontate e Avanzo mostrano SOLO il progetto «PRJ B»/.test(t), /Filtro attivo: le colonne rendicontate e Avanzo mostrano SOLO il progetto «PRJ B»/.test(t));
    c('R06', 'legenda col filtro', '«Avanzo = lavorate − ore di quel progetto»', /Avanzo = lavorate − ore di quel progetto/.test(t), /Avanzo = lavorate − ore di quel progetto/.test(t));
    const tc2 = await cellG().allInnerTexts();
    c('R07', 'rendicontate col filtro PRJ B', 'GEN 5,00 · GIU 90,00', tc2.join(' '), tc2.includes('5,00') && tc2.includes('90,00') && !tc2.includes('132,00'));
    await cellG().filter({ hasText: '90,00' }).first().click(); await L.aspetta(T, 300);
    t = await L.testo(T);
    const pop2 = (t.match(/GIU 2026 — ALFA PROVA[\s\S]{0,160}/) || [''])[0].replace(/\n/g, ' ');
    c('R08', 'dettaglio GIU col filtro (ver129)', 'solo PRJ B 90, TOTALE 90', pop2.slice(0, 140), /PRJ B\s*90,00/.test(pop2) && !/PRJ A/.test(pop2) && /TOTALE\s*90,00/.test(pop2));
    await T.page.mouse.click(3, 3); await L.aspetta(T, 200);
    await T.page.locator('select').nth(1).selectOption('*'); await L.aspetta(T, 300);
    c('R09', 'tolto il filtro', 'GIU torna 132,00, legenda originale', (await cellG().allInnerTexts()).includes('132,00') + ' ' + /Avanzo = lavorate − totale rendicontate\./.test(await L.testo(T)), (await cellG().allInnerTexts()).includes('132,00') && /Avanzo = lavorate − totale rendicontate\./.test(await L.testo(T)));
    /* ore lavorate a mano + negativi in LavIn */
    /* ver155: ore da Dipendenti grigie, doppio clic per correggerle (il meno si toglie) */
    const gr = await lavTd(T, 1).locator('span').count();
    await lavSet(T, 1, '-7');
    c('R10', 'Lavorate da Dipendenti grigie (ver155); doppio clic e «-7» (FEB)', 'grigia · 7 senza meno', (gr ? 'grigia' : 'casella') + ' · ' + await lavVal(T, 1), gr === 1 && /^7,00$/.test(await lavVal(T, 1)));
    await lavSet(T, 0, '99');
    t = await L.testo(T);
    c('R11', 'modifica a mano accende il 💾', 'pulsante «💾 Salva ore lavorate»', /💾 Salva ore lavorate/.test(t), /💾 Salva ore lavorate/.test(t));
    await T.page.locator('button', { hasText: '💾 Salva ore lavorate' }).last().click(); await L.aspetta(T, 300);
    o = await orelav(T);
    c('R12', 'ore a mano salvate', 'GEN 99, FEB 7', o['alfa prova']['2026'][0] + ' / ' + o['alfa prova']['2026'][1], o['alfa prova']['2026'][0] === 99 && o['alfa prova']['2026'][1] === 7);
    /* numeri scritti a mano: chiesti (ver132) */
    T.risposte.push({ re: /sembrano scritte a mano/, dismiss: true });
    await rileggi(T);
    let dm = T.dialoghi.filter(x => /sembrano scritte a mano/.test(x.msg));
    c('I14', 'numero scritto a mano chiesto prima di sostituirlo', '«ALFA PROVA · 2026 GEN: 99,00 → 13,50»', dm.length ? (dm[0].msg.match(/ALFA PROVA[^\n]*/) || [''])[0] : 'nessuna domanda', dm.length === 1 && /ALFA PROVA · 2026 GEN: 99,00 → 13,50/.test(dm[0].msg));
    t = await L.testo(T);
    c('I15', 'annulla: il numero resta e si dice', 'GEN 99 a video + «Ore scritte a mano lasciate come sono»', await lavVal(T, 0) + ' / ' + /lasciate come sono: ALFA PROVA · 2026 GEN/.test(t), /^99,00$/.test(await lavVal(T, 0)) && /lasciate come sono: ALFA PROVA · 2026 GEN/.test(t));
    c('I16', 'mese orfano (FEB scritto a mano, Dipendenti non lo conferma)', '«Ore che Dipendenti NON conferma … ALFA PROVA · 2026: FEB»', (t.match(/NON conferma[^\n]{0,120}/) || ['—'])[0].slice(0, 110), /ALFA PROVA · 2026: FEB/.test(t));
    T.risposte.push({ re: /sembrano scritte a mano/ });
    await rileggi(T);
    dm = T.dialoghi.filter(x => /sembrano scritte a mano/.test(x.msg));
    c('I17', 'la domanda torna al giro dopo; OK sostituisce', '2ª domanda, GEN 13,50', dm.length + ' / ' + await lavVal(T, 0), dm.length === 2 && /^13,50?$/.test(await lavVal(T, 0)));
    await T.page.locator('button', { hasText: '💾 Salva ore lavorate' }).last().click(); await L.aspetta(T, 300);
    const nd0 = T.dialoghi.length;
    await rileggi(T);
    c('I18', 'terzo giro senza cambi', 'nessuna domanda', T.dialoghi.length - nd0, T.dialoghi.length === nd0);
    /* azzeramento chiesto (ver135), riduzione libera, codice operatore (ver136) */
    await T.page.evaluate(([FO, D]) => { const d = JSON.parse(JSON.stringify(D)); d.dati['2026-01'].d6 = { giorni: {} }; d.dati['2026-01'].d2 = { giorni: { 1: 3 } }; d.dipendenti[0].nome = 'ALFA RINOMINATA'; d.dati['2026-01'].d1 = { giorni: { 1: 18 } }; window.__fakefb.seed(FO, { 'report-ore-mensile/ADMIN0001': d }); }, [L.FO, DIP]);
    T.risposte.push({ re: /AZZERARE/, dismiss: true });
    await rileggi(T);
    const dz = T.dialoghi.filter(x => /AZZERARE/.test(x.msg));
    c('I19', 'azzeramento di un mese chiesto', '«GAMMA PROVA · 2026 GEN: 2,00 → 0»', dz.length ? (dz[0].msg.match(/GAMMA PROVA[^\n]*/) || [''])[0] : 'nessuna domanda', dz.length === 1 && /GAMMA PROVA · 2026 GEN: 2,00 → 0/.test(dz[0].msg));
    t = await L.testo(T);
    c('I20', 'annulla: mese NON azzerato e detto', '«Mesi NON azzerati … GAMMA PROVA · 2026 GEN»', /Mesi NON azzerati, lasciati con le loro ore: GAMMA PROVA · 2026 GEN/.test(t), /Mesi NON azzerati, lasciati con le loro ore: GAMMA PROVA · 2026 GEN/.test(t));
    c('I21', 'riduzione 6 → 3 (BETA) senza domande', 'nessuna domanda «scritte a mano» per BETA', T.dialoghi.filter(x => /BETA|BÈTA/.test(x.msg)).length, T.dialoghi.filter(x => /BETA|BÈTA/.test(x.msg)).length === 0);
    await sel(T, 'ALFA PROVA');
    c('I22', 'codice: nome cambiato in Dipendenti (ALFA RINOMINATA, sigla ALF1)', 'ore sulla riga di sempre GEN 18; nessun «Non abbinati» per lui', await lavVal(T, 0) + ' / ' + /Non abbinati:[^\n]*RINOMINATA/.test(await L.testo(T)), /^18,00$/.test(await lavVal(T, 0)) && !/Non abbinati:[^\n]*RINOMINATA/.test(await L.testo(T)));
    T.risposte.push({ re: /AZZERARE/ });
    await rileggi(T);
    await T.page.locator('button', { hasText: '💾 Salva ore lavorate' }).last().click(); await L.aspetta(T, 300);
    o = await orelav(T);
    c('I23', 'OK all\'azzeramento + 💾', 'gamma GEN 0, beta GEN 3, alfa GEN 18, nessuna riga nuova', JSON.stringify([o['gamma prova']['2026'][0], o['beta prova']['2026'][0], o['alfa prova']['2026'][0], Object.keys(o).length]), o['gamma prova']['2026'][0] === 0 && o['beta prova']['2026'][0] === 3 && o['alfa prova']['2026'][0] === 18 && !o['alfa rinominata']);
    const sim = T.page.locator('input[style*="width: 38px"]');
    const nSim = await sim.count();
    if (nSim) { await sim.nth(0).click(); await sim.nth(0).pressSequentially('-5', { delay: 15 }); await sim.nth(0).press('Tab'); await L.aspetta(T, 150); }
    c('R13', 'SimIn (simulatore di spalmatura): «-5» battuto', '5 senza meno', nSim ? await sim.nth(0).inputValue() : 'nessuna casella', nSim && /^5,00$/.test(await sim.nth(0).inputValue()));
    await T.page.locator('select').first().selectOption('*'); await L.aspetta(T, 400);
    const tAll = await L.testo(T);
    c('R14', 'vista «TUTTE LE PERSONE»', 'tabella con ALFA/BETA/GAMMA, Tot. rendic. e Tot. lavorate', /Tutti gli operatori — ore per anno civile/.test(tAll) && /GAMMA PROVA/.test(tAll), /Tutti gli operatori — ore per anno civile/.test(tAll) && /Tot\. lavorate/.test(tAll));
    c('I24', 'errori di pagina', '0', T.errori.length + ' ' + T.errori.slice(0, 2).join('|'), T.errori.length === 0);
    await ctx.close();
  }
  /* ===================== errori del collegamento ===================== */
  {
    const lavPrima = { 'alfa prova': { 2026: [20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0] } };
    const kv = Object.assign({}, KV, { 'usoint-orelav': lavPrima });
    // documento assente
    let { ctx } = await L.contesto({ kv, dip: null });
    let T = await L.pagina(ctx); await L.apriUso(T); await riep(T);
    let t = await L.testo(T);
    c('I25', 'documento Dipendenti assente (ver128)', 'messaggio rosso, nessuna spunta verde, ore intatte', (t.match(/Nessun dato trovato[^\n]{0,40}/) || ['—'])[0] + ' / ' + /importate dai Dipendenti ✓/.test(t) + ' / ' + JSON.parse(await L.ls(T, 'usoint-orelav'))['alfa prova']['2026'][0], /Nessun dato trovato in Dipendenti/.test(t) && !/importate dai Dipendenti ✓/.test(t) && JSON.parse(await L.ls(T, 'usoint-orelav'))['alfa prova']['2026'][0] === 20);
    // documento senza dipendenti
    await T.page.evaluate(FO => window.__fakefb.seed(FO, { 'report-ore-mensile/ADMIN0001': { dati: {} } }), L.FO);
    await rileggi(T); t = await L.testo(T);
    c('I26', 'documento senza dipendenti', '«non contiene nessun dipendente»', /non contiene nessun dipendente/.test(t), /non contiene nessun dipendente/.test(t));
    // lettura negata
    await T.page.evaluate(FO => { window.__fakefb.seed(FO, { 'report-ore-mensile/ADMIN0001': { dipendenti: [{ id: 'd1', nome: 'ALFA PROVA' }], dati: { '2026-01': { d1: { giorni: { 1: 1 } } } } } }); window.__fakefb.deny = [{ project: FO, coll: 'report-ore-mensile', op: 'read' }]; }, L.FO);
    await rileggi(T); t = await L.testo(T);
    c('I27', 'lettura negata', '«Import non riuscito», ore intatte', (t.match(/Import non riuscito[^\n]{0,20}/) || ['—'])[0] + ' / ' + JSON.parse(await L.ls(T, 'usoint-orelav'))['alfa prova']['2026'][0], /Import non riuscito/.test(t) && JSON.parse(await L.ls(T, 'usoint-orelav'))['alfa prova']['2026'][0] === 20);
    // primo import con ore già presenti (provenienza assente): non chiede
    await T.page.evaluate(() => { window.__fakefb.deny = []; });
    const nd = T.dialoghi.length;
    await rileggi(T); t = await L.testo(T);
    c('I28', 'primo import (provenienza assente) con numero diverso in archivio', 'nessuna domanda (dichiarato), 20 → 1 a video', (T.dialoghi.length - nd) + ' domande / ' + /importate/.test(t), T.dialoghi.length === nd && /importate/.test(t));
    c('I29', 'non scrive MAI nel database di Dipendenti', '0 scritture su spazio-ireos-foglio-ore', await T.page.evaluate(FO => window.__fakefb.log.filter(o => o.project === FO && /set|update|delete|batch|add/.test(o.op)).length, L.FO), (await T.page.evaluate(FO => window.__fakefb.log.filter(o => o.project === FO && /set|update|delete|batch|add/.test(o.op)).length, L.FO)) === 0);
    await ctx.close();
    // login richiesto per la seconda app
    ({ ctx } = await L.contesto({ kv: KV, dip: DIP, dipSessione: false }));
    T = await L.pagina(ctx); await L.apriUso(T); await riep(T);
    c('I30', 'senza sessione «dip»', 'pulsante «Collega il gestionale Dipendenti»', await T.page.locator('button', { hasText: 'Collega il gestionale Dipendenti' }).count(), await T.page.locator('button', { hasText: 'Collega il gestionale Dipendenti' }).count() === 1);
    await T.page.fill('input[placeholder=email]', L.ADMIN); await T.page.fill('input[placeholder=password]', 'sbagliata');
    await T.page.click('button:has-text("Collega il gestionale Dipendenti")'); await L.aspetta(T, 500);
    c('I31', 'password sbagliata', '«Credenziali non valide o accesso negato»', /Credenziali non valide/.test(await L.testo(T)), /Credenziali non valide/.test(await L.testo(T)));
    await T.page.fill('input[placeholder=password]', L.PWD); await T.page.click('button:has-text("Collega il gestionale Dipendenti")'); await L.aspetta(T, 1200);
    c('I32', 'collegamento riuscito', 'import eseguito', /importate dai Dipendenti ✓/.test(await L.testo(T)), /importate dai Dipendenti ✓/.test(await L.testo(T)));
    const sess = await T.page.evaluate(() => Object.keys(localStorage).filter(k => /__fakefb_sess__/.test(k)));
    c('I33', 'sessioni separate', 'sessione «dip» sul progetto di Fogli ore, default su rendicontazione-usoint', sess.join(', '), sess.some(k => /spazio-ireos-foglio-ore__dip/.test(k)) && sess.some(k => /rendicontazione-usoint__\[DEFAULT\]/.test(k)));
    c('I34', 'errori di pagina', '0', T.errori.length + ' ' + T.errori.slice(0, 2).join('|'), T.errori.length === 0);
    await ctx.close();
  }
  L.fine('uso-a01-riep'); await L.chiudi();
})().catch(async e => { console.error('ERRORE SCRIPT', e); await L.chiudi(); process.exit(1); });
