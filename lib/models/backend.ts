export type UserRole = "member" | "committee" | "board" | "admin";
export type AccountStatus = "active" | "pending" | "suspended" | "archived";
export type MembershipStatus = "active" | "expired" | "cancelled" | "pending";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  photoUrl: string | null;
  phone: string | null;
  study: string | null;
  studyYear: number | null;
  bio: string | null;
}

export interface FermiUser {
  uid: string;
  profile: UserProfile;
  role: UserRole;
  status: AccountStatus;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
}

export interface Membership {
  id: string;
  userId: string;
  academicYear: string;
  membershipType: "student" | "alumni" | "honorary";
  status: MembershipStatus;
  memberNumber: string;
  startDate: string;
  endDate: string;
  digitalCard: { enabled: boolean; cardId: string };
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
