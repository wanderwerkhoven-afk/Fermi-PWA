"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  FileUp,
  IdCard,
  Mail,
  MapPin,
  Phone,
  Save,
  Search,
  ShieldAlert,
  UserPlus,
  UsersRound,
  X,
} from "lucide-react";
import { auth } from "../../../lib/firebase";
import { getUserProfile } from "../../../lib/services/users";
import {
  AdminMemberLifecycle,
  AdminMemberRow,
  listAdminMembers,
  saveAdminMemberDetails,
  setAdminMemberPaymentStatus,
  syncCommunityMembers,
  upsertDirectoryMember,
  upsertDirectoryMembers,
} from "../../../lib/services/memberAdmin";
import type { UserRole } from "../../../lib/models/backend";

const lifecycleLabels: Record<AdminMemberLifecycle, string> = {
  active: "Actief",
  pending: "In overgang",
  suspended: "Geblokkeerd",
  archived: "Archief",
};

const roleLabels: Record<UserRole, string> = {
  member: "Lid",
  committee: "Commissie",
  board: "Bestuur",
  admin: "Admin",
};

function splitCsvLine(line: string, separator: string) {
  const result: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (quoted && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === separator && !quoted) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseMemberCsv(text: string) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("Het bestand bevat geen ledenregels.");
  const separator = lines[0].includes(";") ? ";" : ",";
  const headers = splitCsvLine(lines[0], separator).map((header) => header.toLowerCase().trim());

  const find = (...names: string[]) => names.map((name) => headers.indexOf(name)).find((index) => index >= 0) ?? -1;
  const firstNameIndex = find("voornaam", "firstname", "first name");
  const lastNameIndex = find("achternaam", "lastname", "last name");
  const emailIndex = find("email", "e-mail", "mail");
  const memberNumberIndex = find("lidnummer", "membernumber", "member number");
  const phoneIndex = find("telefoonnummer", "telefoon", "phone", "phone number");
  const cityIndex = find("woonplaats", "plaats", "city");
  const startYearIndex = find("startjaar", "start jaar", "lid sinds", "member since", "startyear");
  const statusIndex = find("status");
  const roleIndex = find("rol", "role");

  if (emailIndex < 0) throw new Error("Kolom 'email' ontbreekt in het CSV-bestand.");

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line, separator);
    const rawStatus = (values[statusIndex] || "pending").toLowerCase();
    const status: AdminMemberLifecycle =
      rawStatus === "pending" || rawStatus === "in overgang" ? "pending"
      : rawStatus === "suspended" || rawStatus === "geblokkeerd" ? "suspended"
      : rawStatus === "archived" || rawStatus === "archief" || rawStatus === "expired" ? "archived"
      : "active";
    const rawRole = (values[roleIndex] || "member").toLowerCase();
    const role: UserRole = ["member", "committee", "board", "admin"].includes(rawRole)
      ? rawRole as UserRole
      : "member";

    return {
      firstName: firstNameIndex >= 0 ? values[firstNameIndex] || "" : "",
      lastName: lastNameIndex >= 0 ? values[lastNameIndex] || "" : "",
      email: values[emailIndex] || "",
      memberNumber: memberNumberIndex >= 0 ? values[memberNumberIndex] || "" : "",
      phone: phoneIndex >= 0 ? values[phoneIndex] || "" : "",
      city: cityIndex >= 0 ? values[cityIndex] || "" : "",
      startYear: startYearIndex >= 0 && values[startYearIndex] ? Number(values[startYearIndex]) || null : null,
      academicYear: "2026/2027",
      endDate: "2027-08-31",
      status,
      role,
      linkedUserId: null,
      payment: {
        status: status === "active" ? ("paid" as const) : ("unpaid" as const),
        source: "manual" as const,
        paidAt: null,
        confirmedBy: null,
        molliePaymentId: null,
      },
    };
  }).filter((item) => item.email);
}

