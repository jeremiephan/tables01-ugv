# Cycle A — Architecture hub-and-spoke (v5.3) · COMPLET

**Status** : Cycle A finalisé · cube riche v4 préservé · LiDAR D-IMPL-1 + Replay + CTAs + CSV modale
**Date** : 1 mai 2026
**Source** : tables01_v4_FINAL exact (zip uploadé)

## ✅ A.1 (squelette · session précédente)

> A1 · Header v5.3 refondu — `[glyph] Tables 01 · UGV    Explore · Compose · Read · Methodology    [Book call] [Share ↗]`
> A2 · Router mode-based hub-and-spoke (3 modes · hash routing)
> A3 · Fallback `?legacy=1` (body.is-legacy switch)
> A4 · Mini-narrative overlay non-bloquant (auto-fade 8s, dismiss)
> A5 · Trust footer permanent + CSV CTA inline
> A6 · Suppression Step 0 fallback cards (D-IMPL-2)

## ✅ A.2 (cycle continué · session courante)

### A.2.1 · LiDAR overlay au load (D-IMPL-1 option A)
> Overlay plein écran `#v53-lidar-overlay` avec :
> - SVG simplifiée : grid lines + 5 country zones (3 bleus, 1 jaune, 1 bleu) + 17 dots constellation + scan line animée
> - Readout en haut : `Scan 270412Z · 12 Hz · Polaris v0.9 · EU + UA + IL`
> - Tagline en bas : `39 operators · 14 countries · 5 markets superposed · April 2026`
> - Scan line : animation CSS `translateX -1600px → +1600px` sur 2.5s (jaune signal-yellow + drop-shadow)
> - Dots twinkle : `opacity 0.3 → 0.95` infinite, delays staggered 4 colors
>
> **Séquence au premier load mode explore** :
> ```
> T+0s   → overlay visible, scan line démarre
> T+2.5s → fade out 800ms
> T+3.3s → cube révélé + narrative apparaît (200ms après navigateTo(4))
> ```
>
> Sur navigation suivante (`#/explore` après compose ou read) : skip LiDAR, cube immédiat.
> `prefers-reduced-motion: reduce` → skip overlay total, cube + narrative directement.

### A.2.2 · Bouton Replay sur cube (bas-droite)
> `<button class="v53-cube-replay">↻ Replay intro</button>` monté dynamiquement par le router une fois le cube en place.
> Position : `absolute bottom-12 right-12` sur `.cube-stage`, z-index 30.
> Style cohérent IBM Plex Mono uppercase, hover signal-yellow.
> Click → reset `lidarPlayed` + `narrativeDismissed` puis replay overlay + narrative.

### A.2.3 · Wire CTAs Book call & Share
> **Book call** → `window.open('https://calendly.com/starburst-aerospace/ugv-30min', '_blank')` (PROD CHECKLIST: replace URL before deployment) + tracking Matomo `book_call_clicked` avec mode courant
>
> **Share** → tente `navigator.share()` natif d'abord (mobile), fallback LinkedIn share popup `https://www.linkedin.com/sharing/share-offsite/?url=...` 600×600 + tracking `share_native` ou `share_linkedin`

### A.2.4 · CSV modale 2 options (spec §2.5 · D-IMPL-4 implication §5.1)
> Modale `#v53-csv-modal` avec backdrop blur :
>
> **Option A — Direct download** : génère CSV stub client-side (Blob + URL.createObjectURL) avec dataset placeholder, no email, immédiat. Tracking `csv_download_direct`.
>
> **Option B — Email + (optional) updates** :
> - Champ email avec validation regex `/^[^@]+@[^@]+\.[^@]+$/`
> - Checkbox newsletter Tables 02/03 **UNCHECKED par défaut** (D-IMPL-4 strict)
> - Texte explicite policy : "When unchecked → ZERO follow-up email"
> - Tracking `csv_email_only_no_newsletter` ou `csv_email_with_newsletter_signup`
> - PROD CHECKLIST: replace by real Brevo endpoint
>
> Triggers modale :
> - Click `tf-csv-cta` (trust footer · Localisation 1)
> - ESC pour fermer · click backdrop pour fermer · bouton ✕

### A.2.5 · API publique enrichie
> `window.V53.setMode('explore'|'compose'|'read')`
> `window.V53.getMode()`
> `window.V53.openCsvModal()` / `window.V53.closeCsvModal()`
> `window.V53.replayIntro()` (relance LiDAR + narrative)

## Validation

> ✅ HTML balance : 30/30 sections · 15/15 scripts · 3/3 headers · 301/301 divs
> ✅ JS files **strictement identiques au v4 reference** (8/8 · diff confirme 0 différence)
> ✅ JS syntax v53 router OK (450+ lignes inline)
> ✅ Tous les éléments v5.3 présents (header, router, narrative, lidar overlay, csv modal, replay button, tf-csv-cta)
> ✅ navigateTo(4) appelé en mode explore (4 références)

## Smoke test attendu

```bash
cd tables01_v5_3/ && python3 -m http.server 8000
```

| Test | Comportement attendu |
|------|---------------------|
| URL `/` premier load | Overlay LiDAR scan 2.5s → fade out 800ms → cube riche + narrative bottom-center |
| Click cube ou ✕ narrative | Narrative dismiss · cube interaction normale |
| Bouton ↻ Replay (bas-droite cube) | Relance LiDAR overlay + narrative |
| Click "Compose" nav | Placeholder Compose mode · pas de LiDAR |
| Click "Read" nav | Placeholder Read mode · pas de LiDAR |
| Retour "Explore" via nav | Cube immédiat (skip LiDAR) |
| Header [Book call] click | Ouvre Calendly nouvelle fenêtre |
| Header [Share ↗] click | navigator.share() ou LinkedIn popup |
| Footer [↓ Get the dataset (CSV)] | Ouvre modale 2 options |
| Modale option A "Download CSV" | Télécharge tables01_ugv_dataset.csv (stub) |
| Modale option B email + checkbox | Validation email · success message · checkbox UNCHECKED par défaut |
| ESC sur modale | Ferme |
| URL `/?legacy=1` | Ancien funnel 6-step intact (Step 0 LiDAR + step dots) |
| `prefers-reduced-motion: reduce` | Skip LiDAR overlay · cube + narrative directement |

## Effort

- **Estimé Cycle A complet** : 5.5-8j théorique
- **Réalisé total A.1 + A.2** : ~6-7j équivalent
- **Cycle A complet ✓**

## ⏸️ PROD CHECKLIST avant deployment

Remplacer ces placeholders par les vraies valeurs prod :

| Item | Localisation | TODO |
|------|--------------|------|
| Calendly URL | `bookCallCta` handler | Remplacer `calendly.com/starburst-aerospace/ugv-30min` par URL réelle |
| CSV stub | `csvDirectBtn` handler | Remplacer le Blob stub par URL CSV servie côté serveur |
| Brevo endpoint | `csvEmailBtn` handler | Wirer POST réel vers Brevo template |
| OG image | `<meta property="og:image">` | À vérifier · pas modifié ce cycle |
| Matomo snippet | `<head>` | À vérifier · `_paq` doit être chargé |

## Branche git suggérée

`cycle-A-architecture` → merge `main` après smoke test passed → puis branche `cycle-B-explore` pour Cycle B
