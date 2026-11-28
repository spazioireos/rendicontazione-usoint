// Collaudo individuale Livello A — USOINT (dalla ver138; targhetta letta dal file): funzioni comuni agli script uso-a01-*.cjs
// SOLO DATI INVENTATI (repository pubblico). Banco: collaudo/comune (finta Firebase), porta 8340.
const { chromium } = require('playwright');
/* targhetta letta dal file dell'app (non scritta a mano: non invecchia a ogni versione) */
const SRC = require('fs').readFileSync(require('path').join(__dirname, '..', 'index.html'), 'utf8');
const VER = (SRC.match(/const VER="(ver\d+)"/) || [])[1];
const DATA = (SRC.match(/\{VER\} · (\d{2}[a-z]{3}\d{2})/) || [])[1];
const TARGA = VER + ' · ' + DATA;
const PORTA = process.env.PORTA || '8340';
const BASE = 'http://127.0.0.1:' + PORTA + '/';
const USO = 'rendicontazione-usoint', FO = 'spazio-ireos-foglio-ore';
const MAIL = 'uso@prova.it', PWD = 'prova123', UID = 'USO0001';
const ADMIN = 'spazioireos@gmail.com', DUID = 'ADMIN0001';

let OK = 0, KO = 0; const RIGHE = [];
function c(id, funz, atteso, effettivo, cond, stato) {
  const st = stato || (cond ? 'SUPERATO' : 'FALLITO');
  if (st === 'SUPERATO') OK++; else if (st === 'FALLITO') KO++;
  const r = `${id} | ${funz} | atteso: ${atteso} | effettivo: ${String(effettivo).slice(0, 220)} | ${st}`;
  RIGHE.push(r); console.log((st === 'SUPERATO' ? 'OK  ' : st === 'FALLITO' ? 'KO  ' : '..  ') + r);
}
function fine(nome) { console.log(`\n=== ${nome}: ${OK} superati, ${KO} falliti, ${RIGHE.length} righe ===`); return { ok: OK, ko: KO }; }

/* ------- progetti di prova ------- */
function zeri(n) { return Array(n).fill(0); }
function mesi(n) { return Array.from({ length: n }, () => Array(12).fill(0)); }
function pers(nY, o) { return Object.assign({ nome: '', voce: '', inq: '', oreT: 0, eur: 0, cofin: 0, aOre: zeri(nY), aElim: zeri(nY), cessato: '', subentro: '', eurA: zeri(nY), ricevute: 0, budgetRic: 0, recBlk: [], md: mesi(nY) }, o || {}); }
function bene(nY, o) { return Object.assign({ voce: '', forf: 0, cofin: 0, aImp: zeri(nY), aElim: zeri(nY), cessato: '', ricevute: 0, budgetRic: 0, recBlk: [], md: mesi(nY) }, o || {}); }
function prog(id, title, start, end, nY, o) { return Object.assign({ id, title, start, end, vincolo: false, colore: '#118AB2', cadMesi: 3, personnel: [pers(nY)], beni: [bene(nY)], fatture: [], propag: [] }, o || {}); }
function kvDocs(uid, kv) { const d = {}; Object.keys(kv).forEach(k => { d[`users/${uid}/kv/${k}`] = { v: typeof kv[k] === 'string' ? kv[k] : JSON.stringify(kv[k]) }; }); return d; }

/* ------- browser ------- */
let BROWSER = null;
async function browser() { if (!BROWSER) BROWSER = await chromium.launch(); return BROWSER; }
async function chiudi() { if (BROWSER) await BROWSER.close(); }

