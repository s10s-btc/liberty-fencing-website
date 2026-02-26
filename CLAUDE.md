# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Liberty Fencing is a **zero-dependency static website** — pure HTML, CSS, and vanilla JavaScript. No build tools, no package manager, no framework.

## Development

No build step required. To preview locally, open `index.html` in a browser directly.

**Deployment:** Automatic via GitHub Actions (`.github/workflows/deploy.yml`) on push to `master`.

> Note: The deploy workflow references the `main` branch, but the repo uses `master`. Keep this in mind if auto-deploy isn't triggering.

## Architecture

**Single-page layout** — one `index.html` with anchor-based navigation:
- `#services`, `#gallery`, `#about`, `#areas`, `#quote`

**Files:**
- `index.html` — All content and page sections
- `styles.css` — All styling using CSS custom properties for theming
- `script.js` — Smooth scroll, mobile menu toggle, Intersection Observer animations, phone number formatting
- `images/` — `fence-1.jpg` through `fence-15.jpg` (gallery)

## CSS Conventions

- CSS variables defined on `:root`: primary color `#1a1a1a`, accent gold `#f4a818`
- BEM-like class naming (`.service-card`, `.gallery-item`, `.form-group`)
- Responsive breakpoints at 1024px, 768px, 480px

## Quote / Estimate Section

The `#quote` section has a link that opens `https://libertyfencing.mybudgetquote.com/budget` in a new tab (`target="_blank"`). There is no custom form.

## Business Info

- **Company:** Liberty Fencing — Southeast Missouri
- **Phone:** 573-222-0021
- **Email:** info@liberty-fencing.com
- **Hours:** Mon–Fri 7AM–6PM, Sat 8AM–4PM, closed Sunday
- **Founded:** 2024 by Ryan Cooper and Scott Parsons
