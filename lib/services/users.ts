import type { User } from "firebase/auth";
import { doc, getDoc, getDocFromServer, onSnapshot, serverTimestamp, updateDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";
import { syncOwnCommunityProfile } from "./community";
import type { FermiUser } from "../models/backend";

export async function ensureUserProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const names = (user.displayName ?? "").trim().split(/\s+/);
    const batch = writeBatch(db);
    batch.set(ref, {
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    batch.set(membershipDocument(user.uid), pendingMembership(user.uid));
    await batch.commit();
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

function membershipDocument(uid: string) {
  const { startYear } = currentAcademicMembership();
  return doc(db, "memberships", `${uid}_${startYear}`);
}

function pendingMembership(uid: string) {
  return {
    userId: uid,
    ...currentAcademicMembership(),
    membershipType: "student",
    status: "pending",
    memberNumber: "",
    digitalCard: { enabled: false, cardId: crypto.randomUUID() },
    payment: { status: "unpaid", source: "manual", paidAt: null, confirmedBy: null, molliePaymentId: null },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
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
  const batch = writeBatch(db);
  batch.set(doc(db, "users", user.uid), {
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
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
  batch.set(membershipDocument(user.uid), pendingMembership(user.uid));
  await batch.commit();
}


export interface EditableUserProfileInput {
  firstName: string;
  prefix?: string;
  lastName: string;
  pronouns?: string;
  phone?: string;
  city?: string;
  study?: string;
  studyYear?: number | null;
  bio?: string;
}

export async function updateOwnUserProfile(uid: string, _current: FermiUser["profile"], input: EditableUserProfileInput) {
  // Update only edited fields. Replacing the entire profile object could undo a
  // newly uploaded Base64 avatar when the local profile snapshot is stale.
  await updateDoc(doc(db, "users", uid), {
    "profile.firstName": input.firstName.trim(),
    "profile.prefix": input.prefix?.trim() || null,
    "profile.lastName": input.lastName.trim(),
    "profile.pronouns": input.pronouns?.trim() || null,
    "profile.phone": input.phone?.trim() || null,
    "profile.city": input.city?.trim() || null,
    "profile.study": input.study?.trim() || null,
    "profile.studyYear": input.studyYear ?? null,
    "profile.bio": input.bio?.trim() || null,
    updatedAt: serverTimestamp(),
  });
  const saved = await getDocFromServer(doc(db, "users", uid));
  if (saved.exists()) {
    await syncOwnCommunityProfile(uid, (saved.data() as FermiUser).profile);
  }
}
