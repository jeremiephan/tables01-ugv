# Cycles D + E + F + G partiel — récap session

**Status** : 4 cycles posés en une session (~12-18j théorique condensés)
**Date** : 1 mai 2026
**Source** : tables01_v5_3 post Cycles A + B + C

---

## ✅ Cycle D — Read page (placeholders éditoriaux pour rédaction)

### Implémenté
> **Header sticky** avec eyebrow + title + byline + ToC jumplinks + 2 CTAs prominents (PDF + CSV)
>
> **9 sections structurées** avec scroll-margin-top pour anchor navigation :
> - **Key findings** : 4 pull-quotes finalisés (5 markets, Q1 redrew the map, mass-attritable, convergence 26%) + 1 placeholder à rédiger
> - **Thesis** : 3 paragraphes définissant le continuum vs binary
> - **5 markets** : intro + 5 bullets (F1 à F5) avec leading actors et dynamics
> - **Convergence** : narrative F6 partnerships + placeholder case studies
> - **Why Tables 01** : 5 paragraphes vs alternatives (Pitchbook · McKinsey · Janes · VC tools · Polaris)
> - **Methodology** : button qui ouvre l'overlay v4 existant
> - **Sources** : button qui ouvre l'overlay v4 onglet Sources
> - **Tables 02 & 03** : roadmap drones Q4 2026 / propulsion Q2 2027
> - **Authors** : photo placeholder JT + role + quote placeholder + credentials placeholder
>
> **Bottom CTAs** : Open cube · Compose · Book call
>
> **ToC scrollspy** : section active highlight signal-yellow au scroll
>
> **PDF download** : stub `data/tables01-ugv-paper.pdf` (PROD CHECKLIST: générer le PDF)
>
> **CSV download header** : ouvre la modale CSV 2 options du Cycle A

### Reporté (rédaction éditoriale)
- 5e pull-quote final (à rédiger Jérémie)
- Section 5 markets : 1 paragraphe par marché (Jérémie + comms team)
- Section Convergence : 2-3 case studies spécifiques
- Section Tables 02-03 : key questions + cadence newsletter
- Section Authors : quote nominatif + credentials enrichis
- Methodology + Sources : migration inline overlay → page (Cycle D.2)

---

## ✅ Cycle E — Cube refonte chirurgicale

### E.1 · Idle rotation state machine
> Trois états dans `step4-cube.js` :
> - **A** : entry animation en cours (0-2.5s)
> - **B** : entry done, no interaction yet → rotation Y subtle 0.003 rad/frame (~1°/frame à 60fps)
> - **C** : post-1ère interaction → permanent stop
>
> **Triggers de transition vers C** :
> - hover dot · click cube · click filter · toggle 2D/3D · changement mode
> - listeners : `sb:filters`, `sb:actorClick`, `sb:view`, `sb:mode`
>
> Tracking Matomo `cube_idle_rotation_stopped` au premier trigger.
> `prefers-reduced-motion: reduce` → état B désactivé (rotation = 0).

### E.2 · Densité F6 différenciée
> Pulse animation 0.6s cycle sur les edges JV (cycle complet = sin onde):
> - Edges JV (Tencore, Quantum × ARX, Rheinmetall × DOK-ING cross-face) : opacity oscille 0.45 → 0.75
> - Edges acquisitions (4 self-edges Leonardo/Ondas/Cockerill/EDGE) : pas de pulse, stay base opacity (différenciation visuelle)
>
> Marquage via `line.userData.edgeType = 'jv' | 'acq'` posé dans `drawEdge()`.
> Pulse calculé dans `animate()` via `performance.now()` + sin.
> `prefers-reduced-motion: reduce` → pulse désactivé.

