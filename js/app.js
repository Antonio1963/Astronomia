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
  return data ? data.toLocaleTimeString(locale(), { hour: "2-digit", minute: "2-digit" }) : t("non oggi");
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
  if (sole.altezza > -6) return t("consiglio.luce");
  if (luna.altezza > 0 && luna.illuminata > 0.6) return t("consiglio.lunaPiena");
  if (luna.altezza > 0 && luna.illuminata > 0.15) return t("consiglio.binocolo");
  return t("consiglio.buio");
}

function rigaOggetto(r) {
  const o = r.oggetto;
  const avviso = r.disturbatoDallaLuna ? `<span class="avviso">${t("difficile con la Luna")}</span>` : "";
  return `<li><a class="riga" href="#scheda/${o.id}">
    <span class="riga-testo">
      <span class="riga-nome">${esc(o.nome)}</span>
      <span class="riga-dove">${direzione(r.azimut)}, ${altezzaInPugni(r.altezza)}</span>
    </span>
    <span class="riga-meta"><span class="etichetta etichetta-${o.categoria}">${nomeCategoria(o.categoria)}</span>
      <span class="strumento">${esc(o.strumento)}</span>${avviso}</span>
  </a></li>`;
}

function mostraStasera() {
  const data = dataOsservazione();
  const oss = osservatore(stato.luogo);
  const sole = infoSole(data, oss);
  const luna = infoLuna(data, oss);
  const visibili = cosaVedere(OGGETTI, data, stato.luogo);

  const giorno = data.toLocaleDateString(locale(), { weekday: "long", day: "numeric", month: "long" });
  const valoreInput = new Date(data.getTime() - data.getTimezoneOffset() * 60e3).toISOString().slice(0, 16);

  $("#contenuto").innerHTML = `
    <section class="pannello">
      <div class="quando">
        <div class="scelta-ora" role="group" aria-label="${t("Momento dell'osservazione")}">
          <button data-modo="adesso" class="${stato.modoOra === "adesso" ? "attivo" : ""}">${t("Adesso")}</button>
          <button data-modo="stasera" class="${stato.modoOra === "stasera" ? "attivo" : ""}">${t("Stasera")}</button>
          <input type="datetime-local" id="ora-scelta" value="${valoreInput}" aria-label="${t("Scegli data e ora")}">
        </div>
        <p class="sottotitolo">${t("stasera.quando", { giorno: esc(giorno), ora: ora(data), luogo: esc(nomeLuogo(stato.luogo)) })}</p>
      </div>
      <div class="effemeridi">
        <div><span class="dato">${ora(sole.tramonta)}</span><span class="nota">${t("tramonto")}</span></div>
        <div><span class="dato">${ora(sole.buioCompleto)}</span><span class="nota">${t("buio completo")}</span></div>
        <div><span class="dato">${ora(sole.sorge)}</span><span class="nota">${t("alba")}</span></div>
      </div>
    </section>

    <section class="pannello luna-pannello">
      ${disegnaLuna(luna.angolo)}
      <div>
        <h2>${luna.fase}</h2>
        <p>${t("luna.dati", { percento: Math.round(luna.illuminata * 100), sorge: ora(luna.sorge), tramonta: ora(luna.tramonta) })}</p>
        <p class="consiglio">${consiglioDellaSera(luna, sole)}</p>
      </div>
    </section>

    <section>
      <h2 class="titolo-sezione">${t("Cosa puoi vedere")}</h2>
      ${visibili.length
        ? `<ul class="elenco">${visibili.map(rigaOggetto).join("")}</ul>`
        : `<p class="vuoto">${t("stasera.vuoto")}</p>`}
      <p class="nota-pugni"><a href="#sistema-solare">🪐 ${t("Dove sono oggi i pianeti nel Sistema Solare")}</a></p>
      <p class="nota-pugni">${t("stasera.pugno")}</p>
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
  tutte: ["filtro.tutte", () => true],
  italia: ["filtro.italia", (o) => o.italia !== "no"],
  sud: ["filtro.sud", (o) => o.italia === "no"],
  nord: ["filtro.nord", (o) => o.sud === "no"],
};

function etichetteEmisferi(o) {
  if (!o.italia) return "";
  return `<span class="emisferi">
    <span class="emisfero emisfero-${o.italia}">${t("emisfero.italia", { vede: t("visibilita." + o.italia) })}</span>
    <span class="emisfero emisfero-${o.sud}">${t("emisfero.sud", { vede: t("visibilita." + o.sud) })}</span>
  </span>`;
}

function nomeCategoria(c) {
  return t("categoria." + c);
}

// Il luogo scelto: "la tua posizione" si scrive nella lingua dell'app.
function nomeLuogo(luogo) {
  return luogo.gps || luogo.nome === "la tua posizione" ? t("la tua posizione") : luogo.nome;
}

// Da dove viene una foto: autore, licenza e link alla pagina originale
function creditoFoto(f) {
  return t("credito.foto", { autore: esc(f.autore), licenza: esc(f.licenza),
    sito: `<a href="${f.fonte}" target="_blank" rel="noopener">${esc(f.sito)}</a>` });
}

// La figura del mito disegnata sopra le stelle (disegni di Johan Meuris per Stellarium)
const CREDITO_FIGURE = () => t("credito.figure", { sito: `<a href="https://github.com/Stellarium/stellarium/tree/master/skycultures/modern" target="_blank" rel="noopener">Stellarium</a>` });
const NOTA_FIGURA = ["Ser", "Pup", "Vel", "Car"];

function figuraMito(o) {
  if (o.categoria !== "costellazione" || !o.sigla) return "";
  return `<figure class="scheda-immagine">
    <img src="images/costellazioni/figure/${o.sigla}.svg" alt="${t("figura.alt", { nome: esc(o.nome) })}" loading="lazy" width="800" height="500">
    <figcaption>${t("figura.didascalia")}
      ${NOTA_FIGURA.includes(o.sigla) ? t("figura.nota." + o.sigla) : ""} ${CREDITO_FIGURE()}</figcaption>
  </figure>`;
}

function immagineCarta(o) {
  if (FOTO[o.id]) return `images/foto/${o.id}.jpg`;
  if (o.immagine !== undefined) return o.immagine;
  return `images/${o.id}.svg`;
}

function testoRicerca(o) {
  const stelle = (o.stelle || []).map((s) => s.nome).join(" ");
  return `${o.nome} ${o.nomeItaliano || ""} ${o.latino || ""} ${o.sigla || ""} ${stelle}`.toLowerCase();
}

function mostraSchede() {
  const filtri = ["tutti", ...Object.keys(CATEGORIE)];
  const conEmisfero = stato.filtro === "costellazione" || stato.filtro === "galassia";
  $("#contenuto").innerHTML = `
    <div class="filtri" role="group" aria-label="${t("Filtra per tipo")}">
      ${filtri.map((f) => `<button data-filtro="${f}" class="${stato.filtro === f ? "attivo" : ""}">${f === "tutti" ? t("Tutti") : t("categorie." + f)}</button>`).join("")}
    </div>
    ${conEmisfero ? `<p class="conteggio">${t("Da dove si vedono:")}</p>
    <div class="filtri filtri-emisfero" role="group" aria-label="${t("Filtra per emisfero")}">
      ${Object.entries(FILTRI_EMISFERO).map(([k, [nome]]) => `<button data-emisfero="${k}" class="${(stato.emisfero || "tutte") === k ? "attivo" : ""}">${t(nome)}</button>`).join("")}
    </div>` : ""}
    <input type="search" id="cerca" class="cerca" placeholder="${t("cerca.segnaposto")}" value="${esc(stato.cerca || "")}" aria-label="${t("Cerca una scheda")}">
    ${stato.filtro === "pianeta" || stato.filtro === "tutti" ? `<a class="riquadro-ss" href="#sistema-solare"><span>🪐</span><span><b>${t("Il Sistema Solare oggi")}</b><br>${t("ss.riquadro")}</span></a>` : ""}
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
  if (stato.filtro === "costellazione") elenco = [...elenco].sort((a, b) => a.nome.localeCompare(b.nome, locale()));
  $("#conteggio").textContent = elenco.length === 1 ? t("1 scheda") : t("n schede", { n: elenco.length });
  $("#griglia").innerHTML = elenco.map((o) => {
    const img = immagineCarta(o);
    return `<li><a class="carta" href="#scheda/${o.id}">
      ${img ? `<img class="carta-immagine${FOTO[o.id] ? " carta-foto" : ""}" src="${img}" alt="" loading="lazy" width="800" height="500">` : ""}
      <span class="etichetta etichetta-${o.categoria}">${nomeCategoria(o.categoria)}</span>
      <span class="carta-nome">${esc(o.nome)}</span>
      ${FOTO[o.id] ? `<span class="carta-credito">${t("credito.breve", { autore: esc(FOTO[o.id].autore), sito: esc(FOTO[o.id].sito) })}</span>` : ""}
      ${etichetteEmisferi(o)}
      <span class="carta-testo">${esc(o.cosa)}</span>
    </a></li>`;
  }).join("") || `<li class="vuoto">${t("Nessuna scheda trovata.")}</li>`;
}

