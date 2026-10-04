"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import { getUserProfile } from "../lib/services/users";
import { getActiveMembership } from "../lib/services/memberships";
import { listActivities } from "../lib/services/activities";
import {
  listPublishedAnnouncements,
  type AnnouncementData,
} from "../lib/services/announcements";
import type { AgendaEvent } from "../data/agenda-events";
import type { FermiUser, Membership } from "../lib/models/backend";
import MemberQrCode from "../components/MemberQrCode";
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

const monthOrder = ["JAN","FEB","MAR","APR","MEI","JUN","JUL","AUG","SEP","OKT","NOV","DEC"];

function eventStart(event: AgendaEvent) {
  const monthIndex = monthOrder.indexOf(event.month);
  if (monthIndex < 0) return Number.POSITIVE_INFINITY;

  const firstTime = event.time.match(/(\d{1,2}):(\d{2})/);
  const hour = firstTime ? Number(firstTime[1]) : 0;
  const minute = firstTime ? Number(firstTime[2]) : 0;

  return new Date(Number(event.year), monthIndex, Number(event.day), hour, minute).getTime();
}

function resolveHomeActivityImage(event: AgendaEvent) {
  let path = event.detailImagePath
    || event.imagePath
    || (event.backgroundPreset ? `/images/agenda/activities/container-images/${event.backgroundPreset}.png` : "");

  if (!path) return null;

  if (path.startsWith("/images/agenda/activities/") && !path.includes("/container-images/") && !path.includes("/detail-images/")) {
    path = path.replace(
      "/images/agenda/activities/",
      "/images/agenda/activities/container-images/",
    );
  }

  if (path.startsWith("/images/")) {
    return `/Fermi-PWA${path}`;
  }

  return path;
}

function resolveHomeFeaturedImage(event: AgendaEvent) {
  const source = event.imagePath
    || (event.backgroundPreset ? `/images/agenda/activities/container-images/${event.backgroundPreset}.png` : "");

  const fileName = source.split("/").pop();
  if (!fileName) return resolveHomeActivityImage(event);

  return `/Fermi-PWA/images/home/featured/${fileName}`;
}

function eventEnd(event: AgendaEvent) {
  const monthIndex = monthOrder.indexOf(event.month);
  if (monthIndex < 0) return Number.NEGATIVE_INFINITY;

  const times = [...event.time.matchAll(/(\d{1,2}):(\d{2})/g)];
  const last = times.at(-1);
  const hour = last ? Number(last[1]) : 23;
  const minute = last ? Number(last[2]) : 59;

  return new Date(Number(event.year), monthIndex, Number(event.day), hour, minute, 59, 999).getTime();
}

