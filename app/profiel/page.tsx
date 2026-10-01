"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { getUserProfile } from "../../lib/services/users";
import { getActiveMembership } from "../../lib/services/memberships";
import MemberQrCode from "../../components/MemberQrCode";
import type { FermiUser, Membership } from "../../lib/models/backend";
import {
  Bell,
  CalendarDays,
  ChevronRight,
  GraduationCap,
  Home,
  MapPin,
  Pencil,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
  UserCog,
} from "lucide-react";

const menuItems = [
  {
    title: "Mijn activiteiten",
    subtitle: "Bekijk en beheer je aanmeldingen",
    icon: CalendarDays,
    href: "/agenda",
  },
  {
    title: "Mijn commissies",
    subtitle: "Overzicht van je commissies",
    icon: UsersRound,
    href: "/fermi",
  },
  {
    title: "Notificaties",
    subtitle: "Beheer je meldingen en voorkeuren",
    icon: Bell,
    href: "#",
  },
  {
    title: "Privacy",
    subtitle: "Jouw gegevens en privacy instellingen",
    icon: ShieldCheck,
    href: "#",
  },
  {
    title: "Instellingen",
    subtitle: "App instellingen en voorkeuren",
    icon: Settings,
    href: "#",
  },
];

function FermiMark() {
  return (
    <img
      className="fermi-logo-image profile-fermi-mark"
      src="/Fermi-PWA/images/branding/fermi-logo.png"
      alt="SV Fermi"
    />
  );
}

export default function ProfilePage() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [fermiUser, setFermiUser] = useState<FermiUser | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      try {
        const [profile, activeMembership] = await Promise.all([
          getUserProfile(user.uid),
          getActiveMembership(user.uid),
        ]);
        setFermiUser(profile);
        setMembership(activeMembership);
        setIsAdmin(profile?.status === "active" && profile.role === "admin");
      } catch {
        setIsAdmin(false);
      }
    });
  }, []);

  const memberName = [fermiUser?.profile.firstName, fermiUser?.profile.prefix, fermiUser?.profile.lastName].filter(Boolean).join(" ") || "Fermi-lid";
  const roleLabel = fermiUser?.role === "admin" ? "Admin" : fermiUser?.role === "board" ? "Bestuur" : fermiUser?.role === "committee" ? "Commissie" : "Lid";
  const validUntil = membership?.endDate ? new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${membership.endDate}T12:00:00`)) : "Niet bekend";

  const visibleMenuItems = isAdmin
    ? [
        ...menuItems,
        {
          title: "Leden admin",
          subtitle: "Leden aanmelden, afmelden en beheren",
          icon: UserCog,
          href: "/profiel/leden-admin",
        },
      ]
    : menuItems;

  return (
    <main className="app-shell profile-page-shell">
      <div className="noise" aria-hidden="true" />

      <section className="profile-hero">
        <header className="topbar">
          <div className="brand">
            <FermiMark />
            <span>SV Fermi</span>
          </div>

          <button className="icon-button notification-button" aria-label="Meldingen">
            <Bell size={22} strokeWidth={2.1} />
            <span className="notification-dot" />
          </button>
        </header>

        <div className="profile-title-row">
          <h1>Profiel</h1>
          <div className="profile-title-art" aria-hidden="true">
            <span className="profile-orange-disc" />
            <span className="profile-building" />
            <span className="profile-dots" />
          </div>
        </div>

        <div className="profile-member-summary">
          <div className="profile-avatar-wrap">
            <img
              src="/Fermi-PWA/images/community/member-lars.svg"
              alt="Profielfoto"
              className="profile-avatar"
            />
          </div>

          <div className="profile-member-copy">
            <h2>{memberName}</h2>
            <p>{roleLabel} <span>•</span> {membership?.status === "active" ? "Actief lid" : "Geen actief lidmaatschap"}</p>
            <p><GraduationCap size={17} /> {fermiUser?.profile.study || "Opleiding niet ingevuld"}</p>
            <p><MapPin size={17} /> Haarlem</p>
          </div>

          <button className="profile-edit-button">
            Profiel bewerken <Pencil size={16} />
          </button>
        </div>
      </section>

      <section className="profile-content">
        <section className="member-card">
          <div className="member-card-paper" />
          <div className="member-card-left">
            <h2>Digitale ledenpas</h2>
            <div className="member-card-brand">
              <FermiMark />
              <div>
                <strong>SV Fermi</strong>
                <span>Lidmaatschap {membership?.academicYear || "—"}</span>
              </div>
            </div>

            <div className="member-card-name">{memberName}</div>
            <div className="member-card-meta">Lidnummer: {membership?.memberNumber || "—"}</div>
            <div className="member-card-meta">Geldig t/m {validUntil}</div>
          </div>

          <div className="member-card-right">
            <MemberQrCode cardId={membership?.digitalCard?.cardId} enabled={Boolean(membership?.digitalCard?.enabled)} size={96} />
            <small>Toon bij activiteitscheck-in<br />en kortingen</small>
          </div>
        </section>

        <section className="profile-stats">
          <div>
            <CalendarDays size={29} />
            <span>
              <strong>18</strong>
              <small>Activiteiten<br />dit jaar</small>
            </span>
          </div>
          <div>
            <UserRound size={29} />
            <span>
              <strong>Sep 2024</strong>
              <small>Lid sinds</small>
            </span>
          </div>
          <div>
            <UsersRound size={29} />
            <span>
              <strong>2</strong>
              <small>Commissies<br />actief</small>
            </span>
          </div>
        </section>

        <section className="profile-menu-section">
          <h2>Mijn Fermi</h2>

          <div className="profile-menu-list">
            {visibleMenuItems.map(({ title, subtitle, icon: Icon, href }) => (
              <Link className="profile-menu-row" href={href} key={title}>
                <span className="profile-menu-icon"><Icon size={23} /></span>
                <span className="profile-menu-copy">
                  <strong>{title}</strong>
                  <small>{subtitle}</small>
                </span>
                <ChevronRight size={22} />
              </Link>
            ))}
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
            <img src="/Fermi-PWA/images/branding/fermi-logo.png" alt="" />
          </span>
          <span>Fermi</span>
        </Link>
        <Link className="nav-item" href="/community">
          <UsersRound size={25} />
          <span>Community</span>
        </Link>
        <Link className="nav-item active" href="/profiel">
          <UserRound size={24} fill="currentColor" />
          <span>Profiel</span>
          <i />
        </Link>
      </nav>
    </main>
  );
}
