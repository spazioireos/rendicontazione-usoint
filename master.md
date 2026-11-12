# MASTER — Gestionale integrato Spazio Ireos

> Riepilogo generale del sistema. **Vive in questo repository** (`rendicontazione-usoint/master.md`)
> e va aggiornato insieme al codice: vedi §9.
> **Aggiornato: 2 novembre 2026** · Autore: Christian

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
- File `integrata/index.html` in questo repo, su `main`. **Revisione attuale: `rev 6 · 08nov26`.**
- **Quattro pulsanti**: 👥 Collaboratori · 🧑‍💼 Dipendenti · 📊 Rendicontazione progetti · 📋 Fogli ore.
- **Apre i LINK LIVE** delle app, non copie: quando si aggiorna una app, la pagina integrata
  mostra la versione nuova **da sola**. Non va MAI aggiornata per questo motivo.
- 🔄 **Da rev 5 (05/11/2026) l'app arriva sempre fresca.** Prima l'indirizzo dentro la finestra
  interna era sempre identico e il browser serviva la **copia in memoria**: il 05/11 Christian
  vedeva ancora la ver90 mentre su Pages c'era la ver92, e ricaricare la pagina integrata non
  bastava. Ora all'indirizzo si aggiunge un codice che cambia a ogni apertura.
  ⚠️ Accesso Firebase, PIN e dati salvati nel browser **non cambiano** (l'indirizzo di base è lo
  stesso); si riscarica solo il file dell'app, non le librerie. Ripremere il pulsante della
  sezione già aperta **non ricarica**, per non perdere modifiche non salvate.
- La radice `…/rendicontazione-usoint/` resta l'app Rendicontazione singola.
- Il pulsante Fogli ore è solo una **scorciatoia per Christian**: per gli esterni non cambia nulla.

---

## 4. NUMERI DI REVISIONE (visibili in ogni app)

Serve a capire a colpo d'occhio se si sta guardando la versione aggiornata o una copia vecchia
in cache (problema realmente capitato).

| App | Numero attuale | Dove si vede | Da dove viene |
|---|---|---|---|
| App integrata | `rev 6 · 08nov26` | barra in alto | scritto nel file |
| Collaboratori | `rev 17 · 12nov26` | copertina + schermata PIN (`.revtag`) | scritto nel file |
| Dipendenti | `ver161 · 12nov26` | testata, tutte le viste (`.app-rev`) | costanti `APP_VER` + `APP_DATA` |
| Rendicontazione USOINT | `ver137 · 12nov26` | Home, scheda progetto, Riepilogo operatori | costante `VER` |
| Fogli ore | `rev 17 · 12nov26` | angolo in basso a destra, ogni schermata | scritto nel file |

**Criterio:** dove l'app aveva già una numerazione (USOINT `ver`, Dipendenti `APP_VER`) si usa e
si incrementa **quella**; dove non c'era si è partiti da `rev 1`. **Mai due numerazioni nella
stessa app.** In USOINT e Dipendenti il numero finisce anche nei nomi dei file esportati.

---

## 5. Lavori fatti e attivi

### 5.0-septies DIPENDENTI ver161 — IL TFR ANNO PER ANNO (12/11/2026)

Idea di Christian: «e se io inserissi il tfr ogni anno (una cella per ogni anno dal 31/12/24)
così non modifico ogni volta?», poi «**ok il TFR per anno con la decisione sull'ISTAT**».

🔑 **Non era solo comodità.** La rivalutazione si calcola sul fondo al **31/12 dell'anno
precedente** al periodo: con una casella sola, chiedendo il costo di un anno passato l'app usava
comunque il numero scritto — dalla ver114 avvisava, ma **il risultato restava errato**. Ora in
ANAGRAFICA → *Costo del lavoro* c'è un **elenco con una riga per anno** e l'app sceglie da sé.
L'**ISTAT** ha preso la stessa strada fra i valori comuni, altrimenti si sarebbe usato il fondo
giusto con la percentuale sbagliata.

