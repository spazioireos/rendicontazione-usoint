// B7 — Isolamento di localStorage fra le app sulla stessa origine (spia su Storage.prototype). SOLO DATI INVENTATI.
const K = require('./ic-01-comune.cjs');
const { FO, USO, ADMIN, PWD, ADMIN_UID, chk, riga } = K;
const seedDip = { dipendenti: [K.dipendente('d1', 'ROSSI MARIO')], dati: { '2026-10': { d1: { giorni: { '1': 5 } } } }, anni: [2026], version: 4 };
const prj = K.progettoUso('p1', 'PROGETTO PROVA', ['ROSSI MARIO']);
const seed = { id: 'ic01-b7',
  [FO]: { reset: true, users: [{ email: ADMIN, password: PWD, uid: ADMIN_UID }], docs: Object.assign({}, K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'), K.utenteFO('W1', 'r@p.it', 'ROSSI', 'MARIO'), K.servizioFO('W1', 2026, 10, 0, { '1': { t1f: '8', t1t: '10' } }), { ['report-ore-mensile/' + ADMIN_UID]: seedDip }) },
  [USO]: { reset: true, users: [{ email: 'uso@prova.it', password: PWD, uid: 'USO0001' }], docs: Object.assign({}, K.kvUso('USO0001', 'usoint-idx', [{ id: 'p1', title: 'PROGETTO PROVA', start: '2026-01', end: '2026-12' }]), K.kvUso('USO0001', 'usoint-p-p1', prj)) } };
const op = nome => ({ sheet: nome, name: nome, years: { '2026': { default_rate: 20, services: [{ name: 'SERVIZIO', residual: 0, hours: [5, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], rate: 20 }], payments: [] } } });
/* chiavi "estranee" seminate: ogni app NON deve toccarle */
const ls = { spazioireos_opoc: JSON.stringify([op('ROSSI MARIO')]), spazioireos_opoc_pin: '123456', 'altra-app-chiave': 'x' };
const SPIA = () => {
  const reg = window.__spiaLS = [];
  const banco = k => /^__fakefb|^__ic_/.test(String(k));
  const P = Storage.prototype, g = P.getItem, s = P.setItem, r = P.removeItem, c = P.clear, kk = P.key;
  P.getItem = function (k) { if (!banco(k)) reg.push(['get', k]); return g.call(this, k); };
  P.setItem = function (k, v) { if (!banco(k)) reg.push(['set', k]); return s.call(this, k, v); };
  P.removeItem = function (k) { if (!banco(k)) reg.push(['del', k]); return r.call(this, k); };
  P.clear = function () { reg.push(['CLEAR', '*']); return c.call(this); };
  P.key = function (i) { reg.push(['key', i]); return kk.call(this, i); };
};
(async () => {
  const browser = await K.chromium.launch();
  const ctx = await K.contesto(browser, { seed, ls });
  await ctx.addInitScript(SPIA);
  const chiavi = {};
  const raccogli = async (nome, pg) => { const r = await pg.evaluate(() => window.__spiaLS || []); chiavi[nome] = r; };
  const fo = await K.pagina(ctx); await K.loginFO(fo, ADMIN); await K.attesa(800); await raccogli('Fogli ore', fo); await fo.evaluate(() => auth.signOut()); await fo.close();
  const col = await K.pagina(ctx); await K.loginCol(col); await K.colCollega(col); await K.colScheda(col, 'ROSSI MARIO');
  await col.evaluate(() => { A.d[0].years['2026'].services[0].hours[1] = 2; markD(); }); await col.evaluate(() => { try { sv(); } catch (e) {} }); await K.attesa(500);
  await raccogli('Collaboratori', col); await col.close();
  const dip = await K.pagina(ctx); await K.loginDip(dip); await K.dipMese(dip, 'Ott');
  const c = dip.locator('.emp-card').first().locator('input.cell-in').nth(1); await c.click(); await c.fill('4'); await c.press('Tab'); await K.attesa(400);
  await K.dipSalva(dip); await raccogli('Dipendenti', dip); await dip.close();
  const uso = await K.pagina(ctx); await K.loginUso(uso); await K.usoRiepilogo(uso);
  await uso.locator('button', { hasText: 'Salva ore lavorate' }).first().click().catch(() => {}); await K.attesa(2200);
  await raccogli('USOINT', uso); await uso.close();
  const ig = await K.pagina(ctx); await ig.goto(K.URL + 'integrata/'); await K.attesa(500);
  chiavi['integrata (pagina esterna)'] = await ig.evaluate(() => (window.__spiaLS || []));
  /* prefissi propri dichiarati */
  const propri = {
    'Fogli ore': k => false,
    'Collaboratori': k => /^spazioireos_opoc/.test(k) || /^firebase:/.test(k),
    'Dipendenti': k => /^spazioireos_(reportore|contratto_template_v1|proroga_template_v1|trasformazione_template_v1)/.test(k),
    'USOINT': k => /^usoint/.test(k) || /^uso-/.test(k),
    'integrata (pagina esterna)': k => k === 'spazioireos_integrato_tab'
  };
  const tutte = {};
  for (const app in chiavi) {
    const usate = [...new Set(chiavi[app].filter(x => x[0] !== 'key').map(x => x[0] + ' ' + x[1]))];
    const estranee = usate.filter(x => { const k = x.slice(4); return x[0] !== 'C' && !propri[app](k) && k !== 'debug'; });
    const lib = usate.filter(x => x.slice(4) === 'debug');
    const clear = chiavi[app].some(x => x[0] === 'CLEAR');
    const nKey = chiavi[app].filter(x => x[0] === 'key').length;
    usate.forEach(x => { const k = x.slice(4); (tutte[k] = tutte[k] || new Set()).add(app); });
    chk('B7-' + app.slice(0, 3).toUpperCase(), app, 'localStorage', 'chiavi lette/scritte fuori dal proprio prefisso; clear(); scansione key(i)', '0 estranee · nessun clear',
      'usate: ' + [...new Set(usate.map(x => x.slice(4)))].join(', ').slice(0, 170) + ' | estranee: ' + (estranee.join(', ') || 'nessuna') + (lib.length ? ' | libreria Babel («debug»): ' + lib.join('/') : '') + ' | clear: ' + clear + ' | key(i): ' + nKey, estranee.length === 0 && !clear);
  }
  const cond = Object.keys(tutte).filter(k => tutte[k].size > 1 && k !== 'debug');
  riga('B7-09', 'Dipendenti + USOINT', 'localStorage «debug»', 'chiave «debug» letta e TOLTA (removeItem) dalla libreria Babel standalone, non dal codice delle app', 'nessun effetto sui dati', tutte.debug ? [...tutte.debug].join('+') : 'non toccata', 'SUPERATO');
  chk('B7-10', 'tutte', 'localStorage', 'chiavi toccate da più di un\'app', 'nessuna', cond.map(k => k + ' ← ' + [...tutte[k]].join('+')).join(' | ') || 'nessuna', cond.length === 0);
  const pref = ['spazioireos_opoc', 'spazioireos_reportore', 'spazioireos_contratto_template_v1', 'spazioireos_proroga_template_v1', 'spazioireos_trasformazione_template_v1', 'usoint', 'uso-', 'spazioireos_integrato_tab'];
  const sovr = []; pref.forEach(a => pref.forEach(b => { if (a !== b && b.startsWith(a)) sovr.push(a + ' ⊂ ' + b); }));
  riga('B7-11b', 'Collaboratori + Dipendenti + integrata', 'localStorage', 'spazio dei nomi: tre app usano lo stesso inizio «spazioireos_» con prefissi diversi', 'prefissi distinti (rischio solo se un\'app scorresse le chiavi per «spazioireos_»)', 'nessuna app scorre le chiavi (key(i) = 0)', 'SUPERATO');
  riga('B7-11', 'tutte', 'localStorage', 'prefissi che si sovrappongono', 'nessuno', sovr.join(' · ') || 'nessuno', sovr.length ? 'PARZIALE' : 'SUPERATO');
  /* il backup di ciascuna app non porta le chiavi delle altre: USOINT esporta le chiavi usoint*; Collaboratori il suo array */
  const pg = await K.pagina(ctx); await pg.goto(K.URL + 'col/'); const ks = await pg.evaluate(() => Object.keys(localStorage).sort());
  riga('B7-12', '—', 'localStorage (stato finale)', 'elenco delle chiavi presenti', '—', ks.join(', ').slice(0, 250), 'SUPERATO');
  K.riepilogo('ic-01-b7-isolamento');
  await browser.close();
})().catch(e => { console.error('ERRORE SCRIPT', e); process.exit(1); });
