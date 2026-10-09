"use client";

import { useEffect, useState } from "react";
import { Check, LockKeyhole, Share2, Ticket } from "lucide-react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useFermiSession } from "@/components/SessionProvider";
import { showMembershipPendingDialog } from "@/components/MembershipPendingDialog";
import { getActiveMembership } from "@/lib/services/memberships";
import {
  cancelEventRegistrationAtomic,
  registerForEventAtomic,
  subscribeToRegistrationState,
} from "@/lib/services/registrations";

export default function EventActions({
  eventId,
  initialRegistered,
  capacity,
  shareTitle = "S.V. Fermi activiteit",
}: {
  eventId: string;
  initialRegistered: number;
  capacity: number;
  shareTitle?: string;
}) {
  const { fermiUser, membership: sessionMembership } = useFermiSession();
  const membershipStatus = sessionMembership?.status ?? fermiUser?.membership?.status;
  const isMembershipPending = membershipStatus === "pending";
  const [userId, setUserId] = useState<string | null>(auth.currentUser?.uid ?? null);
  const [joined, setJoined] = useState(false);
  const [registeredCount, setRegisteredCount] = useState(initialRegistered);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => onAuthStateChanged(auth, (user) => setUserId(user?.uid ?? null)), []);

  useEffect(() => {
    return subscribeToRegistrationState(
      eventId,
      userId,
      initialRegistered,
      ({ joined: nextJoined, registeredCount: nextCount }) => {
        setJoined(nextJoined);
        setRegisteredCount(nextCount);
      },
    );
  }, [eventId, userId, initialRegistered]);

  async function toggleRegistration() {
    if (isMembershipPending) {
      showMembershipPendingDialog("Inschrijven voor activiteiten");
      return;
    }
    if (!userId || busy) return;

    setBusy(true);
    setFeedback("");
    try {
      if (joined) {
        await cancelEventRegistrationAtomic(eventId, userId);
        setFeedback("Je inschrijving is geannuleerd.");
      } else {
        const membership = await getActiveMembership(userId);
        if (!membership) {
          setFeedback("Je hebt een actief lidmaatschap nodig om je in te schrijven.");
          return;
        }

        await registerForEventAtomic(eventId, userId, membership.id);
        setFeedback("Je bent ingeschreven.");
      }
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      if (code === "activity/full") {
        setFeedback("Deze activiteit zit inmiddels vol.");
      } else if (code === "membership/not-active" || code === "membership/not-found") {
        setFeedback("Je actieve lidmaatschap kon niet worden bevestigd.");
      } else {
        console.error(error);
        setFeedback("Inschrijven is niet gelukt. Probeer het opnieuw.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function shareEvent() {
    if (typeof navigator !== "undefined" && navigator.share) {
      await navigator.share({ title: shareTitle, url: window.location.href });
      return;
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  const full = capacity > 0 && registeredCount >= capacity && !joined;

  return (
    <div className="event-actions" data-tour="event-registration">
      <button
        className={`event-register-button ${joined ? "joined" : ""}`}
        onClick={toggleRegistration}
        aria-pressed={joined}
        disabled={!userId || busy || full}
        aria-disabled={isMembershipPending}
      >
        {isMembershipPending ? <LockKeyhole size={20} /> : joined ? <Check size={20} /> : <Ticket size={20} />}
        {isMembershipPending ? "Beschikbaar na goedkeuring" : busy ? "Bezig…" : joined ? "Ingeschreven" : full ? "Vol" : "Schrijf je in"}
      </button>

      <button className="event-share-button" onClick={shareEvent}>
        <Share2 size={19} />
        Deel activiteit
      </button>

      <p className="event-capacity-copy" aria-live="polite">
        <strong>{registeredCount}</strong> / {capacity} plekken bezet
      </p>

      {isMembershipPending && (
        <p className="event-action-feedback event-action-locked" role="status">
          Inschrijven kan zodra S.V. Fermi je lidmaatschap heeft goedgekeurd.
        </p>
      )}
      {!isMembershipPending && feedback && (
        <p className="event-action-feedback" role="status">
          {feedback}
        </p>
      )}
    </div>
  );
}
