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
      <p class="nota-pugni"><a href="#sistema-solare">🪐 Dove sono oggi i pianeti nel Sistema Solare</a></p>
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

const FILTRI_EMISFERO = {
  tutte: ["Tutte", () => true],
  italia: ["Si vedono dall'Italia", (o) => o.italia !== "no"],
  sud: ["Solo emisfero australe", (o) => o.italia === "no"],
  nord: ["Solo emisfero boreale", (o) => o.sud === "no"],
};

const VISIBILITA = { si: "si vede", parte: "in parte", no: "mai" };

function etichetteEmisferi(o) {
  if (!o.italia) return "";
  return `<span class="emisferi">
    <span class="emisfero emisfero-${o.italia}">Italia: ${VISIBILITA[o.italia]}</span>
    <span class="emisfero emisfero-${o.sud}">Australia e Sud America: ${VISIBILITA[o.sud]}</span>
  </span>`;
}

// Da dove viene una foto: autore, licenza e link alla pagina originale
function creditoFoto(f) {
  return `Foto: ${esc(f.autore)}. Licenza: ${esc(f.licenza)}.
    Presa da <a href="${f.fonte}" target="_blank" rel="noopener">${esc(f.sito)}</a>.`;
}

// La figura del mito disegnata sopra le stelle (disegni di Johan Meuris per Stellarium)
const CREDITO_FIGURE = `Disegno: Johan Meuris per Stellarium. Licenza: Free Art License.
  Preso da <a href="https://github.com/Stellarium/stellarium/tree/master/skycultures/modern" target="_blank" rel="noopener">Stellarium</a>.`;
const NOTA_FIGURA = {
  Ser: "Il Serpente è disegnato insieme a Ofiuco, che lo tiene tra le mani.",
  Pup: "Un tempo la Poppa era un pezzo della grande nave Argo, disegnata qui intera insieme a Carena e Vela.",
  Vel: "Un tempo la Vela era un pezzo della grande nave Argo, disegnata qui intera insieme a Carena e Poppa.",
  Car: "La Carena è un pezzo della grande nave Argo, disegnata qui intera insieme a Poppa e Vela.",
};

function figuraMito(o) {
  if (o.categoria !== "costellazione" || !o.sigla) return "";
  return `<figure class="scheda-immagine">
    <img src="images/costellazioni/figure/${o.sigla}.svg" alt="La figura del mito sopra le stelle: ${esc(o.nome)}" loading="lazy" width="800" height="500">
    <figcaption>Come immaginavano gli antichi questa costellazione: la figura tocca le stelle vere.
      ${NOTA_FIGURA[o.sigla] || ""} ${CREDITO_FIGURE}</figcaption>
  </figure>`;
}

function immagineCarta(o) {
  if (FOTO[o.id]) return `images/foto/${o.id}.jpg`;
  if (o.immagine !== undefined) return o.immagine;
  return `images/${o.id}.svg`;
}

function testoRicerca(o) {
  const stelle = (o.stelle || []).map((s) => s.nome).join(" ");
  return `${o.nome} ${o.latino || ""} ${o.sigla || ""} ${stelle}`.toLowerCase();
}

