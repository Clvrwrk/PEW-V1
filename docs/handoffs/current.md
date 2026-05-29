# Project Handoff — Pro Exteriors Website
**Project:** Pro Exteriors Website
**Repo:** https://github.com/Clvrwrk/PEW-V1.git
**Production URL:** not yet launched; staging/demo URL is `https://pc-demo.cleverwork.io`
**Date:** 2026-05-29 15:39
**Agent:** Maren Castellan-Reyes, Senior Director, Website & Application Experience
**Reason:** User-requested full handoff after the client review-call build + nav/footer/schema cleanup

---

## Accomplished This Session

This session ran the 2026-05-29 client review-call build (transcript → plan → approved scope), a team-headshot standardization pass, and a header/footer/schema consistency cleanup. De-scoped human launch tasks (DNS, lead-form routing to Madison/Crystal, phone consolidation, financing copy, locations/map, launch sequence) remain human follow-ups.

### Homepage (`src/pages/index.astro`)
- Hero H1 → **"America's Top Commercial Roofing Company"** (national); "16 states" kept.
- Trust row: removed Malarkey Emerald badge → **Pro Ministry "Faith Based"** logo (far left); "2022 Premium Certified" → **"2021 / Roofing Since"**; "10M+ Sq Ft Installed" → **"100+ Roofs Protected"**.
- Rebuilt the two-card audience split into **three service-division cards** (Commercial & Multifamily, Residential Roofing, Roof Asset Management) on client photo backgrounds.

### Navigation, About, Team, Pro Ministries
- `Header.astro` + `Footer.astro`: "About" split into **About Us / Team / Pro Ministries**; **Projects** and **Resources** removed from primary nav.
- `about/index.astro` rebuilt as **About Us** (from `Option 1.pdf`); new **`/team/`** (Executive & Management Team, centered static grid) and **`/pro-ministries/`** (from `Pro Ministries Outreach.pdf`, collage minus 2 client-flagged images).
- `about/mission.astro` + `about/leadership.astro` → meta-refresh **redirect stubs** (`/about/`, `/team/`) to avoid duplicate content.

### Residential Services (`residential-roofing/index.astro`)
- All generic AI images + the static video poster → client photos (`content/Client Docs/Residential/Photos/`).
- Removed the **"1 of 5 in DFW / Malarkey one-of-five"** claim; corrected warranty to **five-year** per the client doc.

### Commercial Services (`commercial-roofing/index.astro`)
- Client hero; new **membrane-type gallery** (TPO/EPDM/Metal/Shingles) and a dedicated **Multi-Family** section, all on client photography.

### Team headshots + standard + skill
- Added **Shawn Hillard** (Residential Operations Manager).
- **Lonnie Sawyer** was the only headshot out of tolerance (face-top 0.049). Extended via outpaint, reframed to canonical (face-top 0.134, centered). Lucinda/Isaac/Crystal accepted as-is by Chris.
- `tech/DESIGN.md` **v1.2**: Team Headshots framing standard. New skill **`_aia4-skills/aia4-headshot-framing/`** (`check` + `reframe`, cv2/PIL, outpaint-when-tight workflow); CLAUDE.md skill-map pointer.

### Nav language standardization (header ↔ footer ↔ homepage cards)
Three service destinations now share one canonical label everywhere:
- `/commercial-roofing/` → **Commercial & Multifamily**
- `/residential-roofing/` → **Residential Roofing**
- `/proplan/` → **Roof Asset Management**
(Header changed "Residential Services" → "Residential Roofing"; footer changed "Commercial Roofing" → "Commercial & Multifamily" and "ProPlan Maintenance" → "Roof Asset Management". Homepage card headings already matched.)

