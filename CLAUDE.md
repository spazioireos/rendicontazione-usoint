# Istruzioni per Claude — app "USOINT — Rendicontazione uso interno"

Rendicontazione **interna dei progetti**: budget preventivo (personale + beni/servizi),
cofinanziamento, ore rendicontate per anno/mese e per progetto, avanzi e residui, fatture.
USOINT sta per **"uso interno"**.

- **Unico file**: `index.html` (~236 KB), **React MINIFICATO + Babel standalone**: quasi tutta
  la logica è su **una sola riga** (la 187 circa). Modifiche chirurgiche, con ancore esatte.
- **In questo repo c'è anche la PAGINA INTEGRATA**: `integrata/index.html`, il link unico
  `https://spazioireos.github.io/rendicontazione-usoint/integrata/` con i quattro pulsanti
  (Collaboratori, Dipendenti, Rendicontazione progetti, Fogli ore). **Apre i LINK LIVE**, non
  copie: ha un suo numero di revisione (attuale `rev 3 · 29ott26`) nella barra.
  Layout a colonna con flexbox e **nessuna altezza fissa**: la barra si adatta da sé se i
  pulsanti vanno a capo (con altezza fissa, su tablet la seconda riga di pulsanti finiva
  nascosta sotto l app).
- **Dati**: Firebase progetto `rendicontazione-usoint`, percorso `users/{uid}/kv/<chiave>`
  (specchio di localStorage). Chiavi: `usoint-idx`, `usoint-p-<id>`, `usoint-orelav`,
  `usoint-tariffe`, `usoint-simul`. Accesso mail+password.
- **Numero di revisione**: costante `const VER` (riga ~67), mostrata in **tre punti** (Home,
  scheda progetto, Riepilogo operatori). **Attuale: ver118 · 29ott26.** `VER` finisce anche nei
  nomi dei file esportati: incrementarla, non affiancarle un secondo numero.
- **Strutture utili**: `usoint-orelav` = `{ [norm(nome)]: { [anno]: [12 numeri] } }` (ore
  lavorate, indice 0 = gennaio; `norm` = minuscolo, trim, spazi singoli).
  Ore rendicontate: `agg.data[k].years[anno][mese]` (totale) e
  `agg.data[k].prjM[titoloProgetto][anno][mese]` (per progetto), indice mese 0-based.
- **Funzioni presenti**: import automatico (SOLA LETTURA) delle ore lavorate dal database dei
  Dipendenti tramite una **seconda app Firebase** chiamata "dip"; tabella compatta della scheda
  operatore (Lavorate | una colonna per progetto | Tot. rendicontate | Avanzo).
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
