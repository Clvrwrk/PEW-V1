---
name: aia4-page-qc
description: Run page-level quality control on an assembled AIA4 page — voice, sourcing, depth, conversion-hypothesis, image alt-text, content quality. Use whenever the user asks to "QC the page", "review the page before ship", "check this page for voice", "is this page ready", "audit the page content", "review [page-slug] before ship", "page quality check", or any final review of an assembled page going through PageBuilder. This skill is Phase 5a in the pipeline (runs before `aia4-code-qc`) — it reads the assembled page, runs it against the Maren voice checklist, the forbidden-vocab deny-list, the every-claim-sourced-or-marked rule, the conversion-hypothesis-attached rule, the alt-text-completeness rule, and the pillar-depth bar (word count, table count, listicle count, internal-link count). Returns pass/fail with specific routing instructions if anything fails. Do NOT use for code-level a11y or schema validation (`aia4-code-qc`), for client-facing report QC (`aia4-client-report` has its own internal QC), or for ad-hoc copy edits during draft phase (use `aia4-copywriter` directly).
---

# AIA4 Page QC — the Maren-walkthrough gate

This skill is the editorial / voice / content gate. It is what Maren would do if she walked into a meeting and said "before we send this to the client, I'm reading every word." The skill is opinionated — it fails pages that look good but read like generic SEO content with brand polish layered on top.

It does not check WCAG, schema, or Lighthouse — that's `aia4-code-qc`. It checks the *content quality* and *voice* of the assembled page.

## When to use this skill

- PageBuilder Phase 5a — runs before code-qc.
- A page has been substantially rewritten and needs a re-QC before re-running code-qc.
- The user wants a Maren walkthrough on a draft they wrote outside the pipeline.

## When not to use this skill

- WCAG / Lighthouse / schema validation — those are `aia4-code-qc`.
- Client-facing report QC — `aia4-client-report` has its own QC.
- Ad-hoc copy edits during draft phase — use `aia4-copywriter`.
- Brand voice *guidelines* themselves — that's `brand-voice:guideline-generation`.

## Inputs

- **Assembled page file** at `design/templates/{slug}/index.astro` (post-Phase-4 output)
- **Copy manifest** from `aia4-copywriter`
- **Image manifest** from `aia4-image-gen` (for alt-text completeness check)
- **Brief** for hypothesis check
- **CLAUDE.md** for forbidden vocab + hard gates
- **Maren voice checklist** from `references/maren-voice-checklist.md`

## The QC rubric

Every check produces pass / warn / fail. **Any fail blocks the page.** Warnings can ship if the user explicitly accepts them.

### 1. Voice consistency (Maren persona, CLAUDE.md §2)
- Confident, specific, unsentimental. Cite reasoning.
- Avoid hedging language ("maybe," "perhaps," "I think") unless flagging genuine uncertainty.
- Defend craft and conversion as inseparable.
- **Fail if:** the page sounds like generic SEO content with polish layered on top.

### 2. Forbidden vocab scan
- CLAUDE.md §2 deny list: synergy, best-in-class, leverage (verb), world-class, next-gen, robust solution, delight the user, "In today's fast-paced world," any sentence beginning with "Are you ready to."
- Plus the copywriter's full deny list at `aia4-copywriter/references/forbidden-vocab.md`.
- **Fail if:** any deny-list word/phrase appears in body copy. Headings are stricter — fail on first occurrence.

### 3. Every claim sourced or marked
- Stats (percentages, durations, counts), comparisons ("4x stronger than..."), credentials ("certified by..."), case study numbers — every quantitative or attributable claim needs either a source citation or a `[REPRESENTATIVE — NOT YET SOURCED]` marker.
- **Fail if:** any claim is unsourced and unmarked. CLAUDE.md hard gate.

### 4. Conversion hypothesis attached
- Top of the page file (in a comment block) must contain a written hypothesis tying this page's design to a measurable outcome.
- Format: "We expect [change] to lift [metric] by [target] vs. [baseline] within [timeframe]."
- **Fail if:** missing or vague.

