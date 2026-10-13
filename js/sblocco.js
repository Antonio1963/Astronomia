// Versione completa: l'app gratuita si apre al massimo VERSIONE_COMPLETA.aperture volte,
// poi serve un codice di sblocco (3,90 €) che Antonio manda per mail a chi paga.
// Per tornare a un'app tutta gratuita basta mettere attiva: false.
// Nuovi codici: python3 strumenti/impronta_codice.py CODICE, e si incolla l'impronta qui sotto.
const VERSIONE_COMPLETA = {
  attiva: true,
  prezzo: "3,90 €",
  aperture: 50,
};

const CODICI_SBLOCCO = [
  "e044d82d8bf6e8ba08652dc3e830e5b5c521d5377bf6be53a48ad8acf651e6ef",
  "77bc7939058e383ac2ff1fc73a2aaf4bbda8317523e3a1a4d220c611cf5f3549",
  "15a0a3f8642aaa08965160edc8ce28ef2351626d52330589ba794eb0b0cf9c1f",
  "2241cf23de451560b16768895c720e063f2e869db782729bf6062c99bec01790",
  "35f0360e41f97542c6b516ec470988354ec4cea87be1353ada0f9f2d74603d4e",
  "e54ecabfb4f6f1112b95342fd54c75a18ae413dbe31334bddef473c9b3f23759",
  "c9623497e5aeeca1fd2fd7c76028920755769978642e3f98df55f200b657db6d",
  "90455c7a9b186cc388112739242e064e7e6d8bb74862a59b1e5e96675c9b4fd6",
  "643e87836c96e61906f07a5d92d5abdcfb86b970d7929d8393481664b117159a",
  "3ffd0f971d8eea9bf61dd4580029f682856c8e222fcb11ec5c8fe1cb5fd272b0",
  "c9f7cb7bff91afdfe0b80a6834f421d756bec0623257d8b60e6150b0836f3f0b",
  "3e71fec1c276d7b4001c8c8c851a191f00aafe54dfd2056064e98368e852b08e",
  "6dd9ae3624422b819e5e1ff2a361cfd5836d04a057b9cb17d96cd64da6a0fe98",
  "94c6daaaa5ef842f842ff14170f5b02a291939651b9599ddd9e89331cc06b2b1",
  "0337c0eb55a918fd5af22d2d667659c9269b57cdc179ad32d576eba36c266655",
  "79a32bf7ae15b86c5f0d78605f9ac5de7414002df62f8c16938ea237ee65b1d4",
  "eb8c43739bf19c0ff5be61fe7329ddca9c91585e628b5fb8dbd85ce3600b14e4",
  "a9afed0682b119b697300ead5336831df404115435094482a4c892017e9ef0c2",
  "01ca97cee34ff842a3e9797d358a0f6493754af0d19804b888f00b78c7ef558e",
  "bdb02822094c1f18178f7cb42254adfe8d670bd3cf872ae3ac31675cd7ccc741",
  "3ef3ae3d71bbc361a76cb6fdcd5f2d5294cf6bd448f74705ab380ced2c4d9cb6",
  "a2b0a23ac6e596b793b8f9d9ba23ba836857ff29ecbe7efb078cd2d7bbdb3df3",
  "875995b24bb022b10cc7b9cb3692e290beade53f3fc53ef2b24c985fc4ff9ee2",
  "2d9e1f0b174dc864342b555a2023b27dc502204c4539292baf8cbbcc0d38ca2e",
  "96127ed046e3413f2b0d194f04b965bbaf2df698ce395741e282776759449118",
  "b5b15aaf176e5dc8c3cab1b98978e02d97c05dc24a9c42a7328969897be8f555",
  "5d507f14ed1b0e43368efabc372b40aef8dee53f8154356ab677efda9fda97df",
  "18edebccec911a3fa65642e59092ad87ec2bf61e20147669bd9c703914ed50d7",
  "e28aed707ef09c9f5ad0eea684ff9df9d096082848cded26f7258168ee95d411",
  "bcdd1b9b08f25f38331f3d9ae76688ffaba171f3f0969f3ab267b16e4deab90b",
];

function versioneCompletaSbloccata() {
  return !VERSIONE_COMPLETA.attiva || leggiImpostazione("sbloccata") === true;
}

function apertureUsate() {
  return Number(leggiImpostazione("aperture")) || 0;
}

function apertureRimaste() {
  return Math.max(0, VERSIONE_COMPLETA.aperture - apertureUsate());
}

// Conta un'apertura per ogni avvio dell'app (non per ogni ricarica della stessa sessione).
function contaApertura() {
  if (versioneCompletaSbloccata()) return;
  try {
    if (sessionStorage.getItem("aperturaContata")) return;
    sessionStorage.setItem("aperturaContata", "1");
  } catch {
    // Senza sessionStorage contiamo ogni caricamento.
  }
  salvaImpostazione("aperture", apertureUsate() + 1);
}

function appBloccata() {
  return !versioneCompletaSbloccata() && apertureUsate() > VERSIONE_COMPLETA.aperture;
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
