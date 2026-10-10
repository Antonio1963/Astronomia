"""Genera le immagini delle schede: mappe stellari vere e disegni di Luna e pianeti.

Le mappe usano il catalogo di stelle e le linee delle costellazioni del progetto
d3-celestial (Olaf Frohn, licenza BSD-3-Clause), scaricabile con:

    npm pack d3-celestial && tar xzf d3-celestial-*.tgz

Uso:
    python3 strumenti/genera_mappe.py <cartella data di d3-celestial> <cartella di uscita>
"""

import json
import math
import os
import sys

LARGHEZZA, ALTEZZA = 800, 500
SFONDO = "#0b1026"
LINEE = "#4a5891"
EVIDENZA = "#ffd479"
TESTO = "#e8ecff"
TESTO_TENUE = "#a3acd6"
FONT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"


# ---------- Dati ----------

def carica(cartella):
    leggi = lambda nome: json.load(open(os.path.join(cartella, nome), encoding="utf-8"))
    stelle = [
        (f["geometry"]["coordinates"][0], f["geometry"]["coordinates"][1], f["properties"]["mag"],
         f["properties"].get("bv"), str(f["id"]))
        for f in leggi("stars.6.json")["features"]
    ]
    linee = {f["id"]: f["geometry"]["coordinates"] for f in leggi("constellations.lines.json")["features"]}
    nomi_cost = {f["id"]: (f["properties"].get("it") or f["properties"]["name"], f["geometry"]["coordinates"])
                 for f in leggi("constellations.json")["features"]}
    nomi_stelle = {k: (v.get("it") or v.get("name")) for k, v in leggi("starnames.json").items()
                   if v.get("it") or v.get("name")}
    via_lattea = [(f["id"], f["geometry"]["coordinates"]) for f in leggi("mw.json")["features"]]
    return stelle, linee, nomi_cost, nomi_stelle, via_lattea


# ---------- Proiezione stereografica, Nord in alto ed Est a sinistra (come si vede il cielo) ----------

class Proiezione:
    def __init__(self, ra_ore, dec, campo):
        self.a0 = math.radians(ra_ore * 15)
        self.d0 = math.radians(dec)
        self.scala = (LARGHEZZA / 2) / (2 * math.tan(math.radians(campo) / 4))

    def __call__(self, lon, lat):
        a, d = math.radians(lon), math.radians(lat)
        cosc = math.sin(self.d0) * math.sin(d) + math.cos(self.d0) * math.cos(d) * math.cos(a - self.a0)
        if cosc < -0.2:
            return None
        k = 2 / (1 + cosc)
        x = k * math.cos(d) * math.sin(a - self.a0)
        y = k * (math.cos(self.d0) * math.sin(d) - math.sin(self.d0) * math.cos(d) * math.cos(a - self.a0))
        return LARGHEZZA / 2 - self.scala * x, ALTEZZA / 2 - self.scala * y


def dentro(p, margine=0):
    return p and -margine <= p[0] <= LARGHEZZA + margine and -margine <= p[1] <= ALTEZZA + margine


def colore_stella(bv):
    try:
        bv = float(bv)
    except (TypeError, ValueError):
        return "#ffffff"
    tappe = [(-0.3, "#9bb8ff"), (0.0, "#cfdcff"), (0.4, "#ffffff"), (0.8, "#fff1c9"), (1.2, "#ffd29a"), (1.8, "#ffab7a")]
    for limite, colore in tappe:
        if bv <= limite:
            return colore
    return tappe[-1][1]


def raggio(mag):
    return max(0.7, (6.3 - mag) * 1.05)


def testo(x, y, parole, dim=15, colore=TESTO, peso=400, ancora="start", corsivo=False):
    stile = ' font-style="italic"' if corsivo else ""
    parole = parole.replace("&", "&amp;").replace("<", "&lt;")
    return (f'<text x="{x:.1f}" y="{y:.1f}" font-size="{dim}" fill="{colore}" font-weight="{peso}" '
            f'text-anchor="{ancora}"{stile} paint-order="stroke" stroke="{SFONDO}" stroke-width="3">{parole}</text>')


# ---------- Mappa ----------

