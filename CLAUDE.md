# Istruzioni per Claude — app "USOINT — Rendicontazione uso interno"

Rendicontazione **interna dei progetti**: budget preventivo (personale + beni/servizi),
cofinanziamento, ore rendicontate per anno/mese e per progetto, avanzi e residui, fatture.
USOINT sta per **"uso interno"**.

- **Unico file**: `index.html` (~236 KB), **React MINIFICATO + Babel standalone**: quasi tutta
  la logica è su **una sola riga** (la 187 circa). Modifiche chirurgiche, con ancore esatte.
- **In questo repo c'è anche la PAGINA INTEGRATA**: `integrata/index.html`, il link unico
  `https://spazioireos.github.io/rendicontazione-usoint/integrata/` con i quattro pulsanti
  (Collaboratori, Dipendenti, Rendicontazione progetti, Fogli ore). **Apre i LINK LIVE**, non
  copie: ha un suo numero di revisione (attuale `rev 6 · 08nov26`) nella barra.
  🔄 **L'app arriva sempre fresca** (rev 5, 05/11/2026, scelta **A** di Christian dopo che aveva
  visto la ver90 quando su Pages c'era già la ver92). L'indirizzo dentro l'`iframe` era **sempre
  identico**, quindi il browser serviva la **copia in memoria**: si vedevano versioni vecchie per
  ore, e un semplice ricaricamento della pagina integrata non bastava. Ora `fresco(url)` aggiunge
  **`?v=<orario>`**, diverso a ogni apertura.
  - ⚠️ **L'indirizzo di base non cambia**, quindi accesso Firebase, PIN e `localStorage` delle app
    **restano dove sono**: il parametro non cambia l'origine.
  - ⚠️ **Si riscarica solo il file dell'app** (da 212 a 480 KB): React, Babel, Firebase e le altre
    librerie hanno indirizzi fissi e restano in memoria.
  - ⚠️ L'`iframe` parte da **`about:blank`** e non più dall'indirizzo di Collaboratori: con il
    codice variabile l'app sarebbe stata scaricata **due volte** a ogni apertura (prima la copia
    vecchia dell'indirizzo fisso, poi quella fresca). **Provato: una richiesta sola.**
  - ⚠️ **Ripremere il pulsante della sezione già aperta NON ricarica niente**, com'era prima: in
    quell'app potrebbero esserci modifiche non ancora salvate con il 💾. Per riprendere l'app
    fresca si passa a un'altra sezione e si torna indietro.
  - **Scartata l'opzione B** (un pulsante «↻ Ricarica l'app» e cache normale): Christian ha scelto
    la A, «il senso della pagina integrata è non doverci pensare». Non riproporla.
  Dalla rev 4 titolo e pulsanti sono più grandi (16px, alti 48px) per la lettura comoda.
  Layout a colonna con flexbox e **nessuna altezza fissa**: la barra si adatta da sé se i
  pulsanti vanno a capo (con altezza fissa, su tablet la seconda riga di pulsanti finiva
  nascosta sotto l app).
- **Dati**: Firebase progetto `rendicontazione-usoint`, percorso `users/{uid}/kv/<chiave>`
  (specchio di localStorage). Chiavi: `usoint-idx`, `usoint-p-<id>`, `usoint-orelav`,
  `usoint-tariffe`, `usoint-simul`. Accesso mail+password.
- **Numero di revisione**: costante `const VER` (riga ~67), mostrata in **tre punti** (Home,
  scheda progetto, Riepilogo operatori). **Attuale: ver123 · 08nov26.** `VER` finisce anche nei
  nomi dei file esportati: incrementarla, non affiancarle un secondo numero.
- **Strutture utili**: `usoint-orelav` = `{ [norm(nome)]: { [anno]: [12 numeri] } }` (ore
  lavorate, indice 0 = gennaio; `norm` = minuscolo, trim, spazi singoli).
  Ore rendicontate: `agg.data[k].years[anno][mese]` (totale) e
  `agg.data[k].prjM[titoloProgetto][anno][mese]` (per progetto), indice mese 0-based.
