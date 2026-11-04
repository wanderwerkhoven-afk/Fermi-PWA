# Fermi member data contract

Status: approved architecture target on development branch; not yet fully implemented or deployed.

## Canonical collections

| Collection | Document key | Purpose |
| --- | --- | --- |
| `users` | Firebase Auth UID | Identity-linked profile, association role, access level, account suspension |
| `memberships` | UID + underscore + academic start year | Annual membership, payment, waiver, status, digital card |
| `communityMembers` | Firebase Auth UID | Privacy-safe directory projection for the Community UI |

`users` stores `profile`, `associationRole`, `accessLevel`, `status`, and timestamps. The legacy `role` field remains temporarily for compatibility. Authentication owns passwords and sign-in identity.

`memberships` stores `userId`, `academicYear`, `startYear`, `membershipType`, `status`, `memberNumber`, `startDate`, `endDate`, `payment`, `digitalCard`, and timestamps. Membership and payment state are authoritative here, not in `users`.

`communityMembers` stores only public-safe display fields: first/last name, photo, study, study year, bio, association role, start year, active flag, and update timestamp. Never store email, phone, address, payment, card identifiers, or access rights in this collection. Never authorize from this projection.

## Invariants

- A suspended user cannot have active Community visibility or a usable membership card.
- Pending or unpaid memberships do not grant membership benefits. A paid or waived membership can be active if not expired or cancelled.
- New academic-year renewals must not be hidden by a previous year's active membership.
- Association role (committee/board position) is distinct from access level (permissions).
- Users cannot self-assign privileged roles or mark payments as paid.
- Related admin changes should be committed atomically.
- Activity registrations, events, announcements and notifications remain independent domain collections.

## Transitional code to remove

- `memberDirectory` is legacy, not a fourth canonical source.
- `users.membership` is an in-memory compatibility projection only, not a Firestore source of truth.
- `users.role` is a legacy compatibility field; prefer `associationRole` and `accessLevel`.

There are no active real users and no migration is required. Do not delete any Firebase Authentication accounts, Firestore records, or deploy rules until separately approved. Next steps are removing legacy reads/writes, aligning UI consumers, and extending emulator tests.
