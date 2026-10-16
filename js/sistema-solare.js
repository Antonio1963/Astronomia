// Mappa del Sistema Solare visto dall'alto, con le posizioni vere dei pianeti in un giorno.
// Le orbite sono disegnate a passi uguali (non in scala), altrimenti i pianeti interni
// finirebbero tutti in un puntino attorno al Sole.

const PIANETI_MAPPA = [
  // id, corpo, raggio del pallino, distanza media dal Sole (milioni di km), anni per un giro
  { id: "mercurio", corpo: "Mercury", r: 4, km: 58, giro: "88 giorni" },
  { id: "venere", corpo: "Venus", r: 6, km: 108, giro: "225 giorni" },
  { id: "terra", corpo: "Earth", r: 6, km: 150, giro: "1 anno" },
  { id: "marte", corpo: "Mars", r: 5, km: 228, giro: "1 anno e 11 mesi" },
  { id: "giove", corpo: "Jupiter", r: 11, km: 778, giro: "12 anni" },
  { id: "saturno", corpo: "Saturn", r: 9, km: 1433, giro: "29 anni e mezzo" },
  { id: "urano", corpo: "Uranus", r: 7, km: 2872, giro: "84 anni" },
  { id: "nettuno", corpo: "Neptune", r: 7, km: 4495, giro: "165 anni" },
];

const RAGGIO_ORBITA = (i) => 42 + i * 27;

// Longitudine eclittica eliocentrica in gradi: 0° è la direzione del punto d'Ariete (verso i Pesci).
function longitudineDalSole(corpo, data) {
  return Astronomy.Ecliptic(Astronomy.HelioVector(corpo, data)).elon;
}

function puntoOrbita(i, gradi) {
  const a = (gradi * Math.PI) / 180;
  const r = RAGGIO_ORBITA(i);
  // Visto dal Polo Nord: i pianeti girano in senso antiorario. In SVG la y va verso il basso.
  return [r * Math.cos(a), -r * Math.sin(a)];
}

// Il nome del pianeta nella lingua dell'app, preso dalla sua scheda.
function nomePianeta(id) {
  const o = OGGETTI.find((x) => x.id === id);
  return o ? esc(o.nome) : id;
}

