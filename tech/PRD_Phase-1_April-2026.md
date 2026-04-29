# Pro Exteriors Website — Phase 1 PRD

**Author:** Maren Solveig Castellan-Reyes, Senior Director, Website & Application Experience — AIA4 Pro Exteriors
**Date:** 2026-04-25
**Phase 1 Definition of Done:** 66-page Phase 0 minimum viable cohort, deployed live to `pc-demo.Cleverwork.io` by tomorrow morning, with brand placeholders, real architecture, and Kyle Roof Reverse Silo internal linking discipline baked in from the first commit.

> **Companion docs (read these too):**
> - `/tech/Build-Cycle-Walkthrough_Phase-1.md` — sequential Claude Code execution recipe
> - `/strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx` sheet 05 — canonical Y1 URL plan (Phase 0 = 66 pages)
> - `/design/ProExteriors_Full_Sitemap.md` — canonical IA spec
> - `/decisions/2026-04-25-architecture-astro-react-islands.md` — architectural decision rationale
> - `/design/Figma-Audit_April-2026.md` — design audit with P0/P1 fixes to apply during build

---

## 1. Mission

Build the architectural shell of the Pro Exteriors website — every template that governs Y1 URLs, every silo that compounds authority, every conversion path that earns retainer payment — and deploy it to a working demo URL by tomorrow morning. Brand polish and content fidelity (real stats, real testimonials, real photography) ship in Phase 2. Phase 1's job is to prove the build cycle works, that all 66 launch URLs render at green Core Web Vitals, that the schema contracts validate, that internal linking honors the silo containment rules, and that the team can iterate from this foundation to full Y1 (252 pages) by Month 12.

The 66 Phase 0 pages must be:
- Deployed at `pc-demo.Cleverwork.io` over HTTPS with a valid certificate
- Indexable by Google (production-grade `robots.txt` + sitemap.xml + per-route HTML)
- Lighthouse mobile ≥95 across Performance, Accessibility, Best Practices, SEO on every template
- Schema-valid against Google Rich Results Test on every template
- Wired to the Kyle Roof Reverse Silo internal linking rules with build-time enforcement

---

## 2. Tech Stack & Infrastructure

### Stack (locked — do not deviate)
| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Astro 4.x** | Static HTML by default, zero JS unless opted in via `client:*` directive |
| Interactivity | **React 18 islands** via `@astrojs/react` | For OfficeLocationsMap, forms, ROI calculator, address autocomplete |
| Styling | **Tailwind 3.x** + custom token layer | Utility-first, no CSS-in-JS |
| Content | **Sanity CMS** (preferred) + MDX-in-repo for legal/utility | Editorial flexibility for Pro Exteriors team; engineer-controlled for legal |
| Forms | Astro endpoints (`src/pages/api/lead.ts`) | Runs on the VPS Node runtime under Coolify |
| Analytics | **GA4 + PostHog** (PostHog source of truth for funnels) | Per CLAUDE.md §7 |
| A/B testing | **Statsig** (deferred to Phase 2) | Not in Phase 1 scope |
| Image pipeline | **sharp** at build time + lazy loading + responsive `srcset` | VPS-friendly; no external CDN dependency |
| Fonts | Self-hosted via `@fontsource/*` or `.woff2` in `public/fonts/` | No render-blocking Google Fonts CDN |
| Schema | `astro-seo` + custom JSON-LD generators | Build-time validated |
| Sitemap | `@astrojs/sitemap` integration | Auto-generated from build output |

### Infrastructure (assumed ready — confirmed 2026-04-25)
- **VPS:** provisioned, Coolify installed and configured
- **Domain:** `pc-demo.Cleverwork.io` DNS pointed to VPS, SSL active
- **Repository:** Git → push to `main` → Coolify auto-deploys
- **Build output:** static directory of `.html` files served by Caddy/Nginx (Coolify default)

### Coolify deployment config (referenced from PRD; live in `/coolify/` directory)
```yaml
# .coolify/config.yaml
build_command: npm ci && npm run build
publish_directory: dist
node_version: 20.x
environment_variables:
  - SANITY_PROJECT_ID
  - SANITY_DATASET=production
  - SANITY_API_TOKEN
  - PUBLIC_GA4_MEASUREMENT_ID
  - PUBLIC_POSTHOG_KEY
  - LEAD_WEBHOOK_URL  # CRM endpoint
  - SITE_URL=https://pc-demo.Cleverwork.io
```

### Production cutover (not Phase 1 scope)
- `pc-demo.Cleverwork.io` is the staging/demo domain
- `proexteriorsus.com` is the eventual production domain
- Cutover happens after client signoff; staging remains noindex via `X-Robots-Tag` header until cutover

---

## 3. Project Structure

