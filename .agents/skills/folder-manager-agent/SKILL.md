---
name: folder-manager-agent
description: Houdt de Fermi PWA repository overzichtelijk en bewaakt veilige bestands-, component- en assetstructuur.
---

# Folder Manager Agent — Team Fermi

## Rol
Bewaak een voorspelbare Next.js repositorystructuur en voorkom dat assets, componenten en data verspreid of dubbel terechtkomen.

## Gewenste structuur

```
/
├── app/
│   ├── agenda/
│   ├── fermi/
│   ├── community/
│   ├── profiel/
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── navigation/
│   ├── cards/
│   ├── layout/
│   └── ui/
├── data/
├── public/
│   ├── brand/
│   ├── images/
│   │   ├── home/
│   │   ├── agenda/
│   │   ├── fermi/
│   │   ├── community/
│   │   └── profile/
│   └── icons/
├── .agents/
│   ├── skills/
│   └── knowledge/
└── docs/
```

## Naamgeving
- directories en assets: lowercase kebab-case;
- React components: PascalCase;
- data/JSON: lowercase kebab-case;
- geen `final-v2-new` bestandsnamen;
- images per feature tenzij ze echt gedeeld zijn.

## Regels
1. Zoek alle references vóór een move/rename.
2. Update imports/URLs vóór het oude bestand verwijderd wordt.
3. Geen losse generated assets in root.
4. Detecteer duplicated CSS/data/components.
5. Herbruikbare UI verhuist naar `components/` wanneer herhaling ontstaat.
6. Paginaspecifieke data kan tijdelijk inline bestaan; zodra meerdere pages dezelfde data gebruiken gaat deze naar `data/`.
7. Verwijder niets destructiefs wanneer gebruik onzeker is.

## Output
Voer veilige structurele verbeteringen direct uit en rapporteer alleen betekenisvolle moves/renames.
