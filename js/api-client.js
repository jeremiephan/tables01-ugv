/* ============================================================
 * Tables 01 · UGV — API client (Cycle J structure)
 * Centralizes all backend calls so PROD wiring is a single-file swap.
 *
 * PROD CHECKLIST before deployment:
 *   1. Set CONFIG.API_BASE to production endpoint
 *   2. Set CONFIG.CALENDLY_URL to real Calendly URL
 *   3. Set CONFIG.MATOMO_SITE_ID + CONFIG.MATOMO_URL in <head> snippet
 *   4. Configure Brevo templates (see config below)
 *   5. Set CSP headers per CYCLE_J spec
 * ============================================================ */
(function () {
  'use strict';

  const CONFIG = {
    // PROD CHECKLIST: replace with prod endpoint
    API_BASE: 'https://api.tables01.starburst.aero',

    // PROD CHECKLIST: replace with real Calendly URL
    CALENDLY_URL: 'https://calendly.com/starburst-aerospace/ugv-30min',

    // PROD CHECKLIST: configure Matomo
    MATOMO_URL: 'https://matomo.starburst.aero',
    MATOMO_SITE_ID: '1',

    // Brevo template IDs (configure in Brevo dashboard)
    BREVO_TEMPLATES: {
      csv_delivery: 'tables01_csv_delivery',
      newsletter_welcome: 'tables01_newsletter_welcome',
      peer_invite: 'tables01_peer_invite',
      early_access_token: 'tables01_early_access_token'
    },

    // Mock mode for local dev — set to false in prod
    MOCK_MODE: true
  };

  // ============================================================
  // CSV REQUEST endpoint (POST /api/csv-request)
  // ============================================================
  function csvRequest(payload) {
    // payload = { email_provided: bool, email?: string, newsletter_checked: bool }
    if (CONFIG.MOCK_MODE) {
      return Promise.resolve({
        success: true,
        action: payload.email_provided
          ? (payload.newsletter_checked ? 'csv_email_with_newsletter' : 'csv_email_only')
          : 'csv_anonymous_download'
      });
    }
    return fetch(CONFIG.API_BASE + '/api/csv-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());
  }

  // ============================================================
  // GROWTH LOOP INVITE endpoint (POST /api/growth-loop-invite)
  // ============================================================
  function growthLoopInvite(payload) {
    // payload = { inviter_name, inviter_email, peers: [email1, email2, email3] }
    if (CONFIG.MOCK_MODE) {
      return Promise.resolve({
        success: true,
        token_sent_to: payload.inviter_email,
        peers_invited: payload.peers.length,
        token_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    }
    return fetch(CONFIG.API_BASE + '/api/growth-loop-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(r => r.json());
  }

  // ============================================================
  // REDEEM TOKEN endpoint (POST /api/redeem-token)
  // ============================================================
  function redeemToken(token) {
    if (CONFIG.MOCK_MODE) {
      return Promise.resolve({ success: true, table: 'tables02_drones', csv_url: 'mock://tables02.csv' });
    }
    return fetch(CONFIG.API_BASE + '/api/redeem-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token })
    }).then(r => r.json());
  }

  // ============================================================
  // Calendly URL helper
  // ============================================================
  function getCalendlyUrl(prefill) {
    let url = CONFIG.CALENDLY_URL;
    if (prefill && typeof prefill === 'object') {
      const params = new URLSearchParams();
      if (prefill.email) params.set('email', prefill.email);
      if (prefill.name) params.set('name', prefill.name);
      if (params.toString()) url += '?' + params.toString();
    }
    return url;
  }

  // ============================================================
  // Matomo tracker (centralized)
  // SBTrack is already exposed by spa-router; we extend it with
  // structured event names for Cycle J compliance.
  // ============================================================
  const MATOMO_EVENTS = [
    'module_loaded',
    'mode_explore_entered', 'mode_compose_entered', 'mode_read_entered',
    'csv_anonymous_download', 'csv_email_only_no_newsletter', 'csv_email_with_newsletter_signup',
    'csv_modal_open', 'csv_cta_explore_context', 'csv_cta_post_diagnostic_clicked', 'csv_cta_read_page',
    'growth_loop_invite_sent', 'growth_loop_invite_skipped', 'early_access_token_redeemed',
    'cta_book_call_clicked', 'book_call_clicked', 'linkedin_share_clicked',
    'compose_share_native', 'compose_share_linkedin', 'compose_share_png_generated',
    'pdf_download_clicked',
    'cube_idle_rotation_stopped',
    'view_2d_activated', 'view_3d_activated',
    'cha_ching_triggered',
    'actor_clicked',
    'consent_allowed', 'consent_denied',
    'prefers_reduced_motion_detected',
    'replay_intro_clicked'
  ];

  function trackEvent(category, action, name, value) {
    // Defensive: fall back to console if Matomo not loaded
    if (typeof window._paq !== 'undefined') {
      window._paq.push(['trackEvent', category, action, name, value]);
    } else if (typeof console !== 'undefined' && console.debug) {
      console.debug('[track]', category, action, name, value);
    }
  }

  // Detect prefers-reduced-motion at load and track
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setTimeout(() => trackEvent('tables01', 'prefers_reduced_motion_detected'), 1000);
  }

  // Public API
  window.SBApi = {
    config: CONFIG,
    csvRequest,
    growthLoopInvite,
    redeemToken,
    getCalendlyUrl,
    track: trackEvent,
    KNOWN_EVENTS: MATOMO_EVENTS
  };
})();
