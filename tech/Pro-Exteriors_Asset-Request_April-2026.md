# Pro Exteriors Website — Asset Request & Workflow

**Companion to:** `/tech/Pro-Exteriors_Asset-Tracker_April-2026.xlsx`
**Audience:** Pro Exteriors marketing/operations team + AIA4 design team + photographers + content owners

---

## Why this exists

Phase 1 ships the Pro Exteriors website with intentional brand placeholders — generic palette, text wordmark, neutral photography, TODO-marked stats. Phase 2 (week 1-2 after launch) replaces every placeholder with real Pro Exteriors brand assets. The transition is engineered so it requires **zero engineering touch**: drop the right file at the right path, git push, the live site updates on the next Coolify deploy.

The asset tracker (`/tech/Pro-Exteriors_Asset-Tracker_April-2026.xlsx`) is the project-management surface. This document explains how to use it.

---

## Workflow at a glance

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   1. Open the asset tracker xlsx                                    │
│   2. Find the asset row you're delivering (filter by Phase, Owner)  │
│   3. Read the File Path, Format & Specs columns — match exactly     │
│   4. Save your file with the EXACT filename in the column           │
│   5. Drop file into the Git repo at the exact path                  │
│   6. Update the asset's Status column to "Delivered"                │
│   7. Git commit + push                                              │
│   8. Coolify deploys; pc-demo.Cleverwork.io updates                 │
│   9. Approver verifies in browser; updates Status to "Approved"     │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

The exact filename is non-negotiable. The site references files by their full path; if the filename doesn't match, the page falls back to the placeholder and your file is invisible. The naming conventions sheet (sheet 4 of the tracker) is the reference — every asset's File Path column tells you exactly where the file goes and what to call it.

---

## Status definitions (use these exactly)

| Status | Meaning | Action |
|---|---|---|
| **Pending** | Asset has been requested but not yet started | Owner picks up |
| **In Progress** | Asset is being produced (photographer shooting, designer designing, marketing approving) | Owner working; may add notes about ETA |
| **Delivered** | File has been dropped into the repo at the correct path; awaiting approval | Approver reviews |
| **Approved** | File is live on pc-demo.Cleverwork.io and verified working | No further action — asset complete |
| **Rejected** | File delivered but doesn't meet specs (wrong dimensions, wrong content, brand misalignment, missing signoff) | Notes column has rejection reason; Owner re-delivers |
| **N/A** | Asset is not needed (canceled or replaced by a different asset) | Removed from active tracking |

---

## File naming convention — short version

Every asset's File Path follows one of these patterns. The naming conventions sheet (sheet 4) has the full reference; here are the load-bearing patterns:

```
/public/brand/logo-[variant].svg
    Variants: primary, white, black, square

/public/images/heroes/[page-context]-hero.jpg
    Examples: home-hero.jpg, commercial-hub-hero.jpg, proplan-hero.jpg

/public/images/services/commercial/[service-slug]-hero.jpg
/public/images/services/residential/[service-slug]-hero.jpg
    service-slug must match the URL slug exactly:
    /commercial-roofing/tpo/  →  tpo-hero.jpg
    /residential-roofing/asphalt-shingles/  →  asphalt-shingles-hero.jpg

/public/images/cities/commercial/[city-slug]-hero.jpg
/public/images/cities/residential/[city-slug]-hero.jpg
    city-slug matches URL: dallas-hero.jpg, fort-worth-hero.jpg, highland-park-hero.jpg

/public/images/subdivisions/[subdivision-slug]-hero.jpg
    Example: twin-creeks-allen-hero.jpg

/public/images/offices/[office-slug]-[type].jpg
    office-slug = dallas-hq, fort-worth, denver, wichita, kansas-city, atlanta
    type = exterior, team, interior

/public/images/leadership/[lastname-firstinitial]-portrait.jpg
    Example: castellan-reyes-m-portrait.jpg

/public/images/case-studies/[project-slug]/[state].jpg
    state = cover, before, during, after
    Example: /public/images/case-studies/texas-motor-speedway-tpo-retrofit/cover.jpg

/public/images/blog/[post-slug]-featured.jpg
    post-slug matches URL: tpo-vs-epdm-vs-pvc-featured.jpg

/public/docs/[document-name].pdf
    Example: pro-exteriors-brand-guide.pdf, warranty-terms.pdf

/data/[topic].json
    Example: company-stats.json, offices.json, certifications.json
```