// Da dove si vede: testo per costellazioni e galassie
function testoVisibilita(o) {
  const parti = [];
  if (o.italia === "si") parti.push(t("vis.italia.si"));
  else if (o.italia === "parte") parti.push(t("vis.italia.parte") + (o.sicilia === "si" ? " " + t("vis.sicilia.si") : ""));
  else parti.push(t("vis.italia.no") + (o.sicilia === "parte" ? " " + t("vis.sicilia.parte") : ""));
  parti.push(t("vis.sud." + o.sud));
  return parti.join(" ");
}

function sezioneStelle(o) {
  if (!o.stelle || !o.stelle.length) return "";
  return `<section><h2>${t("Le stelle principali")}</h2><ul class="stelle">
    ${o.stelle.map((s) => `<li><span class="stella-nome">${esc(s.nome)}</span>
      <span class="stella-dati">${esc(s.sigla)}, ${t("magnitudine")} ${numero(s.mag)}</span>
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
    ? t("adesso.terra")
    : pos.altezza > 0
    ? t("adesso.alto", { direzione: direzione(pos.azimut), altezza: altezzaInPugni(pos.altezza), gradi: Math.round(pos.altezza) })
    : maiDaQui
      ? t(stato.luogo.lat > 0 ? "adesso.mai.australe" : "adesso.mai.boreale", { luogo: esc(nomeLuogo(stato.luogo)) })
      : t("adesso.sotto");
  const voci = [
    [t("voce.cosa"), o.cosa],
    [t("voce.quando"), o.quando],
    [t("voce.dove"), o.dove],
    [t("voce.come"), o.come],
    [t("voce.origine"), o.origine],
    [t("voce.storia"), o.storia],
  ];
  const mappa = o.immagine || `images/${o.id}.svg`;
  $("#contenuto").innerHTML = `
    <article class="scheda">
      <a class="indietro" href="#schede">‹ ${t("Tutte le schede")}</a>
      <span class="etichetta etichetta-${o.categoria}">${nomeCategoria(o.categoria)}</span>
      <h1>${esc(o.nome)}</h1>
      ${o.latino ? `<p class="sottotitolo">${t("nome.latino", { latino: esc(o.latino), sigla: esc(o.sigla) })}</p>` : ""}
      ${etichetteEmisferi(o)}
      <p class="adesso">${adesso}${o.noi ? "" : " " + t("strumento.consigliato", { strumento: esc(o.strumento.toLocaleLowerCase(locale())) })}</p>
      ${maiDaQui || o.noi ? "" : `<a class="pulsante pulsante-trova" href="#trova/${esc(o.id)}">🧭 ${t("Guidami in cielo col telefono")}</a>`}
      ${FOTO[o.id] ? `<figure class="scheda-immagine scheda-foto">
        <img src="images/foto/${o.id}.jpg" alt="${t("Foto")}: ${esc(o.nome)}">
        <figcaption>${creditoFoto(FOTO[o.id])}</figcaption>
      </figure>` : ""}
      <figure class="scheda-immagine">
        <img src="${mappa}" alt="${o.corpo || o.noi ? t("Disegno") : t("Mappa del cielo")}: ${esc(o.nome)}" width="800" height="500">
        <figcaption>${o.corpo || o.noi ? t("didascalia.disegno") : t("didascalia.mappa")}</figcaption>
      </figure>
      ${figuraMito(o)}
      ${o.categoria === "pianeta" ? figuraSistemaSolare(o.id) : ""}
      ${o.italia ? `<section><h2>${t("Da dove si vede")}</h2><p>${testoVisibilita(o)}</p></section>` : ""}
      ${voci.map(([t, testo]) => `<section><h2>${t}</h2><p>${esc(testo)}</p></section>`).join("")}
      ${sezioneStelle(o)}
    </article>`;
  window.scrollTo(0, 0);
}

