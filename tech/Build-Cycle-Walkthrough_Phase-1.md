# Pro Exteriors Phase 1 — Build Cycle Walkthrough

**Companion to:** `/tech/PRD_Phase-1_April-2026.md` (read PRD first)
**Target:** 66-page Phase 0 cohort live at `pc-demo.Cleverwork.io` by tomorrow morning
**How to use this:** each step is sized for one Claude Code session. Open Claude Code, paste the step's prompt, let it execute, verify the acceptance criteria, then move to the next step. Steps marked **[parallelizable]** can be run by multiple agent teams concurrently.

---

## Execution overview

```
Phase 1A — Foundation (sequential, ~2 hours, single agent)
├── Step 1: Initialize Astro repo + dependencies
├── Step 2: Configure Tailwind + design tokens
├── Step 3: Configure Sanity (or MDX fallback)
├── Step 4: Build BaseLayout with header + footer + nav
├── Step 5: Build component library (atoms + molecules)
├── Step 6: Build React island components
└── Step 7: Build schema generator library

Phase 1B — Templates (parallel, ~4 hours, 4-6 agent teams)
├── Step 8a [parallelizable]: Hub templates (5 templates)
├── Step 8b [parallelizable]: Detail templates (8 templates)
├── Step 8c [parallelizable]: Campaign templates (THS funnel + Booking)
├── Step 8d [parallelizable]: Trust + Conversion templates
└── Step 8e [parallelizable]: Utility templates

Phase 1C — Page instances (parallel, ~3 hours, 6-8 agent teams)
├── Step 9a [parallelizable]: Foundation hubs (8 pages)
├── Step 9b [parallelizable]: Commercial silo (6 services + 4 cities)
├── Step 9c [parallelizable]: Residential silo (6 services + 4 cities + Twin Creeks)
├── Step 9d [parallelizable]: ProPlan + THS funnel (12 pages)
├── Step 9e [parallelizable]: Locations + Conversion (11 pages)
├── Step 9f [parallelizable]: Blog seed + About (8 pages)
└── Step 9g [parallelizable]: Utility/legal (7 pages)

Phase 1D — Wire-up + deploy (sequential, ~1.5 hours, single agent)
├── Step 10: Internal linking enforcement
├── Step 11: Form endpoint + lead routing
├── Step 12: Analytics + measurement
├── Step 13: SEO foundation (sitemap, robots, canonicals)
├── Step 14: Performance + a11y CI gates
├── Step 15: Build + deploy to Coolify
└── Step 16: QA pass against gates
```

**Total wall time estimate (with parallelization):** 8-10 hours. Without parallelization (single agent): 18-24 hours.

---

## STEP 1 — Initialize Astro repo + dependencies

**Sequential. Run first.**

**Files created:** `package.json`, `astro.config.mjs`, `tsconfig.json`, base directory structure

**Claude Code prompt (copy-paste this):**

```
Initialize a new Astro 4.x project for Pro Exteriors website. Working directory should be the current Git repo (already initialized; just add files).

Run:
  npm create astro@latest -- --template minimal --typescript strict --skip-houston --no-install

Then install dependencies:
  npm install astro @astrojs/react @astrojs/sitemap @astrojs/tailwind @astrojs/sanity @astrojs/mdx @astrojs/check
  npm install react react-dom
  npm install -D tailwindcss @tailwindcss/typography @tailwindcss/forms @types/react @types/react-dom
  npm install zod react-hook-form @hookform/resolvers
  npm install @fontsource/inter
  npm install -D sharp
  npm install lighthouse-ci

Create directory structure per /tech/PRD_Phase-1_April-2026.md §3 — make all directories listed (src/components/atoms, src/components/molecules, src/components/organisms, src/components/islands, src/components/seo, src/lib, src/lib/schema, src/pages, src/pages/api, src/pages/commercial-roofing, src/pages/residential-roofing, src/pages/proplan, src/pages/total-home-shield, src/pages/locations, src/pages/projects, src/pages/blog, src/pages/about, src/pages/careers, src/pages/contact, src/pages/thank-you, src/pages/partners, src/pages/property-card, src/styles, src/content/legal, sanity/schemas, public/fonts, public/images, scripts).

Configure astro.config.mjs with:
  - site: 'https://pc-demo.Cleverwork.io'
  - output: 'static'
  - integrations: react(), tailwind(), sitemap({ filter: page => !page.includes('/thank-you/') && !page.includes('/portal/') && !page.includes('/booking/') }), mdx()
  - compressHTML: true
  - prefetch: true (default)

Create .env.example with: SANITY_PROJECT_ID, SANITY_DATASET, SANITY_API_TOKEN, PUBLIC_GA4_MEASUREMENT_ID, PUBLIC_POSTHOG_KEY, LEAD_WEBHOOK_URL, SLACK_EMERGENCY_WEBHOOK, SITE_URL.

Create .gitignore: node_modules, .astro, dist, .env, .env.local, .DS_Store.

Create .coolify/config.yaml per PRD §2.

Run npm install and verify a clean build with `npm run build`.

Acceptance: `npm run build` exits 0; `dist/` contains an empty `index.html`.
```

**Acceptance:**
- `npm run build` succeeds
- Directory structure matches PRD §3
- `astro.config.mjs` has site, output:static, integrations
- `.coolify/config.yaml` exists

---

## STEP 2 — Configure Tailwind + design tokens

**Sequential. Depends on Step 1.**

**Files:** `tailwind.config.mjs`, `src/styles/tokens.css`, `src/styles/global.css`

**Claude Code prompt:**

