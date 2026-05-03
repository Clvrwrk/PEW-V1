---
name: aia4-seo-validator
description: Run SEO validation and on-page analysis using Kyle Roof's methodology — term-frequency vs. SERP competitors, LSI keyword density, schema.org type selection, and on-page checklist scoring. Use whenever the user asks to "validate the SEO", "run the on-page audit", "check the schema", "validate keyword targets", "is this page optimized", "Kyle Roof analysis", "term-frequency check", "schema validation", "audit on-page SEO for [page-slug]", or any related on-page-SEO request that targets a page going through (or finished going through) PageBuilder. This skill is Phase 1 in the pipeline — it produces the term-frequency targets, LSI list, and required schema types that downstream specialists must respect. Calls `/tech/scripts/dataforseo.sh` for live SERP and keyword data. Do NOT use for off-page SEO (link-building strategy is separate), for site-wide technical SEO (use `marketing:seo-audit`), or for the internal-linking decisions on a single page (use `aia4-page-link`).
---

# AIA4 SEO Validator (Kyle Roof On-Page)

This skill applies Kyle Roof's on-page SEO methodology to a single page. It treats SEO as testable hypothesis, not as folklore. Three principles drive every output:

1. **Term frequency matches the SERP, not a content guru's checklist.** Pull the top 10 organic results, average their term frequencies for the target keyword and its variants, then set targets within ±15% of that average.
2. **LSI is breadth, not density.** Coverage of related terms beats raw repetition of any single term. The validator returns an LSI list of 30–80 terms; copy should hit ≥70% of them at least once.
3. **Schema is a ranking signal, not a checkbox.** Pages with appropriate schema types get richer SERP treatment. The validator returns the exact schema types this page must implement — and validates them on the assembled page.

## When to use this skill

- PageBuilder Phase 1 — produces the SEO targets that copywriter and layout consume.
- Post-build re-validation when a competitor moves and we need to re-target term frequencies.
- Manual on-page audit when a page is performing under expectations.

## When not to use this skill

- Site-wide technical audits — use `marketing:seo-audit`.
- Backlink analysis or link-building strategy — that's an off-page concern.
- Internal-link targets for a single page — use `aia4-page-link`.
- Content strategy or topical authority planning — those come from `/strategy/` artifacts already in the project.

## Inputs

- **Target keyword + secondary keywords** (from the brief)
- **Page slug + intent + audience** (from the brief)
- **Existing copy or planned section list** (from the brief or copywriter output)
- **Project SEO context** from `/strategy/SEO-Architecture_Link-Equity-Strategy_April-2026.docx` and `/strategy/Topical-Authority-Attack-Plan_12-Month.docx`

## Workflow

1. **Pull live SERP for the target keyword.** Call `dataforseo.sh serp "<target>"` with `--location-code 2840 --language-code en`. Save the top 20 organic results.
2. **Fetch competitor pages.** For the top 10 organic results, fetch the rendered HTML (use `mcp__workspace__web_fetch` if accessible; otherwise note which competitors couldn't be fetched and proceed).
3. **Run term-frequency analysis.** Tokenize each competitor page (strip nav/footer/boilerplate). Count the target keyword and each high-volume secondary keyword. Compute average frequency, standard deviation, and the ±15% target band. See `references/term-frequency-method.md`.
4. **Generate LSI list.** Call `dataforseo.sh related-keywords "<target>" --limit 100`. Filter to keywords with volume ≥20 and intent-aligned to the page (informational + transactional only for a service page). Trim to the top 50–80 by relevance.
5. **Score draft (if copy exists).** If copywriter output is available, score the draft against the term-frequency targets and the LSI list. Return a per-keyword pass/warning/fail.
6. **Pick schema types.** Default for a service page on a roofing site: `RoofingContractor`, `Service`, `BreadcrumbList`, `FAQPage` (if FAQs present). Add `Review` if testimonials present, `Product` only if the service is productized with a price. See `references/schema-types.md`.
7. **Validate schema (if assembled).** When run on the assembled page, parse JSON-LD blocks and validate against the Google Rich Results Test format. Report any errors.
8. **Return manifest.** See orchestration model Phase 1 for the exact JSON shape.

## Outputs

The Phase 1 manifest from the orchestration model — `target_keyword_data`, `term_frequency_targets`, `lsi_keywords`, `schema_types_required`, `competitor_pages_analyzed`. Plus a human-readable audit at `design/templates/{slug}/seo-validator-audit.md` if the user wants the diagnostic.

## Kyle Roof methodology highlights (excerpt — full doc in `references/kyle-roof-on-page-checklist.md`)

- **Test, don't trust.** Every recommendation is testable on a real ranking; if it can't be tested, it doesn't go in the checklist.
- **The 80/20 rule on keyword variations.** Hit the exact-match target keyword 80% of the time; reserve 20% for natural variations that match query language.
- **Term frequency follows a Zipf-like curve.** Top SERP pages cluster tightly around the same frequencies; outliers either rank because of off-page strength or are about to drop. Aim for the cluster.
- **Schema is a quiet lever.** A correctly typed page with FAQPage + Service schema can outrank a page with stronger backlinks but no schema. The page must actually answer FAQs in body — schema without content is a penalty risk.
- **Title and H1 do disproportionate work.** Title tag is the first ranking lever; H1 is the second. Both should contain the target keyword in natural form.

## References

- `references/kyle-roof-on-page-checklist.md` — the testable on-page checklist
- `references/term-frequency-method.md` — how to compute targets from SERP
- `references/schema-types.md` — when to use which schema, with examples
- `references/lsi-keyword-method.md` — how to filter and prioritize LSI lists

## What this skill does NOT do

- Build internal links (`aia4-page-link`)
- Write copy (`aia4-copywriter`)
- Audit site-wide SEO (`marketing:seo-audit`)
- Run Lighthouse — that's `aia4-code-qc`
