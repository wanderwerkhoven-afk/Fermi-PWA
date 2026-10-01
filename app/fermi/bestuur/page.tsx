import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Coins,
  GraduationCap,
  Home,
  UserRound,
  UsersRound,
} from "lucide-react";

const board = [
  {
    name: "Lara Smit",
    role: "Voorzitter",
    description: "Leidt het bestuur, bewaakt de koers en vertegenwoordigt S.V. Fermi.",
    image: "lara",
    icon: UserRound,
  },
  {
    name: "Sienna Koomen",
    role: "Secretaris",
    description: "Verzorgt communicatie, administratie en houdt de vereniging organisatorisch bij.",
    image: "sienna",
    icon: UserRound,
  },
  {
    name: "Daan Pronk",
    role: "Penningmeester",
    description: "Beheert de financiën van de vereniging en bewaakt inkomsten en uitgaven.",
    image: "daan",
    icon: Coins,
  },
  {
    name: "Helena Diks",
    role: "Commissaris Sociaal",
    description: "Organiseert borrels, activiteiten en sociale uitjes voor de leden.",
    image: "helena",
    icon: UsersRound,
  },
  {
    name: "Demi Avnioğlu",
    role: "Commissaris Educatief",
    description: "Organiseert lezingen, bedrijfsbezoeken en studiegerichte activiteiten.",
    image: "demi",
    icon: GraduationCap,
  },
];

export default function BoardPage() {
  return (
    <main className="app-shell board-page-shell">
      <div className="noise" aria-hidden="true" />

      <section className="board-page-hero">
        <header className="board-page-topbar">
          <Link className="event-back-button" href="/fermi" aria-label="Terug naar Fermi">
            <ArrowLeft size={22} />
          </Link>
          <div className="brand board-page-brand">
            <img
              className="fermi-logo-image"
              src="/Fermi-PWA/images/branding/fermi-logo.png"
              alt="SV Fermi"
            />
            <span>SV Fermi</span>
          </div>
          <button className="icon-button notification-button" aria-label="Meldingen">
            <Bell size={21} />
            <span className="notification-dot" />
          </button>
        </header>

        <div className="board-page-title">
          <span className="board-page-kicker">DE VERENIGING</span>
          <h1>Het bestuur</h1>
          <p>Maak kennis met de mensen achter S.V. Fermi.</p>
          <span className="board-title-dots" />
        </div>
      </section>

      <section className="board-page-content">
        <div className="board-full-grid">
          {board.map(({ name, role, description, image, icon: Icon }, index) => (
            <article className={`board-full-card ${index === 0 ? "featured" : ""}`} key={name}>
              <div className={`board-full-photo fermi-board-${image}`}>
                <span className="board-photo-treatment" />
              </div>
              <div className="board-full-copy">
                <span className="board-role-icon"><Icon size={22} /></span>
                <span className="board-person-name">{name}</span>
                <h2>{role}</h2>
                <p>{description}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="board-source-note">
          <strong>Bestuur S.V. Fermi</strong>
          <p>De rollen en bestuursinformatie worden onderhouden vanuit de verenigingsinformatie.</p>
        </div>
      </section>

      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item" href="/"><Home size={23} /><span>Home</span></Link>
        <Link className="nav-item" href="/agenda"><CalendarDays size={23} /><span>Agenda</span></Link>
        <Link className="nav-item center-item active" href="/fermi">
          <span className="nav-fermi">
            <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="" />
          </span>
          <span>Fermi</span><i />
        </Link>
        <Link className="nav-item" href="/community"><UsersRound size={25} /><span>Community</span></Link>
        <Link className="nav-item" href="/profiel"><UserRound size={24} /><span>Profiel</span></Link>
      </nav>
    </main>
  );
}
