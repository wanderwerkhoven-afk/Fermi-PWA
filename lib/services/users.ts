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
        lastName: names.slice(1).join(" "),
        email: user.email ?? "",
        photoUrl: user.photoURL ?? null,
        phone: null,
        study: null,
        studyYear: null,
        bio: null,
      },
      role: "member",
      status: "pending",
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
