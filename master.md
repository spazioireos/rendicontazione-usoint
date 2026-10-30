# MASTER — Gestionale integrato Spazio Ireos

> Riepilogo generale del sistema. **Vive in questo repository** (`rendicontazione-usoint/master.md`)
> e va aggiornato insieme al codice: vedi §9.
> **Aggiornato: 29 ottobre 2026 (sera)** · Autore: Christian

---

## 1. Obiettivo

Riunire sotto **un unico link** i gestionali interni di Spazio Ireos, senza riscriverli e
lasciando i dati dove sono. Uso personale (solo Christian). In più: far parlare le app tra loro,
così i dati non si inseriscono due volte.

---

## 2. Le quattro app

Organizzazione GitHub: `spazioireos`. Base dei link: `https://spazioireos.github.io/<repo>/`

| App | Repository | Tecnologia | Accesso | Dati |
|---|---|---|---|---|
| **Collaboratori** (Operatori Occasionali) | `ore-e-importi-collaboratori` | JS vanilla | PIN locale | browser (`spazioireos_opoc`) + Google Drive |
| **Dipendenti** (Report Ore mensile) | `ore-mensili-dipendenti` | React + Babel | mail+password (solo admin) | Firebase `spazio-ireos-foglio-ore`, doc `report-ore-mensile/{uid}` |
| **Rendicontazione progetti** (USOINT = "uso interno") | `rendicontazione-usoint` | React minificato + Babel | mail+password | Firebase `rendicontazione-usoint`, `users/{uid}/kv` |
| **Fogli ore** (gli ESTERNI compilano le proprie ore) | `spazioireos-foglio-ore` | JS + template string | mail+password, con RUOLI | Firebase `spazio-ireos-foglio-ore`, collection globali |

**ATTENZIONE: i nomi dei repository non corrispondono in modo intuitivo al contenuto.**
Verificare sempre il `<title>` dentro il file prima di assumere cosa c'è dentro.

**Dipendenti e Fogli ore condividono lo stesso progetto Firebase** (`spazio-ireos-foglio-ore`):
stesso login, collection diverse. È questo che permette il confronto tra le due senza seconde
connessioni. **USOINT ha un progetto separato.** **Collaboratori non usa Firebase.**

Ogni app ha il suo `CLAUDE.md` con le istruzioni di dettaglio (modello dati, trappole, cosa non
toccare): leggere quello prima di lavorarci.

---

## 3. L'APP INTEGRATA — attiva

- **Link unico:** `https://spazioireos.github.io/rendicontazione-usoint/integrata/`
- File `integrata/index.html` in questo repo, su `main`. **Revisione attuale: `rev 3 · 29ott26`.**
- **Quattro pulsanti**: 👥 Collaboratori · 🧑‍💼 Dipendenti · 📊 Rendicontazione progetti · 📋 Fogli ore.
- **Apre i LINK LIVE** delle app, non copie: quando si aggiorna una app, la pagina integrata
  mostra la versione nuova **da sola**. Non va MAI aggiornata per questo motivo.
- La radice `…/rendicontazione-usoint/` resta l'app Rendicontazione singola.
- Il pulsante Fogli ore è solo una **scorciatoia per Christian**: per gli esterni non cambia nulla.

---

## 4. NUMERI DI REVISIONE (visibili in ogni app)

Serve a capire a colpo d'occhio se si sta guardando la versione aggiornata o una copia vecchia
in cache (problema realmente capitato).

| App | Numero attuale | Dove si vede | Da dove viene |
|---|---|---|---|
| App integrata | `rev 3 · 29ott26` | barra in alto | scritto nel file |
| Collaboratori | `rev 1 · 29ott26` | copertina + schermata PIN (`.revtag`) | scritto nel file |
| Dipendenti | `ver61 · 29ott26` | testata, tutte le viste (`.app-rev`) | costanti `APP_VER` + `APP_DATA` |
| Rendicontazione USOINT | `ver118 · 29ott26` | Home, scheda progetto, Riepilogo operatori | costante `VER` |
| Fogli ore | `rev 2 · 30ott26` | angolo in basso a destra, ogni schermata | scritto nel file |

