"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { ArrowLeft, Mail, FileText, ShieldAlert, Eye, X, Send } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getUserProfile } from "@/lib/services/users";
import { listActivities } from "@/lib/services/activities";
import { monthlyActivitiesEmail } from "@/lib/email/monthlyActivities";

const EMAILJS = {
  serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ?? "",
  templateId: process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID ?? "",
  publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ?? "",
};
const MONTH_NAMES = ["januari","februari","maart","april","mei","juni","juli","augustus","september","oktober","november","december"];

const templates = [
  { id: "fermi-herinschrijving", title: "Herinschrijving nieuw studiejaar", description: "Verleng je lidmaatschap, met sfeerbeelden van Fermi-activiteiten", file: "fermi-herinschrijving.html" },
  { id: "fermi-welkom", title: "Voor het eerst lid", description: "Persoonlijke welkomstmail voor leden die voor het eerst lid worden", file: "fermi-welkom.html" },
  { id: "fermi-welkom-terug", title: "Welkom terug bij Fermi", description: "Persoonlijke welkomstmail voor terugkerende leden", file: "fermi-welkom-terug.html" },
  { id: "monthly-activities", title: "Activiteiten van deze maand", description: "Automatisch gevuld met Firebase-activiteiten en GitHub-afbeeldingen", file: "" },
  { id: "fermi-webapp-uitnodiging", title: "Uitnodiging Fermi WebApp", description: "Introductie van de nieuwe ledenapp", file: "fermi-webapp-uitnodiging.html" },
  { id: "fermi-happy-birthday", title: "Happy birthday", description: "Persoonlijke verjaardagsmail voor leden", file: "fermi-happy-birthday.html" },
];

