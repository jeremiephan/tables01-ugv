/* ============================================================
 * Tables 01 · UGV — Explore 2D mode (small multiples)
 * Renders 5 cadence × autonomy grids (F1..F5) + F6 convergence row.
 * Cycle B.2 deliverable.
 * ============================================================ */
(function () {
  'use strict';

  const D3 = window.STEP3_DATA;
  const D4 = window.STEP4_DATA;
  if (!D3 || !D4) {
    console.warn('[explore-2d] data not loaded');
    return;
  }

  // ============================================================
  // Country palette (matches cube convention)
  // ============================================================
  const COUNTRY_COLORS = {
    UA: '#e8c441', // signal yellow (Ukraine = hub)
    DE: '#5a8fd4', // blue
    FR: '#a55c4f', // terracotta
    USA: '#7a8aa3', // grey-blue
    UK: '#b09262', // ochre
    IL: '#5e8a6e', // sage
    EE: '#6c7faa',
    LV: '#8a9bbc',
    FI: '#92a3c5',
    PL: '#c69b56',
    CZ: '#9c7a4f',
    HR: '#7a4f5e',
    IT: '#b07a5e',
    ES: '#9a8568'
  };

  let isBuilt = false;
  let lastFilters = { doctrine: [], country: [], search: '' };

  // ============================================================
  // Build: render 5 SVG grids + F6 row
  // ============================================================
  function build() {
    const gridsContainer = document.getElementById('v53-2d-grids');
    const f6Container = document.getElementById('v53-2d-f6');
    if (!gridsContainer || !f6Container) {
      console.warn('[explore-2d] container not found');
      return;
    }

    gridsContainer.innerHTML = '';
    f6Container.innerHTML = '';

    // Render 5 grids
    const f1to5 = (D4.FACES || []).filter(f => f.id !== 'F6');
    for (const face of f1to5) {
      gridsContainer.appendChild(buildGrid(face));
    }

    // Render F6 row
    f6Container.appendChild(buildF6Row());

    isBuilt = true;
  }

  function buildGrid(face) {
    const wrap = document.createElement('div');
    wrap.className = 'v53-2d-grid';
    wrap.setAttribute('data-face', face.id);

    // Head
    const head = document.createElement('div');
    head.className = 'v53-2d-grid-head';
    head.innerHTML = `
      <div class="v53-2d-grid-eyebrow">${face.id}</div>
      <div class="v53-2d-grid-title">${escapeHtml(face.label || face.id)}</div>
      <div class="v53-2d-grid-axis">y · ${escapeHtml((face.axes && face.axes.y) || '')}</div>
      <div class="v53-2d-grid-axis">x · ${escapeHtml((face.axes && face.axes.x) || '')}</div>
    `;
    wrap.appendChild(head);

    // SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'v53-2d-svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // Grid cells (3×3 — coordinates 1-3)
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        rect.setAttribute('class', 'v53-2d-cell');
        rect.setAttribute('x', i * 33);
        rect.setAttribute('y', j * 33);
        rect.setAttribute('width', 33);
        rect.setAttribute('height', 33);
        svg.appendChild(rect);
      }
    }

    // Axis labels (xLow / xHigh / yLow / yHigh)
    const axes = face.axes || {};
    addAxisText(svg, 2, 97, axes.xLow || 'LOW', 'start');
    addAxisText(svg, 98, 97, axes.xHigh || 'HIGH', 'end');
    addAxisText(svg, 2, 5, axes.yHigh || 'HIGH', 'start');
    addAxisText(svg, 2, 95, axes.yLow || 'LOW', 'start');

    // Plot dots — collect all positions on this face
    const dotsByCell = {}; // "x-y" → [{ code, role }]
    for (const startup of D3.STARTUPS) {
      const positions = D4.ACTOR_POSITIONS[startup.code] || [];
      for (const pos of positions) {
        if (pos.faceId !== face.id) continue;
        const key = `${pos.x}-${pos.y}`;
        if (!dotsByCell[key]) dotsByCell[key] = [];
        dotsByCell[key].push({ code: startup.code, role: pos.role, country: startup.country, name: startup.name });
      }
    }

    for (const key in dotsByCell) {
      const [x, y] = key.split('-').map(Number);
      const list = dotsByCell[key];
      // Position cell center: x is 1-3 → cellCenter = (x-0.5) * 33 → 16.5, 49.5, 82.5
      // y is 1-3 with 1=bottom 3=top in cube → invert for SVG (1=bottom row → y=82.5, 3=top row → y=16.5)
      const cellCenterX = (x - 0.5) * 33;
      const cellCenterY = (3.5 - y) * 33;

      // Spread dots within cell
      const total = list.length;
      list.forEach((entry, idx) => {
        const offset = getOffsetWithinCell(idx, total);
        const cx = cellCenterX + offset[0];
        const cy = cellCenterY + offset[1];

        const dot = document.createElementNS('http://www.w3.org/2000/svg',
          entry.role === 'P' ? 'circle' : 'circle');
        dot.setAttribute('class', 'v53-2d-dot');
        dot.setAttribute('data-actor', entry.code);
        dot.setAttribute('data-country', entry.country);
        dot.setAttribute('data-name', entry.name);
        dot.setAttribute('data-face', face.id);
        dot.setAttribute('data-role', entry.role);
        dot.setAttribute('cx', cx);
        dot.setAttribute('cy', cy);
        dot.setAttribute('r', entry.role === 'P' ? 1.8 : 1.4);

        const color = COUNTRY_COLORS[entry.country] || '#a0a8bc';
        if (entry.role === 'P') {
          dot.setAttribute('fill', color);
          dot.setAttribute('stroke', 'rgba(13, 18, 32, 0.6)');
          dot.setAttribute('stroke-width', '0.4');
        } else {
          // Secondary = ring (transparent fill, colored stroke)
          dot.setAttribute('fill', 'transparent');
          dot.setAttribute('stroke', color);
          dot.setAttribute('stroke-width', '0.6');
        }

        // Click → fire same event as cube
        dot.addEventListener('click', () => {
          try {
            window.dispatchEvent(new CustomEvent('sb:actorClick', {
              detail: {
                actorCode: entry.code,
                actorName: entry.name,
                country: entry.country,
                faceId: face.id,
                role: entry.role,
                isPick: false
              }
            }));
          } catch (e) {}
        });
        svg.appendChild(dot);

        // Label (small, on hover)
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('class', 'v53-2d-dot-label');
        label.setAttribute('x', cx + 2);
        label.setAttribute('y', cy - 1.5);
        label.setAttribute('font-size', '2.4');
        label.textContent = entry.name;
        svg.appendChild(label);
      });
    }

    wrap.appendChild(svg);

    // Meta footer
    const meta = document.createElement('div');
    meta.className = 'v53-2d-grid-meta';
    const total = Object.values(dotsByCell).reduce((a, b) => a + b.length, 0);
    const primary = Object.values(dotsByCell).flat().filter(d => d.role === 'P').length;
    meta.innerHTML = `<span>${primary} primary</span><span>${total} positions</span>`;
    wrap.appendChild(meta);

    return wrap;
  }

  function getOffsetWithinCell(idx, total) {
    if (total === 1) return [0, 0];
    if (total === 2) {
      const offsets = [[-4, 0], [4, 0]];
      return offsets[idx] || [0, 0];
    }
    if (total <= 4) {
      const offsets = [[-4, -3], [4, -3], [-4, 3], [4, 3]];
      return offsets[idx] || [0, 0];
    }
    // Up to 9: 3x3 sub-grid
    const angle = (idx / total) * Math.PI * 2;
    const r = 5;
    return [Math.cos(angle) * r, Math.sin(angle) * r];
  }

  function addAxisText(svg, x, y, text, anchor) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('class', 'v53-2d-axis-label');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('text-anchor', anchor);
    t.setAttribute('font-size', '2.6');
    t.textContent = text;
    svg.appendChild(t);
  }

  // ============================================================
  // F6 Convergence row
  // ============================================================
  function buildF6Row() {
    const wrap = document.createElement('div');
    wrap.className = 'v53-2d-f6-inner';

    const head = document.createElement('div');
    head.className = 'v53-2d-f6-head';
    head.innerHTML = `
      <span class="v53-2d-f6-eyebrow">F6</span>
      <span class="v53-2d-f6-title">Convergence — JVs · Partnerships · Acquisitions</span>
    `;
    wrap.appendChild(head);

    const list = document.createElement('div');
    list.className = 'v53-2d-f6-list';

    const partnerships = D3.PARTNERSHIPS || [];
    for (const p of partnerships) {
      if (p.from === p.to) continue; // skip self-edges (acquisitions markers)
      const item = document.createElement('div');
      item.className = 'v53-2d-f6-item';
      const fromName = lookupName(p.from);
      const toName = lookupName(p.to);
      const typeLabel = p.type === 'jv' ? 'JV' :
                        p.type === 'cross-face' ? 'Multi-face partnership' :
                        p.type === 'partnership' ? 'Strategic partnership' :
                        p.type === 'acquisition' ? 'Acquisition' : p.type;
      item.innerHTML = `
        <div class="v53-2d-f6-from">${escapeHtml(typeLabel)} · ${escapeHtml(fromName)} × ${escapeHtml(toName)}</div>
        <div class="v53-2d-f6-label">${escapeHtml(p.label || '')}</div>
      `;
      list.appendChild(item);
    }

    wrap.appendChild(list);
    return wrap;
  }

  function lookupName(code) {
    if (!D3.STARTUPS) return code;
    const s = D3.STARTUPS.find(x => x.code === code);
    return s ? s.name : code;
  }

  // ============================================================
  // Show / hide / filters
  // ============================================================
  function show() {
    if (!isBuilt) build();
    const container = document.getElementById('v53-explore-2d');
    if (container) container.hidden = false;
    document.body.classList.add('v53-view-2d');
    applyFilters(lastFilters);
  }

  function hide() {
    const container = document.getElementById('v53-explore-2d');
    if (container) container.hidden = true;
    document.body.classList.remove('v53-view-2d');
  }

  function applyFilters(filters) {
    lastFilters = filters || lastFilters;
    if (!isBuilt) return;
    const dArr = lastFilters.doctrine || [];
    const cArr = lastFilters.country || [];
    const search = (lastFilters.search || '').toLowerCase().trim();
    const noFilters = dArr.length === 0 && cArr.length === 0 && !search;

    // Build code → doctrine lookup
    const codeToDoctrine = {};
    for (const s of D3.STARTUPS) codeToDoctrine[s.code] = s.doctrine;

    document.querySelectorAll('.v53-2d-dot').forEach(dot => {
      const code = dot.getAttribute('data-actor');
      const country = dot.getAttribute('data-country');
      const name = (dot.getAttribute('data-name') || '').toLowerCase();
      const doc = codeToDoctrine[code];

      let matches = true;
      if (!noFilters) {
        const matchDoc = dArr.length === 0 || dArr.includes(doc);
        const matchC = cArr.length === 0 || cArr.includes(country);
        const matchSearch = !search ||
          name.indexOf(search) !== -1 ||
          (code && code.toLowerCase().indexOf(search) !== -1);
        matches = matchDoc && matchC && matchSearch;
      }
      dot.style.opacity = matches ? '1' : '0.12';
    });
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // Public API
  window.SBExplore2D = {
    show: show,
    hide: hide,
    build: build,
    setFilters: applyFilters
  };
})();
