// Traduzioni dell'app: estrae i testi italiani, controlla le traduzioni e genera js/lingue/<codice>.js.
//   node strumenti/lingue.js estrai          → strumenti/traduzioni/it/<parte>.json (i testi da tradurre)
//   node strumenti/lingue.js controlla [xx]  → dice cosa manca o è sbagliato nelle traduzioni
//   node strumenti/lingue.js genera          → js/lingue/<codice>.js per ogni lingua tradotta
// Ogni testo ha una chiave "raccolta/id/campo": per esempio "oggetti/luna/cosa" o "oggetti/orione/stelle/0/significato".

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const RADICE = path.join(__dirname, "..");
const CARTELLA = path.join(__dirname, "traduzioni");

function carica(file, ctx) {
  const codice = fs.readFileSync(path.join(RADICE, file), "utf8").replace(/^(const|let) /gm, "var ");
  vm.runInContext(codice, ctx);
}

function datiItaliani() {
  const ctx = vm.createContext({ console, TRADUZIONI: {} });
  carica("js/oggetti.js", ctx);
  const base = new Set(ctx.OGGETTI.map((o) => o.id));
  for (const f of ["costellazioni", "galassie", "lune", "leggende", "strumenti"]) carica(`js/${f}.js`, ctx);
  carica("js/lingue/it.js", ctx);
  return { ctx, base };
}

const CAMPI_OGGETTI = ["nome", "strumento", "cosa", "quando", "dove", "come", "origine", "storia",
  "introduzione", "osservare", "curiosita", "altre", "aggiornato"];
const CAMPI_STRUMENTI = ["nome", "tipo", "luce", "anni", "cosa", "dove", "quando", "scoperte", "origine", "curiosita"];
const haParole = (x) => typeof x === "string" && /\p{L}/u.test(x);

function testiOggetto(o, prefisso, soloStelle) {
  const out = {};
  const metti = (k, v) => { if (haParole(v)) out[`${prefisso}/${k}`] = v; };
  if (!soloStelle) {
    for (const c of CAMPI_OGGETTI) metti(c, o[c]);
    (o.principali || []).forEach((l, i) => ["nome", "diametro", "scoperta", "testo", "origine"].forEach((c) => metti(`principali/${i}/${c}`, l[c])));
    (o.tabella || []).forEach((r, i) => r.forEach((v, j) => metti(`tabella/${i}/${j}`, v)));
    (o.foto || []).forEach((f, i) => metti(`foto/${i}/1`, f[1]));
    (o.paragrafi || []).forEach((p, i) => ["titolo", "testo"].forEach((c) => metti(`paragrafi/${i}/${c}`, p[c])));
  }
  (o.stelle || []).forEach((s, i) => ["nome", "significato"].forEach((c) => metti(`stelle/${i}/${c}`, s[c])));
  return out;
}

function dividi(elenco, parti) {
  const n = Math.ceil(elenco.length / parti);
  return Array.from({ length: parti }, (_, i) => elenco.slice(i * n, (i + 1) * n));
}

// Le parti in cui si divide il lavoro di traduzione.
function parti() {
  const { ctx, base } = datiItaliani();
  const P = {};
  P.ui = { ...ctx.TRADUZIONI.it.ui };
  const ids = (arr) => new Set(arr.map((o) => o.id));
  const cost = ids(ctx.COSTELLAZIONI), gal = ids(ctx.GALASSIE), lune = ids(ctx.LUNE), leg = ids(ctx.LEGGENDE);
  P.oggetti = {};
  for (const o of ctx.OGGETTI) if (base.has(o.id)) Object.assign(P.oggetti, testiOggetto(o, `oggetti/${o.id}`, false));
  // le stelle delle sei costellazioni di oggetti.js stanno con le costellazioni
  for (const k of Object.keys(P.oggetti)) if (k.includes("/stelle/")) delete P.oggetti[k];
  for (const [id, f] of Object.entries(ctx.FOTO)) for (const c of ["nome", "autore", "licenza"]) if (haParole(f[c])) P.oggetti[`foto/${id}/${c}`] = f[c];
  const costellazioni = ctx.OGGETTI.filter((o) => cost.has(o.id));
  dividi(costellazioni, 3).forEach((gruppo, i) => {
    P[`costellazioni-${i + 1}`] = {};
    for (const o of gruppo) Object.assign(P[`costellazioni-${i + 1}`], testiOggetto(o, `oggetti/${o.id}`, base.has(o.id)));
  });
  for (const [nome, insieme] of [["galassie", gal], ["lune", lune], ["leggende", leg]]) {
    P[nome] = {};
    for (const o of ctx.OGGETTI) if (insieme.has(o.id)) Object.assign(P[nome], testiOggetto(o, `oggetti/${o.id}`, false));
  }
  dividi(ctx.STRUMENTI, 2).forEach((gruppo, i) => {
    P[`strumenti-${i + 1}`] = {};
    for (const s of gruppo) for (const c of CAMPI_STRUMENTI) if (haParole(s[c])) P[`strumenti-${i + 1}`][`strumenti/${s.id}/${c}`] = s[c];
  });
  return P;
}

