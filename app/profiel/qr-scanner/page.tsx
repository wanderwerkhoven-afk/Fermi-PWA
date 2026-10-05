"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowLeft,
  Camera,
  CheckCircle2,
  QrCode,
  RefreshCw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { auth } from "../../../lib/firebase";
import { listActivities, type ActivityData } from "../../../lib/services/activities";
import { getUserProfile } from "../../../lib/services/users";
import {
  verifyMemberForEvent,
  type ScanVerification,
} from "../../../lib/services/scanner";

type ScannerHandle = {
  start: (
    cameraConfig: { facingMode: string },
    config: { fps: number; qrbox: { width: number; height: number }; aspectRatio: number },
    onSuccess: (decodedText: string) => void,
    onFailure?: () => void,
  ) => Promise<unknown>;
  stop: () => Promise<unknown>;
  clear: () => void;
};

const allowedRoles = new Set(["committee", "board", "admin"]);

function eventDate(item: ActivityData) {
  const months = ["JAN","FEB","MAR","APR","MEI","JUN","JUL","AUG","SEP","OKT","NOV","DEC"];
  const month = months.indexOf(item.month);
  return month < 0
    ? new Date(0)
    : new Date(Number(item.year), month, Number(item.day), 12);
}

function resultCopy(result: ScanVerification) {
  if (result.ok) {
    return {
      title: "Aangemeld",
      detail: "Deze ledenpas is geldig en staat aangemeld voor deze activiteit.",
    };
  }

  switch (result.reason) {
    case "not_registered":
      return { title: "Niet aangemeld", detail: "Dit lid staat niet als aanwezig/aangemeld voor deze activiteit." };
    case "inactive_membership":
      return { title: "Ledenpas niet actief", detail: "De QR hoort bij een lidmaatschap dat niet actief is." };
    case "membership_mismatch":
      return { title: "Inschrijving ongeldig", detail: "De inschrijving hoort niet bij het huidige actieve lidmaatschap." };
    case "unknown_card":
      return { title: "Onbekende ledenpas", detail: "Deze QR-code is niet gekoppeld aan een Fermi-lidmaatschap." };
    default:
      return { title: "Geen Fermi QR-code", detail: "De gescande QR-code is geen geldige S.V. Fermi ledenpas." };
  }
}

