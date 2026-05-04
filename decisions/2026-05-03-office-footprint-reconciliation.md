# 2026-05-03 — Office footprint reconciliation (global footer, /locations/* pages, /residential pillar)

**Author:** Maren Castellan-Reyes
**Status:** Decided — Chris chose Option B on 2026-05-03
**Affects:** `src/components/organisms/Footer.astro`, `src/content/offices/*.mdx`, `src/pages/locations/*`, `src/pages/residential/index.astro` (and any future location-aware page)

---

## What the gap is

There are three different "office lists" in this codebase right now and none of them match each other.

**1. The reality** (per project memory + the GBP-silo memo, Pro Exteriors office locations):
- Richardson, TX (HQ)
- Euless, TX
- Greenwood Village, CO
- Wichita, KS
- Kansas City, MO
- Atlanta, GA (satellite)

Plus state-level licensure across 16 states.

**2. The office content files** at `src/content/offices/`:
- arlington · dallas-hq · edmond · fort-worth · frisco · southlake

All DFW-region (Edmond OK is the closest non-DFW). None of the actual office cities have content files.

**3. The global Footer.astro Locations column** (lines 60–67):
- All Locations · Dallas HQ · Fort Worth · Frisco · Southlake · Arlington · Edmond, OK

Matches the existing `/src/content/offices/` files (so the links don't 404 — that's the only positive). But misrepresents the company on every page that renders the global footer.

## Why this matters now

The `/residential` pillar (built 2026-05-03) is a NATIONAL pillar with explicit "five states" framing and per-state moat language (TX, CO, KS, MO, GA). Per the Phase 0 geo-neutralization decision, every DFW reference in the source Figma was stripped. But the global footer that BaseLayout renders on every page still shows a DFW-only list.

The result is a credibility leak: the page above the footer says "Local across five states. Not 'storm chasers.'" and lists Richardson/Euless/Greenwood Village/Wichita/Kansas City/Atlanta in body copy, then the footer below it links to six DFW cities. A skeptical homeowner will notice. A procurement officer comparing contractors definitely will.

The same dynamic affects any future commercial-pillar build, any state-pillar build, and the existing `/blog/residential-roofing` pillar (which already mentions Denver, Wichita, and Alpharetta in its FAQs).

## Three options, recommended sequence

### Option A — Build the real office pages first, then update the footer (recommended)

1. Author six new office content files at `src/content/offices/`: `richardson-tx.mdx`, `euless-tx.mdx`, `greenwood-village-co.mdx`, `wichita-ks.mdx`, `kansas-city-mo.mdx`, `atlanta-satellite.mdx`.
2. Each file gets the standard office schema (LocalBusiness + areaServed + nearestNeighborhoods + crew).
3. Once the six files exist, swap the Footer.astro Locations column to reference them.
4. Decide what to do with the existing six DFW office files — either redirect to the closest real office, fold them into Richardson/Euless as neighborhoods served, or archive.

Cost: 6 office pages × ~3 hrs each = 18 hrs of content work + a small PR for the footer swap. Risk: low, because nothing breaks during the work — the existing footer keeps working.

### Option B — Update Footer.astro now, ship broken links

Swap the footer immediately to reference `/locations/richardson-tx/` etc. Pages 404 until built. Buys honest representation immediately at the cost of broken UX. Not recommended — every 404 in the site footer becomes a Search Console issue and a credibility leak of its own.

### Option C — Do nothing

Ship `/residential` with the geo-neutralized body copy and the DFW-only footer. The credibility leak persists. Not recommended.

## Recommendation

Option A. I'd add it to the M2 (June 2026) build calendar alongside the residential service pages — both depend on the same per-location strategy work (LocalBusiness schema, neighborhoods served, lead routing per market). The six office pages aren't trivial but they unlock both the footer fix and the broader location-page ring the GBP-silo memo identifies as the M3 / Q2 priority.

If the residential pillar ships before that calendar work completes, it ships with the footer mismatch acknowledged in `delivery-manifest.yaml` rather than papered over. Page-qc has it flagged.

## Decision needed from Chris

1. Is Option A the right call, or do you want a different sequencing?
2. If A: confirm the six real office locations as listed (Richardson TX HQ, Euless TX, Greenwood Village CO, Wichita KS, Kansas City MO, Atlanta GA satellite) — and whether the six existing DFW office files should be redirected, folded into the real offices as neighborhoods, or archived.
3. Until Option A completes: ship `/residential` as-is (with the mismatch flagged), or hold the residential pillar launch until the office-page work catches up?

— Maren

---

## Decision (2026-05-03)

**Chris chose Option B — update Footer.astro now, accept broken links.**

`Footer.astro` updated immediately with five metro entries (Dallas/Fort Worth HQ, Denver CO, Wichita KS, Kansas City MO, Atlanta GA). Six DFW-specific links removed. The five new links 404 until the corresponding `/locations/*` pages ship in M2/M3 per the GBP-silo memo.

**Consequences accepted:**

1. **Search Console errors.** Five 404s in the global footer will surface in Search Console within a week of crawl. We treat the SC report as a tracking signal for the M2/M3 office-page build — when the page count goes from 5 errors to 0, the office ring is complete.
2. **Brief crawl-equity bleed.** Bots will follow the dead links and waste crawl budget for ~2–8 weeks. Marginal cost; acceptable.
3. **User UX cost.** Any visitor who clicks a footer office link gets a 404. The 404 page itself (`src/pages/404.astro`) should be reviewed to make sure it routes them somewhere productive — at minimum back to `/contact?intent=inspection&source=footer-404` and to `/service-area`. **Follow-up task added to delivery-manifest.**
4. **Existing six DFW office content files** (arlington / dallas-hq / edmond / fort-worth / frisco / southlake) remain in `src/content/offices/` for now — no redirect or archive action taken. They no longer ship in the global footer but are still reachable via direct URL or sitemap. Decision to redirect/archive deferred to a follow-up `/decisions/` entry once the M2/M3 work begins.

**Strategic note from Maren:** I recommended Option A and Chris went Option B. The pushback would have been that Search Console 404 noise is operationally cheap to fix later but expensive to argue against during the M2/M3 build planning. Recording the recommendation for the audit trail and executing his call.

— Maren, 2026-05-03 PM
