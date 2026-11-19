// B3 — Dipendenti → USOINT (ore lavorate, cedOre dei mensilizzati, codice operatore). SOLO DATI INVENTATI.
const K = require('./ic-01-comune.cjs');
const { FO, USO, ADMIN, PWD, ADMIN_UID, chk, riga } = K;
/* ROSSI: mensilizzato dal 01/10/2026, 19 h/sett, ottobre 82,50 h su 27 giorni non domenicali, nessuna assenza */
const ottR = K.giorniFeriali(2026, 10, 3); ottR['31'] = 4.5;       /* 26 × 3 + 4,5 = 82,50 */
const seedDip = {
  dipendenti: [
    K.dipendente('d1', 'ROSSI MARIO', { mensilizzato: true, mensilizzatoDal: '01/10/2026', sigla: 'ROS1' }),
    K.dipendente('d2', 'BETA PROVA'),
    K.dipendente('d3', 'GAMMA PROVA'), K.dipendente('d4', 'GAMMA PROVA'),
    K.dipendente('d5', 'DELTA PROVA', { sigla: 'DEL1' })
  ],
  dati: {
    '2026-01': { d2: { giorni: { '2': 10 } }, d3: { giorni: { '2': 70 / 10 } }, d4: { giorni: { '2': 7.7 } } },
    '2026-09': { d1: { giorni: { '1': 6, '2': '4,5' } } },
    '2026-10': { d1: { giorni: ottR }, d2: { giorni: { '1': 4, '2': '4,5', '3': '7,25', '5': 'FERIE' } }, d5: { giorni: { '1': 5 } } }
  },
  anni: [2026], version: 4
};
const prj = K.progettoUso('p1', 'PROGETTO PROVA', ['ROSSI MARIO', 'BETA PROVA', 'GAMMA PROVA', 'DELTA PROVA']);
const seed = { id: 'ic01-b3',
  [FO]: { reset: true, users: [{ email: ADMIN, password: PWD, uid: ADMIN_UID }], docs: Object.assign({}, K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'), { ['report-ore-mensile/' + ADMIN_UID]: seedDip }) },
  [USO]: { reset: true, users: [{ email: 'uso@prova.it', password: PWD, uid: 'USO0001' }], docs: Object.assign({}, K.kvUso('USO0001', 'usoint-idx', [{ id: 'p1', title: 'PROGETTO PROVA', start: '2026-01', end: '2026-12' }]), K.kvUso('USO0001', 'usoint-p-p1', prj)) } };
const fmt = n => (Math.round(n * 100) / 100);

async function rileggi(uso) {
  const n0 = uso.__dialoghi.length;
  await uso.locator('button', { hasText: 'Rileggi le ore dai Dipendenti' }).first().click();
  await K.attesa(2500);
  return uso.__dialoghi.slice(n0).map(d => d.msg);
}
async function salvaLav(uso) { const b = uso.locator('button', { hasText: 'Salva ore lavorate' }); if (await b.count()) { await b.first().click(); await K.attesa(800); return true; } return false; }
async function stato(uso) { const t = await K.testo(uso); const i = t.indexOf('Gestionale Dipendenti'); return t.slice(i, i + 700).replace(/\s+/g, ' '); }

(async () => {
  const browser = await K.chromium.launch();
  const ctx = await K.contesto(browser, { seed });
  /* 1) Dipendenti: una modifica + 💾 → cedOre */
  const dip = await K.pagina(ctx);
  await K.loginDip(dip); await K.dipMese(dip, 'Ott');
  const cardB = dip.locator('.emp-card', { hasText: 'BETA PROVA' }).first();
  const c8 = cardB.locator('input.cell-in').nth(7); await c8.click(); await c8.fill('1'); await c8.press('Tab'); await K.attesa(600);
  const boxR = await dip.evaluate(() => { const c = [...document.querySelectorAll('.emp-card')].find(e => /ROSSI MARIO/.test(e.innerText)); const b = c && c.querySelector('.ced-box'); return b ? b.innerText.replace(/\s+/g, ' ') : ''; });
  await K.dipSalva(dip);
  let docD = (await K.dump(dip, FO))['report-ore-mensile/' + ADMIN_UID] || {};
  const ced = docD.cedOre || {};
  const cedR = ced['2026-10'] && ced['2026-10'].d1;
  chk('B3-01', 'Dipendenti (💾)', 'report-ore-mensile.cedOre', 'ore a cedolino del mensilizzato (ott 2026)', 'cedOre["2026-10"].d1 presente; settembre e non mensilizzati assenti',
    JSON.stringify(ced), cedR != null && !(ced['2026-09'] && ced['2026-09'].d1) && !(ced['2026-10'] && ced['2026-10'].d2));
  const mBox = boxR.match(/rendiconto[^:]*: ore a cedolino ordinarie e supplementari ([\d.,]+)/i);
  riga('B3-02', 'Dipendenti', 'box «Da inserire a cedolino» vs cedOre', '82,50 rese su 27 gg, nessuna assenza (19 h/sett.)', 'box = cedOre (il compito diceva 79,33: regola ver176, superata dalla ver182)',
    'cedOre ' + cedR + ' · box «' + (mBox ? mBox[1] : boxR.slice(0, 160)) + '»', mBox && Math.abs(parseFloat(mBox[1].replace(/\./g, '').replace(',', '.')) - cedR) < 0.006 ? 'SUPERATO' : (cedR != null ? 'PARZIALE' : 'FALLITO'));

  /* 2) USOINT importa */
  const uso = await K.pagina(ctx);
  await K.loginUso(uso);
  await K.pulisciLog(uso);
  await K.usoRiepilogo(uso);
  let st = await stato(uso);
  chk('B3-03', 'Dipendenti', 'USOINT Riepilogo', 'stato dell\'import', '«importate ✓» + cedolino 1 mese + omonimi GAMMA', st.slice(0, 400), /importate/.test(st) && /cedolino \(1 mese\)/.test(st) && /GAMMA PROVA \(2 schede\)/i.test(st));
  const lav0 = await K.usoLav(uso);
  chk('B3-04', 'USOINT import (prima del 💾)', 'usoint-orelav', 'legato al 💾: archivio non toccato', 'vuoto', JSON.stringify(lav0), Object.keys(lav0).length === 0);
  await salvaLav(uso);
  let lav = await K.usoLav(uso);
  const r = (lav['rossi mario'] || {})['2026'] || [], b = (lav['beta prova'] || {})['2026'] || [], g = lav['gamma prova'], d = (lav['delta prova'] || {})['2026'] || [];
  chk('B3-05', 'Dipendenti cedOre', 'USOINT rossi mario 2026[9] (ottobre)', 'mensilizzato: ore a cedolino', String(cedR), String(r[9]), cedR != null && Math.abs(r[9] - cedR) < 0.001);
  chk('B3-06', 'Dipendenti celle', 'USOINT rossi mario 2026[8] (settembre)', 'prima della base mensile: somma delle celle 6 + "4,5"', '10,5', String(r[8]), Math.abs(r[8] - 10.5) < 0.001);
  chk('B3-07', 'Dipendenti celle', 'USOINT beta prova 2026[0] e [9]', 'non mensilizzato, indice 0 = gennaio, codici = 0, virgola', '[0]=10 · [9]=4+4,5+7,25+1=16,75', '[0]=' + b[0] + ' · [9]=' + b[9], b[0] === 10 && Math.abs(b[9] - 16.75) < 0.001);
  chk('B3-08', 'Dipendenti (2 schede GAMMA)', 'USOINT', 'omonimi non importati', 'nessuna ora per gamma prova', JSON.stringify(g || null), !g || !Object.values(g).some(a => a.some(x => x > 0)));
  const cod = await uso.evaluate(() => { try { return JSON.parse(localStorage.getItem('usoint-codici') || '{}'); } catch (e) { return {}; } });
  chk('B3-09', 'Dipendenti dp.sigla', 'USOINT usoint-codici', 'codici agganciati col 💾', 'ROS1→rossi mario · DEL1→delta prova', JSON.stringify(cod), cod.ROS1 === 'rossi mario' && cod.DEL1 === 'delta prova');
  await K.attesa(2200); const cloud = await K.dump(uso, USO);
  chk('B3-10', 'USOINT 💾', 'cloud rendicontazione-usoint kv/', 'ore lavorate e codici anche nel cloud', 'kv/usoint-orelav e kv/usoint-codici', Object.keys(cloud).filter(k => /orelav|codici/.test(k)).join(', '), !!cloud['users/USO0001/kv/usoint-orelav'] && !!cloud['users/USO0001/kv/usoint-codici']);

  /* 3) modifica e risalvataggio in Dipendenti → reimport */
  const cardR = dip.locator('.emp-card', { hasText: 'ROSSI MARIO' }).first();
  const c1 = cardR.locator('input.cell-in').nth(0); await c1.click(); await c1.fill('8'); await c1.press('Tab'); await K.attesa(500);   /* 1 ott: 3 → 8 (+5): 87,50 rese > 85,50 dovute → supplementari */
  await K.dipSalva(dip);
  docD = (await K.dump(dip, FO))['report-ore-mensile/' + ADMIN_UID] || {};
  const cedR2 = docD.cedOre['2026-10'].d1;
  let dl = await rileggi(uso); await salvaLav(uso);
  lav = await K.usoLav(uso);
  chk('B3-11', 'Dipendenti (+5 h e 💾)', 'USOINT ↻ e 💾', 'reimport aggiornato, senza domanda «a mano»', String(cedR2) + ' (era ' + cedR + ')', String(lav['rossi mario']['2026'][9]) + ' · dialoghi: ' + dl.length,
    Math.abs(lav['rossi mario']['2026'][9] - cedR2) < 0.001 && cedR2 !== cedR && !dl.some(m => /scritte a mano/.test(m)));
  /* modifica in Dipendenti SENZA 💾: USOINT legge il valore vecchio (atteso, documentato) */
  const c2 = cardR.locator('input.cell-in').nth(1); await c2.click(); await c2.fill('9'); await c2.press('Tab'); await K.attesa(500);
  dl = await rileggi(uso);
  st = await stato(uso);
  riga('B3-12', 'Dipendenti (modifica non salvata)', 'USOINT ↻', 'cosa legge USOINT', 'il valore dell\'ultimo 💾 di Dipendenti (documentato)', /non sono ancora salvate/.test(st) ? 'USOINT vede una modifica' : 'invariato (legge l\'ultimo 💾) — nessun segnale che Dipendenti ha modifiche non salvate', 'SUPERATO');
  await dip.reload(); dip.__risposte.push({ re: /.*/, ok: true }); await dip.waitForSelector('.app-header', { timeout: 40000 }).catch(() => {});

  /* 4) codice operatore: rinomino DELTA in Dipendenti (salvato) */
  await uso.evaluate(([p, u]) => { const x = window.__fakefb.get(p, 'report-ore-mensile/' + u); x.dipendenti.forEach(d => { if (d.id === 'd5') d.nome = 'DELTA-PROVA ANTONIA'; }); x.dati['2026-10'].d5.giorni['2'] = 3; window.__fakefb.seed(p, { ['report-ore-mensile/' + u]: x }); }, [FO, ADMIN_UID]);
  dl = await rileggi(uso); await salvaLav(uso); st = await stato(uso);
  lav = await K.usoLav(uso);
  chk('B3-13', 'Dipendenti (DELTA rinominata, sigla DEL1)', 'USOINT delta prova 2026[9]', 'il codice regge al cambio di nome', '8 (5+3) sulla riga di sempre, non fra i Non abbinati',
    JSON.stringify((lav['delta prova'] || {})['2026']) + ' · ' + (/Non abbinati[^·]*DELTA/i.test(st) ? 'NON ABBINATA' : 'abbinata'), lav['delta prova'] && lav['delta prova']['2026'][9] === 8 && !lav['delta-prova antonia'] && !/DELTA-PROVA ANTONIA/.test(st.match(/Non abbinati.{0,200}/) ? st.match(/Non abbinati.{0,200}/)[0] : ''));

  /* 5) mese svuotato → domanda di azzeramento */
  await uso.evaluate(([p, u]) => { const x = window.__fakefb.get(p, 'report-ore-mensile/' + u); x.dati['2026-01'].d2.giorni = {}; window.__fakefb.seed(p, { ['report-ore-mensile/' + u]: x }); }, [FO, ADMIN_UID]);
  uso.__risposte = [{ re: /AZZERARE/, ok: false }];
  dl = await rileggi(uso); st = await stato(uso);
  lav = await K.usoLav(uso);
  const az = dl.find(m => /AZZERARE/.test(m)) || '';
  chk('B3-14', 'Dipendenti (BETA gennaio svuotato)', 'USOINT', 'domanda prima di azzerare; Annulla → ore restano', 'domanda con «BETA PROVA · 2026 GEN: 10,00 → 0» e riquadro «NON azzerati»', az.replace(/\n/g, ' ').slice(0, 160) + ' · ' + (/NON azzerati/.test(st) ? 'riquadro NON azzerati' : 'nessun riquadro'),
    /BETA PROVA · 2026 GEN: 10,00 → 0/.test(az) && /NON azzerati/.test(st));
  uso.__risposte = [{ re: /AZZERARE/, ok: true }];
  dl = await rileggi(uso); await salvaLav(uso); lav = await K.usoLav(uso);
  chk('B3-15', 'Dipendenti (BETA gennaio svuotato)', 'USOINT', 'OK → azzerato', '0', String(lav['beta prova']['2026'][0]), lav['beta prova']['2026'][0] === 0);

  /* 6) numero scritto a mano in USOINT → domanda */
  await K.attesa(2500);   /* lascio finire la scrittura nel cloud del 💾 precedente (ver129: chiavi «sospese») */
  /* come se l'utente l'avesse scritto e salvato: browser + cloud */
  await uso.evaluate(p => { const l = JSON.parse(localStorage.getItem('usoint-orelav')); l['beta prova']['2026'][9] = 99; const v = JSON.stringify(l); localStorage.setItem('usoint-orelav', v); window.__fakefb.seed(p, { 'users/USO0001/kv/usoint-orelav': { v } }); }, USO);
  await uso.reload(); await K.aspettaTesto(uso, /I tuoi Progetti/, 30000);
  uso.__risposte = [{ re: /scritte a mano/, ok: false }];
  const n0 = uso.__dialoghi.length;
  await K.usoRiepilogo(uso); await K.attesa(1000);
  const man = uso.__dialoghi.slice(n0).map(x => x.msg).find(m => /scritte a mano/.test(m)) || '';
  chk('B3-16', 'USOINT (99 scritto a mano su BETA ott)', 'import', 'chiede prima di sostituire', 'domanda «BETA PROVA · 2026 OTT: 99,00 → 16,75»', man.replace(/\n/g, ' ').slice(0, 200), /BETA PROVA · 2026 OTT: 99,00 → 16,75/.test(man));

  /* 7) documento assente → messaggio rosso */
  await uso.evaluate(([p, u]) => window.__fakefb.seed(p, { ['report-ore-mensile/' + u]: null }), [FO, ADMIN_UID]);
  dl = await rileggi(uso); st = await stato(uso);
  const colore = await uso.evaluate(() => { const s = [...document.querySelectorAll('span')].find(e => /Nessun dato trovato in Dipendenti/.test(e.innerText)); return s ? getComputedStyle(s).color : ''; });
  chk('B3-17', 'Dipendenti (documento assente)', 'USOINT', 'messaggio rosso, nessuna spunta verde, ore non toccate', '«Nessun dato trovato» rosso, niente «importate ✓»', colore + ' · ' + st.slice(0, 200),
    /Nessun dato trovato/.test(st) && !/importate dai Dipendenti ✓/.test(st) && /220, 38, 38/.test(colore));
  lav = await K.usoLav(uso);
  chk('B3-18', 'Dipendenti (documento assente)', 'usoint-orelav', 'ore già importate intatte', 'rossi mario [9] invariato', String(lav['rossi mario']['2026'][9]), Math.abs(lav['rossi mario']['2026'][9] - cedR2) < 0.001);
  /* 8) lettura caduta */
  await uso.evaluate(([p, u, d]) => window.__fakefb.seed(p, { ['report-ore-mensile/' + u]: d }), [FO, ADMIN_UID, docD]);
  await uso.evaluate(() => { window.__fakefb.failReads = true; });
  dl = await rileggi(uso); st = await stato(uso);
  riga('B3-19', 'Dipendenti (lettura caduta)', 'USOINT', 'messaggio con la lettura caduta', 'dice che non è riuscito, senza attribuirlo ai permessi', (st.match(/Import non riuscito[^·]{0,40}/) || [st.slice(0, 120)])[0],
    /Import non riuscito/.test(st) ? (/permessi/.test(st) ? 'PARZIALE' : 'SUPERATO') : 'FALLITO');
  await uso.evaluate(() => { window.__fakefb.failReads = false; });
  /* 9) USOINT non scrive mai nel progetto di Dipendenti */
  const ops = await uso.evaluate(() => window.__fakefb.log);
  const wFO = K.scritture(ops, o => o.project === FO);
  const rFO = ops.filter(o => o.project === FO && /report-ore-mensile/.test(o.path || '') && !/set|update|delete/.test(o.op)).length;
  chk('B3-20', 'USOINT', 'progetto spazio-ireos-foglio-ore', 'scritture di USOINT (log della sua finestra)', '0 scritture, letture > 0', 'scritture ' + wFO.length + ' · letture report-ore-mensile ' + rFO + ' ' + wFO.slice(0, 2).map(o => o.op + ' ' + o.path).join(' | '), wFO.length === 0 && rFO > 0);
  const errs = dip.__errori.concat(uso.__errori).filter(e => /pageerror/.test(e));
  chk('B3-21', '—', '—', 'errori di pagina', '0', errs.length + ' ' + errs.slice(0, 2).join(' | '), errs.length === 0);
  K.riepilogo('ic-01-b3-dip-uso');
  await browser.close();
})().catch(e => { console.error('ERRORE SCRIPT', e); process.exit(1); });
