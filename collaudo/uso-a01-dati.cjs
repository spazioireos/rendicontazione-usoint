// Collaudo A01 USOINT ver138 — sicurezza dei dati: salvataggio sospeso (failWrites) e ripresa, timbro fra due
// schede, backup e ripristino (file malfatti, schema 99, senza schema, vero, cloud caduto), doppio clic, testo lungo.
// SOLO DATI INVENTATI.  NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-a01-dati.cjs
const L = require('./uso-a01-lib.cjs');
const { c } = L;
const fs = require('fs'), path = require('path');
const pX = L.prog('px', 'LAVORO X', '2026-01-01', '2026-12-31', 1, { personnel: [L.pers(1, { nome: 'ALFA PROVA', oreT: 10, eur: 20, aOre: [10] })] });
const pY = L.prog('py', 'LAVORO Y', '2026-01-01', '2026-12-31', 1);
const IDX = [{ id: 'px', title: 'LAVORO X', start: '2026-01-01', end: '2026-12-31', vincolo: false }, { id: 'py', title: 'LAVORO Y', start: '2026-01-01', end: '2026-12-31', vincolo: false }];
const KV = { 'usoint-idx': IDX, 'usoint-p-px': pX, 'usoint-p-py': pY };
async function apri(T, tit) { await T.page.locator('div[style*="cursor: pointer"]', { hasText: tit }).last().click(); await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO/.test(document.body.innerText), null, { timeout: 10000 }); await L.aspetta(T, 300); }
async function oreT(T, v) { const l = T.page.locator('input[style*="width: 53px"]').nth(0); await l.click(); await l.press('Control+a'); await l.fill(v); await l.press('Tab'); await L.aspetta(T, 120); }
async function dump(T) { return T.page.evaluate(p => JSON.stringify(window.__fakefb.dump(p)), L.USO); }
async function lsUso(T) { return T.page.evaluate(() => JSON.stringify(Object.keys(localStorage).filter(k => k.indexOf('usoint') === 0).sort().map(k => [k, localStorage.getItem(k)]))); }
async function ripristina(T, contenuto) {
  const [fc] = await Promise.all([T.page.waitForEvent('filechooser', { timeout: 5000 }), T.page.click('button:has-text("📂 Ripristina backup")')]);
  await fc.setFiles({ name: 'prova.json', mimeType: 'application/json', buffer: Buffer.from(contenuto) });
  await L.aspetta(T, 700);
}
(async () => {
  /* ===================== S: salvataggio sospeso ===================== */
  {
    const { ctx } = await L.contesto({ kv: KV });
    const T = await L.pagina(ctx); await L.apriUso(T); await apri(T, 'LAVORO X');
    await T.page.evaluate(() => { window.__fakefb.failWrites = true; });
    await oreT(T, '33'); await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 2200);
    const sosp = JSON.parse(await L.ls(T, 'uso-sospese-cloud') || '{}');
    const cl = JSON.parse(await L.cloud(T, 'usoint-p-px')).personnel[0].oreT;
    c('S01', 'cloud caduto al 💾', 'browser 33, cloud 10, chiave messa da parte in uso-sospese-cloud con uid', JSON.parse(await L.ls(T, 'usoint-p-px')).personnel[0].oreT + ' / ' + cl + ' / ' + Object.keys(sosp).join(','), JSON.parse(await L.ls(T, 'usoint-p-px')).personnel[0].oreT === 33 && cl === 10 && sosp['usoint-p-px'] && sosp.__uid === L.UID);
    const tt = await L.testo(T);
    c('S02', 'avviso a video del salvataggio non arrivato nel cloud', 'toast «⚠ Errore sincronizzazione cloud» (dopo 1,5 s)', (tt.match(/⚠ Errore sincronizzazione cloud/) || ['nessun avviso'])[0], /Errore sincronizzazione cloud/.test(tt));
    // ricarica con il cloud ancora giù
    await T.page.evaluate(() => window.__fakefb.setCfg({ failWrites: true }));
    await T.page.reload(); await L.aspetta(T, 1800);
    let t = await L.testo(T);
    const lsDopo = JSON.parse(await L.ls(T, 'usoint-p-px')).personnel[0].oreT;
    c('S03', 'rientro col cloud ancora giù', 'avviso arancione; valore tenuto da parte in uso-sospese-cloud', 'toast ' + (await T.page.locator('#uso-sosp-toast').isVisible().catch(() => false)) + ' / browser ' + lsDopo + ' / sospeso ' + JSON.parse(JSON.parse(await L.ls(T, 'uso-sospese-cloud') || '{}')['usoint-p-px'] || '{}').personnel?.[0]?.oreT, (await T.page.locator('#uso-sosp-toast').isVisible().catch(() => false)) && JSON.parse(JSON.parse(await L.ls(T, 'uso-sospese-cloud'))['usoint-p-px']).personnel[0].oreT === 33);
    c('S04', 'a schermo col cloud giù (fbSync non bloccato, dichiarato)', 'il browser torna al valore del cloud (10)', lsDopo, lsDopo === 10, lsDopo === 10 ? 'SUPERATO' : 'PARZIALE');
    // torna la linea
    await T.page.evaluate(() => window.__fakefb.clearCfg());
    await T.page.reload(); await L.aspetta(T, 1800);
    const cl2 = JSON.parse(await L.cloud(T, 'usoint-p-px')).personnel[0].oreT;
    c('S05', 'rientro con la linea tornata', 'riprova spinge 33 nel cloud prima di fbSync; browser 33; sospese vuote', cl2 + ' / ' + JSON.parse(await L.ls(T, 'usoint-p-px')).personnel[0].oreT + ' / ' + await L.ls(T, 'uso-sospese-cloud'), cl2 === 33 && JSON.parse(await L.ls(T, 'usoint-p-px')).personnel[0].oreT === 33 && (await L.ls(T, 'uso-sospese-cloud')) === null);
    // guardia sull'account
    await T.page.evaluate(() => { const v = JSON.parse(localStorage.getItem('usoint-p-px')); v.personnel[0].oreT = 77; localStorage.setItem('uso-sospese-cloud', JSON.stringify({ 'usoint-p-px': JSON.stringify(v), __uid: 'ALTROUTENTE' })); });
    await T.page.reload(); await L.aspetta(T, 1800);
    const cl3 = JSON.parse(await L.cloud(T, 'usoint-p-px')).personnel[0].oreT;
    c('S06', 'sospese di un altro account', 'non spinte nel cloud di questo (resta 33)', cl3 + ' / sospese ' + ((await L.ls(T, 'uso-sospese-cloud')) ? 'ancora lì' : 'tolte'), cl3 === 33);
    c('S07', 'errori di pagina', '0', T.errori.length + ' ' + T.errori.slice(0, 2).join('|'), T.errori.length === 0);
    await ctx.close();
  }
  /* ===================== TB: timbro fra due schede ===================== */
  {
    const { ctx } = await L.contesto({ kv: KV });
    const A = await L.pagina(ctx); await L.apriUso(A);
    const B = await L.pagina(ctx); await L.apriUso(B);
    await B.page.locator('button', { hasText: 'Duplica' }).first().click(); await L.aspetta(B, 400);
    const idxB = await L.ls(B, 'usoint-idx'); const tmB = await L.ls(B, 'uso-timbro');
    c('T01', 'scheda B duplica', 'nessuna domanda, timbro scritto', B.dialoghi.length + ' / ' + (tmB ? 'timbro' : '-'), B.dialoghi.length === 0 && !!tmB);
    A.risposte.push({ re: /Un'altra scheda ha salvato/, dismiss: true });
    await A.page.locator('button', { hasText: 'Duplica' }).first().click(); await L.aspetta(A, 400);
    const dA = A.dialoghi.filter(x => /Un'altra scheda ha salvato/.test(x.msg));
    c('T02', 'scheda A (vecchia) duplica', 'avviso «Un\'altra scheda ha salvato dopo di te (l\'elenco dei lavori)»', dA.length ? dA[0].msg.slice(0, 70).replace(/\n/g, ' ') : 'nessun avviso', dA.length === 1 && /l'elenco dei lavori/.test(dA[0].msg));
    c('T03', 'annulla: elenco e timbro dell\'altra intatti', 'idx uguale a quello di B, timbro uguale', ((await L.ls(A, 'usoint-idx')) === idxB) + ' / ' + ((await L.ls(A, 'uso-timbro')) === tmB), (await L.ls(A, 'usoint-idx')) === idxB && (await L.ls(A, 'uso-timbro')) === tmB);
    // salvataggio dentro un lavoro dalla scheda A
    await A.page.reload(); await L.aspetta(A, 1200);
    await B.page.locator('button', { hasText: '←' }).first().click(); await L.aspetta(B, 400);
    await apri(A, 'LAVORO Y'); await apri(B, 'LAVORO Y');
    await oreT(B, '5'); await B.page.click('button:has-text("💾 Salva")'); await L.aspetta(B, 300);
    A.risposte.push({ re: /Un'altra scheda ha salvato/ });
    await oreT(A, '6'); await A.page.click('button:has-text("💾 Salva")'); await L.aspetta(A, 300);
    const dA2 = A.dialoghi.filter(x => /questo lavoro/.test(x.msg));
    c('T04', 'stesso lavoro salvato in due schede', 'la seconda chiede («questo lavoro»), OK sovrascrive (6)', dA2.length + ' / ' + JSON.parse(await L.ls(A, 'usoint-p-py')).personnel[0].oreT, dA2.length === 1 && JSON.parse(await L.ls(A, 'usoint-p-py')).personnel[0].oreT === 6);
    const n0 = A.dialoghi.length;
    await oreT(A, '7'); await A.page.click('button:has-text("💾 Salva")'); await L.aspetta(A, 300);
    c('T05', 'salvataggio successivo nella stessa scheda', 'non richiede', A.dialoghi.length - n0, A.dialoghi.length === n0);
    // doppio clic
    await oreT(A, '8'); await A.page.locator('button:has-text("💾 Salva")').dblclick(); await L.aspetta(A, 400);
    c('T06', 'doppio clic sul 💾', 'nessuna domanda, nessun errore, dato 8', (A.dialoghi.length - n0) + ' / ' + JSON.parse(await L.ls(A, 'usoint-p-py')).personnel[0].oreT + ' / err ' + A.errori.length, A.dialoghi.length === n0 && JSON.parse(await L.ls(A, 'usoint-p-py')).personnel[0].oreT === 8 && A.errori.length === 0);
    // testo lunghissimo
    const lung = 'NOME'.repeat(80);
    const nm = A.page.locator('input[placeholder="Op.1"]'); await nm.fill(lung); await nm.press('Tab');
    await A.page.click('button:has-text("💾 Salva")'); await L.aspetta(A, 300);
    const sw = await A.page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
    c('T07', 'nominativo di 320 caratteri', 'salvato intero, la pagina non scorre di lato', JSON.parse(await L.ls(A, 'usoint-p-py')).personnel[0].nome.length + ' car. / ' + sw.join(' su '), JSON.parse(await L.ls(A, 'usoint-p-py')).personnel[0].nome.length === 320 && sw[0] <= sw[1]);
    await ctx.close();
  }
  /* ===================== K: backup e ripristino ===================== */
  {
    const { ctx } = await L.contesto({ kv: KV });
    const T = await L.pagina(ctx); await L.apriUso(T); await L.aspetta(T, 500);
    const [dl] = await Promise.all([T.page.waitForEvent('download', { timeout: 8000 }), T.page.click('button:has-text("💾 Backup dati")')]);
    const f = path.join(__dirname, 'out-uso-a01-backup.json'); await dl.saveAs(f);
    const bk = JSON.parse(fs.readFileSync(f, 'utf8')); fs.unlinkSync(f);
    c('K01', 'backup JSON', '__schema 1, __app USOINT, __ver ' + L.VER + ', chiavi usoint-*', [bk.__schema, bk.__app, bk.__ver, Object.keys(bk).filter(k => k.indexOf('usoint') === 0).join(',')].join(' · '), bk.__schema === 1 && bk.__app === 'USOINT' && bk.__ver === L.VER && bk['usoint-idx'] && bk['usoint-p-px']);
    c('K02', 'chiavi di servizio fuori dal backup', 'niente uso-timbro / uso-sospese-cloud / uso-import-orig / __fakefb', Object.keys(bk).filter(k => !/^usoint|^__(schema|app|ver|creato)$/.test(k)).join(',') || 'nessuna', Object.keys(bk).filter(k => !/^usoint|^__(schema|app|ver|creato)$/.test(k)).length === 0);
    c('K03', 'nome del file di backup', '«Spazio Ireos USOINT Backup ggmmmaa - ' + L.VER + ' - HH.MM.json»', dl.suggestedFilename(), new RegExp('^Spazio Ireos USOINT Backup \\d{2}[a-z]{3}\\d{2} - ' + L.VER + ' - \\d{2}\\.\\d{2}\\.json$').test(dl.suggestedFilename()));
    await L.aspetta(T, 1700);
    const cl0 = await dump(T), ls0 = await lsUso(T);
    const malfatti = [['non JSON', '{{{'], ['senza chiavi USOINT', '{"a":1}'], ['usoint-idx = "12345"', '{"usoint-idx":"12345"}'], ['usoint-idx elenco di numeri', '{"usoint-idx":"[1,2,3]"}'], ['usoint-idx voce senza id/titolo', '{"usoint-idx":"[{\\"x\\":1}]"}'], ['usoint-p-* non oggetto', '{"usoint-p-zz":"[1]"}'], ['usoint-orelav testo', '{"usoint-orelav":"\\"testo\\""}'], ['valore non JSON', '{"usoint-idx":"{rotto"}']];
    let i = 0;
    for (const [nome, cont] of malfatti) {
      i++; const nd = T.dialoghi.length;
      await ripristina(T, cont);
      const msgs = T.dialoghi.slice(nd).map(x => x.msg.split('\n')[0]).join(' | ');
      const intatto = (await dump(T)) === cl0 && (await lsUso(T)) === ls0;
      c('K' + String(3 + i).padStart(2, '0'), 'ripristino file malfatto: ' + nome, 'rifiutato, browser e cloud intatti', msgs.slice(0, 90) + ' / intatto ' + intatto, intatto && T.dialoghi.slice(nd).every(x => x.tipo === 'alert'));
    }
    // schema 99
    let nd = T.dialoghi.length;
    await ripristina(T, JSON.stringify(Object.assign({}, bk, { __schema: 99 })));
    c('K12', 'backup di schema 99', 'rifiutato (file 99 · app 1), niente toccato', T.dialoghi.slice(nd).map(x => x.msg.split('\n')[0]).join(' | ').slice(0, 90), /schema più NUOVO/.test(T.dialoghi.slice(nd).map(x => x.msg).join()) && (await dump(T)) === cl0);
    nd = T.dialoghi.length;
    await ripristina(T, JSON.stringify(Object.assign({}, bk, { __schema: '1' })));
    c('K13', 'backup con __schema non numerico ("1")', 'rifiutato', T.dialoghi.slice(nd).map(x => x.msg.split('\n')[0]).join(' | ').slice(0, 90), /schema più NUOVO/.test(T.dialoghi.slice(nd).map(x => x.msg).join()) && (await dump(T)) === cl0);
    // senza schema: avvisa; annulla = niente
    const senza = Object.assign({}, bk); delete senza.__schema; delete senza.__app; delete senza.__ver; delete senza.__creato;
    T.risposte.push({ re: /NON dice di che schema/, dismiss: true });
    nd = T.dialoghi.length;
    await ripristina(T, JSON.stringify(senza));
    c('K14', 'backup senza schema (prima della ver134)', 'avvisa e chiede; annulla = niente', T.dialoghi.slice(nd).map(x => x.tipo + ':' + x.msg.split('\n')[0]).join(' | ').slice(0, 100), /NON dice di che schema/.test(T.dialoghi.slice(nd).map(x => x.msg).join()) && (await dump(T)) === cl0);
    // backup vero: cancello un lavoro, poi rimetto
    await T.page.locator('button', { hasText: 'Elimina' }).nth(1).click(); await T.page.locator('button', { hasText: 'Conferma' }).click(); await L.aspetta(T, 2000);
    c('K15', 'dopo l\'eliminazione di LAVORO Y', 'sparito da browser e cloud', ((await L.ls(T, 'usoint-p-py')) === null) + ' / ' + ((await L.cloud(T, 'usoint-p-py')) === null), (await L.ls(T, 'usoint-p-py')) === null && (await L.cloud(T, 'usoint-p-py')) === null);
    // cloud caduto durante il ripristino
    await T.page.evaluate(() => { window.__fakefb.failWrites = true; });
    nd = T.dialoghi.length;
    await ripristina(T, JSON.stringify(bk));
    let ms = T.dialoghi.slice(nd).map(x => x.msg.split('\n')[0]);
    c('K16', 'ripristino col cloud caduto', 'conferma, poi «ATTENZIONE … NON scritti nel cloud», pagina NON ricaricata', ms.join(' | ').slice(0, 140), ms.some(m => /Stai per rimettere/.test(m)) && ms.some(m => /ATTENZIONE/.test(m)) && /I tuoi Progetti/.test(await L.testo(T)));
    await T.page.evaluate(() => { window.__fakefb.failWrites = false; });
    nd = T.dialoghi.length;
    await ripristina(T, JSON.stringify(bk)); await L.aspetta(T, 1800);
    ms = T.dialoghi.slice(nd).map(x => x.msg.split('\n')[0]);
    c('K17', 'ripristino del backup vero', 'conferma con il numero di elementi, «Rimessi … e scritti nel cloud», ricarica', ms.join(' | ').slice(0, 140), ms.some(m => /Stai per rimettere 3 elementi/.test(m)) && ms.some(m => /scritti nel cloud/.test(m)));
    await T.page.waitForFunction(() => document.body && /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 10000 }).catch(() => {}); await L.aspetta(T, 500);
    const t = await L.testo(T);
    c('K18', 'dopo la ricarica', 'LAVORO Y di nuovo in Home, browser e cloud', /LAVORO Y/.test(t) + ' / ' + !!(await L.ls(T, 'usoint-p-py')) + ' / ' + !!(await L.cloud(T, 'usoint-p-py')), /LAVORO Y/.test(t) && !!(await L.ls(T, 'usoint-p-py')) && !!(await L.cloud(T, 'usoint-p-py')));
    c('K19', 'errori di pagina', '0', T.errori.length + ' ' + T.errori.slice(0, 2).join('|'), T.errori.length === 0);
    await ctx.close();
  }
  L.fine('uso-a01-dati'); await L.chiudi();
})().catch(async e => { console.error('ERRORE SCRIPT', e); await L.chiudi(); process.exit(1); });
