# S.V. Fermi PWA — Draaiboek

> Centrale product- en ontwikkelleidraad voor de ledenapp van S.V. Fermi.

**Status:** concept v0.1  
**Doelgroep:** leden, commissieleden en bestuur van S.V. Fermi  
**Platform:** Progressive Web App (PWA), primair mobiel en daarnaast volledig bruikbaar op desktop  
**Repository:** `wanderwerkhoven-afk/Fermi-PWA`

---

## 1. Projectdoel

De Fermi PWA wordt de centrale digitale ledenomgeving van S.V. Fermi. De applicatie is uitsluitend bedoeld voor leden en moet dagelijkse verenigingszaken eenvoudiger, overzichtelijker en aantrekkelijker maken.

De app moet niet alleen informatie tonen, maar leden actief helpen om deel te nemen aan de vereniging. De belangrijkste gebruiksmomenten zijn:

- zien wat er binnenkort gebeurt;
- inschrijven voor activiteiten;
- eigen inschrijvingen en lidmaatschap bekijken;
- andere leden en commissies vinden;
- belangrijke verenigingsdocumenten raadplegen;
- meldingen ontvangen;
- als commissie of bestuur activiteiten en informatie beheren;
- leden tijdens activiteiten via QR kunnen inchecken.

De openbare website van S.V. Fermi blijft geschikt voor externe informatie. Deze PWA wordt de persoonlijke omgeving achter een ledenlogin.

---

## 2. Productprincipes

Bij iedere feature gelden de volgende uitgangspunten.

### 2.1 Mobile first

De primaire ervaring wordt ontworpen voor een telefoon. Tablet en desktop krijgen daarna een passende responsive layout.

### 2.2 Snel naar de belangrijkste actie

Veelgebruikte handelingen moeten binnen enkele tikken bereikbaar zijn, zoals:

- activiteit bekijken;
- inschrijven of uitschrijven;
- digitale ledenpas openen;
- QR-code tonen;
- mededeling lezen.

### 2.3 Verenigingsgevoel

De app moet duidelijk van S.V. Fermi zijn en niet aanvoelen als een generieke administratieve portal. De visuele identiteit, tone of voice, illustraties, animaties en micro-interacties mogen speels zijn zolang de bruikbaarheid goed blijft.

### 2.4 Privacy by design

Omdat de applicatie persoonsgegevens, foto's, inschrijvingen en mogelijk betaalinformatie bevat, wordt alleen informatie opgeslagen die daadwerkelijk nodig is.

Leden krijgen controle over welke profielinformatie voor andere leden zichtbaar is.

### 2.5 Rollen en rechten vanaf het begin

Rechten worden niet achteraf toegevoegd. De architectuur houdt vanaf de eerste versie rekening met:

- lid;
- commissielid;
- commissievoorzitter/beheerder;
- bestuur;
- systeembeheerder.

### 2.6 Geen dubbele administratie

Waar mogelijk moet informatie één keer worden ingevoerd en daarna op meerdere plaatsen bruikbaar zijn. Een activiteit die wordt aangemaakt door een commissie verschijnt bijvoorbeeld automatisch in de agenda en op relevante dashboards.

---

## 3. Hoofdnavigatie

De primaire mobiele navigatie bestaat voorlopig uit vijf onderdelen:

1. **Home**
2. **Agenda**
3. **Fermi**
4. **Community**
5. **Profiel**

Op desktop kan dezelfde structuur worden weergegeven als zijbalk of brede navigatie.

---

# 4. Functionaliteiten per onderdeel

## 4.1 Home

Home wordt het persoonlijke dashboard van een lid.

### MVP

- persoonlijke begroeting;
- eerstvolgende activiteit;
- komende activiteiten;
- mededelingen;
- openstaande of relevante acties;
- snelle link naar digitale ledenpas;
- overzicht van eigen inschrijvingen.

### Mogelijke latere uitbreidingen

- recente fotoalbums;
- verjaardagen, alleen met toestemming;
- commissie-updates;
- persoonlijke aanbevelingen op basis van gekozen interessecategorieën;
- countdowns naar grote activiteiten of reizen.

---

## 4.2 Agenda

De agenda vormt een kernonderdeel van de app.

### Activiteitenoverzicht

Activiteiten kunnen worden gefilterd op bijvoorbeeld:

- borrel;
- feest;
- excursie;
- studiereis;
- workshop;
- sport;
- ALV;
- commissie;
- studie.

### Activiteitdetail

Iedere activiteit kan bevatten:

