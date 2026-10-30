import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase";
import type {
  AccountStatus,
  FermiUser,
  Membership,
  MembershipPayment,
  MembershipPaymentStatus,
  UserRole,
  AssociationRole,
  AccessLevel,
} from "../models/backend";

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
  associationRole?: AssociationRole;
  accessLevel?: AccessLevel;
  linkedUserId: string | null;
  payment?: MembershipPayment;
  createdAt?: unknown;
  endDate?: string;
  updatedAt?: unknown;
}

export interface AdminPendingApproval {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  requestedAt?: unknown;
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
  associationRole?: AssociationRole;
  accessLevel?: AccessLevel;
  membershipId: string | null;
  endDate: string;
  digitalCardId: string;
  digitalCardEnabled: boolean;
  paymentStatus: MembershipPaymentStatus;
  paymentSource: "manual" | "mollie";
  paymentPaidAt?: unknown;
  paymentConfirmedBy?: string | null;
}

export function subscribePendingApprovals(
  callback: (items: AdminPendingApproval[]) => void,
  onError?: (error: Error) => void,
) {
  let accounts: FermiUser[] = [];
  let pending = new Set<string>();
  let loadedAccounts = false;
  let loadedMemberships = false;
  const publish = () => {
    if (!loadedAccounts || !loadedMemberships) return;
    const items = accounts
      .filter((account) => account.role === "member" && pending.has(account.uid))
      .map((account) => ({
        uid: account.uid,
        firstName: account.profile?.firstName ?? "",
        lastName: account.profile?.lastName ?? "",
        email: account.profile?.email ?? "",
        requestedAt: account.createdAt ?? account.updatedAt,
      }))
      .sort((a, b) => {
        const left = (a.requestedAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        const right = (b.requestedAt as { toMillis?: () => number } | undefined)?.toMillis?.() ?? 0;
        return right - left;
      });
    callback(items);
  };
  const stopAccounts = onSnapshot(collection(db, "users"), (snapshot) => {
    accounts = snapshot.docs.map((item) => item.data() as FermiUser);
    loadedAccounts = true;
    publish();
  }, onError);
  const stopMemberships = onSnapshot(
    query(collection(db, "memberships"), where("status", "==", "pending")),
    (snapshot) => {
      pending = new Set(snapshot.docs.map((item) => (item.data() as Membership).userId));
      loadedMemberships = true;
      publish();
    },
    onError,
  );
  return () => { stopAccounts(); stopMemberships(); };
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

function communityMemberId(row: Pick<AdminMemberRow, "uid" | "id">) {
  return row.uid || row.id;
}

function currentStudyYear(startYear: number | null) {
  if (!startYear) return null;
  const year = new Date().getFullYear();
  const month = new Date().getMonth();
  const academicStartYear = month >= 7 ? year : year - 1;
  const studyYear = academicStartYear - startYear + 1;
  return studyYear > 0 ? studyYear : null;
}

async function writeCommunityMember(row: AdminMemberRow) {
  await setDoc(
    doc(db, "communityMembers", communityMemberId(row)),
    {
      firstName: row.firstName,
      lastName: row.lastName,
      role: row.associationRole ?? "member",
      associationRole: row.associationRole ?? "member",
      startYear: row.startYear,
      active: row.status === "active",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function syncCommunityMembers(rows: AdminMemberRow[]) {
  await Promise.all(rows.map((row) => writeCommunityMember(row)));
}

function usableDigitalCardId(value: string | null | undefined) {
  return value && !value.startsWith("card-") ? value : newDigitalCardId();
}

function membershipPayment(row: AdminMemberRow): MembershipPayment {
  return {
    status: row.paymentStatus,
    source: row.paymentSource || "manual",
    paidAt: row.paymentPaidAt ?? null,
    confirmedBy: row.paymentConfirmedBy ?? null,
    molliePaymentId: null,
  };
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
    const resolvedMembership = membership;
    const resolvedStatus = lifecycleFor(user, resolvedMembership);
    const payment = resolvedMembership?.payment || directory?.payment;
    const paymentStatus: MembershipPaymentStatus =
      payment?.status
      || (resolvedStatus === "active" ? "paid" : "unpaid");

    return {
      id: user.uid,
      source: "account" as const,
      uid: user.uid,
      firstName: user.profile?.firstName ?? directory?.firstName ?? "",
      lastName: user.profile?.lastName ?? directory?.lastName ?? "",
      email,
      memberNumber: resolvedMembership?.memberNumber ?? directory?.memberNumber ?? "",
      academicYear: resolvedMembership?.academicYear ?? directory?.academicYear ?? "2026/2027",
      phone: user.profile?.phone ?? directory?.phone ?? "",
      city: user.profile?.city ?? directory?.city ?? "",
      startYear: resolvedMembership?.startYear ?? (resolvedMembership?.startDate ? Number(resolvedMembership.startDate.slice(0, 4)) : directory?.startYear ?? null),
      status: resolvedStatus,
      role: user.role,
      associationRole: user.associationRole ?? "member",
      accessLevel: user.accessLevel ?? user.role,
      membershipId: membership?.id ?? null,
      endDate: resolvedMembership?.endDate ?? directory?.endDate ?? "",
      digitalCardId: resolvedMembership?.digitalCard?.cardId ?? "",
      digitalCardEnabled: Boolean(resolvedMembership?.digitalCard?.enabled),
      paymentStatus,
      paymentSource: payment?.source || "manual",
      paymentPaidAt: payment?.paidAt,
      paymentConfirmedBy: payment?.confirmedBy ?? null,
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
      associationRole: record.associationRole ?? "member",
      accessLevel: record.accessLevel ?? record.role,
      membershipId: null,
      endDate: record.endDate ?? "",
      digitalCardId: "",
      digitalCardEnabled: false,
      paymentStatus: record.payment?.status || (record.status === "active" ? "paid" : "unpaid"),
      paymentSource: record.payment?.source || "manual",
      paymentPaidAt: record.payment?.paidAt,
      paymentConfirmedBy: record.payment?.confirmedBy ?? null,
    }));

  return [...accountRows, ...directoryRows].sort((a, b) =>
    (a.lastName + a.firstName).localeCompare(b.lastName + b.firstName, "nl"),
  );
}

export async function upsertDirectoryMember(input: Omit<DirectoryMember, "id" | "createdAt" | "updatedAt">) {
  const email = normalizeEmail(input.email);
  if (!email) throw new Error("E-mailadres ontbreekt.");
  const id = directoryId(email);
  const ref = doc(db, "memberDirectory", id);
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

  await writeCommunityMember({
    id,
    source: "directory",
    uid: input.linkedUserId,
    firstName: input.firstName,
    lastName: input.lastName,
    email,
    memberNumber: input.memberNumber,
    academicYear: input.academicYear,
    phone: input.phone,
    city: input.city,
    startYear: input.startYear,
    status: input.status,
    role: input.role,
    membershipId: null,
    endDate: input.endDate ?? "",
    digitalCardId: "",
    digitalCardEnabled: false,
    paymentStatus: input.payment?.status || (input.status === "active" ? "paid" : "unpaid"),
    paymentSource: input.payment?.source || "manual",
    paymentPaidAt: input.payment?.paidAt,
    paymentConfirmedBy: input.payment?.confirmedBy ?? null,
  });
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
    const batch = writeBatch(db);
    batch.update(doc(db, "users", row.uid), {
      status: "suspended" satisfies AccountStatus,
      updatedAt: serverTimestamp(),
    });
    batch.set(doc(db, "communityMembers", row.uid), {
      active: false,
      updatedAt: serverTimestamp(),
    }, { merge: true });
    if (row.membershipId) {
      batch.update(doc(db, "memberships", row.membershipId), {
        digitalCard: { enabled: false, cardId: row.digitalCardId || "" },
        updatedAt: serverTimestamp(),
      });
    }
    await batch.commit();
    return;
  }

  const settled = row.paymentStatus === "paid" || row.paymentStatus === "waived";
  const effectiveStatus = status === "active" && !settled ? "pending" : status;
  const membershipStatus = effectiveStatus === "active" ? "active"
    : effectiveStatus === "pending" ? "pending" : "expired";
  const cardId = usableDigitalCardId(row.digitalCardId);
  const payment = membershipPayment(row);
  const batch = writeBatch(db);
  batch.update(doc(db, "users", row.uid), {
    status: "active" satisfies AccountStatus,
    updatedAt: serverTimestamp(),
  });
  if (row.membershipId) {
    batch.update(doc(db, "memberships", row.membershipId), {
      status: membershipStatus,
      payment,
      digitalCard: { enabled: membershipStatus === "active" && settled, cardId },
      updatedAt: serverTimestamp(),
    });
  } else if (status !== "archived") {
    const year = (row.academicYear || "2026/2027").slice(0, 4);
    batch.set(doc(db, "memberships", `${row.uid}_${year}`), {
      userId: row.uid,
      academicYear: row.academicYear || "2026/2027",
      membershipType: "student",
      status: membershipStatus,
      memberNumber: row.memberNumber || `FERMI-${row.uid.slice(0, 6).toUpperCase()}`,
      startDate: `${year}-09-01`,
      startYear: Number(year),
      endDate: `${Number(year) + 1}-08-31`,
      payment,
      digitalCard: { enabled: membershipStatus === "active" && settled, cardId },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  batch.set(doc(db, "communityMembers", row.uid), {
    active: membershipStatus === "active" && settled,
    updatedAt: serverTimestamp(),
  }, { merge: true });
  await batch.commit();
}

export async function setAdminMemberPaymentStatus(
  row: AdminMemberRow,
  paymentStatus: "unpaid" | "paid" | "waived",
  confirmedBy: string | null,
) {
  const settled = paymentStatus === "paid" || paymentStatus === "waived";
  const payment: MembershipPayment = {
    status: paymentStatus,
    source: "manual",
    paidAt: settled ? serverTimestamp() : null,
    confirmedBy: settled ? confirmedBy : null,
    molliePaymentId: null,
  };

  if (row.source === "directory") {
    const nextStatus: AdminMemberLifecycle =
      settled && row.status === "pending"
        ? "active"
        : row.status;

    await updateDoc(doc(db, "memberDirectory", row.id), {
      status: nextStatus,
      payment,
      updatedAt: serverTimestamp(),
    });
    return;
  }

  if (!row.uid) throw new Error("Dit lid heeft geen gekoppeld account.");

  const cardId = usableDigitalCardId(row.digitalCardId);
  const membershipStatus: "active" | "pending" | "expired" =
    row.status === "archived" ? "expired"
      : row.status === "suspended" ? "pending"
      : settled ? "active" : "pending";

  const batch = writeBatch(db);
  const membershipRef = row.membershipId
    ? doc(db, "memberships", row.membershipId)
    : doc(db, "memberships", `${row.uid}_${(row.academicYear || "2026/2027").slice(0, 4)}`);

  batch.set(membershipRef, {
    userId: row.uid,
    academicYear: row.academicYear || "2026/2027",
    membershipType: "student",
    status: membershipStatus,
    memberNumber: row.memberNumber || `FERMI-${row.uid.slice(0, 6).toUpperCase()}`,
    startDate: row.startYear ? `${row.startYear}-09-01` : "2026-09-01",
    startYear: row.startYear ?? 2026,
    endDate: row.endDate || "2027-08-31",
    payment,
    digitalCard: { enabled: membershipStatus === "active" && settled, cardId },
    updatedAt: serverTimestamp(),
  }, { merge: true });

  batch.update(doc(db, "users", row.uid), {
    status: row.status === "suspended" ? ("suspended" satisfies AccountStatus) : ("active" satisfies AccountStatus),
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(db, "communityMembers", row.uid), {
    active: membershipStatus === "active" && settled,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  await batch.commit();
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
  associationRole?: AssociationRole;
  accessLevel?: AccessLevel;
}

export async function saveAdminMemberDetails(row: AdminMemberRow, input: AdminMemberDetailsInput) {
  const email = normalizeEmail(input.email);
  if (!email) throw new Error("E-mailadres ontbreekt.");

  const settled = row.paymentStatus === "paid" || row.paymentStatus === "waived";
  const effectiveStatus = input.status === "active" && !settled ? "pending" : input.status;

  if (row.source === "directory") {
    const batch = writeBatch(db);
    batch.set(doc(db, "memberDirectory", row.id), {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email,
      memberNumber: input.memberNumber.trim(),
      academicYear: input.academicYear.trim(),
      phone: input.phone.trim(),
      city: input.city.trim(),
      startYear: input.startYear,
      endDate: input.endDate,
      status: effectiveStatus,
      role: input.accessLevel === "qr_scan" ? "member" : (input.accessLevel ?? input.role),
      associationRole: input.associationRole ?? "member",
      accessLevel: input.accessLevel ?? input.role,
      linkedUserId: row.uid,
      payment: membershipPayment(row),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    batch.set(doc(db, "communityMembers", communityMemberId(row)), {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      role: input.associationRole ?? "member",
      associationRole: input.associationRole ?? "member",
      startYear: input.startYear,
      active: effectiveStatus === "active",
      updatedAt: serverTimestamp(),
    }, { merge: true });
    await batch.commit();
    return;
  }

  if (!row.uid) throw new Error("Dit lid heeft geen gekoppeld account.");
  const membershipStatus = effectiveStatus === "active" ? "active"
    : effectiveStatus === "pending" ? "pending" : "expired";
  const payment = membershipPayment(row);
  const cardId = usableDigitalCardId(row.digitalCardId);
  const batch = writeBatch(db);

  batch.update(doc(db, "users", row.uid), {
    "profile.firstName": input.firstName.trim(),
    "profile.lastName": input.lastName.trim(),
    "profile.email": email,
    "profile.phone": input.phone.trim() || null,
    "profile.city": input.city.trim() || null,
    role: input.accessLevel === "qr_scan" ? "member" : (input.accessLevel ?? input.role),
    associationRole: input.associationRole ?? "member",
    accessLevel: input.accessLevel ?? input.role,
    status: input.status === "suspended" ? "suspended" : "active",
    updatedAt: serverTimestamp(),
  });
  batch.set(doc(db, "communityMembers", row.uid), {
    firstName: input.firstName.trim(),
    lastName: input.lastName.trim(),
    role: input.associationRole ?? "member",
    associationRole: input.associationRole ?? "member",
    startYear: input.startYear,
    active: effectiveStatus === "active",
    updatedAt: serverTimestamp(),
  }, { merge: true });

  if (row.membershipId) {
    batch.update(doc(db, "memberships", row.membershipId), {
      academicYear: input.academicYear.trim(),
      memberNumber: input.memberNumber.trim(),
      startYear: input.startYear,
      endDate: input.endDate,
      status: membershipStatus,
      payment,
      digitalCard: { enabled: membershipStatus === "active" && settled, cardId },
      updatedAt: serverTimestamp(),
    });
  } else if (input.status !== "archived" && input.status !== "suspended") {
    const year = (input.academicYear.trim() || "2026/2027").slice(0, 4);
    batch.set(doc(db, "memberships", `${row.uid}_${year}`), {
      userId: row.uid,
      academicYear: input.academicYear.trim() || "2026/2027",
      membershipType: "student",
      status: membershipStatus,
      memberNumber: input.memberNumber.trim(),
      startDate: `${year}-09-01`,
      startYear: Number(year),
      endDate: input.endDate || `${Number(year) + 1}-08-31`,
      payment,
      digitalCard: { enabled: membershipStatus === "active" && settled, cardId },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  await batch.commit();
}
