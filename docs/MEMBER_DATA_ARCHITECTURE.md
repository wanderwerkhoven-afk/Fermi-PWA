# Member data architecture — migration contract

## Intended collections and ownership

| Collection | Source of truth for | References |
|---|---|---|
| members/{memberId} | Person identity, contact info, study, association metadata | memberId stable and independent of Auth |
| users/{authUid} | Firebase account state, accessLevel, role, memberId | memberId nullable until verified linking |
| memberships/{membershipId} | Academic-year membership, payment, card state | memberId, academicYear; legacy userId during migration |
| communityMembers/{memberId} | Explicitly public profile projection | memberId |
| registrations/{registrationId} | Event attendance and payment | activityId, memberId, membershipId |
| activities/{activityId} | Events | unchanged |
| activityStats/{activityId} | Cached attendee counts | unchanged |
| announcements/{id}, appConfig/{id} | Content and configuration | unchanged |

## Route inventory (current -> future)

| Current reader/writer | Current data | Future |
|---|---|---|
| lib/services/auth.ts -> users.ts | Auth -> users profile + embedded membership | Auth -> users link -> members; create pending membership through secured workflow |
| components/SessionProvider.tsx | users + memberships by userId | users.memberId -> members -> current membership |
| lib/services/memberAdmin.ts | users + memberships + memberDirectory + communityMembers | members + users + memberships; write via admin service and project public fields |
| lib/services/community.ts | communityMembers by authUid | communityMembers by memberId |
| lib/services/profilePhoto.ts | users.profile.photoUrl | members.profile.photoUrl + community projection |
| lib/services/memberships.ts | memberships by userId | memberships by memberId; deterministic current year selection |
| lib/services/registrations.ts | registration eventId__userId, membershipId | eventId__memberId, membershipId |
| lib/services/scanner.ts | cardId -> memberships.userId -> communityMembers -> registrations | cardId -> memberships.memberId -> members public projection -> registrations |
| app/profiel/page.tsx | users.profile + session membership | members.profile + session membership |
| app/profiel/leden-admin/page.tsx | memberAdmin service | same UI, new admin service |
| Firestore security rules | authUid-based ownership | users.memberId lookup + restricted member fields; enforce admin-only account linking |

## Invariants
1. Exactly one stable memberId per person; do not use email as a primary key.
2. A user may be unlinked; a member may have no user account.
3. Only one membership per (memberId, academicYear); historical payments are retained.
4. Public community projection never includes email, phone, payment, private notes, auth tokens or privileges.
5. Registration must reference an existing active membership belonging to memberId.
6. A QR card identifier must be random, unique, revocable and verified server-side.
7. Role/access changes and account linking require trusted admin authorization.
8. All cross-document state transitions use transactions or batches and are tested against rules.

## Rollout stages

- **Stage 1 (this branch):** Shared deterministic membership selection. No schema cutover.
- Stage 2: Read-only production audit and Firestore export; document duplicates/orphans and member identity matching.
- Stage 3: Implement members and secure rules, admin-only linking and backfill with verification report.
- Stage 4: Dual-read migration adapters, then switch profile, CRM, community, session, QR, registration and image routes.
- Stage 5: Cutover writes, migrate registration IDs, verify payment and QR invariants, test permissions.
- Stage 6: Retire memberDirectory and embedded users.membership only after verification and rollback window.

## Safety
Do not delete Auth users or legacy Firestore documents as part of this migration. Firestore Auth deletions do not automatically cascade to Firestore documents. Do not deploy partially migrated writes. Main branch and live database remain unchanged until validation and explicit deployment.
