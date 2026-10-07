"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  Home,
  Image as ImageIcon,
  LockKeyhole,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import type { CommunityDirectoryMember } from "@/lib/services/community";
import { useAppData } from "@/components/AppDataProvider";
import { useFermiSession } from "@/components/SessionProvider";

const filters = ["Alle leden", "Bestuur", "Commissies", "Jaar 1", "Jaar 2+"];

function memberCategories(member: CommunityDirectoryMember) {
  const categories = ["Alle leden"];
  if (member.role === "board") categories.push("Bestuur");
  if (member.role === "committee") categories.push("Commissies");
  if (member.studyYear === 1) categories.push("Jaar 1");
  if ((member.studyYear ?? 0) >= 2) categories.push("Jaar 2+");
  return categories;
}

function memberBadge(member: CommunityDirectoryMember) {
  if (member.role === "board") return { label: "Bestuur", tone: "orange" as const };
  if (member.role === "committee") return { label: "Commissie", tone: "navy" as const };
  if (member.role === "admin") return { label: "Admin", tone: "navy" as const };
  if (member.studyYear) return { label: `Jaar ${member.studyYear}`, tone: "soft" as const };
  return { label: "Lid", tone: "soft" as const };
}

function memberSubtitle(member: CommunityDirectoryMember) {
  const study = member.study || "S.V. Fermi";
  const year = member.studyYear ? `Jaar ${member.studyYear}` : member.startYear ? `Lid sinds ${member.startYear}` : "Actief lid";
  return { study, year };
}

export default function CommunityPage() {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Alle leden");
  const { fermiUser, membership } = useFermiSession();
  const membershipStatus = fermiUser?.membership?.status ?? membership?.status;
  const isMembershipPending = membershipStatus === "pending" || fermiUser?.status === "pending";
  const {
    communityMembers: members,
    communityLoading: loadingMembers,
    communityError: memberLoadError,
  } = useAppData();



  const visibleMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return members.filter((member) => {
      const badge = memberBadge(member);
      const subtitle = memberSubtitle(member);
      const matchesFilter = memberCategories(member).includes(activeFilter);
      const haystack = [
        member.firstName,
        member.lastName,
        subtitle.study,
        subtitle.year,
        badge.label,
      ]
        .join(" ")
        .toLowerCase();
      const matchesQuery = !normalized || haystack.includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [members, query, activeFilter]);

  return (
    <main className="app-shell community-page-shell">
      <div className="noise" aria-hidden="true" />

      <section className="community-hero">
        <header className="topbar">
          <div className="brand">
            <img
              className="fermi-logo-image"
              src="/Fermi-PWA/images/branding/fermi-logo.png"
              alt="SV Fermi"
            />
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

        <nav className="community-tabs" aria-label="Community onderdelen">
          <Link className="community-tab active" href="/community">
            <UsersRound size={17} />
            Leden
          </Link>
          <Link className="community-tab" href="/community/fotoalbums">
            <ImageIcon size={17} />
            Fotoalbums
          </Link>
        </nav>

        {!isMembershipPending && <label className="community-search">
          <Search size={22} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op naam, commissie of jaar..."
            aria-label="Zoek leden"
          />
        </label>}

        {!isMembershipPending && <div className="community-filters" aria-label="Filter leden">
          {filters.map((filter) => (
            <button
              key={filter}
              className={activeFilter === filter ? "active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter}
            </button>
          ))}
        </div>}
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
          {isMembershipPending ? (
            <div className="community-membership-lock" role="status">
              <span><LockKeyhole size={30} /></span>
              <strong>Community opent na goedkeuring</strong>
              <p>De ledenlijst bevat privégegevens van Fermi-leden. Zodra je lidmaatschap is goedgekeurd, krijg je hier automatisch toegang.</p>
            </div>
          ) : (<>
          <div className="community-members-heading">
            <h2>Leden van Fermi</h2>
            <span>{loadingMembers ? "Laden…" : `${members.length} leden`}</span>
          </div>

          <div className="community-member-list">
            {visibleMembers.map((member) => {
              const badge = memberBadge(member);
              const subtitle = memberSubtitle(member);
              const name = [member.firstName, member.lastName].filter(Boolean).join(" ") || "Fermi-lid";
              const initials = [member.firstName, member.lastName]
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase())
                .join("")
                .slice(0, 2) || "F";

              return (
                <article className="community-member-row community-member-row-live" key={member.id}>
                  {member.photoUrl ? (
                    <img src={member.photoUrl} alt={`Profielfoto van ${name}`} />
                  ) : (
                    <span className="community-member-avatar" aria-hidden="true">{initials}</span>
                  )}
                  <span className="community-member-copy">
                    <strong>{name}</strong>
                    <small>{subtitle.study}</small>
                    <small>{subtitle.year}</small>
                  </span>
                  <span className={`community-member-badge ${badge.tone}`}>
                    {badge.label}
                  </span>
                </article>
              );
            })}

            {!loadingMembers && memberLoadError && (
              <div className="community-empty-state">
                <UsersRound size={28} />
                <strong>Ledenlijst niet beschikbaar</strong>
                <span>{memberLoadError}</span>
              </div>
            )}

            {!loadingMembers && !memberLoadError && visibleMembers.length === 0 && (
              <div className="community-empty-state">
                <Search size={28} />
                <strong>Geen leden gevonden</strong>
                <span>Probeer een andere zoekterm of filter.</span>
              </div>
            )}
          </div>
          </>)}
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
            <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="" />
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
