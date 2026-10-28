import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import type { FermiMember } from "../models/backend";

/**
 * Canonical member identity reads. Account ownership is determined by the
 * admin-controlled users/{uid}.memberId link, never by matching an email.
 */
export async function getMemberById(memberId: string): Promise<FermiMember | null> {
  const snapshot = await getDoc(doc(db, "members", memberId));
  return snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as FermiMember) : null;
}

export async function getMemberByAccountUid(uid: string): Promise<FermiMember | null> {
  const account = await getDoc(doc(db, "users", uid));
  if (!account.exists()) return null;
  const memberId = account.data().memberId;
  if (typeof memberId !== "string" || !memberId) return null;
  const member = await getMemberById(memberId);
  // Fail closed on inconsistent links.
  if (!member || member.authUid !== uid) return null;
  return member;
}
