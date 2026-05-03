# AIA4 PageBuilder — Orchestration Model

**Purpose:** Defines how the eight `aia4-*` page-building skills interact. Read this before invoking PageBuilder for the first time on any new page. Read it again any time the model feels off — drift here breaks the whole pipeline.

**Authored:** Maren Castellan-Reyes · 2026-05-03
**Source of truth:** This file. Any individual SKILL.md disagrees with it, this file wins.

---

## The eight skills, at a glance

| Skill | Role | Phase | Runs in parallel with |
|---|---|---|---|
| `aia4-pagebuilder` | Manager / orchestrator | 0, 4, 6 | — |
| `aia4-seo-validator` | Keyword research, term-frequency targets, schema spec | 1 | `aia4-page-link` |
| `aia4-page-link` | Reverse-silo internal links + anchor text | 1 | `aia4-seo-validator` |
| `aia4-copywriter` | Section copy + humanization | 2 | — |
| `aia4-layout` | Astro components per section, brand-token aware | 3 | `aia4-image-gen` |
| `aia4-image-gen` | Hero / supporting / gallery images via Higgsfield + Fal | 3 | `aia4-layout` |
| `aia4-page-qc` | Voice, sourcing, depth, conversion-hypothesis check | 5 | — |
| `aia4-code-qc` | WCAG 2.2 AA, Lighthouse, schema validator, semantic HTML | 5 | — |

## Phases

### Phase 0 — Brief intake (PageBuilder)

PageBuilder runs an explicit intake step **before any other phase**. Required fields are listed below; PageBuilder collects what the user provided in their message, then asks for everything else via `AskUserQuestion` (max 4 questions per turn, grouped naturally). The user may also paste a complete YAML brief and skip the questions.

#### Always required

| # | Field | Description |
|---|---|---|
| 1 | `location` | Only when the page is location-specific (city/neighborhood/state page). `null` otherwise. |
| 2 | `slug` | Page URL path, e.g. `/services/tpo-roofing-systems`. Drives output folder name. |
| 3 | `template` | Page type: `commercial-service` / `residential-service` / `case-study` / `neighborhood` / `blog-post` / `landing-page` / `pillar`. Determines layout reuse or fresh Figma. |
| 4 | `target_keyword` | Single primary keyword. The on-page SEO stack flows from this. |
| 5 | `secondary_keywords` | 3–8 supporting terms. Used for term-frequency and LSI seeding. |
| 6 | `seo_copy` | Bundle: `metadata` (title, meta description, canonical), `body_path` (docx/md/html with full copy), optional `html_path`. |
| 7 | `audience` | `commercial-procurement` / `residential-homeowner` / `mixed`. |
| 8 | `intent` | `solution-evaluation` / `solution-aware` / `unaware` / `transactional`. |
| 9 | `hypothesis` | Written conversion hypothesis tying this page's design to a measurable outcome. CLAUDE.md hard gate — must be present or page can't ship. |

#### Required ONLY if no existing template covers this page

When the user picks a template that already exists in `/design/templates/`, PageBuilder reuses its layout components and skips the Figma cycle. When no template exists yet (every first-of-its-kind page) or the user wants a fresh visual direction:

| # | Field | Description |
|---|---|---|
| 10 | `figma.file_key` | File key from the Figma URL. |
| 11 | `figma.node_id` | Node ID of the **parent frame** of the page (not a child element). |
| 12 | `figma.page_image_path` | Path to a rendered PNG/JPG of the full design. Visual reference for the layout skill. |
| 13 | `figma.code_path` | Path to the Tailwind/HTML extraction (Stitch / Figma Make / Anima). Treated as structural starting point only — known to drop tokens and grid layouts. |

#### Inferred — read, never asked

- `CLAUDE.md` — persona, hard gates, north star, forbidden vocab
- `/tech/DESIGN.md` — brand canon
- `/decisions/` — consequential decisions affecting the page
- `/strategy/` — silo plan, topical authority, USP framework
- `/design/figma-cache/` — cached blueprints for nodes already pulled
- `/brand-assets/client/_INVENTORY.md` — real Pro Exteriors photos available for reuse

#### Canonical brief shape

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
audience: commercial-procurement
intent: solution-evaluation
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
  html_path: null

# Required only if no existing template covers this page
figma:
  file_key: n8EC2AgOcubGyfEq7YJoiW
  node_id: "9:3144"
  page_image_path: uploads/tpo-figma-render.png
  code_path: uploads/tpo-stitch-dump.txt