```
pro-exteriors-website/
├── .coolify/
│   └── config.yaml
├── .github/
│   └── workflows/
│       ├── ci.yml              # Lighthouse + schema + link audits
│       └── deploy.yml          # Triggers Coolify webhook on main push
├── public/
│   ├── fonts/                  # Self-hosted .woff2 files
│   ├── images/                 # Optimized at build by sharp
│   ├── favicon.svg
│   ├── robots.txt              # Code-reviewed
│   └── _redirects              # Coolify edge redirects
├── sanity/
│   ├── schemas/                # CMS schema definitions
│   │   ├── service.ts
│   │   ├── city.ts
│   │   ├── subdivision.ts
│   │   ├── officeLocation.ts
│   │   ├── caseStudy.ts
│   │   ├── blogPost.ts
│   │   ├── pillar.ts
│   │   ├── testimonial.ts
│   │   ├── leadership.ts
│   │   └── careersPosting.ts
│   └── sanity.config.ts
├── src/
│   ├── components/
│   │   ├── atoms/              # Button, Stat, Badge, Input
│   │   ├── molecules/          # Card, FAQ, Testimonial, ServiceTile
│   │   ├── organisms/          # Hero, Header, Footer, ServiceGrid, CTABand
│   │   ├── islands/            # React components (.tsx)
│   │   │   ├── OfficeLocationsMap.tsx
│   │   │   ├── LeadForm.tsx
│   │   │   ├── ROICalculator.tsx
│   │   │   ├── AddressAutocomplete.tsx
│   │   │   └── BookingCalendar.tsx
│   │   └── seo/
│   │       ├── BaseLayout.astro
│   │       ├── SchemaJsonLd.astro
│   │       └── BreadcrumbList.astro
│   ├── content/                # MDX-in-repo for legal/utility
│   │   └── legal/
│   ├── lib/
│   │   ├── sanity.ts           # Client + GROQ queries
│   │   ├── schema/             # JSON-LD generators per template
│   │   ├── silo.ts             # Kyle Roof Silo enforcement utilities
│   │   ├── analytics.ts        # GA4 + PostHog event helpers
│   │   └── url.ts              # Canonical URL helpers
│   ├── pages/
│   │   ├── index.astro                                # /
│   │   ├── commercial-roofing/
│   │   │   ├── index.astro                            # /commercial-roofing/
│   │   │   ├── [service].astro                        # /commercial-roofing/[service]/
│   │   │   └── [city].astro                           # /commercial-roofing/[city]/
│   │   ├── residential-roofing/
│   │   │   ├── index.astro
│   │   │   ├── [service].astro
│   │   │   ├── [city].astro
│   │   │   └── [subdivision].astro                    # /residential-roofing/[subdivision-slug]/
│   │   ├── proplan/
│   │   │   ├── index.astro
│   │   │   └── [...slug].astro                        # tiers, roi-calculator, etc.
│   │   ├── total-home-shield/
│   │   │   ├── index.astro                            # Page 1: Awareness
│   │   │   ├── silent-killers.astro                   # Page 2: Agitation
│   │   │   ├── easy-button.astro                      # Page 3: Convenience
│   │   │   ├── claim-offer.astro                      # Page 4: Offer (form)
│   │   │   ├── last-call.astro                        # Page 5: Urgency
│   │   │   └── booking.astro                          # Booking Hub
│   │   ├── locations/
│   │   │   ├── index.astro
│   │   │   └── [office].astro                         # GBP destinations
│   │   ├── projects/
│   │   │   ├── index.astro
│   │   │   ├── [category].astro
│   │   │   └── [slug].astro
│   │   ├── blog/
│   │   │   ├── index.astro                            # Blog hub
│   │   │   ├── [pillar].astro                         # 13 pillar pages
│   │   │   └── [slug].astro                           # Supporter posts
│   │   ├── about/
│   │   │   ├── index.astro
│   │   │   ├── mission.astro
│   │   │   ├── leadership.astro
│   │   │   └── [...slug].astro
│   │   ├── careers/
│   │   │   ├── index.astro
│   │   │   └── [slug].astro
│   │   ├── contact/
│   │   │   ├── index.astro
│   │   │   ├── commercial.astro
│   │   │   ├── residential/
│   │   │   │   └── inspection.astro
│   │   │   └── emergency.astro
│   │   ├── thank-you/
│   │   │   ├── commercial.astro
│   │   │   └── residential.astro
│   │   ├── partners/
│   │   │   └── index.astro                            # Path C disclosure
│   │   ├── property-card/
│   │   │   ├── index.astro
│   │   │   ├── get-yours.astro
│   │   │   └── preview.astro
│   │   ├── portal.astro                               # SSO link-out
│   │   ├── privacy.astro
│   │   ├── terms.astro
│   │   ├── accessibility.astro
│   │   ├── 404.astro
│   │   └── api/
│   │       └── lead.ts                                # Form endpoint
│   ├── styles/
│   │   ├── tokens.css                                 # Design tokens (CSS variables)
│   │   └── global.css
│   └── env.d.ts
├── scripts/
│   ├── validate-schema.mjs                            # Schema.org JSON Schema validation
│   ├── audit-orphans.mjs                              # Internal-link audit
│   ├── audit-silo.mjs                                 # Kyle Roof containment enforcement
│   └── lighthouse-budget.mjs                          # Per-template Lighthouse runs
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. Information Architecture (Phase 0 = 66 URLs)

The full URL list is in `/strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx` sheet 05, Phase 0 rows. The 66 URLs cluster as:

| Cluster | URLs | Notes |
|---|---|---|
| Foundation hubs | 8 | `/`, `/commercial-roofing/`, `/residential-roofing/`, `/proplan/`, `/locations/`, `/about/`, `/blog/`, `/contact/` |
| GBP location pages | 6 | `/locations/dallas-hq/`, `/locations/fort-worth/`, `/locations/denver/`, `/locations/wichita/`, `/locations/kansas-city/`, `/locations/atlanta/` |
| Commercial money pages | 6 | TPO, EPDM, Metal, Flat Roof, Repair, Replacement under `/commercial-roofing/` |
| Residential money pages | 6 | Asphalt Shingles, Replacement, Inspection, Emergency, Metal, Storm Damage under `/residential-roofing/` |
| Tier-1 commercial cities | 4 | Dallas, Fort Worth, Plano, Frisco |
| Tier-1 residential cities | 4 | Dallas, Fort Worth, Highland Park, Southlake |
| Twin Creeks subdivision | 1 | `/residential-roofing/twin-creeks-allen/` |
| Conversion endpoints | 5 | Commercial form, Residential inspection, Emergency, 2 thank-you pages |
| About sub-pages | 3 | Mission, Leadership, Certifications |
| Blog | 8 | Hub + 2 pillars (commercial-roofing, residential-roofing) + 5 supporters |
| Total Home Shield Anchor funnel | 6 | Awareness, Agitation, Convenience, Offer, Urgency, Booking |
| Path C disclosure | 1 | `/partners/` |
| Careers | 1 | Hub only |
| Customer portal | 1 | SSO link-out page |
| Utility/legal | 7 | Privacy, Terms, Accessibility, Cookies, Sitemap.xml, robots.txt, 404 |
| **TOTAL** | **66** | |

Rule: every URL ships in Phase 1 with real content (placeholder copy where the brand pass hasn't run, but real structure, real schema, real internal linking). No "coming soon" pages.

---

## 5. Page Templates — Build Spec per Template

Each template has: URL pattern, schema contract, required sections, audit fixes baked in, island boundaries, performance budget. Templates govern between 1 and many URLs (a template like `service-detail` governs 12+ Phase 0 URLs across both verticals).

### 5.1 Template: `home`
- **URL:** `/`
- **Governs:** 1 URL
- **Schema:** `Organization`, `WebSite`, `LocalBusiness` (one per HQ + satellites in `Organization.location[]`), `BreadcrumbList`
- **Required sections:** Hero with H1 + dual-router CTA · Stats strip (placeholder, marked `data-todo="source-stats"`) · Dual-vertical card row (Commercial / Residential) · Service overview grid · `<OfficeLocationsMap />` React island (`client:visible`) · Featured case studies (3) · Testimonial · Blog post row (3 latest) · Bottom CTA · Footer
- **Audit fixes baked in:**
  - Stats strip uses `<Stat />` component with `source` prop required (placeholder shows `[Verify with Pro Exteriors]` overlay)
  - Add `<PropertyCardCallout />` component above bottom CTA (links to `/property-card/`)
  - "Ready to talk about your roof?" CTA → "Get the Pro Exteriors Property Card for your address"
- **Islands:** `OfficeLocationsMap` (`client:visible`), `LeadForm` (footer, `client:idle`)
- **JS budget:** ≤120 KB gzip
- **LCP target:** Hero image ≤80 KB, `<Image />` with `loading="eager"` and explicit dimensions

### 5.2 Template: `hub` (vertical hubs + Locations + Projects + Blog)
- **URLs:** `/commercial-roofing/`, `/residential-roofing/`, `/locations/`, `/projects/`, `/blog/`
- **Schema:** `CollectionPage`, `BreadcrumbList`, `ItemList` of children
- **Required sections:** Hero with H1 + sub-CTA · Stats strip (placeholder) · Service/child grid · Trust band (testimonials or logos) · Map (commercial + locations only) · FAQ · Bottom CTA
- **Audit fixes baked in:**
  - **Commercial Hub:** drop "Dallas" from H1; H1 reads "Commercial Roofing Contractor — Dallas to Atlanta and Beyond" or simply "Commercial Roofing Contractor"
  - **Residential Hub:** "Roof Damage? 48 Hours" card moves OUT of hero into a secondary "Need help fast?" strip below the fold; the dual hero cards become "Plan Your Replacement" + "Get a Free Inspection"
  - **Residential Hub:** keep the "Local Experts. Not 'Storm Chasers.'" line — it's the strongest brand positioning in the entire design set
  - **Locations Hub:** show all 6 offices (Richardson HQ, Euless, Greenwood Village/Denver, Wichita, KC, Atlanta with satellite icon)
  - **Locations Hub:** brand pass — replace any "RoofingPros" or "APEXROOFING" placeholder text with "Pro Exteriors"
  - **Blog Hub (Insights):** brand pass — replace placeholder brands; surface all 13 pillars in filter pill row; move "Storm Damage" pill to end of pill row (not equal weight to Commercial/Residential); replace fish-image placeholder featured article
- **Islands:** `OfficeLocationsMap` on Commercial Hub + Locations Hub (`client:visible`)
- **JS budget:** ≤120 KB gzip on map-bearing routes; 0 KB on others

### 5.3 Template: `service-detail`
- **URLs:** `/commercial-roofing/[service]/` (12 URLs), `/residential-roofing/[service]/` (11 URLs) — Phase 0 ships 6 commercial + 6 residential
- **Schema:** `Service` (with `provider` referencing the LocalBusiness from `home`), `BreadcrumbList`, `FAQPage` (when FAQs present)
- **Required sections:** Hero with H1 + service CTA · Engineering/value section · Why-Choose grid (6 benefits) · "Perfect for" use case grid · Process visualization · Project gallery (filtered to this service) · Featured case studies · FAQ · Cross-sell strip (siblings within same vertical only — containment) · Bottom CTA
- **Audit fixes baked in:**
  - H1 replaces hard-coded "Dallas" with templated `{{city.name | default: ""}}` — service pages without geography ship without the city modifier
  - "Perfect for Every Structure" use case tiles must align to the service (no "Residential" tile on a TPO page)
  - Cross-sell strip enforces containment — only siblings within the same vertical
  - **Path C disclosure:** if the service is `/residential-roofing/windows/` or `/residential-roofing/exterior-painting/` (not in Phase 0 but template-ready for Q3), surface partner-network attribution in body and `Service` schema
- **Islands:** `LeadForm` in CTA band (`client:idle`)
- **JS budget:** ≤80 KB gzip

### 5.4 Template: `city-detail` (commercial + residential variants)
- **URLs:** `/commercial-roofing/[city]/` (12 launch + Phase 0 has 4), `/residential-roofing/[city]/` (12 launch + Phase 0 has 4)
- **Schema:** `LocalBusiness` (city-scoped via `areaServed`), `Service`, `BreadcrumbList`, `FAQPage`
- **Required sections:** Hero with H1 (city + vertical) · Local trust band · Service grid (vertical-specific) · Completed work in this city · City-specific testimonials · Embedded city map with office pin · FAQ · Footer city links (siblings only) · Bottom CTA
- **Audit fixes baked in:**
  - Each city page ships with **unique copy** (CMS validation: `description` field must not match any other city page's hash)
  - **Each city page ships with unique project photos** (CMS validation: `projectGallery` cannot duplicate another city's gallery)
  - LocalBusiness schema's address points to the nearest physical office; `areaServed` is the city
  - Footer city-link row links only to siblings within the same vertical
- **Islands:** Embedded `<CityMap />` (a smaller variant of OfficeLocationsMap, scoped to one metro)
- **JS budget:** ≤100 KB gzip

### 5.5 Template: `subdivision-detail` (NEW in Phase 1)
- **URLs:** `/residential-roofing/[subdivision]/` — Phase 0 has 1 (Twin Creeks Allen)
- **Schema:** `LocalBusiness` (subdivision-scoped via `areaServed`), `Service`, `BreadcrumbList`, `FAQPage`
- **Required sections:** Hero with H1 (subdivision name + state) · HOA-aware copy ("Roofing in [Subdivision] — HOA-approved colors, contractor approval, architectural review timeline") · Hail history callout (date-specific events) · Pro Exteriors job markers ("We've served X homes in this subdivision") · Service grid · Property Card callout (links to `/property-card/` lead magnet) · Embedded subdivision map · FAQ · Bottom CTA
- **Audit fixes baked in / built fresh:**
  - This is a NEW template — no Figma reference; build to spec
  - Pull HOA data from Sanity `subdivision.hoaRules` field
  - Pull hail event history from Sanity `subdivision.hailHistory` field (placeholder for Phase 1: render "[Hail event data: TBD]")
  - "Neighbor served" markers: pull from `subdivision.servedJobs` field; Phase 1 placeholder
  - **Property First lens is required here** — this template is the strongest expression of place-memory in the IA
- **Islands:** `<SubdivisionMap />` showing subdivision boundary + Pro Exteriors-served addresses (placeholder pins for Phase 1)
- **JS budget:** ≤100 KB gzip

### 5.6 Template: `office-location` (GBP destination)
- **URLs:** `/locations/[office]/` — Phase 0 has 6
- **Schema:** `LocalBusiness` (anchored to this office), `BreadcrumbList`, `OpeningHoursSpecification`, `Service` (offered services)
- **Required sections:** Hero with office name + metro framing ("Pro Exteriors — Dallas/Fort Worth Metro from our Richardson, TX office") · Real address + NAP (must exactly match the GBP profile NAP) · Hours · Embedded map · Local team photos · Local project gallery · Local testimonials · "Two Doors" router (Commercial / Residential) · Bottom CTA
- **Audit fixes baked in:**
  - URL targets the metro; H1 names both metro and office address. Page leads: "Pro Exteriors serves the Dallas-Fort Worth metro from our Richardson office at 1778 N Plano Rd #118."
  - LocalBusiness schema uses the real Richardson address; `areaServed` includes the metro service area
  - GBP profile destination URL = this page's URL (one-to-one mapping)
  - Atlanta variant: clearly labeled as Service Area Only with distinct satellite icon — NO active GBP profile
- **Islands:** Map (`client:visible`)
- **JS budget:** ≤100 KB gzip

### 5.7 Template: `proplan`
- **URL:** `/proplan/` and sub-routes (`/proplan/tiers/`, `/proplan/roi-calculator/`, `/proplan/how-it-works/`, `/proplan/case-studies/`, `/proplan/enroll/`)
- **Schema:** `Service`, `Offer`, `BreadcrumbList`
- **Required sections:** Hero with H1 ("Turn Your Roof from a Liability into a Strategic Asset") · "Hidden Cost" agitation · "How ProPlan Works" 4-step · ROI Calculator (`<ROICalculator />` React island, `client:visible`) · Stakeholder cards (FM/PM/Owner) · Real testimonial · Bottom enrollment CTA
- **Audit fixes baked in:**
  - Stats sourced or marked TODO
  - Add Property Card callout linking to `/property-card/`
  - Sub-routes share template structure with route-specific hero copy
- **Islands:** `ROICalculator` (`client:visible`)
- **JS budget:** ≤150 KB gzip on `/proplan/roi-calculator/`; ≤100 KB elsewhere

### 5.8 Template: `campaign-landing` (Total Home Shield 5-page funnel)
- **URLs:** `/total-home-shield/`, `/total-home-shield/silent-killers/`, `/total-home-shield/easy-button/`, `/total-home-shield/claim-offer/`, `/total-home-shield/last-call/`
- **Schema:** `Service` (offer), `Offer`, `BreadcrumbList`
- **Required sections per page:** see `/uploads/Residential ProPlan Example Campaign.docx` for verbatim copy and structure
  - **Awareness** — soft hero, "Your Home's Best Defense" framing, soft CTA + accelerator link to `/claim-offer/`
  - **Agitation** — "Silent Killers" trio (Energy Vampires, Hidden Rot, Weak Links), accelerator link
  - **Convenience** — "Stop the Contractor Dance" framing, accelerator link
  - **Offer** — `<LeadForm />` ABOVE the fold, $997 credit framing, partner-network disclosure for windows/painting
  - **Urgency** — same form, loss-aversion framing
- **Audit fixes baked in / built fresh:**
  - These are NEW pages — no Figma reference; build to campaign-doc spec
  - **Path C disclosure mandatory** on Awareness, Convenience, and Offer pages (windows/painting are partner-fulfilled)
  - Forms post to `/api/lead.ts` with `campaign: "total-home-shield-anchor"` and `page: "[awareness|agitation|...]"` fields for attribution
- **Islands:** `LeadForm` on Offer + Urgency (`client:idle`)
- **JS budget:** ≤80 KB gzip per page

### 5.9 Template: `booking-hub` (Total Home Shield Booking)
- **URL:** `/total-home-shield/booking/`
- **Schema:** `ContactPage`, `Organization`
- **Required sections:** Hero "Success! Your $997 Credit is Active" · `<BookingCalendar />` React island (GoHighLevel/Calendly embed) · "On-site mandate" copy · "While You Wait" portfolio links to residential project galleries · AI agent expectation copy
- **Audit fixes baked in / built fresh:**
  - Replaces generic `/thank-you/residential/` for THS-funnel conversions
  - **Property First framing required:** copy must signal "Your home is now in our system permanently"
- **Islands:** `BookingCalendar` (`client:idle`)
- **JS budget:** ≤120 KB gzip
- **noindex:** required (post-conversion, Google should not crawl)

### 5.10 Template: `case-study-hub`
- **URL:** `/projects/`
- **Schema:** `CollectionPage`, `BreadcrumbList`, `ItemList`
- **Required sections:** Hero · Filter pills (industry / service / location / project) · Featured case study (large) · Secondary featured (3) · Grid of all case studies · Pagination
- **Audit fixes baked in:**
  - Filters are Astro-native (URL-param-driven), NOT a React island
  - Each case study card links to its `/projects/[slug]/` page
- **Islands:** none
- **JS budget:** 0 KB JS (Astro-native)

### 5.11 Template: `case-study-detail`
- **URL:** `/projects/[slug]/`
- **Schema:** `CaseStudy` (custom type via `CreativeWork`), `Article`, `BreadcrumbList`
- **Required sections:** Hero with project name · Project Overview (Challenge / Solution / Result) · Visual Transformation (before / during / after) · Technical Specifications · Testimonial quote with attribution · Related Case Studies (siblings only — containment)
- **Audit fixes baked in:**
  - Cross-sell strip enforces industry-category containment (a healthcare case study links only to other healthcare case studies)
  - Each project description must be unique copy (CMS validation)
- **Islands:** none
- **JS budget:** 0 KB JS

### 5.12 Template: `pillar` (blog pillar pages)
- **URLs:** `/blog/[pillar]/` — 13 total launch URLs; Phase 0 has 2 (commercial-roofing, residential-roofing)
- **Schema:** `CollectionPage`, `BreadcrumbList`, `ItemList` of supporting posts
- **Required sections:** Hero with pillar topic · Pillar intro (200-400 words) · Featured supporter post · Grid of all supporter posts in this silo · Sidebar (TOC of pillar topics, lead magnet, popular posts)
- **Audit fixes baked in:**
  - **Containment enforced:** pillar links only to its supporters; supporters link only back to pillar + siblings
  - "Storm Damage" pillar exists but is positioned at the end of the filter pill row (de-storm rule)
- **Islands:** none (search bar can be Astro-native or a small `client:idle` island)
- **JS budget:** ≤30 KB gzip if search island is added

### 5.13 Template: `blog-post` (supporter posts)
- **URLs:** `/blog/[slug]/` — 60-70 launch + ongoing; Phase 0 has 5
- **Schema:** `Article`, `BreadcrumbList`, `FAQPage` (when present), `Author` referencing `/about/leadership/[person]/`
- **Required sections:** Hero with article title + date + author + reading time · Featured image · Article body · Pull-quote callout · Optional video embed · Related Articles (silo siblings + parent pillar — NOT cross-silo) · Sidebar TOC
- **Audit fixes baked in:**
  - **Kyle Roof Reverse Silo enforcement** (see §6 below for full spec)
  - Related Articles widget is silo-aware: only pulls posts where `silo_target` matches OR `silo_target` is a sibling of the current post's `silo_target`
- **Islands:** none
- **JS budget:** 0 KB JS

### 5.14 Template: `about` + `leadership`
- **URLs:** `/about/`, `/about/mission/`, `/about/leadership/`, `/about/safety/`, `/about/certifications/`, `/about/pro-ministries/`, `/about/crews/`, `/about/warranty/`, `/about/press/`
- **Schema:** `AboutPage`, `Person` (for leadership)
- **Required sections (about hub):** Hero · Journey timeline · Mission/Values · Leadership preview (3 portraits) · Pro Ministries · Career CTA
- **Audit fixes baked in:**
  - Brand pass: replace "RoofingPros" / "APEXROOFING" placeholder branding with "Pro Exteriors" everywhere
  - Verify leadership names are real people (placeholder tag if not)
  - "Start Your Career at RoofingCo" CTA → "Build Your Career with Pro Exteriors"
- **Islands:** none
- **JS budget:** 0 KB JS

### 5.15 Template: `careers-hub` + `careers-posting`
- **URLs:** `/careers/` (hub), `/careers/[slug]/` (individual postings — Phase 1 deferred to Q1; Phase 0 has hub only)
- **Schema:** `JobPosting` on individual postings (with required fields: `title`, `description`, `datePosted`, `validThrough`, `hiringOrganization`, `jobLocation`)
- **Audit fixes baked in:**
  - Brand pass: "RoofingPros" → "Pro Exteriors"
  - Hero copy "Build Your Career with Pro Exteriors" — already correct in design body, fix masthead only
- **Islands:** none
- **JS budget:** 0 KB JS

### 5.16 Template: `contact-hub` + `contact-form` + `thank-you`
- **URLs:** `/contact/`, `/contact/commercial/`, `/contact/residential/inspection/`, `/contact/emergency/`, `/thank-you/commercial/`, `/thank-you/residential/`
- **Schema:** `ContactPage`, `Organization`
- **Required sections (contact hub):** Hero · Branched form (Commercial Inquiry + Residential Request side-by-side) · Phone/Email/Hours strip · Office Locations grid (all 6) · FAQ
- **Audit fixes baked in:**
  - Reconcile office list with Locations Hub: must show all 6 (Richardson, Euless, Greenwood Village/Denver, Wichita, KC, Atlanta-satellite)
  - Form validation, error states, success states implemented
  - Forms post to `/api/lead.ts` with `vertical: "commercial" | "residential"` field
- **Islands:** `LeadForm` (`client:idle`)
- **JS budget:** ≤80 KB gzip

### 5.17 Template: `partners` (Path C disclosure)
- **URL:** `/partners/`
- **Schema:** `AboutPage`, `Organization`
- **Required sections:** Hero "Pro Exteriors Partner Network" · Partner relationships explainer · QC standards · "Pro Exteriors-fulfilled vs Partner-fulfilled" matrix · One-point-of-contact promise · Partner-specific case study or two
- **NEW — built fresh in Phase 1.** No Figma reference. See `/strategy/Pro-Exteriors_GBP-and-Silo-Memo_April-2026.md` for the Path C strategic context.
- **Audit fix baked in:** Path C launch dependency — disclosure required at launch alongside Total Home Shield campaign
- **Islands:** none
- **JS budget:** 0 KB JS

### 5.18 Template: `property-card` (lead magnet flow — Q1 deliverable; Phase 0 ships hub + form skeleton)
- **URLs:** `/property-card/`, `/property-card/get-yours/`, `/property-card/preview/`
- **Schema:** `WebPage`, `Service`
- **Required sections:** Hero "Get the Pro Exteriors Property Card for your address" · Sample card visual (warm paper, typewriter type, navy SMS strip per Property First doc §6.1) · Address autocomplete form · Preview render (placeholder for Phase 1)
- **NEW — built fresh in Phase 1 as skeleton.** Sanity schema for Property Card data deferred to Q1; Phase 1 ships visual + form + placeholder backend.
- **Islands:** `AddressAutocomplete` (`client:visible`)
- **JS budget:** ≤120 KB gzip on get-yours

### 5.19 Template: `legal` (utility)
- **URLs:** `/privacy/`, `/terms/`, `/accessibility/`, `/cookies/`
- **Schema:** `WebPage` only — minimal
- **MDX-in-repo** content (no Sanity)
- **Audit fix:** none — placeholder MDX OK for Phase 1
- **JS budget:** 0 KB

### 5.20 Template: `error` (404, 500)
- **URLs:** `/404`, `/500`
- **Schema:** `WebPage`
- Branded 404 with primary nav links and search
- **Audit fix:** none — branded design

### 5.21 Template: `portal` (SSO link-out)
- **URL:** `/portal/`
- **Schema:** `WebPage`
- Architecture decision §1: Centerpoint SSO link-out, **not built locally**. This page is a redirect or minimal landing with the external login link.

---

## 6. Kyle Roof Reverse Silo — Internal Linking Discipline

This is the load-bearing SEO discipline. Mistakes here cost rankings for years. The rules are non-negotiable; the build pipeline enforces them.

### 6.1 Topology

```
                    [TARGET PAGE / MONEY PAGE]
                              ▲
                              │ (descriptive anchor)
            ┌─────────────────┼─────────────────┐
            │                 │                 │
       [Supporter A]    [Supporter B]    [Supporter C]
            │ ◄───────────────│ ◄───────────────│
            │                 │                 │
            │   (sibling links — descriptive    │
            │    anchor, contextual placement)  │
            └─────────────────┴─────────────────┘