export default function QrScannerPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [eventId, setEventId] = useState("");
  const [cameraState, setCameraState] = useState<"idle" | "starting" | "running" | "error">("idle");
  const [cameraError, setCameraError] = useState("");
  const [result, setResult] = useState<ScanVerification | null>(null);
  const [checking, setChecking] = useState(false);
  const scannerRef = useRef<ScannerHandle | null>(null);
  const processingRef = useRef(false);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthorized(false);
        return;
      }

      try {
        const profile = await getUserProfile(user.uid);
        const allowed = Boolean(profile?.status === "active" && allowedRoles.has(profile.role));
        setAuthorized(allowed);
        if (!allowed) return;

        const items = await listActivities();
        const sorted = [...items].sort((a, b) => eventDate(a).getTime() - eventDate(b).getTime());
        setActivities(sorted);

        const now = new Date();
        now.setHours(0, 0, 0, 0);
        const next = sorted.find((item) => eventDate(item) >= now && item.showInAgenda !== false) || sorted[0];
        if (next) setEventId(next.slug);
      } catch (error) {
        console.error(error);
        setAuthorized(false);
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      const scanner = scannerRef.current;
      scannerRef.current = null;
      if (scanner) {
        scanner.stop().catch(() => undefined).finally(() => {\n          try { scanner.clear(); } catch { /* already cleared */ }\n        });
      }
    };
  }, []);

  const selectedActivity = useMemo(
    () => activities.find((item) => item.slug === eventId) || null,
    [activities, eventId],
  );

  async function stopScanner() {
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (!scanner) return;
    try {
      await scanner.stop();
    } catch {
      // Camera may already be stopped after a route/state transition.
    }
    try {
      await scanner.clear();
    } catch {
      // Reader can already be cleared.
    }
    setCameraState("idle");
  }

  async function handleDecoded(decodedText: string) {
    if (processingRef.current || !eventId) return;
    processingRef.current = true;
    setChecking(true);

    try {
      const verification = await verifyMemberForEvent(decodedText, eventId);
      setResult(verification);
      await stopScanner();
    } catch (error) {
      console.error(error);
      setResult({ ok: false, reason: "unknown_card" });
      await stopScanner();
    } finally {
      setChecking(false);
      processingRef.current = false;
    }
  }

  async function startScanner() {
    if (!eventId || cameraState === "starting" || cameraState === "running") return;

    setResult(null);
    setCameraError("");
    setCameraState("starting");

    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      const scanner = new Html5Qrcode("fermi-qr-reader", false) as unknown as ScannerHandle;
      scannerRef.current = scanner;

      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 245, height: 245 },
          aspectRatio: 1,
        },
        (decodedText) => {
          void handleDecoded(decodedText);
        },
        () => undefined,
      );

      setCameraState("running");
    } catch (error) {
      console.error(error);
      scannerRef.current = null;
      setCameraState("error");
      setCameraError("Camera kon niet worden gestart. Controleer of cameratoegang voor de Fermi PWA is toegestaan.");
    }
  }

  async function nextScan() {
    setResult(null);
    await startScanner();
  }

  if (authorized === null) {
    return <main className="scanner-gate">QR-scanner laden…</main>;
  }

  if (!authorized) {
    return (
      <main className="scanner-gate">
        <ShieldAlert size={44} />
        <h1>Geen scannertoegang</h1>
        <p>De scanner is alleen beschikbaar voor actieve commissie-, bestuurs- en adminaccounts.</p>
        <Link href="/profiel">Terug naar profiel</Link>
      </main>
    );
  }

  const copy = result ? resultCopy(result) : null;
  const displayName = result && "memberName" in result && result.memberName
    ? result.memberName
    : "Fermi-lid";
  const memberNumber = result && "memberNumber" in result ? result.memberNumber : "";

  return (
    <main className="scanner-shell">
      <header className="scanner-header">
        <Link href="/profiel" aria-label="Terug naar profiel"><ArrowLeft size={23} /></Link>
        <div>
          <small>BESTUUR & COMMISSIE</small>
          <h1>QR scanner</h1>
        </div>
        <span><QrCode size={25} /></span>
      </header>

      <section className="scanner-content">
        <div className="scanner-event-card">
          <label htmlFor="scanner-event">Activiteit</label>
          <select
            id="scanner-event"
            value={eventId}
            onChange={async (event) => {
              await stopScanner();
              setResult(null);
              setEventId(event.target.value);
            }}
          >
            {!activities.length && <option value="">Geen activiteiten beschikbaar</option>}
            {activities.map((activity) => (
              <option value={activity.slug} key={activity.slug}>
                {activity.title} · {activity.day} {activity.month} {activity.year}
              </option>
            ))}
          </select>
          <p>Alleen leden die voor <strong>{selectedActivity?.title || "de gekozen activiteit"}</strong> staan aangemeld worden groen herkend.</p>
        </div>

        <section className="scanner-camera-card">
          <div id="fermi-qr-reader" className="scanner-reader" />

          {cameraState !== "running" && cameraState !== "starting" && !result && (
            <div className="scanner-camera-placeholder">
              <span><Camera size={38} /></span>
              <h2>Klaar om te scannen</h2>
              <p>Richt de camera op de QR-code van de digitale ledenpas.</p>
              <button type="button" onClick={startScanner} disabled={!eventId}>
                <Camera size={19} /> Start scanner
              </button>
            </div>
          )}

          {cameraState === "starting" && !result && (
            <div className="scanner-camera-placeholder">
              <span className="scanner-pulse"><QrCode size={38} /></span>
              <h2>Camera starten…</h2>
            </div>
          )}

          {cameraState === "running" && !result && (
            <div className="scanner-status-pill">
              <span /> QR-code zoeken…
            </div>
          )}

          {checking && <div className="scanner-checking">Ledenpas controleren…</div>}
        </section>

        {cameraError && (
          <div className="scanner-error" role="alert">
            <ShieldAlert size={20} />
            <span>{cameraError}</span>
          </div>
        )}

        {result && copy && (
          <section className={`scanner-result ${result.ok ? "is-valid" : "is-invalid"}`} aria-live="assertive">
            <div className="scanner-result-icon">
              {result.ok ? <CheckCircle2 size={76} /> : <XCircle size={76} />}
            </div>
            <small>{result.ok ? "TOEGANG OK" : "GEEN TOEGANG"}</small>
            <h2>{copy.title}</h2>
            <strong>{displayName}</strong>
            {memberNumber && <span>Lidnummer {memberNumber}</span>}
            <p>{copy.detail}</p>
            <button type="button" onClick={nextScan}>
              <RefreshCw size={19} /> Volgende scan
            </button>
          </section>
        )}

        <div className="scanner-legend">
          <div><CheckCircle2 size={20} /><span><strong>Groen</strong> Actieve ledenpas + aangemeld</span></div>
          <div><XCircle size={20} /><span><strong>Rood</strong> Niet aangemeld of pas ongeldig</span></div>
        </div>
      </section>

      <style jsx>{`
        .scanner-shell,.scanner-gate{min-height:100dvh;background:#031d2c;color:#fff9f0;font-family:Inter,ui-sans-serif,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .scanner-gate{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:32px;gap:12px}
        .scanner-gate h1{font-family:Georgia,serif;margin:4px 0 0;font-size:30px}.scanner-gate p{max-width:390px;color:#a8b6c0;line-height:1.5}.scanner-gate a{color:#fff9f0;background:#ff7a1a;padding:12px 18px;border-radius:14px;text-decoration:none;font-weight:800}
        .scanner-header{display:grid;grid-template-columns:44px 1fr 44px;align-items:center;gap:12px;padding:max(18px,env(safe-area-inset-top)) 18px 18px;background:linear-gradient(180deg,#06283b,#031d2c);border-bottom:1px solid rgba(255,255,255,.08)}
        .scanner-header>a,.scanner-header>span{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:rgba(255,255,255,.07);color:#fff9f0}.scanner-header div small{font-size:10px;letter-spacing:.15em;color:#ff7a1a;font-weight:900}.scanner-header h1{font-family:Georgia,serif;font-size:30px;line-height:1;margin:4px 0 0}
        .scanner-content{max-width:620px;margin:0 auto;padding:18px 16px 42px;display:grid;gap:16px}
        .scanner-event-card{background:#f4eadc;color:#06283b;border-radius:22px;padding:17px;box-shadow:0 18px 50px rgba(0,0,0,.2)}.scanner-event-card label{display:block;font-size:12px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}.scanner-event-card select{width:100%;border:2px solid rgba(6,40,59,.15);background:#fff9f0;color:#06283b;border-radius:14px;padding:13px 38px 13px 13px;font-size:16px;font-weight:800}.scanner-event-card p{font-size:13px;line-height:1.45;margin:10px 1px 0;color:#365265}
        .scanner-camera-card{position:relative;min-height:390px;background:#061f2e;border:1px solid rgba(255,255,255,.1);border-radius:26px;overflow:hidden;display:grid;place-items:center}.scanner-reader{width:100%;min-height:390px}.scanner-reader :global(video){object-fit:cover!important;border-radius:24px}.scanner-reader :global(#fermi-qr-reader__scan_region){min-height:390px}.scanner-reader :global(img){display:none!important}
        .scanner-camera-placeholder{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:30px;background:radial-gradient(circle at 50% 38%,rgba(255,122,26,.14),transparent 190px),#061f2e}.scanner-camera-placeholder>span{width:76px;height:76px;border-radius:24px;display:grid;place-items:center;background:rgba(255,122,26,.14);color:#ff7a1a}.scanner-camera-placeholder h2{font-family:Georgia,serif;font-size:27px;margin:16px 0 6px}.scanner-camera-placeholder p{max-width:310px;color:#a8b6c0;line-height:1.45;margin:0 0 20px}.scanner-camera-placeholder button,.scanner-result button{border:0;border-radius:15px;background:#ff7a1a;color:#fff;padding:13px 18px;font-weight:900;display:flex;align-items:center;gap:8px}.scanner-camera-placeholder button:disabled{opacity:.45}
        .scanner-pulse{animation:pulse 1.4s ease-in-out infinite}.scanner-status-pill{position:absolute;left:50%;bottom:18px;transform:translateX(-50%);background:rgba(3,29,44,.86);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.13);padding:10px 14px;border-radius:999px;font-size:13px;font-weight:800;white-space:nowrap}.scanner-status-pill span{display:inline-block;width:8px;height:8px;background:#37d67a;border-radius:50%;margin-right:7px;box-shadow:0 0 0 5px rgba(55,214,122,.13)}
        .scanner-checking{position:absolute;inset:0;display:grid;place-items:center;background:rgba(3,29,44,.78);backdrop-filter:blur(8px);font-weight:900}.scanner-error{display:flex;gap:10px;align-items:flex-start;background:#4f1f25;border:1px solid rgba(255,120,120,.35);padding:14px;border-radius:16px;color:#ffd9d9;font-size:14px;line-height:1.4}
        .scanner-result{border-radius:28px;padding:28px 22px 22px;text-align:center;display:flex;flex-direction:column;align-items:center;border:2px solid transparent;box-shadow:0 24px 60px rgba(0,0,0,.25)}.scanner-result.is-valid{background:linear-gradient(180deg,#123f2c,#082c21);border-color:#37d67a}.scanner-result.is-invalid{background:linear-gradient(180deg,#56252a,#35151a);border-color:#ff6b72}.scanner-result-icon{margin-bottom:10px}.is-valid .scanner-result-icon{color:#53e493}.is-invalid .scanner-result-icon{color:#ff737a}.scanner-result>small{font-size:10px;letter-spacing:.16em;font-weight:900;opacity:.8}.scanner-result h2{font-family:Georgia,serif;font-size:34px;margin:4px 0 8px}.scanner-result>strong{font-size:20px}.scanner-result>span{font-size:13px;opacity:.75;margin-top:3px}.scanner-result p{max-width:390px;line-height:1.5;opacity:.86;margin:12px 0 18px}.scanner-result button{background:#fff9f0;color:#06283b}
        .scanner-legend{display:grid;gap:10px;background:#06283b;border-radius:18px;padding:14px}.scanner-legend div{display:flex;gap:10px;align-items:center;font-size:13px;color:#c6d2d9}.scanner-legend div:first-child svg{color:#53e493}.scanner-legend div:last-child svg{color:#ff737a}.scanner-legend strong{color:#fff9f0}
        @keyframes pulse{50%{transform:scale(1.06);opacity:.72}}
        @media(min-width:760px){.scanner-content{padding-top:28px}.scanner-camera-card,.scanner-reader{min-height:460px}.scanner-reader :global(#fermi-qr-reader__scan_region){min-height:460px}}
      `}</style>
    </main>
  );
}
