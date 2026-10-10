"""Converte i capitoli del manuale (Markdown) in pagine HTML per l'app.

Uso: python3 strumenti/genera_manuale.py <cartella con Capitolo-NN-*.md> manuale
Scrive manuale/NN.html, copia le immagini e crea js/manuale.js con l'elenco dei capitoli.
"""
import json, re, shutil, sys
from pathlib import Path
import markdown

sorgente, uscita = Path(sys.argv[1]), Path(sys.argv[2])
uscita.mkdir(exist_ok=True)
capitoli = []
for md in sorted(sorgente.glob("Capitolo-*.md")):
    testo = md.read_text(encoding="utf-8")
    numero = int(re.match(r"Capitolo-(\d+)", md.name).group(1))
    titolo = re.search(r"^# Capitolo \d+\.\s*(.+)$", testo, re.M).group(1).strip()
    # La riga con il link al documento originale serve solo nell'archivio.
    testo = re.sub(r"^Copia del documento originale:.*\n", "", testo, flags=re.M)
    testo = re.sub(r"^- \[ \] ", "- ☐ ", testo, flags=re.M)
    html = markdown.markdown(testo, extensions=["tables"])
    html = re.sub(r'<img alt="([^"]*)" src="([^"]+)" />', r'<img alt="\1" src="manuale/\2" loading="lazy">', html)
    for img in re.findall(r'src="manuale/([^"]+)"', html):
        shutil.copy(sorgente / img, uscita / img)
    (uscita / f"{numero:02d}.html").write_text(html, encoding="utf-8")
    capitoli.append({"numero": numero, "titolo": titolo})

Path("js/manuale.js").write_text(
    "// Generato da strumenti/genera_manuale.py: elenco dei capitoli del manuale.\n"
    f"const CAPITOLI = {json.dumps(capitoli, ensure_ascii=False, indent=2)};\n", encoding="utf-8")
print(len(capitoli), "capitoli")
