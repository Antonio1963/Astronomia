// Strumenti del cielo: telescopi storici, grandi osservatori di oggi, telescopi spaziali e sonde.
// Le schede si modificano qui. Dati da NASA, ESA, ESO, INAF e dai siti degli osservatori.
// "collegati" sono gli id delle schede di OGGETTI (js/oggetti.js) da mostrare in fondo alla scheda.

const GRUPPI_STRUMENTI = {
  storico: { nome: "Strumenti storici", icona: "🔭" },
  terra: { nome: "Osservatori di oggi", icona: "🏔️" },
  spazio: { nome: "Nello spazio", icona: "🛰️" },
};

const STATI_STRUMENTI = {
  storico: "Storico",
  attivo: "In funzione",
  concluso: "Missione conclusa",
  costruzione: "In costruzione",
};

const STRUMENTI = [
  // ---- Strumenti storici ----
  {
    id: "uraniborg", nome: "Uraniborg, l'osservatorio di Tycho Brahe", gruppo: "storico", stato: "storico",
    tipo: "Osservatorio a occhio nudo", luce: "Luce visibile, a occhio nudo", anni: "1576–1597",
    cosa: "Il più preciso osservatorio prima dell'invenzione del telescopio. Non c'erano lenti: l'astronomo danese Tycho Brahe misurava le posizioni di stelle e pianeti con grandi quadranti e sestanti di metallo, puntati a occhio come un mirino.",
    dove: "Sull'isola di Hven, nello stretto tra Danimarca e Svezia (oggi si chiama Ven ed è svedese). Il re Federico II di Danimarca gliela diede in dono nel 1576.",
    quando: "Tycho vi lavorò dal 1576 al 1597. Oggi del castello restano le fondamenta e un museo.",
    scoperte: "Misure con un errore di circa un primo d'arco, un trentesimo del diametro della Luna: dieci volte meglio di chi lo aveva preceduto. Tycho dimostrò che la cometa del 1577 era più lontana della Luna, quindi il cielo non era immutabile. Dopo la sua morte Giovanni Keplero usò le sue misure di Marte per scoprire che i pianeti girano su ellissi (le leggi di Keplero, 1609 e 1619).",
    origine: "Uraniborg vuol dire \"castello di Urania\", la musa greca dell'astronomia. Accanto Tycho costruì anche Stjerneborg, \"castello delle stelle\", con gli strumenti mezzi interrati per ripararli dal vento.",
    curiosita: "Tycho aveva perso la punta del naso in un duello da studente e portava una protesi di metallo. Nel 1572 aveva già osservato una \"stella nuova\" in Cassiopea: oggi sappiamo che era una supernova.",
    collegati: ["cassiopea", "marte"],
  },
  {
    id: "galileo", nome: "Il cannocchiale di Galileo", gruppo: "storico", stato: "storico",
    tipo: "Telescopio rifrattore (a lenti)", luce: "Luce visibile", anni: "1609–1610",
    cosa: "Un tubo di legno e carta con due lenti, costruito da Galileo Galilei a Padova copiando e migliorando un'invenzione olandese. Ingrandiva circa 20 volte e aveva un campo stretto: inquadrava meno di metà Luna alla volta.",
    dove: "I due cannocchiali originali che si sono salvati sono al Museo Galileo di Firenze.",
    quando: "Galileo lo puntò verso il cielo tra la fine del 1609 e l'inizio del 1610. Raccontò le scoperte nel Sidereus Nuncius (\"Messaggero delle stelle\"), uscito a Venezia nel marzo 1610.",
    scoperte: "Le montagne e i crateri della Luna; le innumerevoli stelle della Via Lattea; il 7 gennaio 1610 le quattro lune maggiori di Giove; poi le fasi di Venere e le macchie solari. Le fasi di Venere furono una prova che i pianeti girano attorno al Sole.",
    origine: "Galileo lo chiamava \"occhiale\" o, in latino, \"perspicillum\". La parola \"telescopio\" nacque nel 1611 a una cena a Roma in onore di Galileo, all'Accademia dei Lincei: la propose il matematico greco Giovanni Demisiani unendo due parole greche, tele (lontano) e skopein (guardare).",
    curiosita: "Oggi un binocolo da 50 euro mostra il cielo meglio del cannocchiale di Galileo: le lune di Giove si vedono già con un 10×50 tenuto fermo.",
    collegati: ["giove", "venere", "luna"],
  },
  {
    id: "newton", nome: "Il telescopio di Newton", gruppo: "storico", stato: "storico",
    tipo: "Primo telescopio riflettore (a specchio)", luce: "Luce visibile", anni: "1668",
    cosa: "Un piccolo telescopio, lungo circa 15 cm, che al posto della lente principale usa uno specchio curvo di metallo lucidato, largo poco più di 3 cm. Isaac Newton lo costruì con le sue mani, specchio compreso.",
    dove: "Una copia storica è conservata alla Royal Society di Londra, a cui Newton lo presentò tra il 1671 e il 1672.",
    quando: "Costruito nel 1668 a Cambridge.",
    scoperte: "Non servì per nuove scoperte ma risolse un problema: le lenti dei cannocchiali creano bordi colorati attorno agli oggetti (l'aberrazione cromatica), lo specchio no. Con 40 ingrandimenti Newton vedeva bene le lune di Giove e le fasi di Venere.",
    origine: "Da allora lo schema con uno specchio principale e un piccolo specchio piatto inclinato si chiama \"newtoniano\".",
    curiosita: "Quasi tutti i grandi telescopi di oggi sono riflettori, e il newtoniano è ancora uno dei telescopi più consigliati ai principianti (per esempio il Dobson).",
  },
  {
    id: "herschel-40", nome: "Il telescopio di 40 piedi di Herschel", gruppo: "storico", stato: "storico",
    tipo: "Telescopio riflettore", luce: "Luce visibile", anni: "1789–1815 circa",
    cosa: "Un gigantesco riflettore con un tubo lungo 12 metri (40 piedi inglesi) e uno specchio di metallo largo 1,2 metri, costruito da William Herschel, musicista diventato astronomo. Per mezzo secolo fu il telescopio più grande del mondo.",
    dove: "A Slough, vicino a Windsor, in Inghilterra. Oggi ne resta un pezzo del tubo all'Osservatorio di Greenwich, a Londra.",
    quando: "Entrò in funzione nel 1789 e fu smontato nel 1840.",
    scoperte: "Nelle prime settimane Herschel scoprì due lune di Saturno, Encelado e Mimas (1789). In precedenza, il 13 marzo 1781, con un telescopio più piccolo costruito da lui a Bath aveva scoperto Urano, il primo pianeta trovato con un telescopio.",
    origine: "Si chiama come la sua misura, \"40 piedi\". Herschel voleva chiamare Urano \"Georgium Sidus\", stella di Giorgio, in onore del re Giorgio III che gli pagava lo stipendio; prevalse il nome mitologico proposto dal tedesco Johann Bode.",
    curiosita: "Lo aiutava la sorella Caroline, che scoprì otto comete e fu la prima donna pagata per fare l'astronoma. Nel 1800 William scoprì anche la luce infrarossa, mettendo un termometro oltre il rosso dell'arcobaleno di un prisma.",
    collegati: ["urano", "saturno"],
  },
  {
    id: "leviatano", nome: "Il Leviatano di Parsonstown", gruppo: "storico", stato: "storico",
    tipo: "Telescopio riflettore", luce: "Luce visibile", anni: "1845–1908 circa",
    cosa: "Un telescopio con uno specchio di metallo largo 1,83 metri e un tubo di 16 metri, appeso tra due muri di pietra. Lo costruì William Parsons, terzo conte di Rosse. Fu il più grande del mondo dal 1845 al 1917.",
    dove: "Nel parco del castello di Birr, in Irlanda. È stato restaurato negli anni '90 e si può visitare.",
    quando: "Prima luce nel 1845.",
    scoperte: "Nell'aprile 1845 Lord Rosse vide e disegnò per primo la forma a spirale di una \"nebulosa\", M51, oggi nota come Galassia Vortice. Non si sapeva ancora che fossero galassie lontane, ma quel disegno fece il giro d'Europa.",
    origine: "Leviatano è il mostro marino della Bibbia, per le dimensioni enormi. Parsonstown era l'antico nome della cittadina di Birr.",
    curiosita: "L'Irlanda ha cieli spesso coperti: Lord Rosse riusciva a osservare bene solo poche notti all'anno.",
  },
  {
    id: "brera", nome: "Il rifrattore Merz di Brera", gruppo: "storico", stato: "storico",
    tipo: "Telescopio rifrattore", luce: "Luce visibile", anni: "dal 1875",
    cosa: "Un cannocchiale con una lente di quasi 22 centimetri (218 mm) e lungo più di 3 metri, costruito a Monaco di Baviera dalla ditta Merz, usato da Giovanni Virginio Schiaparelli all'Osservatorio di Brera, a Milano.",
    dove: "L'Osservatorio di Brera, fondato dai gesuiti nel 1764 nel palazzo di Brera, oggi è una sede dell'INAF. Il cannocchiale è esposto nel Museo Astronomico di Brera.",
    quando: "Ordinato nel 1862, l'anno in cui Schiaparelli divenne direttore, arrivò a Brera nel 1865 e cominciò a osservare regolarmente nel 1875, dalla nuova cupola sul tetto del palazzo.",
    scoperte: "Durante l'opposizione di Marte del 1877 Schiaparelli disegnò la mappa più dettagliata del pianeta mai fatta fino ad allora, con mari e \"canali\". Molti nomi delle regioni di Marte che usiamo ancora oggi sono suoi.",
    origine: "Brera viene da \"braida\", parola longobarda per un campo aperto in città. Merz è il cognome di Georg Merz, l'ottico tedesco che lo costruì.",
    curiosita: "I \"canali\" di Schiaparelli erano solcature naturali: tradotti in inglese come \"canals\", cioè opere scavate, fecero nascere la leggenda dei marziani. Schiaparelli scoprì anche che lo sciame delle Perseidi nasce dalla polvere di una cometa.",
    collegati: ["marte"],
  },
  {
    id: "hooker", nome: "Il telescopio Hooker di Monte Wilson", gruppo: "storico", stato: "storico",
    tipo: "Telescopio riflettore", luce: "Luce visibile", anni: "dal 1917",
    cosa: "Un riflettore con uno specchio di vetro largo 2,5 metri (100 pollici), il più grande del mondo dal 1917 al 1948.",
    dove: "Sul Monte Wilson, a 1.740 metri, sopra Los Angeles (California).",
    quando: "Prima luce nel novembre 1917. Funziona ancora, oggi soprattutto per ricerca e serate col pubblico.",
    scoperte: "Nel 1923 Edwin Hubble vi riconobbe una stella variabile dentro la \"nebulosa\" di Andromeda e calcolò che era lontanissima: Andromeda è un'altra galassia. Nel 1929 Hubble, con Milton Humason, mostrò che le galassie si allontanano tra loro: l'universo si espande.",
    origine: "Prende il nome da John D. Hooker, uomo d'affari di Los Angeles che pagò lo specchio. Il monte si chiama come Benjamin Davis Wilson, che nel 1864 aprì il primo sentiero per cercare legname.",
    curiosita: "Le luci di Los Angeles, cresciuta enormemente, oggi rendono il cielo di Monte Wilson molto chiaro: è l'inquinamento luminoso.",
    collegati: ["andromeda"],
  },
  {
    id: "palomar", nome: "Il telescopio Hale di Monte Palomar", gruppo: "storico", stato: "storico",
    tipo: "Telescopio riflettore", luce: "Luce visibile e infrarosso", anni: "dal 1948",
    cosa: "Un riflettore con uno specchio di 5 metri (200 pollici) che pesa 14 tonnellate. Fu il telescopio più potente del mondo per circa quarant'anni.",
    dove: "Sul Monte Palomar, a circa 1.700 metri, nel sud della California.",
    quando: "Inaugurato nel 1948, è in uso ancora oggi.",
    scoperte: "Nel 1963 Maarten Schmidt capì che la \"stella\" 3C 273 era in realtà lontanissima e di una potenza enorme: era il primo quasar riconosciuto, il cuore di una galassia con un buco nero gigante. Con un telescopio più piccolo dello stesso osservatorio, nel 1993, fu scoperta la cometa Shoemaker-Levy 9, che l'anno dopo si schiantò su Giove.",
    origine: "Dedicato a George Ellery Hale, astronomo che raccolse i fondi ma morì nel 1938, prima di vederlo finito. \"Palomar\" in spagnolo vuol dire colombaia.",
    curiosita: "Lo specchio fu fuso nel 1934 in vetro Pyrex e attraversò gli Stati Uniti in treno, a bassa velocità, seguito dai giornali come una star.",
  },
  {
    id: "jansky", nome: "L'antenna di Karl Jansky", gruppo: "storico", stato: "storico",
    tipo: "Prima antenna radioastronomica", luce: "Onde radio", anni: "1931–1932",
    cosa: "Un'antenna lunga 30 metri, montata su ruote di automobile per poterla girare in tondo. L'ingegnere Karl Jansky la costruì per i Bell Telephone Laboratories per capire da dove venissero i disturbi delle telefonate via radio.",
    dove: "A Holmdel, nel New Jersey (Stati Uniti). Una copia si trova all'osservatorio di Green Bank.",
    quando: "Le misure durarono dal 1931 al 1932; la scoperta fu pubblicata nel 1933.",
    scoperte: "Oltre ai temporali, Jansky trovò un debole fruscio che ogni giorno arrivava da una direzione precisa del cielo: il centro della nostra galassia, verso la costellazione del Sagittario. Era nata la radioastronomia.",
    origine: "In suo onore l'unità con cui si misura l'intensità delle radiosorgenti si chiama jansky.",
    curiosita: "La chiamavano \"la giostra di Jansky\", perché girava su sé stessa una volta ogni venti minuti.",
  },
  {
    id: "arecibo", nome: "Il radiotelescopio di Arecibo", gruppo: "storico", stato: "concluso",
    tipo: "Radiotelescopio", luce: "Onde radio", anni: "1963–2020",
    cosa: "Una parabola di 305 metri adagiata dentro una dolina naturale, con l'antenna ricevente appesa sopra con dei cavi. Per oltre cinquant'anni fu il radiotelescopio a parabola singola più grande del mondo.",
    dove: "Vicino ad Arecibo, nell'isola di Porto Rico (Caraibi).",
    quando: "Dal 1963 al 1° dicembre 2020, quando la piattaforma sospesa crollò dopo la rottura di alcuni cavi.",
    scoperte: "Nel 1965 misurò che Mercurio ruota su sé stesso in 59 giorni. Nel 1974 vi fu scoperta la prima pulsar doppia, che confermò la relatività di Einstein (premio Nobel 1993). Nel 1992 vi furono trovati i primi pianeti fuori dal Sistema Solare, attorno a una pulsar.",
    origine: "Prende il nome dalla città di Arecibo, che secondo la tradizione si chiama come un capo indigeno taíno, Arasibo.",
    curiosita: "Il 16 novembre 1974 da Arecibo fu spedito verso l'ammasso globulare M13 il \"messaggio di Arecibo\", un disegno in codice binario: arriverà fra circa 25.000 anni. Il telescopio compare nei film GoldenEye e Contact.",
    collegati: ["m13", "mercurio"],
  },

  // ---- Osservatori di oggi, a terra ----
  {
    id: "vlt", nome: "VLT, Very Large Telescope", gruppo: "terra", stato: "attivo",
    tipo: "Quattro telescopi da 8,2 metri", luce: "Luce visibile e infrarosso", anni: "dal 1998",
    cosa: "Quattro grandi telescopi con specchi da 8,2 metri, più quattro telescopi ausiliari da 1,8 metri, che possono lavorare da soli o insieme. È il principale osservatorio dell'ESO, l'Osservatorio Europeo Australe, di cui fa parte anche l'Italia.",
    dove: "Sul Cerro Paranal, a 2.635 metri, nel deserto di Atacama in Cile: uno dei posti più secchi e bui della Terra.",
    quando: "Il primo dei quattro telescopi vide la prima luce nel 1998.",
    scoperte: "Nel 2004 la prima foto di un pianeta fuori dal Sistema Solare (2M1207b). Per anni ha seguito le stelle che girano attorno al buco nero al centro della Via Lattea: per queste ricerche Reinhard Genzel ha avuto il Nobel nel 2020. Ha contribuito anche alla scoperta di Proxima b, il pianeta della stella più vicina al Sole.",
    origine: "Very Large Telescope vuol dire \"telescopio molto grande\". I quattro telescopi hanno nomi nella lingua mapuche del Cile: Antu (Sole), Kueyen (Luna), Melipal (Croce del Sud) e Yepun (Venere).",
    curiosita: "Quei nomi li propose nel 1999 una ragazza cilena di 17 anni, vincitrice di un concorso. L'albergo per i tecnici di Paranal compare nel film di James Bond Quantum of Solace.",
  },
  {
    id: "keck", nome: "Osservatorio Keck", gruppo: "terra", stato: "attivo",
    tipo: "Due telescopi da 10 metri", luce: "Luce visibile e infrarosso", anni: "dal 1993",
    cosa: "Due telescopi gemelli con specchi da 10 metri, ognuno fatto di 36 tasselli esagonali che lavorano come uno specchio unico. Fu il primo grande telescopio a specchio \"segmentato\", l'idea che oggi usano tutti i giganti.",
    dove: "In cima al Mauna Kea, vulcano spento delle Hawaii, a 4.145 metri.",
    quando: "Keck I nel 1993, Keck II nel 1996.",
    scoperte: "Andrea Ghez vi ha misurato le orbite delle stelle attorno al buco nero al centro della Via Lattea: Nobel per la fisica 2020. Nel 2008, insieme al telescopio Gemini, scattò le prime foto di un intero sistema di pianeti attorno a un'altra stella (HR 8799). Ha contribuito a scoprire che l'espansione dell'universo accelera.",
    origine: "Prende il nome dalla fondazione di William Myron Keck, petroliere, che finanziò la costruzione. Mauna Kea in hawaiano vuol dire \"montagna bianca\", perché d'inverno la cima è innevata.",
    curiosita: "Per i nativi hawaiani la cima del Mauna Kea è sacra, e la costruzione di nuovi telescopi lassù è da anni al centro di proteste.",
  },
  {
    id: "gtc", nome: "Gran Telescopio Canarias", gruppo: "terra", stato: "attivo",
    tipo: "Telescopio da 10,4 metri", luce: "Luce visibile e infrarosso", anni: "dal 2009",
    cosa: "Il telescopio ottico con lo specchio singolo più grande del mondo: 10,4 metri, formato da 36 tasselli esagonali. È spagnolo, con la partecipazione del Messico e dell'Università della Florida.",
    dove: "All'Osservatorio del Roque de los Muchachos, a circa 2.300 metri, sull'isola di La Palma (Canarie, Spagna).",
    quando: "Prima luce nel 2007, osservazioni scientifiche dal 2009.",
    scoperte: "Studia galassie lontanissime, stelle che esplodono, buchi neri e i piccoli corpi ghiacciati oltre Nettuno.",
    origine: "Gran Telescopio Canarias, per gli amici GranTeCan. Roque de los Muchachos vuol dire \"rocca dei ragazzi\", per delle rocce che da lontano sembrano figure di giovani.",
    curiosita: "Dal 1988 le Canarie hanno una \"legge del cielo\" che limita l'illuminazione notturna per proteggere gli osservatori dall'inquinamento luminoso.",
  },
  {
    id: "tng", nome: "Telescopio Nazionale Galileo", gruppo: "terra", stato: "attivo",
    tipo: "Telescopio da 3,6 metri", luce: "Luce visibile e infrarosso", anni: "dal 1998",
    cosa: "Il più grande telescopio ottico italiano, con uno specchio di 3,58 metri. È gestito dall'INAF, l'Istituto Nazionale di Astrofisica.",
    dove: "Sull'isola di La Palma (Canarie), accanto al Gran Telescopio Canarias, a circa 2.400 metri.",
    quando: "In funzione dal 1998.",
    scoperte: "Con lo strumento HARPS-N misura con grande precisione la massa dei pianeti di altre stelle. Nel 2013 contribuì a mostrare che il pianeta Kepler-78b ha una densità simile a quella della Terra, cioè è fatto di roccia e ferro.",
    origine: "Dedicato a Galileo Galilei, il primo a puntare un cannocchiale verso il cielo.",
    curiosita: "È in Spagna e non in Italia perché sulle Alpi e sugli Appennini il cielo è troppo umido e illuminato: le Canarie hanno aria limpida e calma sopra le nuvole.",
  },
  {
    id: "lbt", nome: "LBT, Large Binocular Telescope", gruppo: "terra", stato: "attivo",
    tipo: "Due specchi da 8,4 metri su un'unica montatura", luce: "Luce visibile e infrarosso", anni: "dal 2005",
    cosa: "Un \"binocolo\" gigante: due specchi da 8,4 metri montati fianco a fianco. Usati insieme raccolgono la luce di uno specchio da 11,8 metri e vedono i dettagli come uno da quasi 23 metri. L'Italia, con l'INAF, ne possiede un quarto e ha costruito parte degli strumenti.",
    dove: "Sul Monte Graham, in Arizona (Stati Uniti), a 3.221 metri.",
    quando: "Primo specchio nel 2005, entrambi dal 2008.",
    scoperte: "Usando i due specchi insieme ha fotografato i laghi di lava sulla luna Io di Giove, a 600 milioni di km. È tra i migliori al mondo nell'\"ottica adattiva\", che corregge in tempo reale il tremolio dell'aria.",
    origine: "Large Binocular Telescope: grande telescopio binoculare.",
    curiosita: "Sullo stesso monte c'è il telescopio della Specola Vaticana, l'osservatorio del Papa.",
    collegati: ["giove"],
  },
  {
    id: "alma", nome: "ALMA", gruppo: "terra", stato: "attivo",
    tipo: "66 antenne radio", luce: "Onde millimetriche (tra radio e infrarosso)", anni: "dal 2013",
    cosa: "Sessantasei antenne paraboliche da 12 e 7 metri che lavorano insieme come un unico telescopio largo fino a 16 km. Vede il gas freddo e le polveri dove nascono stelle e pianeti, invisibili ai telescopi normali.",
    dove: "Sull'altopiano di Chajnantor, a 5.000 metri, nel deserto di Atacama in Cile.",
    quando: "Inaugurato nel 2013. È una collaborazione tra Europa (ESO), Nord America ed Est asiatico con il Cile.",
    scoperte: "Nel 2014 fotografò per la prima volta gli anelli di un disco di polvere attorno a una giovane stella, HL Tauri: i solchi sono probabilmente scavati da pianeti in formazione. È una delle antenne chiave dell'Event Horizon Telescope.",
    origine: "ALMA è la sigla di Atacama Large Millimeter/submillimeter Array; in spagnolo \"alma\" vuol dire anima.",
    curiosita: "Le antenne, da 100 tonnellate l'una, vengono spostate per cambiare la forma della rete da due enormi camion chiamati Otto e Lore. I tecnici lassù respirano con bombole di ossigeno.",
  },
  {
    id: "eht", nome: "Event Horizon Telescope", gruppo: "terra", stato: "attivo",
    tipo: "Rete di radiotelescopi grande come la Terra", luce: "Onde radio millimetriche", anni: "dal 2017",
    cosa: "Non è un telescopio unico ma una rete di radiotelescopi sparsi in tutto il mondo (Cile, Hawaii, Spagna, Messico, Polo Sud e altri) che osservano insieme nella stessa notte. Combinando i dati con orologi atomici diventano un telescopio virtuale grande quanto la Terra.",
    dove: "Ovunque ci sia un radiotelescopio adatto: dalle Ande al Polo Sud.",
    quando: "La prima grande campagna fu nell'aprile 2017.",
    scoperte: "Il 10 aprile 2019 mostrò la prima immagine di un buco nero, quello al centro della galassia M87, 6,5 miliardi di volte la massa del Sole. Il 12 maggio 2022 quella di Sagittarius A*, il buco nero al centro della nostra Via Lattea.",
    origine: "L'orizzonte degli eventi è il confine di un buco nero: oltre quel limite niente, nemmeno la luce, può tornare indietro.",
    curiosita: "I dati erano così tanti che non si potevano spedire via Internet: viaggiarono in aereo su centinaia di dischi rigidi.",
  },
  {
    id: "srt", nome: "Sardinia Radio Telescope (SRT)", gruppo: "terra", stato: "attivo",
    tipo: "Radiotelescopio da 64 metri", luce: "Onde radio", anni: "dal 2013",
    cosa: "Il più grande radiotelescopio italiano: una parabola di 64 metri con una superficie \"attiva\", fatta di pannelli mossi da motorini che la correggono di frazioni di millimetro per tenerla perfetta mentre il telescopio si inclina. È uno dei tre grandi radiotelescopi italiani dell'INAF, insieme a quelli di Medicina e di Noto (ognuno ha la sua scheda).",
    dove: "A San Basilio, nel sud della Sardegna, a circa 35 km da Cagliari.",
    quando: "Inaugurato nel 2013.",
    scoperte: "Studia pulsar, galassie e il Sole, e collabora con le reti di radiotelescopi europee e mondiali. L'Agenzia Spaziale Italiana lo usa anche per comunicare con le sonde nello spazio.",
    origine: "Sardinia Radio Telescope, cioè radiotelescopio della Sardegna.",
    curiosita: "Fu progettato dai radioastronomi di Medicina, che lo idearono nel 1999: la costruzione iniziò nel 2003.",
  },
  {
    id: "medicina", nome: "Il radiotelescopio di Medicina e la Croce del Nord", gruppo: "terra", stato: "attivo",
    tipo: "Croce del Nord e parabola da 32 metri", luce: "Onde radio", anni: "dal 1964",
    cosa: "La culla della radioastronomia italiana. Ha due strumenti: la Croce del Nord, un'enorme antenna fatta di lunghe file di \"cilindri\" metallici disposti a T, uno dei radiotelescopi più grandi del mondo per superficie; e una parabola da 32 metri che può puntare ovunque nel cielo. Li gestisce l'INAF, Istituto di Radioastronomia.",
    dove: "In aperta campagna nel comune di Medicina, a circa 30 km da Bologna. Accanto c'è il Centro Visite \"Marcello Ceccarelli\", aperto al pubblico dal 2005.",
    quando: "La radioastronomia a Bologna cominciò nel 1959 e il primo prototipo fu montato nel 1960. La Croce del Nord fu inaugurata nel novembre 1964 e lavorò a pieno regime dal 1967; la parabola da 32 metri fu inaugurata nel 1983.",
    scoperte: "Con la Croce del Nord furono compilati i cataloghi di radiosorgenti \"di Bologna\": il primo, nel 1968, ne contava 328, il secondo (B2) migliaia. Nel luglio 1994 la parabola captò il segnale del vapore d'acqua liberato dallo schianto della cometa Shoemaker-Levy 9 su Giove. Il 3 marzo 2021 la Croce del Nord registrò il suo primo \"lampo radio veloce\" (FRB), un impulso di 8 millesimi di secondo arrivato da una galassia a 485 milioni di anni luce.",
    origine: "Il radiotelescopio prende il nome dal paese. Secondo la tradizione Medicina deve il suo nome a una pozione che guarì l'imperatore Federico Barbarossa. La Croce del Nord si chiama così per la sua forma (in origine era una vera croce) e ricorda l'asterismo con lo stesso nome nella costellazione del Cigno.",
    curiosita: "La Croce del Nord fu ideata da Marcello Ceccarelli, il fisico che fondò la radioastronomia italiana. Oggi una parte dell'antenna, insieme all'Agenzia Spaziale Italiana, sorveglia anche i detriti spaziali in orbita attorno alla Terra, e la parabola partecipa alle reti di radiotelescopi che uniscono antenne di tutto il mondo (VLBI).",
    collegati: ["cigno", "giove"],
  },
  {
    id: "noto", nome: "Il radiotelescopio di Noto", gruppo: "terra", stato: "attivo",
    tipo: "Radiotelescopio da 32 metri", luce: "Onde radio", anni: "dal 1988",
    cosa: "Una parabola da 32 metri che pesa più di 300 tonnellate e gira su una rotaia circolare. È gemella di quella di Medicina, ma ha una superficie attiva: 240 pannelli spinti da 244 piccoli motori che correggono le deformazioni dovute al peso, così può osservare anche le onde radio più corte, di pochi millimetri. La gestisce l'INAF, Istituto di Radioastronomia.",
    dove: "In contrada Renna Bassa, nel comune di Noto, in provincia di Siracusa (Sicilia). È uno dei radiotelescopi più a sud d'Europa, e da lì vede più in basso verso il cielo australe.",
    quando: "Inaugurato il 28 ottobre 1988. Nel 2010 si ruppe un cuscinetto di una delle ruote: dopo due anni di fermo e lavori per circa un milione di euro, tornò a osservare nel gennaio 2012.",
    scoperte: "Lavora soprattutto in rete con le antenne di tutto il mondo (VLBI) per studiare con grande dettaglio quasar, nuclei di galassie e stelle nascenti. Serve anche alla geodesia: misurando con precisione le distanze tra antenne lontanissime si vede di quanti millimetri all'anno si spostano i continenti, compresa la Sicilia spinta dall'Africa. Viene usato anche per seguire sonde spaziali e detriti in orbita.",
    origine: "Prende il nome dalla città di Noto, l'antica Netum dei romani, famosa per il suo barocco patrimonio dell'UNESCO.",
    curiosita: "Dal 2012 è collegato con la fibra ottica alla rete della ricerca italiana: i suoi dati arrivano in tempo reale al centro europeo che li combina con quelli delle altre antenne (e-VLBI), senza dover spedire i dischi rigidi.",
  },
  {
    id: "fast", nome: "FAST, l'Occhio del Cielo", gruppo: "terra", stato: "attivo",
    tipo: "Radiotelescopio da 500 metri", luce: "Onde radio", anni: "dal 2016",
    cosa: "Il radiotelescopio a parabola singola più grande del mondo: 500 metri di diametro, l'area di circa trenta campi da calcio, costruito in una conca naturale tra le colline.",
    dove: "Nella provincia del Guizhou, nel sud della Cina.",
    quando: "Completato nel 2016.",
    scoperte: "Ha scoperto più di mille pulsar, stelle morte che ruotano velocissime e mandano impulsi radio regolari come un faro.",
    origine: "FAST è la sigla inglese di \"telescopio sferico con apertura di 500 metri\". In cinese si chiama Tianyan, \"Occhio del Cielo\".",
    curiosita: "Attorno al telescopio c'è una zona di silenzio radio di 5 km: per costruirlo sono stati spostati alcuni villaggi, e ai visitatori si chiede di lasciare il telefono.",
  },
  {
    id: "rubin", nome: "Osservatorio Vera C. Rubin", gruppo: "terra", stato: "attivo",
    tipo: "Telescopio da 8,4 metri con la fotocamera più grande del mondo", luce: "Luce visibile", anni: "dal 2025",
    cosa: "Un telescopio a grande campo che fotografa tutto il cielo visibile dal Cile ogni tre o quattro notti, per dieci anni, e ne fa un \"film\" a colori. La sua fotocamera ha 3.200 megapixel, centinaia di volte quelli di un telefono.",
    dove: "Sul Cerro Pachón, a circa 2.700 metri, nelle Ande del Cile.",
    quando: "Prime immagini il 23 giugno 2025. Il grande censimento del cielo, chiamato LSST, dura dieci anni.",
    scoperte: "Nelle prime 10 ore di prova ha trovato più di 2.000 asteroidi mai visti. Scoverà milioni di asteroidi e supernove e aiuterà a mappare la materia oscura.",
    origine: "Dedicato a Vera Rubin (1928–2016), l'astronoma americana che, misurando come ruotano le galassie, trovò una delle prove più forti dell'esistenza della materia oscura. È il primo osservatorio nazionale americano intitolato a una donna.",
    curiosita: "Ogni notte produce circa 20 terabyte di dati, e manda un avviso automatico in pochi minuti per ogni oggetto che cambia nel cielo.",
  },
  {
    id: "elt", nome: "ELT, Extremely Large Telescope", gruppo: "terra", stato: "costruzione",
    tipo: "Telescopio da 39 metri", luce: "Luce visibile e infrarosso", anni: "in costruzione",
    cosa: "Sarà il più grande telescopio ottico del mondo: uno specchio di 39 metri formato da 798 tasselli esagonali. Raccoglierà più luce di tutti i grandi telescopi di oggi messi insieme. Lo costruisce l'ESO.",
    dove: "Sul Cerro Armazones, a 3.046 metri, nel deserto di Atacama in Cile, a 20 km dal VLT.",
    quando: "Lavori iniziati nel 2014. Secondo l'ESO le prime osservazioni di prova sono previste nel 2029 e le prime osservazioni scientifiche a dicembre 2030.",
    scoperte: "Ancora nessuna: cercherà l'atmosfera di pianeti simili alla Terra attorno ad altre stelle e le prime galassie dell'universo.",
    origine: "Extremely Large Telescope, \"telescopio estremamente grande\": gli astronomi, dopo il Very Large Telescope, hanno continuato a salire con gli aggettivi. Un progetto precedente, mai costruito, si chiamava OWL, \"Overwhelmingly Large\" (schiacciantemente grande).",
    curiosita: "L'Italia ha un ruolo di primo piano: la cupola e la struttura sono di un consorzio con aziende italiane, e l'INAF guida la costruzione di MORFEO, lo strumento che correggerà il tremolio dell'aria.",
  },
  {
    id: "virgo", nome: "Virgo e LIGO, i rivelatori di onde gravitazionali", gruppo: "terra", stato: "attivo",
    tipo: "Interferometri laser", luce: "Onde gravitazionali (non è luce)", anni: "dal 2015",
    cosa: "Non sono telescopi: sono due lunghi tubi a L, nel vuoto, percorsi da raggi laser. Quando passa un'onda gravitazionale, una minuscola increspatura dello spazio prevista da Einstein, i bracci si allungano e si accorciano di meno di un millesimo del diametro di un protone.",
    dove: "Virgo è a Cascina, vicino a Pisa, con bracci di 3 km: è italo-francese (INFN e CNRS) con altri paesi europei. I due LIGO sono negli Stati Uniti, a Hanford e a Livingston, con bracci di 4 km.",
    quando: "La prima onda gravitazionale fu captata da LIGO il 14 settembre 2015. Virgo si unì alle osservazioni nel 2017.",
    scoperte: "La prima fusione di due buchi neri, a 1,3 miliardi di anni luce (Nobel 2017). Il 17 agosto 2017, con Virgo, lo scontro di due stelle di neutroni, poi osservato anche dai telescopi: si scoprì che scontri così fabbricano oro e platino.",
    origine: "Virgo prende il nome dall'ammasso di galassie della Vergine. LIGO è la sigla inglese di \"osservatorio di onde gravitazionali a interferometro laser\".",
    curiosita: "L'Italia candida la Sardegna (miniera di Sos Enattos, vicino a Lula) per ospitare l'Einstein Telescope, il futuro rivelatore europeo, sotterraneo e con bracci di 10 km.",
  },

  // ---- Nello spazio ----
  {
    id: "hubble", nome: "Telescopio spaziale Hubble", gruppo: "spazio", stato: "attivo",
    tipo: "Telescopio spaziale", luce: "Luce visibile, ultravioletto e vicino infrarosso", anni: "dal 1990",
    cosa: "Un telescopio con uno specchio di 2,4 metri, grande come un autobus, che gira attorno alla Terra sopra l'atmosfera: lassù le stelle non tremolano e l'immagine è nitidissima. È della NASA con la partecipazione dell'ESA.",
    dove: "In orbita attorno alla Terra a circa 530 km di altezza; fa un giro ogni 95 minuti.",
    quando: "Lanciato il 24 aprile 1990 con lo Space Shuttle Discovery. Gli astronauti lo hanno riparato e aggiornato cinque volte, l'ultima nel 2009.",
    scoperte: "Ha misurato l'età dell'universo (circa 13,8 miliardi di anni) e ha contribuito a scoprire che la sua espansione accelera (Nobel 2011). Con l'Hubble Deep Field (1995) ha mostrato migliaia di galassie in un pezzetto di cielo che sembrava vuoto. Ha fotografato lo schianto della cometa Shoemaker-Levy 9 su Giove (1994) e i \"Pilastri della Creazione\".",
    origine: "Dedicato a Edwin Hubble, che negli anni '20 dimostrò che esistono altre galassie e che l'universo si espande.",
    curiosita: "Appena lanciato vedeva sfocato: lo specchio era sbagliato di circa 2 millesimi di millimetro, un cinquantesimo dello spessore di un capello. Nel 1993 gli astronauti gli montarono degli \"occhiali\" correttivi.",
    collegati: ["andromeda", "nebulosa-orione", "giove"],
  },
  {
    id: "webb", nome: "Telescopio spaziale James Webb", gruppo: "spazio", stato: "attivo",
    tipo: "Telescopio spaziale", luce: "Infrarosso", anni: "dal 2021",
    cosa: "Il più grande telescopio mai mandato nello spazio: uno specchio di 6,5 metri formato da 18 tasselli esagonali ricoperti d'oro. Vede nell'infrarosso, la luce del calore, e per farlo deve stare a meno di 230 gradi sotto zero, riparato da uno scudo solare grande come un campo da tennis. È di NASA, ESA e Agenzia Spaziale Canadese.",
    dove: "A 1,5 milioni di km dalla Terra, dalla parte opposta al Sole, in un punto di equilibrio chiamato L2 (secondo punto di Lagrange).",
    quando: "Lanciato il 25 dicembre 2021 da Kourou, nella Guyana francese, con un razzo europeo Ariane 5. Prime immagini nel luglio 2022.",
    scoperte: "Ha visto galassie nate circa 300 milioni di anni dopo il Big Bang, molte più del previsto. Nel 2022 ha trovato anidride carbonica nell'atmosfera di un pianeta di un'altra stella (WASP-39b). Studia anche le atmosfere dei pianeti di TRAPPIST-1.",
    origine: "Dedicato a James E. Webb, che guidò la NASA dal 1961 al 1968, negli anni della preparazione del programma Apollo.",
    curiosita: "Il razzo Ariane 5 lo mise in rotta con una precisione tale da risparmiare carburante: potrà lavorare per più di vent'anni.",
  },
  {
    id: "chandra", nome: "Osservatorio a raggi X Chandra", gruppo: "spazio", stato: "attivo",
    tipo: "Telescopio spaziale", luce: "Raggi X", anni: "dal 1999",
    cosa: "Un telescopio che vede i raggi X, la luce emessa da gas caldissimi a milioni di gradi: attorno ai buchi neri, nei resti di supernova, negli ammassi di galassie. L'atmosfera ferma i raggi X, quindi si possono vedere solo dallo spazio.",
    dove: "Su un'orbita molto allungata attorno alla Terra, che lo porta fino a oltre un terzo della distanza della Luna.",
    quando: "Lanciato il 23 luglio 1999 con lo Space Shuttle Columbia, la prima missione Shuttle guidata da una donna, Eileen Collins.",
    scoperte: "Nel 2006 l'Ammasso Proiettile (Bullet Cluster), due ammassi di galassie scontrati, ha dato una prova diretta della materia oscura. Ha fotografato la stella di neutroni al centro del resto di supernova Cassiopea A.",
    origine: "Dedicato all'astrofisico indiano Subrahmanyan Chandrasekhar, Nobel 1983, che studiò come muoiono le stelle. \"Chandra\" in sanscrito vuol dire Luna, o splendente. Il nome fu scelto con un concorso vinto da uno studente e un'insegnante.",
    curiosita: "Il telescopio lo propose nel 1976 l'italiano Riccardo Giacconi, il padre dell'astronomia a raggi X, premio Nobel 2002.",
    collegati: ["cassiopea"],
  },
  {
    id: "spitzer", nome: "Telescopio spaziale Spitzer", gruppo: "spazio", stato: "concluso",
    tipo: "Telescopio spaziale", luce: "Infrarosso", anni: "2003–2020",
    cosa: "Un telescopio a infrarossi con uno specchio di 85 cm, raffreddato quasi allo zero assoluto. Vedeva attraverso le nubi di polvere dove nascono le stelle.",
    dove: "Su un'orbita attorno al Sole, dietro alla Terra, da cui si allontanava piano piano.",
    quando: "Dal 25 agosto 2003 al 30 gennaio 2020.",
    scoperte: "Nel 2017 contribuì a scoprire i sette pianeti rocciosi della stella TRAPPIST-1. Nel 2009 trovò attorno a Saturno un anello gigantesco, sottile e invisibile, prodotto dalla luna Febe. Fu uno dei primi telescopi a misurare la luce di un pianeta di un'altra stella.",
    origine: "Dedicato a Lyman Spitzer, l'astronomo che già nel 1946 propose di mettere i telescopi nello spazio, sopra l'atmosfera.",
    curiosita: "Il liquido refrigerante finì nel 2009, ma Spitzer continuò a lavorare ancora per oltre dieci anni con gli strumenti che funzionavano anche \"caldi\".",
    collegati: ["saturno"],
  },
  {
    id: "kepler", nome: "Telescopio spaziale Kepler", gruppo: "spazio", stato: "concluso",
    tipo: "Cacciatore di pianeti", luce: "Luce visibile", anni: "2009–2018",
    cosa: "Un telescopio che fissava sempre lo stesso pezzo di cielo, tra il Cigno e la Lira, misurando la luce di 150.000 stelle. Quando un pianeta passa davanti alla sua stella, la luce cala di pochissimo: è il metodo dei transiti.",
    dove: "Su un'orbita attorno al Sole, dietro alla Terra.",
    quando: "Lanciato il 7 marzo 2009, spento il 30 ottobre 2018 quando finì il carburante.",
    scoperte: "Più di 2.600 pianeti confermati: ha mostrato che i pianeti sono più numerosi delle stelle. Kepler-186f (2014) fu il primo pianeta grande come la Terra trovato nella zona dove potrebbe esserci acqua liquida. Kepler-16b gira attorno a due soli, come il pianeta Tatooine di Guerre Stellari.",
    origine: "Dedicato a Giovanni Keplero (Johannes Kepler), che all'inizio del Seicento scoprì le leggi del moto dei pianeti.",
    curiosita: "Nel 2013 si ruppero due delle ruote che lo tenevano puntato. I tecnici inventarono un trucco: usare la pressione della luce del Sole come terza ruota. Così nacque la missione K2, durata altri cinque anni.",
    collegati: ["cigno", "vega"],
  },
  {
    id: "tess", nome: "TESS, il cacciatore di pianeti", gruppo: "spazio", stato: "attivo",
    tipo: "Telescopio spaziale", luce: "Luce visibile e vicino infrarosso", anni: "dal 2018",
    cosa: "Il successore di Kepler. Con quattro fotocamere osserva quasi tutto il cielo, una striscia alla volta per 27 giorni, cercando i pianeti che passano davanti a stelle vicine e luminose, più facili da studiare poi con altri telescopi.",
    dove: "Su un'orbita molto allungata attorno alla Terra, che percorre in 13,7 giorni, \"a tempo\" con la Luna.",
    quando: "Lanciato il 18 aprile 2018.",
    scoperte: "Centinaia di pianeti confermati e migliaia di candidati. Nel 2020 trovò TOI-700 d, un pianeta grande come la Terra nella zona abitabile della sua stella, a circa 100 anni luce.",
    origine: "TESS è la sigla inglese di \"satellite per la ricerca di esopianeti in transito\".",
    curiosita: "La sua orbita, in risonanza con la Luna, è così stabile che potrà restarci per decenni senza consumare carburante.",
  },
  {
    id: "gaia", nome: "Gaia, la mappa della Via Lattea", gruppo: "spazio", stato: "concluso",
    tipo: "Satellite astrometrico", luce: "Luce visibile", anni: "2013–2025",
    cosa: "Un satellite dell'ESA che ha misurato posizione, distanza, movimento e colore di quasi due miliardi di stelle, costruendo la mappa tridimensionale più precisa della nostra galassia.",
    dove: "Nel punto L2, a 1,5 milioni di km dalla Terra, come il James Webb.",
    quando: "Lanciato il 19 dicembre 2013; ha finito di osservare il 15 gennaio 2025 ed è stato spento il 27 marzo 2025. Il nuovo grande catalogo, con i dati dei primi cinque anni e mezzo, esce il 2 dicembre 2026.",
    scoperte: "Ha scoperto che la Via Lattea, miliardi di anni fa, ha \"inghiottito\" una galassia più piccola (Gaia-Encelado). Nel 2024 ha trovato Gaia BH3, un buco nero dormiente di 33 masse solari a meno di 2.000 anni luce: il più grande buco nero di origine stellare noto nella nostra galassia.",
    origine: "Doveva essere una sigla (Global Astrometric Interferometer for Astrophysics). Il progetto poi cambiò, ma il nome della dea greca della Terra è rimasto.",
    curiosita: "Le sue misure sono così fini che da Gaia si potrebbe vedere una moneta sulla Luna. Una parte dei dati è stata elaborata a Torino.",
  },
  {
    id: "hipparcos", nome: "Hipparcos", gruppo: "spazio", stato: "concluso",
    tipo: "Satellite astrometrico", luce: "Luce visibile", anni: "1989–1993",
    cosa: "Il primo satellite costruito per misurare le posizioni e le distanze delle stelle. Fu dell'ESA ed è il \"nonno\" di Gaia.",
    dove: "Doveva restare in orbita fissa sopra la Terra, ma il motore che doveva portarlo lassù non si accese. Lavorò lo stesso, su un'orbita allungata.",
    quando: "Lanciato l'8 agosto 1989, lavorò fino al 1993. Il catalogo uscì nel 1997.",
    scoperte: "Le distanze precise di 118.000 stelle, e posizioni di oltre un milione di altre: per vent'anni la base di tutta l'astronomia stellare.",
    origine: "Doppio significato: è la sigla inglese di \"satellite per la raccolta di parallassi ad alta precisione\" ed è il nome di Ipparco di Nicea, astronomo greco del II secolo a.C. che fece il primo grande catalogo di stelle.",
    curiosita: "Ipparco inventò anche le \"magnitudini\", la scala di luminosità delle stelle che si usa ancora oggi, dalla prima (le più brillanti) alla sesta grandezza.",
  },
  {
    id: "cobe", nome: "COBE, la luce del Big Bang", gruppo: "spazio", stato: "concluso",
    tipo: "Satellite", luce: "Microonde e infrarosso", anni: "1989–1993",
    cosa: "Un satellite della NASA costruito per studiare la radiazione cosmica di fondo: la luce più antica dell'universo, emessa 380.000 anni dopo il Big Bang e oggi diventata un debole bagliore di microonde.",
    dove: "In orbita attorno alla Terra, a circa 900 km.",
    quando: "Lanciato il 18 novembre 1989.",
    scoperte: "Misurò che quella luce ha esattamente lo spettro previsto dalla teoria del Big Bang e, nel 1992, trovò le minuscole differenze di temperatura da cui sono nate le galassie. Premio Nobel 2006 a John Mather e George Smoot.",
    origine: "Sigla inglese di Cosmic Background Explorer, \"esploratore del fondo cosmico\".",
    curiosita: "Stephen Hawking definì le mappe di COBE \"la scoperta del secolo, se non di tutti i tempi\".",
  },
  {
    id: "planck", nome: "Planck", gruppo: "spazio", stato: "concluso",
    tipo: "Satellite", luce: "Microonde", anni: "2009–2013",
    cosa: "Un satellite dell'ESA che ha fatto la mappa più precisa della radiazione cosmica di fondo, la luce più antica dell'universo, erede di COBE e della sonda americana WMAP.",
    dove: "Nel punto L2, a 1,5 milioni di km dalla Terra.",
    quando: "Lanciato il 14 maggio 2009 insieme al telescopio infrarosso Herschel; spento nell'ottobre 2013.",
    scoperte: "Ha misurato l'età dell'universo (13,8 miliardi di anni) e la sua ricetta: solo il 5% è materia normale, circa il 27% materia oscura e il 68% energia oscura.",
    origine: "Dedicato a Max Planck, il fisico tedesco padre della teoria dei quanti, Nobel 1918.",
    curiosita: "Uno dei due strumenti, LFI, è stato guidato dall'Italia. L'altro era raffreddato a un decimo di grado sopra lo zero assoluto: per un periodo fu l'oggetto più freddo conosciuto nello spazio.",
  },
  {
    id: "euclid", nome: "Euclid", gruppo: "spazio", stato: "attivo",
    tipo: "Telescopio spaziale", luce: "Luce visibile e vicino infrarosso", anni: "dal 2023",
    cosa: "Un telescopio dell'ESA con uno specchio di 1,2 metri e un campo molto ampio, che in sei anni fotograferà un terzo del cielo e miliardi di galassie per capire cosa sono la materia oscura e l'energia oscura.",
    dove: "Nel punto L2, a 1,5 milioni di km dalla Terra.",
    quando: "Lanciato il 1° luglio 2023. Prime immagini a novembre 2023, primi dati pubblici nel 2025.",
    scoperte: "Nel 2025 ha pubblicato le prime mappe con 26 milioni di galassie e ha trovato un \"anello di Einstein\" quasi perfetto attorno a una galassia vicina (NGC 6505), un effetto previsto dalla relatività.",
    origine: "Dedicato a Euclide di Alessandria, il matematico greco padre della geometria: la missione misura la \"geometria\" dell'universo.",
    curiosita: "L'Italia, con ASI e INAF, è tra i paesi che hanno dato il contributo maggiore agli strumenti e all'analisi dei dati.",
  },
  {
    id: "soho", nome: "SOHO, la sentinella del Sole", gruppo: "spazio", stato: "attivo",
    tipo: "Osservatorio solare", luce: "Luce visibile e ultravioletto", anni: "dal 1995",
    cosa: "Un osservatorio di ESA e NASA che guarda il Sole senza interruzioni: ne studia l'interno, la corona e il vento solare e avvisa delle tempeste solari in arrivo verso la Terra.",
    dove: "A 1,5 milioni di km dalla Terra, verso il Sole, nel punto di equilibrio L1.",
    quando: "Lanciato il 2 dicembre 1995: doveva durare due anni, funziona da trent'anni.",
    scoperte: "È lo strumento che ha scoperto più comete nella storia: più di 5.000, quasi tutte piccole comete che sfiorano il Sole. La gran parte le hanno trovate appassionati di tutto il mondo guardando le sue immagini su Internet.",
    origine: "Sigla inglese di Solar and Heliospheric Observatory, osservatorio solare ed eliosferico.",
    curiosita: "Nel 1998 i controllori persero il contatto per tre mesi e lo davano per perso: riuscirono a recuperarlo con il grande radiotelescopio di Arecibo, che lo ritrovò nello spazio.",
  },
  {
    id: "solar-orbiter", nome: "Solar Orbiter", gruppo: "spazio", stato: "attivo",
    tipo: "Sonda solare", luce: "Luce visibile, ultravioletto, raggi X", anni: "dal 2020",
    cosa: "Una sonda dell'ESA, con la NASA, che si avvicina al Sole più di Mercurio e, inclinando piano piano la sua orbita, può guardare i poli del Sole, mai visti prima.",
    dove: "Su un'orbita attorno al Sole che a ogni passaggio arriva a circa 42 milioni di km da lui.",
    quando: "Lanciata il 10 febbraio 2020.",
    scoperte: "Nel 2020 ha visto migliaia di minuscoli brillamenti, soprannominati \"falò\". Nel 2025 ha mandato le prime immagini del polo sud del Sole.",
    origine: "In inglese \"orbiter\" è una sonda che gira attorno a un corpo celeste: \"quella che gira attorno al Sole\".",
    curiosita: "A bordo c'è Metis, un coronografo costruito in Italia che \"spegne\" il disco del Sole per fotografare la corona, la sua atmosfera esterna.",
  },
  {
    id: "parker", nome: "Parker Solar Probe", gruppo: "spazio", stato: "attivo",
    tipo: "Sonda solare", luce: "Misure dirette di vento solare, campi e particelle", anni: "dal 2018",
    cosa: "Una sonda della NASA che \"tocca\" il Sole: attraversa la corona, l'atmosfera esterna del Sole, protetta da uno scudo di carbonio spesso 11 cm che arriva a circa 1.400 gradi.",
    dove: "Su un'orbita attorno al Sole molto allungata, che la porta a 6,1 milioni di km dalla sua superficie.",
    quando: "Lanciata il 12 agosto 2018. Il passaggio più vicino al Sole è stato il 24 dicembre 2024.",
    scoperte: "Ha scoperto che il vento solare è pieno di improvvise \"giravolte\" del campo magnetico (gli switchback) e ha misurato da vicino da dove nascono.",
    origine: "Dedicata a Eugene Parker, il fisico che nel 1958 previde l'esistenza del vento solare. È la prima missione NASA intitolata a una persona ancora viva: Parker, a 91 anni, assistette al lancio.",
    curiosita: "È l'oggetto più veloce mai costruito: vicino al Sole viaggia a circa 690.000 km/h, abbastanza per andare da Roma a Milano in meno di tre secondi.",
  },
  {
    id: "voyager", nome: "Le sonde Voyager 1 e 2", gruppo: "spazio", stato: "attivo",
    tipo: "Sonde interplanetarie", luce: "Fotocamere e strumenti per particelle e campi", anni: "dal 1977",
    cosa: "Due sonde gemelle della NASA che hanno visitato i pianeti giganti e oggi viaggiano nello spazio tra le stelle. Voyager 1 è l'oggetto costruito dall'uomo più lontano dalla Terra.",
    dove: "Fuori dal Sistema Solare dei venti solari: Voyager 1 a più di 25 miliardi di km, Voyager 2 a più di 20 miliardi.",
    quando: "Lanciate nel 1977 (Voyager 2 il 20 agosto, Voyager 1 il 5 settembre). Voyager 1 è uscita dall'eliosfera, la \"bolla\" del Sole, nel 2012; Voyager 2 nel 2018.",
    scoperte: "Vulcani attivi sulla luna Io di Giove (1979), nuovi anelli e lune di Giove e Saturno. Voyager 2 è ancora oggi l'unica sonda che abbia visitato Urano (1986) e Nettuno (1989).",
    origine: "Voyager in inglese vuol dire \"viaggiatore\".",
    curiosita: "Entrambe portano un disco d'oro con suoni e immagini della Terra, pensato per eventuali extraterrestri. Il 14 febbraio 1990 Voyager 1 si voltò e fotografò la Terra da 6 miliardi di km: il \"pallido puntino azzurro\". Verso fine 2026 Voyager 1 sarà a un giorno-luce da noi: i suoi segnali impiegheranno 24 ore per arrivare.",
    collegati: ["giove", "saturno", "urano", "nettuno"],
  },
  {
    id: "cassini", nome: "Cassini-Huygens", gruppo: "spazio", stato: "concluso",
    tipo: "Sonda interplanetaria", luce: "Fotocamere, radar e spettrometri", anni: "1997–2017",
    cosa: "Una grande sonda di NASA, ESA e Agenzia Spaziale Italiana che ha studiato Saturno, i suoi anelli e le sue lune per 13 anni. Portava con sé la sonda europea Huygens, che è scesa su Titano.",
    dove: "In orbita attorno a Saturno dal 2004 al 2017.",
    quando: "Lanciata il 15 ottobre 1997. Huygens atterrò su Titano il 14 gennaio 2005: è l'atterraggio più lontano mai fatto. Il 15 settembre 2017 Cassini si tuffò di proposito in Saturno.",
    scoperte: "Getti d'acqua che escono dal polo sud della luna Encelado, da un oceano nascosto sotto il ghiaccio. Laghi e mari di metano liquido su Titano. Nuove lune e i dettagli degli anelli.",
    origine: "Dedicata a Giovanni Domenico Cassini, astronomo ligure nato a Perinaldo nel 1625, che scoprì quattro lune di Saturno e la \"divisione di Cassini\" negli anelli; e a Christiaan Huygens, l'olandese che nel 1655 scoprì Titano.",
    curiosita: "La grande antenna parabolica di Cassini e parte del radar erano italiani. Il tuffo finale serviva a non rischiare di contaminare con batteri terrestri le lune dove potrebbe esserci vita.",
    collegati: ["saturno"],
  },
  {
    id: "new-horizons", nome: "New Horizons", gruppo: "spazio", stato: "attivo",
    tipo: "Sonda interplanetaria", luce: "Fotocamere e spettrometri", anni: "dal 2006",
    cosa: "La sonda della NASA che ha mostrato per la prima volta da vicino Plutone, il pianeta nano ai confini del Sistema Solare.",
    dove: "Nella fascia di Kuiper, oltre Nettuno, a più di 60 volte la distanza tra la Terra e il Sole.",
    quando: "Lanciata il 19 gennaio 2006. Passò accanto a Plutone il 14 luglio 2015 e accanto ad Arrokoth il 1° gennaio 2019.",
    scoperte: "Su Plutone una grande pianura di ghiaccio a forma di cuore, montagne di ghiaccio d'acqua e una sottile atmosfera blu. Arrokoth, a forma di pupazzo di neve, è l'oggetto più lontano mai visitato da una sonda.",
    origine: "New Horizons vuol dire \"nuovi orizzonti\".",
    curiosita: "A bordo ci sono le ceneri di Clyde Tombaugh, l'americano che nel 1930 scoprì Plutone.",
  },
  {
    id: "rosetta", nome: "Rosetta e Philae", gruppo: "spazio", stato: "concluso",
    tipo: "Sonda per una cometa", luce: "Fotocamere, spettrometri e strumenti sul suolo", anni: "2004–2016",
    cosa: "Una sonda dell'ESA che ha accompagnato per due anni una cometa nel suo viaggio attorno al Sole, e il lander Philae, il primo oggetto a posarsi su una cometa.",
    dove: "Attorno alla cometa 67P/Churyumov-Gerasimenko, scoperta nel 1969 da due astronomi sovietici.",
    quando: "Lanciata il 2 marzo 2004, arrivata alla cometa nell'agosto 2014. Philae si posò il 12 novembre 2014. Rosetta concluse la missione scendendo sulla cometa il 30 settembre 2016.",
    scoperte: "La cometa ha la forma di una paperella di gomma. Rosetta vi trovò molecole organiche e un amminoacido, la glicina, uno dei mattoni della vita; l'acqua della cometa però è diversa da quella dei nostri oceani.",
    origine: "Dalla Stele di Rosetta, la pietra che permise di decifrare i geroglifici: la sonda doveva aiutare a \"decifrare\" le origini del Sistema Solare. Philae è l'isola sul Nilo dove fu trovato un obelisco che completò la decifrazione.",
    curiosita: "Philae rimbalzò due volte e finì in un'ombra, senza sole per le batterie. Lo ritrovarono in foto solo nel settembre 2016, incastrato in un crepaccio. Il trapano che doveva perforare il suolo era italiano.",
  },
];

