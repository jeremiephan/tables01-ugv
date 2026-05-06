# Optimization pass — Cleanup + Mobile + Production

**Date** : 6 mai 2026
**Scope** : Phase A cleanup code mort · Phase B mobile · Phase C production assets

## ✅ Phase A · Cleanup code mort

### CSS supprimés (~370 lignes)
- Bloc Cycle C diagnostic (`.cd-empty`, `.cd-section`, `.cd-stats-grid`, `.cd-cta`...) — ~110 lignes
- Bloc Cycle C.6 Growth loop form — ~45 lignes
- Bloc `body.v53-compose-active` — ~25 lignes
- Legacy v4 `.cube-annotations` + `.cube-diagnostic` CSS — ~150 lignes
- `.v53-mobile-panel-toggle` + `.v53-mobile-context-toggle` — ~38 lignes
- Refs `.cd-cta`, `.v53-ep-chip`, `.v53-ep-search` du focus-visible

### HTML supprimés
- Stub `<aside class="v53-explore-left-stub">`
- Include `<script id="compose-share">`

### JS supprimés
- Fichier `js/compose-share.js` (218 lignes)
- Fonctions `triggerChaChing` + `sharePortfolio` dans step4-cube.js (~120 lignes)
- Refs `_chaChing` flag + `openGrowthLoopModal` stub
- `openGrowthLoopModal` retiré de l'API publique `window.V53`

### Métriques
| Fichier | Avant | Après | Δ |
|---------|------:|------:|--:|
| index.html | 9290 | 8557 | -733 |
| js/step4-cube.js | 1966 | 1829 | -137 |
| js/compose-share.js | 218 | (supprimé) | -218 |
| **Total** | | | **-1088 lignes** |

## ✅ Phase B · Mobile optimizations

### Bandeau context (touch-aware)
- Texte adapté : "Click <span class=v53-cb-mobile-only>or tap</span> any operator on the cube"
- CSS `.v53-cb-mobile-only { display: none }` + `@media (max-width: 768px) { display: inline }`
- Sur desktop : "Click any operator..." · sur mobile : "Click or tap any operator..."

### Toggle 3D/2D mobile
- `@media (max-width: 768px)` : `top: auto; bottom: 70px; right: 12px`
- Padding réduit : `2px` (vs `3px` desktop), boutons `padding: 5px 9px; font-size: 9.5px`
- Évite le chevauchement avec le bandeau context top sur mobile

### Cube replay button mobile
- `@media (max-width: 768px)` : `bottom: 70px; right: auto; left: 12px`
- Déplacé en bas-gauche pour ne pas chevaucher le toggle 3D/2D mobile (en bas-droite)
- Padding et font-size réduits

### F6 pulse animation throttle mobile
- step4-cube.js animate() : ajout `const isMobile = window.innerWidth < 768`
- Skip pulse si `isMobile === true` → économie CPU/batterie sur mobile
- Toujours respect `prefers-reduced-motion: reduce`

## ✅ Phase C · Production assets

### og-image.png généré (1200×630)
- Conversion SVG → PNG via Python PIL natif (cairosvg pas dispo)
- Cube isométrique 3 faces (F4 ISR top, F1 Logistics left, F2 Combat AP front saturé)
- Dots opérateurs : Tencore yellow, ARX/Rheinmetall blue, Frontline red, DOK-ING purple, Milrem slate
- F6 flux dorés en pointillés (4 lignes Tencore-centred)
- Title block "TABLES 01 · UGV / The European UGV market — mapped." (italique signal-yellow)
- Sub : "39 operators · 14 countries · 5 markets superposed · Q1 2026"
- Footer + badge F6 top-right cerclé
- Taille : 33.8 KB (optimisé)
- LinkedIn-compatible (PNG accepté, SVG refusé)

### Meta tags `<head>` optimisés
- Title : "Tables 01 · UGV — The European UGV market mapped | Starburst A&D"
- Version : v4.0 → v5.3
- Description mise à jour scope simplifié (plus de "Compose your portfolio")
- Viewport : `width=device-width, initial-scale=1, viewport-fit=cover` (notch iOS)
- `theme-color: #0d1220` (Safari address bar mobile)
- `color-scheme: dark`
- OG image type explicit : `og:image:type = image/png`
- Twitter cards mises à jour

### Favicons
- `assets/icons/favicon.svg` (664B) - cube isométrique mini avec accent jaune
- `assets/icons/favicon.ico` (857B) - fallback pour navigateurs anciens (32x32 + 16x16)
- Référencés dans `<head>` : `<link rel="icon" type="image/svg+xml">` + fallback ICO

## Validation

```
HTML balance    : 4/4 headers · 1/1 main · 38/38 sections · 18/18 scripts · 6/6 asides · 4/4 articles
JS syntax       : 11/11 fichiers OK + router inline OK
Total size      : 812 KB (vs ~1 MB avant cleanup)
Lignes totaux   : -1088 lignes de code mort retirées
```

## Smoke test cumulé

```bash
cd tables01_v5_3/ && python3 -m http.server 8000
```

| Test | Comportement attendu |
|------|---------------------|
| URL `/` | LiDAR → cube + légende à gauche + bandeau context + toggle 3D/2D top-right · Pas de findings/diagnostic |
| Mobile <768px | Toggle 3D/2D bottom-right · cube-replay bottom-left · "or tap" visible dans bandeau |
| Mobile drag/pinch | Rotation + zoom fonctionnent (Three.js OrbitControls touch natif) |
| Mobile tap dot | Bandeau context rempli |
| F6 toggle ON desktop | Edges JV pulse 0.6s |
| F6 toggle ON mobile | Edges JV statiques (pulse skipped pour économie batterie) |
| `prefers-reduced-motion: reduce` | Toutes animations désactivées |
| Inspect head | Meta OG/Twitter complets · favicon SVG + ICO |
| LinkedIn share preview | og-image.png 1200×630 cube isométrique + branding |

## Reste pour finalisation prod

### Code-only (optionnel)
- Polish G complet (transitions, tooltips enrichis, pattern hatching)
- Refactor C.2 fusion Step 3+4 live (mais Compose retiré donc obsolète)
- Migration metho/sources inline page Read

### Dépendances externes uniquement
- **Rédaction éditoriale** Read page (Jérémie + comms team) : 5e pull-quote, 5 markets, Convergence, Tables 02-03, Authors quote
- **Backend prod** : Brevo CSV email, Calendly URL, Matomo snippet
- **QA** : audit screen reader réel, Lighthouse, axe-core, cross-browser
- **Beta** : 30 VCs outreach (14-21j calendaires)
- **Génération PDF** Read page (Pandoc/Prince)

Le module est prêt pour publication GitHub + déploiement Cloudflare Pages.
