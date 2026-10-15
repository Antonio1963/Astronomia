"""Genera le immagini delle schede: mappe stellari vere e disegni di Luna e pianeti.

Le mappe usano il catalogo di stelle e le linee delle costellazioni del progetto
d3-celestial (Olaf Frohn, licenza BSD-3-Clause), scaricabile con:

    npm pack d3-celestial && tar xzf d3-celestial-*.tgz

Le figure del mito sopra le costellazioni sono i disegni di Johan Meuris per Stellarium
(licenza Free Art License), presi dalla cartella skycultures/modern del progetto Stellarium:
index.json dice per ogni disegno quali tre stelle tocca, e da quelle si calcola dove metterlo.

Uso:
    python3 strumenti/genera_mappe.py <cartella data di d3-celestial> <cartella di uscita> [<cartella skycultures/modern di Stellarium>]
"""

import base64
import io

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
    linee = {}
    for f in leggi("constellations.lines.json")["features"]:
        # Il Serpente è diviso in due parti (Testa e Coda) con lo stesso id: si uniscono.
        linee.setdefault(f["id"], []).extend(f["geometry"]["coordinates"])
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
          nomi_costellazioni=None, figura=None):
    stelle, linee, nomi_cost, nomi_stelle, _ = dati
    pr = Proiezione(ra, dec, campo)
    parti = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {LARGHEZZA} {ALTEZZA}" font-family="{FONT}">',
             f'<rect width="{LARGHEZZA}" height="{ALTEZZA}" fill="{SFONDO}"/>']
    if figura:
        parti.append(immagine_figura(figura, pr))

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
        "urano": pianeta("Urano", "#a9dde3", bande=((-0.6, 30, "#bfe7eb"), (0.35, 26, "#98d0d8")),
                         nota="Disegno: al telescopio è un piccolo disco verde-azzurro", raggio_p=75),
        "nettuno": pianeta("Nettuno", "#3f6fd8", bande=((-0.35, 22, "#5582e0"), (0.4, 18, "#3461c4")),
                           nota="Disegno: il colore blu e la Grande Macchia Scura vista dalla Voyager 2", raggio_p=72,
                           extra='<ellipse cx="{cx}" cy="{cy}" rx="16" ry="9" fill="#1f3f8f" fill-opacity="0.85" '
                                 'transform="translate(-18,-14)"/>'),
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


# Nomi italiani corretti dove quelli di d3-celestial sono diversi dall'uso comune
NOMI_IT = {"Cae": "Bulino", "Eri": "Eridano", "Hya": "Idra", "Hyi": "Idra Maschio", "Vol": "Pesce Volante",
           "Oph": "Ofiuco", "Cas": "Cassiopea", "Ser": "Serpente"}

# Galassie: (ra ore, dec, campo gradi, titolo, bersaglio, costellazioni evidenziate, nomi costellazioni)
GALASSIE = {
    "via-lattea": (17.9, -25, 100, "Il centro della Via Lattea, tra Sagittario e Scorpione", ("Centro galattico", 17.76, -29.0),
                   ("Sgr", "Sco"), ("Sgr", "Sco", "Oph")),
    "m33": (1.6, 33, 40, "La Galassia del Triangolo", ("M33", 1.564, 30.66), ("Tri",), ("Tri", "And")),
    "grande-nube-magellano": (5.4, -68, 50, "La Grande Nube di Magellano", ("Grande Nube", 5.393, -69.756), ("Dor",), ("Dor", "Men")),
    "piccola-nube-magellano": (0.9, -70, 50, "La Piccola Nube di Magellano", ("Piccola Nube", 0.879, -72.829), ("Tuc",), ("Tuc", "Hyi")),
    "m51": (13.3, 50, 40, "La Galassia Vortice, sotto il timone del Grande Carro", ("M51", 13.498, 47.195), ("CVn", "UMa"), ("CVn", "UMa")),
    "m81": (10.5, 64, 45, "Le galassie di Bode e Sigaro", ("M81 e M82", 9.93, 69.4), ("UMa",), ("UMa",)),
    "m82": (10.5, 64, 45, "Le galassie di Bode e Sigaro", ("M81 e M82", 9.93, 69.4), ("UMa",), ("UMa",)),
    "m104": (12.6, -8, 40, "La Galassia Sombrero, tra Vergine e Corvo", ("M104", 12.667, -11.623), ("Vir", "Crv"), ("Vir", "Crv")),
    "ngc-253": (0.8, -25, 40, "La Galassia dello Scultore", ("NGC 253", 0.7925, -25.288), ("Scl",), ("Scl", "Cet")),
    "ngc-5128": (13.4, -45, 45, "Centaurus A", ("Centaurus A", 13.424, -43.019), ("Cen",), ("Cen",)),
    "m101": (13.6, 53, 40, "La Galassia Girandola, vicino al timone del Grande Carro", ("M101", 14.054, 54.349), ("UMa",), ("UMa",)),
    "tripletto-leone": (11.2, 16, 35, "Il Tripletto del Leone", ("M65, M66, NGC 3628", 11.33, 13.2), ("Leo",), ("Leo",)),
    "m77": (2.8, 3, 35, "M77, nella Balena", ("M77", 2.711, -0.013), ("Cet",), ("Cet",)),
    "m83": (13.6, -26, 40, "La Girandola Australe, nell'Idra", ("M83", 13.617, -29.866), ("Hya",), ("Hya", "Cen")),
}


