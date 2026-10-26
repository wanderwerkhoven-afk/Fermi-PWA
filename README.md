# Fermi-PWA

Ledenapp van S.V. Fermi, gebouwd als Progressive Web App.

## Projectdocumentatie

- [Draaiboek](docs/DRAAIBOEK.md) — productvisie, MVP, functionaliteiten, rollen, architectuur, datamodel en ontwikkelfasen.
- [Team Fermi](AGENTS.md) — agentrollen en ontwikkelworkflow.
- [README Documentation Agent](.agents/skills/readme-documentation-agent/SKILL.md) — onderhoudsregels voor deze codekaart.

## Codekaart — waar staat welke functionaliteit?

Deze index wordt onderhouden door de README Documentation Agent. Vermelde paden zijn gecontroleerd in de repository; andere onderdelen worden aangevuld na code-inspectie.

| Onderdeel | Implementatie | Verantwoordelijkheid |
| --- | --- | --- |
| Home | [app/page.tsx](app/page.tsx) | Homeweergave, activiteitenpresentatie en koppelingen met ledenpas en mededelingen |
| Ledenpas / QR-weergave op Home | [components/MemberQrCode.tsx](components/MemberQrCode.tsx), [app/page.tsx](app/page.tsx) | QR-component en gebruik op Home |
| Gebruikerssessie op Home | [components/SessionProvider.tsx](components/SessionProvider.tsx), [app/page.tsx](app/page.tsx) | Sessiestatus en toegang |
| App-data op Home | [components/AppDataProvider.tsx](components/AppDataProvider.tsx), [app/page.tsx](app/page.tsx) | Gedeelde app-data |
| Mededelingen op Home | [lib/services/announcements.ts](lib/services/announcements.ts), [app/page.tsx](app/page.tsx) | Mededelingendata en presentatie |
| Openstaande ledenaanvragen op Home | [lib/services/memberAdmin.ts](lib/services/memberAdmin.ts), [app/page.tsx](app/page.tsx) | Pending approvals en notificaties |
| Activiteiten-data gebruikt door Home | [data/agenda-events.ts](data/agenda-events.ts), [app/page.tsx](app/page.tsx) | AgendaEvent-model en Home-weergave |
| Afbeeldingsvoorbereiding | [scripts/prepare-fermi-images.mjs](scripts/prepare-fermi-images.mjs) | Predev/prebuild afbeeldingverwerking |
| PDF.js worker voorbereiden | [scripts/prepare-pdfjs-worker.mjs](scripts/prepare-pdfjs-worker.mjs) | Predev/prebuild PDF-worker |
| Agenda-afbeeldingsmanifest | [scripts/generate-agenda-image-manifest.mjs](scripts/generate-agenda-image-manifest.mjs) | Predev/prebuild manifest |
| Build en dependencies | [package.json](package.json) | Next.js 15, scripts en dependencies |
| Team Fermi | [AGENTS.md](AGENTS.md) | Agentrollen en werkproces |
| Knowledge Base Agent | [.agents/skills/knowledge-base-agent/SKILL.md](.agents/skills/knowledge-base-agent/SKILL.md) | Structurele productkennis |

**Nog te inventariseren:** overige routes (Agenda, Fermi, Community, Profiel, Admin), QR-scanner-autorisatie, Firestore-regels, foto-editor, e-mailtemplates en offline serviceworker. De documentatie-agent vult deze uitsluitend aan na inspectie van de echte bestanden.

## Onderhoudsafspraak

Bij iedere wijziging aan functionaliteit of bestandsstructuur controleert Team Fermi deze codekaart en actualiseert de geraakte regels in dezelfde wijziging. Een functie die meerdere lagen raakt, vermeldt alle relevante bestanden. De README is een navigatie-index, geen duplicaat van de broncode.

## Status

Het project bevindt zich in actieve ontwikkeling. Raadpleeg de actuele implementatie en [het draaiboek](docs/DRAAIBOEK.md) voor de status van afzonderlijke functies.
