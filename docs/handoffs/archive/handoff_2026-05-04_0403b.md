# Project Handoff — Pro Exteriors Website
**Project:** Pro Exteriors Website
**Repo:** https://github.com/Clvrwrk/PEW-V1.git
**Production URL:** not yet launched; staging/demo URL in current robots file is `https://pc-demo.cleverwork.io`
**Date:** 2026-05-04 04:03
**Agent:** Maren Castellan-Reyes, Senior Director, Website & Application Experience
**Reason:** User-requested full project handoff before commit/push

---

## Accomplished This Session

### PageBuilder Governance

- `tech/PageBuilder-Sequence-Audit_2026-05-04.md`: added the sitewide PageBuilder pass/fail audit record.
- `src/data/pagebuilder-audit.json`: added the machine-readable route registry for 24 PageBuilder-required routes.
- `scripts/lib/pagebuilder-governance.mjs`: added shared registry validation, workbook sync, PageSpeed score application, and workbook backup helpers.
- `scripts/audit-pagebuilder.mjs`: added the build gate that validates PageBuilder-required routes are registered and phase/status rules are sane.
- `scripts/sync-gbp-pagebuilder-columns.mjs`: added backup-first workbook sync for PageBuilder status, PageSpeed score, and six phase columns.
- `scripts/collect-pagespeed-scores.mjs`: added optional live PageSpeed collection; deliberately not wired into `npm run build`.
- `tests/pagebuilder-governance.test.mjs`: added Node test coverage for registry validation, workbook column sync, unmatched URL handling, and PageSpeed score updates.
- `package.json` and `package-lock.json`: added `xlsx` and wired `audit:pagebuilder`, `test:pagebuilder`, `sync:gbp-pagebuilder`, and `collect:pagespeed`.

### Runtime Page Alignment

- `src/pages/residential-roofing/[slug]/index.astro`: changed residential service routes to render structured service sections before the editorial MDX body; city/subdivision pages now render a structured local scan section before prose.
- `src/pages/commercial-roofing/[city]/index.astro`: added a structured local commercial section before city prose.
- `src/content/services/residential/metal.mdx`: replaced `%LINK_0%` and `%LINK_1%` generated-copy placeholders with real internal links.
- `design/templates/commercial-metal-roofing/`: added pending PageBuilder record set.
- `design/templates/commercial-roof-repair/`: added pending PageBuilder record set.
- `design/templates/commercial-roof-replacement/`: added pending PageBuilder record set.
- `design/templates/epdm-roofing/`: added pending PageBuilder record set.
- `design/templates/flat-roof-systems/`: added pending PageBuilder record set.
- `design/templates/tpo-roofing-systems/code-qc-manifest.yaml`: added pending code-QC manifest.
- `design/templates/tpo-roofing-systems/delivery-manifest.yaml`: added pending delivery manifest.
- `design/templates/local-commercial-roofing-{dallas,fort-worth,frisco,plano}/`: added pending local SEO PageBuilder record sets.
- `design/templates/local-residential-roofing-{dallas,fort-worth,highland-park,southlake,preston-hollow,twin-creeks-allen}/`: added pending local SEO PageBuilder record sets.

### GBP Workbook And README

- `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`: added PageBuilder governance columns to URL-bearing sheets and populated status values.
- `strategy/Pro-Exteriors_GBP-Curation_April-2026.backup-20260504-105952.xlsx`: backup created before workbook write.
- `README.md`: updated build status, build audit chain, PageBuilder commands, workbook governance columns, and launch gates.

## Git State
- **Branch:** `main`
- **Last commit before this handoff:** `d01599e` — "fix(blog): restore images and filtering"
- **Uncommitted changes:** this session's PageBuilder governance, workbook, README, and handoff changes are ready to commit and push.