function mostraLune(o) {
  const tabella = o.tabella && o.tabella.length ? `<section><h2>${t("Le altre lune con un nome")}</h2>
    <table class="tabella-lune">
      <thead><tr><th>${t("Nome")}</th><th>${t("Diametro (km)")}</th><th>${t("Scoperta")}</th><th>${t("Famiglia")}</th></tr></thead>
      <tbody>${o.tabella.map(([nome, diam, anno, gruppo]) => `<tr><td>${esc(nome)}</td><td>${esc(diam)}</td><td>${anno}</td><td>${esc(gruppo)}</td></tr>`).join("")}</tbody>
    </table>
    ${o.altre ? `<p class="nota">${esc(o.altre)}</p>` : ""}
  </section>` : (o.altre ? `<section><p class="nota">${esc(o.altre)}</p></section>` : "");
  $("#contenuto").innerHTML = `
    <article class="scheda">
      <a class="indietro" href="#schede">‹ ${t("Tutte le schede")}</a>
      <span class="etichetta etichetta-lune">${nomeCategoria("lune")}</span>
      <h1>${esc(o.nome)}</h1>
      ${o.totale !== null ? `<p class="totale-lune">${o.totale === 1 ? t("1 luna") : t("n lune", { n: o.totale })}</p>
        <p class="nota">${o.aggiornato ? t("lune.conosciute.data", { data: esc(o.aggiornato) }) : t("lune.conosciute")}</p>` : ""}
      ${FOTO[o.id] ? `<figure class="scheda-immagine scheda-foto"><img src="images/foto/${o.id}.jpg" alt="${t("Foto")}: ${esc(FOTO[o.id].nome || o.nome)}">
        <figcaption>${creditoFoto(FOTO[o.id])}</figcaption></figure>` : ""}
      ${o.immagine ? `<figure class="scheda-immagine"><img src="${o.immagine}" alt="" width="800" height="500">
        <figcaption>${o.id === "lune-esopianeti" ? t("didascalia.kepler") : t("didascalia.disegno")}</figcaption></figure>` : ""}
      <section><h2>${t("In breve")}</h2><p>${esc(o.introduzione)}</p></section>
      ${o.osservare ? `<section><h2>${t("Come osservarle")}</h2><p>${esc(o.osservare)}</p></section>` : ""}
      ${o.principali.length ? `<section><h2>${o.id === "lune-esopianeti" ? t("I candidati") : t("Le lune principali")}</h2>
        ${o.principali.map((l) => `<div class="luna-principale">
          <h3>${esc(l.nome)}</h3>
          <p class="stella-dati">${[l.diametro && `${t("Diametro")}: ${l.diametro}`, l.scoperta && `${t("Scoperta")}: ${l.scoperta}`].filter(Boolean).map(esc).join(" · ")}</p>
          <p>${esc(l.testo)}</p>
          ${l.origine ? `<p><b>${t("Il nome.")}</b> ${esc(l.origine)}</p>` : ""}
        </div>`).join("")}</section>` : ""}
      ${tabella}
      ${o.foto ? `<section><h2>${t("Le foto")}</h2>
        ${o.foto.map(([id, testo]) => `<figure class="scheda-immagine scheda-foto">
          <img src="images/foto/${id}.jpg" alt="${t("Foto")}: ${esc(FOTO[id].nome)}" loading="lazy">
          <figcaption>${esc(testo)} ${creditoFoto(FOTO[id])}</figcaption>
        </figure>`).join("")}</section>` : ""}
      ${o.curiosita ? `<section><h2>${t("Curiosità")}</h2><p>${esc(o.curiosita)}</p></section>` : ""}
    </article>`;
  window.scrollTo(0, 0);
}

