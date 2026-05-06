# Cycle C — Compose flow + diagnostic descriptif + cha-ching + share

**Status** : Cycle C en version pragmatique condensée · ~3-4j sur 7.2-10.2j théorique
**Date** : 1 mai 2026
**Source** : tables01_v5_3 post-Cycles A + B

## ✅ Implémenté Cycle C (cette session)

### C.1 · Mode Compose réutilise funnel v4
> `setMode('compose')` :
> - Body class `v53-compose-active` ajoutée
> - Cache panels Explore (LEFT/RIGHT/Toggle 3D-2D)
> - `navigateTo(1)` → entrée Step 1 Profile du funnel v4 existant
> - Le user enchaîne naturellement Step 1 → 2 → 3 → 4 (Profile → Thesis → Compose → Reveal)
> - V5.3 header reste visible (avec nav top-right)
> - V4 spa-trail réapparaît (recap Profile · Thesis · Composition)
> - Tracking `mode_compose_entered`
>
> Fusion live Step 3+4 (cube apparaît à droite pendant Compose) **non implémentée** ce cycle — refactor structurel reporté Cycle C.2 dédié.

### C.2 · Diagnostic strictement descriptif
> `step4-cube.js renderDiagnostic()` complètement refactoré :
> - Suppression "Your conviction places you in" / "overweight" / "intentionally absent" / "your stated thesis ✓"
> - Format strict factuel :
>   ```
>   Distribution
>   • F1 Logistics : 2 picks (Tencore P, ARX P)
>   • F2 Combat AP : 3 picks (Tencore P, ARX P, Rheinmetall P)
>   • F4 ISR : 1 pick (ARX P)
>   • F6 Convergence : 3 partnerships involving your picks
>
>   Coverage : 4 markets out of 5
>   Convergence exposure : 67% (vs 26% dataset average)
>   Doctrine alignment : Modular Hybrid (matches your stated thesis)
>   ```
> - Stats numériques avec data-count-up pour cha-ching animation
> - Aucune interprétation, juste des chiffres
> - Tier composition reportée Cycle H (data tier_score à enrichir)

### C.3 · Cha-ching moment au 3e pick
> Trigger : `composition.length >= 3` au mount Step 4 (fires once par run compose, reset entrée Step 4 from Step 3).
>
> Séquence :
> ```
> T+0    : 3e dot or-chaud apparaît (déjà existant via cube re-render)
> T+200  : cube.scale 1.0 → 1.06 → 1.0 ease-out 400ms + navigator.vibrate(50)
> T+500  : count-up Coverage 0→4 sur 600ms · count-up Convergence 0→67 sur 600ms
> T+1100 : highlight Convergence stat avec glow signal-yellow 1.5s
> ```
>
> `prefers-reduced-motion: reduce` → skip pulse + vibrate, count-up devient instant final.
> Tracking Matomo `cha_ching_triggered`.

### C.5 · LinkedIn share text 1-click
> Fonction `sharePortfolio()` dans step4-cube.js, wired sur bouton "↗ Share my portfolio" dans diagnostic panel post-cha-ching.
>
> Comportement :
> - Tente `navigator.share()` natif d'abord (mobile)
> - Fallback : LinkedIn share popup `https://www.linkedin.com/sharing/share-offsite/?url=...` 600×600
> - Texte auto-rempli :
>   ```
>   My UGV market portfolio · composed via Tables 01 by Starburst A&D
>
>   → Coverage : 4/5 markets
>   → Convergence exposure : 67%
>   → Doctrine: Modular Hybrid
>   → Picks : Tencore · ARX · Rheinmetall · Exail · Milrem
>
>   What would YOU remove from this portfolio?
>   ```
>
> PNG canvas 1200×630 generation **non implémentée** (Cycle C.2 dédié — capture Three.js + canvas drawing complexe, ~1.5j).

### C.7 · CSV CTA discret post-diagnostic (Localisation 4 §5.1)
> Bouton "↓ Get dataset (CSV)" inline dans diagnostic panel, à côté du Share.
> Click → ouvre la modale CSV 2 options du Cycle A.
> Tracking `csv_cta_post_diagnostic_clicked`.

## ⏸️ Reporté pour Cycle C.2/C.3 dédiés

### Fusion Step 3+4 live (~2j)
> Spec : "fusion du Step 3 SVG map actuel + Step 4 cube revelation actuel · cube apparaît live à droite, picks SVG map à gauche · highlight or-chaud temps réel sur cube"
>
> Refactor structurel non-trivial (split layout Step 3, mount cube concurrent à SVG picker, sync hover/click). Mérite cycle dédié.

### PNG share canvas 1200×630 (~1.5j)
> Capture Three.js renderer + canvas 2D drawing (cube iso shot + picks gold + score visible + branding Starburst).
> Code : nouveau `js/compose-share.js`. Reporté.