```
Configure Tailwind 3.x with custom design tokens per /tech/PRD_Phase-1_April-2026.md §8.

Create tailwind.config.mjs with:
  - content: ['./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}']
  - theme.extend.colors using CSS variables: 'brand-primary': 'var(--color-brand-primary)', 'brand-accent': 'var(--color-brand-accent)', 'brand-bg', 'brand-bg-alt', 'brand-text', 'brand-text-muted', 'brand-text-secondary', plus semantic (success, warning, error, info)
  - theme.extend.fontFamily: 'sans': ['Inter', 'system-ui', ...], 'display': ['Inter', 'system-ui'], 'mono': ['IBM Plex Mono', 'monospace']
  - plugins: typography, forms

Create src/styles/tokens.css with all CSS variables from PRD §8.1 and §8.2 — colors, type scale, spacing scale (use Tailwind defaults for spacing). Add an explicit comment block warning that --color-brand-text-muted (#6B7280) is 4.6:1 on white but FAILS contrast on --color-brand-bg-alt — DO NOT use --color-brand-text-muted on the alt background.

Create src/styles/global.css that:
  - imports tokens.css
  - imports @fontsource/inter (weights 400, 500, 600, 700)
  - applies Tailwind directives (@tailwind base, @tailwind components, @tailwind utilities)
  - sets html scroll-smooth
  - body uses --font-sans
  - sets focus-visible ring style for keyboard navigation

Update src/pages/index.astro to import global.css.

Acceptance: `npm run build` succeeds; basic styles applied; page renders Inter font.
```

**Acceptance:**
- Tokens file matches PRD §8.1 and §8.2
- Inter font loaded
- Build succeeds

---

## STEP 3 — Configure Sanity (or MDX fallback)

**Sequential. Depends on Step 2.** *Can be skipped if Sanity setup is blocked — fallback to MDX-in-repo for all content.*

**Files:** `sanity/schemas/*.ts`, `sanity.config.ts`, `src/lib/sanity.ts`

**Claude Code prompt (Sanity path):**

```
Configure Sanity CMS for Pro Exteriors content.

If SANITY_PROJECT_ID is set in .env, proceed with Sanity. Otherwise, output a clear "Sanity not configured — falling back to MDX-in-repo" message and skip to creating /src/content/ directories with sample MDX files.

For Sanity:
  npx sanity@latest init --project [SANITY_PROJECT_ID] --dataset production --output-path ./sanity --typescript

Create the following schema files in sanity/schemas/ (full schemas per PRD §6.4 and template specs in §5):
  - service.ts (vertical, slug, name, description, h1, hero image, faq array, related services, schema fields)
  - city.ts (name, slug, vertical, state, description with unique-per-city validation, project gallery, testimonials)
  - subdivision.ts (name, slug, parent city, hoa rules, hail history, served jobs, sample property card)
  - officeLocation.ts (name, slug, address, phone, hours, type (HQ/branch/satellite), state, lat, lng, description, photos, services offered)
  - caseStudy.ts (project name, slug, industry category, scope, timeline, before/during/after photos, testimonial, technical specs, signoff field)
  - blogPost.ts (full schema per PRD §6.4 with pillar, silo_target, silo_siblings, targetAnchorText fields)
  - pillar.ts (name, slug, vertical, description, intro)
  - testimonial.ts (quote, author, role, org, vertical, signoff)
  - leadership.ts (name, role, bio, portrait)
  - careersPosting.ts (title, slug, location, type, description, requirements, salary range, validThrough)

Create sanity.config.ts with the schema list and Studio config.

Create src/lib/sanity.ts with the Sanity client (anonymous read for build), GROQ query helpers (getAllServices, getServiceBySlug, getAllCities, getCityBySlug, getSubdivision, getAllOfficeLocations, getCaseStudies, getBlogPosts, getPillarBySlug, getRelatedSiloPosts).

Acceptance: `npx sanity dev` starts Studio locally on :3333; `npm run build` still succeeds.
```

**Claude Code prompt (MDX fallback):**

```
Sanity is not configured. Set up MDX-in-repo as the content source.

Create directory structure:
  src/content/
    services/
      commercial/
        tpo.mdx
        epdm.mdx
        ...
      residential/
        asphalt-shingles.mdx
        ...
    cities/
      commercial/
        dallas.mdx
        ...
      residential/
        dallas.mdx
        ...
    subdivisions/
      twin-creeks-allen.mdx
    offices/
      dallas-hq.mdx
      fort-worth.mdx
      denver.mdx
      wichita.mdx
      kansas-city.mdx
      atlanta.mdx
    case-studies/
    blog-posts/
    pillars/

Each MDX file uses frontmatter for structured fields per the Sanity schemas (vertical, slug, h1, description, ...). Use the same field names as the Sanity schemas would so swapping later is trivial.

Create src/content/config.ts (Astro Content Collections) with collection definitions matching the Sanity schemas.

Acceptance: `npm run build` succeeds; collections type-checked.
```

**Acceptance:**
- Either Sanity configured + queries work OR MDX content collections defined
- Schema fields match PRD §6.4 (especially silo fields on blog posts)

---

## STEP 4 — Build BaseLayout with header + footer + nav

**Sequential. Depends on Step 3.**

**Files:** `src/components/seo/BaseLayout.astro`, `src/components/organisms/Header.astro`, `src/components/organisms/Footer.astro`, `src/components/seo/SchemaJsonLd.astro`, `src/components/seo/AnalyticsHead.astro`

**Claude Code prompt:**

```
Build the BaseLayout shared by every page in the site.

src/components/seo/BaseLayout.astro:
  - Props: title (required), description (required), canonicalPath (required, e.g., '/'), ogImage, jsonLd (array of schema objects)
  - <head>: charset, viewport, title (60 chars max — assert), description meta (120-160 chars — assert), canonical link, OG/Twitter Card tags, JSON-LD scripts, AnalyticsHead.astro, robots meta (default index,follow; allow override for thank-you/portal/booking/preview routes)
  - Imports global.css
  - <body>: <a href="#main" class="sr-only focus:not-sr-only">Skip to main content</a>; Header component; <main id="main">; <slot />; Footer component

src/components/organisms/Header.astro:
  - Pro Exteriors text wordmark (placeholder for logo) on left
  - Primary nav: Services (mega-menu hover with Commercial / Residential / ProPlan columns), Locations, Projects, About, Resources (=blog), Contact
  - Utility nav (right): Portal Login, phone CTA (tel: link), Get a Quote CTA button (orange/red)
  - Mobile: hamburger menu with full nav drawer (Astro-native, uses <details>/<summary> or a small client:idle script)

src/components/organisms/Footer.astro:
  - 4 columns: Company (About, Mission, Leadership, Careers, Press), Services (split — Commercial / Residential / ProPlan), Locations (link to all 6 office pages + Locations Hub), Legal (Privacy, Terms, Accessibility, Sitemap, Cookies)
  - Bottom strip: copyright, social icons (placeholder), certifications row (GAF, Carlisle, etc. as placeholder badges)

src/components/seo/SchemaJsonLd.astro:
  - Takes a single prop: jsonLd (object or array)
  - Renders <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
  - Validates JSON before render

src/components/seo/AnalyticsHead.astro:
  - GA4 + PostHog snippets per PRD §11.1
  - Only renders if PUBLIC_GA4_MEASUREMENT_ID is set

Acceptance: BaseLayout renders on src/pages/index.astro; nav links go to placeholder routes; build succeeds; Lighthouse a11y check passes on basic page.
```

