"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type TouchEvent } from "react";
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
  type AgendaBackgroundPreset,
  type AgendaEvent,
} from "@/data/agenda-events";
import { useAppData } from "@/components/AppDataProvider";

const filters = ["Alles", "Activiteiten", "Borrel", "Lezingen", "Reizen"] as const;

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
    case "Activiteiten":
      return type.includes("activiteit");
    case "Borrel":
      return type.includes("borrel");
    case "Lezingen":
      return type.includes("lezing") || type.includes("cursus");
    case "Reizen":
      return type.includes("reis");
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
  featured: "agenda-card agenda-card-redesign featured",
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

  if (event.endDate) {
    const endDate = new Date(`${event.endDate}T${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:59`);
    if (!Number.isNaN(endDate.getTime())) return endDate.getTime();
  }

  return new Date(parts.year, parts.monthIndex, parts.day, hour, minute, 59, 999).getTime();
}

function addMonths(year: number, monthIndex: number, amount: number) {
  const date = new Date(year, monthIndex + amount, 1, 12);
  return { year: date.getFullYear(), monthIndex: date.getMonth() };
}

function eventDateRange(event: AgendaEvent) {
  const parts = getEventDateParts(event);
  if (!parts) return null;
  const start = new Date(parts.year, parts.monthIndex, parts.day, 12);
  const end = event.endDate ? new Date(`${event.endDate}T12:00:00`) : start;
  return { start, end: Number.isNaN(end.getTime()) ? start : end };
}

function eventOccursOnDate(event: AgendaEvent, date: Date) {
  const range = eventDateRange(event);
  if (!range) return false;
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12).getTime();
  return target >= range.start.getTime() && target <= range.end.getTime();
}

function monthCalendarCells(year: number, monthIndex: number) {
  const firstDay = new Date(year, monthIndex, 1, 12);
  const daysInMonth = new Date(year, monthIndex + 1, 0, 12).getDate();
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  return [
    ...Array.from({ length: mondayOffset }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => new Date(year, monthIndex, index + 1, 12)),
  ];
}