- **Cofinanziamento in percentuale** (da ver119, 31/10/2026): sopra la griglia del budget c'è una
  riga di scelta — *diverso per ogni voce* (com'era prima: si scrive l'importo finanziato voce per
  voce) oppure *unico per tutte le voci* con una **percentuale a carico di Spazio Ireos**. Il
  pulsante **"Applica a tutte le voci"** riscrive `cofin` di tutte le voci di `personnel` e `beni`
  come `importo × %/100` (per il personale `importo = oreT × eur`, per i beni `forf`), previa
  **conferma** che dice quante voci cambieranno. In modalità *unico*, cambiando `oreT`/`eur` di una
  voce di personale o `forf` di una voce di beni il suo `cofin` **si ricalcola da sé** (innesto
  dentro `uP`/`uB`). Nuovi campi nel progetto: **`cofinMode`** ("voce" o "pct") e **`cofinPct`**.
  Il motore di rendicontazione **non è stato toccato**: cambia solo *chi scrive* `cofin`, che
  resta un importo come prima. Funzioni: `cofR2`, `cofPctVal`, `cofAttiva`, `cofApplicaTutte`,
  `cofQuanteVoci`, `cofChiediEApplica`.
- 🔢 **ARROTONDAMENTO: usare SEMPRE `R2`, mai `Math.round(x*100)/100`** (da ver120, 03/11/2026,
  segnalato da Christian con un caso vero). Il computer non tiene i decimali in modo esatto:
  `67,5 × 22,99` vale **1551,8249999999998**, e il vecchio `Math.round(x*100)/100` — come pure
  `toFixed(2)` — lo buttava **giù** a `1551,82` invece di `1551,83`. Succede ogni volta che il
  terzo decimale è esattamente 5 (altri casi provati: 162,5×22,99 → 3.735,87 invece di 3.735,88;
  0,615 → 0,61; 2,675 → 2,67).
  **`R2(v,dec)`** (accanto a `grp`) ripulisce con `toPrecision(12)` prima di arrotondare. È stata
  messa in **84 punti** (tutti i `Math.round(...*100)/100` del file) e dentro **`grp`** e **`fP`**,
  che prima formattavano con `toFixed` sul numero sporco.
  ⚠️ **Due conseguenze da sapere**: alcuni importi ora escono **un centesimo più alti** di prima
  (è il valore giusto, ma uno stampato vecchio e uno nuovo possono differire); e sui **negativi**
  l'arrotondamento è ora **simmetrico** (−1551,825 → −1551,83; prima dava −1551,82), cioè
  arrotondamento commerciale, lo stesso dei positivi.
  Il **motore di rendicontazione non è stato toccato**: cambia solo *come si arrotonda*, non
  *cosa si calcola*. ✅ **Lo stesso difetto è stato poi corretto anche nelle altre tre app** lo
  stesso 03/11/2026: **Dipendenti ver74** (32 punti + `fmt2`/`fmt3`), **Fogli ore rev 5**
  (14 punti + `fmtDec`), **Collaboratori rev 6** (4 punti + tutte le funzioni che scrivono i
  numeri). ⚠️ Questa riga diceva «non ancora corrette»: **era rimasta indietro**, corretta con
  l'audit generale del 07/11/2026 (verificato: `R2` è definita in tutte e quattro le app e non
  resta nessun `Math.round(x*100)/100` su importi).
- **Funzioni presenti**: import automatico (SOLA LETTURA) delle ore lavorate dal database dei
  Dipendenti tramite una **seconda app Firebase** chiamata "dip"; tabella compatta della scheda
  operatore (Lavorate | una colonna per progetto | Tot. rendicontate | Avanzo).
