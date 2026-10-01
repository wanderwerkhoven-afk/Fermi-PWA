"use client";

import Link from "next/link";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  FileUp,
  Search,
  ShieldAlert,
  UserPlus,
  UsersRound,
} from "lucide-react";
import { auth } from "../../../lib/firebase";
import { getUserProfile } from "../../../lib/services/users";
import {
  AdminMemberLifecycle,
  AdminMemberRow,
  listAdminMembers,
  setAdminMemberLifecycle,
  setAdminMemberRole,
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
  const statusIndex = find("status");
  const roleIndex = find("rol", "role");

  if (emailIndex < 0) throw new Error("Kolom 'email' ontbreekt in het CSV-bestand.");

  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line, separator);
    const rawStatus = (values[statusIndex] || "active").toLowerCase();
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
      academicYear: "2026/2027",
      status,
      role,
      linkedUserId: null,
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
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    memberNumber: "",
    status: "active" as AdminMemberLifecycle,
  });

  async function refresh() {
    setMembers(await listAdminMembers());
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

  async function changeLifecycle(member: AdminMemberRow, status: AdminMemberLifecycle) {
    setBusyId(member.id);
    setNotice("");
    try {
      await setAdminMemberLifecycle(member, status);
      await refresh();
      setNotice(`${member.firstName || member.email} staat nu op ${lifecycleLabels[status].toLowerCase()}.`);
    } catch (error) {
      console.error(error);
      setNotice("Status aanpassen is niet gelukt.");
    } finally {
      setBusyId(null);
    }
  }

  async function changeRole(member: AdminMemberRow, role: UserRole) {
    setBusyId(member.id);
    setNotice("");
    try {
      await setAdminMemberRole(member, role);
      await refresh();
      setNotice("Rol bijgewerkt.");
    } catch (error) {
      console.error(error);
      setNotice("Rol aanpassen is niet gelukt.");
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
        role: "member",
        linkedUserId: null,
      });
      setForm({ firstName: "", lastName: "", email: "", memberNumber: "", status: "active" });
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
              <label>Lidnummer<input value={form.memberNumber} onChange={(event) => setForm({ ...form, memberNumber: event.target.value })} /></label>
              <label>Status
                <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value as AdminMemberLifecycle })}>
                  {Object.entries(lifecycleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                </select>
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
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Zoek op naam, e-mail of lidnummer"
            aria-label="Leden zoeken"
          />
        </div>

        <section className="member-admin-list">
          {filtered.map((member) => (
            <article className="member-admin-row" key={member.source + member.id}>
              <div className="member-admin-avatar">
                {(member.firstName[0] || member.email[0] || "?").toUpperCase()}
              </div>
              <div className="member-admin-person">
                <strong>{[member.firstName, member.lastName].filter(Boolean).join(" ") || "Naam ontbreekt"}</strong>
                <span>{member.email}</span>
                <small>
                  {member.memberNumber ? `Lidnr. ${member.memberNumber}` : "Nog geen lidnummer"}
                  {" · "}{member.source === "account" ? "Account gekoppeld" : "Ledenlijst"}
                </small>
              </div>
              <div className="member-admin-controls">
                <label>
                  <span>Status</span>
                  <div className="member-admin-select">
                    <select
                      value={member.status}
                      disabled={busyId === member.id}
                      onChange={(event) => changeLifecycle(member, event.target.value as AdminMemberLifecycle)}
                    >
                      {Object.entries(lifecycleLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </label>
                <label>
                  <span>Rol</span>
                  <div className="member-admin-select">
                    <select
                      value={member.role}
                      disabled={busyId === member.id}
                      onChange={(event) => changeRole(member, event.target.value as UserRole)}
                    >
                      <option value="member">Lid</option>
                      <option value="committee">Commissie</option>
                      <option value="board">Bestuur</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown size={14} />
                  </div>
                </label>
              </div>
            </article>
          ))}

          {!filtered.length && (
            <div className="member-admin-empty">Geen leden gevonden.</div>
          )}
        </section>

        <p className="member-admin-import-help">
          CSV-kolommen: <strong>voornaam, achternaam, email, lidnummer, status, rol</strong>.
          Puntkomma en komma worden beide ondersteund.
        </p>
      </section>
    </main>
  );
}
