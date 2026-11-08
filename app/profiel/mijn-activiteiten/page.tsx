"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFermiSession } from "@/components/SessionProvider";
import { useAppData } from "@/components/AppDataProvider";
import { cancelEventRegistrationAtomic } from "@/lib/services/registrations";

export default function MyActivitiesPage() {
  const { firebaseUser, loading: sessionLoading } = useFermiSession();
  const { activities } = useAppData();
  const [ids, setIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseUser) { setIds([]); setLoading(false); return; }
    setLoading(true);
    setError("");
    return onSnapshot(
      query(collection(db, "registrations"), where("userId", "==", firebaseUser.uid)),
      snapshot => {
        setIds(snapshot.docs.filter(item => item.data().status === "registered")
          .map(item => String(item.data().eventId)));
        setLoading(false);
      },
      () => { setError("Aanmeldingen laden is niet gelukt."); setLoading(false); },
    );
  }, [firebaseUser]);

  return <main className="app-shell profile-page-shell">
    <section className="association-admin-panel">
      <Link href="/profiel">← Terug naar profiel</Link>
      <h1>Mijn activiteiten</h1>
      <p>Bekijk je inschrijvingen en meld je af als je niet kunt komen.</p>
      {error && <p role="alert">{error}</p>}
      {sessionLoading || loading ? <p>Inschrijvingen laden…</p>
        : !firebaseUser ? <p>Log in om je inschrijvingen te bekijken.</p>
        : ids.length === 0 ? <div><p>Je hebt nog geen actieve inschrijvingen.</p><Link href="/agenda">Bekijk de agenda</Link></div>
        : ids.map(id => {
          const event = activities.find(item => item.slug === id);
          return <article className="profile-menu-row" key={id}>
            <div>
              <strong>{event?.title || "Activiteit"}</strong>
              <p>{event?.dateLabel || "Datum onbekend"}{event?.location ? ` · ${event.location}` : ""}</p>
              <Link href={`/agenda/activiteit?slug=${encodeURIComponent(id)}`}>Activiteit bekijken</Link>
            </div>
            <button type="button" disabled={busy === id} onClick={async () => {
              if (!firebaseUser || !window.confirm("Weet je zeker dat je je wilt uitschrijven?")) return;
              setBusy(id);
              setError("");
              try { await cancelEventRegistrationAtomic(id, firebaseUser.uid); }
              catch { setError("Uitschrijven is niet gelukt. Probeer het opnieuw."); }
              finally { setBusy(""); }
            }}>{busy === id ? "Bezig…" : "Uitschrijven"}</button>
          </article>;
        })}
    </section>
  </main>;
}
