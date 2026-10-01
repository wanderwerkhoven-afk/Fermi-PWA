import {
  addDoc,
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import type { AccountStatus, FermiUser, Membership, UserRole } from "../models/backend";

export type AdminMemberLifecycle = "active" | "pending" | "suspended" | "archived";

export interface DirectoryMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  memberNumber: string;
  academicYear: string;
  phone: string;
  city: string;
  startYear: number | null;
  status: AdminMemberLifecycle;
  role: UserRole;
  linkedUserId: string | null;
  createdAt?: unknown;
  endDate?: string;
  updatedAt?: unknown;
}

export interface AdminMemberRow {
  id: string;
  source: "account" | "directory";
  uid: string | null;
  firstName: string;
  lastName: string;
  email: string;
  memberNumber: string;
  academicYear: string;
  phone: string;
  city: string;
  startYear: number | null;
  status: AdminMemberLifecycle;
  role: UserRole;
  membershipId: string | null;
  endDate: string;
  digitalCardId: string;
  digitalCardEnabled: boolean;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function directoryId(email: string) {
  return encodeURIComponent(normalizeEmail(email));
}

function newDigitalCardId() {
  return crypto.randomUUID();
}

function usableDigitalCardId(value: string | null | undefined) {
  return value && !value.startsWith("card-") ? value : newDigitalCardId();
}

function lifecycleFor(user: FermiUser, membership?: Membership): AdminMemberLifecycle {
  if (user.status === "suspended") return "suspended";
  if (membership?.status === "active") return "active";
  if (membership?.status === "pending") return "pending";
  return "archived";
}

function pickMembership(items: Membership[]) {
  return [...items].sort((a, b) => {
    const rank: Record<Membership["status"], number> = { active: 0, pending: 1, expired: 2, cancelled: 3 };
    return rank[a.status] - rank[b.status];
  })[0];
}

export async function listAdminMembers(): Promise<AdminMemberRow[]> {
  const [usersSnapshot, membershipsSnapshot, directorySnapshot] = await Promise.all([
    getDocs(collection(db, "users")),
    getDocs(collection(db, "memberships")),
    getDocs(collection(db, "memberDirectory")),
  ]);

  const membershipsByUser = new Map<string, Membership[]>();
  membershipsSnapshot.docs.forEach((snapshot) => {
    const membership = { id: snapshot.id, ...snapshot.data() } as Membership;
    const current = membershipsByUser.get(membership.userId) ?? [];
    current.push(membership);
    membershipsByUser.set(membership.userId, current);
  });

  const directoryByEmail = new Map<string, DirectoryMember>();
  directorySnapshot.docs.forEach((snapshot) => {
    const record = { id: snapshot.id, ...snapshot.data() } as DirectoryMember;
    directoryByEmail.set(normalizeEmail(record.email), record);
  });

  const linkedEmails = new Set<string>();
  const accountRows = usersSnapshot.docs.map((snapshot) => {
    const user = snapshot.data() as FermiUser;
    const email = normalizeEmail(user.profile?.email ?? "");
    linkedEmails.add(email);
    const membership = pickMembership(membershipsByUser.get(user.uid) ?? []);
    const directory = directoryByEmail.get(email);

    return {
      id: user.uid,
      source: "account" as const,
      uid: user.uid,
      firstName: user.profile?.firstName ?? directory?.firstName ?? "",
      lastName: user.profile?.lastName ?? directory?.lastName ?? "",
      email,
      memberNumber: membership?.memberNumber ?? directory?.memberNumber ?? "",
      academicYear: membership?.academicYear ?? directory?.academicYear ?? "2026/2027",
      phone: user.profile?.phone ?? directory?.phone ?? "",
      city: user.profile?.city ?? directory?.city ?? "",
      startYear: membership?.startYear ?? (membership?.startDate ? Number(membership.startDate.slice(0, 4)) : directory?.startYear ?? null),
      status: lifecycleFor(user, membership),
      role: user.role,
      membershipId: membership?.id ?? null,
      endDate: membership?.endDate ?? directory?.endDate ?? "",
      digitalCardId: membership?.digitalCard?.cardId ?? "",
      digitalCardEnabled: Boolean(membership?.digitalCard?.enabled),
    };
  });

  const directoryRows = [...directoryByEmail.values()]
    .filter((record) => !linkedEmails.has(normalizeEmail(record.email)))
    .map((record) => ({
      id: record.id,
      source: "directory" as const,
      uid: record.linkedUserId,
      firstName: record.firstName,
      lastName: record.lastName,
      email: normalizeEmail(record.email),
      memberNumber: record.memberNumber,
      academicYear: record.academicYear,
      phone: record.phone ?? "",
      city: record.city ?? "",
      startYear: record.startYear ?? null,
      status: record.status,
      role: record.role,
      membershipId: null,
      endDate: record.endDate ?? "",
      digitalCardId: "",
      digitalCardEnabled: false,
    }));

  return [...accountRows, ...directoryRows].sort((a, b) =>
    (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName, "nl"),
  );
}

export async function upsertDirectoryMember(input: Omit<DirectoryMember, "id" | "createdAt" | "updatedAt">) {
  const email = normalizeEmail(input.email);
  if (!email) throw new Error("E-mailadres ontbreekt.");
  const ref = doc(db, "memberDirectory", directoryId(email));
  await setDoc(
    ref,
    {
      ...input,
      email,
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function upsertDirectoryMembers(
  items: Array<Omit<DirectoryMember, "id" | "createdAt" | "updatedAt">>,
) {
  for (const item of items) {
    await upsertDirectoryMember(item);
  }
}

export async function setAdminMemberLifecycle(row: AdminMemberRow, status: AdminMemberLifecycle) {
  if (row.source === "directory") {
    await updateDoc(doc(db, "memberDirectory", row.id), {
      status,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  if (!row.uid) throw new Error("Dit lid heeft geen gekoppeld account.");

  if (status === "suspended") {
    await updateDoc(doc(db, "users", row.uid), {
      status: "suspended" satisfies AccountStatus,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  await updateDoc(doc(db, "users", row.uid), {
    status: "active" satisfies AccountStatus,
    updatedAt: serverTimestamp(),
  });

  if (row.membershipId) {
    await updateDoc(doc(db, "memberships", row.membershipId), {
      status: status === "active" ? "active" : status === "pending" ? "pending" : "expired",
      digitalCard: {
        enabled: status === "active",
        cardId: usableDigitalCardId(row.digitalCardId),
      },
      updatedAt: serverTimestamp(),
    });
    return;
  }

  if (status === "archived") return;

  await addDoc(collection(db, "memberships"), {
    userId: row.uid,
    academicYear: row.academicYear || "2026/2027",
    membershipType: "student",
    status: status === "active" ? "active" : "pending",
    memberNumber: row.memberNumber || `FERMI-${row.uid.slice(0, 6).toUpperCase()}`,
    startDate: "2026-09-01",
    startYear: 2026,
    endDate: "2027-08-31",
    digitalCard: { enabled: status === "active", cardId: newDigitalCardId() },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function setAdminMemberRole(row: AdminMemberRow, role: UserRole) {
  if (row.source === "directory") {
    await updateDoc(doc(db, "memberDirectory", row.id), { role, updatedAt: serverTimestamp() });
    return;
  }
  if (!row.uid) throw new Error("Dit lid heeft geen gekoppeld account.");
  await updateDoc(doc(db, "users", row.uid), { role, updatedAt: serverTimestamp() });
}


export interface AdminMemberDetailsInput {
  firstName: string;
  lastName: string;
  email: string;
  memberNumber: string;
  academicYear: string;
  phone: string;
  city: string;
  startYear: number | null;
  endDate: string;
  status: AdminMemberLifecycle;
  role: UserRole;
}

export async function saveAdminMemberDetails(row: AdminMemberRow, input: AdminMemberDetailsInput) {
  const normalized = normalizeEmail(input.email);
  if (!normalized) throw new Error("E-mailadres ontbreekt.");

  if (row.source === "directory") {
    await setDoc(doc(db, "memberDirectory", row.id), {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: normalized,
      memberNumber: input.memberNumber.trim(),
      academicYear: input.academicYear.trim(),
      phone: input.phone.trim(),
      city: input.city.trim(),
      startYear: input.startYear,
      endDate: input.endDate,
      status: input.status,
      role: input.role,
      linkedUserId: row.uid,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    return;
  }

  if (!row.uid) throw new Error("Dit lid heeft geen gekoppeld account.");

  await updateDoc(doc(db, "users", row.uid), {
    "profile.firstName": input.firstName.trim(),
    "profile.lastName": input.lastName.trim(),
    "profile.email": normalized,
    "profile.phone": input.phone.trim() || null,
    "profile.city": input.city.trim() || null,
    role: input.role,
    status: input.status === "suspended" ? "suspended" : "active",
    updatedAt: serverTimestamp(),
  });

  const membershipStatus =
    input.status === "active" ? "active"
    : input.status === "pending" ? "pending"
    : "expired";

  if (row.membershipId) {
    await updateDoc(doc(db, "memberships", row.membershipId), {
      academicYear: input.academicYear.trim(),
      memberNumber: input.memberNumber.trim(),
      startYear: input.startYear,
      endDate: input.endDate,
      status: membershipStatus,
      digitalCard: {
        enabled: input.status === "active",
        cardId: usableDigitalCardId(row.digitalCardId),
      },
      updatedAt: serverTimestamp(),
    });
    return;
  }

  if (input.status === "archived" || input.status === "suspended") return;

  await addDoc(collection(db, "memberships"), {
    userId: row.uid,
    academicYear: input.academicYear.trim() || "2026/2027",
    membershipType: "student",
    status: membershipStatus,
    memberNumber: input.memberNumber.trim(),
    startDate: input.startYear ? `${input.startYear}-09-01` : "2026-09-01",
    startYear: input.startYear,
    endDate: input.endDate || "2027-08-31",
    digitalCard: { enabled: input.status === "active", cardId: newDigitalCardId() },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
