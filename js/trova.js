// "Trovala in cielo": col telefono puntato verso il cielo, la posizione (GPS), la bussola e
// l'inclinazione del telefono dicono dove girarsi e quanto alzare il telefono per trovare un oggetto.
// Quando ci sei, la figura della costellazione appare sopra il cielo vero, ingrandibile.

const GRADI = Math.PI / 180;

let trova = null; // stato della guida aperta, null quando è chiusa

// Declinazione magnetica: la bussola indica il Nord magnetico, che in Italia è 3-5 gradi a ovest del Nord vero.
// Stima semplice per l'Italia (2026); fuori dall'Italia non si corregge.
function declinazioneMagnetica(luogo) {
  if (luogo.lat < 35 || luogo.lat > 48 || luogo.lon < 5 || luogo.lon > 20) return 0;
  return 0.9 + 0.23 * luogo.lon;
}

// Direzione nel cielo come vettore: x verso Est, y verso Nord, z verso l'alto.
function vettoreCielo(azimut, altezza) {
  const a = azimut * GRADI, h = altezza * GRADI;
  return [Math.sin(a) * Math.cos(h), Math.cos(a) * Math.cos(h), Math.sin(h)];
}

// Matrice di rotazione del telefono (dalla specifica DeviceOrientation): porta le direzioni del
// telefono (x a destra, y verso l'alto dello schermo, z fuori dallo schermo) in quelle del cielo.
function matriceTelefono(alfa, beta, gamma) {
  const cX = Math.cos(beta * GRADI), sX = Math.sin(beta * GRADI);
  const cY = Math.cos(gamma * GRADI), sY = Math.sin(gamma * GRADI);
  const cZ = Math.cos(alfa * GRADI), sZ = Math.sin(alfa * GRADI);
  return [
    [cZ * cY - sZ * sX * sY, -cX * sZ, cY * sZ * sX + cZ * sY],
    [cY * sZ + cZ * sX * sY, cZ * cX, sZ * sY - cZ * cY * sX],
    [-cX * sY, sX, cX * cY],
  ];
}

// Da cielo a telefono: la matrice trasposta.
function nelTelefono(m, v) {
  return [0, 1, 2].map((j) => m[0][j] * v[0] + m[1][j] * v[1] + m[2][j] * v[2]);
}

// Proiezione stereografica sullo schermo (la stessa delle mappe): il centro dello schermo è
// la direzione in cui punta il dorso del telefono. Restituisce x a destra e y in basso, in pixel.
function sulloSchermo(d, scala) {
  const f = (2 * scala) / Math.max(1e-6, 1 - d[2]);
  const x = d[0] * f, y = d[1] * f;
  const a = ((screen.orientation && screen.orientation.angle) || window.orientation || 0) * GRADI;
  return { x: x * Math.cos(a) - y * Math.sin(a), y: -(x * Math.sin(a) + y * Math.cos(a)) };
}

function angoloTra(d) {
  return Math.acos(Math.max(-1, Math.min(1, -d[2]))) / GRADI;
}

// Prossima volta, entro un giorno, che l'oggetto sale abbastanza da vedersi.
function quandoSale(o, luogo, adesso) {
  const oss = osservatore(luogo);
  for (let minuti = 10; minuti <= 24 * 60; minuti += 10) {
    const t = new Date(adesso.getTime() + minuti * 60e3);
    if (posizione(o, t, oss).altezza >= altezzaMinima(o)) return t;
  }
  return null;
}

