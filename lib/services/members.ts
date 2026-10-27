import { doc, getDoc, serverTimestamp, setDoc, writeBatch } from "firebase/firestore";
import { db } from "../firebase";

/** A member identity is stable and independent of Firebase Authentication. */
export interface MemberRecord {
  id: string;
  authUid: string | null;
  profile: {
    firstName: string;
    prefix?: string | null;
    lastName: string;
    email: string;
    phone?: string | null;
    city?: string | null;
    study?: string | null;
    studyYear?: number | null;
  };
  membership: {
    academicYear: string;
    status: "pending" | "active" | "expired" | "cancelled";
    memberNumber: string;
    startDate: string;
    endDate: string;
    payment: {
      status: "unpaid" | "paid" | "waived" | "refunded";
      source: "manual" | "mollie";
    };
    digitalCard: { enabled: boolean; cardId: string };
  };
  createdAt?: unknown;
  updatedAt?: unknown;
}

export async function getMember(memberId: string): Promise<MemberRecord | null> {
  const snapshot = await getDoc(doc(db, "members", memberId));
  return snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as MemberRecord) : null;
}

/** Atomic linkage for already-existing accounts; call only from an authorized admin workflow. */
export async function linkMemberAccount(memberId: string, authUid: string): Promise<void> {
  const memberRef = doc(db, "members", memberId);
  const userRef = doc(db, "users", authUid);
  const [member, user] = await Promise.all([getDoc(memberRef), getDoc(userRef)]);
  if (!member.exists() || !user.exists()) throw new Error("member-or-user-not-found");
  if (member.data().authUid && member.data().authUid !== authUid) throw new Error("member-already-linked");
  if (user.data().memberId && user.data().memberId !== memberId) throw new Error("account-already-linked");
  const batch = writeBatch(db);
  batch.update(memberRef, { authUid, updatedAt: serverTimestamp() });
  batch.update(userRef, { memberId, updatedAt: serverTimestamp() });
  await batch.commit();
}

/** Membership history uses a stable academic-year key; never overwrite a paid historical record implicitly. */
export async function createMembershipHistoryIfAbsent(memberId: string, academicYear: string, record: Record<string, unknown>) {
  const ref = doc(db, "members", memberId, "membershipHistory", academicYear.replace("/", "-"));
  const existing = await getDoc(ref);
  if (existing.exists()) return false;
  await setDoc(ref, { ...record, academicYear, createdAt: serverTimestamp() });
  return true;
}
