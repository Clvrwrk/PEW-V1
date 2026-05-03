---
name: aia4-code-qc
description: Run code-level QC on an assembled AIA4 page — WCAG 2.2 AA accessibility, Lighthouse mobile targets, schema validation, semantic HTML, keyboard navigation, focus visibility. Use whenever the user asks to "run the WCAG audit", "check accessibility", "validate the schema", "run Lighthouse", "check the code", "code QC for [page-slug]", "is this page WCAG compliant", "validate the JSON-LD", "audit the page code", or any code-level pre-ship check on a page going through PageBuilder. This skill is Phase 5b in the pipeline (runs after `aia4-page-qc` passes) — it enforces the CLAUDE.md §4 hard gates: Lighthouse mobile ≥95/100/100/100, WCAG 2.2 AA contrast on every surface, tap targets ≥44×44px, semantic HTML structure, schema validated against Google Rich Results format, keyboard nav with visible focus, ARIA only where needed. Calls `design:accessibility-review` for the formal audit. Do NOT use for content/voice QC (`aia4-page-qc`), for layout decisions (`aia4-layout`), or for routine HTML cleanup during draft phase (the layout skill produces accessible components by construction).
---

# AIA4 Code QC — the WCAG 2.2 + Lighthouse gate

This skill is the engineering gate. It enforces the hard gates from CLAUDE.md §4 mechanically. Pages that pass page-qc but fail this skill don't ship. There is no override without a logged decision in `/decisions/`.

It runs `design:accessibility-review` for the formal audit, validates schema against Google's Rich Results format, and produces a Lighthouse-style report card. The output is binary on every gate: pass or fail. No warnings — if it warns, layout fixes it.

## When to use this skill

- PageBuilder Phase 5b — runs after page-qc passes.
- A page failed code-qc previously, was re-fixed by layout, and needs re-validation.
- The user wants a code-level audit on a page built outside the pipeline.

## When not to use this skill

- Voice / content / sourcing QC — that's `aia4-page-qc`.
- Routine HTML cleanup during draft phase — layout produces accessible components by construction.
- Layout decisions or token changes — out of scope.
- Performance tuning beyond the Lighthouse gate (e.g., custom CDN tuning) — separate concern.

## Inputs

- **Assembled page file** at `design/templates/{slug}/index.astro` (post-Phase-4 output)
- **Page-qc pass status** — code-qc only runs after page-qc passes
- **Brand canon contrast pairs** from `/tech/DESIGN.md` — every token pair has a documented contrast ratio
- **CLAUDE.md §4 hard gates** — the targets to enforce

## The hard gates (CLAUDE.md §4)

| Gate | Target | Tool |
|---|---|---|
| Lighthouse Performance (mobile) | ≥95 | Lighthouse CLI or in-CI |
| Lighthouse Accessibility | 100 | Lighthouse |
| Lighthouse Best Practices | 100 | Lighthouse |
| Lighthouse SEO | 100 | Lighthouse |
| Largest Contentful Paint (LCP) | <1.5s mobile | Lighthouse / Web Vitals |
| Cumulative Layout Shift (CLS) | <0.05 | Lighthouse / Web Vitals |
| Interaction to Next Paint (INP) | <200ms | Lighthouse / Web Vitals |
| WCAG | 2.2 AA | `design:accessibility-review` |
| Color contrast (body) | ≥4.5:1 | Token system + axe |
| Color contrast (large text) | ≥3:1 | Token system + axe |
| Tap targets | ≥44×44px | axe + manual |
| Schema | LocalBusiness / RoofingContractor / Service / Review / BreadcrumbList / FAQPage where applicable | Google Rich Results Test format |
| Forms | End-to-end tested | Manual + happy-path automation |

## Workflow

1. **Sanity scan.** One H1, ordered headings, landmarks (header, main, footer), skip-link present, lang attribute on html. **Fail if any missing.**
2. **Token-pair contrast verification.** Walk the rendered page; for every text-on-background combination, look up the contrast ratio in `/tech/DESIGN.md`. **Fail if any pair below WCAG AA.** This is mostly a sanity check — the token system already validates this on every build.
3. **Run `design:accessibility-review`.** Formal WCAG 2.2 AA audit. **Fail on any AA violation.**
4. **Tap target audit.** Every interactive element ≥44×44px (with padding-induced hit area counted, but not the inflated visual treatment alone). **Fail on any below 44px.**
5. **Keyboard navigation audit.** Tab through the page in order. Every interactive element receives focus. Focus is visible (3px outline minimum, contrasting color). Skip-link works. Modal/accordion focus management correct. **Fail on any unreachable element or missing focus indicator.**
6. **Semantic HTML audit.** No `<div onclick>`. Buttons are `<button>` not styled `<div>`. Links are `<a>` with `href`. Lists are `<ul>` or `<ol>`. Tables have `<thead>`, `<tbody>`, `<th scope="col|row">`. **Fail on any non-semantic interactive element.**
7. **ARIA audit.** ARIA used only where native semantics fall short. No `role="button"` on a `<button>`. No `aria-label` on text-content elements. **Fail on any redundant or incorrect ARIA.**
8. **Schema validation.** Parse JSON-LD blocks. Validate each against schema.org and Google Rich Results Test format. **Fail on any invalid schema.**
9. **Lighthouse mobile run.** Run Lighthouse against the rendered page on a throttled mid-range Android profile (DSL 4G). **Fail on any score below target or any Web Vitals threshold breach.**
10. **Forms audit.** If forms exist on the page, run a happy-path test against the actual lead routing destination (CRM, email, Slack — whatever Pro Exteriors uses). **Fail on any form that doesn't deliver to its destination.**
11. **Return QC report.** Per-gate pass/fail with specific evidence + routing instructions for any fail.

## Outputs

A QC report at `design/templates/{slug}/qc-code-report.md` with per-gate status and evidence. The page-status manifest entry: `qc_code: pass | fail` plus the report path. **No "warn" status** — if a gate fails, layout fixes it; if a gate passes, it passes.

## When fails route back

- Contrast / tap-target / focus visibility / keyboard nav → `aia4-layout`
- Missing skip-link / landmarks / semantic HTML → `aia4-layout`
- Invalid schema → PageBuilder Phase 4 (assembly generated the schema; PageBuilder re-runs schema generation with corrections)
- Lighthouse Performance < 95 → `aia4-image-gen` (image weight) or `aia4-layout` (CLS / unused CSS)
- Form delivery failure → escalate to user (lead routing config issue, not a layout fix)

## References

- `references/wcag-22-checklist.md` — the operational checklist
- `references/lighthouse-targets.md` — the mobile profile, throttling settings, and what each score means
- `references/schema-validators.md` — schema.org type spec + Google Rich Results test conformance
- `references/keyboard-nav-test-script.md` — exactly which elements to tab through and in what order
- `references/aria-do-and-dont.md` — when ARIA helps vs. when it harms

## What this skill does NOT do

- Voice / content QC (`aia4-page-qc`)
- Layout fixes — it routes fails to layout
- SEO content scoring — that's `aia4-seo-validator`'s pre-build phase, not a post-build code concern
- Performance tuning beyond the Lighthouse gate
