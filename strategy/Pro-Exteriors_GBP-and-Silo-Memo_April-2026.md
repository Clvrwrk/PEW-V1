# Pro Exteriors — GBP Curation, Top 50 Services, and Q1 Reverse Silo Build Plan

**Author:** Maren Castellan-Reyes, Senior Director, Website & Application Experience — AIA4 Pro Exteriors
**Date:** 2026-04-25
**Status:** Internal working memo (no cover sheet by request)
**Companion:** `/strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx`

---

## TL;DR

I curated the original list of 10 candidate GBP categories down to **5**, dropped 4 entries that have zero search demand or are off-vertical, and added one Google-approved category that wasn't on your list. From 500 candidate services I selected **50** (35 commercial / 15 residential), each anchored to a real, ranking competitor keyword from the 7,402-row dataset. The math says **$10K/mo in organic ad-equivalent value is achievable inside Year 1**, but only if we ship the location-page ring alongside the silo system — not after. The targets alone won't get there in twelve months. Everything below is the rationale and the Q1 build sequence.

## What changed when the competitor data arrived

When you handed me the master list, I was prepared to build the curation against industry CPC benchmarks (WordStream, Backlinko, public Ahrefs reports). The competitor keyword export changed that completely. With 7,402 keywords ranked across eleven competitors — pre-enriched with DataForSEO volumes, CPCs, and intent — I no longer need to estimate. The picks below are anchored to keywords competitors are actually capturing today. That changes the deliverable from "a defensible plan" to "a plan with receipts."

Two caveats worth naming up front. First, the eleven competitors in the dataset (Tecta America, Erie Home, Apple Roofing, Baker Roofing, Flynn, Supreme, Advanced, American Home Contractors, Greenwood, K-Post, Best Contracting) skew commercial/Northeast. None of them sit deep in the Texas-Oklahoma-Colorado-Kansas hail belt where Pro Exteriors operates. The storm and hail keyword pool in this dataset is suspiciously thin — only six storm keywords show up across the whole file. In Pro Exteriors' actual markets the volume is likely 5-10x higher. The xlsx flags every storm/hail row with `Validate via DFS` and the $10K model uses **only the keywords I can cite**, so the number is a conservative floor.

Second, the dataset gives global volume and national US DataForSEO volume, not metro-level. The biggest single thing you can do to make the curation more accurate is run a DataForSEO local-volume pull (location codes for Dallas-Fort Worth, Denver, Wichita, Kansas City) for each of the 50 anchor keywords. The xlsx has empty `DFS_Local_Vol` columns ready to receive those numbers. I'd plan an hour in Claude Code to pull them before we ship anything to the GBP profiles.

## The five GBP categories — and why four came off the list

Google Business Profiles allow one primary category and up to nine secondary. Five is the right number to be discriminating about — beyond that you start diluting the relevance signal Google uses to decide which profile shows up for which query.

**1. Roofing contractor (PRIMARY).** This is the entire near-me-local pool: 154 distinct keywords, $27M/yr in theoretical ad-equivalent across competitors, anchored by `roofing company near me` at 301,000 monthly searches × $27.17 CPC. Every Pro Exteriors profile leads with this category.

**2. Commercial roofing contractor (SECONDARY) — and not on your list.** Google approved this as a discrete category in 2024. It is the single highest-leverage signal we can give Google that Pro Exteriors is a commercial-first contractor, which matters because Pro Exteriors is 80% commercial and the SERPs for "commercial roofing contractors dallas tx" pay $64.11 CPC. Add this category to all six profiles before publishing.

**3. Roofing service (SECONDARY).** Captures "roofing services near me" intent that doesn't always trigger contractor SERPs. 14,800 monthly searches × $17.08 CPC. Complementary to Roofing contractor, not redundant.

**4. Gutter service (SECONDARY).** 109 keywords, $599K/yr ad-equivalent pool. Gutters are recurring-lead machines on residential, and they pair naturally with roof replacement on storm-damage jobs.

**5. Siding contractor (SECONDARY).** 62 keywords, $297K/yr pool. The combined "roofing and siding" terms ($25-32 CPC) position Pro Exteriors as the storm-damage one-stop for residential. That's a defensible cross-sell story.