function mostraSchede() {
  const filtri = ["tutti", ...Object.keys(CATEGORIE)];
  const conEmisfero = stato.filtro === "costellazione" || stato.filtro === "galassia";
  $("#contenuto").innerHTML = `
    <div class="filtri" role="group" aria-label="Filtra per tipo">
      ${filtri.map((f) => `<button data-filtro="${f}" class="${stato.filtro === f ? "attivo" : ""}">${f === "tutti" ? "Tutti" : CATEGORIE_PLURALE[f]}</button>`).join("")}
    </div>
    ${conEmisfero ? `<p class="conteggio">Da dove si vedono:</p>
    <div class="filtri filtri-emisfero" role="group" aria-label="Filtra per emisfero">
      ${Object.entries(FILTRI_EMISFERO).map(([k, [nome]]) => `<button data-emisfero="${k}" class="${(stato.emisfero || "tutte") === k ? "attivo" : ""}">${nome}</button>`).join("")}
    </div>` : ""}
    <input type="search" id="cerca" class="cerca" placeholder="Cerca per nome (es. Orione, Sirio, Titano)" value="${esc(stato.cerca || "")}" aria-label="Cerca una scheda">
    ${stato.filtro === "pianeta" || stato.filtro === "tutti" ? `<a class="riquadro-ss" href="#sistema-solare"><span>🪐</span><span><b>Il Sistema Solare oggi</b><br>La mappa con dove si trovano adesso tutti gli otto pianeti</span></a>` : ""}
    <p class="conteggio" id="conteggio"></p>
    <ul class="griglia" id="griglia"></ul>`;
  disegnaGriglia();
  document.querySelectorAll("[data-filtro]").forEach((b) =>
    b.addEventListener("click", () => {
      stato.filtro = b.dataset.filtro;
      mostraSchede();
    })
  );
  document.querySelectorAll("[data-emisfero]").forEach((b) =>
    b.addEventListener("click", () => {
      stato.emisfero = b.dataset.emisfero;
      mostraSchede();
    })
  );
  $("#cerca").addEventListener("input", (e) => {
    stato.cerca = e.target.value;
    disegnaGriglia();
  });
}

function disegnaGriglia() {
  const cerca = (stato.cerca || "").trim().toLowerCase();
  const [, perEmisfero] = FILTRI_EMISFERO[stato.emisfero || "tutte"];
  const conEmisfero = stato.filtro === "costellazione" || stato.filtro === "galassia";
  // Con la ricerca si cerca in tutte le schede, senza filtri
  let elenco = cerca
    ? OGGETTI.filter((o) => testoRicerca(o).includes(cerca))
    : OGGETTI.filter((o) => stato.filtro === "tutti" || o.categoria === stato.filtro).filter((o) => !conEmisfero || perEmisfero(o));
  if (stato.filtro === "costellazione") elenco = [...elenco].sort((a, b) => a.nome.localeCompare(b.nome, "it"));
  $("#conteggio").textContent = elenco.length === 1 ? "1 scheda" : `${elenco.length} schede`;
  $("#griglia").innerHTML = elenco.map((o) => {
    const img = immagineCarta(o);
    return `<li><a class="carta" href="#scheda/${o.id}">
      ${img ? `<img class="carta-immagine${FOTO[o.id] ? " carta-foto" : ""}" src="${img}" alt="" loading="lazy" width="800" height="500">` : ""}
      <span class="etichetta etichetta-${o.categoria}">${CATEGORIE[o.categoria]}</span>
      <span class="carta-nome">${esc(o.nome)}</span>
      ${FOTO[o.id] ? `<span class="carta-credito">Foto: ${esc(FOTO[o.id].autore)} (${esc(FOTO[o.id].sito)})</span>` : ""}
      ${etichetteEmisferi(o)}
      <span class="carta-testo">${esc(o.cosa)}</span>
    </a></li>`;
  }).join("") || `<li class="vuoto">Nessuna scheda trovata.</li>`;
}

// Da dove si vede: testo per costellazioni e galassie
function testoVisibilita(o) {
  const parti = [];
  if (o.italia === "si") parti.push("Dall'Italia si vede tutta.");
  else if (o.italia === "parte") parti.push(`Dall'Italia se ne vede solo una parte, bassa sull'orizzonte sud.${o.sicilia === "si" ? " Dalla Sicilia e dal Sud Italia si vede quasi tutta." : ""}`);
  else parti.push(`Dall'Italia non sorge mai.${o.sicilia === "parte" ? " Dalla Sicilia e dal Sud Italia se ne intravede appena una parte, rasente l'orizzonte sud." : ""}`);
  if (o.sud === "si") parti.push("Dall'Australia e dal Sud America (per esempio Sydney, Buenos Aires, Santiago del Cile) si vede tutta.");
  else if (o.sud === "parte") parti.push("Dall'Australia e dal Sud America se ne vede solo una parte, bassa sull'orizzonte nord.");
  else parti.push("Dall'Australia e dal Sud America non sorge mai: è un oggetto del cielo del Nord.");
  return parti.join(" ");
}

