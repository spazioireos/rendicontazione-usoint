// Collaudo A01 USOINT ver138 — accesso, home, progetti (nuovo/duplica/rinomina/elimina), targhette.
// NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-a01-base.cjs   (banco comune acceso, porta 8340)
const L = require('./uso-a01-lib.cjs');
const { c } = L;
(async () => {
  /* ---------- A: login / logout ---------- */
  {
    const { ctx, esterni } = await L.contesto({ sessione: false, kv: {} });
    const T = await L.pagina(ctx); await L.apriUso(T);
    c('B01', 'schermata di accesso', 'email+password', await T.page.isVisible('input[type=email]'), await T.page.isVisible('input[type=email]'));
    await T.page.fill('input[type=email]', L.MAIL); await T.page.fill('input[type=password]', 'sbagliata'); await T.page.press('input[type=password]', 'Enter');
    await L.aspetta(T, 500);
    const t1 = await L.testo(T);
    c('B02', 'password sbagliata', '«Credenziali errate o utente non registrato»', /Credenziali errate/.test(t1) ? 'messaggio presente' : t1.slice(0, 120), /Credenziali errate/.test(t1));
    await T.page.fill('input[type=email]', ''); await T.page.fill('input[type=password]', ''); await T.page.click('button:has-text("Accedi")');
    await L.aspetta(T, 200);
    c('B03', 'campi vuoti', '«Inserisci email e password»', /Inserisci email e password/.test(await L.testo(T)), /Inserisci email e password/.test(await L.testo(T)));
    await T.page.fill('input[type=email]', L.MAIL); await T.page.fill('input[type=password]', L.PWD); await T.page.press('input[type=password]', 'Enter');
    await T.page.waitForFunction(() => /I tuoi Progetti/.test(document.body.innerText), null, { timeout: 15000 }).catch(() => {});
    const t2 = await L.testo(T);
    c('B04', 'login giusto', 'Home «I tuoi Progetti»', /I tuoi Progetti/.test(t2), /I tuoi Progetti/.test(t2));
    c('B05', 'targhetta Home', L.TARGA, (t2.match(/ver\d+ · \d+\w+/) || [''])[0], t2.includes(L.TARGA));
    c('B06', 'home vuota', '«Nessun progetto ancora.»', /Nessun progetto ancora/.test(t2), /Nessun progetto ancora/.test(t2));
    await T.page.reload(); await L.aspetta(T, 1500);
    c('B07', 'sessione dopo ricarica', 'resta dentro', /I tuoi Progetti/.test(await L.testo(T)), /I tuoi Progetti/.test(await L.testo(T)));
    await T.page.click('button:has-text("Logout")');
    await T.page.waitForTimeout(800); await T.page.waitForFunction(() => document.body && /Accedi con email/.test(document.body.innerText), null, { timeout: 15000 }).catch(() => {});
    c('B08', 'Logout', 'torna all\'accesso', /Accedi con email/.test(await L.testo(T)), /Accedi con email/.test(await L.testo(T)));
    c('B09', 'nessuna richiesta esterna / errori', '0 / 0', esterni.length + ' / ' + T.errori.length + ' ' + T.errori.slice(0, 2).join('|'), esterni.length === 0 && T.errori.length === 0);
    await ctx.close();
  }
  /* ---------- B: nuovo progetto con la procedura ---------- */
  {
    const { ctx } = await L.contesto({ kv: {} });
    const T = await L.pagina(ctx); await L.apriUso(T);
    await T.page.click('button:has-text("+ Nuovo Progetto")');
    await L.aspetta(T, 200);
    await T.page.locator('input[placeholder="Es: INVECCH ATS"]').fill('PROVA ALFA');
    const dates = T.page.locator('input[type=date]');
    await dates.nth(0).fill('2026-01-01'); await dates.nth(1).fill('2027-12-31');
    await T.page.click('button:has-text("Avanti")').catch(() => {});
    await L.aspetta(T, 200);
    let tw = await L.testo(T);
    c('B10', 'procedura passo 2', '«2. Vincolo annuale»', /Vincolo annuale/.test(tw), /Vincolo annuale/.test(tw));
    await T.page.locator('button', { hasText: 'Sì' }).first().click(); await L.aspetta(T, 200);
    tw = await L.testo(T);
    c('B11', 'procedura passo 3', '«3. Dimensioni»', /Dimensioni/.test(tw), /Dimensioni/.test(tw));
    await T.page.click('button:has-text("✓ Crea")');
    await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO/.test(document.body.innerText), null, { timeout: 15000 }).catch(() => {});
    tw = await L.testo(T);
    c('B12', 'progetto creato e aperto', 'scheda con PROVA ALFA', /PROVA ALFA/.test(tw) && /BUDGET\/PREVENTIVO/.test(tw), /PROVA ALFA/.test(tw) && /BUDGET\/PREVENTIVO/.test(tw));
    c('B13', 'targhetta scheda progetto', L.TARGA, tw.includes(L.TARGA), tw.includes(L.TARGA));
    const idx = JSON.parse(await L.ls(T, 'usoint-idx') || '[]');
    c('B14', 'indice con il progetto', '1 voce, vincolo true', JSON.stringify(idx.map(x => [x.title, x.vincolo, x.start, x.end])), idx.length === 1 && idx[0].vincolo === true);
    const pr = JSON.parse(await L.ls(T, 'usoint-p-' + idx[0].id) || '{}');
    c('B15', 'dimensioni di partenza', '6 personale, 4 beni, 2 annualità', (pr.personnel || []).length + ' / ' + (pr.beni || []).length + ' / ' + ((pr.personnel || [])[0] || {}).aOre?.length, pr.personnel.length === 6 && pr.beni.length === 4 && pr.personnel[0].aOre.length === 2);
    await L.aspetta(T, 1800);
    c('B16', 'sync cloud della creazione', 'usoint-idx e usoint-p-<id> nel cloud', !!(await L.cloud(T, 'usoint-idx')) + ' / ' + !!(await L.cloud(T, 'usoint-p-' + idx[0].id)), !!(await L.cloud(T, 'usoint-idx')) && !!(await L.cloud(T, 'usoint-p-' + idx[0].id)));
    // titolo doppio alla creazione
    await T.page.click('button:has-text("←")'); await L.aspetta(T, 400);
    await T.page.click('button:has-text("+ Nuovo Progetto")'); await L.aspetta(T, 200);
    await T.page.locator('input[placeholder="Es: INVECCH ATS"]').fill('prova alfa ');
    await T.page.locator('input[type=date]').nth(0).fill('2026-01-01'); await T.page.locator('input[type=date]').nth(1).fill('2026-12-31');
    await T.page.click('button:has-text("Avanti")').catch(() => {}); await L.aspetta(T, 200);
    await T.page.locator('button', { hasText: 'No' }).first().click(); await L.aspetta(T, 200);
    T.risposte.push({ re: /Esiste gi/, dismiss: true });
    await T.page.click('button:has-text("✓ Crea")'); await L.aspetta(T, 500);
    const dlg = T.dialoghi.filter(d => /Esiste gi/.test(d.msg));
    const idx2 = JSON.parse(await L.ls(T, 'usoint-idx') || '[]');
    c('B17', 'titolo doppio alla creazione (annulla)', 'avviso, progetto NON creato', dlg.length + ' avvisi, ' + idx2.length + ' progetti', dlg.length === 1 && idx2.length === 1);
    c('B18', 'errori di pagina', '0', T.errori.length + ' ' + T.errori.slice(0, 2).join('|'), T.errori.length === 0);
    await ctx.close();
  }
  /* ---------- C: duplica, rinomina, elimina ---------- */
  {
    const p1 = L.prog('p1', 'PROGETTO UNO', '2026-01-01', '2026-12-31', 1, { personnel: [L.pers(1, { nome: 'ROSSI PROVA', voce: 'EDUCATORE', oreT: 100, eur: 20, aOre: [100] })] });
    const p2 = L.prog('p2', 'PROGETTO DUE', '2026-01-01', '2026-12-31', 1);
    const kv = { 'usoint-idx': [{ id: 'p1', title: 'PROGETTO UNO', start: '2026-01-01', end: '2026-12-31', vincolo: false }, { id: 'p2', title: 'PROGETTO DUE', start: '2026-01-01', end: '2026-12-31', vincolo: false }], 'usoint-p-p1': p1, 'usoint-p-p2': p2 };
    const { ctx } = await L.contesto({ kv });
    const T = await L.pagina(ctx); await L.apriUso(T);
    let t = await L.testo(T);
    c('C01', 'home con progetti seminati', '2 cartellini', (t.match(/Duplica/g) || []).length, /PROGETTO UNO/.test(t) && /PROGETTO DUE/.test(t));
    // ricerca
    await T.page.fill('input[placeholder="Cerca nome, ruolo o voce beni…"]', 'rossi'); await L.aspetta(T, 200);
    t = await L.testo(T);
    c('C02', 'ricerca per nominativo', 'solo PROGETTO UNO', /PROGETTO UNO/.test(t) && !/PROGETTO DUE/.test(t), /PROGETTO UNO/.test(t) && !/PROGETTO DUE/.test(t));
    await T.page.click('button:has-text("✕ Azzera")'); await L.aspetta(T, 200);
    // duplica
    await T.page.locator('button', { hasText: 'Duplica' }).first().click();
    await T.page.waitForFunction(() => /PROGETTO UNO \(copia\)/.test(document.body.innerText), null, { timeout: 8000 }).catch(() => {});
    let idx = JSON.parse(await L.ls(T, 'usoint-idx'));
    const cop = idx.find(x => /copia/.test(x.title));
    const pc = cop ? JSON.parse(await L.ls(T, 'usoint-p-' + cop.id)) : null;
    c('C03', 'Duplica', 'copia con stesso personale (ROSSI PROVA, 100 h)', cop ? cop.title + ' / ' + pc.personnel[0].nome + ' ' + pc.personnel[0].oreT : 'nessuna', !!cop && pc.personnel[0].nome === 'ROSSI PROVA' && pc.personnel[0].oreT === 100);
    // rinomina sulla copia (aperta): titolo doppio -> avviso
    T.risposte.push({ re: /Rinomina il lavoro/, text: 'progetto due' }); T.risposte.push({ re: /Esiste gi/, dismiss: true });
    await T.page.locator('span[title="Clicca per rinominare il lavoro"]').click(); await L.aspetta(T, 300);
    let d = T.dialoghi.filter(x => /Esiste gi/.test(x.msg));
    c('C04', 'rinomina con titolo doppio', 'avviso che nomina Riepilogo/colonna sola; annulla = niente', d.length ? d[0].msg.slice(0, 90) : 'nessun avviso', d.length === 1 && /SOMMATE/.test(d[0].msg) && /PROGETTO UNO \(copia\)/.test(await L.testo(T)));
    T.risposte.push({ re: /Rinomina il lavoro/, text: 'PROGETTO TRE' });
    await T.page.locator('span[title="Clicca per rinominare il lavoro"]').click(); await L.aspetta(T, 300);
    t = await L.testo(T);
    idx = JSON.parse(await L.ls(T, 'usoint-idx'));
    const arch = JSON.parse(await L.ls(T, 'usoint-p-' + cop.id)).title;
    c('C05', 'rinomina NON scrive prima del 💾', 'a video PROGETTO TRE, archivio e indice col titolo vecchio', 'video ' + /PROGETTO TRE/.test(t) + ' / arch ' + arch + ' / idx ' + idx.find(x => x.id === cop.id).title, /PROGETTO TRE/.test(t) && arch === 'PROGETTO UNO (copia)' && idx.find(x => x.id === cop.id).title === 'PROGETTO UNO (copia)');
    // uscita con ← chiede
    T.risposte.push({ re: /modifiche non salvate/, dismiss: true });
    await T.page.locator('button', { hasText: '←' }).first().click(); await L.aspetta(T, 300);
    d = T.dialoghi.filter(x => /modifiche non salvate/.test(x.msg));
    c('C06', '← con modifiche non salvate', 'chiede; annulla = resta nella scheda', d.length + ' domande, scheda ' + /BUDGET\/PREVENTIVO/.test(await L.testo(T)), d.length === 1 && /BUDGET\/PREVENTIVO/.test(await L.testo(T)));
    await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 400);
    idx = JSON.parse(await L.ls(T, 'usoint-idx'));
    c('C07', '💾 dopo la rinomina', 'titolo nuovo in lavoro e indice', JSON.parse(await L.ls(T, 'usoint-p-' + cop.id)).title + ' / ' + idx.find(x => x.id === cop.id).title, JSON.parse(await L.ls(T, 'usoint-p-' + cop.id)).title === 'PROGETTO TRE' && idx.find(x => x.id === cop.id).title === 'PROGETTO TRE');
    const nd = T.dialoghi.length;
    await T.page.locator('button', { hasText: '←' }).first().click(); await L.aspetta(T, 400);
    c('C08', '← senza modifiche', 'esce senza domande', (T.dialoghi.length - nd) + ' domande, home ' + /I tuoi Progetti/.test(await L.testo(T)), T.dialoghi.length === nd && /I tuoi Progetti/.test(await L.testo(T)));
    // elimina: doppia conferma (in riga + dialogo che nomina)
    const posTre = JSON.parse(await L.ls(T, 'usoint-idx')).findIndex(x => x.title === 'PROGETTO TRE');
    const elimina = () => T.page.locator('button', { hasText: 'Elimina' }).nth(posTre);
    await elimina().click(); await L.aspetta(T, 150);
    c('C09', '🗑 Elimina mostra conferma in riga', 'pulsanti Conferma/Annulla', await T.page.locator('button', { hasText: 'Conferma' }).count(), await T.page.locator('button', { hasText: 'Conferma' }).count() === 1);
    T.risposte.push({ re: /ELIMINARE il lavoro/, dismiss: true });
    await T.page.locator('button', { hasText: 'Conferma' }).click(); await L.aspetta(T, 300);
    d = T.dialoghi.filter(x => /ELIMINARE il lavoro/.test(x.msg));
    idx = JSON.parse(await L.ls(T, 'usoint-idx'));
    c('C10', 'conferma eliminazione nomina il lavoro; NO = resta', '«PROGETTO TRE» (2026-01-01 → 2026-12-31), 3 progetti', d.length ? d[0].msg.split('\n')[0] : 'nessuna', d.length === 1 && /«PROGETTO TRE» \(2026-01-01 → 2026-12-31\)/.test(d[0].msg) && idx.length === 3);
    await elimina().click(); await L.aspetta(T, 150);
    await T.page.locator('button', { hasText: 'Conferma' }).click(); await L.aspetta(T, 400);
    idx = JSON.parse(await L.ls(T, 'usoint-idx'));
    c('C11', 'eliminazione confermata', 'sparisce dall\'indice e il suo usoint-p-<id> è tolto', idx.length + ' progetti, p ' + (await L.ls(T, 'usoint-p-' + cop.id)), idx.length === 2 && (await L.ls(T, 'usoint-p-' + cop.id)) === null);
    await L.aspetta(T, 1800);
    c('C12', 'eliminazione anche nel cloud', 'documento kv cancellato', String(await L.cloud(T, 'usoint-p-' + cop.id)), (await L.cloud(T, 'usoint-p-' + cop.id)) === null);
    // modifica date/cadenza da home? (✎ periodo) — solo presenza
    c('C13', 'errori di pagina', '0', T.errori.length + ' ' + T.errori.slice(0, 2).join('|'), T.errori.length === 0);
    // C15-C17: rinomina + 💾 + ← : la Home e le operazioni successive sull'elenco usano lo stato vecchio?
    {
      const posDue = JSON.parse(await L.ls(T, 'usoint-idx')).findIndex(x => x.title === 'PROGETTO DUE');
      await T.page.locator('div[style*="cursor: pointer"]', { hasText: 'PROGETTO DUE' }).last().click();
      await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO/.test(document.body.innerText), null, { timeout: 8000 }).catch(() => {});
      T.risposte.push({ re: /Rinomina il lavoro/, text: 'PROGETTO QUATTRO' });
      await T.page.locator('span[title="Clicca per rinominare il lavoro"]').click(); await L.aspetta(T, 300);
      await T.page.click('button:has-text("💾 Salva")'); await L.aspetta(T, 300);
      await T.page.locator('button', { hasText: '←' }).first().click(); await L.aspetta(T, 400);
      const th = await L.testo(T);
      c('C15', 'Home subito dopo rinomina+💾+←', 'mostra PROGETTO QUATTRO', 'QUATTRO ' + /PROGETTO QUATTRO/.test(th) + ' / DUE ' + /PROGETTO DUE/.test(th), /PROGETTO QUATTRO/.test(th) && !/PROGETTO DUE/.test(th));
      await T.page.locator('button', { hasText: 'Duplica' }).first().click(); await L.aspetta(T, 500);
      await T.page.locator('button', { hasText: '←' }).first().click(); await L.aspetta(T, 400);
      const idx3 = JSON.parse(await L.ls(T, 'usoint-idx'));
      c('C16', 'indice dopo un\'altra operazione (Duplica) senza ricaricare', 'il titolo rinominato resta PROGETTO QUATTRO', JSON.stringify(idx3.map(x => x.title)), idx3.some(x => x.title === 'PROGETTO QUATTRO'));
      const pq = JSON.parse(await L.ls(T, 'usoint-p-p2')).title;
      c('C17', 'titolo dentro il lavoro', 'PROGETTO QUATTRO', pq, pq === 'PROGETTO QUATTRO');
      await T.page.reload(); await L.aspetta(T, 1500);
      const tr = await L.testo(T);
      c('C18', 'Home dopo ricarica', 'quale titolo per p2', 'QUATTRO ' + /PROGETTO QUATTRO/.test(tr) + ' / DUE ' + /PROGETTO DUE/.test(tr), /PROGETTO QUATTRO/.test(tr));
    }
    // targhetta nel riepilogo
    await T.page.click('button:has-text("👥 Riepilogo operatori")'); await L.aspetta(T, 800);
    t = await L.testo(T);
    c('C14', 'targhetta Riepilogo operatori', L.TARGA, (t.match(/ver\d+ · \d+\w+/) || ['nessuna'])[0], t.includes(L.TARGA));
    await ctx.close();
  }
  L.fine('uso-a01-base'); await L.chiudi();
})().catch(async e => { console.error('ERRORE SCRIPT', e); await L.chiudi(); process.exit(1); });