function lingueTradotte() {
  return fs.readdirSync(CARTELLA).filter((d) => d !== "it" && fs.statSync(path.join(CARTELLA, d)).isDirectory()).sort();
}

const segnaposti = (s) => (s.match(/\{\w+\}/g) || []).sort().join(",");
const etichette = (s) => (s.match(/<\/?\w+/g) || []).sort().join(",");

function controlla(codice, P) {
  const problemi = [];
  for (const [parte, testi] of Object.entries(P)) {
    const file = path.join(CARTELLA, codice, `${parte}.json`);
    if (!fs.existsSync(file)) { problemi.push(`${parte}: manca il file`); continue; }
    let tr;
    try { tr = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { problemi.push(`${parte}: JSON non valido (${e.message})`); continue; }
    const mancanti = Object.keys(testi).filter((k) => typeof tr[k] !== "string" || !tr[k].trim());
    const extra = Object.keys(tr).filter((k) => !(k in testi));
    if (mancanti.length) problemi.push(`${parte}: ${mancanti.length} testi mancanti (es. ${mancanti.slice(0, 3).join(", ")})`);
    if (extra.length) problemi.push(`${parte}: ${extra.length} chiavi in più (es. ${extra.slice(0, 3).join(", ")})`);
    for (const k of Object.keys(testi)) {
      if (typeof tr[k] !== "string") continue;
      if (segnaposti(testi[k]) !== segnaposti(tr[k])) problemi.push(`${parte}: ${k} ha segnaposti diversi: ${tr[k]}`);
      if (etichette(testi[k]) !== etichette(tr[k])) problemi.push(`${parte}: ${k} ha HTML diverso: ${tr[k]}`);
    }
  }
  return problemi;
}

const [comando, arg] = process.argv.slice(2);
const P = parti();
if (comando === "estrai") {
  fs.mkdirSync(path.join(CARTELLA, "it"), { recursive: true });
  for (const [parte, testi] of Object.entries(P)) {
    fs.writeFileSync(path.join(CARTELLA, "it", `${parte}.json`), JSON.stringify(testi, null, 1) + "\n");
    console.log(`${parte}: ${Object.keys(testi).length} testi, ${Object.values(testi).join("").length} caratteri`);
  }
} else if (comando === "controlla") {
  let tutto = true;
  for (const codice of arg ? [arg] : lingueTradotte()) {
    const problemi = controlla(codice, P);
    console.log(problemi.length ? `${codice}: ${problemi.length} problemi\n  ${problemi.join("\n  ")}` : `${codice}: tutto a posto`);
    if (problemi.length) tutto = false;
  }
  process.exit(tutto ? 0 : 1);
} else if (comando === "genera") {
  fs.mkdirSync(path.join(RADICE, "js", "lingue"), { recursive: true });
  for (const codice of lingueTradotte()) {
    const ui = {}, testi = {};
    for (const parte of Object.keys(P)) {
      const file = path.join(CARTELLA, codice, `${parte}.json`);
      if (!fs.existsSync(file)) continue;
      const tr = JSON.parse(fs.readFileSync(file, "utf8"));
      for (const k of Object.keys(P[parte])) {
        if (typeof tr[k] !== "string" || !tr[k].trim()) continue;
        if (parte === "ui") ui[k] = tr[k];
        else testi[k] = tr[k];
      }
    }
    const js = `// Generato da strumenti/lingue.js: non modificare a mano, si cambiano i file in strumenti/traduzioni/${codice}/.\n` +
      `TRADUZIONI[${JSON.stringify(codice)}] = ${JSON.stringify({ ui, testi })};\n`;
    fs.writeFileSync(path.join(RADICE, "js", "lingue", `${codice}.js`), js);
    console.log(`js/lingue/${codice}.js: ${Object.keys(ui).length} testi del menu, ${Object.keys(testi).length} testi delle schede, ${Math.round(js.length / 1024)} KB`);
  }
} else {
  console.log("Uso: node strumenti/lingue.js estrai | controlla [codice] | genera");
}
