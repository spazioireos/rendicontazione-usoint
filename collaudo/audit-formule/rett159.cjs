// ver159 («6 sì»): backup INVENTATO con anticipo del Committente (finAnno) e rettifica (rettFin) su una voce col Tariffario diverso dal budget.
// Scrive il file nel percorso passato come argomento; poi: node reale-e2e-reale.cjs <file> (ver159: 0 differenze; USO_APP=uso158: differenze).
const L = require('../uso-a01-lib.cjs'); const fs = require('fs');
const pers = [L.pers(2, { nome: 'RETT PROVA', voce: 'EDUCATORE', oreT: 400, eur: 20, cofin: 1600, aOre: [200, 200], md: [[20, 20, 20, 20, 20, 0, 0, 0, 20, 20, 20, 20], [20, 20, 20, 20, 20, 0, 0, 0, 0, 0, 0, 0]] }),
  L.pers(2, { nome: 'ALTRA PROVA', voce: 'EDUCATORE', oreT: 200, eur: 20, cofin: 800, aOre: [100, 100], md: [[10, 10, 10, 10, 10, 0, 0, 0, 10, 10, 10, 10], [10, 10, 10, 10, 10, 0, 0, 0, 0, 0, 0, 0]] })];
const d = L.prog('pr', 'RETT PROVA', '2025-01-01', '2026-12-31', 2, { vincolo: true, personnel: pers, beni: [L.bene(2)], finAnno: [5000, 0], rettFin: [0, 300] });
const B = { __schema: 1, __app: 'USOINT', 'usoint-idx': JSON.stringify([{ id: 'pr', title: 'RETT PROVA', start: '2025-01-01', end: '2026-12-31', vincolo: true }]), 'usoint-p-pr': JSON.stringify(d), 'usoint-tariffe': JSON.stringify({ 'rett prova': { 2025: 26 } }) };
fs.writeFileSync(process.argv[2], JSON.stringify(B)); console.log('scritto', process.argv[2]);
