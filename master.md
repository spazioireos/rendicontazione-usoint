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
- File `integrata/index.html` in questo repo, su `main`. **Revisione attuale: `rev 5 · 05nov26`.**
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
| App integrata | `rev 5 · 05nov26` | barra in alto | scritto nel file |
| Collaboratori | `rev 7 · 05nov26` | copertina + schermata PIN (`.revtag`) | scritto nel file |
| Dipendenti | `ver128 · 06nov26` | testata, tutte le viste (`.app-rev`) | costanti `APP_VER` + `APP_DATA` |
| Rendicontazione USOINT | `ver121 · 04nov26` | Home, scheda progetto, Riepilogo operatori | costante `VER` |
| Fogli ore | `rev 9 · 06nov26` | angolo in basso a destra, ogni schermata | scritto nel file |

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
  CHIODI (9,5 → 12 → 18 → 12), DEL MASTRO (21 → 17) e PANSERA (16 → 15), come trasformazioni
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