def mappa(dati, ra, dec, campo, titolo, bersaglio=None, costellazioni=(), etichette_extra=(), mag_etichette=1.6,
          nomi_costellazioni=None):
    stelle, linee, nomi_cost, nomi_stelle, _ = dati
    pr = Proiezione(ra, dec, campo)
    parti = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {LARGHEZZA} {ALTEZZA}" font-family="{FONT}">',
             f'<rect width="{LARGHEZZA}" height="{ALTEZZA}" fill="{SFONDO}"/>']

    # Linee delle costellazioni
    for cid, segmenti in linee.items():
        evidenziata = cid in costellazioni
        for segmento in segmenti:
            punti = [pr(lon, lat) for lon, lat in segmento]
            if any(p is None for p in punti) or not any(dentro(p, 50) for p in punti):
                continue
            d = " ".join(f"{p[0]:.1f},{p[1]:.1f}" for p in punti)
            parti.append(f'<polyline points="{d}" fill="none" stroke="{EVIDENZA if evidenziata else LINEE}" '
                         f'stroke-width="{2 if evidenziata else 1.1}" stroke-opacity="{0.9 if evidenziata else 0.8}"/>')

    # Stelle, dalle più deboli alle più luminose
    posizioni = {}
    for lon, lat, mag, bv, hip in sorted(stelle, key=lambda s: -s[2]):
        p = pr(lon, lat)
        if not dentro(p, 5):
            continue
        posizioni[hip] = (p, mag)
        parti.append(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="{raggio(mag):.2f}" fill="{colore_stella(bv)}"/>')

    # Nomi delle costellazioni
    mostra = nomi_costellazioni if nomi_costellazioni is not None else costellazioni
    for cid in mostra:
        nome, (lon, lat) = nomi_cost[cid]
        p = pr(lon, lat)
        if dentro(p, -30):
            parti.append(testo(p[0], p[1], nome.upper(), 13, EVIDENZA if cid in costellazioni else TESTO_TENUE,
                               600, "middle"))

    # Nomi delle stelle più luminose (non quella della scheda, che ha già la sua etichetta)
    vicino_al_bersaglio = lambda p: False
    if bersaglio and bersaglio[0]:
        pb = pr(bersaglio[1] * 15, bersaglio[2])
        vicino_al_bersaglio = lambda p: math.hypot(p[0] - pb[0], p[1] - pb[1]) < 20
    for hip, (p, mag) in posizioni.items():
        if (mag <= mag_etichette or hip in etichette_extra) and hip in nomi_stelle and dentro(p, -20) \
                and not vicino_al_bersaglio(p):
            parti.append(testo(p[0] + raggio(mag) + 4, p[1] + 4, nomi_stelle[hip], 14))

    # Bersaglio: l'oggetto della scheda
    if bersaglio:
        nome, ra_b, dec_b = bersaglio
        p = pr(ra_b * 15, dec_b)
        parti.append(f'<circle cx="{p[0]:.1f}" cy="{p[1]:.1f}" r="16" fill="none" stroke="{EVIDENZA}" stroke-width="2.5"/>')
        if nome:
            parti.append(testo(p[0], p[1] - 24, nome, 16, EVIDENZA, 700, "middle"))

    # Titolo e punti cardinali della mappa
    parti.append(testo(20, 34, titolo, 18, TESTO, 700))
    parti.append(testo(LARGHEZZA / 2, ALTEZZA - 12, "Nord in alto, Est a sinistra", 12, TESTO_TENUE, 400, "middle"))
    parti.append("</svg>")
    return "\n".join(parti)


# ---------- Disegni di Luna e pianeti ----------

def disegno(titolo, corpo, nota):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {LARGHEZZA} {ALTEZZA}" font-family="{FONT}">'
            f'<rect width="{LARGHEZZA}" height="{ALTEZZA}" fill="{SFONDO}"/>{corpo}'
            f'{testo(20, 34, titolo, 18, TESTO, 700)}{testo(LARGHEZZA / 2, ALTEZZA - 14, nota, 13, TESTO_TENUE, 400, "middle")}</svg>')


