"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  Eye,
  EyeOff,
  MapPin,
  Pencil,
  Plus,
  Save,
  Search,
  ShieldAlert,
  UsersRound,
  X,
} from "lucide-react";
import { auth } from "../../../lib/firebase";
import { getUserProfile } from "../../../lib/services/users";
import { listActivities, saveActivity, type ActivityData } from "../../../lib/services/activities";
import { agendaContainerImages, agendaDetailImages } from "../../../data/agenda-images.generated";
import type { AgendaEvent } from "../../../data/agenda-events";

const monthShort = ["JAN","FEB","MAR","APR","MEI","JUN","JUL","AUG","SEP","OKT","NOV","DEC"];
const activityTypes = ["ACTIVITEIT","BORREL","CURSUS","LEZING","COMMISSIE","STUDIEREIS","VERGADERING"];
const organizers = ["S.V. Fermi","AcCom","EduCom","Bestuur S.V. Fermi"];
const capacityPresets = [20, 30, 40, 50, 60, 80];

type FormState = {
  slug: string;
  title: string;
  type: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  address: string;
  organizer: string;
  price: string;
  capacity: string;
  registrationDeadline: string;
  description: string;
  practicalText: string;
  imagePath: string;
  detailImagePath: string;
  showInAgenda: boolean;
};

