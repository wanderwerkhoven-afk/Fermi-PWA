import {
  doc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../firebase";

export type RegistrationState = {
  joined: boolean;
  registeredCount: number;
};

function registrationId(eventId: string, userId: string) {
  return `${eventId}__${userId}`;
}

export function subscribeToRegistrationState(
  eventId: string,
  userId: string | null,
  fallbackCount: number,
  onChange: (state: RegistrationState) => void,
): Unsubscribe {
  let joined = false;
  let registeredCount = fallbackCount;

  const emit = () => onChange({ joined, registeredCount });

  const unsubStats = onSnapshot(
    doc(db, "activityStats", eventId),
    (snapshot) => {
      registeredCount = snapshot.exists()
        ? Math.max(0, Number(snapshot.data().registeredCount) || 0)
        : fallbackCount;
      emit();
    },
    () => emit(),
  );

  let unsubRegistration: Unsubscribe = () => {};
  if (userId) {
    unsubRegistration = onSnapshot(
      doc(db, "registrations", registrationId(eventId, userId)),
      (snapshot) => {
        joined = snapshot.exists() && snapshot.data().status === "registered";
        emit();
      },
      () => emit(),
    );
  } else {
    emit();
  }

  return () => {
    unsubStats();
    unsubRegistration();
  };
}

export async function registerForEventAtomic(
  eventId: string,
  userId: string,
  membershipId: string,
): Promise<{ joined: true; registeredCount: number }> {
  const activityRef = doc(db, "activities", eventId);
  const statsRef = doc(db, "activityStats", eventId);
  const membershipRef = doc(db, "memberships", membershipId);
  const registrationRef = doc(db, "registrations", registrationId(eventId, userId));

  return runTransaction(db, async (transaction) => {
    const [activitySnap, statsSnap, membershipSnap, registrationSnap] = await Promise.all([
      transaction.get(activityRef),
      transaction.get(statsRef),
      transaction.get(membershipRef),
      transaction.get(registrationRef),
    ]);

    if (!activitySnap.exists()) throw new Error("activity/not-found");

    const activity = activitySnap.data();
    const capacity = Math.max(0, Number(activity.capacity) || 0);
    const fallbackCount = Math.max(0, Number(activity.registered) || 0);
    const currentCount = statsSnap.exists()
      ? Math.max(0, Number(statsSnap.data().registeredCount) || 0)
      : fallbackCount;

    if (!membershipSnap.exists()) throw new Error("membership/not-found");
    const membership = membershipSnap.data();
    if (membership.userId !== userId || membership.status !== "active") {
      throw new Error("membership/not-active");
    }

    if (registrationSnap.exists() && registrationSnap.data().status === "registered") {
      return { joined: true as const, registeredCount: currentCount };
    }

    if (capacity > 0 && currentCount >= capacity) {
      throw new Error("activity/full");
    }

    const nextCount = currentCount + 1;

    if (registrationSnap.exists()) {
      transaction.update(registrationRef, {
        membershipId,
        status: "registered",
        cancelledAt: null,
      });
    } else {
      transaction.set(registrationRef, {
        eventId,
        userId,
        membershipId,
        status: "registered",
        payment: { required: false, status: "not_required" },
        registeredAt: serverTimestamp(),
        cancelledAt: null,
      });
    }

    transaction.set(
      statsRef,
      {
        eventId,
        registeredCount: nextCount,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { joined: true as const, registeredCount: nextCount };
  });
}

export async function cancelEventRegistrationAtomic(
  eventId: string,
  userId: string,
): Promise<{ joined: false; registeredCount: number }> {
  const activityRef = doc(db, "activities", eventId);
  const statsRef = doc(db, "activityStats", eventId);
  const registrationRef = doc(db, "registrations", registrationId(eventId, userId));

  return runTransaction(db, async (transaction) => {
    const [activitySnap, statsSnap, registrationSnap] = await Promise.all([
      transaction.get(activityRef),
      transaction.get(statsRef),
      transaction.get(registrationRef),
    ]);

    if (!activitySnap.exists()) throw new Error("activity/not-found");

    const fallbackCount = Math.max(0, Number(activitySnap.data().registered) || 0);
    const currentCount = statsSnap.exists()
      ? Math.max(0, Number(statsSnap.data().registeredCount) || 0)
      : fallbackCount;

    if (!registrationSnap.exists() || registrationSnap.data().status !== "registered") {
      return { joined: false as const, registeredCount: currentCount };
    }

    const nextCount = Math.max(0, currentCount - 1);

    transaction.update(registrationRef, {
      status: "cancelled",
      cancelledAt: serverTimestamp(),
    });

    transaction.set(
      statsRef,
      {
        eventId,
        registeredCount: nextCount,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );

    return { joined: false as const, registeredCount: nextCount };
  });
}
