"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowLeft,
  CalendarDays,
  Eye,
  EyeOff,
  Info,
  Megaphone,
  Pencil,
  Pin,
  Plus,
  Save,
  Search,
  ShieldAlert,
  ShoppingBag,
  X,
} from "lucide-react";
import { auth } from "../../../lib/firebase";
import { getUserProfile } from "../../../lib/services/users";
import {
  listAnnouncements,
  saveAnnouncement,
  type AnnouncementData,
  type AnnouncementIcon,
} from "../../../lib/services/announcements";

type FormState = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  icon: AnnouncementIcon;
  actionLabel: string;
  actionRoute: string;
  startsAt: string;
  expiresAt: string;
  published: boolean;
  pinned: boolean;
};

const emptyForm: FormState = {
  id: "",
  title: "",
  summary: "",
  detail: "",
  icon: "megaphone",
  actionLabel: "Bekijk meer",
  actionRoute: "/",
  startsAt: "",
  expiresAt: "",
  published: true,
  pinned: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formFromAnnouncement(item: AnnouncementData): FormState {
  return {
    id: item.id,
    title: item.title,
    summary: item.summary,
    detail: item.detail,
    icon: item.icon,
    actionLabel: item.actionLabel,
    actionRoute: item.actionRoute,
    startsAt: item.startsAt,
    expiresAt: item.expiresAt,
    published: item.published,
    pinned: item.pinned,
  };
}

function iconFor(icon: AnnouncementIcon) {
  if (icon === "calendar") return CalendarDays;
  if (icon === "shop") return ShoppingBag;
  if (icon === "info") return Info;
  return Megaphone;
}

export default function MededelingenAdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [items, setItems] = useState<AnnouncementData[]>([]);
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"all" | "published" | "hidden">("all");
  const [selected, setSelected] = useState<AnnouncementData | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [panelOpen, setPanelOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");

  async function refresh() {
    const data = await listAnnouncements();
    setItems(data.sort((a, b) => Number(b.pinned) - Number(a.pinned) || a.title.localeCompare(b.title, "nl")));
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

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesMode =
        mode === "all"
        || (mode === "published" && item.published)
        || (mode === "hidden" && !item.published);
      const matchesQuery =
        !needle
        || [item.title, item.summary, item.detail].join(" ").toLowerCase().includes(needle);
      return matchesMode && matchesQuery;
    });
  }, [items, query, mode]);

  const counts = useMemo(() => ({
    total: items.length,
    published: items.filter((item) => item.published).length,
    hidden: items.filter((item) => !item.published).length,
    pinned: items.filter((item) => item.pinned).length,
  }), [items]);

  function openNew() {
    setSelected(null);
    setForm(emptyForm);
    setNotice("");
    setPanelOpen(true);
  }

  function openEdit(item: AnnouncementData) {
    setSelected(item);
    setForm(formFromAnnouncement(item));
    setNotice("");
    setPanelOpen(true);
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSave() {
    if (!form.title.trim() || !form.summary.trim()) {
      setNotice("Vul minimaal een titel en korte tekst in.");
      return;
    }

    const id = form.id || slugify(form.title);
    if (!id) {
      setNotice("Gebruik een geldige titel.");
      return;
    }

    if (!selected && items.some((item) => item.id === id)) {
      setNotice("Er bestaat al een mededeling met deze titel.");
      return;
    }

    setBusy(true);
    setNotice("");

    try {
      await saveAnnouncement({
        id,
        title: form.title.trim(),
        summary: form.summary.trim(),
        detail: form.detail.trim() || form.summary.trim(),
        icon: form.icon,
        actionLabel: form.actionLabel.trim() || "Bekijk meer",
        actionRoute: form.actionRoute.trim() || "/",
        startsAt: form.startsAt,
        expiresAt: form.expiresAt,
        published: form.published,
        pinned: form.pinned,
        createdBy: auth.currentUser?.uid,
        createdAt: selected?.createdAt,
      });
      await refresh();
      setPanelOpen(false);
      setNotice("Mededeling opgeslagen.");
    } catch (error) {
      console.error(error);
      setNotice("Opslaan is niet gelukt.");
    } finally {
      setBusy(false);
    }
  }

  async function togglePublished(item: AnnouncementData) {
    setBusy(true);
    try {
      await saveAnnouncement({ ...item, published: !item.published });
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  if (authorized === null) {
    return <main className="activity-admin-gate">Mededelingen CRM laden…</main>;
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
    <main className="app-shell activity-admin-shell announcement-admin-shell">
      <header className="activity-admin-header">
        <Link className="activity-admin-back" href="/profiel" aria-label="Terug naar profiel">
          <ArrowLeft size={22} />
        </Link>
        <div>
          <small>MEDEDELINGEN CRM</small>
          <h1>Mededelingen</h1>
          <p>Maak, publiceer en beheer berichten voor leden.</p>
        </div>
        <button type="button" className="activity-admin-add-top" onClick={openNew} aria-label="Nieuwe mededeling">
          <Plus size={20} />
        </button>
      </header>

      <section className="activity-admin-content">
        <div className="activity-admin-stats">
          <div><strong>{counts.total}</strong><span>Totaal</span></div>
          <div><strong>{counts.published}</strong><span>Live</span></div>
          <div><strong>{counts.hidden}</strong><span>Verborgen</span></div>
          <div><strong>{counts.pinned}</strong><span>Vastgezet</span></div>
        </div>

        <button className="activity-admin-primary" type="button" onClick={openNew}>
          <Plus size={18} /> Nieuwe mededeling
        </button>

        {notice && <div className="activity-admin-notice">{notice}</div>}

        <div className="activity-admin-toolbar">
          <label className="activity-admin-search">
            <Search size={18} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek mededeling" />
          </label>

          <div className="activity-admin-filters announcement-admin-filters">
            {([
              ["all", "Alles"],
              ["published", "Live"],
              ["hidden", "Verborgen"],
            ] as const).map(([value, label]) => (
              <button type="button" key={value} className={mode === value ? "active" : ""} onClick={() => setMode(value)}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <section className="activity-admin-list">
          {visible.map((item) => {
            const Icon = iconFor(item.icon);
            return (
              <article className="announcement-admin-row" key={item.id}>
                <span className="announcement-admin-icon"><Icon size={22} /></span>
                <div className="announcement-admin-copy">
                  <div className="announcement-admin-badges">
                    <span className={item.published ? "published" : "hidden"}>{item.published ? "Live" : "Verborgen"}</span>
                    {item.pinned && <span className="pinned"><Pin size={11} /> Vastgezet</span>}
                  </div>
                  <h2>{item.title}</h2>
                  <p>{item.summary}</p>
                  {(item.startsAt || item.expiresAt) && (
                    <small>{item.startsAt || "Direct"} → {item.expiresAt || "Geen einddatum"}</small>
                  )}
                </div>

                <div className="activity-admin-row-actions announcement-admin-actions">
                  <button type="button" onClick={() => openEdit(item)} aria-label="Bewerken"><Pencil size={17} /></button>
                  <button type="button" onClick={() => togglePublished(item)} disabled={busy} aria-label={item.published ? "Verbergen" : "Publiceren"}>
                    {item.published ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </article>
            );
          })}

          {visible.length === 0 && (
            <div className="activity-admin-empty">
              <Megaphone size={32} />
              <strong>Geen mededelingen gevonden</strong>
              <span>Maak een nieuwe mededeling of wijzig je filter.</span>
            </div>
          )}
        </section>
      </section>

      {panelOpen && (
        <div className="activity-admin-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setPanelOpen(false);
        }}>
          <section className="activity-admin-modal" role="dialog" aria-modal="true" aria-label="Mededeling bewerken">
            <header>
              <div>
                <small>{selected ? "MEDEDELING BEWERKEN" : "NIEUWE MEDEDELING"}</small>
                <h2>{selected?.title || "Nieuwe mededeling"}</h2>
              </div>
              <button type="button" onClick={() => setPanelOpen(false)} aria-label="Sluiten"><X size={20} /></button>
            </header>

            <div className="activity-admin-form">
              <section>
                <h3>Bericht</h3>
                <label>Titel
                  <input value={form.title} onChange={(event) => updateForm("title", event.target.value)} placeholder="Titel van de mededeling" />
                </label>
                <label>Korte tekst
                  <textarea rows={3} value={form.summary} onChange={(event) => updateForm("summary", event.target.value)} placeholder="Deze tekst staat op de Home-kaart." />
                </label>
                <label>Volledige tekst
                  <textarea rows={6} value={form.detail} onChange={(event) => updateForm("detail", event.target.value)} placeholder="Uitgebreide informatie in de popup." />
                </label>
              </section>

              <section>
                <h3>Weergave</h3>
                <div>
                  <span className="activity-admin-field-label">Icoon</span>
                  <div className="activity-admin-choice-grid compact">
                    {([
                      ["megaphone", "Mededeling"],
                      ["calendar", "Agenda"],
                      ["shop", "Shop"],
                      ["info", "Info"],
                    ] as const).map(([value, label]) => (
                      <button type="button" key={value} className={form.icon === value ? "active" : ""} onClick={() => updateForm("icon", value)}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <label>Knoptekst
                  <input value={form.actionLabel} onChange={(event) => updateForm("actionLabel", event.target.value)} placeholder="Bijv. Bekijk agenda" />
                </label>
                <label>Route
                  <input value={form.actionRoute} onChange={(event) => updateForm("actionRoute", event.target.value)} placeholder="/agenda" />
                </label>
              </section>

              <section>
                <h3>Publicatie</h3>
                <div className="activity-admin-form-grid two">
                  <label>Vanaf
                    <input type="date" value={form.startsAt} onChange={(event) => updateForm("startsAt", event.target.value)} />
                  </label>
                  <label>Tot
                    <input type="date" value={form.expiresAt} onChange={(event) => updateForm("expiresAt", event.target.value)} />
                  </label>
                </div>

                <label className="activity-admin-switch-row">
                  <input type="checkbox" checked={form.published} onChange={(event) => updateForm("published", event.target.checked)} />
                  <span><strong>Publiceren</strong><small>Toon deze mededeling aan leden.</small></span>
                </label>

                <label className="activity-admin-switch-row">
                  <input type="checkbox" checked={form.pinned} onChange={(event) => updateForm("pinned", event.target.checked)} />
                  <span><strong>Vastzetten</strong><small>Toon deze mededeling bovenaan.</small></span>
                </label>
              </section>
            </div>

            <footer>
              <button type="button" className="secondary" onClick={() => setPanelOpen(false)}>Annuleren</button>
              <button type="button" className="primary" onClick={handleSave} disabled={busy}>
                <Save size={18} /> {busy ? "Opslaan…" : "Mededeling opslaan"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
