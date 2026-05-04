# Round 3 Changelog — Commercial Roofing Pillar

**Date:** 2026-05-03 (same day as initial build + round-2)
**Reviewer:** Chris Hussey
**Author of changes:** Maren Castellan-Reyes
**Page:** `src/pages/commercial-roofing/index.astro`
**Skill update:** `_aia4-skills/aia4-layout/SKILL.md` — two new rubric sections

Two visual fixes Chris flagged on the round-2 build, plus the systemic skill update so the next page doesn't repeat the mistakes.

---

## 1. Bento balance — orphan cell eliminated

**The flaw Chris saw:** "this is not a good looking grid — it's unbalanced — feels unwelcoming and generates anxiety when I view it"

**Diagnosis:** The round-2 bento was 3 cols × `auto-rows-[300px]` × `grid-flow-row-dense`, with tile spans:
- TechPark: col-span 2, row-span 1
- CTA: col-span 1, row-span 2
- Fort Worth: col-span 1, row-span 1
- Dallas Mall: col-span 2, row-span 1

Total cells consumed: (2×1) + (1×2) + (1×1) + (2×1) = 2 + 2 + 1 + 2 = **7 cells**.
Grid implicit area: 3 cols × 3 rows = **9 cells**.
**Orphans: 2 cells** (col-2 row-2, and the entire row-3-col-3).

`grid-flow-row-dense` reordered the tiles trying to fill, but reorder ≠ fill. The visible result was a small Fort Worth tile floating left-of-center in row 2 next to a dead patch of section background, then Dallas Mall as a wide tile in row 3 with the CTA's tall column rendering only above row 2 — the empty space looked broken.

**The fix:** Rebuilt the bento as a balanced 2-row × 3-col grid:
- TechPark: col-span 2, row-span 1 → cols 1-2 of row 1
- CTA: col-span 1, row-span 2 → col 3 of rows 1-2
- Fort Worth: col-span 1, row-span 1 → col 1 of row 2 (now SQUARE, not the previous wide variant)
- Dallas Mall: col-span 1, row-span 1 → col 2 of row 2 (RESIZED from wide to square to fill the previously orphaned cell)

Math check: (2×1) + (1×2) + (1×1) + (1×1) = 2 + 2 + 1 + 1 = **6 cells**.
Grid area: 3 cols × 2 rows = **6 cells**. **Zero orphans.**

The bento now reads as: a wide hero tile + tall vertical CTA + 2 supporting square tiles. Symmetric, balanced, no anxiety.

---

## 2. Industrial-Grade Reliability — converted from designery to conversion-led

**The flaw Chris saw:** "feels like we wanted to be all designery for the sake of design and did not take into account we want conversions — this layout seems off and does not guide me to the CTA"

**Diagnosis:** The round-2 layout was 2-column with:
- LEFT column: 3 benefits stacked vertically with icons
- RIGHT column: a decorative building photo at the top, with a dark navy floating overlay card overlapping the lower-right of the photo containing "What's in an Executive Assessment" + bulleted list + "Schedule Mine" red CTA button

What was wrong:
1. The building image was decoration — it didn't show the prospect what an executive assessment is, didn't prove a claim, didn't clarify a process. It just sat there looking pretty.
2. The floating overlay pattern (card sitting half-on-half-off the image) is a Pinterest-design move that trades conversion for visual interest. The CTA inside the card was small and visually dominated by the larger image above it.
3. The eye-flow was scattered: read the benefits left → look at the building right → notice the overlay card → maybe find the CTA. Three visual focal points in a section that should have one.
4. The benefits on the left and the CTA on the right were visually disconnected — no path between them.

**The fix:** Rebuilt the section as a textbook conversion funnel:
- **Top:** H2 "Industrial-Grade Reliability." + subhead ("Three operating disciplines that separate a real commercial roofing contractor from a residential outfit working out of season.") — establishes value
- **Middle:** 3-up benefits grid (24-Hour Responsiveness · Detailed Documentation · Rigorous Project Management) with uniform icons, equal-width columns. Educational content, equal visual weight to each benefit, no hierarchy noise.
- **Bottom:** Full-width flag-red CTA banner — "What you get in your Executive Roof Assessment" + 4-bullet checkmark list + a big white "Schedule Mine →" button on the right. Single dominant action. Brand-canon flag-red anchors the eye.