- titel;
- hero-afbeelding;
- datum;
- begin- en eindtijd;
- locatie;
- omschrijving;
- organiserende commissie;
- prijs;
- capaciteit;
- aantal beschikbare plaatsen;
- inschrijfdeadline;
- doelgroep;
- praktische informatie;
- deelnemersstatus;
- inschrijfknop;
- uitschrijfknop;
- agenda-export.

### Inschrijvingen

Een lid moet kunnen:

- inschrijven;
- uitschrijven binnen de toegestane termijn;
- eigen status bekijken;
- eventueel een wachtlijstpositie zien;
- zien of betaling vereist of voldaan is.

### Later

- wachtlijsten;
- gast/+1-functionaliteit;
- automatische reminders;
- Apple/Google/Outlook-agendakoppeling;
- ticket of QR-code per activiteit.

---

## 4.3 Fermi

Dit onderdeel bevat de structurele informatie over de vereniging.

### Onderdelen

- Over S.V. Fermi;
- huidig bestuur;
- commissies;
- vertrouwenscontactpersonen;
- belangrijke contactgegevens;
- statuten;
- huishoudelijk reglement;
- ALV-documenten;
- beleids- of jaarstukken;
- partners/sponsoren;
- veelgestelde vragen.

### Commissiepagina

Per commissie:

- naam;
- omschrijving;
- afbeelding;
- commissieleden;
- voorzitter/contactpersoon;
- activiteiten van de commissie;
- optioneel interne documenten;
- optioneel volgende commissievergadering.

---

## 4.4 Community

Community is bedoeld om de vereniging toegankelijker en persoonlijker te maken zonder direct een volledig sociaal netwerk te bouwen.

### MVP: ledenlijst / smoelenboek

Leden kunnen, voor zover zij dit toestaan, zichtbaar zijn met:

- profielfoto;
- naam;
- studiejaar;
- opleiding;
- commissies;
- verenigingsfuncties.

### Filters

Bijvoorbeeld:

- studiejaar;
- commissie;
- bestuur;
- alumni, indien later gewenst.

### Privacy

Ieder lid kan instellen welke velden zichtbaar zijn voor andere leden.

### Mogelijke uitbreiding: Fermi Feed

Een lichte nieuwsfeed voor officiële verenigingsupdates, zoals:

- nieuwe activiteit;
- foto's gepubliceerd;
- belangrijke mededeling;
- inschrijving geopend;
- commissie zoekt nieuwe leden.

In eerste instantie kunnen alleen bevoegde rollen publiceren.

---

## 4.5 Profiel

Profiel wordt de persoonlijke omgeving van het lid.

### Persoonlijke gegevens

- naam;
- profielfoto;
- opleiding;
- studiejaar;
- lid sinds;
- commissies;
- huidige en eerdere verenigingsfuncties.

### Mijn Fermi

- komende activiteiten;
- eerdere activiteiten;
- commissies;
- instellingen;
- notificatievoorkeuren;
- privacyvoorkeuren.

### Digitale ledenpas

De digitale ledenpas bevat minimaal:

- naam;
- profielfoto;
- lidstatus;
- uniek lidnummer of interne identifier;
- geldigheid;
- QR-code.

De QR-code mag geen gevoelige persoonsgegevens rechtstreeks als leesbare data bevatten. Gebruik bij voorkeur een tijdelijke of server-verifieerbare identifier.

---

# 5. QR en check-in

Een latere kernfunctie is een check-insysteem voor activiteiten.

## Lid

Een lid opent zijn digitale ledenpas of activiteitenticket en toont een QR-code.

## Bevoegde scanner

Bestuur of geautoriseerde commissieleden krijgen toegang tot een scannerweergave.

Na scannen toont het systeem bijvoorbeeld:

- naam;
- geldige lidstatus;
- ingeschreven ja/nee;
- check-in geslaagd;
- reeds ingecheckt.

## Registratie

Per activiteit kan worden bijgehouden:

- ingeschreven;
- ingecheckt;
- tijdstip check-in;
- no-show;
- handmatige correctie door beheerder.

---

# 6. Rollen en autorisaties

## Lid

Kan:

- app gebruiken;
- eigen profiel beheren;
- activiteiten bekijken;
- inschrijven/uitschrijven;
- ledenpas gebruiken;
- toegestane communityinformatie bekijken;
- documenten voor leden bekijken.

## Commissielid

Heeft daarnaast toegang tot commissiegebonden functies die expliciet zijn toegewezen.

## Commissievoorzitter / commissiebeheerder

Kan voor eigen commissie bijvoorbeeld:

- activiteiten beheren;
- commissie-informatie aanpassen;
- deelnemerslijst bekijken indien toegestaan;
- check-in uitvoeren.

## Bestuur