**Acceptance:**
- BaseLayout includes all required head tags
- Header + Footer render with full nav
- Skip-to-main-content link works
- JSON-LD valid

---

## STEP 5 — Build component library (atoms + molecules)

**Sequential. Depends on Step 4.**

**Claude Code prompt:**

```
Build the atomic component library per PRD §5 and §8.

Atoms (src/components/atoms/):
  - Button.astro: variants (primary, secondary, ghost, danger), sizes (sm, md, lg), with optional href (renders <a>), data-cta-name attribute for analytics tracking
  - Stat.astro: props { value, label, source }; if no source, renders a TODO overlay marker (data-todo="source-stats" + a tiny visible pill in development mode)
  - Badge.astro: props { variant: 'verified' | 'cert' | 'new' | 'todo', children }
  - Input.astro: text input with label, error state, required indicator
  - Icon.astro: SVG icon system (use @fontsource/lucide or inline SVGs)
  - PartnerNetworkDisclosure.astro: small inline copy "Coordinated by Pro Exteriors • Installed by our trusted partner network. Learn more →" linking to /partners/

Molecules (src/components/molecules/):
  - Card.astro: image, eyebrow tag, title, description, optional CTA
  - FAQ.astro: accordion (Astro-native using <details>/<summary>); takes array of {question, answer}; emits FAQPage schema fragment
  - Testimonial.astro: quote, author, role, org, optional photo; renders Review/AggregateRating schema fragment
  - ServiceTile.astro: icon, name, description, link
  - StatBand.astro: row of 4 Stat components with optional source disclaimer
  - ProcessStep.astro: number, icon, title, description (for "How it Works" sections)
  - PropertyCardCallout.astro: warm-paper styled callout linking to /property-card/ — "Get the Pro Exteriors Property Card for your address"
  - HeroSection.astro: hero with title, subtitle, image, primary CTA, secondary CTA, optional dual-router CTAs
  - Breadcrumb.astro: takes path; emits BreadcrumbList schema; renders breadcrumb nav

Acceptance: each component has a TypeScript prop interface; build succeeds; basic component playground page (src/pages/_dev/components.astro, only built in dev) shows each component rendered.
```

**Acceptance:**
- All atoms and molecules created
- Stat component requires source prop
- PropertyCardCallout exists
- Components render

---

## STEP 6 — Build React island components

**Sequential. Depends on Step 5.**

**Claude Code prompt:**

```
Build the React island components per PRD §7.

src/components/islands/OfficeLocationsMap.tsx:
  - React functional component with props per PRD §7.2
  - Phase 1: render a simplified placeholder SVG (rect for each state, circle for each office pin) with the 6 office pins (Richardson HQ, Euless, Greenwood Village, Wichita, KC, Atlanta-satellite) and active state highlighting (TX, KS, CO, GA, MO)
  - Pin types use distinct icons: HQ (filled square), branch (filled circle), satellite (outlined circle with diagonal stripe per CLAUDE.md note)
  - Click pin → modal popover with office NAP + "View Office Page" link
  - Hover state shows office name tooltip
  - Mounts client:visible
  - Includes role="application" + aria-label="Pro Exteriors office locations map" for a11y

src/components/islands/LeadForm.tsx:
  - React Hook Form + Zod validation per PRD §10.1 schema
  - Props: { vertical, formType, defaultFields, redirectTo, campaign? }
  - Renders fields per formType (residential inspection / commercial RFQ / emergency / property-card)
  - Handles submit: POST to /api/lead.ts, fires form_submit_attempt + form_submit_success/error analytics events, redirects to thank-you on success
  - Mounts client:idle (residential), client:visible (commercial RFQ — needs to be ready faster)
  - Includes ARIA error announcements, label associations, error summary on validation fail

src/components/islands/ROICalculator.tsx:
  - For /proplan/ and /proplan/roi-calculator/
  - Inputs: facility square footage, roof age, current annual repair spend
  - Output: estimated 5-year savings + monthly maintenance cost
  - Calculation: Phase 1 uses placeholder formula (sqft * 0.50 * roof_age_factor); Phase 2 replaces with real Pro Exteriors data
  - Mounts client:visible
  - Fires roi_calculator_complete analytics event on submit

src/components/islands/AddressAutocomplete.tsx:
  - For /property-card/get-yours/
  - Phase 1: simple text input with "address looks like" validation; Phase 2 swaps to a real autocomplete (Google Places or HERE)
  - Submits address + APN lookup placeholder behind the scenes
  - Mounts client:visible

src/components/islands/BookingCalendar.tsx:
  - For /total-home-shield/booking/
  - Phase 1: iframe placeholder for Calendly/GoHighLevel; configured via env var BOOKING_CALENDAR_EMBED_URL
  - Mounts client:idle

For each island, ensure SSR fallback HTML is rendered server-side (a fallback list, fallback form, fallback table) — crawlers must see the content even without JS execution per PRD §7.3.

Acceptance: each island has a working SSR fallback; client-side enhancement works; build budget for islands per PRD §12.1.
```

**Acceptance:**
- All islands have SSR fallbacks
- LeadForm posts to /api/lead.ts
- Map shows 6 office pins
- Build budget for each island under PRD §12.1 limits

---

## STEP 7 — Build schema generator library

**Sequential. Depends on Step 6.**

**Claude Code prompt:**

