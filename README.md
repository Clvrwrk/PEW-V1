# Pro Exteriors Website

Performance-driven Astro build for the Pro Exteriors website rebuild.

This repo exists to turn Pro Exteriors' site from a brochure into a growth asset: commercial-first SEO dominance, clean residential conversion paths, GBP/location authority, and measurable lead generation.

## Current Build Status

Phase 1 Seed is **not complete yet**.

The Docker/Coolify build is passing, but the published site does not yet fully match the Phase 0 URL plan in `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`.

Current verified baseline from the 2026-05-04 reconciliation:

- 65 Astro pages build successfully.
- 142 schema blocks validate.
- contrast, schema, silo, and orphan audits pass.
- GBP workbook Phase 0 plan has 66 URLs.
- 35 Phase 0 URLs publish at the exact planned URL.
- 11 Phase 0 URLs publish under a noncanonical alternate.
- 20 Phase 0 URLs are missing from the current build.

Read these first when picking up the build:

- `tech/State-of-Build_2026-05-04.md`
- `tech/Phase-1-Publish-Reconciliation_2026-05-04.md`
- `tech/Phase-1-Seed-Compliance-Plan_2026-05-04.md`
- `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`
- `tech/PRD_Phase-1_April-2026.md`
- `design/ProExteriors_Full_Sitemap.md`

## Strategic Frame

Pro Exteriors is a roofing company with an 80 percent commercial / 20 percent residential business mix. The site has to serve two audiences without splitting domain authority:

- Commercial procurement officers, facilities managers, property managers, and owners evaluating high-cost roof assets.
- Residential homeowners handling planned replacement, storm damage, inspections, and urgent leak response.

The site strategy is built around four compounding systems:

- **GBP and local authority:** each real office/location page has a one-to-one destination URL with clean NAP, LocalBusiness schema, and service-area logic.
- **Reverse silo SEO:** money pages are supported by topical blog clusters that link up to the target and laterally only to siblings.
- **Two-front-door IA:** commercial and residential users get distinct paths without an interstitial or separate domain.
- **Conversion instrumentation:** every meaningful route must define its hypothesis, CTA intent, and measurement path before launch.

## Source Of Truth

The operational launch ledger is:

`strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`

Use workbook sheet `05_Full_Website_URLs` to decide whether a URL is required for Phase 0, Q1, Q2, Q3, or Q4.

The workbook now includes reconciliation columns:

- `Current Build Status`
- `Published URL / Alternate`
- `Build Reconciliation Notes`
- `Last Reviewed`

Sheet `06_Build_Reconcile_2026-05-04` records the current route audit.

Do not claim a page is shipped because a file exists somewhere in the repo. A page is shipped only when it is emitted into `dist/` by `npm run build`.

## Publish Contract

Coolify uses `Dockerfile`, not a static folder deploy.

The deployment path is:

1. Coolify pulls `main`.
2. Docker installs dependencies with `npm ci --ignore-scripts`.
3. Docker runs `npm run build`.
4. Astro emits static output into `/app/dist`.
5. nginx serves `/usr/share/nginx/html`, copied from `/app/dist`.

That means the live site can only come from:

- `src/pages/**`
- `src/content/**` when consumed by an Astro route
- `src/components/**`
- `src/lib/**`
- `src/styles/**`
- `public/**`
- package/config/build files

These folders are intentionally not runtime publish paths:

- `content/**`
- `design/**`
- `tech/**`
- `strategy/**`
- `discovery/**`
- `decisions/**`
- `packages/**`

Root `content/blog/*.html` and `design/templates/**/*.html` are not live pages. They are authoring artifacts until promoted into `src/` or `public/`.

## Sitemap Logic

The canonical sitemap hierarchy is defined in:

`design/ProExteriors_Full_Sitemap.md`

The Phase 1 Seed subset is defined in:

`strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`, sheet `05_Full_Website_URLs`

### Phase 0 Clusters

Phase 0 targets 66 URLs:

- Foundation hubs: `/`, `/commercial-roofing/`, `/residential-roofing/`, `/proplan/`, `/locations/`, `/about/`, `/blog/`, `/contact/`
- GBP location pages: Dallas HQ, Fort Worth, Denver, Wichita, Kansas City, Atlanta
- Commercial money pages: TPO, EPDM, Metal, Flat Roof Systems, Repair, Replacement
- Residential money pages: Asphalt Shingles, Replacement, Inspection, Emergency, Metal, Storm Damage
- Tier-1 commercial cities: Dallas, Fort Worth, Plano, Frisco
- Tier-1 residential cities: Dallas, Fort Worth, Highland Park, Southlake
- One subdivision page: Twin Creeks Allen
- Segmented conversion endpoints
- About sub-pages
- Blog hub, 2 pillars, and seed supporters
- Total Home Shield funnel
- Partners, careers, portal, property-card, legal, sitemap, robots, and error routes

