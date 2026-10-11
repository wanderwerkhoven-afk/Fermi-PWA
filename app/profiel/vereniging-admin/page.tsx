"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Save, UsersRound } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/services/users";
import { useAssociationContent, saveAssociationContent, type AssociationContent } from "@/lib/services/association";

export default function VerenigingAdminPage() {
  const { content, loaded, error } = useAssociationContent();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [draft, setDraft] = useState<AssociationContent | null>(null);
  const [tab, setTab] = useState<"board" | "committees">("board");
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) { setAuthorized(false); return; }
    try {
      const profile = await getUserProfile(user.uid);
      setAuthorized(profile?.status === "active" && profile?.role === "admin");
    } catch { setAuthorized(false); }
  }), []);
  useEffect(() => { if (loaded && !draft) setDraft(content); }, [content, loaded, draft]);
  const editBoard = (index: number, field: "name" | "role" | "description", value: string) => {
    setDraft((current) => current ? { ...current, board: current.board.map((entry, i) => i === index ? { ...entry, [field]: value } : entry) } : current);
    setNotice("");
  };
  const editCommittee = (index: number, field: "name" | "fullName" | "description" | "intro", value: string) => {
    setDraft((current) => current ? { ...current, committees: current.committees.map((entry, i) => i === index ? { ...entry, [field]: value } : entry) } : current);
    setNotice("");
  };
  const save = async () => {
    if (!draft || !authorized) return;
    setSaving(true);
    setNotice("");
    try { await saveAssociationContent(draft); setNotice("Wijzigingen opgeslagen en direct zichtbaar op de Fermi-pagina."); }
    catch (err) { setNotice(err instanceof Error ? err.message : "Opslaan mislukt."); }
    finally { setSaving(false); }
  };
  return <main className="app-shell association-admin-shell">
    <div className="association-admin-panel">
      <Link href="/profiel/admin" className="association-admin-back"><ArrowLeft size={19}/> Terug naar adminoverzicht</Link>
      <h1><UsersRound size={26}/> Vereniging beheren</h1>
      <p>Beheer de vier bestuursleden en de teksten van de commissies. Wijzigingen worden centraal opgeslagen.</p>
      {authorized === null || !loaded ? <p>Gegevens laden…</p> :
        !authorized ? <p>Je hebt geen toegang tot deze beheerpagina.</p> :
        error ? <p role="alert">Laden mislukt: {error}</p> :
        draft && <>
          <div className="association-admin-tabs">
            <button type="button" className={tab === "board" ? "selected" : ""} onClick={() => setTab("board")}>Bestuur (4)</button>
            <button type="button" className={tab === "committees" ? "selected" : ""} onClick={() => setTab("committees")}>Commissies</button>
          </div>
          {tab === "board" ? draft.board.map((entry, i) => <section className="association-admin-card" key={entry.id}>
            <h2>Bestuurslid {i + 1}</h2>
            <label>Naam<input value={entry.name} onChange={(e) => editBoard(i, "name", e.target.value)}/></label>
            <label>Functie<input value={entry.role} onChange={(e) => editBoard(i, "role", e.target.value)}/></label>
            <label>Korte omschrijving<textarea rows={2} value={entry.description} onChange={(e) => editBoard(i, "description", e.target.value)}/></label>
          </section>) : draft.committees.map((entry, i) => <section className="association-admin-card" key={entry.slug}>
            <h2>{entry.name}</h2>
            <label>Naam<input value={entry.name} onChange={(e) => editCommittee(i, "name", e.target.value)}/></label>
            <label>Volledige naam<input value={entry.fullName} onChange={(e) => editCommittee(i, "fullName", e.target.value)}/></label>
            <label>Korte omschrijving<input value={entry.description} onChange={(e) => editCommittee(i, "description", e.target.value)}/></label>
            <label>Introductie<textarea rows={5} value={entry.intro} onChange={(e) => editCommittee(i, "intro", e.target.value)}/></label>
          </section>)}
          {notice && <p role="status" className="association-admin-notice">{notice}</p>}
          <button className="association-admin-save" type="button" disabled={saving} onClick={save}><Save size={18}/>{saving ? "Opslaan…" : "Wijzigingen opslaan"}</button>
        </>}
    </div>
  </main>;
}
