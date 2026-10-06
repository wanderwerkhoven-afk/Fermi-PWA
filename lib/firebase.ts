import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAfUllmC-lkPDZawiMeh92mocdQtz7kky4",
  authDomain: "sv-fermi.firebaseapp.com",
  projectId: "sv-fermi",
  storageBucket: "sv-fermi.firebasestorage.app",
  messagingSenderId: "161562939260",
  appId: "1:161562939260:web:314580381499b0bd651ef9",
  measurementId: "G-M0QVBNJ9HM",
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
export const db = initializeFirestore(firebaseApp, {\n  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),\n});
export const storage = getStorage(firebaseApp);

export async function initializeAnalytics() {
  if (typeof window === "undefined") return null;

  const { getAnalytics, isSupported } = await import("firebase/analytics");
  if (!(await isSupported())) return null;

  return getAnalytics(firebaseApp);
}
