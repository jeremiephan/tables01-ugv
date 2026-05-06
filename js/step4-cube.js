/* ============================================================
   Starburst Tables 01 · UGV · Step 4 — Cube revelation app
   ============================================================
   Three.js scene with 5 superposed market faces + actor dots.
   Portfolio user picks highlighted in warm gold; others muted.
   Skip-to-interactive: OrbitControls active immediately, no
   forced camera tour.
   ============================================================ */

(function () {

  const D3 = window.STEP3_DATA;
  const D4 = window.STEP4_DATA;
  if (!D3 || !D4) {
    console.error('[step4] STEP3_DATA or STEP4_DATA missing');
    return;
  }
  if (!window.THREE) {
    console.error('[step4] Three.js not loaded');
    return;
  }

  const THREE = window.THREE;

  // ---- C3 fix: WebGL detection -----------------------------------------------
  function isWebGLAvailable() {
    try {
      const canvas = document.createElement('canvas');
      return !!(window.WebGLRenderingContext && (canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  function showWebGLFallback(container) {
    if (!container) return;
    container.innerHTML = `
      <div class="webgl-fallback">
        <div class="wgf-icon">⚠</div>
        <h3 class="wgf-title">3D rendering unavailable</h3>
        <p class="wgf-text">Your browser doesn't support WebGL, required for the cube view.</p>
        <p class="wgf-text">Please use the latest <strong>Chrome</strong>, <strong>Firefox</strong>, <strong>Safari</strong>, or <strong>Edge</strong>.</p>
        <a href="#step-3" class="wgf-link">← Return to Step 3 (2D dataset)</a>
      </div>
    `;
  }

  // ---- State -----------------------------------------------------------------
  const STATE_KEY = 'sb-tables-01';
  function loadState() {
    try {
      // SPA in-memory shim (used by step3-inline patch)
      if (window.__SPA_S3_STORE__ && window.__SPA_S3_STORE__[STATE_KEY]) {
        return JSON.parse(window.__SPA_S3_STORE__[STATE_KEY]);
      }
      // Fallback: real sessionStorage
      const sessionRaw = sessionStorage.getItem(STATE_KEY);
      if (sessionRaw) return JSON.parse(sessionRaw);
    } catch (e) {
      console.warn('[step4] loadState failed:', e);
    }
    return { profile: 'VC-D', thesis: 'B', composition: [] };
  }

  function isUserPick(actorCode) {
    const state = loadState();
    return (state.composition || []).some(c => c.code === actorCode);
  }

  // ---- Three.js scene setup --------------------------------------------------
  let scene, camera, renderer, controls;
  let cubeGroup, dotsGroup, edgesGroup;
  let raycaster, mouse;
  let hoveredDot = null;
  let canvasContainer = null;
  let faceGroups = {}; // faceId → THREE.Group, pour fly-to + exploded view

  // v4.3 Cube toggles state (local Step 4)
  const cubeState = {
    showPartnerships: false,   // v4.6: F6 OFF by default (per user request)
    showAllLabels: true,       // v4.6: All labels ON by default (per user request)
    picksOnly: false,
    exploded: false,
    morphologyMode: false,
    explodedAnim: { active: false, start: 0, from: 0, to: 0, duration: 1500 }
  };

  // Morphology palette
  const MORPHOLOGY_COLORS = {
    'tracked':  '#7d8a9c',  // cool steel grey-blue
    'wheeled':  '#d4a574',  // warm tan
    'legged':   '#a47fc4',  // violet
    'mixed':    '#5a8fd4'   // interactive blue
  };

  // ---- Camera fly-to animation state ----
  const flyToAnim = {
    active: false, start: 0, duration: 900,
    from: null, to: null, fromTarget: null, toTarget: null
  };

  // Color constants
  const COL = {
    background: '#0d1220',
    cubeFrame: '#1a2336',
    cubeFaceFrame: '#232d44',
    axisLine: '#2a3550',
    axisLineActive: '#3d4d70',
    pickGlow: '#f4d9a8',     // warm gold for user picks
    pickRing: '#e8c441',     // signal-yellow ring
    edgeJV: '#e8c441',       // JV edges
    edgeAcq: '#a0a8bc'       // acquisition edges
  };

  function initScene(container) {
    canvasContainer = container;
    const w = container.clientWidth;
    const h = container.clientHeight || 600;

    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(COL.background);

    // Camera — perspective, isometric initial position
    camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 1000);
    // C1 fix: start far away for dramatic zoom-in entry
    camera.position.set(450, 300, 450);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    // Lighting — ambient + directional for subtle depth
    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.4);
    directional.position.set(120, 150, 100);
    scene.add(directional);

    // OrbitControls (skip-to-interactive)
    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 0.8;
      controls.minDistance = 60;
      controls.maxDistance = 350;
      controls.enablePan = false;
      controls.target.set(0, 0, 0);
      // C1 fix: temporarily disable controls during entry animation
      controls.enabled = false;
    }

    // Raycaster for hover/click
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Build the cube
    buildCube();
    computeActorWorldPositions(); // v4.9: populate shared cache before dots+edges
    buildDots();
    buildEdges();

    // Wire events
    renderer.domElement.addEventListener('mousemove', onMouseMove);
    renderer.domElement.addEventListener('click', onClick);
    window.addEventListener('resize', onResize);

    // C1 fix: dramatic entry animation
    animateEntry();

    animate();
  }

  // ---- C1 fix: dramatic entry animation -------------------------------------
  let entryStartTime = null;
  const ENTRY_DURATION = 1600; // ms
  const ENTRY_FROM = { x: 450, y: 300, z: 450 };
  const ENTRY_TO   = { x: 145, y: 95, z: 145 };

  function animateEntry() {
    entryStartTime = performance.now();

    // Hide dots initially, fade them in progressively
    if (dotsGroup) {
      dotsGroup.traverse(o => {
        if (o.isMesh && o.material) {
          o.userData._targetOpacity = o.material.opacity;
          o.material.opacity = 0;
          o.material.transparent = true;
        }
      });
    }
    if (edgesGroup) {
      edgesGroup.traverse(o => {
        if (o.isLine && o.material) {
          o.userData._targetOpacity = o.material.opacity;
          o.material.opacity = 0;
        }
      });
    }
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function tickEntryAnimation() {
    if (!entryStartTime) return false;
    const elapsed = performance.now() - entryStartTime;
    const t = Math.min(elapsed / ENTRY_DURATION, 1);
    const eased = easeOutCubic(t);

    // Camera position lerp
    camera.position.x = ENTRY_FROM.x + (ENTRY_TO.x - ENTRY_FROM.x) * eased;
    camera.position.y = ENTRY_FROM.y + (ENTRY_TO.y - ENTRY_FROM.y) * eased;
    camera.position.z = ENTRY_FROM.z + (ENTRY_TO.z - ENTRY_FROM.z) * eased;
    camera.lookAt(0, 0, 0);

    // Dots fade in (start at 30% of animation)
    const dotsT = Math.max(0, (t - 0.3) / 0.7);
    if (dotsGroup) {
      dotsGroup.traverse(o => {
        if (o.isMesh && o.material && o.userData._targetOpacity !== undefined) {
          o.material.opacity = o.userData._targetOpacity * easeOutCubic(dotsT);
        }
      });
    }

    // Edges fade in (start at 60% of animation)
    const edgesT = Math.max(0, (t - 0.6) / 0.4);
    if (edgesGroup) {
      edgesGroup.traverse(o => {
        if (o.isLine && o.material && o.userData._targetOpacity !== undefined) {
          o.material.opacity = o.userData._targetOpacity * easeOutCubic(edgesT);
        }
      });
    }

    if (t >= 1) {
      // Animation done — enable controls
      if (controls) controls.enabled = true;
      entryStartTime = null;
      return false;
    }
    return true;
  }

  // ---- Build cube + faces ----------------------------------------------------
  function buildCube() {
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    const size = D4.CUBE.size;

    // Cube wireframe — subtle frame edges
    const cubeGeom = new THREE.BoxGeometry(size, size, size);
    const cubeEdges = new THREE.EdgesGeometry(cubeGeom);
    const cubeFrame = new THREE.LineSegments(
      cubeEdges,
      new THREE.LineBasicMaterial({ color: COL.cubeFrame, linewidth: 1 })
    );
    cubeGroup.add(cubeFrame);

    // Reset faceGroups map (rebuild each time)
    faceGroups = {};

    // Each visible face: a colored plane + frame + axes + label
    for (const face of D4.FACES) {
      const orient = D4.FACE_ORIENTATIONS[face.id];
      if (!orient) continue;

      const faceGroup = new THREE.Group();
      faceGroup.position.set(...orient.position);
      faceGroup.rotation.set(...orient.rotation);
      faceGroup.userData.faceId = face.id;
      // Store cube-mode position/rotation for exploded view interpolation
      faceGroup.userData.cubePosition = [...orient.position];
      faceGroup.userData.cubeRotation = [...orient.rotation];
      faceGroups[face.id] = faceGroup;

      // v4.6: Encode face axes/grid/labels DIRECTLY as a texture on the face plane
      // This way axes turn with the face (no more billboarding sprites that fly off-axis)
      const faceTextureCanvas = createFaceTexture(face);
      const faceTexture = new THREE.CanvasTexture(faceTextureCanvas);
      faceTexture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
      faceTexture.needsUpdate = true;

      const planeGeom = new THREE.PlaneGeometry(size - 0.5, size - 0.5);
      const planeMat = new THREE.MeshBasicMaterial({
        map: faceTexture,
        transparent: true,
        opacity: 1.0,
        side: THREE.DoubleSide
      });
      const plane = new THREE.Mesh(planeGeom, planeMat);
      plane.position.z = -0.05;
      faceGroup.add(plane);

      // Face frame — distinct colored border
      const frameGeom = new THREE.EdgesGeometry(planeGeom);
      const frame = new THREE.LineSegments(
        frameGeom,
        new THREE.LineBasicMaterial({ color: face.color, transparent: true, opacity: 0.7 })
      );
      faceGroup.add(frame);

      // v4.7: Face title and ID baked into the surface texture (createFaceTexture).
      // No more sprite ID badge or HTML callout overlay.

      cubeGroup.add(faceGroup);
    }
  }

  // ---- v4.6 Create face texture (axes + grid + labels + TITLE baked into canvas)
  function createFaceTexture(face) {
    // Canvas dimensions — high res for crisp text after texture mapping
    const TX = 1024;
    const cnv = document.createElement('canvas');
    cnv.width = TX; cnv.height = TX;
    const ctx = cnv.getContext('2d');

    // Background — semi-opaque face color
    const c = face.color;
    ctx.fillStyle = hexToRgba(c, 0.10);
    ctx.fillRect(0, 0, TX, TX);

    // Inner padding (corresponds to faceMargin in 3D)
    const pad = TX * 0.08;
    const innerSize = TX - 2 * pad;
    const cell = innerSize / 3;

    // Light grid — 4 vertical and 4 horizontal lines (delimiting 3 cells × 3 cells)
    ctx.strokeStyle = 'rgba(160, 168, 188, 0.18)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i <= 3; i++) {
      const u = pad + i * cell;
      ctx.beginPath();
      ctx.moveTo(u, pad); ctx.lineTo(u, pad + innerSize);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pad, u); ctx.lineTo(pad + innerSize, u);
      ctx.stroke();
    }

    // v4.7: FACE TITLE baked on the surface (top-center, big, face color)
    // Title format: "F2 · COMBAT AP" at top of face
    ctx.fillStyle = c; // face color
    ctx.font = "700 56px 'IBM Plex Sans', Arial";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const title = `${face.id} · ${face.label.toUpperCase()}`;
    ctx.fillText(title, TX / 2, pad / 2 + 6);

    // X-axis label at bottom — uses face-specific xLow / xHigh
    ctx.fillStyle = '#f0f1f5';
    ctx.font = "700 36px 'JetBrains Mono', monospace, Arial";
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const xLabel = `${face.axes.xLow}   ⟶   ${face.axes.xHigh}`;
    ctx.fillText(xLabel, TX / 2, TX - pad / 2);

    // Y-axis label at left, rotated — uses face-specific yLow / yHigh
    ctx.save();
    ctx.translate(pad / 2, TX / 2);
    ctx.rotate(-Math.PI / 2);
    const yLabel = `${face.axes.yLow}   ⟶   ${face.axes.yHigh}`;
    ctx.fillText(yLabel, 0, 0);
    ctx.restore();

    // v4.7: ticks 1, 2, 3 removed — labels are now LOW → HIGH (no need to mark numeric scale)

    return cnv;
  }

  function hexToRgba(hex, alpha) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // ---- v4.7 Offset positions: 1 point = 1 startup, distributed within cell ---
  // Cell half-width = 14. We cap offsets at 11 to stay strictly inside the quadrant.
  // Pattern: 1 = center, 2 = vertical pair, 3 = triangle, 4 = square, 5+ = circle.
  function getOffsetForIndex(index, total) {
    if (total <= 1) return [0, 0];
    if (total === 2) return [0, (index - 0.5) * 9];
    if (total === 3) {
      const angles = [Math.PI / 2, Math.PI / 2 + 2 * Math.PI / 3, Math.PI / 2 + 4 * Math.PI / 3];
      return [Math.cos(angles[index]) * 7, Math.sin(angles[index]) * 7];
    }
    if (total === 4) {
      const layout = [[-6, 6], [6, 6], [6, -6], [-6, -6]];
      return layout[index] || [0, 0];
    }
    // 5+ : compact circle, capped radius 9
    const angle = (index / total) * Math.PI * 2 + Math.PI / 2;
    return [Math.cos(angle) * 9, Math.sin(angle) * 9];
  }

  // ---- Build dots (actors on faces) ------------------------------------------
  function buildDots() {
    dotsGroup = new THREE.Group();
    scene.add(dotsGroup);

    const size = D4.CUBE.size;
    let dotCount = 0;
    let actorCount = 0;
    const seenActors = new Set();

    // Step 1: bucket all visible positions by (faceId, x, y) for offset calculation
    const cellBuckets = {};
    for (const startup of D3.STARTUPS) {
      const positions = D4.ACTOR_POSITIONS[startup.code];
      if (!positions) continue;
      const isPick = isUserPick(startup.code);
      if (cubeState.picksOnly && !isPick) continue;

      for (const pos of positions) {
        const key = `${pos.faceId}-${pos.x}-${pos.y}`;
        if (!cellBuckets[key]) cellBuckets[key] = [];
        cellBuckets[key].push({ startup, pos, isPick });
      }
    }

    // Step 2: render each bucket with offsets
    for (const key in cellBuckets) {
      const bucket = cellBuckets[key];
      const total = bucket.length;
      bucket.forEach((entry, idx) => {
        const { startup, pos, isPick } = entry;
        const orient = D4.FACE_ORIENTATIONS[pos.faceId];
        if (!orient) return;

        const local = D4.faceLocalCoords(pos.x, pos.y);
        const offset = getOffsetForIndex(idx, total);
        const radius = pos.role === 'P' ? D4.CUBE.dotRadius : D4.CUBE.dotRadiusSecondary;

        // Determine dot color: morphology mode > pick > country
        let dotColor;
        if (isPick) {
          dotColor = COL.pickGlow;
        } else if (cubeState.morphologyMode) {
          const morph = D4.MORPHOLOGY[startup.code] || 'tracked';
          dotColor = MORPHOLOGY_COLORS[morph] || '#7d8a9c';
        } else {
          dotColor = D3.COUNTRY_COLORS[startup.country] || '#a0a8bc';
        }

        // v4.8 markers : Primary = filled sphere (full circle), Secondary = ring (donut)
        let dot;
        if (pos.role === 'P') {
          // Primary: solid sphere
          const dotGeom = new THREE.SphereGeometry(radius, 16, 12);
          const dotMat = new THREE.MeshBasicMaterial({
            color: dotColor,
            transparent: true,
            opacity: 1.0
          });
          dot = new THREE.Mesh(dotGeom, dotMat);
        } else {
          // Secondary: ring (annulus, hollow circle)
          // Use slightly larger outer radius and a thicker ring than the picks-glow,
          // make it face camera by parenting to face group (face is flat plane).
          const ringInner = radius * 0.55;
          const ringOuter = radius * 1.15;
          const ringGeom = new THREE.RingGeometry(ringInner, ringOuter, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: dotColor,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide
          });
          dot = new THREE.Mesh(ringGeom, ringMat);
          // Tag as a Secondary marker so hover/raycast still works the same way
        }

        const targetFaceGroup = faceGroups[pos.faceId];

        const localU = local.u + offset[0];
        const localV = local.v + offset[1];
        dot.position.set(localU, localV, 1.0);
        dot.userData = {
          actorCode: startup.code,
          actorName: startup.name,
          country: startup.country,
          faceId: pos.faceId,
          role: pos.role,
          x: pos.x,
          y: pos.y,
          isPick: isPick,
          morphology: D4.MORPHOLOGY[startup.code] || null
        };

        if (targetFaceGroup) {
          targetFaceGroup.add(dot);
        } else {
          dotsGroup.add(dot);
        }

        dotCount++;
        if (!seenActors.has(startup.code)) {
          seenActors.add(startup.code);
          actorCount++;
        }

        // Glow ring around picks (in addition to the marker, signal-yellow)
        if (isPick && targetFaceGroup) {
          const glowInner = radius * 1.35;
          const glowOuter = radius * 1.75;
          const ringGeom = new THREE.RingGeometry(glowInner, glowOuter, 24);
          const ringMat = new THREE.MeshBasicMaterial({
            color: COL.pickRing,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
          });
          const ring = new THREE.Mesh(ringGeom, ringMat);
          ring.position.set(localU, localV, 1.05);
          ring.userData.isRing = true;
          targetFaceGroup.add(ring);
        }

        // v4.7: With dots now offset within cell, place label just above each dot
        // (not stacked vertically anymore — dots already separated by offset)
        const labelText = startup.name;
        const labelSprite = makeTextSprite(labelText, {
          fontSize: 28,
          color: isPick ? '#f4d9a8' : '#e8e8ea',
          fontWeight: isPick ? '700' : '600',
          letterSpacing: 0.5,
          padded: true
        });
        labelSprite.position.set(localU, localV + radius + 3.5, 1.1);
        labelSprite.scale.set(26, 4.5, 1);
        labelSprite.userData.isLabel = true;
        labelSprite.userData.isPickLabel = isPick;
        labelSprite.userData.faceId = pos.faceId;
        labelSprite.userData.actorCode = startup.code;
        labelSprite.material.opacity = 0; // hidden by default; managed by updateLabelsVisibility
        if (targetFaceGroup) targetFaceGroup.add(labelSprite);
      });
    }

    updateCubeCounter(actorCount, dotCount);
  }

  function updateCubeCounter(actors, positions) {
    const counter = document.getElementById('cube-counter');
    if (counter) {
      const total = D3.STARTUPS.length;
      counter.textContent = `${actors} / ${total} actors · ${positions} positions`;
    }
  }

  // v4.9: Shared cache of resolved world positions per actor (with cell-bucket offsets).
  // Populated by computeActorWorldPositions() and reused by buildDots + buildEdges so
  // edges land EXACTLY on the visible dot (not on the cell-center).
  let actorWorldPositions = {}; // code → [{ faceId, role, x, y, world: Vector3 }, ...]

  function computeActorWorldPositions() {
    actorWorldPositions = {};
    // Step 1 : bucket positions by (face, x, y) — same logic as buildDots
    const cellBuckets = {};
    for (const startup of D3.STARTUPS) {
      const positions = D4.ACTOR_POSITIONS[startup.code];
      if (!positions) continue;
      const isPick = isUserPick(startup.code);
      if (cubeState.picksOnly && !isPick) continue;
      for (const pos of positions) {
        const key = `${pos.faceId}-${pos.x}-${pos.y}`;
        if (!cellBuckets[key]) cellBuckets[key] = [];
        cellBuckets[key].push({ code: startup.code, pos });
      }
    }
    // Step 2 : compute world position with offset for each entry
    for (const key in cellBuckets) {
      const bucket = cellBuckets[key];
      const total = bucket.length;
      bucket.forEach((entry, idx) => {
        const { code, pos } = entry;
        const orient = D4.FACE_ORIENTATIONS[pos.faceId];
        if (!orient) return;
        const local = D4.faceLocalCoords(pos.x, pos.y);
        const offset = getOffsetForIndex(idx, total);
        const localU = local.u + offset[0];
        const localV = local.v + offset[1];
        const localVec = new THREE.Vector3(localU, localV, 1.0);
        const m = new THREE.Matrix4();
        m.makeRotationFromEuler(new THREE.Euler(...orient.rotation));
        localVec.applyMatrix4(m);
        localVec.add(new THREE.Vector3(...orient.position));
        if (!actorWorldPositions[code]) actorWorldPositions[code] = [];
        actorWorldPositions[code].push({
          faceId: pos.faceId, role: pos.role, x: pos.x, y: pos.y,
          world: localVec
        });
      });
    }
  }

  // ---- Build edges (Face 6 convergence — JVs/acquisitions) -------------------
  function buildEdges() {
    edgesGroup = new THREE.Group();
    scene.add(edgesGroup);

    if (!D3.PARTNERSHIPS) return;
    if (!cubeState.showPartnerships) return; // toggle F6

    // Make sure positions cache is populated
    if (!Object.keys(actorWorldPositions).length) computeActorWorldPositions();

    for (const p of D3.PARTNERSHIPS) {
      // Skip self-edges (single-actor acquisitions used as markers — no edge to draw)
      if (p.from === p.to) continue;

      const fromList = actorWorldPositions[p.from];
      const toList = actorWorldPositions[p.to];
      if (!fromList || !toList) continue; // one side not in dataset → skip silently

      const edgeColor = (p.type === 'jv' || p.type === 'jv-extern')
        ? COL.edgeJV
        : (p.type === 'cross-face' ? COL.edgeJV : COL.edgeAcq);
      const edgeType = (p.type === 'acquisition') ? 'acq' : 'jv';

      // v4.9: Three rendering strategies based on type
      if (p.type === 'cross-face') {
        // Type 2: ALL pairs of positions on DIFFERENT faces
        for (const a of fromList) {
          for (const b of toList) {
            if (a.faceId === b.faceId) continue; // skip same-face
            drawEdge(a.world, b.world, edgeColor, edgeType);
          }
        }
      } else {
        // Type 1 + 3: single edge between first primary positions
        const fromPrimary = fromList.find(x => x.role === 'P') || fromList[0];
        const toPrimary = toList.find(x => x.role === 'P') || toList[0];
        if (!fromPrimary || !toPrimary) continue;
        drawEdge(fromPrimary.world, toPrimary.world, edgeColor, edgeType);
      }
    }
  }

  function drawEdge(fromVec, toVec, color, edgeType) {
    const points = [fromVec, toVec];
    const geom = new THREE.BufferGeometry().setFromPoints(points);
    const mat = new THREE.LineDashedMaterial({
      color: color,
      dashSize: 2,
      gapSize: 1.5,
      transparent: true,
      opacity: 0.55
    });
    const line = new THREE.Line(geom, mat);
    line.computeLineDistances();
    // Cycle E.2: tag edges so animate() can pulse JV edges differently from acquisitions
    line.userData.edgeType = edgeType || 'jv';
    line.userData.baseOpacity = 0.55;
    edgesGroup.add(line);
  }

  function getFirstPrimaryPosition(actorCode) {
    // v4.9: kept for backwards compatibility but no longer used by buildEdges.
    if (!Object.keys(actorWorldPositions).length) computeActorWorldPositions();
    const list = actorWorldPositions[actorCode];
    if (!list) return null;
    const primary = list.find(p => p.role === 'P') || list[0];
    return primary ? { world: primary.world, faceId: primary.faceId } : null;
  }

  // ---- Text sprite helper ----------------------------------------------------
  function makeTextSprite(text, opts) {
    opts = opts || {};
    const fontSize = opts.fontSize || 16;
    const color = opts.color || '#a0a8bc';
    const fontWeight = opts.fontWeight || '500';
    const letterSpacing = opts.letterSpacing || 0;
    const padded = opts.padded === true;

    // High-res canvas for crisp text after texture sampling
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 96;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (padded) {
      // Measure text first to size the background pill
      ctx.font = `${fontWeight} ${fontSize}px 'IBM Plex Sans', 'JetBrains Mono', monospace, Arial`;
      const textW = ctx.measureText(text).width;
      const pillW = Math.min(canvas.width - 12, textW + 22);
      const pillH = fontSize + 14;
      const pillX = (canvas.width - pillW) / 2;
      const pillY = (canvas.height - pillH) / 2;
      // Rounded background rect
      ctx.fillStyle = 'rgba(13, 18, 32, 0.88)';
      ctx.beginPath();
      const r = 4;
      ctx.moveTo(pillX + r, pillY);
      ctx.lineTo(pillX + pillW - r, pillY);
      ctx.quadraticCurveTo(pillX + pillW, pillY, pillX + pillW, pillY + r);
      ctx.lineTo(pillX + pillW, pillY + pillH - r);
      ctx.quadraticCurveTo(pillX + pillW, pillY + pillH, pillX + pillW - r, pillY + pillH);
      ctx.lineTo(pillX + r, pillY + pillH);
      ctx.quadraticCurveTo(pillX, pillY + pillH, pillX, pillY + pillH - r);
      ctx.lineTo(pillX, pillY + r);
      ctx.quadraticCurveTo(pillX, pillY, pillX + r, pillY);
      ctx.closePath();
      ctx.fill();
      // Subtle border
      ctx.strokeStyle = 'rgba(35, 45, 68, 0.85)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    ctx.font = `${fontWeight} ${fontSize}px 'IBM Plex Sans', 'JetBrains Mono', monospace, Arial`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(mat);
    return sprite;
  }

  // ---- Mouse interactions ----------------------------------------------------
  function onMouseMove(evt) {
    if (!renderer) return;
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((evt.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((evt.clientY - rect.top) / rect.height) * 2 + 1;
    updateHover(evt);
  }

  function updateHover(evt) {
    raycaster.setFromCamera(mouse, camera);
    // v4.4: Only allow hover on dots whose face is currently front (or all in exploded)
    const intersects = [];
    scene.traverse(obj => {
      if (obj.isMesh && obj.userData.actorCode) {
        // Skip dots of non-front faces (unless exploded view)
        if (!cubeState.exploded && obj.userData.faceId !== currentFrontFaceId) {
          return;
        }
        const hits = raycaster.intersectObject(obj, false);
        if (hits.length) intersects.push(hits[0]);
      }
    });
    intersects.sort((a, b) => a.distance - b.distance);

    const tooltip = document.getElementById('cube-tooltip');
    if (intersects.length > 0) {
      const hit = intersects[0];
      const ud = hit.object.userData;
      hoveredDot = hit.object;
      // Cycle E.1: hovering on dot stops idle rotation permanently
      stopIdleRotation();
      renderer.domElement.style.cursor = 'pointer';
      if (tooltip) {
        const face = D4.FACES.find(f => f.id === ud.faceId);
        const morphLine = ud.morphology ? ` · <span style="color:#a0a8bc">${ud.morphology}</span>` : '';
        tooltip.innerHTML =
          `<div class="ct-eyebrow">${ud.actorCode} · ${ud.country}${ud.isPick ? ' · <span style="color:#f4d9a8">YOUR PICK</span>' : ''}</div>` +
          `<div class="ct-name">${ud.actorName}</div>` +
          `<div class="ct-row">${face ? face.label : ud.faceId} · ${ud.role === 'P' ? 'Primary' : 'Secondary'} · cadence ${ud.x} × autonomy ${ud.y}${morphLine}</div>`;
        if (evt) {
          tooltip.style.left = (evt.clientX + 14) + 'px';
          tooltip.style.top = (evt.clientY + 14) + 'px';
        }
        tooltip.classList.add('is-visible');
      }
    } else {
      hoveredDot = null;
      renderer.domElement.style.cursor = 'grab';
      if (tooltip) tooltip.classList.remove('is-visible');
    }
  }

  function onClick(evt) {
    // Cycle E.1: any click stops idle rotation permanently
    stopIdleRotation();
    if (hoveredDot) {
      const ud = hoveredDot.userData;
      console.log('[step4] click on', ud.actorCode, ud.faceId);
      // v5.3: fire global event so external panels (RIGHT context in v53 explore mode) can react
      try {
        window.dispatchEvent(new CustomEvent('sb:actorClick', {
          detail: {
            actorCode: ud.actorCode,
            actorName: ud.actorName,
            country: ud.country,
            faceId: ud.faceId,
            role: ud.role,
            isPick: ud.isPick
          }
        }));
      } catch (e) {}
    }
  }

  function onResize() {
    if (!canvasContainer || !renderer || !camera) return;
    const w = canvasContainer.clientWidth;
    const h = canvasContainer.clientHeight || 600;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ---- H1 fix: orientation indicator (which face is front?) -----------------
  let currentFrontFaceId = null;     // exposed to other functions
  let faceVisibilityMap = {};         // faceId → dot product with camera (used for blur)

  function updateOrientationIndicator() {
    const indicator = document.getElementById('cube-orientation');
    if (!camera) return;

    // For each face, compute its normal in world space, then dot with view direction
    let bestFaceId = null;
    let bestDot = -Infinity;
    const camPos = camera.position.clone().normalize();
    faceVisibilityMap = {};

    for (const face of D4.FACES) {
      const fg = faceGroups[face.id];
      if (!fg) continue;
      // Face normal is +Z in local. Use the face group's actual world rotation.
      const worldQuat = new THREE.Quaternion();
      fg.getWorldQuaternion(worldQuat);
      const normal = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuat);
      const dot = normal.dot(camPos);
      faceVisibilityMap[face.id] = dot;
      if (dot > bestDot) {
        bestDot = dot;
        bestFaceId = face.id;
      }
    }

    currentFrontFaceId = bestFaceId;

    if (indicator && bestFaceId) {
      const face = D4.FACES.find(f => f.id === bestFaceId);
      if (face) {
        indicator.innerHTML = `
          <span class="co-eyebrow">Front</span>
          <span class="co-face" style="color:${face.color}">${face.id} · ${face.label}</span>
        `;
      }
    }

    // v4.8: update front-face axes panel in legend
    updateAxesPanel(bestFaceId);
  }

  // v4.8 — refresh dynamic axes legend section
  function updateAxesPanel(faceId) {
    if (!faceId) return;
    const face = D4.FACES.find(f => f.id === faceId);
    if (!face || !face.axes) return;
    const setText = (id, txt) => { const el = document.getElementById(id); if (el) el.textContent = txt; };
    setText('clc-axes-face-id', face.id);
    setText('clc-axis-x', face.axes.x);
    setText('clc-axis-y', face.axes.y);
    if (face.axes.xScale && face.axes.xScale.length === 3) {
      setText('clc-axis-x-scale', `${face.axes.xScale[0]} → ${face.axes.xScale[2]}`);
    } else {
      setText('clc-axis-x-scale', `${face.axes.xLow} → ${face.axes.xHigh}`);
    }
    if (face.axes.yScale && face.axes.yScale.length === 3) {
      setText('clc-axis-y-scale', `${face.axes.yScale[0]} → ${face.axes.yScale[2]}`);
    } else {
      setText('clc-axis-y-scale', `${face.axes.yLow} → ${face.axes.yHigh}`);
    }
  }

  // v4.7: updateFaceCallouts removed — face titles now baked into face texture (createFaceTexture)

  // ---- v4.5 Update labels visibility — auto-show on currentFrontFaceId ------
  // Picks always shown; other actors only when their face is front (or showAllLabels toggle)
  function updateLabelsVisibility() {
    for (const fid in faceGroups) {
      const fg = faceGroups[fid];
      if (!fg) continue;
      const isFrontFace = (fid === currentFrontFaceId);
      fg.traverse(o => {
        if (!o.userData.isLabel) return;
        const showThisLabel =
          o.userData.isPickLabel ||      // picks always shown
          isFrontFace ||                  // labels of front face shown
          cubeState.showAllLabels;        // explicit toggle reveals all
        if (o.material) {
          o.material.transparent = true;
          // Modulate by visibility (so it fades smoothly when face turns)
          const visibility = faceVisibilityMap[fid] || 0;
          if (showThisLabel) {
            // Front face → 1.0, others (when toggle on) → scaled by visibility
            const target = (isFrontFace || o.userData.isPickLabel)
              ? 1.0
              : Math.max(0.4, visibility * 1.5);
            o.material.opacity = target;
          } else {
            o.material.opacity = 0;
          }
        }
      });
    }
  }

  // ---- v4.4 Focus blur — dim non-front faces -------------------------------
  function updateFocusBlur() {
    if (cubeState.exploded) {
      for (const face of D4.FACES) {
        const fg = faceGroups[face.id];
        if (!fg) continue;
        fg.traverse(o => {
          if (!o.material) return;
          if (o.userData.isLabel) return; // labels managed separately
          if (o.material.userData && o.material.userData.baseOpacity !== undefined) {
            o.material.opacity = o.material.userData.baseOpacity;
          }
        });
      }
      return;
    }

    for (const face of D4.FACES) {
      const fg = faceGroups[face.id];
      if (!fg) continue;
      const visibility = faceVisibilityMap[face.id] || 0;
      const isFront = visibility > 0.3;
      // v4.6: much stronger blur for non-front faces (was 0.28, now 0.06)
      const opacityMultiplier = isFront ? 1 : 0.06;

      fg.traverse(o => {
        if (!o.material) return;
        if (o.userData.isLabel) return; // labels managed separately
        // Save base opacity once
        if (o.material.userData.baseOpacity === undefined) {
          o.material.userData.baseOpacity = o.material.opacity;
        }
        const base = o.material.userData.baseOpacity;
        o.material.opacity = base * opacityMultiplier;
      });
    }
  }

  // ---- Animation loop --------------------------------------------------------
  // ============================================================
  // Cycle E.1 — Idle rotation state machine
  // State A : entry animation in progress (0-2.5s)
  // State B : entry done, no interaction yet → slow Y rotation
  // State C : first interaction → permanent stop
  // ============================================================
  let idleRotationState = 'A'; // 'A' | 'B' | 'C'
  let idleRotationStartTime = 0;
  const reducedMotionMQ = window.matchMedia &&
                          window.matchMedia('(prefers-reduced-motion: reduce)');

  function stopIdleRotation() {
    if (idleRotationState !== 'C') {
      idleRotationState = 'C';
      if (window.SBTrack) window.SBTrack('tables01', 'cube_idle_rotation_stopped');
    }
  }

  // Triggers that move A/B → C
  if (typeof window !== 'undefined') {
    window.addEventListener('sb:filters', stopIdleRotation);
    window.addEventListener('sb:actorClick', stopIdleRotation);
    window.addEventListener('sb:view', stopIdleRotation);
    window.addEventListener('sb:mode', stopIdleRotation);
  }

  function animate() {
    requestAnimationFrame(animate);
    // C1 fix: tick entry animation if active
    const entryActive = tickEntryAnimation();
    // v4.3: tick fly-to + exploded animations
    const flyActive = tickFlyToAnim();
    const explActive = tickExplodedAnim();
    const animActive = entryActive || flyActive || explActive;

    // Cycle E.1: idle rotation in state B
    if (cubeGroup && idleRotationState !== 'C') {
      if (entryActive) {
        idleRotationState = 'A';
        idleRotationStartTime = 0;
      } else if (idleRotationState === 'A') {
        // Just exited entry animation → enter state B
        idleRotationState = 'B';
        idleRotationStartTime = performance.now();
      } else if (idleRotationState === 'B') {
        // Slow Y rotation, but only if not reduced-motion
        if (!reducedMotionMQ || !reducedMotionMQ.matches) {
          // Skip if user is dragging via OrbitControls (signal: controls active mouse buttons)
          // We approximate with: controls.target distance to camera not changing rapidly
          cubeGroup.rotation.y += 0.003; // ~1° per frame at 60fps → very subtle
        }
      }
    }

    if (controls && !animActive) controls.update();

    // Cycle E.2 + Phase B mobile: pulse JV edges (subtle 0.6s cycle).
    // Skipped on mobile (<768px) for CPU/battery savings, and respects reduced-motion.
    const isMobile = window.innerWidth < 768;
    if (edgesGroup && !isMobile && (!reducedMotionMQ || !reducedMotionMQ.matches)) {
      const t = performance.now() * 0.001;
      const pulseFactor = 0.5 + 0.5 * Math.sin(t * 2 * Math.PI / 0.6); // 0.6s period, 0..1
      edgesGroup.traverse(o => {
        if (!o.material || !o.userData) return;
        if (o.userData.edgeType === 'jv') {
          // JV edges pulse 0.45 → 0.75
          o.material.opacity = 0.45 + 0.30 * pulseFactor;
        }
        // Acquisitions stay at base opacity (no pulse) — already differentiated
      });
    }

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
      updateOrientationIndicator();
      updateFocusBlur();
      updateLabelsVisibility();
      // v4.7: face titles now baked into texture, no HTML callout overlay needed
    }
  }

  // ---- Annotations findings (overlay text) -----------------------------------
  function generateAnnotations() {
    const state = loadState();
    const sel = (state.composition || [])
      .map(c => D3.STARTUPS.find(s => s.code === c.code))
      .filter(Boolean);

    const annotations = [];

    // Universal — markets touched
    const facesTouched = new Set();
    sel.forEach(s => {
      const positions = D4.ACTOR_POSITIONS[s.code] || [];
      positions.forEach(p => facesTouched.add(p.faceId));
    });
    annotations.push({
      level: 'universal',
      priority: 100,
      text: `Five markets superposed — your portfolio touches <strong>${facesTouched.size} of them</strong>.`
    });

    // Conditional rules with priority — higher priority = shown first
    if (sel.find(s => s.code === 'RHM-MM')) {
      annotations.push({
        level: 'conditional',
        priority: 90,
        text: `Rheinmetall holds top position on <strong>three markets</strong> at (3,3) post-DOK-ING acquisition.`
      });
    }
    const uaCount = sel.filter(s => s.country === 'UA').length;
    if (uaCount >= 2) {
      annotations.push({
        level: 'conditional',
        priority: 88,
        text: `Your portfolio captures the <strong>asymmetric learning thesis</strong> — UA mass-deployed combat (${uaCount} positions).`
      });
    }
    if (sel.find(s => s.code === 'ARX-GE')) {
      annotations.push({
        level: 'conditional',
        priority: 85,
        text: `ARX is your <strong>only mid-tier survivor</strong> — most mid-tier European actors disappeared.`
      });
    }
    if (sel.find(s => s.code === 'TEN-TM') && sel.find(s => s.code === 'RHM-MM')) {
      annotations.push({
        level: 'conditional',
        priority: 92,
        text: `Tencore + Rheinmetall = <strong>both ends of the convergence axis</strong>. UA hub + EU consolidator covered.`
      });
    }
    const deCount = sel.filter(s => s.country === 'DE').length;
    if (deCount >= 2) {
      annotations.push({
        level: 'conditional',
        priority: 80,
        text: `You captured the <strong>German convergence hub</strong> — 4 active hubs form Europe's consolidation epicenter.`
      });
    }
    if (sel.length >= 3 && sel.every(s => s.country === 'UA')) {
      annotations.push({
        level: 'conditional',
        priority: 75,
        text: `Bet concentrated on <strong>Cheap & Fast doctrine</strong> — premium markets uncovered.`
      });
    }
    const noFace5 = sel.length >= 3 && !sel.some(s => {
      const positions = D4.ACTOR_POSITIONS[s.code] || [];
      return positions.some(p => p.faceId === 'F5');
    });
    if (noFace5 && facesTouched.size >= 3) {
      annotations.push({
        level: 'conditional',
        priority: 60,
        text: `Your portfolio is <strong>isolated from civil-defense dual-use</strong> — Face 5 not represented.`
      });
    }

    // H3 fix: 5+ additional rules to cover atypical portfolios

    // USA-heavy portfolio (3+ USA actors)
    const usaCount = sel.filter(s => s.country === 'USA').length;
    if (usaCount >= 3) {
      annotations.push({
        level: 'conditional',
        priority: 78,
        text: `Your portfolio leans <strong>USA-heavy</strong> (${usaCount} positions) — bet on autonomy stack maturity (Overland AI, Swarmbotics, etc.).`
      });
    }

    // Mid-tier emerging (LV, PL, CZ countries — 2+ picks)
    const midTierCount = sel.filter(s => ['LV', 'PL', 'CZ', 'EE', 'FI', 'HR'].includes(s.country)).length;
    if (midTierCount >= 2) {
      annotations.push({
        level: 'conditional',
        priority: 70,
        text: `Mid-tier emerging concentration (${midTierCount} picks across Baltic / Central EU) — contrarian bet on regional resilience.`
      });
    }

    // No DE no UA — contrarian view
    if (deCount === 0 && uaCount === 0 && sel.length >= 3) {
      annotations.push({
        level: 'conditional',
        priority: 72,
        text: `<strong>No German hub, no Ukrainian frontline</strong> — your portfolio rejects the dominant European narrative.`
      });
    }

    // EOD/CBRN focused (Face 3 representation)
    const eodFocused = sel.filter(s => {
      const positions = D4.ACTOR_POSITIONS[s.code] || [];
      return positions.some(p => p.faceId === 'F3' && p.role === 'P');
    }).length;
    if (eodFocused >= 2) {
      annotations.push({
        level: 'conditional',
        priority: 68,
        text: `Strong <strong>EOD-Route Clearance exposure</strong> (${eodFocused} primary positions on F3) — bet on a defensive niche with limited competition.`
      });
    }

    // Heritage Primes only (no UA, no startups under €50M)
    const heritageOnly = sel.length >= 3 && sel.every(s => s.fundingScale >= 4);
    if (heritageOnly) {
      annotations.push({
        level: 'conditional',
        priority: 73,
        text: `Portfolio composed exclusively of <strong>heritage Primes</strong> — low risk, low upside, standard defense allocation.`
      });
    }

    // Civil-defense focus (Face 5 dominant)
    const civilFocused = sel.filter(s => {
      const positions = D4.ACTOR_POSITIONS[s.code] || [];
      return positions.some(p => p.faceId === 'F5' && p.role === 'P');
    }).length;
    if (civilFocused >= 2) {
      annotations.push({
        level: 'conditional',
        priority: 70,
        text: `<strong>Civil-defense dual-use bet</strong> — DOK-ING / Shark / Howe & Howe lineage. Less binary thesis than pure combat.`
      });
    }

    // ISR-only (Face 4 primary)
    const isrFocused = sel.filter(s => {
      const positions = D4.ACTOR_POSITIONS[s.code] || [];
      return positions.some(p => p.faceId === 'F4' && p.role === 'P');
    }).length;
    if (isrFocused >= 3 && sel.length >= 3) {
      annotations.push({
        level: 'conditional',
        priority: 65,
        text: `<strong>ISR-heavy bet</strong> (${isrFocused} primary on Face 4) — autonomy + sensors layer rather than kinetic platforms.`
      });
    }

    // Catch-all: if only universal annotation, add a factual descriptor
    if (annotations.length === 1 && sel.length > 0) {
      const countries = [...new Set(sel.map(s => s.country))];
      annotations.push({
        level: 'conditional',
        priority: 50,
        text: `Your portfolio spans <strong>${countries.length} countries</strong> (${countries.join(', ')}) — atypical concentration outside dominant doctrines.`
      });
    }

    // Sort by priority descending, take top 3
    annotations.sort((a, b) => b.priority - a.priority);
    return annotations.slice(0, 3);
  }

  function renderAnnotations() {
    const container = document.getElementById('cube-annotations');
    if (!container) return;
    const annotations = generateAnnotations();
    if (!annotations.length) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = annotations.map((a, i) => `
      <div class="cube-annotation cube-annotation--${a.level}">
        <span class="cube-annotation-num">${String(i + 1).padStart(2, '0')}</span>
        <span class="cube-annotation-text">${a.text}</span>
      </div>
    `).join('');
  }

  // ---- Diagnostic textuel ----------------------------------------------------
  function renderDiagnostic() {
    const container = document.getElementById('cube-diagnostic');
    if (!container) return;

    const state = loadState();
    const sel = (state.composition || [])
      .map(c => D3.STARTUPS.find(s => s.code === c.code))
      .filter(Boolean);

    // Update pick count in deck
    const pickCountEl = document.getElementById('cube-pick-count');
    if (pickCountEl) pickCountEl.textContent = sel.length;

    // ============================================================
    // v5.3 Cycle C.2: Diagnostic STRICTEMENT descriptif (chiffres only)
    // ============================================================
    if (sel.length === 0) {
      container.innerHTML = `
        <div class="cd-eyebrow">Diagnostic</div>
        <p class="cd-empty">No picks yet. Compose your portfolio in Step 3 to see distribution.</p>
      `;
      return;
    }

    // Distribution by face (F1-F5)
    const byFace = {};
    const f1to5 = D4.FACES.filter(f => f.id !== 'F6');
    sel.forEach(s => {
      const positions = D4.ACTOR_POSITIONS[s.code] || [];
      positions.forEach(p => {
        if (p.faceId === 'F6') return;
        if (!byFace[p.faceId]) byFace[p.faceId] = [];
        byFace[p.faceId].push({ name: s.name, role: p.role });
      });
    });

    // F6 partnerships involving picked actors
    const pickedCodes = new Set(sel.map(s => s.code));
    const f6Picks = (D3.PARTNERSHIPS || []).filter(p =>
      p.from !== p.to &&
      (pickedCodes.has(p.from) || pickedCodes.has(p.to))
    );

    const facesTouched = Object.keys(byFace).length;
    const totalFaces = f1to5.length;

    // Convergence exposure: % of picks that are involved in at least one F6 partnership
    const inF6 = sel.filter(s => f6Picks.some(p => p.from === s.code || p.to === s.code)).length;
    const convergencePct = sel.length > 0 ? Math.round((inF6 / sel.length) * 100) : 0;

    // Dataset average convergence (precomputed approximation)
    // 6 partnerships involving ~10 unique actors out of 38 → ~26% average
    const datasetAverage = 26;

    // Doctrine alignment vs stated thesis
    const thesisDoctrine = state.thesis; // 'A', 'B', 'C', 'D', 'E'
    const doctrineCounts = {};
    sel.forEach(s => {
      doctrineCounts[s.doctrine] = (doctrineCounts[s.doctrine] || 0) + 1;
    });
    const dominantDoctrine = Object.keys(doctrineCounts).sort(
      (a, b) => doctrineCounts[b] - doctrineCounts[a]
    )[0];
    const doctrineLabels = {
      A: 'Mass Attritable', B: 'Modular Hybrid', C: 'Premium AI Stack',
      D: 'Ukrainian-EU Hub', E: 'Logistics Specialist'
    };
    const alignedWithThesis = thesisDoctrine && dominantDoctrine === thesisDoctrine;

    // Build face rows
    const faceRows = f1to5.map(f => {
      const picks = byFace[f.id];
      if (!picks || !picks.length) return null;
      const names = picks.map(p => `${p.name} ${p.role}`).join(', ');
      return `<li class="cd-face-row"><span class="cd-face-id">${f.id} ${f.label}</span> : <strong>${picks.length} pick${picks.length > 1 ? 's' : ''}</strong> (${names})</li>`;
    }).filter(Boolean).join('');

    const f6Row = f6Picks.length
      ? `<li class="cd-face-row"><span class="cd-face-id">F6 Convergence</span> : <strong>${f6Picks.length} partnership${f6Picks.length > 1 ? 's' : ''}</strong> involving your picks</li>`
      : '';

    container.innerHTML = `
      <div class="cd-eyebrow">Diagnostic</div>
      <div class="cd-section">
        <div class="cd-section-h">Distribution</div>
        <ul class="cd-face-list">${faceRows}${f6Row}</ul>
      </div>
      <div class="cd-section">
        <div class="cd-stats-grid">
          <div class="cd-stat">
            <span class="cd-stat-k">Coverage</span>
            <span class="cd-stat-v" data-count-up="${facesTouched}">${facesTouched}</span><span class="cd-stat-suffix"> markets out of ${totalFaces}</span>
          </div>
          <div class="cd-stat">
            <span class="cd-stat-k">Convergence exposure</span>
            <span class="cd-stat-v" data-count-up="${convergencePct}">${convergencePct}</span><span class="cd-stat-suffix">% (vs ${datasetAverage}% dataset average)</span>
          </div>
          <div class="cd-stat">
            <span class="cd-stat-k">Doctrine alignment</span>
            <span class="cd-stat-v cd-stat-v--text">${doctrineLabels[dominantDoctrine] || '—'}${thesisDoctrine ? (alignedWithThesis ? ' (matches your stated thesis)' : ' (different from stated thesis: ' + (doctrineLabels[thesisDoctrine] || thesisDoctrine) + ')') : ''}</span>
          </div>
        </div>
      </div>

      <!-- Cycle C.5: Share + CSV CTA post-diagnostic -->
      <div class="cd-cta-row">
        <button class="cd-cta cd-cta--primary" id="cd-share-btn" type="button">↗ Share my portfolio</button>
        <button class="cd-cta cd-cta--secondary" id="cd-csv-btn" type="button">↓ Get dataset (CSV)</button>
      </div>
    `;

    // Wire Share button
    const shareBtn = document.getElementById('cd-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => sharePortfolio(sel, facesTouched, totalFaces, convergencePct, dominantDoctrine, doctrineLabels));
    }
    // Wire CSV CTA post-diag
    const csvBtn = document.getElementById('cd-csv-btn');
    if (csvBtn) {
      csvBtn.addEventListener('click', () => {
        if (window.V53 && typeof window.V53.openCsvModal === 'function') {
          window.V53.openCsvModal();
        }
        if (window.SBTrack) window.SBTrack('tables01', 'csv_cta_post_diagnostic_clicked');
      });
    }
  }


  // ---- v4.3 Camera fly-to face on legend click -------------------------------
  function flyToFace(faceId) {
    const orient = D4.FACE_ORIENTATIONS[faceId];
    if (!orient || !camera) return;

    // Compute target camera position: camera looks at face center from outside
    // Take the face position and extend outward by ~250 units along its normal
    const facePos = new THREE.Vector3(...orient.position);
    const normal = new THREE.Vector3(0, 0, 1);
    normal.applyEuler(new THREE.Euler(...orient.rotation));
    const distance = 150;
    const targetCamPos = facePos.clone().add(normal.multiplyScalar(distance));

    flyToAnim.active = true;
    flyToAnim.start = performance.now();
    flyToAnim.from = camera.position.clone();
    flyToAnim.to = targetCamPos;
    flyToAnim.fromTarget = controls ? controls.target.clone() : new THREE.Vector3(0, 0, 0);
    flyToAnim.toTarget = facePos.clone();

    if (controls) controls.enabled = false;

    if (window.SBTrack) window.SBTrack('tables01', 'cube_face_zoomed', faceId);
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function tickFlyToAnim() {
    if (!flyToAnim.active) return false;
    const elapsed = performance.now() - flyToAnim.start;
    const t = Math.min(elapsed / flyToAnim.duration, 1);
    const eased = easeInOutCubic(t);

    camera.position.lerpVectors(flyToAnim.from, flyToAnim.to, eased);
    if (controls) {
      controls.target.lerpVectors(flyToAnim.fromTarget, flyToAnim.toTarget, eased);
    }
    camera.lookAt(controls ? controls.target : new THREE.Vector3(0, 0, 0));

    if (t >= 1) {
      flyToAnim.active = false;
      if (controls) controls.enabled = true;
      return false;
    }
    return true;
  }

  // ---- v4.3 Exploded view animation ------------------------------------------
  // v4.4 fix: Faces lay flat in XY plane (Z=0). Camera at Z+ for proper top-down view.
  // Cross pattern: F2 center, F1 right, F3 left, F4 above, F5 below
  const EXPLODED_SPACING = 110;
  const EXPLODED_LAYOUT = {
    'F2': { position: [0, 0, 0],                    rotation: [0, 0, 0] },
    'F1': { position: [EXPLODED_SPACING, 0, 0],     rotation: [0, 0, 0] },
    'F3': { position: [-EXPLODED_SPACING, 0, 0],    rotation: [0, 0, 0] },
    'F4': { position: [0, EXPLODED_SPACING, 0],     rotation: [0, 0, 0] },
    'F5': { position: [0, -EXPLODED_SPACING, 0],    rotation: [0, 0, 0] }
  };

  function setExploded(target) {
    if (cubeState.exploded === target) return;
    cubeState.exploded = target;
    cubeState.explodedAnim.active = true;
    cubeState.explodedAnim.start = performance.now();
    cubeState.explodedAnim.from = target ? 0 : 1;
    cubeState.explodedAnim.to   = target ? 1 : 0;

    // Camera moves to see all faces clearly
    flyToAnim.active = true;
    flyToAnim.start = performance.now();
    flyToAnim.duration = 1500;
    flyToAnim.from = camera.position.clone();
    flyToAnim.fromTarget = controls ? controls.target.clone() : new THREE.Vector3(0, 0, 0);
    flyToAnim.toTarget = new THREE.Vector3(0, 0, 0);

    if (target) {
      // Exploded view: front-on view of XY-plane spread (cross pattern)
      // Camera at Z+ looking at origin shows all 5 faces flat
      flyToAnim.to = new THREE.Vector3(0, 0, 290);
    } else {
      // Return to isometric
      flyToAnim.to = new THREE.Vector3(145, 95, 145);
    }
    if (controls) controls.enabled = false;

    // Hide / show partnerships during animation
    if (target && edgesGroup) edgesGroup.visible = false;
    else if (!target && edgesGroup) edgesGroup.visible = cubeState.showPartnerships;

    if (window.SBTrack) window.SBTrack('tables01', 'cube_exploded_view', target ? 'on' : 'off');
  }

  function tickExplodedAnim() {
    const anim = cubeState.explodedAnim;
    if (!anim.active) return false;
    const elapsed = performance.now() - anim.start;
    const t = Math.min(elapsed / anim.duration, 1);
    const eased = easeInOutCubic(t);
    const progress = anim.from + (anim.to - anim.from) * eased;

    // Interpolate each face position/rotation between cube layout and exploded layout
    for (const face of D4.FACES) {
      const fg = faceGroups[face.id];
      if (!fg) continue;
      const cubePos = fg.userData.cubePosition;
      const cubeRot = fg.userData.cubeRotation;
      const explodedPos = EXPLODED_LAYOUT[face.id].position;
      const explodedRot = EXPLODED_LAYOUT[face.id].rotation;
      fg.position.set(
        cubePos[0] + (explodedPos[0] - cubePos[0]) * progress,
        cubePos[1] + (explodedPos[1] - cubePos[1]) * progress,
        cubePos[2] + (explodedPos[2] - cubePos[2]) * progress
      );
      fg.rotation.set(
        cubeRot[0] + (explodedRot[0] - cubeRot[0]) * progress,
        cubeRot[1] + (explodedRot[1] - cubeRot[1]) * progress,
        cubeRot[2] + (explodedRot[2] - cubeRot[2]) * progress
      );
    }

    // Hide cube wireframe in exploded view
    if (cubeGroup) {
      cubeGroup.children.forEach(c => {
        if (c.isLineSegments && c.geometry && c.geometry.type === 'EdgesGeometry') {
          if (c.material) {
            c.material.opacity = (1 - progress) * 0.6;
            c.material.transparent = true;
          }
        }
      });
    }

    if (t >= 1) {
      anim.active = false;
      // Re-show edges if returning to cube
      if (!cubeState.exploded && edgesGroup) edgesGroup.visible = cubeState.showPartnerships;
      return false;
    }
    return true;
  }

  // ---- v4.3 Rebuild dots & edges (called on toggle changes) ------------------
  function rebuildDotsAndEdges() {
    // Remove old dots from face groups
    for (const fid in faceGroups) {
      const fg = faceGroups[fid];
      const toRemove = [];
      fg.traverse(o => {
        if (o.userData && (o.userData.actorCode || o.userData.isLabel || o.userData.isRing)) {
          toRemove.push(o);
        }
      });
      toRemove.forEach(o => {
        if (o.parent) o.parent.remove(o);
        if (o.geometry) o.geometry.dispose();
        if (o.material) {
          if (o.material.map) o.material.map.dispose();
          o.material.dispose();
        }
      });
    }
    if (dotsGroup) {
      scene.remove(dotsGroup);
      dotsGroup.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
    }
    if (edgesGroup) {
      scene.remove(edgesGroup);
      edgesGroup.traverse(o => {
        if (o.geometry) o.geometry.dispose();
        if (o.material) o.material.dispose();
      });
    }
    // v4.9: invalidate position cache since picksOnly may have filtered some actors
    actorWorldPositions = {};
    computeActorWorldPositions(); // single source of truth for both dots and edges
    buildDots();
    buildEdges();
    buildAriaTree(); // Cycle I.1: parallel ARIA tree for screen readers
  }

  // ============================================================
  // Cycle I.1 — Parallel ARIA tree for cube (screen-reader accessibility)
  // Three.js dots are not accessible. We mirror them in an off-screen
  // DOM tree that screen readers can navigate with keyboard.
  // ============================================================
  function buildAriaTree() {
    let tree = document.getElementById('cube-aria-tree');
    if (!tree) {
      tree = document.createElement('div');
      tree.id = 'cube-aria-tree';
      tree.setAttribute('role', 'tree');
      tree.setAttribute('aria-label', 'Cube operators by face — keyboard accessible');
      tree.className = 'sr-only';
      // Append to step 4 article so it lives in main content
      const step4 = document.querySelector('.step-screen[data-step="4"] .article')
                 || document.querySelector('.step-screen[data-step="4"]')
                 || document.body;
      step4.appendChild(tree);
    }
    tree.innerHTML = '';

    const facesNoF6 = (D4.FACES || []).filter(f => f.id !== 'F6');
    for (const face of facesNoF6) {
      const faceGroup = document.createElement('div');
      faceGroup.setAttribute('role', 'treeitem');
      faceGroup.setAttribute('aria-expanded', 'true');
      const faceTitle = document.createElement('div');
      faceTitle.textContent = face.id + ' · ' + (face.label || '') +
        ' — x: ' + ((face.axes && face.axes.x) || '') +
        ', y: ' + ((face.axes && face.axes.y) || '');
      faceGroup.appendChild(faceTitle);

      const subtree = document.createElement('div');
      subtree.setAttribute('role', 'group');

      // List operators on this face
      const onFace = [];
      for (const startup of D3.STARTUPS) {
        const positions = D4.ACTOR_POSITIONS[startup.code] || [];
        for (const pos of positions) {
          if (pos.faceId !== face.id) continue;
          onFace.push({ startup, pos });
        }
      }

      for (const entry of onFace) {
        const item = document.createElement('div');
        item.setAttribute('role', 'treeitem');
        item.setAttribute('tabindex', '0');
        item.setAttribute('data-actor-code', entry.startup.code);
        item.setAttribute('aria-label',
          entry.startup.name + ', ' + entry.startup.country +
          ', ' + (entry.startup.doctrine ? 'doctrine ' + entry.startup.doctrine : '') +
          ', position ' + face.id + ' ' + (face.label || '') +
          ' (cadence ' + entry.pos.x + ', autonomy ' + entry.pos.y + ')' +
          ', ' + (entry.pos.role === 'P' ? 'primary marker' : 'secondary marker'));
        item.textContent = entry.startup.name + ' (' + entry.startup.country + ', ' +
          face.id + ' ' + entry.pos.role + ')';
        // Keyboard activation → fire actorClick like a click on the cube
        item.addEventListener('click', () => {
          try {
            window.dispatchEvent(new CustomEvent('sb:actorClick', {
              detail: {
                actorCode: entry.startup.code,
                actorName: entry.startup.name,
                country: entry.startup.country,
                faceId: face.id,
                role: entry.pos.role,
                isPick: false
              }
            }));
          } catch (e) {}
        });
        item.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            item.click();
          }
        });
        subtree.appendChild(item);
      }

      faceGroup.appendChild(subtree);
      tree.appendChild(faceGroup);
    }
  }

  // ---- v4.3 Wire toggles + clickable legend ----------------------------------
  function wireCubeToggles() {
    // F6 partnerships toggle (default ON)
    const togglePart = document.getElementById('cube-toggle-partnerships');
    if (togglePart) {
      togglePart.classList.toggle('is-active', cubeState.showPartnerships);
      togglePart.setAttribute('aria-pressed', cubeState.showPartnerships ? 'true' : 'false');
      togglePart.addEventListener('click', () => {
        cubeState.showPartnerships = !cubeState.showPartnerships;
        togglePart.classList.toggle('is-active', cubeState.showPartnerships);
        togglePart.setAttribute('aria-pressed', cubeState.showPartnerships ? 'true' : 'false');
        rebuildDotsAndEdges();
      });
    }

    // All labels toggle
    const toggleLabels = document.getElementById('cube-toggle-labels');
    if (toggleLabels) {
      toggleLabels.classList.toggle('is-active', cubeState.showAllLabels);
      toggleLabels.setAttribute('aria-pressed', cubeState.showAllLabels ? 'true' : 'false');
      toggleLabels.addEventListener('click', () => {
        cubeState.showAllLabels = !cubeState.showAllLabels;
        toggleLabels.classList.toggle('is-active', cubeState.showAllLabels);
        toggleLabels.setAttribute('aria-pressed', cubeState.showAllLabels ? 'true' : 'false');
        rebuildDotsAndEdges();
      });
    }

    // Picks only toggle
    const togglePicks = document.getElementById('cube-toggle-picks-only');
    if (togglePicks) {
      togglePicks.classList.toggle('is-active', cubeState.picksOnly);
      togglePicks.setAttribute('aria-pressed', cubeState.picksOnly ? 'true' : 'false');
      togglePicks.addEventListener('click', () => {
        cubeState.picksOnly = !cubeState.picksOnly;
        togglePicks.classList.toggle('is-active', cubeState.picksOnly);
        togglePicks.setAttribute('aria-pressed', cubeState.picksOnly ? 'true' : 'false');
        rebuildDotsAndEdges();
      });
    }

    // v4.4: Morphology toggle
    const toggleMorph = document.getElementById('cube-toggle-morphology');
    const morphSection = document.getElementById('clc-morphology');
    if (toggleMorph) {
      toggleMorph.classList.toggle('is-active', cubeState.morphologyMode);
      toggleMorph.setAttribute('aria-pressed', cubeState.morphologyMode ? 'true' : 'false');
      toggleMorph.addEventListener('click', () => {
        cubeState.morphologyMode = !cubeState.morphologyMode;
        toggleMorph.classList.toggle('is-active', cubeState.morphologyMode);
        toggleMorph.setAttribute('aria-pressed', cubeState.morphologyMode ? 'true' : 'false');
        if (morphSection) morphSection.hidden = !cubeState.morphologyMode;
        rebuildDotsAndEdges();
      });
    }

    // Exploded view toggle
    const toggleExpl = document.getElementById('cube-toggle-exploded');
    if (toggleExpl) {
      toggleExpl.classList.toggle('is-active', cubeState.exploded);
      toggleExpl.setAttribute('aria-pressed', cubeState.exploded ? 'true' : 'false');
      toggleExpl.addEventListener('click', () => {
        const newState = !cubeState.exploded;
        toggleExpl.classList.toggle('is-active', newState);
        toggleExpl.setAttribute('aria-pressed', newState ? 'true' : 'false');
        setExploded(newState);
      });
    }

    // Clickable legend → fly to face
    document.querySelectorAll('.cube-legend-row.is-clickable').forEach(btn => {
      btn.addEventListener('click', () => {
        const faceId = btn.dataset.face;
        if (faceId) flyToFace(faceId);
      });
    });
  }

  // ---- Init ------------------------------------------------------------------
  function init() {
    const container = document.getElementById('cube-canvas');
    if (!container) {
      console.error('[step4] cube-canvas container not found');
      return;
    }
    // C3 fix: graceful WebGL fallback
    if (!isWebGLAvailable()) {
      showWebGLFallback(container);
      // Also hide annotations and diagnostic since they depend on cube context
      const ann = document.getElementById('cube-annotations');
      if (ann) ann.style.display = 'none';
      return;
    }
    initScene(container);
    renderAnnotations();
    renderDiagnostic();
    wireCubeToggles();
  }

  // ============================================================
  // v5.3 PUBLIC API — exposed on window.SBStep4Cube
  // Used by v53-mode-router for filters and selection from Explore panels.
  // ============================================================
  function setFilters(filters) {
    // filters = { doctrine: [], country: [], search: '' }
    if (!dotsGroup) return;
    const dArr = filters.doctrine || [];
    const cArr = filters.country || [];
    const search = (filters.search || '').toLowerCase().trim();
    const noFilters = dArr.length === 0 && cArr.length === 0 && !search;

    // Build code → {doctrine, country, name} lookup once
    // Cycle B+: labels don't carry country/actorName directly, so we resolve via D3.STARTUPS
    const codeToInfo = {};
    if (D3 && D3.STARTUPS) {
      for (const s of D3.STARTUPS) {
        codeToInfo[s.code] = { doctrine: s.doctrine, country: s.country, name: s.name };
      }
    }

    dotsGroup.traverse(o => {
      if (!o.material) return;
      // We modify dots, rings, AND labels — anything tagged with actorCode
      const ud = o.userData || {};
      if (!ud.actorCode && !ud.isRing && !ud.isLabel) return;
      const code = ud.actorCode || (o.parent && o.parent.userData && o.parent.userData.actorCode);
      if (!code) return;

      const info = codeToInfo[code] || {};

      let matches = true;
      if (!noFilters) {
        const matchDoctrine = dArr.length === 0 || dArr.includes(info.doctrine);
        // Country: prefer userData.country (dots/rings have it), fall back to lookup (for labels)
        const country = ud.country || info.country;
        const matchCountry = cArr.length === 0 || (country && cArr.includes(country));
        // Search: prefer userData.actorName, fall back to lookup (for labels)
        const name = ((ud.actorName || info.name) || '').toLowerCase();
        const matchSearch = !search ||
          (name && name.indexOf(search) !== -1) ||
          (code.toLowerCase().indexOf(search) !== -1);
        matches = matchDoctrine && matchCountry && matchSearch;
      }

      // Apply opacity
      if (matches) {
        // Labels keep their managed opacity (set by updateLabelsVisibility)
        if (ud.isLabel) {
          // Don't override label opacity — let updateLabelsVisibility handle it
          o.material.transparent = true;
        } else {
          o.material.opacity = 1;
          if (!o.material.transparent) o.material.transparent = false;
        }
      } else {
        if (!o.material.transparent) o.material.transparent = true;
        o.material.opacity = 0.08;
      }
      o.material.needsUpdate = true;
    });
  }

  // Expose public API
  window.SBStep4Cube = {
    setFilters: setFilters,
    rebuild: function() {
      if (typeof rebuildDotsAndEdges === 'function') rebuildDotsAndEdges();
    },
    getDotsGroup: function() { return dotsGroup; }
  };

  // Listen to SPA event for entering Step 4
  window.addEventListener('sb:step', (e) => {
    if (e.detail && e.detail.step === 4) {
      // Defer one tick to let DOM update
      setTimeout(() => {
        if (!scene) {
          init();
        } else {
          // Re-render dots & edges (portfolio may have changed) using v4.3 helper
          rebuildDotsAndEdges();
          renderAnnotations();
          renderDiagnostic();
          onResize();
        }
      }, 50);
    }
  });

  // Also support standalone init (if loaded on its own page)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // Only init if cube-canvas is visible (Step 4 active)
      const container = document.getElementById('cube-canvas');
      if (container && container.offsetParent !== null) {
        init();
      }
    });
  }
})();
