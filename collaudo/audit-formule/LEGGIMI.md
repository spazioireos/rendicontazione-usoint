# Audit delle formule di USOINT (27/11/2026) — SOLO DATI INVENTATI

- `motore.cjs` estrae dal file vero dell'app (`index.html`) le funzioni del motore (`calcCY`, `cP`, `cB`, `applyTar`, …), senza riscriverle.
- `unit.cjs` confronta il motore con un ricalcolo indipendente scritto dalla specifica (S1 stesso costo, S2 aumento dal 2° anno,
  S6 costo effettivo sopra/sotto il preventivo, S7 ore sopra/sotto, S6c 200 h a 10 € fatte a 15 €). `node collaudo/audit-formule/unit.cjs`
- `avv.cjs` (banco comune 8340) prova gli avvicendamenti nell'app: cessazione, «Trasferisci», subentrante con o senza costo orario,
  periodo vacante (`SUB=2026-09-01`), libero (`VINC=0`) e vincolato (`VINC=1`); stampa previsto, finanziato, saldo da fatturare.
  `VINC=1 BEUR=0 NODE_PATH=/opt/node-tools/node_modules node collaudo/audit-formule/avv.cjs`

## V Formule App sulla ver158 (28/11/2026)

- `indip.cjs`: ricalcolo INDIPENDENTE (dalla specifica, non dal codice) di personale e beni: mesi attivi (cessazione, subentro), costo del mese
  («dal mese», costo dell'anno, Tariffario), disponibile in euro, residuo, ore che restano, sforato, finanziato (capitale proprio, blocchi in
  ore, blocchi in euro), tetto del finanziato.
- `prop158.cjs [N]`: confronto motore/indipendente su N casi casuali più proprietà (finanziato fra 0 e costo, cof = costo − fin, totali =
  somma degli anni, finanziato complessivo = min(I × speso, G), residuo + speso = assegnato) e 9 casi a mano di `rateM`. Con `APPF=<file>`
  si prova un'altra copia dell'app (es. una mutazione: deve trovare differenze).
- `e2e158.cjs [N]` (banco comune 8340): progetti casuali aperti nell'app; RIEPILOGO PER ANNO (personale, beni, TOTALE), Quota Committente
  prevista, CONSUNTIVO FINALE e saldo letti a video e confrontati col ricalcolo, arrotondati come `R2`.
- `excel158.cjs` (banco comune 8340): foglio dell'anno dell'Excel contro video e ricalcolo (€ dei mesi, Tot.€, € fin., Res.€).

## Prove sui DATI VERI (28/11/2026)

Gli script `reale-*.cjs` **non contengono dati**: leggono un backup JSON di USOINT passato come argomento. Il backup vero sta **solo** nella
cartella privata del Drive «Dati collaudo Spazio Ireos»; si scarica nello scratchpad della sessione e non si copia mai qui.
- `reale-motore-reale.cjs <backup> <index ver nuova> <index ver vecchia>`: per ogni riga, motore contro ricalcolo indipendente e versione vecchia contro nuova.
- `reale-integrita.cjs <backup> <index>`: elenco e lavoro discordanti, annualità, ore non contate (fuori periodo, dopo la cessazione, prima del subentro), rendicontate > lavorate, trasferimenti e subentri a sé stessi.
- `reale-e2e-reale.cjs <backup> <index>` (banco comune 8340): ogni lavoro aperto nell'app, riepilogo per anno e consuntivo contro il ricalcolo (comprese le rettifiche finAnno/rettFin).
- `reale-prev.cjs <backup> <index>`: Previsto del Committente, somma degli anni contro il totale del progetto.
