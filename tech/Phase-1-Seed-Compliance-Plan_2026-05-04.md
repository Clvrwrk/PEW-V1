# Phase 1 Seed Compliance Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Bring the Pro Exteriors Astro build into compliance with the GBP workbook Phase 0 URL plan and make the repo clean enough for production handoff.

**Architecture:** The GBP workbook remains the launch ledger. Astro remains the production renderer. Finished content and designs must be promoted into `src/pages`, `src/content`, `src/components`, or `public` before they count as shipped. The root `content/` and `design/templates/` folders remain authoring/reference zones, not publish zones.

**Tech Stack:** Astro 4 static output, MDX content collections, Tailwind tokens, React islands where needed, Docker/Coolify/nginx static runtime, workbook reconciliation in `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`.

---

## File Structure

Create or modify these areas:

- `src/pages/residential-roofing/**` - canonical residential hub, service, city, and subdivision routes.
- `src/pages/commercial-roofing/[city]/index.astro` - commercial city route.
- `src/pages/blog/index.astro` - collection-driven Knowledge Hub.
- `src/content/blogPosts/**` - migrated supporter posts from root `content/blog`.
- `src/content/offices/**` - corrected GBP office roster, slugs, NAP, and schema inputs.
- `src/pages/contact/**` - segmented conversion routes.
- `src/pages/thank-you/**` - segmented confirmation routes.
- `src/pages/[legal]/index.astro` and `src/content/legal/privacy.mdx` - legal URL canon.
- `public/robots.txt` - crawl contract.
- `nginx.conf` - sitemap alias/redirect if needed.
- `scripts/audit-gbp-url-plan.mjs` - build-time comparison between spreadsheet-derived URL expectations and generated `dist`.
- `README.md` - source-of-truth operational README.
- `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx` - update status after each route group.

## Compliance Sequence

Do not start with visual polish. The route canon has to be fixed first or every design pass compounds the wrong URLs.

### Task 1: Freeze URL Canon

**Files:**
- Modify: `decisions/2026-05-04-phase-1-url-canon.md`
- Modify: `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`
- Reference: `tech/State-of-Build_2026-05-04.md`
- Reference: `tech/Phase-1-Publish-Reconciliation_2026-05-04.md`

- [ ] Create a decision record stating that the Phase 1 Seed canon follows the GBP workbook unless explicitly overridden.

Decision:

```markdown
# URL Canon for Phase 1 Seed

**Date:** 2026-05-04
**Status:** Accepted

## Context

The current build publishes some work under noncanonical paths, especially `/residential/`, while the Phase 1 PRD and GBP workbook use `/residential-roofing/`.

## Decision

The Phase 1 Seed canon is the GBP workbook path set. Residential routes publish under `/residential-roofing/`. Existing `/residential/` routes become redirects or are removed after canonical pages are built.

## Rationale

GBP destination URLs, sitemap logic, reverse-silo links, and spreadsheet tracking need one source of truth before production.
```

- [ ] Update workbook `05_Full_Website_URLs` status rows only after each canonical route is implemented.

- [ ] Run verification:

```bash
npm run build
```

Expected: build still passes.

### Task 2: Add GBP URL Audit Script

**Files:**
- Create: `scripts/audit-gbp-url-plan.mjs`
- Modify: `package.json`

- [ ] Create a script that reads a checked-in JSON export of Phase 0 URLs and compares it to `dist`.

Because parsing `.xlsx` during Docker builds adds dependency risk, export Phase 0 route expectations into:

- Create: `src/data/phase0-url-plan.json`

Shape:

```json
[
  { "url": "/", "phase": "Phase 0", "role": "Hub" },
  { "url": "/commercial-roofing/", "phase": "Phase 0", "role": "Vertical Hub" }
]
```

- [ ] Add script logic:

```js
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const plan = JSON.parse(fs.readFileSync('src/data/phase0-url-plan.json', 'utf8'));

const exists = (url) => {
  if (url === '/') return fs.existsSync(path.join(dist, 'index.html'));
  if (url.endsWith('/')) return fs.existsSync(path.join(dist, url, 'index.html'));
  return fs.existsSync(path.join(dist, url));
};

const missing = plan.filter((row) => !exists(row.url));

if (missing.length > 0) {
  console.error('[gbp-url-plan] Missing Phase 0 URLs:');
  for (const row of missing) console.error(`- ${row.url} (${row.role})`);
  process.exit(1);
}

console.log(`[gbp-url-plan] ${plan.length} Phase 0 URL(s) published.`);
```

- [ ] Add package script:

```json
"audit:gbp-plan": "node scripts/audit-gbp-url-plan.mjs"
```

- [ ] Add `npm run audit:gbp-plan` to the end of `build` after `audit:orphans`.

- [ ] Run verification:

```bash
npm run build
```

Expected: it fails until missing Phase 0 URLs are implemented. That failure is correct. Commit this only when the implementation tasks below are complete or keep it off the build chain until then.

### Task 3: Restore Residential Canon

**Files:**
- Create: `src/pages/residential-roofing/index.astro`
- Create: `src/pages/residential-roofing/[service]/index.astro`
- Modify: `src/content/services/residential/*.mdx`
- Modify: `src/components/organisms/Header.astro`
- Modify: existing residential static pages under `src/pages/residential/**` after canonical pages exist

- [ ] Build `/residential-roofing/` as the canonical hub.

- [ ] Build `/residential-roofing/[service]/` from `getCollection('services', ({ data }) => data.vertical === 'residential')`.

- [ ] Ensure these Phase 0 URLs publish:

```text
/residential-roofing/
/residential-roofing/asphalt-shingles/
/residential-roofing/replacement/
/residential-roofing/inspection/
/residential-roofing/emergency/
/residential-roofing/metal/
/residential-roofing/storm-damage/
```

- [ ] Add redirects from old `/residential/` URLs to canonical `/residential-roofing/` URLs, or remove the old routes after confirming no required design work is lost.

- [ ] Update header and footer links to canonical residential URLs.

- [ ] Run:

```bash
npm run build
```

Expected: residential canonical pages exist in `dist/residential-roofing/`.

### Task 4: Reconcile Commercial TPO Slug

**Files:**
- Modify: `src/content/services/commercial/tpo-roofing-systems.mdx`
- Modify: `src/pages/commercial-roofing/[service]/index.astro` if slug handling needs canonical alias support
- Modify: blog posts that link to `/commercial-roofing/tpo/`

- [ ] Decide whether TPO canon is `/commercial-roofing/tpo/` or `/commercial-roofing/tpo-roofing-systems/`.

Recommendation: match the workbook with `/commercial-roofing/tpo/`, then redirect `/commercial-roofing/tpo-roofing-systems/`.

- [ ] Update frontmatter `canonicalPath`.

- [ ] Update internal links and `silo_target` fields to the final canonical path.

- [ ] Run:

```bash
npm run build
npm run audit:silo
npm run audit:orphans
```

Expected: no supporter links point to a missing TPO URL.

### Task 5: Rebuild GBP Office Roster

**Files:**
- Modify/create: `src/content/offices/*.mdx`
- Modify: `src/pages/locations/[office]/index.astro`
- Modify: `src/pages/locations/index.astro`
- Modify: `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`

- [ ] Replace or add office entries so the canonical Phase 0 set exists:

```text
/locations/dallas-hq/
/locations/fort-worth/
/locations/denver/
/locations/wichita/
/locations/kansas-city/
/locations/atlanta/
```

- [ ] Correct NAP in frontmatter.

- [ ] Mark Atlanta as service-area/satellite if no staffed address is confirmed.

- [ ] Remove or demote non-Phase-0 location pages if they are not part of the GBP launch set.

- [ ] Run:

```bash
npm run build
```

Expected: the six workbook location URLs exist and schema validates.

### Task 6: Implement City Routes

**Files:**
- Create: `src/pages/commercial-roofing/[city]/index.astro`
- Create: `src/pages/residential-roofing/[city]/index.astro`
- Modify: `src/content/cities/*.mdx`

- [ ] Create commercial city route from the `cities` collection filtered by `vertical === 'commercial'`.

- [ ] Create residential city route from the `cities` collection filtered by `vertical === 'residential'`.

- [ ] Ensure Phase 0 city URLs publish:

```text
/commercial-roofing/dallas/
/commercial-roofing/fort-worth/
/commercial-roofing/plano/
/commercial-roofing/frisco/
/residential-roofing/dallas/
/residential-roofing/fort-worth/
/residential-roofing/highland-park/
/residential-roofing/southlake/
```

- [ ] Run:

```bash
npm run build
npm run audit:schema
npm run audit:orphans
```

Expected: city routes publish, schema validates, and no city route is orphaned.

### Task 7: Implement Subdivision Route

**Files:**
- Create: `src/pages/residential-roofing/[subdivision]/index.astro`
- Modify/create: `src/content/subdivisions/twin-creeks-allen.mdx`
- Decide archive/delete: `src/content/subdivisions/preston-hollow.mdx`