```

- **Targets** are money pages (service-detail, city-detail, subdivision-detail, ProPlan)
- **Pillars** are blog hub pages (the 13 `/blog/[pillar]/` URLs) — Pillars are themselves Targets for their topic cluster
- **Supporters** are blog posts that link UP to their Pillar/Target and laterally to 1-2 silo siblings
- Each Supporter has exactly **1 link UP** + **1-2 links to siblings** = **2-3 internal silo links per supporter** in body content

### 6.2 Anchor text discipline

| Link direction | Anchor text rule | Example |
|---|---|---|
| Supporter → Target/Pillar | Descriptive keyword-rich anchor matching the Target's primary keyword | `<a href="/commercial-roofing/repair/">commercial roof repair</a>` |
| Supporter → Sibling | Descriptive contextual anchor | `<a href="/blog/tpo-seam-welding-explained/">how TPO seam welding works</a>` |
| Target → Supporter (down-link in "Related Reading") | Descriptive topic-specific anchor | `<a href="/blog/cost-of-tpo-roofing-2026/">2026 TPO roofing cost breakdown</a>` |

**Forbidden anchor text:** "click here" · "learn more" · "read more" · bare URL · brand-only anchor (e.g., "Pro Exteriors")

### 6.3 Containment rules (NON-NEGOTIABLE)

- Commercial body content links **only** to commercial pages
- Residential body content links **only** to residential pages
- Global nav and footer are the only cross-vertical bridges
- "Related Posts" widgets enforce silo membership at the data layer
- "Popular Posts" / "Trending" widgets are forbidden
- Author bio cross-linking that bridges silos is forbidden
- A supporter post cannot link to a different pillar's supporters in body

### 6.4 Sanity schema — silo enforcement at the data layer

```typescript
// sanity/schemas/blogPost.ts
export default {
  name: 'blogPost',
  type: 'document',
  fields: [
    { name: 'title', type: 'string', validation: Rule => Rule.required() },
    { name: 'slug', type: 'slug', source: 'title', validation: Rule => Rule.required() },
    { name: 'pillar', type: 'reference', to: [{ type: 'pillar' }], validation: Rule => Rule.required(),
      description: 'The pillar this post supports. CONTAINMENT: links to siblings within this pillar only.' },
    { name: 'silo_target', type: 'reference', to: [{ type: 'service' }, { type: 'pillar' }], validation: Rule => Rule.required(),
      description: 'The Target page this post passes equity to. EXACTLY ONE.' },
    { name: 'silo_siblings', type: 'array', of: [{ type: 'reference', to: [{ type: 'blogPost' }] }],
      validation: Rule => Rule.min(1).max(2),
      description: '1-2 sibling supporter posts within the same pillar. Sibling links rendered in body.' },
    { name: 'targetAnchorText', type: 'string', validation: Rule => Rule.required(),
      description: 'The keyword-rich anchor text used to link to the Target. Must match the Target\'s primary keyword.' },
    { name: 'body', type: 'array', of: [{ type: 'block' }] },
    { name: 'faq', type: 'array', of: [{ type: 'object', fields: [
      { name: 'question', type: 'string' },
      { name: 'answer', type: 'text' },
    ]}]},
  ]
}
```

### 6.5 Build-time silo enforcement

`scripts/audit-silo.mjs` runs in CI and fails the build if any of the following are true:

```javascript
// Pseudo-code for audit-silo.mjs
for (const post of allBlogPosts) {
  // RULE 1: Each post has exactly 1 target link in body
  const targetLinks = countLinks(post.body, post.silo_target.url)
  if (targetLinks !== 1) FAIL(`${post.slug}: must have exactly 1 link to silo_target, found ${targetLinks}`)

  // RULE 2: Each post has 1-2 sibling links in body
  const siblingLinks = countLinksToAny(post.body, post.silo_siblings.map(s => s.url))
  if (siblingLinks < 1 || siblingLinks > 2) FAIL(`${post.slug}: must have 1-2 sibling links, found ${siblingLinks}`)

  // RULE 3: No cross-silo body links (containment)
  const crossSiloLinks = post.body.allLinks().filter(link => {
    const target = resolveLink(link.href)
    return target && target.silo !== post.pillar.silo // commercial vs residential vs proplan
  })
  if (crossSiloLinks.length > 0) FAIL(`${post.slug}: cross-silo body links forbidden, found: ${crossSiloLinks}`)

  // RULE 4: No forbidden anchor text
  const forbiddenAnchors = ['click here', 'learn more', 'read more', post.title]
  for (const link of post.body.allLinks()) {
    if (forbiddenAnchors.some(forbidden => link.anchorText.toLowerCase().includes(forbidden))) {
      FAIL(`${post.slug}: forbidden anchor text "${link.anchorText}" on link to ${link.href}`)
    }
  }

  // RULE 5: Every Target page has at least 5 inbound silo links
  // (Targets need 5-7 supporters per Kyle Roof spec)
}

