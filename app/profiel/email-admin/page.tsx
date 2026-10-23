"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, Mail, FileText, ShieldAlert } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/services/users";

export default function EmailAdminPage() {
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
      <Link href="/profiel/admin" className="association-admin-back"><ArrowLeft size={19}/> Terug naar Admin CRM</Link>
      <h1><Mail size={28}/> E-mailcampagnes</h1>
      <p>Beheer uitnodigingen en e-mails voor leden van S.V. Fermi.</p>
      {authorized === null ? <p>Toegang controleren…</p> : !authorized ?
        <p role="alert"><ShieldAlert size={18}/> Je hebt geen toegang tot deze beheerpagina.</p> :
        <div className="admin-crm-module-grid">
          <div className="admin-crm-module" style={{cursor:"default"}}>
            <span className="admin-crm-module-icon"><FileText size={24}/></span>
            <span className="admin-crm-module-copy">
              <strong>Uitnodiging Fermi WebApp</strong>
              <small>HTML-template beschikbaar · Verzenden nog niet ingesteld</small>
            </span>
          </div>
          <p>De uitnodigingsmail staat in <code>emails/templates/fermi-webapp-uitnodiging.html</code>. In een volgende stap koppelen we EmailJS en voegen we een veilige test- en verzendfunctie toe. Er worden nu geen e-mails verzonden.</p>
        </div>}
    </div>
  </main>;
}
