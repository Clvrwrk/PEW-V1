# Pro Exteriors — Figma Design Audit
**Date:** 2026-04-25
**Author:** Maren Solveig Castellan-Reyes, Senior Director, Website & Application Experience — AIA4 Pro Exteriors
**Scope:** 16 Figma designs at file `n8EC2AgOcubGyfEq7YJoiW`, evaluated against CLAUDE.md hard gates, the canonical sitemap (§6.3 of the Website Design Brief), the Astro architecture decision (2026-04-25), Path C partner disclosure, and the Property First / Layer Cake brand thesis.

---

## Executive summary

Sixteen designs reviewed. **Eight ship-ready or near-ready** with P0 fixes (mostly stat sourcing). **Six need meaningful rework** before engineering can begin — including four designs that have not been customized off the agency template and still display placeholder brands ("RoofingPros," "APEXROOFING") rather than Pro Exteriors. **Nine design gaps** are missing from the set entirely — most critically the entire Total Home Shield five-page Anchor funnel, the subdivision-detail template (Twin Creeks ships in Phase 0), and the Property Card lead magnet flow.

The single highest-leverage finding: **the Property First brand thesis does not appear in any of the 16 designs.** No Property Card surfacing, no subdivision-aware copy, no "the contractor who already knows your street" framing. The strategic positioning that justifies the entire Layer Cake investment is invisible on the website that's supposed to express it. That's a P0 we have to address before Phase 0 launch — not by redesigning everything, but by adding the right hooks in the right places.

The second highest-leverage finding: **stat callouts are unsourced across nearly every design.** Hero strips show numbers like "8000+", "30+", "15M+ sq ft serviced", "300% Premium", "98%", "2,500+", "1.2k", "$5.5M+" without source attribution. Per CLAUDE.md §4 every claim has a receipt. Either delete or attribute.

The third: the **Total Home Shield five-page Anchor funnel doesn't exist as a design.** The single ProPlan frame is the commercial-program design. The residential consumer-facing campaign — the entire Trojan Horse mechanic Chris confirmed for Path C — has no Figma. That's a design-team sprint, not an audit fix.

Engineering can start on three to four templates while the rest get reworked. Do not green-light a single comprehensive handoff until the rework is done — you'll either ship inconsistent designs or block engineering on the slowest design.

---

## Per-design findings

### 1. Home Page — `/` — node 9:4672

**Template:** `home` · **Maps to:** `/` · **Astro impact:** moderate (US map React island + form) · **Path C:** N/A · **Property First:** weak · **Brand positioning:** premium-aligned with no storm-chaser language

**P0**
- Hero stat strip ("8000+", "6.4", "20+", "95", "1058+") shown without source attribution. Per CLAUDE.md §4: every claim has a source. Either delete, anchor explicitly in micro-copy below the stats, or verify these are real Pro Exteriors numbers Chris can sign off on.
- Property First brand thesis is not surfaced anywhere. The Home Page is where the strongest positioning belongs and currently reads as "premium roofer with national footprint" — solid but generic. Add a section that surfaces the Property Card concept (preview tile + "Get the Property Card for your address" CTA) or at minimum a place-memory copy hook in the hero or below the case study row.

**P1**
- Multiple competing primary CTAs (orange Request, dark Residential, plus the dual-path cards below the hero). Define a single primary conversion goal in the measurement spec; the rest are secondary. This is a measurement-spec decision, not a redesign.
- Bottom CTA "Ready to talk about your roof?" is generic. Property First framing would say "Get your Property Card" — the lead magnet that already exists in the URL plan.

**P2**
- "Industry Insights" 3-card row at the bottom would benefit from explicit category labels (Commercial / Residential / Education) for editorial scanability.

**Strengths**
- Dual-path router (commercial / residential cards below hero) correctly implements canonical §1.1.
- US map visualization is the right pattern; aligns with architecture decision §4 (React island, `client:visible`).
- Real crew/jobsite photography throughout; no obvious stock.
- Hero copy "Roofing Partner. Not Just a Contractor." is premium-relationship framing — on-brand.
- Single testimonial with rating — supports Review schema.
- No storm-chaser language anywhere in the hero or primary nav.

---

### 2. Commercial Roofing Contractor (vertical hub) — `/commercial-roofing/` — node 9:4673

**Template:** `hub` · **Maps to:** `/commercial-roofing/` · **Astro impact:** moderate (map + form) · **Path C:** N/A (commercial vertical) · **Property First:** neutral · **Brand positioning:** premium-commercial-aligned

**P0**
- Hero stat strip ("30+", "15M+ sq ft serviced", "98%", "42") unsourced. Same fix pattern as Home.
- Hero H1 reads "Commercial Roofing Contractor in Dallas & Nationwide" — but this is the **national vertical hub** at `/commercial-roofing/`, not a city page. The "Dallas" reference is geographic confusion that will undercut the page's ability to rank for "commercial roofing contractor" head terms across the rest of the country. Either drop "Dallas" or differentiate this hub from `/commercial-roofing/dallas/`.

