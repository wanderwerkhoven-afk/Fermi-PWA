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
    selector: '.bottom-nav a[href$="/"], .bottom-nav .nav-item:nth-child(1)',
    eyebrow: "1 van 6",
    title: "Home",
    body: "Hier zie je wat er binnenkort gebeurt, mededelingen en je digitale ledenpas.",
  },
  {
    route: "/agenda",
    selector: '.bottom-nav a[href$="/agenda"], .bottom-nav .nav-item:nth-child(2)',
    eyebrow: "2 van 6",
    title: "Agenda",
    body: "Bekijk alle activiteiten, filter op type en open een activiteit voor alle details.",
  },
  {
    route: "/fermi",
    selector: '.bottom-nav a[href$="/fermi"], .bottom-nav .nav-item:nth-child(3)',
    eyebrow: "3 van 6",
    title: "Fermi",
    body: "Ontdek het bestuur, de commissies en andere informatie over de vereniging.",
  },
  {
    route: "/community",
    selector: '.bottom-nav a[href$="/community"], .bottom-nav .nav-item:nth-child(4)',
    eyebrow: "4 van 6",
    title: "Community",
    body: "Hier vind je de leden en fotoalbums. Deze onderdelen zijn alleen beschikbaar voor goedgekeurde leden.",
  },
  {
    route: "/profiel",
    selector: '.bottom-nav a[href$="/profiel"], .bottom-nav .nav-item:nth-child(5)',
    eyebrow: "5 van 6",
    title: "Profiel",
    body: "Je profiel bevat je ledenpas, lidmaatschapsinformatie en persoonlijke instellingen.",
  },
  {
    route: "/profiel",
    selector: ".profile-edit-button",
    eyebrow: "6 van 6",
    title: "Profiel bewerken",
    body: "Via deze knop kun je straks je persoonlijke gegevens en profielinformatie aanpassen.",
  },
];

const TOUR_EVENT = "fermi:start-tour";
const TOUR_VERSION = "v1";

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
    setStepIndex(0);
    setOpen(true);
  }, [fullAccess]);

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

  useEffect(() => {
    if (!open || !step) return;

    if (pathname !== step.route) {
      setRect(null);
      router.push(step.route);
      return;
    }

    let cancelled = false;
    let settleTimer: ReturnType<typeof setTimeout> | null = null;

    const locate = () => {
      if (cancelled) return false;
      const target = document.querySelector<HTMLElement>(step.selector);
      if (!target) return false;

      target.scrollIntoView({ block: "nearest", behavior: "smooth" });
      if (settleTimer) window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        if (!cancelled) setRect(target.getBoundingClientRect());
      }, 180);
      return true;
    };

    // Locate immediately when possible, but also keep observing the page while
    // Next.js mounts the destination route. This prevents the tour from getting
    // stuck on a blank step when Agenda/Profile takes longer to render.
    locate();

    const observer = new MutationObserver(() => {
      if (!rect) locate();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    const refresh = () => {
      const target = document.querySelector<HTMLElement>(step.selector);
      if (target) setRect(target.getBoundingClientRect());
    };

    window.addEventListener("resize", refresh);
    window.addEventListener("scroll", refresh, true);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (settleTimer) window.clearTimeout(settleTimer);
      window.removeEventListener("resize", refresh);
      window.removeEventListener("scroll", refresh, true);
    };
  }, [open, step, pathname, router]);

  if (!open || !step || !rect) return null;

  const pad = 7;
  const left = Math.max(8, rect.left - pad);
  const top = Math.max(8, rect.top - pad);
  const right = Math.min(window.innerWidth - 8, rect.right + pad);
  const bottom = Math.min(window.innerHeight - 8, rect.bottom + pad);
  const width = Math.max(0, right - left);
  const height = Math.max(0, bottom - top);
  const cardBelow = bottom + 190 < window.innerHeight;
  const cardStyle = cardBelow
    ? { top: Math.min(window.innerHeight - 190, bottom + 14) }
    : { bottom: Math.max(18, window.innerHeight - top + 14) };

  const go = (nextIndex: number) => {
    setRect(null);
    setStepIndex(nextIndex);
  };

  return (
    <div className="guided-tour" role="dialog" aria-modal="true" aria-label="Rondleiding door de Fermi-app">
      <div className="guided-tour-mask top" style={{ height: top }} />
      <div className="guided-tour-mask left" style={{ top, width: left, height }} />
      <div className="guided-tour-mask right" style={{ top, left: right, height }} />
      <div className="guided-tour-mask bottom" style={{ top: bottom }} />

      <div
        className="guided-tour-spotlight"
        style={{ left, top, width, height }}
        aria-hidden="true"
      />

      <section className="guided-tour-card" style={cardStyle}>
        <button className="guided-tour-close" type="button" onClick={finish} aria-label="Rondleiding overslaan">
          <X size={18} />
        </button>
        <small>{step.eyebrow}</small>
        <h2>{step.title}</h2>
        <p>{step.body}</p>
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
