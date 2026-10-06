"use client";

import {
  collection,
  doc,
  getDoc,
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
  const snapshot = await getDoc(doc(db, "activities", slug));
  return snapshot.exists() ? asActivity(snapshot.id, snapshot.data()) : null;
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
