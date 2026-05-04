# PageBuilder Sequence Audit — 2026-05-04

**Last updated:** 2026-05-04  
**Auditor:** Maren Castellan-Reyes  
**Scope:** Entire Astro site, with emphasis on pages that should have gone through the AIA4 PageBuilder sequence before being treated as ship-ready.

---

## Verdict

No live page currently has a complete, verifiable PageBuilder pass under the contract in `/_aia4-skills/aia4-pagebuilder/references/orchestration-model.md`.

The site has several pages with partial PageBuilder lineage, but the records do not prove a full Phase 0-6 pass:

1. **Phase 4 assembly drift:** PageBuilder expects `design/templates/{slug}/index.astro` or a valid documented assembled page. Most residential manifests still point at deleted `src/pages/residential/...` paths.
2. **Phase 3/5 gaps:** many folders lack layout manifests, image manifests, page QC, and code QC.
3. **Runtime bypass:** live collection routes render MDX with generic `<Content />` prose templates instead of PageBuilder-assembled section layouts.
4. **Unresolved source/QC blockers:** even the best-recorded folders still contain pending Lighthouse, browser accessibility, real image, testimonial, form, source, or goal-config blockers.

This does not mean every site page needs PageBuilder. Legal, contact, thank-you, API, portal, and utility pages should not be judged by this pipeline. It does mean every service, pillar, city, subdivision, and other SEO/conversion page must be explicitly marked **PASS**, **PARTIAL**, **FAIL**, or **N/A** before launch.

---

## Pass Criteria Used

A page or template earns **PASS** only if the record proves all of the following:

- Phase 0: `brief.yaml`
- Phase 1: `seo-validator-manifest.yaml` and `page-link-manifest.yaml`
- Phase 2: `copy.yaml`
- Phase 3: `layout-manifest.yaml` and `image-manifest.yaml`
- Phase 4: assembled page exists at the documented output path or an equivalent live renderer is explicitly documented
- Phase 5: `page-qc-manifest.yaml` or `qc-report.md`, plus `code-qc-manifest.yaml`
- Phase 6: `delivery-manifest.yaml`
- Delivery hard gates are pass/ready-to-ship, not merely pending or blocked

Status definitions:

- **PASS:** full sequence and hard gates recorded as passed.
- **PARTIAL:** some sequence records exist, but at least one phase, output path, or hard gate is missing/pending/blocked.
- **FAIL:** PageBuilder-applicable page/folder exists without enough records to prove the sequence or is actively bypassed in runtime.
- **N/A:** PageBuilder is not the correct workflow for this page type.

---

## Sitewide Summary

| Area | Count / Scope | PageBuilder Applicability | Status | Notes |
|---|---:|---|---|---|
| Commercial roofing hub | 1 route | Required | PARTIAL | Live Astro page exists and has PageBuilder lineage, but missing layout/image/code-QC manifests in `design/templates/commercial-roofing`. |
| Residential roofing hub | 1 route | Required | PARTIAL | Live route is `/residential-roofing/`; manifest still references old `/residential` output and lacks code QC. |
| Commercial service pages | 6 routes | Required | PARTIAL | Runtime has structured magazine renderer for service entries, but individual service PageBuilder records are not complete. TPO has partial records. |
| Residential service pages | 6 live routes | Required | FAIL | Live renderer is generic hero + MDX prose. Template records point at deleted static routes or are incomplete. |
| Residential service template folders without live pages | 5 folders | Required if intended to ship | FAIL | Insurance claim, gutters, siding, tile/clay, natural slate, and hail/tarp naming drift are not represented as dedicated live service pages. |
| Commercial city pages | 4 routes | Required if treated as local SEO landing pages | FAIL | Generic hero + MDX prose; no PageBuilder records found. |
| Residential city pages | 4 routes | Required if treated as local SEO landing pages | FAIL | Generic shared residential renderer; no PageBuilder records found. |
| Subdivision pages | 2 routes | Required if treated as neighborhood pages | FAIL | Generic shared residential renderer; no PageBuilder records found. |
| Blog index and blog posts | 1 hub + 59 posts | Not current PageBuilder scope | N/A | Editorial workflow, not service/pillar PageBuilder. Needs its own editorial QC record. |
| Blog pillar MDX entries | 2 routes | Optional / ambiguous | PARTIAL | They are thin blog-hub pillar entries, not the primary commercial/residential money pillars. |
| Office pages | 6 routes | N/A | N/A | GBP/NAP factual pages; should have local data QA, not PageBuilder. |
| Case studies | 3 routes | Optional / case-study template | N/A for current service audit | Should use a case-study QC path when real client proof is available. |
| Contact / thank-you / legal / portal / utility / API pages | Multiple routes | N/A | N/A | Not PageBuilder page types. |

