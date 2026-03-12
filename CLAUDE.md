# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Liberty Fencing is a **zero-dependency static website** — pure HTML, CSS, and vanilla JavaScript. No build tools, no package manager, no framework. However, it integrates several external APIs and services (Google Maps, a lead-intake webhook).

## Development

No build step required. To preview locally, open any `.html` file in a browser directly. The fence designer requires a live Google Maps API key to function.

**Deployment:** Automatic via GitHub Actions (`.github/workflows/static.yml`) on push to `master`.

> Note: The deploy workflow references the `master` branch correctly.

## Architecture

**Multi-page static site** with a main landing page and several standalone pages:

- `index.html` — Main landing page with anchor-based navigation: `#services`, `#gallery`, `#about`, `#areas`, `#quote`
- `fence-designer.html` — Interactive fence drawing tool with Google Maps (satellite), real-time pricing, and lead capture
- `security.html` — Premium security fencing landing page (Navy/gold color scheme, Playfair Display font)
- `privacy.html` — Privacy policy and SMS consent disclosures
- `terms.html` — Terms and conditions

**Shared assets:**
- `styles.css` — Styling for `index.html` using CSS custom properties for theming
- `script.js` — Smooth scroll, mobile menu toggle, Intersection Observer animations (used by `index.html`)
- `images/` — `fence-1.jpg` through `fence-15.jpg` (gallery photos)
- `logo.jpg` — Company logo

**Config:**
- `wrangler.jsonc` — Cloudflare Workers config (present but not actively deployed)
- `.github/workflows/static.yml` — GitHub Pages deployment workflow

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
- **Pricing engine** — per-foot rates by fence type (6 types) and material (4 variations each)
- **Lead capture** — submits name/phone/email + design data via `POST` to `https://fencepostos-production.up.railway.app/leads` (FencepostOS CRM on Railway)
- **URL sharing** — design state encoded as BASE64 in the URL hash for SMS/email sharing
- Mobile-responsive collapsible panel

## External Services

| Service | Purpose |
|---|---|
| Google Maps JS API | Satellite maps, geometry, address autocomplete in fence designer |
| FencepostOS (Railway) | Lead intake webhook — receives design + contact info |
| Twilio | SMS delivery for appointment/follow-up messages (referenced in privacy policy) |
| GitHub Pages | Static hosting via GitHub Actions |

## Quote / Estimate Section

The `#quote` section on `index.html` links to `https://libertyfencing.mybudgetquote.com/budget` (opens in new tab). There is no custom inline form on the main page — the fence designer is the primary custom quote tool.

## Business Info

- **Company:** Liberty Fencing — Southeast Missouri
- **Phone:** 573-222-0021
- **Email:** info@liberty-fencing.com
- **Hours:** Mon–Fri 7AM–6PM, Sat 8AM–4PM, closed Sunday
- **Founded:** 2024 by Ryan Cooper and Scott Parsons
