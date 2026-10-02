export type AgendaBackgroundPreset =
  | "boottocht"
  | "bowlen"
  | "karten"
  | "kerst"
  | "lasergamen"
  | "nieuwjaar"
  | "schilderen"
  | "pasen"
  | "picknick"
  | "poolen";

export type AgendaEvent = {
  slug: string;
  day: string;
  month: string;
  year: string;
  dateLabel: string;
  type: string;
  title: string;
  time: string;
  location: string;
  address: string;
  art: "beer" | "course" | "quantum" | "legal" | "meeting";
  imagePath?: string;
  backgroundPreset?: AgendaBackgroundPreset;
  featured?: boolean;
  organizer: string;
  price: string;
  capacity: number;
  registered: number;
  registrationDeadline: string;
  description: string;
  practical: string[];
  showInAgenda?: boolean;
  detailVariant?: "standard" | "travel";
  subtitle?: string;
  travel?: {
    dateRange: string;
    destination: string;
    transport: string;
    stay: string;
    priceIndication: string;
    signupDeadline: string;
    expectations: string[];
  };
};

export const agendaEvents: AgendaEvent[] = [
  {
    slug: "studiereis-budapest-25",
    day: "28",
    month: "APR",
    year: "2025",
    dateLabel: "28 april – 04 mei 2025",
    type: "STUDIEREIS",
    title: "Studiereis Budapest ’25",
    subtitle: "Budapest, Hongarije",
    time: "Meerdaags",
    location: "Budapest, Hongarije",
    address: "Budapest, Hongarije",
    art: "meeting",
    organizer: "S.V. Fermi",
    price: "€ 325,-",
    capacity: 40,
    registered: 28,
    registrationDeadline: "24 januari 2025",
    description: "Ga samen met S.V. Fermi op een onvergetelijke studiereis naar Budapest! Een week vol cultuur, techniek, gezelligheid en natuurlijk het échte Fermi-gevoel. Ontdek de stad, bezoek inspirerende bedrijven en beleef dit samen met je medeleden!",
    practical: [
      "Vervoer met de bus vanuit Nederland.",
      "Verblijf in een centraal hotel in Budapest.",
      "Prijsindicatie is inclusief vervoer en verblijf."
    ],
    showInAgenda: false,
    detailVariant: "travel",
    travel: {
      dateRange: "28 april — 04 mei 2025",
      destination: "Budapest, Hongarije",
      transport: "Met de bus vanuit Nederland",
      stay: "Centraal hotel in Budapest",
      priceIndication: "€ 325,- (inclusief vervoer en verblijf)",
      signupDeadline: "24 januari 2025",
      expectations: [
        "Bezoek aan inspirerende bedrijven en universiteiten",
        "Ontdek de stad met een gevarieerd activiteitenprogramma",
        "Uiteraard genoeg tijd voor gezelligheid met je medeleden"
      ]
    }
  },
  {
    slug: "maandborrel",
    day: "13",
    month: "NOV",
    year: "2025",
    dateLabel: "Donderdag 13 november 2025",
    type: "BORREL",
    title: "Maandborrel",
    time: "16:30 – 23:00",
    location: "Café de Jäger, Haarlem",
    address: "Haarlem",
    art: "beer",
    featured: true,
    organizer: "AcCom",
    price: "Gratis voor leden",
    capacity: 80,
    registered: 46,
    registrationDeadline: "13 november om 15:00",
    description: "Tijd om de boeken even dicht te slaan. Kom langs bij de maandborrel van S.V. Fermi voor een gezellige middag en avond met studiegenoten, commissieleden en bestuur.",
    practical: [
      "Neem je digitale Fermi-ledenpas mee.",
      "Consumpties zijn voor eigen rekening tenzij anders vermeld.",
      "Je kunt binnenlopen vanaf 16:30 en later aansluiten."
    ]
  },
  {
    slug: "impuls-cursus",
    day: "21",
    month: "NOV",
    year: "2025",
    dateLabel: "Vrijdag 21 november 2025",
    type: "CURSUS",
    title: "Impuls Cursus",
    time: "15:30 – 18:00",
    location: "JMH 04D04",
    address: "Jakoba Mulderhuis, Amsterdam",
    art: "course",
    organizer: "EduCom",
    price: "Gratis",
    capacity: 32,
    registered: 21,
    registrationDeadline: "20 november om 20:00",
    description: "Een compacte inhoudelijke sessie waarin we samen de belangrijkste concepten rond impuls behandelen en oefenen met toepassingen die aansluiten op Technische Natuurkunde.",
    practical: [
      "Neem een laptop, schrift en rekenmachine mee.",
      "Er is ruimte voor vragen en eigen oefenopgaven.",
      "De cursus is vooral bedoeld voor Fermi-leden die het onderwerp willen opfrissen."
    ]
  },
  {
    slug: "quantum-computers",
    day: "26",
    month: "NOV",
    year: "2025",
    dateLabel: "Woensdag 26 november 2025",
    type: "LEZING",
    title: "Lezing: Quantum Computers",
    time: "15:30 – 17:00",
    location: "K2.01",
    address: "HvA, Amsterdam",
    art: "quantum",
    organizer: "EduCom",
    price: "Gratis",
    capacity: 60,
    registered: 39,
    registrationDeadline: "26 november om 12:00",
    description: "Wat maakt een quantumcomputer fundamenteel anders dan een klassieke computer? Tijdens deze lezing duiken we in qubits, superpositie, verstrengeling en de toepassingen waar quantum computing interessant kan worden.",
    practical: [
      "Voorkennis quantummechanica is handig maar niet verplicht.",
      "De lezing start om 15:30; inloop vanaf 15:15.",
      "Na afloop is er ruimte om vragen te stellen."
    ]
  },
  {
    slug: "open-spreekuur",
    day: "28",
    month: "NOV",
    year: "2025",
    dateLabel: "Vrijdag 28 november 2025",
    type: "COMMISSIE",
    title: "Open Spreekuur",
    time: "15:30 – 17:30",
    location: "JMH 04D04",
    address: "Jakoba Mulderhuis, Amsterdam",
    art: "legal",
    organizer: "Bestuur S.V. Fermi",
    price: "Gratis",
    capacity: 30,
    registered: 8,
    registrationDeadline: "Vrije inloop",
    description: "Loop binnen met vragen over de vereniging, commissies, studiegerelateerde zaken of ideeën die je met het bestuur wilt bespreken. Het spreekuur is laagdrempelig en je hoeft geen formele afspraak te maken.",
    practical: [
      "Vrije inloop; aanmelden is niet noodzakelijk.",
      "Voor een privégesprek kun je ter plekke om een rustig moment vragen.",
      "Je kunt ook alleen langskomen om kennis te maken met het bestuur."
    ]
  },
  {
    slug: "bowlen",
    day: "05",
    month: "NOV",
    year: "2025",
    dateLabel: "Woensdag 5 november 2025",
    type: "ACTIVITEIT",
    title: "Bowlen",
    time: "19:00 – 22:00",
    location: "Locatie volgt",
    address: "",
    art: "meeting",
    backgroundPreset: "bowlen",
    organizer: "AcCom",
    price: "Volgt",
    capacity: 40,
    registered: 0,
    registrationDeadline: "Volgt",
    description: "Een gezellige Fermi-avond op de bowlingbaan.",
    practical: ["Meer informatie volgt."]
  },
  {
    slug: "poolen",
    day: "08",
    month: "NOV",
    year: "2025",
    dateLabel: "Zaterdag 8 november 2025",
    type: "ACTIVITEIT",
    title: "Poolen",
    time: "20:00 – 23:00",
    location: "Locatie volgt",
    address: "",
    art: "meeting",
    backgroundPreset: "poolen",
    organizer: "AcCom",
    price: "Volgt",
    capacity: 40,
    registered: 0,
    registrationDeadline: "Volgt",
    description: "Samen een avond poolen met Fermi.",
    practical: ["Meer informatie volgt."]
  },
  {
    slug: "karten",
    day: "12",
    month: "NOV",
    year: "2025",
    dateLabel: "Woensdag 12 november 2025",
    type: "ACTIVITEIT",
    title: "Karten",
    time: "19:00 – 22:00",
    location: "Locatie volgt",
    address: "",
    art: "meeting",
    backgroundPreset: "karten",
    organizer: "AcCom",
    price: "Volgt",
    capacity: 32,
    registered: 0,
    registrationDeadline: "Volgt",
    description: "Een avond vol snelheid op de kartbaan.",
    practical: ["Meer informatie volgt."]
  },
  {
    slug: "lasergamen",
    day: "15",
    month: "NOV",
    year: "2025",
    dateLabel: "Zaterdag 15 november 2025",
    type: "ACTIVITEIT",
    title: "Lasergamen",
    time: "19:30 – 22:00",
    location: "Locatie volgt",
    address: "",
    art: "meeting",
    backgroundPreset: "lasergamen",
    organizer: "AcCom",
    price: "Volgt",
    capacity: 36,
    registered: 0,
    registrationDeadline: "Volgt",
    description: "Neem het tegen elkaar op tijdens een avond lasergamen.",
    practical: ["Meer informatie volgt."]
  },
  {
    slug: "boottocht",
    day: "18",
    month: "NOV",
    year: "2025",
    dateLabel: "Dinsdag 18 november 2025",
    type: "ACTIVITEIT",
    title: "Boottocht",
    time: "18:30 – 22:00",
    location: "Locatie volgt",
    address: "",
    art: "meeting",
    backgroundPreset: "boottocht",
    organizer: "AcCom",
    price: "Volgt",
    capacity: 45,
    registered: 0,
    registrationDeadline: "Volgt",
    description: "Een ontspannen boottocht met mede-Fermianen.",
    practical: ["Meer informatie volgt."]
  },
  {
    slug: "picknick-oosterpark",
    day: "20",
    month: "NOV",
    year: "2025",
    dateLabel: "Donderdag 20 november 2025",
    type: "ACTIVITEIT",
    title: "Picknick in het Oosterpark",
    time: "15:30 – 18:30",
    location: "Oosterpark, Amsterdam",
    address: "Oosterpark, Amsterdam",
    art: "meeting",
    backgroundPreset: "picknick",
    organizer: "AcCom",
    price: "Gratis",
    capacity: 50,
    registered: 0,
    registrationDeadline: "Volgt",
    description: "Samen naar buiten voor een Fermi-picknick in het Oosterpark.",
    practical: ["Meer informatie volgt."]
  },
  {
    slug: "schilderen",
    day: "23",
    month: "NOV",
    year: "2025",
    dateLabel: "Zondag 23 november 2025",
    type: "ACTIVITEIT",
    title: "Schilderen",
    time: "14:00 – 17:00",
    location: "Locatie volgt",
    address: "",
    art: "meeting",
    backgroundPreset: "schilderen",
    organizer: "AcCom",
    price: "Volgt",
    capacity: 30,
    registered: 0,
    registrationDeadline: "Volgt",
    description: "Een creatieve middag schilderen met Fermi.",
    practical: ["Meer informatie volgt."]
  },
  {
    slug: "kerstactiviteit",
    day: "25",
    month: "NOV",
    year: "2025",
    dateLabel: "Dinsdag 25 november 2025",
    type: "ACTIVITEIT",
    title: "Kerstactiviteit",
    time: "18:00 – 22:00",
    location: "Locatie volgt",
    address: "",
    art: "meeting",
    backgroundPreset: "kerst",
    organizer: "AcCom",
    price: "Volgt",
    capacity: 50,
    registered: 0,
    registrationDeadline: "Volgt",
    description: "Een sfeervolle kerstactiviteit met S.V. Fermi.",
    practical: ["Meer informatie volgt."]
  },
  {
    slug: "nieuwjaarsactiviteit",
    day: "27",
    month: "NOV",
    year: "2025",
    dateLabel: "Donderdag 27 november 2025",
    type: "ACTIVITEIT",
    title: "Nieuwjaarsactiviteit",
    time: "18:00 – 22:00",
    location: "Locatie volgt",
    address: "",
    art: "meeting",
    backgroundPreset: "nieuwjaar",
    organizer: "AcCom",
    price: "Volgt",
    capacity: 50,
    registered: 0,
    registrationDeadline: "Volgt",
    description: "Samen het nieuwe jaar aftrappen met Fermi.",
    practical: ["Meer informatie volgt."]
  },
  {
    slug: "paasactiviteit",
    day: "29",
    month: "NOV",
    year: "2025",
    dateLabel: "Zaterdag 29 november 2025",
    type: "ACTIVITEIT",
    title: "Paasactiviteit",
    time: "14:00 – 17:00",
    location: "Locatie volgt",
    address: "",
    art: "meeting",
    backgroundPreset: "pasen",
    organizer: "AcCom",
    price: "Volgt",
    capacity: 40,
    registered: 0,
    registrationDeadline: "Volgt",
    description: "Een gezellige paasactiviteit met Fermi.",
    practical: ["Meer informatie volgt."]
  },
  {
    slug: "alv-december",
    day: "04",
    month: "DEC",
    year: "2025",
    dateLabel: "Donderdag 4 december 2025",
    type: "VERGADERING",
    title: "ALV",
    time: "19:30 – 22:00",
    location: "De Fysica Kantine",
    address: "HvA, Amsterdam",
    art: "meeting",
    organizer: "Bestuur S.V. Fermi",
    price: "Gratis",
    capacity: 100,
    registered: 34,
    registrationDeadline: "4 december om 18:00",
    description: "Tijdens de Algemene Ledenvergadering worden verenigingszaken besproken en kunnen leden vragen stellen, meepraten en stemmen over onderwerpen die voor S.V. Fermi van belang zijn.",
    practical: [
      "Alle actieve leden zijn welkom.",
      "Relevante ALV-documenten worden vooraf in de Fermi-sectie gepubliceerd.",
      "Neem je digitale ledenpas mee voor een snelle ledencontrole."
    ]
  }
];

export function getAgendaEvent(slug: string) {
  return agendaEvents.find((event) => event.slug === slug);
}
