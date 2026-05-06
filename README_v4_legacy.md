# Tables 01 UGV · Module v4 — POST CYCLE 9

**Status** : F6 partnerships restructurés en 3 types selon spec user

## Cycle 9 — F6 Convergence layer · 3 types d'edges + edges précis sur dots

### ✅ Implémentés

**Type 1 · Tencore hub (5 JVs/partnerships)**
> Edges single Tencore → partner :
> - **Tencore × INSTA Group** (FI · cooperation Feb 2026)
> - **Quantum Tencore Industries** (DE · MoU Feb → formal 14 Apr 2026)
> - **Tencore × Shark Robotics** (FR · 22 Apr 2026 Brussels)
> - **Tencore × DevDroid** (UA · machine gun mount)
> - **Tencore × FERNRIDE** (DE · 13 Feb 2026 Munich) → ⚠️ FERNRIDE pas dans dataset (acquis par Quantum 17 déc 2025), représenté indirectement via QTI
>
> 4 edges rendus, 1 trace via QTI

**Type 2 · Rheinmetall × DOK-ING (cross-face multi-edge)**
> Type spécial `cross-face` : pour chaque position Rheinmetall sur face X, edge vers chaque position DOK-ING sur face Y ≠ X (et inverse).
>
> Rheinmetall positions = {F1, F2, F3}
> DOK-ING positions = {F2, F3, F5}
> → **7 edges** générés (pairs face-différentes en deux directions)
>
> Métadonnée : Partnership Oct 2024 → Acquisition 51% signée 4 Mar 2026 Zagreb · Komodo platform + Wingman

**Type 3 · Strategic partnerships (interne au dataset)**
> - **Quantum Systems × ARX Robotics** (DE × DE · UGV-aerial integration via MOSAIC UXS)
> - **Milrem × Frontline Robotics** (BURIA RWS Aug 2025) → ⚠️ Frontline pas dans dataset, edge omis
>
> 1 edge rendu

**Acquisitions (markers self-edge — info layer, pas de trait visible)**
> - Leonardo × IDV (€1.6 Bn, 18 Mar 2026)
> - Ondas × Roboteam ($80M, 17 Dec 2025)
> - John Cockerill × Arquus (~€300M, 2 Jul 2024)
> - EDGE × Milrem (Feb 2023, KMW 24.9% minority since mid-2021)

**Fix bug edges visent les cercles, pas les labels**
> Avant : `getFirstPrimaryPosition()` calculait la position au CENTRE du quadrant (sans offset par cellule).
> Quand plusieurs startups partagent la même cellule, les dots sont distribués via `getOffsetForIndex()`. Les edges manquaient le dot exact.
>
> Après : nouvelle fonction `computeActorWorldPositions()` qui pré-calcule TOUS les world positions avec leurs offsets via la même logique de bucket (face,x,y) que `buildDots`. `actorWorldPositions[code]` retourne array de `{faceId, role, x, y, world: Vector3}` cache partagé entre dots et edges.
>
> Effet : les lignes pointillées rejoignent désormais EXACTEMENT le centre des cercles/anneaux.

**Toggle order : ALL LABELS en premier**
> Légende toggles réordonnés :
> 1. **All labels** ← (déplacé en haut, position #1, déjà actif par défaut)
> 2. F6 partnerships
> 3. Picks only
> 4. Morphology
> 5. Exploded view

**Recap du compte total d'edges**
> 4 (Tencore hub) + 7 (Rheinmetall × DOK-ING cross-face) + 1 (Quantum × ARX) = **12 edges F6** rendus.
> Acquisitions = 4 self-edges (info-layer, non-visibles).

### Hors-scope ce cycle (mentionné dans recherches mais pas codé)

- Helsing × ARX (Sept 2025, Recce-Strike)
- DEUTZ × ARX (Oct 2025, drive systems)
- Renault × Cockerill/Arquus (proto Eurosatory juin 2026)
- Milrem × VDL Defentec (NL · 150+ THeMIS)
- Milrem × MSI/Overwatch/Pearson (UK-spec THeMIS)
- Quantum × Frontline (QFI) → drones aériens, hors UGV
- Anduril × Rheinmetall → drones aériens

→ Ces partnerships sont prêts à intégrer si tu veux étendre.

## Smoke test

```bash
cd cube/ && python3 -m http.server 8000

# Step 4 :
# 1. Toggles : All labels en haut, puis F6 partnerships, etc.
# 2. Activer F6 partnerships : edges visent EXACTEMENT le centre des dots
# 3. Rheinmetall × DOK-ING : 7 edges visibles entre cellules face-différentes
# 4. Tencore : 4 edges (hub vers INSTA, Quantum, Shark, DevDroid)
# 5. Quantum × ARX : 1 edge (les deux à F1)
```
