"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useFermiSession } from "@/components/SessionProvider";
import { useAppData } from "@/components/AppDataProvider";
import { cancelEventRegistrationAtomic } from "@/lib/services/registrations";
export default function MyActivitiesPage() {
 const {firebaseUser}=useFermiSession(); const {activities}=useAppData();
 const [ids,setIds]=useState<string[]>([]); const [busy,setBusy]=useState(""); const [error,setError]=useState("");
 useEffect(()=>{if(!firebaseUser){setIds([]);return;} return onSnapshot(query(collection(db,"registrations"),where("userId","==",firebaseUser.uid)),snap=>setIds(snap.docs.filter(d=>d.data().status==="registered").map(d=>String(d.data().eventId))),()=>setError("Aanmeldingen laden is niet gelukt."));},[firebaseUser]);
 return <main className="app-shell profile-page-shell"><section className="association-admin-panel"><Link href="/profiel">← Terug naar profiel</Link><h1>Mijn activiteiten</h1><p>Activiteiten waarvoor je bent ingeschreven.</p>{error&&<p role="alert">{error}</p>}{ids.length===0?<p>Je hebt nog geen actieve inschrijvingen.</p>:ids.map(id=>{const event=activities.find(a=>a.slug===id);return <article className="profile-menu-row" key={id}><div><strong>{event?.title||id}</strong><p>{event?.dateLabel||"Activiteit"} · {event?.location||""}</p><Link href={`/agenda/activiteit?slug=${encodeURIComponent(id)}`}>Details</Link></div><button disabled={busy===id} onClick={async()=>{if(!firebaseUser||!window.confirm("Inschrijving annuleren?"))return;setBusy(id);try{await cancelEventRegistrationAtomic(id,firebaseUser.uid)}catch{setError("Annuleren is niet gelukt.")}finally{setBusy("")}}}>Uitschrijven</button></article>})}</section></main>;
}