⚠️ **Finché i due elenchi sono vuoti non cambia niente**: valgono le caselle di prima, e le
vecchie **restano scrivibili** (quando l'elenco è in uso dichiarano di non valere più).
⚠️ Se l'elenco c'è ma **manca l'anno** che serve, il conto ricade sulla **stima** e lo dice.
⚠️ Il numero di schema del backup **non cambia**: sono due campi facoltativi in più.

🐞 **Un difetto mio, trovato dalla prova**: col periodo tagliato in pezzi la nota scriveva
«ISTAT 0,00%» mentre il conto usava la percentuale giusta — la somma dei pezzi ricostruisce il
risultato dai soli **importi**. È lo stesso errore della **ver136** con `divNonValidi`.

**Provato in esecuzione**: `ver161.cjs` **28 su 28**, zero errori di pagina, e con gli elenchi
vuoti i dipendenti veri danno numeri **identici** alla ver160.

---

### 5.0-sexies-bis SECONDO GIRO DELLO STESSO GIORNO, SULLA ver161, CON LE PROVE RIPETUTE

La sera del 12/11, pubblicata la **ver161** di Dipendenti, Christian ha chiesto un nuovo
collaudo integrale e ha dettato i **princìpi** che da qui in avanti valgono per ogni collaudo:

> Nessuna promozione senza prova · Prove ripetute (le operazioni critiche ripetute più volte
> devono dare sempre lo stesso risultato) · Prove incrociate (un dato inserito in una webapp va
> verificato in tutte quelle che devono riceverlo) · Verifica prima e dopo · Casi limite ·
> Retest obbligatorio · Evidenze · Nessuna supposizione (ciò che non si prova è NON VERIFICATO).
> **Non basta che una funzione funzioni una volta: deve funzionare anche dopo ripetizioni,
> modifiche e interazioni con le altre webapp.**

Versioni collaudate: **Dipendenti ver161 · Fogli ore rev 17 · Collaboratori rev 17 ·
USOINT ver137 · pagina integrata rev 6**, tutte già su `main` e su Pages.

**Livello A** (ogni app da sola): Fogli ore 33 script **595/0** · Collaboratori 26 script
**524/0** (1 NON VERIFICATO dichiarato: il `.docx` vero) · Dipendenti 26 script **659/5** ·
USOINT 25 script **516/1**. I sei falliti sono **gli stessi di sempre**: cinque attese sbagliate
dei miei script su Dipendenti e, su USOINT, l'errore di pagina della **ver128** usata come
termine di confronto (riprovato in isolamento: «client is offline», della versione vecchia).
⚠️ `mxus-A`, che in fila con gli altri perdeva un controllo, stavolta ha fatto **47/0**.

**Livello B** (il gestionale come sistema): interconnessioni e flussi completi 20 script
**370/0** · pagina integrata VERA in rete **16/16** · regole Firestore (emulatore ufficiale)
**60/60** · sito pubblicato **identico byte per byte** ai repository, **5 pagine su 5** ·
prestazioni misurate sul sito vero (integrata 0,37 s · Collaboratori 0,74 s · Fogli ore 0,75 s
· Dipendenti 3,28 s · USOINT 4,79 s).

**Il livello nuovo — le PROVE RIPETUTE** (5 script, **54 controlli su 54**):

| script | che cosa ripete | esito |
|---|---|--:|
| `pr-dip` | 3 cicli scrivi→💾→ricarica sulla stessa cella (6,5·7,25·6,5): il 3° riporta i dati **identici byte per byte** al 1°; il Costo orario letto 3 volte alternando 2026/2025; doppio clic sul 💾 | **12/12** |
| `pr-fo` | 3 cicli orario→salvataggio→ricarica; l'assenza messa e tolta **2 volte** (sempre su tutti i servizi, sempre via da tutti) | **11/11** |
| `pr-op` | 3 cicli ore→✔ Salva→ricarica; la conversione ore↔importo della Rettifica ripetuta 2 volte: stessa domanda, stessa risposta | **9/9** |
| `pr-us` | 3 cicli Ore tot.→💾→ricarica: archivio e **cloud** tornano identici al 1° ciclo | **10/10** |
| `pr-ic` | **3 cicli incrociati** Dipendenti→USOINT (modifica, reimport, 💾), con doppio import a dati fermi in ogni ciclo: il 3° ciclo riporta archivio **e cloud** identici al 1°, e un F5 finale non perde niente | **12/12** |

🐞 **Tre errori dei MIEI script, trovati dalle prove e corretti** (non dell'app): `pr-dip`
riseminava i dati a ogni navigazione, cancellando proprio il salvataggio che provava (la
trappola già documentata in `ic-dipuso-lib`); `pr-op` scriveva le ore **nella casella del nome
del servizio** (la prima `.edit-cell` non è un numero: ora si aggancia la casella il cui
`onchange` scrive `hours[...]`); `pr-fo` pretendeva che un giorno svuotato sparisse dalla mappa,
mentre resta come voce vuota `{}` — **equivalente misurato** (0 ore, nessuna assenza, stessa
regola del «days vuoto» di FO-14), attesa corretta sull'equivalenza.

🟢 **Osservazione senza intervento**: in Fogli ore, togliere un'assenza lascia nel documento la
voce vuota `{}` del giorno invece di cancellare la chiave. Nessun numero ne risente (misurato);
si segnala perché un domani un ripulitore lato admin potrebbe spazzarle.

**Totale della giornata, secondo giro: 2.794 controlli superati · 6 falliti (tutti noti e
spiegati) · 5 NON VERIFICATI dichiarati** (gli stessi del mattino: F.2, B13b, C19, D20, I13).
**Nessuna anomalia nuova. Nessuna decisione in attesa.**

---

### 5.0-sexies COLLAUDO INTEGRALE DEL 12/11/2026 — DUE LIVELLI, NESSUNA ANOMALIA APERTA

Eseguito con la Skill *Collaudo integrale del gestionale*, sui due livelli che richiede: ogni
webapp da sola (**livello A**) e il gestionale come sistema unico (**livello B**).
Versioni collaudate: **Dipendenti ver160 · Fogli ore rev 17 · Collaboratori rev 17 ·
USOINT ver137 · pagina integrata rev 6**.

**2.743 controlli superati · 7 falliti · 5 dichiarati NON VERIFICATI.**
Nessuno dei 7 falliti è un difetto delle applicazioni: sono attese sbagliate degli script di
prova, verificate una per una e, dove si poteva, corrette in questa stessa giornata.

#### Livello A — le quattro webapp, una per una

| app | script | superati | falliti |
|---|--:|--:|--:|
| Fogli ore `rev 17` | 31 | **595** | 0 |
| Collaboratori `rev 17` | 26 | **524** | 0 |
| USOINT `ver137` | 25 | **515** | 2 |
| Dipendenti `ver160` | 25 | **658** | 5 |

I 7 falliti: tre in `sc-dip-A` (una cella letta mentre la si digita, un avviso a comparsa che è
transitorio, il 🗑 cercato in Anagrafica quando sta nel Tabellone), uno in `ver146` (il periodo
era già diviso in 13 pezzi, quindi il taglio in più non si vede dal conteggio), uno in `ver147`
(il valore di una casella letto da `innerText`, che non lo contiene), uno in `mxus-A` (cade solo
in fila con gli altri e passa da solo) e uno in `ver129c` (è un errore di pagina della **ver128**,
cioè della versione usata come termine di confronto, non di quella di oggi).

#### Livello B — il gestionale come sistema

| che cosa | esito |
|---|---|
| Interconnessioni e flussi completi (20 script) | **370 superati, 0 falliti** |
| Pagina integrata **VERA**, in rete, coi link live | **16 su 16** |
| Regole di sicurezza Firestore (emulatore ufficiale) | **60 su 60** |
| Sito pubblicato **identico byte per byte** ai repository | **5 pagine su 5** |

- 🔗 **Il dialogo fra le app regge**: Fogli ore ↔ Dipendenti 41/41, Dipendenti → USOINT 127/127,
  sincronizzazione col cloud 98/98, residui 40/40, ruoli e permessi 9/9.
- 🔒 **Chi scrive dove, verificato sia nel codice sia in esecuzione**: Dipendenti legge `users` e
  `timesheets` **solo** con `.get()`, e l'unica collection che scrive fuori dal proprio documento
  è `residui`; Fogli ore legge `residui` e basta; USOINT legge il documento di Dipendenti e basta.
- 🧷 **Nella memoria del browser nessuna app tocca le chiavi di un'altra**: i prefissi non si
  sovrappongono e le chiavi di servizio derivano ciascuna dal prefisso della propria app.
- ⏱️ **Prestazioni misurate sul sito vero**: pagina integrata 0,29 s · Collaboratori 0,62 s ·
  Fogli ore 0,83 s · Dipendenti 3,36 s · USOINT 4,20 s. I secondi delle due app React sono il
  tempo che Babel impiega a compilare nel browser, prezzo dichiarato del file unico.

#### 🔴 Riservatezza: una cosa trovata e corretta

Cercando nei quattro repository tutti i pezzi dei nomi dei dipendenti veri sono uscite **17
occorrenze**: 16 sono falsi positivi (l'elenco di nomi comuni per il completamento automatico di
Fogli ore, la tabella Belfiore dei comuni, la parola «segretariali», un cognome dentro un blocco
codificato). La diciassettesima era vera: **una citazione di Christian con il cognome di una
dipendente**, entrata con la ver135 il 09/11 e sfuggita alla pulizia del 06/11. **Tolta.**
⚠️ Toglierla ora non la toglie dai **commit precedenti**, che restano leggibili nella storia
pubblica del repository.
Nessun codice fiscale, email personale o IBAN nei repository.

#### I 5 controlli dichiarati NON VERIFICATI, con il motivo

| id | che cosa | perché |
|---|---|---|
| F.2 | l'import delle ore in USOINT dentro il test di Fogli ore ↔ Dipendenti | lo provano in profondità i sette script `ic-dipuso-*`, tutti superati |
| B13b | le quattro app non sono isolate fra loro dal browser | è un **limite architetturale dichiarato**: stessa origine, un solo `localStorage`, separato dai soli prefissi |
| C19 | il backup su Google Drive di Collaboratori | le librerie di Google non sono raggiungibili dal contenitore: il banco le sostituisce con uno stub |
| D20 | due **computer diversi** che salvano insieme sullo stesso cloud | non riproducibile: la finta Firestore vive in `localStorage`, separato per profilo. ⚠️ Nel codice la strada è `doc(uid).set(...)`, cioè **l'ultimo che salva vince**, e il timbro non lo vede: limite già dichiarato |
| I13 | la generazione del `.docx` vero | servono il modello Word di Christian e la libreria JSZip vera |

#### Tre script di prova superati o da rifare

- `rev16op` **non produce esito**: si ferma sulla schermata del PIN perché il suo seme non lo
  contiene, e lo fa **allo stesso modo su rev 15, rev 16 e rev 17**. Non è una regressione; quella
  revisione è coperta da `col-B2-virgola` e `col-G2-finestre`, entrambi superati.
- `g6-integrata` **non può funzionare dal banco locale**: la pagina madre sta su `127.0.0.1` e i
  riquadri aprono i link **live**, quindi sono di un altro dominio e lo script non può leggerci
  dentro. **Sostituito da `live-int.cjs`**, che collauda la pagina integrata VERA: **16/16**.
- `g12-prestazioni` si blocca sull'accesso del banco. **Sostituito da `prest-live.cjs`**, che
  misura i tempi sul sito pubblicato (numeri qui sopra).

#### Quattro attese di prova aggiornate, non aggirate

1. **`ic-dipuso-1`**: pretendeva 34,25 ore e ora ne risultano 38,75 (totale 54,75 → 59,25). La
   differenza è **4,50 in entrambi**, ed è esattamente la **ver137** di stamattina: il seme
   contiene « 4» e «.5», che fino a ieri valevano zero. È la prova che la correzione arriva fino
   a USOINT.
2. **`ic-sync-A`**: il backup di USOINT porta ora anche le quattro chiavi di servizio del numero
   di schema (**ver134**); si pretende che ci siano **entrambe** le cose.
3. **`ic-fix`**: la targhetta era scritta a mano («rev 13»); e il controllo sull'import JSON di
   Collaboratori **prendeva la casella sbagliata** — quella dell'import anagrafiche da Excel —
   perché la casella del ripristino JSON l'app la crea al momento e non sta nella pagina
   (misurato: nella copertina c'è **una sola** casella file, `anagFile`, `accept=.xlsx`). Passava
   per il motivo sbagliato. Il percorso vero resta provato da `ic-fix3` 13/13 e `col-D` 24/0.
4. **`g4-confronto`**: dalla ver151/153 il blocco JavaScript di Dipendenti supera i **500 KB**
   (da 497 a **547**) e Babel stampa in console, a livello di errore, una **nota**: non è un
   guasto. Esclusa **per nome**, una sola, così ogni altro errore di console continua a contare.

### 5.0-quinquies DIPENDENTI ver159 — TFR, CELLE «IN ITINERE», MONTE ORE (12/11/2026)

Tre risposte di Christian nella stessa giornata, tutte sul **Costo orario** e sull'**anagrafica**
di Dipendenti.

| # | che cosa ha detto | esito |
|---|---|---|
| 1 | «nel costo orario dipendenti **le ore supplementari non incidono sul tfr**» + «**chi è a 38 h/sett. non si vede le supplementari (che vanno al 15%) dentro il TFR**» | ✅ **ver159**: la tendina «Supplementari nel TFR» vale ora **per tutti** ed è su **NO** di fabbrica |
| 2 | «**bordami in fucsia** le celle dell'anagrafica che devo compilare **in itinere**» + «**7 E 8 non sono accordi, si concede e stop**» | ✅ **ver159**: **15 celle** col bordo fucsia, fondo giallino invariato |
| 3 | sul monte ore temporaneo: «**No, vale fino all'ultimo giorno del mese indicato**, esempio 1 ottobre-30 novembre 2026» | ✅ **ver159**: la didascalia era sbagliata (il programma faceva già la cosa giusta) |

#### 4 — le caselle dell'anagrafica si spiegano (ver160)

Approvati da Christian lo stesso giorno, parola per parola: la riga che spiega il **bordo fucsia**
sotto il titolo della sezione *Costo del lavoro*, le **tre didascalie** sotto *Premi (tempo pieno)*,
*Premio €/mese* e *Rimborso km €*, e una quarta uguale sotto le **sei** caselle *dal mese / al mese*.
In più l'etichetta delle ferie residue porta adesso la **data** — «al 31/12/2024» — che l'app
calcola dal primo mese che ha in archivio: è **l'unica etichetta cambiata**, e cambia perché era
incompleta.
⚠️ Nessun calcolo toccato; il posto dove scrivere una didascalia in anagrafica **non esisteva** ed
è stato aggiunto. **Provato**: `ver160.cjs` **27/27**, zero errori di pagina, larghezza di pagina
identica a **390 · 1280 · 1700px**.

#### La batteria storica, rieseguita sulla ver160

**25 script, 658 controlli superati, 5 falliti**, e tutti e cinque sono **attese sbagliate dei
miei script**, verificate una per una. `sc-dip-C` torna a **107/0**, il che conferma che il
63/44 del giro precedente era la trappola del banco di prova e non una regressione.

⚠️ **`sc-dip-B` passa ora 35/0 invece del 32/2 storico**: i suoi due falliti di sempre erano due
errori miei, trovati e corretti qui (il titolo di sezione che `innerText` restituisce in maiuscolo,
e una tendina cercata dentro la sua etichetta invece che accanto).

⚠️ **Quattro attese sono state aggiornate, non aggirate.** Due pretendevano che il costo dei 16
dipendenti fosse identico a quello di prima, e fino alla ver158 era giusto; la ver159 lo cambia di
proposito, quindi ora pretendono il numero preciso: **10 schede che cambiano e 6 identiche al
centesimo**. Le altre due guardavano l'etichetta delle ferie residue e la targhetta, che la ver160
ha cambiato: adesso leggono il valore dal file dell'app.

🐞 **Tre script non erano partiti affatto**, perché i server del finto database, dei PDF veri e
della versione precedente erano spenti o fermi a una versione vecchia. **I banchi vanno riaccesi e
rigenerati a ogni sessione e dopo ogni modifica al file**: è la stessa trappola che l'11/11 aveva
fatto sembrare `sc-dip-C` pieno di regressioni inesistenti.

#### 1 — le supplementari fuori dal TFR

🔴 **La regola era DOPPIA e incoerente**, e l'incoerenza è stata misurata prima di toccare niente:
chi è a **38 h/sett.** si vedeva le supplementari **sempre** dentro la base TFR, **col 15%**, e la
tendina **non veniva nemmeno letta**; chi è **part-time** seguiva la tendina, di fabbrica su **SI**,
e allora entravano **senza** maggiorazione.

**Quanto pesa, sui 16 dipendenti veri** (confronto diretto con la copia congelata della ver158,
16 schede su 16 lette, zero errori di pagina):

| periodo | costo totale PRIMA → DOPO | differenza | schede che cambiano |
|---|--:|--:|--:|
| gen → ott 2026 | 154.906,45 → **154.348,48** | **−557,97 €** | 10 su 16 |
| gen → dic 2026 | 192.649,00 → **192.091,02** | **−557,98 €** | 10 su 16 |
| gen → dic 2025 | 140.697,40 → **140.015,18** | **−682,22 €** | 8 su 16 |

Il costo **scende**, ed è il verso giusto. La punta: una scheda da **14.286,15 a 14.142,20 €**
(base TFR da 9.675,65 a **7.775,24**); sul 2025 un'altra fa **−279,98 €**, €/h da **18,28 a 17,97**.
⚠️ **I costi orari calcolati finora erano sovrastimati** di quella quota.

- ⚠️ **La tendina NON è stata tolta**: è una dicitura di Christian. Rimettendola su **SI** si torna
  **esattamente** ai numeri di prima — **verificato**, e ora vale **anche per il full-time**, che
  prima la ignorava.
- ⚠️ **Nei dati veri `costoComune` è vuoto**, quindi il NO vale subito per tutti e 16.
- ⚠️ **`J18` resta nell'imponibile II**: i contributi sulle ore aggiuntive non cambiano. Cambia
  **solo** la base del TFR.
- 🚫 **CHIUSA il 12/11/2026: «la scelta sulle supplementari è per tutti».** Nel foglio Excel
  di Christian quella leva era **per persona** (dei 5 casi della ver71, uno era
  «TFR-supplementari NO»), e gli era stato chiesto se qui dovesse diventare un dato della
  singola scheda. Ha risposto di no: resta **una sola scelta valida per tutti**.
  **Non riproporre** lo spostamento in anagrafica.

#### 2 — le celle «in itinere», bordo fucsia

Sono le **15** caselle della sezione **«Costo del lavoro»**: premi, premio al mese, rimborso km col
suo «come si conta», i **sei dal/al**, ore sotto soglia, **TFR accantonato** e il suo anno, ferie
residue, mesi di maternità. ⚠️ **Restano ambra**, per sua decisione: *Giorni settimanali (per il
costo orario)* (dato del contratto), *Scatti riconosciuti all'**assunzione***, e tutta la sezione
**«Economico»**, che dalla ver135/ver137 **non alimenta nessun calcolo**.
⚠️ **Il fondo resta giallino**: cambia **solo** il bordo (misurato: `rgb(192,38,211)` sulle 15,
`rgb(245,158,11)` su tutte le altre, fondo `rgb(255,253,231)`).
🟠 **Manca ancora la riga che spiega il colore**: è una dicitura nuova e aspetta il suo via libera.

#### 3 — il monte ore temporaneo: la frase era falsa, il programma no

**Misurato prima di rispondergli** (`orartemp.cjs`, 5/5, dati inventati): 20 ore dal **01/10/2026
al 30/11/2026** su una persona a 38 h/sett. danno **settembre 165 · ottobre 86,84 · novembre 86,84
· dicembre 165**. Il periodo copre **novembre per intero**: ha ragione lui, ed era la **didascalia**
a essere sbagliata — una frase **scritta da Claude** nella ver62, non una sua dicitura.
🐞 **E la frase taceva una seconda cosa**: il **giorno non conta affatto**. **15/10/2026 →
05/11/2026** dà lo stesso identico risultato (`orartempB.cjs`, 5/5).
La frase nuova lo dice per esteso ed è stata **approvata da lui** prima di entrare nel file.

**Provato in esecuzione**: `ver159.cjs` **19 controlli su 19**, zero errori di pagina.
🐞 Due attese della prima stesura erano **mie e sbagliate** (avevo invertito la scheda full-time
con quella senza supplementari): **corrette, non aggirate**.

---

### 5.0-quater LE RISPOSTE DEL 12/11/2026 E LE DUE GRAVITÀ MISURATE

Portate su `main` le quattro app l'11/11, Christian ha chiesto l'elenco numerato del sospeso e
ha risposto punto per punto. Queste sono le risposte e, dove le ha chieste, le **misure**.

| # | Che cosa | Risposta | Esito |
|---|---|---|---|
| 1 | Fogli ore: aprire un mese mai compilato **scrive** nel database (FO-14) | «non conosco la gravità» → poi «**1 lascia**» | 🚫 **CHIUSO**: comportamento **voluto**, non riproporlo |
| 2 | Fogli ore: la **banda rossa unica** (FO-15) | «non conosco la gravità» → poi «**2 banda in più**» | ✅ **rev 17**: tre bande impilate |
| 3 | Collaboratori: il **PIN in chiaro** (OP-13) | «**no assolutamente hash**» | 🚫 **CHIUSO**: non riproporlo |
| 4 | Dipendenti: 📤 Pubblica i residui automatico? | «**manuale e' ok**» | 🚫 **CHIUSO**: resta manuale, non riproporlo |
| 5 | Dipendenti: 4 senza data di assunzione, 5 senza livello (DIP-13) | «**provvedo**» | lo sistema lui nei dati |
| 6 | USOINT: i formati « 4» e «.5» valgono zero (US-17) | «**sistema**» | ✅ **ver137** |

#### US-17 — la correzione (ver137)

**`_dipNum`**, la funzione che legge una cella di Dipendenti durante l'import delle ore
lavorate, pretendeva che il **primo carattere** fosse una cifra: **« 4»** (spazio davanti) e
**«.5»** valevano **ZERO**, e quelle ore finivano nell'Avanzo come se non fossero mai state
fatte. Ora si toglie lo spazio e si ammette anche il punto o la virgola iniziale.
⚠️ **I codici di assenza** (`FERIE`, `MAL`, `AN`, `--`, `FEST`, `MAT-OBB`, `ASP 0h`) e il
**segno meno** restano scartati come prima: è la ragione per cui quel controllo esiste.
**Misurato** (`ver137us.cjs` **12/12**): 26 valori confrontati con la ver136, cambiano **solo**
i quattro con spazio o punto iniziale. Batteria completa **ZERO falliti nuovi** (25 script).

| 7 | Pagina integrata: la targhetta a 12px (US-29) | «**va bene 12px**» | ✅ **CHIUSO**: eccezione dichiarata |
| 8 | Collaboratori: il centesimo dei «secchi» (OP-11) | «si può risolvere?» → poi «**1 sistema**» | ✅ **rev 17** |

#### E le due decisioni su Fogli ore: «1 lascia, 2 banda in più»

Lette le gravità misurate, Christian ha deciso. Ne è nata **Fogli ore rev 17**.

| punto | risposta | esito |
|---|---|---|
| **FO-14** — aprire un mese mai compilato scrive nel database | «**1 lascia**» | 🚫 **CHIUSO**: è la copia automatica della configurazione del servizio, un comportamento **voluto**. Non riproporlo |
| **FO-15** — la banda rossa è una sola | «**2 banda in più**» | ✅ **rev 17**: le ore e l'assenza hanno due bande distinte |

- 🚩 **Come è fatta**: una banda sua per l'assenza (**`#banda-ass`**), con lo **stesso blocco
  CSS** di quella delle ore, così non possono divergere. Le bande sono ora **tre** e si impilano
  dal basso: **ORE · ASSENZA · LETTURA**, con l'altezza **misurata** (sul telefono il testo va a
  capo e la banda si alza a 77px).
- ⚠️ **I due testi non sono cambiati di una lettera**: sono quelli della rev 15, verificati con
  il confronto della frase intera. È cambiato solo il **numero** delle bande.
- 🐞 Chiudendo una banda con la ✕ ora le altre si **ricompattano**: prima la blu restava
  sospesa dov'era. Difetto **preesistente** della rev 15, invisibile finché erano due.
- **Provato in esecuzione**: `rev17fo.cjs` **27 controlli su 27**, zero errori di pagina, col
  confronto diretto sulla copia congelata della **rev 16** (lì il messaggio delle ore spariva).
  Grafica misurata a **390 · 1280 · 1700px** con tutte e tre le bande accese: nessuna
  sovrapposizione, nessuno scorrimento laterale, **zero** scritte sotto i 12,5px e la tabella del
  mese **906px**, identica.
- **Batteria completa rieseguita, ZERO falliti** (31 script). ⚠️ **Undici avevano attese
  invecchiate**, ed è la conseguenza diretta della richiesta: fino alla rev 16 la banda era
  **una sola**, quindi gli script guardavano solo `#banda-salv`. Otto la leggevano da lì e **due
  andavano in errore**; ora prendono **la banda rossa visibile**, qualunque delle due sia.
  🔑 **Quattro controlli DOCUMENTAVANO il difetto chiuso oggi** (fra cui `cf8` X3, che diceva
  per esteso «**LIMITE**: il messaggio sulle ORE SPARISCE») e sono stati **rovesciati**: ora
  pretendono il contrario. **Aggiornate, non aggirate.**

#### Le DUE risposte successive, della stessa giornata: «1 sistema, 2 insieme»

Consegnate le misure, Christian ha risposto alle due domande rimaste aperte su Collaboratori.
Ne è nata la **rev 17**.

| domanda | risposta | esito |
|---|---|---|
| il **centesimo** del riquadro «Il credito ‹anno› viene da:» (OP-11) | «**1 sistema**» | ✅ **rev 17**: quadratura sulla riga più grande, **solo a video** |
| la **«Rettifica credito»**: due caselle separate o che si muovono insieme? (OP-15) | «**2 insieme**» | ✅ **rev 17**: scritte le ore si ricalcola l'importo, e viceversa |

- 📐 **La quadratura**: le righe erano `ore × tariffa` arrotondate una per una, il credito
  nasceva da un'altra catena di arrotondamenti. Ora il centesimo che resta si mette sulla **riga
  più grande**. **Misurato**: 92,25 → **92,26 = 92,26**; nel caso sano **5.287,71 = 5.287,71**,
  identico. ⚠️ Sta nel **disegno** del riquadro, **non** in `bkResid`, che alimenta anche il
  riporto fra gli anni e l'export Excel.
- ⚖️ **Le due caselle insieme**: il valore si ricava **dal motore** (`bkResid` interrogata due
  volte, con e senza la rettifica), non da una formula riscritta a mano, così la conversione
  segue da sé l'ordine di consumo dei secchi e le **tariffe diverse**. **Misurato**: 15 ore su
  due servizi a 20,50 e 30 fanno **355,00 €**, e **355,00 € tornano 15,00 ore**; scrivendo
  24,39 ore l'importo diventa **500,00 €** e il riquadro **quadra** col credito.
  ⚠️ `azzeraCredito` e `resetRettifica` **non sono stati toccati** (scrivevano già entrambe le
  rettifiche); il collegamento scatta **quando si scrive**, quindi una coppia già in archivio
  scritta con una casella sola resta com'è finché non si tocca una delle due caselle.
- **Provato in esecuzione**: `rev17op.cjs` **23 controlli su 23**, zero errori di pagina, con il
  confronto diretto sulla copia congelata della **rev 16**.

#### FO-14 — la gravità, misurata (`grav12d.cjs`)

Aprire un mese **mai compilato** crea **un documento** `timesheets/<uid>__<anno>_<mese>_<slot>`
con `days:{}`. **Misurato**: aprendo quattro mesi vuoti sono nati **3 documenti** (uno per mese
aperto; il quarto era già in cache). Aprire un mese **già compilato** non scrive **niente**.

🔑 **E leggendo il codice si è visto che quella scrittura NON è «per la sola
navigazione»**, come diceva il verbale del collaudo: è la **copia automatica della
configurazione del servizio** nel mese nuovo. `findAnyMonthAnag` cerca mansione, sede, dettagli,
comune e alunno in un altro mese, controlla che non sia un doppione e li **scrive** nel mese
appena aperto — ed è esattamente ciò che i documenti nati nella prova contenevano
(`mansione: "Educatore/Assistente"`, `days` vuoto). Serve a far trovare all'operatore il suo
servizio **già configurato** ogni mese, invece di fargli riscrivere tutto. ⚠️ La descrizione
precedente era **incompleta**, ed è corretta qui.

- ✅ **Nessun numero cambia e nessun dato si perde**: `days` è vuoto, quindi le ore valgono 0
  come per un mese che non esiste, e il confronto con Dipendenti non si muove. Il documento nasce
  **solo** se non c'era (`if(!cache[k])` dopo un `loadTS` che ha trovato il vuoto): **non può
  sovrascrivere** un foglio vero.
- 🟡 **Che cosa costa davvero**: documenti vuoti in un database **condiviso con gli esterni**
  (al massimo 12 mesi × 20 slot = **240** per operatore, in pratica solo i mesi e gli slot che
  apre), che da quando il backup è completo (rev 16) **finiscono anche nel file di backup**; e
  «mese mai toccato» diventa indistinguibile da «mese aperto e lasciato vuoto».
- ⚠️ **La correzione costerebbe più di quanto rende**: rinviando la scrittura al primo dato
  vero, la configurazione resterebbe **solo nella memoria del browser**, e un mese aperto e
  lasciato vuoto risulterebbe «DA CONFIGURARE» a chi lo guarda da un altro dispositivo o
  dall'admin. Tocca il **percorso dei dati degli esterni** (§10.3).
- 📌 **Consiglio, dichiarato**: **lasciarlo come è**. Non si perde e non si altera niente, e
  quella scrittura paga un servizio vero all'operatore. Se un giorno i documenti vuoti dessero
  fastidio, la via pulita è un ripulitore lato admin, non il rinvio della scrittura.

#### FO-15 — la gravità, misurata (`grav2.cjs`, 4 controlli su 4)

Con il collegamento caduto, in quest'ordine: si scrivono delle **ore** → compare
«⚠️ **ORE NON SALVATE** — … quando torna la linea premi 💾 Salva»; si scegle poi
un'**assenza** → la stessa banda diventa «⚠️ **ASSENZA NON SALVATA** — … il 💾 Salva non la
rimette: riscegli l'assenza dalla tendina», e **il messaggio delle ore sparisce**.

- 🔴 **La conseguenza è la perdita di ore**: verificato che in quel momento le ore **non sono
  nel database**, e Fogli ore **non tiene nessuna copia nel browser**. Chi legge la banda rimasta
  — che dice che il 💾 «non la rimette» — può concludere che non c'è niente da premere, chiudere
  la pagina e **perdere le ore**.
- 🟡 **Quanto è probabile**: serve che la linea cada **e** che in quella finestra si facciano
  **tutte e due** le cose, in quell'ordine. L'avviso a comparsa dell'assenza, intanto, compare
  correttamente («L'assenza NON è stata salvata…»).
- **La correzione è pronta nell'impianto**: la rev 15 ha già **due** bande impilate
  (`banda-salv` e `banda-lett`) con `bandeImpila()` che ne misura l'altezza vera. Servirebbe una
  **terza banda** (o una banda a due righe) e quindi una **dicitura nuova**: §10.6, serve il suo
  via libera.

#### OP-11 — sì, si può risolvere; e indagando è uscito **OP-15** (`cent8*.cjs`)

**Misurato a video**, nel riquadro «Il credito ‹anno› viene da:»:

| caso | somma delle righe | credito residuo | scarto |
|---|--:|--:|--:|
| **D** nessuna liquidazione e nessuna rettifica | 5.287,71 € | 5.287,71 € | **0,00** |
| **A** una liquidazione (10 h a 20,50) | 92,25 € | 92,26 € | **−0,01** |
| **B** rettifica di **sole ore** (24,39 h) | 1.550,01 € | 2.050,00 € | **−499,99** |
| **C** rettifica di **solo importo** (500 €) | 2.050,00 € | 1.550,00 € | **+500,00** |

- 🟡 **OP-11, il centesimo**: compare **solo** con una liquidazione o con un riporto fra anni, ed
  è sempre **esattamente un centesimo** (misurato: **81 casi su 500** con liquidazione, **65 su
  500** con riporto, mai più di 0,01). Senza liquidazioni né rettifiche la somma **quadra sempre**
  (2.401 combinazioni su 2.401). **Si risolve**: si arrotondano le righe e il centesimo che resta
  si mette sulla riga più grande, così le righe sommano **esatte** al credito. Costa che **una
  riga mostra un centesimo diverso** dal suo ore × tariffa, ed è solo **visualizzazione**: il
  motore dei residui non si tocca.
- 🟠 **OP-15 — NUOVO, trovato indagando OP-11**: il pannello **«Rettifica credito»** ha **due
  caselle indipendenti** (Ore e Importo €) e le due viaggiano su **binari separati** — `rettOre`
  consuma i secchi ma **non** abbassa l'importo residuo, `rettImp` abbassa l'importo residuo ma
  **non** tocca i secchi. Usandone **una sola**, il riquadro in euro contraddice il credito
  **dell'intera rettifica** (casi **B** e **C**: 500 € nella prova), e **niente a video lo dice**.
  ⚠️ Con «**Azzera credito residuo**» non capita, perché quel pulsante scrive **entrambe**.
  ⚠️ **PREESISTENTE** e **non toccato**: il motore dei residui è nell'elenco delle cose da non
  toccare senza richiesta, e la correzione richiederebbe anche una **dicitura nuova**.
  🔴 **Vale più di OP-11**: lo scarto è di **centinaia di euro**, non di un centesimo.
- 🐞 **Due errori MIEI nello script, trovati e corretti prima di riportare i numeri**: la prima
  stesura leggeva una **finestra di testo** di 420 caratteri dopo «viene da:», che sconfinava
  nella tabella dell'anno dopo (scarti inventati di migliaia di euro), e la seconda agganciava il
  riquadro **dell'anno sbagliato**. Ora si parte dal titolo vero (il solo `div` che contiene
  «viene da:» e **nessun altro `div`**) e si leggono **solo** le righe di quel riquadro.
  ⚠️ **Un numero misurato con un selettore sbagliato non è una misura**: nel caso sano la somma
  quadra al centesimo, e prima sembrava sbagliata di 1.597 €.

### 5.0-ter IL CODICE OPERATORE — TR-03 (11/11/2026)

Era l'ultima criticità **strutturale** aperta: **l'unico identificativo che attraversava il
confine fra le app era il NOME**, scritto a mano in due anagrafiche diverse. Christian l'ha
chiusa l'11/11/2026: «ok codice condiviso che crei tu di max 4 caratteri 3 dei quali contengono
le prime lettere del cognome», poi **«cifra progressiva»** e **«resta solo in Dipendenti»**.

| Dove | Che cosa | Versione |
|---|---|---|
| **Dipendenti** | nasce il **codice** `dp.sigla` — 3 lettere del cognome + una cifra (`ROS1`, `ROS2`): casella **grigia di sola lettura** in ANAGRAFICA, pulsante **«🔖 Assegna i codici mancanti»** che elenca, chiede conferma e richiede il 💾 | **ver157** |
| **Dipendenti ↔ Fogli ore** | l'**aggancio all'account** `dp.foUid`, creato **una volta** col nome e poi congelato: pulsante **«🔗 Aggancia gli account di Fogli ore»**. ⚠️ **In Fogli ore non si scrive NIENTE** (verificato: zero scritture) | **ver158** |
| **Dipendenti → USOINT** | il codice viaggia dentro il documento che USOINT **già legge**; USOINT tiene la corrispondenza **codice → riga** in `usoint-codici` | **ver136** |
| **Fogli ore** | **non cambia** | — |

🚦 **Che cosa risolve e che cosa no.** Su **Dipendenti ↔ Fogli ore** il problema è **chiuso**:
il legame è un uid, unico per costruzione, quindi omonimi e accenti non lo toccano più. Su
**Dipendenti → USOINT** il codice rende stabile l'abbinamento anche se il nome cambia del
tutto — **misurato: rinominando la persona in Dipendenti, le ore vanno sulla riga di sempre,
mentre senza codice non arrivano affatto** — ma **due omonimi dentro USOINT restano
indistinguibili**, perché lì gli operatori non hanno un'anagrafica: sono i nomi scritti nelle
righe del budget. Lì resta l'avviso della ver132.

⚠️ **Il codice non si ricalcola mai.** Una volta assegnato resta quello anche se cambia il
cognome: è un identificativo, e ricalcolarlo romperebbe il legame con le altre app.

**Provato in esecuzione**: `ver157` **28/28**, `ver158` **24/24**, `ver136us` **17/17**,
`ver136-bk` **4/4** (un backup che contiene i codici rientra senza essere rifiutato dalla
guardia della ver134), zero errori di pagina. **Batterie complete rieseguite su tutte e due le
app, zero falliti nuovi.**

🐞 **Una trappola del BANCO DI PROVA, non dell'app, che è costata un'ora**: la copia congelata
della versione di confronto (porta 8201) va costruita con **`FB_READY = false`**, altrimenti
resta sulla **schermata di accesso** e misura una pagina vuota, facendo sembrare regressione
tutto quello che la versione nuova disegna (`sc-dip-C` dava **63/44** invece di **107/0**).
Rifatta bene: **ver140 e ver158 danno gli stessi identici numeri**.

### 5.0-bis RICONCILIAZIONE DELLE URGENZE FRA TUTTI I COLLAUDI (11/11/2026)

Richiesta di Christian dell'11/11/2026: confrontare le urgenze attribuite nei vari collaudi,
perché alcune criticità avevano ricevuto livelli diversi in momenti diversi.
⚠️ **Questa sezione NON sostituisce i rapporti precedenti**: quelli restano dove sono, nelle
schede di ogni `CLAUDE.md`. Qui si tiene solo il raccordo fra loro.

**Le campagne di collaudo, in ordine:**

| Sigla | Quando | Che cos'era |
|---|---|---|
| **C1** | 07/11/2026 | Audit generale del gestionale (tutte e quattro le app) |
| **C2** | 09/11/2026 | Collaudo generale (i difetti «A» e «B») |
| **C3** | 09/11/2026 | **Secondo** collaudo: verificava le correzioni di C2 e ne trovò di incomplete |
| **C4** | 09-10/11/2026 | Collaudo delle **INTERCONNESSIONI** fra le app |
| **C5** | 11/11/2026 | Collaudo definitivo, integrale e chirurgico (le 10 domande) |
| **C6** | 11/11/2026 | Correzioni autorizzate da Christian + riconciliazione (questa) |

**I criteri di urgenza, applicati allo stesso modo a tutte le app e a tutte le campagne:**

| Livello | Quando si applica |
|---|---|
| 🔴 **ALTA** | i dati si perdono, si alterano o si duplicano; oppure l'app smette di funzionare; oppure l'app **dice il falso** su un salvataggio |
| 🟠 **MEDIA** | l'app mostra o accetta qualcosa di sbagliato senza perdita di dati; violazione del §10.1/§10.2 recuperabile; si può aggirare |
| 🟡 **BASSA** | aspetto, leggibilità, igiene del repository, osservazioni senza conseguenze misurate |

🔎 **Tre incoerenze trovate nel confronto, dichiarate:**
1. **Lo stesso difetto ha avuto tre urgenze diverse in tre app.** «Due schede aperte si
   cancellano a vicenda» era 🔴 in **Dipendenti** (C2, chiuso subito con la ver144), ma è rimasto
   in un elenco 🟠 «non toccate» per **Collaboratori** (da C4 fino alla rev 15) e per **USOINT**
   (fino alla ver131). È lo stesso difetto con lo stesso impatto: andava 🔴 in tutte e tre.
2. **«L'import accetta un file con la forma giusta e il contenuto rotto»** è stato 🔴 in
   **Collaboratori** (C4 → rev 13) ma in **USOINT** non è stato nemmeno provato fino a C5, dove
   si è rivelato **peggiore** (avvelena anche il cloud). Non è un declassamento: è un **buco di
   copertura** del collaudo C4, che provò gli import di Collaboratori e non quelli di USOINT.
3. **Due voci di C4 sono sparite dai rapporti successivi senza esito** (US-14 e US-17). Sono
   state **rimisurate oggi sulla ver134**: sono **ancora aperte**, e una va **AGGRAVATA**.

🔬 **Le due voci rimisurate oggi** (`ric-U14-U17.cjs`, banco con finta Firestore):
- **US-14** — un mese di Dipendenti che **perde le ore** (documento salvato a metà, oppure mese
  svuotato): **misurato, gennaio passa da 20,00 a 0,00 in USOINT**, il riquadro dice
  «**importate ✓ (1 operatori aggiornati)**» con la spunta **verde**, e **nessuna scritta dice
  che un mese è stato azzerato**. Lo zero finisce poi nell'**Avanzo**. ⚠️ Dalla **ver132**
  l'azzeramento non entra in archivio finché non si preme 💾, e compare «le ore lavorate sono
  cambiate e non sono ancora salvate»: è un freno, ma **non dice che cosa** è cambiato.
  ⚠️ **Sui dati veri** (backup del 04/11): **0** record senza il campo `giorni`, **1** con
  `giorni` vuoto — e quello è un mese legittimamente non lavorato, dove lo zero è giusto.
  **Da 🟠 (C4) a 🔴**: altera un dato in silenzio e tocca due app.
- **US-17** — i formati **« 4»** (spazio davanti) e **«.5»**: **misurato, valgono ancora 0**
  (gennaio 9,00 invece di 13,50: **4,5 ore perse**). ⚠️ **Sui dati veri: ZERO celle** scritte
  così, e dalla **ver102** di Dipendenti la cella **non permette** di scriverle (il modello
  pretende una cifra all'inizio). **Resta 🟡**: difetto reale ma senza impatto misurato.

**PROSPETTO COMPARATIVO COMPLETO.** Ci sono **tutte** le criticità di tutte le campagne,
comprese quelle che i rapporti successivi non nominano più. Dove la correzione c'è, la colonna
«Prova» porta lo script e il suo punteggio: una modifica al codice **senza** un test positivo
non vale come risolta.

**FOGLI ORE**

| ID | Problema | Trovato | Prima | Dopo | Stato | Correzione | Prova | Definitiva |
|---|---|---|---|---|---|---|---|---|
| FO-01 | «✓ Salvato!» mentiva: il salvataggio automatico falliva in silenzio e le ore erano perse | C1 | 🔴 | — | **RISOLTO** | rev 10 | `g9-fo-salva` 12/12 | — |
| FO-02 | Un'assenza si perdeva in silenzio (non passa da `saveTS`) | C2 | 🔴 | — | **RISOLTO** | rev 12 | `fix-b1` 13/13 | — |
| FO-03 | Scritte sotto i 12,5px fuori dalla tabella del mese | C1 | 🟠 | 🟠 (C3: dimenticata la schermata di accesso) | **RISOLTO** | rev 10 · rev 13 · rev 14 | `fix-b36` 9/9 | — |
| FO-04 | Dopo la registrazione la testata mostrava la **mail** | C2 | 🔴 | — | **RISOLTO** | rev 13 | misurato: una sola scrittura | — |
| FO-05 | L'attesa della rev 13 scadeva: FO-04 tornava **peggiorato**, e `set()` senza `{merge:true}` cancellava cognome e nome | C3 | — | 🔴 **NUOVO (mio errore)** | **RISOLTO** | rev 14 | 5 velocità provate | — |
| FO-06 | Messaggio tecnico inglese all'operatore esterno (1 punto) | C3 | 🟠 | — | **RISOLTO** | rev 14 | misurato | — |
| FO-07 | La banda diceva «ORE NON SALVATE» anche per un'**assenza** | C3 | 🟠 | 🟠 | **RISOLTO** | rev 15 | `rev15fo` 34/34 | — |
| FO-08 | Account «battezzati con la mail» | C3 | 🟠 | 🟠 | **RISOLTO** | rev 15 (lo chiede al primo accesso) | `rev15fo` | — |
| FO-09 | Con la **lettura** caduta il mese si svuotava a video senza spiegazione | C3 | 🟠 | 🟠 | **RISOLTO** | rev 15 (banda blu) | `rev15fo` · `rev15fo-graf` | — |
| FO-10 | **Il backup non era una copia completa**: mancavano `svccaps` e `lightsheets` | C5 | — | 🔴 | **RISOLTO** | rev 16 | `rev16fo` 33/33 | — |
| FO-11 | **Non esisteva nessun import**: il backup si poteva solo produrre | C5 | — | 🔴 | **RISOLTO** | rev 16 | `rev16fo` 33/33 | — |
| FO-12 | Il backup non portava il numero di schema; «ver1» nel nome scritto a mano | C5 | — | 🟠 | **RISOLTO** | rev 16 | `rev16fo` | — |
| FO-13 | **28 messaggi d'errore in inglese di Firebase** (percorsi admin) | C3 | 🟠 | 🟠 | **INVARIATO — chiuso per DECISIONE** («non serve») | nessuna, voluto | — | 🚫 non si tocca |
| FO-14 | Aprire un mese mai compilato **scrive** nel database | C5 | — | 🟡 | **RICLASSIFICATO e poi CHIUSO il 12/11**: non è una scrittura «per la sola navigazione» ma la **copia della configurazione del servizio** nel mese nuovo (`findAnyMonthAnag`); Christian: «**1 lascia**» | nessuna, per sua decisione | `grav12d` (2/2): 3 documenti con la mansione copiata e `days` vuoto; zero scritture su un mese già compilato | — **chiuso: comportamento voluto, non riproporlo** |
| FO-15 | La banda rossa è una sola: perdendo ore **e** assenza, il messaggio sulle ore sparisce | C5 | — | 🟡 | **AGGRAVATO e poi RISOLTO il 12/11** («**2 banda in più**»): misurato che le ore non sono nel database e l'app non tiene copia locale, quindi si potevano perdere | **rev 17**: tre bande impilate, testi invariati | `grav2` **4/4** (il difetto) → `rev17fo` **27/27** (la correzione, con la grafica a 390 · 1280 · 1700px) | — **chiuso** |
| FO-16 | Il `CLAUDE.md` dichiarava una dimensione del file sbagliata | C5 | — | 🟡 | **RISOLTO** | corretto in C5 e C6 | — | — |
| FO-17 | **L'admin non può RICREARE un `users` cancellato** (le regole danno `update`, non `create`) | **C6** | — | 🟠 **NUOVO** | **CHIUSO l'11/11 da Christian**: «va bene così» — limite accettato e **scritto nella conferma a video** | nessuna possibile da qui | emulatore `R1`…`R9`, **60/60** | — **chiuso: limite dichiarato** |
| FO-18 | Salvataggio automatico ogni 600 ms (scostamento dal §10.1) | C1 | 🟡 dichiarato | 🟡 | **INVARIATO — accettato**: senza, l'esterno perderebbe tutto chiudendo la pagina | nessuna, voluto | — | 🟡 |
| FO-19 | Tabella del mese 906px e scritte piccole **dentro** la griglia su telefono | C1 | 🟡 dichiarato | 🟡 | **INVARIATO — accettato**: alzarle allarga la tabella (provato il 31/10) | nessuna, voluto | — | 🟡 |
| FO-20 | `locks` e ruolo `disabled` non imposti dal **database**; creazione libera dei `lightsheets` | 30/10 | 🟠 dichiarato | 🟠 | **INVARIATO — accettato** da Christian il 06/11 («va bene così») | nessuna, voluto | emulatore 60/60 | 🟠 |

**COLLABORATORI**

| ID | Problema | Trovato | Prima | Dopo | Stato | Correzione | Prova | Definitiva |
|---|---|---|---|---|---|---|---|---|
| OP-01 | I **negativi** nelle celle sottraevano senza avviso | C2 | 🔴 | 🔴 (C3: chiuso solo in parte, 3 porte ancora aperte) | **RISOLTO** | rev 11 + rev 12 | `rev11` 8/8 · `sc-op-rev12` | — |
| OP-02 | Due collaboratori con lo **stesso nome** accettati in silenzio | C2 | 🟠 | — | **RISOLTO** | rev 11 (avviso non bloccante) | `rev11` | — |
| OP-03 | Scritte a 12px fuori dalle tabelle | C2 | 🟠 | 🟠 (C5: restavano le regole `.modal`) | **RISOLTO** | rev 10 + rev 16 | `fix-b45` 8/8 · `col-G2` 29/29 | — |
| OP-04 | Codice **HTML** dentro le finestre di conferma | C2 | 🟠 | 🟠 (C3: un `f2()` ancora scoperto) | **RISOLTO** | rev 10 + rev 12 | `sc-op-rev12c` 7/7 | — |
| OP-05 | **L'import accettava qualunque array** → pagina bianca, recuperabile solo da backup | C4 | 🔴 | — | **RISOLTO** | rev 13 (`paionoOperatori`) | `ic-fix3` 13/13 | — |
| OP-06 | **Due schede aperte si cancellano a vicenda** in silenzio | C4 | 🟠 *(sottostimato)* | 🔴 | **RICLASSIFICATO poi RISOLTO** — in Dipendenti lo stesso difetto era 🔴 fin da C2 | rev 15 (timbro) | `rev15op` 15/15 | — |
| OP-07 | Un negativo già in archivio si vedeva senza il meno | C3 | 🟠 | — | **RISOLTO** | rev 14 | `rev14op` 15/15 · `rev14opb` 7/7 | — |
| OP-08 | **«1.234,56» battuto** diventa 1,234 | C3 | 🟠 | 🟠 | **INVARIATO — chiuso per DECISIONE** | nessuna, voluto | `raw` verificata | 🚫 non si tocca |
| OP-09 | **«22,99» nel Costo orario diventava 2299** (×100 in silenzio) | C5 | — | 🔴 | **RISOLTO** | rev 16 | `col-B2-virgola` 7/7 | — |
| OP-10 | 13 scritte a 11px in tre finestre | C5 | — | 🟠 | **RISOLTO** | rev 16 | `col-G2-finestre` 29/29 | — |
| OP-11 | Somma dei «secchi» 8.026,70 € contro residuo 8.026,69 € | C5 | — | 🟡 | **RISOLTO il 12/11** («1 sistema»): **rev 17**, quadratura sulla riga più grande, **solo nel disegno** del riquadro | **rev 17** | `rev17op` **23/23**: 92,25 → **92,26 = 92,26**, e il caso sano identico | — **chiuso** |
| OP-12 | Ogni ✔ Salva scarica da sé un file di backup | C5 | — | 🟡 | **INVARIATO — accettato**: rete di sicurezza storica | nessuna, voluto | — | 🟡 |
| OP-13 | Il **PIN è in chiaro** in `spazioireos_opoc_pin` | C5 | — | 🟡 | 🚫 **CHIUSO il 12/11 da Christian**: «no assolutamente hash» — il PIN resta in chiaro, protegge la schermata e non i dati | nessuna, per sua decisione | — | — **non riproporlo** |
| OP-14 | Le quattro app condividono **un solo `localStorage`** | C4 | 🟠 | 🟡 | **DECLASSATO** da Christian il 10/11 («3 ok»), con la misura a sostegno | nessuna, accettato | 24 controlli di isolamento | 🟡 |
| OP-15 | La **«Rettifica credito»** ha due caselle indipendenti: usandone una sola, il riquadro «Il credito ‹anno› viene da:» contraddice il credito **dell'intera rettifica** | **12/11** | — | 🟠 **NUOVO** | **NUOVO e RISOLTO lo stesso giorno** («2 insieme»): era **PREESISTENTE** nel codice | **rev 17**: le due caselle si muovono insieme, e la conversione la fa il **motore** (`bkResid`), non una formula riscritta a mano | `cent8c`/`cent8d`: scarto **−499,99 €** con la rettifica di sole ore e **+500,00 €** con quella di solo importo → `rev17op` **23/23**: ora il riquadro **quadra** col credito | — **chiuso** |

**USOINT**

| ID | Problema | Trovato | Prima | Dopo | Stato | Correzione | Prova | Definitiva |
|---|---|---|---|---|---|---|---|---|
| US-01 | Il ripristino veniva **sovrascritto da `fbSync`**: «Ripristinati N elementi» era una bugia | 04/11 | 🔴 | — | **RISOLTO** | ver121 | `g11` 13/13 | — |
| US-02 | Scheda progetto che sborda a 390px e scritte piccole | C1 | 🟡 | — | **RISOLTO** | ver122 | G7/G7b | — |
| US-03 | La **✕ della fattura** cancellava a secco (§10.1 la nomina) | C2 | 🟠 | — | **RISOLTO** | ver124 | `fix-b2` 7/7 | — |
| US-04 | I **negativi** nelle caselle numeriche | C2 | 🔴 | — | **RISOLTO** | ver125 | `ver125` 10/10 | — |
| US-05 | Due progetti con lo **stesso titolo** in silenzio | C2 | 🟠 | 🔴 (C3: la rinomina non era coperta e il Riepilogo **somma** i due) | **AGGRAVATO poi RISOLTO** | ver125 + ver127 | misurato 42 → 132 | — |
| US-06 | Il **filtro «progetto»** non agiva a schermo | C2 | 🟠 | — | **RISOLTO** | ver126 | `ver126` 7/7 | — |
| US-07 | L'avviso del filtro nominava una colonna sola | C3 | 🟠 | — | **RISOLTO** | ver127 + ver129 | `ver129a` 13/13 | — |
| US-08 | Importo della fattura formattato **a mano** (§10.2) | C3 | 🟠 | — | **RISOLTO** | ver127 | misurato con `grp` | — |
| US-09 | **La spunta verde dell'import mentiva** (0 operatori = «✓») | C4 | 🔴 | — | **RISOLTO** | ver128 | `ic-fix` | — |
| US-10 | **Record orfani**: ciò che in Dipendenti non esiste più finiva nell'Avanzo | C4 | 🟠 | 🟠 | **RISOLTO** (segnala, non cancella) | ver129 | `ver129b` 17/17 | — |
| US-11 | **Omonimi fusi in silenzio**: 70 ore perse in un mese | C4 | 🟠 *(sottostimato)* | 🔴 | **RICLASSIFICATO poi RISOLTO**: l'impatto misurato era perdita di dati | ver132 (avvisa) | `ver132us` 46/46 | — |
| US-12 | Un **numero scritto a mano** sostituito dall'import senza dirlo | C4 | 🟠 | 🟠 | **RISOLTO** (ora chiede) | ver132 | `ver132us` | — |
| US-13 | Un **accento** di differenza non abbinava: le ore si perdevano | C4 | 🟠 | — | **RISOLTO** | ver130 | `ver130us` 18/18 | — |
| US-14 | **Un mese di Dipendenti che perde le ore azzera il mese in USOINT con la spunta verde** | C4 | 🟠 | 🔴 | **AGGRAVATO — APERTO** (sparito da C5; rimisurato oggi: 20,00 → 0,00) | nessuna; dalla ver132 almeno non entra in archivio senza 💾 | `ric-U14-U17` | 🔴 **serve la sua decisione** |
| US-15 | L'import partiva da sé e **scriveva nel cloud senza 💾** | C4 | 🟠 | 🟠 | **RISOLTO** | ver132 | `ver132us` | — |
| US-16 | Nessun pulsante per **rifare** l'import | C4 | 🟡 | — | **RISOLTO** | ver131 | `ver131us` 19/19 | — |
| US-17 | I formati **« 4»** e **«.5»** valgono 0 | C4 | 🟡 | 🟡 | **RISOLTO il 12/11** («sistema»): **ver137**, `trim()` e punto o virgola iniziale ammessi; i codici e il segno meno restano scartati | **ver137** | `ver137us` **12/12**: 26 valori confrontati con la ver136, cambiano **solo** i 4 con spazio o punto iniziale | — **chiuso** |
| US-18 | Il **salvataggio locale si perdeva** al ricaricamento col cloud caduto | C4 | 🔴 | — | **RISOLTO** | ver129 (`uso-sospese-cloud`) | `ver129c` | — |
| US-19 | La finestrella del dettaglio **non seguiva il filtro** (42 contro 132) | C3 | 🟠 | — | **RISOLTO** | ver129 | `ver129a` | — |
| US-20 | Col filtro attivo i mesi a «—» non erano cliccabili | C3 | 🟡 | — | **RISOLTO** (conseguenza di US-19) | ver129 | `ver129a` | — |
| US-21 | **«1.234,56» battuto** diventa 1,234 | C3 | 🟠 | 🟠 | **INVARIATO — chiuso per DECISIONE** («9, vale sempre») | nessuna, voluto | — | 🚫 non si tocca |
| US-22 | **`rinominaTitolo` scriveva senza 💾** (deroga al §10.1) | C3 | 🟠 | 🟠 | **RISOLTO** | ver133 | `ver133us` 22/22 | — |
| US-23 | **`key={i}`** sulle righe delle fatture (§10.2) | C3 | 🟠 | 🟡 | **DECLASSATO** da Christian il 10/11 («3 ok»): i valori risultano sempre corretti | nessuna, accettato | prove ripetute | 🟡 |
| US-24 | **Due schede aperte si cancellano a vicenda**, e una scheda vecchia può far **risorgere** un lavoro eliminato | C4 | 🟠 *(sottostimato)* | 🔴 | **RICLASSIFICATO poi RISOLTO** | ver131 (timbro) | `ver131us` 19/19 | — |
| US-25 | **Un file con la forma giusta e il contenuto rotto rompe l'app e avvelena il cloud** | C5 | — | 🔴 | **RISOLTO** | ver134 | `ver134us` 21/21 | — |
| US-26 | Il backup non portava nessun numero di schema | C5 | — | 🟠 | **RISOLTO** | ver134 | `ver134us` | — |
| US-27 | La conferma di eliminazione **non nominava il lavoro** | C5 | 🟡 *(sottostimato: il §10.1 nomina le eliminazioni)* | 🟠 | **RICLASSIFICATO poi RISOLTO** | ver134 | `ver134us` | — |
| US-28 | **`uso122.js`** inutile nella radice del repository | C5 | — | 🟡 | **RISOLTO** | ver134 (tolto) | — | — |
| US-29 | La targhetta della **pagina integrata** è a 12px | C5 | — | 🟡 | ✅ **CHIUSO il 12/11 da Christian**: «va bene 12px» — l'eccezione del §10.6 vale ora **anche** per la pagina integrata, dichiarata | nessuna, per sua decisione | — | — **non riproporlo** |
| US-30 | Un **negativo nei dati di prova** (−2.000,00): esiste una casella in cui serve davvero? | ver125 | 🟠 | 🟠 | **NON PIÙ VERIFICATO**: domanda posta il 09/11 e **mai riscontrata**; sparita dai rapporti successivi | nessuna | — | 🟠 **serve la sua risposta** |

**DIPENDENTI**

| ID | Problema | Trovato | Prima | Dopo | Stato | Correzione | Prova | Definitiva |
|---|---|---|---|---|---|---|---|---|
| DIP-01 | Si potevano scrivere **99 ore in un giorno** | C2 | 🟠 | — | **RISOLTO** | ver142 (tetto 13 h) | `ore142` | — |
| DIP-02 | «Compila veloce» **non passava dal tetto** | C2 | 🟠 | — | **RISOLTO** | ver143 | `qf143` 11/11 | — |
| DIP-03 | «Compila veloce» accettava **testo libero** (22 celle) | C2 | 🟠 | — | **RISOLTO** | ver144 | `sc-dip-C` | — |
| DIP-04 | «Compila veloce» accettava i **negativi** (−3 su 22 celle) | C3 | — | 🔴 **NUOVO** | **RISOLTO** | ver148 | `sc-dip-A` | — |
| DIP-05 | **Due schede aperte si cancellano a vicenda** | C2 | 🔴 | — | **RISOLTO** | ver144 (timbro) | `ver144` 14/14 | — |
| DIP-06 | Un testo di 200 caratteri fa scorrere la pagina di lato | C2 | 🟡 | 🟡 | **INVARIATO — chiuso per DECISIONE** («pazienza») | nessuna, voluto | — | 🚫 non si tocca |
| DIP-07 | **Omonimi** fra Dipendenti e Fogli ore: il residuo di una finiva all'altra | C4 | 🔴 | — | **RISOLTO** | ver150 (avvisa, non somma) | `ver150` 31/31 | — |
| DIP-08 | Togliendo il massimale il **residuo pubblicato restava** per sempre | C4 | 🟠 | — | **RISOLTO** | ver149 | `ver149` 29/29 | — |
| DIP-09 | Nessun promemoria per **ripubblicare** i residui | C4 | 🟠 | — | **RISOLTO** | ver149 | `ver149` | — |
| DIP-10 | **Accenti e apostrofo finale** non si equivalevano | C4 | 🟠 | — | **RISOLTO** | ver149 (`foChiave`) | `ver149` | — |
| DIP-11 | **La griglia del Report PDF si spezzava in due pagine** (3 pagine sui dati veri) | C5 | — | 🔴 | **RISOLTO** | ver156 | `ver156` 19/19 su **PDF veri** | — |
| DIP-12 | **Due prove di interconnessione erano VIZIATE** | C5 | — | 🟠 (sul collaudo, non sull'app) | **RISOLTO** | script corretti | `ic-fodip-A` 20/0 · `ic-fodip-B` 21/0 | — |
| DIP-13 | **4 persone senza data di assunzione, 5 senza livello** nei dati veri | C1 | 🟡 | 🟡 | **INVARIATO — aperto**: dati da sistemare a mano, non difetti del codice | nessuna possibile da qui | censimento dei dati veri | 🟡 **lo fa Christian** |

**TRASVERSALI**

| ID | Problema | Trovato | Prima | Dopo | Stato | Correzione | Prova | Definitiva |
|---|---|---|---|---|---|---|---|---|
| TR-01 | **Arrotondamento**: `67,5 × 22,99` dava 1.551,82 invece di 1.551,83 | 03/11 | 🟠 | — | **RISOLTO in tutte e quattro** | `R2` | misurato in tutte e quattro | — |
| TR-02 | **Dati personali dentro `index.html`** su un repository pubblico | 01/11 | 🔴 | — | **RISOLTO**: svuotati, e la **storia del repository azzerata** il 02/11 | ver67/ver68 | C5: 18 file, **14 occorrenze tutte false** | — |
| TR-03 | **L'abbinamento fra le app è solo il NOME**, scritto a mano in due anagrafiche | sempre | 🟠 dichiarato | 🟠 | **RISOLTO l'11/11** («ok codice condiviso»): il **codice operatore** e l'aggancio all'account | ver157 · ver158 · ver136 (prima: ver130/132/149/150) | `ver157` 28/28 · `ver158` 24/24 · `ver136us` 17/17 | — **chiuso**; resta dichiarato il solo caso degli **omonimi dentro USOINT** |
| TR-04 | **Due falle nelle regole Firestore** | 30/10 | 🔴 | — | **RISOLTO**: Christian ha pubblicato il testo corretto | regole in console | emulatore **60/60** | — |
| TR-05 | Le due app React impiegano **~4 secondi** ad aprirsi (Babel nel browser) | C5 | 🟡 | 🟡 | **INVARIATO — accettato**: è il prezzo del file unico | nessuna | misurato | 🟡 |
| TR-06 | Le prove girano con **finta Firebase**: il comportamento con Firestore vero non è verificabile da qui | sempre | — | — | **NON PIÙ VERIFICATO per costruzione** | nessuna possibile | — | ⚠️ limite dichiarato |

**ELENCO DEFINITIVO DI CIÒ CHE RESTA, in ordine di urgenza:**

| # | Che cosa | ID | Chi decide |
|---|---|---|---|
| 1 | ~~Un mese svuotato in Dipendenti azzera il mese in USOINT~~ | US-14 | ✅ **CHIUSO l'11/11**: «non azzerare mai da solo e chiedere» → **ver135** |
| 2 | ~~Un importo negativo serve in qualche casella di USOINT?~~ | US-30 | ✅ **CHIUSO l'11/11**: «non serve». 🚫 Non riproporlo |
| 3 | ~~Gli utenti cancellati non si ricreano dal ripristino di Fogli ore~~ | FO-17 | ✅ **CHIUSO l'11/11**: «va bene così» — limite accettato e scritto nella conferma a video |
| 4 | ~~L'abbinamento fra le app è solo il nome~~ | TR-03 | ✅ **FATTO l'11/11**: il codice operatore (ver157 · ver158 · ver136). Resta dichiarato il solo caso degli **omonimi dentro USOINT** |
| 5 | ~~`locks` e ruolo `disabled` non imposti dal database~~ | FO-20 | ✅ **CHIUSO l'11/11**: «ok» — accettato |
| 6 | ~~Aprire un mese mai compilato **scrive** nel database~~ | FO-14 | 🚫 **CHIUSO il 12/11**: «1 lascia» — comportamento **voluto**, non riproporlo |
| 7 | ~~La **banda rossa unica** di Fogli ore~~ | FO-15 | ✅ **FATTO il 12/11** («2 banda in più»): **rev 17**, `rev17fo` 27/27 |
| 8 | ~~Il **PIN in chiaro** di Collaboratori~~ | OP-13 | 🚫 **CHIUSO il 12/11**: «no assolutamente hash». Il PIN resta in chiaro: **non riproporlo** |
| 9 | ~~La **targhetta della pagina integrata** a 12px~~ | US-29 | ✅ **CHIUSO il 12/11**: «va bene 12px» — eccezione ora **dichiarata** anche per la pagina integrata |
| 10 | ~~I formati « 4» e «.5» in USOINT~~ | US-17 | ✅ **FATTO il 12/11** («sistema»): **ver137**, `ver137us` 12/12 |
| 11 | ~~Il centesimo nella somma dei «secchi» di Collaboratori~~ | OP-11 | ✅ **FATTO il 12/11** («1 sistema»): **rev 17**. Insieme a lui è chiuso anche **OP-15** («2 insieme»), trovato indagandolo |
| 12 | **4 persone senza data di assunzione e 5 senza livello** | DIP-13 | 🟡 **in corso**: il 12/11 Christian ha risposto «**provvedo**» — lo sistema lui nei dati |



### 5.0 LE CORREZIONI AUTORIZZATE DOPO IL COLLAUDO DELL'11/11/2026

Il collaudo generale dell'11/11/2026 aveva trovato **quattro difetti gravi, tutti preesistenti**,
e li aveva **lasciati fermi** perché toccano il percorso dei dati (§10.3). Christian ha risposto
punto per punto lo stesso giorno. Queste sono le correzioni che ne sono nate.

| # | App | Difetto trovato dal collaudo | Risposta | Esito |
|---|---|---|---|---|
| 1 | Fogli ore | il **backup JSON non era una copia completa**: mancavano `svccaps` e `lightsheets` | «aggiungi» | **rev 16** |
| 2 | Fogli ore | **non esisteva nessun IMPORT**: il backup si poteva solo produrre, mai rimettere | «aggiungi» | **rev 16** |
| 3 | USOINT | un file **con la forma giusta e il contenuto rotto** veniva accettato, rompeva l'app e **avvelenava il cloud** | «chiudi» | **ver134** |
| 4 | Collaboratori | **«22,99» nel costo orario diventava 2299**, un errore di ×100 in silenzio | «correggi» | **rev 16** |
| 5 | USOINT + Fogli ore | il backup **non portava nessun numero di schema** (§10.1) | «SÌ» | **ver134** + **rev 16** |
| 6 | Fogli ore | 28 messaggi d'errore mostrano ancora il testo tecnico inglese di Firebase | «non serve» | 🚫 **non si tocca** |
| 7 | Collaboratori | **13 scritte a 11px** in tre finestre (§10.6 chiede 12,5px) | «ok» | **rev 16** |
| 8 | USOINT | `uso122.js` nella radice del repository, **non usato da nessuno** | «se necessario togli» | **tolto (ver134)** |
| 9 | USOINT | la conferma di eliminazione **non nominava il lavoro** | «sì» | **ver134** |

🚫 **Il punto 6 è una decisione presa: NON tradurre i 28 messaggi tecnici di Firebase in Fogli
ore.** Non riproporlo.

- ⌨️ **Collaboratori rev 16 (11/11/2026) — la virgola e le finestre.** Le caselle `#nR` (*Nuovo
  Operatore*) e `#nyR` (*Nuovo anno*) erano `<input type="number">`, e un campo di quel tipo
  **ingoia la virgola** prima che il JavaScript la veda: a `raw()` arrivava già `"2299"`, e
  10 ore facevano **€ 22.990,00** invece di € 229,90. Ora sono `type="text"
  inputmode="decimal"`, così il testo arriva intero a `raw()` e sul telefono la tastiera
  numerica compare lo stesso. ⚠️ `#nYr` (l'**anno**) resta `type="number"`: non ha decimali.
  Nello stesso intervento le 13 scritte a 11px delle finestre (*Nuovo Operatore*, *Nuovo anno*,
  *Report per data*) salgono a 12,5px — erano regole di **classe**, che il blocco della rev 8
  non vedeva. **Misurato**: `22,99` → 22,99 e € 229,90; scritte piccole da **13 a ZERO**; righe
  delle due tabelle dense **23·23·19·23·23·21 identiche**. Batteria completa **zero falliti**
  (20 script).

- 🛡️ **USOINT ver134 (11/11/2026) — il ripristino, lo schema, l'eliminazione e un file di troppo.**
  La guardia del ripristino della ver121 contava gli elementi la cui **chiave** comincia per
  `usoint`: validava la **forma**, non il **contenuto**. Un file di una riga
  `{"usoint-idx":"12345"}` veniva accettato, scritto **anche nel cloud**, e al ricaricamento
  l'app moriva con «TypeError: (projects || []).forEach is not a function»; «Reset e ricarica»
  puliva il browser **ma non il cloud**, quindi rientrando l'app tornava rotta **su qualunque
  dispositivo**. Ora si guarda dentro: ogni valore dev'essere JSON leggibile, `usoint-idx` un
  elenco di lavori, ogni `usoint-p-*` un oggetto; al primo guasto l'app elenca i motivi e dice
  «NON ho toccato niente, né nel browser né nel cloud». Insieme: il backup porta ora
  **`__schema`** (costante `USO_SCHEMA = 1`, §10.1) e il ripristino avvisa se manca e **rifiuta**
  uno schema più nuovo; la conferma di eliminazione **nomina il lavoro e il periodo**; e
  **`uso122.js`** (381 KB di JavaScript compilato della ver123, non usato da nessuno) è stato
  tolto dal repository. **Provato in esecuzione**: `ver134us` **21/21**, batteria completa
  **zero falliti nuovi** (21 script; l'unico fallito è un errore di pagina della **ver128**, la
  versione di confronto).

- 💾 **Fogli ore rev 16 (11/11/2026) — il backup completo e il ripristino che non c'era.**
  Il backup JSON **non era una copia completa**: mancavano `svccaps` (i massimali per servizio, il
  sistema in uso dalla rev 6) e `lightsheets` (tutti gli operatori light e le loro ore), mentre
  dentro c'era `caps`, il sistema vecchio e fermo dalla rev 6. Per **due collection su sei** quel
  file non era quello che il PROMEMORIA a video dice che è. E **non esisteva nessun import**:
  0 `input[type=file]`, 0 `FileReader`, nessuna funzione di ripristino, quindi un recupero
  richiedeva la console Firebase, contro il §10.1. Ora il backup porta **tutte e sei** le
  collection più il numero di **schema** (`FO_SCHEMA = 1`), e c'è **«📂 Ripristina backup JSON»**,
  che **prima valida il contenuto** (ogni collection dev'essere un elenco di documenti con un
  `id`) e **solo se valido** sovrascrive, con **due conferme** e un esito che, se qualcosa non
  entra, dice «**FINITO A META'**» invece di «completato».
  - 🔐 **Un limite vero, misurato con l'emulatore ufficiale e dichiarato nella conferma a
    video**: le regole danno all'admin `update` su `users` ma **non `create`**, quindi un utente
    il cui documento è stato **cancellato** non si può ricreare dal ripristino — deve
    registrarsi di nuovo, e poi il ripristino gli rimette ruolo e dati. Tutto il resto
    (`timesheets`, `lightsheets`, `svccaps`, `caps`, `locks`) l'admin lo riscrive. **Nove
    controlli nuovi** nel test delle regole: ora **60 su 60**. Le regole **non sono state
    toccate**: le pubblica Christian in console.
  - ⚠️ **`residui` NON è nel backup, di proposito**: lo scrive Dipendenti con *📤 Pubblica i
    residui* e si rifà da solo; in Fogli ore è di sola lettura.
  - **Provato in esecuzione**: `rev16fo` **33/33**, grafica `rev16fo-graf` **22/22** (a 390 · 768
    · 1280 · 1700px la larghezza è **identica** alla rev 15), batteria completa **zero falliti**
    (31 script + le regole).


- **App integrata** (§3): quattro pulsanti, link live, revisione visibile.
- **Dipendenti**, su `main`:
  - **targhetta ORE MESE** accanto a ORE SETT nella testata di ogni scheda lavoratore. Usa la
    funzione già esistente `monteFissoMese()` (165 h per 38 h/sett, riproporzionato), quindi
    coerente con la base della Banca ore; segue orari temporanei e trasformazioni.
  - **confronto non vincolante con Fogli ore**: nella vista mensile, per ogni dipendente abbinato
    per COGNOME NOME, un riquadro ambra se le ore inserite a mano non combaciano con quelle
    compilate in Fogli ore ("tu: X h · Fogli ore: Y h") e l'elenco dei giorni con assenza
    discordante. Solo lettura, solo avviso, ignorabile.
  - **ver69 (02/11/2026)**: tre cose, tutte in ANAGRAFICA. 1) *Data di avvio proroga* e *Data di
    avvio trasformazione* non si scrivono più a mano: erano **salvate e mai usate** da nessuna
    lettera e da nessun calcolo, ora sono di **sola lettura** e si ricavano da sole dal riquadro
    *Trasformaz./proroghe* (giorno dopo la scadenza precedente; decorrenza dell'ultima
    trasformazione). I vecchi valori restano nel database, non vengono cancellati; l'export Excel
    tiene le due colonne al loro posto con il valore automatico. 2) Pulsante **"Mensilizza tutti
    dal mese…"**: imposta la mensilizzazione su più persone in una volta, con conferma che elenca
    i nomi e possibilità di escludere chi non deve esserlo (serve per la mensilizzazione di tutti
    **dal 1° ottobre 2026**). 3) **Campi più vicini tra loro** nel modulo dell'anagrafica: modulo
    da 3298 a 3171 px, stessi 53 campi, altezza delle caselle invariata.
  - **ver70 (02/11/2026)**: due cose. 1) Nei quattro riquadri in fondo alla scheda (proroghe,
    trasformazioni, monte ore temporaneo, massimali) i pulsanti **"+ Aggiungi …" ora aprono le
    caselle**, che prima stavano sempre a vista; poi **✔ Aggiungi** registra e **Annulla**
    richiude svuotando. Quando il dato non basta, ora compare il **motivo** invece di non
    succedere niente. 2) La **mensilizzazione è la condizione normale dal 01/10/2026**: un
    dipendente nuovo nasce già mensilizzato da quella data e tutte le caselle di decorrenza
    partono da lì; i dipendenti esistenti si sistemano col pulsante "Mensilizza tutti", che chiede
    conferma. Scartata l'idea di considerarli mensilizzati per difetto senza il dato scritto.
  - **ver71 (03/11/2026) — nuova sezione 💶 COSTO ORARIO**. Porta dentro l'app il foglio Excel
    *Criteri orari* («Costo orario dipendenti»): per ogni dipendente, su un **periodo da-a**,
    calcola il **costo totale** (mensilizzata, 13ª e 14ª, festività non godute, maternità, ore
    aggiuntive, TFR e rivalutazione, INPS/FIS/INAIL/IRAP, assistenza sanitaria, paghe,
    formazione, km) e il **costo orario = costo ÷ ore rendicontate**. Le **ore rendicontabili**
    si prendono dai **Riepiloghi** (ore davvero lavorate del periodo), si scrivono **a mano**, o
    si usano quelle **teoriche**. I valori uguali per tutti stanno in un riquadro **Valori
    comuni**; la tendina del livello compila il **minimo tabellare** (Ott25/Ott24).
    Export Excel della tabella di tutti. Verificata sui **5 casi del file di Christian**
    (20,73 / 20,63 / 20,88 / 21,74 / 20,40 €/h): tornano al centesimo.
    Decisioni: addizionale TD 1,40% + 0,5 a ogni proroga, 0 se diventa indeterminato;
    assistenza sanitaria 132 € fissi solo per gli indeterminati; mesi contati interi.
    **Deciso di NON fare una quinta app**: sta dentro Dipendenti, dove ci sono già le persone,
    i contratti e le ore.
  - **ver72 (03/11/2026) — colore e densità**. Su richiesta di Christian il **rosa `#DE4C8A`
    sparisce da Dipendenti** (43 punti) e lascia il posto a una scala ricavata da **`#5a9ce2`**:
    `#2f6fae` sotto le scritte bianche, `#1f4e82` per il testo blu su bianco, `#5a9ce2` per bordi
    e accenti, `#eef5fc`/`#b9d5f1` per le velature. Le altre tre app non sono toccate: il rosa era
    solo lì. La sezione *Costo orario* è stata ridisegnata in **tre blocchi con un titolo** e il
    risultato è **una frazione** (costo sopra, ore sotto, €/ora in grande). **Regola permanente
    nuova**: *spaziature compatte sempre*, scritta in tutti e quattro i `CLAUDE.md` — si stringono
    gli spazi, non l'altezza di caselle e pulsanti.
  - **ver73 (03/11/2026)**: nel Costo orario il **rimborso km comune è 0** (chi ce l'ha se lo
    scrive nella propria scheda) e sotto le tre scelte delle ore c'è la **tabellina del foglio
    Excel** — settimane del periodo, settimane davvero lavorabili, ore settimanali, ore lavorabili
    — con le **due caselle delle settimane scrivibili**: serve a **simulare** il costo di un
    periodo futuro («6 mesi del 2027, 18 settimane lavorate»). Accanto resta sempre il valore
    calcolato e un pulsante rimette tutto com'era. Finché non si preme 💾 non si salva niente.
  - **ver75 (03/11/2026)**: Christian ha chiesto «se mettiamo le ore effettive prese dai TS,
    perché dare una percentuale convenzionale di straordinari? non l'abbiamo già?». Risposta:
    **sì, e l'app già si comportava così** — la *% di ore supplementari stimate* (10%, valore
    comune) agisce **solo** sulle ore **«Teoriche»**; con le ore **dai Riepiloghi** o **a mano**
    le supplementari si ricavano per differenza dal dato vero (ore rese − ore ordinarie attese,
    queste ultime già al netto di ferie, permessi, festività e malattia presunta), e la
    percentuale **non entra in nessun conto**. Il difetto era che il campo **non lo diceva**:
    stava sempre a vista come se agisse. Ora, quando nessun dipendente usa le ore «Teoriche»,
    l'etichetta diventa **grigia** e sotto compare «non in uso: serve solo con le ore
    «Teoriche»». ⚠️ La casella **resta scrivibile e giallina** (spenta nei conti, non bloccata):
    serve a impostarla prima di una simulazione. **Nessun calcolo toccato**: verificato in
    esecuzione che con le ore dai Riepiloghi cambiare la % da 10 a 20 lascia il costo orario
    identico (20,65 €/h), mentre con le «Teoriche» lo sposta (20,46 → 20,73 €/h).
