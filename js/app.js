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
        <img class="carta-immagine${FOTO[o.id] ? " carta-foto" : ""}" src="${FOTO[o.id] ? `images/foto/${o.id}.jpg` : `images/${o.id}.svg`}" alt="" loading="lazy" width="800" height="500">
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
      ${FOTO[o.id] ? `<figure class="scheda-immagine scheda-foto">
        <img src="images/foto/${o.id}.jpg" alt="Foto: ${esc(o.nome)}">
        <figcaption>Foto: ${esc(FOTO[o.id].autore)}. Licenza: ${esc(FOTO[o.id].licenza)}. <a href="${FOTO[o.id].fonte}" target="_blank" rel="noopener">Fonte</a></figcaption>
      </figure>` : ""}
      <figure class="scheda-immagine">
        <img src="images/${o.id}.svg" alt="${o.corpo ? "Disegno" : "Mappa del cielo"}: ${esc(o.nome)}" width="800" height="500">
        <figcaption>${o.corpo
          ? "Disegno illustrativo, non in scala."
          : "Mappa del cielo con le stelle vere. Dati: catalogo d3-celestial."}</figcaption>
      </figure>
      ${voci.map(([t, testo]) => `<section><h2>${t}</h2><p>${esc(testo)}</p></section>`).join("")}
    </article>`;
  window.scrollTo(0, 0);
}

// ---------- Manuale ----------

function mostraManuale() {
  $("#contenuto").innerHTML = `
    <section>
      <h1>Il manuale</h1>
      <p class="sottotitolo">Astronomia per poveri diavoli: tredici capitoli, uno per lezione del corso.</p>
      <ol class="elenco elenco-capitoli">
        ${CAPITOLI.map((c) => `<li><a class="riga" href="#capitolo/${c.numero}">
          <span class="riga-testo"><span class="riga-dove">Capitolo ${c.numero}</span>
          <span class="riga-nome">${esc(c.titolo)}</span></span>${capitoloLibero(c.numero) ? "" : `<span class="riga-meta">🔒</span>`}</a></li>`).join("")}
      </ol>
    </section>`;
}

async function mostraCapitolo(numero) {
  const i = CAPITOLI.findIndex((c) => c.numero === Number(numero));
  if (i < 0) return mostraManuale();
  if (!capitoloLibero(CAPITOLI[i].numero)) return mostraSblocco();
  const file = `manuale/${String(CAPITOLI[i].numero).padStart(2, "0")}.html`;
  $("#contenuto").innerHTML = `<p class="vuoto">Carico il capitolo...</p>`;
  let testo;
  try {
    const risposta = await fetch(file);
    if (!risposta.ok) throw new Error(risposta.status);
    testo = await risposta.text();
  } catch {
    testo = `<p class="vuoto">Non riesco a caricare il capitolo. Controlla la connessione e riprova.</p>`;
  }
  const prec = CAPITOLI[i - 1], succ = CAPITOLI[i + 1];
  $("#contenuto").innerHTML = `
    <article class="capitolo">
      <a class="indietro" href="#manuale">‹ Tutti i capitoli</a>
      ${testo}
      <nav class="capitolo-nav">
        ${prec ? `<a href="#capitolo/${prec.numero}">‹ Capitolo ${prec.numero}</a>` : "<span></span>"}
        ${succ ? `<a href="#capitolo/${succ.numero}">Capitolo ${succ.numero} ›</a>` : ""}
      </nav>
    </article>`;
  window.scrollTo(0, 0);
}

// ---------- Versione completa (attiva solo se VERSIONE_COMPLETA.attiva è true) ----------

function mostraSblocco() {
  $("#contenuto").innerHTML = `
    <section class="pannello">
      <h2>Questo capitolo fa parte della versione completa</h2>
      <p>La parte "Stasera", le schede e i primi ${VERSIONE_COMPLETA.capitoliGratis} capitoli sono sempre gratuiti.
        Con la versione completa, a ${esc(VERSIONE_COMPLETA.prezzo)} una volta sola, leggi tutto il manuale.</p>
      <p>Per avere il codice di sblocco scrivi a <a href="mailto:${EMAIL_SUPPORTO}?subject=${encodeURIComponent("Versione completa Cielo di Stasera")}">${EMAIL_SUPPORTO}</a>.</p>
      <label for="codice">Hai già un codice?</label>
      <input id="codice" autocomplete="off" autocapitalize="characters" placeholder="Scrivi il codice">
      <button id="prova-codice" class="pulsante">Sblocca</button>
      <p id="esito-codice" class="nota"></p>
    </section>`;
  $("#prova-codice").addEventListener("click", async () => {
    if (await provaCodice($("#codice").value)) location.hash = "#manuale";
    else $("#esito-codice").textContent = "Codice non valido. Controlla di averlo scritto bene.";
  });
}

// ---------- Aiuto ----------

const EMAIL_SUPPORTO = "dep.kit@gmail.com";

function mostraAiuto() {
  const oggetto = encodeURIComponent("Supporto Cielo di Stasera");
  $("#contenuto").innerHTML = `
    <article class="capitolo">
      <h1>Aiuto</h1>
      <section>
        <h2>Stasera</h2>
        <p>Ti dice a che ora tramonta il Sole, quando il cielo è buio davvero e come è la Luna.
          Sotto trovi cosa puoi vedere: la direzione (nord, sud, est, ovest) e l'altezza in "pugni".
          Un pugno chiuso a braccio teso copre circa 10 gradi di cielo: "2 pugni" vuol dire due pugni sopra l'orizzonte.</p>
        <p>Con i pulsanti in alto scegli <b>Adesso</b>, <b>Stasera</b> (quando fa buio) oppure un giorno e un'ora a piacere.</p>
      </section>
      <section>
        <h2>Il luogo</h2>
        <p>Tocca 📍 in alto e usa la posizione del telefono oppure scegli la città più vicina. L'app la ricorda.</p>
      </section>
      <section>
        <h2>Schede</h2>
        <p>Trenta oggetti del cielo: Luna, pianeti, stelle, costellazioni, ammassi e galassie.
          Per ognuno trovi cos'è, quando e dove guardare, con quale strumento, l'origine del nome e la sua storia.
          Tocca un oggetto nell'elenco di "Stasera" per aprire la sua scheda.</p>
      </section>
      <section>
        <h2>Manuale</h2>
        <p>Tredici capitoli, uno per ogni lezione del corso. Si leggono anche senza connessione.</p>
      </section>
      <section>
        <h2>Modalità notte</h2>
        <p>Il pulsante 🔴 <b>Notte</b> colora tutto di rosso: così lo schermo non ti abbaglia e l'occhio resta abituato al buio.</p>
      </section>
      <section>
        <h2>Installarla sul telefono</h2>
        <p>Su Android, dal menu del browser scegli "Installa app" o "Aggiungi a schermata Home".
          Su iPhone, in Safari tocca il pulsante Condividi e poi "Aggiungi alla schermata Home".
          Una volta installata funziona anche in campagna, senza rete.</p>
      </section>
      <section class="pannello">
        <h2>Serve aiuto?</h2>
        <p>Per domande, problemi o suggerimenti scrivi a
          <a href="mailto:${EMAIL_SUPPORTO}?subject=${oggetto}">${EMAIL_SUPPORTO}</a>.</p>
        <p class="nota">Cielo di Stasera, di Antonio Chitano. <i>Astronomia per poveri diavoli.</i></p>
      </section>
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
    a.classList.toggle("attivo", a.getAttribute("href") === `#${pagina === "scheda" ? "schede" : pagina === "capitolo" ? "manuale" : pagina || "stasera"}`)
  );
  if (pagina === "schede") mostraSchede();
  else if (pagina === "scheda") mostraScheda(id);
  else if (pagina === "manuale") mostraManuale();
  else if (pagina === "capitolo") mostraCapitolo(id);
  else if (pagina === "luogo") mostraLuogo();
  else if (pagina === "aiuto") mostraAiuto();
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
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
});
