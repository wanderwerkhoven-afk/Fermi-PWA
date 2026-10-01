import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { Membership } from "../models/backend";

async function getMembershipByStatus(userId: string, status: Membership["status"]): Promise<Membership | null> {
  const snapshot = await getDocs(query(
    collection(db, "memberships"),
    where("userId", "==", userId),
    where("status", "==", status),
    limit(1),
  ));
  if (snapshot.empty) return null;
  const item = snapshot.docs[0];
  return { id: item.id, ...item.data() } as Membership;
}

export function getActiveMembership(userId: string) {
  return getMembershipByStatus(userId, "active");
}

export function getPendingMembership(userId: string) {
  return getMembershipByStatus(userId, "pending");
}

export async function getMembershipAccess(userId: string): Promise<"active" | "pending" | "archive"> {
  if (await getActiveMembership(userId)) return "active";
  if (await getPendingMembership(userId)) return "pending";
  return "archive";
}
