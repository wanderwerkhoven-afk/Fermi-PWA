"use client";

import { useSearchParams } from "next/navigation";
import EventDetailClient from "@/components/events/EventDetailClient";

export default function ActivityRouteClient() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");

  if (!slug) {
    return (
      <main className="app-shell event-detail-shell">
        <div className="event-detail-loading">
          <strong>Geen activiteit geselecteerd</strong>
          <a href="/Fermi-PWA/agenda">Terug naar agenda</a>
        </div>
      </main>
    );
  }

  return <EventDetailClient slug={slug} />;
}