---

## Design Template Folder Audit

| Template folder | Status | Missing / failed proof | Runtime implication |
|---|---|---|---|
| `asphalt-shingles` | PARTIAL | Has all expected phase files, but `delivery-manifest.yaml` points at deleted `src/pages/residential/asphalt-shingles/index.astro`; hard gates still include pending/blocking items. | Live page is `/residential-roofing/asphalt-shingles/` through generic MDX renderer, not the assembled static page. |
| `blog-article` | FAIL | Missing all PageBuilder YAML manifests and delivery record. Only `blog-article-enhanced.html` exists. | Not a valid PageBuilder sequence record. |
| `commercial-roofing` | PARTIAL | Missing `layout-manifest.yaml`, `image-manifest.yaml`, and `code-qc-manifest.yaml`. Has `qc-report.md` and live page path. | Live `/commercial-roofing/` is structured, but record is incomplete. |
| `hail-damage-repair` | FAIL | Missing layout, image, page QC, and code QC. Output path points at deleted `src/pages/residential/hail-damage-repair/index.astro`; no matching live residential service MDX. | No current live page matching the manifest path. |
| `insurance-claim-assistance` | FAIL | Missing layout, image, page QC, and code QC. Output path points at deleted static route; no matching live service MDX. | Not shipped as a dedicated service page. |
| `metal-roofing` | FAIL | Missing layout, image, page QC, and code QC. Output path points at deleted `src/pages/residential/metal-roofing/index.astro`. | Live `/residential-roofing/metal/` renders generic MDX and contains unresolved copy artifacts. |
| `natural-slate` | FAIL | Missing layout, image, page QC, and code QC. Output path points at deleted static route; no matching live service MDX. | Not shipped as a dedicated service page. |
| `residential` | PARTIAL | Missing `code-qc-manifest.yaml`; delivery references old `src/pages/residential/index.astro` and `/residential`. | Live hub is `/residential-roofing/`; page has PageBuilder lineage but record is stale/incomplete. |
| `roof-replacement` | FAIL | Missing layout, image, page QC, and code QC. Output path points at deleted static route. | Live `/residential-roofing/replacement/` renders generic MDX. |
| `seamless-gutters` | FAIL | Missing layout, image, page QC, and code QC. Output path points at deleted static route; no matching live service MDX. | Not shipped as a dedicated service page. |
| `siding` | FAIL | Missing layout, image, page QC, and code QC. Output path points at deleted static route; no matching live service MDX. | Not shipped as a dedicated service page. |
| `storm-damage-repair` | FAIL | Missing layout, image, page QC, and code QC. Output path points at deleted static route. | Live equivalent is `/residential-roofing/storm-damage/`, but it uses generic MDX renderer. |
| `tarp-installation` | FAIL | Missing layout, image, page QC, and code QC. Output path points at deleted static route. | Live equivalent is `/residential-roofing/emergency/`, but it uses generic MDX renderer. |
| `tile-clay-roofing` | FAIL | Missing layout, image, page QC, and code QC. Output path points at deleted static route; no dedicated live service MDX. | Not shipped as a dedicated service page. |
| `tpo-roofing-systems` | PARTIAL | Missing `delivery-manifest.yaml` and `code-qc-manifest.yaml`; has `qc-report.md`, layout, image, copy, SEO, and link manifests. | Live `/commercial-roofing/tpo/` uses the commercial service magazine renderer and is closest to intended PageBuilder structure, but the record is still incomplete. |