// Disegno SVG. "evidenzia" è l'id di un pianeta da mettere in risalto (con la linea dalla Terra).
function disegnoSistemaSolare(data, evidenzia) {
  const pos = PIANETI_MAPPA.map((p, i) => ({ ...p, xy: puntoOrbita(i, longitudineDalSole(p.corpo, data)) }));
  const terra = pos.find((p) => p.id === "terra");
  const scelto = pos.find((p) => p.id === evidenzia);
  const orbite = PIANETI_MAPPA.map((p, i) =>
    `<circle class="ss-orbita${p.id === evidenzia ? " ss-orbita-scelta" : ""}" r="${RAGGIO_ORBITA(i)}"/>`).join("");
  const linea = scelto && scelto.id !== "terra"
    ? `<line class="ss-linea" x1="${terra.xy[0].toFixed(1)}" y1="${terra.xy[1].toFixed(1)}" x2="${scelto.xy[0].toFixed(1)}" y2="${scelto.xy[1].toFixed(1)}"/>`
    : "";
  const etichette = [];
  const pianeti = pos.map((p) => {
    const [x, y] = p.xy;
    // Il nome va sotto il pallino; se lì c'è già un altro nome (o il bordo), va sopra.
    const lx = Math.max(-238, Math.min(238, x));
    let ly = y + p.r + 17;
    const occupato = (yy) => yy > 255 || etichette.some(([ex, ey]) => Math.abs(ex - lx) < 70 && Math.abs(ey - yy) < 18);
    if (occupato(ly)) ly = y - p.r - 6;
    etichette.push([lx, ly]);
    const anelli = p.id === "saturno" ? `<ellipse class="ss-anelli" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="${p.r + 6}" ry="${(p.r + 6) / 3}"/>` : "";
    return `<a href="#scheda/${p.id}">
      ${p.id === evidenzia ? `<circle class="ss-alone" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.r + 6}"/>` : ""}
      ${anelli}<circle class="ss-pianeta ss-${p.id}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${p.r}"/>
      <text class="ss-nome${p.id === evidenzia ? " ss-nome-scelto" : ""}" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle">${nomePianeta(p.id)}</text>
    </a>`;
  }).join("");
  return `<svg class="ss-mappa" viewBox="-265 -265 530 530" role="img" aria-label="${t("ss.aria")}">
    <rect class="ss-sfondo" x="-265" y="-265" width="530" height="530" rx="14"/>
    ${orbite}${linea}
    <circle class="ss-sole" r="16"/>
    ${pianeti}
    <text class="ss-nome" x="0" y="34" text-anchor="middle">${t("Sole")}</text>
    <text class="ss-nota" x="-252" y="-240">↺ ${t("ss.verso")}</text>
  </svg>`;
}

// Quando si vede dalla Terra: dipende da quanto il pianeta sembra lontano dal Sole nel cielo.
function quandoSiVede(corpo, data) {
  const e = Astronomy.Elongation(corpo, data);
  if (e.elongation < 15) return t("ss.vicino.sole");
  if (e.elongation > 150) return t("Tutta la notte");
  return e.visibility === "evening" ? t("ss.sera") : t("ss.mattino");
}

function costellazioneDi(corpo, data) {
  const eq = Astronomy.Equator(corpo, data, osservatore(stato.luogo), true, true);
  const sigla = Astronomy.Constellation(eq.ra, eq.dec).symbol;
  return OGGETTI.find((o) => o.categoria === "costellazione" && o.sigla === sigla);
}

function milioniKm(n) {
  return n >= 1000 ? t("n miliardi", { n: numero(n / 1000, 1) }) : t("n milioni", { n: numero(Math.round(n)) });
}

// Riquadro piccolo per la scheda di un pianeta, con il collegamento alla pagina intera.
function figuraSistemaSolare(id) {
  const data = new Date();
  return `<figure class="scheda-immagine">
    <a href="#sistema-solare">${disegnoSistemaSolare(data, id)}</a>
    <figcaption>${t(id !== "terra" ? "ss.piccola.linea" : "ss.piccola")}
      <a href="#sistema-solare">${t("Apri la mappa grande")}</a>.</figcaption>
  </figure>`;
}

let giorniMappa = 0;

function mostraSistemaSolare() {
  const data = new Date(Date.now() + giorniMappa * 864e5);
  const giorno = data.toLocaleDateString(locale(), { day: "numeric", month: "long", year: "numeric" });
  const righe = PIANETI_MAPPA.map((p) => {
    if (p.id === "terra") return `<tr><td><a href="#scheda/terra">${nomePianeta("terra")}</a></td><td>${milioniKm(p.km)}</td><td>${t("ci siamo sopra")}</td><td>—</td></tr>`;
    const daNoi = Astronomy.GeoVector(p.corpo, data, true).Length() * 149.6;
    const cost = costellazioneDi(p.corpo, data);
    return `<tr><td><a href="#scheda/${p.id}">${nomePianeta(p.id)}</a></td><td>${milioniKm(p.km)}</td><td>${milioniKm(daNoi)}</td>
      <td>${quandoSiVede(p.corpo, data)}${cost ? `<br><span class="nota">${t("categoria.costellazione")}: <a href="#scheda/${cost.id}">${esc(cost.nome)}</a></span>` : ""}</td></tr>`;
  }).join("");
  $("#contenuto").innerHTML = `
    <article class="scheda">
      <a class="indietro" href="#schede">‹ ${t("Tutte le schede")}</a>
      <span class="etichetta etichetta-pianeta">${t("categorie.pianeta")}</span>
      <h1>${t("Il Sistema Solare")}</h1>
      <p class="sottotitolo">${t("ss.sottotitolo", { giorno: esc(giorno) })}</p>
      <div class="filtri ss-date" role="group" aria-label="${t("Cambia giorno")}">
        <button data-giorni="-365">‹ ${t("1 anno")}</button>
        <button data-giorni="-30">‹ ${t("1 mese")}</button>
        <button data-giorni="0" class="${giorniMappa === 0 ? "attivo" : ""}">${t("Oggi")}</button>
        <button data-giorni="30">${t("1 mese")} ›</button>
        <button data-giorni="365">${t("1 anno")} ›</button>
      </div>
      <figure class="scheda-immagine">
        ${disegnoSistemaSolare(data)}
        <figcaption>${t("ss.didascalia")}</figcaption>
      </figure>
      <figure class="scheda-immagine scheda-foto">
        <img src="images/foto/sistema-solare.jpg" alt="${t("ss.foto.alt")}" loading="lazy" width="1600" height="900">
        <figcaption>${t("ss.foto.didascalia")} ${creditoFoto(FOTO["sistema-solare"])}</figcaption>
      </figure>
      <section><h2>${t("I pianeti in questo giorno")}</h2>
        <table class="tabella-lune tabella-ss">
          <thead><tr><th>${t("categoria.pianeta")}</th><th>${t("Dal Sole (km)")}</th><th>${t("Da noi (km)")}</th><th>${t("Quando si vede")}</th></tr></thead>
          <tbody>${righe}</tbody>
        </table>
        <p class="nota">${t("ss.nota.distanze")}</p>
      </section>
      <section><h2>${t("Come leggere la mappa")}</h2>
        <p>${t("ss.leggere.1")}</p>
        <p>${t("ss.leggere.2")}</p>
      </section>
      <section><h2>${t("Le distanze vere")}</h2>
        <p>${t("ss.distanze.vere")}</p>
      </section>
    </article>`;
  document.querySelectorAll("[data-giorni]").forEach((b) =>
    b.addEventListener("click", () => {
      const passo = Number(b.dataset.giorni);
      giorniMappa = passo === 0 ? 0 : giorniMappa + passo;
      mostraSistemaSolare();
    })
  );
  window.scrollTo(0, 0);
}
