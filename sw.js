// Salva l'app sul dispositivo, così funziona anche senza rete sul campo.
const VERSIONE = "cielo-v1";
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
