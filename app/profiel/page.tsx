"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { updateOwnUserProfile } from "../../lib/services/users";
import { removeOwnProfilePhoto, uploadOwnProfilePhoto } from "../../lib/services/profilePhoto";
import MemberQrCode from "../../components/MemberQrCode";
import { useFermiSession } from "../../components/SessionProvider";
import { restartFermiTour } from "../../components/GuidedAppTour";
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
  CalendarCog,
  Megaphone,
  ScanLine,
  LogOut,
  Compass,
  Save,
  Trash2,
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
  const { fermiUser, membership } = useFermiSession();
  const isActive = fermiUser?.status === "active";
  const isAdmin = Boolean(isActive && fermiUser?.role === "admin");
  const canScan = Boolean(isActive && fermiUser && ["committee", "board", "admin"].includes(fermiUser.role));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileNotice, setProfileNotice] = useState("");
  useEffect(() => {
    if (!profileNotice) return;
    const timer = window.setTimeout(() => setProfileNotice(""), 4500);
    return () => window.clearTimeout(timer);
  }, [profileNotice]);

  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [cropUrl, setCropUrl] = useState("");
  useEffect(() => {
    return () => {
      if (cropUrl) URL.revokeObjectURL(cropUrl);
    };
  }, [cropUrl]);
  const [cropZoom, setCropZoom] = useState(1);
  const [cropOffset, setCropOffset] = useState({ x: 0, y: 0 });
  const [cropImageSize, setCropImageSize] = useState({ width: 1, height: 1 });
  const cropViewportRef = useRef<HTMLDivElement | null>(null);
  const cropDragRef = useRef<{ pointerId: number; x: number; y: number; startX: number; startY: number } | null>(null);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    prefix: "",
    lastName: "",
    pronouns: "",
    phone: "",
    city: "",
    study: "",
    studyYear: "" as string,
    bio: "",
  });



  const memberName = [fermiUser?.profile.firstName, fermiUser?.profile.prefix, fermiUser?.profile.lastName].filter(Boolean).join(" ") || "Fermi-lid";
  const roleLabel = fermiUser?.role === "admin" ? "Admin" : fermiUser?.role === "board" ? "Bestuur" : fermiUser?.role === "committee" ? "Commissie" : "Lid";
  const validUntil = membership?.endDate ? new Intl.DateTimeFormat("nl-NL", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${membership.endDate}T12:00:00`)) : "Niet bekend";

  function openProfileEditor() {
    if (!fermiUser) return;
    setProfileForm({
      firstName: fermiUser.profile.firstName || "",
      prefix: fermiUser.profile.prefix || "",
      lastName: fermiUser.profile.lastName || "",
      pronouns: fermiUser.profile.pronouns || "",
      phone: fermiUser.profile.phone || "",
      city: fermiUser.profile.city || "",
      study: fermiUser.profile.study || "",
      studyYear: fermiUser.profile.studyYear ? String(fermiUser.profile.studyYear) : "",
      bio: fermiUser.profile.bio || "",
    });
    setProfileNotice("");
    setEditOpen(true);
  }

  function closePhotoCropper() {
    if (cropUrl) URL.revokeObjectURL(cropUrl);
    setCropFile(null);
    setCropUrl("");
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setCropImageSize({ width: 1, height: 1 });
    cropDragRef.current = null;
  }

  function handleProfilePhoto(file: File | null) {
    if (!file || photoBusy) return;
    if (cropUrl) URL.revokeObjectURL(cropUrl);
    const url = URL.createObjectURL(file);
    setCropFile(file);
    setCropUrl(url);
    setCropZoom(1);
    setCropOffset({ x: 0, y: 0 });
    setProfileNotice("");
  }

  function cropBounds(zoom = cropZoom) {
    const viewport = cropViewportRef.current?.clientWidth || 280;
    const baseScale = Math.max(viewport / cropImageSize.width, viewport / cropImageSize.height);
    const drawWidth = cropImageSize.width * baseScale * zoom;
    const drawHeight = cropImageSize.height * baseScale * zoom;
    return {
      maxX: Math.max(0, (drawWidth - viewport) / 2),
      maxY: Math.max(0, (drawHeight - viewport) / 2),
    };
  }

  function clampCropOffset(x: number, y: number, zoom = cropZoom) {
    const { maxX, maxY } = cropBounds(zoom);
    return {
      x: Math.max(-maxX, Math.min(maxX, x)),
      y: Math.max(-maxY, Math.min(maxY, y)),
    };
  }

  function handleCropZoom(nextZoom: number) {
    const zoom = Math.max(1, Math.min(3, nextZoom));
    setCropZoom(zoom);
    setCropOffset((offset) => clampCropOffset(offset.x, offset.y, zoom));
  }

  function handleCropPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.setPointerCapture(event.pointerId);
    cropDragRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      startX: cropOffset.x,
      startY: cropOffset.y,
    };
  }

  function handleCropPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const drag = cropDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setCropOffset(clampCropOffset(
      drag.startX + event.clientX - drag.x,
      drag.startY + event.clientY - drag.y,
    ));
  }

  function handleCropPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (cropDragRef.current?.pointerId === event.pointerId) {
      cropDragRef.current = null;
    }
  }

  async function saveProfilePhotoCrop() {
    if (!fermiUser || !cropFile || photoBusy) return;
    setPhotoBusy(true);
    setProfileNotice("");
    try {
      const photoDataUrl = await uploadOwnProfilePhoto(fermiUser.uid, cropFile, {
        zoom: cropZoom,
        offsetX: cropOffset.x,
        offsetY: cropOffset.y,
        viewportSize: cropViewportRef.current?.clientWidth || 280,
      });
      setPhotoPreview(photoDataUrl);
      setProfileNotice("Profielfoto bijgewerkt.");
      closePhotoCropper();
    } catch (error) {
      console.error(error);
      setProfileNotice(error instanceof Error ? error.message : "Profielfoto uploaden is niet gelukt.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function removeProfilePhoto() {
    if (!fermiUser || photoBusy) return;
    setPhotoBusy(true);
    setProfileNotice("");
    try {
      await removeOwnProfilePhoto(fermiUser.uid);
      setPhotoPreview(null);
      setProfileNotice("Profielfoto verwijderd.");
    } catch (error) {
      console.error(error);
      setProfileNotice("Profielfoto verwijderen is niet gelukt.");
    } finally {
      setPhotoBusy(false);
    }
  }

  async function saveProfile() {
    if (!fermiUser || savingProfile) return;
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      setProfileNotice("Voornaam en achternaam zijn verplicht.");
      return;
    }

    setSavingProfile(true);
    setProfileNotice("");
    try {
      await updateOwnUserProfile(fermiUser.uid, fermiUser.profile, {
        firstName: profileForm.firstName,
        prefix: profileForm.prefix,
        lastName: profileForm.lastName,
        pronouns: profileForm.pronouns,
        phone: profileForm.phone,
        city: profileForm.city,
        study: profileForm.study,
        studyYear: profileForm.studyYear ? Number(profileForm.studyYear) : null,
        bio: profileForm.bio,
      });
      setEditOpen(false);
    } catch (error) {
      console.error(error);
      setProfileNotice("Profiel opslaan is niet gelukt.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut(auth);
      window.location.href = "/Fermi-PWA/";
    } finally {
      setSigningOut(false);
    }
  }

  const scannerItem = {
    title: "QR scanner",
    subtitle: "Controleer ledenpassen bij activiteiten",
    icon: ScanLine,
    href: "/profiel/qr-scanner",
  };

  const visibleMenuItems = [
    ...menuItems,
    ...(canScan ? [scannerItem] : []),
    ...(isAdmin ? [{
      title: "Admin CRM",
      subtitle: "Beheer leden, activiteiten en de vereniging",
      icon: ShieldCheck,
      href: "/profiel/admin",
    }] : []),
  ];

  return (
    <main className="app-shell profile-page-shell">
      <div className="noise" aria-hidden="true" />

      <section className="profile-hero">
        <header className="topbar">
          <div className="brand">
            <FermiMark />
            <span>SV Fermi</span>
          </div>

          <div className="profile-settings-wrap">
            <button
              className="icon-button profile-settings-button"
              data-tour="profile-settings"
              aria-label="Instellingen"
              aria-expanded={settingsOpen}
              onClick={() => setSettingsOpen((open) => !open)}
            >
              <Settings size={22} strokeWidth={2.1} />
            </button>

            {settingsOpen && (
              <div className="profile-settings-menu" role="menu">
                <div className="profile-settings-menu-head">
                  <Settings size={18} />
                  <span>Instellingen</span>
                </div>
                <button
                  type="button"
                  className="profile-settings-menu-item"
                  onClick={() => {
                    setSettingsOpen(false);
                    restartFermiTour();
                  }}
                  role="menuitem"
                >
                  <Compass size={18} />
                  <span>App-rondleiding opnieuw starten</span>
                </button>
                <button
                  type="button"
                  className="profile-settings-menu-item danger"
                  onClick={handleSignOut}
                  disabled={signingOut}
                  role="menuitem"
                >
                  <LogOut size={18} />
                  <span>{signingOut ? "Uitloggen…" : "Uitloggen"}</span>
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="profile-title-row">
          <h1>Profiel</h1>
          <div className="profile-title-art" aria-hidden="true">
            <span className="profile-orange-disc" />
            <span className="profile-building" />
            <span className="profile-dots" />
          </div>
        </div>

        <div className="profile-member-summary" data-tour="profile-summary">
          <div className="profile-avatar-wrap">
            {(photoPreview || fermiUser?.profile.photoUrl) ? (
              <img
                src={photoPreview || fermiUser?.profile.photoUrl || ""}
                alt={`Profielfoto van ${memberName}`}
                className="profile-avatar"
              />
            ) : (
              <div className="profile-avatar profile-avatar-fallback" aria-label="Geen profielfoto">
                <UserRound size={34} />
              </div>
            )}
          </div>

          <div className="profile-member-copy">
            <h2>{memberName}</h2>
            <p>{roleLabel} <span>•</span> {membership?.status === "active" ? "Actief lid" : "Geen actief lidmaatschap"}</p>
            <p><GraduationCap size={17} /> {fermiUser?.profile.study || "Opleiding niet ingevuld"}</p>
            <p><MapPin size={17} /> {fermiUser?.profile.city || "Woonplaats niet ingevuld"}</p>
          </div>

          <button className="profile-edit-button" data-tour="profile-edit" type="button" onClick={openProfileEditor}>
            Profiel bewerken <Pencil size={16} />
          </button>
        </div>
      </section>

      <section className="profile-content">
        <section className="member-card" data-tour="profile-member-card">
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

        <section className="profile-stats" data-tour="profile-stats">
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
          <h2 data-tour="profile-menu">Mijn Fermi</h2>

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

      {cropFile && cropUrl && (
        <div className="profile-crop-backdrop" role="presentation" onClick={() => !photoBusy && closePhotoCropper()}>
          <section className="profile-crop-modal" role="dialog" aria-modal="true" aria-label="Profielfoto bijsnijden" onClick={(event) => event.stopPropagation()}>
            <header>
              <div>
                <small>PROFIELFOTO</small>
                <h2>Kies je uitsnede</h2>
                <p>Sleep de foto en zoom totdat je profielfoto precies goed staat.</p>
              </div>
              <button type="button" aria-label="Sluiten" onClick={closePhotoCropper} disabled={photoBusy}>×</button>
            </header>

            <div
              className="profile-crop-stage"
              ref={cropViewportRef}
              onPointerDown={handleCropPointerDown}
              onPointerMove={handleCropPointerMove}
              onPointerUp={handleCropPointerUp}
              onPointerCancel={handleCropPointerUp}
            >
              <img
                src={cropUrl}
                alt=""
                draggable={false}
                onLoad={(event) => {
                  setCropImageSize({
                    width: event.currentTarget.naturalWidth,
                    height: event.currentTarget.naturalHeight,
                  });
                  setCropOffset({ x: 0, y: 0 });
                }}
                style={{
                  transform: `translate3d(calc(-50% + ${cropOffset.x}px), calc(-50% + ${cropOffset.y}px), 0) scale(${cropZoom})`,
                }}
              />
              <span className="profile-crop-circle" aria-hidden="true" />
            </div>

            <div className="profile-crop-zoom">
              <span>−</span>
              <input
                type="range"
                min="1"
                max="3"
                step="0.01"
                value={cropZoom}
                onChange={(event) => handleCropZoom(Number(event.target.value))}
                aria-label="Zoom profielfoto"
              />
              <span>+</span>
            </div>

            <footer>
              <button type="button" className="secondary" onClick={closePhotoCropper} disabled={photoBusy}>Annuleren</button>
              <button type="button" className="primary" onClick={() => void saveProfilePhotoCrop()} disabled={photoBusy}>
                <Save size={17} /> {photoBusy ? "Opslaan…" : "Gebruik foto"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {editOpen && fermiUser && (
        <div className="profile-edit-modal-backdrop" role="presentation" onClick={() => !savingProfile && setEditOpen(false)}>
          <section className="profile-edit-modal" role="dialog" aria-modal="true" aria-label="Profiel bewerken" onClick={(event) => event.stopPropagation()}>
            <header className="profile-edit-modal-header">
              <div>
                <small>MIJN PROFIEL</small>
                <h2>Profiel bewerken</h2>
                <p>Deze gegevens zijn zichtbaar in jouw Fermi-profiel.</p>
              </div>
              <button type="button" aria-label="Sluiten" onClick={() => setEditOpen(false)} disabled={savingProfile}>×</button>
            </header>

            <div className="profile-edit-modal-body">
              <section className="profile-photo-editor">
                <div className="profile-photo-editor-preview">
                  {photoPreview || fermiUser.profile.photoUrl ? (
                    <img src={photoPreview || fermiUser.profile.photoUrl || ""} alt="Voorbeeld profielfoto" />
                  ) : (
                    <UserRound size={36} />
                  )}
                </div>
                <div className="profile-photo-editor-copy">
                  <strong>Profielfoto</strong>
                  <span>Kies een foto en bepaal daarna zelf wat er binnen de ronde profielfoto zichtbaar is.</span>
                  <div className="profile-photo-editor-actions">
                    <label className={photoBusy ? "is-busy" : ""}>
                      <UserRound size={16} />
                      {photoBusy ? "Bezig…" : "Kies foto"}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={photoBusy}
                        onChange={(event) => {
                          const file = event.target.files?.[0] || null;
                          event.target.value = "";
                          void handleProfilePhoto(file);
                        }}
                      />
                    </label>
                    {(fermiUser.profile.photoUrl || photoPreview) && (
                      <button type="button" onClick={() => void removeProfilePhoto()} disabled={photoBusy}>
                        <Trash2 size={15} /> Verwijderen
                      </button>
                    )}
                  </div>
                </div>
              </section>
              <div className="profile-edit-grid two">
                <label>Voornaam<input value={profileForm.firstName} onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })} /></label>
                <label>Tussenvoegsel<input value={profileForm.prefix} onChange={(e) => setProfileForm({ ...profileForm, prefix: e.target.value })} /></label>
              </div>
              <label>Achternaam<input value={profileForm.lastName} onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })} /></label>
              <label>E-mailadres<input value={fermiUser.profile.email} disabled /><small>Je inlog-e-mailadres wijzig je niet vanuit je profiel.</small></label>

              <div className="profile-edit-grid two">
                <label>Telefoonnummer<input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} placeholder="06 12345678" /></label>
                <label>Woonplaats<input value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} placeholder="Bijv. Amsterdam" /></label>
              </div>

              <div className="profile-edit-grid two">
                <label>Opleiding<input value={profileForm.study} onChange={(e) => setProfileForm({ ...profileForm, study: e.target.value })} placeholder="Technische Natuurkunde" /></label>
                <label>Studiejaar<input type="number" min="1" max="10" value={profileForm.studyYear} onChange={(e) => setProfileForm({ ...profileForm, studyYear: e.target.value })} placeholder="1" /></label>
              </div>

              <label>Voornaamwoorden<input value={profileForm.pronouns} onChange={(e) => setProfileForm({ ...profileForm, pronouns: e.target.value })} placeholder="Bijv. hij/hem" /></label>
              <label>Bio<textarea value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} rows={4} placeholder="Vertel iets over jezelf…" /></label>

              {profileNotice && <div className="profile-photo-toast" role="status" aria-live="polite">
                <span>{profileNotice}</span>
                <button type="button" aria-label="Melding sluiten" onClick={() => setProfileNotice("")}>×</button>
              </div>}
            </div>

            <footer className="profile-edit-modal-footer">
              <button type="button" className="secondary" onClick={() => setEditOpen(false)} disabled={savingProfile}>Annuleren</button>
              <button type="button" className="primary" onClick={() => void saveProfile()} disabled={savingProfile}>
                <Save size={17} /> {savingProfile ? "Opslaan…" : "Opslaan"}
              </button>
            </footer>
          </section>
        </div>
      )}

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
        <Link className="nav-item" href="/community" data-tour="nav-community">
          <UsersRound size={25} />
          <span>Community</span>
        </Link>
        <Link className="nav-item active" href="/profiel" data-tour="nav-profile">
          <UserRound size={24} fill="currentColor" />
          <span>Profiel</span>
          <i />
        </Link>
      </nav>
    </main>
  );
}
