// Mappa del Sistema Solare visto dall'alto, con le posizioni vere dei pianeti in un giorno.
// Le orbite sono disegnate a passi uguali (non in scala), altrimenti i pianeti interni
// finirebbero tutti in un puntino attorno al Sole.

const PIANETI_MAPPA = [
  // id, nome, corpo, raggio del pallino, distanza media dal Sole (milioni di km), anni per un giro
  { id: "mercurio", nome: "Mercurio", corpo: "Mercury", r: 4, km: 58, giro: "88 giorni" },
  { id: "venere", nome: "Venere", corpo: "Venus", r: 6, km: 108, giro: "225 giorni" },
  { id: "terra", nome: "Terra", corpo: "Earth", r: 6, km: 150, giro: "1 anno" },
  { id: "marte", nome: "Marte", corpo: "Mars", r: 5, km: 228, giro: "1 anno e 11 mesi" },
  { id: "giove", nome: "Giove", corpo: "Jupiter", r: 11, km: 778, giro: "12 anni" },
  { id: "saturno", nome: "Saturno", corpo: "Saturn", r: 9, km: 1433, giro: "29 anni e mezzo" },
  { id: "urano", nome: "Urano", corpo: "Uranus", r: 7, km: 2872, giro: "84 anni" },
  { id: "nettuno", nome: "Nettuno", corpo: "Neptune", r: 7, km: 4495, giro: "165 anni" },
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
      <text class="ss-nome${p.id === evidenzia ? " ss-nome-scelto" : ""}" x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="middle">${p.nome}</text>
    </a>`;
  }).join("");
  return `<svg class="ss-mappa" viewBox="-265 -265 530 530" role="img" aria-label="Il Sistema Solare visto dall'alto, con la posizione dei pianeti">
    <rect class="ss-sfondo" x="-265" y="-265" width="530" height="530" rx="14"/>
    ${orbite}${linea}
    <circle class="ss-sole" r="16"/>
    ${pianeti}
    <text class="ss-nome" x="0" y="34" text-anchor="middle">Sole</text>
    <text class="ss-nota" x="-252" y="-240">↺ girano tutti in questo verso</text>
  </svg>`;
}

// Quando si vede dalla Terra: dipende da quanto il pianeta sembra lontano dal Sole nel cielo.
function quandoSiVede(corpo, data) {
  const e = Astronomy.Elongation(corpo, data);
  if (e.elongation < 15) return "Non si vede: è vicino al Sole";
  if (e.elongation > 150) return "Tutta la notte";
  return e.visibility === "evening" ? "La sera, dopo il tramonto" : "Al mattino, prima dell'alba";
}

function costellazioneDi(corpo, data) {
  const eq = Astronomy.Equator(corpo, data, osservatore(stato.luogo), true, true);
  const sigla = Astronomy.Constellation(eq.ra, eq.dec).symbol;
  return OGGETTI.find((o) => o.categoria === "costellazione" && o.sigla === sigla);
}

function milioniKm(n) {
  return n >= 1000 ? `${(n / 1000).toLocaleString("it-IT", { maximumFractionDigits: 1 })} miliardi` : `${Math.round(n)} milioni`;
}

// Riquadro piccolo per la scheda di un pianeta, con il collegamento alla pagina intera.
function figuraSistemaSolare(id) {
  const data = new Date();
  return `<figure class="scheda-immagine">
    <a href="#sistema-solare">${disegnoSistemaSolare(data, id)}</a>
    <figcaption>Dove si trova oggi nel Sistema Solare, visto dall'alto${id !== "terra" ? ", con la linea dalla Terra" : ""}.
      Posizioni vere; le distanze e le grandezze invece non sono in scala.
      <a href="#sistema-solare">Apri la mappa grande</a>.</figcaption>
  </figure>`;
}

let giorniMappa = 0;

function mostraSistemaSolare() {
  const data = new Date(Date.now() + giorniMappa * 864e5);
  const giorno = data.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
  const righe = PIANETI_MAPPA.map((p) => {
    if (p.id === "terra") return `<tr><td><a href="#scheda/terra">Terra</a></td><td>${milioniKm(p.km)}</td><td>ci siamo sopra</td><td>—</td></tr>`;
    const daNoi = Astronomy.GeoVector(p.corpo, data, true).Length() * 149.6;
    const cost = costellazioneDi(p.corpo, data);
    return `<tr><td><a href="#scheda/${p.id}">${p.nome}</a></td><td>${milioniKm(p.km)}</td><td>${milioniKm(daNoi)}</td>
      <td>${quandoSiVede(p.corpo, data)}${cost ? `<br><span class="nota">Costellazione: <a href="#scheda/${cost.id}">${esc(cost.nome)}</a></span>` : ""}</td></tr>`;
  }).join("");
  $("#contenuto").innerHTML = `
    <article class="scheda">
      <a class="indietro" href="#schede">‹ Tutte le schede</a>
      <span class="etichetta etichetta-pianeta">Pianeti</span>
      <h1>Il Sistema Solare</h1>
      <p class="sottotitolo">Dove sono il Sole e gli otto pianeti il ${esc(giorno)}</p>
      <div class="filtri ss-date" role="group" aria-label="Cambia giorno">
        <button data-giorni="-365">‹ 1 anno</button>
        <button data-giorni="-30">‹ 1 mese</button>
        <button data-giorni="0" class="${giorniMappa === 0 ? "attivo" : ""}">Oggi</button>
        <button data-giorni="30">1 mese ›</button>
        <button data-giorni="365">1 anno ›</button>
      </div>
      <figure class="scheda-immagine">
        ${disegnoSistemaSolare(data)}
        <figcaption>Il Sistema Solare visto dall'alto, dalla parte del Polo Nord. Le posizioni dei pianeti sono quelle vere
          del giorno indicato, calcolate con Astronomy Engine. Le distanze invece non sono in scala: le orbite sono disegnate
          a passi uguali, altrimenti Mercurio, Venere, Terra e Marte starebbero tutti in un puntino attorno al Sole.
          Anche le grandezze dei pianeti sono inventate. Tocca un pianeta per aprire la sua scheda.</figcaption>
      </figure>
      <figure class="scheda-immagine scheda-foto">
        <img src="images/foto/sistema-solare.jpg" alt="Il Sole e gli otto pianeti in fila, con le grandezze vere" loading="lazy" width="1600" height="900">
        <figcaption>Le grandezze vere: a destra un pezzo del Sole, poi da destra a sinistra Mercurio, Venere, Terra, Marte,
          Giove, Saturno, Urano e Nettuno. Le distanze tra loro invece non sono in scala. ${creditoFoto(FOTO["sistema-solare"])}</figcaption>
      </figure>
      <section><h2>I pianeti in questo giorno</h2>
        <table class="tabella-lune tabella-ss">
          <thead><tr><th>Pianeta</th><th>Dal Sole (km)</th><th>Da noi (km)</th><th>Quando si vede</th></tr></thead>
          <tbody>${righe}</tbody>
        </table>
        <p class="nota">"Dal Sole" è la distanza media; "Da noi" è quella del giorno indicato, e cambia molto perché anche la Terra si muove.</p>
      </section>
      <section><h2>Come leggere la mappa</h2>
        <p>Tutti i pianeti girano attorno al Sole nello stesso verso e quasi sullo stesso piano, come biglie su un grande piatto.
          Per questo in cielo li troviamo sempre lungo la stessa fascia, quella dello zodiaco. I pianeti vicini al Sole corrono,
          quelli lontani sono lentissimi: prova i pulsanti "1 mese" e "1 anno" per vederli muoversi.</p>
        <p>Quando un pianeta si trova dalla parte opposta al Sole rispetto alla Terra, si vede tutta la notte ed è al suo meglio
          (si dice che è in opposizione). Quando invece è dietro il Sole, la sua luce si perde nel chiarore del giorno.</p>
      </section>
      <section><h2>Le distanze vere</h2>
        <p>Se il Sole fosse un pallone da calcio a Roma in piazza San Pietro, la Terra sarebbe un granello di pepe a 24 metri,
          Giove una nocciola a 120 metri e Nettuno un pisello a più di 700 metri. In mezzo, quasi solo spazio vuoto.</p>
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
