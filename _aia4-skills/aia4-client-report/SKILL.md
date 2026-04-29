---
name: aia4-client-report
description: Generate client-facing AIA4 reports that carry the agency's brand identity, research rigor, competitor gap analysis, and revenue-focused insights. Use this skill whenever the user asks to create ANY document that will be presented to a client — competitive analyses, strategy briefs, audit reports, performance reports, discovery readouts, gap analyses, recommendations memos, executive summaries, board decks, one-pagers, status updates, or any deliverable going outside the agency. Also trigger when the user mentions "prepare something for the client", "write up our findings", "build a deck for [client]", "draft an audit", "I need a report", or references a specific client engagement that requires a formal written artifact. Use EVEN when the user doesn't explicitly say "report" — if the output is leaving the agency and going to a client, this skill applies. The skill enforces the AIA4 cover sheet rule, the forbidden-words filter, the revenue/ROI framing, the stretch-vs-chaser gap analysis framework, and the brand-lens filter. Do NOT use for internal-only working documents, drafts that stay inside the agency, or quick Slack/email messages that aren't formal deliverables.
---

# AIA4 Client Report Generator

This skill is the single source of truth for how AIA4 generates client-facing reports. It owns the content, the structure, the voice, and the brand filter. It delegates actual file creation (DOCX, PDF, PPTX) to the existing `docx`, `pdf`, and `pptx` skills — this skill tells them *what* to write, and they handle *how* to render it.

Every report that leaves an AIA4 engagement folder should feel like it was built by an expert team that did real research, ran a real gap analysis against real competitors, filtered everything through the client's brand lens, and found insights the client couldn't have bought from a generic consultant. The output should feel elegant, confident, and revenue-focused — never bloated, never AI-slop, never jargon-heavy. The hidden promise of the AIA4 mark (Shift-4 = $ on a QWERTY keyboard: *we use AI and automation to make you money*) shapes every section of every report.

## When to use this skill

Use it whenever a document is going to a client. That includes:

- Competitive audits, market landscape reports, and positioning analyses
- Discovery readouts and stakeholder synthesis decks
- Strategy briefs, brand briefs, and creative briefs
- SEO audits, CRO audits, performance reports, and measurement dashboards
- Gap analyses and recommendations memos
- Executive summaries and board-level narratives
- One-pagers, leave-behinds, pitch follow-ups, and renewal justifications

Do not use it for internal agency working documents (decision logs, scratch notes, early wireframes with no copy), for drafts that are still in ideation, or for casual communications like Slack messages and quick emails that aren't formal deliverables.

## Inputs the skill expects

Before drafting, confirm (or infer from project context) these six things. If any are missing, ask the user — do not guess on items 1, 2, or 3.

1. **Client name and engagement lockup** — e.g., "Pro Exteriors" and "AIA4 Pro Exteriors." For projects with a confirmed lockup in CLAUDE.md section 11a, use that.
2. **Report type and title** — what kind of deliverable is this, and what's the working title?
3. **Client's competitive position** — are they #1 in their category, or are they chasing #1? This determines which gap analysis mode to apply (see `references/gap-analysis-framework.md`).
4. **Audience inside the client** — CEO, CMO, board, ops lead, procurement? Different audiences get different emphasis in the executive summary.
5. **Client's brand lens** — their stated vision, mission, positioning, or brand values. If unknown, ask or note it as a gap to fill.
6. **Desired output format** — DOCX, PDF, PPTX, or markdown? If the user doesn't specify, ask. Match the format to the audience: execs skim PDFs, boards consume PPTX, working teams mark up DOCX.

## Workflow

Follow this sequence on every report. It looks long written out; in practice most reports flow through it in a single pass with a verification step at the end.

### Step 1 — Load project context

Read the project's `CLAUDE.md` (especially sections 2, 3, 4, and 11a) to pick up the engagement lockup, the persona, the hard gates, and the cover sheet rule. If the project has a `PROJECT_INSTRUCTIONS.md`, skim it for the strategic narrative. If decision logs exist in `/decisions/`, scan the relevant ones.

Check `/brand-assets/logos/` for the AIA4 logo files and the client logo (if present). Cover sheets require at minimum the AIA4 SVG or PNG.

### Step 2 — Gather or confirm research

If the user has already done the research and is handing you notes, synthesize from those. If the user expects the skill to produce the research as well, reach for the appropriate upstream skill first:

- `marketing:seo-audit` for organic search audits
- `marketing:competitive-brief` or `sales:competitive-intelligence` for competitor research
- `design:user-research` or `design:research-synthesis` for qualitative synthesis
- `data:analyze` or `data:explore-data` for quantitative analysis
- Web search for public company facts, earnings reports, market sizing