function mostraLeggenda(o) {
  const collegati = o.collegati.map((id) => OGGETTI.find((x) => x.id === id)).filter(Boolean);
  $("#contenuto").innerHTML = `
    <article class="scheda">
      <a class="indietro" href="#schede">‹ ${t("Tutte le schede")}</a>
      <span class="etichetta etichetta-leggenda">${nomeCategoria("leggenda")}</span>
      <h1>${esc(o.nome)}</h1>
      <p class="sottotitolo">${esc(o.cosa)}</p>
      ${o.immagine ? `<figure class="scheda-immagine"><img src="${o.immagine}" alt="" width="800" height="500"></figure>` : ""}
      ${o.paragrafi.map((p) => `<section><h2>${esc(p.titolo)}</h2><p>${esc(p.testo)}</p></section>`).join("")}
      ${collegati.length ? `<section><h2>${t("Le schede collegate")}</h2><p class="collegati">
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
      <h2>${t("Il manuale è riservato")}</h2>
      <p>${t("manuale.password.testo")}</p>
      ${notaSoloItaliano()}
      <label for="password-manuale">${t("Password")}</label>
      <input id="password-manuale" type="password" autocomplete="current-password" autocapitalize="off" placeholder="${t("Scrivi la password")}">
      <button id="apri-manuale" class="pulsante">${t("Apri il manuale")}</button>
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
    $("#esito-manuale").textContent = t("manuale.password.errata");
  };
  $("#apri-manuale").addEventListener("click", prova);
  $("#password-manuale").addEventListener("keydown", (e) => e.key === "Enter" && prova());
}