# Defaulted by PageBuilder
output_path: design/templates/tpo-roofing-systems/
```

#### Intake workflow

1. **Scan the user's message** for any of fields 1–13. Extract whatever's present.
2. **Check `/design/templates/`** for an existing template matching field 3. If named template doesn't exist, ask whether to create it as a new template type or pick a different one.
3. **Batch missing fields into `AskUserQuestion`** — max 4 questions per turn, grouped: (a) location + slug + template, (b) keywords, (c) audience + intent + hypothesis, (d) Figma if needed.
4. **Verify uploaded files.** If a brief references `uploads/foo.docx`, confirm the file exists. If not, ask the user to upload before continuing.
5. **Persist the brief** to `design/templates/{slug}/brief.yaml`. This becomes the stable artifact the specialists read; intake doesn't re-run on retries.
6. **Confirm with user.** One-line summary plus any flags ("template doesn't exist yet — I'll create it; SEO writer body looks thin — copywriter will need to expand significantly"). Wait for go.
7. **Then and only then:** dispatch Phase 1 (parallel `aia4-seo-validator` + `aia4-page-link`).

**Never guess on:** target keyword, audience, hypothesis. Always ask.

### Phase 1 — Strategy (parallel)

Dispatch two specialists at the same time. Each returns a JSON manifest in <500 lines.

**`aia4-seo-validator` returns:**
```json
{
  "target_keyword_data": { "volume": 2400, "kd": 28, "cpc": 6.40 },
  "term_frequency_targets": { "tpo": 18, "membrane": 12, "single-ply": 6, "...": 0 },
  "lsi_keywords": ["thermoplastic olefin", "epdm comparison", "energy star", "..."],
  "schema_types_required": ["RoofingContractor", "Service", "FAQPage", "BreadcrumbList"],
  "competitor_pages_analyzed": ["...", "...", "..."]
}
```

**`aia4-page-link` returns:**
```json
{
  "internal_links_out": [
    { "anchor": "EPDM systems", "target": "/services/epdm-systems", "context": "Other Commercial Solutions card" },
    { "anchor": "thermal moisture scan", "target": "/services/diagnostics/moisture-scan", "context": "CTA banner" }
  ],
  "internal_links_in_required": [
    { "from": "/services/epdm-systems", "anchor": "TPO membrane" }
  ],
  "silo_role": "money-page",
  "tier": "T2"
}
```

### Phase 2 — Copy (sequential, blocked by Phase 1)

`aia4-copywriter` takes:
- The page brief
- Phase 1 outputs (SEO targets + LSI keywords + link anchors that must appear in body)
- Source copy from SEO writer (if present)
- Figma blueprint cache (so it knows the section slots)

Returns a **section manifest**:

```yaml
sections:
  - id: hero
    h1: "TPO Roofing Systems in Dallas"
    subhead: "Industry-leading thermoplastic polyolefin..."
  - id: service-overview
    eyebrow: "ENGINEERED FOR PERFORMANCE"
    h2: "Built for the heat. Welded for the hail."
    body: |
      Two paragraphs of copy in Maren voice...
    badges: ["Energy Star Certified", "20-Year Warranty"]
  # ... one block per Figma section
output_path: design/templates/tpo-roofing-systems/copy.yaml
```

Copy is run through `huewrite.py` with `--tone professional` before return. `aia4-copywriter` enforces the forbidden-vocab list internally.

### Phase 3 — Visual (parallel)

**`aia4-layout` takes:** copy.yaml + Figma blueprint + DESIGN.md tokens. Produces Astro components per section at `design/templates/{slug}/sections/{id}.astro`. Uses ONLY semantic role tokens. Returns a manifest of component paths.

**`aia4-image-gen` takes:** copy.yaml + layout slot manifest. For each image slot, picks the right model:
- Hero with text overlay → `nano_banana_2` (Nano Banana Pro)
- Editorial supporting (Quality Process trio, Service Overview) → `gpt_image_2`
- Cinematic stills (case study heroes, photo gallery main) → `cinematic_studio_2_5`
- Diagrams or schema visuals → `flux_2` with `flex` model
Saves to `design/templates/{slug}/assets/{slot}.{ext}`. Returns image manifest with paths, alt text, and prompts used.

### Phase 4 — Assembly (PageBuilder)

PageBuilder reads:
- Section components from layout
- Image manifest from image-gen
- Internal-link manifest from page-link
- Schema types from seo-validator

Stitches into the final page at `design/templates/{slug}/index.astro`. Generates the schema JSON-LD blocks. Wires analytics events on every CTA. Writes the conversion-hypothesis comment at the top of the file. Adds the `[REPRESENTATIVE — NOT YET SOURCED]` markers anywhere required.

### Phase 5 — QC (sequential, both must pass)

**`aia4-page-qc`** reads the assembled page. Returns a pass/fail report:
- Voice consistency vs. Maren persona (CLAUDE.md §2)
- Forbidden-vocab scan
- Every claim sourced or marked
- CTA placement (hero, mid-page, end)
- Conversion hypothesis present
- Image alt-text completeness
- Pillar depth check (word count, table count, listicle count, internal-link count)

**`aia4-code-qc`** runs after page-qc passes. Returns a pass/fail report:
- WCAG 2.2 AA contrast on every surface (delegated to `design:accessibility-review`)
- Tap targets ≥44px
- Keyboard nav + focus visible
- Semantic HTML (one h1, ordered headings, landmarks, skip-link)
- ARIA where needed, never decorative
- Schema validation (Google Rich Results test format)
- Lighthouse mobile target ≥95 / 100 / 100 / 100

If either QC fails, PageBuilder routes feedback to the relevant specialist (copy issue → copywriter; layout issue → layout; image issue → image-gen) and re-runs only that specialist + the failed QC. **Do not re-run the whole pipeline on a single specialist's miss.**

### Phase 6 — Delivery (PageBuilder)

When both QC gates pass, PageBuilder produces a delivery manifest:

```yaml
slug: tpo-roofing-systems
status: ready-to-ship
hard_gates:
  lighthouse_mobile: { perf: 96, a11y: 100, best_practice: 100, seo: 100 }
  wcag: AA
  schema_validated: true
  every_claim_sourced_or_marked: true
  hypothesis_attached: true