- 📐 **COMPATTAZIONE: PIU' ROBA A SCHERMO, STESSI COLORI E STESSE ALTEZZE** (ver123, 08/11/2026,
  richiesta di Christian: «REVISIONE GRAFICA COMPLESSIVA DEL GESTIONALE — l'interfaccia attuale
  presenta spaziature eccessive»). Intervento **di solo CSS**: un blocco nuovo in fondo al
  `<style>`, **nessuna riga di JavaScript, nessun attributo HTML, nessuna classe nuova**.
  - 🔑 **TRE SCELTE DI CHRISTIAN, prese con una domanda PRIMA di costruire**, perché la sua
    richiesta conteneva due contraddizioni interne:
    1. **niente verde**: la codifica a colori per provenienza del dato (giallo manuale / verde
       parametro / azzurro formula / bianco incerto) **non è ottenibile dal solo CSS**, perché
       «parametro preassegnato» e «compilazione manuale» nel DOM sono **la stessa casella**:
       servirebbe un contrassegno nel JavaScript, che il suo stesso vincolo vietava. **Rimandata**
       (sua risposta: «Parte 2 hai fatto bene a non fare»);
    2. **i colori già scelti da lui vincono sempre**: qui **nessun colore è stato toccato**;
    3. **le altezze NON si riducono**: la sua richiesta chiedeva di abbassare anche caselle,
       tendine e pulsanti, ma il §10.6 dice il contrario; **vale il §10.6**, si stringono solo
       gli SPAZI.
  - ⚠️ **Il verde non si può fare senza toccare il codice**: non riproporlo come se bastasse il
    CSS. Se un giorno lo si vorrà davvero, serve il suo permesso per **un solo contrassegno** sulle
    caselle precompilate da un parametro.
  - ⚠️ **In quest'app non c'era niente da stringere nel CSS**: il foglio è di 44 righe e **tutte**
    le spaziature sono scritte in riga da React. Il blocco è quindi fatto **solo** di selettori
    `[style*="..."]` con `!important` (React serializza **con** lo spazio dopo i due punti).
  - **Che cosa si stringe**: home e schermata di accesso, cartellini dei progetti, i riquadri del
    Riepilogo operatori, la barra e l'area contenuti della scheda progetto, le sezioni, e le
    distanze verticali ricorrenti.
  - 🚫 **L'esclusione è diversa dalle altre app**: la griglia densa del budget è fatta di
    **`<div>`, non di `<table>`**, quindi `:not(table *)` **non la protegge**. Ogni regola porta
    **`:not([style*="overflow: auto hidden"] *)`**, che è la sua impronta digitale (è l'unico
    elemento del file con quella coppia di proprietà, più `zoom:0.9`).
  - ⚠️ **Una regola corretta in corsa**: stringendo anche i **fianchi** del contenitore della
    griglia, la griglia — che è `flex:1` — si prendeva lo spazio e passava da **1246 a 1254px**,
    e a 1680 il suo contenuto da **1824 a 1833**. Ora si stringe **solo il verticale** e i fianchi
    restano a 8px: il guadagno in altezza resta tutto.
  - **Misurato in esecuzione** a 390 · 768 · 1280 · 1680px: vista MESI **da −3,3% a −4,6%**,
    BUDGET da −2,3% a −3,5%, Riepilogo operatori da −2,8% a −3,9%.
  - ✅ **NON cambiati**: larghezza di pagina identica; **griglia del budget 356 / 734 / 1246 /
    1646px e contenuto 1455 / 1824 → identici**; **celle della griglia 41px, 56 celle →
    identiche**; righe delle tabelle identiche; scritte sotto i 12,5px identiche (269 nel budget e
    390 nei mesi: sono dentro le griglie). **Zero errori di pagina.**
  - 🔗 **Anche la PAGINA INTEGRATA è stata compattata** (`integrata/index.html`, **rev 6 ·
    08nov26**): `.barra` da `gap:8px 12px; padding:9px 14px` a `gap:6px 9px; padding:7px 11px`,
    `.pulsanti` gap 8→6px, `.btn` padding `11px 18px`→`9px 15px`, e i valori corrispondenti nelle
    due media query. **Misurato: la barra passa da 97 a 62px a 1280, e da 236 a 224px a 390.**
    ⚠️ **NON toccati**: l'altezza minima dei pulsanti (**48px**, e 46/50px nelle media query —
    misurati identici prima e dopo), la misura dei caratteri (19px il titolo, 16px i pulsanti,
    scelte della rev 4) e **il telaio che fa adattare la barra quando i pulsanti vanno a capo**
    (`flex:0 0 auto`, `flex-wrap:wrap`, `.area{min-height:0}`, `body{height:100dvh}`): era il
    difetto corretto nella rev 4 su tablet. **Nessuna altezza fissa aggiunta.**
