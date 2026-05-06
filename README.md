# Tables 01 · UGV — The European UGV market mapped

Interactive analytical instrument by **Starburst Aerospace & Defense** — April 2026.

39 operators · 14 countries · 5 superposed markets (Logistics, Combat AP, EOD/Route Clearance, ISR, Civil-defense) plus F6 Convergence layer.

🔗 **Live** : [tables01.starburst.aero](https://tables01.starburst.aero) *(coming soon)*

---

## Quick start

```bash
# Clone
git clone https://github.com/<your-user>/tables01-ugv.git
cd tables01-ugv

# Serve locally (any static server works)
python3 -m http.server 8000
# OR
npx serve .

# Open
open http://localhost:8000
```

No build step — pure HTML/CSS/JS, Three.js loaded from CDN.

## Structure

```
tables01-ugv/
├── index.html              # Single-file SPA (~8500 lines)
├── data/
│   ├── tables01-ugv-dataset.csv   # 38 operators × 19 columns
│   └── tables01-ugv-dataset.json  # Same with metadata + partnerships
├── assets/
│   ├── og-image.png        # LinkedIn share image (1200×630)
│   ├── og-image.svg        # Source vector
│   ├── icons/favicon.svg   # Branding
│   └── icons/favicon.ico   # Fallback
├── js/
│   ├── api-client.js       # Backend wirings (Brevo, Calendly, Matomo)
│   ├── consent-banner.js   # 48h localStorage opt-in
│   ├── explore-2d.js       # 2D small multiples view
│   ├── step3-data*.js      # Dataset
│   ├── step4-cube.js       # Three.js cube rendering
│   ├── step4-data.js       # Cube positions + faces
│   └── step5-app.js        # Free exploration mode
└── styles/                 # CSS (mostly inline in index.html)
```

## Modes

- **Explore** (default) · interactive 3D cube + 2D small multiples toggle
- **Read** · single-page editorial paper with ToC scrollspy

Legacy v4 funnel (Compose flow Profile → Thesis → Picks) accessible via `?legacy=1`.

## Stack

- Three.js r128 (cube 3D · WebGL · OrbitControls touch-native)
- Vanilla JS · no build process · no framework
- CSS variables · IBM Plex Mono + Source Serif 4
- LocalStorage 48h opt-in for cross-session state

## Dataset

The 38 operators dataset (CSV + JSON) is open data, freely usable with attribution. Sources mix:
- **Tier A** · Starburst proprietary mapping + verified company comms
- **Tier B** · industry press (Defense Blog, Janes, EDR Magazine, Forbes/Bondar)
- **Tier C** · social signals + secondary aggregators

Methodology accessible from the trust footer or the Read page.

## Browser support

- Chrome 90+ / Firefox 88+ / Safari 14+ / Edge 90+
- Mobile Safari + Chrome Android (touch native via OrbitControls)
- WebGL 1.0 required for 3D cube · graceful fallback to 2D mode

## Accessibility

- ARIA tree parallèle pour le cube (screen-reader navigable)
- aria-live polite sur bandeau context
- Skip link "Skip to main content" en première position tab
- Focus indicators 2px signal-yellow sur tous éléments interactifs
- Respect `prefers-reduced-motion: reduce`

## Production checklist before deployment

- [ ] Replace `CONFIG.API_BASE` in `js/api-client.js` with prod endpoint
- [ ] Replace `CONFIG.CALENDLY_URL` with real Calendly
- [ ] Configure Matomo · add tracking snippet in `<head>`
- [ ] Provision Brevo templates referenced in `BREVO_TEMPLATES`
- [ ] Set `CONFIG.MOCK_MODE = false`
- [ ] Generate PDF for Read page download
- [ ] Finalize editorial content in Read page
- [ ] Cross-browser QA + Lighthouse audit
- [ ] Screen reader test (NVDA + VoiceOver)
- [ ] Configure CSP headers
- [ ] Point DNS `tables01.starburst.aero` → hosting

## License

© 2026 Starburst Aerospace & Defense. All rights reserved.

## Contact

Jérémie Tisseau · COO Starburst A&D
