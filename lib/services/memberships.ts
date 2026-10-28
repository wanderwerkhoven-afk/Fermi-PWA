import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { Membership } from "../models/backend";

/**
 * Single membership read gateway for all account-facing flows.
 * Legacy storage remains memberships/{id} keyed by userId until a verified
 * memberId migration is complete. Never select an arbitrary limit(1) document:
 * multiple academic years (and historic duplicates) may exist.
 */
export async function listMembershipsForAccount(userId: string): Promise<Membership[]> {
  const snapshot = await getDocs(query(
    collection(db, "memberships"),
    where("userId", "==", userId),
  ));
  return snapshot.docs.map((item) => ({ ...item.data(), id: item.id } as Membership));
}

function academicYearStart(value: string): number {
  const year = Number(value?.slice(0, 4));
  return Number.isFinite(year) ? year : 0;
}

/** Stable ordering, shared by session, event actions and admin CRM. */
export function selectMembership(
  memberships: Membership[],
  status?: Membership["status"],
): Membership | null {
  const filtered = status ? memberships.filter((item) => item.status === status) : memberships;
  const rank: Record<Membership["status"], number> = {
    active: 0, pending: 1, expired: 2, cancelled: 3,
  };
  return [...filtered].sort((a, b) =>
    rank[a.status] - rank[b.status]
    || academicYearStart(b.academicYear) - academicYearStart(a.academicYear)
    || a.id.localeCompare(b.id)
  )[0] ?? null;
}

export async function getActiveMembership(userId: string): Promise<Membership | null> {
  return selectMembership(await listMembershipsForAccount(userId), "active");
}

export async function getPendingMembership(userId: string): Promise<Membership | null> {
  return selectMembership(await listMembershipsForAccount(userId), "pending");
}

export async function getMembershipAccess(userId: string): Promise<"active" | "pending" | "archive"> {
  const memberships = await listMembershipsForAccount(userId);
  if (selectMembership(memberships, "active")) return "active";
  if (selectMembership(memberships, "pending")) return "pending";
  return "archive";
}
