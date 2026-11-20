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