### Current Canon Drift To Fix

Known drift before Phase 1 closeout:

- Workbook expects `/residential-roofing/`; current build publishes `/residential/`.
- Workbook expects `/commercial-roofing/tpo/`; current build publishes `/commercial-roofing/tpo-roofing-systems/`.
- Workbook expects Denver, Wichita, Kansas City, and Atlanta location pages; current build has other office slugs.
- Workbook expects city and subdivision routes; content exists but no routes consume it.
- Blog Knowledge Hub exists under root `content/blog/`, but live `/blog/` is still the Astro placeholder hub.
- Workbook expects segmented contact/thank-you routes; current build has collapsed routes.
- `robots.txt` is missing.
- `/dev/card-variants/` is publicly built.

See `tech/Phase-1-Seed-Compliance-Plan_2026-05-04.md` for the cleanup sequence.

## Project Structure

Key production folders:

```text
src/
  components/
    atoms/
    molecules/
    organisms/
    islands/
    seo/
  content/
    blogPosts/
    caseStudies/
    cities/
    legal/
    offices/
    pillars/
    services/
    subdivisions/
  lib/
    schema/
  pages/
    about/
    blog/
    commercial-roofing/
    contact/
    locations/
    projects/
    property-card/
    proplan/
    residential/
    total-home-shield/
public/
scripts/
```

Key planning/reference folders:

```text
strategy/   GBP workbook, SEO architecture, growth strategy
tech/       PRD, build walkthrough, design tokens, audits, compliance plans
design/     sitemap, Figma audit, pagebuilder templates, visual references
content/    generated static blog artifacts not currently published
```

## Build Commands

Install:

```bash
npm ci
```

Run local dev server:

```bash
npm run dev
```

Run full production build:

```bash
npm run build
```

Build currently runs:

```bash
astro build
npm run audit:contrast
npm run audit:schema
npm run audit:silo
npm run audit:orphans
```

Individual audits:

```bash
npm run audit:contrast
npm run audit:schema
npm run audit:silo
npm run audit:orphans
```

## Deployment

Deployment target: `pc-demo.Cleverwork.io`

Runtime:

- Docker multi-stage build
- Astro static output
- nginx serving `/usr/share/nginx/html`
- Coolify deploys on push to `main`

The Dockerfile includes a Rollup musl patch because the build runs on Alpine Linux.

Do not switch Coolify back to a static build pack. Static mode would copy repo files without running Astro and would revive the exact problem this build is trying to eliminate.

## Launch Gates

No Phase 1 Seed closeout without:

- GBP workbook Phase 0 URLs all marked `Published exact`.
- `npm run build` passing.
- schema audit passing.
- contrast audit passing.
- silo audit passing.
- orphan audit passing.
- `robots.txt` present.
- sitemap behavior verified.
- no public dev routes.
- no root `content/blog` HTML required for production.
- GBP location pages matching confirmed office NAP.
- residential and commercial URL canon resolved.
- README, workbook, PRD notes, and build output agreeing.

## Working Rules

When adding or changing pages:

1. Start with the workbook URL row.
2. Confirm the canonical route path.
3. Put publishable code in `src/pages`, content in `src/content`, assets in `public`.
4. Keep authoring artifacts in `design/templates` only until promoted.
5. Run `npm run build`.
6. Update workbook reconciliation status.
7. Do not leave duplicate page files, dev routes, or stale alternate URLs.

If a page is meant to rank, it needs:

- canonical path
- title and meta description
- schema
- internal links that obey silo containment
- CTA/event intent
- source-backed claims
- accessibility-safe design

## Phase 1 Seed Remaining Work

The current cleanup plan is:

1. Freeze URL canon against the GBP workbook.
2. Restore canonical `/residential-roofing/` routes or formally change the workbook.
3. Reconcile the TPO slug.
4. Rebuild the GBP office roster and NAP.
5. Add city and subdivision routes.
6. Migrate generated blog HTML into Astro content.
7. Build segmented contact and thank-you flows.
8. Add crawl/utility hygiene.
9. Remove public dev routes.
10. Re-run build and close out the workbook.

The detailed implementation plan lives at:

`tech/Phase-1-Seed-Compliance-Plan_2026-05-04.md`