**Criterio:** dove l'app aveva già una numerazione (USOINT `ver`, Dipendenti `APP_VER`) si usa e
si incrementa **quella**; dove non c'era si è partiti da `rev 1`. **Mai due numerazioni nella
stessa app.** In USOINT e Dipendenti il numero finisce anche nei nomi dei file esportati.

---

## 5. Lavori fatti e attivi

- **App integrata** (§3): quattro pulsanti, link live, revisione visibile.
- **Dipendenti**, su `main`:
  - **targhetta ORE MESE** accanto a ORE SETT nella testata di ogni scheda lavoratore. Usa la
    funzione già esistente `monteFissoMese()` (165 h per 38 h/sett, riproporzionato), quindi
    coerente con la base della Banca ore; segue orari temporanei e trasformazioni.
  - **confronto non vincolante con Fogli ore**: nella vista mensile, per ogni dipendente abbinato
    per COGNOME NOME, un riquadro ambra se le ore inserite a mano non combaciano con quelle
    compilate in Fogli ore ("tu: X h · Fogli ore: Y h") e l'elenco dei giorni con assenza
    discordante. Solo lettura, solo avviso, ignorabile.
- **Numeri di revisione** in tutte le app (§4).
- **`CLAUDE.md`** in tutti e quattro i repository (§8).

---

## 6. DA PROVARE — pronto sul ramo di prova

Ramo usato in tutti i repo: **`claude/integrated-app-feasibility-8d1wg0`**

**USOINT — import automatico ore + tabella compatta** (ramo `82b0fe3`):
- **Import automatico** (SOLA LETTURA) delle ore lavorate dei dipendenti: USOINT apre una
  **seconda app Firebase** ("dip") verso `spazio-ireos-foglio-ore`, legge il totale mensile di ore
  lavorate di ogni persona e riempie da sé la tabella `usoint-orelav`. Serve **un collegamento
  una tantum** (login mail+password del gestionale Dipendenti) tramite il riquadro
  "🔗 Collega il gestionale Dipendenti" nel Riepilogo operatori; poi è automatico.
- **Fonte del dato:** la tabella "Riepilogo per mese — ore lavorate" dei Dipendenti (ore
  effettivamente lavorate, assenze escluse).
- **Tabella compatta** nella scheda operatore, che **sostituisce** i tre riquadri precedenti:
  `Mese | Lavorate (Dipendenti) | una colonna per progetto | Tot. rendicontate | Avanzo`,
  con selettore anno e riga TOTALE. La colonna Lavorate resta modificabile a mano.
- **Avanzo = Lavorate − Tot. rendicontate** = il monte ore residuo, che scende man mano che si
  rendiconta. Positivo arancio, negativo rosso, zero grigio.
- Scelte confermate: un anno alla volta; il menu "Tutti i progetti / singolo progetto" non filtra
  più questa tabella (vale ancora per export Excel e simulatore).

---

## 7. REGOLE DI LAVORO

### 7.1 Un solo "padrone" per ogni file
Le aggiunte vivono **dentro** `index.html`. Se due posti riscrivono lo stesso file, l'ultimo
cancella il lavoro dell'altro. **Decisione del 29/10/2026: le modifiche le chiede Christian a
Claude**, che lavora direttamente sul repository. Non usare altre chat per *generare il file da
caricare*.

### 7.2 Il rischio del "Add files via upload"
Quel metodo **sostituisce** il file: caricare un `index.html` preso dal computer, privo delle
aggiunte fatte sul repository, **le cancella**. Se si carica a mano: scaricare prima da GitHub
("Download raw file"), modificare quello, poi ricaricare.

### 7.3 Claude non sorveglia i repository
**Claude non viene avvisato** dei caricamenti di Christian. Se Christian carica qualcosa, **deve
dirlo**. All'inizio di ogni sessione Claude verifica se i rami sono rimasti indietro rispetto a
`main` e li riallinea prima di lavorare.

