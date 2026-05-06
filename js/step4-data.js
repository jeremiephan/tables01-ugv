/* ============================================================
   Starburst Tables 01 · UGV · Step 4 — Cube data layer
   ============================================================
   The cube exposes 5 superposed UGV markets (faces 1-5).
   Each actor can have positions (P=primary or S=secondary)
   on multiple faces. Position on a face is encoded as (X, Y)
   where X = cadence (1-3) and Y = autonomy stack (1-3).

   Face 6 (convergence) is implicit: edges between faces show
   JV/acquisition relationships across the cube.
   ============================================================ */

window.STEP4_DATA = (function () {

  // ============================================================
  // FACES — 5 superposed markets WITH FACE-SPECIFIC AXES
  // Each face has its own analytical lens (validated cycle scoring)
  // ============================================================
  const FACES = [
    {
      id: 'F1', code: 'logistics',
      label: 'Logistics',
      shortLabel: 'Logistic UGV',
      description: 'Combat support, resupply, casevac, mine clearance support',
      color: '#5e8a6e',
      colorActive: '#7da890',
      orientation: 'front',
      axes: {
        x: 'Cadence',
        xLow: 'LOW CADENCE',
        xHigh: 'HIGH CADENCE',
        xScale: ['artisanal/prototype', 'industrial scale-up', 'mass production confirmed'],
        y: 'Autonomy (logistic)',
        yLow: 'LOW AUTONOMY',
        yHigh: 'HIGH AUTONOMY',
        yScale: ['remote-operated', 'GPS-denied + follow-me + path planning', 'full mission autonomy multi-platform']
      }
    },
    {
      id: 'F2', code: 'combat-ap',
      label: 'Combat AP',
      shortLabel: 'Anti-personnel combat',
      description: 'Direct combat platform: anti-tank kamikaze, fire support, breach',
      color: '#a55c4f',
      colorActive: '#c87a6c',
      orientation: 'front',
      axes: {
        x: 'Unit price (log)',
        xLow: 'LOW PRICE',
        xHigh: 'HIGH PRICE',
        xScale: ['$5K-$50K (mass attritable)', '$50K-$500K (mid-tier)', '$500K-$5M (premium combat)'],
        y: 'Battle validation',
        yLow: 'LOW BATTLE PROOF',
        yHigh: 'HIGH BATTLE PROOF',
        yScale: ['none / trials only', 'combat-deployed limited', 'combat-validated sustained']
      }
    },
    {
      id: 'F3', code: 'eod-rc',
      label: 'EOD-Route Clearance',
      shortLabel: 'EOD / Route Clearance',
      description: 'Explosive ordnance disposal, route clearance, mine action — sensor + manipulator heritage',
      color: '#b88a3a',
      colorActive: '#d6a857',
      orientation: 'right',
      axes: {
        x: 'Sensor sophistication',
        xLow: 'LOW SENSORS',
        xHigh: 'HIGH SENSORS',
        xScale: ['basic cameras + sensors', 'multi-spectral + manipulator arm', 'AI-enabled + advanced sensors (CBRN spectro, GPR, IED detection)'],
        y: 'Heritage years',
        yLow: 'LOW HERITAGE',
        yHigh: 'HIGH HERITAGE',
        yScale: ['< 5 ans EOD/CBRN', '5-15 ans', '15+ ans heritage spécifique']
      }
    },
    {
      id: 'F4', code: 'isr',
      label: 'ISR',
      shortLabel: 'Recon ground',
      description: 'Intelligence, surveillance, reconnaissance — terrestrial sensor platform',
      color: '#5a8fd4',
      colorActive: '#7aa9e0',
      orientation: 'top',
      axes: {
        x: 'Autonomy',
        xLow: 'LOW AUTONOMY',
        xHigh: 'HIGH AUTONOMY',
        xScale: ['remote-operated', 'semi-autonomous (waypoint, follow-me, SLAM)', 'full autonomous mission (multi-platform, swarming)'],
        y: 'Sensor stack maturity',
        yLow: 'LOW SENSOR STACK',
        yHigh: 'HIGH SENSOR STACK',
        yScale: ['basic cameras', 'thermal + IR + LIDAR multi-modal', 'AI-enabled (radar, EW detection, targeting, swarm coordination)']
      }
    },
    {
      id: 'F5', code: 'civil-defense',
      label: 'Civil-defense',
      shortLabel: 'Civil-defense',
      description: 'Firefighting, mining, infrastructure security — civil-first dual-use',
      color: '#8a7fa3',
      colorActive: '#a89bc0',
      orientation: 'left',
      axes: {
        x: 'Reliability (MTBF)',
        xLow: 'LOW RELIABILITY',
        xHigh: 'HIGH RELIABILITY',
        xScale: ['consumer-grade', 'industrial-grade', 'audited/certified reliability operations'],
        y: 'Safety certification',
        yLow: 'LOW CERTIFICATION',
        yHigh: 'HIGH CERTIFICATION',
        yScale: ['none', 'partial (CE, ISO generic)', 'dedicated (EN 1846 firefighting, ISO 18497 agri, MSHA mining, UN demining)']
      }
    }
  ];

  // ============================================================
  // ACTOR_POSITIONS
  // Per actor: list of { faceId, role, x, y } where:
  //   - role: 'P' (primary market) or 'S' (secondary)
  //   - x, y: integer 1-3
  // Validated against paper dataset — see SPEC v4 section 7.
  // ============================================================
  const ACTOR_POSITIONS = {

    // ===== UA · Mass-deployed combat + ABRIS-DG =====
    'TEN-TM': [  // Tencore — platforms: TerMIT, TerMIT Combat
      { faceId: 'F1', role: 'P', x: 3, y: 3 },
      { faceId: 'F2', role: 'S', x: 1, y: 2 },
      { faceId: 'F4', role: 'S', x: 3, y: 2 }
    ],
    'DEV-TW': [  // DevDroid — platforms: MAUL, TW 12.7
      { faceId: 'F1', role: 'P', x: 2, y: 1 },
      { faceId: 'F2', role: 'P', x: 1, y: 3 }
    ],
    'TEM-UG': [  // Temerland — platforms: —
      { faceId: 'F2', role: 'P', x: 1, y: 3 },
      { faceId: 'F3', role: 'P', x: 1, y: 1 }
    ],
    'ROB-IC': [  // Roboneers — platforms: Ironclad, Sirko
      { faceId: 'F1', role: 'S', x: 2, y: 1 },
      { faceId: 'F2', role: 'P', x: 1, y: 3 },
      { faceId: 'F4', role: 'S', x: 1, y: 1 }
    ],
    'UKP-RO': [  // UkrPrototype — platforms: —
      { faceId: 'F1', role: 'P', x: 2, y: 1 },
      { faceId: 'F2', role: 'P', x: 1, y: 3 }
    ],
    'RAT-RS': [  // Ratel Robotics — platforms: Ratel S
      { faceId: 'F1', role: 'P', x: 2, y: 1 },
      { faceId: 'F2', role: 'P', x: 1, y: 3 },
      { faceId: 'F3', role: 'S', x: 1, y: 1 }
    ],
    'ABR-UN': [  // ABRIS Design Group — platforms: UNEX
      { faceId: 'F1', role: 'P', x: 2, y: 1 },
      { faceId: 'F2', role: 'S', x: 3, y: 3 },
      { faceId: 'F3', role: 'S', x: 2, y: 2 },
      { faceId: 'F4', role: 'S', x: 2, y: 2 }
    ],

    // ===== DE · Modular Hybrid hub =====
    'ARX-GE': [  // ARX Robotics — platforms: —
      { faceId: 'F1', role: 'S', x: 2, y: 2 },
      { faceId: 'F2', role: 'S', x: 2, y: 3 },
      { faceId: 'F3', role: 'S', x: 2, y: 1 },
      { faceId: 'F4', role: 'P', x: 2, y: 2 }
    ],
    'RHM-MM': [  // Rheinmetall — platforms: Mission Cargo, Mission Combat, Mission Master
      { faceId: 'F1', role: 'P', x: 3, y: 2 },
      { faceId: 'F2', role: 'P', x: 3, y: 3 },
      { faceId: 'F3', role: 'S', x: 3, y: 3 }
    ],
    'QSY-MA': [  // Quantum Systems — platforms: through JV
      { faceId: 'F1', role: 'P', x: 2, y: 2 },
      { faceId: 'F4', role: 'S', x: 2, y: 2 }
    ],
    'KND-OP': [  // KNDS — platforms: Centurio, Centurio + Optio, Ultro
      { faceId: 'F1', role: 'P', x: 3, y: 2 },
      { faceId: 'F2', role: 'P', x: 3, y: 2 },
      { faceId: 'F4', role: 'S', x: 1, y: 2 }
    ],

    // ===== USA · Premium AI + Heritage =====
    'TFL-CT': [  // Teledyne FLIR — platforms: —
      { faceId: 'F3', role: 'P', x: 3, y: 3 },
      { faceId: 'F4', role: 'P', x: 2, y: 2 }
    ],
    'GHO-V6': [  // Ghost Robotics — platforms: Vision 60 SPUR
      { faceId: 'F2', role: 'S', x: 2, y: 2 },
      { faceId: 'F4', role: 'P', x: 2, y: 2 }
    ],
    'SWB-SW': [  // Swarmbotics — platforms: —
      { faceId: 'F2', role: 'P', x: 3, y: 2 },
      { faceId: 'F4', role: 'S', x: 3, y: 2 }
    ],
    'OVL-BR': [  // Overland AI — platforms: —
      { faceId: 'F1', role: 'S', x: 3, y: 3 },
      { faceId: 'F4', role: 'P', x: 3, y: 3 }
    ],
    'GD-MT': [  // General Dynamics — platforms: MUTT, TRX
      { faceId: 'F1', role: 'P', x: 3, y: 1 },
      { faceId: 'F2', role: 'S', x: 3, y: 2 },
      { faceId: 'F3', role: 'P', x: 2, y: 2 },
      { faceId: 'F4', role: 'P', x: 1, y: 1 }
    ],
    'HOW-RM': [  // Howe & Howe — platforms: Bayonet, Ripsaw M5, Thermite
      { faceId: 'F2', role: 'P', x: 3, y: 2 },
      { faceId: 'F4', role: 'S', x: 1, y: 2 },
      { faceId: 'F5', role: 'P', x: 3, y: 2 }
    ],

    // ===== FR · Heritage in transition =====
    'NEX-NV': [  // Nexter Robotics — platforms: NERVA
      { faceId: 'F3', role: 'P', x: 2, y: 2 },
      { faceId: 'F4', role: 'P', x: 2, y: 2 },
      { faceId: 'F5', role: 'S', x: 3, y: 2 }
    ],
    'ARQ-DR': [  // Arquus — platforms: Drailer, Scarabee
      { faceId: 'F1', role: 'S', x: 3, y: 1 },
      { faceId: 'F2', role: 'P', x: 3, y: 1 },
      { faceId: 'F3', role: 'S', x: 2, y: 1 },
      { faceId: 'F4', role: 'S', x: 1, y: 2 }
    ],
    'SHK-CO': [  // Shark Robotics — platforms: —
      { faceId: 'F5', role: 'P', x: 3, y: 3 }
    ],
    'EXA-IG': [  // Exail — platforms: Iguane
      { faceId: 'F3', role: 'P', x: 2, y: 3 },
      { faceId: 'F4', role: 'P', x: 2, y: 3 }
    ],

    // ===== IL · Modular + Premium combat =====
    'ELB-MR': [  // Elbit Systems — platforms: M-RCV, REX MK II
      { faceId: 'F1', role: 'P', x: 3, y: 2 },
      { faceId: 'F2', role: 'P', x: 3, y: 3 },
      { faceId: 'F4', role: 'P', x: 3, y: 2 }
    ],
    'IAI-RB': [  // IAI — platforms: Cargo Mule, Guardium
      { faceId: 'F1', role: 'P', x: 3, y: 2 },
      { faceId: 'F2', role: 'S', x: 2, y: 3 },
      { faceId: 'F4', role: 'P', x: 2, y: 3 }
    ],
    'RBT-PR': [  // Roboteam — platforms: Probot, Probot / MTGR, TIGR/MTGR
      { faceId: 'F1', role: 'P', x: 2, y: 2 },
      { faceId: 'F3', role: 'P', x: 2, y: 3 },
      { faceId: 'F4', role: 'P', x: 2, y: 2 }
    ],

    // ===== EE · NATO modular =====
    'MIL-TH': [  // Milrem Robotics — platforms: THeMIS
      { faceId: 'F1', role: 'P', x: 3, y: 2 },
      { faceId: 'F2', role: 'P', x: 3, y: 3 },
      { faceId: 'F3', role: 'S', x: 2, y: 2 },
      { faceId: 'F4', role: 'S', x: 2, y: 2 },
      { faceId: 'F5', role: 'S', x: 2, y: 1 }
    ],

    // ===== FI · Production enabler =====
    'INS-TM': [  // INSTA Group — platforms: —
      { faceId: 'F1', role: 'S', x: 2, y: 1 }
    ],

    // ===== HR · EOD/RC dominance =====
    'DOK-MV': [  // DOK-ING — platforms: Hystrix
      { faceId: 'F2', role: 'P', x: 2, y: 1 },
      { faceId: 'F3', role: 'P', x: 3, y: 3 },
      { faceId: 'F5', role: 'P', x: 3, y: 3 }
    ],

    // ===== IT · Premium consolidation =====
    'LEO-VK': [  // Leonardo IDV — platforms: Viking
      { faceId: 'F2', role: 'S', x: 3, y: 2 },
      { faceId: 'F3', role: 'S', x: 2, y: 3 }
    ],

    // ===== UK · Heritage premium =====
    'QIN-TL': [  // QinetiQ — platforms: MAARS, Talon, Titan
      { faceId: 'F1', role: 'P', x: 3, y: 1 },
      { faceId: 'F2', role: 'S', x: 2, y: 2 },
      { faceId: 'F3', role: 'P', x: 3, y: 3 }
    ],

    // ===== PL · State research + drones =====
    'MAC-GO': [  // MACRO-SYSTEM — platforms: GNOM
      { faceId: 'F2', role: 'S', x: 2, y: 2 },
      { faceId: 'F4', role: 'P', x: 2, y: 2 }
    ],
    'WIT-KU': [  // WITPiS — platforms: KUNA
      { faceId: 'F1', role: 'P', x: 2, y: 2 },
      { faceId: 'F2', role: 'S', x: 1, y: 1 },
      { faceId: 'F4', role: 'S', x: 2, y: 2 }
    ],

    // ===== CZ · State research mid-tier =====
    'LPP-HN': [  // LPP Holding — platforms: Hornet
      { faceId: 'F1', role: 'P', x: 2, y: 2 },
      { faceId: 'F2', role: 'S', x: 2, y: 2 },
      { faceId: 'F3', role: 'S', x: 2, y: 1 },
      { faceId: 'F4', role: 'S', x: 2, y: 2 }
    ],
    'VOP-TR': [  // VOP CZ — platforms: Taros
      { faceId: 'F1', role: 'P', x: 2, y: 1 },
      { faceId: 'F2', role: 'S', x: 2, y: 1 },
      { faceId: 'F4', role: 'P', x: 1, y: 2 }
    ],

    // ===== LV · Mid-tier emergence =====
    'BRA-UH': [  // BRASA Defence — platforms: UNHUMAN
      { faceId: 'F1', role: 'P', x: 2, y: 1 },
      { faceId: 'F2', role: 'S', x: 1, y: 2 },
      { faceId: 'F3', role: 'S', x: 1, y: 1 },
      { faceId: 'F4', role: 'S', x: 1, y: 1 },
      { faceId: 'F5', role: 'S', x: 2, y: 1 }
    ],
    'NAT-NX': [  // Natrix — platforms: —
      { faceId: 'F1', role: 'P', x: 2, y: 1 },
      { faceId: 'F4', role: 'S', x: 1, y: 1 }
    ],
    'LVT-EO': [  // LV-TEH — platforms: —
      { faceId: 'F2', role: 'P', x: 1, y: 2 },
      { faceId: 'F3', role: 'P', x: 1, y: 1 }
    ],

    // ===== ES · Iberian emergence =====
    'SEN-AL': [  // SENER — platforms: ALANO
      { faceId: 'F1', role: 'P', x: 1, y: 1 },
      { faceId: 'F4', role: 'S', x: 2, y: 2 }
    ],
    'SAS-TL': [  // SASCorp — platforms: Tellus
      { faceId: 'F1', role: 'P', x: 1, y: 1 },
      { faceId: 'F5', role: 'S', x: 1, y: 1 }
    ],
  };

  // ============================================================
  // CUBE GEOMETRY constants
  // ============================================================
  const CUBE = {
    size: 100,           // Cube edge length in scene units
    faceMargin: 8,       // Margin inside each face for axis labels
    dotRadius: 1.4,      // Default dot radius (P)
    dotRadiusSecondary: 1.0  // S radius (smaller)
  };

  // ============================================================
  // Convert face quadrant indices (X, Y) ∈ {1,2,3} to local 2D coords
  // on face. Returns the CENTER of the corresponding cell.
  // Each face has 3×3 cells. Cell (1,1) = bottom-left, (3,3) = top-right.
  // Example: x=2, y=3 → center of middle-column, top-row cell.
  // ============================================================
  function faceLocalCoords(x, y) {
    const margin = CUBE.faceMargin;
    const cellSize = (CUBE.size - 2 * margin) / 3;
    return {
      // (x - 0.5) puts point at center of cell x (so x=1 → 0.5*cell, x=2 → 1.5*cell, x=3 → 2.5*cell)
      u: -CUBE.size / 2 + margin + (x - 0.5) * cellSize,
      v: -CUBE.size / 2 + margin + (y - 0.5) * cellSize
    };
  }

  // ============================================================
  // Cube face orientation: maps face id to (rotation, position) in 3D
  // F2 (Combat AP) is FRONT per spec — primary first impression
  // F1 Logistics RIGHT, F4 ISR TOP, F3 EOD LEFT, F5 Civil BACK
  // (Bottom face is unused — UGV market has no 6th face conceptually
  //  beyond convergence, which is rendered as edges, not a face)
  // ============================================================
  const FACE_ORIENTATIONS = {
    'F2': { // Combat AP — FRONT (z+)
      position: [0, 0, CUBE.size / 2],
      rotation: [0, 0, 0]
    },
    'F1': { // Logistics — RIGHT (x+)
      position: [CUBE.size / 2, 0, 0],
      rotation: [0, Math.PI / 2, 0]
    },
    'F4': { // ISR — TOP (y+)
      position: [0, CUBE.size / 2, 0],
      rotation: [-Math.PI / 2, 0, 0]
    },
    'F3': { // EOD/CBRN — LEFT (x-)
      position: [-CUBE.size / 2, 0, 0],
      rotation: [0, -Math.PI / 2, 0]
    },
    'F5': { // Civil-defense — BACK (z-)
      position: [0, 0, -CUBE.size / 2],
      rotation: [0, Math.PI, 0]
    }
  };

  // ============================================================
  // MORPHOLOGY — chassis type per actor
  // ============================================================
  // Categories: 'tracked' (chenilles) — dominant in combat & logistics
  //             'wheeled' (roues) — fast logistics, recon, civil
  //             'legged'  (quadrupèdes) — niche EOD/CBRN/perimeter
  //             'mixed'   (multi-platform vendor)
  // To validate by Jérémie — heuristic mapping based on public product lines.
  const MORPHOLOGY = {
    // UA — tracked dominant (combat platforms)
    'TEN-TM':  'tracked',   // TerMIT
    'TEM-UG':  'tracked',   // Temerland (combat)
    'DEV-TW':  'tracked',   // DevDroid
    'ROB-IC':  'tracked',   // Roboneers
    'RAT-RS':  'tracked',   // Ratel S kamikaze
    'UKR-PR':  'tracked',   // UkrPrototype
    'ABR-DG':  'mixed',     // ABRIS-DG (multi-platform)

    // DE — mixed/tracked
    'RHM-MM':  'mixed',     // Rheinmetall (Mission Master + DOK-ING wheeled)
    'ARX-GE':  'tracked',   // ARX Gereon
    'QSY-MA':  'wheeled',   // Quantum (logistic mules)
    'KND-OP':  'tracked',   // KMW-Nexter (tracked combat)

    // USA — mostly mixed/wheeled
    'OVL-BR':  'wheeled',   // Overland AI (wheeled platforms)
    'TFL-CT':  'tracked',   // Teledyne FLIR (tracked EOD)
    'GHT-CT':  'wheeled',   // Ghost Robotics legged + wheeled
    'HHE-RS':  'tracked',   // Howe & Howe RS2-H1
    'SWB-AI':  'tracked',   // Swarmbotics
    'OND-RT':  'tracked',   // Ondas/Roboteam (tracked recon)

    // FR — wheeled heritage
    'ARQ-DR':  'wheeled',   // Arquus (wheeled VBL)
    'SHK-CO':  'wheeled',   // Shark Robotics (wheeled mules)
    'EXA-IG':  'wheeled',   // Exail (wheeled enabler)
    'NEX-NV':  'wheeled',   // Nerva (wheeled)

    // IL — tracked combat / mixed
    'ROK-PG':  'tracked',   // Roboteam combat
    'ELB-MR':  'mixed',     // Elbit Medusa
    'IAI-RT':  'tracked',   // IAI RoBattle

    // EE / FI / LV / PL / CZ / HR / IT / ES — tracked dominant
    'MIL-TH':  'tracked',   // Milrem THeMIS
    'INS-TM':  'tracked',   // INSTA TerMIT FI
    'LXT-RB':  'tracked',   // Latvia Latitude
    'BRA-UH':  'tracked',   // Latvia BRAUKT
    'WIT-KU':  'tracked',   // Polish KU
    'MAC-GO':  'tracked',   // MACRO-SYSTEM Goblin
    'VOP-TR':  'tracked',   // CZ VOP
    'LPP-HN':  'tracked',   // CZ Hornet
    'DOK-MV':  'wheeled',   // DOK-ING (wheeled MV-4)
    'LEO-VK':  'wheeled',   // Leonardo Viking
    'SEN-AL':  'tracked',   // Spain SENER
    'EAS-IL':  'tracked',   // EASIL
    'QIN-TL':  'wheeled'    // UK QinetiQ Talon (wheeled remote)
  };

  return {
    FACES, ACTOR_POSITIONS, CUBE, FACE_ORIENTATIONS, faceLocalCoords, MORPHOLOGY
  };
})();
