# SEO Validator Audit — `/residential` pillar

**Methodology:** Kyle Roof on-page (term-frequency vs. SERP, LSI breadth, schema-as-signal)
**Pulled:** 2026-05-03 · DataForSEO US 2840 · 5 contractor competitors tokenized
**Phase:** 1 of 6 (PageBuilder pipeline) · **Status:** warning · **Next:** handoff to copywriter

## The headline

The SEO writer's draft is good raw material — 2,424 visible words, on-cluster on the foundational terms (`roofing`, `roof`, `contractor`, `residential`), strong storm/tarp coverage. It has eleven critical gaps that all map cleanly onto Phase 0 brief flags, none of which require a strategic pivot. Phase 2 (copywriter) is the right place to close them.

The bigger story is the keyword set itself. Chris picked "residential roofing contractor" as the primary, which scores 880 monthly searches against "residential roofing" at 12,100 (14×) and "residential roofing company" at 2,900 (3×). All three are LOW competition, and the two secondaries actually carry stronger commercial intent ($22.69 / $20.79 CPC vs. $8.18). I'm honoring the primary for slug, H1, canonical, and the Phase 4 schema map — that's the right call for intent match on a contractor money page — but I'm aggregating body frequency around "residential roofing" because it's the term that pulls organic traffic. PageBuilder should surface this to Chris before Phase 2 in case he wants to swap H1 or add a sub-headline that picks up the higher-volume secondary explicitly. Flagged as `primary_lower_volume_than_secondaries`.

## The eleven gaps

The competitor cluster told us clearly what wins this SERP: Mid-South ranks at #22 because their page targets "residential roofing company" head-on (11 mentions vs. cluster mean of 2.2). White Castle ranks at #17 with a 2,029-word pillar that hits the cluster cleanly on `roof`/`shingle`/`storm`/`metal`. The aggregators (GAF directory, BBB, NRCA, Owens Corning) lock down the top eight slots, which means the contractor SERP cluster is statistically thin — five competitors total, one of which (Jimmerson, 479 words) is a cluster floor outlier rather than a target.

Against that cluster, the SEO writer's draft fails on:

1. **Hail mentions: 0.** Cluster mean is 1.0. Target is 5–9. "Hail damage repair" is a 6,600-volume keyword with $10.99 CPC and the brief explicitly flags this page as the entry point for the under-represented storm category. Critical.
2. **State names (TX/CO/KS/MO/GA): 0 each.** Phase 0 geo-neutralization decision must reach the copy. Critical.
3. **"Residential roofing company": 0.** Even though we're not targeting it as primary, the secondary is winnable on TF discipline — Mid-South proved it. Target 3–5.
4. **"Master Elite" + "Owens Corning": 0 each.** Both are in the Figma trust strip; not echoing them in body breaks the trust-strip-to-content link Google looks for.
5. **Insurance + deductible: 1 + 0.** Cluster underweights this because contractors mostly punt on insurance handling — wide-open positioning territory we're choosing to occupy.
6. **Asphalt + metal: 1 + 0.** The 6-card service grid in the Figma is currently abstract narration in the SEO writer's body; copywriter must expand each card into 1–2 sentences of body that reaches the term-frequency targets.
7. **"Residential roofing contractor" itself: only 2 mentions.** The exact-match keyword needs to appear ≥5× in body to outrank a sparse cluster (Kyle Roof rule: outshoot the cluster on the exact-match when the cluster is sparse).

The other terms are on cluster or above — `roof` 107/target 85–115, `roofing` 70/target 55–75, `storm` 17/target 12–20, `tarp` 11/target 8–14. Don't drop those in Phase 2.

## Schema map

Five schema types ship with the page: `RoofingContractor` (parent entity), `Service` (one block per card in the 6-card grid, all `provider`-linked back to RoofingContractor), `BreadcrumbList`, `FAQPage` (wraps the 4 accordion items already in the SEO writer body), and `Review` (wraps the testimonial block — must be a real testimonial per CLAUDE.md hard gate).

`AggregateRating` rides inside the RoofingContractor block but ONLY after Chris confirms the "4.9/5 (240+)" figure from Google Business Profile. Until then, mark the trust strip as `[REPRESENTATIVE — NOT YET SOURCED]` and remove the schema property. Shipping unverified rating schema is a Google penalty risk and a hard-gate fail. Flagged as `ratings_claim_unsourced`.

`LocalBusiness` does NOT ship on this page. It belongs on each per-location landing page (Richardson, Euless, Greenwood Village, Wichita, Kansas City, Atlanta) so each office gets its own discrete entity. Putting LocalBusiness here would dilute the national-entity signal RoofingContractor is establishing. Phase 4 assembly: skip it.

## Where the territory is wide open

Three positioning moats the cluster hasn't claimed:

- **Multi-state.** Cluster mean for any state name on the cluster pages: ~0. Pro Exteriors operates in five states with licensure in 16. The page can claim that ground unrebutted by simply saying it. Same dynamic the TPO page used with `dallas`.
- **Insurance handling.** Cluster mean for "insurance": 0.6. "Insurance claim roof" is a 1,600-volume keyword. Most contractors handle insurance and never write about it; we say it explicitly.
- **The storm-emergency dual track.** Cluster pages either lean storm-focused or planned-replacement-focused; nobody offers both with equal weight in the hero. The Phase 0 hypothesis (dual-track CTA) maps directly onto this gap.

## Handoff

Copywriter (Phase 2) gets the brief, this manifest, and the page-link manifest in parallel. The deliverable is `copy.yaml` per the orchestration model. The 11 gaps in `draft_score.per_target_status` are the explicit punch list — every `fail` must move to `pass` before page-qc.

Authored: PageBuilder Phase 1, 2026-05-03. Maren Castellan-Reyes, AIA4 Pro Exteriors.
