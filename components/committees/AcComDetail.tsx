"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bell, CalendarDays, ChevronRight, Clock3, Home, Images, Info, MapPin, Send, UserRound, UsersRound, CheckCircle2 } from "lucide-react";
import CommitteeSignup from "@/components/committees/CommitteeSignup";
import type { Committee } from "@/data/committees";

type Tab = "overview" | "members" | "activities" | "gallery";

export default function AcComDetail({ committee }: { committee: Committee }) {
  const [tab, setTab] = useState<Tab>("overview");
  const tabs: { id: Tab; label: string; icon?: typeof UsersRound }[] = [
    { id: "overview", label: "Overzicht" },
    { id: "members", label: "Leden", icon: UsersRound },
    { id: "activities", label: "Activiteiten", icon: CalendarDays },
    { id: "gallery", label: "Galerij", icon: Images },
  ];
  return (
    <main className="app-shell committee-detail-shell accom-redesign">
      <div className="noise" aria-hidden="true" />
      <section className="committee-detail-hero accom-hero">
        <header className="committee-detail-topbar">
          <Link className="event-back-button" href="/fermi" aria-label="Terug naar Fermi"><ArrowLeft size={22}/></Link>
          <div className="brand committee-detail-brand"><img className="fermi-logo-image" src="/Fermi-PWA/images/branding/fermi-logo.png" alt=""/><span>SV Fermi</span></div>
          <Link className="icon-button notification-button" href="/meldingen" aria-label="Meldingen"><Bell size={21}/></Link>
        </header>
        <div className="accom-hero-title"><span className="committee-detail-kicker">SOCIAAL</span><h1>AcCom</h1><p>Activiteitencommissie</p></div>
        {/* Illustration assets will be connected here after they are added to main. */}
        <img className="accom-hero-art" src="/Fermi-PWA/images/committees/accom/accom-header.png" alt="" aria-hidden="true" />
      </section>
      <nav className="accom-tabs" aria-label="Commissie onderdelen">
        {tabs.map(({ id, label, icon: Icon }) => <button key={id} type="button" className={tab === id ? "selected" : ""} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{Icon && <Icon size={17}/>}<span>{label}</span></button>)}
      </nav>
      <div className="accom-content">
        {tab === "overview" && <>
          <section className="accom-intro"><div className="accom-intro-icon"><UsersRound size={27}/></div><div><span className="committee-label">OVER DE COMMISSIE</span><h2>{committee.fullName}</h2><p>{committee.intro}</p></div></section>
          <div className="accom-join"><CommitteeSignup committeeName={committee.name}/><button className="accom-info-button" onClick={() => document.getElementById("accom-about")?.scrollIntoView({ behavior: "smooth" })}><Info size={18}/> Meer info <ChevronRight size={17}/></button></div>
          <section className="accom-section" id="accom-about"><div className="accom-section-heading"><h2>Wat doet AcCom?</h2><button onClick={() => setTab("activities")}>Bekijk activiteiten <ChevronRight size={17}/></button></div><div className="accom-task-grid">{committee.activities.map((activity, index) => <article key={activity} className="accom-task"><span className="accom-task-symbol">{["✦","●","⌖","✳"][index % 4]}</span><p>{activity}</p></article>)}</div></section>
          <section className="accom-section"><div className="accom-section-heading"><h2>Aankomende activiteiten</h2><Link href="/agenda">Bekijk agenda <ChevronRight size={17}/></Link></div><p className="accom-muted">Bekijk de actuele activiteiten en inschrijvingen in de agenda.</p><Link className="accom-agenda-link" href="/agenda"><CalendarDays size={18}/> Naar de agenda <ChevronRight size={18}/></Link></section>
        </>}
        {tab === "members" && <section className="accom-section"><h2>Leden van AcCom</h2><p className="accom-muted">De commissieleden worden hier getoond zodra hun profielgegevens beschikbaar zijn.</p></section>}
        {tab === "activities" && <section className="accom-section"><h2>Activiteiten van AcCom</h2><div className="accom-task-grid">{committee.activities.map(item => <article className="accom-task" key={item}><CheckCircle2 size={24}/><p>{item}</p></article>)}</div><Link className="accom-agenda-link" href="/agenda">Bekijk de agenda <ChevronRight size={18}/></Link></section>}
        {tab === "gallery" && <section className="accom-section"><h2>AcCom galerij</h2><p className="accom-muted">Hier komen de fotoalbums van AcCom zodra deze zijn toegevoegd.</p></section>}
      </div>
      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item" href="/"><Home size={23}/><span>Home</span></Link><Link className="nav-item" href="/agenda"><CalendarDays size={23}/><span>Agenda</span></Link>
        <Link className="nav-item center-item active" href="/fermi"><span className="nav-fermi"><img src="/Fermi-PWA/images/branding/fermi-logo.png" alt=""/></span><span>Fermi</span><i/></Link>
        <Link className="nav-item" href="/community"><UsersRound size={25}/><span>Community</span></Link><Link className="nav-item" href="/profiel"><UserRound size={24}/><span>Profiel</span></Link>
      </nav>
      <style jsx>{`
        .accom-redesign :global(.notification-button){color:#f8ead7;text-decoration:none}.accom-redesign :global(.notification-button svg){stroke:currentColor}.accom-redesign{background:#001e30;color:#f8ead7;min-height:100vh;padding-bottom:105px}
        .accom-hero{height:auto;min-height:330px;position:relative;overflow:hidden;background:radial-gradient(circle at 85% 65%,#12384a 0%,transparent 50%),#001b2d;padding:max(22px,env(safe-area-inset-top)) 16px 12px}
        .accom-hero-title{position:relative;padding-top:43px;min-height:235px;z-index:2}.accom-hero-title h1{font:800 clamp(58px,15vw,76px)/.9 Georgia,serif;margin:8px 0 0;color:#fff1de}.accom-hero-title p{font-size:20px;margin:0;color:#e5e9ed}.accom-hero-title :global(.committee-detail-kicker){color:#ff7927;font-weight:800;letter-spacing:1px}
        .accom-hero-art{position:absolute;right:-16px;bottom:0;width:min(68%,290px);height:235px;object-fit:contain;object-position:right bottom;pointer-events:none;z-index:1}.accom-hero-title{z-index:2}
        .accom-tabs{display:flex;gap:9px;padding:12px 20px;overflow-x:auto;scrollbar-width:none}.accom-tabs button{border:1px solid #36596a;background:transparent;color:#d3dce4;border-radius:30px;padding:12px 15px;display:flex;align-items:center;gap:8px;white-space:nowrap;cursor:pointer;font:inherit;font-size:14px}.accom-tabs button.selected{background:#ff7927;color:#071c29;border-color:#ff7927;font-weight:700}
        .accom-content{padding:0 20px}.accom-intro{border:1px solid #3c6071;border-radius:20px;padding:22px 17px;display:flex;gap:15px;min-height:195px;background:linear-gradient(125deg,#092d40,#032136)}.accom-intro-icon{width:55px;height:55px;border-radius:50%;background:#ff7927;color:#071b29;display:grid;place-items:center;flex-shrink:0}.accom-intro h2{font:700 clamp(22px,5vw,30px) Georgia,serif;margin:5px 0 10px}.accom-intro p{color:#bccbd5;line-height:1.55;margin:0}.accom-intro :global(.committee-label){color:#ff7927;font-size:12px;font-weight:800}
        .accom-join{display:flex;gap:10px;margin:12px 0 24px;align-items:flex-start}.accom-join :global(.committee-signup-wrap){flex:1;min-width:0}.accom-join :global(.committee-signup-button){background:#ff7927;color:#061c2b;border-radius:16px;width:100%;min-height:54px;font-weight:750}.accom-join :global(small){display:block;color:#94a9b7;margin-top:8px}.accom-info-button{border:1px solid #42677a;background:transparent;color:#f3f6f8;border-radius:16px;min-height:54px;padding:0 12px;display:flex;gap:7px;align-items:center;cursor:pointer}
        .accom-section{margin:26px 0}.accom-section-heading{display:flex;justify-content:space-between;align-items:baseline;gap:10px}.accom-section h2{font:700 clamp(25px,6vw,35px) Georgia,serif;margin:0 0 14px}.accom-section-heading a,.accom-section-heading button{color:#ff883a;background:none;border:0;font:inherit;font-size:13px;display:flex;align-items:center;gap:4px;white-space:nowrap;cursor:pointer}.accom-task-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}.accom-task{border:1px solid #365a6d;border-radius:17px;padding:14px 7px;text-align:center;min-width:0;display:flex;flex-direction:column;align-items:center;gap:10px}.accom-task p{font-size:12px;line-height:1.35;margin:0}.accom-task-symbol{font-size:34px;color:#ff7927}.accom-muted{color:#b6c5d1;line-height:1.6}.accom-agenda-link{display:flex;align-items:center;gap:10px;color:#ff883a;margin-top:15px}
        @media(max-width:390px){.accom-tabs{padding-left:12px;gap:6px}.accom-tabs button{padding:10px 11px;font-size:12px}.accom-content{padding:0 14px}.accom-task p{font-size:11px}.accom-task{padding:12px 5px}.accom-info-button{font-size:12px}}
      `}</style>
    </main>
  );
}