- 📱 **A 390px LA SCHEDA PROGETTO NON SCORRE PIÙ DI LATO, E NIENTE RESTA SOTTO I 12,5px**
  (ver122, 07/11/2026, trovati con l'**audit generale del gestionale** e corretti con il Nu\* di
  Christian). **Difetti PREESISTENTI, di solo aspetto.**
  - **A) La scheda progetto scorreva di lato sul telefono**: misurati **885px su 390**. Il
    responsabile era **uno solo**: la **barra in cima alla scheda** (← · titolo · anno ·
    📊 Residui · 💾 Salva · 📊 Excel · 📅 Proroga · BUDGET/PREVENTIVO), che **non andava a capo**.
    ⚠️ **La griglia del budget non c'entrava**: sta già dentro un riquadro che scorre da sé
    (`overflow:auto`, `zoom:0.9`) e resta com'era. Per agganciare il foglio di stile è stato
    aggiunto **UN SOLO attributo `className="uso-topbar"`** nel JSX di quella barra (il `div`
    marcato `{/* HEADER */}`), più una `@media (max-width:900px){.uso-topbar{flex-wrap:wrap}}`:
    nessuna logica, nessun dato, nessuna dicitura toccati. **Misurato: 885 → 390px.**
  - **B) Scritte sotto i 12,5px** (regola §10.6): in home il titolo a 12px, «Dati sincronizzati
    nel cloud» a 11px, *Logout* a 10px, i due pulsanti di backup a 11px; nella scheda progetto
    la fascia «🔓 LIBERO — RICORDA…» e «🧹 Riporta tutto sulla 1ª annualità» a **8px**; nel
    Riepilogo operatori diverse scritte a 10,5-11,5px. Ora il minimo è 12,5px.
    ⚠️ **La griglia densa del budget NON si tocca**: ogni regola esclude i discendenti del
    riquadro che scorre (riconosciuto da `[style*="overflow: auto hidden"]`) e di `table`.
    **Misurato: da 6 scritte in home, 17 nel Riepilogo e le 8px della scheda a ZERO.**
  - ⚠️ **La targhetta diceva una data sbagliata**: `{VER} · 03nov26` in **tre punti**, mentre la
    ver121 era del 04/11/2026. La regola 9 chiede di incrementare il numero **e la data**: ora
    dice **ver122 · 07nov26** in tutti e tre.
  - **Provato in esecuzione**: Babel + `node --check` superati; **G5** (import delle ore lavorate
    da Dipendenti) **9/9**, **G11** (backup e ripristino, anche nel cloud) **13/13**, **G6**
    (pagina integrata) **25/25**, **G7/G7b** (5 larghezze, home · scheda progetto · riepilogo)
    tutti superati, **zero errori di pagina**.
- 🔁 **«📂 Ripristina backup»: CORRETTO** (ver121, 04/11/2026). USOINT ha due pulsanti nella Home,
  «💾 Backup dati» (scarica in un JSON tutte le chiavi `usoint*` di `localStorage`) e
  «📂 Ripristina backup».
  - **Il difetto (dimostrato in esecuzione, non solo letto)**: il ripristino riscriveva
    `localStorage` e ricaricava la pagina; alla ricarica `fbAuth.onAuthStateChanged` chiamava
    **`fbSync(uid)`**, che **scarica dal cloud e sovrascrive `localStorage`**. Il ripristino
    spariva **senza dire niente**, e l'avviso «Ripristinati N elementi» era una bugia.
    Provato con un finto Firebase (cloud persistente in `sessionStorage`): file con *PROGETTO DEL
    FILE*, cloud con *PROGETTO DEL CLOUD* → dopo il ripristino **restava quello del cloud**.
  - **La correzione**: dopo aver riscritto `localStorage` si chiama **`fbPush(fbUid)`** — che era
    **già nel file e non veniva mai richiamata** — e solo **dopo** si ricarica. Stessa prova:
    ora dopo il ripristino cloud e browser hanno entrambi *PROGETTO DEL FILE*. ✔
  - ⚠️ **Se la scrittura nel cloud fallisce, la pagina NON si ricarica** e l'avviso lo dice:
    ricaricare in quel momento farebbe perdere il ripristino.
  - **Prima si controlla, poi si sovrascrive** (regola 10.1): file non JSON, file vuoto o file
    senza chiavi `usoint*` → messaggio e **niente viene toccato** (provati tutti e tre).
    Poi una **conferma esplicita** che dice quanti elementi arrivano e che i dati di adesso —
    cloud compreso — verranno sostituiti.
  - ⚠️ **Limite dichiarato**: `fbPush` spinge le chiavi `usoint*` **presenti ora**; quello che
    c'è adesso e **non** è nel file **non viene cancellato**. È scritto nella conferma.
  - Se non si è collegati (`fbUid` nullo) il comportamento è quello di prima: riscrive e ricarica.
