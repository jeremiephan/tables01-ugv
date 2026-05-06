/* ============================================================
   Starburst Tables 01 · UGV · Info overlay (Methodology + Sources)
   ============================================================
   Wires the fullscreen overlay :
   - Open on #methodology / #sources links
   - Switch between Methodology and Sources panels
   - Render per-actor source table
   - Search/filter in the source table
   ============================================================ */

(function () {

  const D3 = window.STEP3_DATA;
  if (!D3) {
    console.error('[info] STEP3_DATA missing');
    return;
  }

  const overlay = document.getElementById('info-overlay');
  if (!overlay) return;

  const methodologyPanel = document.getElementById('info-panel-methodology');
  const sourcesPanel = document.getElementById('info-panel-sources');
  const tabs = overlay.querySelectorAll('.io-tab');
  const closeBtn = overlay.querySelector('.io-close');
  const backdrop = overlay.querySelector('.info-overlay-backdrop');
  const sourceTable = document.getElementById('io-source-table');
  const sourceSearch = document.getElementById('io-source-search');

  let lastFocusedElement = null;

  function inferTier(sourceText) {
    if (!sourceText) return 'C';
    const lower = sourceText.toLowerCase();
    if (lower.includes('tier a') || lower.includes('tier&nbsp;a')) return 'A';
    if (lower.includes('tier b') || lower.includes('tier&nbsp;b')) return 'B';
    if (lower.includes('tier c') || lower.includes('tier&nbsp;c')) return 'C';
    // Heuristic fallback
    if (lower.includes('reuters') || lower.includes('bloomberg') || lower.includes('sec filings')
        || lower.includes('corporate') || lower.includes('mod ') || lower.includes('government')
        || lower.includes('edr magazine')) return 'A';
    if (lower.includes('janes') || lower.includes('defense news') || lower.includes('forbes')
        || lower.includes('defense post') || lower.includes('calibre defense')
        || lower.includes('financial times') || lower.includes('shephard')
        || lower.includes('army recognition') || lower.includes('techcrunch')) return 'B';
    return 'C';
  }

  function shortCitation(sourceText) {
    if (!sourceText) return '—';
    // Strip "Tier X · " prefix if present
    return sourceText.replace(/^Tier [A-C]\s*[·•]\s*/i, '').trim();
  }

  function renderSourceTable(filterText) {
    if (!sourceTable) return;
    const filter = (filterText || '').trim().toLowerCase();

    const rows = D3.STARTUPS
      .filter(s => {
        if (!filter) return true;
        return s.name.toLowerCase().includes(filter)
          || s.code.toLowerCase().includes(filter)
          || s.country.toLowerCase().includes(filter)
          || (s.source || '').toLowerCase().includes(filter);
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    if (rows.length === 0) {
      sourceTable.innerHTML = '<div class="io-source-empty">No actor matches your search.</div>';
      return;
    }

    sourceTable.innerHTML = rows.map(s => {
      const tier = inferTier(s.source);
      return `
        <div class="io-source-row">
          <span class="io-source-code">${s.code}</span>
          <span class="io-source-country">${s.country}</span>
          <span class="io-source-name">${s.name}</span>
          <span class="io-source-citation">${shortCitation(s.source) || '—'}</span>
          <span class="io-source-tier io-source-tier--${tier.toLowerCase()}">Tier ${tier}</span>
        </div>
      `;
    }).join('');
  }

  function open(panelId) {
    lastFocusedElement = document.activeElement;
    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-visible');
    document.body.style.overflow = 'hidden';
    switchPanel(panelId || 'methodology');

    // Lazy render source table on first open
    if (panelId === 'sources' && sourceTable && !sourceTable.children.length) {
      renderSourceTable('');
    }

    // Track Matomo
    if (window.SBTrack) window.SBTrack('tables01', 'info_overlay_opened', panelId || 'methodology');

    // Focus close button for accessibility
    setTimeout(() => {
      if (closeBtn) closeBtn.focus();
    }, 50);
  }

  function close() {
    overlay.setAttribute('aria-hidden', 'true');
    overlay.classList.remove('is-visible');
    document.body.style.overflow = '';
    if (lastFocusedElement && lastFocusedElement.focus) {
      lastFocusedElement.focus();
    }
  }

  function switchPanel(panelId) {
    tabs.forEach(t => {
      const isActive = t.dataset.panel === panelId;
      t.classList.toggle('is-active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    });
    if (methodologyPanel) methodologyPanel.classList.toggle('is-active', panelId === 'methodology');
    if (sourcesPanel) sourcesPanel.classList.toggle('is-active', panelId === 'sources');

    // Lazy render sources when switching to it
    if (panelId === 'sources' && sourceTable && !sourceTable.children.length) {
      renderSourceTable('');
    }
  }

  // Wire tabs
  tabs.forEach(t => {
    t.addEventListener('click', () => switchPanel(t.dataset.panel));
  });

  // Wire close
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-visible')) {
      close();
    }
  });

  // Wire search
  if (sourceSearch) {
    sourceSearch.addEventListener('input', (e) => {
      renderSourceTable(e.target.value);
    });
  }

  // Wire all #methodology and #sources links across the page
  document.addEventListener('click', (e) => {
    const target = e.target.closest('a[href="#methodology"], a[href="#sources"]');
    if (!target) return;
    e.preventDefault();
    const href = target.getAttribute('href');
    const panelId = href === '#sources' ? 'sources' : 'methodology';
    open(panelId);
  });

  // Expose API for direct programmatic use
  window.SBInfoOverlay = { open, close, switchPanel };

  // If URL hash on load is #methodology or #sources, open accordingly
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (location.hash === '#methodology') {
        setTimeout(() => open('methodology'), 200);
      } else if (location.hash === '#sources') {
        setTimeout(() => open('sources'), 200);
      }
    });
  } else {
    if (location.hash === '#methodology') {
      setTimeout(() => open('methodology'), 200);
    } else if (location.hash === '#sources') {
      setTimeout(() => open('sources'), 200);
    }
  }
})();
