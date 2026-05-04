# Project Handoff — Pro Exteriors Website
**Project:** Pro Exteriors Website
**Repo:** https://github.com/Clvrwrk/PEW-V1.git
**Production URL:** not yet launched; staging/demo URL in current robots file is `https://pc-demo.cleverwork.io`
**Date:** 2026-05-04 02:46
**Agent:** Maren Castellan-Reyes, Senior Director, Website & Application Experience
**Reason:** User-requested full project handoff

---

## Accomplished This Session

### Phase 1 Seed Compliance Commit And Cleanup

- `a60137e`: committed the Phase 1 Seed URL compliance work as `feat(phase1): enforce seed URL compliance`.
- Working tree cleanup: deleted duplicate ` 2` artifacts, restored tracked design/source deletions, and left handoff docs uncommitted.
- `docs/handoffs/archive/2026-05-04-0214.md`: existing archive copy of the previous handoff remains available.

### Image Performance Pipeline

- `public/images/**`: converted shipped JPG raster assets to optimized WebP and removed the original deployable JPG files.
- `public/images/**/*.webp`: re-encoded existing WebP assets against tighter page-role budgets.
- `public/images/residential-hero-mobile.webp`: added a smaller mobile LCP source for `/residential-roofing/`.
- `public/images/og-default.webp`: added a valid default OpenGraph image.
- `public/images/offices/{atlanta,denver,kansas-city,wichita}-hero.webp`: added missing Phase 0 office hero slots using existing local imagery.
- `public/images/subdivisions/twin-creeks-allen-hero.webp`: added the missing subdivision hero slot.
- `public/Logos/*.svg`: removed oversized runtime SVG logo/favicon files from deployable public assets.
- `public/Logos/{pro-exteriors-logo-light,pro-exteriors-logo-dark,favicon-light,favicon-dark}.webp`: added lightweight logo/favicon runtime assets.
- `src/components/atoms/SiteLogo.astro`: switched the site logo to optimized WebP assets with corrected intrinsic dimensions.
- `src/components/seo/BaseLayout.astro`: switched default OG image and favicon references to WebP.
- `src/content/**/*.mdx`: rewrote local image frontmatter from JPG paths to WebP paths and fixed residential image folder drift.
- `src/pages/{index,blog/index,locations/index,commercial-roofing/index,residential-roofing/index}.astro`: rewrote runtime image paths to WebP and fixed stale/missing image references.
- `src/pages/residential-roofing/index.astro`: replaced missing placeholder JPGs with actual optimized local WebP assets and added a mobile hero `<picture>` source.
- `src/lib/schema/{Article,CaseStudy,JobPosting,LocalBusiness,Organization}.ts`: replaced remote `logo.png` fallbacks with the optimized WebP logo URL.
- `scripts/audit-images.mjs`: added a build gate that fails on non-WebP deployable raster assets, missing local image references, `.original` leakage, unsupported deployable image formats, and over-budget image files.
- `package.json`: wired `audit:images` into the production `build` chain after existing contrast/schema/silo/orphan/GBP audits.
- `tech/Image-Performance-Inventory_2026-05-04.md`: added the pre-change inventory and broken-reference report.

### Verification And Local Performance Evidence

- `npm ci`: rebuilt `node_modules` after `astro check` hit a corrupted local `p-queue` install.
- `node scripts/audit-images.mjs --no-dist`: passed after source/public image cleanup.
- `npm run check && npm run build`: passed before final commit; build emitted 129 pages and all audits passed.
- Local Lighthouse mobile sample against `npm run preview`:
  - `/`: Performance 95, LCP 2.9s, CLS 0, TBT 0ms.
  - `/commercial-roofing/`: Performance 96, LCP 2.7s, CLS 0.012, TBT 0ms.
  - `/residential-roofing/`: improved from 86 to 96 after mobile hero and residential derivative tightening; final LCP 2.6s, CLS 0.005, TBT 0ms.
  - `/locations/`: Performance 95, LCP 2.9s, CLS 0.001, TBT 0ms.
  - `/blog/commercial-roofing/`: Performance 99, LCP 1.8s, CLS 0.018, TBT 0ms.
- `b8c8296`: committed image performance work as `perf(images): enforce WebP asset pipeline`.