### Footer build-out (`Footer.astro`)
- Added a **Get a Quote** CTA + **844-336-PROS** phone (brand column) and **Contact** in the Company column — parity with the header.
- **Social** (official brand vector glyphs, authoritative URLs): LinkedIn `company/proexteriorsus/`, Facebook `proexteriorsus/`, Instagram `proexteriorsllc/`.
- **Accreditation/membership** links (icon + label): **BBB A+ Accredited** and **Richardson Chamber Member**. Official BBB seal + Chamber badge are account-specific licensed images — left as `data-todo` to swap in from each org's portal.

### Organization schema fix (`src/lib/schema/Organization.ts`) — real bug caught
The `sameAs` array carried **wrong handles** (Instagram `proexteriorsus`, LinkedIn `pro-exteriors-llc-tx`). Corrected all three to the authoritative URLs and added the BBB + Chamber profile URLs, so social identity is consistent across footer **and** structured data.

### Asset pipeline
- 30 client images converted to webp into `public/images/clients/**`, `public/images/home/**`, `public/Logos/pro-ministries-logo.webp`. Originals in `content/Client Docs/**` untouched (Drive = source of truth).
- **Note:** an external/automated commit (`28cb7db`) subsequently **re-compressed 17 client webp under a 130KB image-weight budget** — keep new client images under that budget or the image audit will flag them.

### Decision record
- `decisions/2026-05-29-client-review-call-build-edits.md`.