function sezioneStelle(o) {
  if (!o.stelle || !o.stelle.length) return "";
  return `<section><h2>Le stelle principali</h2><ul class="stelle">
    ${o.stelle.map((s) => `<li><span class="stella-nome">${esc(s.nome)}</span>
      <span class="stella-dati">${esc(s.sigla)}, magnitudine ${String(s.mag).replace(".", ",")}</span>
      <br>${esc(s.significato)}</li>`).join("")}
  </ul></section>`;
}

function mostraScheda(id) {
  const o = OGGETTI.find((x) => x.id === id);
  if (!o) return mostraSchede();
  if (o.categoria === "lune") return mostraLune(o);
  if (o.categoria === "leggenda") return mostraLeggenda(o);
  const data = new Date();
  const pos = o.noi ? null : posizione(o, data, osservatore(stato.luogo));
  const maiDaQui = !o.corpo && 90 - Math.abs(stato.luogo.lat - o.dec) < 0;
  const adesso = o.noi
    ? "Non si cerca in cielo: è il pianeta che hai sotto i piedi, quello da cui guardiamo tutti gli altri."
    : pos.altezza > 0
    ? `Adesso è a ${direzione(pos.azimut)}, ${altezzaInPugni(pos.altezza)} (${Math.round(pos.altezza)}°).`
    : maiDaQui
      ? `Da ${esc(stato.luogo.nome)} non sorge mai: ${stato.luogo.lat > 0 ? "si vede dall'emisfero australe." : "si vede dall'emisfero boreale."}`
      : "Adesso è sotto l'orizzonte.";
  const voci = [
    ["Cos'è", o.cosa],
    ["Quando è visibile", o.quando],
    ["Dove", o.dove],
    ["Come osservarlo", o.come],
    ["Origine del nome", o.origine],
    ["Storia", o.storia],
  ];
  const mappa = o.immagine || `images/${o.id}.svg`;
  $("#contenuto").innerHTML = `
    <article class="scheda">
      <a class="indietro" href="#schede">‹ Tutte le schede</a>
      <span class="etichetta etichetta-${o.categoria}">${CATEGORIE[o.categoria]}</span>
      <h1>${esc(o.nome)}</h1>
      ${o.latino ? `<p class="sottotitolo">Nome latino: ${esc(o.latino)} (sigla ${esc(o.sigla)})</p>` : ""}
      ${etichetteEmisferi(o)}
      <p class="adesso">${adesso}${o.noi ? "" : ` Strumento consigliato: ${esc(o.strumento.toLowerCase())}.`}</p>
      ${maiDaQui || o.noi ? "" : `<a class="pulsante pulsante-trova" href="#trova/${esc(o.id)}">🧭 Guidami in cielo col telefono</a>`}
      ${FOTO[o.id] ? `<figure class="scheda-immagine scheda-foto">
        <img src="images/foto/${o.id}.jpg" alt="Foto: ${esc(o.nome)}">
        <figcaption>${creditoFoto(FOTO[o.id])}</figcaption>
      </figure>` : ""}
      <figure class="scheda-immagine">
        <img src="${mappa}" alt="${o.corpo || o.noi ? "Disegno" : "Mappa del cielo"}: ${esc(o.nome)}" width="800" height="500">
        <figcaption>${o.corpo || o.noi
          ? "Disegno illustrativo, non in scala."
          : "Mappa del cielo con le stelle vere. Dati: catalogo d3-celestial."}</figcaption>
      </figure>
      ${figuraMito(o)}
      ${o.categoria === "pianeta" ? figuraSistemaSolare(o.id) : ""}
      ${o.italia ? `<section><h2>Da dove si vede</h2><p>${testoVisibilita(o)}</p></section>` : ""}
      ${voci.map(([t, testo]) => `<section><h2>${t}</h2><p>${esc(testo)}</p></section>`).join("")}
      ${sezioneStelle(o)}
    </article>`;
  window.scrollTo(0, 0);
}

