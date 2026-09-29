"use client";

import Link from "next/link";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Home,
  MapPin,
  Menu,
  UserRound,
  UsersRound,
} from "lucide-react";\nimport { agendaEvents } from "@/data/agenda-events";

const events = [
  {
    day: "13",
    month: "NOV",
    type: "BORREL",
    title: "Maandborrel",
    time: "16:30 – 23:00",
    location: "Café de Jäger, Haarlem",
    art: "beer",
    featured: true,
  },
  {
    day: "21",
    month: "NOV",
    type: "CURSUS",
    title: "Impuls Cursus",
    time: "15:30 – 18:00",
    location: "JMH 04D04",
    art: "course",
  },
  {
    day: "26",
    month: "NOV",
    type: "LEZING",
    title: "Lezing: Quantum Computers",
    time: "15:30 – 17:00",
    location: "K2.01",
    art: "quantum",
  },
  {
    day: "28",
    month: "NOV",
    type: "COMMISSIE",
    title: "Open Spreekuur",
    time: "15:30 – 17:30",
    location: "JMH 04D04",
    art: "legal",
  },
  {
    day: "04",
    month: "DEC",
    type: "VERGADERING",
    title: "ALV",
    time: "19:30 – 22:00",
    location: "De Fysica Kantine",
    art: "meeting",
  },
];

const filters = ["Alles", "Borrel", "Lezingen", "Reizen", "Commissies"];

export default function AgendaPage() {
  return (
    <main className="app-shell agenda-shell">
      <div className="noise" aria-hidden="true" />

      <section className="agenda-hero agenda-hero-redesign">
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

        <div className="agenda-title-row agenda-title-redesign">
          <div className="agenda-title-copy">
            <h1>Agen<span>da</span></h1>
            <p>Wat staat er op de planning?</p>
          </div>

          <div className="agenda-collage agenda-collage-redesign" aria-hidden="true">
            <span className="agenda-paper-plane">➤</span>
            <span className="agenda-route-line" />
            <span className="agenda-orange-paper" />
            <span className="agenda-calendar-sheet">
              <span className="calendar-rings" />
              <b>NOVEMBER</b>
              <span className="calendar-grid">
                {Array.from({ length: 20 }).map((_, index) => <i key={index} />)}
              </span>
              <span className="calendar-circle" />
            </span>
          </div>
        </div>

        <div className="month-switcher month-switcher-redesign">
          <button aria-label="Vorige maand"><ChevronLeft size={23} /></button>
          <strong>November 2025</strong>
          <button aria-label="Volgende maand"><ChevronRight size={23} /></button>
        </div>

        <div className="agenda-filters agenda-filters-redesign" aria-label="Agenda filters">
          {filters.map((filter, index) => (
            <button key={filter} className={index === 0 ? "active" : ""}>{filter}</button>
          ))}
        </div>
      </section>

      <section className="agenda-list agenda-list-redesign">
        {agendaEvents.map((event) => (
          <Link
            href={`/agenda/${event.slug}`}
            className="agenda-card-link"
            key={event.slug}
            aria-label={`Bekijk ${event.title}`}
          >
          <article
            className={`agenda-card agenda-card-redesign ${event.featured ? "featured" : ""}`}
          >
            <div className="agenda-date agenda-date-redesign">
              <strong>{event.day}</strong>
              <span>{event.month}</span>
            </div>

            <div className="agenda-card-copy agenda-card-copy-redesign">
              <span className="agenda-type">{event.type}</span>
              <h2>{event.title}</h2>
              <p><Clock3 size={16} /> {event.time}</p>
              <p><MapPin size={16} /> {event.location}</p>

              {event.featured && (
                <span className="agenda-detail-button">
                  Bekijk details <ChevronRight size={19} />
                </span>
              )}
            </div>

            <div className={`agenda-photo agenda-photo-${event.art}`} aria-label="Tijdelijke stockafbeelding">
              <span className="agenda-photo-overlay" />
            </div>

            {!event.featured && <ChevronRight className="agenda-card-chevron" size={22} />}
          </article>
          </Link>
        ))}
      </section>

      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item" href="/">
          <Home size={23} />
          <span>Home</span>
        </Link>
        <Link className="nav-item active" href="/agenda">
          <CalendarDays size={23} />
          <span>Agenda</span>
          <i />
        </Link>
        <a className="nav-item center-item" href="#">
          <span className="nav-fermi"><Menu size={14} /><span>Fermi</span></span>
          <span>Fermi</span>
        </a>
        <a className="nav-item" href="#"><UsersRound size={25} /><span>Community</span></a>
        <a className="nav-item" href="#"><UserRound size={24} /><span>Profiel</span></a>
      </nav>
    </main>
  );
}