## Git State
- **Branch:** `main`
- **HEAD:** `28cb7db` — "fix(images): re-compress 17 client webp under 130KB image-weight budget"
- **`origin/main` == HEAD** → everything through `28cb7db` is **pushed**. The earlier credential block was resolved (pushed from Chris's side).
- **Commits now on `origin/main` (this session):**
  - `fa023f8` — Client review-call build edits
  - `3da0f9a` — Team headshots: Shawn + Lonnie + framing standard + skill
  - `a78668b` — docs(handoff): 2026-05-29 session handoff + archive renaming
  - `28cb7db` — image re-compress (17 client webp under budget)
- **Uncommitted working-tree changes (the cleanup + this handoff) — NOT yet committed/pushed:**

| File / Path | Status | Note |
|------|--------|------|
| `src/components/organisms/Header.astro` | Modified | "Residential Services" → "Residential Roofing". |
| `src/components/organisms/Footer.astro` | Modified | Get-a-Quote CTA + phone + Contact; social glyphs (LI/FB/IG); BBB + Chamber links; service labels aligned. |
| `src/lib/schema/Organization.ts` | Modified | `sameAs` corrected (IG/LinkedIn) + BBB/Chamber added. |
| `docs/handoffs/current.md` | Modified | This handoff. |
| `docs/handoffs/archive/handoff_2026-05-29_1453.md` | Added | Prior current.md archived (naming: `handoff_Date_Time.md`). |

> Commit method: full-tree `git status`/`commit` **bus-error** on this FUSE mount — commit via plumbing (`write-tree`/`commit-tree`/`update-ref`) and verify staging by blob-hash (`ls-files -s` vs `hash-object`). See Operational Notes.

## Task Cut Off
None mid-task. Build verified green at each step. Only open thread: commit + push the 3 code files above (Chris's side has been handling pushes).

## Next Task — Start Here
1. Commit the uncommitted Header/Footer/Organization changes (+ this handoff) and push to `main`.
2. Drop in the **official BBB Accredited seal** and **Richardson Chamber member badge** images (from each org's portal) and replace the `data-todo` text-icon links in the footer.
3. Resume de-scoped human items: lead-form routing (Madison = production, Crystal = service) with end-to-end tests; phone consolidation (844 sitewide, 866 on Services only); real vanity metrics; Atlanta address; DNS point + Lighthouse/a11y/schema/forms hard-gate pass before launch.

**Prompt to use:** "Read `docs/handoffs/current.md`. Commit and push the uncommitted footer/header/schema cleanup, then swap in the official BBB seal + Chamber badge images."

## Decisions Made This Session
- Canonical service labels: **Commercial & Multifamily / Residential Roofing / Roof Asset Management** across header, footer, and homepage cards.
- Social icons use **official brand vector glyphs**; **BBB/Chamber seals are not fabricated** — official licensed badges come from each org's portal.
- Organization `sameAs` is the structured-data source of social truth and must mirror the footer links.
- No generic AI imagery ships; residential warranty corrected to five-year; "1 of 5 Emerald" claim cut.
- Team-headshot framing is a documented standard (DESIGN.md v1.2) enforced by `aia4-headshot-framing`.
- Keep client webp **under the 130KB image-weight budget** (enforced by the image audit; see `28cb7db`).

## Blockers / Awaiting Human
1. **Official BBB seal + Chamber badge images** — download from each portal; then footer swap.
2. **Lead-form destinations** — Madison (production) / Crystal (service) contacts + delivery method; end-to-end test before launch.
3. **Real metrics & Atlanta address** — pending from client.
4. **Launch hard gates** — Lighthouse, a11y, schema, live form tests before client launch.

## Open Notes for Next Agent
- The headshot validator flags **Lucinda Dunn** at face-height 0.442 (just over the documented 0.44) though Chris accepts her. Consider widening `TOL_FACEH` upper to 0.45 in `frame_headshot.py` + DESIGN.md so the standard never flags an approved shot. Awaiting Chris's call.
- Footer **certification badges** (GAF / Carlisle / Versico) in the bottom strip are still text placeholders (`data-todo`).
- Header "Locations We Serve" vs footer "All Locations" both route `/locations/` — Chris said no need to align.

## Verification Commands
1. `npx astro build` — **passed, 132 pages** (run from a temp copy `/tmp/peb` with `outDir`/`cacheDir`/`vite.cacheDir` redirected and `node_modules` symlinked; the in-place build can't clear `node_modules/.vite` on the mount).
2. `python3 _aia4-skills/aia4-headshot-framing/scripts/frame_headshot.py check public/images/team/*.webp` — Lonnie PASS post-reframe; all within tolerance except the Lucinda edge note above.
3. Post-edit greps confirmed: no stale social handles remain in `dist/`; footer + schema both carry the authoritative URLs; no `ProPlan Maintenance` / mismatched service labels remain.

## Operational Notes (this environment)
- **Git on the FUSE mount:** full-tree `git status`/`diff`/`commit`/`diff-tree` **bus-error**. Per-file ops, `git add <path>`, `ls-files -s`, `hash-object`, and plumbing work. `git add` may miss a changed file due to stat-cache — `touch <file>` or `git diff --stat HEAD -- <file>` forces a re-check; verify staging by comparing `ls-files -s` blob vs `hash-object`.
- **File deletion** is blocked by default; enable via the cowork file-delete grant when needed (used to clear a stale `.git/index.lock`).
- **Builds:** macOS `node_modules` lacks the Linux rollup binary — `npm install --no-save @rollup/rollup-linux-arm64-gnu@<rollup version>`. Build from `/tmp/peb` (see cmd 1).
- **Image generation:** Higgsfield-style connector (`generate_image` w/ `nano_banana_pro`, `media_upload`/`media_confirm`) available for outpainting — no FAL.ai needed.
- **An external/automated actor commits and pushes** in this repo (e.g., `a78668b`, `28cb7db`). Don't be surprised by HEAD advancing between turns; check `git rev-parse HEAD` and `origin/main` before assuming state.

## Full Context
Older-session context (PageBuilder governance, runtime alignment, GBP workbook, architecture, design system, deployment map, key invariants) is preserved in `docs/handoffs/archive/handoff_2026-05-04_0403b.md`. The build-phase detail for the 2026-05-29 build (before this cleanup) is in `docs/handoffs/archive/handoff_2026-05-29_1453.md`. Invariants still hold: commercial/residential paths stay distinct, workbook URL canon wins, no unsourced claims ship, deployable raster/webp assets stay under the image-weight budget, and the build audit chain protects the launch baseline.