```
Build src/lib/schema/ — JSON-LD generators for every template per PRD §9.1.

Create one TS file per schema type, exporting a function that takes structured data and returns a JSON-LD object:

  src/lib/schema/Organization.ts → organizationSchema(): always returns the same Pro Exteriors Organization schema (used on every page)
  src/lib/schema/LocalBusiness.ts → localBusinessSchema(office): returns a LocalBusiness for one office; localBusinessAreaSchema(city) returns a city-scoped variant
  src/lib/schema/Service.ts → serviceSchema(service, office): returns Service with provider reference
  src/lib/schema/Article.ts → articleSchema(post, author): returns Article + Author Person
  src/lib/schema/CaseStudy.ts → caseStudySchema(project): returns CreativeWork-based CaseStudy + Article
  src/lib/schema/FAQPage.ts → faqPageSchema(faqs): returns FAQPage with all questions/answers
  src/lib/schema/BreadcrumbList.ts → breadcrumbSchema(path): returns BreadcrumbList from a path array
  src/lib/schema/CollectionPage.ts → collectionPageSchema(items): returns CollectionPage + ItemList
  src/lib/schema/JobPosting.ts → jobPostingSchema(posting): with required fields (title, description, datePosted, validThrough, hiringOrganization, jobLocation)
  src/lib/schema/ContactPage.ts → contactPageSchema()
  src/lib/schema/AboutPage.ts → aboutPageSchema()
  src/lib/schema/Person.ts → personSchema(leader)
  src/lib/schema/WebSite.ts → websiteSchema(): only on homepage; includes potentialAction SearchAction

Each generator validates required fields with Zod before returning the schema object — if a required field is missing, throw an error at build time so missing data doesn't ship as broken schema.

Create scripts/validate-schema.mjs that, after build, walks dist/, extracts every <script type="application/ld+json"> block, validates each against schema.org JSON Schema definitions, and exits non-zero on any failure.

Wire validate-schema into the package.json "build" script as a post-build step.

Acceptance: `npm run build` runs schema validation and passes (no schema yet but the validator runs cleanly on empty pages).
```

**Acceptance:**
- All schema generators created
- Validator runs in build pipeline
- Required-field validation throws at build time

---

## STEP 8 — Build page templates [PARALLELIZABLE — 4-6 agent teams]

**This is the parallelization point. Assign each cluster to a separate agent team running in its own branch. Merge to `main` after all complete.**

### Step 8a [Agent A] — Hub templates (5 files, ~45 min)

```
Build hub-style page templates for Pro Exteriors per /tech/PRD_Phase-1_April-2026.md §5.2.

Templates to create:
  - src/pages/index.astro (home — special case, see §5.1)
  - src/pages/commercial-roofing/index.astro (commercial vertical hub)
  - src/pages/residential-roofing/index.astro (residential vertical hub)
  - src/pages/locations/index.astro (locations hub)
  - src/pages/blog/index.astro (blog hub)

For each:
  1. Use BaseLayout with proper title, description, canonicalPath, jsonLd
  2. Required sections per PRD §5.2:
     - Hero with H1 + sub-CTA (use HeroSection component)
     - Stats strip (use StatBand component with placeholder values + data-todo="source-stats")
     - Service/child grid (use ServiceTile + grid layout)
     - Trust band (Testimonial component or logo strip)
     - Map (commercial hub + locations hub only — use OfficeLocationsMap with SSR fallback list)
     - FAQ section (use FAQ component)
     - Bottom CTA band
  3. Apply audit fixes per PRD §14:
     - Commercial Hub H1: "Commercial Roofing Contractor" (no "Dallas" — that goes on city pages)
     - Residential Hub: dual hero CTAs are "Plan Your Replacement" + "Get a Free Inspection"; "Roof Damage 48 Hours" lives below as a "Need help fast?" strip
     - Residential Hub: keep "Local Experts. Not 'Storm Chasers.'" line in trust band
     - Blog Hub: "Storm Damage" pill is index 13 in pillar order, not 1
  4. Schema: emit CollectionPage + BreadcrumbList + ItemList per PRD §9.1
  5. Add PropertyCardCallout component above bottom CTA on Home + Residential Hub + ProPlan
  6. Performance budget: ≤120 KB JS gzip on map-bearing routes, 0 KB elsewhere

Acceptance: each page builds cleanly, schema validates, Lighthouse ≥95 mobile.
```

### Step 8b [Agent B] — Detail templates (8 files, ~60 min)

```
Build detail-style page templates per PRD §5.3-§5.6, §5.10-§5.13.

Templates:
  - src/pages/commercial-roofing/[service].astro (commercial service-detail) — getStaticPaths from Sanity/MDX collection
  - src/pages/residential-roofing/[service].astro (residential service-detail)
  - src/pages/commercial-roofing/[city].astro (commercial city-detail)
  - src/pages/residential-roofing/[city].astro (residential city-detail)
  - src/pages/residential-roofing/[subdivision].astro (subdivision-detail — NEW template, see PRD §5.5)
  - src/pages/locations/[office].astro (office-location / GBP destination)
  - src/pages/projects/[slug].astro (case-study-detail)
  - src/pages/blog/[slug].astro (blog-post / supporter)
  - src/pages/blog/[pillar].astro (pillar)

For each, follow PRD §5 spec exactly. Critical implementation details:
  - service-detail: H1 templated from {{city.name | default}} so service pages without geo ship without city modifier
  - city-detail: cross-sell strip enforces vertical containment (commercial cities only link to commercial siblings)
  - subdivision-detail: Property First lens MANDATORY — surface PropertyCardCallout, HOA-aware copy section, hail history callout (placeholder), "neighbor served" markers
  - office-location: H1 names both metro and office address per Maren ruling 2026-04-25
  - case-study-detail: cross-sell to industry siblings only
  - blog-post: emit Article + BreadcrumbList + FAQPage schema; wire silo_target + silo_siblings from frontmatter; render exactly 1 link to silo_target + 1-2 sibling links in body via the silo helper functions
  - pillar: render ItemList of all blog posts where pillar matches

Use getStaticPaths to pre-render all instances per the URL plan in /strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx sheet 05 Phase 0 rows.

Acceptance: each template builds; getStaticPaths works for all Phase 0 URLs; schema validates.
```

### Step 8c [Agent C] — Campaign templates (Total Home Shield + Booking, 6 files, ~45 min)