function mostraTrova(id) {
  const o = OGGETTI.find((x) => x.id === id);
  if (!o || !(o.corpo || o.ra !== undefined)) return mostraSchede();
  const centro = o.categoria === "costellazione" && o.sigla && CENTRI_MAPPE[o.sigla];
  $("#contenuto").innerHTML = `
    <section class="trova" id="trova">
      <video id="trova-video" class="trova-video" playsinline muted hidden></video>
      <div id="trova-cielo" class="trova-cielo">
        ${centro
          ? `<img id="trova-figura" class="trova-figura" src="images/costellazioni/figure/${o.sigla}.svg" alt="" width="800" height="500">`
          : `<div id="trova-bersaglio" class="trova-bersaglio"></div>`}
        <div id="trova-nome" class="trova-nome">${esc(o.nome)}</div>
      </div>
      <div class="trova-mirino" aria-hidden="true"></div>
      <div id="trova-freccia" class="trova-freccia" hidden aria-hidden="true">➤</div>
      <div class="trova-alto">
        <a class="pillola" href="#scheda/${esc(o.id)}">✕ Chiudi</a>
        <strong>${esc(o.nome)}</strong>
        <button id="trova-camera" class="pillola" aria-pressed="false">📷 Fotocamera</button>
      </div>
      <div class="trova-basso">
        <p id="trova-consiglio" class="trova-consiglio">Cerco la tua posizione...</p>
        <p id="trova-dove" class="trova-dove"></p>
        <div class="trova-comandi">
          <button id="trova-avvia" class="pulsante trova-avvia">🧭 Avvia la guida</button>
          <button id="trova-meno" class="pillola" aria-label="Rimpicciolisci">−</button>
          <button id="trova-piu" class="pillola" aria-label="Ingrandisci">＋</button>
        </div>
      </div>
    </section>`;

  trova = {
    o,
    centro,
    luogo: stato.luogo,
    gps: false,
    campo: 60, // gradi di cielo sul lato corto dello schermo; più piccolo = più ingrandito
    vettori: null, // direzioni nel cielo di oggetto e figura, ricalcolate ogni pochi secondi
    d: null, // direzioni nel telefono, smussate
    sensori: false,
    trovato: false,
    timer: setInterval(() => calcolaCielo(), 5000),
    pulizie: [],
  };

  chiediPosizione();
  calcolaCielo();
  aggiornaSchermo();

  $("#trova-avvia").addEventListener("click", avviaSensori);
  $("#trova-camera").addEventListener("click", alternaFotocamera);
  $("#trova-piu").addEventListener("click", () => zoom(1 / 1.4));
  $("#trova-meno").addEventListener("click", () => zoom(1.4));
  abilitaPizzico($("#trova"));
  window.scrollTo(0, 0);
}

function chiudiTrova() {
  if (!trova) return;
  clearInterval(trova.timer);
  trova.pulizie.forEach((f) => f());
  trova = null;
}

function zoom(fattore) {
  if (!trova) return;
  trova.campo = Math.max(10, Math.min(120, trova.campo * fattore));
  aggiornaSchermo();
}

// Due dita sullo schermo: allargando ingrandisci, stringendo rimpicciolisci.
function abilitaPizzico(el) {
  let distanza = null;
  const misura = (e) => Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
  el.addEventListener("touchstart", (e) => { if (e.touches.length === 2) distanza = misura(e); }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    if (e.touches.length !== 2 || !distanza) return;
    e.preventDefault();
    const nuova = misura(e);
    zoom(distanza / nuova);
    distanza = nuova;
  }, { passive: false });
  el.addEventListener("touchend", () => (distanza = null));
}

function chiediPosizione() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (p) => {
      if (!trova) return;
      const luogo = { nome: "la tua posizione", lat: p.coords.latitude, lon: p.coords.longitude };
      trova.luogo = luogo;
      trova.gps = true;
      stato.luogo = luogo;
      salvaImpostazione("luogo", luogo);
      aggiornaIntestazione();
      calcolaCielo();
      aggiornaSchermo();
    },
    () => {
      if (trova) aggiornaSchermo();
    },
    { timeout: 15000, maximumAge: 600e3, enableHighAccuracy: false }
  );
}

function calcolaCielo() {
  if (!trova) return;
  const { o, centro, luogo } = trova;
  const adesso = new Date();
  const oss = osservatore(luogo);
  const pos = posizione(o, adesso, oss);
  trova.pos = pos;
  trova.altSole = altezzaSole(adesso, oss);
  trova.sale = pos.altezza < altezzaMinima(o) ? quandoSale(o, luogo, adesso) : null;
  const vettori = { oggetto: vettoreCielo(pos.azimut, pos.altezza) };
  if (centro) {
    // Il centro della mappa e un punto un grado più a Nord: servono a mettere la figura dritta.
    const c = posizione({ ra: centro[0], dec: centro[1] }, adesso, oss);
    const n = posizione({ ra: centro[0], dec: Math.min(89.9, centro[1] + 1) }, adesso, oss);
    vettori.centro = vettoreCielo(c.azimut, c.altezza);
    vettori.nord = vettoreCielo(n.azimut, n.altezza);
  }
  trova.vettori = vettori;
  if (!trova.sensori) aggiornaSchermo();
}

