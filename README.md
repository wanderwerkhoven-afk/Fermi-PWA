# Fermi-PWA

Ledenapp van S.V. Fermi, gebouwd als Progressive Web App.

## Projectdocumentatie

- [Draaiboek](docs/DRAAIBOEK.md) — productvisie, MVP, functionaliteiten, rollen, architectuur, datamodel en ontwikkelfasen.
- [Team Fermi](AGENTS.md) — agentrollen en ontwikkelworkflow.
- [README Documentation Agent](.agents/skills/readme-documentation-agent/SKILL.md) — onderhoudsregels voor deze codekaart.

## Codekaart — functie naar broncode

Deze index is op 26 oktober 2026 gecontroleerd tegen bestaande repositorybestanden. Bij een wijziging: begin bij de betreffende rij en inspecteer vervolgens imports en aanroepplaatsen. Meerdere paden per rij zijn afzonderlijke codeverantwoordelijkheden.

| Functie/scherm | Bronbestanden | Waarvoor? |
| --- | --- | --- |
| Home en featured activiteiten | [`app/page.tsx`](app/page.tsx) | Home-layout, cards, meldingen en ledenpas-integratie |
| Agenda en kalender | [`app/agenda/page.tsx`](app/agenda/page.tsx) | Agendaweergave, filters, kalender en afbeeldingen |
| Activiteitdetail-route | [`app/agenda/activiteit/page.tsx`](app/agenda/activiteit/page.tsx), [`components/events/ActivityRouteClient.tsx`](components/events/ActivityRouteClient.tsx) | Route en selectie van detailweergave |
| Fermi overzicht | [`app/fermi/page.tsx`](app/fermi/page.tsx), [`data/committees.ts`](data/committees.ts), [`lib/services/association.ts`](lib/services/association.ts) | Verenigingspagina, commissiegegevens en content |
| Bestuur | [`app/fermi/bestuur/page.tsx`](app/fermi/bestuur/page.tsx), [`lib/services/association.ts`](lib/services/association.ts) | Bestuurspagina en beheerde inhoud |
| Commissiedetail | [`app/fermi/commissies/[slug]/page.tsx`](app/fermi/commissies/%5Bslug%5D/page.tsx), [`data/committees.ts`](data/committees.ts) | Dynamische commissieroute en commissiegegevens |
| Community | [`app/community/page.tsx`](app/community/page.tsx), [`lib/services/community.ts`](lib/services/community.ts), [`components/AppDataProvider.tsx`](components/AppDataProvider.tsx) | Ledenoverzicht, filters en Firestore-data |
| Profiel en profielinstellingen | [`app/profiel/page.tsx`](app/profiel/page.tsx), [`lib/services/users.ts`](lib/services/users.ts) | Profielweergave en profielgegevens |
| Profielfoto | [`app/profiel/page.tsx`](app/profiel/page.tsx), [`lib/services/profilePhoto.ts`](lib/services/profilePhoto.ts), [`storage.rules`](storage.rules) | Upload/verwijderen en opslagbeveiliging; editor verder inventariseren |
| Ledenpas QR-code | [`components/MemberQrCode.tsx`](components/MemberQrCode.tsx), [`app/profiel/page.tsx`](app/profiel/page.tsx), [`app/page.tsx`](app/page.tsx) | QR-payload en weergave |
| Lidmaatschap en sessie | [`components/SessionProvider.tsx`](components/SessionProvider.tsx), [`lib/services/users.ts`](lib/services/users.ts), [`lib/models/backend.ts`](lib/models/backend.ts) | Sessie, lidmaatschapsstatus en datamodellen |
| Ledenbeheer en rechtenmodel | [`lib/services/memberAdmin.ts`](lib/services/memberAdmin.ts), [`lib/models/backend.ts`](lib/models/backend.ts), [`firestore.rules`](firestore.rules) | Administratieve ledenlogica, associationRole/accessLevel en autorisatie |
| Activiteitenservice | [`lib/services/activities.ts`](lib/services/activities.ts), [`data/agenda-events.ts`](data/agenda-events.ts) | Activiteitenopslag, caching en eventtypes |
| Mededelingen | [`lib/services/announcements.ts`](lib/services/announcements.ts), [`components/AppDataProvider.tsx`](components/AppDataProvider.tsx), [`app/page.tsx`](app/page.tsx) | Firestore, gedeelde data en Home-presentatie |
| Verenigingscontent | [`lib/services/association.ts`](lib/services/association.ts), [`app/fermi/page.tsx`](app/fermi/page.tsx) | Realtime inhoud en Fermi-presentatie |
| Gedeelde data en cache | [`components/AppDataProvider.tsx`](components/AppDataProvider.tsx), [`lib/firebase.ts`](lib/firebase.ts) | Activiteiten, mededelingen, community en Firebase cache |
| Login en toegangscontrole | [`app/login/page.tsx`](app/login/page.tsx), [`components/AuthGuard.tsx`](components/AuthGuard.tsx), [`components/SessionProvider.tsx`](components/SessionProvider.tsx) | Loginpagina, routebescherming en sessie |
| Onboarding/walkthrough | [`components/GuidedAppTour.tsx`](components/GuidedAppTour.tsx), [`app/tour.css`](app/tour.css) | Rondleiding en opmaak |
| Pending-melding | [`components/MembershipPendingDialog.tsx`](components/MembershipPendingDialog.tsx), [`app/layout.tsx`](app/layout.tsx) | Geblokkeerde ledenfuncties en dialoog |
| Beleidsplan PDF | [`app/fermi/documenten/beleidsplan/page.tsx`](app/fermi/documenten/beleidsplan/page.tsx), [`components/documents/FermiPdfViewer.tsx`](components/documents/FermiPdfViewer.tsx) | Documentroute, PDF-weergave, zoom en navigatie |
| Offline PWA | [`components/OfflineSupport.tsx`](components/OfflineSupport.tsx), [`public/sw.js`](public/sw.js), [`lib/firebase.ts`](lib/firebase.ts) | Serviceworker, offline shell en Firestore-cache |
| App-layout | [`app/layout.tsx`](app/layout.tsx), [`app/globals.css`](app/globals.css), [`app/touch.css`](app/touch.css) | Providers, globale styling en touchinstellingen |
| 404-pagina | [`app/not-found.tsx`](app/not-found.tsx) | Fermi-foutpagina |
| Firebase-configuratie | [`lib/firebase.ts`](lib/firebase.ts), [`firebase.json`](firebase.json) | Auth, Firestore, Storage en regelsverwijzingen |
| Firestore security | [`firestore.rules`](firestore.rules), [`lib/models/backend.ts`](lib/models/backend.ts) | Security rules, rollen en rechten |
| Storage security | [`storage.rules`](storage.rules), [`lib/services/profilePhoto.ts`](lib/services/profilePhoto.ts) | Regels voor foto-opslag |
| Commissiegegevens | [`data/committees.ts`](data/committees.ts) | Commissietypes en gegevens |
| Afbeeldingsoptimalisatie | [`scripts/prepare-fermi-images.mjs`](scripts/prepare-fermi-images.mjs), [`scripts/generate-agenda-image-manifest.mjs`](scripts/generate-agenda-image-manifest.mjs), [`package.json`](package.json) | Voorbereiding en manifest tijdens builds |
| PDF worker build | [`scripts/prepare-pdfjs-worker.mjs`](scripts/prepare-pdfjs-worker.mjs), [`package.json`](package.json) | PDF-worker voorbereiden |
| Deployment/basePath | [`next.config.ts`](next.config.ts), [`package.json`](package.json) | Statische export en GitHub Pages pad |
| Team Fermi agents | [`AGENTS.md`](AGENTS.md), [`.agents/skills/readme-documentation-agent/SKILL.md`](.agents/skills/readme-documentation-agent/SKILL.md), [`.agents/skills/knowledge-base-agent/SKILL.md`](.agents/skills/knowledge-base-agent/SKILL.md) | Workflow, codekaartonderhoud en kennisbank |

