// Calcoli astronomici: posizioni, sorgere e tramonto, fasi lunari.
// Usa la libreria Astronomy Engine (variabile globale Astronomy).

const PUNTI_CARDINALI = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"];

function osservatore(luogo) {
  return new Astronomy.Observer(luogo.lat, luogo.lon, 0);
}

// Altezza (gradi sopra l'orizzonte) e azimut (0 = Nord, 90 = Est) di un oggetto.
function posizione(oggetto, data, oss) {
  let ra = oggetto.ra;
  let dec = oggetto.dec;
  if (oggetto.corpo) {
    const eq = Astronomy.Equator(oggetto.corpo, data, oss, true, true);
    ra = eq.ra;
    dec = eq.dec;
  }
  const oriz = Astronomy.Horizon(data, oss, ra, dec, "normal");
  return { altezza: oriz.altitude, azimut: oriz.azimuth };
}

function direzione(azimut) {
  return t("punto." + PUNTI_CARDINALI[Math.round(azimut / 45) % 8]);
}

// Un pugno chiuso a braccio teso copre circa 10 gradi di cielo.
function altezzaInPugni(altezza) {
  if (altezza < 5) return t("appena sopra l'orizzonte");
  if (altezza > 75) return t("quasi sopra la testa");
  const pugni = Math.round(altezza / 10);
  return pugni <= 1 ? t("circa un pugno sopra l'orizzonte") : t("circa n pugni sopra l'orizzonte", { n: pugni });
}

function cercaEvento(corpo, oss, verso, da, giorni = 1) {
  const t = Astronomy.SearchRiseSet(corpo, oss, verso, da, giorni);
  return t ? t.date : null;
}

function cercaAltezzaSole(oss, verso, da, altezza) {
  const t = Astronomy.SearchAltitude("Sun", oss, verso, da, 1, altezza);
  return t ? t.date : null;
}

function altezzaSole(data, oss) {
  return posizione({ corpo: "Sun" }, data, oss).altezza;
}

// "Stasera": quando il Sole è 12 gradi sotto l'orizzonte (cielo già buio), arrotondato al quarto d'ora.
function oraStasera(luogo, adesso = new Date()) {
  const oss = osservatore(luogo);
  if (altezzaSole(adesso, oss) < -12) return adesso;
  const mezzogiorno = new Date(adesso);
  mezzogiorno.setHours(12, 0, 0, 0);
  const da = adesso > mezzogiorno ? adesso : mezzogiorno;
  const buio = cercaAltezzaSole(oss, -1, da, -12) || new Date(da.getTime() + 8 * 3600e3);
  const quarto = 15 * 60e3;
  return new Date(Math.ceil(buio.getTime() / quarto) * quarto);
}

function nomeFase(angolo) {
  if (angolo < 10 || angolo >= 350) return t("fase.Luna nuova");
  if (angolo < 80) return t("fase.Falce crescente");
  if (angolo < 100) return t("fase.Primo quarto");
  if (angolo < 170) return t("fase.Gibbosa crescente");
  if (angolo < 190) return t("fase.Luna piena");
  if (angolo < 260) return t("fase.Gibbosa calante");
  if (angolo < 280) return t("fase.Ultimo quarto");
  return t("fase.Falce calante");
}

function infoLuna(data, oss) {
  const angolo = Astronomy.MoonPhase(data);
  const illuminata = Astronomy.Illumination("Moon", data).phase_fraction;
  const inizio = new Date(data.getTime() - 12 * 3600e3);
  return {
    angolo,
    fase: nomeFase(angolo),
    illuminata,
    sorge: cercaEvento("Moon", oss, +1, inizio, 1.5),
    tramonta: cercaEvento("Moon", oss, -1, inizio, 1.5),
    ...posizione({ corpo: "Moon" }, data, oss),
  };
}

// Tramonto, buio completo e alba della notte che contiene "data":
// dopo mezzanotte la notte è quella iniziata il giorno prima.
function infoSole(data, oss) {
  const mezzogiorno = new Date(data);
  if (mezzogiorno.getHours() < 12) mezzogiorno.setDate(mezzogiorno.getDate() - 1);
  mezzogiorno.setHours(12, 0, 0, 0);
  return {
    altezza: altezzaSole(data, oss),
    tramonta: cercaEvento("Sun", oss, -1, mezzogiorno),
    buioCompleto: cercaAltezzaSole(oss, -1, mezzogiorno, -18),
    sorge: cercaEvento("Sun", oss, +1, mezzogiorno),
  };
}

// Altezza minima perché un oggetto sia davvero osservabile: vicino all'orizzonte
// la foschia e gli edifici nascondono quasi tutto.
// Urano e Nettuno sono pianeti deboli: servono buio e altezza come per il cielo profondo.
function pianetaDebole(oggetto) {
  return oggetto.categoria === "pianeta" && oggetto.mag > 5;
}

// Galassie, ammassi e nebulose: oggetti deboli, servono buio e altezza.
function cieloProfondo(oggetto) {
  return oggetto.categoria === "profondo" || oggetto.categoria === "galassia";
}

function altezzaMinima(oggetto) {
  if (pianetaDebole(oggetto)) return 20;
  if (oggetto.categoria === "luna" || oggetto.categoria === "pianeta") return 5;
  if (cieloProfondo(oggetto)) return 20;
  return 10;
}

// Il cielo deve essere abbastanza buio: i pianeti brillanti si vedono già nel crepuscolo,
// le galassie e le nebulose solo a buio completo.
function cieloAbbastanzaBuio(oggetto, altSole) {
  if (oggetto.categoria === "luna") return altSole < 0;
  if (pianetaDebole(oggetto)) return altSole < -15;
  if (oggetto.categoria === "pianeta") return altSole < -4;
  if (cieloProfondo(oggetto)) return altSole < -15;
  return altSole < -8;
}

function cosaVedere(oggetti, data, luogo) {
  const oss = osservatore(luogo);
  const altSole = altezzaSole(data, oss);
  const luna = infoLuna(data, oss);
  const lunaDisturba = luna.altezza > 0 && luna.illuminata > 0.6;
  const ordine = { luna: 0, pianeta: 1, stella: 2, costellazione: 3, galassia: 4, profondo: 5 };

  return oggetti
    .filter((o) => (o.corpo || o.ra !== undefined) && o.stasera !== false)
    .map((o) => {
      const pos = posizione(o, data, oss);
      return {
        oggetto: o,
        ...pos,
        visibile: pos.altezza >= altezzaMinima(o) && cieloAbbastanzaBuio(o, altSole),
        disturbatoDallaLuna: (cieloProfondo(o) || pianetaDebole(o)) && lunaDisturba,
      };
    })
    .filter((r) => r.visibile)
    .sort((a, b) => ordine[a.oggetto.categoria] - ordine[b.oggetto.categoria] || a.oggetto.mag - b.oggetto.mag);
}

// Percorso SVG della parte illuminata della Luna, in un cerchio di raggio r centrato in 0,0.
function percorsoFaseLunare(angolo, r) {
  const rx = Math.abs(Math.cos((angolo * Math.PI) / 180)) * r;
  const crescente = angolo < 180;
  const bordo = crescente ? 1 : 0;
  const gibbosa = angolo > 90 && angolo < 270;
  const terminatore = crescente ? (gibbosa ? 1 : 0) : (gibbosa ? 0 : 1);
  return `M0,${-r} A${r},${r} 0 0 ${bordo} 0,${r} A${rx.toFixed(2)},${r} 0 0 ${terminatore} 0,${-r} Z`;
}