// Il manuale è scritto solo in italiano: nelle altre lingue lo si dice.
function notaSoloItaliano() {
  return (LINGUA || "it") === "it" ? "" : `<p class="nota">🇮🇹 ${t("manuale.solo.italiano")}</p>`;
}

function mostraManuale() {
  $("#contenuto").innerHTML = `
    <section>
      <h1>${t("Il manuale")}</h1>
      <p class="sottotitolo">${t("manuale.sottotitolo")}</p>
      ${notaSoloItaliano()}
      <ol class="elenco elenco-capitoli">
        ${CAPITOLI.map((c) => `<li><a class="riga" href="#capitolo/${c.numero}">
          <span class="riga-testo"><span class="riga-dove">${t("Capitolo n", { n: c.numero })}</span>
          <span class="riga-nome">${esc(c.titolo)}</span></span></a></li>`).join("")}
      </ol>
    </section>`;
}

async function mostraCapitolo(numero) {
  const i = CAPITOLI.findIndex((c) => c.numero === Number(numero));
  if (i < 0) return mostraManuale();
  const file = `manuale/${String(CAPITOLI[i].numero).padStart(2, "0")}.html`;
  $("#contenuto").innerHTML = `<p class="vuoto">${t("Carico il capitolo...")}</p>`;
  let testo;
  try {
    const risposta = await fetch(file);
    if (!risposta.ok) throw new Error(risposta.status);
    testo = await risposta.text();
  } catch {
    testo = `<p class="vuoto">${t("capitolo.errore")}</p>`;
  }
  const prec = CAPITOLI[i - 1], succ = CAPITOLI[i + 1];
  $("#contenuto").innerHTML = `
    <article class="capitolo">
      <a class="indietro" href="#manuale">‹ ${t("Tutti i capitoli")}</a>
      ${testo}
      <nav class="capitolo-nav">
        ${prec ? `<a href="#capitolo/${prec.numero}">‹ ${t("Capitolo n", { n: prec.numero })}</a>` : "<span></span>"}
        ${succ ? `<a href="#capitolo/${succ.numero}">${t("Capitolo n", { n: succ.numero })} ›</a>` : ""}
      </nav>
    </article>`;
  window.scrollTo(0, 0);
}