artifacts:
  page: design/templates/tpo-roofing-systems/index.astro
  copy: design/templates/tpo-roofing-systems/copy.yaml
  images: design/templates/tpo-roofing-systems/assets/
  schema: design/templates/tpo-roofing-systems/schema.json
  audit: design/templates/tpo-roofing-systems/qc-report.md
```

PageBuilder presents this manifest to the user along with `computer://` links to the artifacts. The user has final ship authority — PageBuilder never auto-merges or auto-deploys.

## Failure modes and recovery

| Failure | Detected by | Recovery |
|---|---|---|
| Brief missing target keyword | PageBuilder Phase 0 | `AskUserQuestion` |
| Figma node returns subhead only (not parent frame) | PageBuilder Phase 0 | Walk up via `get_metadata`, or ask user for parent node |
| SEO target volume = 0 | seo-validator Phase 1 | Flag; ask user to confirm or pivot keyword |
| Copy contains forbidden vocab | copywriter internal | Self-fix before return; if recurring, escalate |
| Layout component fails contrast | code-qc Phase 5 | Route to layout with the failing pair, re-run layout + code-qc |
| Image alt-text missing | page-qc Phase 5 | Route to image-gen; alt-text is part of image-gen's deliverable |
| WCAG fail | code-qc Phase 5 | Route to layout (visual issue) or page-qc (content issue) based on diagnostic |
| User disagrees with copy direction | After Phase 6 | User asks for revision; PageBuilder dispatches copywriter only with the new direction |

## Inviolable rules

1. **Specialist isolation.** Copywriter does not write code. Layout does not write copy. Image-gen does not pick anchor text. Each agent stays in its lane.
2. **PageBuilder is the only orchestrator.** Specialists never call other specialists directly. They return their manifest; PageBuilder routes the next step.
3. **Brand canon is not negotiable.** Every skill reads `/tech/DESIGN.md` and `/decisions/` before producing output. If a specialist wants to violate canon, it returns a flag and PageBuilder escalates.
4. **Hard gates block ship.** No QC override without a logged decision in `/decisions/`.
5. **Sources or markers.** Every claim either has a source or wears a `[REPRESENTATIVE — NOT YET SOURCED]` tag. This is a CLAUDE.md hard gate, not a style preference.

## Inputs every specialist must accept

```yaml
brief:                  # the page brief from Phase 0
  slug: ...
  target_keyword: ...
  audience: ...
  hypothesis: ...
phase_outputs:          # outputs from prior phases, if any
  seo_validator: ...
  page_link: ...
  copywriter: ...
  layout: ...
  image_gen: ...
project_paths:          # canonical project paths
  claude_md: /CLAUDE.md
  design_md: /tech/DESIGN.md
  decisions: /decisions/
  figma_cache: /design/figma-cache/
  scripts: /tech/scripts/
  silo_strategy: /strategy/SEO-Architecture_Link-Equity-Strategy_April-2026.docx
  topical_authority: /strategy/Topical-Authority-Attack-Plan_12-Month.docx
```

## Outputs every specialist must produce

```yaml
status: success | warning | fail
deliverables:
  - path: ...
    type: copy | astro | image | json | report
notes:
  - "Anything PageBuilder needs to know"
warnings:
  - "Things that didn't fail but the next agent should know"
next_action: handoff | retry | escalate-to-user
```

## What NOT to put in any of these skills

- Project strategy decisions (those go in `/decisions/`)
- Brand canon (that's `/tech/DESIGN.md`)
- Ad-hoc keyword research that isn't from DataForSEO (the validator skill is the gate)
- Forbidden vocab additions (those belong in `CLAUDE.md` or `aia4-copywriter/references/forbidden-vocab.md`)
- Tool credentials (those live in `.env`)
- Anything client-confidential (financials, employee PII, contracts)

## Where to extend

When a new page type emerges (case-study page, neighborhood page, blog post), the specialists stay the same — only the brief changes. If a new specialist becomes necessary (e.g., a `aia4-video-gen` skill, separate from image-gen), add it to this orchestration model first, then write its SKILL.md.
