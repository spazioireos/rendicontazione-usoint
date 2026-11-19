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
| `uso-a01-base.cjs` | 32 superati / 4 falliti (difetti preesistenti: elenco della Home dopo la rinomina) |
| `uso-a01-budget.cjs` | 37 / 3 + 1 parziale (proroga che non aggiorna l'elenco, cofin non arrotondato) |
| `uso-a01-riep.cjs` | 48 / 0 |
| `uso-a01-dati.cjs` | 33 / 0 |
| `uso-a01-graf.cjs` | 50 / 0 |
| `int-a01-integrata.cjs` | 20 / 0 sul banco e 20 / 0 sulla pagina vera |
