# Team Fermi

Team Fermi is het standaard multi-agent ontwikkelteam voor de S.V. Fermi PWA.

## Missie
Bouw de Fermi ledenapp als één samenhangend product. Het team implementeert verzoeken direct, bewaakt de gekozen Fermi-identiteit, voorkomt route- en bestandschaos en houdt projectkennis tijdens de ontwikkeling actueel.

Wanneer de gebruiker **Team Fermi** zegt, wordt dit team als één geïntegreerde workflow gebruikt.

## Agents

- **UI/UX Agent** — schermhiërarchie, usability, mobile-first gedrag, toegankelijkheid en aansluiting op mockups.
- **Routing Agent** — Next.js routes, navigatie, actieve tabs, deep links, back behavior en GitHub Pages basePath.
- **Folder Manager Agent** — repositorystructuur, bestandsnamen, assets, veilige moves en imports.
- **Styling Agent** — design tokens, Fermi huisstijl, component styling, responsive CSS en visuele consistentie.
- **Knowledge Base Agent** — onderhoudt de JSON knowledge base met schermen, routes, componenten, designregels, assets en beslissingen.
- **QA Agent** — test flows, responsive gedrag, build/deploy, routes, states en regressies.
- **Review & Improve Agent** — eindreview, codekwaliteit, UX-consistentie en gerichte verbeteringen.

Agentinstructies:
- `.agents/skills/ui-ux-agent/SKILL.md`
- `.agents/skills/routing-agent/SKILL.md`
- `.agents/skills/folder-manager-agent/SKILL.md`
- `.agents/skills/styling-agent/SKILL.md`
- `.agents/skills/knowledge-base-agent/SKILL.md`
- `.agents/skills/qa-agent/SKILL.md`
- `.agents/skills/review-improve-agent/SKILL.md`

Gedeelde projectkennis:
- `.agents/knowledge/fermi-knowledge-base.json`

## Operating mode: Team Fermi

Bij een implementatieverzoek:

1. Lees eerst de relevante huidige code en de knowledge base.
2. UI/UX, Routing en Styling beoordelen parallel welke onderdelen geraakt worden.
3. Implementeer de kleinste samenhangende wijziging; stop niet bij advies als de opdracht uitvoerbaar is.
4. Folder Manager controleert nieuwe/mutated bestanden en assets.
5. Knowledge Base Agent werkt structurele projectkennis bij zodra routes, schermen, tokens, componenten, assets of architectuurbeslissingen veranderen.
6. QA controleert relevante user flows, mobiele layouts, routewerking en build/deploy-risico's.
7. Review & Improve controleert de gecombineerde wijziging en repareert duidelijke regressies of inconsistenties.
8. Als QA of Review code wijzigt, controleer de geraakte flow opnieuw.
9. Bestaande werkende functionaliteit blijft behouden tenzij het verzoek deze bewust vervangt.
10. Geen tijdelijke hacks wanneer een herbruikbare component, token of structurele oplossing logisch is.

## Productregels

### Mobile first
De iPhone/PWA ervaring is leidend. Desktop blijft volledig bruikbaar maar volgt de mobiele producthiërarchie.

### Visuele identiteit
De gekozen dark Fermi-richting is de standaard:
- diep navy als primaire achtergrond;
- Fermi-oranje als hoofdaccent;
- warm crème/papier voor kaarten en collage-elementen;
- serif displaykoppen gecombineerd met moderne sans-serif interfacecopy;
- editorial/collage uitstraling met gescheurd papier, halftone, fotografie en natuurkunde-elementen;
- geen generieke SaaS-look.

### Navigatie
Primaire navigatie:
1. Home
2. Agenda
3. Fermi
4. Community
5. Profiel

Iedere primaire pagina moet dezelfde bottom navigation gebruiken. Actieve state is route-afhankelijk, niet handmatig inconsistent per scherm.

### Afbeeldingen
Tijdens ontwikkeling mogen stock-/placeholderbeelden worden gebruikt. Definitieve unieke Fermi-art kan later gegenereerd of aangeleverd worden.

### Styling
Nieuwe visuele patronen moeten waar mogelijk via tokens of gedeelde componentregels worden vastgelegd. Vermijd steeds langere chains van CSS overrides.

### GitHub Pages
De app draait als statische Next.js export op GitHub Pages. Routes en assets moeten blijven werken onder:
`/Fermi-PWA/`

## Normale integratieflow

```
UI/UX ───────────┐
Routing ─────────┼──> implementatie
Styling ─────────┘
        │
Folder Manager ─────> structuur + assets/imports
        │
Knowledge Base ─────> actuele projectkennis
        │
QA ─────────────────> route/build/device tests + fixes
        │
Review & Improve ───> eindcontrole + gerichte verbeteringen
```

## Conflictvolgorde

Als agents verschillende oplossingen prefereren:

1. Werkende functionaliteit en dataintegriteit.
2. Expliciete gebruikersvraag / aangeleverde mockup.
3. Navigatie- en routecorrectheid.
4. Bestaande Fermi design system consistentie.
5. Responsive/mobile UX.
6. Onderhoudbare folder- en componentstructuur.
7. Performance en toegankelijkheid.
8. Minimale complexiteit.

## Definition of Done voor Team Fermi

Een wijziging is pas gereed wanneer relevant:
- route werkt direct en na refresh;
- mobiel scherm heeft geen horizontale overflow;
- safe areas en bottom nav kloppen;
- actieve navigatiestatus klopt;
- gebruikte styling volgt bestaande tokens/patronen;
- assets staan logisch en hebben consistente namen;
- knowledge base bevat nieuwe structurele informatie;
- TypeScript/build wordt niet bewust gebroken;
- GitHub Pages base path is gerespecteerd;
- bestaande Home/Agenda flows zijn niet onbedoeld beschadigd.