Kan verenigingbreed:

- activiteiten beheren;
- nieuws en mededelingen plaatsen;
- leden beheren;
- rollen toekennen;
- documenten publiceren;
- commissies beheren;
- relevante inschrijvingen bekijken;
- check-ins beheren.

## Systeembeheerder

Heeft technische beheertoegang en kan systeemrollen en configuratie beheren.

### Belangrijk

Autorisatie moet altijd server-side worden afgedwongen. Het verbergen van een knop in de interface is nooit voldoende beveiliging.

---

# 7. Beheeromgeving

De PWA krijgt uiteindelijk een aparte beheerweergave, bereikbaar voor bevoegde gebruikers.

## Dashboard

Mogelijke informatie:

- aantal actieve leden;
- aantal aankomende activiteiten;
- openstaande inschrijvingen;
- recente wijzigingen;
- waarschuwingen of acties.

## Ledenbeheer

- zoeken;
- filteren;
- lid openen;
- status aanpassen;
- rollen beheren;
- commissie koppelen;
- privacygevoelige gegevens alleen tonen wanneer noodzakelijk.

## Activiteitenbeheer

- activiteit aanmaken;
- concept/publicatiestatus;
- bewerken;
- inschrijving openen/sluiten;
- capaciteit instellen;
- deelnemers beheren;
- exporteren indien noodzakelijk;
- check-inmodus openen.

## Contentbeheer

- mededelingen;
- commissiepagina's;
- documenten;
- contactinformatie.

---

# 8. Notificaties

De PWA moet op termijn pushnotificaties ondersteunen.

Leden moeten per categorie voorkeuren kunnen instellen, bijvoorbeeld:

- belangrijke mededelingen;
- activiteiten;
- inschrijfdeadlines;
- herinneringen;
- commissie-updates;
- studiegerelateerde berichten.

Kritieke verenigingsinformatie mag een aparte categorie krijgen, maar notificaties mogen niet onnodig worden gebruikt.

---

# 9. Fotoalbums

Een afgeschermde fotoomgeving kan worden toegevoegd voor leden.

Per album:

- activiteit;
- datum;
- cover;
- foto's;
- uploader;
- zichtbaarheidsniveau.

Aandachtspunt: duidelijke afspraken over toestemming, bewaartermijnen en verwijderen van foto's.

---

# 10. Mogelijke toekomstige modules

Deze onderdelen vallen niet in het eerste MVP maar worden architectonisch niet uitgesloten.

## Polls

- verenigingspolls;
- commissievragen;
- datumkeuzes;
- feedback.

## Studiebank

Per vak bijvoorbeeld:

- samenvattingen;
- oefenmateriaal;
- formulebladen;
- toegestane oude tentamenmaterialen;
- nuttige links.

Uploads vereisen moderatie en aandacht voor auteursrecht.

## Marketplace

Leden kunnen onderling bijvoorbeeld:

- studieboeken aanbieden;
- labmateriaal aanbieden;
- spullen gezocht plaatsen.

## Gamification

Eventueel lichte verenigingsgamification, maar nooit leidend:

- badges;
- deelname-mijlpalen;
- commissie-achievements.

---

# 11. Technische richting

De voorlopige technische voorkeur is:

## Frontend / full-stack framework

- Next.js;
- TypeScript;
- moderne componentstructuur;
- responsive design;
- PWA-functionaliteit.

## Styling

- Tailwind CSS of een vergelijkbare token-based aanpak;
- centrale design tokens voor kleuren, spacing, radius, typografie en schaduwen;
- component library specifiek voor Fermi.

## Backend en database

Voorkeur voor Supabase:

- PostgreSQL;
- Authentication;
- Storage;
- Row Level Security;
- realtime mogelijkheden;
- server-side policies.

Alternatieven kunnen later opnieuw worden beoordeeld voordat backendimplementatie definitief start.

## Hosting

Nog te bepalen. Mogelijke opties:

- Vercel voor Next.js;
- Supabase voor backend/database/storage.

---

# 12. Eerste datamodel

Dit is een conceptueel startpunt en nog geen definitief databaseschema.

## users

- id
- auth_id
- first_name
- last_name
- email
- avatar_url
- study_program
- study_year
- member_since
- member_status
- privacy_settings
- created_at
- updated_at

## roles

- id
- name

## user_roles

- user_id
- role_id

## committees

- id
- name
- description
- image_url
- active

## committee_members

- committee_id
- user_id
- function
- start_date
- end_date

## events

- id
- title
- description
- category
- start_at
- end_at
- location_name
- location_address
- image_url
- capacity
- price
- registration_open_at
- registration_close_at
- committee_id
- status
- created_by

