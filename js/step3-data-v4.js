/* ============================================================
   Starburst Tables 01 · UGV · Step 3 v4 — Data layer
   ============================================================
   v4 changes vs v3 :
   - Dataset expanded: 25 → 39 active actors
   - Country layout: 8 → 14 countries
   - Visual encoding: country (not doctrine)
     Doctrine kept internally for Step 2 thesis filter & "my doctrine only" toggle
   - Partnerships: 5 → 14 (10 JVs + 4 acquisitions)
   - REVELATION_RULES updated for new dataset & cube revelation hooks
   ============================================================ */

window.STEP3_DATA = (function () {

  // ============================================================
  // COUNTRIES — 14 country boxes on viewBox 1100×680
  // Layout: 4 rows
  //   Row 1 (top): Nordic-Baltic + UK
  //   Row 2: Central-East EU + UA frontline
  //   Row 3: Southern EU + IL
  //   Row 4: ES + USA (large)
  // ============================================================
  const COUNTRIES = {
    'EE':  { x: 60,  y: 30,  w: 180, h: 120, label: 'EE',  name: 'Estonia',     signature: 'NATO modular hub' },
    'FI':  { x: 260, y: 30,  w: 180, h: 120, label: 'FI',  name: 'Finland',     signature: 'Production enabler' },
    'LV':  { x: 460, y: 30,  w: 200, h: 120, label: 'LV',  name: 'Latvia',      signature: 'Mid-tier emergence' },
    'UK':  { x: 680, y: 30,  w: 180, h: 120, label: 'UK',  name: 'United Kingdom', signature: 'Heritage premium' },

    'DE':  { x: 60,  y: 170, w: 240, h: 160, label: 'DE',  name: 'Germany',     signature: 'Multi-polar hub' },
    'PL':  { x: 320, y: 170, w: 200, h: 160, label: 'PL',  name: 'Poland',      signature: 'State research + drones' },
    'CZ':  { x: 540, y: 170, w: 180, h: 160, label: 'CZ',  name: 'Czechia',     signature: 'State research mid-tier' },
    'UA':  { x: 740, y: 170, w: 320, h: 160, label: 'UA',  name: 'Ukraine',     signature: 'Mass-deployed combat' },

    'FR':  { x: 60,  y: 350, w: 240, h: 140, label: 'FR',  name: 'France',      signature: 'Heritage in transition' },
    'IT':  { x: 320, y: 350, w: 180, h: 140, label: 'IT',  name: 'Italy',       signature: 'Premium consolidation' },
    'HR':  { x: 520, y: 350, w: 180, h: 140, label: 'HR',  name: 'Croatia',     signature: 'EOD/CBRN dominance' },
    'IL':  { x: 720, y: 350, w: 240, h: 140, label: 'IL',  name: 'Israel',      signature: 'Modular + premium' },

    'ES':  { x: 60,  y: 510, w: 200, h: 140, label: 'ES',  name: 'Spain',       signature: 'Iberian emergence' },
    'USA': { x: 280, y: 510, w: 400, h: 140, label: 'USA', name: 'United States', signature: 'Premium + autonomy' }
  };

  // ============================================================
  // COUNTRY_COLORS — palette éditoriale (not flags)
  // 14 colors, desaturated, cohesive on graphite background
  // ============================================================
  const COUNTRY_COLORS = {
    'UA':  '#e8c441',  // signal-yellow (UA = primary narrative)
    'DE':  '#5a8fd4',  // interactive-blue (DE = hub of EU convergence)
    'USA': '#a47fc4',  // muted violet (USA = premium AI)
    'FR':  '#7aa3dc',  // soft blue (FR = heritage)
    'IL':  '#d4a574',  // warm tan (IL = combat heritage)
    'EE':  '#8fa8b5',  // pale blue-grey (EE = NATO)
    'FI':  '#7e8c95',  // grey-blue (FI = enabler)
    'LV':  '#b89968',  // ochre (LV = emerging)
    'PL':  '#a8826a',  // brick (PL = state)
    'CZ':  '#7a8c6e',  // moss green (CZ = state)
    'HR':  '#a55c4f',  // brick-red (HR = DOK-ING)
    'IT':  '#9aa55a',  // olive (IT = Leonardo)
    'ES':  '#c9a96e',  // sand (ES = Iberian)
    'UK':  '#6b7a90'   // slate (UK = legacy NATO)
  };

  // ============================================================
  // STARTUPS — 39 actors with cadence × deployment × funding × perf
  // doctrine is INTERNAL (not displayed visually); kept for filtering
  // ============================================================
  const STARTUPS = [

    // ===== UA · Doctrine A (mass-attritable) + ABRIS-DG (multi-country) =====
    { code: 'TEN-TM', name: 'Tencore', country: 'UA', doctrine: 'A', cadence: 4, deployment: 4, fundingScale: 2, performance: 'verified',
      raised: '$3.74M', round: 'MITS Capital · Jul 2025', headcount: '215', deploy: '2,000+ TerMIT units · 4 EU JVs in 2026',
      note: 'Hub UA-EU absolu. JVs FERNRIDE, INSTA, QTI Quantum, Shark.', source: 'Tier A · Defense Blog, Euromaidan Press, Oboronka' },

    { code: 'DEV-TW', name: 'DevDroid', country: 'UA', doctrine: 'A', cadence: 3, deployment: 4, fundingScale: 1, performance: 'verified',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'Hundreds of TW 12.7 strike UGVs UA',
      note: '45-day frontline holding documented. Mass-attritable combat.', source: 'Tier B · Calibre Defense' },

    { code: 'TEM-UG', name: 'Temerland', country: 'UA', doctrine: 'A', cadence: 2, deployment: 4, fundingScale: 1, performance: 'verified',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'GNOM/Targan demining + CASEVAC UA frontline',
      note: 'Mine clearance + casevac specialist.', source: 'Tier C · TechUkraine' },

    { code: 'ROB-IC', name: 'Roboneers', country: 'UA', doctrine: 'A', cadence: 3, deployment: 4, fundingScale: 1, performance: 'verified',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'Ironclad UGV mass UA frontline',
      note: 'Combat-iterating UA pure-play.', source: 'Tier B · Forbes UA' },

    { code: 'UKP-RO', name: 'UkrPrototype', country: 'UA', doctrine: 'A', cadence: 3, deployment: 4, fundingScale: 1, performance: 'verified',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'Multiple UGV variants UA frontline',
      note: 'Diverse combat platforms iterated.', source: 'Tier B · MoD Ukraine' },

    { code: 'RAT-RS', name: 'Ratel Robotics', country: 'UA', doctrine: 'A', cadence: 3, deployment: 4, fundingScale: 1, performance: 'verified',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'Ratel S/L combat + logistics 6km UA',
      note: 'Anti-tank kamikaze + logistics dual capability.', source: 'Tier B · Forbes, Reuters' },

    { code: 'ABR-UN', name: 'ABRIS Design Group', country: 'UA', doctrine: 'A', cadence: 3, deployment: 4, fundingScale: 2, performance: 'verified',
      raised: '$250K + xTech', round: 'US Army xTech win Mar 2026 · 10-yr G-TEAD', headcount: '[tc]', deploy: 'UNEX UGV codified UA · US Army xTech 2026',
      note: 'Multi-country production UA-PL-CZ. Mountain Horse Solutions partnership US.', source: 'Tier A · EDR Magazine, MoD Ukraine' },

    // ===== DE · Doctrine B + C =====
    { code: 'ARX-GE', name: 'ARX Robotics', country: 'DE', doctrine: 'B', cadence: 3, deployment: 3, fundingScale: 3, performance: 'verified',
      raised: '€42M cumul', round: 'Series A · 2025', headcount: '~150 [tc]', deploy: '6 EU armies · Combat Gereon UA · scaling 1→85/day Deutz',
      note: 'JV Frontline UA + Helsing partnership Sep 2025. Hector medium-class unveiled Dec 2025.', source: 'Tier A · Defense Post, Janes' },

    { code: 'RHM-MM', name: 'Rheinmetall', country: 'DE', doctrine: 'C', cadence: 3, deployment: 3, fundingScale: 5, performance: 'verified',
      raised: 'Listed Frankfurt', round: 'Public co. (RHM.DE)', headcount: '~33,000', deploy: 'Mission Master SP/CXT2 · DOK-ING acquired Mar 2026 (51%)',
      note: 'Hub EU consolidator. 3 markets at top (3,3) post-DOK-ING acquisition. LRMV JV with Leonardo (combat vehicles, non-UGV).', source: 'Tier A · Reuters, corporate' },

    { code: 'QSY-MA', name: 'Quantum Systems', country: 'DE', doctrine: 'C', cadence: 3, deployment: 3, fundingScale: 5, performance: 'verified',
      raised: '$618M cumul', round: 'Series C ext · Nov 2025 · €3+Bn post', headcount: '~1,000', deploy: 'Mandrill UGV + Trinity/Vector UAS · 6+ EU armies · 3 JVs (QFI, QTI, QWI)',
      note: 'Triple unicorn. Build with Ukraine: QFI Frontline + QTI Tencore + QWI WIY.', source: 'Tier A · EDR Magazine, ESUT, Munich Startup' },

    { code: 'KND-OP', name: 'KNDS', country: 'DE', doctrine: 'E', cadence: 2, deployment: 2, fundingScale: 5, performance: 'verified',
      raised: 'JV state-backed', round: 'KMW + Nexter merger 2015', headcount: '~10,000', deploy: 'Optio-X20 / Ultro 600 · Italian Army RAS',
      note: 'KMW × Milrem THeMIS partnership + 24.9% stake Milrem (2023).', source: 'Tier A · KNDS corporate, Janes' },

    // ===== USA · Doctrine B + C + E =====
    { code: 'TFL-CT', name: 'Teledyne FLIR', country: 'USA', doctrine: 'E', cadence: 2, deployment: 3, fundingScale: 5, performance: 'verified',
      raised: 'Listed NYSE', round: 'Public co. (TDY)', headcount: '~13,000', deploy: 'Centaur UGV · iRobot PackBot heritage 1999 · US Army EOD',
      note: 'Heritage marché historique EOD/CBRN. Sensor stack premium thermal/IR.', source: 'Tier A · Teledyne FLIR corporate' },

    { code: 'GHO-V6', name: 'Ghost Robotics', country: 'USA', doctrine: 'B', cadence: 2, deployment: 2, fundingScale: 3, performance: 'verified',
      raised: '$50M+ cumul', round: 'Series B · 2024', headcount: '~150', deploy: 'Vision 60 quadruped · NATO patrol · Tyndall AFB',
      note: 'Quadruped niche perimeter/EOD/urban only.', source: 'Tier B · Defense News' },

    { code: 'SWB-SW', name: 'Swarmbotics', country: 'USA', doctrine: 'C', cadence: 2, deployment: 2, fundingScale: 2, performance: 'verified',
      raised: '$15M [tc]', round: 'Series A · 2024', headcount: '~60 [tc]', deploy: 'Swarm UGVs · US Army trials',
      note: 'Swarm autonomy unique — orthogonal to single-platform autonomy.', source: 'Tier B · Defense Innovation Unit' },

    { code: 'OVL-BR', name: 'Overland AI', country: 'USA', doctrine: 'C', cadence: 2, deployment: 2, fundingScale: 4, performance: 'verified',
      raised: '$132M cumul', round: 'Series B $100M · Dec 2024', headcount: '~150 [tc]', deploy: 'Brumby + ISV autonomy kit · US Army trials',
      note: 'Outlier (3,3) on F1 Logistique + F4 ISR. Most mature autonomy stack of dataset.', source: 'Tier A · Crunchbase, TechCrunch' },

    { code: 'GD-MT', name: 'General Dynamics', country: 'USA', doctrine: 'E', cadence: 2, deployment: 2, fundingScale: 5, performance: 'verified',
      raised: 'Listed NYSE', round: 'Public co. (GD)', headcount: '~111,000', deploy: 'MUTT (Multi-Utility Tactical Transport) · USMC',
      note: 'Heritage Prime. Combat-tested but not UA mass-deployed.', source: 'Tier A · GD corporate' },

    { code: 'HOW-RM', name: 'Howe & Howe', country: 'USA', doctrine: 'E', cadence: 2, deployment: 2, fundingScale: 5, performance: 'verified',
      raised: 'Textron subsidiary', round: 'Acquired by Textron longstanding', headcount: '[tc]', deploy: 'Ripsaw M5 RCV · Bayonet amphibious · US firefighting',
      note: 'Civil-defense (3,3) firefighting + combat dual-use.', source: 'Tier A · Textron corporate' },

    // ===== FR · Doctrine B + E =====
    { code: 'NEX-NV', name: 'Nexter Robotics', country: 'FR', doctrine: 'B', cadence: 2, deployment: 2, fundingScale: 4, performance: 'verified',
      raised: 'KNDS subsidiary', round: 'Part of KNDS group', headcount: '[tc]', deploy: 'NERVA-S/LG/XX · 27 countries incl. police/SWAT/fire',
      note: 'Micro-UGV 3-12kg. CAMELEON-LG variant. Heritage Nexter Robotics 2012.', source: 'Tier A · KNDS corporate' },

    { code: 'ARQ-DR', name: 'Arquus', country: 'FR', doctrine: 'E', cadence: 2, deployment: 1, fundingScale: 4, performance: 'verified',
      raised: 'John Cockerill subsidiary', round: 'Acquired by John Cockerill July 2024', headcount: '~1,500', deploy: 'Drailer 750kg payload · ScarabeE recon · DGA',
      note: 'Renault × Arquus new compact UGV unveiled at Eurosatory 2026.', source: 'Tier A · Army Recognition' },

    { code: 'SHK-CO', name: 'Shark Robotics', country: 'FR', doctrine: 'E', cadence: 1, deployment: 1, fundingScale: 1, performance: 'verified',
      raised: '€10M', round: 'Move Capital · Jan 2023', headcount: '~50 [tc]', deploy: 'Colossus firefighting BSPP Paris · Notre-Dame fire 2019 · 40 units UA SESU',
      note: 'JV Tencore signed 22 Apr 2026. Civil-defense (3,3) certified EN 1846.', source: 'Tier A · GICAT, Defense Blog' },

    { code: 'EXA-IG', name: 'Exail', country: 'FR', doctrine: 'E', cadence: 1, deployment: 2, fundingScale: 5, performance: 'verified',
      raised: 'Listed Euronext', round: 'SBF 120 · €2.5Bn cap (+370% 2025)', headcount: '~2,000', deploy: 'Iguane EOD/ISR · 70+ marines · Belgian-Dutch rMCM €450M',
      note: 'Maritime + INS principal — terrestrial UGV via heritage decades.', source: 'Tier A · Euronext, Marketscreener' },

    // ===== IL · Doctrine B + C + E =====
    { code: 'ELB-MR', name: 'Elbit Systems', country: 'IL', doctrine: 'C', cadence: 3, deployment: 3, fundingScale: 5, performance: 'verified',
      raised: 'Listed TASE/NASDAQ', round: 'Public co. (ESLT)', headcount: '~20,000', deploy: 'M-RCV / ROBUST · IDF + UA · $120M EU NATO contract Q4 2024',
      note: 'Premium combat (3,3). G-NIUS heritage shared with IAI (dissolved 2016).', source: 'Tier A · TASE filings, MRFR' },

    { code: 'IAI-RB', name: 'IAI', country: 'IL', doctrine: 'E', cadence: 2, deployment: 3, fundingScale: 5, performance: 'verified',
      raised: 'Israel state-owned', round: 'Public sector', headcount: '~15,000', deploy: 'REX MK II / Guardium G-NIUS heritage · IDF border ops 2008+',
      note: 'G-NIUS dissolved 2016, heritage Tomcar buggy chassis. RoBattle modern combat.', source: 'Tier A · IAI corporate' },

    { code: 'RBT-PR', name: 'Roboteam', country: 'IL', doctrine: 'B', cadence: 2, deployment: 3, fundingScale: 2, performance: 'verified',
      raised: '$62M (pre-acq.)', round: 'Acquired Ondas · Nov 2025 · ~$80M', headcount: '~200 [tc]', deploy: 'Probot/MTGR/TIGR · 30+ countries · USMC $30M 2024',
      note: 'Non-VC since acquisition. Multi-mission EOD/ISR/Combat.', source: 'Tier A · Ondas SEC filings' },

    // ===== EE · Doctrine B =====
    { code: 'MIL-TH', name: 'Milrem Robotics', country: 'EE', doctrine: 'B', cadence: 2, deployment: 3, fundingScale: 4, performance: 'verified',
      raised: 'Acquired EDGE Group', round: 'EDGE 51% (UAE) Feb 2023 + KMW 24.9%', headcount: '~250', deploy: 'THeMIS / Type-X / HAVOC · 19 customers worldwide · UAE $200M+ 2024',
      note: 'iMUGS-2 EDF €50M coordinator. Non-VC investable.', source: 'Tier A · iMUGS docs, Shephard' },

    // ===== FI · Doctrine E =====
    { code: 'INS-TM', name: 'INSTA Group', country: 'FI', doctrine: 'E', cadence: 2, deployment: 1, fundingScale: 4, performance: 'verified',
      raised: 'Private', round: 'Family-held', headcount: '~1,300', deploy: 'TerMIT production via Tencore JV (Feb 2026)',
      note: 'Defense electronics enabler. UGV via Tencore JV only.', source: 'Tier A · INSTA corporate' },

    // ===== HR · Doctrine E =====
    { code: 'DOK-MV', name: 'DOK-ING', country: 'HR', doctrine: 'E', cadence: 2, deployment: 3, fundingScale: 3, performance: 'verified',
      raised: 'Acquired by Rheinmetall 51%', round: 'Mar 2026 acquisition', headcount: '~400', deploy: 'MV-4 + Komodo CBRN + Wingman armed · 80% global mine clearance',
      note: 'Heritage 1992. Civil-defense (3,3) + EOD (3,3). Acquired by Rheinmetall Mar 2026.', source: 'Tier A · Reuters, DOK-ING corporate' },

    // ===== IT · Doctrine C =====
    { code: 'LEO-VK', name: 'Leonardo IDV', country: 'IT', doctrine: 'C', cadence: 2, deployment: 2, fundingScale: 5, performance: 'verified',
      raised: 'Acquired by Leonardo €1.7B', round: 'Acquisition Mar 2026', headcount: '~5,000 (IDV)', deploy: 'Viking 6x6 hybrid 750kg payload · MACE autonomy · Italian Army RAS',
      note: 'Post-IDV €1.7B acquisition by Leonardo. MIRA UGV heritage 2008.', source: 'Tier A · Reuters, Leonardo corporate' },

    // ===== UK · Doctrine B =====
    { code: 'QIN-TL', name: 'QinetiQ', country: 'UK', doctrine: 'B', cadence: 1, deployment: 2, fundingScale: 5, performance: 'verified',
      raised: 'Listed LSE', round: 'Public co. (QQ.L)', headcount: '~9,000', deploy: 'Talon family Foster-Miller · Dragon Runner · EOD legacy NATO',
      note: 'Heritage marché historique EOD 2000. Non-VC investable.', source: 'Tier A · LSE filings' },

    // ===== PL · Doctrine B + E =====
    { code: 'MAC-GO', name: 'MACRO-SYSTEM', country: 'PL', doctrine: 'B', cadence: 2, deployment: 1, fundingScale: 1, performance: 'verified',
      raised: '[tc]', round: '[tc]', headcount: '~50 [tc]', deploy: 'GOBLIN + GNOM family · Polish Armed Forces',
      note: 'Modular small UGV PL. Combat + ISR variants.', source: 'Tier B · MACRO corporate' },

    { code: 'WIT-KU', name: 'WITPiS', country: 'PL', doctrine: 'B', cadence: 1, deployment: 1, fundingScale: 1, performance: 'verified',
      raised: 'State research', round: 'Sulejówek institute', headcount: '[tc]', deploy: 'KUNA in service Polish Army Sept-Oct 2025 · paired with Raven',
      note: 'State research institute. Non-VC investable.', source: 'Tier A · WITPiS corporate' },

    // ===== CZ · Doctrine B + E =====
    { code: 'LPP-HN', name: 'LPP Holding', country: 'CZ', doctrine: 'B', cadence: 2, deployment: 1, fundingScale: 2, performance: 'verified',
      raised: '[tc]', round: '2020+ holding', headcount: '[tc]', deploy: 'Hornet UGV · IDET 2025 · CBRN variant',
      note: 'Czech defense holding. Multi-mission UGV.', source: 'Tier B · LPP corporate' },

    { code: 'VOP-TR', name: 'VOP CZ', country: 'CZ', doctrine: 'B', cadence: 2, deployment: 2, fundingScale: 1, performance: 'verified',
      raised: 'State research', round: 'Czech state institute', headcount: '~1,000', deploy: 'TAROS / UGV-PzV in service Czech Army 2025',
      note: 'State research institute. Non-VC investable.', source: 'Tier A · VOP CZ corporate' },

    // ===== LV · Doctrine B + E =====
    { code: 'BRA-UH', name: 'BRASA Defence', country: 'LV', doctrine: 'E', cadence: 2, deployment: 1, fundingScale: 1, performance: 'undocumented',
      raised: '[tc]', round: 'Pre-seed [tc]', headcount: '[tc]', deploy: 'UNHUMAN · Latvia · Arctic-tested',
      note: 'Multi-purpose civil-defense + crisis response.', source: 'Tier C · BRASA corporate' },

    { code: 'NAT-NX', name: 'Natrix', country: 'LV', doctrine: 'B', cadence: 1, deployment: 1, fundingScale: 1, performance: 'undocumented',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'Natrix UGV · Latvia',
      note: 'Niche LV startup.', source: 'Tier C · Natrix corporate' },

    { code: 'LVT-EO', name: 'LV-TEH', country: 'LV', doctrine: 'B', cadence: 1, deployment: 1, fundingScale: 1, performance: 'undocumented',
      raised: '[tc]', round: '[tc]', headcount: '[tc]', deploy: 'Small EOD/Combat UGV · Latvia',
      note: 'Latvia startup 2024. Basic EOD/Combat capability.', source: 'Tier C · LV-TEH corporate' },

    // ===== ES · Doctrine E =====
    { code: 'SEN-AL', name: 'SENER', country: 'ES', doctrine: 'E', cadence: 1, deployment: 1, fundingScale: 4, performance: 'verified',
      raised: 'Private', round: 'Family-held', headcount: '~2,500', deploy: 'ALANO modular UGV · FCAS/NGWS aligned',
      note: 'Spanish Legacy. AI navigation + secure comms.', source: 'Tier A · SENER corporate' },

    { code: 'SAS-TL', name: 'SASCorp', country: 'ES', doctrine: 'E', cadence: 1, deployment: 0, fundingScale: 1, performance: 'undocumented',
      raised: '[tc]', round: 'Prototype phase', headcount: '[tc]', deploy: 'Tellus / Valkyrie 6x6 amphibious · Spanish Navy Armada 2050',
      note: 'Heavy amphibious prototype. Civil potential.', source: 'Tier C · SASCorp corporate' }
  ];

  // ============================================================
  // PARTNERSHIPS — F6 convergence layer (cycle 9 spec)
  // Three types of edges :
  //   • type='jv'          → simple JV/partnership, single edge between primary positions
  //   • type='partnership' → strategic partnership, single edge
  //   • type='cross-face'  → multi-edge: ALL pairs of positions on DIFFERENT faces
  //   • type='acquisition' → solid grey edge
  //
  // External nodes (not in dataset): FERNRIDE (DE), Frontline Robotics (UA) → NOT rendered
  // (both flagged ext:true so the engine can show them as ghost nodes if enabled later)
  // ============================================================
  const PARTNERSHIPS = [
    // ===== Type 1 : Tencore hub (5 JVs/partnerships) =====
    { from: 'TEN-TM', to: 'INS-TM',  type: 'jv',          label: 'Tencore × INSTA Group · Cooperation agreement Feb 2026 · TerMIT FI production' },
    { from: 'TEN-TM', to: 'QSY-MA',  type: 'jv',          label: 'Quantum Tencore Industries (QTI) · MoU Feb 2026 → formal launch 14 Apr 2026 Berlin' },
    { from: 'TEN-TM', to: 'SHK-CO',  type: 'jv',          label: 'Tencore × Shark Robotics · JV signed 22 Apr 2026 Brussels EU-UA Forum' },
    { from: 'TEN-TM', to: 'DEV-TW',  type: 'partnership', label: 'Tencore × DevDroid · Machine gun mount components' },
    // Tencore × FERNRIDE (13 Feb 2026 Munich) → FERNRIDE not in dataset (acquired by Quantum 17 Dec 2025); represented via QTI

    // ===== Type 2 : Rheinmetall × DOK-ING (cross-face : ALL position pairs on different faces) =====
    { from: 'RHM-MM', to: 'DOK-MV',  type: 'cross-face',  label: 'Rheinmetall × DOK-ING · Partnership Oct 2024 → Acquisition 51% signed 4 Mar 2026 Zagreb · Komodo platform + Wingman' },

    // ===== Type 3 : Strategic partnerships (internal dataset) =====
    { from: 'QSY-MA', to: 'ARX-GE',  type: 'partnership', label: 'Quantum Systems × ARX Robotics · UGV-aerial integration via MOSAIC UXS' },
    // Milrem × Frontline Robotics (Aug 2025, BURIA RWS on THeMIS) → Frontline not in dataset; logged for v5

    // ===== Acquisitions (kept as-is for context) =====
    { from: 'LEO-VK', to: 'LEO-VK',  type: 'acquisition', label: 'Leonardo × IDV Group · Announced 30 Jul 2025 → closed 18 Mar 2026 (€1.6 Bn)' },
    { from: 'RBT-PR', to: 'RBT-PR',  type: 'acquisition', label: 'Ondas Holdings × Roboteam · Signed 25 Nov 2025 → closed 17 Dec 2025 ($80M cash)' },
    { from: 'ARQ-DR', to: 'ARQ-DR',  type: 'acquisition', label: 'John Cockerill × Arquus · Closed 2 Jul 2024 (~€300M ex-Volvo Group)' },
    { from: 'MIL-TH', to: 'MIL-TH',  type: 'acquisition', label: 'EDGE Group × Milrem (majority Feb 2023) · KMW retains 24.9% minority since mid-2021' }
  ];

  // ============================================================
  // DOCTRINE — kept for Step 2 thesis filter (not visible in Step 3 viz)
  // ============================================================
  const DOCTRINE_LABELS = {
    'A': 'A · Cadence',
    'B': 'B · Modular hybrid',
    'C': 'C · Premium AI',
    'E': 'E · Enabler'
  };

  // Funding scale → dot radius (in pixels, on viewBox 1100×680)
  const FUNDING_RADIUS = { 1: 4, 2: 5.5, 3: 7, 4: 9, 5: 12 };

  // ============================================================
  // PROFILES — 5 archetypes (kept from v3, used in Step 1)
  // ============================================================
  const PROFILES = {
    'VC-D': { code: 'VC-D', label: 'Defense-pure VC', allocation: 50,  target: 5, horizon: '5–7 yr' },
    'VC-G': { code: 'VC-G', label: 'Generalist VC',   allocation: 25,  target: 4, horizon: '5–7 yr' },
    'FO':   { code: 'FO',   label: 'Family Office',   allocation: 30,  target: 4, horizon: '7–10 yr' },
    'IF':   { code: 'IF',   label: 'Institutional',   allocation: 200, target: 8, horizon: '10+ yr' },
    'CV':   { code: 'CV',   label: 'Corporate VC',    allocation: 15,  target: 4, horizon: '3–5 yr' }
  };

  // ============================================================
  // THESES — 5 doctrinal positions (kept from v3, used in Step 2)
  // ============================================================
  const THESES = {
    'A': { code: 'A', label: 'Cadence',          short: 'Volume + battle iteration' },
    'B': { code: 'B', label: 'Modular Hybrid',   short: 'Open architectures, retrofit-aware' },
    'C': { code: 'C', label: 'Premium AI',       short: 'High-end autonomy stack' },
    'D': { code: 'D', label: 'No directional bet', short: 'Diversification' },
    'E': { code: 'E', label: 'Mixed thesis',     short: 'A/B/C blended weights' }
  };

  // Position size buckets (in € millions)
  const SIZES = [4, 8, 12, 16];

  // ============================================================
  // REVELATION_RULES — flash messages triggered by selection composition
  // Updated for 39-actor dataset and cube revelation hooks
  // ============================================================
  const REVELATION_RULES = [
    { id: 'tencore-only',
      when: (sel) => sel.find(s => s.code === 'TEN-TM') && sel.length === 1,
      text: 'You start with the only UA hub of EU convergence — Tencore alone has signed 4 European JVs in Q1 2026.' },

    { id: 'rheinmetall-only',
      when: (sel) => sel.find(s => s.code === 'RHM-MM') && sel.length === 1,
      text: 'You start with the consolidator — Rheinmetall holds top position on 3 markets post-DOK-ING acquisition.' },

    { id: 'ua-concentration',
      when: (sel) => sel.length >= 2 && sel.filter(s => s.country === 'UA').length >= 2,
      text: 'You now hold direct exposure to the only mass-deployed combat UGV doctrine in Europe — concentrated in a single jurisdiction.' },

    { id: 'no-c',
      when: (sel) => sel.length >= 3 && !sel.find(s => s.doctrine === 'C'),
      text: 'Your portfolio explicitly avoids the Premium AI cluster — this is a contrarian construction.' },

    { id: 'all-battle',
      when: (sel) => sel.length >= 3 && sel.filter(s => s.deployment >= 3).length === sel.length,
      text: 'Every position you have selected is battle-validated — you are betting on operational evidence over speculative valuation.' },

    { id: 'future-state',
      when: (sel) => sel.length >= 3 && sel.filter(s => s.deployment <= 1).length >= sel.length / 2,
      text: 'More than half your positions are not battle-validated — this is a future-state portfolio.' },

    { id: 'b-aligned',
      when: (sel) => sel.length >= 3 && sel.filter(s => s.doctrine === 'B').length / sel.length >= 0.5,
      text: 'You now hold 50%+ in modular hybrid — a thesis-aligned bet on retrofit-aware open architectures.' },

    { id: 'german-hub',
      when: (sel) => sel.length >= 3 && sel.filter(s => s.country === 'DE').length >= 2,
      text: 'You captured the German convergence hub — 4 active hubs (Rheinmetall, KNDS, ARX, Quantum) form Europe\'s consolidation epicenter.' },

    { id: 'arx-mid-tier',
      when: (sel) => sel.find(s => s.code === 'ARX-GE'),
      text: 'ARX is the only mid-tier European UGV maker scaling — most others are heritage-locked or non-VC investable.' },

    { id: 'tencore-rheinmetall',
      when: (sel) => sel.find(s => s.code === 'TEN-TM') && sel.find(s => s.code === 'RHM-MM'),
      text: 'Tencore + Rheinmetall = both ends of the convergence axis. UA hub-EU consolidator covered.' }
  ];

  // ============================================================
  // Divergence calculation — adapted for 39-actor dataset
  // ============================================================
  function getDivergence(sel) {
    if (sel.length < 3) return null;

    const cadenceShare = sel.filter(s => s.doctrine === 'A').length / sel.length;
    const cShare = sel.filter(s => s.doctrine === 'C').length / sel.length;
    const enablerShare = sel.filter(s => s.doctrine === 'E').length / sel.length;
    const battleShare = sel.filter(s => s.deployment >= 3).length / sel.length;
    const uaShare = sel.filter(s => s.country === 'UA').length / sel.length;
    const deShare = sel.filter(s => s.country === 'DE').length / sel.length;

    if (uaShare >= 0.5)
      return { text: `Your UA exposure (${Math.round(uaShare * 100)}%) is approximately 8× the European VC average for defense.`,
               source: 'Source: Dealroom 2025 EU defense capital allocation' };
    if (cadenceShare >= 0.4)
      return { text: `Your cadence exposure (${Math.round(cadenceShare * 100)}%) is roughly 5× the European VC average.`,
               source: 'Source: Dealroom 2025 EU defense AI capital allocation' };
    if (deShare >= 0.5)
      return { text: `Your German concentration (${Math.round(deShare * 100)}%) tracks the convergence epicenter — 4 hubs operate from Germany.`,
               source: 'Source: Starburst Tables 01 Face 6 analysis' };
    if (cShare === 0)
      return { text: `You hold 0% of Premium AI — the segment that absorbs most European defense mega-rounds.`,
               source: 'Source: Vestbee/Dealroom 2025' };
    if (battleShare >= 0.66)
      return { text: `${Math.round(battleShare * 100)}% of your positions are battle-validated — well above the European VC average.`,
               source: 'Source: Starburst analysis based on public deployment records' };
    if (enablerShare >= 0.4)
      return { text: `Your enabler exposure (${Math.round(enablerShare * 100)}%) suggests a structural bet on transversal capacity rather than direct doctrine.`,
               source: 'Source: Starburst doctrine taxonomy' };

    return { text: `Your portfolio shows balanced exposure across markets — closer to a diversification thesis than a directional one.`,
             source: 'Source: Starburst diversification benchmark' };
  }

  // Default position size based on profile
  function defaultSizeForProfile(profileCode) {
    const p = PROFILES[profileCode];
    if (!p) return 8;
    const target = p.allocation / p.target;
    if (target <= 5) return 4;
    if (target <= 10) return 8;
    if (target <= 14) return 12;
    return 16;
  }

  // Doctrine fit interpretation against the locked thesis
  function doctrineFit(startup, thesisCode) {
    const d = startup.doctrine;
    if (!thesisCode || thesisCode === 'D') {
      return `${COUNTRIES[startup.country].name} position. No directional thesis declared.`;
    }
    if (d === thesisCode) {
      const labels = {
        'A': 'Cadence anchor — directly inside your declared thesis.',
        'B': 'Modular anchor — directly inside your declared thesis.',
        'C': 'Premium anchor — directly inside your declared thesis.',
        'E': 'Enabler anchor — directly inside your declared thesis.'
      };
      return labels[d] || `Inside thesis.`;
    }
    if (thesisCode === 'E') {
      return `Fits inside your mixed-thesis blend.`;
    }
    return `Outside your declared thesis ${thesisCode}. Counter-position or hedge.`;
  }

  return {
    COUNTRIES, COUNTRY_COLORS, STARTUPS, PARTNERSHIPS,
    DOCTRINE_LABELS, FUNDING_RADIUS,
    PROFILES, THESES, SIZES,
    REVELATION_RULES, getDivergence, defaultSizeForProfile, doctrineFit
  };
})();