## Git State
- **Branch:** `main`
- **Last commit:** `b8c8296` — "perf(images): enforce WebP asset pipeline"
- **Uncommitted changes:** only handoff documents remain untracked.

| File | Status | Note |
|------|--------|------|
| `docs/handoffs/current.md` | Added/Modified | Fresh full project handoff generated after image performance commit. |
| `docs/handoffs/archive/2026-05-04-0214.md` | Added | Existing archive copy from the previous handoff. |

## Task Cut Off
None — session ended at a clean boundary after the image performance work was committed and this handoff was generated.

## Next Task — Start Here

**Task:** Deploy and verify PageSpeed Insights on the public staging URL.

**What to check / do:**
1. Push `main` if Chris wants the commits deployed.
2. Let Coolify rebuild the Docker/nginx static site from `main`.
3. Run PageSpeed Insights against `https://pc-demo.cleverwork.io/`, `/commercial-roofing/`, `/residential-roofing/`, `/locations/`, and `/blog/commercial-roofing/`.
4. Compare PSI mobile scores against the local Lighthouse baseline and inspect any server/CDN-specific regressions.

**If PageSpeed Insights drops below 95:** inspect LCP element, server response time, cache headers, and CDN image delivery first. The local build cleared 95+ for all sampled pages, so a PSI miss is likely deployment/cache/header variance unless content changed after this handoff.

**Prompt to use:** "Read `docs/handoffs/current.md`. Then deploy or prepare deployment for the latest `main` commits and run PageSpeed Insights verification on the staging URL."

## Decisions Made This Session

- **Runtime raster images now ship as WebP only:** local JPG/PNG references are blocked by `scripts/audit-images.mjs`.
- **Build fails on image drift:** `npm run build` now includes `audit:images`, so missing image references, non-WebP deployable raster assets, over-budget assets, and `.original` leakage block the build.
- **Oversized logo SVGs were removed from runtime public assets:** they were multi-megabyte files and no longer referenced after the WebP logo/favicon replacements.
- **Residential mobile LCP gets a dedicated derivative:** `/residential-roofing/` needed a mobile-specific hero to clear 95+ locally.
- **No PageSpeed claim before deployment:** local Lighthouse evidence is strong, but final PSI must run against the public deployed URL.

## Blockers Requiring Human Action

1. **Push/deploy approval** — commits are local on `main`; deployment needs Chris to approve pushing if not already handled by the environment.
2. **Public PageSpeed Insights verification** — PSI requires the deployed URL, not local preview.
3. **Claim sourcing and measurement wiring** — launch remains blocked by the trust and analytics gates even though build/performance baselines are green locally.
4. **GBP NAP confirmation** — Phase 0 office URLs build, but client-owned GBP/NAP confirmation is still required before launch connection.

## Verification Commands
1. `npm run check` — should exit `0`.
2. `npm run build` — should exit `0`; last successful run built 129 pages and passed contrast, schema, silo, orphan, GBP URL-plan, and image audits.
3. `node scripts/audit-images.mjs --no-dist` — should exit `0` before build when checking source/public assets only.
4. `npm run preview -- --host 127.0.0.1 --port 4321` plus Lighthouse CLI on representative routes — should reproduce local mobile performance scores at or above 95 for sampled pages.
5. `git status --short` — should show only untracked handoff docs unless those are explicitly staged later.

## Full Context

### What was built across ALL sessions (complete feature list)

The current Astro site is a static marketing build served by Docker/nginx through Coolify. The verified Phase 1 Seed output builds 129 pages and emits all 66 workbook-defined Phase 0 URLs. The build includes the home page, commercial hub, residential hub, commercial service pages, residential service pages, tier-1 city pages, location pages, projects, blog hub, blog/pillar detail pages, ProPlan, Total Home Shield funnel, property-card flow skeleton, partners, careers, portal, legal pages, 404/500, segmented contact routes, segmented thank-you routes, robots, sitemap output, schema, contrast, silo, orphan, GBP URL-plan audits, and now image performance audits.

### Architecture decisions

The runtime publish path is narrow by design: `src/pages`, `src/content` consumed by routes, `src/components`, `src/lib`, `src/styles`, `public`, and build/config files. `content`, `design`, `tech`, `strategy`, `discovery`, `decisions`, and `packages` are not live runtime paths unless promoted into `src` or `public` and emitted by `npm run build`.

