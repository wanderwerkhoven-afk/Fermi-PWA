"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";
import type { FermiUser, Membership } from "../lib/models/backend";
import { subscribeUserProfile } from "../lib/services/users";
import { selectMembershipByStatus, subscribeUserMemberships } from "../lib/services/memberships";

type SessionState = {
  firebaseUser: User | null;
  fermiUser: FermiUser | null;
  membership: Membership | null;
  loading: boolean;
  error: unknown;
  membershipJustApproved: boolean;
};

const SessionContext = createContext<SessionState | null>(null);

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
    digitalCard: { enabled: true, cardId: user.uid },
    payment: { status: "waived", source: "manual", confirmedBy: null, paidAt: null, molliePaymentId: null },
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
    let stopProfile: (() => void) | null = null;
    let stopMemberships: (() => void) | null = null;
    let approvalTimer: ReturnType<typeof setTimeout> | null = null;
    let generation = 0;

    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      const sessionGeneration = ++generation;
      stopProfile?.();
      stopMemberships?.();
      stopProfile = null;
      stopMemberships = null;
      if (approvalTimer) clearTimeout(approvalTimer);
      approvalTimer = null;

      if (!firebaseUser) {
        setState({ firebaseUser: null, fermiUser: null, membership: null, loading: false, error: null, membershipJustApproved: false });
        return;
      }

      let profile: FermiUser | null = null;
      let memberships: Membership[] = [];
      let profileReady = false;
      let membershipsReady = false;
      let previousStatus: Membership["status"] | null = null;
      let initialResolution = true;

      setState({ firebaseUser, fermiUser: null, membership: null, loading: true, error: null, membershipJustApproved: false });

      const publish = () => {
        if (sessionGeneration !== generation || !profileReady || !membershipsReady) return;
        const membership = selectMembershipByStatus(memberships, "active")
          ?? selectMembershipByStatus(memberships, "pending")
          ?? (profile?.status === "active" && (profile.role === "admin" || profile.role === "board")
            ? privilegedMembership(profile)
            : null);
        const currentStatus = membership?.status ?? null;
        const justApproved = !initialResolution && previousStatus === "pending" && currentStatus === "active";
        initialResolution = false;
        previousStatus = currentStatus;
        if (approvalTimer) clearTimeout(approvalTimer);
        approvalTimer = null;
        setState({
          firebaseUser,
          fermiUser: profile,
          membership,
          loading: false,
          error: null,
          membershipJustApproved: justApproved,
        });
        if (justApproved) {
          approvalTimer = setTimeout(() => {
            if (sessionGeneration === generation) {
              setState((current) => ({ ...current, membershipJustApproved: false }));
            }
          }, 6000);
        }
      };

      const fail = (error: Error) => {
        if (sessionGeneration !== generation) return;
        console.error("Realtime Fermi session listener failed", error);
        setState({ firebaseUser, fermiUser: null, membership: null, loading: false, error, membershipJustApproved: false });
      };

      stopProfile = subscribeUserProfile(firebaseUser.uid, (user) => {
        profile = user;
        profileReady = true;
        publish();
      }, fail);

      stopMemberships = subscribeUserMemberships(firebaseUser.uid, (items) => {
        memberships = items;
        membershipsReady = true;
        publish();
      }, fail);
    });

    return () => {
      ++generation;
      unsubscribeAuth();
      stopProfile?.();
      stopMemberships?.();
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