- **Verifica prima del commit**: compilare l'intero blocco `<script type="text/babel">` con
  Babel preset-react e fare `node --check` sull'output.
- **Non toccare senza richiesta esplicita**: il motore di rendicontazione (avanzi, residui,
  `rettFin`, `propag`, vincolo/libero), la riassegnazione dei residui, il simulatore di
  spalmatura, la funzione "Spalma" su figure e materiali, gli export Excel.

## Regole di lavoro (valgono sempre)

1. **Le modifiche a questa app le fa Claude**, lavorando direttamente su questo repository.
   Decisione di Christian del 29/10/2026. NON usare altre chat per generare un `index.html`
   da caricare a mano.
2. **MAI caricare con "Add files via upload" un file preso dal computer**: sostituisce il file
   e cancella le aggiunte fatte qui. Se proprio serve, scaricare PRIMA la versione aggiornata
   da GitHub ("Download raw file"), modificare quella, poi ricaricarla.
3. **Lavorare sempre sul ramo `claude/integrated-app-feasibility-8d1wg0`**, mai direttamente su
   `main`. Si porta su `main` SOLO quando Christian lo chiede esplicitamente ("porta su main").
4. **Prima di committare: verificare che il codice compili** (vedi sotto, cambia per app).
   Non fidarsi dei test: il 28/10 un errore sul percorso dei dati era passato ai test ed è stato
   trovato solo rileggendo il codice.
5. **A ogni revisione: incrementare il numero di revisione mostrato nell'app** (vedi sotto).
   Serve a Christian per capire se sta guardando la versione aggiornata e non una copia in cache.
6. **Claude non viene avvisato dei caricamenti di Christian**: all'inizio di ogni sessione,
   verificare se il ramo è rimasto indietro rispetto a `main` e, se sì, riallinearlo PRIMA di
   lavorare. Non unire mai un ramo che non contiene tutto `main`: cancellerebbe lavoro di Christian.
7. **La pagina integrata** (`integrata/index.html` nel repo `rendicontazione-usoint`) apre i LINK
   LIVE delle app: quando si modifica questa app NON va aggiornata, si aggiorna da sé.
8. Rispondere in italiano, senza narrare i passaggi; chiedere il nulla osta (Nu*) prima di costruire.


## 9. REGOLA ANTI-DOCUMENTI-VECCHI (importante)

Un documento invecchia nell'istante in cui si cambia il codice. Quindi **ogni modifica a questa
app deve includere, NELLO STESSO commit**:

1. **l'incremento del numero di revisione** mostrato nell'app (e della data);
2. **l'aggiornamento di questo file `CLAUDE.md`**, se la modifica cambia qualcosa di ciò che
   descrive (modello dati, funzioni presenti, cose da non toccare, numero di revisione attuale);
3. **l'aggiornamento di `master.md`** (sta nel repo `rendicontazione-usoint`), che è il riepilogo
   generale del sistema.

Non rimandare: una modifica committata senza aggiornare questi tre punti lascia la
documentazione che mente, ed è peggio di non averla. Se Christian chiede una modifica e questi
aggiornamenti non sono stati fatti, farli prima di dire che il lavoro è finito.

## 10. COMANDO PERMANENTE DI CHRISTIAN (dato il 30/10/2026)

