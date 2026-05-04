# Round 2 Changelog — Commercial Roofing Pillar

**Date:** 2026-05-03 (same day as initial build)
**Reviewer:** Chris Hussey
**Author of changes:** Maren Castellan-Reyes
**Page:** `src/pages/commercial-roofing/index.astro`

Six revisions applied after Chris reviewed the round-1 build.

---

## 1. Hero image resolved

**Was:** Wired to `/images/commercial-roofing-hero.jpg` (didn't exist; Chris was supposed to drop a Texas Motor Speedway binary there).

**Now:** Wired via `<picture>` element to `/images/commercial-hero.webp` (1.4 MB, already on disk) with `/images/commercial-hero.jpg` (940 KB) as the `<img>` fallback for non-webp clients.

**Why:** Chris confirmed the speedway image *IS* the existing `commercial-hero.webp` file — no separate upload needed.

**Side effect:** The home page's audience-split commercial card uses `/images/commercial-hero.jpg` directly (line 130 of `src/pages/index.astro`). It now points to the same hero image as the new pillar — visually consistent, intentional brand alignment.

---

## 2. Residential image removed from case studies bento

**Was:** Dallas North Mall case-study card displayed `/images/projects/tpo-dallas-north-mall.webp` — which is actually a *residential* post-hail shingle photo per the home page's alt text (line 322 of `src/pages/index.astro`).

**Now:** Same Dallas North Mall card displays `/images/projects/tpo-gallery-2.webp` (real commercial gallery shot, 50 KB). Alt text rewritten to describe a TPO membrane install scene.

**Why:** Chris flagged that no residential roofing case studies should appear on the commercial pillar. The case study mdx (`dallas-north-mall-tpo`) was correctly tagged retail; the *image* was the mismatch.

**Open follow-up:** The case study mdx itself still references `tpo-dallas-north-mall.webp` as its hero. That's a separate page — fix on next case-study build pass.

---

## 3. Bento rebuilt with asymmetric Figma layout

**Was:** A 4-column equal-grid (3 cases + 1 small CTA card). The CTA card felt visually undersized and left dead space below "Your Project Next?".

**Now:** A `grid-cols-3` × `grid-flow-row-dense` layout with `auto-rows-[300px]`:
- TechPark (industrial) — `lg:col-span-2 row-span-1` — wide top-left landscape
- Your Project Next? (CTA) — `lg:col-span-1 row-span-2` — tall vertical right column with Submit RFP + Request Assessment dual CTAs
- Fort Worth (industrial) — `lg:col-span-1 row-span-1` — square middle-left
- Dallas North Mall (retail) — `lg:col-span-2 row-span-1` — wide bottom landscape

**Why:** Chris flagged whitespace after the small CTA. The Figma original had asymmetric tile sizes; round-1 simplified to a uniform grid that lost visual weight. Round-2 restores the Figma's variety using the same 3-real-cases + 1-CTA tile count Chris approved at intake — but the tiles fill the bento area.

**Bonus:** The CTA card now carries **two** CTAs (Submit RFP + Request Assessment) instead of one, so the tall vertical surface earns its real estate.

---

## 4. Map section rebuilt full-width to match `/locations/`

**Was:** Two-column section with a left "Dallas Rooted. Nationwide Reach." heading + 3-line body + bulleted metro list, and a right column with `OfficeLocationsMap`. The metro list duplicated information already shown by the map's pins.

**Now:** Centered title ("Dallas Rooted. Nationwide Reach.") + centered subhead ("Click any office pin to view details and dispatch the closest team."), then full-width `OfficeLocationsMap` in the same `bg-surface-elevated p-4 rounded-3xl shadow-xl ring-1 ring-border` wrapper used by `/pages/locations/index.astro` and `/pages/index.astro`. Section uses `bg-surface-inset` and `id="reach"`.

**Why:** Chris asked for the locations-page formatting. This now matches `/locations/` byte-for-byte structurally. Three pages (home, locations, commercial pillar) all render the map identically — single visual idiom, no proliferation.

**Side effect:** The `serviceMetros` constant in the frontmatter was deleted. Comment placeholder remains as documentation for the next editor.

---

## 5. FAQ expanded from 3 to 7 (DataForSEO People Also Ask)

**Was:** 3 FAQs from the Figma design.

**Now:** 7 FAQs — the original 3 plus 4 from the SERP "People Also Ask" block for "commercial roofing contractor."

**Source:** `tech/scripts/output/dataforseo/20260503-163400-serp-advanced.json` — DataForSEO SERP advanced endpoint with `people_also_ask_click_depth: 4`.

**PAA harvest (raw):**
1. What does a commercial roof cost? → kept (rephrased "per square foot")
2. What is the 25% rule for roofing? → kept verbatim
3. What does a commercial roofer do? → kept (rephrased "what's different from a residential one")
4. How to tell if a roofer is lying? → kept (rephrased "honest" — softer for a procurement audience)
5. What is the best time of year to replace shingles? → **dropped** (residential, shingles)
6. What color roof increases home value? → **dropped** (residential, home value)
7. Will roofing prices go down in 2026? → **dropped** (date-stamps the page; fragile content)

**Final order on page** (decision-funnel logic, not random):
1. How long does a commercial roof replacement typically take? *(timeline — first procurement question)*
2. What does a commercial roof cost per square foot? *(price — second procurement question)*
3. What does a commercial roofer actually do that's different from a residential one? *(category education)*
4. What is an NDL warranty and why do I need it? *(specifier-level question)*
5. What is the 25% rule for roofing? *(decision framework)*
6. How do I tell if a commercial roofer is being honest with me? *(trust/risk avoidance)*
7. Can you perform work without interrupting our business operations? *(operational concern)*

**Schema impact:** `faqPageSchema(faqs)` now emits 7 questions instead of 3. Eligible for an expanded rich-result snippet.

**Word count impact:** ~+850 words added (FAQ answers run 80–150 words each). New page total ~2,500 words.

---

## 6. Project Details textarea added to assessment form

**Was:** 8 fields total — 4 qualifying (Company, Facility, Sq Ft, Timeline) + 4 contact (First, Last, Email, Phone). Qualifying fields composed into `projectDetails` API payload behind the scenes; no freeform context.

**Now:** 9 fields — same as above + a freeform Project Details textarea positioned between qualifying and contact field groups. Placeholder copy guides the prospect to mention roof condition, recent leaks, deadlines, deck type, manufacturer warranty status, etc.

**Form JS update:** Submission now combines the qualifying fields summary + the freeform textarea into a single `projectDetails` string with a clear separator:

```
Company: Acme · Facility: Warehouse / Industrial · Approx. Sq. Ft.: 100000 · Timeline: Within 30 days

— Project notes —
We had a hailstorm last week and our facility manager noticed three new leaks in zone B. Looking to assess before the next big storm. Roof is 12 years old, original GAF TPO membrane, no current warranty maintenance.
```

The sales team sees structured info first, prospect's voice second.

**Why:** Procurement prospects often have specific context (deadlines, deck conditions, prior contractor work) that doesn't fit dropdowns. Without a freeform field, that context goes into the email follow-up — which delays first-touch quality.

**A11y:** Textarea has visible label, associated `<label>`, placeholder content, helper text ("Optional, but the more context the sharper the assessment"), `resize-y` allows user to expand, `min-h-[120px]` prevents collapse below useful size.

---

## What didn't change

- Hero copy, eyebrow, dual CTAs
- Stat band (still ships per stakeholder override; still flagged in QC)
- 7-system grid
- Manufacturer cert band
- Industrial-Grade Reliability section (3 benefits + image + executive callout)
- Conversion hypothesis (still ≥30% assisted-conversion lift in 90 days)
- Schema graph (BreadcrumbList + Service + FAQPage — FAQPage now has 7 mainEntity items)
- Analytics instrumentation (every CTA still tagged with `data-cta-name`; new `cases_request_assessment` tag added on the CTA card's secondary button)

## Updated artifact paths

- Round 2 changelog (this file): `design/templates/commercial-roofing/round-2-changelog.md`
- DataForSEO PAA source: `tech/scripts/output/dataforseo/20260503-163400-serp-advanced.json`
- All other manifests at `design/templates/commercial-roofing/` reflect round-2 state

## QC delta

| Gate | Round 1 | Round 2 |
|---|---|---|
| Hero image present | FAIL | **PASS** (resolved to existing webp) |
| Residential imagery on commercial pillar | minor — flagged dallas-north-mall image | **CLEAN** — swapped to commercial gallery shot |
| Bento visual balance | minor — small CTA, dead space | **PASS** — asymmetric Figma-faithful layout |
| Map section formatting consistency | functional but bespoke | **PASS** — matches /locations/ pattern |
| FAQ depth | 3 questions (Figma minimum) | **PASS** — 7 questions, schema-eligible expanded rich result |
| Form context capture | qualifiers only | **PASS** — qualifiers + freeform |
| Word count | ~1,650 | **PASS** — ~2,500 (well above pillar 1,500 minimum) |

**Overall after round 2:** READY-TO-SHIP-PENDING-LOCAL-BUILD-VERIFY. Hero blocker resolved; only remaining gate is running `rm -rf node_modules package-lock.json && npm install && npm run dev` on Chris's machine to confirm Lighthouse numbers. Sandbox can't perform the dep repair.
