# Cielo di Stasera

_Astronomia per poveri diavoli._

App web per principianti assoluti che osservano il cielo dall'Italia: dice cosa si vede stasera, dove guardare e con quale strumento, e per ogni oggetto racconta cos'è, l'origine del nome e la sua storia.

Funziona sul telefono e sul computer. Si può installare dalla schermata del browser ("Aggiungi a schermata Home" o "Installa app") e poi funziona anche senza rete.

## Cosa c'è in questa prima versione

- **Stasera:** tramonto, buio completo e alba; fase della Luna con un consiglio per la serata; elenco degli oggetti visibili con direzione e altezza espressa in "pugni" (un pugno a braccio teso copre circa 10 gradi).
- **Schede:** Luna, 7 pianeti, 12 stelle, tutte le 88 costellazioni, 15 galassie, 5 ammassi e nebulose, ognuno con: cos'è, quando, dove, come osservarlo, origine del nome, storia. Le costellazioni hanno anche le stelle principali con il significato del nome.
- **Due emisferi:** costellazioni e galassie dicono se si vedono dall'Italia (tutte, in parte o mai) e dall'Australia e dal Sud America, con un filtro per emisfero.
- **Lune:** una scheda per ogni pianeta con tutte le lune conosciute (le principali descritte, le altre in tabella), Plutone e le lune cercate attorno agli esopianeti.
- **Leggende:** 12 schede sulle leggende antiche dei nomi di pianeti, stelle, costellazioni e galassie.
- **Cerca:** una casella per trovare subito una scheda per nome.
- **Strumenti:** 40 schede su strumenti storici (da Tycho Brahe e Galileo ad Arecibo), grandi osservatori di oggi (VLT, Keck, ALMA, Rubin, ELT, radiotelescopi italiani, Virgo) e telescopi spaziali e sonde (Hubble, James Webb, Gaia, Kepler, Voyager e altri): cos'è, dove si trova, quando, cosa ha scoperto, origine del nome, curiosità. I testi sono in `js/strumenti.js`.
- **Luogo:** posizione del telefono oppure una città italiana dall'elenco.
- **Modalità notte:** tutto in rosso, per non perdere l'adattamento dell'occhio al buio.
- **Aiuto:** come si usa l'app e l'indirizzo per chiedere supporto (dep.kit@gmail.com). Autore: Antonio Chitano.

## Provarla sul computer

Serve un piccolo server locale, per esempio:

```
python3 -m http.server 8000
```

poi aprire http://localhost:8000 nel browser.

## Struttura

- `index.html`, `css/stile.css`: pagina e aspetto.
- `js/oggetti.js`: le schede degli oggetti (i testi si modificano qui).
- `js/costellazioni.js`: le 88 costellazioni, con stelle principali e visibilità dai due emisferi.
- `js/galassie.js`, `js/lune.js`, `js/leggende.js`: galassie, lune dei pianeti, leggende sui nomi.
- `js/citta.js`: le città dell'elenco.
- `js/cielo.js`: i calcoli astronomici.
- `js/app.js`: le schermate.
- `images/`: mappe del cielo e disegni delle schede (in `images/costellazioni/` una mappa per costellazione, con la sigla IAU); `strumenti/genera_mappe.py` le rigenera.
- `sw.js`, `manifest.webmanifest`: installazione e funzionamento senza rete.

## Manuale

I capitoli del manuale sono in `manuale/` come pagine HTML, generate dai file Markdown con `python3 strumenti/genera_manuale.py <cartella dei capitoli> manuale`. Nell'app si leggono dalla sezione "Manuale".

## Versione completa

La versione gratuita si apre al massimo 50 volte (un'apertura per ogni avvio dell'app). Poi serve un codice di sblocco: la versione completa costa 3,90 € e il codice si chiede per mail a dep.kit@gmail.com. Tutto è in `js/sblocco.js`: nel sito ci sono solo le impronte SHA-256 dei codici (nuove impronte con `python3 strumenti/impronta_codice.py CODICE`), i codici veri non sono nel repository. Con `attiva: false` l'app torna tutta gratuita.

## Crediti

Le mappe del cielo in `images/` sono generate con `strumenti/genera_mappe.py` dal catalogo di stelle e dalle linee delle costellazioni di [d3-celestial](https://github.com/ofrohn/d3-celestial) di Olaf Frohn (licenza BSD-3-Clause). I disegni di Luna e pianeti sono illustrazioni, non foto.

Le foto in `images/foto/` (Luna, pianeti e alcuni oggetti del profondo cielo) sono di NASA, ESA, NOIRLab e altri autori: per ognuna, autore, licenza e fonte sono indicati sotto la foto nella scheda e nella costante `FOTO` di `js/oggetti.js`.

I calcoli astronomici usano [Astronomy Engine](https://github.com/cosinekitty/astronomy) di Don Cross, con licenza MIT (`vendor/astronomy.min.js`).
