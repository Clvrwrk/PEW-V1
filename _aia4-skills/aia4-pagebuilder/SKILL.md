---
name: aia4-pagebuilder
description: Orchestrate a full pillar-page build for an AIA4 client engagement. Use this skill whenever the user asks to "build the TPO page", "create a service page", "build out the [service] pillar", "spin up a new page", "let's build [page-slug]", "generate a page from the Figma frame", "use the page-builder", "build a pillar page", "run the page pipeline", or any other request that implies producing a complete, ship-ready service or pillar page. This is the manager skill — it dispatches `aia4-seo-validator`, `aia4-page-link`, `aia4-copywriter`, `aia4-layout`, `aia4-image-gen`, `aia4-page-qc`, and `aia4-code-qc` in the correct sequence and assembles their outputs into the final page artifact. Do NOT use this skill for individual deliverables (a single image, a copy edit, a schema check) — invoke the specialist skill directly. Do NOT use it for non-page work (reports, decision logs, brand audits) — those have their own skills.
---

# AIA4 PageBuilder — the manager

This skill is the manager for AIA4's multi-agent page build pipeline. It owns the brief, the sequence, the assembly, and the final delivery manifest. It does not write copy, design layouts, generate images, or run QC itself — it routes those tasks to the specialist skills and stitches their outputs together.

The orchestration model (phases, I/O contracts, failure modes) lives in `references/orchestration-model.md`. **Read that file before invoking this skill for the first time.** It is the source of truth; if any individual specialist's SKILL.md disagrees with it, the orchestration model wins.

## When to use this skill

- The user wants to ship a new pillar or service page end-to-end.
- A page exists thinly and needs to be rebuilt to pillar depth.
- A page failed a hard gate and needs to re-enter the pipeline at the right specialist.
- Two or more pages need to be built in parallel — invoke PageBuilder once per page; each instance dispatches its own specialist agents.

## When not to use this skill

- The user wants a single deliverable (image, paragraph, schema block) — go directly to the specialist.
- The user wants strategy work (silo plan, ICP definition, audit) — use the strategy skills.
- The user wants a client-facing report — use `aia4-client-report`.
- The user wants to pressure-test an initiative before scoping it — use `aia4-office-hours`.

## Inputs — the intake protocol

**Before any phase runs, PageBuilder runs an intake step.** It collects every required input up front via `AskUserQuestion` (batched, multiple-choice where possible) — never charges into Phase 1 with gaps. The user may provide answers piecemeal, paste a complete YAML brief, or upload supporting files. PageBuilder normalizes whatever shape arrives.

### Required from the user, every page build

| # | Field | Notes |
|---|---|---|
| 1 | **Location** | Only required if the page is location-specific (e.g., a `Dallas TPO` page or a neighborhood page). Skip on national/category pages. Format: `"Dallas, TX"` or `null`. |
| 2 | **Page URL (slug)** | The path the page will live at, e.g., `/services/tpo-roofing-systems`. Drives the output folder name. |
| 3 | **Template** | Which page type — `commercial-service`, `residential-service`, `case-study`, `neighborhood`, `blog-post`, `landing-page`, `pillar`. Determines which existing template the layout skill reuses or whether a fresh Figma cycle is needed. |
| 4 | **Main keyword** | Single primary target. The whole on-page SEO stack flows from this. |
| 5 | **Secondary keywords** | 3–8 supporting terms. Used by `aia4-seo-validator` for term-frequency targets and LSI seeding. |
| 6 | **SEO copy bundle** | The SEO writer's deliverable. Three parts, all paths or inline content: |
| 6a | • **Metadata** | Title tag, meta description, OG title/description, canonical URL. Inline string is fine. |
| 6b | • **Page copy** | The full body text. Markdown, docx, or html — copywriter will normalize. |
| 6c | • **HTML / docx file** | The original SEO writer artifact (often docx). Path or upload. Treated as raw material, not finished product. |

### Required only if no existing template covers the page

When the user picks a template that's already built (e.g., a future `commercial-service-v2`), PageBuilder reuses its layout components and skips the Figma cycle. When no template exists yet — or the user wants a fresh design — these three are required:

| # | Field | Notes |
|---|---|---|
| 7 | **Figma design URL or node ID** | Full Figma URL with `?node-id=X-Y` is preferred — PageBuilder extracts file key and node automatically. |
| 8 | **Figma page image** | A rendered PNG/JPG of the full design. Used as visual reference when the layout skill composes sections — fixes the cases where Figma metadata alone is ambiguous. Path or upload. |
| 9 | **Figma code dump** | The Tailwind/HTML extraction (Stitch/Figma Make/Anima). Used as a structural starting point — known to drop tokens and grid layouts, so layout skill rebuilds from blueprint, not from this directly. Path or upload. |

### Inferred — never asked, always read

PageBuilder loads these without asking:
- **CLAUDE.md** — persona, hard gates, north star, forbidden vocab
- **/tech/DESIGN.md** — brand canon (token roles, type scale, spacing)
- **/decisions/** — any consequential decisions that affect this page (tech stack, brand-token canon, etc.)
- **/strategy/** — silo plan, topical authority map, USP framework
- **/design/figma-cache/** — cached blueprints for nodes already pulled
- **/brand-assets/client/_INVENTORY.md** — real Pro Exteriors photos available for reuse