Vale per **ogni** creazione o modifica di questa web app, in questa e in tutte le chat future.
Vale insieme alle regole 1-9 sopra; dove ci fosse attrito, prevale ciò che Christian dice in
chat per ultimo.

### 10.0 Ruolo da assumere

Comportarsi come un **ingegnere software senior responsabile anche del controllo qualità e della
stabilità dell'intero progetto**, non come chi scrive una toppa.

Prima di intervenire: analizzare il codice esistente, la struttura dell'applicazione, le
funzionalità disponibili e le dipendenze tra i componenti; individuare quali parti potrebbero
essere influenzate dalla modifica; **conservare una copia ripristinabile della versione
funzionante**.

Applicare **esclusivamente** le modifiche richieste, nel modo più circoscritto possibile. Tutto
ciò che non è direttamente interessato dalla richiesta resta **esattamente com'è**: funzionalità,
interfaccia grafica, testi, pulsanti, menù, procedure, permessi, dati, database, collegamenti,
integrazioni, calcoli, esportazioni e qualsiasi altro comportamento già esistente. Non
eliminare, semplificare, riscrivere o modificare parti funzionanti per comodità, per preferenze
personali o per rendere il codice apparentemente più pulito. **Non introdurre miglioramenti non
richiesti.**

Dopo ogni modifica non basta verificare che la novità funzioni: va controllato meticolosamente
che **tutto il resto continui a funzionare come prima**. Confrontare la nuova versione con la
precedente, esaminare le differenze nel codice, verificare le conseguenze indirette e cercare
attivamente regressioni: funzioni scomparse, pulsanti che non rispondono, procedure interrotte,
dati persi o alterati, problemi di compatibilità, modifiche accidentali.

Eseguire tutti i test tecnici e funzionali disponibili e pertinenti: compilazione, console,
interfaccia, navigazione, persistenza dei dati, database, integrazioni. Ripetere anche i test
delle funzionalità preesistenti che la modifica potrebbe avere toccato, anche solo
indirettamente. Se si trova un errore: correggerlo e **ripetere** i controlli prima di
considerare concluso il lavoro. Quando possibile, provare la nuova versione in un ambiente di
prova prima di pubblicarla.

Mantenere una cronologia delle versioni e un punto di ripristino funzionante prima di ogni
intervento. **Non sovrascrivere l'unica versione funzionante** e non eseguire operazioni
distruttive sui dati senza averne verificato le conseguenze e predisposto le protezioni.

Al termine, comunicare con precisione: cosa è stato modificato, quali controlli sono stati
eseguiti, quali test superati, quali funzionalità preesistenti verificate, quali errori,
limitazioni o controlli restano aperti. **Non dichiarare mai eseguito un test che non è stato
realmente effettuato** e non affermare che tutto funziona senza verifiche sufficienti a
sostenerlo. Se mancano gli strumenti, i dati o l'ambiente per controllare qualcosa, **dirlo
esplicitamente**: una valutazione teorica del codice non sostituisce una verifica reale.

> **Regola fondamentale**: la nuova versione deve essere identica alla precedente in ogni
> aspetto, salvo le modifiche espressamente richieste e le conseguenze strettamente necessarie
> per realizzarle. La priorità assoluta è evitare regressioni, perdite di funzionalità e perdita
> di dati. Il lavoro non è concluso perché la modifica "sembra funzionare": è concluso dopo tutti
> i controlli concretamente possibili, risolti gli errori trovati e dichiarati i limiti delle
> verifiche.

### 10.1 Sicurezza dei dati e recuperabilità — priorità n. 1

- **Mai salvataggio automatico**: salvataggio sempre e solo manuale (💾), con avviso alla
  chiusura se ci sono modifiche non salvate.
- Il salvataggio deve **confermare visibilmente la riuscita** e segnalare con un errore evidente
  quando **fallisce** (localStorage può essere pieno o disattivato in navigazione privata):
  "salvato" non deve mai essere una bugia silenziosa.
