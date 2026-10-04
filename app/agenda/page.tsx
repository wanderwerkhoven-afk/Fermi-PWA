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
import {
  agendaEvents,
  type AgendaBackgroundPreset,
  type AgendaEvent,
} from "@/data/agenda-events";
import { listActivities } from "@/lib/services/activities";

const filters = ["Alles", "Borrel", "Lezingen", "Reizen", "Commissies"] as const;

const agendaBackgroundPresets: Record<AgendaBackgroundPreset, string> = {
  boottocht: "/Fermi-PWA/images/agenda/activities/container-images/boottocht.png",
  bowlen: "/Fermi-PWA/images/agenda/activities/container-images/bowlen.png",
  karten: "/Fermi-PWA/images/agenda/activities/container-images/karten.png",
  kerst: "/Fermi-PWA/images/agenda/activities/container-images/kerst.png",
  lasergamen: "/Fermi-PWA/images/agenda/activities/container-images/lasergamen.png",
  nieuwjaar: "/Fermi-PWA/images/agenda/activities/container-images/nieuwjaar.png",
  schilderen: "/Fermi-PWA/images/agenda/activities/container-images/schilderen.png",
  pasen: "/Fermi-PWA/images/agenda/activities/container-images/pasen.png",
  picknick: "/Fermi-PWA/images/agenda/activities/container-images/picknick.png",
  poolen: "/Fermi-PWA/images/agenda/activities/container-images/poolen.png",
};

function resolveAgendaBackgroundPreset(event: AgendaEvent): AgendaBackgroundPreset | null {
  if (event.backgroundPreset) return event.backgroundPreset;

  const haystack = `${event.title} ${event.type}`.toLowerCase();
  const aliases: Array<[AgendaBackgroundPreset, string[]]> = [
    ["boottocht", ["boottocht", "varen", "boot"]],
    ["bowlen", ["bowlen", "bowling"]],
    ["karten", ["karten", "karting"]],
    ["kerst", ["kerst", "christmas"]],
    ["lasergamen", ["lasergamen", "laser game", "lasergame"]],
    ["nieuwjaar", ["nieuwjaar", "new year"]],
    ["schilderen", ["schilderen", "painting", "paint"]],
    ["pasen", ["pasen", "easter"]],
    ["picknick", ["picknick", "picnic"]],
    ["poolen", ["poolen", "poolavond", "poolen"]],
  ];

  return aliases.find(([, terms]) => terms.some((term) => haystack.includes(term)))?.[0] ?? null;
}

function resolveActivityImagePath(path: string | undefined) {
  if (!path) return null;
  if (path.includes("/container-images/") || path.includes("/detail-images/")) {
    return `/Fermi-PWA${path}`;
  }
  if (path.startsWith("/images/agenda/activities/")) {
    return `/Fermi-PWA${path.replace(
      "/images/agenda/activities/",
      "/images/agenda/activities/container-images/",
    )}`;
  }
  return `/Fermi-PWA${path}`;
}

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

const agendaCardStyle = {
  standard: "agenda-card agenda-card-redesign",
  nextUpcoming: "agenda-card agenda-card-redesign featured",
} as const;

function getEventDateParts(event: AgendaEvent) {
  const monthIndex = months.findIndex((month) => month.short === event.month);
  const year = Number(event.year);
  const day = Number(event.day);

  if (monthIndex < 0 || !Number.isFinite(year) || !Number.isFinite(day)) return null;
  return { year, monthIndex, day };
}

function getEventStart(event: AgendaEvent) {
  const parts = getEventDateParts(event);
  if (!parts) return Number.POSITIVE_INFINITY;

  const firstTime = event.time.match(/(\d{1,2}):(\d{2})/);
  const hour = firstTime ? Number(firstTime[1]) : 0;
  const minute = firstTime ? Number(firstTime[2]) : 0;

  return new Date(parts.year, parts.monthIndex, parts.day, hour, minute).getTime();
}

function getEventEnd(event: AgendaEvent) {
  const parts = getEventDateParts(event);
  if (!parts) return Number.NEGATIVE_INFINITY;

  const times = [...event.time.matchAll(/(\d{1,2}):(\d{2})/g)];
  const lastTime = times.at(-1);
  const hour = lastTime ? Number(lastTime[1]) : 23;
  const minute = lastTime ? Number(lastTime[2]) : 59;

  return new Date(parts.year, parts.monthIndex, parts.day, hour, minute, 59, 999).getTime();
}

export default function AgendaPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
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

  const nextUpcomingSlug = useMemo(() => {
    const now = Date.now();

    return events
      .filter((event) => event.showInAgenda !== false && getEventEnd(event) >= now)
      .sort((a, b) => getEventStart(a) - getEventStart(b))[0]?.slug ?? null;
  }, [events]);

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
        {selectedEvents.map((event) => {
          const isNextUpcoming = event.slug === nextUpcomingSlug;
          const backgroundPreset = resolveAgendaBackgroundPreset(event);
          const backgroundImage = resolveActivityImagePath(event.imagePath)
            || (backgroundPreset ? agendaBackgroundPresets[backgroundPreset] : null);

          return (
          <Link
            href={`/agenda/${event.slug}`}
            className="agenda-card-link"
            key={event.slug}
            aria-label={`Bekijk ${event.title}`}
          >
            <article
              className={`${isNextUpcoming ? agendaCardStyle.nextUpcoming : agendaCardStyle.standard}${backgroundImage ? " agenda-card-with-preset" : ""}`}
              style={backgroundImage ? { backgroundImage: `url("${backgroundImage}")` } : undefined}
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

                {isNextUpcoming && (
                  <span className="agenda-detail-button">
                    Bekijk details <ChevronRight size={19} />
                  </span>
                )}
              </div>

              {!backgroundImage && (
                <div className={`agenda-photo agenda-photo-${event.art}`} aria-label="Activiteitsafbeelding">
                  <span className="agenda-photo-overlay" />
                </div>
              )}

              {!isNextUpcoming && <ChevronRight className="agenda-card-chevron" size={22} />}
            </article>
          </Link>
          );
        })}

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