// ---------- Versione completa (attiva solo se VERSIONE_COMPLETA.attiva è true) ----------

function riquadroVersione() {
  if (!VERSIONE_COMPLETA.attiva) return "";
  if (versioneCompletaSbloccata()) return `<p class="nota">${t("Versione completa sbloccata. Grazie!")}</p>`;
  return `<p>${t("versione.gratuita", { rimaste: apertureRimaste(), totale: VERSIONE_COMPLETA.aperture })}
          <a href="#sblocca">${t("Sblocca la versione completa")}</a> (${esc(VERSIONE_COMPLETA.prezzo)}).</p>`;
}

function mostraSblocco() {
  $("#contenuto").innerHTML = `
    <section class="pannello">
      <h2>${appBloccata() ? t("sblocco.usate", { n: VERSIONE_COMPLETA.aperture }) : t("La versione completa")}</h2>
      <p>${appBloccata() ? t("sblocco.grazie") : t("sblocco.aperture", { n: VERSIONE_COMPLETA.aperture, rimaste: apertureRimaste() })}
        ${t("sblocco.prezzo", { prezzo: esc(VERSIONE_COMPLETA.prezzo) })}</p>
      <p>${t("sblocco.scrivi", { email: `<a href="mailto:${EMAIL_SUPPORTO}?subject=${encodeURIComponent("Versione completa Cielo di Stasera")}">${EMAIL_SUPPORTO}</a>` })}</p>
      <label for="codice">${t("Hai già un codice?")}</label>
      <input id="codice" autocomplete="off" autocapitalize="characters" placeholder="${t("Scrivi il codice")}">
      <button id="prova-codice" class="pulsante">${t("Sblocca")}</button>
      <p id="esito-codice" class="nota"></p>
    </section>`;
  $("#prova-codice").addEventListener("click", async () => {
    if (await provaCodice($("#codice").value)) {
      $("#esito-codice").textContent = t("sblocco.fatto");
      setTimeout(() => (location.hash = "#stasera"), 1200);
    } else $("#esito-codice").textContent = t("sblocco.errato");
  });
}

// ---------- Aiuto ----------

const EMAIL_SUPPORTO = "dep.kit@gmail.com";