- **Collaboratori**, sul ramo: **rev 3 (03/11/2026)** — passata di *frontend-design*. La palette
  "Material" presa in prestito lascia il posto alla stessa scala blu di Dipendenti; sparisce il
  magenta della pulsantiera Contratti; il colore ora dice **che tipo di azione è** (blu = dati e
  contratti, verde = report, grigio = anagrafiche, **rosso solo per cancellare**); via le scritte
  tutte maiuscole dalle etichette; spaziature strette. Non toccate le targhette della cadenza di
  pagamento: sono **valori salvati nei dati**.
- **Collaboratori rev 4 (03/11/2026)**: zeri delle caselle vuote leggibili (da `#c8ced6` a
  `#64748b`) e **rosso solo dove c'è un pericolo** — titolo dell'anno e fasce di sezione passano
  al blu, il rosso resta su *Elimina*, *Azzera credito residuo* e l'allarme «operatore a debito».
- **Collaboratori rev 5 (03/11/2026)**: dentro la scheda l'anno non entrava più in una schermata.
  Righe più basse **solo dentro le tabelle** (caselle da 40 a 28px; fuori resta tutto a 40px) e
  nuovo pulsante **«⤢ Adatta larghezza»** che rimpicciolisce quanto basta, con «100%» per
  tornare indietro; la misura scelta viene ricordata. Scheda da 943 a 864px di altezza.
- 📱 **USOINT ver122 (07/11/2026) — la scheda progetto non scorre più di lato sul telefono.**
  Dall'audit generale del gestionale, con il Nu\* di Christian. Difetti **preesistenti**, di solo
  aspetto: (a) a 390px la scheda progetto misurava **885px**, e il responsabile era **uno solo**,
  la barra in cima alla scheda che non andava a capo — la griglia del budget non c'entrava, sta
  già dentro un riquadro che scorre da sé. Aggiunto **un solo `className="uso-topbar"`** nel JSX
  di quella barra più una `@media (max-width:900px)`: ora **390px**; (b) restavano scritte sotto
  i 12,5px (il titolo in home a 12px, *Logout* a 10px, la fascia «🔓 LIBERO — RICORDA…» a **8px**,
  il Riepilogo operatori a 10,5-11,5px) → ora **zero**, con la griglia densa del budget esclusa.
  In più la **targhetta diceva «03nov26» in tre punti** mentre la ver121 era del 04/11: la regola
  9 chiede il numero **e** la data, ora dice **ver122 · 07nov26**. Nessuna dicitura, nessun dato,
  nessun calcolo. Provato in esecuzione: G5 9/9, G11 13/13, G6 25/25, G7 20/20, G7b 24/24.
- **USOINT ver120 (03/11/2026) — arrotondamento corretto**. Christian ha visto `67,5 × 22,99`
  arrotondato per difetto. Causa: il computer tiene `1551,8249999999998` e il vecchio
  `Math.round(x*100)/100` (e `toFixed`) buttavano giù a 1551,82 invece di 1551,83. Succede
  **quando il terzo decimale è esattamente 5**. Introdotta **`R2`**, usata in **84 punti** e
  dentro le funzioni che scrivono i numeri a schermo. ⚠️ Alcuni importi ora escono **un centesimo
  più alti**; sui negativi l'arrotondamento è diventato **simmetrico** (commerciale). Il motore di
  rendicontazione non è stato toccato. **Lo stesso difetto è nelle altre tre app** (Dipendenti 11
  punti, Fogli ore 11, Collaboratori 3 + 8): non ancora corrette, in attesa di Christian.
- **Arrotondamento corretto in TUTTE le app (03/11/2026)**: dopo USOINT ver120, la stessa
  funzione **`R2`** è stata messa anche in **Dipendenti ver74** (32 punti + `fmt2`/`fmt3`),
  **Fogli ore rev 5** (14 punti + `fmtDec`) e **Collaboratori rev 6** (4 punti + tutte le
  funzioni che scrivono i numeri). Regola d'ora in poi, scritta nei quattro `CLAUDE.md`: **mai
  `Math.round(x*100)/100`, sempre `R2`**. ⚠️ Sui negativi l'arrotondamento è diventato
  **simmetrico** (commerciale) in tutte le app.
