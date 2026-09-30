export type PhotoAlbum = {
  slug: string;
  title: string;
  date: string;
  year: string;
  category: "Borrel" | "Reis" | "Activiteit" | "Commissie";
  photoCount: number;
  description: string;
  art: "borrel" | "budapest" | "intro" | "winter";
};

export const photoAlbums: PhotoAlbum[] = [
  {
    slug: "maandborrel-november-2025",
    title: "Maandborrel november",
    date: "13 november 2025",
    year: "2025",
    category: "Borrel",
    photoCount: 38,
    description: "Een avond vol gezelligheid, leden en natuurlijk de maandelijkse Fermi-borrel.",
    art: "borrel",
  },
  {
    slug: "studiereis-budapest-2025",
    title: "Studiereis Budapest ’25",
    date: "28 april – 4 mei 2025",
    year: "2025",
    category: "Reis",
    photoCount: 124,
    description: "Een week vol techniek, cultuur, excursies en Fermi-momenten in Budapest.",
    art: "budapest",
  },
  {
    slug: "introductieweek-2025",
    title: "Introductieweek 2025",
    date: "September 2025",
    year: "2025",
    category: "Activiteit",
    photoCount: 76,
    description: "De start van het studiejaar met nieuwe leden, activiteiten en veel eerste herinneringen.",
    art: "intro",
  },
  {
    slug: "winteractiviteit-2025",
    title: "Winteractiviteit",
    date: "December 2025",
    year: "2025",
    category: "Activiteit",
    photoCount: 52,
    description: "Warme Fermi-sfeer tijdens een winterse activiteit met leden en commissies.",
    art: "winter",
  },
];
