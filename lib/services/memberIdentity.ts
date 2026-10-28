import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { FermiMember } from "../models/backend";

/**
 * Read-only gateway for canonical association identities.
 * Writes and account linking must go through a separately authorized migration
 * or admin workflow, never a public client-side self-link based on email.
 */
export async function getMemberById(memberId: string): Promise<FermiMember | null> {
  const snapshot = await getDoc(doc(db, "members", memberId));
  return snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as FermiMember) : null;
}

export async function getMemberByAccountUid(uid: string): Promise<FermiMember | null> {
  const snapshot = await getDocs(query(collection(db, "members"), where("authUid", "==", uid)));
  // Fail closed on ambiguous identity links rather than choosing an arbitrary member.
  if (snapshot.size !== 1) return null;
  const item = snapshot.docs[0];
  return { ...item.data(), id: item.id } as FermiMember;
}
