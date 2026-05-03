---
name: aia4-page-link
description: Decide internal-link targets and anchor text for a page using Kyle Roof's reverse-silo methodology. Use whenever the user asks to "set up internal links", "what links should this page have", "build the internal link map", "reverse silo the [page]", "anchor text for [keyword]", "where should this page link to", "what links into this page", or any other request related to internal-linking decisions for a page going through PageBuilder. This skill is Phase 1 (parallel with `aia4-seo-validator`) — it reads the project's silo plan from `/strategy/` and returns the exact links the page should make and the exact anchor text per Kyle Roof reverse-silo rules (money pages link UP to supporting content, not the other way; supporting content links UP to money pages with keyword-rich anchors). Do NOT use for off-site link building, for navigation/breadcrumb decisions (those come from the Figma blueprint), or for the link target's content (that's the destination page's concern, not this page's).
---

# AIA4 Page-Link (Kyle Roof Reverse Silo)

This skill answers a single question per page: **"Which internal links should this page make, and with what anchor text?"** The answer follows Kyle Roof's reverse-silo methodology, which inverts traditional silo logic.

## Traditional silo vs. reverse silo

**Traditional silo:** Supporting content (blog posts, how-to articles) links UP to the money page (the service or product page). The money page is the destination; supporters funnel link equity toward it.

**Reverse silo (Kyle Roof):** The money page also links UP — to its own supporting content. This counter-intuitively *strengthens* the money page's ranking because:
1. Supporting content gets crawled and indexed faster, building topical authority around the money page.
2. The money page demonstrates topical breadth ("this isn't just a thin commercial-intent page; it's the hub of a real topic"), which Google's algorithms reward.
3. Anchor text from the money page out to supporting pages doesn't dilute the money page's ranking because the supporting pages link back with target-keyword anchors.

The net effect: link equity circulates within the silo rather than flowing one-way to the money page. Everyone in the silo ranks better.

## When to use this skill

- PageBuilder Phase 1 — produces the link manifest the copywriter must respect.
- Post-build site-wide silo refresh when topical authority shifts.
- A new piece of supporting content needs to be inserted into an existing silo.

## When not to use this skill

- Off-site link building (PR, guest posts, citations) — separate concern.
- Navigation menu / breadcrumb decisions — those come from the Figma global frame, not from this skill.
- Footer or sidebar link blocks — global concerns, not page concerns.
- The destination page's own content — that's the destination's PageBuilder run.

## Inputs

- **Page brief** — slug, target keyword, audience, intent
- **Project silo plan** from `/strategy/SEO-Architecture_Link-Equity-Strategy_April-2026.docx` and `/strategy/Pro-Exteriors_GBP-and-Silo-Memo_April-2026.md`
- **Topical authority map** from `/strategy/Topical-Authority-Attack-Plan_12-Month.docx`
- **Existing site link graph** (if available) — what already links to/from related pages

## Workflow

1. **Load the silo plan.** Identify which silo the target page belongs to (e.g., "commercial roofing > flat-roof systems > TPO"). Note the page's role: money / category / support / cluster.
2. **Identify the silo neighbors.** All pages within the same silo at all tiers. The page should link to at least 3 supporting pages (its tier or below) and receive links from at least 2 cluster pages (sister content).
3. **Identify the silo parents.** The category page above this page. The page should link UP once to its category, with branded or descriptive anchor (not exact-match keyword — exact-match flows to support pages, not category).
4. **Map exact-match anchors to supporting content.** For the page's target keyword and its top secondary keywords, find supporting pages where those keywords would rank as the support's *own* target. Send exact-match or near-match anchors there.
5. **Map descriptive anchors to category and parallel pages.** Anchors like "our commercial roofing services" or "explore other flat-roof options" — these flow within the silo without competing for keyword authority.
6. **Apply the 3-anchors-per-target rule.** No single destination page should receive more than 3 anchors *from this page*. Repeated linking dilutes the signal.
7. **Apply the link-density ceiling.** Total internal links from a service page: 8–15 in body copy + 4–6 in "Related Services" + 2–3 in CTA + footer (footer is global, not page concern). More than that and Google starts treating links as boilerplate.
8. **Return manifest.** See orchestration model Phase 1 for the JSON shape.

## Outputs

The Phase 1 manifest from the orchestration model — `internal_links_out`, `internal_links_in_required`, `silo_role`, `tier`. Plus a link map at `design/templates/{slug}/link-map.md` documenting why each link was chosen.

## Anchor-text rules (excerpt — full doc in `references/reverse-silo-methodology.md`)

- **Exact-match anchor** = the destination's target keyword verbatim. Use to support pages 1× per page max.
- **Near-match anchor** = target keyword with a function word added or rearranged (e.g., "TPO membranes" → "the TPO membrane"). Use freely; reads more natural than repeated exact-match.
- **Descriptive anchor** = the destination's value proposition in non-keyword language ("our quality-process inspection," "the moisture-scan diagnostic"). Use for category and parallel links.
- **Branded anchor** = "Pro Exteriors" or "our team." Use sparingly, mostly in CTAs.
- **Forbidden:** generic anchors ("click here," "learn more," "this page"). Always replace with descriptive or near-match.

## References

- `references/reverse-silo-methodology.md` — the full Kyle Roof reverse-silo theory + rules
- `references/anchor-text-patterns.md` — the four anchor types with worked examples
- `references/link-density-ceiling.md` — empirical guidance on link counts per page type
- `references/silo-map-pro-exteriors.md` — the project's specific silo, drawn from `/strategy/`

## What this skill does NOT do

- Decide which pages to *create* (that's strategy)
- Write the destination page's content (that's the destination's PageBuilder run)
- Generate keyword research (that's `aia4-seo-validator`)
- Validate that a destination page exists (returns warnings if a planned link target hasn't been built yet)
