"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarDays,
  CalendarRange,
  Coins,
  Home,
  MapPin,
  Plane,
  Share2,
  UserRound,
  UsersRound,
  Wine,
} from "lucide-react";
import EventActions from "@/components/events/EventActions";
import type { AgendaEvent } from "@/data/agenda-events";
import { getActivity } from "@/lib/services/activities";

function resolveEventImagePath(path: string | undefined) {
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

function FermiMark() {
  return (
    <img
      className="fermi-logo-image event-fermi-mark"
      src="/Fermi-PWA/images/branding/fermi-logo.png"
      alt="SV Fermi"
    />
  );
}

export default function EventDetailClient({ slug }: { slug: string }) {
  const [event, setEvent] = useState<AgendaEvent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);

    getActivity(slug)
      .then((activity) => {
        if (active) setEvent(activity);
      })
      .catch((error) => {
        console.error("Activiteit laden uit Firebase mislukt", error);
        if (active) setEvent(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <main className="app-shell event-detail-shell">
        <div className="event-detail-loading">Activiteit laden…</div>
      </main>
    );
  }

  if (!event) {
    return (
      <main className="app-shell event-detail-shell">
        <div className="event-detail-loading">
          <strong>Activiteit niet gevonden</strong>
          <Link href="/agenda">Terug naar agenda</Link>
        </div>
      </main>
    );
  }

  const travel = event.detailVariant === "travel" ? event.travel : undefined;
  const detailHeroImage = resolveEventImagePath(event.detailImagePath)
    || resolveEventImagePath(event.imagePath);

  if (travel) {
    return (
      <main className="app-shell travel-detail-shell">
        <div className="noise" aria-hidden="true" />

        <header className="travel-topbar">
          <Link className="event-back-button" href="/agenda" aria-label="Terug naar agenda">
            <ArrowLeft size={22} />
          </Link>
          <div className="travel-brand"><FermiMark /><strong>SV Fermi</strong></div>
          <button className="event-back-button" aria-label="Deel activiteit"><Share2 size={21} /></button>
        </header>

        <section className="travel-collage-hero">
          <div className="travel-paper-title">
            <span>{event.type}</span>
            <strong>{event.title}</strong>
          </div>
          <div className="travel-hero-photo travel-photo-city" />
          <div className="travel-polaroid"><div className="travel-polaroid-photo" /></div>
          <div className="travel-stamp"><b>{travel.destination}</b><span>✦</span></div>
          <Plane className="travel-plane" size={45} />
          <span className="travel-route-dash" />
          <span className="travel-orange-scribble" />
        </section>

        <section className="travel-content">
          <div className="travel-primary-facts">
            <div><span className="travel-icon-bubble"><CalendarRange size={24} /></span><span><strong>{travel.dateRange}</strong><small>Datum</small></span></div>
            <div><span className="travel-icon-bubble"><MapPin size={26} /></span><span><strong>{travel.destination}</strong><small>Locatie</small></span></div>
          </div>

          <p className="travel-intro">{event.description}</p>

          <div className="travel-info-grid">
            <article><span className="travel-icon-bubble"><Plane size={24} /></span><div><h3>Vervoer</h3><p>{travel.transport}</p></div></article>
            <article><span className="travel-icon-bubble"><BedDouble size={24} /></span><div><h3>Verblijf</h3><p>{travel.stay}</p></div></article>
            <article><span className="travel-icon-bubble"><Coins size={24} /></span><div><h3>Prijsindicatie</h3><p>{travel.priceIndication}</p></div></article>
            <article><span className="travel-icon-bubble"><CalendarDays size={24} /></span><div><h3>Inschrijfdeadline</h3><p>{travel.signupDeadline}</p></div></article>
          </div>

          <EventActions eventId={event.slug} initialRegistered={event.registered} capacity={event.capacity} shareTitle={event.title} />

          <section className="travel-expectations">
            <h2>Wat kun je verwachten?<span aria-hidden="true">✦</span></h2>
            <div>
              {travel.expectations[0] && <p><span className="travel-icon-bubble small"><Building2 size={18} /></span>{travel.expectations[0]}</p>}
              {travel.expectations[1] && <p><span className="travel-icon-bubble small"><UsersRound size={18} /></span>{travel.expectations[1]}</p>}
              {travel.expectations[2] && <p><span className="travel-icon-bubble small"><Wine size={18} /></span>{travel.expectations[2]}</p>}
            </div>
          </section>
        </section>

        <BottomNav />
      </main>
    );
  }

  return (
    <main className="app-shell event-detail-shell">
      <div className="noise" aria-hidden="true" />

      <header className="event-detail-topbar">
        <Link className="event-back-button" href="/agenda" aria-label="Terug naar agenda"><ArrowLeft size={22} /></Link>
        <span>Activiteit</span>
        <span className="event-detail-top-spacer" />
      </header>

      <section
        className={`event-detail-hero agenda-photo-${event.art}${detailHeroImage ? " event-detail-hero-custom-image" : ""}`}
      >
        {detailHeroImage ? (
          <img
            className="event-detail-hero-image"
            src={detailHeroImage}
            alt=""
            aria-hidden="true"
          />
        ) : null}
        <div className="event-detail-hero-overlay" />
        <div className="event-detail-date"><strong>{event.day}</strong><span>{event.month}</span></div>
        <div className="event-detail-hero-copy">
          <span className="agenda-type">{event.type}</span>
          <h1
            className={`event-detail-title${event.title.length > 28 ? " is-very-long" : event.title.length > 17 ? " is-long" : ""}`}
          >
            {event.title}
          </h1>
          <p>{event.organizer}</p>
        </div>
      </section>

      <section className="event-detail-content">
        <div className="event-facts-card">
          <div><CalendarDays size={20} /><span><small>Datum</small><strong>{event.dateLabel}</strong></span></div>
          <div><MapPin size={20} /><span><small>Locatie</small><strong>{event.location}</strong></span></div>
        </div>

        <EventActions eventId={event.slug} initialRegistered={event.registered} capacity={event.capacity} shareTitle={event.title} />

        <section className="event-detail-section">
          <span className="event-detail-kicker">OVER DE ACTIVITEIT</span>
          <h2>{event.title}</h2>
          <p>{event.description}</p>
        </section>
      </section>

      <BottomNav />
    </main>
  );
}

function BottomNav() {
  return (
    <nav className="bottom-nav" aria-label="Hoofdnavigatie">
      <Link className="nav-item" href="/"><Home size={23} /><span>Home</span></Link>
      <Link className="nav-item active" href="/agenda"><CalendarDays size={23} /><span>Agenda</span><i /></Link>
      <Link className="nav-item center-item" href="/fermi">
        <span className="nav-fermi"><img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="" /></span>
        <span>Fermi</span>
      </Link>
      <Link className="nav-item" href="/community"><UsersRound size={25} /><span>Community</span></Link>
      <Link className="nav-item" href="/profiel"><UserRound size={24} /><span>Profiel</span></Link>
    </nav>
  );
}
