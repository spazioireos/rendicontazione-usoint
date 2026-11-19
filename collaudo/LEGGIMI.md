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
