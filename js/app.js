// Interfaccia dell'app: schermata "Stasera", elenco delle schede e scheda del singolo oggetto.

const stato = {
  luogo: leggiImpostazione("luogo") || CITTA.find((c) => c.nome === "Roma"),
  modoOra: "stasera", // "adesso", "stasera" oppure "scelta"
  oraScelta: null,
  filtro: "tutti",
};

function leggiImpostazione(chiave) {
  try {
    return JSON.parse(localStorage.getItem(chiave));
  } catch {
    return null;
  }
}

function salvaImpostazione(chiave, valore) {
  try {
    localStorage.setItem(chiave, JSON.stringify(valore));
  } catch {
    // Senza memoria locale l'app funziona lo stesso, ma non ricorda le scelte.
  }
}

const $ = (sel) => document.querySelector(sel);

function esc(testo) {
  return String(testo).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

function ora(data) {
  return data ? data.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }) : "non oggi";
}

function dataOsservazione() {
  if (stato.modoOra === "adesso") return new Date();
  if (stato.modoOra === "scelta" && stato.oraScelta) return stato.oraScelta;
  return oraStasera(stato.luogo);
}

// ---------- Stasera ----------

function disegnaLuna(angolo) {
  return `<svg class="luna-svg" viewBox="-52 -52 104 104" aria-hidden="true">
    <circle r="50" class="luna-ombra"/>
    <path d="${percorsoFaseLunare(angolo, 50)}" class="luna-luce"/>
  </svg>`;
}

function consiglioDellaSera(luna, sole) {
  if (sole.altezza > -6) return "C'è ancora luce: per vedere le stelle aspetta che il cielo diventi buio.";
  if (luna.altezza > 0 && luna.illuminata > 0.6)
    return "La Luna molto luminosa schiarisce il cielo: ottima serata per Luna e pianeti, meno per galassie e nebulose.";
  if (luna.altezza > 0 && luna.illuminata > 0.15)
    return "Punta il binocolo sulla Luna, lungo il confine tra luce e ombra: lì i crateri sono più evidenti.";
  return "La Luna non disturba: è il momento giusto per gli oggetti deboli, lontano dalle luci della città.";
}

function rigaOggetto(r) {
  const o = r.oggetto;
  const avviso = r.disturbatoDallaLuna ? `<span class="avviso">difficile con la Luna</span>` : "";
  return `<li><a class="riga" href="#scheda/${o.id}">
    <span class="riga-testo">
      <span class="riga-nome">${esc(o.nome)}</span>
      <span class="riga-dove">${direzione(r.azimut)}, ${altezzaInPugni(r.altezza)}</span>
    </span>
    <span class="riga-meta"><span class="etichetta etichetta-${o.categoria}">${CATEGORIE[o.categoria]}</span>
      <span class="strumento">${esc(o.strumento)}</span>${avviso}</span>
  </a></li>`;
}

function mostraStasera() {
  const data = dataOsservazione();
  const oss = osservatore(stato.luogo);
  const sole = infoSole(data, oss);
  const luna = infoLuna(data, oss);
  const visibili = cosaVedere(OGGETTI, data, stato.luogo);

  const giorno = data.toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" });
  const valoreInput = new Date(data.getTime() - data.getTimezoneOffset() * 60e3).toISOString().slice(0, 16);

  $("#contenuto").innerHTML = `
    <section class="pannello">
      <div class="quando">
        <div class="scelta-ora" role="group" aria-label="Momento dell'osservazione">
          <button data-modo="adesso" class="${stato.modoOra === "adesso" ? "attivo" : ""}">Adesso</button>
          <button data-modo="stasera" class="${stato.modoOra === "stasera" ? "attivo" : ""}">Stasera</button>
          <input type="datetime-local" id="ora-scelta" value="${valoreInput}" aria-label="Scegli data e ora">
        </div>
        <p class="sottotitolo">${esc(giorno)} alle ${ora(data)}, da ${esc(stato.luogo.nome)}</p>
      </div>
      <div class="effemeridi">
        <div><span class="dato">${ora(sole.tramonta)}</span><span class="nota">tramonto</span></div>
        <div><span class="dato">${ora(sole.buioCompleto)}</span><span class="nota">buio completo</span></div>
        <div><span class="dato">${ora(sole.sorge)}</span><span class="nota">alba</span></div>
      </div>
    </section>

    <section class="pannello luna-pannello">
      ${disegnaLuna(luna.angolo)}
      <div>
        <h2>${luna.fase}</h2>
        <p>Illuminata al ${Math.round(luna.illuminata * 100)}%. Sorge alle ${ora(luna.sorge)}, tramonta alle ${ora(luna.tramonta)}.</p>
        <p class="consiglio">${consiglioDellaSera(luna, sole)}</p>
      </div>
    </section>

    <section>
      <h2 class="titolo-sezione">Cosa puoi vedere</h2>
      ${visibili.length
        ? `<ul class="elenco">${visibili.map(rigaOggetto).join("")}</ul>`
        : `<p class="vuoto">In questo momento nessun oggetto delle schede è ben visibile. Prova con il pulsante "Stasera".</p>`}
      <p class="nota-pugni">Per misurare l'altezza: un pugno chiuso a braccio teso copre circa 10 gradi di cielo.</p>
    </section>`;

  document.querySelectorAll("[data-modo]").forEach((b) =>
    b.addEventListener("click", () => {
      stato.modoOra = b.dataset.modo;
      mostraStasera();
    })
  );
  $("#ora-scelta").addEventListener("change", (e) => {
    if (!e.target.value) return;
    stato.modoOra = "scelta";
    stato.oraScelta = new Date(e.target.value);
    mostraStasera();
  });
}