The GBP workbook remains the operational launch ledger. Sheet `05_Full_Website_URLs` defines required URLs by phase, and sheet `06_Build_Reconcile_2026-05-04` records the current reconciliation. Do not hand-wire new URLs without reconciling the workbook.

The image pipeline is now manual-static but enforced: images live in `public`, runtime references are plain strings, and `scripts/audit-images.mjs` is the guardrail until a fuller Astro image pipeline is introduced.

### Design system

The build uses Astro 4, MDX content collections, Tailwind CSS, React islands where interaction is justified, and local design tokens/components. `OfficeLocationsMap` is the main React island currently in the build. Brand tokens used by the map include dark navy `#11133F`, flag red `#C22326`, and light grey `#AEAEAE`. The broader project canon lives in `tech/DESIGN.md`.

Runtime logo/favicon assets now use WebP files in `public/Logos`:
- `pro-exteriors-logo-light.webp`
- `pro-exteriors-logo-dark.webp`
- `favicon-light.webp`
- `favicon-dark.webp`

### Key invariants (never violate)

- **Commercial and residential paths stay distinct:** mixing the two journeys damages conversion clarity and SEO intent.
- **Workbook URL canon wins:** Phase 0 URL compliance depends on one canonical path per required page.
- **No unsourced claims ship:** launch remains blocked by trust gates even when the build is technically green.
- **Every page must be emitted by Astro before it counts as published:** design templates and root content HTML are not live by default.
- **Production build must keep audits in the chain:** contrast, schema, silo, orphan, GBP URL-plan, and image audits protect the launch baseline.
- **Deployable raster assets must be WebP:** local JPG/PNG runtime references should fail the image audit.
- **Do not clean dirty files casually:** confirm intent before deleting or committing user-owned support artifacts.

### Service / deployment map
| Service | Detail |
|---------|--------|
| Repository | `https://github.com/Clvrwrk/PEW-V1.git` |
| Branch | `main` |
| Deployment path | Coolify pulls `main`, builds Dockerfile, runs `npm run build`, copies `dist` to nginx. |
| Static output | `dist/` |
| Sitemap output | Astro creates `sitemap-index.xml`; nginx aliases `/sitemap.xml` to it. |
| Demo URL | `https://pc-demo.cleverwork.io` appears in `public/robots.txt`. |
# Project Handoff — Pro Exteriors Website
**Project:** Pro Exteriors Website
**Repo:** https://github.com/Clvrwrk/PEW-V1.git
**Production URL:** not yet launched; staging/demo URL in current robots file is `https://pc-demo.cleverwork.io`
**Date:** 2026-05-04 02:14
**Agent:** Maren Castellan-Reyes, Senior Director, Website & Application Experience
**Reason:** User-requested full project handoff

---

## Accomplished This Session

### Phase 1 Seed URL Compliance

- `src/data/phase0-url-plan.json`: added machine-readable 66 URL Phase 0 plan exported from the GBP workbook.
- `scripts/audit-gbp-url-plan.mjs`: added build audit that verifies required workbook URLs exist in `dist`, including `/sitemap.xml` and `/404/` handling.
- `package.json`: added `audit:gbp-plan` and wired it into the production `build` script after contrast, schema, silo, and orphan audits.
- `decisions/2026-05-04-phase-1-url-canon.md`: documented the accepted Phase 1 Seed canon, including `/residential-roofing/` and `/commercial-roofing/tpo/`.

### Canonical Residential And Commercial Routes

- `src/pages/residential-roofing/index.astro`: added canonical residential hub replacing the old `/residential/` hub.
- `src/pages/residential-roofing/[slug]/index.astro`: added one consolidated dynamic route for residential services, cities, and subdivisions under `/residential-roofing/:slug/`.
- `src/pages/commercial-roofing/[city]/index.astro`: added commercial city routing for Dallas, Fort Worth, Plano, and Frisco.
- `src/content/services/commercial/tpo-roofing-systems.mdx`: changed canonical path and slug to publish as `/commercial-roofing/tpo/`.
- `src/content/services/residential/*.mdx`: normalized residential service canon to `/residential-roofing/.../`.
- `src/content/cities/residential-*.mdx`: normalized residential city canon to `/residential-roofing/.../`.
- `src/content/subdivisions/twin-creeks-allen.mdx`: added the required Twin Creeks Allen subdivision content entry.
- `src/components/organisms/Header.astro`: updated navigation to canonical commercial and residential URLs.
- `src/components/organisms/Footer.astro`: updated footer location/legal links to current canonical routes.

