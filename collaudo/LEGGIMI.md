# Collaudo

Qui vanno gli script di prova di quest'app e quello che serve a ricostruire il banco (stesso schema di
`ore-mensili-dipendenti/collaudo/`): il contenitore in cui lavora Claude può essere ricreato in qualunque
momento e resta solo quello che è su GitHub.

**Solo dati INVENTATI**: il repository è pubblico. I dati veri stanno nella cartella privata di Google Drive «Dati collaudo Spazio Ireos».

Gli script delle revisioni precedenti sono andati persi con il contenitore il 15-19/11/2026: vanno
ricostruiti qui la prossima volta che si tocca quest'app.

## Script del collaudo di Livello A del 19/11/2026 (USOINT ver138 e pagina integrata rev 6)

Girano sul banco comune (`collaudo/comune`, porta 8340): `NODE_PATH=/opt/node-tools/node_modules node <script>`.
`uso-a01-lib.cjs` è la libreria comune; `int-a01-integrata.cjs live` prova anche la pagina integrata pubblicata.

| script | esito |
|---|---|
| `uso-a01-base.cjs` | 32 superati / 4 falliti (difetti preesistenti: elenco della Home dopo la rinomina) — **ver139: 36 / 0** |
| `uso-a01-budget.cjs` | 37 / 3 + 1 parziale (proroga che non aggiorna l'elenco, cofin non arrotondato) — **ver139: 40 / 0 + 1 parziale** |
| `uso-a01-riep.cjs` | 48 / 0 |
| `uso-a01-dati.cjs` | 33 / 0 |
| `uso-a01-graf.cjs` | 50 / 0 |
| `int-a01-integrata.cjs` | 20 / 0 sul banco e 20 / 0 sulla pagina vera |

## USOINT ver139 (19/11/2026)

`uso-ver139.cjs`: le due correzioni (Home ed elenco dopo rinomina, elenco dopo proroga) con confronto diretto sulla
ver138, che va localizzata a parte in `comune/.banco/uso138/` (vedi l'intestazione dello script). Esito: **22 / 0**
più 2 righe solo segnalate. La porta si sceglie con `PORTA=…` (anche per `int-a01-integrata.cjs`); le targhette si
leggono dal file dell'app (`L.VER`, `L.TARGA`). Sulla ver139: `base` 36/0 · `budget` 40/0 (+1 parziale) · `riep` 48/0 ·
`dati` 33/0 · `graf` 50/0 · `int-a01` 20/0.

## USOINT ver140 (19/11/2026)

`uso-ver140.cjs`: vincolo riallineato nell'elenco e Duplica annullata dal timbro senza orfani, con confronto
diretto sulla ver139 (localizzata in `comune/.banco/uso139/`, vedi l'intestazione). Esito: **15 / 0** più 1 riga
solo segnalata. Sulla ver140: `uso-ver139` 23/0 (N06b ora pretende il difetto chiuso) · `base` 36/0 · `budget`
40/0 (+1 parziale) · `riep` 48/0 · `dati` 33/0 · `graf` 50/0 · `int-a01` 20/0.

## USOINT ver141 (19/11/2026, in anteprima)

`uso-ver141.cjs`: entrando in una casella numerica (NumIn, TarIn, LavIn, SimIn) il contenuto si seleziona tutto, con
confronto diretto sulla ver140 (localizzata in `comune/.banco/uso140/`, vedi l'intestazione). Esito: **41 / 0**. Un
argomento facoltativo (cartella) salva l'anteprima `casella-selezionata.png` a densità 2 (`contesto({dsf:2})`). Sulla
ver141: `uso-ver139` 23/0 · `uso-ver140` 15/0 · `base` 36/0 · `budget` 40/0 (+1 parziale) · `riep` 48/0 · `dati` 33/0 ·
`graf` 50/0 · `int-a01` 20/0.

## Collaudo integrato del 20/11/2026 (versioni su main: Fogli ore rev 19 · Collaboratori rev 22 · Dipendenti ver187 · USOINT ver141 · integrata rev 6)

Livello A rieseguito per intero: esiti **identici** a quelli registrati il 19/11 (vedi i LEGGIMI delle app). Livello B
(`interconnessioni/`, banco comune 8340): b1 **14/16** (+2 parziali) · b2 14/17 · b2b **16/16** (6 controlli nuovi sulla
chiusura del mese: `dip:true`, `meseChiuso`/`completamento`, riapertura dell'admin) · b3 20/21 · b4 **13/14** (B4-04 chiuso
dalla rev 21 di Collaboratori) · b5 9/12 · b6 8/8 · b7 10/10 · b8 **10/11** (B8-04/05 chiusi dalla ver184 di Dipendenti) ·
b9 **5/6** (B9-05 chiuso dalla rev 18 di Fogli ore) · b10 26/26.
⚠️ Attese aggiornate, non aggirate: b1 e b5 leggevano le ore a 2 decimali (dalla ver185 sono a 3); b8 pretendeva che
Dipendenti restasse dentro dopo «Esci» in Fogli ore, mentre dalla ver184 avvisa sulla schermata di accesso e conserva le
modifiche (ora B8-04 controlla l'avviso, e il nuovo accesso preme «Entra» e non «⬇ Backup delle modifiche»).

## Correzioni del 20/11/2026 (risposte di Christian al collaudo integrato) — ramo di lavoro, da approvare

Versioni: Fogli ore **rev 20** · Collaboratori **rev 23** · Dipendenti **ver189** · USOINT **ver142** · integrata **rev 7**.

| batteria | esito | note |
|---|---|---|
| Fogli ore `fo-a01`…`a07`, `fo-rev18`, `fo-rev19` | 263/270 | C17 (autore) ora superato; restano A08, A14b, C18, C21b, D14a, D18, D21 come il 19/11 |
| Collaboratori `col-a01-*`, `col-rev21`, `col-rev22` | 282/285 | R09, R10, K04, T11, F15, G-TSall ora superati; L05b aggiornato alla decisione (debito vero di 1 centesimo: resta); restano N19 parziale e X04 (Drive) |
| Dipendenti `a01`…`a08`, `ver186`, `ver187`, `ver189` | 342/342 | A02.35 e A04.27 ora superati; `ver183`/`ver184` M22-M30/`ver185` R26-27 leggono il report vecchio: sostituiti da `ver189` |
| USOINT `uso-a01-*`, `int-a01-integrata`, `uso-ver139/140/141` | 307/307 | D06c ora superato; B03 di `int-a01` legge la targhetta dal file |
| Interconnessioni `ic-01-b1`…`b10` | 149/157 | **B5-04, B5-05, B5-11 ora superati**; B10 26/26 (targhe lette dai file); restano B2-08, B8-06, B9-04 e i parziali noti |

### Dipendenti ver192 (20/11/2026, ramo): accesso condiviso con Fogli ore

`interconnessioni/ic-02-b8b-sessione.cjs` (nuovo, **9/9**): l'operatore che entra in Fogli ore resta dentro anche con Dipendenti aperto
(cambio diretto di account e Dipendenti aperto dopo); Dipendenti mostra «Accesso non consentito» senza chiudere l'accesso; rientrando
come amministratore la modifica non salvata è ancora lì e non è nel cloud. `ic-01-b8` **11/11** (B8-06 ora superato), `b1` 14/16,
`b2` 15/17, `b3` 20/21, `b5` 12/12, `b10` 26/26 (identici a prima).

## Collaudo integrato del 21/11/2026 (versioni su main: Fogli ore rev 20 · Collaboratori rev 23 · Dipendenti ver203 · USOINT ver142 · integrata rev 7)

Sito pubblicato identico byte per byte a `main` (5 pagine su 5). Regole Firestore (emulatore ufficiale, `prova-residui`) **60/60**.

| livello | batteria | esito |
|---|---|---|
| A | Fogli ore `fo-a01`…`a07`, `fo-rev18`, `fo-rev19` | 263/270 (3 falliti, 4 parziali: A08, A14b, C18, C21b, D14a, D18, D21, come il 20/11) |
| A | Collaboratori `col-a01-*`, `col-rev21`, `col-rev22` | 282/285 (N19 parziale, X04 non verificabile, 1 informativo) |
| A | Dipendenti `a01`…`a08`, `ver186`, `ver194`…`ver203` | 432/435 (i 3 storici di `a07`); `ver182`-`ver185`, `ver187` V29, `ver189`, `ver200` hanno attese invecchiate dalle ver188-ver203 |
| A | USOINT `uso-a01-*`, `uso-ver139/140/141`, `int-a01-integrata` | 307/307 · pagina vera 20/20 |
| B | `ic-01-b1`…`b10`, `ic-02-b8b` | 159/166 (B2-08 e B9-04 falliti, 4 parziali, 1 non verificato: come il 20/11) |

⚠️ `int-a01-integrata.cjs live`: L09 cadeva sul sito vero perché dalla rev 7 il pulsante si accende solo quando l'app è caricata
(evento `load`) e lo script aspettava 2,5 s; ora aspetta fino a 15 s che si accenda. **Attesa aggiornata, non aggirata.**

## Correzioni del 21/11/2026 sopra il collaudo integrato (Fogli ore rev 21 · Collaboratori rev 24 · Dipendenti ver205 · USOINT ver143 · integrata rev 8, su `main` dal 21/11/2026: «Main»)

Batterie rieseguite sulle versioni nuove (banco comune rigenerato dopo ogni modifica):
Fogli ore `fo-a01` 27/0 · `fo-a02` 33/0 · `fo-a03` 38/0 · `fo-a04` 50/0 · `fo-a05` 22/0 · `fo-a06` 10/0 · `fo-a07` 8/0 · `fo-rev18` 41/0 · `fo-rev19` 41/0
(A08, A14b, C18, C21b, D14a, D18, D21 ora superati; D18 accetta la frase italiana «Ore NON salvate»).
Collaboratori: tutta la batteria `col-a01-*`, `col-rev21`, `col-rev22` senza falliti (N19 ora superato).
USOINT: `uso-a01-*`, `uso-ver139/140/141`, `int-a01-integrata` senza falliti.
Dipendenti: `a01`…`a08` (a07 61/3, i tre storici), `ver186`…`ver204` senza falliti nuovi (`ver187` 31/1: V29 storico), `a05` 28/0 (pastiglia nuova).
Interconnessioni: b1 14/0 (+2 parziali noti) · b2 16/0 (B2-08 ora superato) · b2b 16/0 · b3 20/0 · b4 13/0 · b5 12/0 · b6 8/0 · b7 10/0 · b8 11/0 · b9 6/0 (B9-04 ora superato) · b10 26/0 · b8b 9/0.

## Collaudo integrato del 21/11/2026, sera (versioni su main: Fogli ore rev 21 · Collaboratori rev 24 · Dipendenti ver205 · USOINT ver143 · integrata rev 8)

Banchi rigenerati dopo il «Main» (comune 8340/8341/8344, Dipendenti 8300), tutte le batterie rieseguite. Versioni pubblicate su Pages
controllate: coincidono con `main`.
- **Livello A**: Fogli ore 270/270 (`fo-a01`…`a07`, `fo-rev18`, `fo-rev19`) · Collaboratori 283 superati + 1 non verificato + 1
  informativo (`col-a01-*`, `col-rev21`, `col-rev22`; N19 nome lunghissimo a 1500 e 390px: pagina larga come lo schermo) ·
  USOINT + integrata 307/307 (targhetta integrata 12,5px misurata) · Dipendenti 534 superati, 22 non superati **tutti attese
  invecchiate**: `a07` 3 (testo della ver182), `ver187` V29 (numeri della ver186), `ver184` 18 (report sostituiti dalla ver188/194,
  tre decimali della ver185, confronti con la ver183 cambiati di proposito dalle ver201/203/204). Da riallineare, non regressioni.
- **Livello B** (interconnessioni): 161 superati, 0 falliti, 4 parziali noti (B1-10 e B4-09: si vede l'aggiornamento ricaricando;
  B1-15 e B3-19: con la lettura caduta il messaggio dice «permessi»), 1 non verificato (B2-15: la finta Firebase non applica regole,
  coperto da `b2b` sull'emulatore).
- **Dati veri** (backup del 19/11, scratchpad): ver204 → ver205 C identico 217/217, Risultato 5 schede (≤ 0,003 h), Tetto 8, costo
  orario 2026 151.094,99 → 151.095,03 €, `cedOre` identico, zero errori di pagina.

## 22/11/2026 — Dipendenti ver207 · USOINT ver144 (messaggio della linea caduta) e prove riallineate

Christian: «1,2,3 ok». Con la linea caduta Dipendenti e USOINT dicono «non c'è collegamento, riprova quando torna la linea»;
«(permessi)» resta solo per `permission-denied`. Interconnessioni sul banco comune 8340: `b1` 16/0 (+1 parziale noto, B1-10;
B1-15 superato, **B1-15b nuovo**), `b3` 22/0 (B3-19 superato, **B3-19b nuovo**), `b2` 16/0 (+1 NV noto), `b5` 12/0, `b6` 8/0,
`b8` 11/0, `b10` 26/0. USOINT: `uso-a01-base` 36/0 · `budget` 41/0 · `riep` 48/0 · `dati` 33/0 · `graf` 50/0 · `int-a01` 20/0 ·
`uso-ver139` 23/0 · `uso-ver140` 15/0 · `uso-ver141` 41/0. Dipendenti: vedi `ore-mensili-dipendenti/collaudo/LEGGIMI.md`.

## ver145 (23/11/2026, sul ramo di lavoro)

`uso-ver145.cjs` (banco comune 8340): la data dell'ultimo 💾 di Dipendenti accanto alle ore a cedolino. Esito **9/0**.

## ver146 (23/11/2026, sul ramo di lavoro)

`uso-ver146.cjs` (banco comune 8340; `USO_PNG=<cartella>` salva l'anteprima): suggerimenti dei nomi da Dipendenti e Collaboratori e
⚠ sul nome non trovato. Esito **13/0**. `uso-ver145.cjs` ora legge la targhetta dal file (9/0).

## Verifica del 27/11/2026: celle bloccate dopo la cessazione (ver147)

`uso-cess.cjs` (solo verifica, nessuna modifica all'app): una persona cessata il 15/03/2026 e una voce dei beni cessata il
30/06/2026 in un progetto 2026-2027. Esito: **16/16** — vista MESI bloccata dal mese dopo la cessazione (il mese della
cessazione resta compilabile), anno dopo tutto bloccato, ore già scritte dopo la cessazione escluse da totali, Excel («—») e
Riepilogo operatori, cessazione tolta = riga di nuovo compilabile, data impossibile rifiutata, data salvata col 💾.

## ver148 (27/11/2026, su `main` con la ver149)

`uso-ver148.cjs` (banco comune 8340; confronto con la ver147 congelata in `/uso147/`; `USO_PNG=<cartella>` salva l'anteprima): nella
vista MESI il nome di chi è cessato è barrato solo negli anni tutti dopo la cessazione, nell'anno della cessazione «CESS. gg/mm»; celle
bloccate invariate. Esito **11/0**.

## ver149 (27/11/2026, su `main` dal 27/11/2026)

`uso-ver149.cjs` (banco comune 8340; confronto con la ver148 congelata in `/uso148/`; `USO_PNG=<cartella>` salva tre anteprime): subentro
nel riquadro Riassegnazione (imposta, cambia, togli), etichetta «SUB.» nel budget, trasferimenti vincolati e liberi registrati e sbiaditi,
trasferimento di prima dedotto dal subentrante, avviso su «CESS.» di chi è già cessato (annulla, nuova data, togli), rientro e 90%, 390px.
Esito **22/0**. `uso-cess.cjs` aggiornato: la cessazione si toglie rispondendo alle domande nuove (16/0).

## ver150 (27/11/2026, su `main` dal 27/11/2026)

`uso-ver150.cjs` (banco comune 8340; confronto con la ver149 congelata in `/uso149/`; `USO_APP` cartella da provare, `USO_PNG` anteprima):
titolari alla stessa x (anche col ✓ di budget raggiunto), subentranti rientrati dello stesso tanto con e senza etichette, nome/ruolo al 90%,
390px. Esito **6/0**.

## ver151 (27/11/2026, su `main` dal 27/11/2026)

`uso-ver151.cjs` (banco comune 8340; confronto con la ver150 in `/uso150/`; `USO_APP`, `USO_PNG`): cella confermata a 0 bloccata e
sbloccata col doppio clic (personale e beni, salvataggio e ricaricamento), tipo di fine scelto alla cessazione, cambiato nel riquadro e alla
nuova data, tolto con la cessazione, dati di prima con «CESS.», 390px. Esito **22/0**.

## ver152 (27/11/2026, su main dal 27/11/2026)

`uso-ver152.cjs` (banco comune 8340; confronto con la ver151 in `/uso151/`; `USO_PNG` anteprima): Ore tot. ed € Finanz. grigie per il
subentrante prima e dopo il trasferimento, titolari invariati, ⚠ con ore scritte a mano, totale del budget invariato. Esito **10/0**.

## ver153 (27/11/2026, su main dal 27/11/2026)

`uso-ver153.cjs` (banco comune 8340; confronto con la ver152 in `/uso152/`, la ver153 va localizzata in `/uso153/` o servita in `/uso/`):
fine per esaurimento senza tendina dei subentranti e senza domanda di subentro, ⚠ + Togli con un subentrante rimasto, subentro e dati di
prima invariati, annualità grigie dei subentranti prima e dopo il trasferimento. Esito **13/0**.

## ver154 (27/11/2026, in attesa del Nu*)

`uso-ver154.cjs` (banco comune 8340; confronto con la ver153 in `/uso153/`; `USO_PNG` anteprima): il saldo del CONSUNTIVO FINALE
non supera la quota del Committente; sotto il budget e a budget pari identico alla ver153. **8/0**.
Audit delle formule: `audit-formule/` (vedi il suo LEGGIMI).

## ver155 (27/11/2026, in attesa del Nu*)

`uso-ver155.cjs` (banco comune 8340; confronto con la ver154 in `/uso154/`): celle automatiche grigie (Budget ric.€, € Finanz. col %
unico, €/ora eff. preso dal budget, Lavorate da Dipendenti) e doppio clic per correggere. **12/0**.

## ver156 (27/11/2026, in attesa del Nu*)

`uso-ver156.cjs` (banco comune 8340; confronto con la ver155 in `/uso155/`; `USO_PNG` anteprima): il Trasferisci passa euro (cedente con le
sue ore di budget invariate, destinatario con `ricEur`/`ricBlk`), Previsto invariato, ore del subentrante = euro ÷ suo costo orario,
residuo e «sforato» in euro (vincolato e libero), data di subentro = giorno dopo la cessazione, avviso e «Allinea», cessazione spostata che
sposta il subentro; senza trasferimenti riepilogo, saldo e quadro anno identici alla ver155. Usa `audit-formule/motore.cjs` per V08-V10.
**21/0**.

## ver157 (27/11/2026, in attesa del Nu*)

`uso-ver157.cjs` (banco comune 8340; confronto con la ver156 in `/uso156/`; `USO_PNG` anteprima): costo orario «⇢ dal mese…» nella vista
mesi (celle GEN-GIU 200 €, LUG-DIC 300 €, riepilogo 3.000 €, il cambio continua nel 2027, ✕ con conferma, doppio clic sulla casella grigia,
valori non validi rifiutati), Tariffario con «da quale mese» (dal SET: GEN-AGO restano, riepilogo 3.040 €; non continua nel 2027), Tariffario
di prima (numero) su tutto l'anno, senza cambi identico alla ver156. **19/0**. `audit-formule/motore.cjs` estrae anche `rateM`, `tarV`, `tarDal`.

## ver158 (28/11/2026, in attesa del Nu*)

`uso-ver158.cjs` (banco comune 8340; confronto con la ver157 in `/uso157/`): celle certificate ✓ bloccate (personale e beni; doppio clic con
Annulla e con OK, 💾, nuova certificazione col ○), nome in grassetto, ore 13px, €/ora eff. e prev. 12px, nominativo incolonnato, simulatore
di spalmatura col costo del mese (125 € contro i 100 € della ver157). **14/0**. Dalla ver158 la casella delle ore del mese è larga 58px:
`uso-a01-budget` e `uso-ver139` aggiornati.

- `uso-ver158b.cjs` (28/11/2026, Vm\* di Christian): le celle dei beni/servizi restano a 10px e 66px; 9.999,99, 1.234,56 e la cella certificata ✓ ci stanno; nel personale ore a 13px ed €/ora a 12px ci stanno (1500 e 390px). Un importo a 5 cifre sporge di 1px, come nella ver155. **8/0**.
