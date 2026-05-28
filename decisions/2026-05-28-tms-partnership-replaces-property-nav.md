# Decision: TMS Partnership credibility section replaces "Built for Every Property Type" service-nav on the homepage

**Date:** 2026-05-28
**Author:** Maren Castellan-Reyes
**Status:** Shipped (this commit)
**Reversal cost:** Low (single-section markup swap, asset preserved)

## Context

The homepage at `/src/pages/index.astro` carried a "Built for Every Property Type" section (lines 342-369 at decision time) that routed visitors into the two primary service paths via dual cards:

- **Commercial & Multifamily** → `/commercial-roofing/`
- **Residential Services** → `/residential-roofing/`

Pro Exteriors recently secured an official roofing partnership with Texas Motor Speedway. The marketing director (via Chris) asked that the homepage acknowledge that partnership as a credibility anchor and chose to replace the property-nav section rather than add to the page.

## Options considered

1. **Replace the section outright with a TMS credibility band** *(chosen)* — single section swap, the cleanest implementation, but removes the dual-audience routing point from the homepage. Visitors still reach `/commercial-roofing/` and `/residential-roofing/` via the global navigation and other in-page cross-links, but they lose a high-affordance, full-width entry point.
2. **Add the TMS band above or below the property-nav section** — preserves the routing point but adds vertical length to an already-long homepage and dilutes the focal credibility moment of the partnership announcement.
3. **Compress the property-nav into a slimmer two-column row and tuck it inside the new TMS section** — best of both worlds in theory, but compromises both: the routing cards lose visual weight, and the TMS section loses its standalone credibility punch.

Option 1 chosen by Chris on direct authorization after Maren flagged the routing tradeoff in chat. Decision is bounded by the homepage only — the residential and commercial route entries are still present in:

- Global header navigation
- Footer link columns
- Sticky CTA bar (where applicable)
- In-content links from the hero and other homepage sections

## Hypothesis

Replacing the property-nav with a TMS partnership credibility band will produce:

- **Up:** Scroll-depth past this section (proof anchor reads faster than a dual-card decision moment); homepage-to-RFQ conversion rate via the section's "See the Partnership" CTA when wired to a proof-rich destination.
- **Down:** Direct homepage → service-route navigation rate from this section (it no longer exists as an entry point). Some commercial procurement traffic may need an extra click to reach `/commercial-roofing/` via the header nav.
- **Net:** Goal metric is total RFQ submissions per session. We expect the credibility lift from a recognizable Texas brand partnership to outweigh the lost shortcut.

Measurement window: 4 weeks post-deploy, GA4 + PostHog. Event `homepage_tms_cta_click` instruments the new CTA. Rollback trigger: a >15% drop in `service_route_entries_from_homepage` against the prior 30-day baseline that doesn't recover within 2 weeks.

## CTA destination

The CTA "See the Partnership" points to `https://pc-demo.cleverwork.io/commercial-roofing/` — the staged commercial-roofing page on the agency demo environment. Per Chris on 2026-05-28, this is the intended destination for the partnership credibility lift to route into. The commercial-roofing page carries the procurement-officer journey, which is the primary intended audience for the TMS partnership proof signal.

Open follow-up: when production-ready commercial-roofing content lives at the canonical `/commercial-roofing/` route on the production domain, swap the external pc-demo link for the relative path so the CTA stays domain-local and SEO authority stays consolidated.

## Hard gates (CLAUDE.md §4)

- **Performance:** Asset served as 210KB webp (down from 1.9MB png source). LCP impact minimal — section is below the fold.
- **Accessibility:** Section uses `aria-label="Pro Exteriors and Texas Motor Speedway partnership"`. Alt text on the partnership image describes the photo (Pro Exteriors crew huddle). Text contrast ratios pass AA on the white-on-navy and white-on-flag-red surfaces (verified in DESIGN.md v1.1 token canon).
- **Measurement:** Analytics event `homepage_tms_cta_click` wired via `data-cta-name`. Hypothesis above.
- **Trust:** Copy verified against §4 trust gate — "one of America's most iconic motorsports venues" replaced an earlier unsourceable "biggest" claim.
- **Schema:** No new schema markup required; the partnership is announced via the section, not claimed as a structured-data assertion.

## Rollback

To revert: `git revert` this commit. The prior section markup is preserved in git history. The image asset (`/public/images/tms-partnership-section.webp` and `.png`) and design source (`/design/TMS-Partnership-Section_16x9.svg`) can stay in place — they're harmless if unreferenced.

## Related

- `/design/TMS-Partnership-Section_16x9.svg` — design source-of-truth
- `/design/TMS-Partnership-Section_16x9.png` — render reference (1920×1080)
- `/public/images/tms-partnership-section.webp` — production asset
- DESIGN.md v1.1 — brand token canon used for the section's color/type decisions