for (const target of allTargets) {
  const inboundSiloLinks = allBlogPosts.filter(p => p.silo_target.url === target.url)
  if (inboundSiloLinks.length < 5) WARN(`${target.url}: only ${inboundSiloLinks.length} inbound supporters; Kyle Roof spec is 5-7`)
}
```

### 6.6 "Related Posts" widget — silo-aware

```astro
---
// src/components/molecules/RelatedPosts.astro
import { getRelatedSiloPosts } from '../../lib/silo'

const { currentPost } = Astro.props
const related = await getRelatedSiloPosts(currentPost) // returns siblings within same pillar
---
<section aria-labelledby="related-heading">
  <h2 id="related-heading">Related Reading</h2>
  <ul>
    {related.map(post => (
      <li>
        <a href={post.url}>{post.targetAnchorText || post.title}</a>
      </li>
    ))}
  </ul>
</section>
```

```typescript
// src/lib/silo.ts
export async function getRelatedSiloPosts(currentPost) {
  // Returns ONLY siblings within the same pillar
  // No cross-silo, no popular-posts, no editor-curated lists
  const siblings = await sanity.fetch(`*[_type == "blogPost" && pillar._ref == $pillar && _id != $current]`, {
    pillar: currentPost.pillar._ref,
    current: currentPost._id
  })
  return siblings.slice(0, 3) // max 3 related posts
}
```

### 6.7 Containment validator — commercial vs residential vs proplan

A second build-time check ensures that no body link bridges verticals:

```javascript
// scripts/audit-orphans.mjs (extended for containment)
const VERTICAL_PATHS = {
  commercial: '/commercial-roofing/',
  residential: '/residential-roofing/',
  proplan: '/proplan/',
  total_home_shield: '/total-home-shield/',
  brand: ['/about/', '/contact/', '/locations/', '/projects/', '/blog/'],
}