function mostraLune(o) {
  const tabella = o.tabella && o.tabella.length ? `<section><h2>Le altre lune con un nome</h2>
    <table class="tabella-lune">
      <thead><tr><th>Nome</th><th>Diametro (km)</th><th>Scoperta</th><th>Famiglia</th></tr></thead>
      <tbody>${o.tabella.map(([nome, diam, anno, gruppo]) => `<tr><td>${esc(nome)}</td><td>${esc(diam)}</td><td>${anno}</td><td>${esc(gruppo)}</td></tr>`).join("")}</tbody>
    </table>
    ${o.altre ? `<p class="nota">${esc(o.altre)}</p>` : ""}
  </section>` : (o.altre ? `<section><p class="nota">${esc(o.altre)}</p></section>` : "");
  $("#contenuto").innerHTML = `
    <article class="scheda">
      <a class="indietro" href="#schede">‹ Tutte le schede</a>
      <span class="etichetta etichetta-lune">${CATEGORIE.lune}</span>
      <h1>${esc(o.nome)}</h1>
      ${o.totale !== null ? `<p class="totale-lune">${o.totale} ${o.totale === 1 ? "luna" : "lune"}</p>
        <p class="nota">Lune conosciute${o.aggiornato ? ` a ${esc(o.aggiornato)}` : ""}. Fonte: NASA.</p>` : ""}
      ${FOTO[o.id] ? `<figure class="scheda-immagine scheda-foto"><img src="images/foto/${o.id}.jpg" alt="Foto: ${esc(FOTO[o.id].nome || o.nome)}">
        <figcaption>${creditoFoto(FOTO[o.id])}</figcaption></figure>` : ""}
      ${o.immagine ? `<figure class="scheda-immagine"><img src="${o.immagine}" alt="" width="800" height="500">
        <figcaption>${o.id === "lune-esopianeti" ? "Il Cigno e la Lira: qui guardava il telescopio spaziale Kepler, che ha trovato i due candidati più famosi." : "Disegno illustrativo, non in scala."}</figcaption></figure>` : ""}
      <section><h2>In breve</h2><p>${esc(o.introduzione)}</p></section>
      ${o.osservare ? `<section><h2>Come osservarle</h2><p>${esc(o.osservare)}</p></section>` : ""}
      ${o.principali.length ? `<section><h2>${o.id === "lune-esopianeti" ? "I candidati" : "Le lune principali"}</h2>
        ${o.principali.map((l) => `<div class="luna-principale">
          <h3>${esc(l.nome)}</h3>
          <p class="stella-dati">${[l.diametro && `Diametro: ${l.diametro}`, l.scoperta && `Scoperta: ${l.scoperta}`].filter(Boolean).map(esc).join(" · ")}</p>
          <p>${esc(l.testo)}</p>
          ${l.origine ? `<p><b>Il nome.</b> ${esc(l.origine)}</p>` : ""}
        </div>`).join("")}</section>` : ""}
      ${tabella}
      ${o.foto ? `<section><h2>Le foto</h2>
        ${o.foto.map(([id, testo]) => `<figure class="scheda-immagine scheda-foto">
          <img src="images/foto/${id}.jpg" alt="Foto: ${esc(FOTO[id].nome)}" loading="lazy">
          <figcaption>${esc(testo)} ${creditoFoto(FOTO[id])}</figcaption>
        </figure>`).join("")}</section>` : ""}
      ${o.curiosita ? `<section><h2>Curiosità</h2><p>${esc(o.curiosita)}</p></section>` : ""}
    </article>`;
  window.scrollTo(0, 0);
}

