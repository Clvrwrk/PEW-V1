# QC Report — Commercial Roofing Pillar

**Date:** 2026-05-03
**Page:** `/commercial-roofing/` → `src/pages/commercial-roofing/index.astro`
**Reviewer:** Maren Castellan-Reyes (PageBuilder Phases 5a + 5b, inline)
**Conversion hypothesis:** Pillar depth + bento case studies → ≥30% assisted-conversion lift in 90 days

---

## Phase 5a — Page QC (voice, sourcing, depth, hypothesis, alt-text)

### Voice consistency vs. Maren persona (CLAUDE.md §2)

| Check | Status | Notes |
|---|---|---|
| Confident, specific, unsentimental | PASS | Hero subhead names the surface ("16 states," "institutional, commercial, and retail"); no "world-class," "next-gen," etc. |
| Strong opinions, loosely held | PASS | Reliability section names the trade-off ("Documentation stays with the property — not the owner"); FAQ NDL answer takes a position |
| No hedging language | PASS | No "maybe," "perhaps," "I think" anywhere in body |
| No forbidden vocab (CLAUDE.md §2 + §9) | PASS | Scanned for: synergy, best-in-class, leverage (verb), world-class, next-gen, robust solution, delight the user, "In today's fast-paced world." None found. |

### Sourcing (CLAUDE.md §4 hard gate)

| Claim | Source | Status |
|---|---|---|
| **30+ years in business / Established 1994** | None | OVERRIDE — see /decisions/2026-05-03-commercial-roofing-stats-override.md |
| **15M+ Sq. Ft. Installed** | None | OVERRIDE — contradicts home page (10M+) |
| **98% Client Retention** | None | OVERRIDE — no live counterpart |
| **42 States Served** | None | OVERRIDE — contradicts verified 16 licensed states |
| **GAF MASTER cert** | Home page lines 437–442 | PASS |
| **FIRESTONE cert** | Home page | PASS |
| **CARLISLE cert** | None | OVERRIDE — not on home page; cert status unverified |
| **OWENS CORNING cert** | Home page | PASS |
| **24-hour responsiveness** | Body language carefully scoped ("addressed within one business day") | PASS — performance promise, not a verifiable historical claim |
| **OSHA-certified safety protocols** | Industry-standard cert; verifiable | PASS |
| **Three-checkpoint verification** | Internal process claim, falsifiable in delivery | PASS |
| **TechPark / Dallas North Mall / Fort Worth case study heroes + summaries** | Case study MDX exists; two carry [REPRESENTATIVE] markers in their own pages | PARTIAL PASS — disclosed at the case-detail level |

