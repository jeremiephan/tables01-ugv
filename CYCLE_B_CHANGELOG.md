# Cycle B — Explore complet (B.1 + B.2)

**Status** : Phase B finalisée · cube intact côté visuel (rendering identique v4) · API publique additive
**Date** : 1 mai 2026
**Source** : tables01_v4_FINAL exact + Cycle A complet

## Récap Cycle B

### B.1 (session précédente)
> LEFT panel filtres (Search + 4 chips Doctrine + 14 chips Country + Reset + Methodology link)
> RIGHT panel context placeholder + CSV CTA contextuel
> Toggle [3D] / [2D] visible
> Layout body.v53-explore-active

### B.2 (cette session — finalisation)

#### B.2.1 · Filtrage réel cube
> step4-cube.js modifié pour exposer `window.SBStep4Cube.setFilters({doctrine, country, search})`.
> Itère `dotsGroup` et applique opacity 1 (match) ou 0.08 (no match) sur chaque dot, anneau et label.
> Modification additive — n'affecte pas le rendering visuel par défaut.
>
> Router v53 wirage : `applyFilters()` appelle `SBStep4Cube.setFilters(detail)` ET `SBExplore2D.setFilters(detail)` (pour le 2D).
>
> Click chip doctrine ou country → opacity dots non-matchés tombe à 0.08 immédiatement.

#### B.2.2 · Mode 2D small multiples
> Nouveau fichier `js/explore-2d.js` (333 lignes).
> Génère 5 grilles SVG côte à côte (F1..F5) cadence × autonomy 3×3.
> Chaque grille :
> - Eyebrow + face label + axes labels (xLow/xHigh/yLow/yHigh)
> - Dots Primary = circle plein, Secondary = ring (anneau)
> - Couleur par pays (palette desaturée éditoriale, UA = signal-yellow hub)
> - Click dot → fire `sb:actorClick` (même flow que cube 3D)
> - Hover dot → label visible
> - Meta footer : `N primary · M positions`
>
> Sous les 5 grilles : ligne F6 Convergence avec liste des 6 partnerships :
> - Tencore × INSTA · Tencore × QTI · Tencore × Shark · Tencore × DevDroid · Quantum × ARX · Rheinmetall × DOK-ING
>
> Toggle [2D map] dans header → `SBExplore2D.show()` cache le cube 3D + montre le 2D.
> Toggle [3D cube] → `SBExplore2D.hide()` + cube revient.
> Filtres appliqués sur 2D aussi via `setFilters`.

#### B.2.3 · Click cube → RIGHT panel context fill
> step4-cube.js `onClick` modifié : ajoute `window.dispatchEvent(new CustomEvent('sb:actorClick', {detail}))` avec actorCode/name/country/faceId/role/isPick.
>
> Router v53 listener `sb:actorClick` :
> - Trouve startup dans STEP3_DATA.STARTUPS
> - Trouve toutes positions (faces) de l'acteur
> - Trouve partnerships F6 impliquant l'acteur
> - Remplit `#v53-explore-actor` avec :
>   - Nom (titre serif) + tags Country (yellow) + Doctrine
>   - Faces où il est positionné (avec rôle P/S)
>   - Raised / Round / Headcount / Deploy
>   - Note (italique avec border-left jaune)
>   - Partnerships (notes individuelles)
>   - Source (Tier A/B/C)
>
> Tracking Matomo `actor_clicked` avec actorCode.

#### B.2.4 · Mobile collapse panels (< 1100px)
> Boutons hamburger fixed top-left `[☰ Filters]` et top-right `[Info ☰]`.
> Toggle classe `.is-open` sur LEFT/RIGHT panel.
> Click LEFT toggle ferme RIGHT et vice-versa (un panel à la fois en mobile).
> Visible uniquement quand `body.v53-explore-active` ET `< 1100px`.

#### B.2.5 · Mutualisation cube container — REPORTÉE Cycle E
> Décision pragmatique : Step 4 cube reste dans son container `#cube-canvas`.
> Step 5 cube (`#step5-cube-canvas`) n'est JAMAIS activé en mode hub-and-spoke (le router fait toujours `navigateTo(4)`).
> Donc en pratique, **un seul cube actif à la fois**, ce qui satisfait l'objectif de la spec.
> Refactor architectural pur (déplacer `#cube-canvas` hors de Step 4) reporté Cycle E.

