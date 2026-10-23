"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, Mail, FileText, ShieldAlert, Eye, X } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/services/users";

const templates = [
  { id: "fermi-webapp-uitnodiging", title: "Uitnodiging Fermi WebApp", description: "Introductie van de nieuwe ledenapp", file: "fermi-webapp-uitnodiging.html" },
  { id: "fermi-happy-birthday", title: "Happy birthday", description: "Persoonlijke verjaardagsmail voor leden", file: "fermi-happy-birthday.html" },
];

export default function EmailAdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => onAuthStateChanged(auth, async (user) => {
    if (!user) { setAuthorized(false); return; }
    try {
      const profile = await getUserProfile(user.uid);
      setAuthorized(profile?.status === "active" && profile.role === "admin");
    } catch { setAuthorized(false); }
  }), []);

  useEffect(() => {
    if (!preview || !authorized) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    setPreviewHtml("");
    const selected = templates.find((template) => template.id === preview);
    if (!selected) { setLoading(false); return; }
    fetch(`${window.location.pathname.split("/profiel/")[0]}/email/templates/${selected.file}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("De HTML-preview kon niet worden geladen.");
        return response.text();
      })
      .then((html) => {
        if (cancelled) return;
        // Example data only: never expose member data in the preview.
        setPreviewHtml(html.replaceAll("{{FIRST_NAME}}", "Fermion").replaceAll("{first-name}", "Fermion").replaceAll("{{APP_URL}}", "#"));
      })
      .catch(() => { if (!cancelled) setError("De preview kon niet worden geladen. Probeer de pagina opnieuw te openen."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [preview, authorized]);

  const selected = templates.find((template) => template.id === preview);
  return <main className="app-shell association-admin-shell">
    <div className="association-admin-panel">
      <Link href="/profiel/admin" className="association-admin-back"><ArrowLeft size={19}/> Terug naar Admin CRM</Link>
      <h1><Mail size={28}/> E-mailcampagnes</h1>
      <p>Bekijk de HTML-mails voor leden van S.V. Fermi. Verzenden is nog niet ingeschakeld.</p>
      {authorized === null ? <p>Toegang controleren…</p> : !authorized ?
        <p role="alert"><ShieldAlert size={18}/> Je hebt geen toegang tot deze beheerpagina.</p> :
        <>
          <div className="admin-crm-module-grid">
            {templates.map((template) => <button type="button" key={template.id}
              className="admin-crm-module" onClick={() => setPreview(template.id)}
              style={{width:"100%",textAlign:"left",font:"inherit",cursor:"pointer"}}>
              <span className="admin-crm-module-icon"><FileText size={24}/></span>
              <span className="admin-crm-module-copy"><strong>{template.title}</strong><small>{template.description}</small></span>
              <Eye size={21} aria-label="Bekijken"/>
            </button>)}
          </div>
          {selected && <section aria-label={`Preview ${selected.title}`} style={{marginTop:24}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,marginBottom:12}}>
              <h2 style={{margin:0,fontSize:"1.35rem"}}>{selected.title}</h2>
              <button type="button" onClick={() => setPreview(null)} aria-label="Sluit preview" style={{display:"flex",alignItems:"center",gap:6,padding:"9px 12px",borderRadius:12,border:"1px solid #517183",background:"#10384b",color:"#f4eadc",cursor:"pointer"}}><X size={18}/> Sluiten</button>
            </div>
            <p style={{marginBottom:12}}>Voorbeeldweergave met testnaam. Er wordt niets verzonden.</p>
            {loading ? <p>Preview laden…</p> : error ? <p role="alert">{error}</p> :
              <iframe title={`E-mailpreview: ${selected.title}`} srcDoc={previewHtml}
                sandbox="" style={{display:"block",width:"100%",height:"740px",border:"1px solid #517183",borderRadius:16,background:"#f8f0e8"}}/>}
          </section>}
        </>}
    </div>
  </main>;
}