### E.3 · Signature shot OG image (SVG → PNG prod)
> Nouveau `assets/og-image.svg` 1200×630 :
> - Cube isométrique 3 faces visibles (F4 ISR top, F1 Logistics left, F2 Combat AP front saturée)
> - Dots opérateurs Tencore (yellow), ARX (blue), Rheinmetall (blue), Frontline (red), DOK-ING (purple), Milrem (slate)
> - F6 flux dorés visibles (4 lignes Tencore-centred)
> - Title block gauche : "TABLES 01 · UGV / The European UGV market — mapped." (italique signal-yellow)
> - Sub : "39 operators · 14 countries · 5 markets superposed · Q1 2026"
> - Footer : "STARBURST AEROSPACE & DEFENSE — TABLES01.STARBURST.AERO"
> - Top-right : badge F6 cerclé
>
> **PROD CHECKLIST** : convertir SVG → PNG avant deployment (LinkedIn n'accepte pas SVG).
> Commande suggérée : `inkscape og-image.svg -w 1200 -h 630 -o og-image.png`
> ou ImageMagick : `magick convert og-image.svg og-image.png`
>
> Ancien `og-image.svg` v4 sauvegardé en `og-image-v4.svg`.

### À NE PAS toucher (préservé)
- `buildCube()`, `buildDots()`, faces colors, exploded view, face zoom
- `computeActorWorldPositions()`, OrbitControls, raycasting, hover tooltip
- fly-to face, morphology mode, picks-only, all labels toggle

---

## ✅ Cycle F — Consent banner localStorage 48h

### Implémenté
> Nouveau `js/consent-banner.js` (112 lignes) :
> - Banner fixed bottom-center 720px, slide-in 360ms après 4.5s de load (post-LiDAR)
> - Texte : "Save your exploration? Tables 01 can remember your filters, picks, and view preferences across sessions (48h)... No data sent to our servers. Cleared automatically."
> - 2 boutons : `[Allow]` (signal-yellow) · `[No thanks]` (border)
> - Stockage `sb-tables-01-consent` avec `{value, timestamp}` localStorage
> - Validity 48h, auto-purge après expiration
> - API exposée : `window.SBConsent.isAllowed()` / `.isDenied()` / `.getStatus()` / `.showBanner()`
> - Tracking Matomo `consent_allowed` / `consent_denied`
>
> Le banner ne réapparaît pas si user a déjà répondu (sauf après 48h ou si purgé).

### Note
> Utilisation effective du localStorage pour state cross-session (filters, picks, view) : à wirer dans Cycle F.2 lorsqu'on connecte le state machine v5.3 à `SBConsent.isAllowed()`.

---

## ✅ Cycle G partiel — Polish a11y

### Implémenté
> **Focus indicators** : outline 2px signal-yellow + offset 2px sur tous éléments interactifs v5.3 :
> - nav links · CTAs · chips · search input · toggle buttons · modal submit · consent buttons · cube replay · ToC links · diagnostic CTAs
>
> **Skip link** : "Skip to main content" en haut du `<body>`, visible au focus seulement (off-screen sinon)
>
> Position 1 dans tab order pour clavier-only users.

### Reporté (Cycle G complet)
- Polish UX transitions modes (animations smooth)
- Tooltips enrichis
- Audit responsive complet
- Pattern hatching pour daltoniens

---

## Validation

> ✅ HTML balance : 41/41 sections · 17/17 scripts · 8/8 asides · 4/4 articles · 4/4 headers
> ✅ JS syntax tous fichiers OK + router inline OK
> ✅ Tous les éléments référencés AVANT le router script
> ✅ step4-cube.js : 1787 → 1856 lignes (+69 idle rotation + edge pulse)

## Smoke test attendu

```bash
cd tables01_v5_3/ && python3 -m http.server 8000
```

| Test | Attendu |
|------|---------|
| Tab key au load | Skip link "Skip to main content" apparaît top-left |
| URL `/` premier load | LiDAR → cube + après ~4.5s : consent banner slide-in |
| Click `[Allow]` consent | Banner disparaît · localStorage.sb-tables-01-consent = 'allowed' |
| Click `[No thanks]` | Banner disparaît · localStorage = 'denied' |
| Reload < 48h après | Pas de banner (déjà répondu) |
| Cube state B (post entry) | Y rotation subtle visible si pas reduced-motion |
| Hover dot | Rotation stoppe permanent (state C) |
| Click filter chip | Stop rotation aussi |
| Cube edges F6 (toggle ON) | Edges JV pulse 0.6s cycle · acquisitions stable (différenciation) |
| URL `/#/read` | Page Read avec ToC · sections · CTAs PDF/CSV header |
| Scroll page Read | ToC active section highlights signal-yellow |
| Click "Open methodology overlay" | v4 overlay s'ouvre onglet Methodology |
| Click "Download PDF" | Ouvre `data/tables01-ugv-paper.pdf` (stub) |
| `prefers-reduced-motion: reduce` | Pas de idle rotation, pas de F6 pulse, pas de banner slide animation |

## Effort cumulé Phase 1 desktop

| Cycle | Status | Effort estimé | Effort réalisé |
|-------|:------:|--------------:|---------------:|
| A | ✅ complet | 5.5-8j | ~6-7j |
| B | ✅ complet | 6.5-8.5j | ~6-7j |
| C | 🟡 MVP condensé | 7.2-10.2j | ~3-4j |
| D | 🟡 structure + placeholders | 5.2-6.2j | ~2.5-3j |
| E | ✅ chirurgical complet | 4-6j | ~2-3j |
| F | ✅ banner complet | 1.5-2.5j | ~1j |
| G | 🟡 a11y minimal | 3-4j | ~0.5j |
| H | ⏸ pas démarré | 3-5j | 0 |
| I | ⏸ pas démarré | 5-7j | 0 |
| J | ⏸ pas démarré | 4-6j | 0 |
| **Total** | | **45-63j** | **~22-26j** |

## Reste pour cycles dédiés

### Cycle C.2/C.3 (4-5j)
- Fusion Step 3+4 live
- PNG canvas 1200×630 share generation
- Growth loop incentive modale (3 emails peers + token)

### Cycle D.2 (1-2j)
- Migration inline méthodologie + sources
- Rédaction éditoriale (Jérémie + comms team)
- Génération PDF prod

### Cycle G complet (3-4j)
- Polish transitions modes
- Tooltips enrichis
- Pattern hatching daltoniens

### Cycle H (3-5j)
- Compiler 15 colonnes pour 39 acteurs
- Recherche manuelle (founders, valuations, websites, last_raise)
- Export CSV + JSON statique

### Cycle I (5-7j)
- Alt text dynamique acteurs cube (ARIA tree parallèle)
- Keyboard navigation full audit
- Screen reader test (NVDA + VoiceOver)
- ARIA live regions diagnostic
- Lighthouse a11y > 95
- axe-core 0 critical

### Cycle J (4-6j)
- Backend Brevo 3 endpoints (CSV / growth loop / token)
- Templates Brevo
- Calendly URL prod
- Matomo snippet + 15 events instrumentés
- CSP headers + GDPR audit
- Cross-browser QA

### Beta (14-21j calendaires)
- 30 VCs invités
- Feedback loop
- Iteration 1-2 cycles

## Fichiers créés cette session

- `js/explore-2d.js` (Cycle B.2 · 333 lignes)
- `js/consent-banner.js` (Cycle F · 112 lignes)
- `assets/og-image.svg` (Cycle E.3 · signature shot — backup ancien `og-image-v4.svg`)
- `CYCLE_C_CHANGELOG.md`
- `CYCLE_B_CHANGELOG.md` (mis à jour avec B.2)
- `CYCLES_D_E_F_G_CHANGELOG.md` (ce fichier)

## Modifications fichiers existants cette session

- `index.html` : 6596 → 9203 lignes (+2607)
  - Header v5.3 + nav + CTAs (Cycle A)
  - Mode-router + LiDAR overlay + narrative + CSV modal (Cycle A)
  - Explore panels LEFT/RIGHT/Toggle 3D-2D (Cycle B)
  - 2D container (Cycle B.2)
  - Read page complète 9 sections (Cycle D)
  - CSS Cycles A à G (~1500 lignes CSS ajoutées)
  - Skip link a11y (Cycle G)

- `js/step4-cube.js` : 1529 → 1856 lignes (+327)
  - setFilters API + onClick CustomEvent (Cycle B.2)
  - renderDiagnostic refacto descriptif (Cycle C.2)
  - triggerChaChing + sharePortfolio (Cycle C.3-5)
  - Idle rotation state machine + edge pulse (Cycle E.1-2)
  - SBStep4Cube public API export

## Branche git suggérée

`v5.3-monolithic` après merge cycles A→G partiels.
Prochain : `cycle-C-2-share` (PNG canvas), `cycle-H-data` (enrichment), `cycle-I-a11y` (WCAG AA), `cycle-J-backend` (Brevo + Calendly + Matomo).