def centri_costellazioni(cartella_dati):
    """Centro (ascensione retta in ore, declinazione) e campo in gradi della mappa di ogni costellazione,
    calcolati dai confini ufficiali (IAU)."""
    leggi = lambda nome: json.load(open(os.path.join(cartella_dati, nome), encoding="utf-8"))
    punti = {}
    for f in leggi("constellations.bounds.json")["features"]:
        g = f["geometry"]
        poligoni = g["coordinates"] if g["type"] == "MultiPolygon" else [g["coordinates"]]
        for poligono in poligoni:
            for anello in poligono:
                punti.setdefault(f["id"], []).extend(anello)
    centri = {}
    for cid, pp in punti.items():
        decs = [lat for _, lat in pp]
        # Centro in ascensione retta: metà dell'arco occupato (i confini possono attraversare 0h)
        lons = sorted({lon % 360 for lon, _ in pp})
        salti = [((lons[(i + 1) % len(lons)] - lons[i]) % 360, i) for i in range(len(lons))]
        salto, i = max(salti)
        inizio, arco = lons[(i + 1) % len(lons)], 360 - salto
        ra = ((inizio + arco / 2) % 360) / 15
        dec = (min(decs) + max(decs)) / 2
        if arco > 300:  # contiene il polo
            dec = (max(decs) + 90) / 2 if dec > 0 else (min(decs) - 90) / 2
        larghezza = max(math.degrees(math.acos(max(-1, min(1, math.sin(math.radians(dec)) * math.sin(math.radians(lat))
                        + math.cos(math.radians(dec)) * math.cos(math.radians(lat)) * math.cos(math.radians(lon - ra * 15))))))
                        for lon, lat in pp)
        campo = max(35, min(120, larghezza * 3.4))
        if cid == "Ser":  # due parti separate, Testa e Coda
            ra, dec, campo = 17.0, 4, 90
        if cid == "Cep":  # i confini arrivano al polo, ma la figura è attorno alle 22h
            ra, dec, campo = 22.0, 68, 55
        centri[cid] = (ra, dec, campo)
    return centri


def js_centri(centri):
    """Gli stessi centri per l'app: servono a sovrapporre la mappa al cielo vero nella guida "Guidami in cielo".
    Oltre alle costellazioni, le mappe delle schede di stelle, galassie, ammassi e nebulose."""
    righe = [f'  {cid}: [{ra:.4f}, {dec:.4f}, {campo:.2f}],' for cid, (ra, dec, campo) in sorted(centri.items())]
    schede = {**MAPPE, **GALASSIE}
    righe_schede = [f'  "{sid}": [{v[0]}, {v[1]}, {v[2]}],' for sid, v in sorted(schede.items())]
    return ("// Generato da strumenti/genera_mappe.py: centro (ascensione retta in ore, declinazione in gradi)\n"
            "// e larghezza in gradi delle mappe (proiezione stereografica, 800 x 500 punti).\n"
            "// CENTRI_MAPPE: le 88 costellazioni, per sigla. CENTRI_SCHEDE: le mappe images/<id>.svg delle altre schede.\n"
            "const CENTRI_MAPPE = {\n" + "\n".join(righe) + "\n};\n\n"
            "const CENTRI_SCHEDE = {\n" + "\n".join(righe_schede) + "\n};\n")


def mappe_costellazioni(cartella_dati, dati, figure=None):
    """Una mappa per ognuna delle 88 costellazioni, centrata sui suoi confini ufficiali (IAU).
    Con le figure, la stessa mappa con sotto il disegno del mito."""
    leggi = lambda nome: json.load(open(os.path.join(cartella_dati, nome), encoding="utf-8"))
    stelle_mag = {hip: mag for _, _, mag, _, hip in dati[0]}
    nomi_hip = {}
    for hip, v in leggi("starnames.json").items():
        if v.get("name") and v.get("c") and hip in stelle_mag:
            nomi_hip.setdefault(v["c"], []).append(hip)
    mappe = {}
    for cid, (ra, dec, campo) in centri_costellazioni(cartella_dati).items():
        nome = NOMI_IT.get(cid, dati[2][cid][0])
        etichette = tuple(sorted(nomi_hip.get(cid, ()), key=stelle_mag.get)[:5])
        if figure is None:
            mappe[cid] = mappa(dati, ra, dec, campo, nome, None, (cid,), etichette_extra=etichette,
                               mag_etichette=1.0, nomi_costellazioni=(cid,))
        else:
            cartella, immagine = figure[cid]
            mappe[cid] = mappa(dati, ra, dec, campo, nome, None, (cid,), etichette_extra=etichette, mag_etichette=1.0,
                               nomi_costellazioni=(cid,), figura=(cartella, immagine, figure["posizioni"]))
    return mappe


# ---------- Figure del mito (disegni di Stellarium) ----------