### Three things PageBuilder NEVER guesses

1. **The main keyword** — the whole SEO stack is downstream of this.
2. **The audience** (commercial / residential / mixed) — drives every voice and visual decision.
3. **The conversion hypothesis** — required for hard-gate compliance; PageBuilder asks if not provided.

### Brief intake YAML (the canonical shape)

```yaml
# Always required
slug: tpo-roofing-systems
template: commercial-service
location: null                    # or "Dallas, TX"
target_keyword: tpo roofing systems
secondary_keywords:
  - tpo roofing dallas
  - commercial tpo roof
  - tpo membrane installation
audience: commercial-procurement   # commercial-procurement | residential-homeowner | mixed
intent: solution-evaluation         # solution-evaluation | solution-aware | unaware | transactional
hypothesis: |
  Adding a sourced bento gallery + sourced case studies will lift TPO-page →
  TPO-assessment-request conversion ≥30% vs. the current thin page.

# SEO copy bundle
seo_copy:
  metadata:
    title: "TPO Roofing Systems in Dallas — Pro Exteriors"
    meta_description: "Industry-leading thermoplastic polyolefin..."
    canonical: https://proexteriorsus.com/services/tpo-roofing-systems
  body_path: uploads/TPO Systems.docx
  html_path: null                   # if SEO writer also delivered HTML

# Required only if no existing template covers this page
figma:
  file_key: n8EC2AgOcubGyfEq7YJoiW
  node_id: "9:3144"
  page_image_path: uploads/tpo-figma-render.png
  code_path: uploads/tpo-stitch-dump.txt

# Defaulted by PageBuilder if not provided
output_path: design/templates/tpo-roofing-systems/
```

### How PageBuilder actually runs intake

1. Parse the user's first message for any of the 9 fields.
2. Read `/design/templates/` to see which templates already exist. If the user named one, confirm it exists; if it doesn't, ask whether to (a) create it or (b) pick another.
3. For everything still missing, batch into `AskUserQuestion` calls (max 4 questions per turn). Group naturally — keyword + secondary keywords go together; Figma URL + page image + code dump go together.
4. If any uploaded file is referenced but not yet present in `/uploads/`, ask the user to upload it before continuing.
5. Once the brief is complete, write it to `design/templates/{slug}/brief.yaml` so the specialists have a stable artifact to read.
6. Confirm the brief with the user (one-line summary + any flags) before dispatching Phase 1.

## Workflow

1. **Phase 0 — Brief intake.** Construct or validate the brief. Read `CLAUDE.md`, `/tech/DESIGN.md`, the relevant `/decisions/` entries, the Figma blueprint cache (or pull fresh from Figma MCP), and `/strategy/` silo docs. Block on missing inputs by asking the user.
2. **Phase 1 — Strategy (parallel).** Dispatch `aia4-seo-validator` and `aia4-page-link` simultaneously. Wait for both manifests.
3. **Phase 2 — Copy.** Dispatch `aia4-copywriter` with the brief + Phase 1 outputs. Wait for the copy manifest.
4. **Phase 3 — Visual (parallel).** Dispatch `aia4-layout` and `aia4-image-gen` simultaneously, both with the copy manifest. Wait for both.
5. **Phase 4 — Assembly.** Stitch layout components + image references + internal links into the final page file at `design/templates/{slug}/index.astro`. Generate schema JSON-LD blocks. Wire analytics events on every CTA. Add the conversion-hypothesis comment.
6. **Phase 5 — QC (sequential).** Dispatch `aia4-page-qc` first; on pass, dispatch `aia4-code-qc`. On any fail, route the diagnostic to the relevant specialist and re-run only that specialist + the failed QC.
7. **Phase 6 — Delivery.** Produce the delivery manifest (Lighthouse scores, WCAG status, schema validation, hypothesis, artifact paths). Present to the user with `computer://` links. **Never auto-merge or auto-deploy** — the user has final ship authority.

## Outputs

A delivery manifest at `design/templates/{slug}/delivery-manifest.yaml` containing the artifacts and their pass/fail status against every hard gate from `CLAUDE.md` §4. The manifest is the single source of truth for "is this page ready to ship?" — anyone reviewing the page reads the manifest first.

## References

- `references/orchestration-model.md` — phases, I/O contracts, specialist isolation rules, failure modes
- (To be added) `references/brief-templates.md` — pre-filled briefs for service pages, neighborhood pages, case-study pages
- (To be added) `references/handoff-protocol.md` — exact JSON shapes specialists return

## What this skill does NOT decide

- Whether a page is worth building (that's strategy)
- Whether the keyword target is right (that's `aia4-seo-validator`'s call after Phase 1; if it disagrees with the brief, it returns a warning and PageBuilder escalates)
- Whether the layout direction is right (that's `aia4-layout` plus user review)
- When to ship (that's the user)