- **Fogli ore rev 6 (03/11/2026) — un solo sistema di massimali**. Christian aveva messo a un
  operatore un tetto di 408 h sull'a.s. 2026/27 e risultava «0 ore consumate» pur essendoci le
  ore. Causa: in Fogli ore c'erano **due** sistemi. Quello vecchio (nella scheda dell'operatore)
  riconosceva le ore solo se coincidevano **mansione + sede + via + comune + alunno**, e i tre
  campi liberi nel modulo partivano **vuoti**: se nel foglio ore erano scritti, il tetto non
  trovava niente e mostrava zero **senza avvisare**. Quello nuovo (menù *Attribuzioni*, pulsante
  *METTI UN TETTO*) è agganciato alla riga del servizio e non confronta nessuna scritta.
  **Deciso: si usa solo il nuovo.** Il modulo vecchio è stato tolto dalla scheda dell'operatore e
  sostituito da un rimando; ⚠️ i massimali già creati **restano visibili e cancellabili**,
  nessun dato è stato toccato.
- 📐 **TUTTO IL GESTIONALE (08/11/2026) — compattazione: più roba a schermo, stessi colori e
  stesse altezze.** Richiesta di Christian: «REVISIONE GRAFICA COMPLESSIVA — l'interfaccia attuale
  presenta spaziature eccessive». Intervento **di solo CSS** su tutte e quattro le app **e sulla
  pagina integrata**: un blocco nuovo in fondo al `<style>` di ciascuna, **nessuna riga di
  JavaScript, nessun attributo HTML, nessuna classe nuova**.
  Revisioni: **Dipendenti ver134 · Fogli ore rev 11 · Collaboratori rev 9 · USOINT ver123 ·
  integrata rev 6**.
  - 🔑 **Tre scelte di Christian, prese con una domanda PRIMA di costruire**, perché la richiesta
    conteneva due contraddizioni interne: **(1) niente verde** — la codifica a colori per
    provenienza del dato non è ottenibile dal solo CSS, perché «parametro preassegnato» e
    «compilazione manuale» nel DOM sono **la stessa casella**, e il contrassegno andrebbe messo nel
    JavaScript, che il vincolo vietava («hai fatto bene a non fare»); **(2) i suoi colori vincono
    sempre** — nessun colore è stato toccato in nessuna app; **(3) le altezze non si riducono** —
    si stringono solo gli spazi, come vuole il §10.6.
  - **Guadagno in altezza, misurato a 390 · 768 · 1280 · 1680px** confrontando ogni app con la
    propria versione precedente, sugli stessi dati:
    | | guadagno |
    |---|--:|
    | Dipendenti · **Riepiloghi** | **−13,2% … −20,4%** |
    | Dipendenti · **Tabellone** | **−7% … −12,1%** |
    | Dipendenti · Anagrafica / Costo orario | −2,1% … −6,8% |
    | Fogli ore · Pannello admin | −5,2% … −8,1% |
    | Collaboratori · copertina | −5,1% … −7,5% |
    | Collaboratori · scheda | −3,4% … −4,7% |
    | USOINT · mesi / budget / riepilogo | −2,3% … −4,6% |
    | Pagina integrata · barra | −5,1% … −36,1% |
  - ✅ **Che cosa NON è cambiato, misurato in ogni vista e a ogni larghezza**: la **larghezza della
    pagina** (identica ovunque, nessuno scorrimento laterale nuovo); **tutte le griglie dense**
    (tabella del mese di Dipendenti **2282 → 2282px**, di Fogli ore **1009 / 1252 / 1652 →
    identiche**, celle della griglia del budget USOINT **41px e 56 celle → identiche**, righe delle
    due tabelle dense di Collaboratori **23·23·19·23·23·21 → identiche**); le **altezze dei
    comandi** (cella delle ore 34px, pulsanti ≥40px 9 su 9, **0 comandi sotto i 40px** fuori dalle
    tabelle in Collaboratori, pulsanti della barra integrata 48/46/50px); il numero di **scritte
    sotto i 12,5px** (identico in ogni vista). **Zero errori di pagina.**
  - 🐞 **Un difetto PREESISTENTE corretto**: in **Collaboratori a 390px la scheda sbordava**
    (misurati **415px su 390**) per la riga dei pulsanti che non andava a capo. ⚠️ La rev 8 non
    l'aveva visto perché provava su un backup con **un solo anno**. **Ora 390px esatti.**
  - ⚠️ **Due rinunce volute**: stringendo il contenitore, la tabella del foglio unico guadagnava
    4px e la griglia del budget 8px, perché sono larghe quanto lo spazio che trovano. Guadagno
    nullo, regola «dentro la griglia non si tocca niente» violata: le due regole laterali sono
    state tolte e resta solo il verticale.
  - 🔴 **RESTA APERTA la codifica cromatica delle celle** (giallo manuale / verde parametro /
    azzurro formula / bianco incerto). Oggi ogni app ha già una sua codifica parziale decisa da
    Christian — Dipendenti ha già giallo e azzurro, USOINT ha giallo-senape per il finanziato e
    rosa per il cofinanziato — e completarla significherebbe toccare colori suoi. **Non si fa
    senza una sua decisione nuova.**