### 5. Image alt-text completeness
- Every `<img>` and `<picture>` element has descriptive alt text.
- Alt text describes the image (8–15 words), not promotes it. Decorative images use `alt=""` explicitly.
- **Fail if:** any image is missing alt or has generic alt ("image," "photo," "picture").

### 6. Pillar-depth bar
- **Word count:** ≥1,500 words for a service page; ≥2,500 for a top-tier pillar.
- **Tables:** ≥1 (comparison, spec, schedule, or pricing).
- **Listicles:** ≥1 (numbered or bulleted with substantive items, not a hand-wave list).
- **Pull-quotes:** ≥1 (real testimonial, sourced statistic, or expert quote).
- **Internal links:** ≥6 (per `aia4-page-link` manifest).
- **FAQs:** ≥4, each with a real answer (not "TBD" or empty accordion).
- **Fail if:** word count < 1,200 or any of the above counts is zero.

### 7. CTA placement
- ≥1 CTA above the fold.
- ≥1 CTA at end of page.
- Mid-page CTA (in body content) appears within 800 words of any vertical scroll position.
- **Fail if:** no above-the-fold CTA or no end-of-page CTA.

### 8. Brand canon adherence
- Flag-red appears ≤2 times on the page.
- No primary surface uses a non-token color value.
- No forbidden vocab in headings.
- **Fail if:** any token canon violation.

### 9. Structural duplication scan (added 2026-05-03)

Pages that combine rich frontmatter sections (intro / benefits / structureTypes / processSteps / ctaBanner) with markdown body content frequently end up rendering the SAME content twice — once visually as cards/grids/CTAs from frontmatter, and again as prose H2 sections in the body. The reader sees "Our Quality Process" rendered as a 3-step card grid, scrolls past it, and immediately encounters "Our Process" rendered as a numbered list with the same six steps. That's a confusion-inducing read and a credibility hit.

**This check is non-optional.** Run it on every magazine-layout page (any service page where `intro || benefits || structureTypes || processSteps` is set in frontmatter).

#### What to scan for

For each frontmatter section that's set, scan the markdown body for any H2 (or H3, or H4) whose **heading semantically duplicates** the frontmatter section's purpose. Use these aliases as a starting point — the list isn't exhaustive, but anything matching this pattern fails the check:

