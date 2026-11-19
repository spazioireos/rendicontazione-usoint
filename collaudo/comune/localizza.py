#!/usr/bin/env python3
# Localizza un index.html per il BANCO DI PROVA COMUNE (solo dati inventati).
#   python3 localizza.py <ingresso.html> <uscita.html> [--integrata]
# - ogni <script src="https://..."> diventa la libreria locale in ../lib/ (stessa versione, presa da npm);
# - le tre script di Firebase (app/auth/firestore compat) diventano UNA sola <script src="../lib/fakefb.js">;
# - lo script di Google Identity (accounts.google.com/gsi/client, backup su Drive di Collaboratori) viene TOLTO:
#   l'app controlla `typeof google==="undefined"` e dice «Google non ancora caricato»;
# - i <link> a fonts.googleapis/fonts.gstatic vengono TOLTI (irraggiungibili: si usa il carattere di riserva);
# - con --integrata i link live https://spazioireos.github.io/<repo>/ diventano ../fo/ ../col/ ../dip/ ../uso/;
# - alla fine controlla che non resti NESSUN url esterno in un attributo src/href di <script> o <link>, e che non
#   resti nessun "https://" dentro codice che carica script dinamicamente; se resta, esce con errore.
import io, re, sys

MAP = [  # (pezzo dell'url, file locale)  — il primo che combacia vince
    ('firebase', 'fakefb.js'),
    ('react-dom', 'react-dom.js'),
    ('/react@', 'react.js'), ('/react/', 'react.js'),
    ('babel-standalone/7.23.9', 'babel-7.23.9.js'),
    ('babel', 'babel.js'),
    ('xlsx-js-style', 'xlsx-js-style.js'),
    ('xlsx-0.20.1', 'xlsx-0.20.1.js'),
    ('xlsx/0.18.5', 'xlsx-0.18.5.js'),
    ('autotable', 'autotable.js'),
    ('jspdf', 'jspdf.js'),
    ('jszip', 'jszip.js'),
]
TOGLI = ['accounts.google.com/gsi/client']
INTEGRATA = {
    'https://spazioireos.github.io/spazioireos-foglio-ore/': '../fo/',
    'https://spazioireos.github.io/ore-e-importi-collaboratori/': '../col/',
    'https://spazioireos.github.io/ore-mensili-dipendenti/': '../dip/',
    'https://spazioireos.github.io/rendicontazione-usoint/': '../uso/',
}

def nos(u):  # nei commenti lasciati nel file l'indirizzo si scrive senza «https://», così una ricerca di url esterni resta pulita
    return re.sub(r'^https?://', '', u)

def localizza(src, integrata=False):
    rapporto = []
    fb_messo = [False]
    def sost(m):
        tag = m.group(0); u = m.group(2)
        if any(t in u for t in TOGLI):
            rapporto.append('tolto   ' + u); return '<!-- banco: tolto ' + nos(u) + ' -->'
        loc = next((l for p, l in MAP if p in u), None)
        if loc is None:
            rapporto.append('SCONOSCIUTO ' + u); return tag
        if loc == 'fakefb.js':
            if fb_messo[0]:
                rapporto.append('fuso    ' + u); return '<!-- banco: ' + nos(u) + ' -> fakefb.js -->'
            fb_messo[0] = True
        apre = tag[:tag.index('>') + 1]
        extra = ''.join(' ' + a for a in ('defer', 'async') if re.search(r'\s' + a + r'(\s|>|=)', apre, re.I) and loc != 'fakefb.js')
        rapporto.append('locale  %s -> ../lib/%s%s' % (u, loc, extra))
        return '<script src="../lib/%s"%s></script>' % (loc, extra)
    # <script ... src="https://..." ...></script>, anche su più righe e con attributi prima/dopo
    out = re.sub(r'<script\b[^>]*?\bsrc\s*=\s*(["\'])(https?://[^"\']+)\1[^>]*>\s*</script>', sost, src, flags=re.S | re.I)
    # <link> ai caratteri di Google
    def via_link(m):
        rapporto.append('tolto   ' + m.group(1)); return '<!-- banco: tolto link ' + nos(m.group(1)) + ' -->'
    out = re.sub(r'<link\b[^>]*?\bhref\s*=\s*["\'](https?://fonts\.(?:googleapis|gstatic)\.com[^"\']*)["\'][^>]*>', via_link, out, flags=re.S | re.I)
    # @import dei caratteri di Google dentro <style>
    def via_imp(m):
        rapporto.append('tolto   @import ' + m.group(1)); return '/* banco: tolto @import ' + nos(m.group(1)) + ' */'
    out = re.sub(r'@import\s+url\(\s*["\']?(https?://fonts\.(?:googleapis|gstatic)\.com[^"\')]*)["\']?\s*\)\s*;?', via_imp, out, flags=re.I)
    if integrata:
        for k, v in INTEGRATA.items():
            n = out.count(k)
            if n: rapporto.append('integr. %s -> %s (%d)' % (k, v, n)); out = out.replace(k, v)
    # controlli: niente url esterni rimasti in <script src> / <link href>, niente caricamenti dinamici verso fuori
    resti = re.findall(r'@import\s+url\(\s*["\']?(https?://[^"\')]+)', out, flags=re.I)
    resti += re.findall(r'<(?:script|link)\b[^>]*?\b(?:src|href)\s*=\s*["\'](https?://[^"\']+)', out, flags=re.S | re.I)
    dinam = re.findall(r'createElement\(\s*["\']script["\']\s*\)[^;]{0,300}https?://', out)
    dinam += re.findall(r'\.src\s*=\s*["\']https?://[^"\']+\.js', out)
    return out, rapporto, resti, dinam

if __name__ == '__main__':
    a = [x for x in sys.argv[1:] if not x.startswith('--')]
    if len(a) != 2: sys.exit('uso: localizza.py <ingresso.html> <uscita.html> [--integrata]')
    src = io.open(a[0], encoding='utf-8').read()
    out, rap, resti, dinam = localizza(src, '--integrata' in sys.argv)
    io.open(a[1], 'w', encoding='utf-8').write(out)
    for r in rap: print('   ', r)
    if resti or dinam or any(r.startswith('SCONOSCIUTO') for r in rap):
        print('ERRORE: restano url esterni:', resti, dinam); sys.exit(2)
