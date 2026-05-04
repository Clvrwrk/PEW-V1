---
name: aia4-layout
description: Compose section-level Astro components for an AIA4 page build using the Figma blueprint and brand canon. Use whenever the user asks to "build the layout", "lay out the page", "compose the sections", "build the bento gallery", "lay out the case studies", "magazine-quality layout for [section]", "build the layout for [page-slug]", "design the section composition", or any related visual-composition request for a page going through PageBuilder. This skill is Phase 3 (parallel with `aia4-image-gen`) — it reads the copy manifest, the Figma blueprint cache, and `/tech/DESIGN.md` semantic tokens, then produces one Astro component per section (hero, service-overview, benefits-grid, applications, quality-process, gallery, case-studies, faq, related, cta-banner). Owns table treatments, listicle styles, pull-quotes, eyebrow placement, vertical rhythm, whitespace. Do NOT use for image generation (`aia4-image-gen`), for copy decisions (`aia4-copywriter`), for global layout (header/nav/footer come from a separate global concern), or for code-level WCAG compliance (`aia4-code-qc` runs that gate).
---

# AIA4 Layout — Magazine-Quality Composition

This skill is the visual composition layer. It treats every page as a magazine spread: vertical rhythm matters, whitespace earns its keep, eyebrow type carries the section's role, and tables/listicles/pull-quotes are first-class compositional elements — not afterthoughts.

The skill produces one Astro component per Figma section. Each component is self-contained: it imports design tokens at the top, accepts props for copy and image references, and renders only its own slot. PageBuilder stitches them together in Phase 4.

## When to use this skill

- PageBuilder Phase 3 — primary path.
- A section needs to be re-laid-out without rebuilding the whole page (e.g., the bento gallery breaks on mobile and needs to become a slider).
- The user wants to A/B layout directions for a single section.

## When not to use this skill

- Global layout (header, nav, footer, primary CTA) — those come from a separate global concern outside the per-page pipeline.
- Image generation — that's `aia4-image-gen`.
- Code-level accessibility audit — that's `aia4-code-qc` (this skill produces accessible components by construction; code-qc validates).
- Brand-token changes — those go through `/decisions/`.

## Inputs

- **Copy manifest** from `aia4-copywriter` — knows what each section says
- **Image manifest** from `aia4-image-gen` (Phase 3 may run image-gen slightly ahead so layout can wire references; if not, layout returns image-slot manifest *for* image-gen to fill)
- **Figma blueprint cache** from `/design/figma-cache/` — knows section dimensions, grids, spacing, layout intent
- **Brand canon** from `/tech/DESIGN.md` and `/design/templates/{slug}/design-tokens.css` — knows tokens, type scale, spacing, shadow

## Workflow

1. **Read the blueprint.** From `/design/figma-cache/{node}-structure.md`. Confirm grid dimensions per section. If anything is ambiguous, pull a fresh `get_design_context` from the Figma MCP for that section's node.
2. **Verify token coverage.** Every color, spacing, font, and shadow in the design must map to a semantic role token. If the blueprint references a value not in `/tech/DESIGN.md`, return a warning rather than hard-code the value.
3. **Compose the section.** One Astro file per section at `design/templates/{slug}/sections/{section-id}.astro`. Use the section recipes in `references/figma-section-templates.md` as starting points.
4. **Apply the magazine-quality rubric.** See `references/magazine-quality-rubric.md`. Every section must pass: vertical rhythm (line-heights aligned to a baseline grid), eyebrow consistency, intentional whitespace, no orphan headings, image-text balance.
5. **Add tables, listicles, pull-quotes where they earn their place.** Pillar pages thrive on these. Tables for comparisons, listicles for steps, pull-quotes for credibility moments. The recipes specify when each is appropriate.
6. **Mark section breakpoints.** Mobile and tablet behavior per section. Bento becomes vertical scroll. Multi-column grids collapse to single column. Pull-quotes inline with body. See `references/responsive-rules.md`.
7. **Wire props for copy + images.** Component accepts `{copy}` and `{images}` props matching the manifest schemas. PageBuilder injects values at assembly time.
8. **Return component manifest.** Paths, props expected, breakpoint coverage, token-dependency declaration.

## Outputs

A component manifest at `design/templates/{slug}/layout-manifest.yaml`. The Astro components themselves at `design/templates/{slug}/sections/`. Each component includes a comment block at top: which Figma node it matches, which tokens it depends on, which manifest sections it expects.

## The magazine-quality rubric (excerpt)

Pass ALL of these or the section is not ready for handoff:

