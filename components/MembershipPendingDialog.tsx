"use client";

import { useEffect, useState } from "react";
import { LockKeyhole, X } from "lucide-react";

const EVENT_NAME = "fermi:membership-pending-dialog";

type PendingDialogDetail = {
  feature?: string;
};

export function showMembershipPendingDialog(feature?: string) {
  window.dispatchEvent(new CustomEvent<PendingDialogDetail>(EVENT_NAME, { detail: { feature } }));
}

export default function MembershipPendingDialog() {
  const [feature, setFeature] = useState("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<PendingDialogDetail>;
      setFeature(customEvent.detail?.feature ?? "");
      setOpen(true);
    };

    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="membership-pending-dialog-backdrop"
      role="presentation"
      onClick={() => setOpen(false)}
    >
      <section
        className="membership-pending-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="membership-pending-dialog-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="membership-pending-dialog-close"
          aria-label="Sluiten"
          onClick={() => setOpen(false)}
        >
          <X size={19} />
        </button>

        <span className="membership-pending-dialog-icon" aria-hidden="true">
          <LockKeyhole size={28} />
        </span>
        <small>ACCOUNT IN BEHANDELING</small>
        <h2 id="membership-pending-dialog-title">Nog even geduld</h2>
        <p>
          {feature ? <><strong>{feature}</strong> is beschikbaar zodra je lidmaatschap is goedgekeurd. </> : null}
          Je aanmelding wordt momenteel gecontroleerd door S.V. Fermi.
        </p>
        <p className="membership-pending-dialog-note">
          Je kunt ondertussen gewoon rondkijken in Home, Agenda, Fermi en je Profiel.
        </p>

        <button type="button" className="membership-pending-dialog-confirm" onClick={() => setOpen(false)}>
          Begrepen
        </button>
      </section>
    </div>
  );
}
