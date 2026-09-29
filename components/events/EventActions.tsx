"use client";

import { useState } from "react";
import { Check, Share2, Ticket } from "lucide-react";

export default function EventActions({
  initialRegistered,
  capacity,
  shareTitle = "S.V. Fermi activiteit",
}: {
  initialRegistered: number;
  capacity: number;
  shareTitle?: string;
}) {
  const [joined, setJoined] = useState(false);

  async function shareEvent() {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: shareTitle, url: window.location.href });
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div className="event-actions">
      <button
        className={`event-register-button ${joined ? "joined" : ""}`}
        onClick={() => setJoined((value) => !value)}
        aria-pressed={joined}
      >
        {joined ? <Check size={20} /> : <Ticket size={20} />}
        {joined ? "Ingeschreven" : "Schrijf je in"}
      </button>

      <button className="event-share-button" onClick={shareEvent}>
        <Share2 size={19} />
        Deel activiteit
      </button>

      <p className="event-capacity-copy">
        <strong>{initialRegistered + (joined ? 1 : 0)}</strong> / {capacity} plekken bezet
      </p>

      {joined && (
        <p className="event-action-feedback">
          Je inschrijving staat voorlopig lokaal in deze prototypeversie.
        </p>
      )}
    </div>
  );
}
