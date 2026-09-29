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
  Menu,
  Plane,
  UserRound,
  UsersRound,
} from "lucide-react";

const board = [
  {
    role: "Voorzitter",
    description: "Verbindt de vereniging en houdt het overzicht.",
    icon: UserRound,
    image: "chair",
  },
  {
    role: "Secretaris",
    description: "Regelt de communicatie en houdt alles bij.",
    icon: BarChartIcon,
    image: "secretary",
  },
  {
    role: "Penningmeester",
    description: "Beheert de financiën en zorgt voor een gezonde vereniging.",
    icon: Coins,
    image: "treasurer",
  },
];

function BarChartIcon({ size = 24 }: { size?: number }) {
  return (
    <span className="fermi-bar-icon" style={{ width: size, height: size }} aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

const committees = [
  { name: "AcCom", description: "Activiteiten en gezelligheid", icon: UsersRound, art: "drinks" },
  { name: "EduCom", description: "Lezingen, cursussen en studiegerelateerd", icon: GraduationCap, art: "lecture" },
  { name: "ReisCom", description: "De mooiste studiereizen", icon: Plane, art: "travel" },
  { name: "PromoCom", description: "Communicatie en externe relaties", icon: Megaphone, art: "promo" },
];

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
            <button>Bekijk volledig bestuur <ChevronRight size={18} /></button>
          </div>

          <div className="fermi-board-grid">
            {board.map(({ role, description, icon: Icon, image }) => (
              <article className="fermi-board-card" key={role}>
                <div className={`fermi-board-photo fermi-board-${image}`}>
                  <span className="fermi-board-art-overlay" />
                </div>
                <div className="fermi-board-icon">
                  <Icon size={23} />
                </div>
                <div className="fermi-board-copy">
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
            {committees.map(({ name, description, icon: Icon, art }) => (
              <button className="fermi-committee-card" key={name}>
                <span className="fermi-committee-icon"><Icon size={25} /></span>
                <span className="fermi-committee-copy">
                  <strong>{name}</strong>
                  <small>{description}</small>
                </span>
                <span className={`fermi-committee-art fermi-committee-${art}`} />
              </button>
            ))}
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
            <Menu size={14} />
            <span>Fermi</span>
          </span>
          <span>Fermi</span>
          <i />
        </Link>
        <Link className="nav-item" href="/community">
          <UsersRound size={25} />
          <span>Community</span>
        </Link>
        <a className="nav-item" href="#">
          <UserRound size={24} />
          <span>Profiel</span>
        </a>
      </nav>
    </main>
  );
}
