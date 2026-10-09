# Cielo di Stasera

App web per principianti assoluti che osservano il cielo dall'Italia: dice cosa si vede stasera, dove guardare e con quale strumento, e per ogni oggetto racconta cos'è, l'origine del nome e la sua storia.

Funziona sul telefono e sul computer. Si può installare dalla schermata del browser ("Aggiungi a schermata Home" o "Installa app") e poi funziona anche senza rete.

## Cosa c'è in questa prima versione

- **Stasera:** tramonto, buio completo e alba; fase della Luna con un consiglio per la serata; elenco degli oggetti visibili con direzione e altezza espressa in "pugni" (un pugno a braccio teso copre circa 10 gradi).
- **Schede:** 30 oggetti (Luna, 5 pianeti, 12 stelle, 6 costellazioni, 6 oggetti del cielo profondo), ognuno con: cos'è, quando, dove, come osservarlo, origine del nome, storia.
- **Luogo:** posizione del telefono oppure una città italiana dall'elenco.
- **Modalità notte:** tutto in rosso, per non perdere l'adattamento dell'occhio al buio.

## Provarla sul computer

Serve un piccolo server locale, per esempio:

```
python3 -m http.server 8000
```

poi aprire http://localhost:8000 nel browser.

## Struttura

- `index.html`, `css/stile.css`: pagina e aspetto.
- `js/oggetti.js`: le schede degli oggetti (i testi si modificano qui).
- `js/citta.js`: le città dell'elenco.
- `js/cielo.js`: i calcoli astronomici.
- `js/app.js`: le schermate.
- `sw.js`, `manifest.webmanifest`: installazione e funzionamento senza rete.

## Crediti

I calcoli astronomici usano [Astronomy Engine](https://github.com/cosinekitty/astronomy) di Don Cross, con licenza MIT (`vendor/astronomy.min.js`).