Do not skip research. A report with no research backbone will feel like AI slop no matter how good the writing is. If research is insufficient, tell the user what's missing and ask whether they want to supply it or authorize a deeper dive.

### Step 3 — Apply the gap analysis framework

Read `references/gap-analysis-framework.md` before you write this section. The framework has two modes — one for clients who are chasing the category leader, one for clients who ARE the category leader. Picking the wrong mode produces a generic report.

Every report needs a gap analysis section even if it's not the main topic — because the whole point of an AIA4 report is to show the client where they stand, what they're missing, and what the move is. A report without a gap section tells the client nothing they didn't already know.

### Step 4 — Run every insight through the brand lens filter

Read `references/brand-lens-filter.md`. Take the client's stated brand, vision, mission, and values, and check every finding against them. A finding that doesn't tie back to the client's brand identity isn't an insight — it's a data point. The skill's job is to convert data points into insights by connecting them to something the client cares about strategically.

### Step 5 — Draft the report using the standard structure

Read `references/report-structure.md` for the section-by-section template. The standard spine has seven sections, and each section has a rationale explaining *why it exists* so you can defend or adapt it intelligently. Do not invent sections without reading the rationale first — the structure is deliberate.

The seven sections, in order:

1. **Cover sheet** (non-negotiable — see `references/cover-sheet-spec.md`)
2. **Executive summary** — the decision, not the methodology
3. **Situation** — where the client stands today, in one tight page
4. **Gap analysis** — stretch competitors OR top-5 chasers, per Step 3
5. **Brand-lens insights** — what the research means through the client's vision
6. **Recommendations** — revenue-indexed, ordered by impact
7. **Next steps & measurement** — what happens next, how we'll know it worked

### Step 6 — Apply voice and tone rules

Read `references/voice-and-tone.md` before finalizing any prose. This file contains the forbidden-words list, the anti-slop checklist, and the Maren voice calibration notes. Run every paragraph of the draft against these rules. Cut or rewrite anything that fails.

### Step 7 — Generate the cover sheet

Read `references/cover-sheet-spec.md`. The cover sheet is non-negotiable on every client-facing deliverable. It's also the first thing the client sees, and a sloppy cover sheet kills the credibility of the work behind it before the client reads a word.

### Step 8 — Render to the requested format

Delegate file creation to the appropriate existing skill. Do not try to render DOCX/PPTX/PDF yourself — use the tools that were built for it.

- **DOCX:** invoke the `docx` skill with the structured content
- **PPTX:** invoke the `pptx` skill with the structured content and slide breakdown
- **PDF:** invoke the `pdf` skill with the rendered content
- **Markdown:** write directly, no delegation needed

When delegating, pass the cover sheet spec along with the main content so the downstream skill places the logo and metadata correctly.

### Step 9 — Verify before shipping

Before handing the report to Chris or the client, run this quick verification:

- Cover sheet present with correct logo, lockup, title, client name, date, author
- Executive summary leads with a decision or recommendation, not a methodology recap
- Gap analysis uses the correct mode (stretch comps vs top-5 chasers)
- Every insight connects to a revenue or profitability lever
- Every claim has a source or is flagged as the client's own insight
- No forbidden words (see `references/voice-and-tone.md`)
- No consultant clichés, no "In today's fast-paced world," no "leverage" as a verb
- Document length is as short as it can be without losing substance
- File saved to the correct project subfolder with a `computer://` link ready to share

If any gate fails, do not ship. Tell the user what failed and why.

## Reference files

The detailed logic lives in these files. Read them when the step points you to them.

- `references/voice-and-tone.md` — Maren voice, forbidden words, anti-slop checklist, do/don't examples
- `references/report-structure.md` — Section-by-section template with "why it exists" rationale for each
- `references/gap-analysis-framework.md` — Two-mode framework (stretch comps vs top-5 chasers) with worked examples
- `references/brand-lens-filter.md` — How to convert data points into brand-anchored insights
- `references/cover-sheet-spec.md` — Exact cover sheet requirements including logo placement, metadata fields, and typography

## Tone calibration — the short version

If you remember only one thing from this skill, remember this: an AIA4 report reads like a confident director handing the client a decision, not a consultant handing the client a menu. The client should close the report knowing what to do next and why. If they close it thinking "that was interesting, what should I do with it?" — the report failed, even if every fact in it was correct.

The hidden AIA4 promise is that we use AI and automation to make the client money. The reader will never see the Shift-4 = $ joke written down anywhere. But every report they get from us should feel like money — clean, purposeful, unbothered by filler, focused on the number at the bottom of their P&L.