| File / Path | Status | Note |
|------|--------|------|
| `README.md` | Modified | Documents PageBuilder governance, commands, and launch gates. |
| `package.json` / `package-lock.json` | Modified | Adds `xlsx` and governance scripts. |
| `scripts/audit-pagebuilder.mjs` | Added | PageBuilder registry build gate. |
| `scripts/collect-pagespeed-scores.mjs` | Added | Optional PageSpeed score collector; run before production promotion. |
| `scripts/sync-gbp-pagebuilder-columns.mjs` | Added | Backup-first workbook sync. |
| `scripts/lib/pagebuilder-governance.mjs` | Added | Shared registry/workbook helpers. |
| `tests/pagebuilder-governance.test.mjs` | Added | Governance tests. |
| `src/data/pagebuilder-audit.json` | Added | 24-route registry; current state is 0 pass, 24 pending, 0 fail. |
| `src/pages/residential-roofing/[slug]/index.astro` | Modified | Structured residential service/local renderer. |
| `src/pages/commercial-roofing/[city]/index.astro` | Modified | Structured commercial local section. |
| `src/content/services/residential/metal.mdx` | Modified | Removed generated `%LINK_*%` placeholders. |
| `design/templates/*` | Added/Modified | Pending PageBuilder record folders/manifests for commercial service and local SEO routes. |
| `strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx` | Modified | Governance columns added and populated. |
| `strategy/Pro-Exteriors_GBP-Curation_April-2026.backup-20260504-105952.xlsx` | Added | Workbook backup from the latest sync. |
| `tech/PageBuilder-Sequence-Audit_2026-05-04.md` | Added | Human-readable PageBuilder audit record. |
| `docs/handoffs/archive/2026-05-04-0403.md` | Added | Archived prior handoff before overwrite. |
| `docs/handoffs/current.md` | Modified | This handoff. |

## Task Cut Off
None — session ended at a clean verification boundary. PageSpeed was intentionally skipped per Chris's instruction and should be run right before production push/promotion.

## Next Task — Start Here

**Task:** Collect live PageSpeed and promote routes from `pending` to `pass` only when all evidence gates are real.

**What to check / do:**
1. After deployment is ready for release verification, run live PageSpeed/PSI collection for PageBuilder-required routes.
2. Update `src/data/pagebuilder-audit.json` with measured scores using `npm run collect:pagespeed`.
3. Complete PageBuilder page QC and code QC evidence for each route before moving phase statuses from `pending` to `pass`.
4. Re-run `npm run sync:gbp-pagebuilder` so the GBP workbook mirrors the registry.
5. Run `npm run build` and inspect PageBuilder registry counts.

**If PageSpeed collection is not ready:** leave `PageSpeed Mobile Score` as `pending` and do not mark any route `pass`.

**Prompt to use:** "Read `docs/handoffs/current.md`. Then run live PageSpeed collection for PageBuilder-required routes and update the PageBuilder registry/workbook only with measured evidence."

## Decisions Made This Session

- **PageBuilder registry is the source of truth:** `src/data/pagebuilder-audit.json` drives build checks and workbook sync.
- **GBP-facing statuses are constrained:** workbook columns use `pass`, `fail`, or `pending`.
- **Phase 0 is folded into Phase 1 for workbook reporting:** the six phase columns match Chris's requested shape.
- **No fake passes:** every PageBuilder route is currently `pending`, not `pass`, because PageSpeed, QC, delivery, source/trust, forms, and analytics proof remain incomplete.
- **PageSpeed is not part of `npm run build`:** live PSI/PageSpeed should run immediately before production promotion, not on every local build.
- **Workbook sync is backup-first:** `sync-gbp-pagebuilder` creates a timestamped backup before writing.

## Blockers Requiring Human Action

1. **Live PageSpeed timing** — Chris asked to skip PageSpeed until right before production push/promotion.
2. **PageBuilder QC evidence** — routes should stay `pending` until page QC, code QC, trust/source, schema, analytics, forms, and PageSpeed evidence are real.
3. **GBP/NAP confirmation** — office/location launch remains dependent on client-owned GBP/NAP confirmation.
4. **Production measurement wiring** — analytics/funnel goals must be validated before client launch.