```
Build the Total Home Shield five-page Anchor funnel + Booking Hub per PRD §5.8 and §5.9.

Templates:
  - src/pages/total-home-shield/index.astro (Page 1: Awareness)
  - src/pages/total-home-shield/silent-killers.astro (Page 2: Agitation)
  - src/pages/total-home-shield/easy-button.astro (Page 3: Convenience)
  - src/pages/total-home-shield/claim-offer.astro (Page 4: Offer with form)
  - src/pages/total-home-shield/last-call.astro (Page 5: Urgency)
  - src/pages/total-home-shield/booking.astro (Booking Hub — noindex)

Use the verbatim copy from /uploads/Residential ProPlan Example Campaign.docx — the campaign brief contains every H1, sub-head, body paragraph, and CTA copy.

Critical:
  - Each page has an "Accelerator Link" at the bottom: "P.S. Ready to see the offer now? [Yes, Show Me My $997 Loyalty Offer Now]" → goes directly to /total-home-shield/claim-offer/
  - Path C disclosure: include PartnerNetworkDisclosure component on Awareness, Convenience, Offer pages — windows + exterior painting are partner-fulfilled
  - Offer page: LeadForm island ABOVE the fold with formType="campaign-anchor" and campaign="total-home-shield-anchor"
  - Urgency page: same form below the fold, stronger urgency copy
  - Booking page: BookingCalendar island, "While You Wait" portfolio links to /projects/window-installations/ + /projects/siding-transformations/, AI agent expectation copy
  - Booking page: <meta name="robots" content="noindex">
  - All pages: schema = Service + Offer + BreadcrumbList

Acceptance: all 6 pages build; form posts to /api/lead.ts; calendar embed loads; schema validates.
```

### Step 8d [Agent D] — Trust + Conversion templates (4 files, ~30 min)

```
Build trust and conversion templates per PRD §5.10-§5.11, §5.16-§5.18.

Templates:
  - src/pages/projects/index.astro (case-study-hub)
  - src/pages/projects/[category].astro (project category page — Phase 1 ships placeholders for 8 categories per canonical sitemap §6)
  - src/pages/contact/index.astro (contact-hub with branched form)
  - src/pages/partners/index.astro (Path C disclosure — NEW page, see PRD §5.17)
  - src/pages/property-card/index.astro (property-card overview, NEW)
  - src/pages/property-card/get-yours.astro (lead capture form, NEW)
  - src/pages/property-card/preview.astro (preview render — placeholder, NEW)

For partners page: lay out the Path C model — Pro Exteriors fulfills roof, gutters, siding in-house; windows + exterior painting via vetted Partner Network. QC standards. One-point-of-contact promise. Disclosure that's clear without being defensive.

For property-card pages: warm-paper visual aesthetic (cream background, IBM Plex Mono accents per Property First doc §6.1), AddressAutocomplete island on get-yours, placeholder card render on preview.

For contact hub: branched two-column form (Commercial Inquiry + Residential Request) with Astro form posting to /api/lead.ts; office locations grid showing all 6 offices; FAQ section.

Acceptance: pages build; forms post; schema validates; brand matches Pro Exteriors (no agency placeholders).
```

### Step 8e [Agent E] — Utility templates (5 files, ~20 min)

```
Build utility / legal / error templates per PRD §5.19-§5.21.

Templates:
  - src/pages/privacy.astro
  - src/pages/terms.astro
  - src/pages/accessibility.astro
  - src/pages/cookies.astro
  - src/pages/portal.astro (SSO link-out — minimal page)
  - src/pages/404.astro
  - src/pages/500.astro

For legal: MDX-in-repo content (placeholder Lorem Ipsum is OK for Phase 1; real legal copy comes from Pro Exteriors counsel in Phase 2).
For portal: short page explaining "Customer Portal access via SSO →" with a button linking to the external Centerpoint URL (env var). Include "Back to website" link.
For 404/500: branded error pages with primary nav + search + popular links.

Acceptance: all utility pages build; legal pages have placeholder content marked TODO; 404 returns the branded page on unmatched routes.
```

### Step 8f [Agent F] — About / Mission / Leadership / Careers templates (6 files, ~30 min)

```
Build the About-vertical templates per PRD §5.14, §5.15.

Templates:
  - src/pages/about/index.astro (about hub)
  - src/pages/about/mission.astro
  - src/pages/about/leadership.astro
  - src/pages/about/safety.astro (Phase 0 placeholder)
  - src/pages/about/certifications.astro (Phase 0)
  - src/pages/about/pro-ministries.astro (Phase 0)
  - src/pages/careers/index.astro (careers hub)

For all: brand pass — replace any "RoofingPros" / "APEXROOFING" agency template strings with "Pro Exteriors". Use Pro Exteriors branding consistently.

About hub: Hero + Journey timeline + Mission/Values teaser + Leadership preview + Pro Ministries section + Career CTA.
Mission: full mission/values content (Phase 1 placeholder Lorem Ipsum is OK; structure must be real).
Leadership: Person schema for each leader; portrait + name + title + bio. Phase 1 ships placeholder names with `data-todo="real-leadership"`.
Careers hub: Hero + open positions list (placeholder for Phase 0 — 1 position) + Life at Pro Exteriors photo grid + team testimonial.

Acceptance: all templates build; brand consistent throughout; schema validates.
```

---

## STEP 9 — Page instances [PARALLELIZABLE — 6-8 agent teams]

**After Step 8 templates land in main, populate the 66 Phase 0 URLs. Each cluster goes to one agent team. Cluster work can run concurrent on separate branches.**

### Step 9a [Agent A] — Foundation hubs (8 pages)

```
The hub templates from Step 8a are already built. This step seeds the CMS/MDX content for the 8 foundation hub pages so they render with real content (placeholder where brand-pending).

Pages: /, /commercial-roofing/, /residential-roofing/, /proplan/, /locations/, /about/, /blog/, /contact/

For each, populate Sanity (or MDX) with:
  - title (40-60 chars)
  - description (120-160 chars)
  - hero copy (H1 + sub)
  - placeholder stats with TODO markers per PRD §14
  - service grid items linking to Phase 0 service pages
  - testimonial placeholders
  - FAQ items (3-5 per hub)

Use real copy from the canonical sitemap and the design audit findings — Residential Hub keeps "Local Experts. Not 'Storm Chasers.'" framing; Home Page leads with "Roofing Partner. Not Just a Contractor."

Acceptance: all 8 hubs render with content; Lighthouse ≥95 on each; no TODO markers blocking the build (TODOs are visible-but-non-blocking placeholders).
```