// ---------- Schede ----------

function mostraSchede() {
  const filtri = ["tutti", ...Object.keys(CATEGORIE)];
  const elenco = OGGETTI.filter((o) => stato.filtro === "tutti" || o.categoria === stato.filtro);
  $("#contenuto").innerHTML = `
    <div class="filtri" role="group" aria-label="Filtra per tipo">
      ${filtri.map((f) => `<button data-filtro="${f}" class="${stato.filtro === f ? "attivo" : ""}">${f === "tutti" ? "Tutti" : CATEGORIE[f]}</button>`).join("")}
    </div>
    <ul class="griglia">
      ${elenco.map((o) => `<li><a class="carta" href="#scheda/${o.id}">
        <span class="etichetta etichetta-${o.categoria}">${CATEGORIE[o.categoria]}</span>
        <span class="carta-nome">${esc(o.nome)}</span>
        <span class="carta-testo">${esc(o.cosa)}</span>
      </a></li>`).join("")}
    </ul>`;
  document.querySelectorAll("[data-filtro]").forEach((b) =>
    b.addEventListener("click", () => {
      stato.filtro = b.dataset.filtro;
      mostraSchede();
    })
  );
}

function mostraScheda(id) {
  const o = OGGETTI.find((x) => x.id === id);
  if (!o) return mostraSchede();
  const data = new Date();
  const pos = posizione(o, data, osservatore(stato.luogo));
  const adesso = pos.altezza > 0
    ? `Adesso è a ${direzione(pos.azimut)}, ${altezzaInPugni(pos.altezza)} (${Math.round(pos.altezza)}°).`
    : "Adesso è sotto l'orizzonte.";
  const voci = [
    ["Cos'è", o.cosa],
    ["Quando", o.quando],
    ["Dove", o.dove],
    ["Come osservarlo", o.come],
    ["Origine del nome", o.origine],
    ["Storia", o.storia],
  ];
  $("#contenuto").innerHTML = `
    <article class="scheda">
      <a class="indietro" href="#schede">‹ Tutte le schede</a>
      <span class="etichetta etichetta-${o.categoria}">${CATEGORIE[o.categoria]}</span>
      <h1>${esc(o.nome)}</h1>
      <p class="adesso">${adesso} Strumento consigliato: ${esc(o.strumento.toLowerCase())}.</p>
      ${voci.map(([t, testo]) => `<section><h2>${t}</h2><p>${esc(testo)}</p></section>`).join("")}
    </article>`;
  window.scrollTo(0, 0);
}

// ---------- Impostazioni del luogo ----------

function mostraLuogo() {
  $("#contenuto").innerHTML = `
    <section class="pannello">
      <h2>Da dove osservi?</h2>
      <p>I calcoli dipendono dal luogo. Puoi usare la posizione del telefono o scegliere la città più vicina.</p>
      <button id="usa-posizione" class="pulsante">Usa la mia posizione</button>
      <p id="esito-posizione" class="nota"></p>
      <label for="citta">Oppure scegli una città</label>
      <select id="citta">
        ${CITTA.map((c) => `<option ${c.nome === stato.luogo.nome ? "selected" : ""}>${esc(c.nome)}</option>`).join("")}
      </select>
    </section>`;
  $("#citta").addEventListener("change", (e) => {
    impostaLuogo(CITTA.find((c) => c.nome === e.target.value));
  });
  $("#usa-posizione").addEventListener("click", () => {
    const esito = $("#esito-posizione");
    if (!navigator.geolocation) {
      esito.textContent = "Questo dispositivo non fornisce la posizione: scegli una città.";
      return;
    }
    esito.textContent = "Cerco la posizione...";
    navigator.geolocation.getCurrentPosition(
      (p) => impostaLuogo({ nome: "la tua posizione", lat: p.coords.latitude, lon: p.coords.longitude }),
      () => (esito.textContent = "Posizione non disponibile: scegli una città dall'elenco."),
      { timeout: 15000, maximumAge: 3600e3 }
    );
  });
}

function impostaLuogo(luogo) {
  stato.luogo = luogo;
  salvaImpostazione("luogo", luogo);
  aggiornaIntestazione();
  location.hash = "#stasera";
}

function aggiornaIntestazione() {
  $("#luogo").textContent = stato.luogo.nome;
}

// ---------- Navigazione ----------

function instrada() {
  const [pagina, id] = location.hash.slice(1).split("/");
  document.querySelectorAll(".schede-nav a").forEach((a) =>
    a.classList.toggle("attivo", a.getAttribute("href") === `#${pagina === "scheda" ? "schede" : pagina || "stasera"}`)
  );
  if (pagina === "schede") mostraSchede();
  else if (pagina === "scheda") mostraScheda(id);
  else if (pagina === "luogo") mostraLuogo();
  else mostraStasera();
}

function impostaModoNotte(attivo) {
  document.documentElement.classList.toggle("notte", attivo);
  $("#modo-notte").setAttribute("aria-pressed", String(attivo));
  salvaImpostazione("notte", attivo);
}

window.addEventListener("hashchange", instrada);
window.addEventListener("DOMContentLoaded", () => {
  aggiornaIntestazione();
  impostaModoNotte(leggiImpostazione("notte") === true);
  $("#modo-notte").addEventListener("click", () =>
    impostaModoNotte(!document.documentElement.classList.contains("notte"))
  );
  instrada();
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("sw.js");
  }
});
