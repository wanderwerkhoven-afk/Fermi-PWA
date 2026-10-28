export type AssociationRole = "member" | "accom" | "educom" | "webcom" | "acquisitiecom" | "sturecom" | "chair" | "vice_chair" | "secretary" | "treasurer" | "general_board";
export type AccessLevel = "member" | "qr_scan" | "committee" | "board" | "admin";
export type UserRole = "member" | "committee" | "board" | "admin";
export type AccountStatus = "active" | "suspended";
export type MembershipStatus = "active" | "expired" | "cancelled" | "pending";
export type MembershipPaymentStatus = "unpaid" | "paid" | "waived" | "refunded";
export type MembershipPaymentSource = "manual" | "mollie";

export interface MembershipPayment {
  status: MembershipPaymentStatus;
  source: MembershipPaymentSource;
  paidAt?: unknown;
  confirmedBy?: string | null;
  molliePaymentId?: string | null;
}

export interface UserProfile {
  firstName: string;
  prefix: string | null;
  lastName: string;
  pronouns: string | null;
  email: string;
  photoUrl: string | null;
  phone: string | null;
  city?: string | null;
  study: string | null;
  studyYear: number | null;
  bio: string | null;
}

export interface CurrentMembershipSnapshot {
  id?: string;
  academicYear: string;
  membershipType: "student" | "alumni" | "honorary";
  status: MembershipStatus;
  memberNumber: string;
  startDate: string;
  startYear?: number | null;
  endDate: string;
  digitalCard: { enabled: boolean; cardId: string };
  payment?: MembershipPayment;
}

export interface FermiUser {
  uid: string;
  /** Stable association identity, populated after verified account linking. */
  memberId?: string | null;
  profile: UserProfile;
  role: UserRole;
  associationRole?: AssociationRole;
  accessLevel?: AccessLevel;
  status: AccountStatus;
  membership?: CurrentMembershipSnapshot | null;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
}

export interface Membership {
  id: string;
  /** Association identity. Optional until existing records are backfilled. */
  memberId?: string;
  userId: string;
  academicYear: string;
  membershipType: "student" | "alumni" | "honorary";
  status: MembershipStatus;
  memberNumber: string;
  startDate: string;
  startYear?: number | null;
  endDate: string;
  digitalCard: { enabled: boolean; cardId: string };
  payment?: MembershipPayment;
  createdAt?: unknown;
  updatedAt?: unknown;
}

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  status: "registered" | "waitlisted" | "cancelled";
  payment: { required: boolean; status: "not_required" | "pending" | "paid" | "refunded" };
  registeredAt?: unknown;
  cancelledAt?: unknown;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  imageUrl: string | null;
  type: "news" | "important" | "event";
  visibility: "members" | "public";
  publishedAt?: unknown;
  expiresAt?: unknown;
  createdBy: string;
  createdAt?: unknown;
}

export interface FermiNotification {
  id: string;
  userId: string;
  type: "event_reminder" | "announcement" | "membership" | "system";
  title: string;
  body: string;
  action?: { type: "event" | "route"; targetId: string };
  read: boolean;
  createdAt?: unknown;
  readAt?: unknown;
}

/** Planned canonical member identity; not yet used as an authorization source. */
export interface FermiMember {
  id: string;
  authUid: string | null;
  profile: UserProfile;
  memberNumber: string;
  associationRole?: AssociationRole;
  createdAt?: unknown;
  updatedAt?: unknown;
}
