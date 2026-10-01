import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../firebase";

const verificationActionCodeSettings = {
  url: "https://wanderwerkhoven-afk.github.io/Fermi-PWA/login/",
  handleCodeInApp: false,
};
import { ensureUserProfile, createRegisteredUserProfile, type RegistrationProfileInput } from "./users";

export function isHvaEmail(email: string) {
  const domain = email.trim().toLowerCase().split("@")[1] ?? "";
  return domain === "hva.nl" || domain.endsWith(".hva.nl");
}

export async function registerWithEmail(email: string, password: string, profile: Omit<RegistrationProfileInput, "email">): Promise<User> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!isHvaEmail(normalizedEmail)) throw new Error("auth/non-hva-email");
  const result = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
  await createRegisteredUserProfile(result.user, { ...profile, email: normalizedEmail });
  auth.languageCode = "nl";
  await sendEmailVerification(result.user, verificationActionCodeSettings);
  return result.user;
}

export async function resendVerificationEmail(user: User) {
  auth.languageCode = "nl";
  await sendEmailVerification(user, verificationActionCodeSettings);
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
  await ensureUserProfile(result.user);
  return result.user;
}

export function logOut() {
  return signOut(auth);
}
