"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFermiSession } from "@/components/SessionProvider";

type Notice = { id: string; title?: string; message?: string; body?: string; read?: boolean; createdAt?: { seconds: number } };

export default function NotificationsPage() {
  const { firebaseUser, loading: sessionLoading } = useFermiSession();
  const [items, setItems] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!firebaseUser) { setItems([]); setLoading(false); return; }
    setLoading(true);
    setError("");
    return onSnapshot(
      query(collection(db, "notifications"), where("userId", "==", firebaseUser.uid)),
      snapshot => {
        setItems(snapshot.docs.map(item => ({ ...(item.data() as Omit<Notice, "id">), id: item.id }))
          .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
        setLoading(false);
      },
      () => { setError("Meldingen laden is niet gelukt."); setLoading(false); },
    );
  }, [firebaseUser]);

  const unread = items.filter(item => !item.read);
  async function markRead(ids: string[]) {
    if (!firebaseUser || !ids.length) return;
    setBusy(true);
    setError("");
    try {
      // Firestore batches are limited to 500 writes; keep batches smaller.
      for (let i = 0; i < ids.length; i += 400) {
        const batch = writeBatch(db);
        ids.slice(i, i + 400).forEach(id =>
          batch.update(doc(db, "notifications", id), { read: true, readAt: serverTimestamp() }));
        await batch.commit();
      }
    } catch { setError("Markeren als gelezen is mislukt."); }
    finally { setBusy(false); }
  }

  return <main className="app-shell profile-page-shell"><section className="association-admin-panel">
    <Link href="/profiel">← Terug naar profiel</Link>
    <h1>Notificaties</h1>
    <p>{unread.length} ongelezen {unread.length === 1 ? "melding" : "meldingen"}</p>
    {unread.length > 0 && <button type="button" disabled={busy} onClick={() => void markRead(unread.map(item => item.id))}>Alles als gelezen markeren</button>}
    {error && <p role="alert">{error}</p>}
    {sessionLoading || loading ? <p>Meldingen laden…</p>
      : !firebaseUser ? <p>Log in om je meldingen te bekijken.</p>
      : items.length === 0 ? <p>Je hebt nog geen meldingen.</p>
      : items.map(item => <article className="profile-menu-row" key={item.id}>
        <div><strong>{item.title || "Fermi melding"}{!item.read ? " · Nieuw" : ""}</strong>
          <p>{item.message || item.body || ""}</p>
          <small>{item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleString("nl-NL") : ""}</small>
        </div>
        {!item.read && <button type="button" disabled={busy} onClick={() => void markRead([item.id])}>Gelezen</button>}
      </article>)}
  </section></main>;
}
