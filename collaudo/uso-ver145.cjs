// uso-ver145 — USOINT dice da quale salvataggio di Dipendenti vengono le ore a cedolino (cedOreAgg).
// Banco comune 8340 con finta Firebase. SOLO DATI INVENTATI.
//   NODE_PATH=/opt/node-tools/node_modules node collaudo/uso-ver145.cjs
const K = require('./interconnessioni/ic-01-comune.cjs');
const { FO, USO, ADMIN, PWD, ADMIN_UID, chk } = K;
const doc = (agg) => Object.assign({
  dipendenti: [K.dipendente('d1', 'ROSSI MARIO', { mensilizzato: true, mensilizzatoDal: '01/10/2026' })],
  dati: { '2026-10': { d1: { giorni: { '1': 3, '2': 3 } } } }, anni: [2026], version: 4,
  cedOre: { '2026-10': { d1: 79.33 } } }, agg === undefined ? {} : { cedOreAgg: agg });
const prj = K.progettoUso('p1', 'PROGETTO PROVA', ['ROSSI MARIO']);
const seed = { id: 'uso145',
  [FO]: { reset: true, users: [{ email: ADMIN, password: PWD, uid: ADMIN_UID }], docs: Object.assign({}, K.utenteFO(ADMIN_UID, ADMIN, 'AMMINISTRAZIONE', 'PROVA', 'admin'), { ['report-ore-mensile/' + ADMIN_UID]: doc('2026-11-23T08:41:00') }) },
  [USO]: { reset: true, users: [{ email: 'uso@prova.it', password: PWD, uid: 'USO0001' }], docs: Object.assign({}, K.kvUso('USO0001', 'usoint-idx', [{ id: 'p1', title: 'PROGETTO PROVA', start: '2026-01', end: '2026-12' }]), K.kvUso('USO0001', 'usoint-p-p1', prj)) } };
async function stato(uso) { const t = await K.testo(uso); const i = t.indexOf('importate'); return i < 0 ? t.slice(0, 300) : t.slice(i, i + 260).replace(/\s+/g, ' '); }
async function rileggi(uso) { await uso.locator('button', { hasText: 'Rileggi le ore dai Dipendenti' }).first().click(); await K.attesa(2500); }
const semina = (p, d) => p.evaluate(([fo, uid, dd]) => __fakefb.seed(fo, { ['report-ore-mensile/' + uid]: dd }), [FO, ADMIN_UID, d]);

(async () => {
  const browser = await K.chromium.launch();
  const ctx = await K.contesto(browser, { seed });
  const uso = await K.pagina(ctx);
  await K.loginUso(uso); await K.usoRiepilogo(uso);
  const VERF = (require('fs').readFileSync(__dirname + '/../index.html', 'utf8').match(/const VER="(ver\d+)"/) || [])[1];   /* letta dal file: non invecchia */
  chk('U00', 'USOINT', 'targhetta', VERF, VERF, await uso.evaluate(() => (document.body.innerText.match(/ver\d+ · \d+[a-z]+\d+/) || [''])[0]), new RegExp(VERF + ' · ').test(await K.testo(uso)));
  let s = await stato(uso);
  chk('U01', 'Dipendenti → USOINT', 'riquadro dell\'import', 'dice la data del 💾 di Dipendenti', '23/11/2026 alle 08.41', s, /dall'ultimo 💾 di Dipendenti del 23\/11\/2026 alle 08\.41/.test(s));
  const date = [['2026-11-24T07:05:00', '24/11/2026 alle 07.05'], ['2026-12-01T18:30:00', '01/12/2026 alle 18.30'], ['2027-01-02T00:00:00', '02/01/2027 alle 00.00']];
  for (let c = 0; c < 3; c++) {
    await semina(uso, doc(date[c][0])); await rileggi(uso); s = await stato(uso);
    chk('U02.' + (c + 1), 'Dipendenti → USOINT', '↻ Rileggi dopo un nuovo 💾', 'data aggiornata', date[c][1], s, s.indexOf('del ' + date[c][1]) >= 0);
  }
  await semina(uso, doc(undefined)); await rileggi(uso); s = await stato(uso);
  chk('U03', 'USOINT', 'documento senza cedOreAgg (Dipendenti vecchio)', 'nessuna data, frase di prima', 'senza «dall\'ultimo»', s, /ore pagate a cedolino \(1 mese\)/.test(s) && !/dall'ultimo/.test(s));
  await semina(uso, doc('non-una-data')); await rileggi(uso); s = await stato(uso);
  chk('U04', 'USOINT', 'cedOreAgg guasto', 'nessuna data, niente «NaN»', 'senza data', s, !/NaN|Invalid/.test(s) && !/dall'ultimo/.test(s));
  const bs = uso.locator('button', { hasText: 'Salva ore lavorate' }); if (await bs.count()) { await bs.first().click(); await K.attesa(900); }
  const lav = await K.usoLav(uso); const ott = lav && lav['rossi mario'] && lav['rossi mario']['2026'] ? lav['rossi mario']['2026'][9] : null;
  chk('U05', 'Dipendenti → USOINT', 'ore di ottobre salvate col 💾', 'le ore a cedolino, come prima (il numero non cambia)', '79.33', String(ott), ott === 79.33);
  chk('U06', 'USOINT', 'errori di pagina', '0', '0', String(uso.__errori.length) + ' ' + uso.__errori.join(' | ').slice(0, 200), uso.__errori.length === 0);
  await browser.close();
  K.riepilogo('uso-ver145');
})();
