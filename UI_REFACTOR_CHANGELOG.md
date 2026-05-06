# UI refactor — Explore page simplification

**Date** : 1 mai 2026
**Demande user** : 5 modifications interface Explore

## ✅ #1 LEFT panel — refactor complet
- **#1a Doctrine filter retiré** — chips A/B/C/E supprimés du panel
- **#1b Search bug fixé** — labels n'avaient pas userData.country/actorName, fallback via STARTUPS lookup ajouté dans `setFilters()`. Hint visuel "X / 38 operators match" dans le panel.
- **#1c Search panel toggle-only** :
  - Bouton flottant top-left `[🔍 Search]` toujours visible en explore mode
  - Click → LEFT panel slide-in 240ms (transform translateX -100% → 0)
  - Bouton `[✕]` close en haut du panel + ESC pour fermer
  - Auto-focus sur le champ search à l'ouverture
  - LEFT panel hidden par défaut (n'occupe plus l'espace)

## ✅ #2 RIGHT panel → bandeau top
- Aside `v53-explore-right` 280px supprimée
- Nouveau `<div class="v53-context-banner">` ajouté juste après le titre Step 4 (avant cube-stage)
- Layout horizontal compact : nom acteur (serif) + tag pays (yellow) + raised + HC + deploy + faces + JV count + bouton ✕
- Empty state inline : "Click any operator on the cube · 39 operators · 14 countries · 5 markets superposed"
- Border-left signal-yellow quand acteur sélectionné
- sb:actorClick handler refactoré pour fill le bandeau au lieu du panel droit

## ✅ #3 "Pick your portfolio" features retirées
- **Nav v5.3** simplifiée : Explore · Read · Methodology (Compose retiré)
- **Section v53-mode-compose** supprimée (placeholder n'existe plus)
- **Modale Growth loop** (3 emails peers + token) supprimée intégralement
- **Toggle "Picks only"** retiré du cube legend
- **Mention "Your portfolio"** dans la légende Cross-face supprimée
- **Titre Step 4** changé :
  - Eyebrow : `Step 04 / 05 · Cube revelation` → `Explore · 5-market UGV cube`
  - H1 : `Five superposed markets. Your portfolio in the structure.` → `The European UGV market — five superposed markets.`
  - Deck : `Your X picks projected on the five-market UGV cube...` → `39 operators · 14 countries · 6 partnerships. Rotate, zoom, hover any glyph for context.`
- **Router** :
  - `composeMode = null` (référence retirée)
  - `readHash` regex `/^#\/(explore|read)/` (compose retiré)
  - `setMode` validation : seulement 'explore' | 'read'
  - body class `v53-compose-active` plus jamais ajouté
- **Boutons mobile** retirés (mobile-filters-toggle redondant avec search-btn ; mobile-context-toggle obsolète car panel droit retiré)

## ✅ #4 Légende cube en bandeau top sur 2 lignes
- CSS `body.v53-explore-active .step-screen[data-step="4"] .cube-legend-column` :
  - `display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px 28px`
  - `padding: 14px 18px; margin-bottom: 14px`
  - Position statique au-dessus du cube (était column right en grid 2-col)
  - `.clc-header` (titre "Use cases") caché en mode explore
  - `.clc-divider` cachés (compactage)
  - Countries grid en 7 colonnes (vs 2 en mode legacy)
- Toggle 3D/2D déplacé top-right (était top-center, plus de conflit visuel avec légende top)
- Mobile <1100px : grid-template-columns: 1fr (stack)

## ✅ #5 Findings + Diagnostic + action-bar supprimés
- Section "Findings" (`<div id="cube-annotations">`) supprimée du Step 4
- Section "Diagnostic" (`<div id="cube-diagnostic">`) supprimée du Step 4
- `<div class="action-bar">` "Continue to free exploration" supprimé
- Le cube est maintenant suivi directement par `</article></div></section>`

## Validation

```
HTML balance        : 4/4 headers · 1/1 main · 38/38 sections · 19/19 scripts · 7/7 asides · 4/4 articles · 70/70 buttons
JS syntax           : 12/12 fichiers OK + router inline OK
JS files vs v4 ref  : 7/8 (step4-cube.js modifié intentionnellement, cube rendering préservé)
```

## Notes résiduelles (non-critiques)

- 2 refs `v53-explore-right` dans le router JS — `getElementById` retourne null, checks `if (xxx)` évitent crash. À nettoyer si on veut un build 100% propre.
- 41 refs CSS `.cube-diagnostic *` — règles CSS mortes (l'élément n'existe plus), mais pas de selector matched donc pas de problème de performance.
- 1 ref CSS `.cube-annotations` — règle CSS morte.

Ces résidus sont du code "déprécié" qui ne s'exécute pas. Si tu veux un cleanup complet je peux les retirer en passe séparée.

## Smoke test attendu

```bash
cd tables01_v5_3/ && python3 -m http.server 8000
```

| Test | Comportement attendu |
|------|---------------------|
| URL `/` | LiDAR → cube avec **légende en bandeau top 2 lignes** + bouton `[🔍 Search]` top-left + toggle `[3D]/[2D]` top-right |
| Click `[🔍 Search]` | LEFT panel slide-in, focus auto sur input, `[✕]` close visible |
| Type "tencore" | Hint "1 / 38 operators match" en jaune, dots non-Tencore fade à 0.08 |
| Type "xyz123" | Hint "No match · try another query" en rouge |
| Click chip "UA" | Hint "X / 38 operators match", dots non-UA fade |
| Click `[✕]` ou ESC | LEFT panel slide-out |
| Click acteur sur cube | Bandeau top rempli : nom (serif) + UA (jaune) + raised + HC + deploy + faces + JV |
| Click `[✕]` bandeau | Bandeau revient à empty state |
| Sous le cube | RIEN (Findings + Diagnostic + Continue button supprimés) |
| Nav top | Seulement Explore · Read · Methodology (Compose retiré) |
| URL `/?legacy=1` | Funnel v4 intact (Compose flow disponible en legacy) |

## Effort

~2h30 de refactor. Touche peu au cube lui-même (juste `setFilters` enrichi avec lookup STARTUPS), majoritairement HTML structure + CSS layout + router JS.
