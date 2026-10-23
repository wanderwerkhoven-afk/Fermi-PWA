"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Atom,
  Bell,
  CalendarDays,
  ChevronRight,
  Coins,
  FileText,
  GraduationCap,
  Home,
  Megaphone,
  Plane,
  UserRound,
  UsersRound,
} from "lucide-react";
import { committees } from "@/data/committees";
import { useAssociationContent } from "@/lib/services/association";

const board = [
  {
    name: "Lara Smit",
    role: "Voorzitter",
    description: "Verbindt de vereniging en bewaakt de koers.",
    icon: UserRound,
    image: "lara",
  },
  {
    name: "Sienna Koomen",
    role: "Secretaris",
    description: "Beheert communicatie en administratie.",
    icon: BarChartIcon,
    image: "sienna",
  },
  {
    name: "Daan Pronk",
    role: "Penningmeester",
    description: "Bewaakt de financiën en het budget.",
    icon: Coins,
    image: "daan",
  },
  {
    name: "Helena Diks",
    role: "Commissaris Sociaal",
    description: "Organiseert borrels, activiteiten en sociale uitjes voor de leden.",
    icon: UsersRound,
    image: "helena",
  },
  {
    name: "Demi Avnioğlu",
    role: "Commissaris Educatief",
    description: "Organiseert lezingen, bedrijfsbezoeken en studiegerichte activiteiten.",
    icon: GraduationCap,
    image: "demi",
  },
];

function BarChartIcon({ size = 24 }: { size?: number }) {
  return (
    <span className="fermi-bar-icon" style={{ width: size, height: size }} aria-hidden="true">
      <i /><i /><i />
    </span>
  );
}

const FERMI_VISUAL_ASSETS = [
  "/Fermi-PWA/images/branding/fermi-logo.png",
  "/Fermi-PWA/images/fermi/fermi-name-page.webp",
  "/Fermi-PWA/images/fermi/fermi-hero-collage.png",
  "https://raw.githubusercontent.com/wanderwerkhoven-afk/Fermi-PWA/b119114b57460146413d68fee5b32ccae0350249/Voorzitter-container.png",
  "https://raw.githubusercontent.com/wanderwerkhoven-afk/Fermi-PWA/b119114b57460146413d68fee5b32ccae0350249/Secretaris-container.png",
  "https://raw.githubusercontent.com/wanderwerkhoven-afk/Fermi-PWA/b119114b57460146413d68fee5b32ccae0350249/Penningmeester-container.png",
  "https://svfermi.nl/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-19-at-12.24.21.jpeg",
  "https://svfermi.nl/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-19-at-10.55.43.jpeg",
  "https://svfermi.nl/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-25-at-21.51.41.jpeg",
  "https://svfermi.nl/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-19-at-10.55.43-1.jpeg",
  "https://svfermi.nl/wp-content/uploads/2026/03/WhatsApp-Image-2026-03-02-at-20.31.48.jpeg",
  "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1512470876302-972faa2aa9a4?auto=format&fit=crop&w=500&q=80",
  "https://images.unsplash.com/photo-1452780212940-6f5c0d14d848?auto=format&fit=crop&w=500&q=80",
] as const;

const documents = [
  {
    title: "Beleidsplan",
    subtitle: "Het beleidsplan van S.V. Fermi",
    href: "/fermi/documenten/beleidsplan",
  },
  { title: "Huishoudelijk reglement", subtitle: "Het huishoudelijk reglement van S.V. Fermi" },
  { title: "ALV-documenten", subtitle: "Notulen, jaarverslagen en andere ALV-stukken" },
];

