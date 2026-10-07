"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { AnnouncementData } from "../lib/services/announcements";
import type { AgendaEvent } from "../data/agenda-events";
import { subscribePendingApprovals, type AdminPendingApproval } from "../lib/services/memberAdmin";
import MemberQrCode from "../components/MemberQrCode";
import { useFermiSession } from "../components/SessionProvider";
import { useAppData } from "../components/AppDataProvider";
import {
  Bell,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Home,
  IdCard,
  MapPin,
  Megaphone,
  ShieldCheck,
  ShoppingBag,
  LockKeyhole,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

const monthOrder = ["JAN","FEB","MAR","APR","MEI","JUN","JUL","AUG","SEP","OKT","NOV","DEC"];

function formatHomeActivityDate(event: AgendaEvent) {
  const monthIndex = monthOrder.indexOf(event.month);
  if (monthIndex < 0) return event.dateLabel;
  const date = new Date(Number(event.year), monthIndex, Number(event.day), 12);
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatHomeActivityEndDate(endDate: string | undefined) {
  if (!endDate) return null;
  const date = new Date(`${endDate}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

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
  if (event.featuredImagePath) {
    return event.featuredImagePath.startsWith("/images/")
      ? `/Fermi-PWA${event.featuredImagePath}`
      : event.featuredImagePath;
  }

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
  const [memberPassClosing, setMemberPassClosing] = useState(false);
  const [memberPassImageReady, setMemberPassImageReady] = useState(false);
  const [memberPassReady, setMemberPassReady] = useState(false);
  const [homeVisualReady, setHomeVisualReady] = useState(false);
  const [loadedActivityImages, setLoadedActivityImages] = useState<Set<string>>(() => new Set());
  const { fermiUser, membership, membershipJustApproved } = useFermiSession();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [activeAnnouncement, setActiveAnnouncement] = useState<AnnouncementData | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<AdminPendingApproval[]>([]);
  const {
    activities,
    announcements,
    activitiesLoading,
    announcementsLoading,
  } = useAppData();

  useEffect(() => {
    if (fermiUser?.role !== "admin" || fermiUser.status !== "active") {
      setPendingApprovals([]);
      return;
    }
    return subscribePendingApprovals(
      setPendingApprovals,
      (error) => console.error("Pending lidmeldingen laden mislukt", error),
    );
  }, [fermiUser?.role, fermiUser?.status]);

  const formatApprovalTime = (value: unknown) => {
    const date =
      value && typeof (value as { toDate?: () => Date }).toDate === "function"
        ? (value as { toDate: () => Date }).toDate()
        : null;
    if (!date) return "zojuist";
    return new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
  };

  const openPendingMember = (uid: string) => {
    window.location.href = `/Fermi-PWA/profiel/leden-admin/?member=${encodeURIComponent(uid)}`;
  };

  const overlayOpen = memberPassOpen || memberPassClosing || notificationsOpen || announcementsOpen || Boolean(activeAnnouncement);

  const openMemberPass = () => {
    if (isMembershipPending || memberPassOpen || memberPassClosing) return;

    // Always start a fresh animation cycle, even when the pass image is already cached.
    setMemberPassClosing(false);
    setMemberPassImageReady(false);
    setMemberPassReady(false);
    setMemberPassOpen(true);
  };

  const closeMemberPass = () => {
    if (!memberPassOpen || memberPassClosing) return;
    setMemberPassClosing(true);
    window.setTimeout(() => {
      setMemberPassOpen(false);
      setMemberPassClosing(false);
      setMemberPassImageReady(false);
      setMemberPassReady(false);
    }, 520);
  };

  useEffect(() => {
    if (!memberPassOpen || memberPassClosing) return;

    // Cached images may not produce a useful loading phase on later opens.
    // Check the mounted image as well so every opening gets a fresh reveal cycle.
    const image = document.querySelector<HTMLImageElement>(".member-pass-modal-image");
    if (image?.complete && image.naturalWidth > 0 && !memberPassImageReady) {
      setMemberPassImageReady(true);
      return;
    }

    if (!memberPassImageReady) return;

    // Keep the pass hidden for a short paint window so QR/data are ready,
    // then trigger the slide animation from its off-screen start state.
    const timer = window.setTimeout(() => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => setMemberPassReady(true));
      });
    }, 260);

    return () => window.clearTimeout(timer);
  }, [memberPassOpen, memberPassClosing, memberPassImageReady]);

  const upcomingActivities = useMemo(() => {
    const now = Date.now();

    return activities
      .filter((event) => event.showInAgenda !== false && eventEnd(event) >= now)
      .sort((a, b) => eventStart(a) - eventStart(b));
  }, [activities]);

  const featuredActivity = upcomingActivities.find((event) => event.featured === true) ?? null;
  const homeUpcomingActivities = upcomingActivities
    .filter((event) => event.slug !== featuredActivity?.slug)
    .slice(0, 3);

  useEffect(() => {
    if (activitiesLoading) {
      setHomeVisualReady(false);
      return;
    }

    const criticalSources = [
      "/Fermi-PWA/images/home/home-hero-church.png",
      "/Fermi-PWA/images/home/home-member-pass-atom.png",
      featuredActivity ? resolveHomeFeaturedImage(featuredActivity) : null,
    ].filter(Boolean) as string[];

    if (criticalSources.length === 0) {
      setHomeVisualReady(true);
      return;
    }

    let active = true;
    Promise.all(
      criticalSources.map((src) => new Promise<void>((resolve) => {
        const image = new Image();
        image.onload = () => resolve();
        image.onerror = () => resolve();
        image.src = src;
        if (image.complete) resolve();
      })),
    ).then(() => {
      if (!active) return;
      window.requestAnimationFrame(() => setHomeVisualReady(true));
    });

    return () => {
      active = false;
    };
  }, [activitiesLoading, featuredActivity]);

  useEffect(() => {
    if (!homeUpcomingActivities.length) return;
    let active = true;

    homeUpcomingActivities.forEach((event) => {
      const src = resolveHomeActivityImage(event);
      if (!src) return;
      const image = new Image();
      const markReady = () => {
        if (!active) return;
        setLoadedActivityImages((current) => {
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
  }, [homeUpcomingActivities]);

  useEffect(() => {
    if (!homeVisualReady) return;
    const preloadAgendaHero = () => {
      const image = new Image();
      image.src = "/Fermi-PWA/images/agenda/agenda-hero-illustration.png";
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(preloadAgendaHero, { timeout: 1400 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timer = window.setTimeout(preloadAgendaHero, 500);
    return () => window.clearTimeout(timer);
  }, [homeVisualReady]);

  const membershipStatus = fermiUser?.membership?.status ?? membership?.status;
  const isMembershipPending = membershipStatus === "pending" || fermiUser?.status === "pending";
  const memberName = [fermiUser?.profile.firstName, fermiUser?.profile.lastName].filter(Boolean).join(" ");
  const memberRole = fermiUser?.role === "admin" ? "Admin" : fermiUser?.role === "board" ? "Bestuur" : fermiUser?.role === "committee" ? "Commissie" : "Lid";
  const memberNumber = membership?.memberNumber?.trim() || (membership?.digitalCard?.cardId ? `FERMI-${membership.digitalCard.cardId.slice(0, 6).toUpperCase()}` : "Nog niet toegewezen");
  const memberValidUntil = membership?.endDate || membership?.academicYear || "Nog niet bekend";

  useEffect(() => {
    if (!overlayOpen) return;

    const closeOverlays = () => {
      if (memberPassOpen) closeMemberPass();
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
    <main className={`app-shell home-shell${homeVisualReady ? " home-visual-ready" : " home-visual-loading"}`}>
      {!homeVisualReady && (
        <div className="home-visual-loader" role="status" aria-live="polite">
          <img src="/Fermi-PWA/images/branding/atoom-loader.png" alt="" aria-hidden="true" />
          <span>Fermi laden…</span>
        </div>
      )}
      <div className="noise" aria-hidden="true" />

      <section className="top-hero">
        <header className="topbar">
          <div className="brand">
            <img
              className="fermi-logo-image"
              src="/Fermi-PWA/images/branding/fermi-logo.png"
              alt="SV Fermi"
              decoding="async"
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
              decoding="async"
              loading="eager"
              fetchPriority="high"
            />
            <img
              className="home-hero-atom"
              src="/Fermi-PWA/images/home/home-member-pass-atom.png"
              alt=""
              decoding="async"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        </div>
      </section>

      <section className="content">
        {membershipJustApproved && (
          <aside className="membership-approved-banner" role="status" aria-live="polite">
            <span className="membership-approved-icon"><CheckCircle2 size={19} /></span>
            <span>
              <strong>Je lidmaatschap is goedgekeurd</strong>
              <small>Je hebt nu toegang tot alle ledenfuncties van S.V. Fermi.</small>
            </span>
          </aside>
        )}
        {fermiUser?.role === "admin" && pendingApprovals.length > 0 && (
          <button className="admin-approval-banner" type="button" onClick={() => pendingApprovals.length === 1 ? openPendingMember(pendingApprovals[0].uid) : setNotificationsOpen(true)}>
            <span className="admin-approval-banner-icon"><ShieldCheck size={19} /></span>
            <span className="admin-approval-banner-copy">
              <strong>{pendingApprovals.length === 1 ? "Nieuw lid wacht op goedkeuring" : `${pendingApprovals.length} nieuwe leden wachten op goedkeuring`}</strong>
              <small>
                {[pendingApprovals[0].firstName, pendingApprovals[0].lastName].filter(Boolean).join(" ") || pendingApprovals[0].email}
                {" · "}{formatApprovalTime(pendingApprovals[0].requestedAt)}
                {pendingApprovals.length > 1 ? ` · +${pendingApprovals.length - 1}` : ""}
              </small>
            </span>
            <ChevronRight size={19} />
          </button>
        )}
        {isMembershipPending && (
          <aside className="pending-membership-banner" role="status">
            <span className="pending-membership-banner-icon"><LockKeyhole size={18} /></span>
            <span>
              <strong>Je aanmelding wordt gecontroleerd door S.V. Fermi</strong>
              <small>Kijk alvast rond in de app. Ledenfuncties worden beschikbaar zodra je aanmelding is goedgekeurd.</small>
            </span>
          </aside>
        )}
        {activitiesLoading ? (
          <div className="home-featured-skeleton" aria-label="Activiteit laden" aria-busy="true"><span /><span /><span /></div>
        ) : featuredActivity ? (
          <article className="featured-event home-featured-event">
            <div className="featured-copy">
              <span className="eyebrow">Volgende activiteit</span>
              <h2>{featuredActivity.title}</h2>

              <div className="event-meta">
                {featuredActivity.type.trim().toUpperCase() === "STUDIEREIS" && featuredActivity.endDate ? (
                  <>
                    <span><CalendarDays size={18} /> {formatHomeActivityDate(featuredActivity)}</span>
                    <span className="home-featured-end-date">t/m {formatHomeActivityEndDate(featuredActivity.endDate)}</span>
                  </>
                ) : (
                  <span><CalendarDays size={18} /> {featuredActivity.dateLabel}</span>
                )}
              </div>

              <Link
                className="primary-button interactive-control"
                href={`/agenda/activiteit?slug=${encodeURIComponent(featuredActivity.slug)}`}
              >
                Bekijk activiteit <ChevronRight size={22} />
              </Link>
            </div>

            <div
              className="featured-art home-featured-art"
              aria-hidden="true"
            >
              {(() => {
                const featuredImage = resolveHomeFeaturedImage(featuredActivity);
                return featuredImage ? <img className="home-featured-image is-ready" src={featuredImage} alt="" decoding="async" /> : null;
              })()}
            </div>
          </article>
) : null}

        <section className="section-block">
          <div className="section-heading">
            <h2>Binnenkort</h2>
            <Link className="text-link" href="/agenda">Bekijk agenda <ChevronRight size={17} /></Link>
          </div>

          <div className="event-strip">
            {activitiesLoading && (
              <>
                <div className="home-mini-skeleton" aria-hidden="true"><span /><span /></div>
                <div className="home-mini-skeleton" aria-hidden="true"><span /><span /></div>
                <div className="home-mini-skeleton" aria-hidden="true"><span /><span /></div>
              </>
            )}
            {!activitiesLoading && homeUpcomingActivities.map((event) => {
              const artwork = resolveHomeActivityImage(event);

              return (
              <Link className="mini-event mini-event-link interactive-card" href={`/agenda/activiteit?slug=${encodeURIComponent(event.slug)}`} key={event.slug}>
                <div
                  className={`mini-art placeholder-art ${event.art}${artwork ? " mini-art-activity-image" : ""}${artwork && loadedActivityImages.has(event.slug) ? " is-image-ready" : ""}`}
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

            {!activitiesLoading && homeUpcomingActivities.length === 0 && (
              <div className="home-upcoming-empty">
                <CalendarDays size={24} />
                <span>{featuredActivity ? "Er staan geen andere komende activiteiten gepland." : "Er staan nog geen komende activiteiten in de agenda."}</span>
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
            {announcementsLoading && (
              <>
                <div className="home-announcement-skeleton" aria-hidden="true"><span /><span /></div>
                <div className="home-announcement-skeleton" aria-hidden="true"><span /><span /></div>
              </>
            )}
            {!announcementsLoading && announcements.map((item) => (
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
          className={`member-pass-preview interactive-card${isMembershipPending ? " is-membership-locked" : ""}`}
          type="button"
          onClick={openMemberPass}
          aria-haspopup={isMembershipPending ? undefined : "dialog"}
          aria-disabled={isMembershipPending}
        >
          <span className="pass-icon"><IdCard size={30} /></span>
          <span className="pass-copy">
            <strong>Digitale ledenpas</strong>
            <small>{isMembershipPending ? "Beschikbaar zodra je lidmaatschap is goedgekeurd" : "Toon je ledenpas bij activiteiten en ontvang kortingen"}</small>
          </span>
          {isMembershipPending ? <LockKeyhole size={20} /> : <ChevronRight size={20} />}
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
            {pendingApprovals.length > 0 && (
              <div className="admin-notification-list">
                {pendingApprovals.map((item) => (
                  <button
                    className="home-notification admin-home-notification interactive-card"
                    type="button"
                    key={item.uid}
                    onClick={() => openPendingMember(item.uid)}
                  >
                    <span className="announcement-icon"><ShieldCheck size={20} /></span>
                    <span>
                      <strong>Nieuw lid wacht op goedkeuring</strong>
                      <small>{[item.firstName, item.lastName].filter(Boolean).join(" ") || item.email} · {formatApprovalTime(item.requestedAt)}</small>
                    </span>
                    <ChevronRight size={18} />
                  </button>
                ))}
              </div>
            )}
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

      {(memberPassOpen || memberPassClosing) && (
        <div
          className={`member-pass-modal${memberPassReady ? " is-ready" : " is-loading"}${memberPassClosing ? " is-closing" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-label="Digitale ledenpas"
          onClick={closeMemberPass}
        >
          {!memberPassReady && !memberPassClosing && (
            <div className="member-pass-loading" role="status" aria-live="polite">
              <img className="member-pass-loading-atom" src="/Fermi-PWA/images/branding/atoom-loader.png" alt="" aria-hidden="true" />
              <span>Ledenpas laden…</span>
            </div>
          )}

          <div
            className="member-pass-modal-card"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="member-pass-modal-close"
              type="button"
              aria-label="Sluit digitale ledenpas"
              onClick={closeMemberPass}
            >
              <X size={22} />
            </button>

            <div className="member-pass-live">
              <img
                className="member-pass-modal-image"
                src="/Fermi-PWA/images/home/member-pass-popup.png"
                alt="Digitale ledenpas van SV Fermi"
                decoding="async"
                onLoad={() => setMemberPassImageReady(true)}
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