**P1**
- "Specialized Roofing Systems" grid — confirm it surfaces all 10 commercial services per canonical §2.1 (TPO, EPDM, Modified Bitumen, Built-Up, Metal, Flat Roof, Repair, Replacement, Maintenance, Warranty). The screenshot shows ~6 tiles; the other four need linkage at minimum.
- "Industrial-Grade Reliability" trust section is solid; add 2-3 named client logos to make it concrete (procurement officers will scan for familiar names).
- The "Get Your Executive Roof Assessment" form in the bottom CTA — confirm field set against the Offer C2 / C3 / C4 conversion endpoints in the canonical sitemap §2.3.

**P2**
- "Commercial FAQ" accordion — three questions visible. Plan for 6-8 to fully populate FAQPage schema and capture "people also ask" volume.

**Strengths**
- "Strategic asset" / executive-buyer framing is correct for commercial procurement.
- Real photography of buildings and crews.
- Logo strip (post-stats) implies named-client trust signals — the right pattern.
- "Dallas-Rooted. Nationwide Reach." is good place-memory positioning even though it conflicts with the H1 — this concept is closer to Property First than the H1.

---

### 3. Residential Roofing Contractor (vertical hub) — `/residential-roofing/` — node 9:4674

**Template:** `hub` · **Maps to:** `/residential-roofing/` · **Astro impact:** moderate · **Path C:** non-compliant (capability listed but not disclosed) · **Property First:** neutral · **Brand positioning:** **MIXED — partial de-storm violation**

**P0**
- Two co-equal hero cards immediately below the hero: **"Roof Damage? We Are Here in 48 Hours"** (storm/urgent positioning) and "Planning Your Dream Roof?" (planned replacement). Per the de-storm rule we established, urgent/storm work should be findable but not foregrounded. The current arrangement gives storm-chaser positioning equal billing with planned replacement on the residential vertical hub — exactly the wrong signal for the retail-residential market we're trying to attract. Move the urgent-leak card to a secondary position (below services or in a footer "Need help fast?" strip), and let the hub lead with planned replacement / premium positioning.
- Hero stat strip ("15+", "2,500+") unsourced.

**P1**
- "Specialized Residential Services" grid lists 6+ service tiles. Confirm Path C disclosure if windows or exterior painting tiles are present; from the screenshot resolution I cannot read every tile label. If those tiles exist, partner-network attribution must be visible at the tile or footer level.
- Stats "15+" ("years of service", presumably) and "2,500+" ("homes served", presumably) are fine numbers IF sourced — but the labels are too small to read on the hub. Make the source/label legible.

**P2**
- "Transparent Pricing & Easy Financing" section — confirm financing partner is named (per Offer R3 in canonical §3.3).

**Strengths**
- **"Local Experts. Not 'Storm Chasers.'"** is the single best brand-positioning line in the entire 16-design set. Keep it. This is exactly the de-storm framing we want — explicit, not euphemistic.
- "Our Seamless Process" 4-step visualization is on-brand for premium retail.
- Real-photo discipline maintained.
- "Your roof protects everything underneath it. Let's make sure it's right." is the kind of asset-stewardship copy that aligns with Property First even though Property First isn't named.

---

### 4. Commercial Roofing Contractor — Single Service Page Template — `/commercial-roofing/[service]/` — node 9:4675

**Template:** `service-detail` · **Governs:** all 10 commercial service URLs (TPO, EPDM, Mod Bit, BUR, Metal, Flat Roof, Repair, Replacement, Maintenance, Warranties) · **Astro impact:** minimal (form only) · **Path C:** N/A (commercial) · **Property First:** weak · **Brand positioning:** premium-aligned