function mostraAiuto() {
  const oggetto = encodeURIComponent("Supporto Cielo di Stasera");
  $("#contenuto").innerHTML = `
    <article class="capitolo">
      <h1>${t("Aiuto")}</h1>
      <section class="pannello">
        <h2>🌐 ${t("Lingua")}</h2>
        <p>${t("aiuto.lingua")}</p>
        <a class="pulsante" href="#lingua">🌐 ${t("Cambia lingua")}</a>
        <a class="pulsante pulsante-secondario" href="#benvenuto">${t("Rivedi le istruzioni iniziali")}</a>
      </section>
      <section>
        <h2>${t("Stasera")}</h2>
        <p>${t("aiuto.stasera.1")}</p>
        <p>${t("aiuto.stasera.2")}</p>
      </section>
      <section>
        <h2>${t("Il luogo")}</h2>
        <p>${t("aiuto.luogo")}</p>
      </section>
      <section>
        <h2>${t("Guidami in cielo")}</h2>
        <p>${t("aiuto.guida")}</p>
      </section>
      <section>
        <h2>${t("Schede")}</h2>
        <p>${t("aiuto.schede.1")}</p>
        <p>${t("aiuto.schede.2")}</p>
        <p>${t("aiuto.legenda")}</p>
      </section>
      <section>
        <h2>${t("Strumenti")}</h2>
        <p>${t("aiuto.strumenti")}</p>
      </section>
      <section>
        <h2>${t("Il manuale")}</h2>
        <p>${t("aiuto.manuale")}</p>
      </section>
      <section>
        <h2>${t("Modalità notte")}</h2>
        <p>${t("aiuto.notte")}</p>
      </section>
      <section>
        <h2>${t("Installazione su Smartphone")}</h2>
        <p>${t("aiuto.installa")}</p>
      </section>
      <section id="crediti">
        <h2>${t("Crediti immagini")}</h2>
        <p>${t("crediti.intro")}</p>
        <ul class="crediti">
          ${Object.entries(FOTO).map(([id, f]) => {
            const o = OGGETTI.find((x) => x.id === id);
            return `<li><b>${esc(f.nome || (o ? o.nome : id))}</b>: ${creditoFoto(f)}</li>`;
          }).join("")}
        </ul>
        <p>${t("crediti.mappe", {
          d3: `<a href="https://github.com/ofrohn/d3-celestial" target="_blank" rel="noopener">d3-celestial</a>`,
          stellarium: `<a href="https://stellarium.org" target="_blank" rel="noopener">Stellarium</a>`,
          licenza: `<a href="https://artlibre.org/licence/lal/en/" target="_blank" rel="noopener">Free Art License</a>`,
          motore: `<a href="https://github.com/cosinekitty/astronomy" target="_blank" rel="noopener">Astronomy Engine</a>`,
        })}</p>
      </section>
      <section class="pannello">
        <h2>${t("Serve aiuto?")}</h2>
        <p>${t("aiuto.scrivi", { email: `<a href="mailto:${EMAIL_SUPPORTO}?subject=${oggetto}">${EMAIL_SUPPORTO}</a>` })}</p>
        ${riquadroVersione()}
        <p class="nota">${t("aiuto.autore")} <i>Astronomia per poveri diavoli.</i></p>
      </section>
    </article>`;
  window.scrollTo(0, 0);
}

// ---------- Lingua e istruzioni iniziali ----------

// Al primo avvio si sceglie la lingua; poi si cambia quando si vuole col pulsante 🌐 in alto o da Aiuto.
function mostraLingua() {
  const primo = !LINGUA;
  const suggerita = linguaDelDispositivo();
  $("#contenuto").innerHTML = `
    <section class="pannello">
      <h1>🌐 ${primo ? TITOLO_LINGUA : t("Scegli la lingua")}</h1>
      <p>${primo ? esc(ISTRUZIONI_LINGUA[suggerita] || ISTRUZIONI_LINGUA.en) : t("lingua.istruzioni")}</p>
      ${primo && suggerita !== "en" && ISTRUZIONI_LINGUA[suggerita] ? `<p class="nota" lang="en" dir="ltr">${esc(ISTRUZIONI_LINGUA.en)}</p>` : ""}
      <div class="lingue">
        ${LINGUE.map((l) => `<button data-lingua="${l.codice}" lang="${l.lang || l.codice}" dir="${l.rtl ? "rtl" : "ltr"}"
          class="${l.codice === (LINGUA || suggerita) ? "attivo" : ""}">${l.nome}</button>`).join("")}
      </div>
      ${primo ? "" : `<p class="nota">${t("lingua.nota")}</p>`}
    </section>`;
  document.querySelectorAll("[data-lingua]").forEach((b) =>
    b.addEventListener("click", () => {
      const nuova = b.dataset.lingua;
      if (nuova === LINGUA) return void (location.hash = "#stasera");
      scegliLingua(nuova);
      // Si ricarica l'app: così menu e schede si scrivono tutti nella lingua nuova.
      history.replaceState(null, "", primo ? "#benvenuto" : "#aiuto");
      location.reload();
    })
  );
  window.scrollTo(0, 0);
}