async function avviaSensori() {
  const bottone = $("#trova-avvia");
  if (typeof DeviceOrientationEvent === "undefined") return senzaSensori();
  // Su iPhone e iPad il permesso si chiede con un tocco.
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    try {
      if ((await DeviceOrientationEvent.requestPermission()) !== "granted") return senzaSensori("permesso");
    } catch {
      return senzaSensori("permesso");
    }
  }
  bottone.hidden = true;
  $("#trova-consiglio").textContent = "Tieni il telefono davanti a te, con lo schermo verso di te...";
  const assoluto = "ondeviceorientationabsolute" in window;
  const evento = assoluto ? "deviceorientationabsolute" : "deviceorientation";
  const ascolta = (e) => {
    if (!trova || e.beta === null) return;
    let alfa;
    if (typeof e.webkitCompassHeading === "number" && e.webkitCompassHeading >= 0) alfa = 360 - e.webkitCompassHeading;
    else if (e.absolute || assoluto) alfa = e.alpha;
    else return; // senza bussola la direzione non si può sapere
    if (alfa === null) return;
    alfa -= declinazioneMagnetica(trova.luogo);
    trova.sensori = true;
    nuovoOrientamento(matriceTelefono(alfa, e.beta, e.gamma));
  };
  window.addEventListener(evento, ascolta);
  trova.pulizie.push(() => window.removeEventListener(evento, ascolta));
  tieniAcceso();
  setTimeout(() => {
    if (trova && !trova.sensori) senzaSensori("bussola");
  }, 3000);
}

function senzaSensori(motivo) {
  if (!trova) return;
  const testi = {
    permesso: "Senza il permesso di usare i sensori non posso guidarti: segui le indicazioni qui sotto.",
    bussola: "Questo dispositivo non fa usare la bussola al browser: segui le indicazioni qui sotto.",
  };
  trova.messaggio = testi[motivo] || "Questo dispositivo non ha la bussola: segui le indicazioni qui sotto.";
  $("#trova-avvia").hidden = true;
  aggiornaSchermo();
}

// Lo schermo non si spegne mentre cerchi.
async function tieniAcceso() {
  try {
    const blocco = await navigator.wakeLock.request("screen");
    trova.pulizie.push(() => blocco.release());
  } catch {
    // Non tutti i browser lo permettono: pazienza.
  }
}

async function alternaFotocamera() {
  const video = $("#trova-video");
  const bottone = $("#trova-camera");
  if (video.srcObject) {
    video.srcObject.getTracks().forEach((t) => t.stop());
    video.srcObject = null;
    video.hidden = true;
    bottone.setAttribute("aria-pressed", "false");
    return;
  }
  try {
    const flusso = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
    if (!trova) return flusso.getTracks().forEach((t) => t.stop());
    video.srcObject = flusso;
    video.hidden = false;
    await video.play();
    bottone.setAttribute("aria-pressed", "true");
    trova.pulizie.push(() => flusso.getTracks().forEach((t) => t.stop()));
  } catch {
    $("#trova-dove").textContent = "La fotocamera non è disponibile. La guida funziona lo stesso.";
  }
}

// Le direzioni cambiano a ogni piccolo movimento della mano: si smussano un po'.
function nuovoOrientamento(m) {
  const v = trova.vettori;
  const nuovi = {};
  for (const k in v) nuovi[k] = nelTelefono(m, v[k]);
  if (!trova.d) trova.d = nuovi;
  else for (const k in nuovi) trova.d[k] = trova.d[k].map((x, i) => x + 0.3 * (nuovi[k][i] - x));
  // Dove punta il dorso del telefono, nel cielo: (0, 0, -1) del telefono.
  trova.punta = {
    azimut: (Math.atan2(-m[0][2], -m[1][2]) / GRADI + 360) % 360,
    altezza: Math.asin(Math.max(-1, Math.min(1, -m[2][2]))) / GRADI,
  };
  aggiornaSchermo();
}

function testoGira(gradi) {
  const g = Math.abs(Math.round(gradi));
  const verso = gradi > 0 ? "destra" : "sinistra";
  if (g > 150) return "Girati: è alle tue spalle";
  if (g > 60) return `Gira molto a ${verso}`;
  if (g > 15) return `Gira a ${verso}`;
  return `Gira un poco a ${verso}`;
}

function testoAlza(gradi) {
  const g = Math.abs(Math.round(gradi));
  const verso = gradi > 0 ? "alza" : "abbassa";
  if (g > 40) return `${verso} molto il telefono`;
  if (g > 10) return `${verso} il telefono`;
  return `${verso} un poco il telefono`;
}

