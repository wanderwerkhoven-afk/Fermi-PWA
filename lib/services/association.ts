"use client";

import { useEffect, useState } from "react";
import { useFermiSession } from "@/components/SessionProvider";
import { doc, onSnapshot, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { committees } from "@/data/committees";

export type BoardEntry = { id: string; name: string; role: string; description: string; email: string };
export type CommitteeEntry = { slug: string; name: string; fullName: string; description: string; intro: string };
export type AssociationContent = { board: BoardEntry[]; committees: CommitteeEntry[] };

export const defaultAssociation: AssociationContent = {
  board: [
    { id: "voorzitter", name: "Lara Smit", role: "Voorzitter", description: "Verbindt de vereniging en bewaakt de koers.", email: "" },
    { id: "secretaris", name: "Sienna Koomen", role: "Secretaris", description: "Beheert communicatie en administratie.", email: "" },
    { id: "penningmeester", name: "Daan Pronk", role: "Penningmeester", description: "Bewaakt de financiën en het budget.", email: "" },
    { id: "commissaris-sociaal", name: "Helena Diks", role: "Commissaris Sociaal", description: "Organiseert sociale activiteiten voor de leden.", email: "" },
  ],
  committees: committees.map(({ slug, name, fullName, description, intro }) => ({ slug, name, fullName, description, intro })),
};

function normalize(value: Partial<AssociationContent> | undefined): AssociationContent {
  return {
    board: Array.isArray(value?.board) ? value.board.map((entry) => ({
      id: String(entry.id || ""), name: String(entry.name || ""), role: String(entry.role || ""), description: String(entry.description || ""), email: String(entry.email || ""),
    })).filter((entry) => entry.id) : defaultAssociation.board,
    committees: Array.isArray(value?.committees) ? defaultAssociation.committees.map((fallback) => {
      const entry = value.committees?.find((item) => item.slug === fallback.slug);
      return entry ? { slug: fallback.slug, name: String(entry.name || ""), fullName: String(entry.fullName || ""), description: String(entry.description || ""), intro: String(entry.intro || "") } : fallback;
    }) : defaultAssociation.committees,
  };
}

let associationStore: AssociationContent = defaultAssociation;
let associationLoaded = false;
let associationError = "";
let associationUnsubscribe: (() => void) | undefined;
let associationUid: string | null = null;
const subscribers = new Set<() => void>();

function notifyAssociation() { subscribers.forEach((notify) => notify()); }

function startAssociation(uid: string | null) {
  if (associationUid === uid) return;
  associationUnsubscribe?.();
  associationUnsubscribe = undefined;
  associationUid = uid;
  if (!uid) {
    associationStore = defaultAssociation;
    associationLoaded = true;
    associationError = "";
    notifyAssociation();
    return;
  }
  associationUnsubscribe = onSnapshot(doc(db, "appConfig", "association"), (snap) => {
    associationStore = normalize(snap.exists() ? snap.data() as Partial<AssociationContent> : undefined);
    associationLoaded = true;
    associationError = "";
    notifyAssociation();
  }, (cause) => {
    associationError = cause.message;
    associationLoaded = true;
    notifyAssociation();
  });
}

export function useAssociationContent() {
  const { firebaseUser, loading } = useFermiSession();
  const [state, setState] = useState(() => ({ content: associationStore, loaded: associationLoaded, error: associationError }));
  useEffect(() => {
    const update = () => setState({ content: associationStore, loaded: associationLoaded, error: associationError });
    subscribers.add(update);
    if (!loading) startAssociation(firebaseUser?.uid ?? null);
    update();
    return () => { subscribers.delete(update); };
  }, [firebaseUser?.uid, loading]);
  return state;
}

export async function saveAssociationContent(value: AssociationContent) {
  if (value.board.length !== 4 || value.board.some((entry) => !entry.name.trim() || !entry.role.trim())) {
    throw new Error("Vul de namen en functies van alle vier bestuursleden in.");
  }
  await setDoc(doc(db, "appConfig", "association"), {
    ...normalize(value),
    updatedAt: serverTimestamp(),
  }, { merge: true });
}