export default function EmailAdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [previewHtml, setPreviewHtml] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [month, setMonth] = useState(() => new Date().getMonth());
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [testEmail, setTestEmail] = useState("");
  const [testName, setTestName] = useState("Fermion");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState("");
  const [sendError, setSendError] = useState("");
  const [confirmed, setConfirmed] = useState(false);

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
    if (preview === "monthly-activities") {
      listActivities().then(events => {
        if (!cancelled) setPreviewHtml(monthlyActivitiesEmail(events, year, month));
      }).catch(() => { if (!cancelled) setError("Activiteiten laden vanuit Firebase is mislukt."); })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }
    fetch(`${window.location.pathname.split("/profiel/")[0]}/email/templates/${selected.file}`)
      .then(async (response) => {
        if (!response.ok) throw new Error("De HTML-preview kon niet worden geladen.");
        return response.text();
      })
      .then((html) => {
        if (cancelled) return;
        // Example data only: never expose member data in the preview.
        setPreviewHtml(html.replaceAll("{{FIRST_NAME}}", "Fermion").replaceAll("{first-name}", "Fermion").replaceAll("{{APP_URL}}", "https://wanderwerkhoven-afk.github.io/Fermi-PWA/"));
      })
      .catch(() => { if (!cancelled) setError("De preview kon niet worden geladen. Probeer de pagina opnieuw te openen."); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [preview, authorized, month, year]);

  const selected = templates.find((template) => template.id === preview);
  const sendTestEmail = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authorized || !auth.currentUser || !selected || loading || !previewHtml || sending || !confirmed) return;
    if (!EMAILJS.serviceId || !EMAILJS.templateId || !EMAILJS.publicKey) { setSendError("EmailJS is niet geconfigureerd. Controleer de GitHub Actions Secrets en voer een nieuwe build uit."); return; }
    const recipient = testEmail.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) { setSendError("Vul een geldig e-mailadres in."); return; }
    const name = testName.trim() || "Fermion";
    const safeName = name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    const html = previewHtml.replaceAll("Fermion", safeName).replaceAll("{{FIRST_NAME}}", safeName).replaceAll("{first-name}", safeName);
    const subject = preview === "monthly-activities" ? `S.V. Fermi | Activiteiten ${MONTH_NAMES[month]} ${year}` : preview === "fermi-happy-birthday" ? `Happy birthday ${name}! | S.V. Fermi` : preview === "fermi-welkom" ? `Welkom bij S.V. Fermi, ${name}!` : preview === "fermi-welkom-terug" ? `Welkom terug bij S.V. Fermi, ${name}!` : preview === "fermi-herinschrijving" ? `${name}, blijf jij bij S.V. Fermi?` : "Ontdek de nieuwe S.V. Fermi WebApp!";
    setSending(true); setSendError(""); setSendResult("");
    try {
      // This is deliberately single-recipient test sending only. Never send to Firebase member lists from the browser.
      const response = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service_id: EMAILJS.serviceId, template_id: EMAILJS.templateId, user_id: EMAILJS.publicKey,
          template_params: { to_email: recipient, title: subject, message_html: html, email: recipient } }),
      });
      if (!response.ok) throw new Error((await response.text()).slice(0, 350) || `EmailJS fout ${response.status}`);
      setSendResult(`E-mail aangevraagd bij EmailJS voor ${recipient}. Controleer je inbox en spammap.`);
      setConfirmed(false);
    } catch (error) { setSendError(error instanceof Error ? error.message : "De e-mail kon niet worden verzonden."); }
    finally { setSending(false); }
  };
  return <main className="app-shell association-admin-shell">
    <div className="association-admin-panel">
      <Link href="/profiel/admin" className="association-admin-back"><ArrowLeft size={19}/> Terug naar Admin CRM</Link>
      <h1><Mail size={28}/> E-mailcampagnes</h1>
      <p>Bekijk Fermi-mails en verstuur een e-mail naar één zelfgekozen e-mailadres. Bulkverzending is uitgeschakeld.</p>
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
            {preview === "monthly-activities" && <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:16}}>
              <label>Maand <select value={month} onChange={e => setMonth(Number(e.target.value))} style={{marginLeft:8,padding:9,borderRadius:8}}>{["Januari","Februari","Maart","April","Mei","Juni","Juli","Augustus","September","Oktober","November","December"].map((name,index) => <option key={name} value={index}>{name}</option>)}</select></label>
              <label>Jaar <select value={year} onChange={e => setYear(Number(e.target.value))} style={{marginLeft:8,padding:9,borderRadius:8}}>{Array.from({length:7},(_,i)=>new Date().getFullYear()-2+i).map(value=><option key={value} value={value}>{value}</option>)}</select></label>
            </div>}
            <p style={{marginBottom:12}}>Preview van de HTML-mail. Versturen kan via het onderstaande formulier.</p>
            {loading ? <p>Preview laden…</p> : error ? <p role="alert">{error}</p> :
              <iframe title={`E-mailpreview: ${selected.title}`} srcDoc={previewHtml}
                sandbox="" style={{display:"block",width:"100%",height:"740px",border:"1px solid #517183",borderRadius:16,background:"#f8f0e8"}}/>}
            <form onSubmit={sendTestEmail} style={{marginTop:22,padding:20,border:"1px solid #517183",borderRadius:16,display:"grid",gap:14}}>
              <h3 style={{margin:0}}>E-mail versturen</h3>
              <p style={{margin:0}}>Er wordt maximaal één e-mail verstuurd naar het adres hieronder. Geen ledenlijst of bulkverzending.</p>
              <label style={{display:"grid",gap:6}}>Ontvanger (e-mailadres)
                <input type="email" required autoComplete="email" value={testEmail} onChange={e => {setTestEmail(e.target.value);setSendResult("");}} placeholder="jij@voorbeeld.nl" style={{padding:12,borderRadius:10,border:"1px solid #517183"}}/>
              </label>
              <label style={{display:"grid",gap:6}}>Voornaam voor de voorbeeldmail
                <input value={testName} maxLength={80} onChange={e=>setTestName(e.target.value)} style={{padding:12,borderRadius:10,border:"1px solid #517183"}}/>
              </label>
              <label style={{display:"flex",gap:9,alignItems:"start"}}><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/> Ik bevestig dat ik deze e-mail naar dit adres wil versturen.</label>
              <button type="submit" disabled={!EMAILJS.serviceId || !EMAILJS.templateId || !EMAILJS.publicKey || !confirmed || !testEmail.trim() || !previewHtml || loading || sending || !!error} style={{display:"inline-flex",alignItems:"center",justifyContent:"center",gap:8,padding:"13px 18px",border:0,borderRadius:12,background:"#ff792b",color:"#06283b",fontWeight:700,cursor:"pointer",opacity:(!confirmed||sending||loading||!previewHtml)?0.6:1}}><Send size={18}/>{sending ? "Versturen…" : "Verstuur e-mail"}</button>
              {(!EMAILJS.serviceId || !EMAILJS.templateId || !EMAILJS.publicKey) && <p role="alert">EmailJS-configuratie ontbreekt in deze build. Controleer GitHub Actions Secrets.</p>}
              {sendError && <p role="alert" style={{color:"#c33",margin:0}}>{sendError}</p>}
              {sendResult && <p role="status" style={{margin:0}}>{sendResult}</p>}
            </form>
          </section>}
        </>}
    </div>
  </main>;
}
