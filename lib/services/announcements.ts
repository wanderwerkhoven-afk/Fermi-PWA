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

function asAnnouncement(id: string, data: Record<string, unknown>): AnnouncementData {
  return {
    id,
    title: String(data.title || ""),
    summary: String(data.summary || data.body || ""),
    detail: String(data.detail || data.body || ""),
    icon: (data.icon as AnnouncementIcon) || "megaphone",
    actionLabel: String(data.actionLabel || "Bekijk meer"),
    actionRoute: String(data.actionRoute || "/"),
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
  const today = now.toISOString().slice(0, 10);

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
      updatedAt: serverTimestamp(),
      ...(announcement.createdAt ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );
}
