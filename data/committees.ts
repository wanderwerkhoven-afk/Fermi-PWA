export type Committee = {
  slug: string;
  name: string;
  fullName: string;
  description: string;
  intro: string;
  art: "drinks" | "lecture" | "travel" | "promo" | "web" | "acquisition";
  icon: "users" | "education" | "plane" | "megaphone" | "code" | "handshake";
  colorLabel: string;
  activities: string[];
  learn: string[];
  idealFor: string[];
  commitment: string;
};

export const committees: Committee[] = [
  {
    slug: "accom",
    name: "AcCom",
    fullName: "Activiteitencommissie",
    description: "Activiteiten en gezelligheid",
    intro: "De AcCom organiseert de sociale activiteiten van S.V. Fermi. Van borrels en spelavonden tot grotere activiteiten: deze commissie zorgt ervoor dat leden elkaar ook buiten de collegezaal leren kennen.",
    art: "drinks",
    icon: "users",
    colorLabel: "SOCIAAL",
    activities: [
      "Borrels en thema-avonden organiseren",
      "Spel-, sport- en gezelligheidsactiviteiten bedenken",
      "Locaties, planning en inschrijvingen regelen",
      "Samenwerken met andere commissies bij grotere evenementen"
    ],
    learn: [
      "Eventorganisatie",
      "Planning en samenwerken",
      "Creatief conceptdenken",
      "Communicatie met locaties en leveranciers"
    ],
    idealFor: [
      "Je vindt het leuk om activiteiten te bedenken",
      "Je werkt graag in een gezellig team",
      "Je wilt actief bijdragen aan de sfeer binnen Fermi"
    ],
    commitment: "Gemiddeld enkele uren per maand, met extra inzet rond activiteiten."
  },
  {
    slug: "educom",
    name: "EduCom",
    fullName: "Educatiecommissie",
    description: "Lezingen, cursussen en studiegerelateerd",
    intro: "De EduCom verbindt studie en vereniging. De commissie organiseert inhoudelijke lezingen, cursussen, bedrijfsbezoeken en andere activiteiten die studenten helpen om zich vakinhoudelijk en professioneel te ontwikkelen.",
    art: "lecture",
    icon: "education",
    colorLabel: "EDUCATIEF",
    activities: [
      "Lezingen en gastsprekers organiseren",
      "Cursussen en studieondersteuning opzetten",
      "Bedrijfs- en onderzoeksbezoeken regelen",
      "Nieuwe technische en natuurkundige onderwerpen verkennen"
    ],
    learn: [
      "Professioneel organiseren",
      "Contact met bedrijven en sprekers",
      "Inhoudelijk programmeren",
      "Presentatie en communicatie"
    ],
    idealFor: [
      "Je bent nieuwsgierig naar techniek en natuurkunde",
      "Je vindt het leuk om kennis te delen",
      "Je wilt contacten leggen met bedrijven en experts"
    ],
    commitment: "Flexibel gedurende het jaar, met pieken rondom lezingen en cursussen."
  },
  {
    slug: "reiscom",
    name: "ReisCom",
    fullName: "Reiscommissie",
    description: "De mooiste studiereizen",
    intro: "De ReisCom organiseert reizen waarbij techniek, cultuur en gezelligheid samenkomen. De commissie bouwt een complete reis op: van bestemming en bedrijfsbezoeken tot verblijf, vervoer en activiteitenprogramma.",
    art: "travel",
    icon: "plane",
    colorLabel: "REIZEN",
    activities: [
      "Bestemmingen onderzoeken en selecteren",
      "Vervoer en verblijf regelen",
      "Bedrijven, universiteiten en excursies benaderen",
      "Een compleet programma en begroting maken"
    ],
    learn: [
      "Projectmanagement",
      "Budgetteren",
      "Internationaal organiseren",
      "Onderhandelen en plannen"
    ],
    idealFor: [
      "Je houdt van reizen en organiseren",
      "Je kunt goed vooruit plannen",
      "Je vindt het leuk om een groot project samen neer te zetten"
    ],
    commitment: "Doorlopend gedurende de voorbereiding; richting de reis neemt de inzet toe."
  },
  {
    slug: "promocom",
    name: "PromoCom",
    fullName: "Promotiecommissie",
    description: "Communicatie en externe relaties",
    intro: "De PromoCom zorgt dat Fermi zichtbaar is. De commissie maakt promotie voor activiteiten, werkt aan social media en helpt de vereniging met fotografie, vormgeving en communicatie richting leden en externe partijen.",
    art: "promo",
    icon: "megaphone",
    colorLabel: "CREATIEF",
    activities: [
      "Social media en promotiecontent maken",
      "Posters, visuals en campagnes ontwerpen",
      "Foto's en content rondom activiteiten verzamelen",
      "Meedenken over de uitstraling en communicatie van Fermi"
    ],
    learn: [
      "Contentcreatie",
      "Grafische communicatie",
      "Campagneplanning",
      "Social media en branding"
    ],
    idealFor: [
      "Je bent creatief of wilt dat ontwikkelen",
      "Je vindt fotografie, design of social media leuk",
      "Je wilt Fermi herkenbaar en zichtbaar maken"
    ],
    commitment: "Regelmatige kleine taken, met extra werk rondom campagnes en evenementen."
  }  ,
  {
    slug: "webcom",
    name: "WebCom",
    fullName: "Websitecommissie",
    description: "Website, app en digitale innovatie",
    intro: "De WebCom werkt aan de digitale omgeving van S.V. Fermi. Van de verenigingswebsite en de ledenapp tot toegankelijkheid, onderhoud en nieuwe online functies: deze commissie maakt Fermi digitaal beter bereikbaar.",
    art: "web",
    icon: "code",
    colorLabel: "DIGITAAL",
    activities: [
      "De website en Fermi-app onderhouden en verbeteren",
      "Nieuwe functies ontwerpen, bouwen en testen",
      "Problemen oplossen en de gebruikservaring verbeteren",
      "Samenwerken met andere commissies aan digitale oplossingen"
    ],
    learn: [
      "Webontwikkeling en UX-design",
      "Samenwerken met Git en code reviews",
      "Testen en digitaal projectbeheer",
      "Veilig en toegankelijk ontwerpen"
    ],
    idealFor: [
      "Je vindt programmeren, ontwerpen of techniek interessant",
      "Je wilt leren hoe een website of app wordt gebouwd",
      "Je werkt graag aan praktische digitale projecten"
    ],
    commitment: "Flexibel, met regelmatige onderhoudstaken en extra inzet bij releases."
  },
  {
    slug: "acquisitiecom",
    name: "AcquisitieCom",
    fullName: "Acquisitiecommissie",
    description: "Sponsoring, partners en samenwerkingen",
    intro: "De AcquisitieCom bouwt relaties op met bedrijven en organisaties die S.V. Fermi willen ondersteunen. De commissie zoekt kansen voor sponsoring, samenwerkingen en waardevolle contacten voor de vereniging en haar leden.",
    art: "acquisition",
    icon: "handshake",
    colorLabel: "SAMENWERKING",
    activities: [
      "Potentiële sponsors en samenwerkingspartners benaderen",
      "Sponsorvoorstellen en afspraken voorbereiden",
      "Contact onderhouden met bestaande partners",
      "Samenwerken met commissies aan ondersteunde activiteiten"
    ],
    learn: [
      "Professioneel communiceren",
      "Netwerken en relatiebeheer",
      "Onderhandelen en presenteren",
      "Commercieel en organisatorisch denken"
    ],
    idealFor: [
      "Je vindt het leuk om nieuwe contacten te leggen",
      "Je wilt ervaring opdoen met bedrijven en partnerships",
      "Je bent ondernemend en denkt in mogelijkheden"
    ],
    commitment: "Flexibel gedurende het jaar, met extra inzet rond sponsoracties en evenementen."
  }

];

export function getCommittee(slug: string) {
  return committees.find((committee) => committee.slug === slug);
}
