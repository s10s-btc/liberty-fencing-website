# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Liberty Fencing is a **zero-dependency static website** — pure HTML, CSS, and vanilla JavaScript. No build tools, no package manager, no framework. However, it integrates several external APIs and services (Google Maps, a lead-intake webhook).

## Development

No build step required. To preview locally, open any `.html` file in a browser directly. The fence designer requires a live Google Maps API key to function.

**Deployment:** `www.liberty-fencing.com` is served by a Cloudflare Worker (`liberty-fencing-website`, Git-connected via Cloudflare Workers Builds), which builds from this repo's `master` branch directly — pushing to `master` deploys to production. `.github/workflows/static.yml` also exists and deploys to GitHub Pages on push to `master`, but GitHub Pages is not in the production serving path.

## Architecture

**Multi-page static site** with a main landing page and several standalone pages.

## CSS Conventions

- CSS variables defined on `:root`: primary color `#1a1a1a`, accent gold `#f4a818`
- BEM-like class naming (`.service-card`, `.gallery-item`, `.form-group`)
- Responsive breakpoints at 1024px, 768px, 480px
- `security.html` uses its own inline styles: Navy `#1B2A4A`, gold `#C9A84C`, Playfair Display / Libre Baskerville fonts

## Fence Designer (`fence-designer.html`)

Full-screen Google Maps tool (48 KB). Key features:
- **Google Maps API** — satellite imagery, geometry library for distance calculation, address autocomplete
  - API key is embedded directly in `fence-designer.html`
- **Drawing tools** — user sketches fence lines as polylines on their property
- **Pricing engine** — per-foot rates by fence type and material, loaded live from a Google Sheet on page load (`GET` to the Apps Script webhook, `?action=products`)
- **Lead capture** — submits name/phone/email + design data via `POST` to a Google Apps Script webhook (`CONFIG.webhookUrl`), which writes to a Google Sheet. Uses `mode: 'no-cors'` since Apps Script `doPost` can't set CORS headers — the client can detect outright network failures but not server-side errors (opaque response).
- **URL sharing** — design state encoded as BASE64 in the URL hash for SMS/email sharing
- Mobile-responsive collapsible panel

Backend logic for both lead intake and the admin dashboard (`dashboard.html`) lives in `leads-script.gs`, deployed as the Apps Script web app.

## External Services

| Service | Purpose |
|---|---|
| Google Maps JS API | Satellite maps, geometry, address autocomplete in fence designer |
| Google Apps Script (`leads-script.gs`) | Lead intake + pricing data — reads/writes a Google Sheet, backs the fence designer and `dashboard.html` |
| Twilio | SMS delivery for appointment/follow-up messages (referenced in privacy policy) |
| Cloudflare Workers | Production hosting — Git-connected Workers Builds project, deploys from `master` on every push |

## Quote / Estimate Section

The `#quote` section on `index.html` links to `https://libertyfencing.mybudgetquote.com/budget` (opens in new tab). There is no custom inline form on the main page — the fence designer is the primary custom quote tool.

## Business Info

- **Company:** Liberty Fencing — Southeast Missouri
- **Phone:** 573-222-0021
- **Email:** info@liberty-fencing.com
- **Hours:** Mon–Fri 7AM–6PM, Sat 8AM–4PM, closed Sunday
- **Founded:** 2024 by Ryan Cooper and Scott Parsons
