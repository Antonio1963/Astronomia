// Salva l'app sul dispositivo, così funziona anche senza rete sul campo.
const VERSIONE = "cielo-v3";
const FILE = [
  "./",
  "index.html",
  "css/stile.css",
  "js/citta.js",
  "js/oggetti.js",
  "js/cielo.js",
  "js/app.js",
  "vendor/astronomy.min.js",
  "manifest.webmanifest",
  "icons/icona.svg",
  "icons/icona-192.png",
  "icons/icona-512.png",
  "images/aldebaran.svg",
  "images/altair.svg",
  "images/andromeda.svg",
  "images/antares.svg",
  "images/arturo.svg",
  "images/betelgeuse.svg",
  "images/capella.svg",
  "images/cassiopea.svg",
  "images/cigno.svg",
  "images/deneb.svg",
  "images/doppio-ammasso.svg",
  "images/giove.svg",
  "images/leone.svg",
  "images/luna.svg",
  "images/m13.svg",
  "images/marte.svg",
  "images/mercurio.svg",
  "images/nebulosa-orione.svg",
  "images/orione.svg",
  "images/orsa-maggiore.svg",
  "images/pleiadi.svg",
  "images/polare.svg",
  "images/presepe.svg",
  "images/rigel.svg",
  "images/saturno.svg",
  "images/scorpione.svg",
  "images/sirio.svg",
  "images/spica.svg",
  "images/stagione-autunno.svg",
  "images/stagione-estate.svg",
  "images/stagione-inverno.svg",
  "images/stagione-primavera.svg",
  "images/vega.svg",
  "images/venere.svg",
  "images/foto/andromeda.jpg",
  "images/foto/doppio-ammasso.jpg",
  "images/foto/giove.jpg",
  "images/foto/luna.jpg",
  "images/foto/m13.jpg",
  "images/foto/marte.jpg",
  "images/foto/mercurio.jpg",
  "images/foto/nebulosa-orione.jpg",
  "images/foto/pleiadi.jpg",
  "images/foto/presepe.jpg",
  "images/foto/saturno.jpg",
  "images/foto/venere.jpg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(VERSIONE).then((c) => c.addAll(FILE)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((chiavi) => Promise.all(chiavi.filter((k) => k !== VERSIONE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// Prima la rete (per avere sempre l'ultima versione), poi la copia salvata se si è offline.
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request)
      .then((risposta) => {
        const copia = risposta.clone();
        caches.open(VERSIONE).then((c) => c.put(e.request, copia));
        return risposta;
      })
      .catch(() => caches.match(e.request))
  );
});