function aggiornaSchermo() {
  if (!trova || !document.getElementById("trova")) return;
  const { o, pos, luogo } = trova;
  if (!pos) return;

  // Indicazioni a parole: valgono anche senza sensori.
  const altezza = pos.altezza < 0 ? "sotto l'orizzonte" : altezzaInPugni(pos.altezza);
  const dove = `${direzione(pos.azimut)} (azimut ${Math.round(pos.azimut)}°), ${altezza} (${Math.round(pos.altezza)}°).`;
  let avviso = "";
  if (pos.altezza < 0) avviso = trova.sale ? ` Sale verso le ${ora(trova.sale)}.` : "";
  else if (pos.altezza < altezzaMinima(o)) avviso = " Sta molto in basso: serve un orizzonte libero.";
  if (trova.altSole > -6 && o.corpo !== "Moon") avviso += " C'è ancora troppa luce: aspetta il buio.";
  const fonte = trova.gps ? "posizione dal GPS" : `posizione: ${luogo.nome}`;
  $("#trova-dove").textContent = `Guarda verso ${dove}${avviso} (${fonte})`;

  const consiglio = $("#trova-consiglio");
  const freccia = $("#trova-freccia");
  const cielo = $("#trova-cielo");
  if (!trova.sensori || !trova.d) {
    freccia.hidden = true;
    cielo.hidden = false;
    disegnaVistaFissa();
    consiglio.textContent = trova.messaggio
      || `Tocca "Avvia la guida" e tieni il telefono davanti a te, con lo schermo verso di te.`;
    return;
  }

  const d = trova.d.oggetto;
  const distanza = angoloTra(d);
  const w = window.innerWidth, h = window.innerHeight;
  const scala = Math.min(w, h) / 2 / (2 * Math.tan((trova.campo / 2) * GRADI / 2));
  const p = sulloSchermo(d, scala);

  // Freccia verso l'oggetto quando non è vicino al centro dello schermo.
  const vicino = distanza < 10;
  const visibile = d[2] < 0 && Math.abs(p.x) < w / 2 && Math.abs(p.y) < h / 2;
  freccia.hidden = vicino;
  if (!vicino) freccia.style.transform = `translate(-50%, -50%) rotate(${Math.atan2(p.y, p.x) / GRADI}deg)`;

  if (vicino) {
    consiglio.textContent = `Ci sei! ${o.nome} è davanti a te. Allarga le dita o tocca ＋ per ingrandire.`;
    if (!trova.trovato && navigator.vibrate) navigator.vibrate(150);
    trova.trovato = true;
  } else {
    trova.trovato = false;
    const dAz = ((pos.azimut - trova.punta.azimut + 540) % 360) - 180;
    const dAlt = pos.altezza - trova.punta.altezza;
    const parti = [];
    if (Math.abs(dAz) > 5 && Math.abs(pos.altezza) < 80) parti.push(testoGira(dAz));
    if (Math.abs(dAlt) > 5) parti.push(testoAlza(dAlt));
    const frase = parti.join(" e ") || "Ci sei quasi";
    consiglio.textContent = frase.charAt(0).toUpperCase() + frase.slice(1) + ".";
  }

  cielo.hidden = !visibile && distanza > 60;
  posizionaFigura(scala);
}

// Mette la figura (o il cerchio) dove si trova nel cielo, dritta come le stelle vere.
function posizionaFigura(scala) {
  const d = trova.d;
  const p = sulloSchermo(d.oggetto, scala);
  const nome = $("#trova-nome");
  if (trova.centro) {
    const c = sulloSchermo(d.centro, scala);
    const n = sulloSchermo(d.nord, scala);
    const rotazione = Math.atan2(n.x - c.x, -(n.y - c.y)) / GRADI;
    // La mappa è larga 800 punti per trova.centro[2] gradi, in proiezione stereografica come lo schermo.
    const scalaMappa = 400 / (2 * Math.tan((trova.centro[2] / 2) * GRADI / 2));
    const larghezza = 800 * (scala / scalaMappa);
    const figura = $("#trova-figura");
    figura.style.width = `${larghezza}px`;
    figura.style.transform = `translate(-50%, -50%) translate(${c.x}px, ${c.y}px) rotate(${rotazione}deg)`;
  } else {
    $("#trova-bersaglio").style.transform = `translate(-50%, -50%) translate(${p.x}px, ${p.y}px)`;
  }
  nome.style.transform = `translate(-50%, 0) translate(${p.x}px, ${p.y + 30}px)`;
}

// Senza sensori: la figura ferma al centro, dritta con il Nord in alto, ingrandibile.
function disegnaVistaFissa() {
  const w = window.innerWidth, h = window.innerHeight;
  const scala = Math.min(w, h) / 2 / (2 * Math.tan((trova.campo / 2) * GRADI / 2));
  if (trova.centro) {
    const scalaMappa = 400 / (2 * Math.tan((trova.centro[2] / 2) * GRADI / 2));
    const figura = $("#trova-figura");
    figura.style.width = `${800 * (scala / scalaMappa)}px`;
    figura.style.transform = "translate(-50%, -50%)";
  } else {
    $("#trova-bersaglio").style.transform = "translate(-50%, -50%)";
  }
  $("#trova-nome").style.transform = "translate(-50%, 0) translate(0, 30px)";
}

window.addEventListener("resize", () => trova && aggiornaSchermo());
