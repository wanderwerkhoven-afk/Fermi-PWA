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
  if (!user || !item || !["active", "pending"].includes(item.status)) return null;

  const legacyActive = item.status === "active" && !item.payment;
  const paymentAllowsAccess =
    legacyActive
    || item.payment?.status === "paid"
    || item.payment?.status === "waived";

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
    digitalCard: {
      enabled: item.status === "active" && paymentAllowsAccess && item.digitalCard?.enabled !== false,
      cardId: item.digitalCard?.cardId || "",
    },
    payment: item.payment,
  };
}

function privilegedMembership(user: FermiUser): Membership {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const endYear = startYear + 1;

  return {
    id: `account-${user.uid}`,
    userId: user.uid,
    academicYear: `${startYear}/${endYear}`,
    membershipType: "student",
    status: "active",
    memberNumber: `FERMI-${user.uid.slice(0, 6).toUpperCase()}`,
    startDate: `${startYear}-09-01`,
    startYear,
    endDate: `${endYear}-08-31`,
    digitalCard: {
      enabled: true,
      cardId: user.uid,
    },
    payment: {
      status: "waived",
      source: "manual",
      confirmedBy: null,
      paidAt: null,
      molliePaymentId: null,
    },
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

      // Legacy fallback: prefer an existing membership document when one exists,
      // because it may contain an assigned member number and custom validity date.
      if (!membership && fermiUser && fermiUser.role !== "admin" && fermiUser.role !== "board") {
        membership = await getActiveMembership(firebaseUser.uid);
        if (!membership) {
          membership = await getPendingMembership(firebaseUser.uid);
        }
      }

      // Board/admin accounts are operational accounts and may use a waived pass
      // until a formal membership record has been assigned.
      if (
        !membership
        && fermiUser?.status === "active"
        && (fermiUser.role === "admin" || fermiUser.role === "board")
      ) {
        membership = privilegedMembership(fermiUser);
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
