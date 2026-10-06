"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import type { FermiUser, Membership } from "../lib/models/backend";
import { getUserProfile } from "../lib/services/users";
import { getActiveMembership, getPendingMembership } from "../lib/services/memberships";

type SessionState = {
  firebaseUser: User | null;
  fermiUser: FermiUser | null;
  membership: Membership | null;
  loading: boolean;
  error: unknown;
};

const SessionContext = createContext<SessionState | null>(null);

function membershipFromUser(user: FermiUser | null): Membership | null {
  const item = user?.membership;
  if (!user || !item || item.status !== "active") return null;
  return {
    id: item.id || `current-${user.uid}`,
    userId: user.uid,
    academicYear: item.academicYear || "",
    membershipType: item.membershipType || "student",
    status: item.status,
    memberNumber: item.memberNumber || "",
    startDate: item.startDate || "",
    startYear: item.startYear ?? null,
    endDate: item.endDate || "",
    digitalCard: item.digitalCard || { enabled: false, cardId: "" },
  };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    firebaseUser: null,
    fermiUser: null,
    membership: null,
    loading: true,
    error: null,
  });

  useEffect(() => onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      setState({ firebaseUser: null, fermiUser: null, membership: null, loading: false, error: null });
      return;
    }

    try {
      const fermiUser = await getUserProfile(firebaseUser.uid);
      let membership = membershipFromUser(fermiUser);

      // Legacy fallback: old accounts may not have the denormalized membership snapshot yet.
      // Board/admin users do not need this read for access.
      if (!membership && fermiUser && fermiUser.role !== "admin" && fermiUser.role !== "board") {
        membership = await getActiveMembership(firebaseUser.uid);
        if (!membership) {
          membership = await getPendingMembership(firebaseUser.uid);
        }
      }

      setState({ firebaseUser, fermiUser, membership, loading: false, error: null });
    } catch (error) {
      console.error("Fermi session could not be loaded", error);
      setState({ firebaseUser, fermiUser: null, membership: null, loading: false, error });
    }
  }), []);

  const value = useMemo(() => state, [state]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useFermiSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useFermiSession must be used inside SessionProvider");
  return value;
}
