/* ============================================================
 * Tables 01 · UGV — Consent banner (Cycle F)
 * 48h localStorage opt-in for cross-session state preservation.
 * GDPR-compliant explicit opt-in.
 * ============================================================ */
(function () {
  'use strict';

  const STORAGE_KEY = 'sb-tables-01-consent';
  const STATE_KEY = 'sb-tables-01-state';
  const VALIDITY_MS = 48 * 60 * 60 * 1000; // 48 hours

  // Read current consent (returns 'allowed' | 'denied' | null)
  function getConsent() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw);
      // Expire after 48h
      if (Date.now() - data.timestamp > VALIDITY_MS) {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(STATE_KEY);
        return null;
      }
      return data.value;
    } catch (e) {
      return null;
    }
  }

  function setConsent(value) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        value: value,
        timestamp: Date.now()
      }));
      if (window.SBTrack) window.SBTrack('tables01', 'consent_' + value);
    } catch (e) {
      console.warn('[consent] localStorage write failed:', e);
    }
  }

  function showBanner() {
    let banner = document.getElementById('v53-consent-banner');
    if (banner) {
      banner.classList.add('is-visible');
      banner.removeAttribute('hidden');
      return;
    }
    banner = document.createElement('div');
    banner.id = 'v53-consent-banner';
    banner.className = 'v53-consent-banner is-visible';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML = `
      <div class="v53-consent-inner">
        <div class="v53-consent-text">
          <div class="v53-consent-title">Save your exploration?</div>
          <div class="v53-consent-body">
            Tables 01 can remember your filters, picks, and view preferences across sessions (48h) using browser storage.
            <strong>No data sent to our servers. Cleared automatically.</strong>
          </div>
        </div>
        <div class="v53-consent-actions">
          <button class="v53-consent-btn v53-consent-btn--primary" id="v53-consent-allow" type="button">Allow</button>
          <button class="v53-consent-btn v53-consent-btn--secondary" id="v53-consent-deny" type="button">No thanks</button>
        </div>
      </div>
    `;
    document.body.appendChild(banner);

    document.getElementById('v53-consent-allow').addEventListener('click', () => {
      setConsent('allowed');
      hideBanner();
    });
    document.getElementById('v53-consent-deny').addEventListener('click', () => {
      setConsent('denied');
      hideBanner();
    });
  }

  function hideBanner() {
    const banner = document.getElementById('v53-consent-banner');
    if (!banner) return;
    banner.classList.remove('is-visible');
    setTimeout(() => { banner.hidden = true; }, 400);
  }

  function init() {
    const consent = getConsent();
    if (consent === null) {
      // First visit OR expired → show banner
      // Wait a bit so it doesn't compete with LiDAR intro
      setTimeout(showBanner, 4500);
    }
    // If 'allowed' or 'denied', do nothing
  }

  // Expose API for state.js (Cycle F state object)
  window.SBConsent = {
    isAllowed: () => getConsent() === 'allowed',
    isDenied: () => getConsent() === 'denied',
    getStatus: getConsent,
    showBanner: showBanner
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
