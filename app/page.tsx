"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile } from "../lib/services/users";
import { getActiveMembership } from "../lib/services/memberships";
import type { FermiUser, Membership } from "../lib/models/backend";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Clock3,
  Home,
  IdCard,
  MapPin,
  Megaphone,
  ShoppingBag,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

const upcoming = [
  {
    day: "18",
    month: "NOV",
    title: "Open Spreekuur",
    time: "15:30 – 17:30",
    location: "JMH 04D04",
    art: "legal",
    href: "/agenda/open-spreekuur",
  },
  {
    day: "21",
    month: "NOV",
    title: "Beer Pong Toernooi",
    time: "19:00 – 23:00",
    location: "De Fysica Kantine",
    art: "beer",
    href: "/agenda",
  },
  {
    day: "26",
    month: "NOV",
    title: "Lezing: Quantum Computers",
    time: "15:30 – 17:00",
    location: "K2.01",
    art: "quantum",
    href: "/agenda/quantum-computers",
  },
];

const announcements = [
  {
    id: "studytrip",
    icon: "megaphone" as const,
    title: "Inschrijvingen Studiereis geopend!",
    summary: "De inschrijvingen voor de studiereis zijn nu open. Vergeet je niet in te schrijven!",
    detail: "Bekijk alle informatie over de studiereis, praktische details en de inschrijving op de activiteitenpagina.",
    href: "/agenda/studiereis-budapest-25",
    cta: "Bekijk studiereis",
  },
  {
    id: "merch",
    icon: "shop" as const,
    title: "Nieuw: Fermi Merchandise",
    summary: "De nieuwe collectie is nu beschikbaar in de webshop. Scoor jouw hoodie!",
    detail: "De merchandise-sectie wordt binnenkort uitgebreid. Houd de app in de gaten voor de volledige collectie.",
    href: "/fermi",
    cta: "Ga naar Fermi",
  },
];

