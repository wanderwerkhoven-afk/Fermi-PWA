import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { db } from "../firebase";
import type { EventRegistration } from "../models/backend";

export async function getMyRegistrations(userId: string): Promise<EventRegistration[]> {
  const snapshot = await getDocs(query(collection(db, "registrations"), where("userId", "==", userId)));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as EventRegistration);
}

export async function registerForEvent(eventId: string, userId: string) {
  return addDoc(collection(db, "registrations"), {
    eventId,
    userId,
    status: "registered",
    payment: { required: false, status: "not_required" },
    registeredAt: serverTimestamp(),
    cancelledAt: null,
  });
}
