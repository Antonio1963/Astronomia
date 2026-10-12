// Versione completa: struttura pronta ma SPENTA (attiva: false).
// Con attiva: false l'app resta tutta gratuita, come prima.
// Per accenderla: mettere attiva: true e inserire in CODICI_SBLOCCO le impronte SHA-256
// dei codici venduti (si calcolano con: python3 strumenti/impronta_codice.py CODICE).
const VERSIONE_COMPLETA = {
  attiva: false,
  prezzo: "3,90 €",
  capitoliGratis: 3, // i primi capitoli del manuale restano sempre liberi
};

const CODICI_SBLOCCO = [
  // "impronta sha-256 in esadecimale",
];

function versioneCompletaSbloccata() {
  return !VERSIONE_COMPLETA.attiva || leggiImpostazione("sbloccata") === true;
}

function capitoloLibero(numero) {
  return versioneCompletaSbloccata() || numero <= VERSIONE_COMPLETA.capitoliGratis;
}

async function improntaCodice(codice) {
  const byte = new TextEncoder().encode(codice.trim().toUpperCase());
  const hash = await crypto.subtle.digest("SHA-256", byte);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function provaCodice(codice) {
  if (!codice.trim() || !crypto.subtle) return false;
  const ok = CODICI_SBLOCCO.includes(await improntaCodice(codice));
  if (ok) salvaImpostazione("sbloccata", true);
  return ok;
}