- ⏱️ **Fogli ore rev 14 (09/11/2026) — l'attesa della rev 13 scadeva, e il difetto tornava.**
  Il secondo collaudo ha trovato un difetto **nella correzione stessa della rev 13**: l'attesa era
  di **5 secondi**, e con una linea piu' lenta scadeva mentre la registrazione stava ancora
  scrivendo. **Misurato**: sicuro a 4,5 s, **guasto a 5,5 s** — due scritture, il `name` uguale
  alla **mail** che vinceva nel database, e `set()` senza merge che **cancellava `cognome` e
  `nome`**. Corretto: tetto da 50 a 600 giri (la bandierina si abbassa sempre, quindi il ciclo
  finisce da se') e **`{merge:true}`**. Verificato con la scrittura rallentata a 3 · 4,5 · 5,5 · 7
  · **12 secondi**: una sola scrittura in tutti i casi. In piu': l'errore tecnico in inglese che
  arrivava all'operatore esterno ora e' una frase in italiano, e la schermata di **accesso** —
  dimenticata dal perimetro della rev 13 — non ha piu' scritte sotto i 12,5px (da 3 e 5 a zero).
  🟠 Segnalati a Christian e **non toccati**: la banda rossa dice «ORE NON SALVATE» anche
  quando si perde un'**assenza** (dicitura); gli account «battezzati con la mail» quando la
  registrazione cade a meta' (preesistente); e il mese che **si svuota a video** se cade anche la
  lettura (effetto collaterale della rev 12, nessun dato perso, misurato in simulazione).

- 🧾 **Fogli ore rev 13 (09/11/2026) — il nome al posto della mail, e le ultime scritte piccole.**
  Alla registrazione `onAuthStateChanged` scattava prima che il documento utente vero fosse
  scritto e ne creava uno con `name: u.email`: **due scritture in corsa**, e per tutta la prima
  sessione la testata diceva la mail. ⚠️ Con Firebase vero l'ordine non è garantito. Ora una
  bandierina fa **aspettare** il documento vero: **una sola scrittura**. Chiuse anche le tre
  scritte sotto i 12,5px fuori dalla tabella del mese (linguette dei servizi a 9 e 12px).
  **9 controlli su 9.**
- 🚫 **Collaboratori rev 11 (09/11/2026) — niente negativi, e avviso sui nomi doppi.**
  Il collaudo aveva misurato che `-5` nelle ore **sottraeva** senza avviso. La correzione è in
  `raw()`, il punto unico da cui passano i numeri scritti a mano; verificato prima che nessuna
  sua chiamata legge dati salvati, quindi le rettifiche calcolate dall'app non sono toccate.
  Aggiunto l'avviso **non bloccante** sui nomi doppi. **8 controlli su 8.**

- 🚫 **Collaboratori rev 12 (09/11/2026) — i negativi chiusi anche dalle altre tre porte.**
  Il secondo collaudo ha dimostrato che la rev 11 aveva chiuso **meno** di quanto dichiarava: la
  frase «raw() è il punto unico da cui passano tutti i numeri scritti a mano» non regge, perché
  è il punto unico delle caselle delle **tabelle**. Tre caselle non ci passavano e il difetto A4
  era ancora aperto da lì: **«Costo orario €» del Nuovo Operatore** (misurato: `-10` dava tariffa
  −10 e la scheda mostrava «−€ 100,00» per 10 ore), **«Costo orario predefinito €» del Nuovo
  anno**, e **«Importo €» del pannello della riga in blocco** (letto con `euroIn`, che ammette il
  meno per costruzione). Corrette tutte e tre. Chiuso anche l'ultimo **`f2()` scoperto dentro un
  `confirm`** (il difetto B5 che la rev 10 doveva chiudere): con **0,0001 ore** il dialogo mostrava
  ancora `<span class="zero">0,00</span>`.
  🟠 Segnalate a Christian e **non toccate**: `1.234,56` nelle ore diventa **1,23** (difetto
  preesistente, ma il §10.2 chiede il contrario), e un negativo già in archivio si vede per un
  istante senza il meno dopo un entra/esci dalla casella (effetto collaterale della rev 11, solo a
  video, dato intatto).

- 🧹 **Collaboratori rev 10 (09/11/2026) — niente più codice HTML nelle finestre.**
  `f2()` e `fE()` restituiscono HTML su zero e negativi, e dentro un `confirm()` i tag si
  vedevano scritti («Residuo iniziale: `<span class="zero">0,00</span>`»). Nuova `soloTesto()`
  usata nei tre dialoghi; `f2` e `fE` non toccate. Chiuse anche tre scritte a 12px fuori dalle
  tabelle. **8 controlli su 8**, righe delle tabelle dense invariate.

- 🔴 **Fogli ore rev 12 (09/11/2026) — anche l'assenza non si perde più in silenzio.**
  È lo stesso difetto chiuso nella rev 10 per le ore, rimasto aperto per le **assenze**, che non
  passano da `saveTS`: con il collegamento caduto l'eccezione impediva il ridisegno, **la banda
  rossa non compariva**, la tendina continuava a mostrare «FERIE» e **ricaricando l'assenza era
  sparita** — in un'app che non tiene copia locale. Ora il `batch.commit()` sta in un
  `try/catch`: il batch è atomico, quindi si buttano dalla cache le chiavi toccate e la pagina
  torna a dire la verità, con banda rossa e avviso. **13 controlli su 13.**
- 🧪 **COLLAUDO GENERALE DEL 09/11/2026 — che cosa è stato davvero provato, e che cosa ne è
  uscito.** Richiesta di Christian: due collaudi, il secondo con una **matrice obbligatoria**
  (copertura generale, per applicazione, delle integrazioni, dei casi negativi, della grafica).
  - **Numeri**: **1.714 controlli eseguiti** fra i due giri. Primo giro 899 (842 superati);
    secondo giro 815 più 16 dichiarati non applicabili, di cui **Collaboratori 154**
    (148 superati), **USOINT 275** (266), **Fogli ore 239** (224) e il resto su Dipendenti,
    integrazioni, casi negativi, prestazioni e privacy.
  - **Ambiente**: quattro app servite in locale con una **finta Firebase** e un **finto jsPDF**,
    più l'**emulatore ufficiale Firestore** per le regole di sicurezza (**51 su 51**).
  - **Nove difetti trovati, tutti corretti in giornata**: l'assenza che si perdeva in silenzio in
    Fogli ore (il più grave), la ✕ della fattura senza conferma in USOINT, due schede di
    Dipendenti che si cancellavano a vicenda, «Compila veloce» che accettava testo libero, il
    tetto delle ore al giorno, la mail al posto del nome dopo la registrazione, il codice HTML
    nelle finestre di Collaboratori, i numeri negativi accettati ovunque, e le ultime scritte
    sotto i 12,5px. Più **tre cognomi tolti da `master.md`** (regola privacy).
  - **Prestazioni misurate** (Dipendenti): apertura 3,3 s, Tabellone 196 ms con 16 persone e
    **480 ms con 60 persone e 40.320 celle**; salvataggio 107 → 981 ms; backup 93 → 1.032 ms.
    18 misure su 18 entro soglia.
  - ⚠️ **Non verificabile da qui, e dichiarato**: Firebase vera, il disegno vero del Report PDF,
    le lettere .docx, Google Drive, gli utenti simultanei veri e il **collaudo in
    pre-produzione** sull'ambiente pubblicato.

- 🔗 **COLLAUDO DELLE INTERCONNESSIONI (09/11/2026) — 415 controlli in esecuzione.**
  Mappati e provati tutti e sei i collegamenti del gestionale: **Fogli ore → Dipendenti** (ore e
  assenze, sola lettura: 39 controlli, **zero** scritture di Dipendenti su `users`/`timesheets`),
  **Dipendenti → Fogli ore** (il residuo: 41 controlli; dimostrato il percorso intero — 6 ore
  scritte in una cella → «Già usate» 48→54 → documento 54/649 → l'operatore legge 649,00 h),
  **Dipendenti → USOINT** (ore lavorate: 131 controlli), **USOINT ↔ suo cloud** (36),
  **pagina integrata** (19) e **Collaboratori**, che risulta **isolata** (24).
  ✅ **Corretti subito due difetti che perdevano dati**, perché la correzione era già imposta dalle
  regole: **Collaboratori rev 13** (un file JSON qualunque, es. `[1,2,3]`, veniva importato,
  sostituiva l'archivio e lasciava la **pagina bianca**) e **USOINT ver128** (la spunta verde
  «importate ✓» compariva anche con **zero ore**, quando il collegamento era su un altro account).
  🟠 **Restano in attesa di una decisione di Christian** (consegnate in un elenco di 21 punti): i
  **dati orfani** in USOINT quando in Dipendenti si cancella; gli **omonimi** che fondono o
  perdono ore in **entrambi** i collegamenti (l'unico identificativo che attraversa il confine è
  il **nome**, non un codice); le ore scritte a mano sostituite dall'import; l'import che scrive
  nel cloud **senza 💾**; **due schede** che si cancellano a vicenda in **USOINT e
  Collaboratori** (in Dipendenti è già protetto dalla ver144) e, in USOINT, una scheda vecchia che
  può **far risorgere un lavoro eliminato**; e il salvataggio locale di USOINT che **sparisce** se
  si ricarica con la linea ancora giù.
  ⚠️ **Non verificabili dal banco di prova**: Firebase vero con le sue regole, due **computer**
  diversi che salvano insieme (nel codice l'ultimo vince), Google Drive, e le app vere dentro
  l'iframe della pagina integrata.

- 🔬 **COLLAUDO GENERALE DELL'INTERO GESTIONALE — 11/11/2026.** Quattro app più la pagina
  integrata, provate **una per una** e poi **fra loro**: **~2.570 controlli, 2.542 superati**.
  Le quattro anomalie **gravi** sono **tutte preesistenti** e riguardano **la sicurezza dei dati
  e l'inserimento**, non le novità delle ultime revisioni.
  | App | esito | anomalie aperte |
  |---|---|---|
  | **Dipendenti** ver156 | 898 superati · 8 falliti (gli stessi di sempre, attese dei miei script) | **nessuna** |
  | **Fogli ore** rev 15 | 509 superati · 3 falliti | **2 gravi**: il backup JSON **non contiene `svccaps` né `lightsheets`**; **non esiste nessun import** |
  | **Collaboratori** rev 15 | ~500 superati · 15 falliti | **1 grave**: «22,99» battuto nel costo orario diventa **2299** (`type="number"` ingoia la virgola); **1 media**: 13 scritte a 11px in tre finestre |
  | **USOINT** ver133 | 665 superati · 38 falliti (quasi tutti targhette invecchiate) | **1 grave**: un file di ripristino con la forma giusta e il contenuto rotto è accettato, rompe l'app e **avvelena il cloud**; **1 media**: backup senza numero di schema |
  | **Pagina integrata** rev 6 | 36/36 | targhetta a 12px (eccezione non dichiarata) |
  - **Interconnessioni: 320 controlli, ZERO falliti.** Provati tutti e tre i canali reali, con le
    app vere nello stesso browser: **Fogli ore → Dipendenti** (lettura di `users`/`timesheets`,
    con accenti e apostrofo equiparati), **Dipendenti → `residui` → Fogli ore** (pubblicazione,
    cancellazione quando il tetto sparisce, privacy fra operatori), **Dipendenti → USOINT**
    (import delle ore, omonimi segnalati e non importati, numero scritto a mano chiesto prima di
    sostituirlo, tutto legato al 💾). **Nessuna app scrive mai dove non deve**: zero scritture di
    USOINT su `report-ore-mensile`, zero di Dipendenti fuori da `residui`.
  - **Flusso completo F2 provato end-to-end** (14/14): si scrivono le ore in Dipendenti → 💾 →
    USOINT le importa → 💾 → si cambia il dato in Dipendenti → ↻ Rileggi → il numero segue, senza
    righe doppie.
  - **Regole di sicurezza Firestore rieseguite** con l'emulatore ufficiale sul testo dichiarato
    pubblicato: **51 controlli su 51**.
  - **Nessun dato personale nei repository**: cercati 31 pezzi di nome in 18 file, 14 occorrenze
    tutte false (nomi comuni, tabella dei comuni, parole).
  - 🔬 **Da oggi il PDF si può guardare davvero**: jsPDF 2.5.1 e autotable 3.8.2 — le stesse
    versioni del CDN — installati da npm e serviti in locale; il PDF si scarica, si conta con
    `pdfinfo` e si rende in immagine. È così che si è scoperto che la griglia delle presenze
    **non stava in una pagina** (corretto con la **ver156**).

- 🖨️ **Dipendenti ver156 (11/11/2026) — il PDF ora si vede davvero, e le presenze stanno in
  una pagina** (Christian: «i report pdf devono stare su una pagina il primo e va bene anche su
  due quello per l'ufficio paghe»).
  - 🔬 **Cade il limite dichiarato da sempre**: `jspdf@2.5.1` e `jspdf-autotable@3.8.2` — le
    **stesse versioni del CDN** — si installano da **npm** e si servono in locale (banco nuovo
    `scratchpad/sitopdf/`, porta 8300, con `dip/` di oggi e `dip155/` per il confronto). Il PDF
    si scarica davvero, si conta con `pdfinfo`, si legge con `pdftotext` e **si guarda** con
    `pdftoppm`. ⚠️ Da qui in avanti nessun report PDF si consegna senza averlo generato e contato.
  - 🔴 **Misurato**: la **ver155** faceva **3 pagine** sui dati veri di ottobre 2026 (la griglia
    delle presenze si spezzava su due) e **4** con 24 persone. La **ver156** ne fa **2** e **3**,
    con le presenze sempre in **una pagina sola**. La pagina per l'ufficio paghe **non è stata
    toccata**: può andare su due, l'ha detto lui.
  - **Come**: una misura calcolata che stringe imbottitura → righe col permesso → carattere, e
    poi una **verifica vera** (la tabella si disegna su una pagina di prova, si contano le pagine
    con `getNumberOfPages()`, le prove si cancellano e se serve si stringe ancora).
  - 🐞 **Un errore mio, trovato dal PDF vero e non dal finto**: la prima stesura aveva infilato
    `misura.fs`/`misura.hPerm` anche nel **Report storico**, che andava in errore e non produceva
    più niente. Babel compilava lo stesso. Corretto, e verificato che il testo del Report storico
    è **identico** a quello della ver155.
  - **Provato in esecuzione**: `ver156` **19/19** su PDF veri, `ver153` 41/41, `ver154` 41/41,
    `ver155` 18/18, zero errori di pagina. I **dati** del report mensilizzati sono identici alla
    ver155 (nessun numero cambiato).

- 🗑️ **Dipendenti ver155 (11/11/2026) — un valore rimasto su un giorno rosso si può
  togliere, e il giorno resta bloccato** (punto 1: «togli», «se però poi sarà nuovamente
  possibile bloccare i gg rossi»).
  Le **7 celle `FESTNG`** dei dati veri stanno **tutte su domenica 7 dicembre 2025** e dalla
  ver77 non erano né correggibili né togliibili. Ora sotto la cella c'è un **🗑 togli**:
  ⚠️ **non sblocca niente** — la casella resta disabilitata, il giorno resta rosso e scrivere
  resta impossibile; il pulsante toglie e basta, e sparisce appena la cella è vuota.
  🔑 **Compare SOLO su `FESTNG`**: sui giorni rossi dell'archivio ci sono **922** celle con un
  valore, ma sono quasi tutte dati veri (**695 `--`**, **153 `FEST`**, 34 `MAT-OBB`…), e un
  🗑 su tutte sarebbe stato un invito a cancellarli. Conferma esplicita, e la cancellazione
  va **solo in memoria**: serve il 💾.
  **Provato in esecuzione**: `ver155` **18/18**, `graf155` **15/15**, `graf155b` **4/4**, zero
  errori di pagina; grafica identica a 390 · 1280 · 1700px e **tabella del mese 2283px
  invariata**.

- 🧾 **Dipendenti ver154 (11/11/2026) — il report delle paghe diventa una tabella sola, con le
  ore voce per voce.** Quattro risposte di Christian nello stesso giorno.
  - **«Tutto in un'unica tabella»**: la pagina per l'ufficio paghe aveva due tabelle (gli importi
    e «I giorni, voce per voce»). Ora è **una sola**, e le assenze retribuite sono **colonne in
    ORE**, una per ogni codice davvero usato nel mese: `Ore dovute · Ore rese · FERIE (h) ·
    EXF (h) · MAL (h) · … · Permessi (h) · Fest. godute (h) · **SUPPLEMENTARE** · Fest. non
    godute (gg / h) da pagare in più · FESTNG (gg) · ASP 0h (gg) · AN (gg) · Riposi (gg · dom.)`,
    più il TOTALE. Le non retribuite, gli AN e i riposi restano **in giorni**: quelle ore non
    sono dovute.
  - **«in calce … tutti i totali dei giorni di assenza retribuita e non retribuita»**: sotto la
    griglia delle presenze non c'è più solo «gg P» ma **una riga per voce**, e con MAXCOL da 14
    a **24** i 16 mensilizzati stanno in **una pagina sola**.
  - **«NON METTERLA»**: le **quattro righe di legenda** in calce sono state **tolte**, come la
    legenda del Report storico nella ver95. Restano l'avviso sui mesi prima di ottobre 2026 e
    l'elenco dei permessi orari.
  - **«2 uniforma su monte/26»**: la quota delle **festività non godute** passa a `quotaGiorno`
    (ore dovute ÷ 26), la stessa del Costo orario. Misurato: `2 / 6,000` → `2 / 6,012`.
    ⚠️ Le **godute** restano a `oreSett/ggSett` (ver119): due quote diverse di proposito.
    Il **supplementare non si muove**.
  - **«10 togli»**: via il verde brillante `#CCFF66` dalla palette; al suo posto `#8FA860`, le
    altre 23 tinte non si spostano, e chi aveva il verde ci passa al caricamento — **in memoria,
    serve il 💾**.
  - **Provato in esecuzione**: `ver154.cjs` **41/41**, zero errori di pagina.
    ⚠️ **Non verificabile dal banco di prova**: l'impaginazione vera del PDF.
  - ✅ **Scatti CCNL (punto 6)**: Christian ha mandato la **tabella ufficiale**, che coincide
    **esattamente** con `SCATTI_CCNL` su tutti e 13 i livelli e conferma `SCATTI_MAX = 5`
    (D1: 20,66 · massimo 103,30). **La voce dei 61,98 € è smentita: non riproporla.**

- 💾 **USOINT ver133 (11/11/2026) — rinominare un lavoro passa dal 💾** («8 sì»). Era l'ultima
  deroga al «mai salvataggio automatico»: la ✎ scriveva subito, e col rinvio di `LS.set` anche
  nel cloud. Ora accende il 💾; `save` riallinea **anche l'elenco della Home** (il titolo vive in
  due posti) e **uscire con ← senza aver salvato viene CHIESTO** — guardia nuova che vale per
  **qualunque** modifica non salvata della scheda, difetto preesistente senza il quale la
  rinomina si sarebbe persa. **Provato**: `ver133us.cjs` **22/22**, zero errori di pagina.
  ✅ **Punto 9 chiuso senza toccare niente** («9, vale sempre»): `1.234,56` **battuto** a mano dà
  `1,234`, ma lui non scrive mai le migliaia puntate — **vale in tutte e quattro le app**.

- 🖨️ **Dipendenti ver151 · ver152 · ver153 (11/11/2026) — il report per l'ufficio paghe,
  e le cinque cose che mancavano sul Tabellone.** Richiesta di Christian: un PDF A4 che segnali
  **giornalmente** la presenza con **P**, oppure **AN**, oppure il codice dell'assenza, e **a
  parte** il **supplementare** da dare all'ufficio paghe che elabora i cedolini dei
  **mensilizzati**; più «devo vedere per ognuno sul tabellone ore ordinarie effettivamente rese,
  ore di assenza retribuita (suddivise per voce), ore di assenza non retribuita, riposi
  domenicali, supplementari». Sue decisioni: il supplementare è il **Risultato del mese** del
  Tabellone e **può essere negativo o pari**; dentro **solo i mensilizzati**; **`MAL 0h` e
  `CASSA` sono retribuite**, **`ASP 0h` no**, **`FESTNG` è retribuita ma si paga IN PIÙ** e non
  entra nel calcolo; il **4 novembre** vale come un festivo in domenica, quindi le non godute le
  conta il **calendario** perché lui non le scriverà mai nel Tabellone; nome del pulsante scelto
  da lui: **«🖨️ Report PDF A4 mensilizz.»**.
  - **ver151 — i conti**: funzioni nuove **`copreOre`** (il punto unico che decide chi copre le
    ore dovute) e **`assMese`** (giorni e ore, **per voce**, più riposi e domeniche).
    `coverAbsHours` **non è stata riscritta: ora delega**, quindi per i codici che coprivano già
    il numero è identico. `bancaMeseA` somma ora anche i **permessi orari** (sua scelta **2a**),
    così il **totale dell'anno** e il **Report** dicono la stessa cosa del riquadro del mese, che
    li contava dalla ver93.
  - **ver152 — sul Tabellone**, sotto ogni scheda, una riga nuova con le pastiglie: assenze
    retribuite **per voce**, non retribuite, la pastiglia **FESTNG — si paga in più** e i
    **riposi (di cui domeniche)**. Nessun calcolo nuovo.
  - **ver153 — il PDF**, accanto a quello che c'era (**`esportaPDF` non è stata toccata**):
    pagina delle **presenze** (P verde, AN, R, i codici col loro colore, riga «gg P») e pagina
    **per l'ufficio paghe** (ore dovute · rese · assenze retribuite · festività godute · permessi
    · **SUPPLEMENTARE** col segno · **festività non godute da pagare in più**, più il TOTALE), e
    una terza tabella **«I giorni, voce per voce»**.
  - 🔴 **Misurato sui dati veri prima di toccare qualunque cosa**: `ASP 0h` **0** celle,
    `MAL 0h` **27** (tutte ≤ set-2026), `FESTNG` **7** (tutte dic-2025), permessi orari **0**,
    mensilizzati **16 su 16** dal 01/10/2026. Quindi `bancaMeseA` cambia in **7 casi, tutti in
    dicembre 2025**, e in **nessuno di ottobre 2026** (il mese che va in paga); il **totale
    dell'anno è identico per tutti e 16**; nei Riepiloghi i 27 giorni di `MAL 0h` passano da
    **non retribuiti a retribuiti**. ⚠️ **Conseguenza dichiarata**: `coverAbsHours` serve anche
    al **Costo orario**, quindi i periodi che **contengono dicembre 2025** cambiano di poco:
    **misurato**, gennaio → ottobre 2026 è **identico per tutti e 16** (0 differenze), mentre
    gennaio → dicembre 2025 cambia su **4 schede su 16** (il costo **scende** di 3,41 € ·
    36,00 € · 51,03 € · 53,85 €, e le **ore non cambiano**): è il verso giusto, perché un
    `FESTNG` non copre più le ore dovute e quindi le ore aggiuntive al +27% scendono.
  - **Provato in esecuzione**: `ver151.cjs` **27/27**, `ver152.cjs` **23/23**, `ver153.cjs`
    **46/46**, zero errori di pagina; la **grafica misurata** (scritte sotto i 12,5px 7 → 7,
    comandi sotto i 32px 140 → 140, larghezza di pagina identica a 390 · 1280 · 1700px).
    ⚠️ **Non verificabile dal banco di prova**: l'**impaginazione vera** del PDF (jsPDF non è
    raggiungibile), che deve guardare Christian su un foglio vero.
    **Batteria di Dipendenti rieseguita, confrontata con lo storico, zero falliti nuovi**:
    `sc-dip-A` 38/3 · `sc-dip-B` 32/2 · `sc-dip-C` 106/1 · `sc-dip-D` 11/0 · `ver144` 14/0 ·
    `ver145` 7/0 · `ver146` 27/1 · `ver147` 26/1 · `ver149` 29/0 · `ver150` 31/0 ·
    `ic-fodip-A` 19/1 · `ic-fodip-B` 20/1/1 · `nr153` 5/0.

- 🛡️ **USOINT ver132 (10/11/2026) — l'import non scrive più da sé, e non sovrascrive più in
  silenzio** (punti **1** «avvisa», **7** «avvisa» e **9** «lega al salva»).
  (1) **Omonimi**: due schede di Dipendenti che finiscono sulla stessa chiave non si fondono più.
  Prima **vinceva l'ultima** (misurato dal collaudo: **77 invece di 70+77**, cioè 70 ore perse);
  ora le loro ore **non si importano** e un riquadro rosso le nomina, spiegando che per sbloccarle
  si distinguono i nomi in Dipendenti. ⚠️ «Avvisa», **non** «somma».
  (7) **Un numero scritto a mano viene CHIESTO prima di sostituirlo**: una chiave di servizio
  nuova, `uso-import-orig`, tiene la **provenienza** (che cosa aveva scritto l'import l'ultima
  volta); se in archivio c'è un numero diverso, un `confirm` elenca le caselle e **Annulla** le
  lascia come sono, importando comunque il resto. ⚠️ La **prima volta non avvisa**: la
  provenienza non esiste ancora.
  (9) **L'import è legato al 💾**: era l'unico scostamento **non dichiarato** dal §10.1, perché
  `_dipImport` scriveva da sé in `localStorage` e, col rinvio di 1,5 s, anche nel cloud. Ora mette
  le ore a schermo, dice «**non sono ancora salvate**» e mostra il 💾 **nel riquadro del
  collegamento** (quello della tabella si vede solo con un operatore selezionato); e **uscire
  dalla schermata senza salvare viene CHIESTO**, perché ← Indietro smonta la vista e le ore
  andrebbero perse — ⚠️ vale **anche** per le ore scritte a mano in quella tabella, che prima
  si perdevano senza un fiato (difetto **preesistente**).
  ⚠️ Le due chiavi di servizio **non cominciano per «usoint»**, quindi il **backup JSON e il
  cloud restano identici**. **Provato in esecuzione**: `ver132us.cjs` **41/41**, zero errori di
  pagina. ✅ **Non regressione misurata**: senza omonimi e senza numeri scritti a mano, dopo il
  💾 i numeri sono **identici alla ver131**. 🐞 La batteria ha trovato **due pulsanti troppo
  bassi** (25px il «↻ Rileggi le ore dai Dipendenti» della ver131, cioè una mia regressione
  rimasta aperta): alzati entrambi a 34px, così i comandi sotto i 32px nel Riepilogo tornano
  **8, come nella ver122**. **Batteria rieseguita, zero falliti nuovi** (19 script).

- ✅ **Dipendenti ver150 — non regressione numerica**: **ver148 e ver150 danno costo, ore e
  €/h identici per tutti e 16 i dipendenti veri** (gen→ott 2026, **0 differenze**), e la
  batteria (12 script) dà gli **stessi conteggi** del record della ver149.
  🐞 Lo script del confronto (`nr149`) era stato **rotto da una mia modifica all'etichetta** e
  andava in errore: corretto e rieseguito, perché altrimenti la non regressione non era
  dimostrata.

- 👥 **Dipendenti ver150 (10/11/2026) — due persone con lo stesso nome non si fondono più in
  silenzio** (punto **1** dell'elenco, risposta di Christian: «**avvisa**»).
  Due casi, tutti e due silenziosi: **due account in Fogli ore** con lo stesso nome (il confronto
  mostrava le ore di una sola persona) e **due schede in Dipendenti** con lo stesso nome
  (📤 Pubblica i residui scriveva **due volte sullo stesso documento** `residui/<uid>`;
  misurato sulla ver149: due schede che dicono **655** e **703** h, e nel database resta **703**).
  Ora un **riquadro rosso** nella scheda del mese dice quante schede o quanti account hanno quel
  nome, il **confronto è sospeso**, il **residuo non viene pubblicato** e la conferma della
  pubblicazione li elenca sotto «OMONIMI (saltati…)». ⚠️ Un residuo **già pubblicato** per un
  nome diventato ambiguo **non viene né riscritto né cancellato**.
  Funzioni nuove: `foRaggruppaPerChiave`, `foOmonimiUtenti`, `dipOmonimi`.
  **Provato in esecuzione**: `ver150.cjs` **31/31**, zero errori di pagina.
  ✅ **Non regressione misurata**: senza omonimi la riga del confronto è **identica** alla ver149
  e la pubblicazione scrive **gli stessi residui con gli stessi numeri**.

- ✅ **Punti 18 e 19 dell'elenco: CHIUSI DA CHRISTIAN SENZA TOCCARE NIENTE** (10/11/2026, sua
  risposta «3 ok»). **18** — in USOINT le righe delle fatture sono identificate dalla
  **posizione** (`key={i}`, che il §10.2 vieta): cambiarlo richiede un identificativo stabile per
  ogni fattura, cioè toccare il modello dei dati. **19** — le quattro app stanno sulla **stessa
  origine**, quindi condividono un solo `localStorage`, e la separazione è data solo dal prefisso
  delle chiavi; ⚠️ **oggi non fa danni, misurato**. Entrambi sono **limiti dichiarati e
  accettati**: non vanno riproposti.

- 🔗 **Dipendenti ver149 (10/11/2026) — tre risposte di Christian sul collegamento con Fogli
  ore** (punti **5** «Ricorda», **6** «Se tolgo il tetto, non deve vedere più niente»,
  **8** «Ignorali e attenzione a accenti e apostrofi in fine di parola»).
  (1) **Togliendo il massimale il residuo si CANCELLA**: prima il documento restava e l'operatore
  leggeva «Ti restano 649,00 h» per sempre. Ora la pubblicazione legge la collection `residui` e
  cancella il documento di chi non ha **più nessun massimale**, dicendolo nella conferma.
  ⚠️ Si guarda «nessun massimale in scheda», **non** «nessuno per il mese che guardo»: misurato
  che aprendo un mese fuori dal periodo **non viene toccato niente**. I residui che non
  corrispondono a nessun dipendente di oggi non si toccano.
  (2) **Il promemoria di ripubblicare**: quanto è stato pubblicato si tiene da parte in una
  chiave di servizio (fuori dai dati, come il timbro della ver144) e, se i numeri di oggi sono
  diversi, un riquadro giallo nella barra del Tabellone nomina le persone e dice di premere
  📤 Pubblica i residui.
  (3) **Accenti e apostrofo finale si equivalgono**: l'unico identificativo che attraversa il
  confine fra le app è il nome scritto a mano in due anagrafiche, e «NICOLO'» e «NICOLÒ» erano
  due persone diverse. Funzione nuova `foChiave` (NFD + apostrofo finale), usata **solo per
  confrontare**: `foNorm`, che serve a come il nome si vede, non è stata toccata. Misurato nel
  percorso vero: «FERRARÈ» e «FERRARE'» si abbinano.
  ✅ **Non regressione misurata**: ver148 e ver149 danno **costo, ore e €/h identici per tutti e
  16 i dipendenti veri** (gen→ott 2026, 0 differenze).
  **Provato in esecuzione**: **29 controlli su 29**, zero errori di pagina.

- 🗣️ **Fogli ore rev 15 (10/11/2026) — tre risposte di Christian, tutte sulle scritte che
  mancavano** (punti **13** «Cambiala», **14** «Richiedi al primo accesso», **15** «Aggiungi»).
  **Nessun calcolo e nessun dato toccato.**
  (1) **La banda dice quale cosa non è stata salvata**: diceva «ORE NON SALVATE» anche quando si
  perdeva un'**assenza**, e indicava il 💾, che l'assenza non la rimette. Ora per l'assenza dice
  «**ASSENZA NON SALVATA** — … il 💾 Salva non la rimette: riscegli l'assenza dalla tendina».
  ⚠️ Il testo delle ore resta identico carattere per carattere.
  (2) **«NON HAI PERSO NIENTE»**: era l'effetto collaterale della rev 12 misurato e non corretto
  (se cade anche la lettura, tutto il mese si svuota a video: 186 caselle su 186). Ora una
  **seconda banda, blu**, spiega che i dati sono nel database e che basta ricaricare quando torna
  la linea; sparisce da sé al primo documento riletto.
  (3) **Il nome chiesto al primo accesso**: gli account «battezzati con la mail» (registrazione
  caduta a metà) erano un difetto preesistente rimasto aperto. Ora l'app chiede **Cognome** e
  **Nome** e li scrive con `{merge:true}`, in STAMPATELLO. ⚠️ **L'admin è escluso** di proposito;
  se la scrittura non riesce compare «Lo faccio dopo» e si entra comunque.
  **Provato in esecuzione**: **34 controlli su 34**, zero errori di pagina, più la batteria
  rieseguita.

- ➖ **Collaboratori rev 14 (10/11/2026) — il meno di un negativo già in archivio non sparisce
  più** (punto **12** dell'elenco, sua risposta «Sistema»). Entrando e uscendo da una casella
  **senza scrivere niente**, `blurFmt` riformattava con `raw()`, che dalla rev 11 scarta il segno:
  un negativo già in archivio — e li scrive l'app stessa con «Azzera credito residuo» — si
  vedeva per un istante **senza il meno**. **Misurato nel percorso vero**: rev 13 «-45,50» →
  **«45,50»**; rev 14 «-45,50» → **«-45,50»**. ⚠️ **Il dato in archivio non era mai stato
  alterato**: era una bugia solo a video. La correzione sta in **due funzioni** (`fcl` ricorda il
  testo di partenza, `blurFmt` non riformatta se non hai toccato niente) e **non tocca il divieto
  dei negativi** della rev 11 (misurato: scrivendo `-12,5` entra 12,50).
  ✅ **Punto 11 chiuso senza toccare niente**: verificato in esecuzione che **`1234.56` e
  `1234,56` danno entrambi 1.234,56**, cioè i due modi che usa lui. Resta vero che «1.234,56»
  con le migliaia puntate dà 1,234, ma è una scrittura che lui **non usa mai**.
  **Provato in esecuzione**: 22 controlli (15 in isolamento + 7 nel percorso vero, col confronto
  rev 13 ↔ rev 14), zero errori di pagina; rieseguita tutta la batteria (`mxop-1` 46 · `mxop-2`
  54 · `mxop-3` 49 · `rev11` 8 · `fix-b45` 8 · `g2-opoc` 9 · `g2b-opoc` 13 · `ic-fix3` 13 ·
  `sc-op-rev12c` 7 · `sc-op-rev12` 10), con un solo controllo fallito, che **falliva già prima**
  (fragilità dello script, non dell'app).

- 🔐 **Collaboratori rev 15 (10/11/2026) — due schede non si cancellano più a vicenda in
  silenzio** (punto **4**, risposta di Christian: «metti la stessa protezione di dipendenti»).
  Con due schede aperte sullo stesso browser l'ultima che premeva ✔ Salva riscriveva tutto
  l'elenco: misurato, il **41,5** della prima spariva e restava il **38,25** della seconda.
  Ora il **timbro** (chiave a parte, fuori dai dati: il backup JSON non cambia) fa **chiedere**
  prima di sovrascrivere, e annullando non viene toccato niente. È la stessa protezione della
  ver144 di Dipendenti e della ver131 di USOINT, quindi adesso **tutte e tre** le app che salvano
  in locale sono difese.
  🐞 **Un mio errore trovato dalla prova in esecuzione e non dal controllo di sintassi**: al primo
  tentativo era entrata solo la **chiamata** e non le **funzioni**, e il salvataggio sarebbe
  andato in errore. Stessa trappola della ver139 di Dipendenti.
  **Provato in esecuzione**: **15 controlli su 15** con due schede vere aperte insieme.

- 🔐 **USOINT ver131 (10/11/2026) — due schede non si cancellano più a vicenda, e l'import ha
  il suo pulsante** (punti **4** «metti la stessa protezione di dipendenti» e **10** «metti il
  pulsante»).
  (1) **Il timbro**, identico a quello della ver144 di Dipendenti: a ogni salvataggio si scrive una
  chiave a parte con un numero sempre diverso, e se quello in memoria è diverso l'app **chiede**
  prima di sovrascrivere, nominando «l'elenco dei lavori» o «questo lavoro». Si controlla
  nell'elenco (creazione, eliminazione, duplicazione, importazione, rinomina) e nel 💾 della
  scheda del lavoro; in creazione ed eliminazione **prima** di scrivere, così annullando non resta
  niente a metà. ⚠️ Vale per le schede dello **stesso browser**; la chiave sta fuori dai dati.
  (2) **↻ Rileggi le ore dai Dipendenti**: prima l'import partiva solo aprendo il Riepilogo
  operatori e per rifarlo bisognava uscire e rientrare. ⚠️ Non cambia **come** l'import lavora:
  resta da decidere se avvisare prima di sostituire un numero scritto a mano (punto 7) e se
  legarlo al 💾 (punto 9).
  **Provato in esecuzione**: **19 controlli su 19** con due schede vere aperte insieme, zero
  errori di pagina.

- 🔤 **USOINT ver130 (10/11/2026) — un accento di differenza non fa più perdere le ore**
  (punto **8**, risposta di Christian: «Ignorali e attenzione a accenti e apostrofi in fine di
  parola, perché si equivalgono»). L'unico identificativo fra Dipendenti e USOINT è il nome,
  scritto a mano in due anagrafiche: con un accento o un apostrofo di differenza le ore **non
  venivano importate**. **Misurato**: su tre dipendenti ne arrivava **uno solo**; ora arrivano
  tutti e tre, coi numeri giusti.
  ⚠️ `norm` non è stata toccata (le sue chiavi sono l'identità con cui le ore sono già salvate):
  la funzione nuova `normA` serve **solo a confrontare**, e l'import usa **la chiave di USOINT**,
  così le ore si attaccano alla riga che c'è già invece di duplicarla (misurato: 5 → 11, tre
  chiavi). L'apostrofo **dentro** la parola non si tocca.
  **Provato in esecuzione**: **18 controlli su 18**, zero errori di pagina.

- 🧮 **USOINT ver129 (10/11/2026) — le prime quattro risposte di Christian all'elenco delle
  interconnessioni** (punti **2** «Segnala», **3** «Correggi» con «per il blocco fbSync lascia
  stare», **16** «Fai seguire il filtro anche al dettaglio», **17** «Sistema»).
  (1) **Il dettaglio segue il filtro**: cliccando *Tot. rendicontate* la finestrella elencava
  **sempre tutti** i progetti, quindi la cella diceva **42,00** e il dettaglio **132,00**; ora
  mostra solo il progetto scelto, col TOTALE uguale alla cella e un avviso in cima. Si chiude da
  sé anche la seconda anomalia (i mesi a «—» non cliccabili: adesso è giusto).
  (2) **La legenda** «Avanzo = lavorate − totale rendicontate» era inesatta col filtro attivo
  (il totale dell'Avanzo passa da 118,00 a 685,00): **senza filtro la dicitura di Christian resta
  identica**, col filtro nomina entrambe le colonne e il progetto.
  (3) **Le ore che Dipendenti non conferma vengono SEGNALATE**: ciò che là è stato cancellato
  restava qui, si salvava e finiva nell'Avanzo senza che niente lo dicesse. Ora un riquadro giallo
  elenca «NOME · 2026: MAR» e, per chi non c'è più, «non è più in Dipendenti». ⚠️ **Non viene
  azzerato niente**: quelle ore possono anche essere scritte a mano.
  (4) **Il salvataggio locale non si perde più al ricaricamento**: `LS.set` rinvia la scrittura
  nel cloud di 1,5 s e, se cade, al ricaricamento `fbSync` sovrascriveva (**misurato sulla
  ver128**: 1077 nel browser, 68 nel cloud, dopo il ricaricamento 68 — dato perduto). Ora le
  chiavi non confermate si segnano **col loro valore** in una chiave di servizio
  (`uso-sospese-cloud`, fuori dal backup e da `fbPush`/`fbSync`) e si **riprovano prima** di
  `fbSync` (misurato: 1077 nel browser **e** nel cloud). ⚠️ **`fbSync` non è stato bloccato**,
  come ha chiesto lui: se la riprova non riesce il valore resta **tenuto da parte** (non è
  perduto) e un avviso arancione dice di fare un 💾 Backup dati. Corretto nello stesso punto un
  **promise non gestito** del `beforeunload`, che a linea caduta lasciava un errore di pagina
  (identico nella ver128).
  **Provato in esecuzione**: **58 controlli** (13 + 17 + 19 + 6 + 3), zero errori di pagina sulla
  ver129; rieseguita tutta la batteria (`mxus-A` 47 · `B` 67 · `C` 53 · `D` 34 · `E` 28 ·
  `F` 7 · `G` 5 · `H` 5 · `ver125` 10 · `ver126` 7 · `fix-b2` 7), **zero falliti**.
  ⚠️ In sei script le attese erano **invecchiate** (targhetta, nome del file di backup, formato
  dell'importo della ver127 e i controlli che misuravano i negativi chiusi dalla ver125):
  aggiornate, non aggirate.
  🟠 **Restano da chiarire con lui**: gli **omonimi** (punto 1) e il **`key={i}`** delle righe
  delle fatture (punto 18), su cui ha risposto «non chiaro».

- 🧵 **USOINT ver127 (09/11/2026) — due correzioni che erano incomplete, e un importo scritto a mano.**
  Il secondo collaudo ha trovato tre difetti, tutti e tre **miei**. (1) L'avviso sui **titoli
  doppi** della ver125 copriva solo la **creazione**: con la ✎ si arrivava a due progetti dallo
  stesso titolo senza un fiato, e le conseguenze sono peggiori di quanto l'avviso prometteva,
  perche' il Riepilogo operatori aggrega **per titolo** — misurato: perde una colonna (6 → 5),
  **somma i due progetti** (giugno da 42,00 a 132,00) e la **tendina del filtro della ver126
  sparisce**. Ora avvisa anche la rinomina, non bloccante. (2) L'avviso del **filtro** nominava una
  colonna sola: col filtro cambia anche **Avanzo** (TOTALE da 118,00 a 685,00), e ora lo dice.
  (3) L'importo nella **conferma della fattura** era scritto a mano invece che col formattatore
  interno (misurato: «1234567,89 €» invece di «€ 1.234.567,89»), cosa che il §10.2 vieta.
  🟠 Segnalati a Christian e **non toccati**: la finestrella del dettaglio che non segue il
  filtro, i mesi a «—» non cliccabili col filtro, il «1.234,56» battuto che si storpia
  (preesistente), `rinominaTitolo` che scrive senza il 💾 (preesistente) e il `key={i}` sulle
  righe delle fatture.

- 🔎 **USOINT ver126 (09/11/2026) — il filtro «progetto» agisce anche a schermo.**
  Nel Riepilogo operatori la tendina teneva la scelta ma non cambiava le righe: funzionava solo
  nell'export. Esisteva già `rendAt()` che rispetta il filtro, usata solo dall'export: ora la
  usa anche la tabella, e un avviso giallo dice che il filtro è attivo. **7 controlli su 7.**

- 🚫 **USOINT ver125 (09/11/2026) — niente negativi, e avviso sui titoli doppi.**
  Il collaudo aveva misurato che «Ore tot.» accettava −50 (costo −1.149,50 €, propagato ai
  totali). Ora il meno non si scrive più in nessuna delle quattro caselle numeriche dell'app,
  nemmeno incollato; le caselle di testo accettano ancora il trattino e i valori già nei dati
  non vengono cambiati. E due progetti con lo stesso titolo fanno comparire un avviso **non
  bloccante**. **10 controlli su 10.**

- 🧾 **USOINT ver124 (09/11/2026) — la ✕ della fattura chiede conferma.**
  Era l'unica cancellazione dell'app senza conferma, e il §10.1 nomina esplicitamente la
  «fattura». La conferma nomina data, numero, tipo e importo. **7 controlli su 7.**

- 🚫 **Dipendenti ver148 (09/11/2026) — «Compila veloce» non accetta più i negativi.**
  Difetto **trovato dal secondo collaudo**: battendo `-3` il pulsante restava acceso e premendolo
  scriveva **22 celle a −3**, con TOT calcolato **−66,00**. Nella cella del Tabellone il meno non
  si può scrivere (ver102), ma «Compila veloce» non passa da `CellInput`: era lo stesso buco della
  ver143 e della ver144, rimasto aperto sul **segno**. Corretto applicando la regola che Christian
  aveva già dato ad A4. Il pulsante si spegne e la nota dice «Le ore non possono essere negative».

- 🧪 **Dipendenti ver147 (09/11/2026) — il riquadro «Simulazione».**
  Ultimo pezzo di **A1**: le caselle giallline che restano nel Costo orario (mesi di contratto e
  le due settimane) sono raccolte in un riquadro solo loro, col filetto ocra, insieme ai loro
  avvisi e al pulsante ↺, che ora svuota tutte e tre in un colpo. In cima il riquadro **dice se
  stai simulando** e nomina ogni forzatura accesa, scatti e superminimo compresi. Fuori, quelle
  caselle diventano **di sola lettura**. 🐞 Chiuso un **difetto preesistente**: «Mesi di
  contratto» da vuota mostrava 12, quindi battendo una cifra diventava **125** e il costo passava
  da 18.197,43 € a **164.566,02 €** (era l'ultimo caso del difetto della ver80).
  Non regressione: **0 differenze sui 16 dipendenti** sia ver146→ver147 sia **ver140→ver147**,
  cioè prima e dopo l'intera catena.

- 🏛️ **Dipendenti ver146 (09/11/2026) — i dati del costo si scrivono in Anagrafica, con un periodo.**
  Sezione nuova **«Costo del lavoro»** in ANAGRAFICA con le nove voci che prima stavano nella
  scheda del Costo orario; le tre ricorrenti (premi, premio al mese, rimborso km) hanno un
  **dal/al** facoltativo e `firmaMese` li guarda, quindi il periodo si taglia da solo.
  Nel Costo orario quelle caselle sono ora **grigie e di sola lettura**. 🔑 Se in Anagrafica la
  casella è vuota, il motore continua a leggere il vecchio valore: nessun dato smette di
  funzionare. 🔴 Misurato: un rimborso di 100 €/mese pesa **+1.200,00 €** su dodici mesi e
  **+600,00 €** se vale solo da gennaio a giugno. Non regressione: **0 differenze sui 16
  dipendenti**. **27 controlli su 28.**

- 🧹 **Dipendenti ver145 (09/11/2026) — via la tendina morta, e la frase che mentiva.**
  Tolta la tendina **«Tabella CCNL»** dai valori comuni: dalla ver137 non veniva più letta e il
  collaudo ha misurato che forzarla non cambiava il costo di un centesimo. Il valore già salvato
  non viene cancellato, semplicemente non si legge. Corretta la frase «Scegli il livello e il
  minimo si compila da sé», che rimandava a una cosa non più possibile. **7 controlli su 7.**

- 🔐 **Dipendenti ver144 (09/11/2026) — due schede aperte non si cancellano più a vicenda.**
  Difetto trovato dal collaudo generale: con due schede aperte sullo stesso browser, la seconda
  che salvava **cancellava in silenzio** il lavoro della prima (misurato: 11,25 scritto e salvato
  da A, sparito dopo il salvataggio di B). Ora a ogni salvataggio si scrive un **timbro** in una
  chiave a parte; se al momento di salvare il timbro è cambiato, l'app **chiede** prima di
  sovrascrivere, con il pulsante «Salva lo stesso». ⚠️ Il **formato dei dati e del backup non
  cambia**. ⚠️ Vale per le schede dello stesso browser: due computer collegati al cloud non si
  vedono per questa strada.
  Nella stessa versione **«Compila veloce» non accetta più testo libero** (`PIPPO` riempiva 22
  celle). **14 controlli su 14**, zero errori di pagina, regressione pulita sui 16 dipendenti.

- ⚡ **Dipendenti ver143 (09/11/2026) — il tetto delle 13 ore vale anche in «Compila veloce».**
  `QuickFillModal` non passa da `CellInput`, quindi il tetto della ver142 non lo toccava: di là
  un valore oltre le 13 ore sarebbe entrato su decine di giorni in un colpo solo. Ora il pulsante
  «Compila N giorni» si spegne e la nota dice il motivo; i codici passano come prima.
  **11 controlli su 11**, zero errori di pagina.
  🔴 **Resta aperto**: «Compila veloce» accetta anche **testo libero** (scrivendo `PIPPO` riempie
  22 celle, che l'app poi segnala in rosso). Correzione pronta, **in attesa del permesso**.

- ⏱️ **Dipendenti ver142 (09/11/2026) — in un giorno non si scrivono più di 13 ore.**
  Il collaudo generale aveva misurato che la ver102 limitava solo il **numero di cifre**, quindi
  si potevano scrivere **99 ore in un giorno** e finivano in TOT, tetto annuo e straordinario
  senza nessuna segnalazione. Costante **`ORE_MAX_GIORNO = 13`** (scelta di Christian) e
  funzione `oreEntroIlMassimo`, applicate sia mentre si scrive sia all'uscita dalla cella;
  l'avviso nomina il tetto invece del generico «non è un codice né un numero».
  ✅ Verificato sui dati veri prima di metterlo: **nessuna cella supera le 13 ore** (massimo
  8,5), quindi nessun dato esistente diventa irraggiungibile. ⚠️ **«Compila veloce» non è
  toccato**: non passa da `CellInput`, quindi di là un valore oltre il tetto entrerebbe ancora.

- 🎓 **Dipendenti ver141 (09/11/2026) — l'E.A.R. degli educatori D1 si calcola da solo.**
  Dato di Christian: due maggiorazioni per gli **educatori inquadrati al livello D1** —
  **41,00 €/mese a tempo pieno dal 01/01/2025**, **82,00 € dal 01/09/2025**, e **cessazione dal
  01/01/2026** (sue scelte: tabella automatica, e «finisce il 31/12/2025 per tutti, qualunque
  livello»). Riguarda **tre persone**; le altre erano già D2 oppure D1 ma non educatrici.
  - Costante **`EAR_TRANCHE`** con le tre decorrenze: gli importi storici **non si
    sovrascrivono**, ogni mese usa quello in vigore allora. Due condizioni necessarie: la
    **spunta «Educatore (E.A.R.)»** in ANAGRAFICA → Contratto **e** il livello **D1** di quel
    mese, così il passaggio a D2 lo spegne da sé.
  - L'E.A.R. entra fra le **componenti mensili** come il superminimo, quindi segue importo
    orario, mensile fisso, 13ª, 14ª, festività, imponibili, contributi e TFR; **`firmaMese` lo
    guarda**, quindi il periodo **si taglia da solo** al cambio di tranche.
  - Nel **Costo orario** la casella è **grigia e di sola lettura** (il dato si scrive solo in
    Anagrafica), e nella tabella «Come si divide il periodo» c'è una **colonna E.A.R.** che
    compare solo a chi ce l'ha.
  - 🔴 **Misurato** su una persona vera, gennaio 2025 → dicembre 2026: **27.748,55 € →
    28.211,54 €** (**+462,99 €**), €/h 24,28 → **24,69**, e il periodo passa da **3 a 4 pezzi**
    (41 € fino ad agosto 2025, 82 € da settembre, niente dal 2026 con il D2).
  - ✅ **Non regressione misurata**: ver140 e ver141 danno **costo e €/h identici sui 16
    dipendenti veri** (gen→ott 2026, 0 differenze), larghezza di pagina identica a 390 · 768 ·
    1280 · 1680px. **23 controlli su 23** in esecuzione, zero errori di pagina.

- 🎨 **Dipendenti ver140 (09/11/2026) — i tre colori delle celle, finiti.** Richiesta di
  Christian: giallline con cornice ocra le celle da compilare, **azzurrine** quelle frutto di
  formule, **grigioline** quelle copiate e intoccabili (sue scelte 1b, 2a, 3 ok, e Nu*).
  - 🔑 **La regola era già quella in uso**: misurate in esecuzione tutte e **90 le caselle**
    delle due schede, 49+14 erano già giallline, 7+6 grigioline, 1 azzurrina. Mancavano **otto
    tendine** (rimaste col grigio del sistema operativo perché stanno fuori da `.field`) e
    **l'azzurrino nel Costo orario**.
  - Ora: le tendine che sono **un dato** sono giallline (rimborso, TFR supplementari, i mesi delle
    trasformazioni, del monte ore temporaneo, della mensilizzazione, il periodo del massimale);
    i **selettori del periodo** (Dal mese · Anno · Al mese) sono **neutri** — scelta 1b: non sono
    un dato che si salva; e **tre celle azzurrine** nel blocco *La retribuzione* (Totale delle
    componenti, Importo orario, Mensile fisso), gli unici tre numeri calcolati da una formula.
  - Chiusa un'**incoerenza**: la casella delle ore *Scritte a mano*, quando spenta, aveva fondo
    grigiolino ma **cornice ocra** — sembrava scrivibile. Ora la cornice segue lo stato.
  - ✅ **Non regressione misurata**: ver139 e ver140 danno **costo e €/h identici sui 16
    dipendenti veri** (0 differenze), **larghezza di pagina identica**, **comandi sotto i 32px
    10 prima e 10 dopo**. Due tendine passano da 32 a 34px: crescono, non si abbassano.
  - **Provato in esecuzione**: `colori.cjs` (inventario prima/dopo), `azz140.cjs` 4/4, `nr140.cjs`
    5/5, zero errori di pagina, e **tre anteprime PNG mostrate prima di committare** (§10.3).
- 🎖️ **Dipendenti ver139 (09/11/2026) — la decorrenza dello scatto si legge in Anagrafica.**
  Punto 13C della direttiva. In ANAGRAFICA → Contratto due righe nuove grigie e di sola lettura:
  **Scatti maturati a oggi** e **Prossimo scatto — decorrenza** (es. `01/02/2027 (il 2°)`).
  Funzione nuova `scattiStoria`, che ricostruisce le date con la **stessa** regola di `scattiAl`
  (il «giorno 25» del punto 13B era un refuso: vale la 1a, confermata il 09/11).
  - ⚠️ Nessun calcolo toccato: **ver138 e ver139 danno costo identico sui 16 dipendenti veri**.
    Senza data di assunzione le due caselle restano **vuote**, di proposito. Le righe non entrano
    nell'export Excel (le 50 colonne restano quelle).
  - 🐞 **Un mio errore trovato dalla prova e non da Babel**: avevo usato `nTxt`, funzione
    **locale** di `CostoOrario`, dentro l'Anagrafica → ReferenceError che rompeva tutta la vista.
    È la ragione per cui il §10.2 chiede le prove in esecuzione.
  - **Collaudo del punto 13D, i cinque casi, attesi ricalcolati a mano**: assunto il giorno 1
    (1 maturato, prossimo 01/02/2027) · assunto il giorno 7 (0, 01/02/2027) · più bienni
    (2, 01/01/2027) · con 2 mesi tutti AN (1, **01/03/2028**: lo slittamento si vede) · senza data
    di assunzione (vuoto). **Tutti e cinque coincidono**, e il Costo orario dà lo stesso numero.
  - **Collaudo del punto 9, il caso completo**: D1 promossa D2 dal 01/07/2026 con due tranche CCNL
    caricate, anno 2026 → il periodo si divide **da solo in 4 pezzi** (Ott25/D1 · Apr26/D1 ·
    Apr26/D2 · Ott26/D2), somma dei pezzi **35.446,69 €** e totale **35.696,69 €**: la differenza
    è **250,00 € esatti**, la formazione, che si conta una volta sola (ver84).
  - **Provato in esecuzione**: `scatti139.cjs` 28/29 + `caso9.cjs` 3/3 = **31 controlli**, zero
    errori di pagina. L'unico fallito era un'attesa sbagliata dello script.
- 📊 **Dipendenti ver138 (09/11/2026) — ⚙ AGGIORNA TABELLE CCNL: lo storico degli importi,
  senza toccare il codice.** Punto 6 della direttiva di Christian; dicitura del pulsante scelta da
  lui. ✅ **Verificato prima di costruire che non esistesse già**: le tabelle stavano solo dentro
  `index.html` come costanti.
  - Nella barra del **Costo orario**, accanto alle Aliquote: elenco delle tranche in vigore (nome ·
    vale dal · livelli · D1 · scatto D1 · «nell'app» o «caricata da te») e il modulo per caricarne
    una nuova, **incollando una riga per livello** («D1 1.690,00»), con anteprima e conferma.
  - Dati nuovi: **`state.ccnlTab`** — vive nei dati, finisce da sé nel backup JSON e nel sync.
    Funzioni `ccnlTranche`, `ccnlAl`, `minimiDi`, `scattoDi`; in App `onCCNLAdd`/`onCCNLDel`.
  - 🔑 **Gli importi storici non si sovrascrivono mai.** Misurato: caricando una tranche dal
    01/07/2026 il **2026** passa da **18.197,43 a 18.476,82 €** e il periodo si taglia a luglio,
    mentre il **2025 resta 8.288,89 €, identico al centesimo**.
  - Le tre tabelle dell'app **non si possono cancellare** (non hanno la ✕); una tranche con la
    stessa decorrenza di una dell'app **prende il suo posto** (serve a correggere un importo) e la
    riga originale resta nel codice. Gli **scatti** si possono aggiornare con la loro data, e se la
    tranche non li porta **si eredita quello di prima**.
  - **Provato in esecuzione**: `ccnl138.cjs` 27/28 + `ccnlE.cjs` 6/6 = **33 controlli**, zero
    errori di pagina, e **non regressione** sui 16 dipendenti veri (0 differenze).
    ⚠️ L'unico «fallito» era un'attesa sbagliata dello script (un nome con lo spazio), non
    dell'app.
- 🩶 **Dipendenti ver137 (09/11/2026) — la scheda anagrafica comanda: cinque caselle del
  Costo orario sono grigie e di sola lettura.** Direttiva di Christian «LA SCHEDA ANAGRAFICA È IL
  MOTORE DEL SISTEMA», sua scelta **«a»** («la casella del Costo orario diventa grigia e di sola
  lettura, il dato si scrive solo in Anagrafica») e **«6a»** sul part-time.
  - Grigie ora: **Livello** e **Ore settimanali** (dall'Anagrafica e dalle trasformazioni),
    **Minimo tabellare** e **Tabella** (dalle tabelle CCNL, per data), **Addizionale TD** (dalle
    proroghe), più la nuova **Part-time %** (ore ÷ 38). Funzione nuova `campoRO`.
  - 🔑 **Non bastava renderle grigie**: una casella che non si può né scrivere né svuotare
    terrebbe per sempre uno scavalcamento vecchio. Quindi il motore **non li legge più**, e il
    periodo torna a tagliarsi al rinnovo, al passaggio di livello e al cambio di orario.
  - 🔴 **Quanto era pericoloso, misurato**: con livello F2 e minimo 9999 scritti a mano, la
    ver136 dava **158.381,47 €** senza tagliare il periodo; la ver137 dà **14.427,24 €** e taglia.
  - ✅ **Sui dati veri non cambia un centesimo**: nessuno dei 16 dipendenti aveva scritto una di
    quelle caselle, e ver136/ver137 danno costo e €/h identici su due periodi, 16 su 16.
  - ⚠️ Restano giallline e scrivibili, con il loro avviso: *Giorni settimanali*, *Mesi di
    contratto*, le *Settimane* della simulazione, *Scatti*, *Superminimo*.
  - ⚠️ Le caselle dell'Anagrafica che Christian ha compilato **non sono state toccate** (sua
    istruzione: «lasciamo stare le cose che ho inserito io»): l'**ETAR** scritto come *Altro
    importo orario* (0,25 e 0,50 €/h su due persone) **continua a non entrare nel costo**.
  - **Provato in esecuzione**: `ro137.cjs`, **23 controlli su 23**, zero errori di pagina.
  - 🔴 **Una dicitura ora rimanda a qualcosa che non si può più fare** e NON è stata corretta
    (§10.6): «Scegli il livello e il minimo si compila da sé». **Da decidere con Christian.**
- 🐞 **Dipendenti ver136 (09/11/2026) — tre difetti preesistenti chiusi, tutti misurati.**
  Trovati con la verifica del motore `calcCosto` chiesta da Christian nella direttiva
  «RICOGNIZIONE GENERALE». **Non regressione verificata sui 16 dipendenti veri**: costo e €/h
  identici fra ver135 e ver136, 16 su 16.
  - 🚗 il **rimborso km «secco»** si moltiplicava per il numero di pezzi in cui il periodo si
    taglia: misurato, **18.297,43 → 18.247,43 €** (50,00 € in meno) con 2 pezzi. Era lo stesso
    caso della formazione, già gestito. Col rimborso «al mese» non cambia niente.
  - 🔴 un **divisore scritto a ZERO** (*Giorni settimanali* o *Divisore TFR*) rompeva il conto, e
    `R2`/`fmt2` mostravano il risultato come **«0,00»** come se fosse vero: bugia silenziosa
    vietata dal §10.1. Ora si usa il valore di riserva e compare una fascia rossa.
    ⚠️ **Due trappole nella prima stesura, trovate in esecuzione**: la bandierina si perdeva col
    periodo a pezzi (avviso mai visibile) e la nota scriveva «÷ 0».
  - 🧾 un **superminimo scritto «1.500,00»** veniva **buttato in silenzio** (il parser non
    capiva il punto delle migliaia) e la trasformazione si salvava senza. Ora si usa `cNum` e un
    numero illeggibile ferma il salvataggio dicendolo.
  - **Provato in esecuzione**: `dif136.cjs` + `dif136b.cjs`, **28 controlli su 28**, zero errori di
    pagina. ⚠️ I 4 «falliti» della prima passata erano **errori degli script**, non dell'app.
- 🎖️ **Dipendenti ver135 (09/11/2026) — gli scatti all'assunzione si scrivono in ANAGRAFICA, e
  l'avviso che mancava.** Due richieste di Christian: «è bene che compaia anche in anagrafica e qui
  si compili automaticamente e resti sfondo grigiolino, come per tutte le cose copiate in maniera
  automatica perchè scritte altrove» e «in questo punto fai ricomparire il nome della persona
  dipendente» (sua scelta «a e b», «sezione del contratto, ma se lo metto impediscimi di scriverlo
  altrove»). **Nessun calcolo toccato**: stesso costo al centesimo della ver134.
  - La casella **«Scatti riconosciuti all'assunzione»** è passata in **ANAGRAFICA → Contratto**;
    nel Costo orario è **grigia e di sola lettura** e rimanda lì. Il vecchio valore scritto nella
    scheda continua a valere **finché l'Anagrafica è vuota**, e la nota lo dice: nessun dato perso.
  - Il **nome della persona** si ripete in cima ai tre blocchi e al riquadro del risultato, col
    quadratino del suo colore: scorrendo la scheda non si sa più di chi siano i numeri.
  - 🟨 **Avviso nuovo**: un importo di scatti scritto a mano **ferma l'aggiornamento automatico** e
    spegne il taglio del periodo. Prima l'aiutino mostrava il conteggio automatico senza dire che
    non era quello in uso. Ora nomina **entrambi** i numeri.
  - 🔴 **Il problema strutturale è più grande, e Christian lo ha chiesto come correzione il
    09/11/2026** («LA SCHEDA ANAGRAFICA È IL MOTORE DEL SISTEMA»): **otto caselle dell'Anagrafica
    che riguardano la paga** — *Importo orario base*, ***Superminimo***, ***Scatti di anzianità***,
    *Altro importo orario*, *Importo orario totale*, *Part / Full time*, *Giorni di lavoro nella
    settimana*, *Ruolo / qualifica* — **non sono lette da nessun calcolo** (verificato contando le
    letture nel file: **zero**). Finiscono in `dp.ana.*` e servono solo alla lettera .docx e
    all'export Excel, mentre il Costo orario legge le sue caselle `dp.costo.*`, che hanno **lo
    stesso nome**. È la causa del «ho messo 0,500 orarie di scatti e non si aggiorna». **Da
    correggere, in attesa delle sue risposte sulle domande aperte.**
- ⚠️ **Dipendenti ver133 (08/11/2026) — le «settimane davvero lavorabili» dicono che non
  servono.** Domanda di Christian: «la questione settimane davvero lavorabili in realtà ci serve?
  Non calcoliamo tutto dalle ore reali da tabellone?». Ha ragione: con le ore **dai Riepiloghi**
  o **a mano** quelle due caselle non contano le ore, ma scriverle **spegne** il conto delle ore
  in più **mese per mese** (ver117) e il **taglio del periodo in pezzi** (ver84) — e l'app non lo
  diceva. Ora sotto la tabellina compare un **avviso giallo** che lo spiega e rimanda al pulsante
  **↺ Rimetti i valori calcolati**. ⚠️ **Nessun calcolo è stato toccato**: le caselle restano
  scrivibili, l'avviso non cambia un centesimo (verificato: stesso costo della ver132 nello stesso
  stato). 🔴 **Quanto pesava il silenzio, sui dati veri**: su una persona che ha quelle caselle
  scritte, periodo gen→ott 2026, il costo passa da **12.456,45 €** (0 pezzi) a **13.108,55 €**
  (12 pezzi) premendo ↺: **652,10 €**. Provato in esecuzione, **18 controlli su 18**, e tutto il
  registro cumulativo rieseguito sulla ver133. ✅ **La tabella degli scatti CCNL è chiusa**:
  Christian l'ha mandata per intero e **tutti e 13 i valori coincidono** con quelli già nel
  codice — nessun valore cambiato.
- 🎖️ **Dipendenti ver132 (08/11/2026) — gli scatti riconosciuti all'assunzione, e il mese in cui
  maturano.** Da un caso vero: una persona a cui all'assunzione sono stati **regalati 4 scatti**
  al livello D1, con il **quinto a febbraio 2027**. Due aggiunte al conteggio della ver128:
  (a) **casella nuova «Scatti riconosciuti all'assunzione»** (`dp.costo.scattiAss`), che diventa
  il punto di partenza e da lì l'app continua ad aggiungerne uno ogni 24 mesi utili — compare
  solo dove **non** c'è quella del pregresso, così delle due se ne vede sempre una sola;
  (b) chi è assunto **dopo il giorno 1** comincia a contare **dal mese successivo**, così i 24
  mesi si chiudono all'anniversario e lo scatto parte dal mese dopo (per lei: **febbraio** 2027,
  non gennaio). Verificato: con 4 riconosciuti il periodo si divide in **gen 2026→gen 2027
  (4 = 82,64 €)** e **feb 2027→dic 2027 (5 = 103,30 €)**; sui **16 dipendenti veri**, periodo
  gen→ott 2026, i costi sono **identici alla ver131**. ⚠️ Conseguenza della (b): per chi è
  assunto dopo il giorno 1 ogni scatto matura un mese più tardi, quindi un periodo che
  **contiene** quel mese costa un mese di scatto in meno — misurato su un caso vero: **−16,37 €**
  su un anno. La tabella degli scatti è stata ricontrollata contro il CCNL Cooperative sociali
  (art. 80 e tabella CNEL T151): **D1 20,66 €**, massimo 5, uno ogni biennio, tabella dal
  01/10/2025; confermati anche A1, A2, B1, D2, F2. ⚠️ Sette livelli (C1, C2, C3, D3, E1, E2, F1)
  **non** sono stati verificati uno per uno: la pagina con la tabella completa non è
  raggiungibile dalla rete di questa sessione.
- **Dipendenti ver131 (07/11/2026) — il superminimo segue le trasformazioni, e i colori sono 24.**
  Due richieste di Christian. **Il superminimo**: una trasformazione portava livello, ore
  settimanali e il passaggio a tempo indeterminato, ma **non il superminimo**, che era un numero
  senza data applicato a tutti i mesi del periodo. Misurato sui dati veri (gen→ott 2026): un
  superminimo di 100 €/mese pesa **806,05 €**; se fosse partito il 01/06 i mesi veri sarebbero 5
  su 10, quindi l'app addebitava **403 € di troppo**, e a catena su 13ª, 14ª, festività, ferie
  liquidate, TFR e contributi. Ora `valoriAt` tiene anche il superminimo (parte da zero, lo
  cambiano le trasformazioni), ci sono `superminimoAt` e `superminimoPeriodo`, e **`firmaMese` lo
  guarda: il periodo si taglia da solo** alla data del cambio — provato, da 2 a **3 pezzi**, con
  il costo che cade in mezzo (14.113,92 € fra 13.699,70 e 14.505,75). Nel modulo delle
  trasformazioni c'è la casella **«Nuovo superminimo €»** (lo **0** serve a togliere un
  superminimo che c'era), la **lettera** lo nomina (dicitura autorizzata da Christian), e sotto
  la casella del Costo orario compare un **avviso giallo** che dice **sempre** che il numero
  scritto a mano vince su tutto, quale sarebbe l'automatico e che così il periodo non si taglia
  più — richiesta esplicita di Christian. **I colori**: erano **10** e si assegnavano con
  `PALETTE[numero % 10]`, quindi con 16 dipendenti dall'undicesimo si ricominciava da capo (13
  colori distinti su 16 persone, tre usati da due persone ciascuno, e sei tinte che Christian si
  era messo da sé che non comparivano nemmeno come selezionate). Ora sono **24**: i primi dieci
  **al loro posto, nessuno cambia colore**, poi i sei suoi, poi otto nuovi chiari e spenti,
  **nessun verde brillante** come ha chiesto. Provato: 20 persone senza colore → **20 colori
  distinti**. ⚠️ **Nessun altro calcolo toccato**: sui dati veri ver130 e ver131 danno gli stessi
  numeri. Provato in esecuzione: **20/20** + **14/14**, zero errori di pagina, più il registro
  completo. ⚠️ Non verificato: il **.docx vero della lettera** (serve il modello Word).
- **Dipendenti ver130 (07/11/2026) — collaudo integrale dell'app e leggibilità a norma.**
  Christian ha chiesto un **collaudo operativo completo**: provare in esecuzione ogni funzione, i
  dati, gli errori, la grafica su telefono/tablet/desktop, le regressioni e i flussi dall'inizio
  alla fine, correggendo quello che si trova. **Un solo scostamento vero trovato**, e
  **preesistente**: la regola permanente §10.6 dice che nessuna scritta scende sotto i
  **12,5px** fuori dalle griglie dense, e invece ce n'erano **209 nel Tabellone**, **79
  nell'Anagrafica** e **18 nei Riepiloghi** (fra cui intestazioni a 10px) — identiche nella
  ver128 e nella ver126 pubblicata. Corretto con un blocco CSS in fondo al `<style>` che le
  porta tutte a 12,5px vincendo anche contro le misure scritte in riga dal JavaScript; **escluse
  le griglie dense** (alzarle allarga la tabella, vietato) e le sette eccezioni già dichiarate
  alla ver76 (targhetta della revisione, «Modalità LOCALE», barra «Zoom vista»). Dopo: **7
  scritte piccole in tutte le viste, e sono esattamente quelle sette**; la **larghezza della
  pagina è identica** alla ver129 in tutti i 25 casi misurati (5 larghezze × 5 viste), e la
  pagina **non scorre mai di lato**. ⚠️ **Cambia solo la misura**: nessuna dicitura, nessun
  colore, nessun calcolo, nessun dato. ⚠️ È una **modifica visiva al Tabellone non richiesta con
  un Nu\***: sta solo sul ramo di lavoro. Corretta anche una **bugia nella documentazione**: le
  ore giornaliere non sono sempre un numero (nei dati veri 1.862 interi, 1.006 decimali e 3.152
  stringhe, fra cui numeri con la virgola come `"4,5"`), quindi si leggono con `parseHour` e non
  con `Number()`. Tutto il resto del collaudo è passato: responsive 76/76, dati e cancellazioni,
  casi limite 12/12, flusso completo sui dati veri, e soprattutto **ver128 e ver129 danno costo,
  ore e €/h identici per tutte e 16 le persone su tre periodi**. **Non verificabili da qui, e
  dichiarati**: il disegno vero del Report PDF e il collegamento a Firebase.
- **Dipendenti ver129 (06/11/2026) — un solo motore delle ferie: 26 + 4 = 30 giornate.**
  Difetto **trovato da Christian** («non torna il calcolo che fai per attribuzione ferie, sto
  guardando il 2026»): nell'app c'erano **due motori diversi** delle ferie. Quello del
  **Costo orario** (`ferieBilancio`, ver120/125/127) contava **30 giornate l'anno**, godute
  **FERIE + EXF**, sui mesi di rateo; quello di **«Ferie da smaltire»** (fascia rossa di aprile
  e Query personale) contava **26 giornate**, **solo le celle FERIE**, e **12 mesi d'ufficio** a
  chi non ha la data di assunzione. Sul 2026 non potevano dare lo stesso numero.
  La regola, data da Christian: «**exf e permessi ex festività sono la stessa cosa e possono
  essere presi in ore o giorni: sono 4 gg annui e si sommano a 26 gg di ferie annui**». Ora il
  criterio è **uno solo**: maturate = (ferie + altri permessi dei **valori comuni**, 26 + 4) ÷ 12
  × mesi; godute = celle **FERIE** + celle **EXF** + **permessi orari di tipo EXF** convertiti in
  giornate; i mesi che maturano sono quelli **con dati**, con almeno 15 giorni di contratto e
  **non tutti «AN»**. ⚠️ I mesi si contano su quelli **con dati** perché in quella schermata
  **si può scegliere solo l'anno** (osservazione di Christian): su un anno in corso i 12 mesi
  d'ufficio gonfiavano il debito. Sui dati veri: sull'**anno chiuso** il residuo **sale**
  (26 → 30 di base: 13,00 → **17,00** su chi ha lavorato 12 mesi), sull'**anno in corso scende**
  (26,00 → **8,50** su chi ha 9 mesi compilati), e le **4 persone senza data di assunzione**
  passano da **26,00 giornate di debito inventato** a **0,00**. ⚠️ **Il Costo orario non è stato
  toccato**: è il motore vecchio che è stato portato sul nuovo. Due diciture cambiate, **entrambe
  autorizzate da Christian**: la nota sopra la tabella e il sottotitolo dell'Excel, che dicevano
  «26 GG annui = 2,1666 GG/mese». Provato in esecuzione: **11/11** + **10/10**, zero errori di
  pagina, più le quattro parti della verifica meticolosa (**57 controlli**) e il resto del
  registro.
- **Dipendenti ver128 (06/11/2026) — il CCNL ha tre tranche e gli scatti si contano da soli.**
  Segnalazione di Christian: «su periodi lunghi potrebbe essere cambiato l'importo da
  corrispondere, per esempio per ccnl rinnovato». Era vero: la tabella CCNL era **una scelta
  unica** per tutto il periodo e il taglio automatico in pezzi non la guardava. Ora `MINIMI_CCNL`
  ha **tre tabelle** (Feb24 · Ott24 · Ott25) con **tutti i 13 livelli** (prima erano due tabelle
  e sei livelli), ognuna con la sua decorrenza: il minimo si prende **mese per mese** e il
  periodo **si taglia da solo** al rinnovo. ⚠️ Corretti due valori sbagliati di un centesimo
  (B1 e E1 della tabella Ott25). Le tendine hanno ora «automatica (per data)» come predefinito.
  Aggiunti anche gli **scatti di anzianità**: tabella per livello, uno ogni **24 mesi utili**
  dall'assunzione, **massimo 5**, e un **mese tutto «AN» non è utile** e fa slittare la
  maturazione. La casella si compila da sola; ce n'è una nuova, «Scatti già maturati al
  31/12/2024», per chi è stato assunto prima dell'inizio dei dati.
  Misurato: periodo marzo 2025 → novembre 2026 (a cavallo del rinnovo) **51.872,07 → 51.546,57 €**,
  **16,25 → 16,15 €/h**; dentro un solo CCNL non cambia un centesimo.
  ⚠️ **Gli scatti fanno salire il costo di chi ha anzianità** — fino a ~979 €/anno su un D1 a
  30 h/sett. — e sui dati veri **15 dipendenti su 16 li avevano a zero**: non era un valore
  giusto, era un valore mancante. Provato in esecuzione, 14 controlli su 14.
  ⚠️ **Regola 10.1 estesa alla documentazione**: in `CLAUDE.md` erano finiti tre **cognomi di
  dipendenti**; sono stati tolti. I file del repository sono **pubblici**: nessun nome di persona
  reale, nemmeno nelle note. Toglierli ora non li toglie dai commit vecchi.
- **Dipendenti ver127 (06/11/2026) — il saldo ferie si conta dall'assunzione, non dal periodo.**
  Christian, guardando la casella introdotta dalla ver125: «quindi perché farmi inserire per
  tutti le ferie residue? lo sai da te». Aveva ragione: il saldo ferie non è una cosa del
  periodo, è un conto che corre dall'assunzione. Ora la liquidazione conta maturate e godute
  **dall'assunzione (o dal primo mese che l'app ha) fino alla cessazione**, qualunque periodo si
  stia guardando. La casella compare **solo** per chi è stato assunto prima dell'inizio dei dati,
  con l'aiutino che dice da sé la data («il residuo al 31/12/2024»); per chi manca la data di
  assunzione c'è un avviso arancione. Sui dati veri: dei 16 dipendenti, **9** non hanno bisogno
  di niente, **3** sì, **4** sono senza data di assunzione (e tutti e quattro hanno una
  cessazione). ⚠️ La ver126, su un periodo corto, contava **metà** del saldo: 27,50 giornate
  invece di 52,50 su un caso provato. ⚠️ Il €/h del **mese di cessazione** comprende tutta la
  liquidazione e arriva a 41,52 contro i 17,35 di tutto il rapporto: **non si usa per
  rendicontare**. Provato in esecuzione, 14 controlli su 14.
- **Dipendenti ver126 (06/11/2026) — le ferie non godute liquidate stanno nella base TFR.**
  Christian aveva mandato tre cedolini veri proprio per sciogliere questo dubbio. In ver125 le
  avevo messe **fuori** dalla base TFR per coerenza con le *Festività non godute*: era una
  scelta, non una prova. Il terzo cedolino — un mese **normale** della **stessa persona**,
  subito prima della cessazione — la chiude. Maggio: competenze 960,93 €, quota TFR del mese
  **64,15 €**. Giugno: competenze 1.310,86 €, di cui **315,00 € di ferie e permessi non goduti**,
  quota TFR **85,36 €**. La quota è salita di **21,21 €**: se le 315,00 fossero fuori sarebbe
  salita di ~2,4 €, se sono dentro di ~24,2 €. **Sono dentro.** Modifica di **una riga**.
  ⚠️ Le *festività non godute* restano fuori: sono un'altra cosa (domeniche e 4 novembre).
  ⚠️ Conseguenza: nel periodo di cessazione TFR e costo totale salgono di circa
  `importo liquidato ÷ 13,5`; **i costi orari della ver125 su quei periodi erano sottostimati**.
  ⚠️ I primi due cedolini **non bastavano** (c'è di mezzo una trattenuta per fondo pensione che
  divide il TFR): il metodo buono è il confronto fra due mesi della stessa persona.
- **Dipendenti ver125 (06/11/2026) — le ferie non godute si liquidano alla cessazione.**
  Buco segnalato da Christian: «in caso di licenziamento si liquidano ferie e quant'altro non
  goduto. Come lo calcoli nel costo orario del mese?». Non lo calcolava: **non esisteva nessuna
  voce**, c'era solo l'avviso giallo della ver120. Ora c'è la voce **gemella** di *Festività non
  godute* — stesso conto `mensile fisso ÷ 26 × giornate`, dentro l'**imponibile I** (i contributi
  la seguono) e — **dalla ver126** — anche **dentro la base TFR**. **Scatta solo se nel periodo cade la fine del rapporto**
  (scelta di Christian: fuori da lì il debito può ancora essere goduto); vale anche per la
  scadenza naturale di un tempo determinato. Le giornate sono il **debito del periodo**
  (maturate − godute, dal Tabellone) più il **residuo degli anni precedenti**, che si scrive nella
  casella nuova «Giornate di ferie residue da anni precedenti». Con i blocchi la liquidazione sta
  tutta nell'**ultimo pezzo**, quindi usa il **mensile fisso finale** — giusto anche per legge.
  Misurato: persona a 30 h/sett. cessata il 30/11/2026, mai in ferie, 1.674 h rese → voce
  **1.367,40 €** (27,50 gg), costo **27.056,89 → 28.797,96 €**, **16,16 → 17,20 €/h**. La stessa
  persona che si fosse goduta le ferie costa **17,31 €/h**: con la liquidazione dentro i due casi
  tornano a dire la stessa cosa, ed è la prova che era quello il pezzo mancante. L'avviso giallo
  della ver120 sparisce quando la liquidazione è contata, perché direbbe una cosa falsa.
  ⚠️ **Non gestiti** (non richiesti): indennità di mancato preavviso e ROL separati. Il **TFR** è
  già contato mese per mese, quindi erogarlo alla fine non è un costo in più.
  ⚠️ La liquidazione finisce in **un mese solo**: il costo orario di quel mese schizza, e
  Christian lo sa («ovvio e va bene»). Provato in esecuzione.
- **Dipendenti ver124 (06/11/2026) — la domenica di Pasqua non è una festività.** Difetto
  **trovato da Christian** guardando un caso vero: nel periodo gennaio→ottobre 2026 di una
  dipendente comparivano **due** «festività non godute», il **5 aprile** e il **4 ottobre**.
  L'elenco delle festività (`festivitaSet`) conteneva **sia la domenica di Pasqua sia il Lunedì
  dell'Angelo**, ma la Pasqua è una domenica per definizione: la festività da pagare è il lunedì,
  che era già contato come **goduta**. Cadendo di domenica, la Pasqua finiva **ogni anno** fra le
  non godute e faceva pagare **un 1/26 del mensile fisso non dovuto**, a ogni persona. **Tolta**
  (il Lunedì dell'Angelo resta); il **4 ottobre, San Francesco, resta** — decisione di Christian:
  «è festivo e va tenuto». ⚠️ Il **Tabellone non cambia di un millesimo**: il 5 aprile è domenica,
  quindi era ed è rosso e non compilabile. Nel 2026 le non godute passano da **4 a 3**, le godute
  restano **11**. Sui dati veri di una dipendente (gen→ott 2026): voce **62,96 → 31,48 €**, costo
  totale **14.467,76 → 14.427,24 €**, **20,47 → 20,41 €/h** (scende di 40,52 €, più della voce,
  perché le festività non godute stanno nell'imponibile I e si portano dietro i contributi).
  ⚠️ **I costi orari calcolati finora erano sovrastimati di un 1/26 all'anno per persona.**
  Provato in esecuzione, **8 controlli su 8**.
- **Dipendenti ver123 (06/11/2026) — l'importo orario e le assenze spacchettate.** Due
  richieste di Christian, **nessun calcolo toccato**: si fanno vedere numeri già calcolati.
  (1) In fondo al blocco *La retribuzione* tre righe nuove: **Totale delle componenti**,
  **Importo orario** (totale ÷ 165, a 4 decimali) e **Mensile fisso di questa persona**, con la
  formula scritta sotto e la paga delle ore aggiuntive. ⚠️ Le componenti sono a tempo pieno:
  l'importo orario non cambia col part-time, cambia il mensile fisso. (2) Nel riquadro
  **«Le ore in più, mese per mese»** sotto la colonna *Assenze* compare l'elenco delle voci
  («FERIE 15 gg · FEST 1 gg», «permessi 2,00 h») e c'è una **colonna nuova «Festività»**:
  **Lavorabili = monte − Assenze − Festività**. Servono due colonne perché una festività può
  stare in due posti: col codice scritto in cella sta fra le Assenze, senza codice la conta il
  calendario. Provato: 7 controlli su 7 sul box della retribuzione, più la lettura del riquadro
  su un caso con ferie, malattia e festività scritte in cella.
- **Dipendenti ver122 (06/11/2026) — una festività già scritta in cella non si conta due
  volte.** Difetto **introdotto dalla ver121**, trovato controllando perché il Tabellone non
  contasse le festività: fino alla ver77 i giorni rossi si potevano compilare e fra i codici c'è
  anche `FEST`. Se nei dati vecchi un 1° gennaio porta `FEST`, quel giorno veniva contato sia
  come assenza sia come festività. Misurato: gennaio 2027 con `FEST` scritto → ver121 **+26,013 h**,
  ver122 **+19,679 h**; senza niente scritto tutte e due **+19,667 h**. La funzione nuova
  `festGoduteMese` la usano **sia il Tabellone sia il Costo orario**, così non possono scostarsi.
- **Dipendenti ver121 (06/11/2026) — anche il Tabellone conta le festività godute.**
  Christian: «Perché il tabellone non conteggia le festività godute?? Sono **assenze retribuite
  a tutti gli effetti**, come ferie, malattia eccetera. Solo le **non godute** sono un'eccezione
  che non rientra nel calcolo». Mancavano perché dalla ver77 i giorni rossi non si compilano,
  quindi non hanno codice e non venivano visti; ora si contano dal calendario, come fa già il
  Costo orario. Cambia il **Risultato del mese** del Tabellone (e lo Straordinario della Query
  personale), con una pastiglia nuova «Festività godute: 2 gg = 12,667 h».
  🔗 **Le due schermate ora dicono lo stesso numero**: dicembre 2026 (4 festività, 172 h rese)
  **+32,333 h** da tutte e due, dove prima erano +7,000 e 32,33. ✅ E torna il numero di
  Christian: gennaio 2027 (2 festività godute), 172 h rese → **+19,667 h**, i suoi «19,6666 ore
  straordinarie». ⚠️ Lo straordinario cresce in **6 mesi su 12** del 2026: dalla ver121 i numeri
  dei mesi con festività non sono confrontabili con quelli visti prima. ⚠️ Non toccato `coverAbsHours` (le festività lì dentro verrebbero contate due
  volte). 🚫 **Il Tetto annuo resta com'è**, deciso da Christian il 06/11/2026 («Lascia com'è»)
  dopo che gli era stato chiesto con i numeri: le **festività godute non erodono il massimale**,
  perché in una festività il servizio è chiuso e al progetto non arriva nessuna ora — è la sua
  regola del 03/11 («se stai in ferie a Natale no»). Farle erodere avrebbe consumato **69,67 h
  all'anno** a tempo pieno (il 17% di un tetto da 408 h), anche nel residuo che gli operatori
  vedono in Fogli ore. **Non riproporlo.**
- **Dipendenti ver120 (06/11/2026) — avviso: le ferie non godute sono un debito.** Fra le tre
  strade proposte per il limite che aveva visto lui stesso, Christian ha scelto la **1: solo un
  avviso**. Sotto il numero €/h compare un riquadro giallo quando le ferie godute nel periodo
  sono meno di quelle maturate: dice quante ne risultano godute su quante maturate, il debito in
  giornate e in ore, e di quanto il costo orario è più basso del vero. ⚠️ **Non cambia nessun
  numero**: verificato, il €/h della ver119 e della ver120 è identico. Provato in esecuzione,
  8 controlli su 8: chi si prende tutte le ferie non vede l'avviso, chi non ne fa nessuna legge
  «0,00 su 30,00 maturate · 190,38 h · circa **9,90%**», chi ne fa metà «15,00 su 30,00 ·
  95,19 h · 5,20%». ⚠️ Le giornate maturate vengono dal valore comune (30 gg), diviso 12 sui mesi
  del periodo. ✅ Il **residuo degli anni prima non serve**, e l'avvertenza che avevo scritto era
  sbagliata: l'ha corretta Christian («cosa ti cambia sapere quante ferie ha in tasca pregresse
  se tu calcoli il costo basandoti su ogni singolo mese?»). Il conto è per periodo: maturato in
  quel periodo contro goduto in quel periodo.
  🚫 **Scartate** le altre due strade: togliere dalle ore le ferie non godute (cambierebbe il
  numero usato in rendicontazione) e tornare alle assenze presunte.
- **Dipendenti ver119 (06/11/2026) — la quota di una festività è «ore settimanali ÷ giorni a
  settimana».** Numero dato da Christian: «Ore mensili contrattuali 165, rese effettivamente 172
  e due festività godute nel mese: le ore da lavorare dovevano essere **152,333**, quindi lui ha
  fatto **19,6666 ore straordinarie**». La ver118 usava `monte/26` (6,3462) e dava 152,31 e
  19,69; ora usa `oreSett/ggSett` (6,3333) e dà **esattamente i suoi numeri** (provato in
  esecuzione su gennaio 2026). ⚠️ Restano **due quote giornaliere**, ed è voluto: le **assenze**
  valgono `monte/26` (è il numero che lui stesso aveva confermato il 31/10: «2 giorni di ferie =
  12,69 h»), le **festività** `oreSett/ggSett`; differenza 1,3 centesimi di ora al giorno.
  ✅ Chiusa così la prima questione aperta della ver118: «le festività non possono che essere
  dedotte in base al mese». ⚠️🔴 **Resta aperta la conseguenza sul Tabellone**: nella sua frase
  quelle 19,6666 h sono «ore **straordinarie**», ma il Tabellone non toglie le festività —
  misurato su dicembre 2026 (4 festività, 172 h rese): Tabellone **+7,000 h**, Costo orario
  **+32,33 h**. Allinearlo è semplice, ma cambierebbe il numero che Christian guarda ogni mese
  in **6 mesi su 12**: **da chiedergli**, non fatto.
- **Dipendenti ver118 (06/11/2026) — le assenze sono quelle VERE del Tabellone.**
  Christian: «a meno che non ti risulti più comodo usare la realtà». Risulta più comodo: dalla
  ver117 non c'è più compensazione fra i mesi, quindi l'errore dei giorni **presunti** (2,5 di
  ferie + 2 di malattia al mese) non si annulla più sull'anno, **si somma**. Ora le ore
  lavorabili del mese tolgono le **assenze davvero segnate** (ferie, malattia e permessi
  retribuiti) invece dei numeri presunti, e «ore in più del mese» diventa la **stessa formula
  del Risultato del mese del Tabellone**, più la deduzione delle festività godute. Verificato:
  novembre 2026 senza festività → Tabellone +14,767 h, Costo orario 14,77 h, **lo stesso
  numero**. Misurato (ver117 → ver118): chi fa 140 h al mese su un contratto da 165 e **non si
  assenta mai** passa da **112,50 a 0,39 h** di ore in più (costo 32.557,70 → **30.831,47 €**,
  19,38 → **18,35 €/h**); con 25 giorni di ferie fra luglio e agosto da 99,04 a 0,39 h; un caso
  con malattia e ferie sparse da 156,05 a **39,10 h** (20,07 → **18,62 €/h**). ⚠️ **Il costo
  scende**: le ore in più che sparivano erano inventate dai numeri presunti.
  ⚠️🔴 **DOMANDA APERTA**: nei mesi **con festività** le due schermate restano diverse, esattamente
  delle festività. Dicembre 2026 (95 h rese, 5 gg di ferie, 4 festività godute): il **Tabellone**
  dice **−10,213 h** (ore in meno), il **Costo orario** dice **+9,830 h**; differenza 20,043 h =
  4 × 5,0101. Dipende da una cosa sola: **le festività contano come ore già coperte, come
  un'assenza retribuita, oppure no?** Serve la decisione di Christian; finché non arriva resta
  com'è.
  ⚠️🔴 **SECONDA QUESTIONE APERTA, sollevata da Christian e misurata**: «se uno non fa mai ferie
  in un anno magari mi tradisce il costo orario». **Ha ragione, ed è il 10%**: due persone
  identiche, una che si prende le 30 giornate di ferie e una che non ne prende nessuna, danno
  **18,08** e **16,29 €/h** (nella ver117, con le assenze presunte, lo scarto era solo −2,1%,
  perché le ore in più inventate lo mascheravano a metà). Il costo è lo stesso, ma chi non va in
  ferie **rende 190,4 ore in più** che sono un **debito**: o le godrà dopo, o vanno pagate.
  Conto a mano: dividendo per le ore al netto di quelle non godute si torna a **18,09 €/h**.
  Tre strade da decidere: **(1)** solo un avviso quando le ferie godute sono molto meno delle
  maturate; **(2)** togliere dalle ore le ferie maturate e non godute (⚠️ cambia il numero usato
  in rendicontazione); **(3)** tornare alle presunte (misurato: nasconde il problema solo a
  metà e in cambio inventa ore in più a chi le ferie se le prende). **Nessuna fatta.**
  ⚠️ **Nulla è pubblicato**: `main` porta ancora la ver116.
- **Dipendenti ver117 (06/11/2026) — le ore in più si contano MESE PER MESE, sul monte
  contrattuale.** Chiude i due punti rimasti del 05/11 sera. Christian ha confermato («1 e 2
  confermo») e ha dato **lui** la definizione: «le ore lavorabili sono quelle **contrattuali**
  (chi ha 38 ore settimanali deve fare 165 ore mensili; nel mese pago 165 ore considerando però
  che ci stanno **2,166 gg di ferie**, **0,333 di permesso ex festività** e presuntivamente
  **2 gg di malattia**)». Quindi: (1) niente più **compensazione** fra un mese sopra e uno sotto —
  per ogni mese `max(0, rese − lavorabili)`, poi somma; (2) la base non è più «settimane × ore
  settimanali» ma **`monteFissoMese`, lo stesso numero che il Tabellone mostra come ORE MESE**:
  è così che le due schermate «si parlano». Le assenze presunte si tolgono in giorni × quota
  giornaliera (monte ÷ 26) e sono quelle dei valori comuni: 2,50 gg fra ferie e permessi + 2 gg
  di malattia; ✅ restano tolte anche le **festività godute** del mese: Christian non le aveva
  nominate, e alla domanda ha risposto il 06/11/2026 **«il mio era un esempio per farti capire»**
  — l'elenco era il principio, non la lista completa, quindi si toglie tutto ciò che è pagato e
  non lavorato. **Deciso: non si cambia.** A video un riquadro nuovo **«Le ore in più, mese per mese»** con il confronto col conto
  vecchio. Misurato su tre casi: 38 h/sett. con mesi altalenanti **230,26 → 280,48 h** (costo
  34.370,72 → **35.144,04 €**, 19,09 → **19,52 €/h**); 15 h/sett. con 72 h in 10 mesi
  205,72 → 206,46 h; con promozione e periodo a blocchi 260,73 → 262,50 h. ⚠️ **Il costo sale
  solo dove i mesi sono disuguali.** ⚠️ Con le ore **a mano**, le ore **Teoriche** o un valore
  strutturale scritto a mano i numeri sono **identici alla ver116** (24 controlli su 24).
  Nella stessa versione, su richiesta di Christian («3, sistema»), sono stati chiusi i **due
  sbordamenti a 390px** preesistenti: **Anagrafica 724 → 390px** (l'elenco delle persone va a
  capo e i tre pulsanti «Genera documento» si impilano) e **Costo orario 429 → 390px** (la
  tabella «Come si divide il periodo», sette colonne, ora scorre dentro il suo riquadro).
- 🔴 **Fogli ore rev 10 (07/11/2026) — «✓ Salvato!» non è più una bugia.** Trovato con l'audit
  generale del gestionale e corretto con il Nu\* di Christian. **Difetto preesistente, il più
  grave trovato finora.** Con il collegamento caduto il salvataggio automatico **falliva in
  silenzio** e il pulsante 💾 diceva **«✓ Salvato!»** pur non avendo scritto niente; Fogli ore
  **non tiene copia nel browser**, quindi chiudendo la pagina le ore erano perse. Causa: `saveTS`
  ingoiava l'errore (`catch(e){console.error(e)}`), così il ramo «Errore!» di `manualSave` non
  poteva scattare. Ora `saveTS` torna `true`/`false` (non lancia: i 19 punti che la chiamano
  senza `await` sono invariati), i due salvataggi manuali entrano nel ramo d'errore che c'era
  già, e compare la **banda rossa «⚠️ ORE NON SALVATE — … non chiudere la pagina»**, che sparisce
  da sé al primo salvataggio riuscito. Provato in esecuzione con una Firebase finta che rifiuta
  le scritture: **12 controlli su 12**. Nella stessa versione chiusa la leggibilità: il blocco
  della rev 4 copriva 6-11px e si era dimenticato il **12px**, quindi 9 scritte restavano sotto
  i 12,5px fuori dalla tabella del mese (Esci, Backup JSON, Chiudi \<mese\>, …): ora sono **0**,
  e la tabella del mese resta **906px**, identica alla rev 9.
- **Fogli ore rev 9 (06/11/2026) — la frase del Tetto annuo nomina anche i permessi.**
  Christian: «4, completa». Nel riquadro «Le ore che ti restano quest'anno» si legge ora
  «Comprende **le ore fatte, le assenze retribuite e i permessi retribuiti** dei giorni in cui il
  servizio era aperto»: era rimasta indietro rispetto a Dipendenti, dove dalla ver98 i permessi
  retribuiti consumano il tetto. Nessun calcolo, nessun dato, nessuna regola toccati.
- **Fogli ore rev 8 (06/11/2026) — la chiusura del mese passa nella schermata «Operatori».**
  Christian aveva chiesto come si chiude il mese per tutti; il pulsante stava **dentro la scheda
  di un singolo operatore**, pur chiudendo il mese **per tutti** (un solo documento
  `locks/<anno>_<mese>`), ed era facile fraintenderlo. Ora sta nella **home dell'admin**, sotto il
  promemoria del backup, con le due tendine anno + mese. Nella scheda dell'operatore resta
  **solo l'avviso** «è CHIUSO per tutti gli operatori — Si riapre dalla schermata Operatori».
  ⚠️ **Diciture dei pulsanti invariate**, nessun calcolo e nessuna regola toccati. ⚠️ Il blocco
  **resta imposto solo dall'app, non dal database**: scelta confermata da Christian («va bene
  così»). Provato con una finta Firebase: 13 controlli su 13, zero errori di pagina.
- **Dipendenti ver116 (06/11/2026) — l'ISTAT di partenza passa da 2 a 1,011.**
  Christian ha riferito il dato di dicembre 2025 e confermato che è una **percentuale**. Il tasso
  di rivalutazione del TFR diventa **1,50% + 75% × 1,011% = 2,25825%** (era 3,000%): su un fondo
  da 8.000 € la rivalutazione scende da 240,00 a **180,66 €** e il costo orario da 19,57 a
  **19,50 €/h**; sulla stima (chi non ha il fondo scritto) da 23,00 a **17,31 €**.
  🐞 **Trappola chiusa nella stessa versione**: la casella avrebbe mostrato «1,01» mentre il conto
  usava 1,011 — e salvando si sarebbe scritto 1,01 nei dati. Ora il valore di partenza si scrive
  con tutti i suoi decimali. ⚠️ Se nei valori comuni c'è **già** un numero salvato prevale quello:
  va cambiato a mano e salvato con 💾. ⚠️ È il dato di **dicembre 2025**, da riscrivere ogni
  gennaio. Provato in esecuzione: 7 controlli su 7, più tutta la regressione.
- **Dipendenti ver115 (06/11/2026) — «Anni per rivalutazione TFR» parte da 1 e dice a chi serve.**
  Christian ha fatto notare che quella casella non è un'aliquota ma un'anzianità, e che dalla
  ver114 serve **solo a chi non ha scritto il fondo TFR**. Ora la casella lo **dice**: «serve solo
  a chi non ha il fondo TFR scritto: 1 persona su 3», e quando **tutti** hanno il fondo l'etichetta
  diventa grigia con «non in uso». ⚠️ **Non è stata bloccata**: spegnerla metterebbe a zero, in
  silenzio, la rivalutazione di chi il fondo non ce l'ha. Il **valore di partenza passa da 2 a 1**
  (scelta di Christian): per chi non ha il fondo la rivalutazione stimata si dimezza (45,99 →
  23,00 €), per chi ce l'ha **non cambia nulla**. Provato in esecuzione: 10 controlli su 10.
- **Dipendenti ver114 (06/11/2026) — la rivalutazione del TFR si calcola sul fondo vero.**
  Christian ha chiesto come si calcola e se era giusta, poi «il più veritiero?» fra tre strade, e
  ha dato Nu\* alla seconda. Per legge si rivaluta il **fondo TFR accantonato al 31/12 dell'anno
  prima** al **1,50% + 75% dell'ISTAT**: la percentuale nell'app era giusta, la **base no** —
  rivalutava la quota del periodo moltiplicata per una manopola «Anni», e su un fondo da 8.000 €
  metteva 46 € invece di 240. Ora nella scheda ci sono **«TFR accantonato al 31/12 €»** e
  **«TFR accantonato — anno»**: col fondo scritto il conto è quello di legge, in proporzione ai
  mesi di rapporto; **con la casella vuota non cambia niente** (verificato, numeri identici).
  ⚠️ Il fondo si rivaluta **anche nei mesi non pagati** (i mesi tutti «AN»), perché il debito
  resta. ⚠️ Se l'anno del fondo non è quello giusto l'app lo dice con un **avviso giallo**.
  ⚠️ **Per chi ha anzianità il costo orario sale** (19,35 → 19,57 €/h nel caso provato): prima
  era sottostimato. ⚠️ L'**ISTAT** resta un numero scritto a mano (oggi 2,00%) e **va controllato
  ogni anno**. Provato in esecuzione: 12 controlli su 12, più tutta la regressione.
- **Dipendenti ver113 (06/11/2026) — ogni voce del Costo orario dice la sua aliquota.**
  Richiesta di Christian: «indica aliquote e parametri di riferimento che consentono il calcolo a
  lato di ogni voce». Sotto il nome di ogni voce del dettaglio c'è ora una riga piccola grigia con
  il parametro usato davvero: «26,90% × 100,00% su imponibile II», «mensile fisso × 12/12 mesi di
  ratei», «244,36 h sul periodo × 12,6045 €/h (maggiorazione 27%)», «25,00 € × 12 cedolini».
  **Nessun calcolo è stato toccato**: gli importi della ver112 sono identici al centesimo.
  Verificato ricalcolando **ogni voce dai numeri scritti nella nota** su tre casi — 60 controlli
  su 60, zero errori di pagina. ⚠️ Le percentuali si scrivono per intero quando ne hanno più di
  due decimali (il FIS è **0,53333%**) e la paga oraria delle ore aggiuntive ha **4 decimali**,
  altrimenti il conto rifatto a mano non tornava. ⚠️ Previdenza complementare e IRAP escono a
  zero perché la **quota a carico è 0%**: ora la riga lo dice. L'**Excel non è stato toccato**
  (Christian: «lascia pure»), e la **maggiorazione delle ore aggiuntive resta com'è**: al suo
  «fino al 30 settembre 26 le ore aggiuntive erano pagate tra le ordinarie» ha fatto seguire
  «esisteva il criterio orario… lascia correre».
- **Dipendenti ver112 (05/11/2026) — il mese tutto «AN» non si paga, ma il rapporto va avanti.**
  **Regola definitiva**, dopo tre passaggi nella stessa giornata: ver110 «se è tutto AN non c'è
  rapporto» (escluso da tutto) → ver111 «il rapporto va avanti, mica si ferma» (solo segnalato) →
  **ver112**, chiarimento di Christian: «il rapporto va avanti nel senso che riprenderanno a
  lavorare, in quanto indeterminate», e alla domanda se in quei mesi prendono lo stipendio
  **«NO, non sono pagati»**. È il **part-time verticale ciclico**: un mese in cui **tutti** i
  giorni compilabili portano `AN` è un **mese non pagato** — niente stipendio, niente ratei
  (ferie, 13ª, 14ª), niente cedolino, festività non contate — mentre il **rapporto resta
  intatto**: contratto, livello, ore settimanali, proroghe e addizionale si leggono come prima e
  le date della scheda non si toccano. Basta una cella diversa (un'ora o un altro codice) e il
  mese torna a contare. A video la riga **«Mesi non pagati»**. Misurato (luglio e agosto tutti
  AN, gen → dic): mesi da 12,00 a **10,00**, retribuzione da 7.756,91 a **6.464,09 €**, costo da
  14.291,98 a **14.026,86 €**, €/h da 19,85 a **19,48**; con nessun mese AN i numeri sono
  **identici** alla ver111. ⚠️ Il Tabellone non cambia: `AN` resta 0 ore e non consuma il Tetto.
  ⚠️ **Conseguenza dichiarata**: con 10 mesi pagati scendono anche le ore ordinarie lavorabili,
  quindi le **ore supplementari al +27%** salgono da 100,36 a 205,72 h; il costo totale scende
  comunque, perché lo stipendio scende di più. Le ver110 e ver111 non sono mai arrivate su `main`.
  ✅ **Fatto nella ver117 del 06/11/2026**: le ore supplementari si contano **mese per mese**
  (niente compensazione) e la base è **il monte contrattuale del Tabellone**.
- **Dipendenti ver110 (05/11/2026) — un mese tutto «AN» vuol dire che non c'era rapporto.**
  Decisione di Christian. Un mese in cui **tutti** i giorni compilabili portano il codice `AN`
  non viene più pagato nel Costo orario: niente stipendio, niente ratei, niente cedolino, e le
  sue festività non si contano. Basta una cella diversa e il mese torna a contare. Nella scheda
  compare la riga «Mesi senza rapporto». Misurato (luglio e agosto tutti AN): mesi da 12,00 a
  **10,00**, retribuzione da 7.756,91 a **6.464,09 €**, costo da 14.291,98 a **14.026,86 €**,
  €/h da 19,85 a **19,48**. ⚠️ Il Tabellone non cambia: `AN` resta 0 ore e non consuma il Tetto.
  Nella stessa versione l'**addizionale tempo determinato** si ferma alla **fine del rapporto**
  invece che alla fine del periodo guardato (la casella mostrava 2,40% invece di 1,90%).
- **Dipendenti ver109 (05/11/2026) — le festività si contano solo quando il contratto è in
  piedi.** Christian: «non ti sembra che vada fatta una considerazione analoga a quella fatta per
  chi cessa prima della fine del mese o inizia durante il mese?». Prima si contavano tutte quelle
  del periodo scelto, anche se cadevano quando la persona non era assunta: il costo si gonfiava.
  Misurato: contratto fino al 30/06 guardato su gennaio→dicembre, da **8.777,08 € e 20,32 €/h** a
  **8.471,81 € e 19,61 €/h**, cioè lo stesso numero che dà il periodo gennaio→giugno — **il
  periodo che si sceglie non cambia più il risultato**. Per chi è in forza tutto il periodo non
  cambia nulla.
- **Dipendenti ver108 (05/11/2026) — avviso giallo quando i mesi sono scritti a mano.** Chiesto
  da Christian. Nel Costo orario, sotto la casella «Mesi di contratto», compare un riquadro
  giallo quando il numero scritto a mano **non coincide** con quello calcolato sul periodo
  scelto: dice quale numero sta usando l'app, quale risulterebbe dal periodo, che anche ferie,
  13ª, 14ª, assistenza sanitaria e cedolini seguono il numero scritto, e che per tornare al
  calcolo automatico basta **svuotare la casella**. Nessun calcolo cambiato.
- **Dipendenti ver107 (05/11/2026) — verifica meticolosa di tutta l'app, e un difetto trovato.**
  Christian: «Vm* che tutto si aggiorni e funzioni». **55 controlli in esecuzione** (Playwright)
  su Tabellone, Costo orario, Anagrafica, Riepiloghi, Query personale, export Excel, Report PDF
  (con jsPDF finto), backup→import, salvataggio e telefono: **tutti superati, zero errori di
  pagina**, registro delle formule rieseguito con gli stessi numeri. 🐞 Trovato e **corretto** un
  difetto che c'era dalla ver73: il pulsante «↺ Rimetti i valori calcolati» del Costo orario
  **non rimetteva niente** (due scritture di fila nello stato, la seconda cancellava la prima).
  ℹ️ Due difetti **preesistenti** misurati e non corretti: a 390px l'Anagrafica scorre di lato
  (724px, la riga dei pulsanti «Genera documento») e il Costo orario arriva a 429px.
- **Dipendenti ver106 (05/11/2026) — il cedolino esce comunque.** Christian: «paghe è fisso, se
  fai 3 giorni o 30 il cedolino esce lo stesso e il costo c'è». *Paghe e dichiarazioni* si conta
  ora sui **mesi con almeno un giorno** di contratto (terzo conteggio), non in proporzione:
  assunta il 20/01 → **300,00 €** invece di 284,68. La **formazione non è stata toccata** (250 €
  per ogni anno iniziato, almeno uno: «va fatta comunque»). Nella scheda si leggono ora tutti e
  tre i conteggi: «in forza per 11,52 mesi · ratei su 12 mesi · 12 cedolini».
- **Dipendenti ver105 (05/11/2026) — l'assistenza sanitaria sta coi ratei.** Christian:
  «assistenza sanitaria come ferie, permessi e ratei vari». Nella ver104 era proporzionata ai
  giorni veri; ora segue i **mesi con almeno 15 giorni**, come ferie, permessi, 13ª e 14ª.
  Misurato (132 €/anno): assunta il 16/01 → **132,00 €** invece di 126,68; assunta il 20/01 →
  **121,00 €** invece di 125,26. Per chi c'è tutto l'anno non cambia nulla.
- **Dipendenti ver104 (05/11/2026) — due conteggi dei mesi: i giorni veri e i ratei.** Regola
  definitiva di Christian: «la retribuzione è tarata sui gg veri, tutto il resto è proporzionato,
  ma ferie, 13ma e 14ma maturano solo se ci sono almeno 15gg». Quindi: **retribuzione e tutto il
  resto** (contributi, TFR, premi, settimane, assistenza sanitaria, paghe, rimborso) seguono i
  **mesi proporzionati ai giorni veri** (16/31 = 0,516); **ferie, tredicesima e quattordicesima**
  seguono i **mesi interi con almeno 15 giorni**. Misurato: assunta il 16/01 → 12.474,12 € e
  20,48 €/h, con 13ª e 14ª **piene**; assunta il 20/01 → 12.121,59 € e 20,20 €/h, con 13ª e 14ª
  su 11 mesi. ⚠️ Per chi lavora mesi interi **non cambia nulla**. Supera la ver103, che per un
  giorno in meno azzerava il mese intero e non è mai arrivata su `main`.
- **Dipendenti ver103 (05/11/2026) — il mese parziale non vale più un mese intero.** Christian:
  «se uno cessa prima della fine del mese o inizia durante un mese, la retribuzione non è quella
  completa mensile». Nel Costo orario bastava **un giorno** di contratto perché il mese valesse
  uno intero. Regola scelta da Christian: **il mese conta se il contratto copre almeno 15 giorni
  di calendario, altrimenti zero** (la regola dei ratei della tredicesima; niente frazioni).
  Misurato: assunta il 16/01 → numeri **identici** a chi c'è tutto l'anno; assunta il 20/01 →
  costo da 13.080,54 a **12.969,02 €** e €/h da 20,19 a **20,01**. ⚠️ Le ore di quel mese contano
  lo stesso, la retribuzione no: un mese sotto i 15 giorni abbassa il €/h. ⚠️ **I costi orari
  calcolati finora su chi è stato assunto o è cessato a metà mese erano sovrastimati.**
- **Dipendenti ver102 (05/11/2026) — le scritte non ammesse non entrano più.** Christian:
  «volevo dire *inibiamo*». Nella cella del Tabellone ora si può scrivere **solo** un numero di
  ore (al massimo due cifre, niente negativi) oppure **un codice dell'elenco**: un carattere non
  ammesso non entra, la casella trema e l'app lo dice; all'uscita «ferie» diventa **FERIE** e un
  pezzo rimasto a metà («FER») viene tolto spiegando perché. Incollare «MALATTIA» o una frase non
  scrive nulla. 🛡️ Una scritta **già nei dati** non viene cancellata solo perché si entra e si
  esce dalla cella: resta, segnalata in rosso dalla ver101. Compila veloce non passa di qui e
  funziona come prima. Nessun calcolo toccato; registro delle formule rieseguito, stessi numeri.
- **Dipendenti ver101 (05/11/2026) — le scritte non riconosciute nel Tabellone si vedono.**
  Difetto che c'era da sempre, trovato controllando le formule: in una cella si poteva scrivere
  qualunque cosa («MALATTIA» per esteso invece del codice `MAL`, «pippo», un appunto); quel
  giorno valeva **0 ore**, non contava come assenza e **nessuno lo diceva**. Ora la casella
  diventa **rossa** e sopra la griglia compare una **fascia** che elenca i giorni e cosa c'è
  scritto. ⚠️ La scrittura **non viene rifiutata** (battendo «FERIE» si passa per «FER»): il
  rosso compare solo quando si esce dalla cella. Nessun calcolo toccato; il registro dei
  controlli sulle formule è stato rieseguito e dà gli stessi numeri.
- **Dipendenti ver100 (05/11/2026) — il massimale si scrive servizio per servizio.** Richiesta di
  Christian: un massimale che **derivi dalla somma** di più celle, una per servizio. Ora in
  «Massimali annui» si possono aggiungere righe *nome del servizio + ore*: l'app ne fa la somma,
  che diventa il tetto dell'anno, e il dettaglio si legge sia nella scheda sia nel riquadro
  🎯 Tetto annuo del mese. ⚠️ Il dettaglio vale **solo per l'assegnazione**: quante ore ha
  consumato ciascun servizio l'app non lo sa, perché nel Tabellone il giorno è un numero solo e
  non porta il servizio. Nessun calcolo toccato: il tetto resta un numero unico.
- 🧭 **Divisione dei massimali fra le app (decisione di Christian, 05/11/2026)**: in **Fogli ore**
  i massimali si mettono **solo ai collaboratori esterni** (per servizio), in **Dipendenti** si
  mette il **massimale complessivo** del dipendente; pubblicando i residui, il dipendente vede
  **solo il totale**.
- **Dipendenti ver99 (05/11/2026) — anche il permesso può essere non erosivo.** Christian:
  «potrebbe essere di un giorno durante le vacanze natalizie in luogo del giorno di ferie, quindi
  è erosivo o non erosivo anche esso». Nella finestra del permesso c'è ora la spunta **«Quel
  giorno il servizio era chiuso»**: spuntata, quel permesso **non consuma** il Tetto annuo e la
  targhetta viola nel Tabellone si vede **barrata**. Il contrassegno è quello del **giorno**, lo
  stesso delle assenze: se quel giorno ha anche un'assenza, vale per entrambe.
  ⚠️ Il **Risultato del mese non cambia**: lì i permessi retribuiti contano tutti, come lo
  straordinario conta tutte le assenze. Misurato: tetto «Già usate» 474,020 → **472,020** con la
  spunta su 2 h di EXF, e ritorno esatto togliendola.
- **Dipendenti ver98 (05/11/2026) — il permesso retribuito consuma il Tetto annuo.** Decisione di
  Christian: «il permesso potrebbe essere anche per tutto il giorno, funzionando quindi come il
  giorno di ferie; e a mio avviso consuma certamente anche se è di un'ora». `prodottoMese` ora
  somma **ore rese + assenze erosive + permessi retribuiti** (i cinque tipi della tendina: EXF,
  LUTTO, ELEZ, ESAMI, SIND); quelli con il tipo scritto a mano restano fuori, come nel Risultato
  del mese. Il totale teorico del Tabellone somma gli stessi tre pezzi.
  ⚠️ **Lo straordinario non cambia** (`coverAbsHours`/`bancaMeseA` invariati): il Risultato del
  mese resta identico al millesimo. ⚠️ **I residui già pubblicati sono vecchi**: va ripremuto
  📤 Pubblica i residui. Misurato: tetto «Già usate» da 472,020 a **474,020 h** con 2 h di EXF.
- 📱 **Collaboratori rev 8 (07/11/2026) — la scheda non scorre più di lato sul telefono.**
  Dall'audit generale, con il Nu\* di Christian. Due difetti **preesistenti** di solo aspetto:
  (a) a 390px la scheda dell'operatore misurava **478px** per colpa della barra di navigazione,
  che non andava a capo, e della tendina «Vai a operatore…» larga 160px → aggiunta la **prima
  `@media (max-width:900px)`** dell'app, ora **390px**; (b) fuori dalle tabelle restavano
  **40 scritte in copertina e 15 nella scheda** sotto i 12,5px (i pulsantini a 10px, `.os` e
  `.drive-status` a 11px, le etichette `.kl`/`.sl` a 12px): il blocco della rev 2 le portava a
  12px, cioè ancora sotto il minimo del §10.6, e non vedeva le regole di classe → ora sono
  **zero**. ⚠️ Dentro le tabelle **non è stato toccato niente**: le righe delle due tabelle dense
  restano **19-31px identiche alla rev 7** (il −40% chiesto da Christian) e i pulsanti fuori
  dalle tabelle restano tutti ≥40px. Nessuna dicitura, nessun dato, nessun calcolo.
- **Collaboratori rev 7 (05/11/2026) — righe più basse nelle due tabelle della scheda.**
  Christian: «abbassa l'altezza righe delle liquidazioni e delle ore mensili effettuate almeno del
  40%». A tenere le righe a 43px non erano le caselle (già a 28px dalla rev 5) ma il **pulsante**
  nella prima colonna, che la regola generale teneva a 40px. Con una classe messa su **quelle due
  tabelle soltanto** (`.tbl-dense`), lì dentro caselle e pulsanti scendono a 22px: righe da
  **43 a 23px (−46,5%)**, scheda da 911 a **790px**. ⚠️ Fuori da quelle due tabelle **non cambia
  niente**: i pulsanti restano alti 40px. Nessuna dicitura, nessun dato, nessun calcolo toccati.
- **Dipendenti ver97 (05/11/2026) — il totale teorico nel Tabellone e il pulsante dei residui che
  si vede.** Due richieste di Christian. (1) Accanto alle ore **effettive** del mese ora si legge
  anche il **totale teorico**: ore fatte **più** le ore delle giornate di assenza **erosive**
  (quelle non spente col clic), cioè esattamente il numero che consuma il **Tetto annuo**. Sta in
  due posti: dentro la cella TOT della griglia («teor. 112,02») e nella riga in fondo («TOT
  teorico (con assenze retribuite erosive): 112,020»). ⚠️ I **permessi orari non ci entrano**, e
  **nessun calcolo è stato toccato**: il Risultato del mese resta identico al millesimo.
  (2) Il pulsante **📤 Pubblica i residui** era grigio fra altri pulsanti grigi: ora è **giallo
  con la scritta in blu elettrico** (contrasto 5,45:1), dicitura invariata.
  - 🚫 **Non è stato reso automatico** (Christian l'aveva ipotizzato): scrive nel progetto
    condiviso con gli esterni, e il §10.1 vuole la pubblicazione **manuale e con conferma nome per
    nome**. In attesa di una sua decisione.
  - ⚠️ **Limite che Christian ha segnalato lo stesso giorno, ancora aperto**: un dipendente può
    avere **certi servizi con un tetto e altri senza**, e il Tetto annuo **mescola i servizi**;
    il numero che l'operatore vede in Fogli ore è quindi **complessivo** e, per chi lavora anche
    fuori dal tetto, può risultare **non veritiero**. Oggi il pulsante pubblica **tutti** quelli
    che hanno un tetto, senza poter scegliere chi.
- **Dipendenti ver96 (05/11/2026) — «non calcolabile» invece di un numero inventato.** Se nel
  Costo orario si scelgono le ore «dai Riepiloghi» e in quel periodo non ce n'è nessuna, l'app
  ricadeva in silenzio sulle ore **teoriche** e mostrava un costo orario su ore che non esistono
  (anche nel foglio Excel). Ora scrive **«non calcolabile»**; il Costo totale resta.
- ⚖️ **Costo orario sui periodi corti — limite noto e accettato (05/11/2026).** Indagando un caso
  vero si è visto che su **un mese solo** il costo orario **sovrastima di circa il 10%**: l'app
  toglie ogni mese la fetta presunta di ferie e malattia, e le ore in più diventano
  «supplementari» al +27%. **Sull'anno intero il conto torna da solo** (misurato: 20,32 €/h con
  0,03 h di supplementari). ⚠️ Christian ha deciso di **lasciare il calcolo com'è**: per il numero
  vero si usa **l'anno intero o tutto il contratto**, mai un mese singolo.

- **Dipendenti ver95 (05/11/2026)** — tolta la riga di legenda in fondo al Report, su richiesta
  di Christian. Restano titolo, recupero/ore nuove, note del mese, permessi orari e avvisi.

- **Dipendenti ver94 (05/11/2026)** — nel Tabellone, sulla barra colorata di ogni persona e a
  destra, compare il **mese di riferimento** («Novembre 2026») grande come il nome: scorrendo un
  mese lungo la fascia in cima esce dallo schermo e non si sapeva più che mese si guardava.

- **Dipendenti ver93 (05/11/2026) — i permessi finalmente contano, e il Report si legge.**
  Christian si accorge che un permesso orario non muoveva nessun numero. Ora le ore di permesso
  **retribuite** contano nel **Risultato del mese** come un giorno di ferie (numero confermato da
  lui: 120 h rese + 2 h EXF su base 130,263 → **−8,263**), ma restano **fuori dal TOT**, quindi
  rendicontazione e costo orario non cambiano. La tendina tiene solo i cinque tipi retribuiti per
  legge: **EXF, LUTTO, ELEZ, ESAMI, SIND**; un tipo scritto a mano non conta e l'app lo dice.
  Nel **Report** i numeri passano da 7 a **9pt** (più grandi non si può: la tabella si
  spezzerebbe su due pagine) e la cella col permesso dice «+ aggiunta come sotto ***».
  🐞 Corretto un difetto che c'era da sempre: i controlli di fine pagina del Report usavano
  l'altezza del foglio **verticale** (287mm) su un foglio **orizzontale** (210mm), quindi le note
  in calce potevano finire fuori pagina e sparire.

- **Dipendenti ver91 (05/11/2026) — i permessi orari si vedono, e due nomi nuovi.** Christian:
  «la questione dei permessi è poco chiara». Nel **TABELLONE** (così si chiama da ora la pagina
  del mese con le celle di tutti, e il titolo in cima lo dice: «Tabellone Novembre 2026») sotto
  la cella compare una targhetta viola **«+2,00 h EXF»**: prima il permesso era solo un pallino
  da 11px. Nel **REPORT** (così si chiama da ora il PDF A4) il permesso è segnalato con **tre
  asterischi grossi** al posto di uno piccolo, e in calce si legge «NOME — giorno 10: Aggiungere
  2,00 ore di permesso (EXF)». ⚠️ Le ore di permesso continuano a NON entrare nel TOT.
  In **ver92** il pulsante in testata si chiama **«🖨️ Report PDF A4»** (dicitura scelta da
  Christian); il titolo del mese resta «Tabellone Novembre 2026», con l'iniziale maiuscola.

- **Dipendenti ver89 (04/11/2026) — il colore della persona vale ovunque.** La cornice della
  scheda del mese passa da 3 a **8px** nel colore scelto per quel dipendente, e lo stesso colore
  diventa una **barretta a sinistra del nome** in Riepiloghi, Anagrafica, Costo orario e Query
  personale. ⚠️ Barretta e non sfondo pieno: i colori della tavolozza sono chiari e come sfondo
  renderebbero i numeri meno leggibili. ⚠️ **Export Excel e PDF: no, deciso da Christian il
  04/11/2026** — il colore resta solo a video. Idea scartata, non riproporla.
- **Dipendenti ver90 (04/11/2026)** — corretto un difetto che c'era da sempre: nella vista
  *Query personale* la fascia in alto scriveva «📅 undefined 2026». Ora dice «🔎 Query personale».

- **Dipendenti ver88 (04/11/2026) — i colori del risultato del mese.** Scelti da Christian:
  **rosso** se il mese è sopra la base (straordinario), **verde acqua** se è sotto, **verde** se
  è in pari. ⚠️ È l'unico punto in cui il rosso non vuol dire «pericolo»: l'ha chiesto lui.

- **Dipendenti ver87 (04/11/2026) — il PDF A4 torna a dire le ore.** Richiesta di Christian: nel
  PDF le ore si scrivono **ORE,MINUTI** (5,30 = cinque ore e mezza, 5,45 = cinque ore e tre
  quarti), non più «5 h e 30 min», e per i **mensilizzati** si leggono le ore al posto della «P»
  di presenza. ⚠️ Il **totale finale resta in centesimi** (numero decimale vero): sono due misure
  diverse nella stessa tabella, ed è voluto.

- **Dipendenti ver86 (04/11/2026) — si legge meglio il foglio del mese.** Christian: «la vista
  mi si confonde» e «il risultato del mese evidenzialo bene». Le righe della griglia passano da
  1px quasi invisibile a 2px di grigio medio, la casella in cui si scrive da 2 a 3px, il
  **risultato del mese** diventa un badge pieno e grande, e **TOT calcolato** si legge da lontano.
  Inoltre la riga di confronto con **Fogli ore** dice ora anche **quante giornate di ferie,
  malattia e altre assenze** ha segnato l'operatore, e **compare sempre** (sobria quando tutto
  combacia, arancione quando qualcosa non torna). ⚠️ Nessuna dicitura e nessun calcolo toccati;
  Fogli ore resta in sola lettura.
- **Gennaio e febbraio 2025 erano vuoti in Dipendenti (04/11/2026).** Confronto cella per cella
  fra il backup dell'app e l'Excel *Report ore gen25-dic25*: da marzo a dicembre tutto quadrava
  al centesimo, ma **gennaio e febbraio non avevano nessuna ora** (al loro posto le annotazioni
  dell'Excel, «3h e 45 min»): quei due fogli hanno una riga in meno degli altri e l'importazione
  di allora aveva letto la riga sbagliata. Mancavano **1.762,49 ore**. Rimesse con un file JSON
  che tocca **solo** quei due mesi. Registrate anche le **ore settimanali cambiate nel 2025** di
  **tre dipendenti** (9,5 → 12 → 18 → 12 · 21 → 17 · 16 → 15), come trasformazioni
  dal 01/01/2025 in poi: ⚠️ **prima del 2025 non cambia niente**, perché il valore di base è
  rimasto quello che c'era.

- **Dipendenti ver85 (04/11/2026) — si vede quante ore sono le «ore aggiuntive».** Christian
  chiede di vedere, nel Costo orario, **quante ore** finiscono nelle aggiuntive: il numero era
  già nei conti ma a video c'era solo l'importo in euro. Ora la tabellina del dettaglio mostra le
  ore **al mese** e **sul periodo**, una nota dice **da dove vengono** (dal dato vero: ore
  dichiarate meno ore ordinarie lavorabili; oppure stimate con la % quando le ore sono
  *Teoriche*) e **con che maggiorazione** si pagano (15% sul minimo a 38 h/sett., altrimenti
  27%); nella tabella dei blocchi c'è una colonna con le aggiuntive di ciascun pezzo.
  ⚠️ **Nessun calcolo toccato**: provato su quattro casi, ore, costo e €/h **identici** alla
  ver84. Effetto collaterale buono: a 1280px la scheda **non scorre più di lato**.

- **Dipendenti ver84 (04/11/2026) — il periodo si taglia da solo in blocchi.** Christian dà un
  periodo unico e l'app lo divide dove cambia qualcosa (livello, ore settimanali, tipo di
  contratto, entrata in vigore di una proroga); ogni pezzo si calcola con i suoi parametri e poi
  si somma: **costo orario = Σcosti ÷ Σore**. ⚠️ La **formazione** è contata **una volta sola**
  sul periodo (altrimenti due blocchi = 500 € invece di 250). Le ore dai Riepiloghi e quelle
  teoriche sono esatte per blocco; quelle scritte a mano si ripartiscono in proporzione. Se ci
  sono valori scritti a mano o conteggi in mesi non ripartibili (maternità, mesi tolti) il conto
  resta **su un pezzo solo**, con un avviso giallo che lo spiega. Esempio verificato: promozione
  D1→D2 a giugno con due proroghe → 4 blocchi, **20,27 €/h** contro i 20,76 di prima. Su chi non
  ha cambiamenti i numeri sono **identici al centesimo**.
- **Dipendenti ver83 (04/11/2026)**: stessa famiglia del difetto sul livello. L'**addizionale
  tempo determinato** contava **tutte** le proroghe scritte in scheda, anche quelle che partivano
  **dopo** il periodo calcolato. Ora conta solo quelle **già decorse** entro la fine del periodo
  (una proroga parte il giorno dopo la scadenza precedente), e l'aiutino sotto la casella mostra
  il numero davvero usato. Provato: con proroghe al 30/06 e al 31/12, il periodo gen→mag 2026
  passa da **2,40%** a **1,90%**; gen→dic resta 2,40%.
- **Dipendenti ver82 (04/11/2026)**: nel **Costo orario** il livello non seguiva le
  **trasformazioni**: chi era stato assunto a D1 e poi promosso restava a D1, con il minimo
  tabellare sbagliato (segnalato da Christian su un caso vero). Ora il livello è quello
  dell'**ultimo mese del periodo**, letto dalle trasformazioni registrate nella scheda.
  Provato: assunta D1 e promossa D2 → prima 19,65 €/h con minimo 1.637,57, ora **20,71 €/h** con
  minimo 1.727,83. ⚠️ Se il livello cambia a metà periodo si applica quello finale a tutto il
  periodo (come già per le ore settimanali): per un conto esatto si spezza il periodo in due.
- **Dipendenti ver80 (04/11/2026)**: nel Costo orario la casella del **rimborso km** non si
  riusciva a compilare (conteneva uno «0», scrivendo 50 diventava «050»): ora è **vuota** quando
  non c'è rimborso. Aggiunta la tendina **al mese / secco**, perché in alcuni casi il rimborso è
  mensile e in altri una tantum. ⚠️ Il rimborso **non entra in nessun imponibile**: è esente da
  imposte e contributi, finisce solo nel totale. Inoltre il pulsante «Valori comuni» si chiama
  ora **«Aliquote e costi fissi validi per tutti»** (dicitura scelta da Christian), e
  l'etichetta del rimborso è **«Rimborso km €»** (ver81): «€/mese» era falso con la tendina su
  *secco*.
- **Dipendenti ver79 (03/11/2026) — sette correzioni ai criteri del costo orario.** Christian ha
  visto un costo orario di **27,81 €/h** su un mese singolo invece di ~20: le **festività** erano
  due numeri fissi annui (11 e 3) tolti per intero da qualunque periodo, anche da un mese solo.
  Ora si **contano dal calendario** del periodo (goduta = in giorno lavorativo; non goduta = di
  domenica, più il **4 novembre** sempre). Inoltre: **INPS 26,40 → 26,90%**; dal **TFR** si toglie
  lo **0,50%** calcolato sulla base dei contributi (operazione neutra sul totale); le **festività
  non godute escono dall'imponibile TFR**; **assistenza sanitaria** proporzionata ai mesi (11
  €/mese, solo indeterminati); **formazione** 250 € per ogni anno iniziato; **Sant'Ambrogio (7
  dicembre)** aggiunto ai festivi — e quindi, da ver77, quel giorno **non si compila più**.
  Sull'anno intero il costo orario non si muove (19,65 → 19,68); sui periodi corti sì
  (27,81 → 23,49 su un mese). ⚠️ I costi orari calcolati finora su periodi più corti dell'anno
  erano sovrastimati.