// ---------- Schermate ----------

let filtroStrumenti = "tutti";

function rigaStrumento(s) {
  return `<li><a class="riga" href="#strumento/${s.id}">
    <span class="riga-testo">
      <span class="riga-nome">${GRUPPI_STRUMENTI[s.gruppo].icona} ${esc(s.nome)}</span>
      <span class="riga-dove">${esc(s.tipo)} · ${esc(s.anni)}</span>
    </span>
    <span class="riga-meta"><span class="etichetta etichetta-strumento-${s.stato}">${STATI_STRUMENTI[s.stato]}</span></span>
  </a></li>`;
}

function mostraStrumenti() {
  const gruppi = Object.keys(GRUPPI_STRUMENTI).filter((g) => filtroStrumenti === "tutti" || filtroStrumenti === g);
  $("#contenuto").innerHTML = `
    <section>
      <h1>Strumenti del cielo</h1>
      <p class="sottotitolo">Telescopi, osservatori, satelliti e sonde che ci hanno fatto scoprire il cielo: dal cannocchiale di Galileo al telescopio James Webb.</p>
      <details class="pannello strumenti-luce">
        <summary>Perché tanti strumenti diversi?</summary>
        <p>I nostri occhi vedono solo una piccola parte della luce. Le stelle e le galassie mandano anche luce che non vediamo:
          le <b>onde radio</b> (gas freddo, pulsar), le <b>microonde</b> (la luce del Big Bang), l'<b>infrarosso</b> (il calore, le stelle che nascono nella polvere),
          l'<b>ultravioletto</b> e i <b>raggi X</b> (gas caldissimi, attorno ai buchi neri).</p>
        <p>L'atmosfera ferma gran parte di questa luce: per questo i radiotelescopi stanno a terra, mentre i telescopi a raggi X e molti a infrarossi vanno nello spazio.
          I grandi telescopi a terra si costruiscono in alto, nei deserti, dove l'aria è secca, ferma e lontana dalle luci delle città.</p>
      </details>
      <div class="filtri" role="group" aria-label="Filtra per tipo">
        <button data-filtro-strumenti="tutti" class="${filtroStrumenti === "tutti" ? "attivo" : ""}">Tutti</button>
        ${Object.entries(GRUPPI_STRUMENTI).map(([k, g]) => `<button data-filtro-strumenti="${k}" class="${filtroStrumenti === k ? "attivo" : ""}">${g.icona} ${g.nome}</button>`).join("")}
      </div>
      ${gruppi.map((g) => `
        <h2 class="titolo-sezione">${GRUPPI_STRUMENTI[g].icona} ${GRUPPI_STRUMENTI[g].nome}</h2>
        <ul class="elenco">${STRUMENTI.filter((s) => s.gruppo === g).map(rigaStrumento).join("")}</ul>`).join("")}
      <p class="nota">Fonti: NASA, ESA, ESO, INAF, Museo Galileo e i siti dei singoli osservatori.</p>
    </section>`;
  document.querySelectorAll("[data-filtro-strumenti]").forEach((b) =>
    b.addEventListener("click", () => {
      filtroStrumenti = b.dataset.filtroStrumenti;
      mostraStrumenti();
    })
  );
}

