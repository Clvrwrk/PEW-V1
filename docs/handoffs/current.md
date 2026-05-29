# Project Handoff — Pro Exteriors Website
**Project:** Pro Exteriors Website
**Repo:** https://github.com/Clvrwrk/PEW-V1.git
**Production URL:** not yet launched; staging/demo URL is `https://pc-demo.cleverwork.io`
**Date:** 2026-05-29 14:53
**Agent:** Maren Castellan-Reyes, Senior Director, Website & Application Experience
**Reason:** User-requested full handoff after the client review-call build session

---

## Accomplished This Session

This session executed the edits coming out of the 2026-05-29 Pro Exteriors website review call (transcript → task list → phased plan → Chris-approved scope), then a follow-on team-headshot standardization pass. Operational/human launch tasks (DNS, lead-form routing to Madison/Crystal, phone consolidation, financing copy, locations/map, launch sequence) were explicitly held OUT of build scope per Chris and remain human follow-ups.

### Homepage (`src/pages/index.astro`)
- Hero H1 reframed from "Dallas-Fort Worth's Top Commercial Roofing Company" → **"America's Top Commercial Roofing Company"** (national); "16 states" subhead kept.
- Trust row: removed the Malarkey Emerald Premium badge → replaced with the **Pro Ministry logo + "Faith Based"** label in the far-left slot; "2022 Year Premium Certified" → **"2021 / Roofing Since"**; "10M+ Sq Ft Installed" → **"100+ Roofs Protected"**.
- Audience split rebuilt from two cards into **three service-division cards** (Commercial & Multifamily, Residential, Roof Asset Management → `/proplan/`), each on a client photo background.

### Navigation (`Header.astro`, `Footer.astro`)
- "About" split into three top-level nav items: **About Us** (`/about/`), **Team** (`/team/`), **Pro Ministries** (`/pro-ministries/`).
- **Projects** and **Resources** removed from primary nav (pages still build; just not surfaced).
- Footer Company column updated to About Us / Team / Pro Ministries / Careers.

### About / Team / Pro Ministries
- `src/pages/about/index.astro` — rebuilt as **About Us** from `content/Client Docs/Pro Ministries/Option 1.pdf` (Story, Mission, Vision, Core Values, What Sets Us Apart, What We Do, CTA). Pro Ministries collage + team grid removed from this page.
- `src/pages/team/index.astro` — **new** "Executive & Management Team" page ("Meet the Team" eyebrow), centered orphan-safe grid, static cards (no click-through).
- `src/pages/pro-ministries/index.astro` — **new** page from `Pro Ministries Outreach.pdf`; collage minus the two client-flagged images (`485111221_*`, `500468406_*`).
- `src/pages/about/mission.astro` and `src/pages/about/leadership.astro` — converted to **meta-refresh redirect stubs** (`→ /about/` and `→ /team/`) to avoid duplicate content. (Could not `rm` on the mount; stubs were the chosen approach instead of config redirects.)

### Residential Services (`src/pages/residential-roofing/index.astro`)
- All generic/`[REPRESENTATIVE]` AI images **and the static video poster** swapped to client photos from `content/Client Docs/Residential/Photos/`.
- Removed the **"1 of 5 in DFW Metroplex" / Malarkey Elite "one of five"** claim (trust strip + section heading/copy).
- Corrected workmanship warranty from "lifetime" → **five-year** to match the client's `Pro_Exteriors_Residential_Services.docx`; aligned certified-manufacturer mentions to the doc (Malarkey, Atlas, GAF, TAMKO, CertainTeed).

### Commercial Services (`src/pages/commercial-roofing/index.astro`)
- Hero image swapped to a client photo.
- Added a **"Commercial Roofing Systems We Install"** gallery (TPO / EPDM / Metal / Shingles) using client photos by membrane type.
- Added a dedicated **Multi-Family** section using `Multi-Family Photos`.

### Team headshots
- Added **Shawn Hillard** (Residential Operations Manager) to the Team grid (asset landed mid-session in `Company Headshots/`).
- **Lonnie Sawyer** was the only headshot outside framing tolerance (face-top 0.049 — head against the top edge). Extended the canvas via the image connector (outpaint) and reframed to the canonical frame (**face-top 0.134, centered**). Lucinda / Isaac / Crystal confirmed within tolerance by Chris and left untouched.
- `tech/DESIGN.md` → **v1.2**: added the **Team Headshots** framing standard (4:3, face-top 0.13, face-height 0.32, centered, with tolerances).
- New project-local skill **`_aia4-skills/aia4-headshot-framing/`** (`SKILL.md` + `scripts/frame_headshot.py`): `check` validates a headshot against the standard; `reframe` conforms it; documents the "outpaint-first when headroom is too tight, then reframe" workflow. CLAUDE.md skill-map pointer added.

