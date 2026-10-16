// Lingue dell'app: la lingua scelta, i testi dell'interfaccia (t) e le traduzioni delle schede.
// I testi italiani dell'interfaccia sono in js/lingue/it.js; le altre lingue in js/lingue/<codice>.js,
// generati da strumenti/genera_lingue.py a partire da strumenti/traduzioni/<codice>/*.json.
// Le schede sono scritte in italiano nei file dei dati: una lingua diversa le sovrascrive all'avvio.

const LINGUE = [
  { codice: "it", nome: "Italiano", locale: "it-IT" },
  { codice: "en", nome: "English", locale: "en-GB" },
  { codice: "fr", nome: "Français", locale: "fr-FR" },
  { codice: "de", nome: "Deutsch", locale: "de-DE" },
  { codice: "nl", nome: "Nederlands", locale: "nl-NL" },
  { codice: "sv", nome: "Svenska", locale: "sv-SE" },
  { codice: "no", nome: "Norsk", locale: "nb-NO", lang: "nb" },
  { codice: "fi", nome: "Suomi", locale: "fi-FI" },
  { codice: "ru", nome: "Русский", locale: "ru-RU" },
  { codice: "es", nome: "Español", locale: "es-ES" },
  { codice: "pt", nome: "Português", locale: "pt-PT" },
  { codice: "el", nome: "Ελληνικά", locale: "el-GR" },
  { codice: "zh", nome: "中文", locale: "zh-CN" },
  { codice: "ja", nome: "日本語", locale: "ja-JP" },
  { codice: "ar", nome: "العربية", locale: "ar-u-nu-latn", rtl: true },
];

// Cambia a ogni pubblicazione con traduzioni nuove, per non prendere dal browser un file vecchio.
const VERSIONE_LINGUE = "1";

const TRADUZIONI = {};

let LINGUA = (() => {
  try {
    const c = JSON.parse(localStorage.getItem("lingua"));
    return LINGUE.some((l) => l.codice === c) ? c : null;
  } catch {
    return null;
  }
})();

function linguaAttiva() {
  return LINGUE.find((l) => l.codice === (LINGUA || "it"));
}

// Il "locale" per date, ore e numeri nella lingua scelta.
function locale() {
  return linguaAttiva().locale;
}

// Testo dell'interfaccia nella lingua scelta, con i valori al posto di {nome}. Se manca, vale l'italiano.
function t(chiave, valori) {
  const tr = TRADUZIONI[LINGUA || "it"];
  let testo = (tr && tr.ui && tr.ui[chiave]) ?? TRADUZIONI.it.ui[chiave] ?? chiave;
  if (valori) testo = testo.replace(/\{(\w+)\}/g, (m, k) => (k in valori ? valori[k] : m));
  return testo;
}

// Numero con la virgola o il punto secondo la lingua.
function numero(n, cifre = 2) {
  return Number(n).toLocaleString(locale(), { maximumFractionDigits: cifre });
}

// Carica il file della lingua scelta (l'italiano è già dentro l'app) e traduce le schede.
function caricaLingua() {
  const codice = LINGUA || "it";
  document.documentElement.lang = linguaAttiva().lang || codice;
  document.documentElement.dir = linguaAttiva().rtl ? "rtl" : "ltr";
  if (codice === "it") return Promise.resolve();
  return new Promise((fatto) => {
    const s = document.createElement("script");
    s.src = `js/lingue/${codice}.js?v=${VERSIONE_LINGUE}`;
    s.onload = () => {
      applicaTraduzioni(TRADUZIONI[codice]);
      fatto();
    };
    s.onerror = () => fatto(); // senza rete e senza copia salvata resta l'italiano
    document.head.appendChild(s);
  });
}

