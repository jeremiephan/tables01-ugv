/* ============================================================
   Starburst Tables 01 · UGV · Step 3 — Data layer
   Validated against the white paper dataset.
   ============================================================ */

window.STEP3_DATA = (function () {

  const COUNTRIES = {
    'UK': { x: 60,  y: 60,  w: 160, h: 130, label: 'UK', name: 'United Kingdom', signature: 'Modular legacy NATO' },
    'SE': { x: 245, y: 30,  w: 130, h: 100, label: 'SE', name: 'Sweden',         signature: 'Premium enabler' },
    'EE': { x: 410, y: 50,  w: 150, h: 130, label: 'EE', name: 'Estonia',        signature: 'NATO modular hub' },
    'UA': { x: 590, y: 80,  w: 240, h: 200, label: 'UA', name: 'Ukraine',        signature: 'Doctrine A monoculture' },
    'DE': { x: 245, y: 165, w: 150, h: 145, label: 'DE', name: 'Germany',        signature: 'Modular + premium scale' },
    'FR': { x: 60,  y: 230, w: 175, h: 175, label: 'FR', name: 'France',         signature: 'Enabler-heavy, in transition' },
    'CH': { x: 260, y: 340, w: 140, h: 110, label: 'CH', name: 'Switzerland',    signature: 'Civil-first dual-use' },
    'IL': { x: 540, y: 410, w: 195, h: 130, label: 'IL', name: 'Israel',         signature: 'Modular + premium NATO-allied' }
  };

  const STARTUPS = [
    { code: 'HEL-HX', name: 'Helsing', country: 'DE', doctrine: 'C', cadence: 4, deployment: 3, fundingScale: 5, performance: 'contested',
      raised: '€1.58Bn', round: 'Series D · Jun 2025 · €12Bn post', headcount: '~700+', deploy: 'Ukraine HX-2 (10k contracted)',
      note: 'HX-2 25% takeoff failure rate per Bloomberg Jan 2026 + Bundeswehr Nov 2025.', source: 'Tier B · Bloomberg, Sacra, Tracxn' },
    { code: 'ARX-GE', name: 'ARX Robotics', country: 'DE', doctrine: 'B', cadence: 3, deployment: 3, fundingScale: 3, performance: 'verified',
      raised: '€42M', round: 'Series A · 2025', headcount: '~150 [tc]', deploy: 'Ukraine deployment · 6 EU armies',
      note: 'Largest Western UGV fleet to UA. Partnerships Helsing, RENK, DEUTZ, Daimler, Quantum, Frontline UA.', source: 'Tier A · Defense Post, Omnes Capital' },
    { code: 'QSY-RA', name: 'Quantum Systems', country: 'DE', doctrine: 'C', cadence: 3, deployment: 3, fundingScale: 5, performance: 'verified',
      raised: '$618M cumul', round: 'Series C ext · Nov 2025', headcount: '~1,000', deploy: 'Trinity/Vector UAS · Ukraine ISR · 6+ EU armies',
      note: 'Triple unicorn €3+Bn post-extension. Quantum Tencore Industries JV 2026.', source: 'Tier B · Munich Startup, Pulse2' },
    { code: 'MIL-TH', name: 'Milrem Robotics', country: 'EE', doctrine: 'B', cadence: 2, deployment: 3, fundingScale: 3, performance: 'verified',
      raised: 'n/a · acquired', round: 'Edge Group 2023 + KMW 24.9%', headcount: '~250 [tc]', deploy: '18 countries · 8 NATO · iMUGS-2 €50M EDF',
      note: 'Non-VC investable. iMUGS-2 coordinator across 28-29 partners.', source: 'Tier A · iMUGS docs, EDF' },
    { code: 'THR-EE', name: 'Threod Systems', country: 'EE', doctrine: 'B', cadence: 1, deployment: 2, fundingScale: 1, performance: 'undocumented',
      raised: '[tc]', round: '[tc]', headcount: '~80 [tc]', deploy: 'Baltic, NATO partners',
      note: 'UAS payloads + UGV integration.', source: 'Tier C · Company website' },
    { code: 'DEF-EE', name: 'DefSecIntel', country: 'EE', doctrine: 'E', cadence: 1, deployment: 3, fundingScale: 1, performance: 'verified',
      raised: '€300k EE govt grant', round: '[tc]', headcount: '~50 [tc]', deploy: 'EIRSHIELD active UA · Drone Wall Baltic',
      note: 'C-UAS + USV principal — UGV indirect. Reclassement E recommended.', source: 'Tier B · Defense One, Estonia.ee' },
    { code: 'TEN-TM', name: 'Tencore', country: 'UA', doctrine: 'A', cadence: 4, deployment: 4, fundingScale: 2, performance: 'verified',
      raised: '$3.74M', round: 'MITS Capital · Jul 2025', headcount: '215', deploy: '2,000+ TerMIT units · K2 UGV battalion · 3rd Assault Bde',
      note: '4 European JVs in 2026 (Shark, Quantum, FERNRIDE, INSTA). 40k forecast 2026.', source: 'Tier A · BBC, Defense Blog, Euromaidan' },
    { code: 'RAT-RS', name: 'Ratel UGV', country: 'UA', doctrine: 'A', cadence: 3, deployment: 4, fundingScale: 1, performance: 'verified',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'Active combat UA',
      note: 'Anti-tank kamikaze + logistics 6km.', source: 'Tier B · Forbes, Reuters' },
    { code: 'DEV-TW', name: 'DevDroid', country: 'UA', doctrine: 'A', cadence: 3, deployment: 4, fundingScale: 1, performance: 'verified',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'Hundreds of strike UGVs UA',
      note: '45-day frontline holding documented.', source: 'Tier B · Calibre Defense' },
    { code: 'TEM-UG', name: 'Temerland', country: 'UA', doctrine: 'A', cadence: 2, deployment: 4, fundingScale: 1, performance: 'verified',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'Mine clearance UA frontline',
      note: 'Demining + CASEVAC.', source: 'Tier C · TechUkraine' },
    { code: 'SKL-SK', name: 'Skyeton', country: 'UA', doctrine: 'E', cadence: 2, deployment: 3, fundingScale: 2, performance: 'verified',
      raised: '[tc]', round: 'Prevail UK partnership', headcount: '[tc]', deploy: 'Long-range ISR UA',
      note: 'Raybird UAS, deep recon.', source: 'Tier B · Janes' },
    { code: 'GHR-V6', name: 'Ghost Robotics EU', country: 'UK', doctrine: 'B', cadence: 1, deployment: 2, fundingScale: 2, performance: 'verified',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'NATO patrol, border security',
      note: 'Vision 60 quadruped.', source: 'Tier B · Defense News' },
    { code: 'QIN-TL', name: 'QinetiQ Talon', country: 'UK', doctrine: 'B', cadence: 1, deployment: 2, fundingScale: 5, performance: 'verified',
      raised: 'Listed LSE', round: 'Public co. (QQ.L)', headcount: '~9,000 group', deploy: 'EOD legacy NATO + US (Iraq, Afghanistan)',
      note: 'Non-VC investable. Talon, Dragon Runner, Titan platforms.', source: 'Tier A · LSE filings' },
    { code: 'EXA-DR', name: 'Exail', country: 'FR', doctrine: 'E', cadence: 1, deployment: 2, fundingScale: 5, performance: 'verified',
      raised: 'Listed Euronext', round: 'SBF 120 · €2.5Bn cap · +370% 2025', headcount: '~2,000', deploy: '70+ marines · Belgian-Dutch rMCM €450M · Fonds Ukraine €15M',
      note: 'Maritime + INS principal — terrestrial UGV via partnerships (Géomines).', source: 'Tier A · Euronext, Marketscreener' },
    { code: 'SHK-CO', name: 'Shark Robotics', country: 'FR', doctrine: 'E', cadence: 1, deployment: 1, fundingScale: 1, performance: 'verified',
      raised: '€10M', round: 'Move Capital · Jan 2023', headcount: '~50 [tc]', deploy: '40 Colossus UA SESU · Fonds Ukraine €200M first awardee',
      note: 'JV with Tencore signed 22 Apr 2026 — 2 simultaneous JVs FR + UA. E → B transition documented.', transition: 'B', source: 'Tier A · GICAT, Defense Blog, Euromaidan' },
    { code: 'TEC-TD', name: 'Tecdron', country: 'FR', doctrine: 'E', cadence: 1, deployment: 1, fundingScale: 1, performance: 'undocumented',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'Civil security FR',
      note: 'Multi-purpose civil/defense.', source: 'Tier C · Company website' },
    { code: 'NAI-OZ', name: 'Naïo Technologies', country: 'FR', doctrine: 'E', cadence: 1, deployment: 0, fundingScale: 2, performance: 'undocumented',
      raised: '$55.3M cumul', round: '€6.4M post-redressement · Nov 2025', headcount: '~76', deploy: '350+ robots · agriculture civil-only (5 continents)',
      note: 'Redressement judiciaire Jun 2025 · rescue Nov 2025. Civil-pure — defense N/A.', source: 'Tier B · AgTechNavigator, PitchBook' },
    { code: 'DEL-UX', name: 'Delair UX', country: 'FR', doctrine: 'B', cadence: 1, deployment: 1, fundingScale: 2, performance: 'undocumented',
      raised: '~€40M [tc]', round: '[tc]', headcount: '~100 [tc]', deploy: 'Industrial + defense ISR',
      note: 'Long-range fixed-wing.', source: 'Tier C · Crunchbase' },
    { code: 'ANY-AM', name: 'ANYbotics', country: 'CH', doctrine: 'E', cadence: 1, deployment: 0, fundingScale: 3, performance: 'verified',
      raised: '>$150M cumul', round: 'Climate Inv · Sep 2025', headcount: '~200', deploy: '200+ ANYmal · BP, Equinor, ENI, Petrobras, Shell',
      note: 'Civil-first dominant. ANYmal X Ex-certified deliveries 2026.', source: 'Tier A · Climate Investment, Business Wire' },
    { code: 'VER-SX', name: 'Verity', country: 'CH', doctrine: 'E', cadence: 1, deployment: 0, fundingScale: 3, performance: 'undocumented',
      raised: '~€100M [tc]', round: 'Series C · 2024', headcount: '~200 [tc]', deploy: 'Warehouse inventory · indoor aerial',
      note: 'Indoor aerial drones — not terrestrial UGV. Reclassement recommended.', source: 'Tier C · Crunchbase, Dealroom' },
    { code: 'ASE-AU', name: 'Aut. Solutions EU', country: 'CH', doctrine: 'C', cadence: 1, deployment: 1, fundingScale: 2, performance: 'undocumented',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'Mining + def retrofit',
      note: 'Autonomy retrofit kits.', source: 'Tier C · Company website' },
    { code: 'HEX-AU', name: 'Hexagon Autonomy', country: 'SE', doctrine: 'C', cadence: 2, deployment: 1, fundingScale: 5, performance: 'verified',
      raised: 'Listed Stockholm', round: 'Public co. (HEXA-B)', headcount: '~24,000 group', deploy: 'NovAtel · Antcom · AutonomouStuff · VERIPOS',
      note: 'Non-VC investable. Acquired Septentrio 7 Jan 2025. Infrastructural enabler.', source: 'Tier A · Stockholm Exchange filings' },
    { code: 'ROB-RK', name: 'Roboteam', country: 'IL', doctrine: 'B', cadence: 2, deployment: 3, fundingScale: 2, performance: 'verified',
      raised: '$62M (pre-acq.)', round: 'Acquired Ondas · Nov 2025 · $80M', headcount: '~200 [tc]', deploy: 'NATO 30+ countries · IDF Gaza · USMC $30M 2024',
      note: 'Non-VC since acquisition. MTGR, IRIS, PROBOT.', source: 'Tier A · Ondas SEC filings' },
    { code: 'AXO-VS', name: 'Axon Vision', country: 'IL', doctrine: 'C', cadence: 1, deployment: 2, fundingScale: 1, performance: 'verified',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'IDF + allied',
      note: 'AI computer vision battlefield.', source: 'Tier B · IDF press' },
    { code: 'AIR-EU', name: 'Airobotics EU', country: 'IL', doctrine: 'E', cadence: 1, deployment: 1, fundingScale: 3, performance: 'verified',
      raised: '~$110M (pre-acq.)', round: 'Acquired Ondas · 2022', headcount: '~80 [tc]', deploy: 'Optimus drone-in-a-box · industrial + homeland',
      note: 'Non-VC investable since 2022. Automated drone platform.', source: 'Tier A · Ondas SEC filings' }
  ];

  const PARTNERSHIPS = [
    { from: 'TEN-TM', to: 'SHK-CO', label: 'Tencore × Shark Robotics · JV signed 22 Apr 2026 · EU-Ukraine Business Forum' },
    { from: 'TEN-TM', to: 'QSY-RA', label: 'Tencore × Quantum Systems · Quantum Tencore Industries JV 2026' },
    { from: 'TEN-TM', to: 'DEV-TW', label: 'Tencore × DevDroid · machine gun mount components' },
    { from: 'HEL-HX', to: 'ARX-GE', label: 'Helsing × ARX Robotics · recce-strike network announced 9 Sep 2025' },
    { from: 'ARX-GE', to: 'QSY-RA', label: 'ARX Robotics × Quantum Systems · UGV-aerial integration' }
  ];

  const DOCTRINE_COLORS = {
    'A': '#e8c441',  // signal-yellow
    'B': '#5a8fd4',  // interactive-blue
    'C': '#8a7fa3',  // muted violet
    'E': '#6f9678'   // muted green
  };

  const DOCTRINE_LABELS = {
    'A': 'A · Cadence',
    'B': 'B · Modular hybrid',
    'C': 'C · Premium AI',
    'E': 'E · Enabler'
  };

  const FUNDING_RADIUS = { 1: 4, 2: 5.5, 3: 7, 4: 9, 5: 12 };

  // Profile mini-data — for the sticky recap panel
  const PROFILES = {
    'VC-D': { code: 'VC-D', label: 'Defense-pure VC', allocation: 50, target: 5, horizon: '5–7 yr' },
    'VC-G': { code: 'VC-G', label: 'Generalist VC',   allocation: 25, target: 4, horizon: '5–7 yr' },
    'FO':   { code: 'FO',   label: 'Family Office',   allocation: 30, target: 4, horizon: '7–10 yr' },
    'IF':   { code: 'IF',   label: 'Institutional',   allocation: 200, target: 8, horizon: '10+ yr' },
    'CV':   { code: 'CV',   label: 'Corporate VC',    allocation: 15, target: 4, horizon: '3–5 yr' }
  };

  const THESES = {
    'A': { code: 'A', label: 'Cadence',          short: 'Volume + battle iteration' },
    'B': { code: 'B', label: 'Modular Hybrid',   short: 'Open architectures, retrofit-aware' },
    'C': { code: 'C', label: 'Premium AI',       short: 'High-end autonomy stack' },
    'D': { code: 'D', label: 'No directional bet', short: 'Diversification' },
    'E': { code: 'E', label: 'Mixed thesis',     short: 'A/B/C blended weights' }
  };

  // Position size buckets — fixed for v1
  const SIZES = [4, 8, 12, 16];

  // REVELATION_RULES — flash messages triggered by selection composition
  const REVELATION_RULES = [
    { id: 'consensus-helsing',
      when: (sel) => sel.find(s => s.code === 'HEL-HX') && sel.length === 1,
      text: 'You are starting from the consensus center — Helsing alone has absorbed more European defense capital than the next ten companies combined.' },
    { id: 'ua-concentration',
      when: (sel) => sel.length >= 2 && sel.filter(s => s.country === 'UA').length >= 2,
      text: 'You now hold direct exposure to the only doctrine A operators at scale in Europe — concentrated in a single jurisdiction.' },
    { id: 'no-c',
      when: (sel) => sel.length >= 3 && !sel.find(s => s.doctrine === 'C'),
      text: 'Your portfolio explicitly avoids the European VC mainstream — this is a contrarian construction.' },
    { id: 'all-battle',
      when: (sel) => sel.length >= 3 && sel.filter(s => s.deployment >= 3).length === sel.length,
      text: 'Every position you have selected is battle-validated — you are betting on operational evidence over speculative valuation.' },
    { id: 'future-state',
      when: (sel) => sel.length >= 3 && sel.filter(s => s.deployment <= 1).length >= sel.length / 2,
      text: 'More than half your positions are not battle-validated — this is a future-state portfolio.' },
    { id: 'b-aligned',
      when: (sel) => sel.length >= 3 && sel.filter(s => s.doctrine === 'B').length / sel.length >= 0.5,
      text: 'You now hold 50%+ in Doctrine B — a thesis-aligned modular concentration.' }
  ];

  // Divergence calculation
  function getDivergence(sel) {
    if (sel.length < 3) return null;
    const cadenceShare = sel.filter(s => s.doctrine === 'A').length / sel.length;
    const cShare = sel.filter(s => s.doctrine === 'C').length / sel.length;
    const enablerShare = sel.filter(s => s.doctrine === 'E').length / sel.length;
    const battleShare = sel.filter(s => s.deployment >= 3).length / sel.length;
    if (cadenceShare >= 0.4)
      return { text: `Your cadence exposure (${Math.round(cadenceShare * 100)}%) is roughly 5× the European VC average.`,
               source: 'Source: Dealroom 2025 EU defense AI capital allocation' };
    if (cShare === 0)
      return { text: `You hold 0% of the dominant doctrine C concentration — the segment that absorbs most European defense mega-rounds.`,
               source: 'Source: Vestbee/Dealroom 2025' };
    if (battleShare >= 0.66)
      return { text: `${Math.round(battleShare * 100)}% of your positions are battle-validated — well above the European VC average.`,
               source: 'Source: Starburst analysis based on public deployment records' };
    if (enablerShare >= 0.4)
      return { text: `Your enabler exposure (${Math.round(enablerShare * 100)}%) suggests a structural bet on transversal capacity rather than direct doctrine.`,
               source: 'Source: Starburst doctrine taxonomy' };
    return { text: `Your portfolio shows balanced exposure across doctrines — closer to a diversification thesis than a directional one.`,
             source: 'Source: Starburst diversification benchmark' };
  }

  // Default position size based on profile
  function defaultSizeForProfile(profileCode) {
    const p = PROFILES[profileCode];
    if (!p) return 8;
    const target = p.allocation / p.target; // €M per position
    // Snap to closest fixed bucket, biased upward
    if (target <= 5) return 4;
    if (target <= 10) return 8;
    if (target <= 14) return 12;
    return 16;
  }

  // Doctrine fit interpretation against the locked thesis
  function doctrineFit(startup, thesisCode) {
    const d = startup.doctrine;
    if (!thesisCode || thesisCode === 'D') {
      return `Doctrine ${d} position. No directional thesis declared.`;
    }
    if (d === thesisCode) {
      const labels = {
        'A': 'A · cadence anchor — directly inside your declared thesis.',
        'B': 'B · modular anchor — directly inside your declared thesis.',
        'C': 'C · premium anchor — directly inside your declared thesis.',
        'E': 'E · enabler anchor — directly inside your declared thesis.'
      };
      return labels[d] || `Doctrine ${d} — inside thesis.`;
    }
    if (thesisCode === 'E') {
      return `Doctrine ${d} — fits inside your mixed-thesis blend.`;
    }
    return `Doctrine ${d} — outside your declared thesis ${thesisCode}. Counter-position or hedge.`;
  }

  return {
    COUNTRIES, STARTUPS, PARTNERSHIPS,
    DOCTRINE_COLORS, DOCTRINE_LABELS, FUNDING_RADIUS,
    PROFILES, THESES, SIZES,
    REVELATION_RULES, getDivergence, defaultSizeForProfile, doctrineFit
  };
})();