## event_registrations

- id
- event_id
- user_id
- status
- registered_at
- checked_in_at
- payment_status

## announcements

- id
- title
- body
- audience
- published_at
- created_by

## documents

- id
- title
- category
- file_url
- visibility
- published_at

## notification_preferences

- user_id
- category
- enabled

## media_albums

- id
- event_id
- title
- cover_url
- visibility

## media_items

- id
- album_id
- file_url
- uploaded_by
- created_at

---

# 13. Authenticatie

Zelfregistratie wordt in eerste instantie niet toegestaan.

Voorkeursroutes die later onderzocht worden:

1. vooraf goedgekeurde e-mailadressen uit de ledenadministratie;
2. uitnodigingsflow;
3. Microsoft/HvA SSO indien technisch en organisatorisch mogelijk.

Een account wordt pas als volledig lidaccount beschouwd nadat de lidstatus server-side is bevestigd.

---

# 14. Security en privacy

Minimale eisen:

- HTTPS;
- veilige authentication;
- server-side autorisatie;
- Row Level Security waar van toepassing;
- geen gevoelige data in QR-codes;
- minimale persoonsgegevensopslag;
- logging van belangrijke beheermutaties;
- duidelijke privacyinstellingen;
- geen publieke toegang tot ledenfoto's of ledenlijsten;
- veilige opslag van documenten;
- secrets nooit in de repository;
- environment variables via hostingomgeving.

Voor productie moet een aparte security/privacy-review plaatsvinden.

---

# 15. UX-richtlijnen

## Mobiele navigatie

Vaste bottom navigation met maximaal vijf primaire bestemmingen.

## Desktop

Responsive sidebar of headernavigatie zonder de mobiele interface simpelweg uit te rekken.

## Componenten

We bouwen herbruikbare componenten voor onder andere:

- buttons;
- cards;
- event cards;
- member cards;
- badges;
- tabs;
- sheets/modals;
- empty states;
- skeleton loading;
- alerts/toasts;
- form fields.

## States

Iedere pagina moet expliciet ontwerpen bevatten voor:

- loading;
- leeg;
- fout;
- offline;
- geen toegang;
- succes.

---

# 16. PWA-eisen

De app moet uiteindelijk:

- installeerbaar zijn;
- een web app manifest hebben;
- eigen iconen gebruiken;
- een standalone app-ervaring bieden;
- basis offline fallback hebben;
- updates gecontroleerd afhandelen;
- pushnotificaties kunnen ondersteunen;
- correct werken op iOS Safari en moderne Android-browsers.

---

# 17. Fasering

## Fase 0 — Productfundament

Doel: eerst bepalen wat we precies bouwen.

- draaiboek;
- sitemap;
- gebruikersrollen;
- MVP-scope;
- eerste datamodel;
- designrichting;
- technische stack;
- repositorystructuur.

**Resultaat:** een stabiele basis voordat productcode wordt geschreven.

## Fase 1 — App shell en design system

- Next.js/TypeScript project;
- PWA-basissetup;
- routing;
- responsive app shell;
- bottom navigation;
- desktop navigation;
- thema/design tokens;
- basiscomponenten;
- placeholderpagina's.

## Fase 2 — Authenticatie en profiel

- Supabase project;
- authentication;
- lidvalidatie;
- userprofiel;
- rollen/rechten;
- privacyinstellingen;
- ledenpas basis.

## Fase 3 — Activiteiten

- agenda;
- activiteitdetail;
- categorieën;
- inschrijven/uitschrijven;
- capaciteit;
- Mijn activiteiten.

## Fase 4 — Fermi en Community

- bestuur;
- commissies;
- documenten;
- ledenlijst;
- profielzichtbaarheid;
- mededelingen.

## Fase 5 — Beheeromgeving

- ledenbeheer;
- activiteitenbeheer;
- commissiebeheer;
- publicaties;
- rollen.

## Fase 6 — QR en check-in

- QR-lidpas;
- scanner;
- activiteitcheck-in;
- logs;
- deelnemersstatus.

## Fase 7 — Push en media

- pushnotificaties;
- voorkeuren;
- fotoalbums;
- uploads;
- moderatie.

## Fase 8 — Uitbreidingen

Mogelijke modules:

- polls;
- studiebank;
- marketplace;
- gamification;
- geavanceerde analytics.

---

# 18. MVP-definitie

De eerste echte bruikbare ledenversie is gereed wanneer een lid:

