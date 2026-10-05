"use client";

import {
  collection,
  doc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export type AnnouncementIcon = "megaphone" | "calendar" | "shop" | "info";

export type AnnouncementData = {
  id: string;
  title: string;
  summary: string;
  detail: string;
  icon: AnnouncementIcon;
  actionLabel: string;
  actionRoute: string;
  published: boolean;
  pinned: boolean;
  startsAt: string;
  expiresAt: string;
  createdBy?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};

export function normalizeAnnouncementRoute(value: string): string {
  const route = value.trim();

  if (!route) return "/";

  // Keep explicit external/contact links untouched.
  if (/^(https?:\/\/|mailto:|tel:)/i.test(route)) {
    return route;
  }

  // Announcement routes are app routes. Always make them root-relative so
  // Next.js does not resolve them relative to the page the user is on.
  let normalized = route.startsWith("/") ? route : `/${route}`;

  // A slash directly before a query/hash is not part of our static route.
  // Example: /agenda/activiteit/?slug=bowlen -> /agenda/activiteit?slug=bowlen
  normalized = normalized.replace(/\/+([?#])/g, "$1");

  // Friendly shortcut used in the CRM: "activiteit?slug=..." points to the
  // actual static activity detail route under /agenda.
  if (
    normalized === "/activiteit"
    || normalized.startsWith("/activiteit?")
    || normalized.startsWith("/activiteit#")
  ) {
    normalized = `/agenda${normalized}`;
  }

  return normalized;
}

function asAnnouncement(id: string, data: Record<string, unknown>): AnnouncementData {
  return {
    id,
    title: String(data.title || ""),
    summary: String(data.summary || data.body || ""),
    detail: String(data.detail || data.body || ""),
    icon: (data.icon as AnnouncementIcon) || "megaphone",
    actionLabel: String(data.actionLabel || "Bekijk meer"),
    actionRoute: normalizeAnnouncementRoute(String(data.actionRoute || "/")),
    published: data.published !== false,
    pinned: data.pinned === true,
    startsAt: String(data.startsAt || ""),
    expiresAt: String(data.expiresAt || ""),
    createdBy: typeof data.createdBy === "string" ? data.createdBy : undefined,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function listAnnouncements(): Promise<AnnouncementData[]> {
  const snapshot = await getDocs(collection(db, "announcements"));
  return snapshot.docs.map((item) => asAnnouncement(item.id, item.data()));
}

export async function listPublishedAnnouncements(): Promise<AnnouncementData[]> {
  const now = new Date();
  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  return (await listAnnouncements())
    .filter((item) => item.published)
    .filter((item) => !item.startsAt || item.startsAt <= today)
    .filter((item) => !item.expiresAt || item.expiresAt >= today)
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));
}

export async function saveAnnouncement(announcement: AnnouncementData): Promise<void> {
  await setDoc(
    doc(db, "announcements", announcement.id),
    {
      ...announcement,
      actionRoute: normalizeAnnouncementRoute(announcement.actionRoute),
      updatedAt: serverTimestamp(),
      ...(announcement.createdAt ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );
}