- **Il dipendente vede le ore che gli restano (03/11/2026) — Dipendenti ver78 + Fogli ore rev 7.**
  Dipendenti calcola quante ore restano del tetto annuo e, con il pulsante **📤 Pubblica i
  residui** (mai da solo, con conferma nome per nome), scrive un documentino per persona nella
  nuova collection **`residui`**: doc-id = uid dell'operatore, dentro **solo numeri**. In Fogli
  ore ciascuno vede **solo il proprio**, in un riquadro nella sua pagina. ✅ **Le regole sono
  pubblicate**: verificato il **07/11/2026** confrontando il testo in vigore nella console con
  `regole-firestore/regole-residui-03nov26.rules` — **identici carattere per carattere** — e
  rieseguendo l'emulatore ufficiale su quel testo: **51 controlli su 51**. ⚠️ Prima di quella
  pubblicazione il pulsante falliva (misurato: 4 controlli negati) e il riquadro non compariva. È l'unica scrittura che Dipendenti fa fuori dal proprio documento.
- **Dipendenti ver77 (03/11/2026) — giornate erosive e festivi bloccati.** Regola nuova decisa da
  Christian: un'assenza **consuma il massimale solo se quel giorno il servizio era aperto** (ferie
  a novembre sì, ferie a Natale no). Si segna con **un clic sul numerino sotto la cella**: in
  chiaro erode, barrato no. Agisce **solo sul Tetto annuo**; lo straordinario è rimasto identico.
  Deciso di **non creare un secondo tipo di massimale per servizio**: si usa il Tetto annuo che
  c'era già, per anno scolastico. ⚠️ Inoltre, su richiesta di Christian, i **giorni festivi e le
  domeniche non si compilano più** (né ore né codici): chi lavora davvero a Natale non si può più
  registrare, e le ore già scritte sui festivi non sono più correggibili.
