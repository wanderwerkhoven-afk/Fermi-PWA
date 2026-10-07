"use client";

import { Check, LockKeyhole, Send } from "lucide-react";
import { useFermiSession } from "@/components/SessionProvider";
import { useState } from "react";

export default function CommitteeSignup({ committeeName }: { committeeName: string }) {
  const { fermiUser, membership } = useFermiSession();
  const membershipStatus = membership?.status ?? fermiUser?.membership?.status;
  const isMembershipPending = membershipStatus === "pending" || fermiUser?.status === "pending";
  const [signedUp, setSignedUp] = useState(false);

  return (
    <div className="committee-signup-wrap">
      <button
        className={`committee-signup-button ${signedUp ? "signed-up" : ""}${isMembershipPending ? " is-membership-locked" : ""}`}
        onClick={() => !isMembershipPending && setSignedUp((value) => !value)}
        aria-pressed={signedUp}
        disabled={isMembershipPending}
      >
        {isMembershipPending ? <LockKeyhole size={20} /> : signedUp ? <Check size={21} /> : <Send size={20} />}
        {isMembershipPending ? "Beschikbaar na goedkeuring" : signedUp ? "Interesse doorgegeven" : `Schrijf je in voor ${committeeName}`}
      </button>
      <small>
        {isMembershipPending
          ? "Je kunt interesse doorgeven zodra je lidmaatschap is goedgekeurd."
          : signedUp
            ? "In deze prototypeversie wordt je interesse alleen lokaal bijgehouden."
            : "Laat weten dat je interesse hebt. Het bestuur kan later contact met je opnemen."}
      </small>
    </div>
  );
}
