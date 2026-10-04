import { Suspense } from "react";
import ActivityRouteClient from "@/components/events/ActivityRouteClient";

export default function ActivityPage() {
  return (
    <Suspense fallback={
      <main className="app-shell event-detail-shell">
        <div className="event-detail-loading">Activiteit laden…</div>
      </main>
    }>
      <ActivityRouteClient />
    </Suspense>
  );
}
