"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, CalendarCog, ChevronRight, Megaphone, ShieldCheck, UserCog, UsersRound } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/services/users";

const modules = [
  { title: "Leden", description: "Leden, betaalstatus en lidmaatschappen beheren", href: "/profiel/leden-admin", icon: UserCog },
  { title: "Activiteiten", description: "Activiteiten, inschrijvingen en agenda beheren", href: "/profiel/activiteiten-admin", icon: CalendarCog },
  { title: "Mededelingen", description: "Mededelingen publiceren en aanpassen", href: "/profiel/mededelingen-admin", icon: Megaphone },
  { title: "Vereniging", description: "Vier bestuursleden en commissies beheren", href: "/profiel/vereniging-admin", icon: UsersRound },
];

export default function AdminOverviewPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) { setAuthorized(false); return; }
    try {
      const profile = await getUserProfile(user.uid);
      setAuthorized(profile?.status === "active" && profile.role === "admin");
    } catch { setAuthorized(false); }
  }), []);

  return <main className="app-shell association-admin-shell">
    <div className="association-admin-panel">
      <Link href="/profiel" className="association-admin-back"><ArrowLeft size={19}/> Terug naar profiel</Link>
      <h1><ShieldCheck size={28}/> Admin CRM</h1>
      <p>Beheer alle onderdelen van S.V. Fermi vanuit één overzicht.</p>
      {authorized === null ? <p>Toegang controleren…</p> : !authorized ?
        <p role="alert">Je hebt geen toegang tot deze beheerpagina.</p> :
        <div className="admin-crm-module-grid">
          {modules.map(({ title, description, href, icon: Icon }) => (
            <Link className="admin-crm-module" href={href} key={href}>
              <span className="admin-crm-module-icon"><Icon size={24}/></span>
              <span className="admin-crm-module-copy"><strong>{title}</strong><small>{description}</small></span>
              <ChevronRight size={20}/>
            </Link>
          ))}
        </div>}
    </div>
  </main>;
}
