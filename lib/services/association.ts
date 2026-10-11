"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
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

export function useAssociationContent() {
  const [content, setContent] = useState<AssociationContent>(defaultAssociation);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let unsubscribeDocument: (() => void) | undefined;
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      unsubscribeDocument?.();
      unsubscribeDocument = undefined;
      if (!user) {
        setContent(defaultAssociation);
        setLoaded(true);
        setError("");
        return;
      }
      unsubscribeDocument = onSnapshot(doc(db, "appConfig", "association"), (snap) => {
        setContent(normalize(snap.exists() ? snap.data() as Partial<AssociationContent> : undefined));
        setLoaded(true);
        setError("");
      }, (cause) => {
        setError(cause.message);
        setLoaded(true);
      });
    });
    return () => { unsubscribeAuth(); unsubscribeDocument?.(); };
  }, []);
  return { content, loaded, error };
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
