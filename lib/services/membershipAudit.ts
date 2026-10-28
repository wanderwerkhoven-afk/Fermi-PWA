import type { Membership } from "../models/backend";

export type MembershipAuditIssue =
  | { kind: "duplicate-year"; userId: string; academicYear: string; documentIds: string[] }
  | { kind: "missing-account"; userId: string; documentIds: string[] }
  | { kind: "conflicting-active"; userId: string; documentIds: string[] }
  | { kind: "duplicate-card"; cardId: string; documentIds: string[] };

/** Read-only audit. Never mutates Firestore or exports personal profiles. */
export function auditMembershipReferences(
  memberships: Membership[],
  knownAccountIds: ReadonlySet<string>,
): MembershipAuditIssue[] {
  const issues: MembershipAuditIssue[] = [];
  const byUser = new Map<string, Membership[]>();
  const byCard = new Map<string, Membership[]>();

  for (const item of memberships) {
    const userId = item.userId || "";
    byUser.set(userId, [...(byUser.get(userId) ?? []), item]);
    const cardId = item.digitalCard?.cardId;
    if (cardId) byCard.set(cardId, [...(byCard.get(cardId) ?? []), item]);
  }

  for (const [userId, records] of byUser) {
    if (!userId || !knownAccountIds.has(userId)) {
      issues.push({ kind: "missing-account", userId, documentIds: records.map((r) => r.id) });
    }
    const byYear = new Map<string, Membership[]>();
    for (const record of records) {
      byYear.set(record.academicYear, [...(byYear.get(record.academicYear) ?? []), record]);
    }
    for (const [academicYear, sameYear] of byYear) {
      if (sameYear.length > 1) {
        issues.push({ kind: "duplicate-year", userId, academicYear, documentIds: sameYear.map((r) => r.id) });
      }
    }
    const active = records.filter((r) => r.status === "active");
    if (active.length > 1) {
      issues.push({ kind: "conflicting-active", userId, documentIds: active.map((r) => r.id) });
    }
  }

  for (const [cardId, records] of byCard) {
    if (records.length > 1) {
      issues.push({ kind: "duplicate-card", cardId, documentIds: records.map((r) => r.id) });
    }
  }
  return issues;
}