### 7.4 Incidenti già avvenuti (da non ripetere)
- **27/10** USOINT: due caricamenti su `main` (funzione "Spalma", ver117) non erano nel ramo:
  unire così com'era avrebbe **cancellato quel lavoro**. Risolto riallineando.
- **28/10** Dipendenti: ramo indietro di **5 caricamenti**; la funzione di confronto, scritta
  sulla versione del 17/10, è stata **buttata e riscritta** sul codice nuovo.
- **28/10** Dipendenti: un errore sul percorso dei dati (`snap.data().state` invece di
  `snap.data()`) era passato ai test e trovato solo **rileggendo il codice**.

### 7.5 Metodo di Claude
1. Costruire sempre sul **ramo di prova**, mai direttamente su `main`.
2. **Verificare**: ricompilare il blocco `<script type="text/babel">` con Babel preset-react +
   `node --check` (app React), o `node --check` sul blocco `<script>` (app vanilla); e **rileggere
   il codice inserito**, non fidarsi solo dei test.
3. Portare su `main` solo al "porta su main" di Christian.
4. Per provare un ramo: GitHub → repo → Settings → Pages → branch = ramo → Save; refresh forzato
   (Ctrl/Cmd+Shift+R); a prova finita rimettere Pages su `main`.

---

## 8. `CLAUDE.md`: le istruzioni dentro ogni app

In ognuno dei quattro repository c'è un `CLAUDE.md` che Claude **legge automaticamente** all'avvio
di una sessione su quel repo. Contiene: cosa fa l'app, il suo modello dati con le trappole già
costate errori, cosa non toccare, come verificare prima di committare, il numero di revisione
attuale e le regole di §7. **È il posto giusto per le istruzioni tecniche**: non va incollato né
ricordato da Christian.

La knowledge di progetto su claude.ai (knp) serve invece per le chat normali, dove Claude non ha
accesso ai repository: lì va messo questo `master.md`.

**Dal 30/10/2026 ogni `CLAUDE.md` contiene anche il §10 "COMANDO PERMANENTE DI CHRISTIAN"**: il
comando dato in chat quel giorno, scritto identico in tutti e quattro i repository. In sintesi:
lavorare da ingegnere senior responsabile della qualità e della stabilità; modifiche circoscritte
a ciò che è stato chiesto, nessun miglioramento non richiesto; caccia attiva alle regressioni con
test ripetuti anche sulle parti preesistenti; salvataggio solo manuale e dati sempre
recuperabili (backup JSON con versione di schema, conferme sulle eliminazioni, nessun dato
personale su Pages senza protezione); nulla osta e anteprima PNG prima di consegnare;
distinguere sempre test superato / test fallito / test non eseguito / verifica solo teorica e
non dichiarare stabile una versione non verificata. Il testo integrale è nel §10 di ciascun
`CLAUDE.md`.

---

## 9. REGOLA ANTI-DOCUMENTI-VECCHI

Un documento invecchia nell'istante in cui si cambia il codice. Quindi **ogni modifica a una app
include, nello stesso commit**:
1. l'**incremento del numero di revisione** mostrato nell'app (e della data);
2. l'**aggiornamento del `CLAUDE.md`** di quella app, se cambia qualcosa che vi è descritto;
3. l'**aggiornamento di questo `master.md`**.

Una modifica committata senza questi tre aggiornamenti lascia documentazione che mente, ed è
peggio di non averla.

---

## 10. Decisioni prese

- **Login: si lasciano come sono.** Un login unico per tutte richiederebbe stesso progetto
  Firebase + **migrazione dati** (delicata) e passaggi in console Firebase. Rimandato: gli accessi
  restano memorizzati, la frizione è bassa.
- **Fogli ore**: esclusa come sezione di lavoro dell'app integrata (è l'app degli esterni);
  presente solo come **scorciatoia** (quarto pulsante).