def stelline(n=60, seme=7):
    import random
    r = random.Random(seme)
    return "".join(f'<circle cx="{r.uniform(0, LARGHEZZA):.0f}" cy="{r.uniform(40, ALTEZZA - 30):.0f}" '
                   f'r="{r.choice([0.6, 0.8, 1, 1.3])}" fill="#ffffff" fill-opacity="{r.uniform(0.3, 0.8):.2f}"/>'
                   for _ in range(n))


def fasi_lunari():
    # Le otto fasi principali, come si vedono dall'Italia (parte illuminata a destra quando cresce)
    nomi = ["Nuova", "Falce\ncrescente", "Primo\nquarto", "Gibbosa\ncrescente", "Piena", "Gibbosa\ncalante",
            "Ultimo\nquarto", "Falce\ncalante"]
    r, y, parti = 38, 230, [stelline(40, 3)]
    for i, nome in enumerate(nomi):
        cx = 60 + i * 97
        angolo = i * 45
        rx = abs(math.cos(math.radians(angolo))) * r
        crescente = angolo < 180
        gibbosa = 90 < angolo < 270
        bordo = 1 if crescente else 0
        term = (1 if gibbosa else 0) if crescente else (0 if gibbosa else 1)
        parti.append(f'<circle cx="{cx}" cy="{y}" r="{r}" fill="#262d52"/>')
        if angolo == 180:
            parti.append(f'<circle cx="{cx}" cy="{y}" r="{r}" fill="#f3efe0"/>')
        elif angolo != 0:
            parti.append(f'<path transform="translate({cx},{y})" d="M0,{-r} A{r},{r} 0 0 {bordo} 0,{r} '
                         f'A{rx:.1f},{r} 0 0 {term} 0,{-r} Z" fill="#f3efe0"/>')
        for j, riga in enumerate(nome.split("\n")):
            parti.append(testo(cx, y + r + 26 + j * 17, riga, 13, TESTO_TENUE, 400, "middle"))
    parti.append(testo(LARGHEZZA / 2, 120, "Un ciclo completo dura circa 29 giorni e mezzo", 15, TESTO, 400, "middle"))
    return disegno("Le fasi della Luna", "".join(parti), "Dall'Italia la parte illuminata cresce da destra verso sinistra")


def pianeta(nome, colore, bande=(), anelli=False, nota="", raggio_p=120, extra=""):
    cx, cy = LARGHEZZA / 2, ALTEZZA / 2 + 10
    defs = (f'<defs><radialGradient id="ombra" cx="35%" cy="35%" r="75%"><stop offset="0" stop-color="#ffffff" '
            f'stop-opacity="0.25"/><stop offset="0.6" stop-color="#000000" stop-opacity="0"/><stop offset="1" '
            f'stop-color="#000000" stop-opacity="0.55"/></radialGradient><clipPath id="disco"><circle cx="{cx}" '
            f'cy="{cy}" r="{raggio_p}"/></clipPath></defs>')
    parti = [stelline(), defs]
    if anelli:
        parti.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{raggio_p * 2.1}" ry="{raggio_p * 0.55}" fill="none" '
                     f'stroke="#d8c79a" stroke-width="{raggio_p * 0.28}" stroke-opacity="0.85"/>')
        parti.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{raggio_p * 1.72}" ry="{raggio_p * 0.45}" fill="none" '
                     f'stroke="{SFONDO}" stroke-width="5" stroke-opacity="0.9"/>')
    parti.append(f'<circle cx="{cx}" cy="{cy}" r="{raggio_p}" fill="{colore}"/>')
    parti.append(f'<g clip-path="url(#disco)">')
    for y_rel, spessore, c in bande:
        parti.append(f'<rect x="{cx - raggio_p}" y="{cy + y_rel * raggio_p - spessore / 2}" width="{2 * raggio_p}" '
                     f'height="{spessore}" fill="{c}" fill-opacity="0.75"/>')
    parti.append(extra.format(cx=cx, cy=cy, r=raggio_p))
    parti.append(f'<circle cx="{cx}" cy="{cy}" r="{raggio_p}" fill="url(#ombra)"/></g>')
    if anelli:
        # La parte anteriore degli anelli passa davanti al pianeta
        parti.append(f'<path d="M{cx - raggio_p * 2.1},{cy} A{raggio_p * 2.1},{raggio_p * 0.55} 0 0 1 '
                     f'{cx + raggio_p * 2.1},{cy}" fill="none" stroke="#d8c79a" stroke-width="{raggio_p * 0.28}" '
                     f'stroke-opacity="0.85"/>')
    return disegno(nome, "".join(parti), nota)