The four I dropped: **Skylight contractor** has zero targetable keywords across 7,400 competitor terms — competitors aren't ranking on skylight because demand isn't there. Keep skylight as a service tile if you do the work; don't waste a category slot. **Window installation service** is the same story — Pella and Andersen dealers own that SERP. **Waterproofing company** has a $257K pool but it's mostly basement waterproofing, which is the wrong vertical for a roofing-led contractor; the roof-coating subset that *is* valuable lives as a service inside the Roofing service category, not its own GBP. **Impermeabilisation service** and **Impermeabilization service** are Spanish-language category variants — on a US English profile they're foreign-language SEO leak. The only time you'd want them is if you also run a separate Spanish-language profile per metro, which is a different conversation.

## The 50 services — what's in, what's tagged, what to validate

The xlsx tab `02_Top_50_Services` has the full list with anchor keyword, national volume, CPC, keyword difficulty, intent, and silo role for each. Headlines:

The split is exactly **35 commercial / 15 residential**, matching the bias we agreed to. The total monthly anchor pool, before applying organic CTR, is `$6.84M/mo`. That is a "if every keyword ranked position 1 and we captured 100% of CTR" number — useful only as a ceiling. The realistic numbers are in section four below.

Forty of the fifty services have a real anchor keyword in the competitor dataset. The other ten — `EPDM roofing installation`, `PVC roofing installation`, `Roof leak detection`, `Green roofing systems`, `Roof drainage systems`, `Skylight installation`, `Commercial gutter systems`, `Storm damage roof repair (residential)`, `Hail damage roof repair (commercial)`, and a couple of others — show as "no anchor in dataset" with a `Validate via DFS` flag in the Notes column. They are real Pro Exteriors services and they will rank, but the demand validation needs to come from a DataForSEO pull against the actual hail-belt geographies, not from this dataset.

Each service is tagged with a **Silo Role**. Targets are the money pages — the ones that earn an internal-link silo of 5-7 supporter posts. Supporters are long-tail informational posts that pass equity up to a Target. We have **34 Targets and 16 Supporters** in the curated 50; that's the right ratio for the Reverse Silo system because we want most of our content to be money-bearing, not just informational filler.

## The $10K/mo math

The model uses the standard organic-equivalent-value formula: `monthly searches × organic CTR by SERP position × CPC`. CTRs are from the 2024 Backlinko CTR study (`https://backlinko.com/google-ctr-stats`) and Advanced Web Ranking's 2024 CTR Insight (`https://www.advancedwebranking.com/ctrstudy/`). Position 1 = 30%, Position 3 = 12%, Position 5 = 8.5%. These are organic-only; local pack and ad clicks are excluded.

Run the math against the top 10 Targets in the xlsx and the picture is this: at position 1 across all ten, the ad-equivalent value is well over $10K/mo on its own. At position 3, it's still meaningfully above $10K. At position 5, it lands in the $5-8K range.

But position 1 across ten high-CPC commercial head terms in 24-36 months is the right way to think about that ceiling, not a Year-1 commitment. The realistic Year-1 mix looks like this: three to five Targets reach positions 4-10, the rest are climbing, the silo system is compounding but hasn't hit critical authority yet. That mix produces roughly **$3-6K/mo** from the Target pages alone.

To clear $10K/mo inside Year 1, the location-page ring is non-negotiable. "Commercial roofing contractors dallas tx" is `390 monthly searches × $64.11 CPC = $25K/mo at Position 1`, and difficulty on that keyword is **4** — meaning we can rank it inside 90 days with even a moderately well-optimized page. Five city-targeted commercial roofing pages of that caliber, plus the residential repair near-me coverage across Pro Exteriors' five primary metros, gets us to $10K/mo by month 9-12. The Targets keep climbing in the background and become the Year-2 acceleration engine.

The honest sensitivity analysis: every number in the model uses **national** volume. Local volume in DFW, Denver, Wichita, and KC will run higher per-keyword because of Pro Exteriors' service density and the storm-belt premium. If DataForSEO confirms even a 1.5x local multiplier, the path to $10K compresses by several months.

## The location ring — six profiles, one architecture

Pro Exteriors has six physical addresses: Richardson TX (HQ), Euless TX, Greenwood Village CO, Wichita KS, Kansas City MO, and the Atlanta satellite. Five brick-and-mortar plus one satellite. The right approach:

Every brick-and-mortar gets a full GBP profile with the same five categories, the same service list, and the same brand assets. Each profile gets a corresponding **location page on the website** (e.g., `/locations/dallas-fort-worth/`, `/locations/denver/`) that is itself a Target page in the Reverse Silo system — supported by metro-specific informational posts and linked from every relevant service page on the site.

The Atlanta satellite is its own conversation. Per the office list you shared, it should be visually distinguished (custom satellite icon, not the brick-and-mortar icon) and probably should not run a full GBP yet — running an active GBP without a permanent staffed address is a TOS violation that will eventually get the profile suspended. The right pattern is a website location page that's clearly labeled "satellite" and a service-area listing on the GBP for whichever brick-and-mortar covers that territory.

## Q1 build sequence — what ships in May, June, July

**Month 1 (May 2026) — five commercial money-page foundations.**

Target pages for `Commercial roof repair`, `TPO roofing installation`, `Metal roofing installation (commercial)`, `Flat roof repair`, and `Commercial roof replacement`. Each Target ships with five to seven Supporter posts that link upward (templates are in xlsx tab `03_Reverse_Silo_Architecture`). Each Target also gets six location-page variants (DFW, Denver, Wichita, KC, plus the satellite-served Atlanta page). That's 5 Targets × (1 + 6 location pages + 5-7 supporters) ≈ **55-65 pages in Month 1**. Aggressive but doable if the editorial pipeline is real.

**Month 2 (June 2026) — residential urgent + commercial maintenance.**

Targets: `Residential roof repair`, `Residential roof leak repair`, `Hail damage roof repair (commercial)`, `Commercial roof maintenance program`, `Commercial roof inspection`. Same fan-out structure. The residential urgent-leak silo is the single fastest-converting flow we have — homeowners search for "fix leaking roof" with their wallet open, and the $32 CPC reflects that.

**Month 3 (July 2026) — high-CPC residential close + commercial specialty.**

Targets: `Residential roof replacement`, `Asphalt shingle roofing`, `Storm damage commercial roof repair`, `Roof recoating / coating service`, `Insurance roof claims assistance`. By end of Q1 we've shipped 15 Target pages, ~75-100 supporter posts, and 90 location-page variants. That's the foundation. Q2 starts the next layer (months 4-6) and the cadence becomes 10 services + location pages per month, exactly the rhythm you mentioned.

## What I need from you before we publish

Three items, in order of urgency.

**One.** Run a DataForSEO local-volume pull in Claude Code for all 50 anchor keywords across location codes for DFW (1003854), Denver (1014221), Wichita (1014834), and Kansas City (1014904). Drop the values into the `DFS_Local_Vol_DFW` and related columns in the xlsx. I'll re-rank the priority list once we have local numbers — I expect at least the storm/hail picks to climb significantly.

**Two.** Confirm Pro Exteriors actually offers every service on the curated list. The list is built against demand, not capability. If we list a service the team doesn't fulfill (e.g., if they don't actually do PVC roofing, or if cool-roof coating isn't in the standard catalog), we either drop it or sub in a service they do offer.

**Three.** Get me the Atlanta satellite plan. If the goal is a full location presence, we need to schedule the brick-and-mortar conversion. If it's permanently a satellite, the GBP strategy and the website location page both need to make that explicit. Either way, the icon system needs to differentiate.

When the local-volume pull and the capability confirmation are done, I can update the xlsx in a one-hour pass, lock the Q1 build calendar, and hand the editorial team a 30-day content sprint plan they can execute against.

## Sources

- Backlinko CTR study, 2024 — `https://backlinko.com/google-ctr-stats`
- Advanced Web Ranking CTR Insight, 2024 — `https://www.advancedwebranking.com/ctrstudy/`
- Competitor keyword dataset — `/discovery/Competitor-Domain-Keywords_Combined.xlsx` (7,402 rows, 11 competitors, DataForSEO-enriched; moved from project root during 2026-04-26 cleanup)
- Google Business Profile category list, 2024 update — `https://support.google.com/business/answer/3038177`
- Pro Exteriors office locations and licensure — confirmed by Chris on 2026-04-25

— Maren