- La pagina integrata **apre link live**, non copie.
- Avanzo a zero = **grigio**.
- **La pagina integrata resta dentro il repo `rendicontazione-usoint`** (decisione di Christian del
  30/10/2026). Spostarla in un repository suo cambierebbe l'indirizzo usato ogni giorno: idea
  **scartata**, non riproporla. L'hub NON è l'app USOINT: è `integrata/`, una stanza separata
  dentro lo stesso magazzino.
- **Punti di ripristino**: in ogni repository c'è il ramo `stabile-30ott26` con la versione buona
  del 30/10/2026 (le etichette di versione "tag" sono rifiutate da GitHub a Claude: errore 403).

---

## 11. Modelli dati (sintesi; il dettaglio è nei `CLAUDE.md`)

**Fogli ore** (`spazio-ireos-foglio-ore`) — riverificato 29/10, struttura invariata:
`users` (doc-id uid; `cognome`, `nome`, `name` "COGNOME NOME", `role` admin/worker/editor/viewer/
disabled; compilano worker ed editor) · `timesheets` (doc-id `<uid>__<anno>_<mese>_<serviceIdx>`,
mese 1-12, serviceIdx 0-19 → **più documenti per mese, da sommare**; campi `workerUid`, `year`,
`month`, `days`) · `days` = mappa giorno → entry con fasce `t1f/t1t`…`t4f/t4t`, `iF/iT`, `iF2/iT2`,
più `absence`, `perm`, `spole`, `pausa`, `nonImp` (questi 4 non sono ore).
⚠️ **Le ore si calcolano dagli orari "HH:MM"**, con formati storici (`900`, `130`, `14.30`, `9`):
un parser rigido conta meno ore del vero. ⚠️ **Un'assenza è scritta su tutti i servizi del giorno**:
contarla una volta sola. Assenze: FERIE, MALATTIA, MALATTIA FIGLIO, PERM. ELETTORALE, PERM. LUTTO,
ALTRO AUTORIZ. → 0 ore. Gli **operatori "light"** (`lightsheets`) non stanno in `timesheets`.

**Dipendenti** (doc `report-ore-mensile/{uid}`): ⚠️ i campi stanno al **PRIMO LIVELLO** del
documento, NON dentro `state`. `dipendenti[]` = `{id, nome "COGNOME NOME"}`;
`dati["YYYY-MM"][dipId].giorni` = giorno → NUMERO (ore) oppure STRINGA-codice (assenza = 0 ore,
codici in `CODICI`/`CODE_SET`). Totale mese = `totOfRec(rec,y,m)`.

**USOINT** (`users/{uid}/kv/<chiave>`): `usoint-orelav` = `{ [norm(nome)]: { [anno]: [12 numeri] } }`
(ore lavorate, indice 0 = gennaio; `norm` = minuscolo/trim/spazi singoli) · ore rendicontate in
`agg.data[k].years[anno][mese]` e `agg.data[k].prjM[progetto][anno][mese]` (mese 0-based) ·
`usoint-idx`, `usoint-p-<id>`, `usoint-tariffe`, `usoint-simul`.

---

## 12. Limiti noti

1. **Permessi Firestore**: i collegamenti tra app leggono dati di un altro ambito. Se le regole
   non consentono la lettura all'account admin, compare solo una nota ("non disponibile
   (permessi)") e nulla si rompe: serve una modifica nella console Firebase. **Verificato il
   30/10/2026 con l'emulatore ufficiale**: l'account admin PUÒ leggere `users` e `timesheets`
   anche con le query a elenco, quindi il confronto Dipendenti ↔ Fogli ore ha i permessi che gli
   servono.
2. **Abbinamento solo per nome**: non c'è un codice fiscale condiviso; i nomi devono essere scritti
   uguali (maiuscole e spazi non contano). Dove differiscono, l'abbinamento salta **in silenzio**.
