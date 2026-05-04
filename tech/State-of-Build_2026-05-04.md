# Pro Exteriors State of the Build - 2026-05-04

**Author:** Maren Castellan-Reyes, Senior Director, Website & Application Experience - AIA4 Pro Exteriors  
**Status:** Internal build-control document  
**Source audit:** `tech/Phase-1-Publish-Reconciliation_2026-05-04.md`  
**Verified build:** clean worktree at commit `6354330`

## Build Verdict

The project is close enough to production that discipline matters now. The repo contains substantial finished work, but the deployed Astro build does not yet represent the full intended Phase 1 Seed cohort or the full body of generated content.

The core problem is not deployment reliability. Coolify is doing what the Dockerfile tells it to do: build Astro, copy `/app/dist` into nginx, and serve static HTML from there. The problem is that several finished or near-finished artifacts live outside the publishable source path.

The current build should be treated as **build-valid but not Phase-1-compliant**.

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

The verified clean build produced:

- **65** Astro pages
- **142** valid schema blocks
- contrast audit passing
- schema audit passing
- silo audit passing
- orphan audit passing
- sitemap output as `sitemap-index.xml` and `sitemap-0.xml`

The build is technically passing. It is not yet strategically complete.

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

- **35** publish at the exact planned URL.
- **11** publish under a noncanonical alternate URL.
- **20** are missing from the current build.

This is the baseline that must move to 66 exact published Phase 0 URLs before Phase 1 Seed can be called complete.

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

## Compliance Problems To Fix

### Residential URL Canon

The GBP workbook and PRD expect `/residential-roofing/`. The current build publishes `/residential/`.

This must be resolved before cleanup continues. Pick one canon and make the site, sitemap, workbook, README, and internal links agree.

Recommendation: keep the GBP workbook canon unless Chris explicitly approves changing it. That means build `/residential-roofing/` routes and add redirects from `/residential/` to the canonical paths.

### Blog Hub And Supporters

The live `/blog/` hub is stale and hardcoded. It does not represent the 53 generated guides. It also links to outdated/nonexistent post slugs.

The generated HTML should be converted into `src/content/blogPosts` or into first-class Astro routes. The hub should be collection-driven.

Recommendation: migrate into `src/content/blogPosts` so audits, schema, sitemap, and reverse-silo rules can govern the work.

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
- `/locations/arlington/`
- `/locations/edmond/`
- `/locations/frisco/`
- `/locations/southlake/`

Recommendation: reconcile against the real GBP office roster before any destination URL is connected to a profile. Fix slugs, addresses, metro labels, and LocalBusiness schema.

### City And Subdivision Routes

The city content collection exists. The subdivision collection exists. Neither is routed.

Recommendation: implement:

- `src/pages/commercial-roofing/[city]/index.astro`
- `src/pages/residential-roofing/[city]/index.astro`
- `src/pages/residential-roofing/[subdivision]/index.astro`

### Conversion Endpoints

The workbook expects segmented contact and thank-you flows. The build currently has only `/contact/` and `/thank-you/`.

Recommendation: implement the segmented routes first, then wire analytics events.

### Utility Hygiene

Missing or noncanonical:

- `robots.txt`
- `/sitemap.xml`
- `/privacy/`
- `/404/`

Recommendation: add `public/robots.txt`, align legal canon, and decide whether nginx should alias `/sitemap.xml` to the generated sitemap index.

### Dev Route

`/dev/card-variants/` is publicly built.

Recommendation: remove from public build before production.

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
**Route compliance:** incomplete  
**GBP compliance:** incomplete  
**Content migration:** incomplete  
**README/documentation:** updated in progress  
**Phase 1 Seed:** not complete