### Step 9b [Agent B] — Commercial silo (10 pages: 6 services + 4 cities)

```
Populate commercial silo per /strategy/Pro-Exteriors_GBP-Curation_April-2026.xlsx sheet 05 Phase 0 rows.

Services (6): /commercial-roofing/tpo/, /commercial-roofing/epdm/, /commercial-roofing/metal/, /commercial-roofing/flat-roof-systems/, /commercial-roofing/repair/, /commercial-roofing/replacement/

Cities (4): /commercial-roofing/dallas/, /commercial-roofing/fort-worth/, /commercial-roofing/plano/, /commercial-roofing/frisco/

For each service: H1 with service name (no "Dallas" prefix unless on a city × service page — it's not in Phase 0); content per service-detail template; FAQ for each (3 questions); cross-sell to commercial siblings only.

For each city: H1 with "Commercial Roofing Contractor in [City], TX"; LocalBusiness schema scoped to that city; service grid showing the 6 commercial services; project gallery filtered to that city; FAQ; footer city-link row to siblings.

Each page: place 1 PropertyCardCallout component near bottom CTA.

Acceptance: 10 pages built and indexable; schema validates per page; each city page has unique copy and unique project gallery (CMS validation).
```

### Step 9c [Agent C] — Residential silo + Twin Creeks (11 pages)

```
Populate residential silo per sheet 05 Phase 0 rows.

Services (6): /residential-roofing/asphalt-shingles/, /residential-roofing/replacement/, /residential-roofing/inspection/, /residential-roofing/emergency/, /residential-roofing/metal/, /residential-roofing/storm-damage/

Cities (4): /residential-roofing/dallas/, /residential-roofing/fort-worth/, /residential-roofing/highland-park/, /residential-roofing/southlake/

Subdivision (1): /residential-roofing/twin-creeks-allen/

For services: same structure as commercial but with residential tone (homeowner audience, premium retail framing, "Local Experts. Not Storm Chasers" reinforced).

For cities: residential variant of the city-detail template.

For Twin Creeks (NEW subdivision-detail template): full Property First treatment — HOA-aware copy section ("Twin Creeks HOA-approved roof colors include..."), hail history placeholder ("Twin Creeks has experienced X hail events since 2020"), neighbor-served markers ("Pro Exteriors has served X homes on Twin Creeks Crossing, Y homes on Tournament Drive..."), embedded SubdivisionMap with placeholder pins, PropertyCardCallout prominently placed.

Each residential page: surface "Get Your Property Card for [your address]" CTA in addition to the standard service CTA.

Acceptance: 11 pages built; Twin Creeks demonstrates the full Property First experience; schema validates.
```

### Step 9d [Agent D] — ProPlan + Total Home Shield (12 pages)

```
Populate ProPlan + Total Home Shield silos.

ProPlan (1 page in Phase 0): /proplan/ overview only. Sub-pages (tiers, roi-calculator, how-it-works, case-studies, enroll) ship in Q1.
  - Use the "Strategic Asset" hero
  - Stats with TODO source markers
  - 4-step "How ProPlan Works" with placeholder process imagery
  - ROICalculator island prominently placed
  - 3 stakeholder cards (FM/PM/Owner)
  - Real placeholder testimonial (mark with data-todo="real-testimonial")
  - PropertyCardCallout linking to /property-card/

Total Home Shield (6 pages): /total-home-shield/, /silent-killers/, /easy-button/, /claim-offer/, /last-call/, /booking/
  - Verbatim copy from the Residential ProPlan Example Campaign doc
  - Each page wired with Path C partner-network disclosure component
  - Forms wired to /api/lead.ts with campaign="total-home-shield-anchor"
  - Booking page: noindex; embedded calendar; "While You Wait" portfolio links

Partners (1 page): /partners/ — Path C disclosure as designed in Step 8d.

Property Card (3 pages): /property-card/, /property-card/get-yours/, /property-card/preview/ — Q1 deliverable but Phase 0 ships skeleton.

Total: 11 pages this cluster (ProPlan + 6 THS + 1 partners + 3 property-card).

Acceptance: all pages build; THS funnel works end-to-end; Partners disclosure copy is clear; Property Card form works.
```

### Step 9e [Agent E] — Locations + Conversion (11 pages)

```
Populate location pages + conversion endpoints.

Office locations (6): /locations/dallas-hq/, /locations/fort-worth/, /locations/denver/, /locations/wichita/, /locations/kansas-city/, /locations/atlanta/

For each office:
  - H1: "Pro Exteriors — [Metro] from our [City] office"
  - Real address (from sheet 05 Phase 0 notes)
  - Hours
  - Embedded map zoomed to the office
  - Placeholder team photos
  - Local project gallery placeholders
  - Two-Door router (Commercial / Residential)
  - LocalBusiness schema with the real NAP

Conversion endpoints (5): /contact/commercial/, /contact/residential/inspection/, /contact/emergency/, /thank-you/commercial/, /thank-you/residential/

Each conversion endpoint:
  - Form with appropriate fields per PRD §10.3
  - Posts to /api/lead.ts
  - Thank-you pages: noindex; success copy; "What's Next" expectations; nav to relevant content
  - Emergency: minimal-friction form (firstName, phone, address only)

Acceptance: 11 pages built; office NAPs match the GBP profiles (cross-check with sheet 05); forms work; thank-you pages noindex.
```

### Step 9f [Agent F] — Blog seed + About (8 pages)

