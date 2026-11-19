# Banco di prova COMUNE (finta Firebase) — Fogli ore · Collaboratori · Dipendenti · USOINT · pagina integrata

⚠️ **SOLO DATI INVENTATI**: il repository è pubblico. I dati veri stanno solo nella cartella privata di Google Drive
«Dati collaudo Spazio Ireos» e non si copiano mai qui (né negli script, né nei semi).

## Come si usa

```bash
bash collaudo/comune/prepara-comune.sh            # porta 8340 (oppure: ... prepara-comune.sh 8350)
node collaudo/comune/prova-banco.cjs              # prova di fumo (se manca playwright: NODE_PATH=/opt/node-tools/node_modules)
```

`prepara-comune.sh` installa le librerie (npm, in `.strumenti/`), copia i cinque `index.html` dai quattro repository
(cartelle sorelle; si possono cambiare con `FO_REPO`, `COL_REPO`, `DIP_REPO`, `USO_REPO`), li **localizza** con
`localizza.py` dentro `.banco/{fo,col,dip,uso,integrata}/` e li serve **tutti sulla stessa origine**
`http://127.0.0.1:8340/`. ⚠️ **Va rieseguito dopo OGNI modifica a un index.html** (il server, se risponde, resta acceso).
`.strumenti/`, `.banco/` e `out/` **non si salvano** (`.gitignore`).

Che cosa fa `localizza.py` (non tocca mai gli originali):
- le `<script src="https://…">` diventano le stesse librerie in locale (`../lib/`): react 18.2.0, babel 7.24.0 (Dipendenti)
  e 7.23.9 (USOINT), xlsx 0.20.1 (Fogli ore) e 0.18.5 (Collaboratori), xlsx-js-style 1.2.0, jszip 3.10.1, jspdf 2.5.1,
  autotable 3.8.2;
- le **tre** script di Firebase diventano **una** sola `../lib/fakefb.js`. ⚠️ Dipendenti gira con la finta Firebase
  (`FB_READY` resta vero, si entra con mail+password): per la modalità locale con PIN c'è il suo banco
  (`ore-mensili-dipendenti/collaudo/`);
- **tolti**: Google Identity (`accounts.google.com/gsi/client`, backup su Drive di Collaboratori: l'app dice «Google non
  ancora caricato») e i caratteri di Google (`<link>` e `@import`): si vede il carattere di riserva;
- pagina integrata: i link live `https://spazioireos.github.io/<repo>/` diventano `../fo/ ../col/ ../dip/ ../uso/`;
- alla fine controlla che non resti nessun url esterno di script/stili, altrimenti esce con errore.

## La finta Firebase (`fakefb.js`)

Database **per progetto** (`spazio-ireos-foglio-ore`, `rendicontazione-usoint`) in `localStorage["__fakefb__<projectId>"]`,
riletto a ogni operazione: le app sulla stessa origine (anche dentro l'iframe della pagina integrata, e due schede)
vedono le stesse scritture, e i dati restano al ricaricamento. Utenti in `__fakefb_auth__<projectId>`, sessione per
**progetto + nome dell'app** (`__fakefb_sess__<projectId>__<nome>`), come Firebase vero: la sessione di Dipendenti
(`[DEFAULT]`) **non** è quella dell'app «dip» di USOINT né di «fogliore» di Collaboratori.

Comandi da un test (`window.__fakefb`, oppure prima del caricamento con `page.addInitScript`):

```js
await ctx.addInitScript(s => { window.__FAKEFB_SEED__ = s; }, {
  id: 'prova-1',                                   // con id la semina si applica UNA volta (non a ogni ricarica)
  'spazio-ireos-foglio-ore': { reset: true,
    users: [{ email: 'spazioireos@gmail.com', password: 'prova123', uid: 'ADMIN0001' }],
    docs: { 'users/ADMIN0001': { role: 'admin', name: 'AMMINISTRAZIONE PROVA', email: 'spazioireos@gmail.com' } },
    session: { email: 'spazioireos@gmail.com', app: '[DEFAULT]' } } });   // facoltativo: entra senza login
await ctx.addInitScript(() => { window.__fakefb = { failWrites: true }; });   // flag fin dal caricamento
await page.evaluate(() => { __fakefb.failWrites = false; __fakefb.delayMs = 2000;
  __fakefb.deny = [{ project: 'spazio-ireos-foglio-ore', coll: 'residui', op: 'write' }]; });
const db = await page.evaluate(() => __fakefb.dump('spazio-ireos-foglio-ore'));   // {percorso: dati}
const scritture = await page.evaluate(() => __fakefb.log.filter(o => /set|update|delete|batch/.test(o.op)));
```

- guasti: `failWrites` / `failReads` (code `unavailable`, «Failed to get document because the client is offline.»),
  `failAuth` (`auth/network-request-failed`), `delayMs` / `readDelayMs` / `writeDelayMs` / `authDelayMs`;
  `__fakefb.setCfg({...})` li mette in `localStorage` (valgono per tutte le finestre e i ricaricamenti), `clearCfg()` li toglie;
- regole: `deny:[{project?, coll|path|re, op:'read'|'write'|'*'}]` → `permission-denied`; `requireAuth:true`;
- servizio: `seed(p,{percorso:dati|null})`, `get(p,percorso)`, `dump(p)`, `reset(p,{utenti:true})`, `addUser(p,{…})`,
  `users(p)`, `login(p,email,nomeApp)`, `logout(p,nomeApp)`, `apps()`, `mails`, `log` (`persistLog:true` lo copia in
  `localStorage["__fakefb_log__"]`). Timestamp nei semi: `{"__ts": millisecondi}`.

## Limiti da sapere

- Niente regole di sicurezza vere (per quelle c'è l'emulatore in `spazioireos-foglio-ore/regole-firestore/`): di serie
  **tutto è permesso a tutti**, anche senza login, salvo `deny`/`requireAuth`.
- `failWrites` fa **rifiutare** la scrittura; Firestore vero con la linea caduta di solito la tiene in attesa.
  Niente cache offline: con `failReads` le letture falliscono (Firestore vero risponderebbe dalla cache).
- `onSnapshot` c'è ma è semplificato (rilegge tutto a ogni scrittura); `startAt/startAfter/endAt` sono ignorati;
  `orderBy` usa un ordine semplificato fra tipi diversi.
- `strict` (di serie): rifiuta come Firebase `undefined`, array annidati, documenti oltre 1 MiB, batch oltre 500
  scritture, `in` oltre 30 valori; `update` su documento inesistente → `not-found`.
- Errori di login come Firebase 10 con protezione dell'enumerazione: `auth/invalid-credential`
  (`authErrors:'vecchi'` per `user-not-found`/`wrong-password`). `sendPasswordResetEmail` non manda niente: finisce in `mails`.
- Il database sta in `localStorage` della pagina: un contesto Playwright nuovo parte vuoto; un'app che cancellasse
  tutto `localStorage` cancellerebbe anche il database finto (oggi nessuna lo fa).
