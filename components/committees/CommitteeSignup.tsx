"use client";

import { Check, Send } from "lucide-react";
import { useState } from "react";

export default function CommitteeSignup({ committeeName }: { committeeName: string }) {
  const [signedUp, setSignedUp] = useState(false);

  return (
    <div className="committee-signup-wrap">
      <button
        className={`committee-signup-button ${signedUp ? "signed-up" : ""}`}
        onClick={() => setSignedUp((value) => !value)}
        aria-pressed={signedUp}
      >
        {signedUp ? <Check size={21} /> : <Send size={20} />}
        {signedUp ? "Interesse doorgegeven" : `Schrijf je in voor ${committeeName}`}
      </button>
      <small>
        {signedUp
          ? "In deze prototypeversie wordt je interesse alleen lokaal bijgehouden."
          : "Laat weten dat je interesse hebt. Het bestuur kan later contact met je opnemen."}
      </small>
    </div>
  );
}
