const assert = require("node:assert/strict");
const fs = require("node:fs");
const { initializeTestEnvironment, assertSucceeds, assertFails } = require("@firebase/rules-unit-testing");

const projectId = "demo-fermi-member-rules";
const membership = (uid, status = "pending") => ({
  userId: uid,
  academicYear: "2026/2027",
  membershipType: "student",
  status,
  memberNumber: status === "pending" ? "" : "FERMI-001",
  startDate: "2026-09-01",
  startYear: 2026,
  endDate: "2027-08-31",
  digitalCard: { enabled: status === "active", cardId: "test-card" },
  payment: {
    status: status === "active" ? "paid" : "unpaid",
    source: "manual",
    paidAt: null,
    confirmedBy: null,
    molliePaymentId: null,
  },
  createdAt: new Date(),
  updatedAt: new Date(),
});

async function main() {
  const env = await initializeTestEnvironment({
    projectId,
    firestore: { rules: fs.readFileSync("firestore.rules", "utf8") },
  });
  try {
    await env.withSecurityRulesDisabled(async (ctx) => {
      const db = ctx.firestore();
      for (const [uid, level] of [
        ["member-a", "member"],
        ["member-b", "member"],
        ["committee-a", "committee"],
        ["board-a", "board"],
        ["admin-a", "admin"],
      ]) {
        await db.doc(`users/${uid}`).set({
          uid, role: level === "board" || level === "admin" ? level : "member",
          accessLevel: level, associationRole: "member", status: "active",
          profile: { firstName: uid, lastName: "Test", email: `${uid}@example.test` },
        });
      }
      await db.doc("memberships/member-a_2026").set(membership("member-a", "active"));
    });

    const dbFor = (uid) => env.authenticatedContext(uid).firestore();
    const own = dbFor("member-a");
    const stranger = dbFor("member-b");
    const committee = dbFor("committee-a");
    const board = dbFor("board-a");
    const admin = dbFor("admin-a");

    await assertSucceeds(own.doc("users/member-a").get());
    await assertFails(stranger.doc("users/member-a").get());
    await assertSucceeds(board.doc("users/member-a").get());
    await assertSucceeds(own.doc("memberships/member-a_2026").get());
    await assertFails(stranger.doc("memberships/member-a_2026").get());
    await assertSucceeds(committee.doc("memberships/member-a_2026").get());

    await assertFails(own.doc("users/member-a").update({ accessLevel: "admin" }));
    await assertFails(board.doc("users/member-a").update({ accessLevel: "admin" }));
    await assertFails(board.doc("users/member-a").update({ role: "admin" }));
    await assertFails(board.doc("users/admin-a").update({ status: "suspended" }));
    await assertSucceeds(admin.doc("users/member-a").update({ accessLevel: "committee" }));
    await assertFails(own.doc("users/member-a").update({ status: "active", role: "admin" }));
    await assertSucceeds(own.doc("users/member-a").update({ "profile.bio": "Test bio" }));
    await assertFails(own.doc("memberships/member-a_2026").update({ "payment.status": "paid" }));
    await assertFails(committee.doc("memberships/member-a_2026").update({ status: "active" }));
    await assertFails(board.doc("memberships/member-a_2026").update({ userId: "member-b" }));
    await assertSucceeds(board.doc("memberships/member-a_2026").update({ status: "pending" }));
    await assertSucceeds(admin.doc("memberships/member-a_2026").update({ status: "active" }));

    await assertSucceeds(stranger.doc("memberships/member-b_2026").set(membership("member-b")));
    await assertFails(stranger.doc("memberships/member-b_2027").set(membership("member-b", "active")));
    await assertFails(stranger.doc("memberships/member-a_2027").set(membership("member-a")));

    await assertFails(own.doc("communityMembers/member-b").set({ firstName: "Fake", lastName: "Member" }));
    await assertSucceeds(board.doc("communityMembers/member-a").set({ firstName: "Member", lastName: "A", active: true }));
    await assertFails(committee.doc("communityMembers/member-a").update({ active: false }));

    console.log("Firestore member security tests passed.");
  } finally {
    await env.cleanup();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