function mostraLeggenda(o) {
  const collegati = o.collegati.map((id) => OGGETTI.find((x) => x.id === id)).filter(Boolean);
  $("#contenuto").innerHTML = `
    <article class="scheda">
      <a class="indietro" href="#schede">‹ Tutte le schede</a>
      <span class="etichetta etichetta-leggenda">${CATEGORIE.leggenda}</span>
      <h1>${esc(o.nome)}</h1>
      <p class="sottotitolo">${esc(o.cosa)}</p>
      ${o.immagine ? `<figure class="scheda-immagine"><img src="${o.immagine}" alt="" width="800" height="500"></figure>` : ""}
      ${o.paragrafi.map((p) => `<section><h2>${esc(p.titolo)}</h2><p>${esc(p.testo)}</p></section>`).join("")}
      ${collegati.length ? `<section><h2>Le schede collegate</h2><p class="collegati">
        ${collegati.map((c) => `<a href="#scheda/${c.id}">${esc(c.nome)}</a>`).join("")}</p></section>` : ""}
    </article>`;
  window.scrollTo(0, 0);
}

// ---------- Manuale ----------

// Il manuale si apre con una password. Qui c'è solo la sua impronta (SHA-256), non la password.
// Una volta inserita resta valida su quel dispositivo.
// Nuova password: echo -n 'PASSWORD' | sha256sum, e si incolla l'impronta qui sotto.
const IMPRONTA_PASSWORD_MANUALE = "dafecc7450265fed7405975a26a66c74ff3bc8b1922ea8bd0543a6d8b37faa3b";

function manualeAperto() {
  return leggiImpostazione("manualeAperto") === true;
}

function mostraPasswordManuale(destinazione) {
  $("#contenuto").innerHTML = `
    <section class="pannello">
      <h2>Il manuale è riservato</h2>
      <p>Il manuale è per chi segue il corso. Scrivi la password che ti è stata data.</p>
      <label for="password-manuale">Password</label>
      <input id="password-manuale" type="password" autocomplete="current-password" autocapitalize="off" placeholder="Scrivi la password">
      <button id="apri-manuale" class="pulsante">Apri il manuale</button>
      <p id="esito-manuale" class="nota"></p>
    </section>`;
  const prova = async () => {
    const testo = $("#password-manuale").value.trim();
    if (testo && crypto.subtle) {
      const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(testo));
      const impronta = [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
      if (impronta === IMPRONTA_PASSWORD_MANUALE) {
        salvaImpostazione("manualeAperto", true);
        return destinazione();
      }
    }
    $("#esito-manuale").textContent = "Password sbagliata. Attenzione a maiuscole e simboli.";
  };
  $("#apri-manuale").addEventListener("click", prova);
  $("#password-manuale").addEventListener("keydown", (e) => e.key === "Enter" && prova());
}

function mostraManuale() {
  $("#contenuto").innerHTML = `
    <section>
      <h1>Il manuale</h1>
      <p class="sottotitolo">Astronomia per poveri diavoli: tredici capitoli, uno per lezione del corso.</p>
      <ol class="elenco elenco-capitoli">
        ${CAPITOLI.map((c) => `<li><a class="riga" href="#capitolo/${c.numero}">
          <span class="riga-testo"><span class="riga-dove">Capitolo ${c.numero}</span>
          <span class="riga-nome">${esc(c.titolo)}</span></span></a></li>`).join("")}
      </ol>
    </section>`;
}

