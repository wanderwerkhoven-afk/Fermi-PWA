# Fermi PWA — leden-data-architectuur v2 (ontwikkelplan)

Status: ontwerp in ontwikkelbranch; geen productie- of Firestore-wijzigingen uitgevoerd.

## Uitgangspunten
- Huidige leden, activiteiten en adminaccount zijn dummydata; geen migratie van die data vereist.
- Firebase Authentication blijft de bron voor accountidentiteit (UID).
- Firestore `users/{uid}` bevat profiel, communityrollen en `accessLevel`; geen gezaghebbende lidmaatschaps- of betaalstatus.
- `memberships/{membershipId}` is de enige gezaghebbende bron voor lidmaatschap per studiejaar, status, betaalstatus, vrijstelling en digitale ledenpas.
- `registrations` verwijst naar activiteit, UID en het relevante lidmaatschap.
- `communityMembers` is uitsluitend een afgeleide, publiek toegankelijke profielweergave, nooit de bron voor autorisatie.
- `memberDirectory` wordt pas verwijderd nadat alle lees- en schrijfroutes zijn vervangen en getest.
- Administratieve writes gebeuren atomisch (Firestore transaction/batch waar passend) en zijn beveiligd via Firestore Rules of vertrouwde servercode.
- Alleen geverifieerde, expliciet bevoegde beheerders kunnen rechten en betaalstatus wijzigen.

## Te inventariseren bestaande routes
- `lib/models/backend.ts`: modellen en lidmaatschapssnapshot
- `lib/services/users.ts`: profiel en synchronisatie
- `lib/services/memberships.ts`: lidmaatschapsqueries
- `lib/services/memberAdmin.ts`: CRM, directory en betaalwrites
- `lib/services/auth.ts`: registratie en accountbootstrap
- `lib/services/scanner.ts`: QR-verificatie
- `lib/services/registrations.ts`: activiteitinschrijvingen
- `components/SessionProvider.tsx`: sessie en toegang
- `firestore.rules`: autorisatie en integriteitsregels

## Uitvoeringsvolgorde
1. Alle data-afhankelijkheden en documentvarianten inventariseren; datacontract vastleggen.
2. Nieuwe modellen en centraal servicecontract toevoegen.
3. Schrijfoperaties omzetten naar één consistente route met integriteitscontroles.
4. Leesroutes, sessie, ledenpas, scanner, community en CRM aansluiten.
5. Firestore Rules en noodzakelijke indexen aanpassen.
6. Tests: registratie, herinschrijving, betaling, vrijstelling, rollen, QR, activiteitinschrijving en verwijderde account.
7. Firebase Emulator gebruiken voor end-to-end-tests; geen productiedata wissen.
8. Pas na review optioneel dummydata opruimen en branch via PR samenvoegen.

## Veiligheidsvoorwaarden
- Geen Firebase-deploy of verwijdering van gegevens zonder afzonderlijke bevestiging.
- `main` blijft ongemoeid tot een beoordeelde pull request.
- Eerste adminaccount wordt veilig via Firebase Authentication aangemaakt; toekenning van adminrechten via gecontroleerde bootstrap, niet via een zelfserviceprofielveld.
- Graphify-uitvoer bevat veel vendor-PDF.js-code; gebruik het rapport alleen samen met broncodecontrole.
