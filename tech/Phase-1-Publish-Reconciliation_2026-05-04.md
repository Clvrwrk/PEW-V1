# Phase 1 Publish Reconciliation - 2026-05-04

**Author:** Maren Castellan-Reyes, Senior Director, Website & Application Experience - AIA4 Pro Exteriors  
**Status:** Internal build audit  
**Verified against:** commit `6354330` (`fix(build): restore Coolify deployment compatibility`)  
**Verification command:** `npm run build` from a clean worktree

## Executive Finding

The site is not missing work because Git failed to push it. The site is missing work because several recent generated outputs were placed in repo folders that are not part of the Astro publish path.

Coolify builds the Dockerfile, runs `npm run build`, and serves only `/app/dist` through nginx. Therefore:

- `src/pages/**` routes publish.
- `src/content/**` content publishes only when an Astro route imports the collection.
- `public/**` copies through as static assets.
- `content/**`, `design/templates/**`, and standalone generated HTML do not publish unless converted into Astro routes/content.

This is the same failure mode that blocked the new blog hub: `content/blog/index.html` exists in Git, but `/blog/` is generated from `src/pages/blog/index.astro`.

## Verification Snapshot

The clean build completes:

- 65 Astro pages built
- 142 schema blocks validated
- contrast audit passed
- silo audit passed
- orphan audit passed
- sitemap generated as `sitemap-index.xml` plus `sitemap-0.xml`

The GBP workbook has been updated:

- `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`
- Sheet `05_Full_Website_URLs` now has build reconciliation columns:
  - `Current Build Status`
  - `Published URL / Alternate`
  - `Build Reconciliation Notes`
  - `Last Reviewed`
- New sheet added:
  - `06_Build_Reconcile_2026-05-04`

## Phase 0 URL Reconciliation

Workbook Phase 0 planned URLs: **66**

Current build status:

- **35** publish at the exact planned URL.
- **11** publish under a noncanonical alternate URL.
- **20** Phase 0 planned URLs are missing from the current build.

Current `dist` endpoints/static routes counted for reconciliation: **68**

## Highest-Severity Issues

### 1. Blog Expansion Is Not Published

`content/blog/` contains the generated blog system:

- 54 standalone `.html` article/index files
- 1 internal link map markdown file

None of those files are copied into the nginx runtime image. The current published `/blog/` page is still `src/pages/blog/index.astro`, which hardcodes three old posts. The current dynamic blog route only reads:

- `src/content/blogPosts/` - 6 MDX posts
- `src/content/pillars/` - 2 MDX pillars

Result: the 53-guide Knowledge Hub exists as source/artifact work, but it is not live.

Required fix: convert the generated blog HTML into Astro content collection entries or route files, then replace `src/pages/blog/index.astro` with a collection-driven hub.

### 2. Residential URL Canon Diverged

The Phase 1 PRD and GBP workbook expect:

- `/residential-roofing/`
- `/residential-roofing/asphalt-shingles/`
- `/residential-roofing/replacement/`
- `/residential-roofing/inspection/`
- `/residential-roofing/emergency/`
- `/residential-roofing/metal/`
- `/residential-roofing/storm-damage/`

The current build publishes the new residential work under:

- `/residential/`
- `/residential/asphalt-shingles/`
- `/residential/roof-replacement/`
- `/residential/metal-roofing/`
- `/residential/storm-damage-repair/`
- plus several additional residential service pages not in Phase 0

This is not just a naming preference. It affects canonical URLs, GBP destination mapping, internal links, sitemap output, and the URL plan spreadsheet.

Required decision: either make `/residential/` the new canon and update PRD/sitemap/GBP plan, or move/redirect the implementation back to `/residential-roofing/`.

### 3. GBP Location Pages Do Not Match the Workbook

Workbook Phase 0 expects:

- `/locations/dallas-hq/`
- `/locations/fort-worth/`
- `/locations/denver/`
- `/locations/wichita/`
- `/locations/kansas-city/`
- `/locations/atlanta/`

Current build publishes:

- `/locations/dallas-hq/`
- `/locations/fort-worth/`
- `/locations/arlington/`
- `/locations/edmond/`
- `/locations/frisco/`
- `/locations/southlake/`

Also, some office content uses placeholder or internally inconsistent address data. Example: `dallas-hq.mdx` describes Richardson in copy but has a Dallas street placeholder in frontmatter.

Required fix: reconcile office slugs, addresses, metro labels, and GBP destination URLs before any GBP profile is connected.

### 4. City And Subdivision Pages Are Not Routed

The content collections include city MDX files:

- commercial Dallas, Fort Worth, Plano, Frisco
- residential Dallas, Fort Worth, Highland Park, Southlake

The Phase 0 workbook expects those as city pages. No current Astro route consumes the `cities` collection. The same is true for subdivision content: the workbook expects `/residential-roofing/twin-creeks-allen/`, while the source has `src/content/subdivisions/preston-hollow.mdx` and no subdivision route.

Required fix: implement city and subdivision dynamic routes, or mark those rows as not built.

### 5. Conversion Endpoints Are Missing Or Collapsed

Workbook Phase 0 expects:

- `/contact/commercial/`
- `/contact/residential/inspection/`
- `/contact/emergency/`
- `/thank-you/commercial/`
- `/thank-you/residential/`

Current build publishes:

- `/contact/`
- `/thank-you/`

The form endpoint `/api/lead` exists, but the Phase 0 conversion route architecture is not built.

Required fix: build the segmented contact/thank-you routes or update the measurement plan to reflect the collapsed flow.

### 6. Utility Routes Are Incomplete Or Noncanonical

Workbook Phase 0 expects:

- `/privacy/`
- `/sitemap.xml`
- `/robots.txt`
- `/404/`

Current build emits:

- `/privacy-policy/`
- `/sitemap-index.xml`
- `/sitemap-0.xml`
- `/404.html`

No `robots.txt` exists in `public/` or `dist/`.

Required fix: add `public/robots.txt`, decide whether to support `/sitemap.xml` via nginx alias/redirect, and align legal/error paths.

### 7. Dev Route Is Publicly Built

The current build publishes:

- `/dev/card-variants/`

This should not be public on a client demo unless explicitly intended.

Required fix: remove the route, move it under an ignored dev-only path, or noindex/block it.

## Artifact Folders That Are Not Live

These are useful project materials, but they are not live website output:

- `content/blog/` - generated static blog HTML and link map
- `design/templates/` - briefs, copy YAML, SEO manifests, image/layout/page-link/QC manifests, competitor dumps, humanized prose, and one standalone blog article HTML

The correct publish path is to transform these into:

- `src/content/**` entries consumed by Astro routes
- `src/pages/**` route files
- `public/**` assets
- component/template code under `src/components/**`

## Recommended Next Moves

1. Decide the residential canon before moving files: `/residential/` vs `/residential-roofing/`.
2. Convert the generated blog HTML into `src/content/blogPosts` and a collection-driven `/blog/` hub.
3. Reconcile GBP office slugs and addresses against the workbook before connecting GBP destination URLs.
4. Implement missing Phase 0 city, subdivision, segmented contact, thank-you, robots, and utility routes.
5. Remove or block public dev routes.
6. Re-run `npm run build` and use the workbook's new `Current Build Status` fields as the launch-readiness source of truth.

