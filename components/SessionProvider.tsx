"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import type { FermiUser, Membership } from "../lib/models/backend";
import { subscribeUserProfile } from "../lib/services/users";
import { getActiveMembership, getPendingMembership } from "../lib/services/memberships";

type SessionState = {
  firebaseUser: User | null;
  fermiUser: FermiUser | null;
  membership: Membership | null;
  loading: boolean;
  error: unknown;
  membershipJustApproved: boolean;
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
    membershipJustApproved: false,
  });

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let approvalTimer: ReturnType<typeof setTimeout> | null = null;
    let previousMembershipStatus: Membership["status"] | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeProfile?.();
      unsubscribeProfile = null;
      if (approvalTimer) {
        clearTimeout(approvalTimer);
        approvalTimer = null;
      }
      previousMembershipStatus = null;

      if (!firebaseUser) {
        setState({
          firebaseUser: null,
          fermiUser: null,
          membership: null,
          loading: false,
          error: null,
          membershipJustApproved: false,
        });
        return;
      }

      setState((current) => ({
        ...current,
        firebaseUser,
        loading: true,
        error: null,
        membershipJustApproved: false,
      }));

      unsubscribeProfile = subscribeUserProfile(
        firebaseUser.uid,
        async (fermiUser) => {
          try {
            let membership = membershipFromUser(fermiUser);

            // Legacy fallback for older accounts without a current membership snapshot.
            if (!membership && fermiUser && fermiUser.role !== "admin" && fermiUser.role !== "board") {
              membership = await getActiveMembership(firebaseUser.uid);
              if (!membership) membership = await getPendingMembership(firebaseUser.uid);
            }

            if (
              !membership
              && fermiUser?.status === "active"
              && (fermiUser.role === "admin" || fermiUser.role === "board")
            ) {
              membership = privilegedMembership(fermiUser);
            }

            const currentMembershipStatus = membership?.status ?? null;
            const justApproved =
              previousMembershipStatus === "pending"
              && currentMembershipStatus === "active";

            previousMembershipStatus = currentMembershipStatus;

            setState({
              firebaseUser,
              fermiUser,
              membership,
              loading: false,
              error: null,
              membershipJustApproved: justApproved,
            });

            if (justApproved) {
              if (approvalTimer) clearTimeout(approvalTimer);
              approvalTimer = setTimeout(() => {
                setState((current) => ({ ...current, membershipJustApproved: false }));
              }, 6000);
            }
          } catch (error) {
            console.error("Fermi session could not be refreshed", error);
            setState({
              firebaseUser,
              fermiUser: null,
              membership: null,
              loading: false,
              error,
              membershipJustApproved: false,
            });
          }
        },
        (error) => {
          console.error("Realtime Fermi session listener failed", error);
          setState({
            firebaseUser,
            fermiUser: null,
            membership: null,
            loading: false,
            error,
            membershipJustApproved: false,
          });
        },
      );
    });

    return () => {
      unsubscribeAuth();
      unsubscribeProfile?.();
      if (approvalTimer) clearTimeout(approvalTimer);
    };
  }, []);

  const value = useMemo(() => state, [state]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useFermiSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("useFermiSession must be used inside SessionProvider");
  return value;
}
