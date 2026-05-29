# Project Handoff — Pro Exteriors Website
**Project:** Pro Exteriors Website
**Repo:** https://github.com/Clvrwrk/PEW-V1.git
**Production URL:** not yet launched; staging/demo URL is `https://pc-demo.cleverwork.io`
**Date:** 2026-05-29 21:19
**Agent:** Maren Castellan-Reyes, Senior Director, Website & Application Experience
**Reason:** Post-review-call **final-touch batch** before go-live publish. Five client-approved edits from the 2026-05-29 call wrap-up, plus the nav/footer label propagation Chris flagged on review.

---

## Accomplished This Session

This is the punch-list Chris approved at the end of the 2026-05-29 client review call — the "make these final touches and we're ready to roll" items Chandler called out, executed against the live Astro source. The prior build-and-cleanup session is archived at `archive/handoff_2026-05-29_1539.md`; this handoff covers only what changed after it.

### 1. "Meet the Team" + "Pro Ministries Outreach" — headers, nav, and footer
- **Team page** (`src/pages/team/index.astro`): H1 is now **"Meet the Team"**; "Executive & Management Team" demoted to the red eyebrow above it.
- **Pro Ministries page** (`src/pages/pro-ministries/index.astro`): hero eyebrow corrected from **"Pro Ministries Inc." → "Pro Ministries Outreach"** (puts the right label at the top of the block, not buried).
- **Primary nav** (`src/components/organisms/Header.astro`, desktop **and** mobile drawer): `Team → Meet the Team`, `Pro Ministries → Pro Ministries Outreach`.
- **Footer** (`src/components/organisms/Footer.astro`, Company column): same two relabels, so header ↔ footer ↔ page headers all read identically. Routes unchanged (`/team/`, `/pro-ministries/`).

### 2. Pro Ministries cross mark — white cross / crimson P on navy
- Chandler wanted the white box gone behind the cross on the navy trust band. Rebuilt the mark by recoloring the existing logo: **navy cross → white, crimson-red P kept (`#800508`), white background → transparent**, preserving the exact geometry and anti-aliased edges (no redraw, no AI).
- New asset: `public/Logos/pro-ministries-logo-reverse.webp` (transparent, 600×599, ~5KB). Wired into the homepage trust band (`src/pages/index.astro`).
- Original `public/Logos/pro-ministries-logo.webp` (navy-on-white) **retained** for any light-background use. Crimson stays intentionally distinct from the Exteriors red — separate ministry.

### 3. "100+ Roofs Protected" → "2,500"
- Confirmed with Chandler ("we're probably right around there"). Changed in **two** places: homepage trust band (`src/pages/index.astro`) and the residential proof block (`src/pages/residential-roofing/index.astro`).

### 4. Residential founding stat → "Year Founded" (2021)
- Residential services page (`src/pages/residential-roofing/index.astro`): stat label **"ROOFING SINCE" → "YEAR FOUNDED"**, value stays **2021** (sr-only `<dt>` updated to match). Homepage "Roofing Since / 2021" left as-is — the relabel was scoped to the residential page only.

### 5. Service-card images — six topic mismatches replaced
Residential `serviceItems` array. Each card now carries a topic-accurate image (replacing reused/wrong photos):

| Card | Was | Now |
|---|---|---|
| Metal Roofing | `res-7` (a shingle roof) | `res-metal.webp` (standing-seam metal) |
| Tile & Clay | `res-6` (asphalt shingle) | `res-tile.webp` (Spanish clay barrel tile) |
| Natural Slate | `res-6` (asphalt shingle) | `res-slate.webp` (natural slate) |
| Gutters | `res-1` (roof aerial) | `res-gutters.webp` (seamless gutter + downspout) |
| Siding | `res-1` (roof aerial) | `res-siding.webp` (board-and-batten siding) |
| Emergency Tarping | `res-5` (pristine home, no tarp) | `res-tarp.webp` (blue tarp over storm-damaged roof); alt corrected — removed the "crew" claim, no people in shot |

