"use client";

import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import type { UserRole } from "../models/backend";

export interface CommunityDirectoryMember {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  startYear: number | null;
  study: string | null;
  studyYear: number | null;
  photoUrl: string | null;
}

export async function listCommunityMembers(): Promise<CommunityDirectoryMember[]> {
  const snapshot = await getDocs(collection(db, "communityMembers"));

  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as CommunityDirectoryMember & { active?: boolean })
    .filter((member) => member.active !== false)
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "nl"),
    );
}
