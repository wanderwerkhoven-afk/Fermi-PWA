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
  detailImagePath?: string;
  featuredImagePath?: string;
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
