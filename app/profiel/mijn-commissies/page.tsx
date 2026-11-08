"use client";
import Link from "next/link";
import { useFermiSession } from "@/components/SessionProvider";
import { committees } from "@/data/committees";

export default function MyCommitteesPage() {
  const { fermiUser, loading } = useFermiSession();
  const role = fermiUser?.associationRole ?? "member";
  const mine = committees.filter(committee => committee.slug === role);
  const board = ["chair", "vice_chair", "secretary", "treasurer", "general_board"].includes(role);
  return <main className="app-shell profile-page-shell">
    <section className="association-admin-panel">
      <Link href="/profiel">← Terug naar profiel</Link>
      <h1>Mijn commissies</h1>
      <p>Bekijk je functie binnen S.V. Fermi en ontdek de andere commissies.</p>
      {loading ? <p>Commissies laden…</p>
        : !fermiUser ? <p>Log in om je commissies te bekijken.</p>
        : mine.length > 0 ? mine.map(committee =>
          <Link className="profile-menu-row" href={`/fermi/commissies/${committee.slug}`} key={committee.slug}>
            <strong>{committee.name} · {committee.fullName}</strong>
            <span>{committee.description}</span>
            <span>Bekijk de commissie →</span>
          </Link>)
        : board ? <p>Je hebt een bestuursfunctie. Er is momenteel geen aparte commissie aan je profiel gekoppeld.</p>
        : <p>Er is nog geen commissie aan je profiel gekoppeld. Neem contact op met het bestuur als dit niet klopt.</p>}
      <Link href="/fermi">Ontdek S.V. Fermi en alle commissies</Link>
    </section>
  </main>;
}