```
Populate blog seed cohort + About sub-pages.

Blog (8 pages):
  - /blog/ (hub) — already built in Step 9a
  - /blog/commercial-roofing/ (pillar)
  - /blog/residential-roofing/ (pillar)
  - 5 supporter posts per the silo seed table in PRD §6.8:
    - /blog/tpo-vs-epdm-vs-pvc/
    - /blog/commercial-roof-repair-vs-replacement/
    - /blog/how-much-does-a-roof-replacement-cost/
    - /blog/architectural-vs-3-tab-shingles/
    - /blog/best-time-of-year-to-replace-your-roof/

For each supporter post:
  - Real editorial content (Lorem Ipsum is NOT acceptable for Phase 1 supporters — these need real-feeling copy of 800-1200 words)
  - Wire silo_target field to the correct money page
  - Wire silo_siblings to 1-2 silo siblings (per PRD §6.8 table)
  - targetAnchorText must be the keyword-rich anchor matching the Target's primary keyword
  - In body: place exactly 1 link UP to silo_target (descriptive anchor, mid-body) + 1-2 lateral links to siblings
  - FAQ section at bottom (3 questions for FAQPage schema)
  - Author byline with placeholder name + portrait + Person schema

About sub-pages (3): /about/mission/, /about/leadership/, /about/certifications/
  - Real-feeling structure with placeholder content
  - Leadership: 3 placeholder leader cards with data-todo="real-leadership"
  - Certifications: badges grid (GAF, Carlisle, Versico, etc. as placeholders)

Acceptance: silo audit passes (1 target link + 1-2 sibling links per supporter, no cross-silo links); pillar pages render ItemList of supporters; About pages complete.
```

### Step 9g [Agent G] — Utility / legal / careers (7 pages)

```
Populate the remaining utility pages.

Pages: /privacy/, /terms/, /accessibility/, /cookies/, /sitemap.xml (auto-gen), /robots.txt (manual), /404, /500, /portal/, /careers/

Legal (privacy, terms, cookies, accessibility): MDX-in-repo with placeholder Lorem Ipsum + comment marking sections that need real legal review in Phase 2.

Robots.txt: per PRD §9.3.

Careers hub: 1 placeholder open position, "Build Your Career with Pro Exteriors" hero, photo grid placeholders, team testimonial.

Portal: short SSO redirect page.

Acceptance: all utility pages build; robots.txt and sitemap.xml render at build; 404 catches unmatched routes.
```

---

## STEP 10 — Internal linking enforcement

**Sequential. Depends on all of Step 9 complete.**

```
Implement the Kyle Roof Reverse Silo enforcement at build time per PRD §6.

Create scripts/audit-silo.mjs:
  - Walks all blog posts in Sanity/MDX
  - For each post:
    - Asserts exactly 1 link in body text whose href === silo_target.url
    - Asserts 1-2 links in body text whose href is in silo_siblings[].url
    - Asserts no body links to URLs in a different vertical (commercial vs residential vs proplan)
    - Asserts no anchor text matches forbidden list ('click here', 'learn more', 'read more')
    - Asserts targetAnchorText prop matches the actual anchor text used in the body link
  - For each Target/Pillar:
    - Counts inbound supporter links; warns (not fails) if <5 (Kyle Roof spec is 5-7)

Create scripts/audit-orphans.mjs (containment audit):
  - Walks all pages in dist/
  - Determines vertical of each page (commercial / residential / proplan / total-home-shield / brand)
  - Asserts no body content links cross-vertical (except brand pages, which can link anywhere)
  - Asserts every URL has at least 1 inbound internal link from another page (orphan check)

Wire both scripts as post-build steps in package.json:
  "build": "astro build && npm run audit:schema && npm run audit:silo && npm run audit:orphans"

Implement src/components/molecules/RelatedPosts.astro per PRD §6.6 (silo-aware "Related Reading" widget).

Update all blog post pages to use silo helper functions for body link rendering.

Acceptance: `npm run build` runs all audits; failures fail the build with clear messages.
```

**Acceptance:**
- Silo audit passes for all 5 Phase 0 supporter posts
- Orphan audit passes for all 66 Phase 0 URLs
- Containment rules enforced

---

## STEP 11 — Form endpoint + lead routing

**Sequential. Depends on Step 10.**

```
Implement /api/lead.ts per PRD §10.

src/pages/api/lead.ts:
  - Astro API endpoint (output: 'server' for this single route, requires hybrid mode in astro.config — switch the project to output: 'hybrid' if needed)
  - Validates body against Zod schema per PRD §10.1
  - Forwards to LEAD_WEBHOOK_URL via fetch
  - For formType='emergency', also POST to SLACK_EMERGENCY_WEBHOOK
  - Returns { success: true, redirectTo: '/thank-you/[vertical]/' } on success
  - Returns { success: false, error: string } with 4xx on validation failure

For Phase 1 demo (no real CRM), route to a logging endpoint that emails Chris and writes to a JSONL file in /var/log/leads.jsonl on the VPS.

Also create scripts/test-form.mjs that POSTs a sample lead to /api/lead.ts in CI to verify the endpoint stays healthy.

Acceptance: form submission from /contact/, /total-home-shield/claim-offer/, /property-card/get-yours/ all work; lead is logged; redirect to thank-you fires.
```

---

## STEP 12 — Analytics + measurement

**Sequential.**

```
Implement GA4 + PostHog per PRD §11.

src/components/seo/AnalyticsHead.astro: GA4 + PostHog snippets.

src/lib/analytics.ts: trackEvent helper, conversion goal definitions.

Wire events in:
  - Every Button component fires cta_click on activate
  - Every form fires form_start, form_submit_attempt, form_submit_success, form_submit_error
  - Every tel: link click fires phone_call_click
  - THS funnel accelerator links fire accelerator_link_click
  - ROI calculator submit fires roi_calculator_complete
  - Address autocomplete select fires address_autocomplete_select

Define conversion goals in PostHog admin (or document in scripts/posthog-setup.md for manual config):
  - residential_inspection_lead (value: $200)
  - commercial_rfq_lead (value: $1500)
  - ths_anchor_offer_signup (value: $300)
  - property_card_request (value: $50)
  - proplan_assessment_request (value: $1000)
  - phone_call_click (value: $300)
  - emergency_form_submit (value: $500)

Acceptance: events fire on local dev; PostHog admin shows the 7 conversion goals defined.
```

---

## STEP 13 — SEO foundation

**Sequential.**

