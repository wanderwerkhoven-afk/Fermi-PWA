import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "../firebase";
import { ensureUserProfile } from "./users";

export async function signInWithGoogle(): Promise<User> {
  const result = await signInWithPopup(auth, new GoogleAuthProvider());
  await ensureUserProfile(result.user);
  return result.user;
}

export async function registerWithEmail(email: string, password: string): Promise<User> {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(result.user);
  return result.user;
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const result = await signInWithEmailAndPassword(auth, email, password);
  await ensureUserProfile(result.user);
  return result.user;
}

export function logOut() {
  return signOut(auth);
}