**Result:** 0 PASS, 4 PARTIAL, 11 FAIL.

---

## Runtime Renderer Audit

| Runtime route / class | Renderer | Status | Reason |
|---|---|---|---|
| `src/pages/commercial-roofing/index.astro` | Static Astro section stack | PARTIAL | Structured page exists; records incomplete. |
| `src/pages/residential-roofing/index.astro` | Static Astro section stack | PARTIAL | Structured page exists; records stale/incomplete. |
| `src/pages/commercial-roofing/[service]/index.astro` | Structured service renderer when content has `intro`, `benefits`, or `processSteps`; prose fallback otherwise | PARTIAL | Commercial service MDX currently has structured fields, but PageBuilder records are incomplete and not per-service except TPO. |
| `src/pages/commercial-roofing/[city]/index.astro` | `HeroSection` + `<article class="prose"> <Content />` | FAIL | Local landing pages bypass PageBuilder sections and have no pipeline records. |
| `src/pages/residential-roofing/[slug]/index.astro` | Shared union route for residential services, cities, and subdivisions; hero + prose + FAQ + CTA | FAIL | This is the main failure. It ignores PageBuilder section manifests and renders raw MDX body copy. |
| `src/pages/blog/[slug]/index.astro` | Editorial article/pillar renderer | N/A for service PageBuilder | Blog posts should be governed by editorial QC, not service PageBuilder. |
| `src/pages/locations/[office]/index.astro` | Structured office/NAP page + optional prose | N/A | GBP/NAP factual page. |
| `src/pages/projects/[slug]/index.astro` | Case-study renderer + prose | N/A for current service audit | Needs case-study proof workflow later. |
| `src/pages/[legal]/index.astro` | Legal prose renderer | N/A | Legal/utility content. |

---

## Concrete Failures Found

### 1. Stale PageBuilder paths

Most residential delivery manifests still point to paths under `src/pages/residential/...`, but Phase 1 URL canon deleted those static routes and moved live publication under `/residential-roofing/`.

Examples:

- `design/templates/metal-roofing/delivery-manifest.yaml` points to `src/pages/residential/metal-roofing/index.astro`.
- `design/templates/asphalt-shingles/delivery-manifest.yaml` points to `src/pages/residential/asphalt-shingles/index.astro`.
- `design/templates/residential/delivery-manifest.yaml` points to `src/pages/residential/index.astro`.

### 2. Raw generated-copy artifacts in live content

`src/content/services/residential/metal.mdx` contains unresolved placeholders:

- `%LINK_0%`
- `%LINK_1%`

The live page at `/residential-roofing/metal/` exposes those artifacts because the MDX body bypasses PageBuilder Phase 4 assembly/link replacement.

### 3. Missing Phase 3 and Phase 5 artifacts

The most common missing records are:

- `layout-manifest.yaml`
- `image-manifest.yaml`
- `page-qc-manifest.yaml` or `qc-report.md`
- `code-qc-manifest.yaml`

This means we cannot prove brand-token layout compliance, image provenance/alt text, voice/sourcing QC, WCAG, schema, or Lighthouse at the individual page level.

### 4. Delivery manifests are not authoritative yet

Several delivery manifests exist, but they contain blocked or pending states:

- performance pending localhost verification
- browser accessibility pending
- source material blocked
- representative image/testimonial blockers
- form/CRM integration pending
- Google Rich Results validation pending

Those are legitimate blockers. The problem is that the pages were still promoted into `src/content` and published by generic renderers.

---

## PageBuilder-Applicable Live Routes Needing Remediation

### Highest Priority

| Route | Current status | Reason |
|---|---|---|
| `/residential-roofing/metal/` | FAIL | Generic MDX renderer; unresolved `%LINK_*%`; stale PageBuilder manifest path. |
| `/residential-roofing/asphalt-shingles/` | FAIL / PARTIAL record | Has the best template record, but live route bypasses assembled static output. |
| `/residential-roofing/replacement/` | FAIL | Generic MDX renderer; incomplete template record. |
| `/residential-roofing/storm-damage/` | FAIL | Generic MDX renderer; incomplete/stale template record. |
| `/residential-roofing/emergency/` | FAIL | Generic MDX renderer; template naming drift from `tarp-installation`. |
| `/residential-roofing/inspection/` | FAIL | No matching PageBuilder template record found for this live service. |