// Istruzioni per chi apre l'app la prima volta (si rivedono da Aiuto).
function mostraBenvenuto() {
  salvaImpostazione("benvenutoVisto", true);
  const passi = [
    ["📍", "benvenuto.luogo", "#luogo"],
    ["🌙", "benvenuto.stasera", "#stasera"],
    ["✨", "benvenuto.schede", "#schede"],
    ["🧭", "benvenuto.guida", null],
    ["🔴", "benvenuto.notte", null],
    ["🔭", "benvenuto.strumenti", "#strumenti"],
    ["🌐", "benvenuto.lingua", "#lingua"],
    ["❓", "benvenuto.aiuto", "#aiuto"],
  ];
  $("#contenuto").innerHTML = `
    <article class="capitolo benvenuto">
      <h1>${t("benvenuto.titolo")}</h1>
      <p class="sottotitolo">${t("benvenuto.sottotitolo")}</p>
      <ol class="passi">
        ${passi.map(([icona, chiave, link]) => `<li><span class="passo-icona" aria-hidden="true">${icona}</span>
          <span>${t(chiave)}${link ? ` <a href="${link}">${t("Vai")} ›</a>` : ""}</span></li>`).join("")}
      </ol>
      <a class="pulsante" href="#stasera">${t("Inizia")}</a>
    </article>`;
  window.scrollTo(0, 0);
}

// ---------- Impostazioni del luogo ----------

function mostraLuogo() {
  $("#contenuto").innerHTML = `
    <section class="pannello">
      <h2>${t("Da dove osservi?")}</h2>
      <p>${t("luogo.testo")}</p>
      <button id="usa-posizione" class="pulsante">${t("Usa la mia posizione")}</button>
      <p id="esito-posizione" class="nota"></p>
      <label for="citta">${t("Oppure scegli una città")}</label>
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
      esito.textContent = t("luogo.nessuna");
      return;
    }
    esito.textContent = t("Cerco la posizione...");
    navigator.geolocation.getCurrentPosition(
      (p) => impostaLuogo({ nome: "la tua posizione", gps: true, lat: p.coords.latitude, lon: p.coords.longitude }),
      () => (esito.textContent = t("luogo.errore")),
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
  $("#luogo").textContent = nomeLuogo(stato.luogo);
  $("#lingua-attiva").textContent = (LINGUA || "it").toUpperCase();
}

// ---------- Navigazione ----------

function instrada() {
  const [pagina, id] = location.hash.slice(1).split("/");
  chiudiTrova();
  document.querySelectorAll(".schede-nav a").forEach((a) =>
    a.classList.toggle("attivo", a.getAttribute("href") === `#${pagina === "scheda" || pagina === "trova" || pagina === "sistema-solare" ? "schede" : pagina === "capitolo" ? "manuale" : pagina === "strumento" ? "strumenti" : pagina === "lingua" || pagina === "benvenuto" ? "aiuto" : pagina || "stasera"}`)
  );
  if (!LINGUA || pagina === "lingua") mostraLingua();
  else if (pagina === "benvenuto") mostraBenvenuto();
  else if (appBloccata() && pagina !== "aiuto") mostraSblocco();
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
window.addEventListener("DOMContentLoaded", async () => {
  await caricaLingua();
  traduciPagina();
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
