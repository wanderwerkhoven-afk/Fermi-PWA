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
  if (["board", "chair", "vice_chair", "secretary", "treasurer", "general_board"].includes(member.role)) categories.push("Bestuur");
  if (["committee", "accom", "educom", "webcom", "acquisitiecom", "sturecom"].includes(member.role)) categories.push("Commissies");
  if (member.studyYear === 1) categories.push("Jaar 1");
  if ((member.studyYear ?? 0) >= 2) categories.push("Jaar 2+");
  return categories;
}

function memberBadge(member: CommunityDirectoryMember) {
  if (["board", "chair", "vice_chair", "secretary", "treasurer", "general_board"].includes(member.role)) return { label: "Bestuur", tone: "orange" as const };
  if (["committee", "accom", "educom", "webcom", "acquisitiecom", "sturecom"].includes(member.role)) return { label: "Commissie", tone: "navy" as const };

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
  const [selectedMember, setSelectedMember] = useState<CommunityDirectoryMember | null>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<{ src: string; name: string } | null>(null);
  const { fermiUser, membership } = useFermiSession();
  const membershipStatus = membership?.status ?? fermiUser?.membership?.status;
  const isMembershipPending = membershipStatus === "pending";
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

        <nav className="community-tabs" data-tour="community-tabs" aria-label="Community onderdelen">
          <Link className="community-tab active" href="/community">
            <UsersRound size={17} />
            Leden
          </Link>
          <Link className="community-tab" href="/community/fotoalbums">
            <ImageIcon size={17} />
            Fotoalbums
          </Link>
        </nav>

        {!isMembershipPending && <label className="community-search" data-tour="community-search">
          <Search size={22} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op naam, commissie of jaar..."
            aria-label="Zoek leden"
          />
        </label>}

        {!isMembershipPending && <div className="community-filters" data-tour="community-filters" aria-label="Filter leden">
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
        <Link className="community-join-card" data-tour="community-active" href="/fermi">
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

        <section className="community-members-section" data-tour="community-members">
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
              const photoUrl = member.id === fermiUser?.uid ? (fermiUser?.profile.photoUrl || member.photoUrl) : member.photoUrl;
              const badge = memberBadge(member);
              const subtitle = memberSubtitle(member);
              const name = [member.firstName, member.lastName].filter(Boolean).join(" ") || "Fermi-lid";
              const initials = [member.firstName, member.lastName]
                .filter(Boolean)
                .map((part) => part.charAt(0).toUpperCase())
                .join("")
                .slice(0, 2) || "F";

              return (
                <button type="button" className="community-member-row community-member-row-live community-member-open" key={member.id} onClick={() => setSelectedMember(member)} aria-label={`Bekijk profiel van ${name}`}>
                  {photoUrl ? (
                    <img src={photoUrl} alt={`Profielfoto van ${name}`} />
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
                </button>
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

      {selectedMember && !isMembershipPending && (
        <div className="member-preview-backdrop" role="presentation" onClick={() => setSelectedMember(null)}>
          <section className="member-preview-panel" role="dialog" aria-modal="true" aria-label={`Profiel van ${selectedMember.firstName} ${selectedMember.lastName}`} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="member-preview-close" onClick={() => setSelectedMember(null)} aria-label="Sluit ledenprofiel">×</button>
            <div className="member-preview-top">
              {(selectedMember.id === fermiUser?.uid ? (fermiUser?.profile.photoUrl || selectedMember.photoUrl) : selectedMember.photoUrl) ? (
                <button type="button" className="member-preview-photo-button" aria-label={`Bekijk profielfoto van ${selectedMember.firstName} op volledig scherm`} onClick={() => setExpandedPhoto({ src: (selectedMember.id === fermiUser?.uid ? (fermiUser?.profile.photoUrl || selectedMember.photoUrl) : selectedMember.photoUrl)!, name: `${selectedMember.firstName} ${selectedMember.lastName}` })}>
                  <img className="member-preview-photo" src={(selectedMember.id === fermiUser?.uid ? (fermiUser?.profile.photoUrl || selectedMember.photoUrl) : selectedMember.photoUrl)!} alt={`Profielfoto van ${selectedMember.firstName}`} />
                </button>
              ) : <span className="member-preview-initials">{(selectedMember.firstName.charAt(0) + selectedMember.lastName.charAt(0)).toUpperCase()}</span>}
              <h2>{selectedMember.firstName} {selectedMember.lastName}</h2>
              <span className="member-preview-role">{memberBadge(selectedMember).label}</span>
            </div>
            <div className="member-preview-body">
              <h3>Over dit lid</h3>
              <div className="member-preview-details">
                <div><small>Studie</small><strong>{selectedMember.study || "Technische Natuurkunde"}</strong></div>
                <div><small>Studiejaar</small><strong>{selectedMember.studyYear ? `Jaar ${selectedMember.studyYear}` : "Niet ingevuld"}</strong></div>
                <div><small>Lid sinds</small><strong>{selectedMember.startYear || "Niet ingevuld"}</strong></div>
              </div>
              <h3>Bio</h3>
              <p className="member-preview-bio">{selectedMember.bio?.trim() || "Dit lid heeft nog geen bio toegevoegd."}</p>
            </div>
          </section>
        </div>
      )}
      {expandedPhoto && (
        <div className="member-photo-fullscreen" role="presentation" onClick={() => setExpandedPhoto(null)}>
          <section className="member-photo-fullscreen-content" role="dialog" aria-modal="true" aria-label={`Profielfoto van ${expandedPhoto.name}`} onClick={(event) => event.stopPropagation()}>
            <button type="button" className="member-photo-fullscreen-close" aria-label="Sluit grote profielfoto" onClick={() => setExpandedPhoto(null)}>×</button>
            <img src={expandedPhoto.src} alt={`Profielfoto van ${expandedPhoto.name}`} />
          </section>
        </div>
      )}
      <style jsx>{`
        .member-preview-photo-button{display:block;border:0;background:transparent;padding:0;margin:0 auto 14px;border-radius:50%;cursor:zoom-in}
        .member-preview-photo-button:focus-visible{outline:3px solid #ff7a1a;outline-offset:4px}
        .member-preview-photo-button .member-preview-photo{margin:0}
        .member-photo-fullscreen{position:fixed;inset:0;z-index:1500;background:rgba(0,14,24,.97);display:flex;align-items:center;justify-content:center;padding:20px}
        .member-photo-fullscreen-content{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center}
        .member-photo-fullscreen-content img{display:block;width:100vw;max-width:100vw;height:auto;max-height:calc(100dvh - 100px);object-fit:contain;border-radius:0}
        .member-photo-fullscreen-close{position:absolute;top:max(12px,env(safe-area-inset-top));right:4px;z-index:1;width:48px;height:48px;border:0;border-radius:50%;background:#ffffff25;color:white;font-size:32px;cursor:pointer}
        .community-member-open{width:100%;text-align:left;cursor:pointer;font:inherit;border:0}
        .community-member-open:focus-visible{outline:3px solid #ff7a1a;outline-offset:2px}
        .member-preview-backdrop{position:fixed;inset:0;z-index:1200;background:rgba(3,29,44,.7);display:flex;align-items:flex-end;justify-content:center}
        .member-preview-panel{position:relative;background:#f7efe2;color:#092d40;width:min(100%,540px);max-height:88dvh;overflow:auto;border-radius:28px 28px 0 0;padding:24px 24px max(32px,env(safe-area-inset-bottom));box-shadow:0 -12px 60px #0004}
        .member-preview-close{position:absolute;right:20px;top:16px;border:0;border-radius:50%;background:#e6d9c7;color:#092d40;width:38px;height:38px;font-size:27px;cursor:pointer}
        .member-preview-top{text-align:center;padding:18px 0 26px;border-bottom:1px solid #dacdb9}
        .member-preview-photo,.member-preview-initials{width:112px;height:112px;border-radius:50%;object-fit:cover;display:grid;place-items:center;margin:0 auto 14px;background:#092d40;color:#fff;font-size:38px;font-weight:800;border:5px solid #fff}
        .member-preview-top h2{font-family:Georgia,serif;font-size:28px;margin:0 0 12px}
        .member-preview-role{display:inline-block;background:#ff7a1a;color:#fff;border-radius:30px;padding:6px 14px;font-weight:800;font-size:13px}
        .member-preview-body h3{font-family:Georgia,serif;font-size:20px;margin:24px 0 12px}
        .member-preview-details{display:grid;gap:10px}
        .member-preview-details>div{background:#fffaf2;border-radius:14px;padding:12px 16px;display:flex;flex-direction:column;gap:4px}
        .member-preview-details small{color:#6a7780;font-size:12px}.member-preview-details strong{font-size:15px}
        .member-preview-bio{line-height:1.65;white-space:pre-wrap;color:#45535d;margin:0}
        @media(min-width:700px){.member-preview-backdrop{align-items:center}.member-preview-panel{border-radius:28px;max-height:85dvh}}
      `}</style>
      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item" href="/" data-tour="nav-home">
          <Home size={23} />
          <span>Home</span>
        </Link>
        <Link className="nav-item" href="/agenda" data-tour="nav-agenda">
          <CalendarDays size={23} />
          <span>Agenda</span>
        </Link>
        <Link className="nav-item center-item" href="/fermi" data-tour="nav-fermi">
          <span className="nav-fermi">
            <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="" />
          </span>
          <span>Fermi</span>
        </Link>
        <Link className="nav-item active" href="/community" data-tour="nav-community">
          <UsersRound size={25} />
          <span>Community</span>
          <i />
        </Link>
        <Link className="nav-item" href="/profiel" data-tour="nav-profile">
          <UserRound size={24} />
          <span>Profiel</span>
        </Link>
      </nav>
    </main>
  );
}
