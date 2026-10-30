import { collection, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { Membership } from "../models/backend";

/**
 * Memberships is the authoritative source for academic-year membership state.
 * Never infer access from the legacy users.membership snapshot.
 */
export function selectMembershipByStatus(
  memberships: Membership[],
  status: Membership["status"],
): Membership | null {
  return [...memberships]
    .filter((membership) => membership.status === status)
    .sort((a, b) =>
      b.academicYear.localeCompare(a.academicYear)
      || b.startDate.localeCompare(a.startDate)
      || a.id.localeCompare(b.id),
    )[0] ?? null;
}

export async function getUserMemberships(userId: string): Promise<Membership[]> {
  const snapshot = await getDocs(query(
    collection(db, "memberships"),
    where("userId", "==", userId),
  ));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as Membership));
}

export function subscribeUserMemberships(
  userId: string,
  callback: (memberships: Membership[]) => void,
  onError?: (error: Error) => void,
) {
  return onSnapshot(
    query(collection(db, "memberships"), where("userId", "==", userId)),
    (snapshot) => callback(snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as Membership))),
    (error) => onError?.(error),
  );
}

async function getMembershipByStatus(userId: string, status: Membership["status"]): Promise<Membership | null> {
  return selectMembershipByStatus(await getUserMemberships(userId), status);
}

export function getActiveMembership(userId: string) {
  return getMembershipByStatus(userId, "active");
}

export function getPendingMembership(userId: string) {
  return getMembershipByStatus(userId, "pending");
}

export async function getMembershipAccess(userId: string): Promise<"active" | "pending" | "archive"> {
  const memberships = await getUserMemberships(userId);
  if (selectMembershipByStatus(memberships, "active")) return "active";
  if (selectMembershipByStatus(memberships, "pending")) return "pending";
  return "archive";
}
