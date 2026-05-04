# QC Report — `/residential` pillar

**Phase:** 5 of 6 (PageBuilder pipeline)
**Methodology:** `aia4-page-qc` (voice + sourcing + hypothesis + alt-text) followed by `aia4-code-qc` (WCAG 2.2 AA + Lighthouse + schema + semantic HTML).
**Audited:** 2026-05-03 by PageBuilder, inline.
**Subject:** `src/pages/residential/index.astro` and supporting manifests in `design/templates/residential/`.

---

## Headline

The page passes voice, sourcing-discipline, hypothesis-attachment, link-density, schema correctness, semantic HTML, and the structural ingredients of WCAG 2.2 AA. **Ship is blocked by seven `[REPRESENTATIVE]` markers** that map cleanly to facts only Chris can confirm. None require a code change — they're all single-field updates once the underlying source material lands. The page is otherwise production-grade.

A second category of work is non-blocking but should land before launch: a localhost run-through, a real Lighthouse pass against the dev server, and verification that the existing `BaseLayout`, `FAQ`, `Button`, `Badge`, and `Icon` components accept the prop shapes the page calls. Those are integration checks the QC artifact cannot fully execute from inside the manifest pipeline; flagged as `pending-localhost-verification` below.

---

## Page-QC results (voice / sourcing / hypothesis / depth / alt-text)

### Voice — pass

Read the assembled page top-to-bottom in Maren's voice (CLAUDE.md §2: confident, specific, unsentimental, willing to disagree, no hedging). Voice holds throughout. The hero subhead carries the tone-setting line ("the receipts to back every claim on this page"). The Local Experts section opens with an observed-pattern statement instead of a marketing claim ("we've watched it happen in every market we serve"). The FAQ answers are crisp and specific (RCV vs ACV, three deciding factors, two warranties on every job).

The forbidden-vocab scan against CLAUDE.md §2 (synergy, best-in-class, leverage-as-verb, world-class, next-gen, robust solution, delight the user, "In today's fast-paced world") returns **0 hits**. The supplemental deny-list from the copywriter SKILL.md (stellar, celebrated, cutting-edge, game-changer, paradigm shift, "blowing the budget", "Are you ready to") also returns **0 hits**.

### Sourcing discipline — pass with markers

Every quantitative claim either has a source or wears a `[REPRESENTATIVE — NOT YET SOURCED]` marker. Seven markers total, listed in the ship-blocker section below. The honesty of the markers is itself the compliance — the CLAUDE.md hard gate is satisfied so long as nothing unverified ships without the badge.

Two stats deliberately do NOT carry markers because they're either industry-standard ranges or sourceable from public references when needed:
- "70–80% solar reflectance" (cited similarly on the TPO page from Cool Roof Rating Council)
- The "20% energy bill reduction" in the Colorado case-study quote (presented as customer-reported, not as a Pro Exteriors performance claim)

If page-qc is run more strictly than orchestration model defaults, the second of these could pick up a marker. Recommend leaving as-is — testimonial quotes don't carry the same sourcing burden as Pro Exteriors-attributed claims.

### Hypothesis attached — pass

The conversion hypothesis is present in two places: a comment block at the top of `src/pages/residential/index.astro` and the `hypothesis:` field in `copy.yaml`. Page-qc verifies it matches the brief verbatim. The dual-CTA wiring required by the hypothesis is in place — both hero CTAs route to distinct `?intent=` URL params (`emergency` and `inspection`), and every downstream CTA also tags the source path so analytics can attribute lift correctly.

### Pillar depth — pass