### Uitgebreide routekaart — admin, scanner en registratie

De onderstaande locaties zijn rechtstreeks in de huidige broncode geverifieerd. De admin-onderdelen staan onder `/profiel/`, niet onder `/admin/`.

| Functie | Pagina/component | Logica en gerelateerde bestanden |
| --- | --- | --- |
| Admin CRM overzicht | [`app/profiel/admin/page.tsx`](app/profiel/admin/page.tsx) | Links naar vijf beheermodules; admin-toegangscontrole via [users service](lib/services/users.ts) |
| Leden Admin | [`app/profiel/leden-admin/page.tsx`](app/profiel/leden-admin/page.tsx) | [`lib/services/memberAdmin.ts`](lib/services/memberAdmin.ts), [`lib/models/backend.ts`](lib/models/backend.ts), [`firestore.rules`](firestore.rules) — betaalstatus, lidmaatschap, rollen en accessLevel |
| Activiteiten Admin | [`app/profiel/activiteiten-admin/page.tsx`](app/profiel/activiteiten-admin/page.tsx) | [`lib/services/activities.ts`](lib/services/activities.ts), [`data/agenda-events.ts`](data/agenda-events.ts), [`data/agenda-images.generated.ts`](data/agenda-images.generated.ts) — formulieren, opslaan en beeldselectie |
| Mededelingen Admin | [`app/profiel/mededelingen-admin/page.tsx`](app/profiel/mededelingen-admin/page.tsx) | [`lib/services/announcements.ts`](lib/services/announcements.ts) — mededelingen aanmaken, aanpassen en publiceren |
| Vereniging Admin | [`app/profiel/vereniging-admin/page.tsx`](app/profiel/vereniging-admin/page.tsx) | [`lib/services/association.ts`](lib/services/association.ts) — bestuurs- en verenigingscontent |
| E-mail Admin en preview | [`app/profiel/email-admin/page.tsx`](app/profiel/email-admin/page.tsx) | [Uitnodiging](public/email/templates/fermi-webapp-uitnodiging.html), [verjaardag](public/email/templates/fermi-happy-birthday.html) — HTML-templates en preview; verzendworkflow niet vastgesteld |
| QR-scanner | [`app/profiel/qr-scanner/page.tsx`](app/profiel/qr-scanner/page.tsx) | [`lib/services/scanner.ts`](lib/services/scanner.ts), [`lib/services/activities.ts`](lib/services/activities.ts), [`firestore.rules`](firestore.rules) — scannen, controle en beveiliging |
| Registratie HvA-mail | [`app/register/page.tsx`](app/register/page.tsx) | [`lib/services/auth.ts`](lib/services/auth.ts), [`lib/services/users.ts`](lib/services/users.ts), [`app/register/register.module.css`](app/register/register.module.css) |
| Registratie alternatief e-mailadres | [`app/register/ander-email/page.tsx`](app/register/ander-email/page.tsx) | [`lib/services/auth.ts`](lib/services/auth.ts), [`app/register/register.module.css`](app/register/register.module.css) |
| Inschrijven voor activiteit | [`components/events/EventActions.tsx`](components/events/EventActions.tsx) | [`lib/services/registrations.ts`](lib/services/registrations.ts), [`lib/services/memberships.ts`](lib/services/memberships.ts) |
| Activiteitdetail renderen | [`components/events/EventDetailClient.tsx`](components/events/EventDetailClient.tsx) | [`components/events/ActivityRouteClient.tsx`](components/events/ActivityRouteClient.tsx), [`lib/services/activities.ts`](lib/services/activities.ts) |
| Profielfoto-editor (zoom/positie) | [`app/profiel/page.tsx`](app/profiel/page.tsx) | `cropZoom`, `cropOffset`, pointer handlers, `saveProfilePhotoCrop`; [`lib/services/profilePhoto.ts`](lib/services/profilePhoto.ts) verwerkt opslag |
| Commissiedetail UI | [`components/committees/CommitteeDetailClient.tsx`](components/committees/CommitteeDetailClient.tsx) | [`components/committees/CommitteeSignup.tsx`](components/committees/CommitteeSignup.tsx), [`components/committees/AcComDetail.tsx`](components/committees/AcComDetail.tsx), [`data/committees.ts`](data/committees.ts) |

**Praktische zoekregel:** bij wijzigingen in QR-rechten controleer minimaal `app/profiel/page.tsx`, `app/profiel/qr-scanner/page.tsx`, `lib/services/scanner.ts`, `lib/services/memberAdmin.ts`, `lib/models/backend.ts` en `firestore.rules`. Bij activiteiten ook `components/events/EventActions.tsx` en `lib/services/registrations.ts` meenemen.

### Nog nader te inventariseren

De **fotogalerij** en eventuele bijbehorende opslag/API-integratie zijn nog niet gelokaliseerd. Ook overige, niet hierboven genoemde routes en componenten verdienen verdere inventarisatie. De HTML-e-mailpreview is gevonden; een verzendintegratie is niet bevestigd.

## Onderhoudsafspraak

Bij iedere wijziging aan functionaliteit of bestandsstructuur controleert Team Fermi deze codekaart en actualiseert de geraakte regels in dezelfde wijziging. Een functie die meerdere lagen raakt, vermeldt alle relevante bestanden. De README is een navigatie-index, geen duplicaat van de broncode.

## Status

Het project bevindt zich in actieve ontwikkeling. Raadpleeg de actuele implementatie en [het draaiboek](docs/DRAAIBOEK.md) voor de status van afzonderlijke functies.
