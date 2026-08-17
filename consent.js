/* Cookie consent for jointhebots.com
 *
 * Loaded on every page. Self-contained on purpose: only one of the 23 landing
 * pages links styles.css, so this injects its own CSS rather than depending on
 * a stylesheet that is usually absent.
 *
 * How it fits together with the tag in <head>:
 *   1. The inline block in <head> sets Google Consent Mode v2 defaults to
 *      DENIED before gtag.js loads, and re-applies a stored "granted" choice.
 *      That ordering matters. Set defaults after the library initialises and
 *      measurement has already happened.
 *   2. This file draws the banner and writes the choice.
 *
 * Consent Mode v2 rather than simply not loading gtag: Google requires the
 * ad_user_data and ad_personalization signals for UK and EEA traffic, and
 * without them Ads measurement degrades even for users who did consent.
 *
 * The reject button is deliberately identical in weight to accept. A refusal
 * that is harder to give than agreement is not a free choice, and the ICO
 * treats it as invalid consent.
 */
(function () {
  'use strict';

  var KEY = 'jtb-consent';          // 'granted' | 'denied'
  var SIGNALS = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'];

  function read() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function write(v) {
    try { localStorage.setItem(KEY, v); } catch (e) { /* private mode: choice lasts the session */ }
  }

  function apply(granted) {
    var payload = {};
    for (var i = 0; i < SIGNALS.length; i++) {
      payload[SIGNALS[i]] = granted ? 'granted' : 'denied';
    }
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', payload);
    }
  }

  function injectStyles() {
    if (document.getElementById('jtb-consent-css')) { return; }
    var css =
      '.jtb-consent{position:fixed;left:0;right:0;bottom:0;z-index:9999;background:#fff;' +
      'border-top:3px solid #005B5C;box-shadow:0 -4px 24px rgba(0,0,0,.13);' +
      'font-family:system-ui,-apple-system,"Segoe UI",Arial,sans-serif;color:#22252A}' +
      '.jtb-consent-in{max-width:1080px;margin:0 auto;padding:18px 20px;display:flex;' +
      'gap:20px;align-items:center;flex-wrap:wrap}' +
      '.jtb-consent-t{flex:1 1 380px;min-width:260px;font-size:.94rem;line-height:1.55;margin:0}' +
      '.jtb-consent-t a{color:#005B5C}' +
      '.jtb-consent-b{display:flex;gap:10px;flex-wrap:wrap}' +
      '.jtb-consent-b button{font:inherit;font-size:.92rem;font-weight:600;cursor:pointer;' +
      'padding:11px 22px;border-radius:8px;border:2px solid #005B5C;white-space:nowrap}' +
      '.jtb-yes{background:#005B5C;color:#fff}' +
      '.jtb-no{background:transparent;color:#005B5C}' +
      '.jtb-consent-b button:hover{opacity:.88}' +
      '.jtb-consent-b button:focus-visible{outline:3px solid #F28C35;outline-offset:2px}' +
      '@media(max-width:560px){.jtb-consent-in{padding:15px 16px;gap:13px}' +
      '.jtb-consent-b{width:100%}.jtb-consent-b button{flex:1 1 0}}';
    var s = document.createElement('style');
    s.id = 'jtb-consent-css';
    s.appendChild(document.createTextNode(css));
    document.head.appendChild(s);
  }

  var el = null;

  function close() {
    if (el && el.parentNode) { el.parentNode.removeChild(el); }
    el = null;
  }

  function choose(granted) {
    write(granted ? 'granted' : 'denied');
    apply(granted);
    close();
  }

  function show() {
    if (el) { return; }
    injectStyles();
    el = document.createElement('div');
    el.className = 'jtb-consent';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Cookie choices');
    el.innerHTML =
      '<div class="jtb-consent-in">' +
        '<p class="jtb-consent-t">We use cookies to measure which pages people find useful and ' +
        'which adverts bring people here. Nothing is set until you choose. ' +
        'Our <a href="/privacy/">Privacy Policy</a> explains what we collect and why.</p>' +
        '<div class="jtb-consent-b">' +
          '<button type="button" class="jtb-no">Reject</button>' +
          '<button type="button" class="jtb-yes">Accept</button>' +
        '</div>' +
      '</div>';
    el.querySelector('.jtb-yes').addEventListener('click', function () { choose(true); });
    el.querySelector('.jtb-no').addEventListener('click', function () { choose(false); });
    document.body.appendChild(el);
    el.querySelector('.jtb-no').focus();
  }

  function init() {
    // Any element marked data-cookie-settings reopens the choice. This is what
    // makes the "you can change your mind" line in the privacy policy true.
    var links = document.querySelectorAll('[data-cookie-settings]');
    for (var i = 0; i < links.length; i++) {
      links[i].addEventListener('click', function (e) { e.preventDefault(); show(); });
    }
    if (read() === null) { show(); }
  }

  window.JTBConsent = { show: show, current: read };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