### Slug rules (when in doubt)
- Lowercase only
- Hyphens, never underscores or spaces
- No special characters (no `&`, `'`, `,`, `.` etc. in filenames)
- No file extensions other than what the spec calls for
- No version numbers in filenames (`logo-v2.svg` is wrong; replace `logo-primary.svg` instead — git tracks the version)

---

## Drop-in workflow — step by step

### For a Pro Exteriors team member delivering an asset:

1. **Get the file path from the tracker.** Open `Pro-Exteriors_Asset-Tracker_April-2026.xlsx`, find the asset row, copy the File Path value (e.g., `/public/images/heroes/home-hero.jpg`).

2. **Save your file with the exact filename.** If the tracker says `home-hero.jpg`, your file must be named `home-hero.jpg` — not `Home Hero.jpg`, not `home_hero.jpg`, not `home-hero (1).jpg`.

3. **Optimize the file** to the Format & Specs column. For images: dimensions match (or larger — sharp will resize at build), under the file-size cap, JPEG/AVIF for photos, SVG for vectors, PNG only when SVG isn't possible.

4. **Place the file in the repo** at the exact path. The repo lives at `[project-root]`. The file path in the tracker is relative to the repo root. So `/public/images/heroes/home-hero.jpg` goes at `[project-root]/public/images/heroes/home-hero.jpg`.

5. **Verify locally** if you can: run `npm run build` and check the file appears in `dist/`. If you can't run the build locally, just trust the path.

6. **Update the tracker:** change the asset row's Status to `Delivered`. Add the date in the Notes column.

7. **Git commit + push:**
   ```bash
   git add public/images/heroes/home-hero.jpg
   git commit -m "asset: home page hero — A031"
   git push origin main
   ```
   (The asset ID — `A031` etc. — comes from the ID column in the tracker.)

8. **Coolify auto-deploys** within ~2 minutes of the push. Check the Coolify dashboard for build status.

9. **Visit pc-demo.Cleverwork.io** and verify your asset is live.

10. **Wait for approver** to verify and update Status to `Approved`.

### For an approver verifying delivered assets:

1. Filter the tracker to Status = `Delivered`.

2. For each row, visit the page where the asset appears. The Notes column or the asset's URL context tells you which page.

3. Verify:
   - File loads (no broken image / fallback showing)
   - Visual quality matches Pro Exteriors brand standards
   - Content is correct (right person in portrait, right project in case study, right message in testimonial)
   - For testimonials and stats: signoff exists in the Notes column

4. Update Status:
   - `Approved` if good
   - `Rejected` if not, with rejection reason in Notes

---

## Quality requirements per asset type

### Photography
- **No stock imagery.** Real Pro Exteriors crews on real Pro Exteriors jobs. CLAUDE.md never-do is explicit on this.
- **Hero images:** 1920×1080 minimum, 16:9 aspect, ≤500 KB optimized. JPEG or AVIF. Color profile sRGB.
- **Detail/section images:** 1200×900, ≤300 KB.
- **Office exteriors:** 1200×900, building visible, hours/branding readable if visible.
- **Leadership portraits:** 800×800 square, professional headshot, consistent lighting + treatment across the team. Outdoor / on-site preferred over studio for "real" feel.
- **Project case studies:** before/during/after triptych for each, 1200×900 each.
- **CLAUDE.md never-do:** zero "diverse smiling team in hard hats" stock. Real teams or no photo.

### Logos
- SVG vector preferred (scales to any size, smaller file)
- PNG fallback at 2x resolution if SVG unavailable
- Transparent background
- Variants needed: full color, white knockout, black mono, square
- Clear space and minimum size guidance per brand guide

