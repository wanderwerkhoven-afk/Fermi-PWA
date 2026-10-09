"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useFermiSession } from "./SessionProvider";

type TourStep = {
  route: string;
  selector: string;
  page: "Home" | "Agenda" | "Activiteit" | "Fermi" | "Community" | "Profiel";
  title: string;
  body: string;
};

const steps: TourStep[] = [
  { route: "/", selector: '[data-tour="nav-home"]', page: "Home", title: "Home", body: "Dit is je startpunt. Vanuit de navigatie onderaan ga je snel naar alle hoofdonderdelen van de Fermi-app." },
  { route: "/", selector: '[data-tour="home-notifications"]', page: "Home", title: "Meldingen", body: "Hier verschijnen nieuwe mededelingen en, voor admins, aanvragen die aandacht nodig hebben." },
  { route: "/", selector: '[data-tour="home-featured"], [data-tour="home-upcoming"]', page: "Home", title: "Uitgelichte activiteit", body: "De belangrijkste eerstvolgende activiteit staat groot op Home. Tik op de activiteit om alle details te bekijken." },
  { route: "/", selector: '[data-tour="home-upcoming"]', page: "Home", title: "Binnenkort", body: "Hier zie je in één oogopslag welke activiteiten er binnenkort aankomen." },
  { route: "/", selector: '[data-tour="home-announcements"]', page: "Home", title: "Mededelingen", body: "Nieuws en belangrijke berichten van S.V. Fermi vind je hier. Via ‘Bekijk alle mededelingen’ open je het volledige overzicht." },
  { route: "/", selector: '[data-tour="home-member-pass"]', page: "Home", title: "Digitale ledenpas", body: "Open hier je digitale ledenpas en QR-code. Deze gebruik je bijvoorbeeld bij activiteiten en ledenvoordelen." },

  { route: "/agenda", selector: '[data-tour="nav-agenda"]', page: "Agenda", title: "Agenda", body: "In de Agenda vind je alle geplande Fermi-activiteiten." },
  { route: "/agenda", selector: '[data-tour="agenda-month"]', page: "Agenda", title: "Maand kiezen", body: "Blader met de pijlen door de maanden om activiteiten in een specifieke periode te bekijken." },
  { route: "/agenda", selector: '[data-tour="agenda-all"]', page: "Agenda", title: "Alles", body: "Met ‘Alles’ laat je alle toekomstige activiteiten zien, ook buiten de geselecteerde maand." },
  { route: "/agenda", selector: '[data-tour="agenda-filters"]', page: "Agenda", title: "Filters", body: "Filter de agenda op het soort activiteit, bijvoorbeeld borrels, lezingen of reizen." },
  { route: "/agenda", selector: '[data-tour="agenda-calendar"]', page: "Agenda", title: "Kalenderweergave", body: "Met deze knop wissel je naar de visuele kalender met twee maanden onder elkaar. Je kunt daarin ook naar volgende maanden swipen." },
  { route: "/agenda", selector: '[data-tour="agenda-list"]', page: "Agenda", title: "Activiteiten", body: "De activiteiten verschijnen hier als kaarten met datum, tijd en locatie. Tik op een kaart om de activiteit te openen." },
  { route: "/agenda", selector: '[data-tour="agenda-example-activity"]', page: "Agenda", title: "Voorbeeldactiviteit", body: "We openen nu een activiteit als voorbeeld, zodat je ook ziet waar je je kunt inschrijven." },
  { route: "/agenda/activiteit", selector: '[data-tour="event-registration"]', page: "Activiteit", title: "Inschrijven", body: "Bij een activiteit kun je hier je plek reserveren. Je ziet ook hoeveel plekken bezet zijn en kunt je inschrijving later weer annuleren." },

  { route: "/fermi", selector: '[data-tour="nav-fermi"]', page: "Fermi", title: "Fermi", body: "Op deze pagina vind je alles over de vereniging zelf." },
  { route: "/fermi", selector: '[data-tour="fermi-board"]', page: "Fermi", title: "Bestuur", body: "Bekijk wie er in het bestuur zitten en welke rol zij binnen S.V. Fermi hebben." },
  { route: "/fermi", selector: '[data-tour="fermi-committees"]', page: "Fermi", title: "Commissies", body: "Hier ontdek je de commissies. Open een commissie voor meer informatie en om je eventueel aan te melden." },
  { route: "/fermi", selector: '[data-tour="fermi-documents"]', page: "Fermi", title: "Documenten", body: "Verenigingsdocumenten zoals de statuten en het huishoudelijk reglement vind je in dit onderdeel." },

  { route: "/community", selector: '[data-tour="nav-community"]', page: "Community", title: "Community", body: "De Community brengt de leden van Fermi bij elkaar." },
  { route: "/community", selector: '[data-tour="community-tabs"]', page: "Community", title: "Leden & fotoalbums", body: "Wissel hier tussen de ledenlijst en de fotoalbums van activiteiten." },
  { route: "/community", selector: '[data-tour="community-search"]', page: "Community", title: "Leden zoeken", body: "Zoek direct op naam, commissie of studiejaar." },
  { route: "/community", selector: '[data-tour="community-filters"]', page: "Community", title: "Leden filteren", body: "Gebruik de filters om bijvoorbeeld alleen bestuur, commissieleden of een studiejaar te tonen." },
  { route: "/community", selector: '[data-tour="community-active"]', page: "Community", title: "Word actief", body: "Wil je meer doen binnen Fermi? Vanuit deze kaart ga je direct naar de commissies." },
  { route: "/community", selector: '[data-tour="community-members"]', page: "Community", title: "Leden van Fermi", body: "Hier staat de ledenlijst. Deze informatie is alleen beschikbaar voor goedgekeurde leden." },

  { route: "/profiel", selector: '[data-tour="nav-profile"]', page: "Profiel", title: "Profiel", body: "Je profiel verzamelt je persoonlijke lidmaatschapsinformatie en instellingen." },
  { route: "/profiel", selector: '[data-tour="profile-summary"]', page: "Profiel", title: "Jouw profiel", body: "Bovenaan zie je je naam, rol, opleiding en de belangrijkste profielinformatie." },
  { route: "/profiel", selector: '[data-tour="profile-edit"]', page: "Profiel", title: "Profiel bewerken", body: "Via deze knop kun je je persoonlijke gegevens en profielinformatie aanpassen." },
  { route: "/profiel", selector: '[data-tour="profile-member-card"]', page: "Profiel", title: "Ledenpas", body: "Je digitale ledenpas staat ook in je profiel, inclusief lidnummer, geldigheid en QR-code." },
  { route: "/profiel", selector: '[data-tour="profile-stats"]', page: "Profiel", title: "Jouw Fermi-overzicht", body: "Hier krijg je een compact overzicht van je activiteiten, lidmaatschap en commissies." },
  { route: "/profiel", selector: '[data-tour="profile-menu"]', page: "Profiel", title: "Mijn Fermi", body: "Vanuit Mijn Fermi open je persoonlijke onderdelen en, afhankelijk van je rol, extra bestuur- of adminfuncties." },
  { route: "/profiel", selector: '[data-tour="profile-settings"]', page: "Profiel", title: "Instellingen", body: "Hier kun je de app-rondleiding opnieuw starten en uitloggen. Daarmee is de rondleiding compleet." },
];