/* nuovo contesto: seme {kv, dip:{doc}, sessione:true/false, cfg}, viewport */
async function contesto(opz) {
  opz = opz || {};
  const b = await browser();
  const ctx = await b.newContext(Object.assign({ viewport: opz.viewport || { width: 1280, height: 900 }, acceptDownloads: true, deviceScaleFactor: opz.dsf || 1 }, opz.tz ? { timezoneId: opz.tz } : {}));
  const esterni = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (u.startsWith(BASE) || u.startsWith('data:') || u.startsWith('blob:') || u === 'about:blank') return r.continue(); esterni.push(u); return r.abort(); });
  const seed = { id: opz.id || ('s' + Date.now() + Math.random()) };
  seed[USO] = { reset: true, resetUsers: true, users: [{ email: MAIL, password: PWD, uid: UID }].concat(opz.altriUtenti || []), docs: kvDocs(UID, opz.kv || {}) };
  if (opz.sessione !== false) seed[USO].session = { email: MAIL, app: '[DEFAULT]' };
  seed[FO] = { reset: true, resetUsers: true, users: [{ email: ADMIN, password: PWD, uid: DUID }], docs: {} };
  if (opz.dip) { seed[FO].docs['report-ore-mensile/' + DUID] = opz.dip; }
  if (opz.dipSessione !== false && opz.dip !== undefined) seed[FO].session = { email: ADMIN, app: 'dip' };
  if (opz.cfg) seed.cfg = opz.cfg;
  await ctx.addInitScript(s => { window.__FAKEFB_SEED__ = s; }, seed);
  return { ctx, esterni };
}
/* pagina con raccolta errori e dialoghi (coda di risposte) */
async function pagina(ctx, opz) {
  const page = await ctx.newPage();
  const T = { page, errori: [], dialoghi: [], risposte: [] };
  page.on('pageerror', e => T.errori.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Firebase write er|Firebase delete error|Sync error|Riprova sospese|Ripristino: scrittura/.test(m.text())) T.errori.push('console: ' + m.text().slice(0, 200)); });
  page.on('dialog', async d => {
    const msg = d.message(); T.dialoghi.push({ tipo: d.type(), msg });
    let r = null; const i = T.risposte.findIndex(x => !x.re || x.re.test(msg));
    if (i >= 0) { r = T.risposte[i]; T.risposte.splice(i, 1); }
    if (d.type() === 'prompt') { if (r && r.dismiss) return d.dismiss(); return d.accept(r && r.text != null ? r.text : d.defaultValue()); }
    if (r && r.dismiss) return d.dismiss(); return d.accept();
  });
  return T;
}
async function apriUso(T, attesa) {
  await T.page.goto(BASE + 'uso/index.html');
  await T.page.waitForFunction(() => /I tuoi Progetti|Accedi con email/.test(document.body.innerText), null, { timeout: 30000 }).catch(() => {});
  if (attesa !== false) await T.page.waitForTimeout(300);
}
async function testo(T) { for (let i = 0; i < 20; i++) { try { return await T.page.evaluate(() => document.body ? document.body.innerText : ''); } catch (e) { await T.page.waitForTimeout(250); } } return ''; }
async function ls(T, k) { return T.page.evaluate(k => localStorage.getItem(k), k); }
async function cloud(T, k) { return T.page.evaluate(([p, path]) => { const v = window.__fakefb.get(p, path); return v ? v.v : null; }, [USO, `users/${UID}/kv/${k}`]); }
async function aspetta(T, ms) { await T.page.waitForTimeout(ms); }
async function cliccaTesto(T, sel, txt, idx) { const l = T.page.locator(sel, { hasText: txt }); const n = await l.count(); if (!n) return false; await l.nth(idx || 0).click(); return true; }
async function apriProgetto(T, titolo) {
  await T.page.locator('div', { hasText: titolo }).filter({ has: T.page.locator('button', { hasText: 'Duplica' }) }).last().locator('div').first().click();
  await T.page.waitForFunction(() => /BUDGET\/PREVENTIVO|Torna a budget/.test(document.body.innerText), null, { timeout: 15000 }).catch(() => {});
  await aspetta(T, 300);
}
function err(T) { return T.errori; }

module.exports = { VER, DATA, TARGA, c, fine, pers, bene, prog, kvDocs, contesto, pagina, apriUso, testo, ls, cloud, aspetta, cliccaTesto, apriProgetto, err, chiudi, browser, BASE, USO, FO, MAIL, PWD, UID, ADMIN, DUID, RIGHE, mesi, zeri };
