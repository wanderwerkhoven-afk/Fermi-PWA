# Member data model migration (staged)

## Target
- `members/{memberId}`: canonical member identity, private profile, current membership/payment/card.
- `users/{authUid}`: login-linked account, `memberId`, role and accessLevel.
- `members/{memberId}/membershipHistory/{academicYear}`: historical membership records.
- `communityMembers/{memberId}`: minimal privacy-safe projection.
- `registrations/{eventId}__{memberId}`: eventual stable membership references.

## Important: not deployed
The existing application still reads `memberships` for event registration, QR verification and sessions. Do not delete `memberships`, `users`, `communityMembers`, `registrations` or authentication accounts as a migration technique. This branch introduces a foundation, not a completed cutover.

## Safe rollout
1. Export Firestore and record document counts; classify duplicate (userId, academicYear), missing user references, unmatched community records, and payment discrepancies.
2. Backfill members with deterministic IDs and a crosswalk of legacy userId, membershipId, memberId. Preserve originals and payment metadata.
3. Add secured backend/admin-only writes, rules and tests; use transactions for account linking and historical membership creation.
4. Migrate registration, QR scanner, member admin, session and profile reads behind an adapter; run both paths in parallel and compare results.
5. Switch to canonical reads and writes only after tests and audit pass. Keep legacy collections read-only during verification.
6. Remove legacy paths only after verifying production data and having a rollback plan.

## Security constraints
- Never expose email, phone, payment or access rights through communityMembers.
- Never authorize user role changes or member-account linking from a normal member client.
- Validate authUid ownership, uniqueness and active membership server-side.
- Do not use email as a primary identifier.
- Historical payments must remain immutable without explicit admin correction and audit log.

## Current status
New service `lib/services/members.ts` is an initial API foundation. It is not yet wired into the application, and production Firestore rules do not currently grant access to the new members collection. The account-linking helper is intended for a future admin-only workflow and must not be exposed to ordinary users.
