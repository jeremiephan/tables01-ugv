/* ============================================================
   Starburst Tables 01 · UGV · Step 3 — App layer
   ============================================================ */

(function () {
  const D = window.STEP3_DATA;
  if (!D) { console.error('STEP3_DATA missing'); return; }

  // ---- State ----------------------------------------------------------------
  const STATE_KEY = 'sb-tables-01';
  function loadState() {
    try {
      const raw = sessionStorage.getItem(STATE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return { profile: null, thesis: null, composition: [] };
  }
  function saveState() {
    try { sessionStorage.setItem(STATE_KEY, JSON.stringify(state)); } catch (e) {}
  }
  const state = loadState();

  // For standalone preview if no upstream state, default to VC-D / B
  if (!state.profile) state.profile = 'VC-D';
  if (!state.thesis) state.thesis = 'B';
  if (!Array.isArray(state.composition)) state.composition = [];

  function selectedStartups() {
    return state.composition
      .map(c => {
        const s = D.STARTUPS.find(x => x.code === c.code);
        return s ? Object.assign({}, s, { amount: c.amount }) : null;
      })
      .filter(Boolean);
  }

  // ---- Header recap (dateline) ---------------------------------------------
  function renderDateline() {
    const profile = D.PROFILES[state.profile];
    const thesis = D.THESES[state.thesis];
    const dl = document.getElementById('dateline');
    if (!dl || !profile || !thesis) return;
    dl.innerHTML =
      `<span class="dl-k">Profile</span> <span class="dl-v">${profile.code}</span>` +
      `<span class="dl-sep">·</span>` +
      `<span class="dl-v">${profile.label} · €${profile.allocation}M · ${profile.target} positions · ${profile.horizon}</span>` +
      `<span class="dl-sep">·</span>` +
      `<span class="dl-k">Thesis</span> <span class="dl-v">${thesis.code} · ${thesis.label}</span>` +
      `<a class="dl-revise" href="#step-2"><span>Revise</span><span class="arrow" aria-hidden="true">↗</span></a>`;
  }

  // ---- Map ------------------------------------------------------------------
  const NS = 'http://www.w3.org/2000/svg';
  function el(tag, attrs, children) {
    const e = document.createElementNS(NS, tag);
    if (attrs) for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (children) for (const c of children) e.appendChild(c);
    return e;
  }

  function startupPosition(s) {
    const c = D.COUNTRIES[s.country];
    const x = c.x + 14 + (s.cadence / 4) * (c.w - 28);
    const y = c.y + 26 + (1 - s.deployment / 4) * (c.h - 36);
    return { x, y };
  }

  function isSelected(code) {
    return state.composition.some(c => c.code === code);
  }

  function renderMap() {
    const svg = document.getElementById('map-svg');
    if (!svg) return;
    svg.innerHTML = '';

    // Defs — hatch patterns for contested
    const defs = el('defs');
    for (const k in D.DOCTRINE_COLORS) {
      const color = D.DOCTRINE_COLORS[k];
      const pat = el('pattern', {
        id: `hatch-${k}`, width: 4, height: 4, patternUnits: 'userSpaceOnUse',
        patternTransform: 'rotate(45)'
      });
      pat.appendChild(el('rect', { width: 4, height: 4, fill: '#0d1220' }));
      pat.appendChild(el('line', { x1: 0, y1: 0, x2: 0, y2: 4, stroke: color, 'stroke-width': 1.4 }));
      defs.appendChild(pat);
    }
    svg.appendChild(defs);

    // Country rectangles
    const countriesG = el('g', { 'data-layer': 'countries' });
    for (const code in D.COUNTRIES) {
      const c = D.COUNTRIES[code];
      // Frame
      countriesG.appendChild(el('rect', {
        x: c.x, y: c.y, width: c.w, height: c.h,
        fill: 'none', stroke: '#1a2336', 'stroke-width': 1
      }));
      // Crosshair pointillé (no center marker)
      const cx = c.x + c.w / 2;
      const cy = c.y + c.h / 2;
      countriesG.appendChild(el('line', {
        x1: c.x + 14, y1: cy, x2: c.x + c.w - 14, y2: cy,
        stroke: '#232d44', 'stroke-width': 0.5, 'stroke-dasharray': '2 3', opacity: 0.6
      }));
      countriesG.appendChild(el('line', {
        x1: cx, y1: c.y + 26, x2: cx, y2: c.y + c.h - 14,
        stroke: '#232d44', 'stroke-width': 0.5, 'stroke-dasharray': '2 3', opacity: 0.6
      }));
      // Country code top-left
      const codeT = el('text', {
        x: c.x + 8, y: c.y + 14,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': 10, 'font-weight': 600, 'letter-spacing': 0.18,
        fill: '#a0a8bc'
      });
      codeT.textContent = c.label;
      countriesG.appendChild(codeT);
      // Signature italic bottom
      const sigT = el('text', {
        x: c.x + 8, y: c.y + c.h - 8,
        'font-family': "'Source Serif 4', serif",
        'font-size': 10.5, 'font-style': 'italic',
        fill: '#4a5366'
      });
      sigT.textContent = c.signature;
      countriesG.appendChild(sigT);
    }
    svg.appendChild(countriesG);

    // Partnerships (dashed lines, very low opacity, behind glyphs)
    const partG = el('g', { 'data-layer': 'partnerships' });
    for (const p of D.PARTNERSHIPS) {
      const a = D.STARTUPS.find(x => x.code === p.from);
      const b = D.STARTUPS.find(x => x.code === p.to);
      if (!a || !b) continue;
      const pa = startupPosition(a);
      const pb = startupPosition(b);
      const line = el('line', {
        x1: pa.x, y1: pa.y, x2: pb.x, y2: pb.y,
        stroke: '#a0a8bc', 'stroke-width': 0.7, 'stroke-dasharray': '3 4',
        opacity: 0.18,
        'data-partnership-from': p.from, 'data-partnership-to': p.to,
        'data-partnership-label': p.label
      });
      line.style.cursor = 'pointer';
      partG.appendChild(line);
    }
    svg.appendChild(partG);

    // Startups
    const startsG = el('g', { 'data-layer': 'startups' });
    for (const s of D.STARTUPS) {
      const pos = startupPosition(s);
      const r = D.FUNDING_RADIUS[s.fundingScale] || 5;
      const color = D.DOCTRINE_COLORS[s.doctrine] || '#a0a8bc';
      const sel = isSelected(s.code);

      const g = el('g', {
        'data-startup': s.code,
        'class': 'startup-glyph' + (sel ? ' is-selected' : ''),
        'transform': `translate(${pos.x.toFixed(2)},${pos.y.toFixed(2)})`,
        'tabindex': '0',
        'role': 'button',
        'aria-label': `${s.code} · ${s.name} · ${s.country}`
      });

      // Selection ring (only if selected)
      if (sel) {
        g.appendChild(el('circle', {
          r: r + 4, fill: 'none',
          stroke: '#e8c441', 'stroke-width': 1.5,
          opacity: 0.95
        }));
      }

      // Glyph circle — fill style depends on performance
      let fill = color;
      let opacity = 1;
      if (s.performance === 'contested') {
        fill = `url(#hatch-${s.doctrine})`;
      } else if (s.performance === 'undocumented') {
        opacity = 0.5;
      }
      g.appendChild(el('circle', {
        r: r, fill: fill, opacity: opacity,
        stroke: color, 'stroke-width': s.performance === 'contested' ? 1 : 0
      }));

      // Code label — promoted color when selected
      const codeColor = sel ? '#e8e8ea' : '#6b7489';
      const codeT = el('text', {
        x: r + 4, y: 3,
        'font-family': "'JetBrains Mono', monospace",
        'font-size': 8.5, 'letter-spacing': 0.14,
        'font-weight': sel ? 600 : 500,
        fill: codeColor
      });
      codeT.textContent = s.code;
      g.appendChild(codeT);

      startsG.appendChild(g);
    }
    svg.appendChild(startsG);
  }

  // ---- Tooltip --------------------------------------------------------------
  const tooltip = document.getElementById('tooltip');
  function showTooltip(s, evt) {
    if (!tooltip) return;
    tooltip.innerHTML =
      `<div class="tt-eyebrow">${s.code} · ${s.country} · Doctrine ${s.doctrine}</div>` +
      `<div class="tt-row"><span class="tt-k">Raised</span><span class="tt-v">${s.raised}</span></div>` +
      `<div class="tt-row"><span class="tt-k">Deploy</span><span class="tt-v">${s.deploy}</span></div>` +
      `<div class="tt-row"><span class="tt-k">Source</span><span class="tt-v">${s.source}</span></div>` +
      `<div class="tt-foot">Click for full record</div>`;
    tooltip.classList.add('is-visible');
    positionTooltip(evt);
  }
  function positionTooltip(evt) {
    if (!tooltip || !tooltip.classList.contains('is-visible')) return;
    const map = document.getElementById('map-frame').getBoundingClientRect();
    const tw = tooltip.offsetWidth;
    const th = tooltip.offsetHeight;
    let x = evt.clientX - map.left + 14;
    let y = evt.clientY - map.top + 14;
    if (x + tw > map.width - 8) x = evt.clientX - map.left - tw - 14;
    if (y + th > map.height - 8) y = evt.clientY - map.top - th - 14;
    if (x < 8) x = 8;
    if (y < 8) y = 8;
    tooltip.style.transform = `translate(${x}px,${y}px)`;
  }
  function hideTooltip() {
    if (tooltip) tooltip.classList.remove('is-visible');
  }

  // ---- Partnership annotation (floating) ------------------------------------
  let partAnnotation = null;
  function showPartnership(line, evt) {
    hidePartnership();
    const map = document.getElementById('map-frame');
    if (!map) return;
    partAnnotation = document.createElement('div');
    partAnnotation.className = 'part-annotation';
    partAnnotation.innerHTML = `<span class="pa-text">${line.dataset.partnershipLabel}</span><button class="pa-close" aria-label="Dismiss">×</button>`;
    map.appendChild(partAnnotation);
    const rect = map.getBoundingClientRect();
    let x = evt.clientX - rect.left + 12;
    let y = evt.clientY - rect.top + 12;
    if (x + 320 > rect.width) x = rect.width - 332;
    partAnnotation.style.transform = `translate(${x}px,${y}px)`;
    partAnnotation.querySelector('.pa-close').addEventListener('click', hidePartnership);
  }
  function hidePartnership() {
    if (partAnnotation && partAnnotation.parentNode) partAnnotation.parentNode.removeChild(partAnnotation);
    partAnnotation = null;
  }

  // ---- Pop-over (detail card) -----------------------------------------------
  const popover = document.getElementById('popover');
  const popoverBackdrop = document.getElementById('popover-backdrop');
  let popoverActiveCode = null;
  let popoverSize = 8;
  let lastFocusedEl = null;

  function openPopover(code) {
    const s = D.STARTUPS.find(x => x.code === code);
    if (!s || !popover) return;
    popoverActiveCode = code;
    const existing = state.composition.find(c => c.code === code);
    if (existing) {
      popoverSize = existing.amount;
    } else {
      popoverSize = D.defaultSizeForProfile(state.profile);
    }
    renderPopover();
    lastFocusedEl = document.activeElement;
    popoverBackdrop.classList.add('is-visible');
    popover.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
      const closeBtn = popover.querySelector('.po-close');
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  function closePopover() {
    if (!popover) return;
    popover.classList.remove('is-visible');
    popoverBackdrop.classList.remove('is-visible');
    popoverActiveCode = null;
    document.body.style.overflow = '';
    if (lastFocusedEl && lastFocusedEl.focus) lastFocusedEl.focus();
  }

  function renderPopover() {
    if (!popover || !popoverActiveCode) return;
    const s = D.STARTUPS.find(x => x.code === popoverActiveCode);
    if (!s) return;
    const isSel = isSelected(s.code);
    const fit = D.doctrineFit(s, state.thesis);
    const c = D.COUNTRIES[s.country];

    const sizeButtons = D.SIZES.map(v =>
      `<button class="po-size${v === popoverSize ? ' is-active' : ''}" data-size="${v}">€${v}M</button>`
    ).join('');

    const ctaText = isSel
      ? `Remove from portfolio · €${popoverSize}M`
      : `Add to portfolio · €${popoverSize}M`;

    popover.innerHTML = `
      <button class="po-close" aria-label="Close">×</button>
      <div class="po-eyebrow">${s.code} · Doctrine ${s.doctrine} · ${c ? c.name : s.country}</div>
      <h2 class="po-title">${s.name}</h2>
      <div class="po-tagline">${s.note}</div>

      <div class="po-meta">
        <div class="po-meta-row"><span class="po-meta-k">Total raised</span><span class="po-meta-v">${s.raised}</span></div>
        <div class="po-meta-row"><span class="po-meta-k">Last round</span><span class="po-meta-v">${s.round}</span></div>
        <div class="po-meta-row"><span class="po-meta-k">Headcount</span><span class="po-meta-v">${s.headcount}</span></div>
        <div class="po-meta-row"><span class="po-meta-k">Deployment</span><span class="po-meta-v">${s.deploy}</span></div>
        <div class="po-meta-row"><span class="po-meta-k">Source tier</span><span class="po-meta-v">${s.source}</span></div>
      </div>

      <div class="po-fit">
        <span class="po-fit-k">Doctrine fit / your thesis</span>
        <span class="po-fit-v">${fit}</span>
      </div>

      <div class="po-size-block">
        <span class="po-size-k">Position size</span>
        <div class="po-size-row" role="radiogroup" aria-label="Position size">
          ${sizeButtons}
        </div>
      </div>

      <button class="po-cta${isSel ? ' is-remove' : ''}">${ctaText}</button>
    `;

    // Wire close
    popover.querySelector('.po-close').addEventListener('click', closePopover);

    // Wire size buttons
    popover.querySelectorAll('.po-size').forEach(b => {
      b.addEventListener('click', () => {
        popoverSize = parseInt(b.dataset.size, 10);
        renderPopover();
      });
    });

    // Wire CTA
    popover.querySelector('.po-cta').addEventListener('click', () => {
      togglePosition(s.code, popoverSize);
      closePopover();
    });
  }

  function togglePosition(code, amount) {
    const idx = state.composition.findIndex(c => c.code === code);
    if (idx >= 0) {
      state.composition.splice(idx, 1);
    } else {
      if (state.composition.length >= 5) {
        // Replace the oldest if user tries to add a 6th — soft cap
        state.composition.shift();
      }
      state.composition.push({ code, amount });
    }
    saveState();
    renderMap();
    renderRecap();
    checkRevelations();
  }

  // ---- Sticky right rail (recap) --------------------------------------------
  function renderRecap() {
    const sel = selectedStartups();
    const profile = D.PROFILES[state.profile];
    const thesis = D.THESES[state.thesis];

    // Allocation
    const totalAlloc = sel.reduce((a, b) => a + b.amount, 0);
    const cap = profile ? profile.allocation : 0;
    const pct = cap > 0 ? Math.min(100, (totalAlloc / cap) * 100) : 0;
    const allocEl = document.getElementById('rc-alloc');
    if (allocEl) {
      allocEl.innerHTML = `
        <div class="rc-section-h">Allocation</div>
        <div class="rc-alloc-num">€${totalAlloc}<span class="rc-alloc-sub">M of €${cap}M</span></div>
        <div class="rc-bar"><div class="rc-bar-fill" style="width:${pct.toFixed(1)}%"></div></div>
        <div class="rc-alloc-pos">${sel.length} of ${profile ? profile.target : '—'} positions</div>
      `;
    }

    // Selected list
    const listEl = document.getElementById('rc-list');
    if (listEl) {
      if (sel.length === 0) {
        listEl.innerHTML = `
          <div class="rc-section-h">Selected</div>
          <div class="rc-empty">No positions yet. Click any glyph on the map to begin.</div>
        `;
      } else {
        const rows = sel.map(s => `
          <div class="rc-row" data-code="${s.code}">
            <span class="rc-row-code">${s.code}</span>
            <span class="rc-row-name">${s.name}</span>
            <span class="rc-row-doctrine" style="color:${D.DOCTRINE_COLORS[s.doctrine]}">${s.doctrine}</span>
            <span class="rc-row-country">${s.country}</span>
            <span class="rc-row-amt">€${s.amount}M</span>
            <button class="rc-row-rm" data-code="${s.code}" aria-label="Remove ${s.name}">×</button>
          </div>
        `).join('');
        listEl.innerHTML = `<div class="rc-section-h">Selected</div>${rows}`;
        listEl.querySelectorAll('.rc-row-rm').forEach(b => {
          b.addEventListener('click', () => {
            const c = b.dataset.code;
            const idx = state.composition.findIndex(x => x.code === c);
            if (idx >= 0) {
              state.composition.splice(idx, 1);
              saveState();
              renderMap();
              renderRecap();
              checkRevelations();
            }
          });
        });
      }
    }

    // Doctrine mix
    const mixEl = document.getElementById('rc-mix');
    if (mixEl) {
      const total = sel.reduce((a, b) => a + b.amount, 0) || 1;
      const buckets = ['A', 'B', 'C', 'E'];
      const bucketLabels = { 'A': 'A · cadence', 'B': 'B · modular', 'C': 'C · premium', 'E': 'E · enabler' };
      const rows = buckets.map(d => {
        const sum = sel.filter(s => s.doctrine === d).reduce((a, b) => a + b.amount, 0);
        const p = total > 0 ? (sum / total) * 100 : 0;
        return `
          <div class="rc-mix-row">
            <span class="rc-mix-k">${bucketLabels[d]}</span>
            <span class="rc-mix-bar"><span class="rc-mix-fill" style="width:${p.toFixed(1)}%; background:${D.DOCTRINE_COLORS[d]}"></span></span>
            <span class="rc-mix-v">${Math.round(p)}%</span>
          </div>
        `;
      }).join('');
      mixEl.innerHTML = `<div class="rc-section-h">Doctrine mix</div>${rows}`;
    }

    // Battle exposure
    const beEl = document.getElementById('rc-battle');
    if (beEl) {
      const total = sel.reduce((a, b) => a + b.amount, 0) || 1;
      const tiers = [
        { k: 'L4 · continuous', test: s => s.deployment === 4 },
        { k: 'L3 · high vol',   test: s => s.deployment === 3 },
        { k: 'L1–2 · partial',  test: s => s.deployment === 1 || s.deployment === 2 },
        { k: 'L0 · none',       test: s => s.deployment === 0 }
      ];
      const rows = tiers.map(t => {
        const sum = sel.filter(t.test).reduce((a, b) => a + b.amount, 0);
        const p = total > 0 ? (sum / total) * 100 : 0;
        return `
          <div class="rc-mix-row">
            <span class="rc-mix-k">${t.k}</span>
            <span class="rc-mix-bar"><span class="rc-mix-fill" style="width:${p.toFixed(1)}%; background:#a0a8bc"></span></span>
            <span class="rc-mix-v">${Math.round(p)}%</span>
          </div>
        `;
      }).join('');
      beEl.innerHTML = `<div class="rc-section-h">Battle exposure</div>${rows}`;
    }

    // Divergence
    const divEl = document.getElementById('rc-divergence');
    if (divEl) {
      const div = D.getDivergence(sel);
      if (!div) {
        divEl.innerHTML = `
          <div class="rc-section-h">Your divergence from market</div>
          <div class="rc-div-empty">Add 3+ positions to see your divergence from the European VC archetype.</div>
        `;
      } else {
        divEl.innerHTML = `
          <div class="rc-section-h">Your divergence from market</div>
          <div class="rc-div-text">${div.text}</div>
          <div class="rc-div-source">${div.source}</div>
        `;
      }
    }

    // Action bar
    const actionBtn = document.getElementById('action-stress');
    if (actionBtn) {
      const enabled = sel.length >= 3;
      actionBtn.classList.toggle('is-disabled', !enabled);
      actionBtn.querySelector('.ab-text').textContent = enabled
        ? 'Stress-test portfolio'
        : 'Add at least 3 positions';
    }
  }

  // ---- Revelations (flash messages) ----------------------------------------
  let lastRevelationId = null;
  let revelationTimer = null;
  function checkRevelations() {
    const sel = selectedStartups();
    let active = null;
    for (const r of D.REVELATION_RULES) {
      try { if (r.when(sel)) { active = r; break; } } catch (e) {}
    }
    if (!active || active.id === lastRevelationId) {
      if (!active) lastRevelationId = null;
      return;
    }
    lastRevelationId = active.id;
    const flash = document.getElementById('flash');
    if (!flash) return;
    flash.innerHTML = `<div class="flash-text">${active.text}</div>`;
    flash.classList.add('is-visible');
    if (revelationTimer) clearTimeout(revelationTimer);
    revelationTimer = setTimeout(() => {
      flash.classList.remove('is-visible');
    }, 4500);
  }

  // ---- Onboarding modal -----------------------------------------------------
  const ONBOARD_KEY = 'sb-step3-onboarded';
  function maybeShowOnboarding() {
    const onboard = document.getElementById('onboard');
    if (!onboard) return;
    let seen = false;
    try { seen = sessionStorage.getItem(ONBOARD_KEY) === '1'; } catch (e) {}
    if (seen) return;
    onboard.classList.add('is-visible');
    onboard.querySelector('.ob-cta').addEventListener('click', () => {
      onboard.classList.remove('is-visible');
      try { sessionStorage.setItem(ONBOARD_KEY, '1'); } catch (e) {}
    });
  }

  // ---- Wire interactions ----------------------------------------------------
  function wireMap() {
    const svg = document.getElementById('map-svg');
    if (!svg) return;

    svg.addEventListener('mouseover', (evt) => {
      const g = evt.target.closest('[data-startup]');
      if (g) {
        const code = g.getAttribute('data-startup');
        const s = D.STARTUPS.find(x => x.code === code);
        if (s) showTooltip(s, evt);
        return;
      }
    });
    svg.addEventListener('mousemove', (evt) => {
      if (tooltip && tooltip.classList.contains('is-visible')) positionTooltip(evt);
    });
    svg.addEventListener('mouseout', (evt) => {
      const related = evt.relatedTarget;
      if (!related || !related.closest || !related.closest('[data-startup]')) {
        hideTooltip();
      }
    });
    svg.addEventListener('click', (evt) => {
      const g = evt.target.closest('[data-startup]');
      if (g) {
        hideTooltip();
        openPopover(g.getAttribute('data-startup'));
        return;
      }
      const part = evt.target.closest('[data-partnership-from]');
      if (part) {
        showPartnership(part, evt);
      }
    });
    svg.addEventListener('keydown', (evt) => {
      if (evt.key !== 'Enter' && evt.key !== ' ') return;
      const g = evt.target.closest('[data-startup]');
      if (g) {
        evt.preventDefault();
        openPopover(g.getAttribute('data-startup'));
      }
    });
  }

  function wirePopover() {
    if (popoverBackdrop) {
      popoverBackdrop.addEventListener('click', closePopover);
    }
    document.addEventListener('keydown', (evt) => {
      if (evt.key === 'Escape') {
        if (popover && popover.classList.contains('is-visible')) closePopover();
      }
    });
  }

  function wireDateline() {
    const dl = document.getElementById('dateline');
    if (!dl) return;
    dl.addEventListener('click', (evt) => {
      const a = evt.target.closest('a.dl-revise');
      if (a) {
        evt.preventDefault();
        // In standalone, just visual; in SPA shell, would route to step-2
      }
    });
  }

  function wireActionBar() {
    const actionBtn = document.getElementById('action-stress');
    if (actionBtn) {
      actionBtn.addEventListener('click', (evt) => {
        if (actionBtn.classList.contains('is-disabled')) {
          evt.preventDefault();
        }
      });
    }
  }

  // ---- Init ----------------------------------------------------------------
  function init() {
    renderDateline();
    renderMap();
    renderRecap();
    wireMap();
    wirePopover();
    wireDateline();
    wireActionBar();
    maybeShowOnboarding();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
