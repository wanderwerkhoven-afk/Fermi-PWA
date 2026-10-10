"use client";

import {
  collection,
  doc,
  getDoc,
  getDocFromCache,
  getDocs,
  getDocsFromCache,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import type { AgendaEvent } from "../../data/agenda-events";

export type ActivityData = AgendaEvent & {
  updatedAt?: unknown;
  createdAt?: unknown;
};

function cleanForFirestore<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function asActivity(id: string, data: Record<string, unknown>): ActivityData {
  return { ...(data as unknown as AgendaEvent), slug: (data.slug as string) || id };
}

export async function listActivities(): Promise<ActivityData[]> {
  const snapshot = await getDocs(collection(db, "activities"));
  return snapshot.docs.map((item) => asActivity(item.id, item.data()));
}

export async function listActivitiesFromCache(): Promise<ActivityData[]> {
  const snapshot = await getDocsFromCache(collection(db, "activities"));
  return snapshot.docs.map((item) => asActivity(item.id, item.data()));
}

export async function getActivity(slug: string): Promise<ActivityData | null> {
  const ref = doc(db, "activities", slug);
  // Read cached documents immediately when offline; do not wait for a network timeout.
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    try {
      const cached = await getDocFromCache(ref);
      return cached.exists() ? asActivity(cached.id, cached.data()) : null;
    } catch {
      return null;
    }
  }
  try {
    const snapshot = await getDoc(ref);
    return snapshot.exists() ? asActivity(snapshot.id, snapshot.data()) : null;
  } catch (error) {
    // A connection may drop after navigator.onLine was checked.
    try {
      const cached = await getDocFromCache(ref);
      return cached.exists() ? asActivity(cached.id, cached.data()) : null;
    } catch {
      throw error;
    }
  }
}

export async function saveActivity(activity: ActivityData): Promise<void> {
  const ref = doc(db, "activities", activity.slug);
  await setDoc(
    ref,
    {
      ...cleanForFirestore(activity),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}