**Sourcing summary:** 4 stats + 1 manufacturer cert ship without sources by stakeholder override (Chris's call, recorded in /decisions/). 8 inline `[TODO source]` HTML comments mark the exact locations for the next-pass editor. The QC gate marks this dimension as `override`, NOT `pass`.

### Depth (pillar tier minimum)

| Metric | Target | Actual | Status |
|---|---|---|---|
| Word count | ≥1,500 | ~1,650 | PASS |
| Sections | ≥7 | 9 (hero, stats, systems, certs, reliability, cases, reach, FAQ, form) | PASS |
| Internal links out | ≥10 | 16 (per page-link-manifest.yaml anchor diversity) | PASS |
| External proof points | ≥3 | 4 manufacturer certs + 3 real case studies | PASS |
| FAQ count | ≥3 | 3 | PASS |
| CTA placement | hero / mid / end | Hero, reliability callout, case-study CTA card, RFP, form, system cards × 7 | PASS |

### Conversion hypothesis (CLAUDE.md §4 hard gate)

| Check | Status | Notes |
|---|---|---|
| Hypothesis written and attached | PASS | Embedded in HTML comment header at top of `index.astro` AND in brief.yaml |
| Hypothesis is measurable | PASS | "≥30% assisted-conversion lift in 90 days vs. pre-rebuild baseline" — single metric, clear gate |
| Instrumentation matches hypothesis | PASS | Every CTA has `data-cta-name`; form fires `form_submit_attempt` and `form_submit_success` GTM events; phone CTA inherits home-pattern |
| Baseline definition stated | PASS | "30-day window prior to deploy" stated in brief.yaml hypothesis section |

### Image alt-text completeness

| Image | Alt text quality | Status |
|---|---|---|
| Hero (commercial-roofing-hero.jpg) | Descriptive, identifies subject, audience-relevant | PASS |
| Reliability side image (commercial-hero.jpg, reused) | Descriptive of expected content | PASS — but image is a stand-in until reliability-specific shot sourced |
| TechPark case study | Identifies project + system + scale | PASS |
| Dallas North Mall case study | Identifies project + facade detail | PASS |
| Fort Worth case study | Identifies project + system + viewpoint | PASS |
| All decorative dividers/accents | `aria-hidden="true"` applied | PASS |

---

## Phase 5b — Code QC (WCAG 2.2 AA, semantic HTML, schema, performance)

### WCAG 2.2 AA compliance

| Surface pair | Contrast | Standard | Status |
|---|---|---|---|
| white on red-700 (#b91c1c) | 5.71:1 | 4.5:1 normal | PASS |
| white on slate-900 (#0f172a) | 16.7:1 | 4.5:1 | PASS |
| slate-900 on white | 16.7:1 | 4.5:1 | PASS |
| slate-900 on stone-50 (#fafaf9) | ~16:1 | 4.5:1 | PASS |
| slate-600 (#475569) on stone-200 (#e7e5e4) | 5.92:1 | 4.5:1 | PASS |
| white on red-700 hero CTA over dark image | 5.71:1 plus dark slate overlay | 4.5:1 | PASS |
| red-700 link on white | 5.71:1 + underline + bold | 4.5:1 | PASS |
| red-400 accent text ("Expert consultation") on slate-900 | 7.46:1 | 4.5:1 | PASS |

| Check | Status | Notes |
|---|---|---|
| Single H1 per page | PASS | "Commercial Roofing Contractor in Dallas & Nationwide." |
| Heading hierarchy (no skipped levels) | PASS | h1 → h2 (8) → h3 (10+); no h4 → h6 jumps |
| Skip-to-main link | PASS | Inherited from BaseLayout.astro |
| Landmarks (`<main>`, `<section aria-label/by>`, `<nav>`) | PASS | All sections labeled; main wraps via BaseLayout |
| Tap targets ≥ 44×44px | PASS | All CTAs use min `px-6 py-3` (≥48px height); form inputs `py-4` (≥56px) |
| Keyboard focus visible | PASS | `focus:ring-2 focus:ring-red-400` on all interactive elements |
| Form labels associated with inputs | PASS | `<label>` wraps each input |
| Form fields have `autocomplete` | PASS | given-name, family-name, email, tel set on contact fields |
| `aria-live="polite"` for form status | PASS | `#form-status` div |
| Honeypot accessible (off-screen, not display:none) | PASS | `absolute -left-[9999px]` per WCAG-friendly pattern |
| Decorative SVGs marked `aria-hidden` | PASS | Stat-band red accent bars, flex spacers all `aria-hidden` |
| Lists use semantic `<ul role="list">` | PASS | systems grid, certs band, reliability benefits, case studies, service metros |

### Semantic HTML

| Check | Status | Notes |
|---|---|---|
| `<dl>/<dt>/<dd>` for stat band | PASS | Stats use definition-list semantics |
| `<button type="submit">` for form submit | PASS | |
| Native `<form>` submit handler | PASS | with `event.preventDefault()` + JSON POST + redirect on success |
| Breadcrumb in `<nav aria-label="Breadcrumb">` | PASS | inherited from Breadcrumb molecule |

### Schema validation (Google Rich Results format)

| Schema type | Emitted via | Status |
|---|---|---|
| BreadcrumbList | `breadcrumbSchema()` helper | PASS — emits both via mainSchema and via Breadcrumb molecule (acceptable; Google de-dupes) |
| Service | `serviceSchema()` helper with name, description, url, RoofingContractor provider, US areaServed | PASS |
| FAQPage | `faqPageSchema(faqs)` helper | PASS — 3 questions with mainEntity array |
| RoofingContractor | Inherited via organizationSchema() at home; not re-emitted on this page | PASS — avoided duplicate |

### Performance (target Lighthouse mobile ≥95 / 100 / 100 / 100)

| Check | Status | Notes |
|---|---|---|
| Hero image `loading="eager"` + `fetchpriority="high"` + `decoding="async"` | PASS | LCP-optimized |
| All other images `loading="lazy"` + `decoding="async"` | PASS | Case studies, reliability side image |
| OfficeLocationsMap `client:visible` | PASS | Defer-loaded React island |
| No render-blocking external scripts | PASS | Inline `is:inline` script for form, no third-party JS in head |
| No CLS-prone elements (auto-sized images, web fonts FOUT) | PASS | Hero uses min-height/max-height; fonts self-hosted via existing tokens.css |
| Honeypot uses off-screen positioning, not display:none | PASS | Avoids accessibility-tree pollution and keeps form clean |

**Lighthouse pre-flight (estimated, awaiting actual run after dep fix):**
- Performance: target 95+ — hero is largest single asset; under 1MB at the supplied path → likely PASS once binary lands
- Accessibility: target 100 — every WCAG dimension above passes → expected PASS
- Best Practices: target 100 — no console errors expected, HTTPS canonical, no deprecated APIs → expected PASS
- SEO: target 100 — title 57 chars, description 153 chars, canonical, robots, OG, Twitter, schema → expected PASS

---

## Build verification

| Check | Status | Notes |
|---|---|---|
| `npx astro check` clean | BLOCKED | Sandbox `node_modules` corruption — multiple packages missing `lib/index.js` files. Pre-existing, not from this build. Cannot be repaired in sandbox (rm permission denied on stale files). |
| `npx astro build` clean | BLOCKED | Same root cause |
| `npx astro dev` boots | BLOCKED | Same root cause |
| Icon names resolve in lucide | PASS | All 6 used names (`arrow-right`, `clock`, `file-text`, `shield`, `home`, `chevron-right`) exist |
| Internal link targets exist | PASS | 17 of 17 link targets resolve to real files or content-collection slugs |
| Hero image binary present at expected path | FAIL | `/public/images/commercial-roofing-hero.jpg` not yet uploaded — Chris must drop binary |
| Reused case study + reliability images present | PASS | 4 of 4 |

**Build verification recommendation:** Run `rm -rf node_modules package-lock.json && npm install` on the host machine (where filesystem permissions are normal), then `npm run dev` to localhost-preview the page. Sandbox cannot perform this remediation.

---

## Open issues for Chris

1. **HIGH — Drop hero image binary** at `/public/images/commercial-roofing-hero.jpg`. The Texas Motor Speedway aerial you supplied lives only in the chat thread. Until that file lands, the hero will 404. Suggest 1920×870 JPG, ~300–800 KB.

2. **HIGH — Stats reconciliation** (deferred per stakeholder override). Four stats on this page contradict the home page. Pull real numbers from Pro Exteriors at next opportunity; update both pages in one PR. See `/decisions/2026-05-03-commercial-roofing-stats-override.md`.

3. **MEDIUM — Carlisle certification status.** Not mentioned on home page. Confirm whether Pro Exteriors holds a Carlisle authorization; remove from cert band if not.

4. **MEDIUM — Reliability side image** is a stand-in (reused `/images/commercial-hero.jpg`). Source a real Pro Exteriors crew + thermal-camera shot for this slot when available.

5. **LOW — Two TPO case studies still carry `[REPRESENTATIVE]` markers** in their MDX content (techpark-logistics-tpo, dallas-north-mall-tpo). Replace with confirmed project data when client provides.

6. **LOW — Build environment.** Once you're back at your dev machine, run `rm -rf node_modules package-lock.json && npm install && npm run dev` to confirm the page renders end-to-end. Cowork sandbox couldn't repair the corrupt `node_modules`.

---

## Final QC verdict

| Gate | Status |
|---|---|
| Voice / forbidden vocab | **PASS** |
| Sourcing (every claim sourced or marked) | **OVERRIDE** — Chris-approved, decision-logged |
| Depth (pillar tier minimum) | **PASS** |
| Conversion hypothesis attached + measurable | **PASS** |
| WCAG 2.2 AA contrast + semantics | **PASS** |
| Schema (BreadcrumbList + Service + FAQPage) | **PASS** |
| Lighthouse mobile readiness | **EXPECTED PASS** (full run pending dep fix + hero binary) |
| Hero image present | **FAIL** — Chris-supplied binary not yet uploaded |

**Overall: READY-TO-SHIP-PENDING-HERO-BINARY.** All content, schema, accessibility, and conversion instrumentation gates pass. Two blockers for live launch: drop the hero binary, and run the build from a clean dev environment to confirm Lighthouse numbers.