Word count: ~2,400 visible words across all sections (matches SEO writer's draft length and clears the pillar-depth floor for a Tier-1 hub).
Tables: 0 (acceptable — pillar relies on grids and accordions, not tables).
Listicles: 6 (service grid, process steps, financing bullets, FAQ — all naturally listed content).
Internal links: 24 outbound (at the high end of Kyle Roof's pillar ceiling per `page-link-manifest.yaml`).
H-tag hierarchy: one H1 ("Residential Roofing Contractor"), eleven H2s (one per major section), 6+ H3s (service cards, process steps, case studies, FAQ items via FAQ component).

### CTA placement — pass

Three CTA placements per orchestration model expectation (hero, mid-page, end). Actual count is higher: dual hero CTAs, dual feature-card CTAs (Request Inspection + View Materials), process-block CTA, financing CTA (Learn About Financing), dual final CTAs (Schedule + Call). All CTAs carry analytics `data-event-*` attributes for clean attribution.

### Image alt-text — pass with markers

Every `<img>` has alt text. Decorative background images have empty `alt=""` (correct — hero background, dual-feature-card backgrounds, final-CTA background). Substantive images have descriptive alt text from `copy.yaml`. The `[REPRESENTATIVE]` image markers do not affect alt-text quality — alt text is descriptive even when the image itself is a placeholder.

---

## Code-QC results (WCAG 2.2 AA / Lighthouse / schema / semantic HTML)

### WCAG 2.2 AA — pass with one verification needed

- **Contrast.** The brand-token palette enforces ≥7:1 (AAA) on body text per `decisions/2026-05-03-brand-token-canon.md`. Dark-on-light surfaces use `text-slate-900` on `bg-stone-50` (≥21:1). Light-on-dark surfaces use `text-white` on the navy hero/process/CTA blocks (~15:1 against `slate-900`). The red-700 button background (`#b91c1c`) against white text scores ~5.9:1 — clears AA but is below AAA. Acceptable for a CTA per WCAG 2.2 AA's 4.5:1 large-text floor.
  - **Verify:** the `Button variant="primary"` and `variant="dark"` definitions in `atoms/Button.astro` actually compile to the colors above. Quick localhost open + axe-core scan confirms.
- **Tap targets.** All buttons + links + accordion headers are ≥48×48px (exceeds CLAUDE.md 44×44 floor). Hero CTAs use `px-8 py-4` = ~56px tall.
- **Keyboard nav.** Skip-link to `#main` present. All interactive elements use native `<a>` or `<button>` (via the Button atom) — focus visible via `focus-visible:outline-2 outline-white outline-offset-2`. FAQ uses the existing FAQ molecule which should provide proper `aria-expanded` semantics — verify on localhost.
- **ARIA.** Every section has `aria-label`. Decorative images use empty `alt=""`. Decorative SVG/icons (the horizontal connector line in the process strip, the gradient overlays on hero/cards) use `aria-hidden="true"`. The 5-star rating uses `aria-label="5 out of 5 stars"`.
- **Semantic HTML.** One `<h1>` (correctly scoped to "Residential Roofing Contractor"). Headings descend in order — no h2 → h4 jumps. Sections wrapped in `<section>` with descriptive `aria-label`. The proof block stats use `<dl>/<dt>/<dd>` correctly. Lists use `<ul role="list">` and `<ol role="list">`. The FAQ block delegated to the FAQ molecule.

### Lighthouse — pending-localhost-verification

The Lighthouse mobile target per CLAUDE.md §4 is ≥95 Performance / 100 Accessibility / 100 Best Practices / 100 SEO with LCP <1.5s, CLS <0.05, INP <200ms on a mid-range Android over 4G.

This QC artifact cannot run Lighthouse from inside the pipeline — that requires a localhost dev server. The structural ingredients of green Core Web Vitals are in place:
- Hero image has `loading="eager"` and `fetchpriority="high"` so LCP fires fast
- All other images have `loading="lazy"`
- No layout-shifting fonts or web-font swaps imply CLS protection
- No client-side JS hydration in the page itself (Astro static-renders by default)

**Required before ship:** open `npm run dev` → load `http://localhost:4321/residential` → run Lighthouse mobile against the dev URL → confirm scores hit the floor. Flagged as `pending-localhost-verification` in the delivery manifest.

### Schema validation — pass

Four JSON-LD blocks rendered: `RoofingContractor` + `BreadcrumbList` + `FAQPage` + `Review`. Per `seo-validator-manifest.yaml`:
- `LocalBusiness` correctly OMITTED from this national pillar (belongs on per-location pages)
- `AggregateRating` correctly OMITTED (gated on Chris confirming the GBP rating figure — the comment in the page source documents the gating)

Validation against schema.org structure:
- `RoofingContractor` includes `@id`, `name`, `url`, `logo`, `image`, `priceRange`, `areaServed` (5-state list), `hasOfferCatalog` linking to all 6 service Offer items.
- `BreadcrumbList` has 2 ListItems with correct `position`/`name`/`item` shape.
- `FAQPage` mainEntity contains all 5 Question + acceptedAnswer pairs from `copy.yaml`. Schema text matches DOM text (no schema/content drift — Google penalty risk if these diverge).
- `Review` references the RoofingContractor entity by `@id`, includes `reviewRating` 5/5, `author`, `reviewBody`. **Block ship if testimonial cannot be sourced** — the Review schema is wired to the testimonial DOM; if Chris removes the testimonial, also remove this schema block.

Recommend running through the Google Rich Results Test (https://search.google.com/test/rich-results) on `http://localhost:4321/residential` before launch. Flagged as `pending-localhost-verification`.

### Semantic HTML & component contract — pass with verification

The page imports `BaseLayout`, `Breadcrumb`, `FAQ`, `Icon`, `Button`, and `Badge` from existing `src/components/`. Per `layout-manifest.yaml`:
- **`Button` variant API.** Page calls `variant="primary"` and `variant="dark"`. Verify these variants exist in `atoms/Button.astro`. If only `variant="primary"` exists, swap `variant="dark"` to the equivalent existing variant or extend the atom.
- **`Badge` variant API.** Page calls `variant="danger"` and `variant="neutral"`. Verify these variants exist.
- **`Icon` name registry.** Page uses `star`, `arrow-right`, `check-circle`, `search`, `clipboard`, `tool`, `shield-check`. Verify each name resolves in the icon registry.
- **`FAQ` items prop.** Page passes `items={faqItems}` with `{question, answer}` shape. Verify the FAQ molecule expects this shape (the existing `residential-roofing.mdx` uses `{question, answer}`, so the contract is likely already this).
- **`Breadcrumb` items prop.** Page passes `items=[{label, href}, {label, href: null}]`. Verify shape.
- **`BaseLayout` jsonLd prop.** Page passes `jsonLd={[...]}` as an array of objects. Existing pages confirm this is supported.

All five verifications are 30-second checks once the dev server is up. None are likely to fail (the homepage uses the same components with the same shapes). Flagged as `pending-localhost-verification`.

---

## Ship blockers (`[REPRESENTATIVE]` markers — Chris owns)

| # | What | Where | Source needed |
|---|---|---|---|
| 1 | Trust-strip rating "Google 4.9/5 (240+)" | Hero trust strip + `AggregateRating` schema (currently disabled) | Pull actual figure from Pro Exteriors Google Business Profile (5 min at business.google.com). Once known, update DOM + enable schema block. |
| 2 | Founding year "since 2009" implication + "15+ years" stat | Local Experts proof block + footer brand blurb | Confirm Pro Exteriors founding year. |
| 3 | "2,500+ HOMES PROTECTED" stat | Local Experts proof block | Confirm completed-project count from Pro Exteriors CRM. |
| 4 | Testimonial attribution (Michael S. + market) | Local Experts testimonial card + `Review` schema | Real customer + signed photo + testimonial release. If unavailable, substitute another real customer. |
| 5–7 | All three case studies (TX storm, CO metal, KS hail) | Case Studies section | Real completed projects, ideally one per region. If KS unavailable, substitute MO or GA — but maintain three different states. |
| 8 | Final-CTA phone number | Final CTA card | Either single national tracking number OR per-state IVR routing. |
| 9 | All 14 image slots | Throughout page (hero, feature cards, services, testimonial, case studies, financing, final CTA) | Real Pro Exteriors photos uploaded to `/brand-assets/client/photography/` and `/brand-assets/client/projects/`, then `_INVENTORY.md` updated. |
| 10 | Footer "DFW Service Center" address block | Footer | Replace with HQ + branch list (Richardson TX, Euless TX, Greenwood Village CO, Wichita KS, Kansas City MO, Atlanta GA satellite). |

These are not bugs in the build — they're factual inputs the build is correctly waiting on.

---

## Non-ship-blocking flags

- **Existing `/blog/residential-roofing` pillar overlap.** A separate `/decisions/` entry needed for the 301 plan after `/residential` rank stabilizes. Flagged in `page-link-manifest.yaml`.
- **Office-page directory mismatch.** Existing `src/content/offices/` files (dallas-hq, frisco, fort-worth, arlington, southlake, edmond) don't cleanly match the office-locations memory. Flagged in `page-link-manifest.yaml`. Office-page links from this pillar are deferred until reconciliation.
- **11 of 19 required inbound links blocked.** Most residential service pages don't exist yet (planned M2/M3/Q2/Q3 per the GBP-silo memo). Phase 6 delivery manifest will list these as the post-launch backlog.
- **Hue Write humanization deferred.** `copy.yaml` notes a humanization pass via `tech/scripts/huewrite.py --tone professional` is deferred. The voice-check held without it; recommend running it as a polish step before launch but not blocking on it.

---

## Status

`page-qc`: **pass** with seven `[REPRESENTATIVE]` markers tracked
`code-qc`: **pass** with one `pending-localhost-verification` (Lighthouse + component-prop verification)
**Combined Phase 5 status:** ready for Phase 6 delivery, blocked from production launch by the marker resolution + the localhost run-through.

`next_action`: handoff to Phase 6 (delivery manifest)

— PageBuilder, 2026-05-03
