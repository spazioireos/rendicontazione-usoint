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
  scheda progetto, Riepilogo operatori). **Attuale: ver131 · 10nov26.** `VER` finisce anche nei
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
- 🔐 **DUE SCHEDE NON SI CANCELLANO PIÙ A VICENDA, E L'IMPORT HA IL SUO PULSANTE**
  (ver131, 10/11/2026, punti **4** «**metti la stessa protezione di dipendenti**» e **10**
  «**metti il pulsante**»).
  - 🔒 **4 — il TIMBRO, come nella ver144 di Dipendenti.** Con **due schede aperte** sullo stesso
    browser, quella che salva per ultima riscrive tutto con quello che ha in memoria: le
    modifiche dell'altra sparivano **senza un fiato**, e una scheda vecchia poteva **far
    risorgere un lavoro eliminato** nell'altra.
    Ora a ogni salvataggio si scrive **`uso-timbro`** (una chiave a parte, con un numero sempre
    diverso) e ogni scheda ricorda in **`timbroMio`** il timbro che conosce; se quello in memoria
    è **diverso**, **`timbroControlla(cosa)`** chiede prima di sovrascrivere, nominando che cosa
    si sta per riscrivere («l'elenco dei lavori» oppure «questo lavoro»).
    - **Dove si controlla**: **`sI`** (l'elenco dei lavori, cioè ogni creazione, eliminazione,
      duplicazione, importazione e rinomina) e il **💾 della scheda del lavoro**. In **`cr`** e in
      **`dl`** il controllo è **all'inizio**, prima di scrivere o cancellare: così, se rispondi
      «annulla», non resta in giro nessun documento orfano.
    - ⚠️ **Rispondendo sì una volta non te lo richiede a ogni passo**: `timbroMio` prende il
      timbro nuovo, altrimenti una sola azione farebbe comparire due o tre domande.
    - ⚠️ La chiave **non comincia per «usoint»**, quindi **non entra nel backup** né in
      `fbPush`/`fbSync`: il formato dei dati non cambia di una virgola.
    - ⚠️ **Vale per le schede dello STESSO browser.** Due computer diversi collegati al cloud non
      si vedono per questa strada: lì l'ultimo che salva vince, **come prima**.
    - ⚠️ **Dicitura nuova, scritta da Claude**, la stessa della ver144 di Dipendenti.
  - ↻ **10 — il pulsante per rifare l'import.** Prima l'import delle ore lavorate partiva **solo**
    aprendo il Riepilogo operatori, e per rifarlo bisognava uscire e rientrare: non esisteva
    nessun comando. Ora, accanto allo stato del collegamento, c'è
    **«↻ Rileggi le ore dai Dipendenti»** (compare quando l'import è finito o è andato male).
    Dati nuovi: **`_dipDbRef`** e **`_dipUidRef`**, riempiti dentro `onAuthStateChanged`.
    ⚠️ **Dicitura nuova, scritta da Claude.**
    ⚠️ **Non cambia niente di come l'import lavora**: resta vero che scrive anche nel cloud
    **senza 💾** (punto 9, ancora da decidere) e che **sostituisce** un numero scritto a mano
    (punto 7, ancora da decidere).
  - **Provato in esecuzione** (`ver131us.cjs`, **19 controlli su 19**, zero errori di pagina):
    due schede vere aperte insieme — la seconda duplica un lavoro senza domande e scrive il
    timbro, la prima **avvisa**; rispondendo **annulla** l'elenco resta **identico** e il timbro
    dell'altra scheda **non viene toccato**; col 💾 della scheda del lavoro la domanda nomina
    «questo lavoro» e **non si ripete** al salvataggio successivo; con **una scheda sola** non
    chiede **niente** e dice «✓ Salvato» come prima; e il pulsante dell'import, premuto **senza
    uscire dalla schermata**, aggiorna le ore (10 → 15) e il riquadro torna a dire
    «importate ✓».

- 🔤 **UN ACCENTO DI DIFFERENZA NON FA PIÙ PERDERE LE ORE** (ver130, 10/11/2026, punto **8**
  dell'elenco, risposta di Christian: «**Ignorali e attenzione a accenti e apostrofi in fine di
  parola, perché si equivalgono**»).
  - 🔴 **Il difetto, misurato**: l'unico identificativo che attraversa il confine fra Dipendenti e
    USOINT è il **nome**, scritto a mano in **due anagrafiche diverse**. Con un accento o un
    apostrofo di differenza l'operatore **non si abbinava** e le ore **non venivano importate**:
    finiva in «Non abbinati». **Misurato sulla ver129**: su tre dipendenti — «ALFÀ PROVA»,
    «BETA PROVA'» e «GAMMA PROVA» — ne arrivava **uno solo**.
  - **La correzione**: funzione nuova **`normA(x)`** che toglie i segni con **NFD** e
    l'**apostrofo in fine di parola**. ⚠️ **`norm` NON è stata toccata**: le sue chiavi sono
    l'**identità** con cui le ore lavorate sono già salvate in `usoint-orelav`, e cambiarla
    renderebbe **orfano** tutto quello che c'è in archivio. `normA` serve **solo a confrontare**.
  - 🔑 **E si usa LA CHIAVE DI USOINT, non quella di Dipendenti**: se il nome non combacia
    lettera per lettera, l'import cerca fra gli operatori di USOINT quello che coincide ignorando
    i segni e **usa la chiave di USOINT**. Così le ore si **attaccano alla riga che c'è già**
    invece di crearne una nuova. **Misurato**: una riga in archivio con 5 ore diventa 11, e le
    chiavi restano **tre**, senza nessuna chiave nuova con l'accento.
  - ⚠️ **L'apostrofo DENTRO la parola non si tocca**: «D'AMICO LUCIA» resta «d'amico lucia».
  - **Provato in esecuzione** (`ver130us.cjs`, **18 controlli su 18**, zero errori di pagina): il
    confronto diretto con la ver129 (una sola riga importata contro tre), i numeri giusti nel mese
    giusto (11 / 22 / 33 a gennaio), nessuno fra i «Non abbinati», l'avviso sugli orfani della
    ver129 che **non** compare, la riga in archivio aggiornata e non duplicata, e la **non
    regressione** con i nomi identici.
  - ⚠️ **Resta vero che non esiste nessun codice condiviso** fra le app: l'abbinamento è sempre
    sul nome. Questa correzione lo rende **più tollerante**, non più sicuro: due **omonimi**
    restano il punto aperto (punto 1 dell'elenco, su cui Christian ha risposto «non chiaro»).
  - **Batteria rieseguita sulla ver130**: `mxus-A` 47 · `mxus-C` 53 · `ver126` 7 · `ver129a` 13 ·
    `ver129b` 17, **zero falliti** (in `ver129a` l'attesa della targhetta era scritta a mano:
    aggiornata).

- 🧮 **QUATTRO RISPOSTE DI CHRISTIAN, IN UNA VOLTA** (ver129, 10/11/2026: punti **2**
  «Segnala», **3** «Correggi» (con «**Per il blocco fbSync lascia stare**»), **16** «Fai seguire
  il filtro anche al dettaglio» e **17** «Sistema», dall'elenco consegnato dopo il collaudo delle
  interconnessioni).
  - 🔍 **16 — il DETTAGLIO segue il filtro.** Nel Riepilogo operatori, cliccando la cella
    *Tot. rendicontate* si apre la finestrella «da quali progetti vengono queste ore»: elencava
    **sempre tutti** i progetti, anche col filtro attivo. **Misurato**: la cella diceva
    **42,00** e la finestrella **132,00** (42 + 90) — il numero grande e il suo dettaglio si
    contraddicevano. Ora, col filtro attivo, la finestrella mostra **solo quel progetto** e il
    suo TOTALE è identico alla cella; in cima compare un avviso giallo che lo dice.
    ⚠️ **Si chiude da sé anche la seconda anomalia dell'elenco**: col filtro attivo i mesi a
    «—» non sono cliccabili, e adesso è **giusto**, perché per quel progetto non c'è niente da
    dettagliare. ⚠️ **Dicitura nuova, scritta da Claude.**
  - 📝 **17 — la legenda non mente più.** La riga «Avanzo = lavorate − totale rendicontate»
    era **inesatta col filtro attivo** (misurato: il TOTALE dell'Avanzo passa da 118,00 a
    685,00). ⚠️ **Senza filtro la dicitura di Christian resta IDENTICA, carattere per
    carattere**: cambia **solo** quando il filtro è attivo, e allora nomina **entrambe** le
    colonne che il filtro cambia e il progetto scelto. ⚠️ **Dicitura nuova, scritta da Claude**,
    autorizzata dalla sua risposta «Sistema».
  - 🟠 **2 — le ore che Dipendenti NON conferma vengono SEGNALATE.** Il ciclo dell'import
    è `Object.keys(dati).forEach` con `if(!cell) return`, quindi ciò che in Dipendenti **non
    esiste più** (un mese cancellato, una persona tolta dall'elenco) restava qui con le ore di
    prima, si salvava, si ricaricava e finiva nell'**Avanzo**, senza che niente lo dicesse.
    Dati nuovi in `_dipImport`: **`visti`** (quali persona/anno/mese Dipendenti conferma davvero)
    e **`inDip`**; stato nuovo **`dipOrf`**. A video, un riquadro giallo sotto «Non abbinati»
    elenca «NOME · 2026: MAR» e, per chi non c'è più, «— non è più in Dipendenti».
    ⚠️ **NON si azzera e non si cancella niente** (§10.1: quelle ore possono anche essere state
    scritte a mano), e il riquadro lo dice. ⚠️ **Dicitura nuova, scritta da Claude.**
  - 🔐 **3 — il salvataggio locale non si perde più al ricaricamento.** `LS.set` scrive
    subito in `localStorage` e rinvia la scrittura nel cloud di **1,5 s**; se quella cade (linea
    assente) il dato resta solo nel browser, e al ricaricamento **`fbSync` scaricava dal cloud e
    sovrascriveva**. **Misurato sulla ver128**: valore nuovo **1077** nel browser, cloud **68**;
    dopo il ricaricamento il browser torna **68** — il salvataggio era **perduto**.
    **La correzione**: le chiavi non ancora confermate dal cloud si segnano **col loro valore**
    in una chiave di servizio **`uso-sospese-cloud`**, che **non comincia per «usoint»** e quindi
    **non entra** né nel backup JSON né in `fbPush`/`fbSync`. All'accesso successivo
    **`sospRiprova(uid)`** le spinge nel cloud **prima** di `fbSync`: riuscita, il cloud ha il
    dato locale e `fbSync` non può più cancellarlo. **Misurato sulla ver129**: 1077 nel browser
    **e** nel cloud, lista delle sospese svuotata.
    ⚠️ **`fbSync` NON è stato bloccato**, come ha chiesto Christian: se la riprova **non**
    riesce, il cloud riscrive comunque `localStorage`, ma il valore è **tenuto da parte** nella
    chiave di servizio (quindi non è perduto: torna al primo accesso riuscito) e un avviso
    arancione dice di fare un **💾 Backup dati** e che a schermo si possono vedere i numeri di
    prima. ⚠️ **Conseguenza dichiarata**: un valore tenuto da parte molto a lungo, al primo
    accesso riuscito, **vince sul cloud**. ⚠️ **Dicitura nuova, scritta da Claude.**
    🐞 **Corretto nello stesso punto un promise NON GESTITO**: la scrittura di scorta nel
    `beforeunload` era in un `try/catch`, che **non** cattura una promessa rifiutata, quindi a
    linea caduta lasciava un errore di pagina (**misurato identico nella ver128**). Ora ha il suo
    `.catch`, e la ver129 chiude con **zero errori di pagina** dove la ver128 ne aveva uno.
  - 🔒 **Guardia sull'account**: le chiavi messe da parte portano l'**uid** di chi le ha
    scritte, quindi su un browser usato da due account quelle di uno **non** vengono spinte nel
    cloud dell'altro (restano lì e tornano quando rientra il loro). **Misurato.**
  - **Provato in esecuzione, 58 controlli**: `ver129a.cjs` **13/13** (filtro e legenda),
    `ver129b.cjs` **17/17** (orfani), `ver129c.cjs` **19/20** — l'unico «fallito» è l'errore di
    pagina **della ver128**, non della ver129 —, `ver129d.cjs` **6/6** (guardia sull'account e
    formato vecchio della lista), `ver129t.cjs` **3/3** (le tre targhette).
    **Non regressione**: senza filtro la legenda e il dettaglio tornano **identici**; con
    Dipendenti che conferma tutto **nessun avviso** e la spunta verde intatta; col cloud sano il
    💾 scrive subito anche nel cloud e la lista delle sospese resta vuota.
    **Batteria rieseguita, tutta superata**: `mxus-A` 47 · `B` 67 · `C` 53 · `D` 34 · `E` 28 ·
    `F` 7 · `G` 5 · `H` 5 · `ver125` 10 · `ver126` 7 · `fix-b2` 7, **zero falliti**.
    ⚠️ In sei script le **attese erano invecchiate** (la targhetta «ver123», il nome del file di
    backup, l'importo della fattura nel formato della ver127 e i tre controlli di `mxus-H` che
    misuravano il difetto dei **negativi chiuso dalla ver125**): sono state **aggiornate**, non
    aggirate, e in `mxus-H` è stato chiarito che gli importi negativi a video sono **differenze
    calcolate**, non valori scritti a mano.
  - 🟠 **NON toccate, per scelta**: la **legenda** non è stata riscritta fuori dal caso del
    filtro; gli **omonimi** (punto 1, «non chiaro») e il **`key={i}`** delle fatture (punto 18,
    «non chiaro») restano da chiarire con lui.

- ✅ **LA SPUNTA VERDE DELL'IMPORT NON MENTE PIÙ** (ver128, 09/11/2026, difetto trovato dal
  **collaudo delle INTERCONNESSIONI**).
  - 🔴 **Misurato**: se il documento `report-ore-mensile/{uid}` **non esisteva** — collegamento
    `dip` su un **altro account**, oppure Dipendenti che non ha mai salvato — `_dipImport`
    proseguiva con un oggetto vuoto e finiva in `setDipState("done")`, mostrando
    «**Ore lavorate importate dai Dipendenti ✓ (0 operatori aggiornati)**» con la spunta **verde**
    e **zero ore**. Indistinguibile da «tutto già aggiornato»: è il modo più facile di guardare
    numeri vuoti credendoli veri. Il §10.1 vieta le bugie silenziose.
  - **La correzione**: due guardie in cima a `_dipImport`, prima di qualunque scrittura. Se il
    documento non c'è: «Nessun dato trovato in Dipendenti: il collegamento potrebbe essere su un
    altro account, oppure Dipendenti non ha ancora salvato niente. Le ore già importate NON sono
    state toccate.» Se c'è ma non contiene dipendenti: «Il gestionale Dipendenti risponde, ma non
    contiene nessun dipendente da leggere. …» Entrambe in **rosso**, nel punto dove compariva la
    spunta verde. ⚠️ **Diciture nuove, scritte da Claude.**
  - **Provato in esecuzione** (`ic-fix.cjs`): col documento **assente** e col documento **senza
    dipendenti** non compare più «importate ✓» e il motivo è scritto; col documento **buono** la
    frase di prima torna identica. **Zero errori di pagina.**
  - 🟠 **ALTRE ANOMALIE DEL COLLEGAMENTO, MISURATE E NON TOCCATE** (servono decisioni di
    Christian; sono nell'elenco che gli è stato consegnato):
    1. **record orfani / dati obsoleti**: il ciclo è `Object.keys(dati).forEach` con `if(!cell)
       return`, quindi ciò che in Dipendenti **non esiste più** non viene né azzerato né segnalato.
       Togliendo un mese, una persona da un mese o un dipendente dall'elenco, in USOINT **restano
       le ore di prima** (misurato: 20,00 e 3,00), si salvano, si ricaricano e **finiscono
       nell'Avanzo**;
    2. **omonimi fusi in silenzio**: due dipendenti con lo stesso nome diventano **una** riga —
       nello stesso mese vince l'ultimo (**77 invece di 147: 70 ore perse**), in mesi diversi le
       ore dei due si mescolano. L'unico identificativo che attraversa il confine è **`norm(nome)`**:
       nessun codice condiviso;
    3. **un valore scritto a mano** nella colonna «Lavorate» viene **sostituito** dall'import senza
       dirlo, e a video non si distingue un numero importato da uno scritto a mano;
    4. **un nome con un accento diverso non si abbina** (`norm` non tocca i segni diacritici): le
       ore si perdono, ma l'app lo elenca in «Non abbinati»;
    5. **un documento di Dipendenti salvato a metà** (`dati[ym][id]` senza `giorni`) **azzera un
       mese** con la spunta verde;
    6. **l'import parte da sé** aprendo il Riepilogo e **scrive nel cloud senza 💾** (`LS.set` ha
       un rinvio di 1,5 s): scostamento dal §10.1 **non dichiarato prima**;
    7. **non esiste nessun pulsante per rifare l'import**: parte solo al montaggio della schermata;
    8. due formati numerici plausibili si perdono: **« 4»** (spazio davanti) e **«.5»** valgono 0,
       perché `_dipNum` pretende che il primo carattere sia una cifra.
  - ✅ **CHE COSA REGGE, misurato (131 controlli, 131 superati)**: il numero arriva **giusto e nel
    mese giusto** (gennaio = indice 0, provato con un valore solo a dicembre), con i **formati
    misti** e la **virgola italiana**; si **aggiorna** in su e in giù e **non si somma**
    ripetendo l'import; **non si perde** al ricaricamento; con la lettura **caduta** l'app lo
    **dice** e **non** cancella ciò che c'era; USOINT **non scrive MAI** su `report-ore-mensile`
    (0 scritture in 7 script); un documento **rotto** non lascia niente a metà.

- 🧵 **DUE CORREZIONI CHE ERANO INCOMPLETE, E UN IMPORTO SCRITTO A MANO** (ver127,
  09/11/2026, tre difetti **trovati dal SECONDO collaudo**, tutti e tre **miei**).
  - 🔴 **L'avviso sui titoli doppi copriva solo la CREAZIONE.** La ver125 metteva il
    controllo in `cr()`, ma **`rinominaTitolo` non ne aveva nessuno**: con la ✎ si arrivava a due
    progetti dallo stesso titolo **senza un fiato**. E le conseguenze sono molto peggiori del
    «difficili da distinguere nell'elenco» che l'avviso prometteva, perché il **Riepilogo
    operatori aggrega per TITOLO** (`cur.prjM[titolo]`). **Misurato**: il Riepilogo **perde una
    colonna** (6 → 5), la colonna che resta **somma i due progetti** come se fossero uno (giugno
    da 42,00 a **132,00**) e la **tendina del filtro della ver126 SPARISCE del tutto** (si disegna
    solo con più di un progetto in elenco), cioè la correzione appena fatta diventa
    inutilizzabile. Ora la rinomina legge l'indice, conta gli **altri** progetti con lo stesso
    titolo (confronto con trim e minuscole, sé stesso escluso) e chiede conferma, **non bloccante**
    come alla creazione. ⚠️ **Dicitura nuova, scritta da Claude**, che nomina le conseguenze vere:
    le ore «sommate in una colonna sola» e la tendina che sparisce.
  - 🔴 **L'avviso del filtro nominava una colonna sola.** Col filtro attivo cambia **anche
    «Avanzo»** (misurato: TOTALE da 118,00 a 685,00), perché è `lavorate − rendicontate`. L'avviso
    della ver126 parlava solo di «rendicontate»: ora nomina **entrambe**, spiega perché l'avanzo
    segue il filtro, e dice che «lavorate» e le colonne per progetto **non** cambiano.
    ⚠️ La **legenda** sotto la tabella («Avanzo = lavorate − totale rendicontate») **non è stata
    toccata**: è una dicitura storica, e col filtro attivo diventa inesatta. **Segnalato a
    Christian.**
  - 🟠 **L'importo nella conferma della fattura era scritto a mano** (difetto introdotto dalla
    **ver124**): `String(r.importo).replace(".",",")` invece dei formattatori interni, che il
    §10.2 vieta espressamente. **Misurato**: la cella diceva «€ 1.234.567,89» e la conferma
    «**1234567,89 €**»; su 1000 diceva «1000 €» invece di «€ 1.000,00». Ora usa **`grp`**, lo stesso
    formattatore della cella (verificato: `grp(1234567.89)` = `1.234.567,89`).
  - 🟠 **SEGNALATE A CHRISTIAN E NON TOCCATE** (servono una sua decisione o cambiano il modello
    dei dati):
    1. **La finestrella del dettaglio non segue il filtro**: la cella filtrata di giugno mostra
       90,00 ma la finestrella «da quali progetti vengono queste ore» elenca **tutti** i progetti
       (42,00 + 90,00 = 132,00). Il numero grande e il suo dettaglio si contraddicono.
    2. **Col filtro attivo i mesi a «—» non sono più cliccabili** (la guardia è `if(rw.r>0)`):
       misurati 2 mesi su 12 muti pur avendo ore su un altro progetto.
    3. **«1.234,56» BATTUTO si storpia in «1,234»**, perché `onKeyDown` converte il punto in
       virgola. ⚠️ **PREESISTENTE**, verificato identico nella ver122: **non** è un effetto della
       ver125. Incollandolo funziona. Il §10.2 chiede il contrario.
    4. **`rinominaTitolo` scrive subito in `localStorage`** senza passare dal 💾: deroga
       **preesistente** al §10.1.
    5. **`key={i}` sulle righe delle fatture** (l'indice dell'array, vietato dal §10.2). Con la
       cancellazione ora possibile a metà elenco React potrebbe riusare il DOM della riga
       sbagliata; nelle prove i **valori** risultano sempre corretti. Cambiarlo richiede un
       identificativo stabile per ogni fattura, cioè toccare il modello dei dati.

- 🔎 **IL FILTRO «PROGETTO» ORA AGISCE ANCHE A SCHERMO** (ver126, 09/11/2026, scelta **a** di
  Christian al punto **A3** della ricognizione).
  - **Il difetto, misurato dal collaudo**: nel **Riepilogo operatori** la tendina «Tutti i
    progetti» **teneva la scelta ma non cambiava niente** nella tabella mese per mese — le righe
    restavano identiche con tutte e tre le scelte. Il filtro **funzionava solo nell'export
    Excel**, dove il titolo e i numeri lo seguivano. A schermo sembrava un filtro e non lo era.
  - **La causa**: la tabella leggeva `cur.years[y][mi]` (il **totale** su tutti i progetti),
    mentre esisteva già **`rendAt(y,mi)`** — che rispetta il filtro — usata **solo** dall'export.
  - **La correzione è una riga**: la colonna *rendicontate* usa ora `rendAt(y,mi)`.
    In più, quando il filtro è attivo compare un **avviso giallo**: «Filtro attivo: la colonna
    **rendicontate** mostra SOLO il progetto «…». Rimetti «Tutti i progetti» per vedere il
    totale.» ⚠️ **Dicitura nuova, scritta da Claude.**
  - ⚠️ **Le colonne per progetto e la colonna «lavorate» non sono state toccate**, e nemmeno il
    motore di rendicontazione: cambia solo **quale numero** mostra una colonna.
  - **Provato in esecuzione** (`ver126.cjs`, **7 controlli su 7**, zero errori di pagina): le
    righe cambiano scegliendo un progetto, due progetti diversi danno righe diverse, l'avviso
    compare e sparisce, e rimettendo «Tutti i progetti» si torna **esattamente** ai numeri di
    prima. Il collaudo `mxus-C` passa ora **53 su 53**.

- 🚫 **NIENTE NEGATIVI NELLE CASELLE NUMERICHE, E AVVISO SUI TITOLI DOPPI** (ver125, 09/11/2026,
  due risposte di Christian alla ricognizione: «**A4**: vieta sempre i negativi nelle celle
  compilabili da me» e «**A5**: avviso non bloccante»).
  - **A4** — il collaudo aveva misurato che «Ore tot.» accettava **−50** (costo **−1.149,50 €**,
    che si propagava ai totali del progetto), «€/ora» accettava −10 e anche una cella della vista
    MESI accettava −30. Ora il **meno non si può più scrivere**: bloccato il tasto in
    `onKeyDown` e **tolto anche se incollato** in `onChange`, nei **quattro** componenti numerici
    dell'app — **`NumIn`, `TarIn`, `LavIn`, `SimIn`**.
    ⚠️ **Le caselle di TESTO non sono state toccate**: mansioni e nomi accettano ancora il
    trattino (**verificato**: «ANTE-MERIDIANO» entra).
    ⚠️ **I valori negativi già nei dati NON vengono cambiati**: si impedisce di scriverne di
    nuovi, non si riscrive niente. 🟠 **Nei dati di prova ce n'era uno (−2.000,00)**: se nei
    dati veri esiste una casella in cui un negativo serve davvero, va esentata — **chiesto a
    Christian**.
  - **A5** — due progetti con lo **stesso titolo** venivano accettati in silenzio. Ora `cr()`
    avvisa: «Esiste già un progetto con questo titolo … Puoi crearlo lo stesso, ma nell'elenco
    saranno difficili da distinguere. Vuoi crearlo?» ⚠️ **Non bloccante**, come ha chiesto lui:
    rispondendo **sì** il progetto si crea. ⚠️ **Dicitura nuova, scritta da Claude.**
  - **Provato in esecuzione** (`ver125.cjs`, **10 controlli su 10**, zero errori di pagina):
    `-50` battuto diventa `50,00`, `-33` incollato diventa `33,00`, un numero normale entra come
    prima; un titolo nuovo non fa nessun avviso, lo stesso titolo lo fa comparire, rispondendo
    **no** il progetto non viene creato e rispondendo **sì** sì.

- 🧾 **LA ✕ DELLA FATTURA ORA CHIEDE CONFERMA** (ver124, 09/11/2026, difetto trovato dal
  collaudo generale e corretto su richiesta di Christian).
  - **Il difetto**: nel riquadro FATTURAZIONE AL COMMITTENTE la ✕ toglieva la riga **a secco**,
    senza nessun dialogo — ed era **l'unica cancellazione dell'app senza conferma** (il progetto
    ne chiede due, la riga di personale con ore una dettagliata, «🗑 Svuota simulazione» e
    «🧹 Riporta tutto» pure). Il **§10.1 nomina esplicitamente la «fattura»** fra le eliminazioni
    che richiedono conferma.
  - **La correzione**: `delFatt(i, ft)` riceve ora **anche la riga**, perché nella funzione non
    c'è nessuna variabile con il progetto corrente — ⚠️ al primo tentativo avevo usato `p` e
    `fP`, che **lì non esistono**: sarebbe stato un errore a tempo di esecuzione come quello
    della ver139 di Dipendenti. La conferma nomina **data, numero, tipo e importo** della
    fattura e dice che finché non si preme 💾 si recupera ricaricando.
    ⚠️ **Dicitura nuova, scritta da Claude.**
  - **Provato in esecuzione** (`fix-b2.cjs`, **7 controlli su 7**, zero errori di pagina):
    la ✕ chiede conferma nominando «del 2026-09-30 · n° 2026/777 · acconto · 1234,56 €»;
    rispondendo **NO** la riga resta (3 → 3); rispondendo **SÌ** sparisce (3 → 2).

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