- Funzione **Backup (esporta JSON)** e **Import** presenti in ogni app fin dalla ver1.
- Ogni backup JSON porta un **numero di versione dello schema dati**. All'import: prima
  validare, poi — solo se valido — sovrascrivere; se l'import fallisce a metà, i dati correnti
  non si toccano. Se lo schema del backup è più vecchio dell'app: adattarlo o avvisare, **mai
  reimportare alla cieca**. È il punto più fragile, perché il modello dati cambia tra versioni.
- **Conferma esplicita su ogni eliminazione** di dati (progetto, voce, persona, fattura, riga,
  cella non vuota): nessuna cancellazione a secco.
- **Nessun dato personale** (nomi di minori, codici fiscali, dati del personale) in app
  pubblicate su GitHub Pages senza protezione: Pages è pubblico e leggibile da chiunque. Se
  serve il cloud: Firebase **sempre con regole di accesso ristrette**, mai database aperto (la
  config nel file pubblico è visibile a tutti).
- Il sync cloud (Firebase) è lo **stato corrente, non uno storico**: i backup JSON periodici
  restano indispensabili come punti di ripristino.
- **Export Excel stilizzato** (xlsx-js-style) sempre disponibile, con autore nei metadata.

### 10.2 Regole di codice che evitano rotture (imparate sul campo)

- **Sintassi vietata**: `catch{}` senza parametro (usare sempre `catch(e)`); doppio attributo
  `style` sullo stesso elemento JSX; `toLocaleString` (usare sempre `grp()` manuale per i
  separatori italiani).
- Formattazione numerica ed euro **sempre con le funzioni interne**, mai affidarsi al locale del
  browser — sia in uscita sia in entrata: l'utente scrive "1.234,56" e il parsing deve capirlo.
- **React, contro i bug "non si aggiorna"**: mai mutare lo stato direttamente (sempre una nuova
  copia); nelle liste `key` stabili e uniche, **mai l'indice dell'array**.
- **Verifiche obbligatorie prima di ogni consegna**: compilazione Babel; parentesi bilanciate
  (graffe, tonde, quadre); `node --check` sul JS estratto; test runtime
  (Puppeteer/Playwright) sui dati reali — non solo "sembra giusto".
- **Casi limite da provare sempre**: campo vuoto; doppio tocco/click; numeri negativi o zero;
  testo lunghissimo; lista vuota; import di un file corrotto.

### 10.3 Workflow con Christian (blindato)

- **Nulla osta esplicito** prima di generare o consegnare qualsiasi `index.html`, con
  **anteprima (PNG) mostrata prima**.
- Si modifica solo ciò che è stato chiesto: nessun effetto collaterale, nessun "miglioramento"
  non richiesto. Se una modifica richiesta rischia di rompere qualcosa di esistente: **avvisare
  prima** di procedere.
- Domande di chiarimento brevi sui punti ambigui o complessi; risposte dirette sulle cose ovvie.
- Le **decisioni storiche restano valide** finché non le cambia Christian. Tenere un breve
  registro "decisioni prese e idee scartate" e non riproporre ciò che è già stato scartato.
- **Non narrare i passaggi operativi in chat**: solo una riga di sintesi con ciò che serve a
  Christian (domande, cose che quadrano, cose che non quadrano, cosa NON è stato gestito).

### 10.4 Architettura e persistenza

- **Single-file HTML** (tutto in un `index.html`), pubblicato su GitHub Pages (`spazioireos`),
  fatto salvo il vincolo sui dati personali del punto 10.1.
- **React 18 + Babel standalone** per le app complesse; **vanilla HTML/JS** per quelle semplici,
  rispettandone i vincoli (es. no-ES6 su OPOC / Collaboratori).
- Persistenza: `localStorage` + sync Firebase dove serve l'accesso multi-dispositivo;
  `localStorage` + export/import dove basta.

### 10.5 Convenzioni su file e versioni

- Nome file: `[descrizione] - ggMMMaa - verN - HH.MM.ext` (mesi italiani minuscoli, ora di Roma,
  senza underscore).
- Autore nei metadata sempre **"Christian Canonica"**; veri file Office, mai testo camuffato;
  elenchi nominativi in **STAMPATELLO**.