function getVertical(url) {
  if (url.startsWith('/commercial-roofing/')) return 'commercial'
  if (url.startsWith('/residential-roofing/')) return 'residential'
  if (url.startsWith('/proplan/')) return 'proplan'
  if (url.startsWith('/total-home-shield/')) return 'total_home_shield'
  return 'brand'
}

for (const page of allPages) {
  const pageVertical = getVertical(page.url)
  if (pageVertical === 'brand') continue // brand pages link anywhere

  for (const link of page.bodyLinks) {
    const linkVertical = getVertical(link.href)
    if (linkVertical !== 'brand' && linkVertical !== pageVertical) {
      FAIL(`Cross-vertical body link in ${page.url}: ${link.href} (${pageVertical} → ${linkVertical})`)
    }
  }
}
```

### 6.8 Phase 1 silo seeding

For Phase 0's 5 supporter posts, the silo wiring is:

| Supporter URL | Pillar | silo_target | targetAnchorText | siblings |
|---|---|---|---|---|
| `/blog/tpo-vs-epdm-vs-pvc/` | `/blog/commercial-roofing/` | `/commercial-roofing/tpo/` | "TPO roofing systems" | (refers to other supporters once they exist) |
| `/blog/commercial-roof-repair-vs-replacement/` | `/blog/commercial-roofing/` | `/commercial-roofing/repair/` | "commercial roof repair" | tpo-vs-epdm-vs-pvc |
| `/blog/how-much-does-a-roof-replacement-cost/` | `/blog/residential-roofing/` | `/residential-roofing/replacement/` | "residential roof replacement" | architectural-vs-3-tab-shingles |
| `/blog/architectural-vs-3-tab-shingles/` | `/blog/residential-roofing/` | `/residential-roofing/asphalt-shingles/` | "asphalt shingle roofing" | how-much-does-a-roof-replacement-cost |
| `/blog/best-time-of-year-to-replace-your-roof/` | `/blog/residential-roofing/` | `/residential-roofing/replacement/` | "residential roof replacement" | how-much-does-a-roof-replacement-cost |

Phase 1 ships with these 5 posts honoring the silo. Q1's blog supporter expansion (per sheet 05) fills out each Target to 5-7 supporters as the canonical silo target.

---

## 7. SVG Office Locations Map — Component Spec

### 7.1 Where it deploys

| Page | Map variant | Hydration |
|---|---|---|
| `/` (Home) | National with all 6 office pins + active states highlighted | `client:visible` |
| `/commercial-roofing/` (Commercial Hub) | National with all 6 offices | `client:visible` |
| `/residential-roofing/` (Residential Hub) | Smaller variant — DFW + Denver + KC focus (residential markets) | `client:visible` |
| `/locations/` (Locations Hub) | Full interactive map — primary CTA on the page | `client:visible` |
| `/locations/[office]/` | Metro-zoomed variant pinning the specific office | `client:visible` |
| `/about/` | Optional national map showing reach | `client:visible` |
| `/commercial-roofing/[city]/` | City-zoomed variant | `client:visible` |
| `/residential-roofing/[city]/` | City-zoomed variant | `client:visible` |
| `/residential-roofing/[subdivision]/` | Subdivision-zoomed variant with HOA boundary | `client:visible` |

Map does NOT deploy on: service-detail, case-study pages, blog posts, About sub-pages, Contact (uses static office grid), Careers, Portal, legal/utility.

### 7.2 Component contract

```typescript
// src/components/islands/OfficeLocationsMap.tsx
export interface MapProps {
  variant: 'national' | 'metro' | 'city' | 'subdivision'
  activeStates?: string[]            // e.g., ["TX", "KS", "CO", "GA", "NC", "MO"]
  licensedStates?: string[]          // e.g., ["LA", "SC", "OK", "NE", ...]
  highlightOffice?: string           // for metro/city variants — slug of office to highlight
  zoomTarget?: { lat: number, lng: number, radius_miles: number }
  servedAddresses?: Array<{ lat: number, lng: number, status: 'served' | 'estimated' | 'inquiry' }>
                                     // for subdivision variant
}

