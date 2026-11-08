"use client";
import Link from "next/link";
import { useFermiSession } from "@/components/SessionProvider";

export default function PrivacyPage() {
  const { fermiUser, membership, loading } = useFermiSession();
  const profile = fermiUser?.profile;
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(" ");
  return <main className="app-shell profile-page-shell">
    <section className="association-admin-panel">
      <Link href="/profiel">← Terug naar profiel</Link>
      <h1>Mijn gegevens en privacy</h1>
      <p>Bekijk welke persoonlijke gegevens de Fermi-app gebruikt voor je account en lidmaatschap.</p>
      {loading ? <p>Je gegevens laden…</p> : !fermiUser ? <p>Log in om je gegevens te bekijken.</p> : <>
        <h2>Profielgegevens</h2>
        <dl>
          <dt>Naam</dt><dd>{fullName || "Niet ingevuld"}</dd>
          <dt>E-mailadres</dt><dd>{profile?.email || "Niet ingevuld"}</dd>
          <dt>Telefoonnummer</dt><dd>{profile?.phone || "Niet ingevuld"}</dd>
          <dt>Studie</dt><dd>{profile?.study || "Niet ingevuld"}</dd>
          <dt>Studiejaar</dt><dd>{profile?.studyYear ?? "Niet ingevuld"}</dd>
          <dt>Biografie</dt><dd>{profile?.bio || "Niet ingevuld"}</dd>
        </dl>
        <h2>Lidmaatschap</h2>
        <dl>
          <dt>Accountstatus</dt><dd>{fermiUser.status === "active" ? "Actief" : "Geblokkeerd"}</dd>
          <dt>Studiejaar lidmaatschap</dt><dd>{membership?.academicYear || "Geen lidmaatschap gevonden"}</dd>
          <dt>Lidmaatschapsstatus</dt><dd>{membership?.status || "Niet beschikbaar"}</dd>
          <dt>Betaling</dt><dd>{membership?.payment?.status || "Niet beschikbaar"}</dd>
        </dl>
        <h2>Je privacy beheren</h2>
        <p>Je kunt je profielgegevens en de informatie die je met andere leden deelt aanpassen via je profiel. Je e-mailadres en betalingsgegevens horen niet in de openbare ledenlijst.</p>
        <Link href="/profiel">Profiel bekijken of bewerken</Link>
        <p>Wil je een kopie van je gegevens, een correctie laten uitvoeren of een verwijderverzoek indienen? Neem dan contact op met het bestuur van S.V. Fermi. Het verwijderen van een profiel kan gevolgen hebben voor de verenigingsadministratie en wordt daarom niet automatisch uitgevoerd.</p>
      </>}
    </section>
  </main>;
}