- **Versioni sequenziali, mai saltate**, ognuna verificata. Prima di un cambiamento grosso
  Christian fornisce la versione attuale stabile come punto di salvataggio, per poter tornare
  indietro; se chiede di ripartire da una versione precedente, va recuperata **per numero**,
  senza rifare da capo.
- Anteprima prima di ogni modifica visiva; dopo la creazione, verificare che il file sia
  leggibile, non corrotto, > 0 byte e scaricabile.

### 10.6 UX e leggibilità (app gestionali)

- **Celle editabili sempre giallino con bordo ambra**: segnale visivo immediato di cosa si può
  modificare.
- **Spaziature compatte, sempre** (regola permanente di Christian, 03/11/2026): imbottiture e
  distanze strette — riquadri ~9px, blocchi ~8px, griglie ~6px — così sullo schermo ci sta più
  roba e si scorre meno. ⚠️ Si stringono **gli spazi**, non i comandi: l'altezza di caselle e
  pulsanti NON si riduce (restano comodi da centrare col dito) e nessuna scritta scende sotto i
  12,5px fuori dalle griglie dense.
- Struttura chiara e intuitiva, palette coerente, distinzioni a colpo d'occhio (colori per anno,
  badge di stato, semafori); **intuitiva come se la usasse un ragazzo preadolescente da
  telefono**.
- Terminologia di dominio corretta e, dove serve generalità, neutra (es. "Committente" invece di
  "Comune").
- 🔴 **LE DICITURE NON SI TOCCANO** (regola permanente di Christian, 03/11/2026: «non devi toccare
  le diciture, furono da me scelte»). Titoli, etichette, nomi dei pulsanti, voci dei menù, testi
  delle schermate: **le parole restano quelle**, maiuscole comprese. Una passata grafica cambia
  **colori, misure, spazi e disposizione**, non il testo. Se una dicitura sembra sbagliata o
  rimanda a qualcosa che non esiste più: **segnalarla a Christian e aspettare**, non correggerla
  di propria iniziativa.
- Alla consegna: spiegare **in parole semplici (12\*)** cosa fa ogni pulsante, così Christian
  verifica che corrisponda a ciò che voleva.

### 10.7 Continuità tra sessioni

- `master.md` di progetto per il passaggio a nuove chat, con prompt di ripartenza (obiettivo,
  punto raggiunto, decisioni, prossimi passi).
- Backup strutturato quando ci si avvicina al limite della conversazione.

### 10.8 Controllo cumulativo delle versioni e divieto di consegna non verificata

- A ogni nuova versione: **mantenere e aggiornare un registro cumulativo** delle funzionalità
  esistenti, delle decisioni progettuali, dei bug corretti e dei test di regressione già
  definiti. Non perdere né sostituire i controlli delle versioni precedenti: ogni modifica
  **aggiunge** i nuovi test necessari e **ripete** quelli pertinenti già esistenti.
- Prima di consegnare: confrontare il risultato con l'ultima versione stabile, verificare tutte
  le differenze e accertarsi che **nessuna** funzionalità, formula, regola di calcolo, dato,
  campo, pulsante, procedura o comportamento preesistente sia stato eliminato o alterato senza
  autorizzazione esplicita di Christian.
- Per ogni controllo distinguere chiaramente: **test eseguito e superato**, **test eseguito e
  fallito**, **test non eseguito**, **verifica soltanto teorica**. Una compilazione riuscita
  **non** è prova che l'applicazione funzioni.
- Se un test obbligatorio fallisce, se esistono regressioni note o se manca una verifica
  essenziale: **non dichiarare la versione pronta per la pubblicazione**. Correggere e ripetere i
  controlli; se non è possibile, consegnare solo una versione **esplicitamente indicata come non
  verificata**, senza presentarla come stabile.
- Prima di ogni modifica conservare un riferimento certo alla versione stabile precedente e
  garantire una procedura di ripristino. **Non sovrascrivere tale riferimento.** Dopo ogni
  correzione ripetere anche i test pertinenti, perché la soluzione di un problema non ne
  introduca un altro.
- La conformità a queste regole si dimostra con **controlli effettivi e risultati documentabili**,
  non con dichiarazioni.
