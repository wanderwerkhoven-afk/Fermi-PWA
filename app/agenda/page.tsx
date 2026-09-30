"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { agendaEvents } from "@/data/agenda-events";

const filters = ["Alles", "Borrel", "Lezingen", "Reizen", "Commissies"];

const months = [
  { name: "Januari", short: "JAN" },
  { name: "Februari", short: "FEB" },
  { name: "Maart", short: "MAR" },
  { name: "April", short: "APR" },
  { name: "Mei", short: "MEI" },
  { name: "Juni", short: "JUN" },
  { name: "Juli", short: "JUL" },
  { name: "Augustus", short: "AUG" },
  { name: "September", short: "SEP" },
  { name: "Oktober", short: "OKT" },
  { name: "November", short: "NOV" },
  { name: "December", short: "DEC" },
];

export default function AgendaPage() {
  const [selectedMonth, setSelectedMonth] = useState(10);
  const [selectedYear, setSelectedYear] = useState(2025);

  const selectedEvents = useMemo(
    () =>
      agendaEvents.filter(
        (event) =>
          event.showInAgenda !== false &&
          event.month === months[selectedMonth].short &&
          Number(event.year) === selectedYear,
      ),
    [selectedMonth, selectedYear],
  );

  function changeMonth(direction: -1 | 1) {
    setSelectedMonth((currentMonth) => {
      const nextMonth = currentMonth + direction;

      if (nextMonth < 0) {
        setSelectedYear((year) => year - 1);
        return 11;
      }

      if (nextMonth > 11) {
        setSelectedYear((year) => year + 1);
        return 0;
      }

      return nextMonth;
    });
  }

  const monthLabel = `${months[selectedMonth].name} ${selectedYear}`;

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
              <b>{months[selectedMonth].name.toUpperCase()}</b>
              <span className="calendar-grid">
                {Array.from({ length: 20 }).map((_, index) => <i key={index} />)}
              </span>
              <span className="calendar-circle" />
            </span>
          </div>
        </div>

        <div className="month-switcher month-switcher-redesign">
          <button aria-label="Vorige maand" onClick={() => changeMonth(-1)}>
            <ChevronLeft size={23} />
          </button>
          <strong aria-live="polite">{monthLabel}</strong>
          <button aria-label="Volgende maand" onClick={() => changeMonth(1)}>
            <ChevronRight size={23} />
          </button>
        </div>

        <div className="agenda-filters agenda-filters-redesign" aria-label="Agenda filters">
          {filters.map((filter, index) => (
            <button key={filter} className={index === 0 ? "active" : ""}>{filter}</button>
          ))}
        </div>
      </section>

      <section className="agenda-list agenda-list-redesign">
        {selectedEvents.map((event) => (
          <Link
            href={`/agenda/${event.slug}`}
            className="agenda-card-link"
            key={event.slug}
            aria-label={`Bekijk ${event.title}`}
          >
            <article className={`agenda-card agenda-card-redesign ${event.featured ? "featured" : ""}`}>
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

        {selectedEvents.length === 0 && (
          <div className="agenda-empty-month">
            <CalendarDays size={30} />
            <strong>Geen activiteiten in {months[selectedMonth].name}</strong>
            <span>Gebruik de pijlen om naar een andere maand te gaan.</span>
          </div>
        )}
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
        <Link className="nav-item center-item" href="/fermi">
          <span className="nav-fermi"><Menu size={14} /><span>Fermi</span></span>
          <span>Fermi</span>
        </Link>
        <Link className="nav-item" href="/community"><UsersRound size={25} /><span>Community</span></Link>
        <Link className="nav-item" href="/profiel"><UserRound size={24} /><span>Profiel</span></Link>
      </nav>
    </main>
  );
}
