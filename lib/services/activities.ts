"use client";

import {
  collection,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { agendaEvents, type AgendaEvent } from "../../data/agenda-events";

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
  if (snapshot.empty) return agendaEvents;
  return snapshot.docs.map((item) => asActivity(item.id, item.data()));
}

export async function getActivity(slug: string): Promise<ActivityData | null> {
  const snapshot = await getDoc(doc(db, "activities", slug));
  if (snapshot.exists()) return asActivity(snapshot.id, snapshot.data());
  return agendaEvents.find((event) => event.slug === slug) ?? null;
}

export async function seedActivitiesIfMissing(): Promise<void> {
  await Promise.all(
    agendaEvents.map(async (event) => {
      const ref = doc(db, "activities", event.slug);
      const existing = await getDoc(ref);
      if (existing.exists()) return;
      await setDoc(ref, {
        ...cleanForFirestore(event),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }),
  );
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
