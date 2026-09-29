"use client";

import { useState } from "react";
import { Check, Ticket } from "lucide-react";

export default function EventActions({ initialRegistered, capacity }: { initialRegistered: number; capacity: number }) {
  const [joined, setJoined] = useState(false);

  return (
    <div className="event-actions">
      <button
        className={`event-register-button ${joined ? "joined" : ""}`}
        onClick={() => setJoined((value) => !value)}
        aria-pressed={joined}
      >
        {joined ? <Check size={20} /> : <Ticket size={20} />}
        {joined ? "Ingeschreven" : "Inschrijven"}
      </button>
      <p className="event-capacity-copy">
        <strong>{initialRegistered + (joined ? 1 : 0)}</strong> / {capacity} plekken bezet
      </p>
      {joined && <p className="event-action-feedback">Je inschrijving staat voorlopig lokaal in deze prototypeversie.</p>}
    </div>
  );
}
