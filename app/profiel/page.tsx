"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Home,
  MapPin,
  Pencil,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

const menuItems = [
  {
    title: "Mijn activiteiten",
    subtitle: "Bekijk en beheer je aanmeldingen",
    icon: CalendarDays,
    href: "/agenda",
  },
  {
    title: "Mijn commissies",
    subtitle: "Overzicht van je commissies",
    icon: UsersRound,
    href: "/fermi",
  },
  {
    title: "Notificaties",
    subtitle: "Beheer je meldingen en voorkeuren",
    icon: Bell,
    href: "#",
  },
  {
    title: "Privacy",
    subtitle: "Jouw gegevens en privacy instellingen",
    icon: ShieldCheck,
    href: "#",
  },
  {
    title: "Instellingen",
    subtitle: "App instellingen en voorkeuren",
    icon: Settings,
    href: "#",
  },
];

function FermiMark() {
  return (
    <div className="fermi-mark profile-fermi-mark" aria-hidden="true">
      <span className="fermi-mark-line line-one" />
      <span className="fermi-mark-line line-two" />
      <span className="fermi-mark-circle">Fermi</span>
    </div>
  );
}

function FakeQr() {
  const cells = [
    0,1,2,4,6,7,8,10,12,13,14,
    15,17,19,20,21,23,25,27,29,
    30,31,32,34,36,38,39,40,42,
    45,47,48,50,52,54,56,58,59,
    60,62,64,65,67,69,71,73,74,
    75,76,77,79,81,83,84,86,88,
    90,92,94,96,98,99,100,102,104,
    105,107,109,110,112,114,116,118,119,
    120,121,122,124,126,128,129,130,132,134,
    135,137,139,140,142,144,146,148,149,
  ];

  return (
    <div className="profile-qr" aria-label="QR-code placeholder">
      {Array.from({ length: 150 }).map((_, index) => (
        <i key={index} className={cells.includes(index) ? "filled" : ""} />
      ))}
    </div>
  );
}

export default function ProfilePage() {
  return (
    <main className="app-shell profile-page-shell">
      <div className="noise" aria-hidden="true" />

      <section className="profile-hero">
        <header className="topbar">
          <div className="brand">
            <FermiMark />
            <span>SV Fermi</span>
          </div>

          <button className="icon-button notification-button" aria-label="Meldingen">
            <Bell size={22} strokeWidth={2.1} />
            <span className="notification-dot" />
          </button>
        </header>

        <div className="profile-title-row">
          <h1>Profiel</h1>
          <div className="profile-title-art" aria-hidden="true">
            <span className="profile-orange-disc" />
            <span className="profile-building" />
            <span className="profile-dots" />
          </div>
        </div>

        <div className="profile-member-summary">
          <div className="profile-avatar-wrap">
            <img
              src="/Fermi-PWA/images/community/member-lars.svg"
              alt="Profielfoto"
              className="profile-avatar"
            />
          </div>

          <div className="profile-member-copy">
            <h2>Wander Werkhoven</h2>
            <p>Lid <span>•</span> Sinds september 2024</p>
            <p><GraduationCap size={17} /> Natuurkunde (BSc)</p>
            <p><MapPin size={17} /> Haarlem</p>
          </div>

          <button className="profile-edit-button">
            Profiel bewerken <Pencil size={16} />
          </button>
        </div>
      </section>

      <section className="profile-content">
        <section className="member-card">
          <div className="member-card-paper" />
          <div className="member-card-left">
            <h2>Digitale ledenpas</h2>
            <div className="member-card-brand">
              <FermiMark />
              <div>
                <strong>SV Fermi</strong>
                <span>Lidmaatschap 2026/2027</span>
              </div>
            </div>

            <div className="member-card-name">Wander Werkhoven</div>
            <div className="member-card-meta">Lidnummer: 2025-1042</div>
            <div className="member-card-meta">Geldig t/m 31 aug 2027</div>
          </div>

          <div className="member-card-right">
            <FakeQr />
            <small>Toon bij activiteitscheck-in<br />en kortingen</small>
          </div>
        </section>

        <section className="profile-stats">
          <div>
            <CalendarDays size={29} />
            <span>
              <strong>18</strong>
              <small>Activiteiten<br />dit jaar</small>
            </span>
          </div>
          <div>
            <UserRound size={29} />
            <span>
              <strong>Sep 2024</strong>
              <small>Lid sinds</small>
            </span>
          </div>
          <div>
            <UsersRound size={29} />
            <span>
              <strong>2</strong>
              <small>Commissies<br />actief</small>
            </span>
          </div>
        </section>

        <section className="profile-menu-section">
          <h2>Mijn Fermi</h2>

          <div className="profile-menu-list">
            {menuItems.map(({ title, subtitle, icon: Icon, href }) => (
              <Link className="profile-menu-row" href={href} key={title}>
                <span className="profile-menu-icon"><Icon size={23} /></span>
                <span className="profile-menu-copy">
                  <strong>{title}</strong>
                  <small>{subtitle}</small>
                </span>
                <ChevronRight size={22} />
              </Link>
            ))}
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
        <Link className="nav-item center-item" href="/fermi">
          <span className="nav-fermi">
            <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="" />
          </span>
          <span>Fermi</span>
        </Link>
        <Link className="nav-item" href="/community">
          <UsersRound size={25} />
          <span>Community</span>
        </Link>
        <Link className="nav-item active" href="/profiel">
          <UserRound size={24} fill="currentColor" />
          <span>Profiel</span>
          <i />
        </Link>
      </nav>
    </main>
  );
}
