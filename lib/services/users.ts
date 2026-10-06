import type { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { FermiUser } from "../models/backend";

export async function ensureUserProfile(user: User) {
  const ref = doc(db, "users", user.uid);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) {
    const names = (user.displayName ?? "").trim().split(/\s+/);
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
      membership: null,
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
    membership: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp(),
  });
}
