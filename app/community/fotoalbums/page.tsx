"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Bell,
  CalendarDays,
  Camera,
  ChevronRight,
  Home,
  Image as ImageIcon,
  LockKeyhole,
  Search,
  UserRound,
  UsersRound,
} from "lucide-react";
import { photoAlbums } from "@/data/photo-albums";
import { useFermiSession } from "@/components/SessionProvider";

const albumFilters = ["Alles", "Borrel", "Reis", "Activiteit", "Commissie"];

export default function PhotoAlbumsPage() {
  const [activeFilter, setActiveFilter] = useState("Alles");
  const [query, setQuery] = useState("");
  const { fermiUser, membership } = useFermiSession();
  const membershipStatus = membership?.status ?? fermiUser?.membership?.status;
  const isMembershipPending = membershipStatus === "pending" || fermiUser?.status === "pending";

  const visibleAlbums = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return photoAlbums.filter((album) => {
      const matchesFilter = activeFilter === "Alles" || album.category === activeFilter;
      const matchesQuery =
        !normalized ||
        [album.title, album.date, album.year, album.category, album.description]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  return (
    <main className="app-shell community-page-shell">
      <div className="noise" aria-hidden="true" />

      <section className="community-hero photoalbums-hero">
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

        <div className="community-title-row photoalbums-title-row">
          <div className="community-title-copy">
            <h1>Community</h1>
            <p>Herbeleef de mooiste Fermi-momenten</p>
          </div>

          <div className="photoalbums-title-art" aria-hidden="true">
            <span className="photoalbums-polaroid photoalbums-polaroid-a" />
            <span className="photoalbums-polaroid photoalbums-polaroid-b" />
            <span className="photoalbums-orange-tape" />
            <Camera className="photoalbums-camera-icon" size={38} />
          </div>
        </div>

        <nav className="community-tabs" aria-label="Community onderdelen">
          <Link className="community-tab" href="/community">
            <UsersRound size={17} />
            Leden
          </Link>
          <Link className="community-tab active" href="/community/fotoalbums">
            <ImageIcon size={17} />
            Fotoalbums
          </Link>
        </nav>

        {!isMembershipPending && <label className="community-search photoalbums-search">
          <Search size={22} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek een fotoalbum..."
            aria-label="Zoek fotoalbums"
          />
        </label>}

        {!isMembershipPending && <div className="community-filters" aria-label="Filter fotoalbums">
          {albumFilters.map((filter) => (
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

      <section className="photoalbums-content">
        {isMembershipPending ? (
          <div className="community-membership-lock photoalbums-membership-lock" role="status">
            <span><LockKeyhole size={30} /></span>
            <strong>Fotoalbums openen na goedkeuring</strong>
            <p>Foto’s en albums zijn alleen zichtbaar voor actieve Fermi-leden. Na goedkeuring wordt deze pagina automatisch vrijgegeven.</p>
          </div>
        ) : (<>
        <div className="photoalbums-heading">
          <div>
            <span className="community-label">FOTOALBUMS</span>
            <h2>Herinneringen van Fermi</h2>
          </div>
          <span>{visibleAlbums.length} albums</span>
        </div>

        <div className="photoalbum-grid">
          {visibleAlbums.map((album, index) => (
            <article className={`photoalbum-card photoalbum-${album.art}`} key={album.slug}>
              <div className="photoalbum-card-art">
                <span className="photoalbum-count">
                  <Camera size={15} />
                  {album.photoCount}
                </span>
                <span className="photoalbum-index">{String(index + 1).padStart(2, "0")}</span>
              </div>

              <div className="photoalbum-card-copy">
                <span className="photoalbum-category">{album.category}</span>
                <h3>{album.title}</h3>
                <p>{album.date}</p>
                <small>{album.description}</small>
                <span className="photoalbum-open">
                  Bekijk album <ChevronRight size={17} />
                </span>
              </div>
            </article>
          ))}
        </div>

        {visibleAlbums.length === 0 && (
          <div className="community-empty-state">
            <ImageIcon size={29} />
            <strong>Geen albums gevonden</strong>
            <span>Probeer een andere zoekterm of filter.</span>
          </div>
        )}
        </>)}
      </section>

      <nav className="bottom-nav" aria-label="Hoofdnavigatie">
        <Link className="nav-item" href="/"><Home size={23} /><span>Home</span></Link>
        <Link className="nav-item" href="/agenda"><CalendarDays size={23} /><span>Agenda</span></Link>
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
        <Link className="nav-item" href="/profiel"><UserRound size={24} /><span>Profiel</span></Link>
      </nav>
    </main>
  );
}
