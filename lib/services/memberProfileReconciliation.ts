import { doc, runTransaction, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import type { FermiUser } from "../models/backend";

export async function reconcileMemberProfileFromAccount(uid: string): Promise<void> {
  const accountRef = doc(db, "users", uid);
  await runTransaction(db, async (tx) => {
    const accountSnap = await tx.get(accountRef);
    if (!accountSnap.exists()) throw new Error("member/account-not-found");
    const account = accountSnap.data() as FermiUser;
    if (!account.memberId) throw new Error("member/not-linked");
    const memberRef = doc(db, "members", account.memberId);
    const memberSnap = await tx.get(memberRef);
    if (!memberSnap.exists() || memberSnap.data().authUid !== uid) {
      throw new Error("member/inconsistent-link");
    }
    tx.update(memberRef, { profile: account.profile, updatedAt: serverTimestamp() });
  });
}