export default function AgendaPage() {
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [showAllFuture, setShowAllFuture] = useState(false);
  const [calendarView, setCalendarView] = useState(false);
  const [calendarStartMonth, setCalendarStartMonth] = useState(() => new Date().getMonth());
  const [calendarStartYear, setCalendarStartYear] = useState(() => new Date().getFullYear());
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const { activities: events } = useAppData();
  const [activeFilter, setActiveFilter] = useState<AgendaFilter>("Alles");
  const [loadedCardImages, setLoadedCardImages] = useState<Set<string>>(() => new Set());
  const [agendaHeroReady, setAgendaHeroReady] = useState(false);



  const selectedEvents = useMemo(() => {
    const now = Date.now();

    return events
      .filter((event) =>
        event.showInAgenda !== false
        && matchesAgendaFilter(event, activeFilter)
        && (
          showAllFuture
            ? getEventEnd(event) >= now
            : event.month === months[selectedMonth].short && Number(event.year) === selectedYear
        )
      )
      .sort((a, b) => getEventStart(a) - getEventStart(b));
  }, [events, selectedMonth, selectedYear, activeFilter, showAllFuture]);

  useEffect(() => {
    const hero = new Image();
    const ready = () => setAgendaHeroReady(true);
    hero.onload = ready;
    hero.onerror = ready;
    hero.src = "/Fermi-PWA/images/agenda/agenda-hero-illustration.png";
    if (hero.complete) ready();
  }, []);

  useEffect(() => {
    let active = true;
    selectedEvents.forEach((event) => {
      const preset = resolveAgendaBackgroundPreset(event);
      const src = resolveActivityImagePath(event.imagePath)
        || (preset ? agendaBackgroundPresets[preset] : null);
      if (!src) return;

      const image = new Image();
      const markReady = () => {
        if (!active) return;
        setLoadedCardImages((current) => {
          const next = new Set(current);
          next.add(event.slug);
          return next;
        });
      };
      image.onload = markReady;
      image.onerror = markReady;
      image.src = src;
      if (image.complete) markReady();
    });

    return () => {
      active = false;
    };
  }, [selectedEvents]);

  function changeMonth(direction: -1 | 1) {
    setShowAllFuture(false);
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

  function changeCalendarPair(direction: -1 | 1) {
    const next = addMonths(calendarStartYear, calendarStartMonth, direction * 2);
    setCalendarStartYear(next.year);
    setCalendarStartMonth(next.monthIndex);
  }

  function openCalendarView() {
    setCalendarStartYear(selectedYear);
    setCalendarStartMonth(selectedMonth);
    setCalendarView(true);
  }

  function handleCalendarTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX === null) return;
    const delta = event.changedTouches[0]?.clientX - touchStartX;
    setTouchStartX(null);
    if (Math.abs(delta) < 45) return;
    changeCalendarPair(delta < 0 ? 1 : -1);
  }

  function renderCalendarMonth(year: number, monthIndex: number) {
    const cells = monthCalendarCells(year, monthIndex);
    const today = new Date();

    return (
      <section className="agenda-calendar-month" key={`${year}-${monthIndex}`}>
        <div className="agenda-calendar-month-title">
          <strong>{months[monthIndex].name}</strong>
          <span>{year}</span>
        </div>

        <div className="agenda-calendar-weekdays" aria-hidden="true">
          {["ma","di","wo","do","vr","za","zo"].map((day) => <span key={day}>{day}</span>)}
        </div>

        <div className="agenda-calendar-grid">
          {cells.map((date, index) => {
            if (!date) return <span className="agenda-calendar-day empty" key={`empty-${index}`} />;

            const dayEvents = events
              .filter((event) => event.showInAgenda !== false && eventOccursOnDate(event, date))
              .sort((a, b) => getEventStart(a) - getEventStart(b));
            const firstEvent = dayEvents[0];
            const detailImage = firstEvent
              ? resolveActivityImagePath(firstEvent.detailImagePath || firstEvent.imagePath)
              : null;
            const isToday =
              date.getFullYear() === today.getFullYear()
              && date.getMonth() === today.getMonth()
              && date.getDate() === today.getDate();

            const content = (
              <>
                {detailImage ? <img src={detailImage} alt="" aria-hidden="true" /> : null}
                <span className="agenda-calendar-day-number">{date.getDate()}</span>
                {dayEvents.length > 1 ? <span className="agenda-calendar-event-count">+{dayEvents.length - 1}</span> : null}
              </>
            );

            return firstEvent ? (
              <Link
                className={`agenda-calendar-day has-event${isToday ? " today" : ""}`}
                href={`/agenda/activiteit?slug=${encodeURIComponent(firstEvent.slug)}`}
                key={date.toISOString()}
                aria-label={`${date.getDate()} ${months[monthIndex].name}: ${firstEvent.title}`}
              >
                {content}
              </Link>
            ) : (
              <span className={`agenda-calendar-day${isToday ? " today" : ""}`} key={date.toISOString()}>
                {content}
              </span>
            );
          })}
        </div>
      </section>
    );
  }

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
              className={`agenda-hero-image${agendaHeroReady ? " is-ready" : ""}`}
              src="/Fermi-PWA/images/agenda/agenda-hero-illustration.png"
              alt=""
              loading="eager"
              fetchPriority="high"
              decoding="async"
              onLoad={() => setAgendaHeroReady(true)}
            />
          </div>
          <button
            type="button"
            className={`agenda-calendar-hero-button${calendarView ? " active" : ""}`}
            aria-label={calendarView ? "Terug naar agenda-overzicht" : "Open kalenderweergave"}
            aria-pressed={calendarView}
            onClick={() => calendarView ? setCalendarView(false) : openCalendarView()}
          >
            <CalendarDays size={22} />
          </button>
        </div>

        {!calendarView && (
          <>
            <div className="agenda-date-selector-row">
              <div className="month-switcher month-switcher-redesign">
                <button aria-label="Vorige maand" onClick={() => changeMonth(-1)}>
                  <ChevronLeft size={23} />
                </button>
                <strong aria-live="polite">{monthLabel}</strong>
                <button aria-label="Volgende maand" onClick={() => changeMonth(1)}>
                  <ChevronRight size={23} />
                </button>
              </div>
              <button
                type="button"
                className={`agenda-all-future-button${showAllFuture ? " active" : ""}`}
                aria-pressed={showAllFuture}
                onClick={() => setShowAllFuture((value) => !value)}
              >
                Alles
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
          </>
        )}
      </section>

      {calendarView ? (
        <section
          className="agenda-calendar-view"
          onTouchStart={(event) => setTouchStartX(event.touches[0]?.clientX ?? null)}
          onTouchEnd={handleCalendarTouchEnd}
        >
          <div className="agenda-calendar-pair-head">
            <button type="button" onClick={() => changeCalendarPair(-1)} aria-label="Vorige twee maanden"><ChevronLeft size={20} /></button>
            <span>Swipe voor volgende maanden</span>
            <button type="button" onClick={() => changeCalendarPair(1)} aria-label="Volgende twee maanden"><ChevronRight size={20} /></button>
          </div>
          {renderCalendarMonth(calendarStartYear, calendarStartMonth)}
          {(() => {
            const next = addMonths(calendarStartYear, calendarStartMonth, 1);
            return renderCalendarMonth(next.year, next.monthIndex);
          })()}
        </section>
      ) : (
      <section className="agenda-list agenda-list-redesign">
        {selectedEvents.map((event) => {
          const isFeatured = event.featured === true;
          const backgroundPreset = resolveAgendaBackgroundPreset(event);
          const backgroundImage = resolveActivityImagePath(event.imagePath)
            || (backgroundPreset ? agendaBackgroundPresets[backgroundPreset] : null);

          return (
          <Link
            href={`/agenda/activiteit?slug=${encodeURIComponent(event.slug)}`}
            className="agenda-card-link"
            key={event.slug}
            aria-label={`Bekijk ${event.title}`}
          >
            <article
              className={`${isFeatured ? agendaCardStyle.featured : agendaCardStyle.standard}${backgroundImage ? " agenda-card-with-preset" : ""}${backgroundImage && loadedCardImages.has(event.slug) ? " is-image-ready" : ""}`}
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

                {isFeatured && (
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

              {!isFeatured && <ChevronRight className="agenda-card-chevron" size={22} />}
            </article>
          </Link>
          );
        })}

        {selectedEvents.length === 0 && (
          <div className="agenda-empty-month">
            <CalendarDays size={30} />
            <strong>
              {showAllFuture
                ? activeFilter === "Alles"
                  ? "Geen toekomstige activiteiten"
                  : `Geen toekomstige ${activeFilter.toLowerCase()}`
                : activeFilter === "Alles"
                  ? `Geen activiteiten in ${months[selectedMonth].name}`
                  : `Geen ${activeFilter.toLowerCase()} in ${months[selectedMonth].name}`}
            </strong>
            <span>
              {showAllFuture
                ? "Er staan momenteel geen activiteiten binnen deze selectie gepland."
                : activeFilter === "Alles"
                  ? "Gebruik de pijlen om naar een andere maand te gaan."
                  : "Kies een ander filter of blader naar een andere maand."}
            </span>
          </div>
        )}
      </section>
      )}

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
