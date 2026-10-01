import { collection, doc, getDocs, limit, query, serverTimestamp, setDoc, where } from "firebase/firestore";
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

export function getCurrentAcademicYear(date = new Date()): string {
  const year = date.getFullYear();
  const startYear = date.getMonth() >= 8 ? year : year - 1;
  return `${startYear}-${startYear + 1}`;
}

export async function requestMembershipRenewal(userId: string): Promise<string> {
  const academicYear = getCurrentAcademicYear();
  const [startYear, endYear] = academicYear.split("-").map(Number);
  const membershipId = `${userId}_${academicYear}`;

  await setDoc(doc(db, "memberships", membershipId), {
    userId,
    academicYear,
    membershipType: "student",
    status: "pending",
    memberNumber: "",
    startDate: `${startYear}-09-01`,
    endDate: `${endYear}-08-31`,
    digitalCard: { enabled: false, cardId: "" },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return membershipId;
}