def disegni():
    return {
        "luna": fasi_lunari(),
        "mercurio": pianeta("Mercurio", "#9c948c", nota="Disegno: a occhio nudo appare come un puntino rosato",
                            raggio_p=70, extra='<g fill="#7d766f"><circle cx="{cx}" cy="{cy}" r="9" transform="translate(-20,-18)"/>'
                            '<circle cx="{cx}" cy="{cy}" r="6" transform="translate(25,10)"/>'
                            '<circle cx="{cx}" cy="{cy}" r="12" transform="translate(-8,30)"/></g>'),
        "venere": pianeta("Venere", "#f1e3b8", bande=((-0.3, 30, "#f7eccb"), (0.25, 40, "#e8d29a")),
                          nota="Disegno: le nubi di Venere riflettono molta luce del Sole", raggio_p=115),
        "marte": pianeta("Marte", "#c1532f", bande=((-0.92, 26, "#f4ece6"), (0.15, 34, "#8d3a22"), (0.45, 22, "#a8462a")),
                         nota="Disegno: il colore rosso e la calotta polare bianca", raggio_p=80),
        "giove": pianeta("Giove", "#d9b98c", bande=((-0.55, 22, "#a8794f"), (-0.28, 30, "#b98a5c"), (0.05, 18, "#efe0c4"),
                                                   (0.3, 34, "#a3714a"), (0.62, 20, "#b98a5c")),
                         nota="Disegno: le bande di nubi e la Grande Macchia Rossa", raggio_p=140,
                         extra='<ellipse cx="{cx}" cy="{cy}" rx="22" ry="12" fill="#b4452c" fill-opacity="0.85" '
                               'transform="translate(55,48)"/>'),
        "saturno": pianeta("Saturno", "#e3cf9c", bande=((-0.4, 26, "#d2b97f"), (0.1, 30, "#c9ac6e"), (0.5, 18, "#d9c28b")),
                           anelli=True, nota="Disegno: gli anelli si vedono con un piccolo telescopio", raggio_p=90),
    }


# ---------- Elenco delle mappe ----------