export default function OfficeLocationsMap(props: MapProps) {
  // SSR-rendered fallback list ALWAYS ships in HTML for crawlers
  // Map loads client:visible after parse
}
```

### 7.3 SSR fallback (REQUIRED — crawlers see every state and every office)

```astro
---
// In any Astro page using the map:
import OfficeLocationsMap from '../components/islands/OfficeLocationsMap.tsx'

const offices = [
  { name: "Richardson, TX (HQ)", url: "/locations/dallas-hq/", state: "TX", type: "headquarters" },
  { name: "Euless, TX", url: "/locations/fort-worth/", state: "TX", type: "branch" },
  { name: "Greenwood Village, CO", url: "/locations/denver/", state: "CO", type: "branch" },
  { name: "Wichita, KS", url: "/locations/wichita/", state: "KS", type: "branch" },
  { name: "Kansas City, MO", url: "/locations/kansas-city/", state: "MO", type: "branch" },
  { name: "Atlanta, GA", url: "/locations/atlanta/", state: "GA", type: "satellite" },
]
---

<OfficeLocationsMap client:visible variant="national" activeStates={["TX","KS","CO","GA","MO"]} />

<!-- SSR FALLBACK — crawlers see this regardless of JS -->
<ul class="locations-fallback">
  {offices.map(office => (
    <li>
      <a href={office.url}>{office.name}</a>
      <span class="office-type" data-type={office.type}>{office.type}</span>
    </li>
  ))}
</ul>
```

### 7.4 Asset

A custom SVG of the contiguous 48 US states with state-level click targets. Layered with: state fill (active vs licensed vs no-coverage), office pins (4 distinct icons: HQ, branch, regional, satellite), zoom controls, popover on click.

For Phase 1: ship a placeholder SVG with all 6 office pins and active state highlighting. Visual polish in Phase 2.

---

## 8. Brand & Design Tokens (Phase 1 Placeholder)

Phase 1 uses a neutral placeholder palette. Phase 2 brand pass replaces tokens with actual Pro Exteriors brand assets.

### 8.1 Colors (CSS variables in `src/styles/tokens.css`)

```css
:root {
  /* Brand placeholders — replaced in Phase 2 */
  --color-brand-primary: #1F2937;       /* Navy — slate-800 */
  --color-brand-accent: #DC2626;        /* Red — accent CTA */
  --color-brand-bg: #FFFFFF;
  --color-brand-bg-alt: #F9FAFB;        /* gray-50 */
  --color-brand-text: #111827;          /* gray-900 */
  --color-brand-text-muted: #6B7280;    /* gray-500 — DO NOT use for body copy, contrast 3.0:1 */
  --color-brand-text-secondary: #374151; /* gray-700 — use for secondary body, contrast 9.3:1 */

  /* Semantic tokens */
  --color-success: #059669;
  --color-warning: #D97706;
  --color-error: #DC2626;
  --color-info: #2563EB;
}
```

### 8.2 Typography

```css
:root {
  /* Phase 1: Inter for body, Inter for headings (placeholder) */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-display: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;

  /* Type scale */
  --text-xs: 0.75rem;     /* 12px — micro copy, captions */
  --text-sm: 0.875rem;    /* 14px — secondary body */
  --text-base: 1rem;      /* 16px — body */
  --text-lg: 1.125rem;    /* 18px — lead paragraphs */
  --text-xl: 1.25rem;     /* 20px — H4, callouts */
  --text-2xl: 1.5rem;     /* 24px — H3 */
  --text-3xl: 1.875rem;   /* 30px — H2 */
  --text-4xl: 2.25rem;    /* 36px — H2 mobile, H1 mobile */
  --text-5xl: 3rem;       /* 48px — H1 desktop */
  --text-6xl: 3.75rem;    /* 60px — Hero H1 desktop */
}
```

### 8.3 Photo discipline

- Real Pro Exteriors photography only — never stock "diverse smiling team in hard hats"
- For Phase 1 with placeholder content: use generic-professional placeholder photos clearly tagged `data-todo="real-photo-pe"` so Phase 2 brand pass can find and replace
- Hero images: ≤80 KB optimized, `loading="eager"`, explicit `width` and `height` to prevent CLS
- Body images: lazy-loaded, `srcset` for responsive, AVIF + WebP fallback to JPEG

### 8.4 Logo

- For Phase 1: text-only "Pro Exteriors" wordmark in `--font-display`, `--text-xl`, `--color-brand-primary`
- Phase 2 swap: `<img src="/images/logo-pro-exteriors.svg" alt="Pro Exteriors" />`

---

## 9. SEO & Schema

### 9.1 Schema-by-template (already detailed in §5; summary table)

| Template | JSON-LD types |
|---|---|
| home | Organization, WebSite, LocalBusiness, BreadcrumbList |
| hub | CollectionPage, BreadcrumbList, ItemList |
| service-detail | Service, BreadcrumbList, FAQPage |
| city-detail / subdivision-detail | LocalBusiness (city/sub-scoped), Service, BreadcrumbList, FAQPage |
| office-location | LocalBusiness, OpeningHoursSpecification, Service, BreadcrumbList |
| proplan + sub-routes | Service, Offer, BreadcrumbList |
| campaign-landing (THS) | Service, Offer, BreadcrumbList |
| booking-hub | ContactPage, Organization (noindex) |
| case-study-hub | CollectionPage, BreadcrumbList, ItemList |
| case-study-detail | CaseStudy via CreativeWork, Article, BreadcrumbList |
| pillar | CollectionPage, BreadcrumbList, ItemList |
| blog-post | Article, BreadcrumbList, FAQPage, Author Person |
| about / leadership | AboutPage, Person |
| careers-posting | JobPosting (required: title, description, datePosted, validThrough, hiringOrganization, jobLocation) |
| contact-hub | ContactPage, Organization |
| partners | AboutPage, Organization |
| property-card | WebPage, Service |
| legal | WebPage |
| portal | WebPage |
| 404/500 | WebPage |

### 9.2 Schema validation

```bash
# scripts/validate-schema.mjs runs in CI on every URL in dist/
node scripts/validate-schema.mjs