async function mostraCapitolo(numero) {
  const i = CAPITOLI.findIndex((c) => c.numero === Number(numero));
  if (i < 0) return mostraManuale();
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

function riquadroVersione() {
  if (!VERSIONE_COMPLETA.attiva) return "";
  if (versioneCompletaSbloccata()) return `<p class="nota">Versione completa sbloccata. Grazie!</p>`;
  return `<p>Versione gratuita: ti restano ${apertureRimaste()} aperture su ${VERSIONE_COMPLETA.aperture}.
          <a href="#sblocca">Sblocca la versione completa</a> (${esc(VERSIONE_COMPLETA.prezzo)}).</p>`;
}

function mostraSblocco() {
  $("#contenuto").innerHTML = `
    <section class="pannello">
      <h2>${appBloccata() ? `Hai usato le ${VERSIONE_COMPLETA.aperture} aperture gratuite` : "La versione completa"}</h2>
      <p>${appBloccata() ? "Grazie per aver provato Cielo di Stasera! " : `La versione gratuita si apre ${VERSIONE_COMPLETA.aperture} volte (te ne restano ${apertureRimaste()}). `}Per continuare a usarla senza limiti c'è la versione completa,
        a ${esc(VERSIONE_COMPLETA.prezzo)} una volta sola.</p>
      <p>Per avere il codice di sblocco scrivi a <a href="mailto:${EMAIL_SUPPORTO}?subject=${encodeURIComponent("Versione completa Cielo di Stasera")}">${EMAIL_SUPPORTO}</a>.</p>
      <label for="codice">Hai già un codice?</label>
      <input id="codice" autocomplete="off" autocapitalize="characters" placeholder="Scrivi il codice">
      <button id="prova-codice" class="pulsante">Sblocca</button>
      <p id="esito-codice" class="nota"></p>
    </section>`;
  $("#prova-codice").addEventListener("click", async () => {
    if (await provaCodice($("#codice").value)) {
      $("#esito-codice").textContent = "Fatto! La versione completa è sbloccata. Grazie!";
      setTimeout(() => (location.hash = "#stasera"), 1200);
    } else $("#esito-codice").textContent = "Codice non valido. Controlla di averlo scritto bene.";
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
        <h2>Guidami in cielo</h2>
        <p>Nella scheda di una costellazione, una stella, un pianeta, la Luna, una galassia, un ammasso o una nebulosa tocca
          <b>🧭 Guidami in cielo col telefono</b>, poi <b>Avvia la guida</b> (sull'iPhone e sull'iPad conferma il permesso).
          Tieni il telefono davanti a te con lo schermo verso di te e segui le scritte: "gira a destra", "alza il telefono"...
          Quando ci sei, il telefono vibra e appare sopra il cielo la figura della costellazione, o la mappa con un cerchio sull'oggetto: allarga le dita o tocca ＋ per ingrandirla.
          Con 📷 vedi il cielo attraverso la fotocamera. Tieni lontani oggetti di metallo e calamite: disturbano la bussola.
          Se il dispositivo non ha la bussola, sotto trovi la direzione e l'altezza a parole.</p>
      </section>
      <section>
        <h2>Schede</h2>
        <p>Luna, pianeti, stelle, tutte le 88 costellazioni, galassie, ammassi e nebulose.
          Per ognuno trovi cos'è, quando e dove guardare, con quale strumento, l'origine del nome e la sua storia.
          Tocca un oggetto nell'elenco di "Stasera" per aprire la sua scheda.</p>
        <p>Per le schede di "Costellazioni" e "Galassie" è presente l'informazione se sono visibili dall'emisfero australe
          (Australia, Sud America etc.) o dall'emisfero boreale (Tutta l'Europa, Il Nordamerica e il Centroamerica etc. ):
          scegli "Costellazioni" o "Galassie" e poi un filtro per emisfero. Ci sono anche le lune di tutti i pianeti,
          quelle trovate attorno agli esopianeti di altre stelle e le leggende antiche sui nomi del cielo.
          Con la casella "Cerca" trovi subito una scheda.</p>
        <p><b>Piccola legenda;</b><br>
          L'emisfero boreale (o settentrionale) non è un fenomeno limitato a un singolo paese, ma è l'intera metà della Terra situata a nord dell'equatore.<br>
          L'emisfero australe (o meridionale) è l'intera metà della Terra che si trova a sud dell'Equatore</p>
      </section>
      <section>
        <h2>Strumenti</h2>
        <p>Quarantadue schede su telescopi, osservatori, satelliti e sonde: dal cannocchiale di Galileo al telescopio James Webb.
          Per ognuno trovi cos'è, dove si trova, cosa ha scoperto, l'origine del nome e qualche curiosità.</p>
      </section>
      <section>
        <h2>Modalità notte</h2>
        <p>Il pulsante 🔴 <b>Notte</b> colora tutto di rosso: così lo schermo non ti abbaglia e l'occhio resta abituato al buio.</p>
      </section>
      <section>
        <h2>Installazione su Smartphone</h2>
        <p>Su Android, dal menu del browser scegli "Installa app" o "Aggiungi a schermata Home".
          Su iPhone, in Safari tocca il pulsante Condividi e poi "Aggiungi alla schermata Home".
          Una volta installata, l'app funziona anche senza rete.</p>
      </section>
      <section id="crediti">
        <h2>Crediti immagini</h2>
        <p>Le foto vere degli oggetti non sono nostre: vengono da archivi pubblici che ne permettono l'uso,
          citando l'autore. Tocca il nome del sito per vedere la pagina originale.</p>
        <ul class="crediti">
          ${Object.entries(FOTO).map(([id, f]) => {
            const o = OGGETTI.find((x) => x.id === id);
            return `<li><b>${esc(f.nome || (o ? o.nome : id))}</b>: ${creditoFoto(f)}</li>`;
          }).join("")}
        </ul>
        <p>Le mappe del cielo sono disegnate dall'app con i dati delle stelle di
          <a href="https://github.com/ofrohn/d3-celestial" target="_blank" rel="noopener">d3-celestial</a> (Olaf Frohn, licenza BSD).
          I disegni di pianeti, galassie e nebulose sono illustrazioni fatte per l'app.
          Le figure del mito sopra le costellazioni sono i disegni di Johan Meuris per
          <a href="https://stellarium.org" target="_blank" rel="noopener">Stellarium</a> (licenza
          <a href="https://artlibre.org/licence/lal/en/" target="_blank" rel="noopener">Free Art License</a>).
          Le posizioni di Sole, Luna e pianeti sono calcolate con
          <a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noopener">Astronomy Engine</a> (Don Cross, licenza MIT).</p>
      </section>
      <section class="pannello">
        <h2>Serve aiuto?</h2>
        <p>Per domande, problemi o suggerimenti scrivi a
          <a href="mailto:${EMAIL_SUPPORTO}?subject=${oggetto}">${EMAIL_SUPPORTO}</a>.</p>
        ${riquadroVersione()}
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
  chiudiTrova();
  document.querySelectorAll(".schede-nav a").forEach((a) =>
    a.classList.toggle("attivo", a.getAttribute("href") === `#${pagina === "scheda" || pagina === "trova" || pagina === "sistema-solare" ? "schede" : pagina === "capitolo" ? "manuale" : pagina === "strumento" ? "strumenti" : pagina || "stasera"}`)
  );
  if (appBloccata() && pagina !== "aiuto") mostraSblocco();
  else if (pagina === "sblocca") mostraSblocco();
  else if (pagina === "schede") mostraSchede();
  else if (pagina === "scheda") mostraScheda(id);
  else if (pagina === "trova") mostraTrova(id);
  else if (pagina === "sistema-solare") mostraSistemaSolare();
  else if ((pagina === "manuale" || pagina === "capitolo") && !manualeAperto())
    mostraPasswordManuale(() => (pagina === "capitolo" ? mostraCapitolo(id) : mostraManuale()));
  else if (pagina === "manuale") mostraManuale();
  else if (pagina === "capitolo") mostraCapitolo(id);
  else if (pagina === "strumenti") mostraStrumenti();
  else if (pagina === "strumento") mostraStrumento(id);
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
  contaApertura();
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