const emptyForm: FormState = {
  slug: "",
  title: "",
  type: "ACTIVITEIT",
  date: "",
  startTime: "19:00",
  endTime: "22:00",
  location: "",
  address: "",
  organizer: "S.V. Fermi",
  price: "Gratis",
  capacity: "40",
  registrationDeadline: "",
  description: "",
  practicalText: "",
  imagePath: "",
  detailImagePath: "",
  showInAgenda: true,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function eventDate(event: AgendaEvent) {
  const monthIndex = monthShort.indexOf(event.month);
  if (monthIndex < 0) return new Date(0);
  return new Date(Number(event.year), monthIndex, Number(event.day), 12);
}

function normalizeLegacyActivityImagePath(path: string) {
  if (!path) return "";
  if (path.includes("/container-images/") || path.includes("/detail-images/")) return path;
  if (path.startsWith("/images/agenda/activities/")) {
    return path.replace("/images/agenda/activities/", "/images/agenda/activities/container-images/");
  }
  return path;
}

function formFromActivity(event: ActivityData): FormState {
  const monthIndex = monthShort.indexOf(event.month);
  const date =
    monthIndex >= 0
      ? `${event.year}-${String(monthIndex + 1).padStart(2, "0")}-${String(Number(event.day)).padStart(2, "0")}`
      : "";
  const times = [...event.time.matchAll(/(\d{1,2}):(\d{2})/g)].map((match) => `${match[1].padStart(2, "0")}:${match[2]}`);

  return {
    slug: event.slug,
    title: event.title,
    type: event.type,
    date,
    startTime: times[0] || "19:00",
    endTime: times[1] || times[0] || "22:00",
    location: event.location,
    address: event.address,
    organizer: event.organizer,
    price: event.price,
    capacity: String(event.capacity ?? 0),
    registrationDeadline: event.registrationDeadline,
    description: event.description,
    practicalText: (event.practical || []).join("\n"),
    imagePath: normalizeLegacyActivityImagePath(
      event.imagePath || (event.backgroundPreset ? `/images/agenda/activities/container-images/${event.backgroundPreset}.png` : ""),
    ),
    detailImagePath: event.detailImagePath || "",
    showInAgenda: event.showInAgenda !== false,
  };
}

function activityFromForm(form: FormState, existing?: ActivityData): ActivityData {
  const date = new Date(`${form.date}T12:00:00`);
  const day = String(date.getDate()).padStart(2, "0");
  const month = monthShort[date.getMonth()];
  const year = String(date.getFullYear());
  const dateLabel = new Intl.DateTimeFormat("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return {
    ...(existing || {}),
    slug: form.slug || slugify(form.title),
    day,
    month,
    year,
    dateLabel,
    type: form.type.trim().toUpperCase() || "ACTIVITEIT",
    title: form.title.trim(),
    time: `${form.startTime} – ${form.endTime}`,
    location: form.location.trim() || "Locatie volgt",
    address: form.address.trim(),
    art: existing?.art || "meeting",
    imagePath: form.imagePath || undefined,
    detailImagePath: form.detailImagePath || undefined,
    organizer: form.organizer.trim() || "S.V. Fermi",
    price: form.price.trim() || "Gratis",
    capacity: Math.max(0, Number(form.capacity) || 0),
    registered: existing?.registered ?? 0,
    registrationDeadline: form.registrationDeadline.trim() || "Volgt",
    description: form.description.trim(),
    practical: form.practicalText.split("\n").map((item) => item.trim()).filter(Boolean),
    showInAgenda: form.showInAgenda,
  };
}

export default function ActiviteitenAdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"all" | "upcoming" | "past" | "hidden">("all");
  const [selected, setSelected] = useState<ActivityData | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [panelOpen, setPanelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function refresh() {
    const items = await listActivities();
    setActivities([...items].sort((a, b) => eventDate(a).getTime() - eventDate(b).getTime()));
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
        if (allowed) await refresh();
      } catch (error) {
        console.error(error);
        setAuthorized(false);
      }
    });
  }, []);

  const counts = useMemo(() => {
    const now = new Date();
    now.setHours(0,0,0,0);
    return {
      total: activities.length,
      upcoming: activities.filter((item) => eventDate(item) >= now && item.showInAgenda !== false).length,
      hidden: activities.filter((item) => item.showInAgenda === false).length,
      registrations: activities.reduce((sum, item) => sum + (Number(item.registered) || 0), 0),
    };
  }, [activities]);

  const visibleActivities = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const now = new Date();
    now.setHours(0,0,0,0);

    return activities.filter((item) => {
      const date = eventDate(item);
      const matchesMode =
        mode === "all"
        || (mode === "upcoming" && date >= now && item.showInAgenda !== false)
        || (mode === "past" && date < now)
        || (mode === "hidden" && item.showInAgenda === false);
      const matchesQuery =
        !needle
        || [item.title, item.type, item.location, item.organizer].join(" ").toLowerCase().includes(needle);
      return matchesMode && matchesQuery;
    });
  }, [activities, query, mode]);

  function openNew() {
    setSelected(null);
    setForm(emptyForm);
    setNotice("");
    setPanelOpen(true);
  }

  function openEdit(activity: ActivityData) {
    setSelected(activity);
    setForm(formFromActivity(activity));
    setNotice("");
    setPanelOpen(true);
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    if (!form.title.trim() || !form.date) {
      setNotice("Vul minimaal een titel en datum in.");
      return;
    }

    const generatedSlug = form.slug || slugify(form.title);
    if (!generatedSlug) {
      setNotice("De activiteit heeft een geldige titel nodig.");
      return;
    }

    if (!selected && activities.some((item) => item.slug === generatedSlug)) {
      setNotice("Er bestaat al een activiteit met deze titel. Pas de titel of slug aan.");
      return;
    }

    setBusy(true);
    setNotice("");
    try {
      const next = activityFromForm({ ...form, slug: generatedSlug }, selected || undefined);
      await saveActivity(next);
      await refresh();
      setPanelOpen(false);
      setNotice(`${next.title} is opgeslagen.`);
    } catch (error) {
      console.error(error);
      setNotice("Opslaan is niet gelukt.");
    } finally {
      setBusy(false);
    }
  }

  async function toggleVisibility(activity: ActivityData) {
    setBusy(true);
    try {
      await saveActivity({ ...activity, showInAgenda: activity.showInAgenda === false });
      await refresh();
      setNotice(
        activity.showInAgenda === false
          ? `${activity.title} staat weer in de agenda.`
          : `${activity.title} is verborgen uit de agenda.`,
      );
    } catch (error) {
      console.error(error);
      setNotice("Wijziging is niet gelukt.");
    } finally {
      setBusy(false);
    }
  }

  if (authorized === null) {
    return <main className="activity-admin-gate">Activiteiten CRM laden…</main>;
  }

  if (!authorized) {
    return (
      <main className="activity-admin-gate">
        <ShieldAlert size={42} />
        <h1>Geen admin-toegang</h1>
        <p>Deze omgeving is alleen beschikbaar voor actieve Fermi-admins.</p>
        <Link href="/profiel">Terug naar profiel</Link>
      </main>
    );
  }

  return (
    <main className="app-shell activity-admin-shell">
      <header className="activity-admin-header">
        <Link className="activity-admin-back" href="/profiel" aria-label="Terug naar profiel">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <small>ACTIVITEITEN CRM</small>
          <h1>Activiteiten</h1>
          <p>Plan, publiceer en beheer activiteiten vanuit één overzicht.</p>
        </div>
        <button type="button" className="activity-admin-add-top" onClick={openNew} aria-label="Nieuwe activiteit">
          <Plus size={20} />
        </button>
      </header>

      <section className="activity-admin-content">
        <div className="activity-admin-stats">
          <div><strong>{counts.total}</strong><span>Totaal</span></div>
          <div><strong>{counts.upcoming}</strong><span>Komend</span></div>
          <div><strong>{counts.hidden}</strong><span>Verborgen</span></div>
          <div><strong>{counts.registrations}</strong><span>Inschrijvingen</span></div>
        </div>

        <button className="activity-admin-primary" type="button" onClick={openNew}>
          <Plus size={18} /> Nieuwe activiteit
        </button>

        {notice && <div className="activity-admin-notice" role="status">{notice}</div>}

        <div className="activity-admin-toolbar">
          <label className="activity-admin-search">
            <Search size={18} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Zoek activiteit, locatie of organisator"
            />
          </label>

          <div className="activity-admin-filters">
            {([
              ["all", "Alles"],
              ["upcoming", "Komend"],
              ["past", "Voorbij"],
              ["hidden", "Verborgen"],
            ] as const).map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={mode === value ? "active" : ""}
                onClick={() => setMode(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <section className="activity-admin-list">
          {visibleActivities.map((activity) => {
            const containerImagePath = normalizeLegacyActivityImagePath(
              activity.imagePath || (activity.backgroundPreset
                ? `/images/agenda/activities/container-images/${activity.backgroundPreset}.png`
                : ""),
            );
            const dateTileImagePath = activity.detailImagePath || containerImagePath;
            return (
              <article className="activity-admin-row" key={activity.slug}>
                <div
                  className="activity-admin-thumb"
                  style={dateTileImagePath ? {
                    backgroundImage: `linear-gradient(rgba(3,29,44,.18),rgba(3,29,44,.58)),url("/Fermi-PWA${dateTileImagePath}")`,
                  } : undefined}
                >
                  <strong>{activity.day}</strong>
                  <span>{activity.month}</span>
                </div>

                <div className="activity-admin-row-copy">
                  <span className="activity-admin-type">{activity.type}</span>
                  <h2>{activity.title}</h2>
                  <p><CalendarDays size={14} /> {activity.dateLabel}</p>
                  <p><Clock3 size={14} /> {activity.time}</p>
                  <p><MapPin size={14} /> {activity.location}</p>
                </div>

                <div className="activity-admin-row-meta">
                  <span><UsersRound size={14} /> {activity.registered || 0}/{activity.capacity || "∞"}</span>
                  <span className={activity.showInAgenda === false ? "hidden" : "published"}>
                    {activity.showInAgenda === false ? "Verborgen" : "Gepubliceerd"}
                  </span>
                </div>

                <div className="activity-admin-row-actions">
                  <button type="button" onClick={() => openEdit(activity)} aria-label={`${activity.title} bewerken`}>
                    <Pencil size={17} />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleVisibility(activity)}
                    disabled={busy}
                    aria-label={activity.showInAgenda === false ? "Publiceren" : "Verbergen"}
                  >
                    {activity.showInAgenda === false ? <Eye size={17} /> : <EyeOff size={17} />}
                  </button>
                </div>
              </article>
            );
          })}

          {visibleActivities.length === 0 && (
            <div className="activity-admin-empty">
              <CalendarDays size={32} />
              <strong>Geen activiteiten gevonden</strong>
              <span>Maak een nieuwe activiteit of wijzig je filters.</span>
            </div>
          )}
        </section>
      </section>

      {panelOpen && (
        <div className="activity-admin-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPanelOpen(false);
        }}>
          <section className="activity-admin-modal" role="dialog" aria-modal="true" aria-label="Activiteit bewerken">
            <header>
              <div>
                <small>{selected ? "ACTIVITEIT BEWERKEN" : "NIEUWE ACTIVITEIT"}</small>
                <h2>{selected ? selected.title : "Nieuwe activiteit"}</h2>
              </div>
              <button type="button" onClick={() => setPanelOpen(false)} aria-label="Sluiten"><X size={20} /></button>
            </header>

            <div className="activity-admin-form">
              <section>
                <h3>Basisgegevens</h3>
                <label>Titel
                  <input
                    value={form.title}
                    onChange={(event) => {
                      const title = event.target.value;
                      setForm((current) => ({
                        ...current,
                        title,
                        slug: selected ? current.slug : slugify(title),
                      }));
                    }}
                    placeholder="Bijv. Bowlen met Fermi"
                  />
                </label>
                <div>
                  <span className="activity-admin-field-label">Type</span>
                  <div className="activity-admin-choice-grid" role="group" aria-label="Type activiteit">
                    {activityTypes.map((type) => (
                      <button
                        type="button"
                        key={type}
                        className={form.type === type ? "active" : ""}
                        onClick={() => updateForm("type", type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <small className="activity-admin-auto-value">Slug automatisch: {form.slug || slugify(form.title) || "—"}</small>
              </section>

              <section>
                <h3>Datum & tijd</h3>
                <label>Datum
                  <input type="date" value={form.date} onChange={(event) => updateForm("date", event.target.value)} />
                </label>
                <div className="activity-admin-form-grid two">
                  <label>Starttijd
                    <input type="time" value={form.startTime} onChange={(event) => updateForm("startTime", event.target.value)} />
                  </label>
                  <label>Eindtijd
                    <input type="time" value={form.endTime} onChange={(event) => updateForm("endTime", event.target.value)} />
                  </label>
                </div>
                <label>Inschrijfdeadline
                  <input value={form.registrationDeadline} onChange={(event) => updateForm("registrationDeadline", event.target.value)} placeholder="Bijv. 12 november om 18:00" />
                </label>
              </section>

              <section>
                <h3>Locatie</h3>
                <label>Locatienaam
                  <input value={form.location} onChange={(event) => updateForm("location", event.target.value)} placeholder="Bijv. Knijn Bowling" />
                </label>
                <label>Adres
                  <input value={form.address} onChange={(event) => updateForm("address", event.target.value)} placeholder="Straat, plaats" />
                </label>
              </section>

              <section>
                <h3>Organisatie & capaciteit</h3>

                <div>
                  <span className="activity-admin-field-label">Organisator</span>
                  <div className="activity-admin-choice-grid compact" role="group" aria-label="Organisator">
                    {organizers.map((organizer) => (
                      <button
                        type="button"
                        key={organizer}
                        className={form.organizer === organizer ? "active" : ""}
                        onClick={() => updateForm("organizer", organizer)}
                      >
                        {organizer}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="activity-admin-field-label">Capaciteit</span>
                  <div className="activity-admin-capacity-row">
                    <button type="button" onClick={() => updateForm("capacity", String(Math.max(0, Number(form.capacity || 0) - 1)))} aria-label="Capaciteit verlagen">−</button>
                    <strong>{form.capacity || "0"}</strong>
                    <button type="button" onClick={() => updateForm("capacity", String(Number(form.capacity || 0) + 1))} aria-label="Capaciteit verhogen">+</button>
                  </div>
                  <div className="activity-admin-choice-grid capacity" role="group" aria-label="Capaciteit kiezen">
                    <button type="button" className={form.capacity === "0" ? "active" : ""} onClick={() => updateForm("capacity", "0")}>Onbeperkt</button>
                    {capacityPresets.map((amount) => (
                      <button
                        type="button"
                        key={amount}
                        className={form.capacity === String(amount) ? "active" : ""}
                        onClick={() => updateForm("capacity", String(amount))}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="activity-admin-field-label">Prijs</span>
                  <div className="activity-admin-segmented" role="group" aria-label="Prijsinstelling">
                    <button type="button" className={form.price.toLowerCase().includes("gratis") ? "active" : ""} onClick={() => updateForm("price", "Gratis")}>Gratis</button>
                    <button type="button" className={!form.price.toLowerCase().includes("gratis") ? "active" : ""} onClick={() => updateForm("price", form.price.toLowerCase().includes("gratis") ? "€ 5,00" : form.price)}>Betaald</button>
                  </div>
                  {!form.price.toLowerCase().includes("gratis") && (
                    <div className="activity-admin-price-options">
                      {["€ 2,50","€ 5,00","€ 7,50","€ 10,00","€ 15,00"].map((price) => (
                        <button type="button" key={price} className={form.price === price ? "active" : ""} onClick={() => updateForm("price", price)}>{price}</button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              <section>
                <h3>Agenda-afbeelding</h3>
                <p className="activity-admin-section-help">
                  Deze afbeelding wordt gebruikt op de agenda-overzichtspagina.
                </p>

                <div className="activity-admin-image-picker activity-admin-agenda-image-picker" role="listbox" aria-label="Kies agenda-afbeelding">
                  <button
                    type="button"
                    className={`activity-admin-image-option activity-admin-image-none ${form.imagePath ? "" : "active"}`}
                    onClick={() => updateForm("imagePath", "")}
                    aria-selected={!form.imagePath}
                  >
                    <span>Geen afbeelding</span>
                  </button>

                  {agendaContainerImages.map((image) => (
                    <div className="activity-admin-image-cell" key={`agenda-${image.path}`}>
                      <button
                        type="button"
                        className={`activity-admin-image-option ${form.imagePath === image.path ? "active" : ""}`}
                        onClick={() => updateForm("imagePath", image.path)}
                        aria-selected={form.imagePath === image.path}
                      >
                        <img src={`/Fermi-PWA${image.path}`} alt="" />
                        <span>{image.label}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {form.imagePath && <small className="activity-admin-image-path">{form.imagePath}</small>}
              </section>

              <section>
                <h3>Detailpagina-afbeelding</h3>
                <p className="activity-admin-section-help">
                  Kies een afbeelding uit de aparte detail-images map voor de grote hero op de activiteit-detailpagina.
                </p>

                <div className="activity-admin-image-picker" role="listbox" aria-label="Kies detailpagina-afbeelding">
                  <button
                    type="button"
                    className={`activity-admin-image-option activity-admin-image-none ${form.detailImagePath ? "" : "active"}`}
                    onClick={() => updateForm("detailImagePath", "")}
                    aria-selected={!form.detailImagePath}
                  >
                    <span>Gebruik agenda-afbeelding als fallback</span>
                  </button>

                  {agendaDetailImages.map((image) => (
                    <div className="activity-admin-image-cell" key={`detail-${image.path}`}>
                      <button
                        type="button"
                        className={`activity-admin-image-option ${form.detailImagePath === image.path ? "active" : ""}`}
                        onClick={() => updateForm("detailImagePath", image.path)}
                        aria-selected={form.detailImagePath === image.path}
                      >
                        <img src={`/Fermi-PWA${image.path}`} alt="" />
                        <span>{image.label}</span>
                      </button>
                    </div>
                  ))}
                </div>

                {(form.detailImagePath || form.imagePath) && (
                  <div
                    className="activity-admin-preset-preview activity-admin-detail-preview"
                    style={{ backgroundImage: `url("/Fermi-PWA${form.detailImagePath || form.imagePath}")` }}
                  >
                    <span>{form.title || "Voorbeeld activiteit"}</span>
                  </div>
                )}

                {form.detailImagePath && <small className="activity-admin-image-path">{form.detailImagePath}</small>}

                <div className="activity-admin-visibility-card">
                  <div>
                    <strong>Zichtbaar in Agenda</strong>
                    <small>Zet uit om de activiteit als concept/verborgen te bewaren.</small>
                  </div>
                  <div className="activity-admin-segmented compact" role="group" aria-label="Zichtbaarheid agenda">
                    <button type="button" className={form.showInAgenda ? "active" : ""} onClick={() => updateForm("showInAgenda", true)}>Aan</button>
                    <button type="button" className={!form.showInAgenda ? "active" : ""} onClick={() => updateForm("showInAgenda", false)}>Uit</button>
                  </div>
                </div>
              </section>

              <section>
                <h3>Inhoud</h3>
                <label>Beschrijving
                  <textarea rows={5} value={form.description} onChange={(event) => updateForm("description", event.target.value)} placeholder="Wat gaan leden doen?" />
                </label>
                <label>Praktische informatie
                  <textarea rows={4} value={form.practicalText} onChange={(event) => updateForm("practicalText", event.target.value)} placeholder={"Eén punt per regel\nNeem je ledenpas mee\nVerzamelen om 18:45"} />
                </label>
              </section>
            </div>

            <footer>
              <button type="button" className="secondary" onClick={() => setPanelOpen(false)}>Annuleren</button>
              <button type="button" className="primary" onClick={handleSave} disabled={busy}>
                <Save size={18} /> {busy ? "Opslaan…" : selected ? "Wijzigingen opslaan" : "Activiteit toevoegen"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
