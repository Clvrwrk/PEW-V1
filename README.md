# Pro Exteriors Website

Performance-driven Astro build for the Pro Exteriors website rebuild.

This repo exists to turn Pro Exteriors' site from a brochure into a growth asset: commercial-first SEO dominance, clean residential conversion paths, GBP/location authority, and measurable lead generation.

## Current Build Status

Phase 1 Seed is **URL-compliant against the Phase 0 workbook plan**.

The Docker/Coolify build is passing, and the published Astro output now matches the 66-url Phase 0 URL plan in `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`.

Current verified baseline from the 2026-05-04 PageBuilder governance closeout:

- 129 Astro pages build successfully.
- 269 schema blocks validate across 128 audited pages.
- contrast, schema, silo, orphan, GBP URL-plan, image, and PageBuilder audits pass.
- GBP workbook Phase 0 plan has 66 URLs.
- 66 Phase 0 URLs publish at the exact planned URL.
- 0 Phase 0 URLs rely on a noncanonical alternate.
- 0 Phase 0 URLs are missing from the current build.
- 24 PageBuilder-required routes are registered in governance: 0 pass, 24 pending, 0 fail.

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
- `PageBuilder Status`
- `PageSpeed Mobile Score`
- `PB Phase 1 Brief + Strategy`
- `PB Phase 2 Copy`
- `PB Phase 3 Visual`
- `PB Phase 4 Assembly`
- `PB Phase 5 QC`
- `PB Phase 6 Delivery`

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

### Phase 0 Canon Status

Current Phase 0 route status:

- Residential canon publishes under `/residential-roofing/`.
- Commercial TPO canon publishes under `/commercial-roofing/tpo/`.
- Phase 0 GBP locations publish as Dallas HQ, Fort Worth, Denver, Wichita, Kansas City, and Atlanta.
- City and Twin Creeks subdivision URLs are routed through Astro content collections.
- Blog Knowledge Hub is collection-driven from `src/content/blogPosts`.
- Segmented contact and thank-you routes publish.
- `robots.txt` exists and `/sitemap.xml` is served through nginx as an alias to Astro's sitemap index.
- Public dev routes have been removed from the build.

See `tech/Phase-1-Seed-Compliance-Plan_2026-05-04.md` for the cleanup sequence that produced this state.

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
    residential-roofing/
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
npm run audit:gbp-plan
npm run audit:images
npm run audit:pagebuilder
```

Individual audits:

```bash
npm run audit:contrast
npm run audit:schema
npm run audit:silo
npm run audit:orphans
npm run audit:gbp-plan
npm run audit:images
npm run audit:pagebuilder
```

PageBuilder governance commands:

```bash
npm run test:pagebuilder
npm run sync:gbp-pagebuilder
npm run sync:gbp-pagebuilder -- --dry-run
npm run collect:pagespeed -- --dry-run
```

`npm run collect:pagespeed` is intentionally not part of `npm run build`. Run live PageSpeed collection immediately before production push or release approval, then sync the workbook again.

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
- image audit passing.
- PageBuilder audit passing with no `fail` routes.
- PageSpeed mobile scores collected before production promotion.
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
5. Register PageBuilder-required routes in `src/data/pagebuilder-audit.json`.
6. Run `npm run build`.
7. Update workbook reconciliation and PageBuilder status with `npm run sync:gbp-pagebuilder`.
8. Do not leave duplicate page files, dev routes, or stale alternate URLs.

If a page is meant to rank, it needs:

- canonical path
- title and meta description
- schema
- internal links that obey silo containment
- CTA/event intent
- source-backed claims
- accessibility-safe design

## Phase 1 Seed Closeout

The cleanup plan has been implemented for route and build compliance:

1. URL canon is frozen against the GBP workbook.
2. Canonical `/residential-roofing/` routes publish.
3. The TPO slug publishes at `/commercial-roofing/tpo/`.
4. The Phase 0 GBP office roster publishes.
5. City and subdivision routes publish.
6. Generated blog HTML has been promoted into Astro content.
7. Segmented contact and thank-you flows publish.
8. Crawl and utility hygiene are in place.
9. Public dev routes have been removed.
10. `npm run build` now includes `audit:gbp-plan` and verifies all 66 Phase 0 URLs.
11. `npm run build` now includes `audit:images` and `audit:pagebuilder`.
12. The GBP workbook includes PageBuilder status, PageSpeed mobile score, and six folded phase status columns.

Remaining launch work is qualitative and evidence-based: run live PageSpeed before production push, complete PageBuilder QC/delivery proof so pending routes can move to pass, confirm every office NAP against client-owned GBP data, replace representative claims or cut them, and finish production measurement wiring before client launch.
