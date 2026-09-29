"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Home,
  IdCard,
  MapPin,
  Megaphone,
  Menu,
  Orbit,
  ShoppingBag,
  UserRound,
  UsersRound,
} from "lucide-react";

const upcoming = [
  {
    day: "18",
    month: "NOV",
    title: "Open Spreekuur",
    time: "15:30 – 17:30",
    location: "JMH 04D04",
    art: "legal",
  },
  {
    day: "21",
    month: "NOV",
    title: "Beer Pong Toernooi",
    time: "19:00 – 23:00",
    location: "De Fysica Kantine",
    art: "beer",
  },
  {
    day: "26",
    month: "NOV",
    title: "Lezing: Quantum Computers",
    time: "15:30 – 17:00",
    location: "K2.01",
    art: "quantum",
  },
];

export default function HomePage() {
  return (
    <main className="app-shell">
      <div className="noise" aria-hidden="true" />

      <section className="top-hero">
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

        <div className="welcome-row">
          <div>
            <h1>
              Hoi <span>Wander</span>
            </h1>
            <p>Klaar voor de volgende activiteit?</p>
          </div>

          <div className="hero-collage-placeholder" aria-label="Tijdelijke Fermi illustratie">
            <Orbit className="orbit-icon" />
            <span className="sun-disc" />
            <span className="torn torn-a" />
            <span className="torn torn-b" />
          </div>
        </div>
      </section>

      <section className="content">
        <article className="featured-event">
          <div className="featured-copy">
            <span className="eyebrow">Volgende activiteit</span>
            <h2>Maandborrel</h2>

            <div className="event-meta">
              <span><CalendarDays size={18} /> Donderdag 13 nov 2026</span>
              <span><Clock3 size={18} /> 16:30 – 23:00</span>
              <span><MapPin size={18} /> Café de Jäger, Haarlem</span>
            </div>

            <button className="primary-button">
              Bekijk activiteit <ChevronRight size={22} />
            </button>
          </div>

          <div className="featured-art placeholder-art beer-art" aria-label="Afbeelding placeholder">
            <div className="placeholder-label">EVENT ART</div>
            <div className="glass glass-left" />
            <div className="glass glass-right" />
            <div className="burst burst-one" />
            <div className="burst burst-two" />
          </div>
        </article>

        <section className="section-block">
          <div className="section-heading">
            <h2>Binnenkort</h2>
            <Link className="text-link" href="/agenda">Bekijk agenda <ChevronRight size={17} /></Link>
          </div>

          <div className="event-strip">
            {upcoming.map((event) => (
              <article className="mini-event" key={event.day}>
                <div className={`mini-art placeholder-art ${event.art}`}>
                  <div className="date-chip">
                    <strong>{event.day}</strong>
                    <span>{event.month}</span>
                  </div>
                  <span className="mini-art-label">{event.art === "beer" ? "● ● ●" : event.art === "legal" ? "§" : "ψ"}</span>
                </div>
                <div className="mini-event-body">
                  <h3>{event.title}</h3>
                  <p><Clock3 size={15} /> {event.time}</p>
                  <p><MapPin size={15} /> {event.location}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <h2>Mededelingen</h2>
            <button className="text-link">Bekijk alle mededelingen <ChevronRight size={17} /></button>
          </div>

          <div className="announcements">
            <button className="announcement-card">
              <span className="announcement-icon"><Megaphone size={22} /></span>
              <span className="announcement-copy">
                <strong>Inschrijvingen Studiereis geopend!</strong>
                <small>De inschrijvingen voor de studiereis zijn nu open. Vergeet je niet in te schrijven!</small>
              </span>
              <ChevronRight className="announcement-chevron" size={21} />
            </button>

            <button className="announcement-card">
              <span className="announcement-icon"><ShoppingBag size={22} /></span>
              <span className="announcement-copy">
                <strong>Nieuw: Fermi Merchandise</strong>
                <small>De nieuwe collectie is nu beschikbaar in de webshop. Scoor jouw hoodie!</small>
              </span>
              <ChevronRight className="announcement-chevron" size={21} />
            </button>
          </div>
        </section>

        <button className="member-pass-preview">
          <span className="pass-icon"><IdCard size={30} /></span>
          <span className="pass-copy">
            <strong>Digitale ledenpas</strong>
            <small>Toon je ledenpas bij activiteiten en ontvang kortingen</small>
          </span>
          <span className="pass-art" aria-hidden="true">
            <span className="pass-orbit" />
          </span>
          <ChevronRight size={20} />
        </button>
      </section>

      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item active" href="/">
          <Home size={23} fill="currentColor" />
          <span>Home</span>
          <i />
        </Link>
        <Link className="nav-item" href="/agenda">
          <CalendarDays size={23} />
          <span>Agenda</span>
        </Link>
        <Link className="nav-item center-item" href="/fermi">
          <span className="nav-fermi">
            <Menu size={14} />
            <span>Fermi</span>
          </span>
          <span>Fermi</span>
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