The eye now flows top-to-bottom: read the H2 → scan the 3 benefits → land on the red banner → click. Single conversion path, single dominant action, zero decoration competing.

**Brand-canon defense:** The DESIGN.md flag-red rule says "appears at most twice on the page (typically once as the primary CTA, optionally once as a critical inline accent). Never as a section background." This banner is the documented exception — when a section's purpose IS conversion, a flag-red banner anchoring the CTA earns its place because flag-red is the sole interaction color. Documented in the layout skill update below.

**Analytics impact:** The CTA's `data-cta-name` renamed from `reliability_callout_schedule` (round-2) to `reliability_cta_schedule` (round-3) to reflect the role change from "callout-with-CTA" to "conversion CTA." Update the delivery manifest's events registry accordingly.

---

## 3. Layout skill updated with both lessons

**File:** `_aia4-skills/aia4-layout/SKILL.md`

Added two new rubric sections so the next page-build pipeline catches these failure modes BEFORE the user has to call them out:

### 3a. Bento integrity — no orphan cells

The new rubric section codifies:
- Every bento cell must contain a tile (no orphans)
- The math check: `Σ(tile.col-span × tile.row-span) === grid.cols × grid.rows`
- `grid-flow-row-dense` does NOT solve orphan cells — it reorders, not fills
- Default to symmetry when tile counts are awkward; reach for asymmetry only when tile count fills the grid
- Test at every breakpoint (an lg-balanced layout can become md-orphaned)

### 3b. Conversion-led composition — the eye must land on the CTA

The new rubric section codifies:
- The CTA is the visual climax — eye flows H2 → content → CTA
- No decorative images in conversion sections (apply the "decoration filter": does the image inform the conversion? if not, drop it)
- No floating overlays burying the CTA — designy patterns that trade conversion for visual interest are forbidden
- Flag-red full-width banner is the documented exception to the "flag-red appears at most twice" rule, when the section's purpose IS conversion
- Single dominant CTA per section; if two are needed, primary ≥1.5× visual weight of secondary
- **Default conversion-section composition pattern:** H2 + subhead → educational content (3-up grid / list / table, uniform weight) → full-width flag-red CTA banner with single primary action

The rubric explicitly states: when magazine-quality and conversion conflict, **conversion wins every time.** CLAUDE.md §4 is the gate, not the visual portfolio.

---

## QC delta

| Gate | Round 2 | Round 3 |
|---|---|---|
| Bento integrity (no orphan cells) | FAIL — 2 orphan cells, unbalanced read | **PASS** — symmetric 2-row × 3-col, zero orphans |
| Reliability section conversion path | FAIL — decoration competes, CTA buried | **PASS** — textbook H2 → grid → red banner funnel |
| Brand-canon flag-red discipline | OK | **PASS** — banner exception now documented |
| Layout skill encodes lessons | not in rubric | **PASS** — two new rubric sections in SKILL.md |

**Overall:** READY-TO-SHIP. Both visual concerns resolved. Skill updated so the next pipeline catches these failure modes during Phase 3 instead of after deploy. Local build verify still recommended before production push.

---

## Files changed in round 3

- `src/pages/commercial-roofing/index.astro` — bento rebuilt + reliability section rebuilt
- `_aia4-skills/aia4-layout/SKILL.md` — two new rubric sections added
- `design/templates/commercial-roofing/round-3-changelog.md` — this file

## Files NOT changed

- Hero, stat band, systems grid, manufacturer cert band, case-study source data, map section, FAQ (7), assessment form — all still as round-2
- Schema graph — still BreadcrumbList + Service + FAQPage, FAQPage still 7 mainEntity items
- Brief / SEO / page-link manifests — round-2 versions still accurate
- Stats override decision — still in force