**P0**
- Hero shows "TPO Roofing Systems in Dallas" — but this is a **template** that should serve every commercial service across every geography. If this is the actual template, the geography modifier needs to be a templated field that fills from the city context (or it's simply national and "Dallas" is wrong). If this is meant to be `/commercial-roofing/tpo/dallas/` (a city × service intersection page) it lives at three folders deep and conflicts with the canonical IA. Clarify with design team.

**P1**
- "Why Choose TPO?" 6-benefit grid is the right structure. The icons need consistent visual weight; one or two appear visually heavier than the others in the screenshot.
- "Perfect for Every Structure" lists Industrial / Retail / Residential — TPO on residential is uncommon (residential typically gets shingle, metal, or tile). Either remove "Residential" from this template's tile or constrain the third tile to relevant building types.
- "Other Commercial Solutions" cross-sell strip — verify it links only to commercial siblings (containment rule per canonical §2.1). No links to residential pages from this body content.

**P2**
- Process section ("Our Quality Process") with portrait photos of crew is excellent — preserve and extend this pattern.

**Strengths**
- Material-specific detail page is the right structure for SEO — each commercial service Target gets a deep page.
- "Engineered for Performance" hero copy lead is appropriately technical-buyer.
- Real crew portrait photos in the process section humanize the page.
- Project gallery + Case Studies + FAQ + cross-sell — the full money-page anatomy is present.
- Containment respected — cross-sell stays inside commercial.

---

### 5. ProPlan — `/proplan/` — node 9:4676

**Template:** `proplan` · **Maps to:** `/proplan/` (commercial program face) · **Astro impact:** moderate (ROI calculator React island per architecture §4) · **Path C:** N/A (commercial) · **Property First:** **partial — strongest in the set** · **Brand positioning:** premium-commercial, asset-management framing

**P0**
- Stats "300% Premium / 7 Years Lost / Warranty Risk" in the "Hidden Cost of Wait-and-See Roofing" section are unsourced. These need data backing — they're claims about industry behavior (premiums on emergency repair, lost roof life from neglect) that procurement officers will check.

**P1**
- ProPlan design is the COMMERCIAL face only. The residential equivalent — the **Total Home Shield five-page Anchor funnel** — does not exist in this design set. Per Path C decision, `/total-home-shield/` is a parallel residential URL tree with its own sequential funnel pages. Those need a design sprint before Phase 0 launch.
- Property Card surfacing missing. The "Sample Report" CTA is close — link or visual integration with the Property Card concept would make Property First explicit on this page.
- Three stakeholder cards (Facilities Managers / Property Management / Building Owners-CFOs) are well-targeted but lack named-customer attribution. Add a logo or mini-case-study under each persona ("Property managers like [X] portfolio of 12 buildings").

**P2**
- Bottom form is well-structured. Confirm the field set matches the `/proplan/enroll/` canonical endpoint.

**Strengths**
- "Turn Your Roof from a Liability into a Strategic Asset" is the strongest commercial-buyer hero in the set. Strategic-asset framing is on-thesis with Property First and aligns with the procurement audience.
- ROI calculator is prominently placed and shows a worked example ($242,500). Per architecture decision §4, this is a `client:visible` React island — design correctly anticipates the engineering pattern.
- Real testimonial with named attribution and quantified outcome ("64% emergency repair spend reduction") — exactly the receipt-bearing trust pattern we want.
- Drone visual signals data-driven, modern operations.
- "Hidden Cost of Wait-and-See" agitation framing matches the Trojan Horse logic (proactive maintenance vs. reactive emergency).
- "Schedule Your ProPlan Assessment" form integrated cleanly with the conversion path.

---

### 6. Location Hub — `/locations/` — node 9:4677

**Template:** `hub` (locations) · **Maps to:** `/locations/` · **Astro impact:** moderate (interactive coverage map React island) · **Path C:** N/A · **Property First:** weak · **Brand positioning:** generic — partial brand failure

**P0**
- **Header brand reads "RoofingPros" — placeholder agency template branding, not Pro Exteriors.** This design has not been customized to the client. Cannot ship as-is.
- Only **three** office cards displayed (Richardson HQ, Denver Regional, Wichita Logistics). Pro Exteriors has **five brick-and-mortar offices plus an Atlanta satellite** = six total locations. Missing Euless, Kansas City MO, and Atlanta. This is a launch blocker because each of those locations needs a unique GBP destination URL.

**P1**
- "Cities We Serve" text-column list — verify against Pro Exteriors' actual licensed footprint. Texas list shows Houston, Austin, San Antonio, El Paso — confirm Pro Exteriors actually services those metros (or remove). Same for Georgia (Valdosta, Savannah, Augusta, Columbus) and the rest.
- "Cities We Serve" model is ZIP-thinking, per Property First doc §5.2 we should be subdivision-aware. Add a "Priority Subdivisions" sub-section that lists the Twin Creeks-style premium farms by metro.

**P2**
- Map visualization is clean; the active/regional/satellite icon distinction works.

**Strengths**
- Interactive coverage map with proper office-type icon distinction (active states / B&M / regional / satellite) — handles the icon-system requirement we discussed.
- "Don't see your city?" CTA is the right overflow-demand pattern.
- Office cards have NAP, phone, and "View Local Projects" CTAs — supports LocalBusiness schema and project-portfolio linkage.

---

### 7. Case Study Portfolio Hub — `/projects/` — node 9:4678

**Template:** `case-study-hub` · **Maps to:** `/projects/` · **Astro impact:** minimal (filter UI is Astro-native per architecture §4) · **Path C:** N/A · **Property First:** neutral · **Brand positioning:** premium-aligned

**P0**
- Hero stat ("1,348 SQ FT" — wait, that should be projects or square feet served) — unsourced and the number is suspicious (1,348 sq ft is one small roof). Verify and source.

**P1**
- Filter pills ("All Industries / All Services / All Locations / All Projects") are the right structure — confirm filter behavior is Astro-native (URL-param-driven, no React island needed). Per architecture decision §4, default to Astro-native unless the UX requires React.
- "Texas Motor Speedway TPO Retrofit" featured first — strong anchor case study. Confirm permission and signoff per CLAUDE.md never-do (testimonials/case studies signed off in writing).

**P2**
- Pagination at the bottom of the grid is fine; consider infinite scroll only if measurement shows it improves engagement (and only with proper SEO handling).

**Strengths**
- Filter-by-industry pattern matches the canonical §6 structure (healthcare / education / industrial / retail / multi-family / faith-nonprofit / premium-residential / storm-recovery).
- Featured case study with marquee photo (Texas Motor Speedway) is a strong anchor — flagship project visibility.
- Three secondary featured tiles (St. Jude, Apex Corporate Plaza, etc.) — good portfolio depth signal.
- Grid layout is scannable with tags, location, and metrics on each card.

---

### 8. Location | Single Location Template — `/commercial-roofing/[city]/` OR `/locations/[office]/` — node 9:4679

**Template:** unclear — need to clarify (see below) · **Astro impact:** moderate (city map React island) · **Path C:** N/A · **Property First:** weak-to-neutral · **Brand positioning:** premium-commercial-aligned

**P0**
- **Template purpose ambiguous.** The H1 reads "Commercial Roofing Contractor in Dallas, TX" with services and case studies for commercial — that's a `/commercial-roofing/dallas/` city service page. But the design also embeds an office map pin and could serve as the GBP destination at `/locations/dallas-hq/`. **These are two different templates with two different purposes** per canonical §5 and the URL plan in sheet 05. Need clarification: does this design serve city service pages, GBP-destination office pages, or both? If both, that's a containment problem because city service pages and office pages have different purposes (SEO vs. GBP NAP) and shouldn't share copy.

**P1**
- "Trusted by Dallas Business Leaders" testimonial section — confirm at least three different testimonials in rotation and named attribution.
- Footer city links ("Richardson | Fort Worth | Plano | Irving") imply this is the city-service template variant, since office-destination pages wouldn't link to other cities. If so, rename the template `commercial-city-detail` and create a separate `office-location` template for GBP destinations.

**P2**
- Map embed is correctly positioned. Confirm the marker uses the office pin variant (HQ/regional/satellite) per Location Hub icon system.

**Strengths**
- "Serving Every Neighborhood Across the Dallas-Fort Worth Metroplex" is good metro-aware copy.
- City-specific completed work section is high-converting for local SEO.
- FAQ section supports schema.
- Testimonial section is structurally well-placed.

---

### 9. About Us — `/about/` — node 9:4680

**Template:** `about` · **Maps to:** `/about/` · **Astro impact:** minimal · **Path C:** N/A · **Property First:** weak · **Brand positioning:** premium-aligned

**P0**
- **Header brand reads "RoofingPros" — placeholder, not Pro Exteriors.** Not customized to the client.
- Hero stats "16 / 10M+" (years and "10M+" of something) unsourced and unlabeled at the screenshot resolution. Source and clarify.
- "Pro Ministries" appears as a section ("Pro Ministries: Giving Back" with "$2.5M+ raised") — this is correct per canonical §7 (`/about/pro-ministries/`) but the $2.5M figure needs sourcing.

**P1**
- "Leadership Team" shows three portraits with names visible (Marcus Torres, Elena Rodriguez, Sarah Chen). Confirm these are real Pro Exteriors leadership — if so, great. If placeholder names from the agency template, this is a P0 (CLAUDE.md never-do: real photos / real people only).
- "Start Your Career at RoofingCo" CTA at the bottom is a placeholder that should link to `/careers/`.
- "Our Mission & Values" is fine here, but per canonical §7 there's also a separate `/about/mission/` page. Confirm this section is a teaser that links deeper to `/about/mission/`, not a duplicate of that page's content.

**P2**
- Footer brand identity needs to update to Pro Exteriors as part of the broader brand fix.

**Strengths**
- Structure is correct: Journey timeline → Mission/Values → Leadership → Pro Ministries → Career CTA.
- Pro Ministries section is uniquely brand-relevant (faith-led service component) — good differentiation.
- Photography of leadership has the right warmth-and-credibility tone.

---

### 10. Case Study | Single Case Study Template — `/projects/[case-study-slug]/` — node 9:4681

**Template:** `case-study-detail` · **Governs:** all individual case study URLs · **Astro impact:** minimal · **Path C:** N/A · **Property First:** weak · **Brand positioning:** premium-aligned

**P0**
- Hero project name is partially obscured at screenshot resolution; cannot fully verify but the structure is correct.

**P1**
- Quote from "Pro Exteriors handled the 1.2 million square foot installation with military precision" — confirm signed-off attribution per CLAUDE.md §4 trust gate.
- "Visual Transformation" before/after photo treatment is good — recommend a third state ("during construction") if available, to demonstrate process not just outcome.
- Technical Specifications block is strong. Add explicit Property First signals if applicable: "Property is now in our maintenance program" / "Service history continues" — turns a one-off case study into a recurring-relationship narrative.

**P2**
- "Related Case Studies" cross-sell at bottom — confirm filter to industry siblings only (containment).

**Strengths**
- Project Overview / Challenge / Solution / Result narrative structure is the right anatomy.
- Visual Transformation section with multi-image before/after is conversion-grade trust signal.
- Technical Specifications block reads like real procurement-grade documentation.
- Quoted client testimonial with attribution — receipt-bearing.
- Schema-ready for CaseStudy + Article + BreadcrumbList per architecture decision §3.

---

### 11. Mission — `/about/mission/` — node 9:4682

**Template:** `about` (sub-page) · **Maps to:** `/about/mission/` · **Astro impact:** minimal · **Path C:** N/A · **Property First:** weak · **Brand positioning:** community-aligned

**P0**
- Stats "25+ / 1.2k / 100% / $5.5M+" unsourced. The labels at screenshot resolution are illegible — verify and source.

**P1**
- "Community Service By the Work" header positioning is good, but the page reads as Pro Ministries / community impact. Confirm: is this `/about/mission/` (the mission/values page) or `/about/pro-ministries/` (the community service page)? Canonical §7 has both. If this design is meant for `/about/mission/`, it's heavy on community service and light on the actual company mission. If for `/about/pro-ministries/`, the design is correct but the URL slug should be `pro-ministries` not `mission`.
- Quote attribution to "Robert Hayes, Founder" — confirm this is real attribution.

**P2**
- "The Road Ahead" closing section is a nice forward-looking element. Could include a Property First nod ("the next 25 years, anchored to every property we've ever served").

**Strengths**
- Strong typographic hero — community service framing is differentiating.
- Vertical photo of construction in service ties mission to action.
- Stats grid with multiple data points (25+ years, 1.2k something, 100% something, $5.5M+ something) — high-trust if sourced.

---

### 12. Insights Resources Hub — `/blog/` — node 9:4683

**Template:** `pillar` (blog hub) · **Maps to:** `/blog/` · **Astro impact:** minimal (search + filters are Astro-native per architecture §4) · **Path C:** N/A · **Property First:** weak · **Brand positioning:** premium-aligned

**P0**
- **Header brand reads "APEXROOFING" — placeholder, not Pro Exteriors.** Footer also reads "APEX ROOFING." Not customized.
- Hero featured article has placeholder image (a fish) — clearly a stock-image placeholder. Replace with actual Pro Exteriors content image.

**P1**
- Filter pill row shows pillars (Commercial Roofing / Residential Roofing / Metal Roofing / Roof Maintenance / Storm Damage / Industry News). Per canonical §8 we have **13 pillars** — confirm all 13 surface in the filter or the navigation pattern handles overflow.
- "Storm Damage" appears as a primary filter pill at the same visual weight as Commercial/Residential. Per de-storm rule, Storm content should be findable but not visually equal to the main verticals. Move "Storm Damage" to a secondary filter row or push it to the end of the pill list.
- "Get the ProPlan Insight" sidebar email signup — confirm it integrates with the actual lead routing (not just an email-list sign-up).

**P2**
- Sidebar "Popular Posts" with category tags (Maintenance, Residential, Sustainability, Finance) is good editorial pattern.
- "Need Immediate Technical Support?" sticky-ish CTA at the bottom is a smart conversion catcher for blog readers.

**Strengths**
- Editorial structure is professional and B2B-appropriate.
- Featured article + filter pills + grid + sidebar is the standard high-converting blog hub anatomy.
- "Get the ProPlan Insight" email capture is a content-aware lead magnet pattern.
- "Need Immediate Technical Support?" / "Contact Engineering" / "View Service Map" — three differentiated CTAs that respect different reader intent.

---

### 13. Insights | Single Page Template — `/blog/[slug]/` — node 9:4684

**Template:** `blog-post` · **Governs:** all 60-70+ supporter posts · **Astro impact:** minimal · **Path C:** N/A · **Property First:** weak-neutral · **Brand positioning:** premium technical

**P0**
- Header brand reads "Pro Exteriors" — correct.
- Stats embedded in the article ("The PVC Tip: Thermal Differential" callout box) need sourcing if cited.

**P1**
- Author byline shows a portrait + name ("Albert Marcus Torres") — confirm real Pro Exteriors author. Per architecture decision §3, blog-post schema requires `Author` referencing a real Person (`/about/leadership/`). If this is a placeholder name, fix.
- "Application Video Demo" video embed — confirm video is real Pro Exteriors content with proper poster image (poster prevents CLS per architecture §1.1).
- Testimonial quote styling within article body is good — verify attribution signoff.

**P2**
- Sidebar TOC navigation could include a "Related Pillar" link back to the parent pillar URL (containment-friendly).

**Strengths**
- Clean editorial article layout with clear hierarchy.
- Sidebar TOC for long-form content — good UX for technical readers.
- "Technical Specification Matrix" table block is a high-trust format for procurement-audience content.
- "Application Video Demo" with author callout — adds a face to the content.
- "Related Articles" cross-sell at bottom — confirm filter to silo siblings + pillar (containment per canonical §8 rule 1).

---

### 14. Contact Us — `/contact/` — node 9:4685

**Template:** `contact-hub` · **Maps to:** `/contact/` · **Astro impact:** moderate (forms = React islands client:idle) · **Path C:** N/A · **Property First:** weak · **Brand positioning:** premium-aligned

**P0**
- "Office Locations" grid shows 6 office cards — Richardson TX, Euless TX, Wichita KS, Denver CO, Valdosta GA(?), Charlotte NC(?). Wait, the cities listed are Richardson, Euless, Wichita, Denver, Valdosta, North Carolina (Charlotte) — but Pro Exteriors has Richardson, Euless, **Greenwood Village**, Wichita, **Kansas City MO**, plus Atlanta satellite. The Contact page shows different cities than the actual office footprint. **Verify against the actual addresses and either update Contact or update Location Hub — they need to match.**

**P1**
- Two-column form ("Commercial Inquiry" + "Residential Request") is the correct branched form pattern per canonical §9. Form fields look reasonable.
- Footer office hours strip is good — confirm hours match the GBP profile hours.
- Form validation states + error messaging not visible in the screenshot. Confirm design includes empty/error/success states (P1 if missing).

**P2**
- "Frequently Asked Questions" at the bottom is appropriate for the Contact page — covers common objections before form submit.

**Strengths**
- Branched form pattern (Commercial vs Residential) routes leads to different teams correctly.
- Phone / Email / Hours strip below forms — three contact paths visible.
- Office Locations grid is concrete and visual.
- FAQ at bottom — supports FAQPage schema and reduces low-quality contact volume.
- Subtle hero ("Let's Talk About Your Roof") is appropriately calm — not pushy.

---

### 15. Jobs / Careers — `/careers/` — node 9:4686

**Template:** `careers-hub` · **Maps to:** `/careers/` · **Astro impact:** minimal · **Path C:** N/A · **Property First:** weak · **Brand positioning:** community-aligned

**P0**
- **Header brand reads "RoofingPros" — placeholder, not Pro Exteriors.** Not customized.
- Hero copy "Build Your Career with Pro Exteriors" — body says Pro Exteriors but the masthead doesn't. Internal inconsistency.

**P1**
- "Open Positions" section shows position cards. Confirm each links to a `/careers/[position-slug]/` detail page that fires JobPosting schema per architecture decision §3.
- "Life at Pro Exteriors" photo grid — verify photos are real Pro Exteriors team in real settings.

**P2**
- "What Our Team Says" testimonial section is good — culture trust signal.

**Strengths**
- Hero "Build Your Career" framing is right for recruiting.
- Open Positions structure with role + location filters is the right anatomy.
- Photo grid of team in field — humanizes the recruiter pitch.
- Testimonial from team member is the right trust signal for candidates.

---

### 16. Customer Portal Login — `/portal/` — node 9:4687

**Template:** utility (link-out per architecture §1) · **Maps to:** `/portal/` · **Astro impact:** minimal · **Path C:** N/A · **Property First:** N/A · **Brand positioning:** N/A

**P0** — none.

**P1**
- Per architecture decision §1, the customer portal is a Centerpoint SSO link-out, **not something we build**. This Figma design as a built login page may not be necessary at all if the portal is hosted by the SSO provider. Confirm with engineering: do we ship this design or do we redirect `/portal/` to the external SSO?

**P2**
- If we do ship it, the form is appropriately minimal (Email + Password + Sign In + Forgot Password + Support strip).

**Strengths**
- Minimal, focused login experience.
- "Access project dashboard, documents, and invoices" sub-text sets clear expectations.
- Support phone + email visible — good for forgotten-password and lockout cases.
- "Back to website" header link — good escape hatch.

---

## Cross-cutting findings

### Pattern 1 — Placeholder brand on four designs

Four of sixteen designs show agency-template placeholder brands rather than Pro Exteriors:
- **Location Hub (06)** — "RoofingPros"
- **About Us (09)** — "RoofingPros"
- **Insights Hub (12)** — "APEXROOFING"
- **Careers (15)** — "RoofingPros"

This is a P0 blocker on all four. Engineering cannot build pages with placeholder brand assets, and the design team needs to do a brand pass before handoff. The Pro Exteriors logo, color palette, footer, and header are inconsistent across the set — the 12 designs that ARE branded show consistent treatment, so the agency template is the source. Easiest fix: design team runs a "Find: RoofingPros, APEXROOFING; Replace: Pro Exteriors" pass on the four designs and verifies every component reflects the actual brand.

### Pattern 2 — Unsourced statistics across nearly every page

Stat callouts appear on at least 10 of 16 designs without visible source attribution:
- Home: "8000+", "6.4", "20+", "95", "1058+"
- Commercial Hub: "30+", "15M+ sq ft serviced", "98%", "42"
- Residential Hub: "15+", "2,500+"
- ProPlan: "300% Premium", "7 Years Lost", "Warranty Risk"
- Case Study Hub: "1,348 SQ FT" (suspicious low number)
- About: "16 / 10M+"
- Mission: "25+ / 1.2k / 100% / $5.5M+"

Per CLAUDE.md §4: every claim has a receipt. Either source these to specific Pro Exteriors data Chris signs off on, or delete them. Procurement officers and homeowners both Google-check claims, and a single unsourced number found false costs more brand trust than every accurate number combined.

### Pattern 3 — Property First brand thesis is invisible across all 16 designs

No design surfaces:
- Property Card concept (the hero B2B asset per Property First strategy §6.1)
- Subdivision-aware copy (Twin Creeks, premium subdivisions named)
- "The contractor who already knows your street" framing
- HOA-aware service hooks
- Place-memory continuity (warranty-survives-the-move messaging)

The only design that comes close is ProPlan with its "Strategic Asset" framing and "Sample Report" CTA — but even there, Property First isn't named or surfaced. Per the Property First strategy doc, this is the brand thesis that justifies every other investment in the engagement. The website that's supposed to express it currently doesn't. Fix: add Property First hooks at strategic points — Home Page (hero or below), Residential Hub (a "Get Your Property Card" CTA tile), ProPlan ("View Sample Property Card" linked to the lead magnet), and the Locations pages (subdivision callouts under each city). This is mostly copy and component work, not full redesigns.

### Pattern 4 — Geographic specificity confusion on national templates

Multiple national-vertical designs hard-code "Dallas":
- Commercial Hub H1: "Commercial Roofing Contractor in Dallas & Nationwide"
- Service Template H1: "TPO Roofing Systems in Dallas"
- Location Single: "Commercial Roofing Contractor in Dallas, TX"

If these are genuinely meant to be DFW-focused designs that get duplicated per metro, the IA needs four+ versions of every page. If they're meant to be national templates that fill geography from CMS data, "Dallas" needs to come out of the static design and become a templated field. Recommendation: clarify with design team whether these are templates or instances. If templates, replace "Dallas" with `{{city}}` or similar placeholder so it's clear the value is dynamic.

### Pattern 5 — Schema readiness is good

Most designs have the structural elements needed for the schema contracts in architecture decision §3:
- FAQ accordions on hubs and service pages → FAQPage schema ready
- Testimonial sections with attribution → Review schema ready
- Office cards with NAP → LocalBusiness schema ready
- Project case studies with structured fields → CaseStudy + Article schema ready
- Author bylines on blog posts → Person schema ready

Engineering won't be blocked on schema implementation by the designs themselves. The blocker is content fidelity (real names for Person schema, real numbers for Review/AggregateRating, real attribution for testimonials).

### Pattern 6 — Real-photo discipline mostly intact

The 12 properly-branded designs show real-looking photography of buildings, crews, and jobs. No stock imagery of "diverse smiling team in hard hats" is visible. The placeholder-branded designs (Location Hub, About, Insights Hub, Careers) also show real-looking photos — those will need verification once the brand pass corrects the agency template artifacts.

The exception: Insights Hub (12) shows a fish image as the featured article hero — clearly a stock-image placeholder. P0 fix to replace.

### Pattern 7 — De-storm positioning is mixed

Excellent: Residential Hub explicitly says "Local Experts. Not 'Storm Chasers.'" — the strongest brand-positioning line in the entire 16-design set.

Violation: Residential Hub also has a co-equal hero card "Roof Damage? We Are Here in 48 Hours" that gives storm work front-door positioning. Move it deeper.

Mild concern: Insights Hub has "Storm Damage" as a primary filter pill at equal visual weight to Commercial / Residential. Per de-storm rule, Storm content should be findable but not visually privileged.

---

## Gap analysis — designs the URL plan needs but the set doesn't include

The URL plan in sheet 05 specifies 252 Y1 pages across these template patterns. The 16-design set covers:
- ✓ home
- ✓ hub (vertical hubs + Location Hub)
- ✓ service-detail (commercial template; **residential service template missing or assumed shared**)
- ✓ proplan (commercial face only)
- ✓ city-detail / location-single
- ✓ case-study-hub
- ✓ case-study-detail
- ✓ pillar (Insights Hub)
- ✓ blog-post
- ✓ about
- ✓ careers-hub
- ✓ contact-hub
- ✓ legal/utility (Portal Login)

**Missing — these templates are needed for Phase 0 launch (P0 design gaps):**

1. **Total Home Shield five-page Anchor funnel** — five distinct campaign-landing designs (Awareness / Agitation / Convenience / Offer / Urgency) plus the Booking Hub thank-you. Path C critical. Phase 0 launch dependency.
2. **`subdivision-detail` template** — needed for Twin Creeks Allen (Phase 0) and 8 priority subdivisions in Q3-Q4. Per Property First strategy §5.2, subdivisions replace ZIPs as the smallest campaign unit. Cannot use city-detail template — subdivision pages need HOA-aware content, hail history, neighbor-served markers.
3. **`/partners/` Path C disclosure page** — Phase 0 launch dependency for honest Total Home Shield campaign.
4. **`/property-card/` lead magnet flow** — three pages (overview, get-yours form, preview). Q1 deliverable but the flow needs designs before build.
5. **`/for-partners/` B2B hub + 3 sub-pages** (real-estate, insurance, general-contractors) — Q2 deliverable per Property First strategy §6.

**Missing — needed but not Phase 0 critical (P1 design gaps):**

6. **Residential service-detail template** — the 11 residential service pages (asphalt, impact-resistant, metal, tile, storm, emergency, replacement, inspection, insurance-claims, gutters, siding) likely share template with the commercial Service Template, but the residential variant has different content patterns. Confirm shared template or build a residential variant.
7. **`careers-posting` (single position) template** — JobPosting schema requires this per architecture decision §3.
8. **`projects/[category]` template** — `/projects/healthcare/`, `/projects/education/`, etc. (8 categories per canonical §6). Currently the design set has the case study hub and individual case study, but not the category pages between them.
9. **Seasonal campaign landings** (Spring Showers, Beat the Heat, Curb Appeal, Winter Fortress) — Q1-Q4 deliverables, lighter than Anchor funnel but still need designs.
10. **`thank-you/[vertical]/` upgraded Booking Hub pattern** — per Path C and Total Home Shield campaign requirements, the residential thank-you needs an embedded calendar. Currently no design.

---

## Top 5 P0 recommendations — what must resolve before engineering begins

1. **Run a brand pass on the four placeholder designs.** Location Hub, About Us, Insights Hub, and Careers all show "RoofingPros" or "APEXROOFING" rather than Pro Exteriors. Find/replace pass + verify every component reflects the actual brand tokens. Estimated effort: 3-4 hours of design time. Single biggest blocker to handoff readiness.

2. **Source or delete every stat callout across the design set.** Chris confirms each number against Pro Exteriors operational data, or it comes out. This is a content-and-trust gate, not a design gate, but designs will need adjustment when sources are added (citations, micro-copy, footnotes). Estimated effort: 2-3 hours of stat verification with Chris + 2-3 hours of design adjustment.

3. **Move Residential Hub "Roof Damage? 48 Hours" hero card to a secondary position.** Per de-storm rule, the residential vertical hub leads with planned replacement / premium positioning. Urgent-leak path stays accessible (per Offer R1 in canonical §3.3) but lives below the fold or in a "Need help fast?" footer strip. Estimated effort: 1 hour.

4. **Fix Location Hub office count.** Currently shows 3 offices; Pro Exteriors has 5 brick-and-mortar plus an Atlanta satellite. Add Euless, Kansas City MO, and Atlanta cards with proper icon distinction (B&M vs satellite per the icon system already in the design). Estimated effort: 2 hours.

5. **Commission the Total Home Shield five-page Anchor funnel + Booking Hub designs.** Phase 0 launch depends on these. The design team needs a sprint to produce six new screens that mirror the campaign doc's Awareness → Agitation → Convenience → Offer → Urgency → Booking Hub structure. The ProPlan design is the closest existing reference but is commercial-tone where these need consumer-residential tone with Trojan Horse mechanics. Estimated effort: 1-2 weeks of design time.

## Recommended sequence for design rework

**Week 1 — Brand pass + stat sourcing (blocks 6 designs from handoff)**
- Brand find/replace on Location Hub, About, Insights Hub, Careers
- Stat verification meeting with Chris + Pro Exteriors leadership
- Content updates to all 10 stat-bearing designs

**Week 2 — Property First hooks + de-storm fix + Location Hub offices**
- Add Property Card surfacing on Home, Residential Hub, ProPlan
- Move "Roof Damage" hero card on Residential Hub
- Add 3 missing office cards on Location Hub (Euless, KC, Atlanta)
- Differentiate Location Single vs. office-location templates

**Week 3-4 — Total Home Shield design sprint**
- Five-page Anchor funnel: Awareness, Agitation, Convenience, Offer, Urgency
- Booking Hub thank-you redesign
- /partners/ Path C disclosure page

**Week 5 — Subdivision template + remaining gaps**
- subdivision-detail template (Twin Creeks first)
- careers-posting single page
- projects/[category] template
- residential service-detail template confirmation

**After Week 5:** engineering handoff for Phase 0 launch.

---

## Templates ready or near-ready for engineering handoff after P0 fixes

These eight designs need only the brand pass / stat sourcing applied and can move to engineering in parallel with the rework on the others:

1. **Home Page** — after stat sourcing + Property First hook
2. **Commercial Hub** — after stat sourcing + H1 geo-clarification
3. **Service Template (commercial)** — after H1 geo-templating + minor copy
4. **ProPlan (commercial)** — after stat sourcing
5. **Case Study Hub** — after stat sourcing
6. **Case Study Single** — minimal fixes
7. **Insights Single** — minimal fixes (verify author, video)
8. **Contact Us** — after office-list reconciliation with Location Hub

That's a parallel-engineering-build path while the other eight designs (Residential Hub, Location Hub, Location Single, About, Mission, Insights Hub, Careers, plus the missing nine) get reworked or commissioned.

---

## Sources

- CLAUDE.md (project rulebook, §4 hard gates, §5 decision rules)
- /design/ProExteriors_Full_Sitemap.md (canonical IA, Apr 2026)
- /decisions/2026-04-25-architecture-astro-react-islands.md (architecture decision)
- /strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx sheet 05 (Y1 URL plan)
- Residential ProPlan Example Campaign.docx (Total Home Shield campaign brief, Path C)
- CleverWork-Property-First-Strategy.docx (Property First / Layer Cake thesis)
- Figma file `n8EC2AgOcubGyfEq7YJoiW` (16 design frames, nodes 9:4672–9:4687)

— Maren