```
Wire SEO foundation per PRD §9.

Verify:
  - Every page emits self-referencing canonical
  - Every page emits OG + Twitter Card tags
  - sitemap-index.xml + sitemap-0.xml auto-generated
  - robots.txt is correct
  - All schema generators wire up correctly per template

Add staging X-Robots-Tag noindex header in Coolify config (so pc-demo.Cleverwork.io is noindex pre-cutover).

Acceptance: curl -I on any page shows correct robots header; sitemap-0.xml lists all 66 URLs minus thank-you/portal/booking exclusions.
```

---

## STEP 14 — Performance + a11y CI gates

**Sequential.**

```
Wire CI gates per PRD §12 and §13.

.github/workflows/ci.yml:
  - On push: install deps, build, run schema audit, run silo audit, run orphan audit, run Lighthouse on every template, run Pa11y on every URL
  - Fail the workflow if any check fails

scripts/lighthouse-budget.mjs:
  - Runs Lighthouse in mobile mode against every URL in sitemap
  - Asserts each URL meets template-specific budget per PRD §12.1

scripts/audit-a11y.mjs:
  - Runs Pa11y or axe-core against every URL
  - WCAG 2.2 AA compliance required

Acceptance: CI workflow passes on a green build; failures produce clear diagnostic output.
```

---

## STEP 15 — Build + deploy to Coolify

**Sequential.**

```
Push to Git, watch Coolify auto-deploy.

git add -A
git commit -m "Phase 1 — 66-page Phase 0 cohort"
git push origin main

Coolify webhook triggers:
  - Git pull
  - npm ci
  - npm run build (runs all audits)
  - Copy dist/ to web root
  - Reload Caddy

Verify pc-demo.Cleverwork.io serves the new build:
  curl -I https://pc-demo.Cleverwork.io/
  curl https://pc-demo.Cleverwork.io/sitemap-index.xml

Confirm staging X-Robots-Tag: noindex header is present (per PRD §9.3).

Acceptance: site live at pc-demo.Cleverwork.io with all 66 pages renderable.
```

---

## STEP 16 — QA pass against gates

**Sequential. Final step.**

```
Run the full gate verification per CLAUDE.md §4.

Manual checks:
  ☐ Visit each of 66 URLs in browser; confirm renders
  ☐ Submit each form variant (commercial RFQ, residential inspection, emergency, THS anchor, property card); confirm lead arrives
  ☐ Run Google Rich Results Test against 5 sample URLs; confirm schema valid
  ☐ Run Lighthouse mobile against 5 sample URLs; confirm ≥95 on each category
  ☐ Test on real mid-range Android over 4G simulated throttle
  ☐ Verify map renders on Home, Commercial Hub, Residential Hub, Locations Hub, all 6 Office pages, all 4 commercial cities, all 4 residential cities, Twin Creeks, About
  ☐ Confirm Total Home Shield funnel completes end-to-end (Awareness → Booking)
  ☐ Confirm no "RoofingPros" or "APEXROOFING" placeholder strings in dist/
  ☐ Confirm no body links cross-vertical (run audit-orphans.mjs)
  ☐ Confirm silo audit passes (1 target link + 1-2 siblings per supporter)

Programmatic checks (scripts):
  ☐ npm run build (all audits pass)
  ☐ curl every URL in sitemap; assert 200 status
  ☐ scripts/test-form.mjs (form endpoint healthy)

Document any issues in /tech/Phase-1-Launch-Issues.md as P0/P1/P2.

Acceptance: all gates green OR documented issues with severity. Site live and demo-ready.
```

---

## Step quick-reference for the next iteration

After Phase 1 lands, the same build cycle scales to Phase 2+ with these adjustments:

- **Adding a new service page:** runs Step 9 only — populate the service in Sanity/MDX, the page renders automatically via the `[service].astro` dynamic route.
- **Adding a new city page:** same — populate the city in Sanity/MDX.
- **Adding a new subdivision:** populate the subdivision; the `[subdivision].astro` dynamic route renders it.
- **Adding a new blog supporter post:** populate the post with silo_target + silo_siblings + targetAnchorText; CI audit ensures silo discipline; build adds the post to its pillar's ItemList automatically.
- **Adding a new pillar:** add to Sanity; create the corresponding `/blog/[pillar]/` route entry; populate 5-7 supporters wired to the pillar.
- **Adding a new template:** create the `.astro` template in `src/pages/`; add the schema generator; document the Phase 0/1/2 governance pattern in PRD §5.

---

## When things go wrong

| Symptom | Likely cause | Fix |
|---|---|---|
| `npm run build` fails on schema audit | Required schema field missing on a page | Check schema generator; add the missing field to the Sanity record or the template |
| Build fails on silo audit | Blog post has 0 or 2+ links to silo_target | Edit post body; ensure exactly 1 link UP |
| Build fails on orphan audit | A page has no inbound internal links | Add a link from a hub or sibling page |
| Lighthouse fails on Performance | Hero image too large or above-fold JS too heavy | Optimize hero image; move JS below-fold or to client:idle |
| Lighthouse fails on Accessibility | Color contrast or missing alt text or tap target | Audit with axe; fix specific violations |
| Coolify deploy fails | Env var missing | Check `.coolify/config.yaml` env list against Coolify dashboard |
| Form submission fails | LEAD_WEBHOOK_URL unset or unreachable | Set env var; confirm CRM is reachable |
| Map doesn't render | React island not mounting | Confirm `client:visible` directive; check React island bundle |

---

## Final note from Maren

This walkthrough is built for parallel execution. Phase 1A foundation runs sequentially (six steps, ~2 hours, single agent). Phase 1B templates parallelize across 4-6 agents. Phase 1C page instances parallelize across 6-8 agents. Phase 1D wire-up + deploy is sequential (~1.5 hours).

Total wall-clock with parallelization: 8-10 hours from green field to live demo.

If a single agent runs the whole thing sequentially: ~18-24 hours.

The PRD (`/tech/PRD_Phase-1_April-2026.md`) is the spec — when this walkthrough is ambiguous, the PRD is the source of truth. The canonical sitemap and sheet 05 are the URL truth. The Figma audit lists the P0 fixes.

Don't ship without all four gates green: schema valid, silo audit clean, Lighthouse green, accessibility clean. If a gate fails on a page, the page doesn't ship — fix it first.

— Maren