## API publique enrichie

```javascript
// Cube 3D
window.SBStep4Cube = {
  setFilters: function({ doctrine: [], country: [], search: '' }),
  rebuild: function(),                    // re-render dots & edges
  getDotsGroup: function()                // pour debug
};

// 2D mode
window.SBExplore2D = {
  show: function(),
  hide: function(),
  build: function(),                      // force rebuild (idempotent)
  setFilters: function({ doctrine, country, search })
};

// Hub-and-spoke
window.V53 = {
  setMode: function('explore' | 'compose' | 'read'),
  getMode: function(),
  openCsvModal: function(),
  closeCsvModal: function(),
  replayIntro: function(),
  activeFilters: { doctrine: Set, country: Set, search: string }
};

// Events fired
window.addEventListener('sb:filters', e => e.detail);    // {doctrine, country, search}
window.addEventListener('sb:actorClick', e => e.detail); // {actorCode, faceId, role, ...}
window.addEventListener('sb:view', e => e.detail);       // {view: '3d' | '2d'}
window.addEventListener('sb:mode', e => e.detail);       // {mode: 'explore' | ...}
```

## Modifications step4-cube.js (additives, non-rendering)

| Diff | Type | Risque visuel |
|------|------|--------------:|
| onClick fire CustomEvent | ajout dispatchEvent | aucun |
| setFilters() function | nouvelle fonction | aucun (modifie opacity à la demande) |
| window.SBStep4Cube export | nouvelle global | aucun |

Total : ~70 lignes ajoutées, 0 modification du rendering ou du raycasting.

## Validation

> ✅ HTML balance : 31/31 sections · 16/16 scripts · 8/8 asides · 3/3 headers
> ✅ JS files identiques v4 ref pour 7/8 (step4-cube.js modifié intentionnellement et minimal)
> ✅ JS syntax tous fichiers OK + router inline OK
> ✅ Tous éléments Cycle B.2 référencés AVANT le script (5/5)
> ✅ Test data sanity : 5 faces F1-F5 occupées, 104 positions, 6 partnerships F6

## Smoke test attendu

```bash
cd tables01_v5_3/ && python3 -m http.server 8000
```

| Test | Comportement attendu |
|------|---------------------|
| URL `/` premier load | LiDAR → cube 3D + LEFT filtres + RIGHT context (empty state) + toggle 3D/2D |
| Click chip "B · Modular Hybrid" | Dots non-B sur cube fade à opacity 0.08 |
| Type "tencore" search | Tous les dots non-Tencore fade |
| Click "↻ Reset filters" | Tous les dots reviennent à opacity 1 |
| Click un dot sur le cube (acteur) | RIGHT panel rempli : nom, tags, faces, raised, headcount, partnerships, source |
| Click "[2D map]" toggle | Cube 3D disparaît, 5 grilles SVG s'affichent + F6 row dessous |
| Click chip filtre en 2D | Dots 2D non-matchés fade |
| Click un dot 2D | RIGHT panel rempli (même flow que 3D) |
| Click "[3D cube]" toggle | Retour cube |
| < 1100px : `[☰ Filters]` top-left | LEFT panel slide-in |
| < 1100px : `[Info ☰]` top-right | RIGHT panel slide-in (LEFT close auto) |
| Click "Compose" nav | Tout explore se cache, placeholder Compose |
| URL `/?legacy=1` | Funnel v4 intact |

## Effort

- **Cycle B total estimé** : 6.5-8.5j
- **Réalisé B.1 + B.2** : ~6-7j équivalent
- **Cycle B complet ✓**

## Suite : Cycle C

**Cycle C — Compose 3-step + diagnostic + cha-ching + share viral + growth loop** (7.2-10.2j)
- Mécanique 3-step resserrée (Profile · Thesis · Compose live)
- Diagnostic strictement descriptif (chiffres only, pas d'interprétation)
- Cha-ching moment au 3e pick (cube pulse + vibrate + count-up)
- PNG share generation client-side canvas 1200×630
- LinkedIn share text auto-rempli 1-click
- Growth loop incentive modale (3 emails peers)
- CSV CTA discret post-diagnostic (Localisation 4)