// Le traduzioni delle schede sono coppie "raccolta/id/campo/..." → testo.
function applicaTraduzioni(tr) {
  if (!tr || !tr.testi) return;
  const raccolte = {
    oggetti: (id) => OGGETTI.find((o) => o.id === id),
    strumenti: (id) => STRUMENTI.find((s) => s.id === id),
    foto: (id) => FOTO[id],
  };
  for (const o of OGGETTI) o.nomeItaliano = o.nome;
  for (const [percorso, testo] of Object.entries(tr.testi)) {
    if (typeof testo !== "string" || !testo) continue;
    const [raccolta, id, ...campi] = percorso.split("/");
    let dove = raccolte[raccolta] && raccolte[raccolta](id);
    for (let i = 0; dove && i < campi.length - 1; i++) dove = dove[campi[i]];
    if (dove && typeof dove === "object" && campi.length) dove[campi[campi.length - 1]] = testo;
  }
}

function scegliLingua(codice) {
  try {
    localStorage.setItem("lingua", JSON.stringify(codice));
  } catch {
    // Senza memoria locale la lingua vale solo per questa volta.
  }
}

// Mette i testi tradotti negli elementi della pagina con data-t (e data-t-title).
function traduciPagina() {
  document.querySelectorAll("[data-t]").forEach((el) => (el.textContent = t(el.dataset.t)));
  document.querySelectorAll("[data-t-title]").forEach((el) => (el.title = t(el.dataset.tTitle)));
  document.querySelectorAll("[data-t-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.tAria)));
}

// Al primo avvio la lingua non è ancora scelta: il titolo e la frase della pagina si scrivono
// nella lingua del dispositivo (se è una delle nostre), altrimenti in inglese.
const TITOLO_LINGUA = "Lingua · Language · Langue · Sprache · Idioma · Язык · 语言 · 言語 · اللغة";

const ISTRUZIONI_LINGUA = {
  it: "Benvenuto! Tocca la tua lingua. Potrai cambiarla quando vuoi con il pulsante 🌐 in alto.",
  en: "Welcome! Tap your language. You can change it at any time with the 🌐 button at the top.",
  fr: "Bienvenue ! Touchez votre langue. Vous pourrez la changer à tout moment avec le bouton 🌐 en haut.",
  de: "Willkommen! Tippe auf deine Sprache. Du kannst sie jederzeit mit der Schaltfläche 🌐 oben ändern.",
  nl: "Welkom! Tik op je taal. Je kunt die altijd wijzigen met de knop 🌐 bovenaan.",
  sv: "Välkommen! Tryck på ditt språk. Du kan byta det när du vill med knappen 🌐 högst upp.",
  no: "Velkommen! Trykk på språket ditt. Du kan bytte det når som helst med knappen 🌐 øverst.",
  fi: "Tervetuloa! Napauta kieltäsi. Voit vaihtaa sen milloin tahansa ylhäällä olevasta 🌐-painikkeesta.",
  ru: "Добро пожаловать! Нажмите на свой язык. Его можно сменить в любой момент кнопкой 🌐 вверху.",
  es: "¡Bienvenido! Toca tu idioma. Podrás cambiarlo cuando quieras con el botón 🌐 de arriba.",
  pt: "Bem-vindo! Toque no seu idioma. Pode mudá-lo quando quiser com o botão 🌐 no topo.",
  el: "Καλώς ήρθατε! Πατήστε τη γλώσσα σας. Μπορείτε να την αλλάξετε όποτε θέλετε με το κουμπί 🌐 επάνω.",
  zh: "欢迎！请点击您的语言。您可以随时通过顶部的 🌐 按钮更改语言。",
  ja: "ようこそ！言語をタップしてください。上の 🌐 ボタンでいつでも変更できます。",
  ar: "مرحبًا! اضغط على لغتك. يمكنك تغييرها في أي وقت من زر 🌐 في الأعلى.",
};

function linguaDelDispositivo() {
  for (const l of navigator.languages || [navigator.language || ""]) {
    const c = String(l).slice(0, 2).toLowerCase();
    const codice = c === "nb" || c === "nn" ? "no" : c;
    if (LINGUE.some((x) => x.codice === codice)) return codice;
  }
  return "en";
}
