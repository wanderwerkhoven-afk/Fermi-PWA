import type { User } from "firebase/auth";
import { doc, getDoc, onSnapshot, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { FermiUser } from "../models/backend";

export async function ensureUserProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const names = (user.displayName ?? "").trim().split(/\s+/);
    const membershipDates = currentAcademicMembership();
    const cardId = crypto.randomUUID();

    await setDoc(ref, {
      uid: user.uid,
      profile: {
        firstName: names[0] ?? "",
        prefix: null,
        lastName: names.slice(1).join(" "),
        pronouns: null,
        email: user.email ?? "",
        photoUrl: user.photoURL ?? null,
        phone: null,
        study: null,
        studyYear: null,
        bio: null,
      },
      role: "member",
      status: "active",
      membership: {
        ...membershipDates,
        membershipType: "student",
        status: "pending",
        memberNumber: "",
        digitalCard: { enabled: false, cardId },
        payment: {
          status: "unpaid",
          source: "manual",
          paidAt: null,
          confirmedBy: null,
          molliePaymentId: null,
        },
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    return;
  }

  await updateDoc(ref, { lastLoginAt: serverTimestamp(), updatedAt: serverTimestamp() });
}

export async function getUserProfile(uid: string): Promise<FermiUser | null> {
  const snapshot = await getDoc(doc(db, "users", uid));
  return snapshot.exists() ? (snapshot.data() as FermiUser) : null;
}

export function subscribeUserProfile(
  uid: string,
  callback: (user: FermiUser | null) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    doc(db, "users", uid),
    (snapshot) => callback(snapshot.exists() ? (snapshot.data() as FermiUser) : null),
    (error) => onError?.(error),
  );
}

function currentAcademicMembership() {
  const now = new Date();
  const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
  const endYear = startYear + 1;
  return {
    academicYear: `${startYear}/${endYear}`,
    startDate: `${startYear}-09-01`,
    endDate: `${endYear}-08-31`,
    startYear,
  };
}

export interface RegistrationProfileInput {
  firstName: string;
  prefix?: string;
  lastName: string;
  pronouns?: string;
  email: string;
  phone?: string;
  study?: string;
  studyYear?: number | null;
}

export async function createRegisteredUserProfile(user: User, input: RegistrationProfileInput) {
  const membershipDates = currentAcademicMembership();
  const cardId = crypto.randomUUID();

  await setDoc(doc(db, "users", user.uid), {
    uid: user.uid,
    profile: {
      firstName: input.firstName.trim(),
      prefix: input.prefix?.trim() || null,
      lastName: input.lastName.trim(),
      pronouns: input.pronouns?.trim() || null,
      email: input.email.trim().toLowerCase(),
      photoUrl: null,
      phone: input.phone?.trim() || null,
      study: input.study?.trim() || null,
      studyYear: input.studyYear ?? null,
      bio: null,
    },
    role: "member",
    status: "active",
    membership: {
      ...membershipDates,
      membershipType: "student",
      status: "pending",
      memberNumber: "",
      digitalCard: { enabled: false, cardId },
      payment: {
        status: "unpaid",
        source: "manual",
        paidAt: null,
        confirmedBy: null,
        molliePaymentId: null,
      },
    },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
}