# Each page's <script type="application/ld+json"> block parsed,
# validated against schema.org JSON Schema definitions,
# then submitted to Google Rich Results Test API on staging pre-launch.
# CI fails build if any required field is missing.
```

### 9.3 sitemap.xml + robots.txt

```javascript
// astro.config.mjs
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://pc-demo.Cleverwork.io',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/thank-you/') && !page.includes('/portal/') && !page.includes('/booking/'),
      lastmod: new Date(),
    })
  ]
})
```

```txt
# public/robots.txt
User-agent: *
Allow: /
Disallow: /portal/
Disallow: /thank-you/
Disallow: /api/

Sitemap: https://pc-demo.Cleverwork.io/sitemap-index.xml
```

For staging-only: add `X-Robots-Tag: noindex` header at the Coolify/Caddy edge until production cutover.

### 9.4 Canonical URLs

Every page emits a self-referencing canonical:
```html
<link rel="canonical" href="https://pc-demo.Cleverwork.io/commercial-roofing/tpo/" />
```

### 9.5 Indexability gates (per architecture decision §1)

CI fails the build if any of these fail on any URL:
- `<title>` exists, unique, 30-60 chars
- `<meta name="description">` exists, unique, 120-160 chars
- `<link rel="canonical">` exists
- Open Graph + Twitter Card tags present
- At least one schema.org JSON-LD block per page
- H1 is unique (extracted via curl + grep, asserted unique across corpus)
- No `<meta name="robots" content="noindex">` on production-eligible routes (allow-list: thank-you, portal, booking)

---

## 10. Forms & Lead Routing

### 10.1 Form endpoint

```typescript
// src/pages/api/lead.ts
import type { APIRoute } from 'astro'
import { z } from 'zod'

const LeadSchema = z.object({
  vertical: z.enum(['commercial', 'residential', 'proplan', 'total-home-shield']),
  formType: z.enum(['inquiry', 'inspection', 'emergency', 'rfq', 'campaign-anchor', 'campaign-seasonal']),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s\-\(\)]+$/),
  // Vertical-specific fields
  companyName: z.string().optional(),       // commercial only
  facilityType: z.string().optional(),      // commercial only
  address: z.string().optional(),           // residential + property-card only
  message: z.string().max(2000).optional(),
  // Hidden tracking fields
  page: z.string(),
  campaign: z.string().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional(),
})

