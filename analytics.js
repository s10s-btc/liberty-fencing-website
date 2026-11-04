/*!
 * Liberty Fencing — site-wide analytics loader.
 *
 * WHY THIS FILE EXISTS
 * --------------------
 * The measurement ID used to be pasted inline into every page as
 * "G-PLACEHOLDER-LF", which meant:
 *   1. it was a fake ID, so GA4 collected nothing, and
 *   2. it was copy-pasted, so swapping in the real ID meant touching every page.
 *
 * Now the ID lives HERE, once. To turn on measurement:
 *   1. create the GA4 property (analytics.google.com -> Admin -> Create Property),
 *   2. replace the GA4_ID value below with the real "G-XXXXXXXXXX",
 *   3. (optional) set ADS_ID below to the Google Ads tag "AW-XXXXXXXXX".
 * That's the whole job. No page edits required.
 *
 * The loader is a no-op until a real ID is present, so a forgotten placeholder
 * can never silently ship and look "installed".
 */
(function () {
  'use strict';

  // ── CONFIG — this is the only place to edit ──────────────────────────────
  var GA4_ID = 'G-PLACEHOLDER-LF'; // TODO: replace with the real GA4 measurement ID
  var ADS_ID = '';                 // TODO: optional Google Ads tag, e.g. AW-16679890239
  // ─────────────────────────────────────────────────────────────────────────

  var isReal = function (id) {
    return typeof id === 'string' &&
      id.length > 0 &&
      id.indexOf('PLACEHOLDER') === -1 &&
      /^G-[A-Z0-9]+$/.test(id);
  };

  // Nothing to report until a real property exists. Load nothing at all.
  if (!isReal(GA4_ID)) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('js', new Date());
  gtag('config', GA4_ID);

  var src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA4_ID);
  var s = document.createElement('script');
  s.async = true;
  s.src = src;
  document.head.appendChild(s);

  // Google Ads conversion tag. Only fires when an Ads ID is configured, so it
  // never double-counts a pageview against an Ads account that isn't ours.
  if (ADS_ID) {
    gtag('config', ADS_ID);
  }
})();
