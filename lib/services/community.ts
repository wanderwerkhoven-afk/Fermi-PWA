"use client";

import { collection, getDocs, getDocsFromCache } from "firebase/firestore";
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

function mapCommunityMembers(snapshot: Awaited<ReturnType<typeof getDocs>>): CommunityDirectoryMember[] {
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as CommunityDirectoryMember & { active?: boolean })
    .filter((member) => member.active !== false)
    .sort((a, b) =>
      `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`, "nl"),
    );
}

export async function listCommunityMembers(): Promise<CommunityDirectoryMember[]> {
  return mapCommunityMembers(await getDocs(collection(db, "communityMembers")));
}

export async function listCommunityMembersFromCache(): Promise<CommunityDirectoryMember[]> {
  return mapCommunityMembers(await getDocsFromCache(collection(db, "communityMembers")));
}