function mostraStrumento(id) {
  const s = STRUMENTI.find((x) => x.id === id);
  if (!s) return mostraStrumenti();
  const voci = [
    ["Cos'è", s.cosa],
    ["Dove si trova", s.dove],
    ["Quando", s.quando],
    ["Cosa ha scoperto", s.scoperte],
    ["Origine del nome", s.origine],
    ["Curiosità", s.curiosita],
  ];
  const oggetti = typeof OGGETTI === "undefined" ? [] : (s.collegati || []).map((c) => OGGETTI.find((o) => o.id === c)).filter(Boolean);
  $("#contenuto").innerHTML = `
    <article class="scheda">
      <a class="indietro" href="#strumenti">‹ Tutti gli strumenti</a>
      <span class="etichetta etichetta-strumento-${s.stato}">${STATI_STRUMENTI[s.stato]}</span>
      <h1>${GRUPPI_STRUMENTI[s.gruppo].icona} ${esc(s.nome)}</h1>
      <p class="adesso">${esc(s.tipo)} · ${esc(s.anni)}</p>
      <p class="sottotitolo">Che luce raccoglie: ${esc(s.luce)}.</p>
      ${voci.map(([t, testo]) => `<section><h2>${t}</h2><p>${esc(testo)}</p></section>`).join("")}
      ${oggetti.length ? `<section><h2>Nelle schede</h2><div class="collegati">
        ${oggetti.map((o) => `<a href="#scheda/${o.id}">${esc(o.nome)}</a>`).join("")}</div></section>` : ""}
    </article>`;
  window.scrollTo(0, 0);
}
