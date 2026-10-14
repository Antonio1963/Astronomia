// Le leggende antiche sui nomi di pianeti, stelle, costellazioni e galassie.

const LEGGENDE = [
  {
    id: "leggenda-pianeti", nome: "Cinque luci che vagano", categoria: "leggenda", immagine: "images/mercurio.svg",
    cosa: "Perché i pianeti portano i nomi degli dèi di Roma, e chi li aveva battezzati prima.",
    collegati: ["mercurio", "venere", "marte", "giove", "saturno"],
    paragrafi: [
      { titolo: "Le stelle che si muovono", testo: "Gli antichi guardavano il cielo ogni notte. Notarono che quasi tutte le stelle restano ferme l'una rispetto all'altra. Cinque luci invece si spostano piano tra le costellazioni. I Greci le chiamarono planetes, cioè \"vagabondi\". Da qui viene la parola pianeta." },
      { titolo: "Prima di tutto, Babilonia", testo: "I primi a seguire i pianeti con cura furono gli astronomi della Mesopotamia. Ognuno era legato a un dio. Marduk, il re degli dèi di Babilonia, era Giove. Ishtar, dea dell'amore e della guerra, era Venere. Nergal, dio della guerra e delle epidemie, era il rosso Marte. Nabu, dio degli scribi, era Mercurio. Saturno era legato a Ninurta." },
      { titolo: "I Greci traducono", testo: "I Greci all'inizio usavano nomi descrittivi. Marte era Pyroeis, \"il fiammeggiante\". Saturno era Phainon, \"il luminoso\". Poi presero l'idea babilonese e scelsero dèi simili ai loro: Zeus, Afrodite, Ares, Ermes e Crono. Venere, vista al mattino e alla sera, per molto tempo ebbe due nomi: Fosforo e Espero. Si racconta che furono Pitagora o Parmenide a capire che era un solo astro." },
      { titolo: "Infine Roma", testo: "I Romani tradussero ancora una volta, con i loro dèi. Zeus divenne Giove, Afrodite Venere, Ares Marte, Ermes Mercurio, Crono Saturno. Sono i nomi che usiamo ancora oggi. Le scelte hanno una loro logica. Mercurio, il messaggero veloce, è il pianeta più rapido. Marte, il dio della guerra, ha il colore del sangue. Giove, il re, è il più brillante dopo Venere. Saturno, il dio più antico, è il più lento di tutti." },
    ],
  },
  {
    id: "leggenda-urano-nettuno", nome: "Il pianeta che doveva chiamarsi Giorgio", categoria: "leggenda", immagine: "images/urano.svg",
    cosa: "Come Urano e Nettuno hanno ricevuto i loro nomi, dopo lunghe discussioni.",
    collegati: ["urano", "nettuno", "saturno", "giove"],
    paragrafi: [
      { titolo: "Una scoperta inattesa", testo: "Il 13 marzo 1781 William Herschel, musicista e astronomo in Inghilterra, vide nel telescopio un puntino strano. All'inizio pensò a una cometa. Era invece un pianeta nuovo, il primo scoperto con un telescopio. Bisognava dargli un nome, e non era mai successo prima." },
      { titolo: "La stella di Giorgio", testo: "Herschel voleva ringraziare il suo re, Giorgio III. Propose quindi Georgium Sidus, \"la stella di Giorgio\". In Inghilterra il nome piacque. Nel resto d'Europa molto meno. In Francia molti lo chiamavano semplicemente \"Herschel\"." },
      { titolo: "Il padre di Saturno", testo: "L'astronomo tedesco Johann Bode propose Urano. Nel mito greco Urano, il Cielo, è il padre di Crono, cioè di Saturno. E Saturno è il padre di Giove. Così la famiglia saliva di una generazione. Il nome si diffuse piano piano. Gli Inglesi lo adottarono ufficialmente solo verso il 1850. Nel 1789 il chimico Klaproth chiamò uranio un nuovo elemento, proprio in onore del pianeta." },
      { titolo: "Nettuno, trovato con la matematica", testo: "Nettuno fu scoperto nel 1846 a Berlino da Johann Galle. Galle cercò nel punto indicato dai calcoli del francese Urbain Le Verrier. Furono proposti vari nomi, come Giano e Oceano. Le Verrier per un po' sostenne perfino il nome \"Le Verrier\". Alla fine vinse Nettuno, il dio romano del mare, per restare nella tradizione degli dèi antichi." },
      { titolo: "E Plutone?", testo: "Nel 1930 fu scoperto Plutone. Il nome lo suggerì una bambina di undici anni di Oxford, Venetia Burney. Plutone è il dio del mondo sotterraneo, adatto a un astro lontano e buio. Dal 2006 Plutone è considerato un pianeta nano." },
    ],
  },
  {
    id: "leggenda-settimana", nome: "Una settimana scritta nel cielo", categoria: "leggenda", immagine: "images/luna.svg",
    cosa: "Lunedì, martedì, mercoledì: i giorni portano i nomi dei sette astri erranti.",
    collegati: ["luna", "mercurio", "venere", "marte", "giove", "saturno"],
    paragrafi: [
      { titolo: "Sette luci erranti", testo: "Per gli antichi gli astri che si muovono tra le stelle erano sette. Il Sole, la Luna e i cinque pianeti visibili a occhio nudo. Ogni giorno della settimana fu dedicato a uno di loro. Questa usanza si diffuse nell'Impero romano tra il primo e il secondo secolo dopo Cristo." },
      { titolo: "I giorni in italiano", testo: "Lunedì è il giorno della Luna. Martedì è di Marte, mercoledì di Mercurio. Giovedì è di Giove, venerdì di Venere. Sabato e domenica sono cambiati con il tempo. Sabato viene dall'ebraico shabbat, il giorno del riposo, ma prima era il giorno di Saturno. Domenica viene dal latino dies Dominicus, il giorno del Signore, ma prima era il giorno del Sole." },
      { titolo: "Perché proprio quest'ordine?", testo: "Gli antichi ordinavano i sette astri dal più lento al più veloce: Saturno, Giove, Marte, Sole, Venere, Mercurio, Luna. Ogni ora del giorno era affidata a uno di loro, a turno. L'astro della prima ora dava il nome al giorno intero. Con 24 ore al giorno, il turno salta in avanti in modo regolare. Ne nasce proprio la sequenza della nostra settimana. Lo spiega lo storico romano Cassio Dione." },
      { titolo: "Gli stessi pianeti nel mondo", testo: "In inglese restano il giorno del Sole (Sunday), della Luna (Monday) e di Saturno (Saturday). Gli altri giorni presero gli dèi germanici simili a quelli romani: Tiw per Marte, Woden per Mercurio, Thor per Giove, Frigg per Venere. Anche in giapponese i giorni seguono i sette astri. Lì però i pianeti sono indicati con gli elementi cinesi: fuoco, acqua, legno, metallo e terra." },
    ],
  },
  {
    id: "leggenda-stelle-arabe", nome: "Perché le stelle parlano arabo", categoria: "leggenda", immagine: "images/aldebaran.svg",
    cosa: "Aldebaran, Rigel, Vega: un viaggio di nomi dalla Grecia a Baghdad e poi in Europa.",
    collegati: ["aldebaran", "betelgeuse", "rigel", "deneb", "altair", "vega", "antares", "spica", "orione", "cigno"],
    paragrafi: [
      { titolo: "Il catalogo di Tolomeo", testo: "Nel secondo secolo dopo Cristo l'astronomo Tolomeo, ad Alessandria d'Egitto, scrisse una grande opera. Conteneva più di mille stelle in 48 costellazioni. Le stelle non avevano quasi nomi propri. Erano descritte con la loro posizione: \"quella nel piede\", \"quella sulla coda\"." },
      { titolo: "Baghdad e al-Sufi", testo: "Nel nono secolo l'opera di Tolomeo fu tradotta in arabo a Baghdad, con il nome di Almagesto. Nel 964 l'astronomo persiano al-Sufi scrisse il Libro delle stelle fisse. Unì le descrizioni di Tolomeo ai nomi che i popoli arabi davano da secoli alle stelle. Molte descrizioni divennero così nomi veri e propri." },
      { titolo: "Cosa vogliono dire", testo: "Aldebaran viene da al-dabaran, \"quello che segue\", perché sembra inseguire le Pleiadi. Rigel viene da rijl, \"piede\": è il piede del gigante Orione. Deneb viene da dhanab, \"coda\", la coda dell'uccello del Cigno. Altair è \"l'aquila che vola\". Vega viene da al-nasr al-waqi, \"l'aquila che piomba\"." },
      { titolo: "Betelgeuse, un errore famoso", testo: "Nel Medioevo i libri arabi furono tradotti in latino, soprattutto in Spagna. I copisti spesso non conoscevano l'arabo, e i nomi si deformarono. Betelgeuse viene probabilmente da yad al-jawza, \"la mano di al-Jawza\", una figura del cielo arabo. Un copista lesse una lettera sbagliata e scrisse una \"b\" invece di una \"y\". Più tardi si pensò che significasse \"l'ascella\", ma è una spiegazione nata dopo l'errore." },
      { titolo: "Non tutti sono arabi", testo: "Alcuni nomi vengono dal greco o dal latino. Antares è greco e significa \"rivale di Ares\", cioè di Marte, per il suo colore rosso. Sirio è greco, Spica è latino e vuol dire \"spiga\". Dal 2016 l'Unione Astronomica Internazionale ha reso ufficiali i nomi propri di centinaia di stelle." },
    ],
  },
  {
    id: "leggenda-sirio", nome: "Sirio, il Nilo e la canicola", categoria: "leggenda", immagine: "images/sirio.svg",
    cosa: "La stella più brillante del cielo annunciava la piena del Nilo e il caldo d'estate.",
    collegati: ["sirio", "orione"],
    paragrafi: [
      { titolo: "La dea Sopdet", testo: "Per gli antichi Egizi Sirio era la dea Sopdet, che i Greci chiamarono Sothis. Per una parte dell'anno Sirio resta nascosta nella luce del Sole. Poi un giorno d'estate ricompare all'alba, bassa a oriente. Più o meno in quel periodo cominciava la piena del Nilo, che rendeva fertili i campi. Il ritorno di Sirio era quindi una festa e segnava il nuovo anno." },
      { titolo: "Il cane di Orione", testo: "Per i Greci Sirio era la stella più luminosa del Cane Maggiore. Il cane seguiva il cacciatore Orione nel cielo. Già Omero, nell'Iliade, la chiama \"il cane di Orione\" e dice che porta febbre ai mortali. Alcuni autori antichi raccontano anche di Lelapo, un cane che non lasciava mai scappare la sua preda. Il nome Sirio viene forse da un termine greco che vuol dire \"ardente\", ma l'origine non è certa." },
      { titolo: "I giorni della canicola", testo: "I Romani chiamavano Sirio Canicula, \"la cagnolina\". Notarono che Sirio sorgeva insieme al Sole nei giorni più caldi dell'anno. Pensarono che il suo fuoco si sommasse a quello del Sole. Da qui nasce la nostra parola canicola, il caldo afoso d'estate." },
      { titolo: "Cosa sappiamo oggi", testo: "Il caldo estivo non dipende da Sirio, ma dall'inclinazione della Terra. Inoltre il cielo cambia lentamente nei secoli. Oggi in Italia Sirio ricompare all'alba verso la metà di agosto, più tardi che ai tempi antichi. Il nome canicola però è rimasto." },
    ],
  },
  {
    id: "leggenda-pleiadi", nome: "Le Sette Sorelle nel mondo", categoria: "leggenda", immagine: "images/pleiadi.svg",
    cosa: "Un piccolo gruppo di stelle che quasi tutti i popoli della Terra hanno raccontato.",
    collegati: ["pleiadi", "orione", "aldebaran"],
    paragrafi: [
      { titolo: "Le figlie di Atlante", testo: "Per i Greci le Pleiadi erano sette sorelle, figlie del titano Atlante e di Pleione. I loro nomi erano Maia, Elettra, Taigete, Alcione, Celeno, Sterope e Merope. Il cacciatore Orione le inseguì per anni. Zeus allora le trasformò in colombe e poi in stelle. Il contadino greco Esiodo usava il loro sorgere e il loro tramonto per sapere quando mietere e quando arare." },
      { titolo: "La sorella nascosta", testo: "A occhio nudo se ne vedono facilmente sei, non sette. Gli antichi avevano una spiegazione. Secondo Ovidio, Merope si nasconde per la vergogna, perché sposò un mortale. Secondo altri racconti è Elettra a coprirsi il viso, per il dolore della caduta di Troia." },
      { titolo: "Subaru e Matariki", testo: "In Giappone le Pleiadi si chiamano Subaru, una parola che significa \"riunirsi\". È anche il nome di una casa automobilistica, che porta le stelle nel suo logo. In Nuova Zelanda i Maori le chiamano Matariki. Quando ricompaiono all'alba, a metà inverno australe tra giugno e luglio, inizia il nuovo anno maori. Dal 2022 Matariki è festa nazionale in Nuova Zelanda." },
      { titolo: "Le Sette Sorelle d'Australia", testo: "Anche molti popoli aborigeni australiani vedono nelle Pleiadi un gruppo di sorelle. Nei loro racconti le sorelle fuggono da un uomo che le insegue attraverso il deserto. In molte versioni l'inseguitore è proprio nelle stelle di Orione. È sorprendente: popoli lontanissimi tra loro raccontano una storia molto simile. Nessuno sa con certezza perché." },
    ],
  },
  {
    id: "leggenda-orsa-maggiore", nome: "Un'orsa, un carro, sette saggi", categoria: "leggenda", immagine: "images/orsa-maggiore.svg",
    cosa: "Le sette stelle più famose del cielo del nord hanno mille storie diverse.",
    collegati: ["orsa-maggiore", "polare", "arturo"],
    paragrafi: [
      { titolo: "La ninfa Callisto", testo: "Per i Greci l'Orsa Maggiore era Callisto, una ninfa che seguiva la dea Artemide. Zeus si innamorò di lei e ne nacque un figlio, Arcade. Secondo Ovidio la gelosa Giunone trasformò Callisto in un'orsa. Anni dopo Arcade, a caccia, stava per colpire la madre senza riconoscerla. Zeus fermò la freccia e portò in cielo entrambi." },
      { titolo: "L'orsa che non fa mai il bagno", testo: "Giunone non era contenta di vedere Callisto tra le stelle. Chiese agli dèi del mare di non lasciarla mai bagnare nell'Oceano. Per questo, racconta Ovidio, l'Orsa Maggiore non tramonta mai sotto l'orizzonte. Dall'Italia infatti la vediamo girare intorno alla Stella Polare tutto l'anno. Vicino c'è Arturo, il cui nome greco significa \"guardiano dell'orsa\"." },
      { titolo: "Il carro e i buoi", testo: "Molti popoli non vedevano un'orsa ma un carro. I Romani chiamavano le sette stelle Septentriones, \"i sette buoi\" che tirano l'aratro. Da questa parola viene settentrione, cioè il nord. In inglese le stesse stelle sono l'aratro (the Plough) o il mestolo (the Big Dipper)." },
      { titolo: "I sette saggi dell'India", testo: "In India le sette stelle sono i Saptarishi, i sette saggi della tradizione antica. Uno di loro, Vasishtha, è la stella Mizar. Accanto a lui brilla una stellina più debole, Alcor. È Arundhati, sua moglie fedele. In alcuni matrimoni indù si usa ancora mostrarla agli sposi come esempio di fedeltà." },
    ],
  },
  {
    id: "leggenda-orione-scorpione", nome: "Orione e lo Scorpione, nemici per sempre", categoria: "leggenda", immagine: "images/orione.svg",
    cosa: "Perché il cacciatore e lo scorpione non sono mai nel cielo insieme.",
    collegati: ["orione", "scorpione", "antares", "betelgeuse", "rigel"],
    paragrafi: [
      { titolo: "Il grande cacciatore", testo: "Orione era un gigante, cacciatore fortissimo. Secondo uno dei racconti antichi era anche molto superbo. Si vantava di poter uccidere ogni animale della Terra. La Terra, offesa, mandò contro di lui uno scorpione. Il piccolo animale lo punse e lo uccise." },
      { titolo: "Lontani nel cielo", testo: "Gli dèi portarono in cielo sia Orione sia lo Scorpione. Ma li misero da parti opposte, perché non si incontrassero più. Ed è proprio così. Quando lo Scorpione sorge a est, Orione tramonta a ovest. Orione domina le notti d'inverno, lo Scorpione quelle d'estate." },
      { titolo: "Altre versioni", testo: "I miti antichi spesso hanno più versioni. In alcune Orione muore per una freccia di Artemide, ingannata dal fratello Apollo. In altre è la dea stessa a mandare lo scorpione. Lo raccontano autori come Eratostene e Igino, che raccolsero le storie delle costellazioni." },
      { titolo: "Due cuori rossi", testo: "Le due costellazioni hanno qualcosa in comune. Entrambe hanno una grande stella rossa. In Orione è Betelgeuse, sulla spalla del cacciatore. Nello Scorpione è Antares, il cuore dell'animale. Il suo nome significa \"rivale di Marte\", per il colore simile a quello del pianeta." },
    ],
  },
  {
    id: "leggenda-zodiaco", nome: "Lo zodiaco e il tredicesimo segno", categoria: "leggenda", immagine: "images/stagione-primavera.svg",
    cosa: "I dodici segni vengono da Babilonia, ma il Sole attraversa anche una tredicesima costellazione.",
    collegati: ["leone", "scorpione", "antares", "spica", "aldebaran"],
    paragrafi: [
      { titolo: "La strada del Sole", testo: "Durante l'anno il Sole sembra passare davanti a costellazioni diverse. Anche la Luna e i pianeti seguono più o meno la stessa strada. Gli astronomi di Babilonia osservarono questa fascia di cielo per secoli. Già intorno al 1000 avanti Cristo le sue costellazioni erano elencate in una raccolta di tavolette chiamata MUL.APIN." },
      { titolo: "Dodici parti uguali", testo: "Verso il quinto secolo avanti Cristo i Babilonesi divisero la strada del Sole in dodici parti uguali. Molti nomi sono quelli di oggi: il Toro, i Gemelli, il Leone, lo Scorpione. Altri cambiarono. L'Ariete era all'inizio \"il bracciante\". Il Capricorno era un animale metà capra e metà pesce, che ha conservato la coda. I Greci adottarono il sistema e lo chiamarono zodiaco, \"cerchio dei piccoli animali\"." },
      { titolo: "Il cielo si sposta", testo: "L'asse della Terra oscilla lentamente come una trottola, con un giro ogni 26.000 anni circa. Lo scoprì il greco Ipparco nel secondo secolo avanti Cristo. Per questo i segni dell'oroscopo non coincidono più con le costellazioni vere. Oggi, quando l'oroscopo dice Ariete, il Sole si trova davanti ai Pesci." },
      { titolo: "Ofiuco, il guaritore", testo: "Nel 1930 gli astronomi fissarono i confini ufficiali delle costellazioni. Si vide che il Sole, tra fine novembre e metà dicembre, attraversa anche l'Ofiuco, \"il portatore di serpente\". Nel mito è Asclepio, il medico capace di riportare in vita i morti. Zeus lo colpì con un fulmine per questo, poi lo mise tra le stelle. L'astrologia non lo conta, ma gli astronomi sì." },
    ],
  },
  {
    id: "leggenda-via-lattea", nome: "Un fiume di latte nel cielo", categoria: "leggenda", immagine: "images/via-lattea.svg",
    cosa: "Latte di una dea, fiume d'argento, strada di pellegrini: la nostra galassia raccontata dai popoli.",
    collegati: ["vega", "altair", "deneb", "cigno", "scorpione"],
    paragrafi: [
      { titolo: "Il latte di Era", testo: "Per i Greci la Via Lattea nacque da una goccia di latte. Zeus mise il piccolo Eracle al seno della dea Era mentre lei dormiva, per renderlo immortale. Era si svegliò e lo allontanò. Il latte si sparse nel cielo. I Greci la chiamavano galaxias kyklos, \"cerchio di latte\". Da qui viene la nostra parola galassia." },
      { titolo: "Il Fiume d'Argento", testo: "In Cina la Via Lattea è il Fiume del Cielo. Da una parte c'è la stella Vega, la Tessitrice. Dall'altra c'è Altair, il Bovaro, il giovane che pascola i buoi. I due si amavano, ma il fiume li separa. Una volta l'anno, il settimo giorno del settimo mese, le gazze formano un ponte e loro si incontrano. In Giappone la stessa festa si chiama Tanabata." },
      { titolo: "La strada dei pellegrini", testo: "In Spagna e in altre parti d'Europa la Via Lattea era chiamata, nella tradizione popolare, Cammino di Santiago. Sembrava indicare ai pellegrini la strada verso Santiago di Compostela. È un nome del folklore, non un mito antico, ma è molto diffuso ancora oggi." },
      { titolo: "L'Emù e gli animali scuri", testo: "Alcuni popoli guardavano le macchie scure, non le stelle. Molti aborigeni australiani vedono nelle nubi scure della Via Lattea un grande emù. La testa è vicino alla Croce del Sud. La sua posizione nel cielo serale indica quando gli emù depongono le uova. Anche gli Inca e i loro discendenti nelle Ande vedono figure scure nel Mayu, il fiume celeste: un lama, un rospo, un serpente e una volpe." },
    ],
  },
  {
    id: "leggenda-nubi-magellano", nome: "Le nuvole dei navigatori", categoria: "leggenda", immagine: "images/grande-nube-magellano.svg",
    cosa: "Le Nubi di Magellano e la Croce del Sud, le meraviglie del cielo australe.",
    collegati: [],
    paragrafi: [
      { titolo: "Il bue bianco di al-Sufi", testo: "Le Nubi di Magellano sono due piccole galassie vicine alla nostra. Dall'Italia non si vedono mai. Il primo a scriverne fu forse l'astronomo persiano al-Sufi, nel 964. Riportò che dal sud dell'Arabia si vedeva una macchia chiamata al-Bakr, \"il bue bianco\"." },
      { titolo: "Gli Italiani e le stelle nuove", testo: "I navigatori europei videro questi cieli all'inizio del Cinquecento. Amerigo Vespucci, nelle sue lettere, parla di macchie chiare e scure vicino al polo sud. Nel 1515 il fiorentino Andrea Corsali scrisse a Giuliano de' Medici. Descrisse due nuvolette e una \"croce maravigliosa\", e ne fece un disegno. È una delle prime descrizioni europee della Croce del Sud." },
      { titolo: "Il nome di Magellano", testo: "Antonio Pigafetta, di Vicenza, viaggiò con Ferdinando Magellano intorno al mondo tra il 1519 e il 1522. Nel suo diario descrisse le due nubi. Più tardi furono chiamate Nubi di Magellano, in onore di quel viaggio." },
      { titolo: "Una croce che i Greci conoscevano", testo: "Duemila anni fa la Croce del Sud si vedeva anche dal Mediterraneo, bassa sull'orizzonte. Tolomeo inserì le sue stelle nella costellazione del Centauro. Poi il lento movimento dell'asse terrestre l'ha nascosta ai nostri cieli. Oggi è sulle bandiere di Australia, Nuova Zelanda, Brasile, Samoa e Papua Nuova Guinea." },
      { titolo: "La bussola dei popoli australi", testo: "Per i navigatori polinesiani la Croce del Sud aiutava a trovare il sud in mare aperto. Gli Hawaiani la chiamano Hanaiakamalama. Per molti aborigeni australiani la nube scura accanto alla Croce, il Sacco di Carbone, è la testa dell'Emù celeste." },
    ],
  },
  {
    id: "leggenda-andromeda", nome: "Andromeda, la principessa e la galassia", categoria: "leggenda", immagine: "images/andromeda.svg",
    cosa: "Un mito greco con una famiglia intera in cielo, e una piccola nube che era un altro universo.",
    collegati: ["andromeda", "cassiopea"],
    paragrafi: [
      { titolo: "Una regina troppo vanitosa", testo: "Cefeo era re d'Etiopia e Cassiopea era sua moglie. Cassiopea si vantò di essere più bella delle Nereidi, le ninfe del mare. Poseidone, offeso, mandò un mostro marino a devastare le coste. Un oracolo disse che solo un sacrificio poteva salvare il regno. La figlia Andromeda fu incatenata a uno scoglio, in attesa del mostro." },
      { titolo: "L'arrivo di Perseo", testo: "Perseo tornava in volo dopo aver ucciso Medusa. Vide Andromeda, uccise il mostro e la sposò. Nei racconti greci Perseo vola con i sandali alati di Ermes. L'immagine di Perseo in groppa al cavallo alato Pegaso è più tarda: nel mito antico Pegaso è il cavallo di Bellerofonte. Pegaso però nasce proprio dal sangue di Medusa." },
      { titolo: "Tutta la famiglia in cielo", testo: "Gli dèi misero tra le stelle tutti i protagonisti: Cefeo, Cassiopea, Andromeda, Perseo e il mostro, la Balena. Cassiopea siede sul suo trono. Girando intorno al polo, a volte si trova a testa in giù. Secondo gli antichi era una punizione per la sua vanità. In Perseo brilla Algol, il cui nome arabo significa \"la testa del demone\": è la testa di Medusa." },
      { titolo: "La piccola nube di al-Sufi", testo: "Nel 964 l'astronomo persiano al-Sufi notò, nella costellazione di Andromeda, una \"piccola nube\". È la più antica descrizione conosciuta della galassia di Andromeda. Per secoli si pensò che fosse una nebbia vicina, dentro la nostra Via Lattea." },
      { titolo: "Un altro universo di stelle", testo: "Nel 1923 Edwin Hubble trovò in quella nube alcune stelle variabili chiamate Cefeidi. Il loro nome viene dalla stella Delta Cephei, proprio nella costellazione del re Cefeo. Grazie a loro Hubble misurò la distanza. Andromeda era lontanissima: una galassia intera, oggi stimata a circa 2,5 milioni di anni luce. È l'oggetto più lontano che si può vedere a occhio nudo." },
    ],
  },
];

OGGETTI.push(...LEGGENDE);
