# Pro Exteriors State of the Build - 2026-05-04

**Author:** Maren Castellan-Reyes, Senior Director, Website & Application Experience - AIA4 Pro Exteriors  
**Status:** Internal build-control document  
**Source audit:** `tech/Phase-1-Publish-Reconciliation_2026-05-04.md`  
**Verified build:** Phase 1 Seed compliance pass, 2026-05-04

## Build Verdict

The project is close enough to production that discipline matters now. The repo contains substantial finished work, but the deployed Astro build does not yet represent the full intended Phase 1 Seed cohort or the full body of generated content.

The core problem is not deployment reliability. Coolify is doing what the Dockerfile tells it to do: build Astro, copy `/app/dist` into nginx, and serve static HTML from there. The problem is that several finished or near-finished artifacts live outside the publishable source path.

The current build should be treated as **build-valid and Phase-0 URL compliant**. Production launch still requires qualitative claim sourcing, confirmed GBP NAP, and measurement wiring.

## Publish Contract

The production deployment path is:

1. Coolify imports `main`.
2. Docker builds with `node:20-alpine`.
3. `npm ci --ignore-scripts` installs dependencies from `package-lock.json`.
4. `npm run build` runs:
   - `astro build`
   - `audit:contrast`
   - `audit:schema`
   - `audit:silo`
   - `audit:orphans`
   - `audit:gbp-plan`
5. Docker copies `/app/dist` into nginx.
6. nginx serves `/usr/share/nginx/html`.

Only these source locations can affect the live site:

- `src/pages/**`
- `src/content/**` when consumed by Astro content collections
- `src/components/**`
- `src/lib/**`
- `src/styles/**`
- `public/**`
- build config and package files

These folders are not part of the runtime site:

- `content/**`
- `design/**`
- `tech/**`
- `strategy/**`
- `discovery/**`
- `decisions/**`
- `packages/**`

The `.dockerignore` excludes those folders from the Docker context. That is mostly correct for performance and security, but it means no page, design, or copy artifact placed there can publish unless it is promoted into `src/` or `public/`.

## Current Verified Build

The verified compliance build produced:

- **129** Astro pages
- **275** valid schema blocks
- contrast audit passing
- schema audit passing
- silo audit passing
- orphan audit passing
- GBP URL-plan audit passing
- sitemap output as `sitemap-index.xml` and `sitemap-0.xml`

The build is technically passing and emits all Phase 0 workbook URLs. It is not yet strategically complete until the qualitative launch gates are cleared.

## GBP Workbook Compliance

The operational launch ledger is:

`strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`

Sheet `05_Full_Website_URLs` now includes build-reconciliation columns:

- `Current Build Status`
- `Published URL / Alternate`
- `Build Reconciliation Notes`
- `Last Reviewed`

Sheet `06_Build_Reconcile_2026-05-04` records the current publish audit.

Phase 0 planned URLs in the workbook: **66**

Current status:

- **66** publish at the exact planned URL.
- **0** publish under a noncanonical alternate URL.
- **0** are missing from the current build.

This satisfies the Phase 0 URL compliance target.

## Published Work That Is Real

The following areas are wired into the Astro build:

- Home page
- Commercial roofing hub
- Commercial service detail template backed by `src/content/services` for commercial services
- Locations hub and office detail template backed by `src/content/offices`
- Projects hub and case-study detail pages backed by `src/content/caseStudies`
- Blog dynamic template backed by `src/content/blogPosts` and `src/content/pillars`
- ProPlan hub
- Total Home Shield funnel
- Property Card flow skeleton
- Partners disclosure page
- Careers hub
- About, mission, and leadership pages
- Legal pages through the `legal` content collection
- 404 and 500 pages
- Lead API endpoint

Those are real. They should be cleaned, aligned, and preserved.

## Work That Exists But Is Not Live

### Root `content/blog`

`content/blog/` contains the generated Knowledge Hub:

- 53 supporter article HTML files
- 1 blog hub HTML file
- 1 internal link map

This work is not live. It is outside `src/`, excluded by `.dockerignore`, and not consumed by Astro.

### `design/templates`

`design/templates/` contains pagebuilder manifests, copy YAML, QC reports, SEO manifests, layout plans, image manifests, and several HTML/reference artifacts. These are production inputs, not production outputs.

They are useful. They are not live.

### Orphaned `src/content` Collections

Some content is inside the publishable tree but still not live because no route consumes it:

- `src/content/cities/**`
- `src/content/subdivisions/**`
- residential service MDX under `src/content/services/residential/**`

These need routes or intentional archive status.

## Compliance Closeout

### Residential URL Canon

The GBP workbook and PRD expect `/residential-roofing/`. The current build now publishes the residential hub, services, cities, and Twin Creeks subdivision under that canon.

### Blog Hub And Supporters

The live `/blog/` hub is now collection-driven and the generated Knowledge Hub has been promoted into `src/content/blogPosts`.

### GBP Office Pages

Workbook expects:

- `/locations/dallas-hq/`
- `/locations/fort-worth/`
- `/locations/denver/`
- `/locations/wichita/`
- `/locations/kansas-city/`
- `/locations/atlanta/`

Build currently publishes:

- `/locations/dallas-hq/`
- `/locations/fort-worth/`
- `/locations/denver/`
- `/locations/wichita/`
- `/locations/kansas-city/`
- `/locations/atlanta/`

Launch still requires confirming NAP against the client-owned GBP profiles before destination URLs are connected.

### City And Subdivision Routes

Commercial cities publish through `src/pages/commercial-roofing/[city]/index.astro`. Residential services, cities, and subdivisions publish through one consolidated `src/pages/residential-roofing/[slug]/index.astro` route because Astro cannot keep multiple same-depth dynamic route files at `/residential-roofing/:slug/`.

### Conversion Endpoints

The segmented contact and thank-you routes publish. Production launch still needs final CRM routing and analytics destination validation.

### Utility Hygiene

`public/robots.txt` exists, `/privacy/` is canonical, `/404/` is treated as satisfied by Astro's 404 output, and nginx aliases `/sitemap.xml` to Astro's generated `sitemap-index.xml`.

### Dev Route

The public dev routes have been removed from the Astro build.

## Phase 1 Seed Definition Of Done

Phase 1 Seed is complete only when:

- The workbook has 66 Phase 0 rows marked `Published exact`.
- No Phase 0 row relies on a noncanonical alternate unless a redirect is documented and tested.
- The blog hub and supporter content are generated from Astro source, not root static HTML.
- GBP location pages match the office roster and NAP exactly.
- Every URL in the sitemap is intentional.
- `robots.txt` exists.
- Build passes locally and in Coolify.
- No dev/test route is public.
- The README reflects the actual architecture, not an aspirational one.

## Current State Classification

**Production infrastructure:** close  
**Build reliability:** passing  
**Route compliance:** Phase 0 compliant  
**GBP compliance:** URL compliant; NAP confirmation still required before live GBP connection  
**Content migration:** complete for publish path  
**README/documentation:** updated for compliant build  
**Phase 1 Seed:** URL-compliant; qualitative launch gates remain

