# UI refactor v2 — Légende à gauche, simplification radicale

**Date** : 4 mai 2026
**Demande user** : 3 modifs supplémentaires sur la page Explore

## ✅ #1 Bouton Search + colonne LEFT supprimés
- `<button class="v53-search-btn">` retiré du HTML
- `<aside class="v53-explore-left">` (avec input search, chips Country, reset, methodology link, search hint, ep-head, ep-close) entièrement retiré
- ~165 lignes de CSS LEFT panel + search-btn supprimées
- ~110 lignes de JS retirées : wirage chips, search input, updateSearchHint, reset button, methodology link, search button toggle, mobile panel toggles, ESC handler search

## ✅ #2 Légende dans la colonne gauche
- HTML : restauré classe `cube-stage--with-legend` + ajouté `cube-stage--legend-left`
- CSS nouveau bloc `.cube-stage--legend-left` :
  - `grid-template-columns: 280px 1fr` (légende à gauche, cube à droite)
  - `.cube-canvas-wrap { order: 2 }` + `.cube-legend-column { order: 1 }`
  - Border-right au lieu de border-left sur la légende
  - Padding-right au lieu de padding-left
- Mobile <1100px : grid 1fr (stack), cube en haut, légende en dessous (avec border-top)
- Le bandeau top de la légende précédent (Cycle B+) est complètement retiré
- La légende affiche tout son contenu d'origine v4 : Use cases header, axes panel dynamique, Use cases F1-F5, Cross-face F6, Markers, Countries, Morphology

## 🟡 #3 Vue 3D cube sur mobile — réponse honnête

### Ce qui fonctionne (hérité de Three.js OrbitControls r128)
> - **Drag 1 doigt** → rotation cube (touch event natif OrbitControls)
> - **Pinch 2 doigts** → zoom in/out
> - **Tap sur un dot** → fire `sb:actorClick` → remplit le bandeau context top avec les détails de l'acteur
> - **Toggles cube** (All labels, F6 partnerships, Morphology, Exploded view) restent fonctionnels au tap
> - **Bandeau context top** rempli au tap fonctionne

### Limites connues sur mobile
> - **Hover tooltip** (`#cube-tooltip`) ne s'affiche pas sur tactile (pas d'événement `mouseenter`). Le user doit *tap* pour ouvrir le bandeau context — pas de preview en survol.
> - **Performance WebGL** : sur smartphones bas/moyen de gamme (3+ ans), le rendu peut être saccadé surtout avec F6 partnerships actif (12 edges + pulse animation). Acceptable sur iPhone 12+ / Pixel 6+.
> - **Cube canvas** : 400px de haut sur <768px, ~340-380px de large sur smartphone standard. Les dots font ~12px → tap precision OK mais labels petits.
> - **Légende stack vertical** sous le cube en <1100px → user doit scroller pour voir toute la légende.
> - **Toggle 3D/2D** top-right peut chevaucher le bandeau context sur très petit écran (<400px).

### Recommandations
> 1. **Tester sur ton iPhone/Android** avant publication — la perf est très device-dependent
> 2. **Ajouter un hint mobile** ("tap any operator to see details") au load — utile car pas de hover
> 3. **Considérer le mode 2D par défaut sur mobile** (toggle [2D map] visible top-right) — la vue 2D small multiples (5 grilles SVG) est plus accessible sur petit écran que le cube 3D
> 4. **Throttle F6 pulse animation** sur mobile pour économiser CPU/batterie

Tu veux que je code ces optimisations mobile maintenant ? (~1h de dev)

## Validation

```
HTML balance        : 4/4 headers · 1/1 main · 38/38 sections · 19/19 scripts · 7/7 asides · 4/4 articles · 53/53 buttons
JS syntax           : 12/12 fichiers OK + router inline OK
JS files vs v4 ref  : 7/8 (step4-cube.js modifié intentionnellement, cube rendering préservé)
Lignes              : 8914 (était 9290 avant cleanup, -376 lignes)
```

## Smoke test attendu

```bash
cd tables01_v5_3/ && python3 -m http.server 8000
```

| Test | Comportement attendu |
|------|---------------------|
| URL `/` | LiDAR → cube avec **légende v4 complète à gauche** (280px) + cube à droite + bandeau context top + toggle 3D/2D top-right |
| Pas de bouton Search | Confirmé retiré |
| Pas de chips Country | Confirmé retiré |
| Click sur dot acteur | Bandeau context top rempli (Tencore/UA/Raised/HC/Faces/JV) |
| Click `[F1 Logistics]` dans légende | Cube rotate vers face F1 (fonctionnalité v4 préservée) |
| Click `[F6 partnerships]` toggle | Edges JV pulse 0.6s cycle |
| Mobile <1100px | Légende stack en bas du cube, plus de panel latéral |
| Mobile drag 1 doigt | Cube rotate |
| Mobile pinch 2 doigts | Zoom |
| Mobile tap dot | Bandeau context rempli |

## Notes résiduelles (non-critiques)

- 0 références mortes au search-btn / panel LEFT dans HTML
- 1 stub vide `<aside class="v53-explore-left-stub" hidden>` (peut être retiré au prochain pass)
- Quelques règles CSS mortes restantes pour `.v53-ep-*` (selectors inutilisés, pas de match → 0 perf impact)

Pour cleanup 100% propre dis-moi, sinon ces résidus n'affectent rien.
