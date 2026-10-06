"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { AgendaEvent } from "../data/agenda-events";
import { useFermiSession } from "./SessionProvider";
import {
  listActivities,
  listActivitiesFromCache,
} from "../lib/services/activities";
import {
  listPublishedAnnouncements,
  listPublishedAnnouncementsFromCache,
  type AnnouncementData,
} from "../lib/services/announcements";
import {
  listCommunityMembers,
  listCommunityMembersFromCache,
  type CommunityDirectoryMember,
} from "../lib/services/community";

type AppDataState = {
  activities: AgendaEvent[];
  announcements: AnnouncementData[];
  communityMembers: CommunityDirectoryMember[];
  activitiesLoading: boolean;
  announcementsLoading: boolean;
  communityLoading: boolean;
  communityError: string;
};

const AppDataContext = createContext<AppDataState | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const { firebaseUser, loading: sessionLoading } = useFermiSession();
  const [activities, setActivities] = useState<AgendaEvent[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementData[]>([]);
  const [communityMembers, setCommunityMembers] = useState<CommunityDirectoryMember[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [announcementsLoading, setAnnouncementsLoading] = useState(true);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [communityError, setCommunityError] = useState("");

  useEffect(() => {
    if (sessionLoading) return;
    if (!firebaseUser) {
      setActivities([]);
      setAnnouncements([]);
      setCommunityMembers([]);
      setActivitiesLoading(false);
      setAnnouncementsLoading(false);
      setCommunityLoading(false);
      setCommunityError("");
      return;
    }

    let active = true;

    Promise.allSettled([
      listActivitiesFromCache(),
      listPublishedAnnouncementsFromCache(),
      listCommunityMembersFromCache(),
    ]).then(([cachedActivities, cachedAnnouncements, cachedCommunity]) => {
      if (!active) return;

      if (cachedActivities.status === "fulfilled") {
        setActivities(cachedActivities.value);
        setActivitiesLoading(false);
      }

      if (cachedAnnouncements.status === "fulfilled") {
        setAnnouncements(cachedAnnouncements.value);
        setAnnouncementsLoading(false);
      }

      if (cachedCommunity.status === "fulfilled") {
        setCommunityMembers(cachedCommunity.value);
        setCommunityLoading(false);
      }
    });

    Promise.allSettled([
      listActivities(),
      listPublishedAnnouncements(),
      listCommunityMembers(),
    ]).then(([activitiesResult, announcementsResult, communityResult]) => {
      if (!active) return;

      if (activitiesResult.status === "fulfilled") {
        setActivities(activitiesResult.value);
      } else {
        console.error("Activiteiten laden mislukt", activitiesResult.reason);
      }
      setActivitiesLoading(false);

      if (announcementsResult.status === "fulfilled") {
        setAnnouncements(announcementsResult.value);
      } else {
        console.error("Mededelingen laden mislukt", announcementsResult.reason);
      }
      setAnnouncementsLoading(false);

      if (communityResult.status === "fulfilled") {
        setCommunityMembers(communityResult.value);
        setCommunityError("");
      } else {
        console.error("Communityleden laden mislukt", communityResult.reason);
        setCommunityError("De ledenlijst kon niet worden geladen.");
      }
      setCommunityLoading(false);
    });

    return () => {
      active = false;
    };
  }, [firebaseUser, sessionLoading]);

  const value = useMemo(
    () => ({
      activities,
      announcements,
      communityMembers,
      activitiesLoading,
      announcementsLoading,
      communityLoading,
      communityError,
    }),
    [
      activities,
      announcements,
      communityMembers,
      activitiesLoading,
      announcementsLoading,
      communityLoading,
      communityError,
    ],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const value = useContext(AppDataContext);
  if (!value) throw new Error("useAppData must be used inside AppDataProvider");
  return value;
}
