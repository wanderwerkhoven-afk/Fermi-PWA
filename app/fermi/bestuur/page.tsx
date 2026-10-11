"use client";

import Link from "next/link";
import { useState } from "react";
import { useAssociationContent } from "@/lib/services/association";
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Coins,
  Home,
  UserRound,
  UsersRound,
  Mail,
  RotateCcw,
} from "lucide-react";

export default function BoardPage() {
  const { content: association } = useAssociationContent();
  const [flipped, setFlipped] = useState<string[]>([]);
  const toggleCard = (id: string) => setFlipped((current) => current.includes(id) ? current.filter((value) => value !== id) : [...current, id]);
  return (
    <main className="app-shell board-page-shell">
      <div className="noise" aria-hidden="true" />

      <section className="board-page-hero">
        <header className="board-page-topbar">
          <Link className="event-back-button" href="/fermi" aria-label="Terug naar Fermi">
            <ArrowLeft size={22} />
          </Link>
          <div className="brand board-page-brand">
            <img
              className="fermi-logo-image"
              src="/Fermi-PWA/images/branding/fermi-logo.png"
              alt="SV Fermi"
            />
            <span>SV Fermi</span>
          </div>
          <button className="icon-button notification-button" aria-label="Meldingen">
            <Bell size={21} />
            <span className="notification-dot" />
          </button>
        </header>

        <div className="board-page-title">
          <span className="board-page-kicker">DE VERENIGING</span>
          <h1>Het bestuur</h1>
          <p>Maak kennis met de mensen achter S.V. Fermi.</p>
          <span className="board-title-dots" />
        </div>
      </section>

      <section className="board-page-content">
        <div className="board-full-grid board-flip-grid">
          {association.board.map(({ id, name, role, description, email }, index) => {
            const Icon = [UserRound, UserRound, Coins, UsersRound][index] || UserRound;
            const isFlipped = flipped.includes(id);
            return (
              <article className={`board-flip-card ${isFlipped ? "is-flipped" : ""}`} key={id}>
                <div className="board-flip-inner">
                  <button type="button" className="board-flip-face board-flip-front"
                    aria-label={`Bekijk informatie over ${name}`}
                    aria-pressed={isFlipped} onClick={() => toggleCard(id)}>
                    <div className={`board-flip-illustration board-flip-illustration-${index + 1}`} aria-hidden="true" />
                    <span className="board-flip-front-copy">
                      <span className="board-flip-role-icon"><Icon size={20}/></span>
                      <strong>{role}</strong>
                      <span>{name}</span>
                    </span>
                  </button>
                  <div className="board-flip-face board-flip-back" aria-hidden={!isFlipped}>
                    <button type="button" className="board-flip-reset"
                      tabIndex={isFlipped ? 0 : -1} aria-label={`Draai kaart van ${name} terug`}
                      onClick={() => toggleCard(id)}><RotateCcw size={18}/></button>
                    <h2>{name}</h2>
                    <span className="board-flip-back-role">{role}</span>
                    <p>{description}</p>
                    {email ? <a href={`mailto:${email}`} tabIndex={isFlipped ? 0 : -1} className="board-flip-email"><Mail size={16}/>{email}</a>
                      : <span className="board-flip-no-email">E-mailadres nog niet ingevuld</span>}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="board-source-note">
          <strong>Bestuur S.V. Fermi</strong>
          <p>De rollen en bestuursinformatie worden onderhouden vanuit de verenigingsinformatie.</p>
        </div>
      </section>

      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item" href="/"><Home size={23} /><span>Home</span></Link>
        <Link className="nav-item" href="/agenda"><CalendarDays size={23} /><span>Agenda</span></Link>
        <Link className="nav-item center-item active" href="/fermi">
          <span className="nav-fermi">
            <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="" />
          </span>
          <span>Fermi</span><i />
        </Link>
        <Link className="nav-item" href="/community"><UsersRound size={25} /><span>Community</span></Link>
        <Link className="nav-item" href="/profiel"><UserRound size={24} /><span>Profiel</span></Link>
      </nav>
    </main>
  );
}