- **Dipendenti ver76 (03/11/2026)**: la scheda **Costo orario** ha scritte **più grandi** e spazi
  **più stretti** insieme (etichette 12→13px, tabelle 13,5→14,5px, titoli 15→16px; imbottiture
  9/11→7/10px, righe delle tabelle 2→1px). Dentro la scheda non resta niente sotto i 12,5px e
  l'altezza di caselle e pulsanti non è cambiata. Sugli schermi **da 1500px in su** i blocchi si
  dispongono su **due sotto-colonne** (pagina da 1439 a 1299px a 1680); sotto i 1500px la
  disposizione è quella di prima. Su **telefono** i campi stanno in due per riga e la tabellina
  delle settimane non esce più di lato (difetto preesistente): pagina da 3756 a 3368px.
  Nessuna dicitura cambiata, nessun calcolo toccato.
- **Dipendenti ver75 (03/11/2026)**: la *% di ore supplementari stimate* del Costo orario si
  **spegne a vista** (etichetta grigia + «non in uso») quando le ore non sono «Teoriche», perché
  in quel caso non entra nei conti. Solo aspetto, nessun calcolo toccato.
- **Collaboratori rev 6 (03/11/2026)**: le ore, le date e le tariffe **scritte a mano** erano a
  13px in tondo, più piccole del testo intorno; ora sono a **15px in neretto**, così si staccano
  dai numeri calcolati dall'app. Le righe non si sono alzate.
