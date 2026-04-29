# Architecture decision — Astro + React islands, build-time SSG, indexability-first

**Status:** Recommended — pending Chris approval
**Date:** 2026-04-25
**Author:** Maren Castellan-Reyes, Senior Director, Website & Application Experience
**Decision class:** Foundational. Reversing this after we ship costs months. Read it before you sign off.

---

## TL;DR

Build the Pro Exteriors site on **Astro 4.x with React islands**, deploy as **prerendered static HTML to Cloudflare Pages or Vercel**, source content from a **headless CMS (Sanity preferred)** with the option of MDX-in-repo for engineering-authored content. The interactive US map is the existing `@proexteriors/office-locations-map` React component, mounted as a `client:visible` island only on the routes that need it. Every other route ships as zero-JS HTML.

This is the recommendation because it is the single architecture that simultaneously (a) eliminates the indexability failure mode you cited, (b) honors the existing built React map without rewriting it, (c) scales to ~180 indexed pages by Month 12 without a runtime server, (d) gives us deterministic Core Web Vitals, and (e) survives the engagement's hard gates in CLAUDE.md §4.

**It is not** Next.js, and it is not a hybrid Astro-plus-React-shell. Both options are evaluated below; both fail at least one gate.

---

## 1 · The indexability failure mode you flagged — and the engineering answer to each line

You sent a list of failure modes that kill SEO on AI-coded sites. I am taking that list as a contract — not a bullet list of vibes, but a set of binary engineering gates this architecture has to pass. Below: each failure mode → why this architecture eliminates it → the verification check that proves it shipped that way.

### 1.1 "No Server-Side Rendering — Google sees an empty `<div>`"

**Eliminated by:** Astro renders **every page to a static HTML file at build time.** There is no client-side rendering, no SPA shell, no hydration of root content. The HTML returned for `/commercial-roofing/tpo/` already contains every word, every heading, every link, every schema block, every image `alt`, every meta tag. No JavaScript needs to run for Google to see it. This is mathematically the strongest possible position for crawler-readability — the markup is the deliverable.

**Verification gate:** Pre-launch, run `curl -s https://staging.proexteriors.com/commercial-roofing/tpo/ | grep -o '<h1>.*</h1>'` for every URL in the sitemap. Every URL must return its H1 with no JS execution. CI fails the build if any URL fails this check.

### 1.2 "JS-Heavy Architecture — render queue delays indexing for weeks"

**Eliminated by:** **Astro ships zero JavaScript by default.** Components render server-side at build time and produce HTML. JS is only added when explicitly opted in via a `client:*` directive on a specific component. On a typical service page (TPO, EPDM, City) the page weighs **0 KB of JS**. On the locations hub — the only page where the React map mounts — JS is ~80 KB gzip (React + d3-geo + topojson + the component), loaded `client:visible` *after* the page is parsed and indexable.

**Verification gate:** Lighthouse run on every template in CI. Total JS budget per page: 0 KB on content templates, ≤120 KB on map-bearing routes. Hard fail in CI if exceeded.

### 1.3 "Hash-Based Routing (`#/`) — search engines can't crawl"

**Eliminated by:** Astro uses **filesystem-based routing.** A page at `src/pages/commercial-roofing/tpo.astro` is served at `/commercial-roofing/tpo/`. Real URL, real HTML file in the build output, real entry in `sitemap.xml`. There is no client-side router, no `#`, no query-string state for navigation. There is also no opportunity for someone to accidentally introduce hash routing — the framework does not support it.

**Verification gate:** Build output is a directory of `.html` files mirroring the URL structure. CI inspects `dist/` and fails if any expected URL is missing a corresponding `.html` file.

### 1.4 "Missing Sitemap"

**Eliminated by:** `@astrojs/sitemap` integration generates `/sitemap-index.xml` and `/sitemap-0.xml` automatically from the build, includes every prerendered route, sets `lastmod` to the file's `git log` mtime via a custom serializer, and excludes routes flagged with `noindex`. Submitted to Google Search Console and Bing Webmaster Tools as part of launch checklist.