MAPPE = {
    # id scheda: (ra ore, dec, campo gradi, titolo, bersaglio, costellazioni evidenziate, nomi costellazioni)
    "polare": (7.0, 82, 85, "Trovare la Stella Polare", ("Stella Polare", 2.530, 89.264), ("UMa", "UMi"), ("UMa", "UMi", "Cas")),
    "sirio": (6.2, -6, 55, "Sirio, seguendo la Cintura di Orione", ("Sirio", 6.752, -16.716), ("CMa",), ("CMa", "Ori")),
    "vega": (19.4, 30, 60, "Vega e il Triangolo estivo", ("Vega", 18.616, 38.784), ("Lyr",), ("Lyr", "Cyg", "Aql")),
    "arturo": (13.0, 40, 75, "Dal timone del Grande Carro ad Arturo", ("Arturo", 14.261, 19.182), ("Boo",), ("Boo", "UMa")),
    "betelgeuse": (5.6, 2, 40, "Betelgeuse, la spalla di Orione", ("Betelgeuse", 5.919, 7.407), ("Ori",), ("Ori",)),
    "rigel": (5.6, 2, 40, "Rigel, il piede di Orione", ("Rigel", 5.242, -8.202), ("Ori",), ("Ori",)),
    "aldebaran": (4.5, 18, 40, "Aldebaran, l'occhio del Toro", ("Aldebaran", 4.599, 16.509), ("Tau",), ("Tau",)),
    "antares": (16.7, -28, 40, "Antares, il cuore dello Scorpione", ("Antares", 16.490, -26.432), ("Sco",), ("Sco",)),
    "altair": (19.6, 22, 60, "Altair e il Triangolo estivo", ("Altair", 19.846, 8.868), ("Aql",), ("Lyr", "Cyg", "Aql")),
    "deneb": (20.4, 38, 50, "Deneb, la coda del Cigno", ("Deneb", 20.690, 45.280), ("Cyg",), ("Cyg", "Lyr")),
    "capella": (5.4, 40, 50, "Capella nell'Auriga", ("Capella", 5.278, 45.998), ("Aur",), ("Aur",)),
    "spica": (13.6, 8, 65, "Da Arturo a Spica", ("Spica", 13.420, -11.161), ("Vir",), ("Vir", "Boo")),
    "orsa-maggiore": (11.6, 55, 55, "L'Orsa Maggiore e il Grande Carro", None, ("UMa",), ("UMa",)),
    "cassiopea": (1.0, 60, 40, "Cassiopea, la W del cielo", None, ("Cas",), ("Cas",)),
    "orione": (5.6, 2, 40, "Orione, il cacciatore", None, ("Ori",), ("Ori",)),
    "scorpione": (16.9, -30, 40, "Lo Scorpione", None, ("Sco",), ("Sco",)),
    "cigno": (20.6, 40, 45, "Il Cigno, o Croce del Nord", None, ("Cyg",), ("Cyg",)),
    "leone": (10.6, 18, 45, "Il Leone", None, ("Leo",), ("Leo",)),
    "pleiadi": (4.0, 21, 30, "Le Pleiadi, vicino ad Aldebaran", ("Pleiadi", 3.791, 24.117), ("Tau",), ("Tau",)),
    "andromeda": (0.9, 38, 50, "La Galassia di Andromeda", ("M31", 0.712, 41.269), ("And",), ("And", "Cas")),
    "nebulosa-orione": (5.55, -2, 28, "La Nebulosa di Orione, nella spada", ("M42", 5.588, -5.391), ("Ori",), ("Ori",)),
    "presepe": (8.6, 20, 45, "Il Presepe, nel Cancro", ("M44", 8.667, 19.67), ("Cnc",), ("Cnc", "Gem", "Leo")),
    "doppio-ammasso": (2.4, 58, 40, "Il Doppio ammasso, tra Cassiopea e Perseo", ("Doppio ammasso", 2.33, 57.14), ("Per", "Cas"),
                       ("Per", "Cas")),
    "m13": (16.9, 34, 45, "L'Ammasso di Ercole", ("M13", 16.695, 36.46), ("Her",), ("Her",)),
}

# Il cielo di ogni stagione verso le 22, per il manuale
STAGIONI = {
    "stagione-autunno": (0.8, 42, 85, "Autunno: Cassiopea, Andromeda e Pegaso", ("Cas", "And", "Peg", "Per"), 1.6),
    "stagione-inverno": (5.9, 5, 80, "Inverno: Orione e le sue vicine", ("Ori", "CMa", "Tau", "Gem", "Aur"), 1.6),
    "stagione-primavera": (12.0, 32, 85, "Primavera: dal Grande Carro al Leone e ad Arturo", ("UMa", "Leo", "Boo", "Vir"), 1.6),
    "stagione-estate": (19.0, 18, 85, "Estate: il Triangolo estivo e lo Scorpione", ("Lyr", "Cyg", "Aql", "Sco"), 1.6),
}


def main(cartella_dati, uscita):
    dati = carica(cartella_dati)
    os.makedirs(uscita, exist_ok=True)
    scrivi = lambda nome, svg: open(os.path.join(uscita, nome + ".svg"), "w", encoding="utf-8").write(svg)
    for cid, (ra, dec, campo, titolo, bersaglio, cost, nomi) in MAPPE.items():
        scrivi(cid, mappa(dati, ra, dec, campo, titolo, bersaglio, cost, nomi_costellazioni=nomi))
    for cid, (ra, dec, campo, titolo, cost, mag) in STAGIONI.items():
        scrivi(cid, mappa(dati, ra, dec, campo, titolo, None, cost, mag_etichette=mag))
    for cid, svg in disegni().items():
        scrivi(cid, svg)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