- **Vertical rhythm.** All baselines align to an 8px grid (or the spacing scale in `design-tokens.css`). No mid-section drift.
- **Eyebrow type discipline.** Every section above the fold gets an eyebrow (small caps, accent color, brief). Below-the-fold sections may skip if the H2 carries the role on its own.
- **One H2 per section.** Sub-sections use H3. No H4 unless the content genuinely has three layers.
- **Image-text balance.** Sections with images: text occupies ≥40% of the visible area, never less. Bento sections are the exception.
- **Whitespace as a tool.** Section padding is at least `--space-3xl` (64px) on mobile, `--space-4xl` (96px) on desktop. Compressed whitespace is reserved for the CTA banner.
- **No orphan headings.** Every H2 has at least 100 words of supporting content directly below.
- **Brand-color discipline.** Flag-red appears at most twice on the page (typically once as the primary CTA, optionally once as a critical inline accent). Never as a section background, body text, or border decoration. **Exception:** the conversion banner (see Conversion-led composition below) — when a section's purpose IS conversion, a flag-red banner anchoring the CTA earns its place because flag-red is the brand canon's sole interaction color.
- **Pillar-depth markers present.** At least 1 table, 1 listicle, 1 pull-quote. If the page lacks any of these, it's a thin page, not a pillar.

### Bento integrity — no orphan cells (added 2026-05-03 after commercial pillar review)

A bento grid is a contract: every cell has a tile. Period.

- If you use `col-span` and `row-span` to size tiles asymmetrically, you must verify that the resulting cells fully tile the grid area — no empty col/row positions left behind. Empty cells produce the unbalanced "lonely tile next to dead space" look that reads as broken, makes the page feel anxious, and signals to a procurement audience that the contractor is sloppy.
- The fix when a span pattern leaves an orphan cell is one of: (a) resize a neighboring tile to absorb the cell, (b) add a tile to fill it, or (c) abandon the asymmetric pattern and revert to a symmetric grid. Never ship the orphan.
- Test at every breakpoint. A balanced lg layout can become an orphan-cell layout at md when col-counts change. `grid-flow-row-dense` does NOT solve this — it reorders, it doesn't fill empty cells.
- A symmetric 2-row × 3-col grid filled with 4 tiles (one tile spanning 2 rows, three tiles 1×1) reads cleaner than an asymmetric 3-row arrangement with a missing cell. Default to symmetry when the case-study count is awkward; reach for asymmetry only when you have enough tiles to fill it.
- **The math check:** `Σ (tile.col-span × tile.row-span) === grid.cols × grid.rows`. If that equation doesn't balance, the layout has orphan cells. Run the math before shipping.

### Conversion-led composition — the eye must land on the CTA (added 2026-05-03)

When a section has a CTA — a button, a form, a phone number — the section's job is to deliver the user to that CTA. Decoration that competes with the CTA is decoration that costs money. **This rubric supersedes the magazine-quality instinct anywhere the two conflict.**

Rules for any section containing a CTA:

- **The CTA is the visual climax.** The eye flows H2 → supporting content → CTA. If the CTA is buried under a floating overlay, off in a corner, or visually outweighed by a decorative image, the layout has failed regardless of how pretty it is.
- **No decorative images in conversion sections.** "Decorative" = adds no information the copy doesn't already deliver. A photo of a building, a stock crew shot, an abstract pattern — all decoration. Drop them. Use the visual real estate for the CTA. Genuinely informational images (a real customer's roof, a thermal-scan output, a diagram showing a process) earn their place; everything else competes with the conversion goal and loses.
- **No floating overlays burying the CTA.** Designy patterns like "card overlapping image, with CTA inside the card" trade conversion for visual interest. They look great in a portfolio and underperform in conversion tests. If the CTA matters more than the visual flourish, build the section around the CTA, not around the flourish.
- **Flag-red belongs on the conversion CTA.** A full-width flag-red banner with the CTA in white is the textbook conversion pattern. It anchors the eye, matches brand canon (flag-red is the sole interaction color), and earns its real estate. Use it.
- **Single dominant CTA per section.** If a section needs two CTAs (primary + secondary), the primary should be ≥1.5× the visual weight of the secondary (size, color, contrast). A row of two equally-sized buttons is a tie — both lose.
- **Conversion-section composition pattern (default):** H2 + subhead → educational content (3-up grid, list, table — uniform visual weight) → full-width flag-red CTA banner with the single primary action. Eye flows top-to-bottom, lands on the CTA, has nowhere else to go.
- **The decoration filter:** before shipping a conversion section, ask "what does this image do for the conversion?" If the answer is "it looks nice," it's decoration — drop it. If the answer is "it shows the prospect what they get / proves the claim above / clarifies the process," it earns its place.

If the magazine-quality rubric wants a beautiful image and the conversion rubric wants the image gone — **the conversion rubric wins. Every time.** CLAUDE.md §4 is the gate, not the visual portfolio.

## References

- `references/figma-section-templates.md` — Astro recipes for each section type
- `references/grid-system.md` — the baseline grid, spacing scale, breakpoints
- `references/magazine-quality-rubric.md` — the pass/fail rubric in detail
- `references/responsive-rules.md` — how each section behaves at mobile / tablet / desktop
- `references/table-and-listicle-recipes.md` — when each is appropriate, with token-aware patterns

## What this skill does NOT do

- Generate images
- Write copy
- Pick which sections exist (the Figma blueprint and orchestration model decide that)
- Validate WCAG (code-qc runs the formal audit)
- Decide token values (DESIGN.md is canon)
