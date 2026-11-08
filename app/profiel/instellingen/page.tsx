"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { restartFermiTour } from "@/components/GuidedAppTour";

export default function SettingsPage() {
  const [motion, setMotion] = useState(false);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    const enabled = localStorage.getItem("fermi-reduce-motion") === "true";
    setMotion(enabled);
    document.documentElement.classList.toggle("fermi-reduce-motion", enabled);
  }, []);

  function changeMotion(enabled: boolean) {
    setMotion(enabled);
    localStorage.setItem("fermi-reduce-motion", String(enabled));
    document.documentElement.classList.toggle("fermi-reduce-motion", enabled);
    setNotice("Je voorkeur is op dit apparaat opgeslagen.");
  }

  return <main className="app-shell profile-page-shell">
    <section className="association-admin-panel">
      <Link href="/profiel">← Terug naar profiel</Link>
      <h1>App-instellingen</h1>
      <p>Pas de weergave van de Fermi-app aan op dit apparaat.</p>
      <label className="profile-menu-row">
        <span><strong>Animaties verminderen</strong><span> Beperk bewegende effecten in de app.</span></span>
        <input type="checkbox" checked={motion} onChange={event => changeMotion(event.target.checked)} />
      </label>
      <h2>Uitleg en rondleiding</h2>
      <p>Bekijk opnieuw hoe je door de app navigeert en waar je de belangrijkste functies vindt.</p>
      <button type="button" onClick={() => { restartFermiTour(); window.location.assign("/"); }}>
        Walkthrough opnieuw starten
      </button>
      {notice && <p role="status">{notice}</p>}
      <p>Deze instellingen worden lokaal op dit apparaat opgeslagen en niet gedeeld met andere leden.</p>
    </section>
  </main>;
}
