import { collection, getDocs, limit, query, where } from "firebase/firestore";
import { db } from "../firebase";
import type { Membership } from "../models/backend";

export async function getActiveMembership(userId: string): Promise<Membership | null> {
  const q = query(
    collection(db, "memberships"),
    where("userId", "==", userId),
    where("status", "==", "active"),
    limit(1),
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const item = snapshot.docs[0];
  return { id: item.id, ...item.data() } as Membership;
}