const TOUR_EVENT = "fermi:start-tour";
const TOUR_VERSION = "v3";

function normalizeTourPath(pathname: string) {
  let value = pathname || "/";
  if (value.startsWith("/Fermi-PWA")) value = value.slice("/Fermi-PWA".length) || "/";
  if (value.length > 1) value = value.replace(/\/+$/, "");
  return value || "/";
}

export default function GuidedAppTour() {
  const router = useRouter();
  const pathname = usePathname();
  const { firebaseUser, fermiUser, membership, loading } = useFermiSession();
  const [open, setOpen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const fullAccess = Boolean(firebaseUser && fermiUser?.status === "active" && membership?.status === "active");
  const storageKey = useMemo(
    () => firebaseUser ? `fermi-app-tour-${TOUR_VERSION}:${firebaseUser.uid}` : "",
    [firebaseUser],
  );

  const finish = useCallback(() => {
    if (storageKey) window.localStorage.setItem(storageKey, "done");
    setOpen(false);
    setRect(null);
  }, [storageKey]);

  const start = useCallback(() => {
    if (!fullAccess) return;
    setRect(null);
    setStepIndex(0);
    setOpen(true);
    if (normalizeTourPath(window.location.pathname) !== "/") router.push("/");
  }, [fullAccess, router]);

  useEffect(() => {
    if (loading || !fullAccess || !storageKey) return;
    if (window.localStorage.getItem(storageKey) === "done") return;
    start();
  }, [loading, fullAccess, storageKey, start]);

  useEffect(() => {
    const handler = () => start();
    window.addEventListener(TOUR_EVENT, handler);
    return () => window.removeEventListener(TOUR_EVENT, handler);
  }, [start]);

  const step = steps[stepIndex];
  const currentRoute = normalizeTourPath(pathname);
  const transitioning = Boolean(open && step && currentRoute !== step.route);

  useEffect(() => {
    if (!open || !step || transitioning) {
      if (transitioning) setRect(null);
      return;
    }

    let cancelled = false;
    let settleTimer: number | null = null;

    const locate = () => {
      if (cancelled) return;
      const target = document.querySelector<HTMLElement>(step.selector);
      if (!target) return;

      target.scrollIntoView({ block: "center", behavior: "smooth" });
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (!cancelled) setRect(target.getBoundingClientRect());
      }, 180);
    };

    locate();
    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    const interval = window.setInterval(locate, 300);
    const refresh = () => locate();

    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);

    return () => {
      cancelled = true;
      observer.disconnect();
      window.clearInterval(interval);
      if (settleTimer) window.clearTimeout(settleTimer);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
    };
  }, [open, step, transitioning]);

  if (!open || !step) return null;

  const navigateToStep = (nextIndex: number) => {
    const nextStep = steps[nextIndex];
    if (!nextStep) return;

    setRect(null);
    setStepIndex(nextIndex);

    if (nextStep.route === "/agenda/activiteit") {
      const example = document.querySelector<HTMLAnchorElement>('[data-tour="agenda-example-activity"]');
      if (example?.href) {
        const url = new URL(example.href, window.location.href);
        router.push(`${normalizeTourPath(url.pathname)}${url.search}`);
        return;
      }
      // No activity available: continue with the next page instead of trapping the user.
      setStepIndex(nextIndex + 1);
      router.push(steps[nextIndex + 1]?.route ?? "/fermi");
      return;
    }

    if (normalizeTourPath(window.location.pathname) !== nextStep.route) router.push(nextStep.route);
  };

  const hasSpotlight = Boolean(rect && !transitioning);
  const pad = 7;
  const left = rect ? Math.max(8, rect.left - pad) : 0;
  const top = rect ? Math.max(8, rect.top - pad) : 0;
  const right = rect ? Math.min(window.innerWidth - 8, rect.right + pad) : 0;
  const bottom = rect ? Math.min(window.innerHeight - 8, rect.bottom + pad) : 0;
  const width = rect ? Math.max(0, right - left) : 0;
  const height = rect ? Math.max(0, bottom - top) : 0;
  const cardBelow = rect ? bottom + 220 < window.innerHeight : false;
  const cardStyle = rect
    ? cardBelow
      ? { top: Math.min(window.innerHeight - 220, bottom + 14) }
      : { bottom: Math.max(18, window.innerHeight - top + 14) }
    : { bottom: 104 };

  return (
    <div className="guided-tour" role="dialog" aria-modal="true" aria-label="Rondleiding door de Fermi-app">
      {hasSpotlight ? (
        <>
          <div className="guided-tour-mask top" style={{ height: top }} />
          <div className="guided-tour-mask left" style={{ top, width: left, height }} />
          <div className="guided-tour-mask right" style={{ top, left: right, height }} />
          <div className="guided-tour-mask bottom" style={{ top: bottom }} />
          <div className="guided-tour-spotlight" style={{ left, top, width, height }} aria-hidden="true" />
        </>
      ) : (
        <div className="guided-tour-mask guided-tour-mask-full" />
      )}

      <section className="guided-tour-card" style={cardStyle}>
        <button className="guided-tour-close" type="button" onClick={finish} aria-label="Rondleiding overslaan">
          <X size={18} />
        </button>
        <small>{step.page} · {stepIndex + 1} van {steps.length}</small>
        <h2>{step.title}</h2>
        <p>{step.body}</p>
        {transitioning && <span className="guided-tour-route-status">Pagina openen…</span>}
        <div className="guided-tour-progress-copy" aria-hidden="true">
          <span style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} />
        </div>
        <div className="guided-tour-actions">
          <button type="button" className="secondary" onClick={finish}>Overslaan</button>
          <span className="guided-tour-nav-actions">
            {stepIndex > 0 && (
              <button type="button" className="secondary icon" onClick={() => navigateToStep(stepIndex - 1)} aria-label="Vorige stap">
                <ChevronLeft size={18} />
              </button>
            )}
            {stepIndex < steps.length - 1 ? (
              <button type="button" className="primary" onClick={() => navigateToStep(stepIndex + 1)}>
                Volgende <ChevronRight size={18} />
              </button>
            ) : (
              <button type="button" className="primary" onClick={finish}>Klaar</button>
            )}
          </span>
        </div>
      </section>
    </div>
  );
}

export function restartFermiTour() {
  window.dispatchEvent(new Event(TOUR_EVENT));
}