### Asset pipeline
- Converted 30 client images to web-optimized webp (max 1600px, q82, EXIF-corrected) into `public/images/clients/**`, `public/images/home/**`, `public/Logos/pro-ministries-logo.webp`. Originals in `content/Client Docs/**` untouched (Drive remains source of truth per CLAUDE.md §11a).

### Decision record
- `decisions/2026-05-29-client-review-call-build-edits.md` — approved scope, asset pipeline, known gaps, hard-gate notes, rollback.

## Git State
- **Branch:** `main`
- **HEAD:** `3da0f9a` — "Team headshots: add Shawn Hillard, reframe Lonnie, add framing standard + skill"
- **Parent:** `fa023f8` — "Client review-call build edits (2026-05-29)"
- **Both commits are UNPUSHED** — this sandbox has no GitHub credentials (no helper, token, or `gh`). `git push origin main` must be run from an authenticated environment, or a PAT supplied.
- Commits were created via plumbing (`write-tree` / `commit-tree` / `update-ref`) because `git status`/`git commit` full-tree scans **bus-error on this FUSE mount**. Per-file `git` ops and plumbing work; file deletion required enabling cowork file-delete. See "Operational notes" below.

| File / Path | Status | Note |
|------|--------|------|
| `src/pages/index.astro` | Modified | National hero; trust row; 3 service-division cards. |
| `src/components/organisms/Header.astro` | Modified | About→3 items; dropped Projects + Resources. |
| `src/components/organisms/Footer.astro` | Modified | Company column → About Us / Team / Pro Ministries. |
| `src/pages/about/index.astro` | Modified | Rebuilt as About Us (Option 1.pdf). |
| `src/pages/about/mission.astro` | Modified | Now a redirect stub → `/about/`. |
| `src/pages/about/leadership.astro` | Modified | Now a redirect stub → `/team/`. |
| `src/pages/team/index.astro` | Added | Executive & Management Team; +Shawn Hillard. |
| `src/pages/pro-ministries/index.astro` | Added | Pro Ministries Outreach page. |
| `src/pages/residential-roofing/index.astro` | Modified | Client images + video poster; removed 1-of-5; 5-yr warranty. |
| `src/pages/commercial-roofing/index.astro` | Modified | Client hero; membrane gallery; Multi-Family section. |
| `public/images/clients/**` | Added | 7 residential, 11 commercial (epdm/metal/shingles/tpo), 4 multifamily. |
| `public/images/home/**` | Added | 3 division-card backgrounds. |
| `public/Logos/pro-ministries-logo.webp` | Added | Trust-row faith logo. |
| `public/images/team/Shawn Hillard - Residential Operations Manager.webp` | Added | New team member. |
| `public/images/team/Lonnie Sawyer - Insurance Programs Manager.webp` | Modified | Outpainted + reframed to standard. |
| `tech/DESIGN.md` | Modified | v1.2 — Team Headshots framing standard. |
| `CLAUDE.md` | Modified | Skill-map pointer for `aia4-headshot-framing`. |
| `_aia4-skills/aia4-headshot-framing/SKILL.md` | Added | Headshot framing skill. |
| `_aia4-skills/aia4-headshot-framing/scripts/frame_headshot.py` | Added | check + reframe tool (cv2/PIL). |
| `decisions/2026-05-29-client-review-call-build-edits.md` | Added | Approved-scope decision record. |
| `docs/handoffs/archive/handoff_2026-05-04_0403b.md` | Added | Prior handoff archived before overwrite (naming: `handoff_Date_Time.md`). |
| `docs/handoffs/current.md` | Modified | This handoff. |

Note: the decision record + most build edits are in commit `fa023f8`; the headshot/standard/skill set + the prior-handoff archive are in `3da0f9a`. **This handoff file itself is uncommitted** — commit it (and the archived copy) with the push.

## Task Cut Off
None mid-task. Session ended at a clean, build-verified boundary. The only open thread is the push, which is environment-blocked on credentials.

## Next Task — Start Here

**Task:** Push the two commits, then resume the human launch items that were de-scoped from this build.

