---
name: aia4-copywriter
description: Draft section-by-section page copy for an AIA4 page build. Use whenever the user asks to "write the TPO copy", "draft section copy", "write the hero", "write the body for [section]", "humanize this draft", "rewrite in our voice", "convert this SEO writer draft to Maren voice", "draft the page copy", "write the copy for [page-slug]", or any other request to produce body copy, headings, subheads, eyebrows, CTAs, or microcopy for a page that will go through PageBuilder. This skill is the second phase in the PageBuilder pipeline — it takes the brief plus SEO targets from `aia4-seo-validator` and link anchors from `aia4-page-link`, drafts in Maren voice, runs the result through Hue Write humanizer (`/tech/scripts/huewrite.py`), and returns a structured section manifest. Do NOT use this skill for client-facing reports (use `aia4-client-report`) or for ad-hoc Slack/email drafts (handle natively).
---

# AIA4 Copywriter

The copywriter writes every word of body copy on the page in Maren voice (CLAUDE.md §2). It is keyword-aware but conversion-first — keywords appear because they belong, not because the SEO writer counted them.

The copywriter delivers section-by-section, not page-as-a-blob. Each section maps to a Figma layout slot and arrives in the manifest format defined in the orchestration model. This is what allows `aia4-layout` to take the copy and place it in the right component without re-parsing prose.

## When to use this skill

- PageBuilder Phase 2 — the most common path.
- The user wants to rewrite a single section (hero, FAQ, case study, CTA banner) without rebuilding the whole page.
- A QC failure has flagged a voice violation and the copy needs targeted re-writes.

## When not to use this skill

- The user wants a *report* — that's `aia4-client-report`.
- The user wants raw research synthesis — that's `marketing:competitive-brief` or `design:research-synthesis`.
- The user wants brand voice *guidelines* (the rules themselves) — that's `brand-voice:guideline-generation`.

## Inputs

Standard specialist input shape (see `references/orchestration-model.md`). Specifically the copywriter expects:

- **Page brief** — slug, target keyword, audience, intent, hypothesis
- **SEO targets** from `aia4-seo-validator` — term-frequency table, LSI keyword list
- **Link anchors** from `aia4-page-link` — internal links that must appear naturally in the body
- **Source copy** if the user has a SEO writer draft (treat as raw material, not finished product)
- **Figma section blueprint** so the copywriter knows the slots: hero / service-overview / benefits / applications / quality-process / gallery / case-studies / faq / related / cta

## Workflow

1. **Read project canon.** `CLAUDE.md` §2 (persona), §4 (hard gates including no unsourced claims), §9 (forbidden vocab). `references/voice-and-tone.md` for tonal cues. `references/forbidden-vocab.md` for the deny-list.
2. **Map sections to Figma slots.** Pull the blueprint cache; produce a section manifest skeleton with slot IDs and required word counts.
3. **Draft each section.** In Maren voice. Lead with the most defensible claim first; keywords appear naturally; LSI density is achieved through synonymy, not stuffing. Apply the Kyle-Roof term-frequency targets from `aia4-seo-validator` only as soft guides — never sacrifice voice for density.
4. **Place link anchors.** Internal links from `aia4-page-link` get woven into the body where they fit grammatically. If an anchor doesn't fit, return a warning rather than force it.
5. **Source every claim.** Stats, percentages, durations, comparisons — every quantitative claim needs either a source or a `[REPRESENTATIVE — NOT YET SOURCED]` marker. CLAUDE.md hard gate.
6. **Forbidden-vocab scan.** Run the deny-list. Self-fix any hits before return. If the same vocab keeps surfacing, escalate to PageBuilder (probably the source copy is the contaminant).
7. **Humanize.** Pipe the full draft through `/tech/scripts/huewrite.py --tone professional`. The wrapper handles 3,000-word chunking and 60 req/min rate limiting. Read the humanized output back, then re-scan forbidden vocab (humanizer occasionally swaps in flagged words).
8. **Final voice gate.** Read the humanized output as Maren — does it sound like her, or like generic SEO content with the polish layered on top? If the latter, do a manual editorial pass before returning. Hue Write is a polish step, not a voice replacement.

## Outputs

A section manifest at `design/templates/{slug}/copy.yaml` matching the schema in the orchestration model Phase 2. Each section has: id, eyebrow (optional), heading, subhead (optional), body (markdown), CTAs (label + intent), tags/badges (optional), source citations.

## Forbidden vocab (excerpt — full list in `references/forbidden-vocab.md`)

From CLAUDE.md §2 and §9: synergy, best-in-class, leverage (verb), world-class, next-gen, robust solution, delight the user, "In today's fast-paced world." Plus: stellar, celebrated, cutting-edge, game-changer, paradigm shift, "blowing the budget," any sentence beginning with "Are you ready to."

## References

- `references/voice-and-tone.md` — tonal cues, sentence rhythm, what Maren writes vs. what she edits out
- `references/forbidden-vocab.md` — full deny-list with replacements
- `references/seo-content-spec.md` — how to honor term-frequency targets without sacrificing voice
- `references/section-recipes.md` — sectional patterns: hero, eyebrow + H2 sections, FAQs, CTA banners

## What this skill does NOT do

- Place images (that's `aia4-image-gen`)
- Build layout components (that's `aia4-layout`)
- Decide internal link targets (that's `aia4-page-link`)
- Run the schema validator (that's `aia4-seo-validator`)