**Verification gate:** Sitemap exists, validates against `sitemaps.org` schema, contains every expected URL, contains no unexpected URL, every URL returns `200`, and is referenced from `robots.txt`. All four checked in CI.

### 1.5 "Orphan Pages"

**Eliminated by:** Two structural rules baked into the build:
1. **Internal-link audit in CI.** A build step crawls the static output and asserts every URL in the sitemap has at least one inbound internal link from another page in the build. Zero-inbound pages fail the build.
2. **Reverse-silo enforcement** per the SEO architecture doc — every money page is anchored by a silo (pillar → cluster → money page), and the build refuses to ship a money page whose silo isn't fully wired.

**Verification gate:** CI orphan-page audit. Zero orphans permitted at launch.

### 1.6 "Thin / Duplicate Content"

**Eliminated by, partially — this is a content gate, not an engineering one:** Templates do not generate content; they enforce *structure*. The CMS schema for `service-detail` and `city-detail` requires unique copy fields per record (no template-default text), unique project photos per city (per Sitemap §2 rule 3), and a minimum word count per page enforced by build-time validation. The build refuses to ship a city page that reuses copy from another city.

**Verification gate:** Build-time content validation. Every record passes the schema's required-field check before HTML is emitted. Every record's copy hashed and compared against the corpus — duplicates fail the build with a delta report.

### 1.7 "No Backlinks / Authority"

**Out of scope for the architecture decision.** This is a marketing problem solved by the digital PR program, the topical-authority attack plan, and the existing domain authority of `proexteriorsus.com` carried via redirect map (the `proexteriors_links_all.csv` already in `/brand-assets/client/Client Data/`). Calling it out so we don't pretend the architecture solves it.

### 1.8 "Default Subdomains"

**Eliminated by:** Production domain is `proexteriors.com` (or whichever apex Pro Exteriors confirms in discovery), bound at the host. Staging lives on a no-index subdomain with HTTP basic auth and `X-Robots-Tag: noindex` header. Staging is never linked from production.

### 1.9 "`noindex` tags accidentally included"

**Eliminated by:** Build-time check that asserts no production page contains `<meta name="robots" content="noindex">` unless it's on the explicit allow-list (e.g., `/thank-you/*`, `/portal/*`). CI fails the build if a noindex slips into a production-eligible route.

### 1.10 "`robots.txt` blocking"

**Eliminated by:** `robots.txt` is a checked-in file under `public/robots.txt`, code-reviewed, with the only `Disallow` lines being intentional (e.g., `/portal/`, `/thank-you/`). Sitemap reference included. CI fails if `robots.txt` contains `Disallow: /` on a production build.

### 1.11 "Unique metadata on every route"

**Eliminated by:** Every Astro page extends a `BaseLayout.astro` that requires `title` and `description` props. Build-time validation asserts:
- Every page has a unique `<title>` (no duplicates across the corpus)
- Every page has a unique `<meta name="description">` between 120 and 160 characters
- Every page has a canonical URL
- Every page has Open Graph + Twitter Card tags
- Every page has at least one schema.org JSON-LD block (see §3)

CI fails the build if any of those assertions fail on any route.

---

## 2 · Why Astro and not Next.js or hybrid

| Criterion | Astro + React islands | Next.js 15 App Router | Hybrid (Astro static + Next on dynamic routes) |
|---|---|---|---|
| Default HTML payload | Pure server-rendered HTML, 0 KB JS | Server Components produce HTML, but framework runtime always ships | Mixed — depends on route |
| Risk of client-only render | None — framework forbids it for non-island content | Real — `'use client'` propagation is easy to misuse | Real on the Next side |
| JS payload on a typical service page | 0 KB | 80–150 KB framework runtime + page bundle | Mixed |
| Build output | Directory of `.html` files | `.next/` build artifact, requires Node runtime or Vercel adapter | Two build pipelines |
| Hosting cost at scale (~180 pages) | ~$0 on Cloudflare Pages or $20/mo Vercel | $20–60/mo Vercel + function execution time | Both |
| Indexability guarantee | Architectural — cannot ship a page that isn't HTML | Operational — depends on team discipline | Architectural for static, operational for Next |
| Map component compatibility | Drop-in via `@astrojs/react` + `client:visible` | Native | Native on Next side |
| 50–60 → 180 page scaling | Trivial — build is parallel and outputs static files | Fine — but the framework has more to do per route | Two systems to scale |
| Engineering team size needed | One mid-level frontend, one CMS-aware editor | Same plus DevOps for runtime monitoring | Larger — two stacks |
| Time-to-first-byte at edge | Sub-50ms (file off CDN) | 100–400ms with cold function starts | Mixed |
| Deployment failure mode | Build fails — site doesn't update | Build or runtime fails — site can degrade silently | Both |

