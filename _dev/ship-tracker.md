# 48-Hour Ship Tracker — LF Website

**Started:** Fri 9/11 16:15 CT
**Target:** Sun 9/13 EOD

## Status: P0 COMPLETE ✅

## Coop answers (logged 9/11)

- **Q1 — Lifetime warranty:** NO. Remove the claim or replace with "warranty on labor." Don't claim lifetime.
- **Q2 — Install duration:** 2-4 days typical. Add to 3-step process: "call → walk → 24-hr quote → install in 2-4 days."
- **Q3 — Public pricing:** DELIBERATE. Transparency is the strategy. Amplify: "We publish our prices."

---

## Day 1 — Saturday 9/12

### P0 — Fix bleeding bugs ✅ ALL DONE

- [x] **#1** Security form → Apps Script endpoint — commit `3b6ca6f`
- [x] **#2** Gate pricing — verified already keyed by ID, fallbacks stripped — commit `6aecc65`
- [x] **#3** Strip hardcoded fallback prices — done in `6aecc65`
- [x] **#4** JSONP backup for server-error detection — done in `6aecc65`

### P1 — Foundation (next)

- [ ] **#5** Schema.org LocalBusiness + Service markup (30 min)
- [ ] **#6** sitemap.xml (30 min)
- [ ] **#7** Custom robots.txt (15 min)
- [ ] **#8** aggregateRating structured data (30 min)
- [ ] **#9** Google Analytics gtag.js (1 hr)
- [ ] **#10** Mobile speed audit (1 hr)

### Deploy prep

- [ ] **#11** Bundle Day 1 commits
- [ ] **#12** Stage Scott handoff doc

---

## Day 2 — Sunday 9/13

### P2 — Position + UX

- [ ] **#13** Hero rewrite ("See your price... we publish our prices")
- [ ] **#14** Promote fence designer to hero
- [ ] **#15** Move testimonials above fold
- [ ] **#16** Add Ryan + Scott photo + names
- [ ] **#17** 3-step process: call → walk → 24-hr quote → install in 2-4 days

### P3 — Content + crawlability

- [ ] **#18** Compress gallery (5.3 MB → ~500 KB)
- [ ] **#19** Crawlable copy on fence-designer.html
- [ ] **#20** Fix broken review link, gallery captions
- [ ] **#21** Remove "Lifetime warranty" claim (Coop: no lifetime warranty)
- [ ] **#22** Bitcoin payment line
- [ ] **#23** Name the Rhino equipment

### Ship

- [ ] **#24** Bundle Day 2 commits
- [ ] **#25** Hand off to Scott
- [ ] **#26** Cloudflare cache purge

---

## Git log

```
6aecc65 P0: gate pricing + fallback handling + JSONP lead backup
3b6ca6f P0: wire security page form to lead webhook
1be52a1 Add warm customer-facing sentiment to tutorial's final step (Coop, never deployed)
```

---

## P1 next steps

I'll start with #5 (Schema.org markup) since it's quick + high impact for SEO.
Then #6 (sitemap), #7 (robots), #8 (aggregateRating) — all under 30 min each.