- New assets live in `public/images/clients/residential/`, capped at 1100–1200px and **re-compressed under the 130KB image-weight budget** (116–118KB) so the image audit passes. Untouched real photos `res-1/2/3/4/5/6/7.webp` remain in use elsewhere on the page.

---

## ⚠️ Images Are AI-Generated Placeholders
The six service-card images in item 5 are **AI-generated** (Higgsfield `nano_banana_pro`), consistent with the fallback workflow Chris described on the call ("if a real local image doesn't exist, I'll create an AI version"). They are topic-accurate and clean, but they are **not real Pro Exteriors jobs**. Swap them for real PE project photos as those come in — priority on **Emergency Tarping** and the **material cards** (metal/tile/slate), since those read as portfolio proof. This is the one place this batch deviates from the "every image is real PE work" rule, by explicit authorization.

---

## Git State
- **Branch:** `main`. Edits are file-level; see the per-file list above.
- Reminder from prior session: **an external/automated actor commits and pushes** in this repo — verify `git rev-parse HEAD` vs `origin/main` before assuming state.

## Verification
- **Static verification passed:** all `img`/`src`/logo paths on the four edited pages resolve to files that exist; `serviceItems` array intact (11 cards); the six new images confirmed topic-accurate by eye; reverse cross mark previewed composited on navy (`#11133F`) — white cross, crimson P, no white box.
- **Full `npx astro build` could NOT run in this session's sandbox** — Vite cannot read/clear the mounted `node_modules` (`EPERM` / system error `-35` on the deps cache). Same mount limitation noted in prior handoffs, not a code defect. The changes are text/attribute/asset swaps only — no JS, imports, or tag-structure changes.
- **ACTION before publish:** run `npm run preflight` (or the `/tmp` build workaround from the archived handoff — `outDir`/`cacheDir`/`vite.cacheDir` redirected, `node_modules` symlinked) to exercise the real build + audit chain (`audit:images`, `audit:schema`, etc.) once on a machine without the mount limit.
- `astro.config.mjs` was temporarily patched with a `/tmp` `vite.cacheDir` to test-build, then **reverted** — confirmed clean (no `cacheDir` line remains).

## Blockers / Awaiting Human (carried forward + still open)
1. **Official BBB seal + Chamber badge images** — download from each portal; footer swap (`data-todo`).
2. **Lead-form destinations** — Madison (production) / Crystal (service) contacts + delivery method; end-to-end test before launch.
3. **Real metrics & Atlanta address** — pending from client (Atlanta address ~2–3 weeks per Chandler).
4. **Launch hard gates** — Lighthouse, a11y, schema, live form tests before client launch.
5. **Real PE photos** to replace the six AI service-card placeholders (see warning above).

## Open Notes for Next Agent
- The **"Meet the Team / Pro Ministries Outreach"** ask was the one ambiguous line in the transcript — Team and Pro Ministries are **separate pages**, not one combined block. Resolved as: Team page H1 = "Meet the Team", Pro Ministries eyebrow = "Pro Ministries Outreach", and both nav + footer labels updated to match. Chris approved leaving these as-is.
- Homepage hero H1 is **"America's Top Commercial Roofing Company"** — Chris said he's still testing alternate headlines; not locked. Confirm before final publish.
- Headshot validator edge note on **Lucinda Dunn** (face-height 0.442 vs 0.44 tolerance) still open — Chris accepts her; consider widening `TOL_FACEH` upper to 0.45. Unchanged this session.
- Footer certification badges (GAF / Carlisle / Versico) still text placeholders (`data-todo`). Unchanged this session.

## Full Context
Prior 2026-05-29 build-and-cleanup detail (homepage rebuild, About/Team/Pro Ministries split, residential/commercial photo swaps, headshot standardization, schema `sameAs` fix, nav-label canon, footer build-out) is in `archive/handoff_2026-05-29_1539.md`. Older-session context (PageBuilder governance, GBP workbook, architecture, design system, deployment, key invariants) is in `archive/handoff_2026-05-04_0403b.md`. Invariants still hold: commercial/residential paths stay distinct, no unsourced claims ship, deployable webp stays under the 130KB image-weight budget, and the build audit chain protects the launch baseline.
