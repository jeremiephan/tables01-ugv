/* ============================================================
   Starburst Tables 01 · UGV · Step 5 — Free exploration
   ============================================================
   Independent Three.js scene from Step 4 (different container,
   different camera position). Reuses step4-data.js for FACES
   and ACTOR_POSITIONS. Adds: filters, portfolio sticky panel,
   3 CTAs (Book call / Newsletter / Share LinkedIn).
   ============================================================ */

(function () {

  const D3 = window.STEP3_DATA;
  const D4 = window.STEP4_DATA;
  if (!D3 || !D4) {
    console.error('[step5] STEP3_DATA or STEP4_DATA missing');
    return;
  }
  if (!window.THREE) {
    console.error('[step5] Three.js not loaded');
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
      if (window.__SPA_S3_STORE__ && window.__SPA_S3_STORE__[STATE_KEY]) {
        return JSON.parse(window.__SPA_S3_STORE__[STATE_KEY]);
      }
      const raw = sessionStorage.getItem(STATE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('[step5] loadState failed:', e);
    }
    return { profile: 'VC-D', thesis: 'B', composition: [] };
  }

  function isUserPick(actorCode) {
    const state = loadState();
    return (state.composition || []).some(c => c.code === actorCode);
  }

  // Filter state (local to Step 5)
  const filters = {
    face: 'all',
    role: 'all',
    view: 'all'
  };

  // Color constants (reuse Step 4)
  const COL = {
    background: '#0d1220',
    cubeFrame: '#1a2336',
    pickGlow: '#f4d9a8',
    pickRing: '#e8c441',
    edgeJV: '#e8c441',
    edgeAcq: '#a0a8bc'
  };

  let scene, camera, renderer, controls;
  let cubeGroup, dotsGroup, edgesGroup;
  let raycaster, mouse;
  let hoveredDot = null;
  let canvasContainer = null;
  let initialized = false;

  // ---- Three.js scene setup --------------------------------------------------
  function initScene(container) {
    canvasContainer = container;
    const w = container.clientWidth;
    const h = container.clientHeight || 600;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(COL.background);

    // Camera: more pulled-back than Step 4 to allow free exploration
    camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 1000);
    camera.position.set(220, 150, 220);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    container.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);
    const directional = new THREE.DirectionalLight(0xffffff, 0.4);
    directional.position.set(120, 150, 100);
    scene.add(directional);

    if (THREE.OrbitControls) {
      controls = new THREE.OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.rotateSpeed = 0.5;
      controls.zoomSpeed = 0.8;
      controls.minDistance = 80;
      controls.maxDistance = 500;
      controls.enablePan = false;
      controls.target.set(0, 0, 0);
    }

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    buildCube();
    buildDots();
    buildEdges();

    renderer.domElement.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', onResize);

    initialized = true;
    animate();
  }

  // ---- Build cube + faces (reuse Step 4 logic) -------------------------------
  function buildCube() {
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    const size = D4.CUBE.size;

    const cubeGeom = new THREE.BoxGeometry(size, size, size);
    const cubeEdges = new THREE.EdgesGeometry(cubeGeom);
    const cubeFrame = new THREE.LineSegments(
      cubeEdges,
      new THREE.LineBasicMaterial({ color: COL.cubeFrame, linewidth: 1 })
    );
    cubeGroup.add(cubeFrame);

    for (const face of D4.FACES) {
      const orient = D4.FACE_ORIENTATIONS[face.id];
      if (!orient) continue;

      const faceGroup = new THREE.Group();
      faceGroup.position.set(...orient.position);
      faceGroup.rotation.set(...orient.rotation);
      faceGroup.userData.faceId = face.id;

      const planeGeom = new THREE.PlaneGeometry(size - 0.5, size - 0.5);
      const planeMat = new THREE.MeshBasicMaterial({
        color: face.color,
        transparent: true,
        opacity: 0.10,
        side: THREE.DoubleSide
      });
      const plane = new THREE.Mesh(planeGeom, planeMat);
      plane.position.z = -0.05;
      plane.userData.faceId = face.id;
      plane.userData.isFacePlane = true;
      faceGroup.add(plane);

      const frameGeom = new THREE.EdgesGeometry(planeGeom);
      const frame = new THREE.LineSegments(
        frameGeom,
        new THREE.LineBasicMaterial({ color: face.color, transparent: true, opacity: 0.5 })
      );
      faceGroup.add(frame);

      // Axes
      const axisMat = new THREE.LineBasicMaterial({ color: '#2a3550', transparent: true, opacity: 0.3 });
      for (let i = 1; i <= 3; i++) {
        const local = D4.faceLocalCoords(i, 1);
        const localTop = D4.faceLocalCoords(i, 3);
        const vGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(local.u, local.v, 0.1),
          new THREE.Vector3(localTop.u, localTop.v, 0.1)
        ]);
        faceGroup.add(new THREE.Line(vGeom, axisMat));
        const local2 = D4.faceLocalCoords(1, i);
        const localR = D4.faceLocalCoords(3, i);
        const hGeom = new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(local2.u, local2.v, 0.1),
          new THREE.Vector3(localR.u, localR.v, 0.1)
        ]);
        faceGroup.add(new THREE.Line(hGeom, axisMat));
      }

      // C2 fix: axes labels
      const xAxisLabel = makeTextSprite('CADENCE →', {
        fontSize: 11, color: '#6b7489', fontWeight: '600'
      });
      xAxisLabel.position.set(0, -D4.CUBE.size / 2 + 4, 0.2);
      xAxisLabel.scale.set(28, 4, 1);
      faceGroup.add(xAxisLabel);

      // Y-axis label rotated via canvas
      const yCanvas = document.createElement('canvas');
      yCanvas.width = 256; yCanvas.height = 64;
      const yCtx = yCanvas.getContext('2d');
      yCtx.font = "600 11px 'JetBrains Mono', monospace";
      yCtx.fillStyle = '#6b7489';
      yCtx.textAlign = 'center';
      yCtx.textBaseline = 'middle';
      yCtx.translate(yCanvas.width / 2, yCanvas.height / 2);
      yCtx.rotate(-Math.PI / 2);
      yCtx.fillText('↑ AUTONOMY', 0, 0);
      const yTexture = new THREE.CanvasTexture(yCanvas);
      yTexture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
      const yMat = new THREE.SpriteMaterial({ map: yTexture, transparent: true });
      const yLabelSprite = new THREE.Sprite(yMat);
      yLabelSprite.position.set(-D4.CUBE.size / 2 + 5, 0, 0.2);
      yLabelSprite.scale.set(4, 28, 1);
      faceGroup.add(yLabelSprite);

      // Tick numbers
      for (let t = 1; t <= 3; t++) {
        const localBottom = D4.faceLocalCoords(t, 1);
        const tickX = makeTextSprite(String(t), {
          fontSize: 10, color: '#4a5366', fontWeight: '500'
        });
        tickX.position.set(localBottom.u, -D4.CUBE.size / 2 + 12, 0.15);
        tickX.scale.set(3, 3, 1);
        faceGroup.add(tickX);

        const localLeft = D4.faceLocalCoords(1, t);
        const tickY = makeTextSprite(String(t), {
          fontSize: 10, color: '#4a5366', fontWeight: '500'
        });
        tickY.position.set(-D4.CUBE.size / 2 + 12, localLeft.v, 0.15);
        tickY.scale.set(3, 3, 1);
        faceGroup.add(tickY);
      }

      // Face label sprite
      const labelSprite = makeTextSprite(face.label.toUpperCase(), {
        fontSize: 22,
        color: face.color,
        fontWeight: '600'
      });
      labelSprite.position.set(0, size / 2 - 12, 0.2);
      labelSprite.scale.set(40, 8, 1);
      faceGroup.add(labelSprite);

      const idSprite = makeTextSprite(face.id, {
        fontSize: 14,
        color: '#a0a8bc',
        fontWeight: '600'
      });
      idSprite.position.set(-size / 2 + 8, size / 2 - 8, 0.2);
      idSprite.scale.set(12, 5, 1);
      faceGroup.add(idSprite);

      cubeGroup.add(faceGroup);
    }
  }

  // ---- Build dots ------------------------------------------------------------
  function buildDots() {
    dotsGroup = new THREE.Group();
    scene.add(dotsGroup);

    for (const startup of D3.STARTUPS) {
      const positions = D4.ACTOR_POSITIONS[startup.code];
      if (!positions) continue;

      const isPick = isUserPick(startup.code);
      const countryColor = D3.COUNTRY_COLORS[startup.country] || '#a0a8bc';

      for (const pos of positions) {
        // Apply filters
        if (filters.face !== 'all' && pos.faceId !== filters.face) continue;
        if (filters.role !== 'all' && pos.role !== filters.role) continue;
        if (filters.view === 'picks' && !isPick) continue;

        const orient = D4.FACE_ORIENTATIONS[pos.faceId];
        if (!orient) continue;

        const local = D4.faceLocalCoords(pos.x, pos.y);
        const radius = pos.role === 'P' ? D4.CUBE.dotRadius : D4.CUBE.dotRadiusSecondary;

        const dotGeom = new THREE.SphereGeometry(radius, 16, 12);
        const dotColor = isPick ? COL.pickGlow : countryColor;
        const dotMat = new THREE.MeshBasicMaterial({
          color: dotColor,
          transparent: true,
          opacity: pos.role === 'P' ? 1.0 : 0.7
        });
        const dot = new THREE.Mesh(dotGeom, dotMat);

        const dotGroup = new THREE.Group();
        dotGroup.position.set(...orient.position);
        dotGroup.rotation.set(...orient.rotation);
        dot.position.set(local.u, local.v, 1.0);
        dot.userData = {
          actorCode: startup.code,
          actorName: startup.name,
          country: startup.country,
          faceId: pos.faceId,
          role: pos.role,
          x: pos.x,
          y: pos.y,
          isPick: isPick
        };
        dotGroup.add(dot);

        if (isPick) {
          const ringGeom = new THREE.RingGeometry(radius + 0.4, radius + 0.9, 24);
          const ringMat = new THREE.MeshBasicMaterial({
            color: COL.pickRing,
            transparent: true,
            opacity: 0.6,
            side: THREE.DoubleSide
          });
          const ring = new THREE.Mesh(ringGeom, ringMat);
          ring.position.set(local.u, local.v, 1.05);
          dotGroup.add(ring);
        }

        dotsGroup.add(dotGroup);
      }
    }
  }

  function buildEdges() {
    edgesGroup = new THREE.Group();
    scene.add(edgesGroup);

    if (!D3.PARTNERSHIPS) return;
    if (filters.view === 'picks') return; // hide edges in "picks only" view

    for (const p of D3.PARTNERSHIPS) {
      if (p.from === p.to) continue;

      const fromPos = getFirstPrimaryPosition(p.from);
      const toPos = getFirstPrimaryPosition(p.to);
      if (!fromPos || !toPos) continue;

      // Skip if neither endpoint matches face filter
      if (filters.face !== 'all' && fromPos.faceId !== filters.face && toPos.faceId !== filters.face) {
        continue;
      }

      const edgeColor = p.type === 'jv' || p.type === 'jv-extern' ? COL.edgeJV : COL.edgeAcq;
      const points = [fromPos.world, toPos.world];
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineDashedMaterial({
        color: edgeColor,
        dashSize: 2,
        gapSize: 1.5,
        transparent: true,
        opacity: 0.4
      });
      const line = new THREE.Line(geom, mat);
      line.computeLineDistances();
      edgesGroup.add(line);
    }
  }

  function getFirstPrimaryPosition(actorCode) {
    const positions = D4.ACTOR_POSITIONS[actorCode];
    if (!positions || !positions.length) return null;
    const primary = positions.find(p => p.role === 'P') || positions[0];
    const orient = D4.FACE_ORIENTATIONS[primary.faceId];
    if (!orient) return null;
    const local = D4.faceLocalCoords(primary.x, primary.y);
    const localVec = new THREE.Vector3(local.u, local.v, 1.0);
    const m = new THREE.Matrix4();
    m.makeRotationFromEuler(new THREE.Euler(...orient.rotation));
    localVec.applyMatrix4(m);
    localVec.add(new THREE.Vector3(...orient.position));
    return { world: localVec, faceId: primary.faceId };
  }

  function makeTextSprite(text, opts) {
    opts = opts || {};
    const fontSize = opts.fontSize || 16;
    const color = opts.color || '#a0a8bc';
    const fontWeight = opts.fontWeight || '500';
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = `${fontWeight} ${fontSize}px 'JetBrains Mono', monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
    const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    return new THREE.Sprite(mat);
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
    const intersects = [];
    dotsGroup.traverse(obj => {
      if (obj.isMesh && obj.userData.actorCode) {
        const hits = raycaster.intersectObject(obj, false);
        if (hits.length) intersects.push(hits[0]);
      }
    });
    intersects.sort((a, b) => a.distance - b.distance);

    const tooltip = document.getElementById('step5-cube-tooltip');
    if (intersects.length > 0) {
      const hit = intersects[0];
      const ud = hit.object.userData;
      hoveredDot = hit.object;
      renderer.domElement.style.cursor = 'pointer';
      if (tooltip) {
        const face = D4.FACES.find(f => f.id === ud.faceId);
        // Find the full startup info for raised/round
        const startup = D3.STARTUPS.find(s => s.code === ud.actorCode);
        const meta = startup ? `<div class="ct-row">${startup.raised || '—'} · ${startup.round || ''}</div>` : '';
        tooltip.innerHTML =
          `<div class="ct-eyebrow">${ud.actorCode} · ${ud.country}${ud.isPick ? ' · <span style="color:#f4d9a8">YOUR PICK</span>' : ''}</div>` +
          `<div class="ct-name">${ud.actorName}</div>` +
          `<div class="ct-row">${face ? face.label : ud.faceId} · ${ud.role === 'P' ? 'Primary' : 'Secondary'} · cadence ${ud.x} × autonomy ${ud.y}</div>` +
          meta;
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

  function onResize() {
    if (!canvasContainer || !renderer || !camera) return;
    const w = canvasContainer.clientWidth;
    const h = canvasContainer.clientHeight || 600;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  // ---- H1 fix: orientation indicator -----------------------------------------
  function updateOrientationIndicator() {
    const indicator = document.getElementById('step5-cube-orientation');
    if (!indicator || !camera) return;

    let bestFaceId = null;
    let bestDot = -Infinity;
    const camPos = camera.position.clone().normalize();

    for (const face of D4.FACES) {
      const orient = D4.FACE_ORIENTATIONS[face.id];
      if (!orient) continue;
      const normal = new THREE.Vector3(0, 0, 1);
      normal.applyEuler(new THREE.Euler(...orient.rotation));
      const dot = normal.dot(camPos);
      if (dot > bestDot) {
        bestDot = dot;
        bestFaceId = face.id;
      }
    }

    if (bestFaceId) {
      const face = D4.FACES.find(f => f.id === bestFaceId);
      if (face) {
        indicator.innerHTML = `
          <span class="co-eyebrow">Front</span>
          <span class="co-face" style="color:${face.color}">${face.id} · ${face.label}</span>
        `;
      }
    }
  }

  function animate() {
    requestAnimationFrame(animate);
    if (controls) controls.update();
    if (renderer && scene && camera) {
      renderer.render(scene, camera);
      updateOrientationIndicator();
    }
  }

  // ---- Filters ---------------------------------------------------------------
  function rebuildDotsAndEdges() {
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
    buildDots();
    buildEdges();
  }

  function wireFilters() {
    document.querySelectorAll('[data-filter-group]').forEach(group => {
      const groupName = group.dataset.filterGroup;
      group.querySelectorAll('.s5p-filter').forEach(btn => {
        btn.addEventListener('click', () => {
          const filterValue = btn.dataset.filter;
          // Update active state
          group.querySelectorAll('.s5p-filter').forEach(b => b.classList.remove('is-active'));
          btn.classList.add('is-active');
          filters[groupName] = filterValue;
          rebuildDotsAndEdges();
        });
      });
    });
  }

  // ---- Portfolio panel rendering ---------------------------------------------
  function renderPortfolioPanel() {
    const state = loadState();
    const sel = (state.composition || [])
      .map(c => {
        const s = D3.STARTUPS.find(x => x.code === c.code);
        return s ? Object.assign({}, s, { amount: c.amount }) : null;
      })
      .filter(Boolean);

    // Summary
    const summaryEl = document.getElementById('step5-portfolio-summary');
    if (summaryEl) {
      summaryEl.textContent = sel.length === 0
        ? 'No picks yet'
        : `${sel.length} pick${sel.length > 1 ? 's' : ''} composed`;
    }

    // List
    const listEl = document.getElementById('step5-portfolio-list');
    if (listEl) {
      if (sel.length === 0) {
        listEl.innerHTML = '<div class="s5p-empty">Compose your portfolio in Step 3 to see your picks here.</div>';
      } else {
        const total = sel.reduce((a, b) => a + b.amount, 0);
        listEl.innerHTML = sel.map(s => {
          const cColor = D3.COUNTRY_COLORS[s.country] || '#a0a8bc';
          return `
            <div class="s5p-pick-row" data-code="${s.code}">
              <span class="s5p-pick-dot" style="background:${cColor}"></span>
              <div class="s5p-pick-info">
                <div class="s5p-pick-name">${s.name}</div>
                <div class="s5p-pick-meta">${s.code} · ${s.country} · €${s.amount}M</div>
              </div>
            </div>
          `;
        }).join('') + `
          <div class="s5p-pick-total">
            <span>Total committed</span>
            <span class="s5p-pick-total-v">€${total}M</span>
          </div>
        `;
      }
    }

    // Country mix
    const mixEl = document.getElementById('step5-country-mix');
    if (mixEl) {
      if (sel.length === 0) {
        mixEl.innerHTML = '<div class="s5p-empty-mini">—</div>';
      } else {
        const total = sel.reduce((a, b) => a + b.amount, 0) || 1;
        const byCountry = {};
        sel.forEach(s => {
          byCountry[s.country] = (byCountry[s.country] || 0) + s.amount;
        });
        const sorted = Object.keys(byCountry).sort((a, b) => byCountry[b] - byCountry[a]);
        mixEl.innerHTML = sorted.map(c => {
          const p = (byCountry[c] / total) * 100;
          return `
            <div class="s5p-mix-row">
              <span class="s5p-mix-k">${c}</span>
              <span class="s5p-mix-bar"><span class="s5p-mix-fill" style="width:${p.toFixed(1)}%; background:${D3.COUNTRY_COLORS[c]}"></span></span>
              <span class="s5p-mix-v">${Math.round(p)}%</span>
            </div>
          `;
        }).join('');
      }
    }

    // Coverage
    const coverageEl = document.getElementById('step5-coverage');
    if (coverageEl) {
      if (sel.length === 0) {
        coverageEl.innerHTML = '<div class="s5p-empty-mini">—</div>';
      } else {
        const facesTouched = new Set();
        sel.forEach(s => {
          const positions = D4.ACTOR_POSITIONS[s.code] || [];
          positions.forEach(p => facesTouched.add(p.faceId));
        });
        const facesArr = D4.FACES.map(f => ({
          id: f.id,
          label: f.shortLabel,
          color: f.color,
          touched: facesTouched.has(f.id)
        }));
        coverageEl.innerHTML = facesArr.map(f => `
          <div class="s5p-cov-row${f.touched ? ' is-touched' : ''}">
            <span class="s5p-cov-dot" style="background:${f.touched ? f.color : 'transparent'}; border-color:${f.color}"></span>
            <span class="s5p-cov-id">${f.id}</span>
            <span class="s5p-cov-label">${f.label}</span>
          </div>
        `).join('');
      }
    }
  }

  // ---- CTAs handlers ---------------------------------------------------------
  function track(action, name, value) {
    if (window.SBTrack) window.SBTrack('tables01', action, name, value);
  }

  function wireCTAs() {
    // Primary: Book a call → Calendly link, opens in new tab
    const bookCall = document.getElementById('cta-book-call');
    if (bookCall) {
      bookCall.addEventListener('click', () => {
        const state = loadState();
        const thesisLabel = state.thesis ? D3.THESES[state.thesis].label : 'unknown';
        track('cta_book_call_clicked', thesisLabel, (state.composition || []).length);
        console.log('[step5] CTA book call clicked');
      });
    }

    // Secondary: Newsletter modal
    const newsletter = document.getElementById('cta-newsletter');
    const modal = document.getElementById('newsletter-modal');
    const modalClose = modal ? modal.querySelector('.step5-modal-close') : null;
    const modalBackdrop = modal ? modal.querySelector('.step5-modal-backdrop') : null;
    const newsletterForm = document.getElementById('newsletter-form');

    function openModal() {
      if (modal) {
        modal.setAttribute('aria-hidden', 'false');
        modal.classList.add('is-visible');
      }
    }
    function closeModal() {
      if (modal) {
        modal.setAttribute('aria-hidden', 'true');
        modal.classList.remove('is-visible');
      }
    }

    if (newsletter) newsletter.addEventListener('click', openModal);
    if (modalClose) modalClose.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);

    if (newsletterForm) {
      newsletterForm.addEventListener('submit', async (evt) => {
        evt.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        const submitBtn = newsletterForm.querySelector('.s5m-submit');
        const email = emailInput ? emailInput.value.trim() : '';
        if (!email) return;

        // Disable button during submission
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = 'Submitting…';
        }

        // ===== PRODUCTION ENDPOINT =====
        // Configure window.SB_NEWSLETTER_ENDPOINT in <head> before deployment
        // Example for Brevo (recommended):
        //   window.SB_NEWSLETTER_ENDPOINT = 'https://api.brevo.com/v3/contacts';
        //   window.SB_NEWSLETTER_API_KEY  = 'xkeysib-...'; (set via env)
        //   window.SB_NEWSLETTER_LIST_ID  = 7; (Tables 02-03 list)
        //
        // For Mailchimp / Hubspot, adjust payload accordingly.
        // For zero-backend MVP: send to a Google Form URL via fetch (form keys = entry.XXX).
        // ================================
        const endpoint = window.SB_NEWSLETTER_ENDPOINT;
        const apiKey   = window.SB_NEWSLETTER_API_KEY;
        const listId   = window.SB_NEWSLETTER_LIST_ID || 1;

        let success = false;
        if (endpoint) {
          try {
            const headers = { 'Content-Type': 'application/json', 'Accept': 'application/json' };
            if (apiKey) headers['api-key'] = apiKey;
            const response = await fetch(endpoint, {
              method: 'POST',
              headers,
              body: JSON.stringify({
                email,
                listIds: [listId],
                attributes: { SOURCE: 'tables01_ugv', SUBSCRIBED_AT: new Date().toISOString() },
                updateEnabled: true
              })
            });
            success = response.ok || response.status === 204;
          } catch (e) {
            console.error('[step5] newsletter POST failed:', e);
            success = false;
          }
        } else {
          // No endpoint configured — log only (dev/staging mode)
          console.warn('[step5] SB_NEWSLETTER_ENDPOINT not configured. Email logged client-side only:', email);
          success = true; // fallback success for dev mode
        }

        if (success) {
          const successEl = document.getElementById('newsletter-success');
          if (successEl) successEl.hidden = false;
          if (newsletterForm) newsletterForm.style.display = 'none';
          track('newsletter_signup');
          setTimeout(closeModal, 2200);
        } else {
          // Show error
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Try again →';
          }
          const errEl = newsletterForm.querySelector('.s5m-error');
          if (!errEl) {
            const err = document.createElement('div');
            err.className = 's5m-error';
            err.textContent = 'Submission failed. Please try again or email us directly.';
            newsletterForm.appendChild(err);
          }
        }
      });
    }

    // Tertiary: LinkedIn share
    const share = document.getElementById('cta-share');
    if (share) {
      share.addEventListener('click', () => {
        const state = loadState();
        const thesis = D3.THESES[state.thesis];

        const baseUrl = window.location.origin + window.location.pathname;
        const sampleParam = thesis ? `?sample=${thesis.label.toLowerCase().replace(/\s+/g, '-')}` : '';
        const shareUrl = baseUrl + sampleParam;

        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedinUrl, '_blank', 'noopener');
        console.log('[step5] LinkedIn share opened:', shareUrl);
        track('linkedin_share_clicked', thesis ? thesis.label : 'unknown');
      });
    }
  }

  // ---- Init ------------------------------------------------------------------
  function init() {
    const container = document.getElementById('step5-cube-canvas');
    if (!container) {
      console.error('[step5] step5-cube-canvas container not found');
      return;
    }
    // C3 fix: WebGL fallback
    if (!isWebGLAvailable()) {
      showWebGLFallback(container);
      // Still wire CTAs and portfolio panel — they don't depend on WebGL
      renderPortfolioPanel();
      wireCTAs();
      return;
    }
    if (!initialized) {
      initScene(container);
    }
    renderPortfolioPanel();
    wireFilters();
    wireCTAs();
  }

  // Listen for SPA event entering Step 5
  window.addEventListener('sb:step', (e) => {
    if (e.detail && e.detail.step === 5) {
      setTimeout(() => {
        if (!initialized) {
          init();
        } else {
          // Re-render dots & portfolio (state may have changed)
          rebuildDotsAndEdges();
          renderPortfolioPanel();
          onResize();
        }
      }, 50);
    }
  });

  // Also handle direct entry (e.g., URL param ?sample=)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const container = document.getElementById('step5-cube-canvas');
      if (container && container.offsetParent !== null) {
        init();
      }
    });
  }
})();