## Verification Commands
1. `npm run test:pagebuilder` — passed 4/4 tests.
2. `npm run check` — exited `0`.
3. `npm run build` — exited `0`; built 129 pages and passed contrast, schema, silo, orphan, GBP URL-plan, image, and PageBuilder audits.
4. `npm run audit:pagebuilder` — should report `24 route(s) registered: 0 pass, 24 pending, 0 fail` until live evidence changes the registry.
5. `npm run sync:gbp-pagebuilder -- --dry-run` — should validate workbook sync without writing.
6. `npm run collect:pagespeed -- --dry-run` — should leave registry untouched unless scores are supplied or live collection is requested.

## Full Context

### What was built across ALL sessions (complete feature list)

The current Astro site is a static marketing build served by Docker/nginx through Coolify. The verified Phase 1 Seed output builds 129 pages and emits all 66 workbook-defined Phase 0 URLs. The build includes the home page, commercial hub, residential hub, commercial service pages, residential service pages, tier-1 city pages, location pages, projects, blog hub, blog/pillar detail pages, ProPlan, Total Home Shield funnel, property-card flow skeleton, partners, careers, portal, legal pages, 404/500, segmented contact routes, segmented thank-you routes, robots, sitemap output, schema, contrast, silo, orphan, GBP URL-plan audits, image audits, and PageBuilder governance audits.

### Architecture decisions

The runtime publish path is narrow by design: `src/pages`, `src/content` consumed by routes, `src/components`, `src/lib`, `src/styles`, `public`, and build/config files. `content`, `design`, `tech`, `strategy`, `discovery`, `decisions`, and `packages` are not live runtime paths unless promoted into `src` or `public` and emitted by `npm run build`.

The GBP workbook remains the operational launch ledger. Sheet `05_Full_Website_URLs` defines required URLs by phase, and sheet `06_Build_Reconcile_2026-05-04` records the current reconciliation. Both URL-bearing sheets now include PageBuilder status, PageSpeed mobile score, and six phase status columns.

PageBuilder-required routes are tracked in `src/data/pagebuilder-audit.json`. Build enforcement is intentionally strict about impossible pass states, but tolerant of honest `pending` states so unfinished launch evidence blocks promotion without blocking local development.

### Design system

The build uses Astro 4, MDX content collections, Tailwind CSS, React islands where interaction is justified, and local design tokens/components. `OfficeLocationsMap` is the main React island currently in the build. Brand tokens used by the map include dark navy `#11133F`, flag red `#C22326`, and light grey `#AEAEAE`. The broader project canon lives in `tech/DESIGN.md`.

Runtime logo/favicon assets use WebP files in `public/Logos`:
- `pro-exteriors-logo-light.webp`
- `pro-exteriors-logo-dark.webp`
- `favicon-light.webp`
- `favicon-dark.webp`

### Key invariants (never violate)

- **Commercial and residential paths stay distinct:** mixing the two journeys damages conversion clarity and SEO intent.
- **Workbook URL canon wins:** Phase 0 URL compliance depends on one canonical path per required page.
- **No unsourced claims ship:** launch remains blocked by trust gates even when the build is technically green.
- **Every PageBuilder pass needs evidence:** no route moves to `pass` unless all six phases pass, PageSpeed mobile is at least 95, and launch hard gates are complete.
- **Production build must keep audits in the chain:** contrast, schema, silo, orphan, GBP URL-plan, image, and PageBuilder audits protect the launch baseline.
- **Deployable raster assets must be WebP:** local JPG/PNG runtime references should fail the image audit.

### Service / deployment map
| Service | Detail |
|---------|--------|
| Repository | `https://github.com/Clvrwrk/PEW-V1.git` |
| Branch | `main` |
| Deployment path | Coolify pulls `main`, builds Dockerfile, runs `npm run build`, copies `dist` to nginx. |
| Static output | `dist/` |
| Sitemap output | Astro creates `sitemap-index.xml`; nginx aliases `/sitemap.xml` to it. |
| Demo URL | `https://pc-demo.cleverwork.io` appears in `public/robots.txt`. |