### Growth loop incentive modale (~1j)
> Modale 3 emails peers + nom inviter affichée après PNG share generated.
> Backend `POST /api/growth-loop-invite` (Cycle J).
> Token Tables 02 early access.

## ⏸️ Cycles restants Phase 1 desktop (estimés ~25-35j)

| Cycle | Sujet | Effort estimé |
|-------|-------|--------------:|
| **C.2** | Compose fusion Step 3+4 live + PNG canvas + Growth loop | 4-5j |
| **D** | Read single-page (overlay→page) + Key findings + plan éditorial Tables 02-03 | 5.2-6.2j |
| **E** | Refonte cube : rotation idle stop + densité F6 + signature shot OG | 4-6j |
| **F** | État partagé portfolio (sessionStorage→localStorage) + consent banner 48h | 1.5-2.5j |
| **G** | Polish UX : transitions modes · tooltips · animations · responsive | 3-4j |
| **H** | Data enrichment 15 colonnes 39 acteurs · CSV/JSON statique export | 3-5j |
| **I** | Accessibility WCAG AA · alt text dynamique · keyboard nav · screen readers | 5-7j |
| **J** | QA + backend wirings : Brevo policy · growth loop API · Calendly · Matomo · CSP | 4-6j |
| **Beta** | Beta test 30 VCs · feedback loop · iteration | 14-21j calendaires |

**Total Phase 1 desktop restante** : ~30-40j dev (ne compte pas Beta calendaire).

## Modifications step4-cube.js (additives)

| Fonction | Type | Risque |
|----------|------|--------|
| `renderDiagnostic` | refacto complet (descriptif) | **modéré** — diagnostic visuellement très différent. À valider visuellement. |
| `triggerChaChing` | nouvelle | aucun (animation cube.scale + count-up sur DOM, fire once) |
| `sharePortfolio` | nouvelle | aucun |
| sb:step listener | reset _chaChing flag | aucun |

step4-cube.js : 1604 → 1787 lignes (+183).

## Validation

> ✅ HTML balance : 31/31 sections · 16/16 scripts · 8/8 asides · 3/3 headers
> ✅ JS syntax tous fichiers OK + router inline OK
> ✅ 7 références cd-* (sections refacto), 1 triggerChaChing, 1 sharePortfolio, 10 v53-compose-active

## Smoke test attendu

```bash
cd tables01_v5_3/ && python3 -m http.server 8000
```

| Test | Comportement attendu |
|------|---------------------|
| URL `/#/compose` | Body classe `v53-compose-active` · navigateTo(1) → Step 1 Profile visible |
| Click "Continue" Step 1 | Step 2 Thesis (funnel v4 normal) |
| Click thesis Step 2 → Continue | Step 3 Compose SVG map (funnel v4 normal) |
| Pick 3 actors Step 3 → Continue | Step 4 Cube + diagnostic descriptif + cha-ching pulse + count-up + glow Convergence |
| Diagnostic panel | Format strict : Distribution F1-F6 · Coverage X/5 · Convergence X% (vs 26% avg) · Doctrine alignment |
| Click "↗ Share my portfolio" | navigator.share() ou LinkedIn popup |
| Click "↓ Get dataset (CSV)" | Modale CSV 2 options ouverte |
| Click v5.3 nav "Explore" | Body classe explore-active · cube + filtres + context |
| URL `/?legacy=1` | Funnel v4 intact pure |

## Limites connues

> 1. **Fusion Step 3+4 non implémentée** — l'utilisateur passe par Step 4 séparé après Step 3 (pas de cube live pendant compose). Acceptable pour MVP.
> 2. **PNG share absent** — Share fait un texte LinkedIn natif, pas une image canvas. Acceptable pour MVP, image améliore conversion.
> 3. **Growth loop modale absente** — pas d'invitation peers post-share. Acceptable pour MVP.
> 4. **Tier composition** non affichée dans diagnostic (data tier_score absent du dataset, attendu Cycle H).

## Suite

Quand tu valides Cycle C MVP, on enchaîne. Mes recommandations en ordre de priorité business :

1. **Cycle E** (4-6j) — refonte cube : idle rotation stop + densité F6 + signature shot OG image (impact direct LinkedIn previews)
2. **Cycle D** (5.2-6.2j) — Read page (Key findings + plan éditorial) — c'est le contenu éditorial qui fait le poids du paper
3. **Cycle H** (3-5j) — data enrichment 15 colonnes (sans ça, CSV CTA est limité)
4. **Cycle I** (5-7j) — accessibility (compliance + lighthouse score)
5. **Cycle J** (4-6j) — backend wirings prod (Brevo, Calendly, Matomo)
6. **Cycle F** (1.5-2.5j) — consent banner localStorage
7. **Cycle G** (3-4j) — polish

Beta = post Cycle J.
