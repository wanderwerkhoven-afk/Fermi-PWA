"use client";

import Link from "next/link";
import {
  Atom,
  Bell,
  CalendarDays,
  ChevronRight,
  Coins,
  FileText,
  GraduationCap,
  Home,
  Megaphone,
  Plane,
  UserRound,
  UsersRound,
} from "lucide-react";
import { committees } from "@/data/committees";

const board = [
  {
    name: "Lara Smit",
    role: "Voorzitter",
    description: "Leidt het bestuur, bewaakt de koers en vertegenwoordigt S.V. Fermi.",
    icon: UserRound,
    image: "lara",
  },
  {
    name: "Sienna Koomen",
    role: "Secretaris",
    description: "Verzorgt communicatie, administratie en houdt de vereniging organisatorisch bij.",
    icon: BarChartIcon,
    image: "sienna",
  },
  {
    name: "Daan Pronk",
    role: "Penningmeester",
    description: "Beheert de financiën van de vereniging en bewaakt inkomsten en uitgaven.",
    icon: Coins,
    image: "daan",
  },
  {
    name: "Helena Diks",
    role: "Commissaris Sociaal",
    description: "Organiseert borrels, activiteiten en sociale uitjes voor de leden.",
    icon: UsersRound,
    image: "helena",
  },
  {
    name: "Demi Avnioğlu",
    role: "Commissaris Educatief",
    description: "Organiseert lezingen, bedrijfsbezoeken en studiegerichte activiteiten.",
    icon: GraduationCap,
    image: "demi",
  },
];

function BarChartIcon({ size = 24 }: { size?: number }) {
  return (
    <span className="fermi-bar-icon" style={{ width: size, height: size }} aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

const documents = [
  { title: "Statuten", subtitle: "De statuten van S.V. Fermi" },
  { title: "Huishoudelijk reglement", subtitle: "Het huishoudelijk reglement van S.V. Fermi" },
  { title: "ALV-documenten", subtitle: "Notulen, jaarverslagen en andere ALV-stukken" },
];

export default function FermiPage() {
  return (
    <main className="app-shell fermi-page-shell">
      <div className="noise" aria-hidden="true" />

      <section className="fermi-page-hero">
        <header className="topbar">
          <div className="brand">
            <div className="fermi-mark" aria-hidden="true">
              <span className="fermi-mark-line line-one" />
              <span className="fermi-mark-line line-two" />
              <span className="fermi-mark-circle">Fermi</span>
            </div>
            <span>SV Fermi</span>
          </div>

          <button className="icon-button notification-button" aria-label="Meldingen">
            <Bell size={22} strokeWidth={2.1} />
            <span className="notification-dot" />
          </button>
        </header>

        <div className="fermi-page-title-wrap">
          <div className="fermi-cutout-title" aria-label="Fermi">
            <span>F</span><span>e</span><span>r</span><span>m</span><span>i</span>
          </div>
          <p>Alles over de vereniging</p>

          <div className="fermi-hero-collage" aria-hidden="true">
            <span className="fermi-hero-orange-disc" />
            <span className="fermi-hero-building" />
            <span className="fermi-hero-crowd" />
            <span className="fermi-hero-plane">➤</span>
            <span className="fermi-hero-route" />
            <span className="fermi-hero-dots" />
          </div>
        </div>
      </section>

      <section className="fermi-page-content">
        <section className="fermi-section">
          <div className="fermi-section-heading">
            <h2>Bestuur</h2>
            <Link href="/fermi/bestuur">Bekijk volledig bestuur <ChevronRight size={18} /></Link>
          </div>

          <div className="fermi-board-grid">
            {board.slice(0, 3).map(({ name, role, description, icon: Icon, image }) => (
              <article className="fermi-board-card" key={name}>
                <div className={`fermi-board-photo fermi-board-${image}`}>
                  <span className="fermi-board-art-overlay" />
                </div>
                <div className="fermi-board-icon">
                  <Icon size={23} />
                </div>
                <div className="fermi-board-copy">
                  <span className="fermi-board-name">{name}</span>
                  <h3>{role}</h3>
                  <p>{description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="fermi-section">
          <div className="fermi-section-heading">
            <h2>Commissies</h2>
            <button>Bekijk alle commissies <ChevronRight size={18} /></button>
          </div>

          <div className="fermi-committee-grid">
            {committees.map((committee) => {
              const Icon =
                committee.icon === "users" ? UsersRound :
                committee.icon === "education" ? GraduationCap :
                committee.icon === "plane" ? Plane :
                Megaphone;

              return (
                <Link
                  className="fermi-committee-card"
                  href={`/fermi/commissies/${committee.slug}`}
                  key={committee.slug}
                  aria-label={`Bekijk ${committee.name}`}
                >
                  <span className="fermi-committee-icon"><Icon size={25} /></span>
                  <span className="fermi-committee-copy">
                    <strong>{committee.name}</strong>
                    <small>{committee.description}</small>
                  </span>
                  <span className={`fermi-committee-art fermi-committee-${committee.art}`} />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="fermi-section fermi-docs-section">
          <div className="fermi-section-heading">
            <h2>Documenten</h2>
            <button>Bekijk alle documenten <ChevronRight size={18} /></button>
          </div>

          <div className="fermi-docs-wrap">
            <div className="fermi-doc-list">
              {documents.map((doc) => (
                <button className="fermi-doc-row" key={doc.title}>
                  <span className="fermi-doc-icon"><FileText size={23} /></span>
                  <span className="fermi-doc-copy">
                    <strong>{doc.title}</strong>
                    <small>{doc.subtitle}</small>
                  </span>
                  <ChevronRight size={21} />
                </button>
              ))}
            </div>

            <div className="fermi-doc-art" aria-hidden="true">
              <Atom size={112} />
              <span className="fermi-doc-dots" />
            </div>
          </div>
        </section>
      </section>

      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item" href="/">
          <Home size={23} />
          <span>Home</span>
        </Link>
        <Link className="nav-item" href="/agenda">
          <CalendarDays size={23} />
          <span>Agenda</span>
        </Link>
        <Link className="nav-item center-item active" href="/fermi">
          <span className="nav-fermi">
            <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="" />
          </span>
          <span>Fermi</span>
          <i />
        </Link>
        <Link className="nav-item" href="/community">
          <UsersRound size={25} />
          <span>Community</span>
        </Link>
        <Link className="nav-item" href="/profiel">
          <UserRound size={24} />
          <span>Profiel</span>
        </Link>
      </nav>
    </main>
  );
}
