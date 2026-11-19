#!/bin/bash
# Costruisce il BANCO DI PROVA COMUNE delle quattro app + pagina integrata, tutte sulla STESSA origine,
# con la finta Firebase (fakefb.js). SOLO DATI INVENTATI: il repository è pubblico.
#   bash collaudo/comune/prepara-comune.sh [porta]      (porta predefinita 8340)
# Va RIESEGUITO DOPO OGNI MODIFICA a un index.html (ricopia e rilocalizza; il server, se risponde, resta acceso).
#   fo/        <- spazioireos-foglio-ore/index.html
#   col/       <- ore-e-importi-collaboratori/index.html
#   dip/       <- ore-mensili-dipendenti/index.html          (con la finta Firebase: FB_READY resta vero)
#   uso/       <- rendicontazione-usoint/index.html
#   integrata/ <- rendicontazione-usoint/integrata/index.html (link live -> ../fo/ ../col/ ../dip/ ../uso/)
#   lib/       <- librerie npm + fakefb.js
set -e
QUI="$(cd "$(dirname "$0")" && pwd)"
PORTA="${1:-8340}"
BASE="$(cd "$QUI/../../.." && pwd)"          # cartella che contiene i quattro repository
B="$QUI/.banco"; N="$QUI/.strumenti/node_modules"
FO="${FO_REPO:-$BASE/spazioireos-foglio-ore}"; COL="${COL_REPO:-$BASE/ore-e-importi-collaboratori}"
DIP="${DIP_REPO:-$BASE/ore-mensili-dipendenti}"; USO="${USO_REPO:-$BASE/rendicontazione-usoint}"

if [ ! -f "$N/xlsx0201/dist/xlsx.full.min.js" ] || [ ! -d "$N/babel-7239" ]; then
  mkdir -p "$QUI/.strumenti"
  (cd "$QUI/.strumenti" && echo '{"name":"strumenti-collaudo-comune","private":true}' > package.json && \
   npm i -s --no-audit --no-fund react@18.2.0 react-dom@18.2.0 @babel/standalone@7.24.0 babel-7239@npm:@babel/standalone@7.23.9 \
     xlsx@0.18.5 xlsx-js-style@1.2.0 jszip@3.10.1 jspdf@2.5.1 jspdf-autotable@3.8.2 \
     xlsx0201@https://cdn.sheetjs.com/xlsx-0.20.1/xlsx-0.20.1.tgz)
fi

mkdir -p "$B/lib" "$B/fo" "$B/col" "$B/dip" "$B/uso" "$B/integrata"
cp "$N/react/umd/react.production.min.js"            "$B/lib/react.js"
cp "$N/react-dom/umd/react-dom.production.min.js"    "$B/lib/react-dom.js"
cp "$N/@babel/standalone/babel.min.js"                "$B/lib/babel.js"          # Dipendenti (unpkg, ultima)
cp "$N/babel-7239/babel.min.js"                       "$B/lib/babel-7.23.9.js"   # USOINT
cp "$N/xlsx/dist/xlsx.full.min.js"                    "$B/lib/xlsx-0.18.5.js"    # Collaboratori
cp "$N/xlsx0201/dist/xlsx.full.min.js"                "$B/lib/xlsx-0.20.1.js"    # Fogli ore
cp "$N/xlsx-js-style/dist/xlsx.bundle.js"             "$B/lib/xlsx-js-style.js"  # Dipendenti, USOINT
cp "$N/jszip/dist/jszip.min.js"                       "$B/lib/jszip.js"
cp "$N/jspdf/dist/jspdf.umd.min.js"                   "$B/lib/jspdf.js"
cp "$N/jspdf-autotable/dist/jspdf.plugin.autotable.min.js" "$B/lib/autotable.js"
cp "$QUI/fakefb.js"                                   "$B/lib/fakefb.js"

echo "fo:";        python3 "$QUI/localizza.py" "$FO/index.html"  "$B/fo/index.html"
echo "col:";       python3 "$QUI/localizza.py" "$COL/index.html" "$B/col/index.html"
echo "dip:";       python3 "$QUI/localizza.py" "$DIP/index.html" "$B/dip/index.html"
echo "uso:";       python3 "$QUI/localizza.py" "$USO/index.html" "$B/uso/index.html"
echo "integrata:"; python3 "$QUI/localizza.py" "$USO/integrata/index.html" "$B/integrata/index.html" --integrata
cat > "$B/index.html" <<'EOF'
<!doctype html><meta charset="utf-8"><title>Banco comune</title>
<h1>Banco di prova comune (finta Firebase, solo dati inventati)</h1>
<ul><li><a href="fo/">Fogli ore</a></li><li><a href="col/">Collaboratori</a></li><li><a href="dip/">Dipendenti</a></li>
<li><a href="uso/">USOINT</a></li><li><a href="integrata/">Pagina integrata</a></li></ul>
EOF

if curl -s -o /dev/null --max-time 3 "http://127.0.0.1:$PORTA/lib/fakefb.js"; then
  echo "server già attivo sulla porta $PORTA (file aggiornati: il server li serve dalla cartella)"
else
  (cd "$B" && setsid -f python3 -m http.server "$PORTA" --bind 127.0.0.1 </dev/null >/dev/null 2>&1)
  for i in 1 2 3 4 5 6 7 8 9 10; do curl -s -o /dev/null --max-time 2 "http://127.0.0.1:$PORTA/lib/fakefb.js" && break; sleep 0.5; done
fi
curl -s -o /dev/null --max-time 3 "http://127.0.0.1:$PORTA/lib/fakefb.js" || { echo "ERRORE: il server non risponde sulla porta $PORTA"; exit 1; }
echo "Banco comune pronto: http://127.0.0.1:$PORTA/{fo,col,dip,uso,integrata}/"
