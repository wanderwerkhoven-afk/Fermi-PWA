"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";
import type { Membership } from "../models/backend";

const MEMBER_QR_PREFIX = "SVFERMI:MEMBER:v1:";

export type ScanVerification =
  | {
      ok: true;
      reason: "registered";
      cardId: string;
      membershipId: string;
      userId: string;
      memberNumber: string;
      memberName: string;
    }
  | {
      ok: false;
      reason: "invalid_qr" | "unknown_card" | "inactive_membership" | "not_registered" | "membership_mismatch";
      cardId?: string;
      membershipId?: string;
      userId?: string;
      memberNumber?: string;
      memberName?: string;
    };

export function parseMemberQrPayload(payload: string): string | null {
  const value = payload.trim();
  if (!value.startsWith(MEMBER_QR_PREFIX)) return null;
  const cardId = value.slice(MEMBER_QR_PREFIX.length).trim();
  return cardId && !cardId.includes(":") ? cardId : null;
}

async function getMemberName(userId: string) {
  try {
    const snapshot = await getDoc(doc(db, "communityMembers", userId));
    if (!snapshot.exists()) return "";
    const data = snapshot.data();
    return [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  } catch {
    return "";
  }
}

export async function verifyMemberForEvent(payload: string, eventId: string): Promise<ScanVerification> {
  const cardId = parseMemberQrPayload(payload);
  if (!cardId) return { ok: false, reason: "invalid_qr" };

  const memberships = await getDocs(
    query(
      collection(db, "memberships"),
      where("digitalCard.cardId", "==", cardId),
      limit(1),
    ),
  );

  if (memberships.empty) {
    return { ok: false, reason: "unknown_card", cardId };
  }

  const membershipDoc = memberships.docs[0];
  const membership = { id: membershipDoc.id, ...membershipDoc.data() } as Membership;
  const memberName = await getMemberName(membership.userId);

  const base = {
    cardId,
    membershipId: membership.id,
    userId: membership.userId,
    memberNumber: membership.memberNumber || "",
    memberName,
  };

  if (membership.status !== "active" || membership.digitalCard?.enabled !== true) {
    return { ok: false, reason: "inactive_membership", ...base };
  }

  const registrationSnapshot = await getDoc(
    doc(db, "registrations", `${eventId}__${membership.userId}`),
  );

  if (!registrationSnapshot.exists() || registrationSnapshot.data().status !== "registered") {
    return { ok: false, reason: "not_registered", ...base };
  }

  const registration = registrationSnapshot.data();
  if (registration.membershipId !== membership.id) {
    return { ok: false, reason: "membership_mismatch", ...base };
  }

  return { ok: true, reason: "registered", ...base };
}