export const POST: APIRoute = async ({ request }) => {
  const data = LeadSchema.parse(await request.json())

  // Forward to CRM webhook (HubSpot or Salesforce)
  await fetch(import.meta.env.LEAD_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  // Fire Slack webhook for emergency leads
  if (data.formType === 'emergency') {
    await fetch(import.meta.env.SLACK_EMERGENCY_WEBHOOK, {
      method: 'POST',
      body: JSON.stringify({ text: `EMERGENCY LEAD: ${data.firstName} ${data.lastName} — ${data.phone}` }),
    })
  }

  return new Response(JSON.stringify({ success: true, redirectTo: `/thank-you/${data.vertical}/` }))
}
```

### 10.2 LeadForm React island

```tsx
// src/components/islands/LeadForm.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
// ... uses LeadSchema from /api/lead.ts
```

### 10.3 Fields by form type (audit fix: progressive disclosure on RFQ)

| Form | Fields |
|---|---|
| residential inspection | firstName, lastName, email, phone, address |
| residential emergency | firstName, phone, address (only — minimal friction) |
| commercial RFQ | companyName, contactName, email, phone, facilityType, approxSqFt, projectTimeline, message |
| total-home-shield-anchor | firstName, lastName, email, phone, bestTimeToCall |
| property-card-getYours | firstName, lastName, email, phone, address (with autocomplete) |

---

## 11. Analytics & Measurement

### 11.1 GA4 + PostHog setup

```html
<!-- src/components/seo/AnalyticsHead.astro — included in BaseLayout <head> -->
<!-- GA4 -->
<script async src={`https://www.googletagmanager.com/gtag/js?id=${import.meta.env.PUBLIC_GA4_MEASUREMENT_ID}`}></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', import.meta.env.PUBLIC_GA4_MEASUREMENT_ID);
</script>

<!-- PostHog -->
<script>
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){...
  posthog.init(import.meta.env.PUBLIC_POSTHOG_KEY, { api_host: 'https://app.posthog.com' })
</script>
```

### 11.2 Conversion goals (defined BEFORE pages ship per CLAUDE.md §4)

| Goal | Trigger | Value | Hypothesis |
|---|---|---|---|
| residential_inspection_lead | POST /api/lead.ts with formType=inspection AND vertical=residential, redirect to thank-you/residential | $200 | Reduce friction on inspection form increases lead volume; benchmark: 2-4% page-to-lead conversion |
| commercial_rfq_lead | POST /api/lead.ts with formType=rfq | $1500 | Progressive disclosure on RFQ (show fewer fields initially) increases qualified-lead rate |
| ths_anchor_offer_signup | POST /api/lead.ts with campaign=total-home-shield-anchor | $300 | $997-credit anchor + Trojan Horse increases past-customer reactivation |
| property_card_request | POST /api/lead.ts with formType=property-card | $50 | Property Card lead magnet drives top-of-funnel awareness; goal is volume not value |
| proplan_assessment_request | POST /api/lead.ts with vertical=proplan | $1000 | Strategic-asset framing converts FM/PM/Owner audience |
| phone_call_click | Click on `tel:` link | $300 | Click-to-call from mobile is the highest-intent action |
| emergency_form_submit | POST /api/lead.ts with formType=emergency | $500 | 48-hour response guarantee increases urgent-leak conversions |

### 11.3 Event spec (events fired on every page interaction)

```typescript
// src/lib/analytics.ts
export function trackEvent(name: string, properties?: Record<string, any>) {
  if (typeof window === 'undefined') return
  window.gtag?.('event', name, properties)
  window.posthog?.capture(name, properties)
}

// Usage in components:
// trackEvent('cta_click', { cta: 'request-inspection', page: '/residential-roofing/replacement/' })
```

Required event taxonomy:
- `page_view` — auto on every Astro page (via Astro Analytics integration)
- `cta_click` — every primary CTA, with `{ cta: string, page: string, position: 'hero' | 'midbody' | 'footer' }`
- `form_start` — fired on first focus into any form field
- `form_submit_attempt` — fired on submit click (before validation)
- `form_submit_success` — fired on successful POST /api/lead.ts response
- `form_submit_error` — fired on validation or server error
- `phone_call_click` — `tel:` link click
- `accelerator_link_click` — Total Home Shield "skip to offer" links
- `external_link_click` — outbound link clicks
- `silo_link_click` — internal silo link clicks (instruments Kyle Roof linking)
- `roi_calculator_complete` — ProPlan ROI calculator inputs submitted
- `address_autocomplete_select` — Property Card address selected

---

## 12. Performance Budgets (CI-Enforced)

### 12.1 Per-template budgets

| Template | LCP | CLS | INP | JS gzip | Total page weight |
|---|---|---|---|---|---|
| home | <1.5s | <0.05 | <200ms | ≤120 KB | ≤500 KB |
| hub | <1.5s | <0.05 | <200ms | ≤120 KB | ≤500 KB |
| service-detail | <1.5s | <0.05 | <200ms | ≤80 KB | ≤400 KB |
| city-detail / subdivision-detail | <1.5s | <0.05 | <200ms | ≤100 KB | ≤450 KB |
| office-location | <1.5s | <0.05 | <200ms | ≤100 KB | ≤450 KB |
| proplan + roi-calculator | <1.8s | <0.05 | <200ms | ≤150 KB | ≤500 KB |
| campaign-landing (THS) | <1.5s | <0.05 | <200ms | ≤80 KB | ≤400 KB |
| booking-hub | <1.8s | <0.05 | <200ms | ≤120 KB | ≤500 KB |
| case-study-hub | <1.5s | <0.05 | <200ms | 0 KB | ≤400 KB |
| case-study-detail | <1.5s | <0.05 | <200ms | 0 KB | ≤500 KB |
| pillar / blog-post | <1.5s | <0.05 | <200ms | 0 KB (≤30 KB if search) | ≤350 KB |
| about / leadership | <1.5s | <0.05 | <200ms | 0 KB | ≤350 KB |
| contact-hub | <1.5s | <0.05 | <200ms | ≤80 KB | ≤400 KB |

### 12.2 CI Lighthouse runs

```yaml
# .github/workflows/ci.yml — abbreviated
- name: Run Lighthouse on all templates
  run: |
    npm run build
    npx lighthouse-ci collect --url=http://localhost:3000/ --url=http://localhost:3000/commercial-roofing/ ...
    npx lighthouse-ci assert --preset=lighthouse:no-pwa
  env:
    LHCI_BUDGET_PATH: ./lighthouse-budgets.json
```

```json
// lighthouse-budgets.json — abbreviated
{
  "assertions": {
    "categories:performance": ["error", { "minScore": 0.95 }],
    "categories:accessibility": ["error", { "minScore": 1.00 }],
    "categories:best-practices": ["error", { "minScore": 1.00 }],
    "categories:seo": ["error", { "minScore": 1.00 }],
    "largest-contentful-paint": ["error", { "maxNumericValue": 1500 }],
    "cumulative-layout-shift": ["error", { "maxNumericValue": 0.05 }],
    "total-byte-weight": ["error", { "maxNumericValue": 500000 }]
  }
}
```

---

## 13. Accessibility (WCAG 2.2 AA)

### 13.1 Color contrast (already enforced via design tokens)

- Body copy on white/off-white: minimum 4.5:1 — token `--color-brand-text` (#111827) gives 19.0:1, `--color-brand-text-secondary` (#374151) gives 9.3:1 — both pass
- Secondary copy `--color-brand-text-muted` (#6B7280) is 4.6:1 on white but 3.6:1 on `--color-brand-bg-alt`. **DO NOT use --color-brand-text-muted on the alt background.** Audit fix: enforce in tokens.css with comments.
- Large text (≥18px or ≥14px bold): minimum 3.0:1
- UI components and graphical objects: minimum 3.0:1

### 13.2 Tap targets

- Primary CTAs: minimum 44×44px
- Secondary actions: minimum 32×32px (only for non-critical interactions)
- Spacing between adjacent targets: minimum 8px

### 13.3 Keyboard navigation

- Every interactive element keyboard-reachable in a logical tab order
- Visible focus state on every interactive element (focus ring)
- Skip-to-main-content link in header (visible on focus)
- Modal/drawer focus traps

### 13.4 Screen reader

- Every image has alt text (decorative images use `alt=""`)
- Every form field has an associated label (`<label for="...">`)
- Heading hierarchy is correct (single H1, no skipped levels)
- Landmarks: `<main>`, `<nav>`, `<aside>`, `<footer>` present per page
- ARIA used sparingly and correctly (most a11y is solved by semantic HTML)

### 13.5 CI checks

```bash
# scripts/audit-a11y.mjs runs Pa11y or axe-core against every URL in dist/
node scripts/audit-a11y.mjs
```

---

## 14. Audit Fix Punch List — Phase 1 P0 only

These fixes are baked into the page templates (§5 above). Reproduced here as a reference checklist for QA.

| Fix | Pages affected | How it's applied |
|---|---|---|
| Brand pass: replace "RoofingPros" / "APEXROOFING" with "Pro Exteriors" | Locations Hub, About, Insights Hub, Careers | All templates use `<BaseLayout>` which pulls brand from `tokens.css`; agency template strings are forbidden via build check |
| Stat sourcing | All hub templates, ProPlan, Mission, About | `<Stat />` component requires `source` prop; placeholder mode uses `data-todo="source-stats"` overlay |
| Property First hooks | Home, Residential Hub, ProPlan, Subdivision pages | `<PropertyCardCallout />` component placed at strategic points |
| Move "Roof Damage 48 Hours" out of Residential Hub hero | Residential Hub | Template structure: hero is dual-router (Plan / Inspection), urgent-leak path lives below as "Need help fast?" strip |
| Location Hub office count: 3 → 6 | Locations Hub | Sanity content: 6 office records seeded; map renders all 6 |
| Storm Damage filter pill repositioning | Insights Hub | Filter pill order enforced in pillar metadata; Storm Damage is index 13 not index 1 |
| Service template "Dallas" hard-code → templated | Service Detail | `{{city.name}}` Liquid-style variable in H1; if no city context, no city modifier |
| Insights Hub fish-image placeholder | Insights Hub | Featured article uses a TODO-marked generic image |
| Path C disclosure | THS Anchor funnel pages, /partners/, future windows/painting service pages | Disclosure component `<PartnerNetworkDisclosure />` placed inline in body of each affected page |

---

## 15. Phase 1 vs Phase 2+ Backlog

**Ships in Phase 1 (tomorrow morning):**
- All 66 Phase 0 URLs deployed at pc-demo.Cleverwork.io
- All 23 page templates implemented
- Schema validates on every URL
- Internal silo linking enforced
- Forms wired to /api/lead.ts
- Analytics fired
- Lighthouse green on every template
- SVG map deployed on the 9 pages where it makes sense

**Phase 2 (week 1-2 after Phase 1):**
- Real Pro Exteriors brand assets (logo SVG, fonts, colors)
- Real photography pass replacing placeholder TODOs
- Real stats sourced and replacing placeholder values
- Real testimonials replacing placeholder quotes
- Real leadership names + portraits

**Phase 3 (Q1, weeks 3-12):**
- Per sheet 05 Q1 entries: remaining T1 launch cohort (~65 more URLs to reach ~115 total)
- Total Home Shield seasonal campaigns (Spring Showers + Beat the Heat)
- ProPlan sub-pages full content
- All 13 blog pillars + initial supporter cluster

---

## 16. Open questions & assumptions

1. **CRM endpoint:** assumed `LEAD_WEBHOOK_URL` resolves to a HubSpot or Salesforce webhook. Confirm before Phase 1 launch — fallback for tomorrow demo: log-and-email via SendGrid.
2. **Sanity project:** assumed a Sanity project exists or can be created during build cycle Step 3. If not, Phase 1 ships with MDX-in-repo for all content.
3. **Real photos for placeholder pass:** assumed neutral construction-stock photography is acceptable as TODO placeholders; Phase 2 brand pass replaces.
4. **Atlanta GBP:** confirmed as Service Area Only — `/locations/atlanta/` page exists but the GBP profile is satellite, no full GBP profile.
5. **Production cutover:** Phase 1 ships to pc-demo.Cleverwork.io; production cutover to proexteriorsus.com is a separate workstream after client signoff.

---

## Sources

- `/decisions/2026-04-25-architecture-astro-react-islands.md` — architectural rationale
- `/design/ProExteriors_Full_Sitemap.md` — canonical IA
- `/strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx` sheet 05 — Y1 URL plan with phase + month assignments
- `/design/Figma-Audit_April-2026.md` — design audit and audit fix list
- `/strategy/Pro-Exteriors_GBP-and-Silo-Memo_April-2026.md` — Reverse Silo strategy memo
- CleverWork Property First Strategy doc (referenced in this PRD)
- Residential ProPlan Example Campaign doc (referenced in this PRD)
- CLAUDE.md operating rulebook §4 (hard gates), §5 (decision rules), §7 (tech stack defaults)
- Kyle Roof Reverse Silo SEO methodology (industry reference)

— Maren
