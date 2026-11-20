// B2b — regole Firestore vere (emulatore ufficiale) sui passaggi FRA le app. SOLO DATI INVENTATI.
// Avvia l'emulatore dal jar in ~/.cache/firebase/emulators con le regole in vigore
// (spazioireos-foglio-ore/regole-firestore/regole-residui-03nov26.rules) e prova via REST con token non firmati.
const { spawn } = require('child_process');
const path = require('path'), os = require('os'), fs = require('fs');
const K = require('./ic-01-comune.cjs');
const PORT = process.env.EMU_PORT || '8096', PJ = 'demo-ic-interconn';
const JAR = path.join(os.homedir(), '.cache/firebase/emulators/cloud-firestore-emulator-v1.19.8.jar');
const RULES = path.join(__dirname, '../../../spazioireos-foglio-ore/regole-firestore/regole-residui-03nov26.rules');
const B = 'http://127.0.0.1:' + PORT + '/v1/projects/' + PJ + '/databases/(default)/documents/';
const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
function tok(uid, email) { const n = Math.floor(Date.now() / 1000); return b64({ alg: 'none', typ: 'JWT' }) + '.' + b64({ iss: 'https://securetoken.google.com/' + PJ, aud: PJ, auth_time: n, user_id: uid, sub: uid, iat: n, exp: n + 3600, email, email_verified: true, firebase: { identities: { email: [email] }, sign_in_provider: 'password' } }) + '.'; }
const campi = o => { const f = {}; for (const k in o) { const v = o[k]; f[k] = typeof v === 'number' ? { doubleValue: v } : typeof v === 'boolean' ? { booleanValue: v } : { stringValue: String(v) }; } return { fields: f }; };
async function op(metodo, perc, chi, corpo) {
  const h = { 'Content-Type': 'application/json' }; if (chi) h.Authorization = 'Bearer ' + (chi === 'owner' ? 'owner' : tok(chi.uid, chi.email));
  const r = await fetch(B + perc, { method: metodo, headers: h, body: corpo ? JSON.stringify(campi(corpo)) : undefined });
  return r.status;
}
(async () => {
  if (!fs.existsSync(JAR) || !fs.existsSync(RULES)) { K.riga('B2b-00', '—', '—', 'emulatore/regole', 'disponibili', 'manca ' + (!fs.existsSync(JAR) ? JAR : RULES), 'NON VERIFICATO'); K.riepilogo('ic-01-b2b-regole'); return; }
  const emu = spawn('java', ['-jar', JAR, '--host', '127.0.0.1', '--port', PORT, '--rules', RULES, '--project_id', PJ, '--single_project_mode', 'true'], { stdio: ['ignore', 'pipe', 'pipe'] });
  let pronto = false; emu.stdout.on('data', d => { if (/running|ready/i.test(String(d))) pronto = true; }); emu.stderr.on('data', d => { if (/running|ready/i.test(String(d))) pronto = true; });
  for (let i = 0; i < 60 && !pronto; i++) await K.attesa(500);
  await K.attesa(1500);
  const ADM = { uid: 'ADMIN0001', email: K.ADMIN }, W1 = { uid: 'W1', email: 'w1@prova.it' }, W2 = { uid: 'W2', email: 'w2@prova.it' };
  try {
    /* semi con privilegi (owner = salta le regole) */
    await op('PATCH', 'users/ADMIN0001', 'owner', { role: 'admin', email: K.ADMIN });
    await op('PATCH', 'users/W1', 'owner', { role: 'worker', email: W1.email, name: 'ROSSI MARIO' });
    await op('PATCH', 'users/W2', 'owner', { role: 'worker', email: W2.email, name: 'COLLEGA PIA' });
    await op('PATCH', 'timesheets/W1__2026_10_0', 'owner', { workerUid: 'W1', year: 2026, month: 10 });
    await op('PATCH', 'lightsheets/L1', 'owner', { editorUid: 'W2', name: 'LUCE LIA' });
    await op('PATCH', 'report-ore-mensile/ADMIN0001', 'owner', { v: 'x' });
    const prove = [
      ['B2b-01', 'Dipendenti (admin) scrive residui/W1', 'PATCH', 'residui/W1', ADM, { tetto: 400, usate: 12, restano: 388 }, 200],
      ['B2b-02', 'Fogli ore W1 legge il PROPRIO residuo', 'GET', 'residui/W1', W1, null, 200],
      ['B2b-03', 'Fogli ore W2 legge il residuo di W1 (collega)', 'GET', 'residui/W1', W2, null, 403],
      ['B2b-04', 'Fogli ore W1 scrive il proprio residuo', 'PATCH', 'residui/W1', W1, { restano: 999 }, 403],
      ['B2b-05', 'Dipendenti (admin) cancella residui/W1', 'DELETE', 'residui/W1', ADM, null, 200],
      ['B2b-06', 'Dipendenti/Collaboratori/USOINT «dip» (admin) leggono timesheets altrui', 'GET', 'timesheets/W1__2026_10_0', ADM, null, 200],
      ['B2b-07', 'Collaboratori (admin) legge lightsheets', 'GET', 'lightsheets/L1', ADM, null, 200],
      ['B2b-08', 'USOINT «dip» (admin) legge report-ore-mensile/ADMIN0001', 'GET', 'report-ore-mensile/ADMIN0001', ADM, null, 200],
      ['B2b-09', 'un operatore (W1) legge report-ore-mensile dell\'admin', 'GET', 'report-ore-mensile/ADMIN0001', W1, null, 403],
      ['B2b-10', 'senza accesso: legge residui', 'GET', 'residui/W2', null, null, 403],
      /* chiusura del mese (Fogli ore rev 19 · Dipendenti ver187, 20/11/2026) */
      ['B2b-11', 'Dipendenti (admin) scrive residui/W1 con solo dip:true', 'PATCH', 'residui/W1', ADM, { dip: true, aggiornato: '2026-11-20' }, 200],
      ['B2b-12', 'Fogli ore W1 legge il proprio residuo con dip:true', 'GET', 'residui/W1', W1, null, 200],
      ['B2b-13', 'Fogli ore W1 chiude il proprio mese (meseChiuso, completamento)', 'PATCH', 'timesheets/W1__2026_10_0', W1, { workerUid: 'W1', year: 2026, month: 10, workerConfirmed: true, meseChiuso: true, meseChiusoAt: '2026-12-01T09:00:00Z', completamento: 'si' }, 200],
      ['B2b-14', 'Fogli ore W2 chiude il mese di W1 (collega)', 'PATCH', 'timesheets/W1__2026_10_0', W2, { workerUid: 'W1', meseChiuso: true }, 403],
      ['B2b-15', 'Fogli ore admin riapre il mese di W1', 'PATCH', 'timesheets/W1__2026_10_0', ADM, { workerUid: 'W1', year: 2026, month: 10, workerConfirmed: false, meseChiuso: false }, 200],
      ['B2b-16', 'Fogli ore W2 legge il residuo (dip) di W1', 'GET', 'residui/W1', W2, null, 403]
    ];
    for (const [id, dato, met, perc, chi, corpo, att] of prove) {
      const st = await op(met, perc, chi, corpo);
      K.chk(id, chi ? (chi.uid === 'ADMIN0001' ? 'admin' : chi.uid) : 'anonimo', perc, dato, 'HTTP ' + att, 'HTTP ' + st, st === att);
    }
  } catch (e) { K.riga('B2b-99', '—', '—', 'esecuzione', 'ok', e.message, 'NON VERIFICATO'); }
  emu.kill('SIGTERM');
  K.riepilogo('ic-01-b2b-regole');
})();
