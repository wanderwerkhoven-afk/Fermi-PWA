"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Home,
  MapPin,
  UserRound,
  UsersRound,
} from "lucide-react";
import { agendaEvents, type AgendaEvent } from "@/data/agenda-events";
import { listActivities } from "@/lib/services/activities";

const filters = ["Alles", "Borrel", "Lezingen", "Reizen", "Commissies"] as const;
type AgendaFilter = (typeof filters)[number];

function matchesAgendaFilter(event: AgendaEvent, filter: AgendaFilter) {
  const type = event.type.trim().toLowerCase();

  switch (filter) {
    case "Borrel":
      return type.includes("borrel");
    case "Lezingen":
      return type.includes("lezing") || type.includes("cursus");
    case "Reizen":
      return type.includes("reis");
    case "Commissies":
      return type.includes("commissie");
    default:
      return true;
  }
}

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
  const [events, setEvents] = useState<AgendaEvent[]>(agendaEvents);
  const [activeFilter, setActiveFilter] = useState<AgendaFilter>("Alles");

  useEffect(() => {
    let active = true;
    listActivities()
      .then((items) => {
        if (active) setEvents(items);
      })
      .catch((error) => console.error("Activiteiten laden uit Firebase mislukt", error));
    return () => {
      active = false;
    };
  }, []);

  const selectedEvents = useMemo(
    () =>
      events.filter(
        (event) =>
          event.showInAgenda !== false &&
          event.month === months[selectedMonth].short &&
          Number(event.year) === selectedYear &&
          matchesAgendaFilter(event, activeFilter),
      ),
    [events, selectedMonth, selectedYear, activeFilter],
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
            <img
              className="fermi-logo-image"
              src="/Fermi-PWA/images/branding/fermi-logo.png"
              alt="SV Fermi"
            />
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

          <div className="agenda-collage agenda-collage-redesign agenda-hero-image-wrap" aria-hidden="true">
            <img
              className="agenda-hero-image"
              src="/Fermi-PWA/images/agenda/agenda-hero-illustration.png"
              alt=""
            />
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
          {filters.map((filter) => (
            <button
              key={filter}
              type="button"
              className={activeFilter === filter ? "active" : ""}
              aria-pressed={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
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
            <strong>
              {activeFilter === "Alles"
                ? `Geen activiteiten in ${months[selectedMonth].name}`
                : `Geen ${activeFilter.toLowerCase()} in ${months[selectedMonth].name}`}
            </strong>
            <span>
              {activeFilter === "Alles"
                ? "Gebruik de pijlen om naar een andere maand te gaan."
                : "Kies een ander filter of blader naar een andere maand."}
            </span>
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
          <span className="nav-fermi">
            <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="" />
          </span>
          <span>Fermi</span>
        </Link>
        <Link className="nav-item" href="/community"><UsersRound size={25} /><span>Community</span></Link>
        <Link className="nav-item" href="/profiel"><UserRound size={24} /><span>Profiel</span></Link>
      </nav>
    </main>
  );
}