3. **Sicurezza del progetto degli esterni — VERIFICATA il 30/10/2026**: la registrazione è
   aperta e i dati stanno in collection globali, quindi tutto dipende dalle regole Firestore.
   Le regole allora pubblicate avevano **due falle dimostrate** con l'emulatore ufficiale: un
   operatore poteva scrivere (e per quella via leggere) il foglio ore di un collega, e chiunque
   si registrasse poteva crearsi il documento utente con `role:"admin"`. Testo corretto, prova
   automatica da 39 controlli e cronaca completa in **`regole-firestore/`** del repo
   `spazioireos-foglio-ore`. **Le regole si pubblicano a mano in console Firebase**: Claude non
   ha accesso, quindi quel passaggio è sempre di Christian. Restano aperte per scelta: blocco
   mese (`locks`) e ruolo `disabled` non imposti dal database, creazione libera dei documenti
   `lightsheets`.
4. Le funzioni nuove **non sono provate su dati veri**: le prove di Christian sono quelle che contano.
5. **Fogli ore su telefono/tablet**: con la rev 2 del 30/10/2026 la colonna del giorno resta ferma
   mentre si scorre di lato e lo zoom con due dita è tornato possibile. Restano **non risolti**:
   la tabella del mese è larga 906px con 36 colonne (su un telefono se ne vede meno della metà);
   116 scritte sono sotto i 12px e 406 bersagli da toccare sono sotto i 32px; bloccare in alto
   tutto il capo-tabella non è possibile senza cambiare come scorre la pagina (provato con
   l'emulatore e fallito).

---

## 13. Prossimi passi

1. **Provare USOINT** (ramo) → al "porta su main" diventa attiva.
2. Eventuale **login unico** su tutte le app (rimandato, §10).
3. Eventuale verifica delle **regole di sicurezza Firestore** dell'app degli esterni.

---

## 14. Prompt di ripartenza (per una chat nuova senza accesso ai repository)

> Gestionale integrato Spazio Ireos, org GitHub `spazioireos`, tutto su GitHub Pages. Quattro app:
> **Collaboratori** = `ore-e-importi-collaboratori`; **Dipendenti** (Report Ore mensile) =
> `ore-mensili-dipendenti`; **Rendicontazione USOINT** = `rendicontazione-usoint`; **Fogli ore**
> (esterni) = `spazioireos-foglio-ore`. I nomi dei repo NON corrispondono in modo intuitivo al
> contenuto: verificare il `<title>`. In ogni repo c'è un `CLAUDE.md` con le istruzioni di quella
> app, e in `rendicontazione-usoint` c'è `master.md` (questo documento): leggerli prima di agire.
> ATTIVO: pagina integrata `integrata/index.html` (link
> `https://spazioireos.github.io/rendicontazione-usoint/integrata/`, rev 3) con quattro pulsanti che
> aprono i LINK LIVE; nei Dipendenti la targhetta ORE MESE e l'avviso di confronto con Fogli ore;
> numero di revisione visibile in tutte le app.
> DA PROVARE sul ramo `claude/integrated-app-feasibility-8d1wg0`: in USOINT l'import automatico in
> sola lettura delle ore lavorate dal database dei Dipendenti + la tabella compatta della scheda
> operatore.
> REGOLE: le modifiche le fa Claude sul repository; NON generare file da caricare a mano ("Add files
> via upload" sovrascrive e cancella); Claude non è avvisato dei caricamenti di Christian, che deve
> dirlo; si lavora su ramo di prova e si va su `main` solo al "porta su main"; ogni modifica
> aggiorna numero di revisione, `CLAUDE.md` e `master.md`. Preferenze: rispondere in chat, non
> narrare i passaggi, Nu* prima di costruire.
> SICUREZZA: le regole Firestore del progetto degli esterni e la loro prova automatica stanno in
> `regole-firestore/` del repo `spazioireos-foglio-ore`; due falle trovate e corrette il
> 30/10/2026, da pubblicare in console (lo fa Christian, Claude non ha accesso).
> COMANDO PERMANENTE del 30/10/2026: sta nel §10 di ogni `CLAUDE.md` (ruolo da ingegnere senior
> responsabile di qualità e stabilità, modifiche circoscritte, caccia alle regressioni, sicurezza
> e recuperabilità dei dati, nulla osta con anteprima, divieto di consegnare una versione non
> verificata).