export default function LedenAdminPage() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [members, setMembers] = useState<AdminMemberRow[]>([]);
  const [query, setQuery] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<AdminMemberRow | null>(null);
  const [edit, setEdit] = useState({
    firstName: "",
    lastName: "",
    email: "",
    memberNumber: "",
    phone: "",
    city: "",
    startYear: null as number | null,
    academicYear: "2026/2027",
    endDate: "2027-08-31",
    status: "active" as AdminMemberLifecycle,
    role: "member" as UserRole,
  });
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    memberNumber: "",
    phone: "",
    city: "",
    startYear: null as number | null,
    status: "pending" as AdminMemberLifecycle,
  });

  async function refresh() {
    const rows = await listAdminMembers();
    setMembers(rows);
    await syncCommunityMembers(rows);
    return rows;
  }

  useEffect(() => {
    return onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setAuthorized(false);
        return;
      }
      const profile = await getUserProfile(user.uid);
      const allowed = profile?.status === "active" && profile.role === "admin";
      setAuthorized(allowed);
      if (allowed) {
        try {
          await refresh();
        } catch (error) {
          console.error(error);
          setNotice("Leden konden niet worden geladen.");
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!authorized || members.length === 0 || selected) return;
    const memberId = new URLSearchParams(window.location.search).get("member");
    if (!memberId) return;
    const match = members.find((member) => member.uid === memberId || member.id === memberId);
    if (match) openMember(match);
  }, [authorized, members, selected]);

  useEffect(() => {
    document.body.classList.toggle("member-admin-modal-open", Boolean(selected));
    return () => document.body.classList.remove("member-admin-modal-open");
  }, [selected]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return members;
    return members.filter((member) =>
      [member.firstName, member.lastName, member.email, member.memberNumber]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [members, query]);

  const counts = useMemo(() => ({
    active: members.filter((member) => member.status === "active").length,
    pending: members.filter((member) => member.status === "pending").length,
    archived: members.filter((member) => member.status === "archived").length,
  }), [members]);

  function openMember(member: AdminMemberRow) {
    setSelected(member);
    setEdit({
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      memberNumber: member.memberNumber,
      phone: member.phone,
      city: member.city,
      startYear: member.startYear,
      academicYear: member.academicYear || "2026/2027",
      endDate: member.endDate || "2027-08-31",
      status: member.status,
      role: member.role,
    });
    setNotice("");
  }

  async function saveMember() {
    if (!selected) return;
    setBusyId(selected.id);
    try {
      await saveAdminMemberDetails(selected, edit);
      await refresh();
      setSelected(null);
      setNotice(`${edit.firstName || edit.email} is bijgewerkt.`);
    } catch (error) {
      console.error(error);
      setNotice("Lidgegevens opslaan is niet gelukt.");
    } finally {
      setBusyId(null);
    }
  }

  async function addMember() {
    if (!form.email.trim()) {
      setNotice("Vul minimaal een e-mailadres in.");
      return;
    }
    setBusyId("new");
    try {
      await upsertDirectoryMember({
        ...form,
        academicYear: "2026/2027",
        phone: form.phone,
        city: form.city,
        startYear: form.startYear,
        endDate: "2027-08-31",
        role: "member",
        linkedUserId: null,
        payment: {
          status: "unpaid",
          source: "manual",
          paidAt: null,
          confirmedBy: null,
          molliePaymentId: null,
        },
      });
      setForm({ firstName: "", lastName: "", email: "", memberNumber: "", phone: "", city: "", startYear: null, status: "pending" });
      setShowAdd(false);
      await refresh();
      setNotice("Lid toegevoegd aan de ledenadministratie.");
    } catch (error) {
      console.error(error);
      setNotice("Lid toevoegen is niet gelukt.");
    } finally {
      setBusyId(null);
    }
  }

  async function changePayment(paymentStatus: "unpaid" | "paid" | "waived") {
    if (!selected) return;
    setBusyId(`payment-${selected.id}`);
    setNotice("");
    try {
      await setAdminMemberPaymentStatus(selected, paymentStatus, auth.currentUser?.uid ?? null);
      const rows = await refresh();
      const updated = rows.find((item) => item.source === selected.source && item.id === selected.id) || null;
      setSelected(updated);
      const label =
        paymentStatus === "paid" ? "Betaling ontvangen en lidmaatschap geactiveerd."
        : paymentStatus === "waived" ? "Lidmaatschap vrijgesteld en geactiveerd."
        : "Betaling teruggezet naar niet betaald; lidmaatschap staat weer in overgang.";
      setNotice(label);
    } catch (error) {
      console.error(error);
      setNotice("Betaalstatus aanpassen is niet gelukt.");
    } finally {
      setBusyId(null);
    }
  }

  async function importCsv(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setBusyId("import");
    setNotice("");
    try {
      const items = parseMemberCsv(await file.text());
      await upsertDirectoryMembers(items);
      await refresh();
      setNotice(`${items.length} leden uit ${file.name} verwerkt.`);
    } catch (error) {
      console.error(error);
      setNotice(error instanceof Error ? error.message : "Importeren is niet gelukt.");
    } finally {
      setBusyId(null);
    }
  }

  if (authorized === null) {
    return <main className="member-admin-gate">Ledenadministratie laden…</main>;
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
          <h1>Leden admin</h1>
          <p>Aanmelden, afmelden en ledengegevens beheren.</p>
        </div>
        <span className="member-admin-header-icon"><UsersRound size={26} /></span>
      </header>

      <section className="member-admin-content">
        <div className="member-admin-stats">
          <div><strong>{counts.active}</strong><span>Actief</span></div>
          <div><strong>{counts.pending}</strong><span>Overgang</span></div>
          <div><strong>{counts.archived}</strong><span>Archief</span></div>
        </div>

        <div className="member-admin-actions">
          <button type="button" onClick={() => setShowAdd((value) => !value)}>
            <UserPlus size={18} /> Lid toevoegen
          </button>
          <label className={busyId === "import" ? "is-busy" : ""}>
            <FileUp size={18} /> {busyId === "import" ? "Importeren…" : "CSV importeren"}
            <input type="file" accept=".csv,text/csv" onChange={importCsv} disabled={busyId === "import"} />
          </label>
        </div>

        {showAdd && (
          <section className="member-admin-form">
            <div>
              <label>Voornaam<input value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} /></label>
              <label>Achternaam<input value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} /></label>
            </div>
            <label>E-mail<input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
            <div>
              <label>Telefoonnummer<input type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>
              <label>Woonplaats<input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></label>
            </div>
            <div>
              <label>Startjaar<input type="number" min="1900" max="2100" value={form.startYear ?? ""} onChange={(event) => setForm({ ...form, startYear: event.target.value ? Number(event.target.value) : null })} /></label>
              <span />
            </div>
            <div>
              <label>Lidnummer<input value={form.memberNumber} onChange={(event) => setForm({ ...form, memberNumber: event.target.value })} /></label>
              <label>Status
                <input value="In overgang · Niet betaald" disabled />
              </label>
            </div>
            <button type="button" onClick={addMember} disabled={busyId === "new"}>
              <CheckCircle2 size={18} /> {busyId === "new" ? "Opslaan…" : "Lid opslaan"}
            </button>
          </section>
        )}

        {notice && <div className="member-admin-notice" role="status">{notice}</div>}

        <div className="member-admin-search">
          <Search size={18} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Zoek op naam, e-mail of lidnummer" aria-label="Leden zoeken" />
        </div>

        <section className="member-admin-list">
          {filtered.map((member) => (
            <button className="member-admin-row member-admin-row-button" type="button" key={member.source + member.id} onClick={() => openMember(member)}>
              <div className="member-admin-avatar">{(member.firstName[0] || member.email[0] || "?").toUpperCase()}</div>
              <div className="member-admin-person">
                <strong>{[member.firstName, member.lastName].filter(Boolean).join(" ") || "Naam ontbreekt"}</strong>
                <span>{member.email}</span>
                <small>
                  {member.memberNumber ? `Lidnr. ${member.memberNumber}` : "Nog geen lidnummer"}
                  {" · "}{member.source === "account" ? "Account gekoppeld" : "Ledenlijst"}
                  {" · "}{member.paymentStatus === "paid" ? "Betaald" : member.paymentStatus === "waived" ? "Vrijgesteld" : "Niet betaald"}
                </small>
              </div>
              <div className="member-admin-row-meta">
                <span>{lifecycleLabels[member.status]}</span>
                <span>{roleLabels[member.role]}</span>
              </div>
              <ChevronRight className="member-admin-row-chevron" size={19} />
            </button>
          ))}

          {!filtered.length && <div className="member-admin-empty">Geen leden gevonden.</div>}
        </section>

        <p className="member-admin-import-help">
          CSV-kolommen: <strong>voornaam, achternaam, email, telefoonnummer, woonplaats, lidnummer, startjaar, status, rol</strong>.
          Puntkomma en komma worden beide ondersteund.
        </p>
      </section>

      {selected && (
        <div className="member-admin-modal-backdrop" role="presentation" onClick={() => setSelected(null)}>
          <section className="member-admin-modal" role="dialog" aria-modal="true" aria-label="Lidprofiel bewerken" onClick={(event) => event.stopPropagation()}>
            <header className="member-admin-modal-header">
              <div className="member-admin-modal-avatar">{(edit.firstName[0] || edit.email[0] || "?").toUpperCase()}</div>
              <div>
                <small>LIDPROFIEL</small>
                <h2>{[edit.firstName, edit.lastName].filter(Boolean).join(" ") || "Naam ontbreekt"}</h2>
                <p>{selected.source === "account" ? "Account gekoppeld" : "Nog geen account gekoppeld"}</p>
              </div>
              <button type="button" aria-label="Sluiten" onClick={() => setSelected(null)}><X size={20} /></button>
            </header>

            <div className="member-admin-modal-body">
              <section className="member-admin-modal-section">
                <h3>Persoon</h3>
                <div className="member-admin-modal-grid two">
                  <label>Voornaam<input value={edit.firstName} onChange={(e) => setEdit({ ...edit, firstName: e.target.value })} /></label>
                  <label>Achternaam<input value={edit.lastName} onChange={(e) => setEdit({ ...edit, lastName: e.target.value })} /></label>
                </div>
                <label><span><Mail size={14} /> E-mailadres</span><input type="email" value={edit.email} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></label>
                <div className="member-admin-modal-grid two">
                  <label><span><Phone size={14} /> Telefoonnummer</span><input type="tel" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} placeholder="06 12345678" /></label>
                  <label><span><MapPin size={14} /> Woonplaats</span><input value={edit.city} onChange={(e) => setEdit({ ...edit, city: e.target.value })} placeholder="Bijv. Haarlem" /></label>
                </div>
              </section>

              <section className="member-admin-modal-section">
                <h3>Lidmaatschap</h3>
                <div className="member-admin-modal-grid two">
                  <label><span><IdCard size={14} /> Lidnummer</span><input value={edit.memberNumber} onChange={(e) => setEdit({ ...edit, memberNumber: e.target.value })} placeholder="Bijv. FERMI-1042" /></label>
                  <label>Verenigingsjaar<input value={edit.academicYear} onChange={(e) => setEdit({ ...edit, academicYear: e.target.value })} placeholder="2026/2027" /></label>
                </div>
                <div className="member-admin-modal-grid two">
                  <label><span><CalendarDays size={14} /> Startjaar</span><input type="number" min="1900" max="2100" value={edit.startYear ?? ""} onChange={(e) => setEdit({ ...edit, startYear: e.target.value ? Number(e.target.value) : null })} placeholder="2024" /></label>
                  <span />
                </div>
                <label><span><CalendarDays size={14} /> Einddatum lidmaatschap</span><input type="date" value={edit.endDate} onChange={(e) => setEdit({ ...edit, endDate: e.target.value })} /></label>
              </section>

              <section className="member-admin-modal-section member-admin-payment-section">
                <h3><CreditCard size={17} /> Betaling lidmaatschap</h3>
                <div className={`member-payment-status is-${selected.paymentStatus}`}>
                  <strong>
                    {selected.paymentStatus === "paid"
                      ? "Betaald"
                      : selected.paymentStatus === "waived"
                        ? "Vrijgesteld"
                        : "Niet betaald"}
                  </strong>
                  <span>
                    {selected.paymentStatus === "paid"
                      ? "Handmatig bevestigd door bestuur/admin"
                      : selected.paymentStatus === "waived"
                        ? "Geen betaling vereist"
                        : "QR en lidmaatschap worden geactiveerd na bevestiging"}
                  </span>
                </div>
                {selected.source === "directory" && (
                  <p className="member-payment-note">Dit lid heeft nog geen gekoppeld account. De betaling kan al worden geregistreerd; de digitale ledenpas wordt beschikbaar zodra het account gekoppeld is.</p>
                )}
                <div className="member-payment-actions">
                  <button
                    type="button"
                    className="payment-paid"
                    disabled={busyId === `payment-${selected.id}` || selected.paymentStatus === "paid"}
                    onClick={() => void changePayment("paid")}
                  >
                    <CheckCircle2 size={17} /> Betaling ontvangen
                  </button>
                  <button
                    type="button"
                    className="payment-waived"
                    disabled={busyId === `payment-${selected.id}` || selected.paymentStatus === "waived"}
                    onClick={() => void changePayment("waived")}
                  >
                    Vrijstellen
                  </button>
                  <button
                    type="button"
                    className="payment-unpaid"
                    disabled={busyId === `payment-${selected.id}` || selected.paymentStatus === "unpaid"}
                    onClick={() => void changePayment("unpaid")}
                  >
                    Niet betaald
                  </button>
                </div>
              </section>

              <section className="member-admin-modal-section">
                <h3>Status & rol</h3>
                <div className="member-admin-choice-grid">
                  <label>Status<select value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value as AdminMemberLifecycle })}>{Object.entries(lifecycleLabels).map(([value,label]) => <option key={value} value={value} disabled={value === "active" && selected.paymentStatus === "unpaid"}>{label}</option>)}</select></label>
                  <label>Rol<select value={edit.role} onChange={(e) => setEdit({ ...edit, role: e.target.value as UserRole })}>{Object.entries(roleLabels).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
                </div>
              </section>
            </div>

            <footer className="member-admin-modal-footer">
              <button type="button" className="secondary" onClick={() => setSelected(null)}>Annuleren</button>
              <button type="button" className="primary" disabled={busyId === selected.id} onClick={() => void saveMember()}>
                <Save size={17} /> {busyId === selected.id ? "Opslaan…" : "Wijzigingen opslaan"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