### Stats & data
- Every claim has a `source` field
- Sources are URLs to public studies/reports OR internal Pro Exteriors operational records with date stamp
- No "industry average" claims without citation
- Format example:
  ```json
  {
    "yearsInBusiness": { "value": 25, "source": "Pro Exteriors operational records, verified 2026-04-01" },
    "jobsCompleted": { "value": 8000, "source": "CRM job records as of 2026-Q1" },
    "satisfactionRate": { "value": 0.98, "source": "Internal post-job NPS survey aggregate, n=2400, 2024-2025" }
  }
  ```

### Testimonials
- Customer name (real)
- Customer role + organization
- Customer photo (with their permission) — same path/spec as leadership portrait
- Quote (≤300 chars for design fit; longer quotes can have a "more" toggle)
- **`signoffOnFile: true`** field — required per CLAUDE.md §4. No placeholder testimonials ship to production.
- Signoff date

### Documents (PDFs)
- Standard PDF (no PDF/A requirement unless legal-specified)
- Searchable (no scanned-image-only PDFs)
- File size ≤2 MB unless larger explicitly justified

### Subdivision data (Property First)
- HOA architectural rules: structured JSON with approved roof colors (hex if possible), contractor approval flag, review timeline in days
- Hail history: array of hail events with `{date, severity_inches, source}`
- Served addresses: array of `{street, year, service, anonymized}` — `anonymized: true` for households who haven't agreed to be named

---

## Approval matrix — who signs off on what

| Asset type | Owner (delivers) | Approver (signs off) |
|---|---|---|
| Logo + brand assets | Pro Exteriors marketing | Pro Exteriors leadership |
| Hero photography | Photographer (engaged) | Pro Exteriors marketing → AIA4 design lead |
| Service photography | Photographer | AIA4 design lead |
| Office photography | Pro Exteriors office manager | AIA4 design lead |
| Leadership portraits | Photographer | Each leader signs their own portrait + bio |
| Process photos | Photographer | Pro Exteriors operations lead |
| Case studies (with photos + content) | Pro Exteriors marketing | Customer signoff (legal requirement) → Pro Exteriors marketing → AIA4 |
| Stats + sourcing | Pro Exteriors marketing | CFO or COO (data accuracy) |
| Testimonials | Pro Exteriors marketing | Customer signoff → Pro Exteriors marketing |
| Documents (warranty, brand guide) | Pro Exteriors legal/marketing | Pro Exteriors leadership |
| Videos | Video production | Pro Exteriors marketing |
| Subdivision data (Layer Cake) | Pro Exteriors data team / Layer Cake project | Pro Exteriors data lead |
| HOA + hail history data | Pro Exteriors data team | Pro Exteriors operations |
| Certifications | Vendor (GAF, Carlisle, etc.) — supplies the badge file | Pro Exteriors operations confirms certification level |
| License numbers | Pro Exteriors operations | Pro Exteriors compliance |
| Email templates | AIA4 design + Pro Exteriors marketing | Pro Exteriors marketing leadership |

---

## What happens if you skip a step

| Mistake | What happens | Fix |
|---|---|---|
| Wrong filename (e.g., `Home Hero.jpg` instead of `home-hero.jpg`) | Site falls back to placeholder; your file is invisible | Rename file, re-push |
| Wrong file path (e.g., `/public/images/home-hero.jpg` instead of `/public/images/heroes/home-hero.jpg`) | Same — fallback to placeholder | Move file, re-push |
| File too large (e.g., 5 MB hero JPEG) | Lighthouse fails; CI may block deploy | Optimize file (squoosh.app, sharp, ImageOptim), re-push |
| File wrong format (e.g., HEIC where JPEG expected) | Browser may not render; build may fail | Convert to specified format |
| Status not updated in tracker | Approver doesn't know to check; asset languishes | Update tracker after every push |
| Asset delivered without signoff (testimonial, stat) | Page may ship with unsourced claim violating CLAUDE.md §4 | Don't merge to main until signoff is in Notes |
| Stat without `source` field | Build-time validation fails (Phase 2 once enforcement is wired) | Add source citation |

---

## Phase 1 priority list — what's blocking tomorrow morning

The Phase 1 sheet (sheet 1 of the tracker) is the launch dependency list. Every row tagged Phase 1 needs to be either Delivered (to ship with real content) or accepted as a placeholder (the design ships with the TODO marker, asset slots in later).