- **Numeri di revisione** in tutte le app (§4).
- **`CLAUDE.md`** in tutti e quattro i repository (§8).

---

## 5-bis. Il ripristino del backup di USOINT: difetto trovato e corretto (04/11/2026)

⚠️ **Correzione di un'informazione sbagliata**: era stato scritto che USOINT non aveva il backup
JSON. **Non è vero**: nella Home ci sono «💾 Backup dati» e «📂 Ripristina backup».

**Il difetto** (ver120 e precedenti): il ripristino riscriveva i dati nel browser e ricaricava la
pagina; alla ricarica l'app rifà l'accesso e `fbSync` **scaricava dal cloud sovrascrivendo
tutto**, cancellando in silenzio il ripristino. L'avviso «Ripristinati N elementi» era una bugia.
Dimostrato in esecuzione con un finto Firebase.

**Corretto in ver121**: dopo aver riscritto il browser si **spinge tutto nel cloud** (`fbPush`,
funzione che era già nel file e non veniva mai chiamata) e solo dopo si ricarica. Se la scrittura
nel cloud fallisce, **la pagina non si ricarica** e l'avviso lo spiega. Inoltre: prima si
controlla il file (non JSON, vuoto, o senza chiavi `usoint*` → non si tocca niente) e poi si
chiede **conferma esplicita**. ⚠️ Limite: quello che c'è adesso e non è nel file **non viene
cancellato**; è scritto nella conferma.

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
- **01/11** Dipendenti: nel file pubblico su GitHub Pages c'erano **dati personali veri**
  (anagrafiche con codice fiscale, email e indirizzo, elenco dipendenti, ore di gennaio, note
  con riferimenti a malattie). Rimossi in **ver67**. La regola ora è scritta nel `CLAUDE.md`
  dell'app: **mai dati di persone dentro `index.html`**, nemmeno "solo come esempio".
- **02/11** Christian ha **cancellato** i repository di Dipendenti, Fogli ore e Collaboratori
  (dopo averne scaricato il contenuto), per far sparire la vecchia storia pubblica con i dati
  personali. Conseguenza immediata: **le tre app sono rimaste offline** (GitHub Pages non serve
  da un repository che non esiste) e **il ramo di lavoro con la ver68 esisteva solo nella copia
  locale di Claude**. Ricreati e ricaricati lo stesso giorno. **Da ricordare**: cancellare un
  repository spegne l'app pubblicata e butta i rami non ancora scaricati; se serve far sparire la
  storia, si ricrea con un unico commit **senza cancellare il repository**.

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
- **Punti di ripristino**: in Fogli ore, Collaboratori e USOINT c'è il ramo `stabile-30ott26` con
  la versione buona del 30/10/2026 (le etichette di versione "tag" sono rifiutate da GitHub a
  Claude: errore 403). In **Dipendenti** quel ramo non c'è più: dopo l'azzeramento della storia
  (02/11/2026) il punto di ripristino è il ramo **`ripristino-ver67`**, un unico commit con la
  ver67 — cioè la versione senza la compilazione veloce per giorni scelti.
- **Storia dei repository dopo il 02/11/2026**: **Dipendenti** ha **un solo commit** su `main`
  (ver68), senza passato: la vecchia storia con i dati personali non esiste più da nessuna parte.
  **Fogli ore** (28 commit) e **Collaboratori** (24 commit) hanno conservato la cronologia, ma con
  **identificativi di commit nuovi**: le copie di lavoro erano "shallow" (tronche), quindi la
  storia è stata ri-radicata per poterla ricaricare. I contenuti sono **identici byte per byte**
  alle versioni precedenti (verificato con md5 su `index.html`, `CLAUDE.md` e i file
  `regole-firestore/`).

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
3. **Sicurezza del progetto degli esterni — VERIFICATA e RISOLTA il 30/10/2026**: la
   registrazione è aperta e i dati stanno in collection globali, quindi tutto dipende dalle
   regole Firestore. Le regole fino a quel giorno avevano **due falle dimostrate** con
   l'emulatore ufficiale: un operatore poteva scrivere (e per quella via leggere) il foglio ore
   di un collega, e chiunque si registrasse poteva crearsi il documento utente con
   `role:"admin"`. **Christian ha pubblicato il testo corretto in console il 30/10/2026**, ed è
   stato verificato rileggendo le regole in vigore: entrambe le falle sono chiuse. Testo,
   prova automatica da 39 controlli e cronaca completa in **`regole-firestore/`** del repo
   `spazioireos-foglio-ore`. **Le regole si pubblicano a mano in console Firebase**: Claude non
   ha accesso, quindi quel passaggio è sempre di Christian. Restano aperte per scelta: blocco
   mese (`locks`) e ruolo `disabled` non imposti dal database, creazione libera dei documenti
   `lightsheets`.
4. **Assenze non pagate — CHIARITO il 31/10/2026, il comportamento attuale è CORRETTO.**
   `MAL 0h` (malattia non pagata), `ASP 0h` (aspettativa non pagata) e `CASSA` (cassa
   integrazione) hanno `pay:false` nella tabella dei codici, e `coverAbsHours()` le conta come
   gli altri codici. **È giusto così**: regola di Christian — *quelle voci abbassano il monte ore
   dovuto nel mese*. Sommarle alle ore rese equivale esattamente a sottrarle dal monte, quindi il
   conto attuale realizza già la regola. Esempio: contratto 165 h, lavora 150 h, 2 giorni di
   aspettativa → dovute 152,30, risultato −2,31 (corretto). La riduzione dello stipendio nasce
   dai giorni non pagati e la fa il cedolino: il numero dell'app è un saldo di ORE, non una
   trattenuta. ⚠️ **Non "correggere" questo comportamento**: sembra un difetto e non lo è.
   Confermato di nuovo il 31/10 dopo averne esaminato le conseguenze: **quelle ore contribuiscono
   a formare il monte ore**, punto. Conseguenza nota e accettata: chi si assenta senza paga e poi
   recupera lavorando di più vede quelle ore diventare straordinario (170 h con 2 giorni di
   aspettativa → +17,69 invece di +5). Non è un caso permesso, ma **si governa autorizzando o
   meno lo straordinario**, non cambiando il calcolo. Il programma segnala, Christian decide.
5. Le funzioni nuove **non sono provate su dati veri**: le prove di Christian sono quelle che contano.
6. **Dipendenti, scheda del dipendente** (ver62, 31/10/2026): la finestrella "Modifica
   dipendente" è stata eliminata e tutto si gestisce dalla **scheda ANAGRAFICA**, che in fondo ha
   ora *Trasformaz./proroghe*, *Monte ore (anche temporaneo)*, *Mensilizzazione*, *Massimali
   annui*, *Colore*. Stessi campi di prima, **nessun calcolo toccato**. **Da verificare su dati
   veri**: che banca ore, massimali e monte ore mensile diano gli stessi numeri di prima.
   **Risolti il 31/10**: la casella **"Ore dichiarate"** ora si compila per tutti, mensilizzati
   compresi (ver63) — la differenza fra dichiarato e calcolato si riporta da sola nei mesi
   successivi finché non viene sistemata o il saldo azzerato; e lo **straordinario** (ver64) non
   nasce più dalle assenze retribuite: ferie e malattia coprono le ore mancanti ma non generano
   straordinario (`deltaStraoMese`). La **Banca ore** è rimasta con il conto di prima: Spazio
   Ireos non la usa, risolve tutto dentro il mese.
7. **Fogli ore su telefono/tablet** (rev 2 e rev 3 del 30/10/2026): la colonna del giorno resta
   ferma mentre si scorre di lato; lo zoom con due dita è tornato possibile; le caselle degli
   orari sono alte 40px e le tendine 36px, e i bersagli sotto i 32px nella tabella sono passati
   da 405 a 33; istruzioni e cartelloni sono più compatti e la schermata iniziale entra in uno
   schermo di telefono (da 958px a 844px). Restano **non risolti**: la tabella del mese è larga
   906px con 36 colonne, quindi su un telefono se ne vede meno della metà e si scorre di lato;
   restano scritte sotto i 12px nelle intestazioni; bloccare in alto tutto il capo-tabella non è
   possibile senza cambiare come scorre la pagina (provato con l'emulatore e fallito).

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
> `https://spazioireos.github.io/rendicontazione-usoint/integrata/`, rev 5) con quattro pulsanti che
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
