import { collection, doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import type { FermiUser } from "../models/backend";

/** Admin-only transaction: create a member and link an existing account. */
export async function adoptAccountAsMember(uid: string): Promise<string> {
  if (!uid) throw new Error("member/invalid-uid");
  const userRef = doc(db, "users", uid);
  const memberRef = doc(collection(db, "members"));
  return runTransaction(db, async (tx) => {
    const user = await tx.get(userRef);
    if (!user.exists()) throw new Error("member/account-not-found");
    const account = user.data() as FermiUser;
    if (account.memberId) {
      const existing = await tx.get(doc(db, "members", account.memberId));
      if (!existing.exists() || existing.data().authUid !== uid) throw new Error("member/inconsistent-link");
      return account.memberId;
    }
    if (!account.profile) throw new Error("member/missing-profile");
    tx.set(memberRef, {
      authUid: uid,
      profile: account.profile,
      memberNumber: account.membership?.memberNumber || "",
      associationRole: account.associationRole || "member",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    tx.update(userRef, { memberId: memberRef.id, updatedAt: serverTimestamp() });
    return memberRef.id;
  });
}