export default function HomePage() {
  const [memberPassOpen, setMemberPassOpen] = useState(false);
  const [fermiUser, setFermiUser] = useState<FermiUser | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementData | null>(null);
  const [activities, setActivities] = useState<AgendaEvent[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);

  const overlayOpen = memberPassOpen || notificationsOpen || announcementsOpen || Boolean(activeAnnouncement);

  const upcomingActivities = useMemo(() => {
    const now = Date.now();

    return activities
      .filter((event) => event.showInAgenda !== false && eventEnd(event) >= now)
      .sort((a, b) => eventStart(a) - eventStart(b));
  }, [activities]);

  const featuredActivity = upcomingActivities[0] ?? null;
  const homeUpcomingActivities = upcomingActivities.slice(featuredActivity ? 1 : 0, featuredActivity ? 4 : 3);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFermiUser(null);
        setMembership(null);
        setActivities([]);
        setAnnouncements([]);
        return;
      }

      const [profileResult, membershipResult, activitiesResult, announcementsResult] = await Promise.allSettled([
        getUserProfile(user.uid),
        getActiveMembership(user.uid),
        listActivities(),
        listPublishedAnnouncements(),
      ]);

      if (profileResult.status === "fulfilled") {
        setFermiUser(profileResult.value);
      } else {
        console.error("Profile data could not be loaded", profileResult.reason);
      }

      if (membershipResult.status === "fulfilled") {
        setMembership(membershipResult.value);
      } else {
        console.error("Member pass data could not be loaded", membershipResult.reason);
      }

      if (activitiesResult.status === "fulfilled") {
        setActivities(activitiesResult.value);
      } else {
        console.error("Upcoming activities could not be loaded", activitiesResult.reason);
      }

      if (announcementsResult.status === "fulfilled") {
        setAnnouncements(announcementsResult.value);
      } else {
        console.error("Announcements could not be loaded", announcementsResult.reason);
      }
    });
  }, []);

  const memberName = [fermiUser?.profile.firstName, fermiUser?.profile.lastName].filter(Boolean).join(" ");
  const memberRole = fermiUser?.role === "admin" ? "Admin" : fermiUser?.role === "board" ? "Bestuur" : fermiUser?.role === "committee" ? "Commissie" : "Lid";
  const memberNumber = membership?.memberNumber?.trim() || (membership?.digitalCard?.cardId ? `FERMI-${membership.digitalCard.cardId.slice(0, 6).toUpperCase()}` : "Nog niet toegewezen");
  const memberValidUntil = membership?.endDate || membership?.academicYear || "Nog niet bekend";

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
        {featuredActivity ? (
          <article className="featured-event">
            <div className="featured-copy">
              <span className="eyebrow">Volgende activiteit</span>
              <h2>{featuredActivity.title}</h2>

              <div className="event-meta">
                <span><CalendarDays size={18} /> {featuredActivity.dateLabel}</span>
                <span><Clock3 size={18} /> {featuredActivity.time}</span>
                <span><MapPin size={18} /> {featuredActivity.location}</span>
              </div>

              <Link
                className="primary-button interactive-control"
                href={`/agenda/activiteit?slug=${encodeURIComponent(featuredActivity.slug)}`}
              >
                Bekijk activiteit <ChevronRight size={22} />
              </Link>
            </div>

            <div
              className={`featured-art home-featured-art${resolveHomeFeaturedImage(featuredActivity) ? " home-featured-art-live" : ""}`}
              style={resolveHomeFeaturedImage(featuredActivity) ? {
                backgroundImage: `url("${resolveHomeFeaturedImage(featuredActivity)}")`,
                backgroundPosition: "right center",
              } : undefined}
              aria-hidden="true"
            />
          </article>
        ) : (
          <article className="featured-event home-featured-empty">
            <div className="featured-copy">
              <span className="eyebrow">Volgende activiteit</span>
              <h2>Nog niets gepland</h2>
              <div className="event-meta">
                <span><CalendarDays size={18} /> Nieuwe activiteiten verschijnen hier automatisch.</span>
              </div>
              <Link className="primary-button interactive-control" href="/agenda">
                Bekijk agenda <ChevronRight size={22} />
              </Link>
            </div>
          </article>
        )}

        <section className="section-block">
          <div className="section-heading">
            <h2>Binnenkort</h2>
            <Link className="text-link" href="/agenda">Bekijk agenda <ChevronRight size={17} /></Link>
          </div>

          <div className="event-strip">
            {homeUpcomingActivities.map((event) => {
              const artwork = resolveHomeActivityImage(event);

              return (
              <Link className="mini-event mini-event-link interactive-card" href={`/agenda/activiteit?slug=${encodeURIComponent(event.slug)}`} key={event.slug}>
                <div
                  className={`mini-art placeholder-art ${event.art}${artwork ? " mini-art-activity-image" : ""}`}
                  style={artwork ? {
                    backgroundImage: `linear-gradient(rgba(3,29,44,.06),rgba(3,29,44,.24)),url("${artwork}")`,
                  } : undefined}
                >
                  <div className="date-chip">
                    <strong>{event.day}</strong>
                    <span>{event.month}</span>
                  </div>
                  {!artwork && (
                    <span className="mini-art-label">
                      {event.art === "beer" ? "● ● ●" : event.art === "legal" ? "§" : event.art === "quantum" ? "ψ" : "✦"}
                    </span>
                  )}
                </div>
                <div className="mini-event-body">
                  <h3>{event.title}</h3>
                  <p><Clock3 size={15} /> {event.time}</p>
                  <p><MapPin size={15} /> {event.location}</p>
                </div>
              </Link>
              );
            })}

            {homeUpcomingActivities.length === 0 && !featuredActivity && (
              <div className="home-upcoming-empty">
                <CalendarDays size={24} />
                <span>Er staan nog geen komende activiteiten in de agenda.</span>
              </div>
            )}
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
                  {item.icon === "shop"
                    ? <ShoppingBag size={22} />
                    : item.icon === "calendar"
                      ? <CalendarDays size={22} />
                      : <Megaphone size={22} />}
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
            {announcements[0] && (
              <button
                className="home-notification interactive-card"
                type="button"
                onClick={() => {
                  setNotificationsOpen(false);
                  setActiveAnnouncement(announcements[0]);
                }}
              >
                <span className="announcement-icon"><Megaphone size={20} /></span>
                <span>
                  <strong>{announcements[0].title}</strong>
                  <small>{announcements[0].summary}</small>
                </span>
                <ChevronRight size={18} />
              </button>
            )}
            <Link className="home-notification interactive-card" href="/agenda" onClick={() => setNotificationsOpen(false)}>
              <span className="announcement-icon"><CalendarDays size={20} /></span>
              <span>
                <strong>Agenda bekijken</strong>
                <small>Bekijk alle komende activiteiten.</small>
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
                    {item.icon === "shop"
                      ? <ShoppingBag size={20} />
                      : item.icon === "calendar"
                        ? <CalendarDays size={20} />
                        : <Megaphone size={20} />}
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
            <Link className="primary-button home-sheet-cta" href={activeAnnouncement.actionRoute} onClick={() => setActiveAnnouncement(null)}>
              {activeAnnouncement.actionLabel} <ChevronRight size={19} />
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
                <strong className="member-pass-live-name">{memberName || fermiUser?.profile.email || "S.V. Fermi-lid"}</strong>
                <span className="member-pass-live-number">{memberNumber}</span>
                <span className="member-pass-live-valid">{memberValidUntil}</span>
              </div>
              <div className="member-pass-live-qr">
                <MemberQrCode
                  cardId={membership?.digitalCard?.cardId}
                  enabled={Boolean(membership?.digitalCard?.enabled)}
                  size={142}
                />
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
