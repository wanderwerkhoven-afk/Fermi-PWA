"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Search,
  ShieldAlert,
  X,
} from "lucide-react";
import { auth } from "../../../lib/firebase";
import { getUserProfile } from "../../../lib/services/users";
import {
  listActivities,
  saveActivity,
  seedActivitiesIfMissing,
  type ActivityData,
} from "../../../lib/services/activities";

const emptyActivity: ActivityData = {
  slug: "",
  day: "",
  month: "JAN",
  year: new Date().getFullYear().toString(),
  dateLabel: "",
  type: "ACTIVITEIT",
  title: "",
  time: "",
  location: "",
  address: "",
  art: "meeting",
  organizer: "S.V. Fermi",
  price: "Gratis",
  capacity: 0,
  registered: 0,
  registrationDeadline: "",
  description: "",
  practical: [],
  showInAgenda: true,
};

export default function ActiviteitenAdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [selected, setSelected] = useState<ActivityData | null>(null);
  const [edit, setEdit] = useState<ActivityData>(emptyActivity);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function refresh() {
    setActivities(await listActivities());
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthorized(false);
        return;
      }
      try {
        const profile = await getUserProfile(user.uid);
        const allowed = profile?.status === "active" && profile.role === "admin";
        setAuthorized(allowed);
        if (allowed) {
          await seedActivitiesIfMissing();
          await refresh();
        }
      } catch (error) {
        console.error(error);
        setAuthorized(false);
      }
    });
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return activities;
    return activities.filter((activity) =>
      [activity.title, activity.type, activity.location, activity.organizer]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [activities, query]);

  function openActivity(activity: ActivityData) {
    setSelected(activity);
    setEdit({ ...activity, practical: [...(activity.practical || [])] });
    setNotice("");
  }

  async function save() {
    setBusy(true);
    setNotice("");
    try {
      await saveActivity(edit);
      await refresh();
      setSelected(null);
      setNotice(`${edit.title} is opgeslagen in Firebase.`);
    } catch (error) {
      console.error(error);
      setNotice("Activiteit opslaan is niet gelukt.");
    } finally {
      setBusy(false);
    }
  }

  if (authorized === null) {
    return <main className="member-admin-gate">Activiteitenadministratie laden…</main>;
  }

  if (!authorized) {
    return (
      <main className="member-admin-gate">
        <ShieldAlert size={42} />
        <h1>Geen admin-toegang</h1>
        <p>Deze pagina is alleen beschikbaar voor actieve Fermi-admins.</p>
        <Link href="/profiel">Terug naar profiel</Link>
      </main>
    );
  }

  return (
    <main className="app-shell member-admin-shell">
      <header className="member-admin-header">
        <Link className="member-admin-back" href="/profiel" aria-label="Terug naar profiel">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <small>ADMINISTRATIE</small>
          <h1>Activiteiten admin</h1>
          <p>Activiteitsgegevens beheren vanuit Firebase.</p>
        </div>
        <span className="member-admin-header-icon"><CalendarDays size={26} /></span>
      </header>

      <section className="member-admin-content">
        {notice && <div className="member-admin-notice" role="status">{notice}</div>}

        <div className="member-admin-search">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek activiteit, locatie of organisator"
            aria-label="Activiteiten zoeken"
          />
        </div>

        <section className="member-admin-list">
          {filtered.map((activity) => (
            <button
              className="member-admin-row member-admin-row-button"
              type="button"
              key={activity.slug}
              onClick={() => openActivity(activity)}
            >
              <div className="member-admin-avatar">{activity.day || "?"}</div>
              <div className="member-admin-person">
                <strong>{activity.title}</strong>
                <span>{activity.dateLabel || `${activity.day} ${activity.month} ${activity.year}`}</span>
                <small>{activity.location} · {activity.organizer}</small>
              </div>
              <div className="member-admin-row-meta">
                <span>{activity.type}</span>
                <span>{activity.showInAgenda === false ? "Verborgen" : "Zichtbaar"}</span>
              </div>
              <ChevronRight className="member-admin-row-chevron" size={19} />
            </button>
          ))}
        </section>
      </section>

      {selected && (
        <div className="member-admin-modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <section className="member-admin-modal" role="dialog" aria-modal="true" aria-label="Activiteit bewerken" onClick={(event) => event.stopPropagation()}>
            <header className="member-admin-modal-header">
              <div className="member-admin-modal-avatar">{edit.day || "?"}</div>
              <div>
                <small>ACTIVITEIT</small>
                <h2>{edit.title}</h2>
                <p>{edit.slug}</p>
              </div>
              <button type="button" aria-label="Sluiten" onClick={() => setSelected(null)}><X size={20} /></button>
            </header>

            <div className="member-admin-modal-body">
              <section className="member-admin-modal-section">
                <h3>Basisgegevens</h3>
                <label>Titel<input value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} /></label>
                <div className="member-admin-modal-grid two">
                  <label>Type<input value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value.toUpperCase() })} /></label>
                  <label>Organisator<input value={edit.organizer} onChange={(e) => setEdit({ ...edit, organizer: e.target.value })} /></label>
                </div>
              </section>

              <section className="member-admin-modal-section">
                <h3>Datum & tijd</h3>
                <label>Datumtekst<input value={edit.dateLabel} onChange={(e) => setEdit({ ...edit, dateLabel: e.target.value })} /></label>
                <div className="member-admin-modal-grid two">
                  <label>Dag<input value={edit.day} onChange={(e) => setEdit({ ...edit, day: e.target.value })} /></label>
                  <label>Maand
                    <select value={edit.month} onChange={(e) => setEdit({ ...edit, month: e.target.value })}>
                      {["JAN","FEB","MAR","APR","MEI","JUN","JUL","AUG","SEP","OKT","NOV","DEC"].map((month) => <option key={month}>{month}</option>)}
                    </select>
                  </label>
                  <label>Jaar<input value={edit.year} onChange={(e) => setEdit({ ...edit, year: e.target.value })} /></label>
                  <label>Tijd<input value={edit.time} onChange={(e) => setEdit({ ...edit, time: e.target.value })} /></label>
                </div>
              </section>

              <section className="member-admin-modal-section">
                <h3>Locatie</h3>
                <label>Locatie<input value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })} /></label>
                <label>Adres<input value={edit.address} onChange={(e) => setEdit({ ...edit, address: e.target.value })} /></label>
              </section>

              <section className="member-admin-modal-section">
                <h3>Inschrijving</h3>
                <div className="member-admin-modal-grid two">
                  <label>Prijs<input value={edit.price} onChange={(e) => setEdit({ ...edit, price: e.target.value })} /></label>
                  <label>Deadline<input value={edit.registrationDeadline} onChange={(e) => setEdit({ ...edit, registrationDeadline: e.target.value })} /></label>
                  <label>Capaciteit<input type="number" min="0" value={edit.capacity} onChange={(e) => setEdit({ ...edit, capacity: Number(e.target.value) })} /></label>
                  <label>Aangemeld<input type="number" min="0" value={edit.registered} onChange={(e) => setEdit({ ...edit, registered: Number(e.target.value) })} /></label>
                </div>
              </section>

              <section className="member-admin-modal-section">
                <h3>Inhoud</h3>
                <label>Beschrijving<textarea rows={5} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} /></label>
                <label>Praktisch — één punt per regel
                  <textarea
                    rows={4}
                    value={(edit.practical || []).join("\n")}
                    onChange={(e) => setEdit({ ...edit, practical: e.target.value.split("\n").filter(Boolean) })}
                  />
                </label>
                <label>
                  <span>In agenda tonen</span>
                  <select value={edit.showInAgenda === false ? "false" : "true"} onChange={(e) => setEdit({ ...edit, showInAgenda: e.target.value === "true" })}>
                    <option value="true">Ja</option>
                    <option value="false">Nee</option>
                  </select>
                </label>
                <label>
                  <span>Uitgelicht</span>
                  <select value={edit.featured ? "true" : "false"} onChange={(e) => setEdit({ ...edit, featured: e.target.value === "true" })}>
                    <option value="false">Nee</option>
                    <option value="true">Ja</option>
                  </select>
                </label>
              </section>

              <button className="member-admin-save" type="button" onClick={save} disabled={busy}>
                <CheckCircle2 size={18} /> {busy ? "Opslaan…" : "Wijzigingen opslaan"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
