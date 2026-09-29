export type CommunityMember = {
  id: string;
  name: string;
  line1: string;
  line2: string;
  badge: string;
  badgeTone: "orange" | "navy" | "soft";
  categories: string[];
  image: string;
};

export const communityMembers: CommunityMember[] = [
  {
    id: "sophie-de-vries",
    name: "Sophie de Vries",
    line1: "Voorzitter",
    line2: "Bestuur",
    badge: "Bestuur",
    badgeTone: "orange",
    categories: ["Alle leden", "Bestuur"],
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=82"
  },
  {
    id: "lars-van-dijk",
    name: "Lars van Dijk",
    line1: "Acquisitie",
    line2: "AcCom",
    badge: "AcCom",
    badgeTone: "navy",
    categories: ["Alle leden", "Commissies"],
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=240&q=82"
  },
  {
    id: "emma-jansen",
    name: "Emma Jansen",
    line1: "Technische Natuurkunde",
    line2: "Jaar 2",
    badge: "TN Jaar 2",
    badgeTone: "soft",
    categories: ["Alle leden", "Jaar 2+"],
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=82"
  },
  {
    id: "daan-visser",
    name: "Daan Visser",
    line1: "Onderwijs",
    line2: "EduCom",
    badge: "EduCom",
    badgeTone: "navy",
    categories: ["Alle leden", "Commissies"],
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=82"
  },
  {
    id: "noor-bakker",
    name: "Noor Bakker",
    line1: "Activiteiten",
    line2: "AcCom",
    badge: "AcCom",
    badgeTone: "navy",
    categories: ["Alle leden", "Commissies"],
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=82"
  },
  {
    id: "milan-de-boer",
    name: "Milan de Boer",
    line1: "Technische Natuurkunde",
    line2: "Jaar 1",
    badge: "TN Jaar 1",
    badgeTone: "soft",
    categories: ["Alle leden", "Jaar 1"],
    image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=240&q=82"
  }
];
