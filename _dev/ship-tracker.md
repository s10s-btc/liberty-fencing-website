# 48-Hour Ship Tracker — LF Website

**Started:** Fri 9/11 16:15 CT
**Target:** Sun 9/13 EOD
**Current:** 42% complete (10/24 tasks)

## Coop answers (logged 9/11)

- **Q1 — Lifetime warranty:** NO. Remove the claim or replace with "warranty on labor."
- **Q2 — Install duration:** 2-4 days typical.
- **Q3 — Public pricing:** DELIBERATE. Transparency is the strategy.

---

## Day 1 — Saturday 9/12

### P0 — Fix bleeding bugs ✅ ALL DONE

- [x] **#1** Security form → Apps Script endpoint — commit `3b6ca6f`
- [x] **#2** Gate pricing + fallbacks stripped — commit `6aecc65`
- [x] **#3** Strip hardcoded fallback prices — done in `6aecc65`
- [x] **#4** JSONP backup for server-error detection — done in `6aecc65`

### P1 — Foundation ✅ ALL DONE

- [x] **#5** Schema.org LocalBusiness markup (with aggregateRating) — done in `a9a19f7`
- [x] **#6** sitemap.xml — done in `a9a19f7`
- [x] **#7** Custom robots.txt — done in `a9a19f7`
- [x] **#8** aggregateRating structured data — done in `a9a19f7`
- [x] **#9** Google Analytics gtag.js (placeholder G-PLACEHOLDER-LF) — done in `a9a19f7`
- [x] **#10** Image compression (WebP + JPG re-encode, 21% smaller) — done in `a9a19f7`

### Deploy prep

- [ ] **#11** Bundle Day 1 commits
- [ ] **#12** Stage Scott handoff doc

---

## Day 2 — Sunday 9/13

### P2 — Position + UX

- [ ] **#13** Hero rewrite
- [ ] **#14** Promote fence designer to hero
- [ ] **#15** Move testimonials above fold
- [ ] **#16** Add Ryan + Scott photo + names
- [ ] **#17** 3-step process section

### P3 — Content + crawlability

- [ ] **#18** Image compression (DONE in P1 #10)
- [ ] **#19** Crawlable copy on fence-designer.html
- [ ] **#20** Fix broken review link, gallery captions
- [ ] **#21** Remove "Lifetime warranty" claim
- [ ] **#22** Bitcoin payment line
- [ ] **#23** Name the Rhino equipment

### Ship

- [ ] **#24** Bundle Day 2 commits
- [ ] **#25** Hand off to Scott
- [ ] **#26** Cloudflare cache purge

---

## Git log

```
a9a19f7 P1: SEO foundation + image compression + analytics (54 files)
6aecc65 P0: gate pricing + fallback handling + JSONP lead backup
3b6ca6f P0: wire security page form to lead webhook
1be52a1 Add warm customer-facing sentiment to tutorial's final step (Coop, never deployed)
```

---

## Notes

- Google Analytics placeholder `G-PLACEHOLDER-LF` needs to be replaced with Coop's real GA4 ID before deploy
- Original gallery images backed up to `images.original/` in case rollback needed
- WebP versions give 21% size reduction for browsers that support them

---

## What's next

P2 — Position + UX. Starting with #13 (hero rewrite) — the highest-impact content change.