export default function HomePage() {
  const [memberPassOpen, setMemberPassOpen] = useState(false);
  const [fermiUser, setFermiUser] = useState<FermiUser | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<(typeof announcements)[number] | null>(null);

  const overlayOpen = memberPassOpen || notificationsOpen || announcementsOpen || Boolean(activeAnnouncement);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFermiUser(null);
        setMembership(null);
        return;
      }
      try {
        const [profile, activeMembership] = await Promise.all([
          getUserProfile(user.uid),
          getActiveMembership(user.uid),
        ]);
        setFermiUser(profile);
        setMembership(activeMembership);
      } catch (error) {
        console.error("Member pass data could not be loaded", error);
      }
    });
  }, []);

  const memberName = [fermiUser?.profile.firstName, fermiUser?.profile.lastName].filter(Boolean).join(" ");
  const memberRole = fermiUser?.role === "admin" ? "Admin" : fermiUser?.role === "board" ? "Bestuur" : fermiUser?.role === "committee" ? "Commissie" : "Lid";

  useEffect(() => {
    if (!overlayOpen) return;

    const closeOverlays = () => {
      setMemberPassOpen(false);
      setNotificationsOpen(false);
      setAnnouncementsOpen(false);
      setActiveAnnouncement(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeOverlays();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.classList.add("member-pass-modal-open");

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.classList.remove("member-pass-modal-open");
    };
  }, [overlayOpen]);

  return (
    <main className="app-shell">
      <div className="noise" aria-hidden="true" />

      <section className="top-hero">
        <header className="topbar">
          <div className="brand">
            <img
              className="fermi-logo-image"
              src="/Fermi-PWA/images/branding/fermi-logo.png"
              alt="SV Fermi"
            />
            <span>SV Fermi</span>
          </div>

          <button
            className="icon-button notification-button interactive-control"
            type="button"
            aria-label="Meldingen"
            aria-haspopup="dialog"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell size={22} strokeWidth={2.1} />
            <span className="notification-dot" />
          </button>
        </header>

        <div className="welcome-row">
          <div>
            <h1>
              Hoi <span>{fermiUser?.profile.firstName || "Fermi-lid"}</span>
            </h1>
            <p>Klaar voor de volgende activiteit?</p>
          </div>

          <div className="hero-collage-placeholder home-hero-art" aria-hidden="true">
            <img
              className="home-hero-church"
              src="/Fermi-PWA/images/home/home-hero-church.png"
              alt=""
            />
            <img
              className="home-hero-atom"
              src="/Fermi-PWA/images/home/home-member-pass-atom.png"
              alt=""
            />
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

            <Link className="primary-button interactive-control" href="/agenda/maandborrel">
              Bekijk activiteit <ChevronRight size={22} />
            </Link>
          </div>

          <div className="featured-art home-featured-art" aria-hidden="true">
            <img
              src="/Fermi-PWA/images/home/home-featured-borrel.png"
              alt=""
            />
          </div>
        </article>

        <section className="section-block">
          <div className="section-heading">
            <h2>Binnenkort</h2>
            <Link className="text-link" href="/agenda">Bekijk agenda <ChevronRight size={17} /></Link>
          </div>

          <div className="event-strip">
            {upcoming.map((event) => (
              <Link className="mini-event mini-event-link interactive-card" href={event.href} key={event.day}>
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
              </Link>
            ))}
          </div>
        </section>

        <section className="section-block">
          <div className="section-heading">
            <h2>Mededelingen</h2>
            <button
              className="text-link interactive-control"
              type="button"
              onClick={() => setAnnouncementsOpen(true)}
            >
              Bekijk alle mededelingen <ChevronRight size={17} />
            </button>
          </div>

          <div className="announcements">
            {announcements.map((item) => (
              <button
                className="announcement-card interactive-card"
                type="button"
                key={item.id}
                onClick={() => setActiveAnnouncement(item)}
              >
                <span className="announcement-icon">
                  {item.icon === "megaphone" ? <Megaphone size={22} /> : <ShoppingBag size={22} />}
                </span>
                <span className="announcement-copy">
                  <strong>{item.title}</strong>
                  <small>{item.summary}</small>
                </span>
                <ChevronRight className="announcement-chevron" size={21} />
              </button>
            ))}
          </div>
        </section>

        <button
          className="member-pass-preview interactive-card"
          type="button"
          onClick={() => setMemberPassOpen(true)}
          aria-haspopup="dialog"
        >
          <span className="pass-icon"><IdCard size={30} /></span>
          <span className="pass-copy">
            <strong>Digitale ledenpas</strong>
            <small>Toon je ledenpas bij activiteiten en ontvang kortingen</small>
          </span>
          <ChevronRight size={20} />
        </button>
      </section>

      {notificationsOpen && (
        <div className="home-overlay" role="dialog" aria-modal="true" aria-label="Meldingen" onClick={() => setNotificationsOpen(false)}>
          <section className="home-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="home-sheet-header">
              <div>
                <small>SV Fermi</small>
                <h2>Meldingen</h2>
              </div>
              <button className="home-sheet-close" type="button" aria-label="Sluit meldingen" onClick={() => setNotificationsOpen(false)}>
                <X size={21} />
              </button>
            </div>
            <Link className="home-notification interactive-card" href="/agenda/studiereis-budapest-25" onClick={() => setNotificationsOpen(false)}>
              <span className="announcement-icon"><Megaphone size={20} /></span>
              <span>
                <strong>Studiereis-inschrijving geopend</strong>
                <small>Bekijk de reisdetails en inschrijving.</small>
              </span>
              <ChevronRight size={18} />
            </Link>
            <Link className="home-notification interactive-card" href="/agenda" onClick={() => setNotificationsOpen(false)}>
              <span className="announcement-icon"><CalendarDays size={20} /></span>
              <span>
                <strong>Nieuwe activiteiten</strong>
                <small>Er staan nieuwe activiteiten in de agenda.</small>
              </span>
              <ChevronRight size={18} />
            </Link>
          </section>
        </div>
      )}

      {announcementsOpen && (
        <div className="home-overlay" role="dialog" aria-modal="true" aria-label="Alle mededelingen" onClick={() => setAnnouncementsOpen(false)}>
          <section className="home-sheet" onClick={(event) => event.stopPropagation()}>
            <div className="home-sheet-header">
              <div>
                <small>Actueel</small>
                <h2>Mededelingen</h2>
              </div>
              <button className="home-sheet-close" type="button" aria-label="Sluit mededelingen" onClick={() => setAnnouncementsOpen(false)}>
                <X size={21} />
              </button>
            </div>
            <div className="home-sheet-list">
              {announcements.map((item) => (
                <button
                  className="home-notification interactive-card"
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setAnnouncementsOpen(false);
                    setActiveAnnouncement(item);
                  }}
                >
                  <span className="announcement-icon">
                    {item.icon === "megaphone" ? <Megaphone size={20} /> : <ShoppingBag size={20} />}
                  </span>
                  <span>
                    <strong>{item.title}</strong>
                    <small>{item.summary}</small>
                  </span>
                  <ChevronRight size={18} />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {activeAnnouncement && (
        <div className="home-overlay" role="dialog" aria-modal="true" aria-label={activeAnnouncement.title} onClick={() => setActiveAnnouncement(null)}>
          <section className="home-sheet home-announcement-detail" onClick={(event) => event.stopPropagation()}>
            <div className="home-sheet-header">
              <div>
                <small>Mededeling</small>
                <h2>{activeAnnouncement.title}</h2>
              </div>
              <button className="home-sheet-close" type="button" aria-label="Sluit mededeling" onClick={() => setActiveAnnouncement(null)}>
                <X size={21} />
              </button>
            </div>
            <p>{activeAnnouncement.detail}</p>
            <Link className="primary-button home-sheet-cta" href={activeAnnouncement.href} onClick={() => setActiveAnnouncement(null)}>
              {activeAnnouncement.cta} <ChevronRight size={19} />
            </Link>
          </section>
        </div>
      )}

      {memberPassOpen && (
        <div
          className="member-pass-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Digitale ledenpas"
          onClick={() => setMemberPassOpen(false)}
        >
          <div
            className="member-pass-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="member-pass-modal-close"
              type="button"
              aria-label="Sluit digitale ledenpas"
              onClick={() => setMemberPassOpen(false)}
            >
              <X size={22} />
            </button>

            <div className="member-pass-live">
              <img
                className="member-pass-modal-image"
                src="/Fermi-PWA/images/home/member-pass-popup.png"
                alt="Digitale ledenpas van SV Fermi"
              />
              <div className="member-pass-live-data">
                <strong>{memberName || fermiUser?.profile.email || "S.V. Fermi-lid"}</strong>
                <span>{memberRole}</span>
                <span>{membership?.memberNumber ? `Lidnr. ${membership.memberNumber}` : "Lidnummer nog niet toegewezen"}</span>
                <span>{membership?.academicYear ?? "Geen actief lidmaatschap"}</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
            <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="" />
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
