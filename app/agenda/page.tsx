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
} from "lucide-react";

const events = [
  { day: "13", month: "NOV", type: "BORREL", title: "Maandborrel", time: "16:30 – 23:00", location: "Café de Jäger, Haarlem", art: "agenda-beer", featured: true },
  { day: "21", month: "NOV", type: "CURSUS", title: "Impuls Cursus", time: "15:30 – 18:00", location: "JMH 04D04", art: "agenda-course" },
  { day: "26", month: "NOV", type: "LEZING", title: "Lezing: Quantum Computers", time: "15:30 – 17:00", location: "K2.01", art: "agenda-quantum" },
  { day: "28", month: "NOV", type: "COMMISSIE", title: "Open Spreekuur", time: "15:30 – 17:30", location: "JMH 04D04", art: "agenda-legal" },
  { day: "04", month: "DEC", type: "VERGADERING", title: "ALV", time: "19:30 – 22:00", location: "De Fysica Kantine", art: "agenda-alv" },
];

const filters = ["Alles", "Borrel", "Lezingen", "Reizen", "Commissies"];

export default function AgendaPage() {
  return (
    <main className="app-shell agenda-shell">
      <div className="noise" aria-hidden="true" />

      <section className="agenda-hero">
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

        <div className="agenda-title-row">
          <div>
            <h1>Agenda</h1>
            <p>Wat staat er op de planning?</p>
          </div>
          <div className="agenda-collage" aria-hidden="true">
            <span className="agenda-orange-paper" />
            <span className="agenda-paper-plane">➤</span>
            <span className="agenda-calendar-sheet">
              <b>NOV</b><i /><i /><i /><i /><i /><i />
            </span>
          </div>
        </div>

        <div className="month-switcher">
          <button aria-label="Vorige maand"><ChevronLeft size={22} /></button>
          <strong>November 2026</strong>
          <button aria-label="Volgende maand"><ChevronRight size={22} /></button>
        </div>

        <div className="agenda-filters" aria-label="Agenda filters">
          {filters.map((filter, index) => (
            <button key={filter} className={index === 0 ? "active" : ""}>{filter}</button>
          ))}
        </div>
      </section>

      <section className="agenda-list">
        {events.map((event) => (
          <article className={`agenda-card ${event.featured ? "featured" : ""}`} key={event.day + event.title}>
            <div className="agenda-date">
              <strong>{event.day}</strong>
              <span>{event.month}</span>
            </div>

            <div className="agenda-card-copy">
              <span className="agenda-type">{event.type}</span>
              <h2>{event.title}</h2>
              <p><Clock3 size={16} /> {event.time}</p>
              <p><MapPin size={16} /> {event.location}</p>
              {event.featured && (
                <button className="agenda-detail-button">
                  Bekijk details <ChevronRight size={19} />
                </button>
              )}
            </div>

            <div className={`agenda-card-art ${event.art}`} aria-label="Afbeelding placeholder">
              <span className="agenda-art-symbol">
                {event.art === "agenda-beer" ? "●●" : event.art === "agenda-course" ? "∫" : event.art === "agenda-quantum" ? "ψ" : event.art === "agenda-legal" ? "§" : "✋"}
              </span>
              <span className="agenda-art-rip" />
            </div>
            {!event.featured && <ChevronRight className="agenda-card-chevron" size={22} />}
          </article>
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