### Blog And Content Promotion

- `src/content/blogPosts/*.mdx`: promoted generated Knowledge Hub article content into Astro's live content collection.
- `src/pages/blog/index.astro`: replaced hardcoded blog data with collection-driven blog and pillar rendering.
- `src/pages/blog/[slug]/index.astro`: fixed blog/pillar slug typing so content collection routing type-checks cleanly.

### Location, Legal, Error, And Conversion Routes

- `src/content/offices/atlanta.mdx`: added Phase 0 GBP office page content.
- `src/content/offices/denver.mdx`: added Phase 0 GBP office page content.
- `src/content/offices/kansas-city.mdx`: added Phase 0 GBP office page content.
- `src/content/offices/wichita.mdx`: added Phase 0 GBP office page content.
- `src/content/legal/privacy.mdx`: moved privacy canonical path to `/privacy/`.
- `src/pages/404/index.astro`: added canonical `/404/` route while existing Astro 404 output still emits `/404.html`.
- `src/pages/about/certifications.astro`: added required certifications page.
- `src/pages/contact/commercial/index.astro`: added segmented commercial conversion endpoint.
- `src/pages/contact/emergency/index.astro`: added emergency conversion endpoint.
- `src/pages/contact/residential/inspection.astro`: added residential inspection conversion endpoint.
- `src/pages/thank-you/commercial/index.astro`: added commercial thank-you endpoint.
- `src/pages/thank-you/residential/index.astro`: added residential thank-you endpoint.
- `src/pages/api/lead.ts`: routed lead submissions to segmented thank-you pages based on vertical/form intent.
- `public/robots.txt`: added crawl rules and sitemap declaration.
- `nginx.conf`: added `/sitemap.xml` alias to Astro's generated `sitemap-index.xml`.

### Compliance Ledger And Documentation

- `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`: updated Phase 0 rows as `Published exact` and added a 2026-05-04 closeout note.
- `README.md`: updated current build status, publish contract, route canon, and verified audit baseline.
- `tech/State-of-Build_2026-05-04.md`: updated internal build-control state to reflect Phase 0 URL compliance.

### Error Cleanup And Verification

- `src/components/islands/OfficeLocationsMap.tsx`: added strict TypeScript types for offices, topology data, SVG focus handling, style objects, contact card props, and utilities.
- `src/components/seo/AnalyticsHead.astro`: replaced the broken compressed PostHog snippet with Astro-check-safe inline loading while preserving GA4/PostHog behavior.
- `node_modules/`: rebuilt with `npm ci` after local dependency corruption caused missing package files during build.
- `dist/`: regenerated by the final successful `npm run build`.

## Git State
- **Branch:** `main`
- **Last commit:** `b578d9e` — "docs(phase1): document build compliance state"
- **Uncommitted changes:** dirty tree; no commit was created because the user did not explicitly request one.

