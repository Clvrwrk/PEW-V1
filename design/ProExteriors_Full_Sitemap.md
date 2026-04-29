# Pro Exteriors — Full Sitemap
**§6.3 of Website Design Brief · AIA4 Pro Exteriors · April 2026**
Prepared by Maren Solveig Castellan-Reyes, Senior Director, Website & Application Experience

> **Principle.** Two front doors, one architecture. One domain, one CMS, one measurement stack, one compounding SEO authority — but distinct entry points, proof systems, and CTAs per vertical. Cross-silo content links prohibited (SEO §2.1 containment rule); only the global nav and footer bridge the verticals.

---

## 0 · Global / Always-present
- **Utility nav (top right)**
  - `Portal Login` → `/portal/` (Centerpoint SSO)
  - `Phone CTA` → `tel:+1##########` (click-to-call)
  - `Emergency Leak` → `/contact/emergency/` (residential fast path)
- **Primary nav**
  - Home · Services (mega) · Locations · Projects · About · Resources · Contact
- **Footer**
  - Company · Services (split commercial/residential) · Locations · Legal · Social · Certifications · Sitemap.xml · Accessibility Statement

## 1 · Home — `/`
Video hero (Texas Motor Speedway partnership) · Google reviews strip · Interactive US office map · Dual-audience router cards · Services overview · Case study highlights · Trust badges · Dual CTA (Request Assessment / Free Inspection)

### 1.1 · Dual-path router (interaction, not a URL)
- **Commercial path** → triggers `/commercial-roofing/` · CTA: *Request Roof Assessment (RFQ)*
- **Residential path** → triggers `/residential-roofing/` · CTA: *Free Inspection / Emergency*

---

## 2 · Commercial Vertical (80% revenue) — `/commercial-roofing/`

### 2.1 · Services (money pages — reverse-silo targets)
| # | Page | URL |
|---|---|---|
| C1 | TPO Roofing | `/commercial-roofing/tpo/` |
| C2 | EPDM Roofing | `/commercial-roofing/epdm/` |
| C3 | Modified Bitumen | `/commercial-roofing/modified-bitumen/` |
| C4 | Built-Up (BUR) | `/commercial-roofing/built-up/` |
| C5 | Commercial Metal | `/commercial-roofing/metal/` |
| C6 | Flat Roof Systems | `/commercial-roofing/flat-roof-systems/` |
| C7 | Commercial Repair | `/commercial-roofing/repair/` |
| C8 | Re-Roof / Replacement | `/commercial-roofing/replacement/` |
| C9 | Preventive Maintenance | `/commercial-roofing/maintenance/` |
| C10 | Warranty & Certifications | `/commercial-roofing/warranties/` |

### 2.2 · Service cities (templated — Tier-1 launch cohort)
Dallas · Fort Worth · Plano · Frisco · Irving · Arlington · McKinney · Denton · Richardson · Garland · Mesquite · Lewisville
URL pattern: `/commercial-roofing/[city-slug]/`
Rollout: Tier 1 at launch; Tier 2 cities (3–8 more) per SEO priority matrix §4.3.

### 2.3 · Conversion endpoints
- `/contact/commercial/` — RFQ form (progressive disclosure)
- `/contact/commercial/assess/` — Roof Assessment scheduler
- `/offers/portfolio-partnership/` — Portfolio Partnership (Offer C2, SLA-backed)
- `/offers/lifecycle-cost/` — Lifecycle Cost Worksheet (Offer C3)
- `/offers/peer-references/` — Peer Reference Package (Offer C4)
- `/contact/commercial/emergency/` — Commercial emergency intake
- `/thank-you/commercial/` — Confirmation + next steps

---

## 3 · Residential Vertical (20% revenue) — `/residential-roofing/`

### 3.1 · Services (money pages — reverse-silo targets)
| # | Page | URL |
|---|---|---|
| R1 | Asphalt Shingle Roofing | `/residential-roofing/asphalt-shingles/` |
| R2 | Impact-Resistant Shingles | `/residential-roofing/impact-resistant/` |
| R3 | Residential Metal | `/residential-roofing/metal/` |
| R4 | Tile Roofing (Premium) | `/residential-roofing/tile/` |
| R5 | Storm Damage Repair | `/residential-roofing/storm-damage/` |
| R6 | Emergency Leak Repair | `/residential-roofing/emergency/` |
| R7 | Full Roof Replacement | `/residential-roofing/replacement/` |
| R8 | Free Roof Inspection | `/residential-roofing/inspection/` |
| R9 | Insurance Claim Assistance | `/residential-roofing/insurance-claims/` |
| R10 | Gutters | `/residential-roofing/gutters/` |
| R11 | Siding & Exteriors | `/residential-roofing/siding/` |

### 3.2 · Service cities (templated)
Dallas · Plano · Frisco · Southlake · Highland Park · University Park · Westlake · Flower Mound · Fort Worth · Arlington · McKinney · Allen
URL pattern: `/residential-roofing/[city-slug]/`
*(Premium residential tilt: Highland Park, University Park, Southlake, Westlake get distinct copy and project gallery per §5 of the ICP framework.)*

### 3.3 · Conversion endpoints
- `/contact/residential/inspection/` — Free Inspection form
- `/contact/emergency/` — Urgent leak path (Offer R1: 48-Hour Response Guarantee)
- `/contact/residential/consult/` — Planned Replacement consultation
- `/residential-roofing/insurance-claims/` — Insurance Claim Assistant (Offer R2)
- `/offers/financing/` — Financing Calculator (Offer R3)
- `/offers/premium-consult/` — Premium Consultation (Offer R4)
- `/offers/storm-prep/` — Storm-Season Prep (Offer R5)
- `/thank-you/residential/` — Confirmation + next steps

---

