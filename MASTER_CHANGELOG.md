# Tables 01 · UGV — v5.3 master changelog

**Status** : Cycles A → J (structure) en monolithic build · ~80% Phase 1 desktop
**Date** : 1 mai 2026
**Source** : tables01_v4_FINAL exact (zip uploadé) + extensions Cycle A→J

## Cycles complétés

### ✅ Cycle A — Architecture hub-and-spoke (5.5-8j théorique · ~6-7j réalisé)
- Header v5.3 + nav top-right + 2 sticky CTAs Book call/Share
- Router mode-based (3 modes hub-and-spoke + hash routing #/explore #/compose #/read)
- Fallback `?legacy=1` body.is-legacy
- LiDAR overlay au load (D-IMPL-1 option A) · 2.5s scan + 800ms fade
- Mini-narrative overlay non-bloquant (Q1 2026 redrew the map)
- Trust footer permanent + CSV CTA inline (Localisation 1)
- Bouton Replay intro bas-droite cube
- CTAs Book call & Share wirés (Calendly + LinkedIn)
- CSV modale 2 options (anonymous + email avec newsletter UNCHECKED par défaut)
- Suppression Step 0 fallback cards (D-IMPL-2)

### ✅ Cycle B — Explore complet (6.5-8.5j · ~6-7j)
- LEFT panel filtres (Search debounce 200ms · 4 chips Doctrine · 14 chips Country · Reset · Methodology)
- RIGHT panel context (empty state stats + actor detail dynamique au click cube)
- CSV CTA contextuel RIGHT panel (Localisation 2)
- Toggle [3D] / [2D] floating top-center
- Mode 2D small multiples (5 grilles SVG cadence × autonomy + F6 row dessous)
- Mobile collapse panels (<1100px) avec hamburger toggles
- API publique : `window.SBStep4Cube.setFilters({doctrine, country, search})`
- API publique : `window.SBExplore2D.show()/.hide()/.setFilters()`
- Click cube/2D dot → fire `sb:actorClick` event → fill RIGHT panel (nom, tags, faces, raised, partnerships, source)

### 🟡 Cycle C — Compose flow MVP (7.2-10.2j · ~3-4j)
- Mode compose réutilise funnel v4 (Step 1 → 2 → 3 → 4)
- Diagnostic strictement descriptif (chiffres only · plus de "Your conviction"/"overweight")
- Cha-ching au 3e pick (cube pulse 1.06 + count-up 0→N + glow Convergence)
- LinkedIn share text 1-click
- CSV CTA discret post-diagnostic (Localisation 4)
- **+ Cycle C.2** : PNG canvas 1200×630 generation client-side (`compose-share.js` · 218 lignes)
- **+ Cycle C.6** : Growth loop modale (3 emails peers + token Tables 02 · texte anti-spam explicite)
- **Reporté** : fusion Step 3+4 live (refactor structurel · Cycle C.2 dédié)

### 🟡 Cycle D — Read page structure (5.2-6.2j · ~2.5-3j)
- Header sticky avec eyebrow + title + byline + ToC + 2 CTAs prominents (PDF + CSV)
- 9 sections structurées (Key findings 4+1 · Thesis · 5 markets · Convergence · Why Tables 01 vs 5 alternatives · Methodology · Sources · Tables 02-03 · Authors)
- Bottom CTAs (cube · compose · book call)
- ToC scrollspy actif au scroll
- PDF download stub `data/tables01-ugv-paper.pdf`
- Methodology + Sources buttons rouvrent l'overlay v4
- **Reporté** : rédaction éditoriale (Jérémie + comms team) · génération PDF prod · migration metho/sources inline

### ✅ Cycle E — Cube refonte chirurgicale (4-6j · ~2-3j)
- E.1 Idle rotation state machine (A entry → B subtle Y rotation → C permanent stop)
- E.2 F6 differential density (edges JV pulse 0.6s cycle 0.45→0.75 · acquisitions stables)
- E.3 Signature shot OG image SVG 1200×630 (cube isométrique 3 faces + dots + F6 flux + branding)
- **PROD CHECKLIST** : convertir og-image.svg → og-image.png avant deployment
- **À NE PAS toucher** préservé : buildCube, buildDots, faces colors, exploded view, OrbitControls, raycasting, hover tooltip, fly-to face

### ✅ Cycle F — Consent banner localStorage 48h (1.5-2.5j · ~1j)
- `js/consent-banner.js` (112 lignes)
- Banner slide-in après 4.5s post-LiDAR · "Allow" / "No thanks"
- localStorage 48h validity · auto-purge expiration
- API `window.SBConsent.isAllowed()`
- Tracking `consent_allowed` / `consent_denied`

### 🟡 Cycle G — Polish a11y (3-4j · ~0.5j partiel)
- Focus indicators 2px signal-yellow + offset 2px sur tous éléments interactifs v5.3
- Skip link "Skip to main content" en première position tab
- **Reporté** : tooltips enrichis · pattern hatching daltoniens · transitions modes polish

### ✅ Cycle H — Data enrichment + CSV/JSON (3-5j · ~0.5j car généré depuis dataset existant)
- `data/tables01-ugv-dataset.csv` : 38 rows × 19 columns (UTF-8, Excel-friendly)
- `data/tables01-ugv-dataset.json` : 38 operators + 6 partnerships + metadata + faces structure
- Champs : code · actor_name · country · doctrine_code · doctrine_label · positions_5_faces · cadence · deployment · fundingScale · last_raise · round_info · headcount · deployment_signal · key_partnerships · note · source_tier · source_text · last_updated · methodology_link
- Stub bouton CSV download direct → vrai fichier (plus de Blob client-side stub)
- **Restant** : enrichissement manuel last_raise précis · valuation_estimate · founders · websites (data ops Jérémie)

### 🟡 Cycle I — A11y improvements (5-7j · ~1.5j sans test screen reader réel)
- ARIA tree parallèle pour cube (`#cube-aria-tree` role="tree" sr-only)
- Chaque acteur listé avec aria-label dynamique : "Tencore, Ukraine, doctrine A, position F2 Combat AP (cadence 3, autonomy 2), primary marker"
- Click/Enter/Space sur item ARIA tree → fire `sb:actorClick` (clavier-only fonctionne)
- aria-live="polite" sur diagnostic panel (annonces dynamiques au screen reader)
- role="region" + aria-label sur diagnostic
- `<main id="main-content">` wrapper avec skip link target
- prefers-reduced-motion étendu : LiDAR · cube idle · F6 pulse · cha-ching · count-up · narrative fade · consent slide
- **Reporté** : audit screen reader réel NVDA/VoiceOver · Lighthouse a11y score · axe-core 0 critical · color contrast audits · keyboard nav full audit

### 🟡 Cycle J — Backend wirings structure (4-6j · ~1j sans backend prod)
- `js/api-client.js` (153 lignes) centralise tous les wirings
- Endpoints stubs prêts à wirer prod :
  - `POST /api/csv-request` (3 modes : anonymous · email-only · email+newsletter)
  - `POST /api/growth-loop-invite` (3 emails peers + token 30 jours)
  - `POST /api/redeem-token` (Tables 02 early access)
- CONFIG centralisé : API_BASE · CALENDLY_URL · MATOMO · BREVO_TEMPLATES
- MOCK_MODE = true par défaut (à passer à false en prod)
- `window.SBApi.track(category, action, name, value)` wrapper Matomo
- 26 events Matomo instrumentés (KNOWN_EVENTS list)
- Detection automatique prefers-reduced-motion → tracking
- **Reporté** : configuration Brevo prod · Calendly URL réelle · Matomo snippet head · CSP headers · cross-browser QA

## Reste pour finalisation prod

| Item | Effort | Dépendance |
|------|--------|-----------|
| Cycle C.2 fusion Step 3+4 live | 2-3j | code-only |
| Cycle D rédaction éditoriale | 2-3j | **Jérémie + comms team** |
| Cycle D génération PDF | 0.5j | tooling (Pandoc/Prince) |
| Cycle G polish complet | 2-3j | code-only |
| Cycle H enrichissement manuel data | 2-3j | **research ops** |
| Cycle I audit screen reader réel | 2-3j | NVDA + VoiceOver tests |
| Cycle I Lighthouse + axe-core | 0.5j | **outils de test** |
| Cycle J backend Brevo provisioning | 2-3j | **dev backend + Brevo account** |
| Cycle J Calendly URL prod | 0.1j | **Calendly account config** |
| Cycle J Matomo snippet config | 0.5j | **Matomo instance** |
| Cycle J CSP headers | 0.3j | code-only |
| Cycle J cross-browser QA | 1-2j | **manual testing** |
| **og-image.svg → PNG conversion** | 0.1j | **tooling** (inkscape/imagemagick) |
| Beta test 30 VCs | 14-21j calendaires | **process VC outreach** |

**Total restant** : ~12-18j dev + dépendances externes.

## Files structure

```
tables01_v5_3/
├── index.html              (9366 lignes · 16 inline scripts · 4 articles · 41 sections)
├── README.md
├── MASTER_CHANGELOG.md     (ce fichier)
├── CYCLE_A_CHANGELOG.md
├── CYCLE_B_CHANGELOG.md
├── CYCLE_C_CHANGELOG.md
├── CYCLES_D_E_F_G_CHANGELOG.md
├── data/
│   ├── tables01-ugv-dataset.csv  (38 × 19)
│   └── tables01-ugv-dataset.json (38 ops + 6 partnerships)
├── assets/
│   ├── og-image.svg              (Cycle E.3 signature shot · convertir PNG prod)
│   └── og-image-v4.svg           (backup ancien)
├── styles/  (CSS preserved from v4)
└── js/
    ├── api-client.js             (Cycle J · 153)
    ├── compose-share.js          (Cycle C.2 · 218)
    ├── consent-banner.js         (Cycle F · 112)
    ├── explore-2d.js             (Cycle B.2 · 333)
    ├── step3-data-v4.js          (preserved · 428)
    ├── step3-data.js             (preserved · 225)
    ├── step3-app-v4.js           (preserved · 723)
    ├── step3-app.js              (preserved · 641)
    ├── step4-cube.js             (1529 → 1957 · +428 lignes additives)
    ├── step4-data.js             (preserved · 453)
    ├── step5-app.js              (preserved · 831)
    └── step-info.js              (preserved · 185)
```

## API publique cumulée

```javascript
// Hub-and-spoke
window.V53 = {
  setMode: (mode) => void,           // 'explore' | 'compose' | 'read'
  getMode: () => string,
  openCsvModal: () => void,
  closeCsvModal: () => void,
  openGrowthLoopModal: () => void,
  replayIntro: () => void,
  activeFilters: { doctrine: Set, country: Set, search: string }
};

// Cube 3D
window.SBStep4Cube = {
  setFilters: ({ doctrine: [], country: [], search: '' }) => void,
  rebuild: () => void,
  getDotsGroup: () => THREE.Group
};

// 2D mode
window.SBExplore2D = {
  show: () => void,
  hide: () => void,
  build: () => void,
  setFilters: ({...}) => void
};

// Compose share
window.SBComposeShare = {
  generatePNG: (portfolio) => HTMLCanvasElement,
  downloadPNG: (canvas) => void,
  generateAndDownload: (portfolio) => HTMLCanvasElement
};

// Consent
window.SBConsent = {
  isAllowed: () => boolean,
  isDenied: () => boolean,
  getStatus: () => 'allowed' | 'denied' | null,
  showBanner: () => void
};

// Backend
window.SBApi = {
  config: { API_BASE, CALENDLY_URL, MOCK_MODE, ... },
  csvRequest: (payload) => Promise,
  growthLoopInvite: (payload) => Promise,
  redeemToken: (token) => Promise,
  getCalendlyUrl: (prefill) => string,
  track: (category, action, name, value) => void,
  KNOWN_EVENTS: [...26 events]
};

// Events fired (CustomEvent on window)
- sb:filters       { detail: { doctrine, country, search } }
- sb:actorClick    { detail: { actorCode, actorName, country, faceId, role, isPick } }
- sb:view          { detail: { view: '3d' | '2d' } }
- sb:mode          { detail: { mode: 'explore' | 'compose' | 'read' } }
- sb:step          { detail: { step: number, from: number } } // funnel v4
```

## Validation finale

```
HTML balance        : 4/4 headers · 1/1 main · 41/41 sections · 19/19 scripts · 8/8 asides · 4/4 articles
JS syntax           : 12/12 fichiers OK + router inline OK
Files identical v4  : 7/8 (step4-cube.js modifié intentionnellement, +428 lignes additives non-rendering)
Cycle elements      : tous présents · v53-growth-modal · ARIA tree · aria-live · skip link · main wrapper
```

## Smoke test cumulé

```bash
cd tables01_v5_3/ && python3 -m http.server 8000
```

| Cycle | Test | Attendu |
|-------|------|---------|
| A | URL `/` | LiDAR 2.5s → cube + nav v5.3 + narrative + trust footer permanent |
| A | `?legacy=1` | Funnel v4 intact pure |
| B | Click chip "B" | Dots non-B fade à 0.08 sur cube |
| B | Click acteur | RIGHT panel rempli avec données complètes |
| B | `[2D map]` | 5 grilles SVG + F6 row |
| C | `/#/compose` | Step 1 Profile → Step 2 → Step 3 → Step 4 |
| C | 3+ picks Step 4 | Cha-ching pulse + count-up + glow Convergence |
| C | Click "↗ Share" | PNG download + LinkedIn popup + Growth loop modale après 800ms |
| D | `/#/read` | Page Read avec ToC + sections + scrollspy actif |
| D | `[Download CSV]` | Modale 2 options |
| E | Cube post-entry | Y rotation subtle |
| E | Hover dot | Rotation stop permanent |
| E | F6 toggle ON | Pulse 0.6s edges JV · acquisitions stables |
| F | After 4.5s | Banner consent slide-in bottom |
| F | Click Allow | localStorage.sb-tables-01-consent = 'allowed' |
| G | Tab key | Skip link visible top-left |
| H | CSV download | Fichier 38 rows téléchargé |
| I | Tab dans cube area | ARIA tree navigable au clavier |
| I | prefers-reduced-motion | Toutes animations skippées |
| J | DevTools console | `window.SBApi.config`, events tracked |

## Branche git suggérée

`v5.3-monolithic-A-J` après merge.
Branches à créer pour finalisation :
- `cycle-C-2-fusion` (Step 3+4 live)
- `cycle-D-2-editorial` (rédaction Jérémie)
- `cycle-G-polish` (transitions + tooltips)
- `cycle-H-enrichment` (15 colonnes manuelles)
- `cycle-I-a11y-audit` (NVDA + axe-core + Lighthouse)
- `cycle-J-backend-prod` (Brevo + Calendly + Matomo)
- `phase-beta` (30 VCs)