**Why I am not recommending Next.js:** every problem Next.js is built to solve — server components, runtime data fetching, edge functions, ISR — we do not have. Pro Exteriors is a marketing site. There is no authenticated content surface in this engagement (the customer portal at `/portal/` is a Centerpoint SSO link-out, not something we're building). There is no real-time data on any page. There are no logged-in views. Every page can be regenerated on a 24-hour cadence and that's still over-fetching. Choosing Next.js for a marketing site is choosing a runtime to manage when we don't need a runtime. It also makes the indexability gates *operational* (depends on whether engineers wrote `'use client'` correctly) rather than *architectural* (the framework physically cannot ship a non-HTML page). On a retainer where 1.1 through 1.11 above are non-negotiable, that distinction is the entire ballgame.

**Why I am not recommending hybrid:** running both Astro and Next is two build pipelines, two deployment surfaces, two component conventions, two state-management stories, two CSS strategies if we let it slide. The cost in engineering hours and in mental overhead is enormous, and the only justification for paying it is if part of the site needs server-rendered runtime data — which Pro Exteriors does not.

---

## 3 · Schema.org strategy (the gate Chris specifically called out)

Every template gets a deterministic schema contract enforced at build time. No "we'll add schema later" — the schema block is part of the template, not a blog post afterthought.

| Template | Required schema(s) | Notes |
|---|---|---|
| `home` | `Organization`, `WebSite`, `LocalBusiness`, `BreadcrumbList` | One LocalBusiness per HQ; satellite offices appear under `Organization.location` |
| `service-detail` (commercial + residential) | `Service`, `BreadcrumbList`, `FAQPage` (when FAQs present) | `provider` references the LocalBusiness from `home` |
| `city-detail` | `LocalBusiness` (city-scoped), `Service`, `BreadcrumbList`, `FAQPage` | `LocalBusiness.areaServed` is the city; address points to nearest physical office |
| `case-study-detail` | `CaseStudy` (custom type via `CreativeWork`), `Article`, `BreadcrumbList` | `about` references the relevant `Service` |
| `case-study-hub`, `projects/[category]` | `CollectionPage`, `BreadcrumbList`, `ItemList` of case studies | |
| `pillar` (blog hubs) | `CollectionPage`, `BreadcrumbList`, `ItemList` of supporting posts | |
| `blog-post` | `Article`, `BreadcrumbList`, `FAQPage` (when FAQs present), `Author` | Author is a real person on `/about/leadership/` |
| `about`, `leadership` | `AboutPage`, `Person` (one per leader) | |
| `careers-posting` | `JobPosting`, `BreadcrumbList` | Required fields: `title`, `description`, `datePosted`, `validThrough`, `hiringOrganization`, `jobLocation` |
| `contact-hub` / `contact-form` | `ContactPage`, `Organization` | |
| `proplan` and sub-routes | `Service`, `Offer`, `BreadcrumbList` | |
| `legal` | `WebPage` only — minimal | |

**Enforcement:** every page's JSON-LD is validated at build time against schema.org's published JSON Schema definitions, then a final run hits **Google's Rich Results Test API** for every URL on staging before launch. CI fails the build if any required field is missing on any route. CLAUDE.md §4 already requires this; this just makes it real.

**Where the data comes from:** the CMS schema for each record holds the source data (e.g., a Service record has its name, description, provider link, etc.). The schema block is generated from the record at build time — it cannot drift from the visible page content because both come from the same CMS field.

---

## 4 · The React island contract

The existing `@proexteriors/office-locations-map` package is pulled in as a peer-dep React component and rendered inside an Astro page like this:

```astro
---
import OfficeLocationsMap from '@proexteriors/office-locations-map';
---
<BaseLayout title="…" description="…">
  <h1>Where we work</h1>
  <p>… server-rendered intro, lists every state for crawlers …</p>

  <OfficeLocationsMap client:visible
    activeStates={["TX","KS","CO","GA","NC","MO"]}
    licensedStates={["LA","SC","OK","NE","MN","MS","AL","AR","TN","KY"]}
  />

  <ul class="states-fallback">
    <!-- Server-rendered list of every state with every office, links to /locations/[slug] -->
  </ul>
</BaseLayout>
```

Three things to notice:

1. **The map mounts `client:visible`** — the JS doesn't load until the user scrolls to it. Above-the-fold content on the locations hub stays JS-free.
2. **A server-rendered fallback list ships in the same HTML.** Crawlers see every state, every office, every internal link to `/locations/[slug]/` regardless of whether the SVG ever paints. The map is decoration on top of a fully indexable list, not a replacement for it. This is the SEO equivalent of progressive enhancement done right.
3. **Other pages — homepage, services, etc. — that show the map embed it the same way.** The component is reused. The fallback list is the source of truth for crawlers.

**Where else React islands live, beyond the map:**
- Quote / inspection forms — likely React-Hook-Form + Zod, mounted `client:idle`
- ROI calculator on `/proplan/roi-calculator/` — React island, `client:visible`
- Filterable case study gallery on `/projects/` — could be Astro-native (no JS) or React island depending on filter UX. **Default to Astro-native** until proven otherwise. Filtering via URL params and full page reload is fine for SEO and 99% of users.

**Where React islands explicitly do not go:** anything that's just a hover effect, a sticky nav, a mobile menu drawer, an accordion, a tab group, a carousel. Those are CSS + a few lines of vanilla JS in a `<script>` block, not a React component. We are not paying React's overhead for behavior the platform handles natively.

---

## 5 · CMS choice — Sanity preferred, MDX-in-repo as fallback

| | Sanity | Contentful | MDX-in-repo |
|---|---|---|---|
| Editorial UX for non-engineers | Excellent (Studio is purpose-built) | Good but rigid | Bad — engineers must commit |
| Content modeling flexibility | Excellent — references, portable text, custom inputs | Good, but harder to extend | Whatever you put in frontmatter |
| Cost at our scale | ~$15–99/mo | ~$489/mo for required tier | Free |
| Build speed | Fast — GROQ queries against the API | Slower — REST/GraphQL with rate limits | Fastest — files on disk |
| Versioning | Built-in | Built-in | Git |
| Live preview on staging | First-class | Available | Manual |
| Risk of vendor lock-in | Low — content is portable JSON | Medium | Zero |

**Recommendation:** Sanity for everything customer-managed (services, cities, case studies, leadership, blog posts, careers postings). MDX-in-repo for legal pages, error pages, and any engineer-authored content that doesn't change without a code review. This is a clean split that gives Pro Exteriors editorial independence on the high-velocity content surfaces and gives us guardrails on the low-velocity legal surfaces.

---

## 6 · Hosting, edge, image pipeline

- **Host:** Cloudflare Pages (preferred, free tier covers our traffic) or Vercel ($20/mo Pro). Pick at deploy time, not now.
- **CDN:** native to either host. No additional CDN layer.
- **Edge geo-personalization for commercial-vs-residential** (CLAUDE.md §7): NOT a launch feature. The dual-router is structural in the homepage hero and the mega-nav per the Sitemap §1.1 rule. We can add edge-level adaptive content in Phase 2 if measurement says it moves a number.
- **Images:** Cloudflare Images for the project gallery pipeline. Astro's `<Image>` component with the `@astrojs/image` integration handles `srcset`, AVIF/WebP fallbacks, lazy loading, dimensions emitted to prevent CLS. The Texas Motor Speedway hero video lives on a video CDN (Cloudflare Stream or Mux) with poster image and `preload="metadata"` only.
- **Fonts:** self-hosted via `@fontsource/*` or direct `.woff2` files in `public/fonts/`. No Google Fonts CDN — it adds DNS lookup latency and a render-blocking request that costs us LCP.

---

## 7 · Forms and lead routing

Forms are React islands (React-Hook-Form + Zod) mounted `client:idle`. On submit:
1. Client-side validation
2. POST to a single Astro endpoint (`src/pages/api/lead.ts`) — runs as a Cloudflare Worker function
3. Worker validates server-side, applies rate limiting, calls the CRM (HubSpot or Salesforce — confirm with Pro Exteriors during discovery, per CLAUDE.md §7 default)
4. Worker also fires a Slack webhook for the sales team's emergency-leak channel
5. Redirect to `/thank-you/[vertical]/` (which is `noindex` and where conversion is fired)

This keeps the form light, keeps the CRM credentials off the client, and gives us one chokepoint to instrument every conversion.

---

## 8 · Analytics and measurement

- **GA4 + PostHog** per CLAUDE.md §7
- Events instrumented at the Astro layer, not the React island, so non-JS users (crawlers, assistive tech in some configurations) still trigger pageviews via fallback `<noscript>` pixel
- Conversion goals defined *before* any page ships per CLAUDE.md §4
- A/B testing layer: deferred to Phase 2 — Statsig or VWO chosen after we have baseline traffic to test against

---

## 9 · What we ship in week one (so this doesn't stay theoretical)

1. Astro project scaffold with TypeScript strict
2. `BaseLayout.astro` with the meta/og/canonical/schema/breadcrumb contract baked in
3. CI pipeline running: HTML rendered for every route, sitemap valid, no orphans, no accidental noindex, Lighthouse ≥95 on a representative page, Schema.org JSON-LD validated
4. `@proexteriors/office-locations-map` wired and rendering on a stub `/locations/` page
5. Stub homepage rendering with the existing Figma copy (treated as placeholder per Chris's earlier answer)
6. Cloudflare Pages preview deploy with HTTP basic auth and `noindex` headers

Week one ends with a URL Chris can hand to the client to look at *and* a Lighthouse report card.

---

## 10 · Risks I am accepting, and the one I am not

**Accepting:**
- Sanity license cost at scale — manageable, can downgrade to Lite if usage stays modest
- Astro 4 → 5 migration when 5 stabilizes — Astro has a clean upgrade path; we eat the work
- Cloudflare Pages build minute limits if the build grows large — solvable by splitting builds or moving to Vercel

**Not accepting:**
- Any architecture where indexability is operational rather than architectural. If a future request comes in for "let's just use Next.js for the customer portal too," the answer is no — we link out to Centerpoint. The marketing site stays Astro.

---

## 11 · What I need from Chris to move past planning

1. **Sign off on Astro + React islands as the architecture.** Or push back with specifics.
2. **Confirm CMS choice** — Sanity ($15–99/mo) preferred, but if Pro Exteriors has an existing CMS license they want us to use, surface it now before I scaffold.
3. **Confirm the host** — Cloudflare Pages or Vercel. I lean Cloudflare for cost; Vercel has a slightly better DX. Either works.
4. **Confirm the production apex domain** — I assume `proexteriors.com`; the existing site is `proexteriorsus.com`. Migration plan is its own decision doc.
5. **Confirm CRM** — HubSpot or Salesforce or other. Affects the lead-routing Worker contract.
6. **Optional:** the 16 Figma page names so I can match them to the 18 templates in the sitemap doc and flag any gap.

I'll drop the formal tech stack PRD into `/tech/PRD-tech-stack.md` once you've signed off on this. The architecture is the load-bearing decision; the PRD is the bill of materials that follows from it.

---

## Decision history

- **2026-04-25 v1.0** — Initial recommendation. Triggered by Chris confirming "Option 1 — Astro + React islands" and adding the indexability brief as a hard constraint.