| Frontmatter section | Body H2/H3 aliases to flag (case-insensitive) |
|---|---|
| `intro` | "About [Service]", "Overview", "Engineered for Performance", "What Is [Service]", "Why [Service]" |
| `benefits` | "Why Choose [Service]", "Why Pro Exteriors for [Service]", "Why [Service]", "Benefits", "Key Features", "Advantages" |
| `structureTypes` | "Where [Service] Fits", "Applications", "Use Cases", "Perfect For", "Recommended For", "Where [Service] Earns Its Spec" |
| `processSteps` | "Our Process", "Process", "How We Install", "Our Quality Process", "Installation Process", "How It Works", "Methodology" |
| `ctaBanner` | "Request a Quote", "Get Started", "Contact Us", "Schedule an Assessment", "Ready to Begin" |
| `faqs` | "FAQs", "Frequently Asked Questions", "Common Questions" (rare — body usually doesn't duplicate FAQs) |
| `galleryImages` | "Our Work", "Recent Projects", "Project Gallery", "Photo Gallery" (the cards already render an image grid) |

#### How the scan runs

Static regex pass on the rendered HTML or the source mdx body:

1. Parse frontmatter; record which structured sections are present (intro, benefits, structureTypes, processSteps, galleryImages, ctaBanner, faqs).
2. Tokenize body markdown headings (lines starting with `## ` or `### `).
3. For every body heading, lowercase + strip punctuation, then check against the alias table above plus the frontmatter section's own heading text (e.g., if `processSteps.heading` is "Our Quality Process," any body H2 matching "our quality process" fails immediately).
4. For ambiguous matches (e.g., body has "Our Approach" — could be intro-style or process-style), surface as **WARN** with the offending heading + the frontmatter section it appears to overlap.

#### Decision rules when a duplicate is found

The body section often has MORE detail than the frontmatter card. Decide which copy survives based on which is the canonical source:

- **If frontmatter is the canonical visual layer for this section type** (intro, benefits, structureTypes, processSteps, ctaBanner): the body section gets cut, and any unique detail in the body that doesn't appear in the frontmatter cards gets folded into the frontmatter section's `description` fields.
- **If the body has substantially richer/more authoritative detail** than the frontmatter (e.g., 6 steps in body vs. 3 in frontmatter cards): expand the frontmatter section to capture the additional detail (or accept it as a deliberate choice and DELETE the frontmatter section, leaving body as canonical).
- **Never leave both.** "Both" is the failure state.

#### What this check has caught (audit log)

- **EPDM pillar (2026-05-03):** `## Our Process` body section duplicated `processSteps` frontmatter. Body had 6 steps; frontmatter had 3. Resolution: expanded frontmatter `processSteps` step descriptions to capture the body's unique detail; deleted body `## Our Process`. Same fix applied to Metal, Repair, Replacement, Flat Roof Systems.
- **EPDM pillar (2026-05-03):** `## Why Pro Exteriors for EPDM Roofing` body section duplicated `benefits` frontmatter. Resolution: deleted body section; folded the uniquely-additive "commercial-not-residential focus" angle into the editorial body's opening paragraph.
- **EPDM pillar (2026-05-03):** Final `## Request a Quote` body section duplicated `ctaBanner` (which renders below it in the template). Resolution: deleted body section; ctaBanner alone owns the page-end conversion ask.

#### Operational notes

- The scan can run as a Node script in /scripts/ (`audit-section-duplicates.mjs`) — invoked at build time alongside the other audits, blocking the build on a hard fail.
- Until that script is built, this check runs as part of every aia4-page-qc invocation manually — read the frontmatter, read the body H2 list, eyeball the overlap.
- **Fail if:** any body H2 semantically duplicates a present frontmatter section. Routes to the copywriter for content reconciliation.

### 10. Forbidden imagery patterns
- No stock photography of "diverse smiling team in hard hats" (CLAUDE.md §9).
- All people-images are real Pro Exteriors crews (or AI-generated to look like them with brand-photography direction).
- **Fail if:** generic-stock-aesthetic detected.

## Workflow

1. **Read the assembled page** end-to-end as Maren would — single sitting, no skipping.
2. **Run automated scans** — forbidden vocab regex, alt-text completeness, claim-source matching, depth counts.
3. **Read for voice.** Manual pass. The first three sections set the voice; if they sound off, the rest will too.
4. **Score against the rubric.** Per-check pass/warn/fail with the specific evidence.
5. **Route fails** to the right specialist. Voice or vocab issue → copywriter. Token violation → layout. Depth issue → copywriter (more content) or layout (more tables/listicles). Image alt issue → image-gen.
6. **Return QC report** at `design/templates/{slug}/qc-page-report.md`. PageBuilder reads the report; on any fail, dispatches the relevant specialist; on full pass, advances to code-qc.

## Outputs

A QC report at `design/templates/{slug}/qc-page-report.md` with check-by-check pass/warn/fail status and specific evidence + routing instructions for any fail. The page-status manifest entry: `qc_page: pass | warn | fail` plus the report path.

## References

- `references/qc-rubric.md` — the full rubric in operational detail
- `references/maren-voice-checklist.md` — what Maren approves vs. rejects
- `references/forbidden-vocab.md` — the deny-list (mirrors copywriter's list; updated when CLAUDE.md changes)
- `references/pillar-depth-bar.md` — word/table/listicle/link thresholds with examples

## What this skill does NOT do

- Code-level a11y or schema validation (`aia4-code-qc`)
- Lighthouse runs (`aia4-code-qc`)
- Browser-level visual regression (separate concern)
- Auto-fix issues (it routes fails to specialists; specialists fix)