The 30 Phase 1 rows are split:
- **Critical-content (sourcing required, can't ship as placeholder without explicit approval):** hero stats with sources, ProPlan agitation stats, testimonials with signoffs, office hours per location, license numbers, Twin Creeks HOA + hail data
- **Visual placeholders (Phase 1 ships with neutral placeholder, real asset slots in for Phase 2):** all hero photography, service photography, office photography, blog featured images, OG images
- **Brand placeholders (Phase 1 ships with text wordmark, fonts, neutral palette; Phase 2 swaps):** logo files, fonts, brand guide, color palette

For tomorrow morning's launch, the critical-content rows are the ones that block the Phase 1 P0 audit fixes. Visual + brand placeholders are acceptable launch state.

---

## How to add a new asset to the tracker

If you need an asset that isn't in the tracker:

1. **Pause** — verify with engineering that the asset is genuinely needed (the site may already have a different solution for that surface).

2. **Find the right naming pattern** in sheet 4 (Naming Conventions). If your new asset doesn't fit any existing pattern, that's a sign it might need a new template/component first — don't invent a new pattern unilaterally.

3. **Add a new row** to the appropriate phase sheet (Phase 1, 2, or 3) with:
   - Next sequential ID (`A138`, `A139`, ...)
   - Phase
   - Category
   - Asset Name (specific, descriptive)
   - Description (what it should depict / contain)
   - File Path (matching the naming convention)
   - Format & Specs
   - Owner
   - Status = `Pending`
   - Date Needed
   - Notes

4. **Notify** the engineering lead so the corresponding template/page is updated to reference the new file.

---

## Audit fix tracking — Phase 1 P0 punch list

Five P0 fixes from the design audit (`/design/Figma-Audit_April-2026.md`) directly depend on assets:

| Audit fix | Tracker row(s) | Status |
|---|---|---|
| Brand pass: replace "RoofingPros" / "APEXROOFING" with "Pro Exteriors" | A001, A002, A003, A004 (logo files) — also engineered into BaseLayout | Logo files are Phase 2; engineering applies brand strings during build |
| Source or delete stat callouts | A030 (company-stats), A031 (proplan-stats), A032 (mission stats) | Phase 1 critical |
| Move "Roof Damage 48 Hours" out of Residential Hub hero | None — pure engineering fix in template | N/A |
| Location Hub office count: 3 → 6 | A020 through A025 (6 office exterior photos) | Phase 1 placeholder pictures OK; data structure is critical |
| Insights Hub fish-image placeholder | A028 (blog hub featured image) | Phase 1 placeholder OK |

The Property First lens fix is engineering-applied (the PropertyCardCallout component) but depends on:
- Property Card sample PDF (A058) — Phase 2
- Property Card visual rendering reference (engineered into the property-card pages)

---

## Final notes

The asset tracker is a living document. Pro Exteriors marketing maintains it; AIA4 design lead reviews weekly; engineering reads from it on every Phase 2+ delivery. Don't let it go stale.

The single biggest mistake on engagements like this is over-engineering the brand pass into a one-time event. It's not. Real Pro Exteriors photos arrive on rolling schedule as photographers shoot new jobs. Real testimonials arrive as customers sign release forms. Real stats arrive as Pro Exteriors operations cleans up their data layer. The website is the destination — the tracker is the runway.

When in doubt, default to the file path in the tracker. The site is built to expect those paths. Improvising filenames or folders breaks the deployment promise that "drop file → git push → site updates" works without engineering intervention.

— Maren

---

## Sources & references

- `/tech/Pro-Exteriors_Asset-Tracker_April-2026.xlsx` — the asset tracker itself
- `/tech/PRD_Phase-1_April-2026.md` §3, §5, §8 — file structure and template specs
- `/tech/Build-Cycle-Walkthrough_Phase-1.md` — engineering execution recipe
- `/design/Figma-Audit_April-2026.md` §14 — audit fix punch list
- `/strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx` sheet 05 — Y1 URL plan (so naming patterns can match URL slugs)
- CLAUDE.md §4 hard gates, §5 decision rules, §11a brand assets workflow