# Puppis e Vela non hanno un disegno loro: sono pezzi della nave Argo, disegnata con la Carena.
# Il Serpente è disegnato insieme a Ofiuco, che lo tiene in mano.
FIGURA_DI = {"Pup": "Car", "Vel": "Car", "Ser": "Oph"}
COLORE_FIGURA = (232, 205, 150)


def carica_figure(cartella_stellarium):
    indice = json.load(open(os.path.join(cartella_stellarium, "index.json"), encoding="utf-8"))
    figure = {}
    for c in indice["constellations"]:
        if "image" in c:
            figure[c["id"].split()[-1]] = c["image"]
    return {cid: (cartella_stellarium, figure[FIGURA_DI.get(cid, cid)]) for cid in set(figure) | set(FIGURA_DI)}


def png_figura(cartella_stellarium, immagine):
    """Il disegno è chiaro su fondo nero: la luminosità diventa trasparenza, con un colore caldo da vecchio atlante."""
    from PIL import Image
    grigio = Image.open(os.path.join(cartella_stellarium, immagine["file"])).convert("L")
    alfa = grigio.point(lambda v: int(v * 0.85))
    colore = Image.new("RGBA", grigio.size, COLORE_FIGURA + (255,))
    colore.putalpha(alfa)
    buf = io.BytesIO()
    colore.save(buf, "PNG", optimize=True)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def immagine_figura(figura, pr):
    """Mette il disegno sulla mappa: le tre stelle di riferimento finiscono esattamente al loro posto."""
    cartella, immagine, posizioni = figura
    w, h = immagine["size"]
    sorgente, destinazione = [], []
    for a in immagine["anchors"]:
        lon, lat = posizioni[str(a["hip"])]
        sorgente.append(a["pos"])
        destinazione.append(pr(lon, lat))
    (u1, v1), (u2, v2), (u3, v3) = sorgente
    (x1, y1), (x2, y2), (x3, y3) = destinazione
    det = (u2 - u1) * (v3 - v1) - (u3 - u1) * (v2 - v1)
    a = ((x2 - x1) * (v3 - v1) - (x3 - x1) * (v2 - v1)) / det
    c = ((u2 - u1) * (x3 - x1) - (u3 - u1) * (x2 - x1)) / det
    b = ((y2 - y1) * (v3 - v1) - (y3 - y1) * (v2 - v1)) / det
    d = ((u2 - u1) * (y3 - y1) - (u3 - u1) * (y2 - y1)) / det
    e, f = x1 - a * u1 - c * v1, y1 - b * u1 - d * v1
    return (f'<image width="{w}" height="{h}" preserveAspectRatio="none" '
            f'transform="matrix({a:.5f} {b:.5f} {c:.5f} {d:.5f} {e:.2f} {f:.2f})" '
            f'href="data:image/png;base64,{png_figura(cartella, immagine)}"/>')


def main(cartella_dati, uscita, cartella_stellarium=None):
    dati = carica(cartella_dati)
    for cid, nome in NOMI_IT.items():
        dati[2][cid] = (nome, dati[2][cid][1])
    os.makedirs(uscita, exist_ok=True)
    scrivi = lambda nome, svg: open(os.path.join(uscita, nome + ".svg"), "w", encoding="utf-8").write(svg)
    for cid, (ra, dec, campo, titolo, bersaglio, cost, nomi) in MAPPE.items():
        scrivi(cid, mappa(dati, ra, dec, campo, titolo, bersaglio, cost, nomi_costellazioni=nomi))
    for cid, (ra, dec, campo, titolo, cost, mag) in STAGIONI.items():
        scrivi(cid, mappa(dati, ra, dec, campo, titolo, None, cost, mag_etichette=mag))
    for cid, (ra, dec, campo, titolo, bersaglio, cost, nomi) in GALASSIE.items():
        scrivi(cid, mappa(dati, ra, dec, campo, titolo, bersaglio, cost, nomi_costellazioni=nomi))
    for cid, svg in disegni().items():
        scrivi(cid, svg)
    os.makedirs(os.path.join(uscita, "costellazioni"), exist_ok=True)
    for cid, svg in mappe_costellazioni(cartella_dati, dati).items():
        scrivi(os.path.join("costellazioni", cid), svg)
    with open(os.path.join(uscita, "..", "js", "centri-mappe.js"), "w", encoding="utf-8") as f:
        f.write(js_centri(centri_costellazioni(cartella_dati)))
    if cartella_stellarium:
        figure = carica_figure(cartella_stellarium)
        # Alcune stelle di riferimento dei disegni sono più deboli della magnitudine 6: servono le posizioni del catalogo fino alla 8
        figure["posizioni"] = {str(f["id"]): f["geometry"]["coordinates"]
                               for f in json.load(open(os.path.join(cartella_dati, "stars.8.json")))["features"]}
        os.makedirs(os.path.join(uscita, "costellazioni", "figure"), exist_ok=True)
        for cid, svg in mappe_costellazioni(cartella_dati, dati, figure).items():
            scrivi(os.path.join("costellazioni", "figure", cid), svg)


if __name__ == "__main__":
    main(*sys.argv[1:4])
