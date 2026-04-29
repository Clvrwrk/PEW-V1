# Google Stitch AI Design Prompts — Pro Exteriors

**Sequence:** Design System → Home → Services Hub (Commercial) → Services Hub (Residential) → Service Detail → Roof Asset Management → Locations Hub → City/Location Detail → Case Studies Hub → Case Study Detail → About Us → About Sub-page → Blog Hub → Blog Post → Contact → Careers → Customer Portal

Run these in order. Each prompt assumes the previous output exists as context.

---

## Prompt 1: Design System

Design a comprehensive design system for Pro Exteriors, a commercial and residential roofing company. The brand conveys institutional credibility, transparency, and craftsmanship — it should feel like a trusted infrastructure partner, not a commodity contractor.

**Color palette:** Deep navy primary (#1B2A4A), warm white (#FAF8F5), safety orange accent (#E8612D), steel gray (#6B7B8D), forest green (#2D5A3D). Use navy as the dominant color. Orange is reserved for CTAs and critical actions only — never decorative. Green for success states and trust indicators.

**Typography:** Use a clean, high-contrast sans-serif for headlines (similar to Inter or DM Sans weight range). A highly legible serif or humanist sans for body copy. Modular scale at 1.25 ratio, base 16px. Type sizes from 12px (legal) to 61px (display hero). Line heights: 1.15 for display, 1.3 for headings, 1.6 for body.

**Spacing:** 4px base unit. Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128. Section padding 64–96px vertical. Component internal padding 16–24px.

**Components needed:** Primary button (orange), secondary button (navy outline), ghost button, card (service card, case study card, testimonial card, stat card), form inputs, navigation bar (desktop mega menu + mobile hamburger), footer (4-column), hero section (video background variant), trust badge row, section headers, breadcrumbs, pagination, tabs, accordion/FAQ, modal, toast notifications, tag/badge pills, data tables.

**Grid:** 12-column, 1280px max-width, 24px gutters, responsive breakpoints at 375, 768, 1024, 1280, 1440.

**Accessibility floor:** WCAG 2.2 AA. Minimum 4.5:1 contrast on body text, 3:1 on large text. Focus states on every interactive element. Touch targets minimum 44×44px.

**Aesthetic:** Premium but approachable. Clean lines, generous white space, photography-forward. No gradients, no drop shadows on cards (use subtle borders or elevation via background contrast). Rounded corners at 8px for cards and buttons, 4px for inputs. The overall feel should be closer to a top-tier B2B SaaS site than a typical contractor website.

---

## Prompt 2: Home Page

Design the homepage for Pro Exteriors roofing company using the established design system.

**Hero section:** Full-bleed background video (Texas Motor Speedway aerial showing massive commercial roof installation). Headline overlay: confident, short — something like "Roofing Partner. Not Just a Contractor." Subhead addresses the two audiences. Two CTA buttons: "Commercial Solutions" (primary orange) and "Residential Services" (secondary outline). Dark overlay on video for text contrast. Poster image loads first for performance.

**Section flow (top to bottom):**
1. Hero with video, headline, dual CTAs
2. Trust badge row — BBB A+, Google rating, years in business, states served, square footage installed. Horizontal scroll on mobile.
3. Dual-audience routing — two large cards side by side: Commercial (procurement officers, facilities managers) and Residential (homeowners). Each card has distinct imagery, a value proposition, and a CTA routing to the respective hub.
4. Services overview — 4–6 service category cards in a grid. Icons or photos, short descriptions, links to service detail pages.
5. Interactive US map — SVG-based, states highlighted where Pro Exteriors operates (16 states). Clickable pins for 6 office locations (Richardson TX, Euless TX, Wichita KS, Denver CO, Valdosta GA, North Carolina). Legend distinguishing headquarters, B&M offices, and satellite offices.
6. Case study showcase — 3 featured projects in a horizontal card layout. Before/after imagery, project scope, location. "View All Projects" link.
7. Social proof — testimonial carousel mixing commercial and residential reviews. Pull from Google Reviews. Star ratings visible. Client name, project type, city.
8. Why Pro Exteriors — 3–4 differentiator blocks: responsiveness ("We pick up the phone"), accountability ("Every promise documented"), expertise ("Manufacturer-certified crews"), community ("Pro Ministries — giving back").
9. Blog/resources teaser — 3 latest articles in card format.
10. Final CTA banner — bold, full-width. "Ready to talk about your roof?" with phone number and form link.
11. Footer — 4-column: Services, Locations, Company, Resources. Plus certifications, social links, legal.

**Key constraints:** Must feel like two front doors on one site. A commercial visitor and a residential visitor should both feel this site was built for them within the first viewport. No interstitial "choose your path" — the routing happens naturally through the dual-audience section.

---

## Prompt 3: Commercial Services Hub

Design the Commercial Services Hub page for Pro Exteriors using the established design system.

**Purpose:** This is the pillar page for commercial roofing — the single most important SEO page on the site. Target keyword: "commercial roofing contractor Dallas." It must establish authority, route to service details, and drive RFQ conversions.

**Hero:** Interior page hero — strong commercial imagery (large-scale roof installation, warehouse or campus aerial). H1: geo-modified commercial roofing headline. Subhead establishing experience and scale. Primary CTA: "Request a Roof Assessment."

**Section flow:**
1. Hero with H1, subhead, RFQ CTA
2. Commercial value proposition — 3–4 stat cards (years in business, square footage installed, client retention rate, states served)
3. Service category grid — cards for each commercial service: TPO, EPDM, modified bitumen, metal roofing, flat roof systems, roof coatings, emergency repairs. Each card links to a service detail page.
4. Manufacturer certifications — logo row of certified manufacturer partnerships with brief explanation of what certification means for warranty
5. The Pro Exteriors difference (commercial-specific) — responsiveness, documentation, project management, warranty follow-through. Targeted at facilities directors and procurement officers.
6. Featured commercial case studies — 3–4 project cards filtered to commercial work. Vertical labels (healthcare, education, industrial, retail).
7. Service area section — condensed map or list of commercial service cities with links to city detail pages
8. FAQ accordion — sourced from People Also Ask for "commercial roofing contractor" queries. FAQPage schema.
9. Conversion CTA banner — "Get Your Executive Roof Assessment" with progressive form (company name, facility type, square footage, timeline)

**Tone:** Institutional, precise, confident. This page speaks to someone who evaluates contractors professionally. No casual language.

---

## Prompt 4: Residential Services Hub

Design the Residential Services Hub page for Pro Exteriors using the established design system.

**Purpose:** Pillar page for residential roofing. Must serve two emotional states: the storm-damage homeowner who needs help NOW, and the planned-replacement homeowner doing research. Target keyword: "residential roofing DFW."

**Hero:** Warm, residential imagery — beautiful home with a new roof, neighborhood context. H1: residential roofing headline. Subhead addressing both urgency and quality. Two CTAs: "Emergency Roof Repair" (primary orange — urgency) and "Plan Your New Roof" (secondary — deliberate).

**Section flow:**
1. Hero with dual-path CTAs
2. Emergency vs. planned — two distinct content paths presented visually. Left: "Roof Damage? We're on it in 48 hours" with storm damage imagery, urgency language, and inspection CTA. Right: "Planning Your Dream Roof" with premium home imagery, consultative language, and consultation CTA.
3. Residential services grid — shingles, metal roofing, tile, slate, flat roof, gutters, siding. Photo cards linking to detail pages.
4. Trust signals — Google review aggregate, BBB rating, local awards. Emphasize "local, not a storm chaser" messaging.
5. How it works — 4-step process: Free Inspection → Detailed Proposal → Expert Installation → Warranty & Follow-Up. Visual timeline or numbered steps.
6. Residential case studies — 3 featured homes with before/after photos. Neighborhood, scope, homeowner testimonial.
7. Financing / pricing transparency section — "We believe in transparent pricing" with explanation of what an estimate includes. No bait-and-switch messaging.
8. FAQ accordion — residential-specific PAA questions. "How much does a new roof cost?" "How long does roof replacement take?" etc.
9. Final CTA — warm, reassuring. "Your roof protects everything underneath it. Let's make sure it's right."

**Tone:** Warm, reassuring, expert. Speaks to homeowners who are spending significant money on something they can't evaluate themselves. Empathetic to the stress of storm damage.

---

## Prompt 5: Service Detail (Template)

Design a reusable Service Detail page template for Pro Exteriors using the established design system. This template will be used for 10–14 individual service pages (TPO roofing, metal roofing, asphalt shingles, etc.).

**Hero:** Service-specific imagery. H1 with target keyword. Breadcrumb navigation above. Brief intro paragraph positioning the service.

**Section flow:**
1. Hero + breadcrumbs + intro
2. Service overview — what it is, where it's used, why Pro Exteriors recommends it for specific applications. 2-column: text left, image right.
3. Benefits/features grid — 4–6 benefit cards with icons. Performance stats where applicable (lifespan, energy savings, warranty years).
4. Applications section — which building types or situations this service fits. Commercial vs. residential callout if applicable.
5. The Pro Exteriors approach — how the team handles this specific service. Crew certifications, manufacturer partnerships, quality control steps.
6. Photo gallery — project photos specific to this service type. Lightbox for full-size viewing.
7. Related case studies — 2–3 case study cards filtered to this service type.
8. FAQ accordion — service-specific PAA questions. FAQPage schema.
9. Related services — horizontal card row linking to complementary services.
10. CTA banner — service-specific conversion offer ("Get a TPO Roof Assessment" / "Schedule Your Shingle Inspection")

**Template flexibility:** The layout stays consistent but content blocks can be shown/hidden per service. Some services (like gutters or siding) may skip the applications section. Commercial-only services hide the residential proof. The CMS controls visibility.

---

## Prompt 6: Roof Asset Management (ProPlan)

Design the Roof Asset Management page for Pro Exteriors using the established design system. This is a dedicated page for their ProPlan maintenance program — a recurring revenue product distinct from project-based roofing.

**Hero:** Imagery showing proactive roof inspection/maintenance, not reactive repair. H1 positioning ProPlan as a cost-saving program. Subhead: extend roof life, prevent emergency spend, protect your asset.

**Section flow:**
1. Hero + "Learn About ProPlan" CTA
2. The problem statement — what happens without proactive roof management. Stats on premature replacement costs, emergency repair premiums, warranty voiding.
3. How ProPlan works — 3–4 step visual: Comprehensive Assessment → Custom Maintenance Schedule → Proactive Repairs → Annual Reporting. Each step expands with detail.
4. Program tiers (if applicable) — comparison table or cards showing what each tier includes. Or a single program with clear deliverables list.
5. ROI calculator — interactive element where the user inputs square footage and roof age, gets an estimated savings projection. This is the conversion differentiator.
6. Who it's for — targeted sections for facilities managers, property management companies, building owners. Each with specific value props.
7. Client testimonials — ProPlan-specific. Facilities directors speaking to the value of ongoing maintenance.
8. CTA — "Schedule Your ProPlan Assessment" with form

**Tone:** Consultative, analytical. Speaks to the CFO and facilities director simultaneously. Data-driven.

---

## Prompt 7: Locations Hub

Design the Locations Hub page for Pro Exteriors using the established design system. This page centers on an interactive US map showing service coverage across 16 states.

**Hero:** Minimal — the map IS the hero. H1: "Serving [X] States from [X] Offices." Subhead: brief positioning.

**Main section — Interactive US Map:**
Full-width SVG-based United States map. States where Pro Exteriors operates are highlighted in brand navy (TX, KS, CO, GA, NC, LA, SC, OK, NE, MN, MS, AL, AR, TN, KY, MO). Non-service states in light gray. Clickable pins for each office: Richardson TX (HQ), Euless TX, Wichita KS, Denver CO, Valdosta GA, North Carolina. Legend: HQ pin, B&M office pin, satellite office pin. Each pin click opens a tooltip or side panel with office address, phone, and link to city detail page. States are clickable to show cities served in that state.

**Below the map:**
1. Office directory — cards for each physical office with address, phone, map embed, and "View local projects" link
2. Service area list — organized by state, with links to city-specific landing pages
3. "Don't see your city?" — CTA to contact with a note about expanding service areas

**Accessibility:** Full keyboard navigation on the map. ARIA labels on every state and pin. Screen reader announces state name and service status. Tab order follows geographic logic.

---

## Prompt 8: City/Location Detail (Template)

Design a reusable City/Location Detail page template using the established design system. This template is used for geo-targeted pages like "/commercial-roofing/dallas/" — one per city per vertical (commercial and residential).

**Hero:** City skyline or local landmark imagery. H1: "Commercial Roofing Contractor in [City], TX" (geo-modified keyword). Breadcrumbs. Local CTA: "Request a Roof Assessment in [City]."

**Section flow:**
1. Hero + geo-modified H1 + local CTA
2. City-specific intro — genuinely unique content referencing local context: neighborhoods served, building types common in that area, local weather patterns affecting roofs, local regulatory considerations.
3. Services available in this city — grid of service cards filtered to what's offered in this geography
4. Local project gallery — case studies and photos from completed work in THIS city specifically. Real addresses (with permission), real scope.
5. Local testimonials — reviews from clients in this city. Name, neighborhood, project type.
6. Google Maps embed — centered on the service area, showing the nearest office location
7. FAQ — city-specific questions. "How much does a commercial roof cost in Dallas?" "Do I need a permit for roof replacement in [City]?"
8. Nearby locations — links to adjacent city pages for internal linking

**Schema:** LocalBusiness with city-specific areaServed, geo coordinates, and service descriptions. Unique meta title and description per city.

---

## Prompt 9: Case Studies Hub

Design the Case Studies / Portfolio Hub page using the established design system. This is the proof engine — where procurement officers validate Pro Exteriors' claims.

**Hero:** Minimal. H1: "Our Work" or "Projects." Subhead: brief statement about track record.

**Main section — Filterable Gallery:**
Masonry or grid layout of case study cards. Each card: hero image, project name, vertical tag (healthcare, education, industrial, retail, residential, municipal), city, square footage. Hover state reveals brief scope description.

**Filters:** Filter bar at top. Filter by: vertical/industry, service type, city/state, project size. Active filters shown as removable pills. Results update without page reload.

**Pagination or infinite scroll:** Load 12 cards initially, load more on scroll or pagination click.

**Featured projects:** Top 3 pinned/featured case studies at the top before the filterable grid, displayed larger.

---

## Prompt 10: Case Study Detail (Template)

Design a reusable Case Study Detail page template using the established design system.

**Hero:** Full-width project hero image (completed roof, aerial shot, or dramatic before/after). H1: Project name. Metadata row: vertical, city, square footage, duration, roofing system.

**Section flow:**
1. Hero + metadata
2. Project overview — the challenge, the solution, the result. Narrative format, 2–3 paragraphs.
3. Before/after gallery — side-by-side or slider comparison images. Multiple angles.
4. Scope & specifications — detailed table or list: roofing system, square footage, timeline, manufacturer, warranty terms, special challenges.
5. Client testimonial — pull quote from the project contact. Name, title, organization.
6. Related projects — 3 cards linking to similar case studies (same vertical or same service type).
7. CTA — "Have a similar project? Let's talk." with assessment request form.

---

## Prompt 11: About Us

Design the About Us parent page using the established design system.

**Hero:** Team or company culture imagery. H1: company story headline. Brief history positioning (founded year, growth story, values).

**Section flow:**
1. Hero + company story intro
2. Company timeline / milestones — visual timeline: founding, key projects, Texas Motor Speedway partnership, expansion milestones, state count growth
3. Mission & values — concise value statements. Accountability, transparency, craftsmanship, community.
4. Leadership team — photo grid with name, title, brief bio. Click to expand or link to full bio.
5. Pro Ministries callout — dedicated section about the outreach program. Community involvement as a differentiator.
6. Certifications & partnerships — manufacturer logos, industry associations, awards
7. Careers CTA — "Join the team" with link to careers page
8. Sub-page navigation — cards linking to Mission, Pro Ministries, Operations & Leadership detail pages

---

## Prompt 12: About Sub-page (Template)

Design a reusable About sub-page template using the established design system. Used for Mission Statement, Pro Ministries Outreach, and Operations & Leadership pages.

**Layout:** Clean editorial layout. Hero with sub-page-specific imagery. H1. Long-form content area with generous typography. Pull quotes. Supporting imagery interspersed. Sidebar or bottom section with links to sibling about pages. Breadcrumb navigation.

**Flexibility:** The template handles text-heavy pages (Mission), media-heavy pages (Ministries with community photos), and people-focused pages (Leadership with team grid). Content blocks are modular and CMS-controlled.

---

## Prompt 13: Blog / Resources Hub

Design the Blog / Resources Hub page using the established design system.

**Hero:** Minimal. H1: "Resources" or "Insights." Subhead positioning the blog as educational content for both audiences.

**Layout:**
1. Featured post — large card at top with hero image, title, excerpt, author, date, category tag
2. Category filters — horizontal tab bar: All, Commercial Roofing, Residential Roofing, Metal Roofing, Roof Maintenance, Storm Damage, Industry News
3. Post grid — 3-column card grid. Each card: thumbnail, category tag, title, excerpt (2 lines), date. Alternating sizes optional (1 large + 2 small per row).
4. Pagination — numbered pagination at bottom
5. Sidebar (desktop) or bottom section: search bar, popular posts, newsletter signup CTA

---

## Prompt 14: Blog Post (Template)

Design a reusable Blog Post page template using the established design system. This template handles long-form SEO content (1,500–3,000 words) optimized with the POP methodology.

**Layout:** Article layout with generous reading width (720px max for text). 

1. Breadcrumbs + category tag
2. H1 title
3. Author byline, date, estimated read time
4. Hero image (full article width)
5. Table of contents (auto-generated from H2s, sticky on desktop sidebar)
6. Article body — supports H2/H3 structure (PAA questions as headings), images, pull quotes, data tables, callout boxes, embedded video
7. Author bio card at bottom
8. Related posts — 3 cards based on same category/pillar
9. CTA banner — contextual to the article topic ("Need commercial roof help? Request an assessment")
10. Comments or social sharing (optional, CMS-controlled)

**Schema:** Article schema with author, datePublished, dateModified, image, publisher.

---

## Prompt 15: Contact Us

Design the Contact page using the established design system.

**Hero:** Clean, minimal. H1: "Let's Talk About Your Roof." Subhead: "Whether it's a $2M commercial project or a residential repair, we're here."

**Main section — Dual-path form:**
Two-column layout on desktop. Left column: "Commercial Inquiry" with fields: company name, contact name, email, phone, facility type (dropdown), approximate square footage, project timeline, message. Right column: "Residential Request" with fields: name, email, phone, address, service needed (dropdown: inspection, repair, replacement, storm damage), preferred contact time, message.

Both forms share: submit button with clear action label, privacy note, expected response time ("We respond within 4 business hours").

**Below form:**
1. Direct contact info — phone number (click to call), email, office hours
2. Office locations — cards for each office with address and embedded Google Map
3. FAQ — contact-specific: "How quickly will you respond?" "Do you charge for inspections?" "What's your service area?"

---

## Prompt 16: Careers

Design the Careers page using the established design system.

**Hero:** Crew imagery — real team photos on job sites. H1: "Build Your Career with Pro Exteriors." Subhead about culture and growth.

**Section flow:**
1. Hero + culture statement
2. Why work here — 3–4 benefit cards: competitive pay, training/certifications, community involvement, career growth
3. Open positions — list or card layout. Each position: title, location, type (full-time/part-time), brief description, "Apply" button. Filter by location if multiple offices.
4. Company culture — photo gallery of team events, job sites, Pro Ministries involvement
5. Employee testimonials — quotes from current team members
6. Application CTA — general application form for when no specific position fits

---

## Prompt 17: Customer Portal

Design the Customer Portal / Login page using the established design system. This is a gateway to the Centerpoint platform via SSO.

**Layout:** Simple, focused. No distractions.

1. Pro Exteriors logo + nav (minimal — just logo and "Back to website" link)
2. Login card centered on page — clean, single-column: email/username, password, "Sign In" button, "Forgot password?" link
3. Brief value prop below login: "Access your project dashboard, documents, and invoices"
4. For non-customers: "Not a client yet? Learn how we work" with link to commercial or residential hub
5. Support contact: "Need help logging in? Call [phone] or email [email]"

**Note:** The actual portal functionality lives in Centerpoint. This page is the branded SSO entry point. Design it to feel like Pro Exteriors, not like a third-party redirect.