export default function FermiPage() {
  const { content: association, loaded: associationLoaded } = useAssociationContent();
  const liveBoard = association.board;
  const [fermiVisualReady, setFermiVisualReady] = useState(false);
  useEffect(() => {
    const criticalSources = FERMI_VISUAL_ASSETS.slice(0, 3);
    let active = true;
    const timeout = window.setTimeout(() => {
      if (active) setFermiVisualReady(true);
    }, 900);

    Promise.all(criticalSources.map((src) => new Promise<void>((resolve) => {
      const image = new Image();
      image.onload = () => resolve();
      image.onerror = () => resolve();
      image.src = src;
      if (image.complete) resolve();
    }))).then(() => {
      if (!active) return;
      window.clearTimeout(timeout);
      window.requestAnimationFrame(() => setFermiVisualReady(true));
    });

    const warmAllImages = () => {
      // Do not start every image download on the main thread.
      // The service worker warms the remaining artwork in the background.
      const sendCacheRequest = (worker: ServiceWorker | null | undefined) => {
        worker?.postMessage({
          type: "FERMI_CACHE_FERMI_ASSETS",
          urls: [...FERMI_VISUAL_ASSETS],
        });
      };

      if ("serviceWorker" in navigator) {
        sendCacheRequest(navigator.serviceWorker.controller);
        void navigator.serviceWorker.ready.then((registration) => {
          sendCacheRequest(registration.active);
        });
      }
    };

    const preloadTimer = window.setTimeout(warmAllImages, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      window.clearTimeout(preloadTimer);
    };
  }, []);
  return (
    <main className={`app-shell fermi-page-shell${fermiVisualReady ? " fermi-visual-ready" : ""}`}>
      <div className="noise" aria-hidden="true" />

      <section className="fermi-page-hero">
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

          <button className="icon-button notification-button" aria-label="Meldingen">
            <Bell size={22} strokeWidth={2.1} />
            <span className="notification-dot" />
          </button>
        </header>

        <div className="fermi-page-title-wrap">
          <div className="fermi-title-image-wrap">
            <img
              className="fermi-title-image"
              src="/Fermi-PWA/images/fermi/fermi-name-page.webp"
              alt="Fermi"
              decoding="async"
              loading="eager"
              fetchPriority="high"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
          </div>
          <p>Alles over de vereniging</p>

          <div className="fermi-hero-collage" aria-hidden="true">
            <img
              className="fermi-hero-collage-image"
              src="/Fermi-PWA/images/fermi/fermi-hero-collage.png"
              alt=""
              loading="eager"
              decoding="async"
              fetchPriority="high"
              onError={(event) => { event.currentTarget.style.display = "none"; }}
            />
          </div>
        </div>
      </section>

      <section className="fermi-page-content">
        <section className="fermi-section" data-tour="fermi-board">
          <div className="fermi-section-heading">
            <h2>Bestuur</h2>
            <Link href="/fermi/bestuur">Bekijk volledig bestuur <ChevronRight size={18} /></Link>
          </div>

          <div className="fermi-board-carousel-wrap">
            <div className="fermi-board-carousel" role="region" aria-label="Bestuursleden, horizontaal scrollbaar" tabIndex={0}>
            {!associationLoaded ? Array.from({ length: 4 }, (_, index) => (
              <article className="fermi-board-card fermi-card-skeleton" key={index} aria-hidden="true">
                <span className="fermi-skeleton-line fermi-skeleton-board-title" />
                <span className="fermi-skeleton-line fermi-skeleton-board-description" />
                <span className="fermi-skeleton-line fermi-skeleton-board-name" />
              </article>
            )) : liveBoard.map(({ id, name, role, description }, index) => {
              const Icon = [UserRound, BarChartIcon, Coins, UsersRound][index] || UserRound;
              const image = ["lara", "sienna", "daan", "helena"][index] || "lara";
              return (
              <article className="fermi-board-card" key={id}>
                <div className={`fermi-board-photo fermi-board-${image}`}>
                  <span className="fermi-board-art-overlay" />
                </div>
                <div className="fermi-board-icon">
                  <Icon size={23} />
                </div>
                <div className="fermi-board-copy">
                  <h3>{role}</h3>
                  <p>{description}</p>
                  <span className="fermi-board-name">{name}</span>
                </div>
              </article>
              );
            })}
            </div>
          </div>
        </section>

        <section className="fermi-section" data-tour="fermi-committees">
          <div className="fermi-section-heading">
            <h2>Commissies</h2>
            <button>Bekijk alle commissies <ChevronRight size={18} /></button>
          </div>

          <div className="fermi-committee-grid">
            {!associationLoaded ? committees.map((committee) => (
              <div className="fermi-committee-card fermi-card-skeleton" key={committee.slug} aria-hidden="true">
                <span className="fermi-skeleton-circle" />
                <span className="fermi-skeleton-copy">
                  <span className="fermi-skeleton-line" />
                  <span className="fermi-skeleton-line" />
                </span>
              </div>
            )) : committees.map((defaultCommittee) => {
              const committee = { ...defaultCommittee, ...association.committees.find((item) => item.slug === defaultCommittee.slug) };
              const Icon =
                committee.icon === "users" ? UsersRound :
                committee.icon === "education" ? GraduationCap :
                committee.icon === "plane" ? Plane :
                Megaphone;

              return (
                <Link
                  className="fermi-committee-card"
                  href={`/fermi/commissies/${committee.slug}`}
                  key={committee.slug}
                  aria-label={`Bekijk ${committee.name}`}
                >
                  <span className="fermi-committee-icon"><Icon size={25} /></span>
                  <span className="fermi-committee-copy">
                    <strong>{committee.name}</strong>
                    <small>{committee.description}</small>
                  </span>
                  <span className={`fermi-committee-art fermi-committee-${committee.art}`} />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="fermi-section fermi-docs-section" data-tour="fermi-documents">
          <div className="fermi-section-heading">
            <h2>Documenten</h2>
            <button>Bekijk alle documenten <ChevronRight size={18} /></button>
          </div>

          <div className="fermi-docs-wrap">
            <div className="fermi-doc-list">
              {documents.map((doc) => {
                const content = (
                  <>
                    <span className="fermi-doc-icon"><FileText size={23} /></span>
                    <span className="fermi-doc-copy">
                      <strong>{doc.title}</strong>
                      <small>{doc.subtitle}</small>
                    </span>
                    <ChevronRight size={21} />
                  </>
                );

                return doc.href ? (
                  <a
                    className="fermi-doc-row"
                    href={doc.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={doc.title}
                    aria-label={`Open ${doc.title}`}
                  >
                    {content}
                  </a>
                ) : (
                  <button className="fermi-doc-row" type="button" key={doc.title}>
                    {content}
                  </button>
                );
              })}
            </div>

            <div className="fermi-doc-art" aria-hidden="true">
              <Atom size={112} />
              <span className="fermi-doc-dots" />
            </div>
          </div>
        </section>
      </section>

      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item" href="/" data-tour="nav-home">
          <Home size={23} />
          <span>Home</span>
        </Link>
        <Link className="nav-item" href="/agenda" data-tour="nav-agenda">
          <CalendarDays size={23} />
          <span>Agenda</span>
        </Link>
        <Link className="nav-item center-item active" href="/fermi" data-tour="nav-fermi">
          <span className="nav-fermi">
            <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="" />
          </span>
          <span>Fermi</span>
          <i />
        </Link>
        <Link className="nav-item" href="/community" data-tour="nav-community">
          <UsersRound size={25} />
          <span>Community</span>
        </Link>
        <Link className="nav-item" href="/profiel" data-tour="nav-profile">
          <UserRound size={24} />
          <span>Profiel</span>
        </Link>
      </nav>
    </main>
  );
}