1. veilig kan inloggen;
2. zijn profiel kan bekijken en aanpassen;
3. zijn digitale ledenpas kan openen;
4. aankomende activiteiten kan bekijken;
5. een activiteitdetail kan openen;
6. zich kan inschrijven en uitschrijven;
7. eigen inschrijvingen kan bekijken;
8. bestuur en commissies kan bekijken;
9. mededelingen kan lezen;
10. toegestane ledeninformatie kan bekijken.

Daarnaast moet het bestuur minimaal activiteiten en mededelingen kunnen beheren.

Alles daarbuiten is uitbreiding en mag het MVP niet blokkeren.

---

# 19. Definition of Done

Een feature is pas gereed wanneer:

- functionaliteit werkt op mobiel;
- desktopweergave is gecontroleerd;
- loading/error/empty states bestaan waar relevant;
- autorisatie correct is;
- persoonsgegevens correct zijn afgeschermd;
- geen console errors aanwezig zijn;
- lint/typecheck slagen;
- relevante tests slagen;
- feature handmatig is gereviewd;
- documentatie is bijgewerkt indien architectuur of gedrag verandert.

---

# 20. Git- en ontwikkelworkflow

## Branches

Aanbevolen:

- `main` = stabiel;
- feature branches per taak;
- geen grote ongerelateerde wijzigingen in één commit.

Voorbeelden:

- `feature/app-shell`
- `feature/events`
- `feature/member-profile`
- `fix/mobile-navigation`

## Commits

Korte, duidelijke commitberichten, bijvoorbeeld:

- `feat: add event detail page`
- `fix: prevent duplicate registrations`
- `refactor: extract member card component`
- `docs: update data model`

## Review

Voor grotere wijzigingen:

1. implementatie;
2. functionele review;
3. UX-review;
4. security/privacy-check wanneer persoonsgegevens geraakt worden;
5. merge naar main.

---

# 21. Team Fermi

Voor verdere ontwikkeling kunnen we werken met een vaste virtuele taakverdeling.

## Product / Architect

Bewaakt:

- scope;
- datamodel;
- architectuur;
- afhankelijkheden;
- samenhang tussen features.

## Frontend

Bouwt:

- pagina's;
- componenten;
- responsive gedrag;
- PWA-ervaring;
- animaties.

## Backend / Data

Bewaakt:

- database;
- API's;
- authentication;
- RLS;
- storage;
- dataintegriteit.

## UX / UI

Controleert:

- navigatie;
- hiërarchie;
- toegankelijkheid;
- consistentie;
- states;
- visuele Fermi-identiteit.

## Review / QA

Controleert:

- bugs;
- regressies;
- mobiel/desktop;
- edge cases;
- console;
- performance.

## Security / Privacy

Controleert:

- autorisatie;
- persoonsgegevens;
- zichtbaarheid;
- QR-implementatie;
- uploads;
- gevoelige beheerfuncties.

---

# 22. Directe eerstvolgende stappen

Na dit draaiboek werken we in deze volgorde:

1. sitemap en schermen definitief maken;
2. MVP versus later expliciet labelen;
3. visuele richting van Fermi bepalen;
4. eerste wireframes/mockups maken;
5. technisch project initialiseren;
6. app shell bouwen;
7. database/auth pas daarna koppelen.

Hiermee voorkomen we dat de backend of repositorystructuur al vaststaat voordat de gebruikersflow helder is.

---

# 23. Open beslissingen

Deze onderwerpen moeten tijdens de eerste productfase nog worden besloten:

- exacte huisstijl en kleuren;
- bestaande Fermi-branding hergebruiken of vernieuwen;
- HvA/Microsoft SSO haalbaarheid;
- bron van de ledenadministratie;
- betaalfunctionaliteit wel/niet in de app;
- foto- en privacybeleid;
- wie commissiegegevens mag wijzigen;
- welke documenten onder welke rollen zichtbaar zijn;
- alumnitoegang;
- bewaartermijnen voor account- en activiteitdata;
- definitieve hosting;
- Supabase als definitieve backendkeuze.

---

# 24. Scopebewaking

Bij ieder nieuw idee bepalen we eerst:

**MVP, V2 of later?**

Nieuwe functies mogen alleen direct worden toegevoegd wanneer ze:

- essentieel zijn voor de hoofdflow;
- een bestaand blokkerend probleem oplossen;
- privacy/security noodzakelijk maken;
- de technische fundering aantoonbaar verbeteren.

Zo blijft de eerste release klein genoeg om daadwerkelijk af te ronden.

---

## Versiehistorie

### v0.1 — 29 september 2026

- eerste productvisie;
- hoofdnavigatie;
- functionele modules;
- rollen;
- conceptueel datamodel;
- technische richting;
- MVP;
- ontwikkelfasen;
- Team Fermi werkstructuur.
