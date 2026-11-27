# Audit delle formule di USOINT (27/11/2026) — SOLO DATI INVENTATI

- `motore.cjs` estrae dal file vero dell'app (`index.html`) le funzioni del motore (`calcCY`, `cP`, `cB`, `applyTar`, …), senza riscriverle.
- `unit.cjs` confronta il motore con un ricalcolo indipendente scritto dalla specifica (S1 stesso costo, S2 aumento dal 2° anno,
  S6 costo effettivo sopra/sotto il preventivo, S7 ore sopra/sotto, S6c 200 h a 10 € fatte a 15 €). `node collaudo/audit-formule/unit.cjs`
- `avv.cjs` (banco comune 8340) prova gli avvicendamenti nell'app: cessazione, «Trasferisci», subentrante con o senza costo orario,
  periodo vacante (`SUB=2026-09-01`), libero (`VINC=0`) e vincolato (`VINC=1`); stampa previsto, finanziato, saldo da fatturare.
  `VINC=1 BEUR=0 NODE_PATH=/opt/node-tools/node_modules node collaudo/audit-formule/avv.cjs`