## 4 · ProPlan — Roof Asset Management — `/proplan/`
*(Recurring-revenue program; crossover service marketed primarily to commercial ICPs but accessible to premium residential.)*
- `/proplan/` — Program overview
- `/proplan/tiers/` — Tier comparison
- `/proplan/roi-calculator/` — Interactive ROI tool
- `/proplan/how-it-works/` — Inspection & reporting workflow
- `/proplan/case-studies/` — Enrolled-client outcomes
- `/proplan/enroll/` — Enrollment contact endpoint

---

## 5 · Locations / Service-Area — `/locations/`
- `/locations/` — Interactive US map hub
- `/locations/dfw/` — DFW Metroplex regional page
- `/locations/north-tx/` — North Texas regional
- `/locations/service-areas/` — Multi-state coverage
- `/locations/dallas-hq/` — Dallas HQ (real B&M)
- `/locations/[satellite-offices]/` — Additional offices per client roster
- Hidden: LocalBusiness schema pages per service area (`schema-only`, indexed via sitemap.xml)

---

## 6 · Projects / Case Studies — `/projects/`
- `/projects/` — Filterable portfolio hub
- `/projects/healthcare/` · `/projects/education/` · `/projects/industrial/` · `/projects/retail/` · `/projects/multi-family/` · `/projects/faith-nonprofit/` · `/projects/premium-residential/` · `/projects/storm-recovery/`
- `/projects/[case-study-slug]/` — **template.** Before/after · scope · timeline · testimonials · related services · CaseStudy + CreativeWork schema

---

## 7 · About / Trust — `/about/`
- `/about/` · `/about/mission/` · `/about/leadership/` · `/about/pro-ministries/` · `/about/safety/` (EMR) · `/about/certifications/` (GAF/Carlisle/Versico/etc.) · `/about/crews/` (real photos only — CLAUDE.md §5 never-do) · `/about/warranty/` · `/about/press/`
- `/careers/` — Careers hub · `/careers/[position-slug]/` — individual postings

---

## 8 · Resources / Blog — `/blog/` (Reverse-silo architecture)

13 topical pillars, each a money-adjacent hub with 3–7 supporting posts that link back to the pillar and to 1–2 siblings (and nowhere else). 60–70 supporting posts by Month 12.

| # | Pillar | URL |
|---|---|---|
| 1 | Commercial Roofing | `/blog/commercial-roofing/` |
| 2 | Metal Roofing | `/blog/metal-roofing/` |
| 3 | Asphalt Shingles | `/blog/asphalt-shingles/` |
| 4 | Roof Repair & Leak | `/blog/roof-repair/` |
| 5 | Residential Roofing | `/blog/residential-roofing/` |
| 6 | Roofing Education | `/blog/education/` |
| 7 | Replacement & Cost | `/blog/replacement-cost/` |
| 8 | Local (City intent) | `/blog/local/` |
| 9 | Gutters | `/blog/gutters/` |
| 10 | Siding & Exteriors | `/blog/siding/` |
| 11 | Energy & Solar | `/blog/energy-solar/` |
| 12 | Waterproofing | `/blog/waterproofing/` |
| 13 | Storm & Insurance | `/blog/storm-insurance/` |

Supporting post template: `/blog/[slug]/` · Article + FAQPage schema · internal links ONLY to silo siblings + pillar target.

---

## 9 · Contact / Conversion — `/contact/`
- `/contact/` (dual-path router) · `/contact/commercial/` · `/contact/residential/` · `/contact/emergency/` · `/contact/general/`
- `/thank-you/commercial/` · `/thank-you/residential/`

---

## 10 · Utility / System / Legal
- `/privacy/` · `/terms/` · `/accessibility/` · `/cookies/`
- `/404/` · `/500/` · `/sitemap.xml` · `/robots.txt`

---

## Sitemap totals — launch cohort

| Category | Unique URLs at launch |
|---|---:|
| Home | 1 |
| Commercial services | 10 |
| Commercial cities (T1) | 12 |
| Commercial conversion endpoints | 7 |
| Residential services | 11 |
| Residential cities (T1) | 12 |
| Residential conversion endpoints | 8 |
| ProPlan | 6 |
| Locations | 5 + schema-only pages |
| Projects | 1 hub + 8 categories + N case studies |
| About | 9 + Careers |
| Blog hub + 13 pillars | 14 |
| Contact + thank-you | 7 |
| Utility/Legal/System | 8 |
| **Total launch URLs (T1)** | **~115** |
| **+ Supporting blog posts by M12** | **+60–70** |
| **Projected indexed pages by M12** | **~180** |

**Unique page templates (engineering build list): 18**
home · dual-path-router (interaction) · hub · service-detail · city-detail · case-study-hub · case-study-detail · pillar · blog-post · about · leadership · careers-hub · careers-posting · contact-hub · contact-form · thank-you · legal · error (404/500).

---

## Critical IA rules (non-negotiable — see SEO Architecture §2)
1. **Containment.** Supporting blog posts link only to silo siblings + their pillar target. No author bios, no "related posts" widgets, no homepage link from body copy.
2. **No cross-silo body links.** Commercial posts do not link to residential posts in content. Global nav/footer are the only cross-vertical bridges.
3. **City pages must be unique.** Templated layout but unique copy, unique project photos, unique testimonials, LocalBusiness schema per city.
4. **Every money page is a reverse-silo target.** If a money page isn't anchored by a silo, it doesn't get built.
5. **Two front doors, one architecture.** Never a splash interstitial. Router lives in the home hero and in persistent mega nav.

---

*This document and the accompanying Excalidraw diagram (`ProExteriors_Full_Sitemap.excalidraw`) together constitute §6.3 of the Website Design Brief. They supersede the Relume prompt used for the interim generation.*