- [ ] Add canonical Twin Creeks content.

- [ ] Route the `subdivisions` collection.

- [ ] Ensure:

```text
/residential-roofing/twin-creeks-allen/
```

publishes.

- [ ] Run:

```bash
npm run build
npm run audit:schema
```

Expected: subdivision route exists and schema validates.

### Task 8: Migrate Blog Knowledge Hub

**Files:**
- Modify: `src/pages/blog/index.astro`
- Create many: `src/content/blogPosts/*.mdx`
- Reference source: `content/blog/**/*.html`
- Modify: `scripts/audit-silo.mjs` only if the content model needs new fields

- [ ] Convert the 53 generated HTML articles into MDX collection entries.

- [ ] Preserve:

```text
title
description
canonicalPath
publishDate
author
pillar
silo_target
silo_siblings
targetAnchorText
faqs when present
```

- [ ] Replace the hardcoded blog hub with `getCollection('blogPosts')` and `getCollection('pillars')`.

- [ ] Ensure the hub represents the Knowledge Hub and not the old 3-card placeholder.

- [ ] Run:

```bash
npm run build
npm run audit:silo
npm run audit:orphans
npm run audit:schema
```

Expected: all blog links resolve, the supporter count reflects migrated content, and reverse-silo rules still pass.

### Task 9: Build Segmented Conversion Routes

**Files:**
- Create: `src/pages/contact/commercial/index.astro`
- Create: `src/pages/contact/residential/inspection.astro`
- Create: `src/pages/contact/emergency/index.astro`
- Create: `src/pages/thank-you/commercial/index.astro`
- Create: `src/pages/thank-you/residential/index.astro`
- Modify: `src/pages/api/lead.ts`
- Modify: analytics helpers if present

- [ ] Build commercial RFQ route.

- [ ] Build residential inspection route.

- [ ] Build emergency intake route.

- [ ] Build thank-you variants with campaign/source attribution.

- [ ] Ensure form redirects match route intent.

- [ ] Run:

```bash
npm run build
```

Expected: all five workbook conversion endpoints publish.

### Task 10: Utility And Crawl Hygiene

**Files:**
- Create: `public/robots.txt`
- Modify: `nginx.conf`
- Modify: `src/content/legal/privacy.mdx`
- Modify: `src/pages/[legal]/index.astro`
- Decide/remove: `src/pages/dev/card-variants.astro`

- [ ] Add `robots.txt` with staging-safe rules.

For staging:

```txt
User-agent: *
Disallow:

Sitemap: https://pc-demo.cleverwork.io/sitemap-index.xml
```

- [ ] Add nginx redirect or alias for `/sitemap.xml` if the workbook continues to require that exact path.

- [ ] Align privacy URL to `/privacy/` or update workbook canon deliberately.

- [ ] Remove public dev route.

- [ ] Run:

```bash
npm run build
```

Expected: robots, sitemap, legal, and error behavior are intentional.

### Task 11: Final Workbook Closeout

**Files:**
- Modify: `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`
- Modify: `tech/State-of-Build_2026-05-04.md`
- Modify: `README.md`

- [ ] For every Phase 0 row in `05_Full_Website_URLs`, set:

```text
Current Build Status = Published exact
Published URL / Alternate = same as URL
Build Reconciliation Notes = Current Astro build emits this URL.
Last Reviewed = actual review date
```

- [ ] In `06_Build_Reconcile_2026-05-04`, add a final closeout row with build commit and verification command.

- [ ] Run:

```bash
npm run build
```

Expected: build passes and `audit:gbp-plan` passes if enabled.

## Production Readiness Gate

The Phase 1 Seed round is complete only when all of these are true:

- [ ] `npm run build` passes.
- [ ] `audit:contrast` passes.
- [ ] `audit:schema` passes.
- [ ] `audit:silo` passes.
- [ ] `audit:orphans` passes.
- [ ] `audit:gbp-plan` passes or the workbook export confirms 66 exact URLs.
- [ ] No root `content/blog` HTML is needed for production.
- [ ] No public dev route exists.
- [ ] `public/robots.txt` exists.
- [ ] Workbook Phase 0 rows all read `Published exact`.
- [ ] README matches the actual site, not planned architecture.

## Execution Recommendation

Execute in this order:

1. URL canon and audit script
2. Residential canon
3. TPO slug
4. GBP offices
5. Cities/subdivision
6. Blog migration
7. Conversion endpoints
8. Utility hygiene
9. Workbook closeout

That order reduces rework. Blog migration is large, but it should not start until route canon is frozen because every supporter link depends on it.