| File / Path | Status | Note |
|------|--------|------|
| `README.md` | Modified | Updated Phase 1 Seed compliance status and verified build baseline. |
| `package.json` | Modified | Added `audit:gbp-plan` and build-chain integration. |
| `nginx.conf` | Modified | Added sitemap alias handling. |
| `scripts/audit-gbp-url-plan.mjs` | Added | New Phase 0 workbook URL audit. |
| `src/data/phase0-url-plan.json` | Added | Machine-readable 66 URL Phase 0 plan. |
| `decisions/2026-05-04-phase-1-url-canon.md` | Added | URL canon decision record. |
| `src/components/islands/OfficeLocationsMap.tsx` | Modified | Strict TypeScript cleanup for `npm run check`. |
| `src/components/seo/AnalyticsHead.astro` | Modified | Astro-safe analytics scripts. |
| `src/components/organisms/Header.astro` | Modified | Canonical navigation updates. |
| `src/components/organisms/Footer.astro` | Modified | Canonical footer link updates. |
| `src/content/blogPosts/*.mdx` | Added/Modified | Live Knowledge Hub content collection promotion. |
| `src/content/cities/residential-*.mdx` | Modified | Residential city canonical path updates. |
| `src/content/legal/privacy.mdx` | Modified | Privacy canonical path changed to `/privacy/`. |
| `src/content/offices/{atlanta,denver,kansas-city,wichita}.mdx` | Added | Phase 0 GBP office roster additions. |
| `src/content/offices/{arlington,edmond,frisco,southlake}.mdx` | Deleted | Non-Phase 0 office pages removed from live roster. |
| `src/content/services/commercial/tpo-roofing-systems.mdx` | Modified | Canonical TPO route changed to `/commercial-roofing/tpo/`. |
| `src/content/services/residential/*.mdx` | Modified | Residential service canonical path updates. |
| `src/content/subdivisions/twin-creeks-allen.mdx` | Added | Phase 0 subdivision route content. |
| `src/pages/residential-roofing/**` | Added | Canonical residential hub and dynamic detail route. |
| `src/pages/residential/**` | Deleted | Old noncanonical static residential pages removed. |
| `src/pages/commercial-roofing/[city]/**` | Added | Commercial city dynamic route. |
| `src/pages/blog/index.astro` | Modified | Collection-driven blog hub. |
| `src/pages/blog/[slug]/index.astro` | Modified | Slug typing fix. |
| `src/pages/contact/{commercial,emergency,residential}/**` | Added | Segmented conversion routes. |
| `src/pages/thank-you/{commercial,residential}/**` | Added | Segmented thank-you routes. |
| `src/pages/about/certifications.astro` | Added | Required About subpage. |
| `src/pages/404/index.astro` | Added | Canonical error route. |
| `src/pages/_dev/components.astro` and `src/pages/dev/card-variants.astro` | Deleted | Public dev routes removed from build. |
| `public/robots.txt` | Added | Robots and sitemap declaration. |
| `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx` | Modified | GBP workbook closeout state updated. |
| `tech/State-of-Build_2026-05-04.md` | Modified | Build-control document updated. |
| `design/templates/** 2.*` and `decisions/* 2.md` | Untracked | Pre-existing duplicate/working artifacts from before this handoff session; do not assume they are part of the compliant publish path. |
| `design/templates/residential/competitor-html/*.html` and `design/templates/residential/source/*` | Deleted | Existing template/source cleanup state in dirty tree; confirm before discarding. |
| `tech/scripts/generate_silo_posts 2.py` | Untracked | Pre-existing duplicate script artifact. |

## Task Cut Off
None — session ended at a clean verification boundary. `npm run check` and `npm run build` both pass after the error cleanup.

## Next Task — Start Here

**Task:** Commit or stage the Phase 1 Seed compliance work deliberately.

**What to check / do:**
1. Review `git status --short` and split the dirty tree into at least two buckets: publish-path compliance work and pre-existing duplicate/template artifacts.
2. Confirm whether the untracked `design/templates/** 2.*`, `decisions/* 2.md`, and `tech/scripts/generate_silo_posts 2.py` files should be archived, ignored, deleted, or committed.
3. If Chris approves, create a clean commit for the compliance work only, then handle non-publish artifacts separately.

**If `npm run check` fails:** inspect the latest checker output first; the known fixed areas were `src/components/islands/OfficeLocationsMap.tsx`, `src/components/seo/AnalyticsHead.astro`, and `src/pages/blog/[slug]/index.astro`.

**Prompt to use:** "Read `docs/handoffs/current.md`. Then review the dirty tree and propose a clean commit split for the Phase 1 Seed compliance work without committing yet."

## Decisions Made This Session

- **GBP workbook URL canon is the Phase 1 Seed source of truth:** the live build is judged against the 66 Phase 0 URLs in `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`.
- **Residential publishes under `/residential-roofing/`:** old `/residential/` static routes were removed or superseded because the workbook, PRD, sitemap logic, and internal links need one canon.
- **Commercial TPO publishes under `/commercial-roofing/tpo/`:** old `/commercial-roofing/tpo-roofing-systems/` references were normalized.
- **Residential same-depth pages use one dynamic route:** `src/pages/residential-roofing/[slug]/index.astro` handles services, cities, and subdivisions because Astro cannot keep multiple same-depth dynamic route files for the same path segment.
- **Build compliance must be automated:** `audit:gbp-plan` is part of `npm run build`, so Phase 0 URL drift fails the build instead of hiding in documentation.
- **No commit was created during handoff:** the project handoff skill recommends committing, but repository safety rules require explicit user approval before any commit.

