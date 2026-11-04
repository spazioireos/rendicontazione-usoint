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
| App integrata | `rev 4 · 31ott26` | barra in alto | scritto nel file |
| Collaboratori | `rev 6 · 03nov26` | copertina + schermata PIN (`.revtag`) | scritto nel file |
| Dipendenti | `ver81 · 04nov26` | testata, tutte le viste (`.app-rev`) | costanti `APP_VER` + `APP_DATA` |
| Rendicontazione USOINT | `ver120 · 03nov26` | Home, scheda progetto, Riepilogo operatori | costante `VER` |
| Fogli ore | `rev 7 · 03nov26` | angolo in basso a destra, ogni schermata | scritto nel file |

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
  ore ciascuno vede **solo il proprio**, in un riquadro nella sua pagina. ⚠️ **Serve che Christian
  pubblichi in console le regole nuove** (`regole-firestore/regole-residui-03nov26.rules`, 51
  controlli su 51 con l'emulatore ufficiale): finché non lo fa, il pulsante fallisce e lo dice,
  e il riquadro non compare. È l'unica scrittura che Dipendenti fa fuori dal proprio documento.
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
> `https://spazioireos.github.io/rendicontazione-usoint/integrata/`, rev 4) con quattro pulsanti che
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