### Local SEO Pages

| Route group | Count | Current status | Reason |
|---|---:|---|---|
| `/commercial-roofing/{city}/` | 4 | FAIL | Generic prose renderer; no PageBuilder records. |
| `/residential-roofing/{city}/` | 4 | FAIL | Generic prose renderer; no PageBuilder records. |
| `/residential-roofing/{subdivision}/` | 2 | FAIL | Generic prose renderer; no PageBuilder records. |

### Better But Still Not Fully Proven

| Route | Current status | Reason |
|---|---|---|
| `/commercial-roofing/` | PARTIAL | Structured page, incomplete manifest set. |
| `/residential-roofing/` | PARTIAL | Structured page, stale/incomplete manifest set. |
| `/commercial-roofing/tpo/` | PARTIAL | Structured renderer and partial template record; missing delivery/code QC proof. |
| Other commercial services | PARTIAL | Structured renderer, but no complete per-service PageBuilder records. |

---

## Pages Marked N/A For PageBuilder

These still need QA, but not the service/pillar PageBuilder sequence:

- `404`, `500`
- `about/*`
- `careers`
- `contact/*`
- `thank-you/*`
- `portal`
- `property-card/*`
- `total-home-shield/*`
- `proplan`
- `legal` pages
- `locations` office pages
- `projects` case studies
- `blog` index and blog posts
- `api/lead`

Recommended alternate records:

- Blog: editorial QC + link/silo audit + schema/image audit.
- Offices: GBP/NAP audit + LocalBusiness schema audit.
- Case studies: real-project proof, testimonial release, image provenance, and case-study schema QC.
- Contact/funnel: form routing, event tracking, accessibility, and conversion-path QA.

---

## Remediation Plan

### Phase A — Stop The Bleeding

1. Add a machine-readable PageBuilder registry, e.g. `src/data/pagebuilder-audit.json`, with every live route and status: `pass`, `partial`, `fail`, or `na`.
2. Add an audit script that fails if a PageBuilder-required route is missing a registry entry or has `status: fail` without a launch-blocking flag.
3. Fix unresolved placeholders in live MDX immediately, starting with `src/content/services/residential/metal.mdx`.

### Phase B — Repair The Runtime Architecture

1. Build a structured residential service renderer parallel to the commercial service renderer.
2. Promote PageBuilder section data into `src/content/services/residential/*.mdx` frontmatter or into dedicated page data modules.
3. Stop relying on raw `<Content />` as the primary service-page layout.
4. Retarget all residential manifests from `/residential/...` to `/residential-roofing/...`.

### Phase C — Re-run PageBuilder Where It Matters

Priority order:

1. `metal-roofing` because it visibly failed and contains `%LINK_*%`.
2. `asphalt-shingles` because it is the canonical residential-service template and has the fullest record.
3. `replacement`, `storm-damage`, `emergency`, `inspection`.
4. Commercial services missing per-page records.
5. City and subdivision pages.

### Phase D — Lock Delivery Gates

For each PageBuilder-required route, require:

- current canonical URL
- template folder
- phase files present
- live renderer path
- Page QC status
- Code QC status
- Lighthouse status
- source/trust status
- analytics status
- launch decision

No page should be marked ready-to-ship while trust, forms, schema validation, or analytics are pending.

---

## Bottom Line

The issue is systemic. The site has a working Astro build and several structured pages, but the PageBuilder record system did not survive the Phase 1 URL canon move. The immediate technical failure is the shared residential dynamic renderer; the operational failure is that delivery manifests were treated as if they proved completion even when their output paths were stale or their hard gates were pending.

Until the registry and renderer fixes land, the honest launch status is:

**PageBuilder compliance: FAIL sitewide, with partial lineage on the commercial/residential hubs, TPO, asphalt shingles, and commercial service renderer.**