## Blockers Requiring Human Action

1. **Commit approval and commit split** — Chris needs to approve whether to commit the compliance work now and how to handle pre-existing duplicate artifacts.
2. **GBP NAP confirmation** — Phase 0 office URLs build, but launch still needs client-owned GBP/NAP confirmation before connecting profiles.
3. **Claim sourcing and measurement wiring** — URL compliance is complete, but production launch still requires sourced claims and analytics event/funnel validation.

## Verification Commands
1. `npm run check` — should exit `0`; last run passed after fixing all TypeScript/Astro errors.
2. `npm run build` — should exit `0`; last run built 129 pages, validated 275 schema blocks, and passed contrast/schema/silo/orphan/GBP-plan audits.
3. `git status --short` — should show a dirty tree until the compliance work and pre-existing artifacts are deliberately staged/committed/cleaned.

## Full Context

### What was built across ALL sessions (complete feature list)

The current Astro site is a static marketing build served by Docker/nginx through Coolify. The verified Phase 1 Seed output builds 129 pages and emits all 66 workbook-defined Phase 0 URLs. The build includes the home page, commercial hub, residential hub, commercial service pages, residential service pages, tier-1 city pages, location pages, projects, blog hub, blog/pillar detail pages, ProPlan, Total Home Shield funnel, property-card flow skeleton, partners, careers, portal, legal pages, 404/500, segmented contact routes, segmented thank-you routes, robots, sitemap output, schema, contrast, silo, orphan, and GBP URL-plan audits.

### Architecture decisions

The runtime publish path is narrow by design: `src/pages`, `src/content` consumed by routes, `src/components`, `src/lib`, `src/styles`, `public`, and build/config files. `content`, `design`, `tech`, `strategy`, `discovery`, `decisions`, and `packages` are not live runtime paths and are excluded or treated as source/supporting material. A file existing in those folders is not considered shipped unless promoted into `src` or `public` and emitted by `npm run build`.

The GBP workbook remains the operational launch ledger. Sheet `05_Full_Website_URLs` defines required URLs by phase, and sheet `06_Build_Reconcile_2026-05-04` records the current reconciliation. Do not hand-wire new URLs without reconciling the workbook.

### Design system

The build uses Astro 4, MDX content collections, Tailwind CSS, React islands where interaction is justified, and local design tokens/components. `OfficeLocationsMap` is the main React island currently in the build. Brand tokens used by the map include dark navy `#11133F`, flag red `#C22326`, and light grey `#AEAEAE`. The broader project canon lives in `tech/DESIGN.md`.

### Key invariants (never violate)

- **Commercial and residential paths stay distinct:** mixing the two journeys damages conversion clarity and SEO intent.
- **Workbook URL canon wins:** Phase 0 URL compliance depends on one canonical path per required page.
- **No unsourced claims ship:** launch remains blocked by trust gates even when the build is technically green.
- **Every page must be emitted by Astro before it counts as published:** design templates and root content HTML are not live by default.
- **Production build must keep audits in the chain:** contrast, schema, silo, orphan, and GBP URL-plan audits protect the launch baseline.
- **Do not clean dirty files casually:** many duplicate ` 2` artifacts and deleted design/source files existed before this handoff; confirm intent before deleting or committing them.

### Service / deployment map
| Service | Detail |
|---------|--------|
| Repository | `https://github.com/Clvrwrk/PEW-V1.git` |
| Branch | `main` |
| Deployment path | Coolify pulls `main`, builds Dockerfile, runs `npm run build`, copies `dist` to nginx. |
| Static output | `dist/` |
| Sitemap output | Astro creates `sitemap-index.xml`; nginx aliases `/sitemap.xml` to it. |
| Demo URL | `https://pc-demo.cleverwork.io` appears in `public/robots.txt`. |
