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
    image: "/Fermi-PWA/images/community/member-sophie.svg"
  },
  {
    id: "lars-van-dijk",
    name: "Lars van Dijk",
    line1: "Acquisitie",
    line2: "AcCom",
    badge: "AcCom",
    badgeTone: "navy",
    categories: ["Alle leden", "Commissies"],
    image: "/Fermi-PWA/images/community/member-lars.svg"
  },
  {
    id: "emma-jansen",
    name: "Emma Jansen",
    line1: "Technische Natuurkunde",
    line2: "Jaar 2",
    badge: "TN Jaar 2",
    badgeTone: "soft",
    categories: ["Alle leden", "Jaar 2+"],
    image: "/Fermi-PWA/images/community/member-emma.svg"
  },
  {
    id: "daan-visser",
    name: "Daan Visser",
    line1: "Onderwijs",
    line2: "EduCom",
    badge: "EduCom",
    badgeTone: "navy",
    categories: ["Alle leden", "Commissies"],
    image: "/Fermi-PWA/images/community/member-daan.svg"
  },
  {
    id: "noor-bakker",
    name: "Noor Bakker",
    line1: "Activiteiten",
    line2: "AcCom",
    badge: "AcCom",
    badgeTone: "navy",
    categories: ["Alle leden", "Commissies"],
    image: "/Fermi-PWA/images/community/member-noor.svg"
  },
  {
    id: "milan-de-boer",
    name: "Milan de Boer",
    line1: "Technische Natuurkunde",
    line2: "Jaar 1",
    badge: "TN Jaar 1",
    badgeTone: "soft",
    categories: ["Alle leden", "Jaar 1"],
    image: "/Fermi-PWA/images/community/member-milan.svg"
  }
];
