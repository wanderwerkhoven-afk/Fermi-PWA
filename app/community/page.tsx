"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Home,
  Menu,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import { communityMembers } from "@/data/community-members";

const filters = ["Alle leden", "Bestuur", "Commissies", "Jaar 1", "Jaar 2+"];

export default function CommunityPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Alle leden");

  const visibleMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return communityMembers.filter((member) => {
      const matchesFilter = member.categories.includes(activeFilter);
      const haystack = [member.name, member.line1, member.line2, member.badge]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalized || haystack.includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [query, activeFilter]);

  return (
    <main className="app-shell community-page-shell">
      <div className="noise" aria-hidden="true" />

      <section className="community-hero">
        <header className="topbar">
          <div className="brand">
            <div className="fermi-mark" aria-hidden="true">
              <span className="fermi-mark-line line-one" />
              <span className="fermi-mark-line line-two" />
              <span className="fermi-mark-circle">Fermi</span>
            </div>
            <span>SV Fermi</span>
          </div>

          <button className="icon-button notification-button" aria-label="Meldingen">
            <Bell size={22} strokeWidth={2.1} />
            <span className="notification-dot" />
          </button>
        </header>

        <div className="community-title-row">
          <div className="community-title-copy">
            <h1>Community</h1>
            <p>Ontdek de leden van Fermi</p>
          </div>

          <div className="community-hero-collage" aria-hidden="true">
            <span className="community-orange-blob" />
            <span className="community-hero-photo" />
            <span className="community-paper-plane">➤</span>
            <span className="community-route" />
            <span className="community-dots" />
          </div>
        </div>

        <label className="community-search">
          <Search size={22} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op naam, commissie of jaar..."
            aria-label="Zoek leden"
          />
        </label>

        <div className="community-filters" aria-label="Filter leden">
          {filters.map((filter) => (
            <button
              key={filter}
              className={activeFilter === filter ? "active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>
      </section>

      <section className="community-content">
        <Link className="community-join-card" href="/fermi">
          <div className="community-join-copy">
            <div className="community-cutout-title">
              <span>Word</span>
              <span>ACTiEF!</span>
            </div>
            <p>Doe mee met een commissie<br />en maak het verschil bij Fermi!</p>
            <span className="community-join-button">
              Bekijk commissies <ChevronRight size={20} />
            </span>
          </div>

          <div className="community-join-art" aria-hidden="true">
            <span className="community-join-photo" />
            <span className="community-join-logo">
              <span className="fermi-mark">
                <span className="fermi-mark-line line-one" />
                <span className="fermi-mark-line line-two" />
                <span className="fermi-mark-circle">Fermi</span>
              </span>
            </span>
            <span className="community-join-dots" />
          </div>
        </Link>

        <section className="community-members-section">
          <div className="community-members-heading">
            <h2>Leden van Fermi</h2>
            <span>128 leden</span>
          </div>

          <div className="community-member-list">
            {visibleMembers.map((member) => (
              <button className="community-member-row" key={member.id}>
                <img src={member.image} alt="" />
                <span className="community-member-copy">
                  <strong>{member.name}</strong>
                  <small>{member.line1}</small>
                  <small>{member.line2}</small>
                </span>
                <span className={`community-member-badge ${member.badgeTone}`}>
                  {member.badge}
                </span>
                <ChevronRight size={22} />
              </button>
            ))}

            {visibleMembers.length === 0 && (
              <div className="community-empty-state">
                <Search size={28} />
                <strong>Geen leden gevonden</strong>
                <span>Probeer een andere zoekterm of filter.</span>
              </div>
            )}
          </div>
        </section>
      </section>

      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item" href="/">
          <Home size={23} />
          <span>Home</span>
        </Link>
        <Link className="nav-item" href="/agenda">
          <CalendarDays size={23} />
          <span>Agenda</span>
        </Link>
        <Link className="nav-item center-item" href="/fermi">
          <span className="nav-fermi">
            <Menu size={14} />
            <span>Fermi</span>
          </span>
          <span>Fermi</span>
        </Link>
        <Link className="nav-item active" href="/community">
          <UsersRound size={25} />
          <span>Community</span>
          <i />
        </Link>
        <Link className="nav-item" href="/profiel">
          <UserRound size={24} />
          <span>Profiel</span>
        </Link>
      </nav>
    </main>
  );
}