**What to do:**
1. From an authenticated environment: `git push origin main` (pushes `fa023f8` + `3da0f9a`). Commit this handoff + the archived prior handoff first.
2. Lead-form routing — wire production forms → **Madison King**, service forms → **Crystal** (confirm delivery method; coordinate directly). End-to-end test before launch (CLAUDE.md §4).
3. Phone consolidation — 844 sitewide except 866 on the Services page (verify across map popups).
4. Provide real vanity metrics beyond "100+ Roofs Protected"; supply Atlanta address when the lease closes.
5. DNS/GoDaddy point + Lighthouse/a11y/schema/forms hard-gate pass before client launch.

**Prompt to use:** "Read `docs/handoffs/current.md`. Push the two unpushed commits on main, then pick up the lead-form routing wiring (Madison/Crystal)."

## Decisions Made This Session
- **De-scoped human tasks** (DNS, lead routing, phone, financing, locations/map, launch) were removed from build scope at Chris's direction; only on-site build work was executed.
- **No generic AI imagery ships** — all placeholder/`[REPRESENTATIVE]` images on edited pages replaced with real client photos; AI imagery is a liability under the current Google posture and CLAUDE.md §9.
- **Warranty corrected to five-year** on residential to match the client doc (claims-have-receipts gate).
- **"1 of 5 Emerald Premium" claim cut** at client request.
- **mission/leadership consolidated** into About Us / Team via redirect stubs to prevent duplicate content (mount blocked file deletion).
- **Team headshot framing is now a documented standard** (DESIGN.md v1.2) enforced by a reusable skill; outpaint-then-reframe is the sanctioned fix for under-headroom shots.

## Blockers Requiring Human Action
1. **Push credentials** — no GitHub auth in this environment; push must happen from Chris's machine or via a supplied PAT.
2. **Lead-form destinations** — Madison King (production) and Crystal (service) contact + delivery method; forms must be tested end-to-end before launch.
3. **Real metrics & Atlanta address** — pending from client.
4. **Launch hard gates** — Lighthouse, accessibility, schema, and live form tests remain a human launch-gate (out of this build's scope).

## Verification Commands
1. `npx astro build` — **passed, 132 pages** (run from a temp working copy with cache redirected; see operational notes — the in-place build can't clear `.vite` on the mount).
2. `python3 _aia4-skills/aia4-headshot-framing/scripts/frame_headshot.py check public/images/team/*.webp` — 13/14 within tolerance pre-fix; Lonnie now PASS post-reframe (Lucinda sits at face-height 0.442, marginally over the documented 0.44 band but accepted by Chris — see open note).
3. Client-image existence check — all referenced `/images/clients/**`, `/images/home/**`, and the faith logo resolve in `/public`.

## Open Note for Next Agent
The headshot validator flags **Lucinda Dunn** at face-height 0.442 (just over the 0.44 documented upper bound) though Chris accepts her framing. Consider widening the `TOL_FACEH` upper bound to 0.45 in `frame_headshot.py` + DESIGN.md so the standard never flags an approved shot. Chris was asked; awaiting his call.

## Operational Notes (this environment)
- **Git on the FUSE mount:** full-tree `git status` / `git diff` / `git commit` / `diff-tree` **bus-error (core dump)** intermittently. Per-file diffs, `git add <path>`, `ls-files -s`, `hash-object`, and plumbing (`write-tree`/`commit-tree`/`update-ref`) work. Commits this session were made via plumbing.
- **Stat cache:** `git add` sometimes misses a changed file because the mount's stat matches the index; `touch <file>` or `git diff --stat HEAD -- <file>` forces a re-check. Verify staging by comparing `git ls-files -s -- <file>` blob vs `git hash-object <file>`.
- **File deletion** is blocked by default ("Operation not permitted"); it was enabled for this folder via the cowork file-delete grant to clear a stale `.git/index.lock`.
- **Builds:** `node_modules` shipped from macOS, missing the Linux rollup binary — installed `@rollup/rollup-linux-arm64-gnu` `--no-save` for the sandbox. The in-place `astro build` cannot clear `node_modules/.vite` on the mount; build from a temp copy (`/tmp/peb`) with `outDir`/`cacheDir`/`vite.cacheDir` redirected and `node_modules` symlinked.
- **Image generation:** a Higgsfield-style connector (`generate_image` with `nano_banana_pro`, `media_upload`/`media_confirm`) is available for outpainting — no FAL.ai needed. ~3,900 credits available at session end.

## Full Context
Prior session context (PageBuilder governance, runtime alignment, GBP workbook, architecture, design system, deployment map, key invariants) is preserved in `docs/handoffs/archive/handoff_2026-05-04_0403b.md`. The invariants there still hold: commercial/residential paths stay distinct, workbook URL canon wins, no unsourced claims ship, deployable raster assets must be webp, and the build audit chain protects the launch baseline.
