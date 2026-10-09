"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useFermiSession } from "./SessionProvider";

type TourStep = {
  route: string;
  selector: string;
  eyebrow: string;
  title: string;
  body: string;
};

const steps: TourStep[] = [
  {
    route: "/",
    selector: '[data-tour="nav-home"]',
    eyebrow: "1 van 6",
    title: "Home",
    body: "Hier zie je wat er binnenkort gebeurt, mededelingen en je digitale ledenpas.",
  },
  {
    route: "/agenda",
    selector: '[data-tour="nav-agenda"]',
    eyebrow: "2 van 6",
    title: "Agenda",
    body: "Bekijk alle activiteiten, filter op type en open een activiteit voor alle details.",
  },
  {
    route: "/fermi",
    selector: '[data-tour="nav-fermi"]',
    eyebrow: "3 van 6",
    title: "Fermi",
    body: "Ontdek het bestuur, de commissies en andere informatie over de vereniging.",
  },
  {
    route: "/community",
    selector: '[data-tour="nav-community"]',
    eyebrow: "4 van 6",
    title: "Community",
    body: "Hier vind je de leden en fotoalbums. Deze onderdelen zijn alleen beschikbaar voor goedgekeurde leden.",
  },
  {
    route: "/profiel",
    selector: '[data-tour="nav-profile"]',
    eyebrow: "5 van 6",
    title: "Profiel",
    body: "Je profiel bevat je ledenpas, lidmaatschapsinformatie en persoonlijke instellingen.",
  },
  {
    route: "/profiel",
    selector: '[data-tour="profile-edit"]',
    eyebrow: "6 van 6",
    title: "Profiel bewerken",
    body: "Via deze knop kun je je persoonlijke gegevens en profielinformatie aanpassen.",
  },
];

const TOUR_EVENT = "fermi:start-tour";
const TOUR_VERSION = "v2";

function normalizeTourPath(pathname: string) {
  let value = pathname || "/";
  if (value.startsWith("/Fermi-PWA")) {
    value = value.slice("/Fermi-PWA".length) || "/";
  }
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

  const fullAccess = Boolean(
    firebaseUser
    && fermiUser?.status === "active"
    && membership?.status === "active",
  );

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
    if (!open || !step) return;

    if (currentRoute !== step.route) {
      setRect(null);
      return;
    }

    let cancelled = false;
    let settleTimer: number | null = null;

    const locate = () => {
      if (cancelled) return;
      const target = document.querySelector<HTMLElement>(step.selector);
      if (!target) return;

      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (!cancelled) setRect(target.getBoundingClientRect());
      }, 120);
    };

    locate();

    const observer = new MutationObserver(locate);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    const interval = window.setInterval(locate, 250);
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
  }, [open, step, currentRoute]);

  if (!open || !step) return null;

  const go = (nextIndex: number) => {
    const nextStep = steps[nextIndex];
    if (!nextStep) return;

    setRect(null);
    setStepIndex(nextIndex);

    if (normalizeTourPath(window.location.pathname) !== nextStep.route) {
      router.push(nextStep.route);
    }
  };

  const hasSpotlight = Boolean(rect && !transitioning);
  const pad = 7;
  const left = rect ? Math.max(8, rect.left - pad) : 0;
  const top = rect ? Math.max(8, rect.top - pad) : 0;
  const right = rect ? Math.min(window.innerWidth - 8, rect.right + pad) : 0;
  const bottom = rect ? Math.min(window.innerHeight - 8, rect.bottom + pad) : 0;
  const width = rect ? Math.max(0, right - left) : 0;
  const height = rect ? Math.max(0, bottom - top) : 0;
  const cardBelow = rect ? bottom + 190 < window.innerHeight : false;
  const cardStyle = rect
    ? cardBelow
      ? { top: Math.min(window.innerHeight - 190, bottom + 14) }
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
          <div
            className="guided-tour-spotlight"
            style={{ left, top, width, height }}
            aria-hidden="true"
          />
        </>
      ) : (
        <div className="guided-tour-mask guided-tour-mask-full" />
      )}

      <section className="guided-tour-card" style={cardStyle}>
        <button className="guided-tour-close" type="button" onClick={finish} aria-label="Rondleiding overslaan">
          <X size={18} />
        </button>
        <small>{step.eyebrow}</small>
        <h2>{step.title}</h2>
        <p>{step.body}</p>
        {transitioning && <span className="guided-tour-route-status">Pagina openen…</span>}
        <div className="guided-tour-progress" aria-hidden="true">
          {steps.map((_, index) => <span key={index} className={index === stepIndex ? "active" : ""} />)}
        </div>
        <div className="guided-tour-actions">
          <button type="button" className="secondary" onClick={finish}>Overslaan</button>
          <span className="guided-tour-nav-actions">
            {stepIndex > 0 && (
              <button type="button" className="secondary icon" onClick={() => go(stepIndex - 1)} aria-label="Vorige stap">
                <ChevronLeft size={18} />
              </button>
            )}
            {stepIndex < steps.length - 1 ? (
              <button type="button" className="primary" onClick={() => go(stepIndex + 1)}>
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
