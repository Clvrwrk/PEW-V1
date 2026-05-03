# TPO Roofing Systems — Figma frame structure

**File:** `n8EC2AgOcubGyfEq7YJoiW` (Pro Exteriors – Design Build)
**Frame:** `9:3144` (Main) — 1280 × 6104
**Cached:** 2026-05-03 (Maren)
**Source:** [Figma node](https://www.figma.com/design/n8EC2AgOcubGyfEq7YJoiW/Pro-Exteriors---Design-Build?node-id=9-3144&m=dev)

This file is the structural canon for the TPO pillar page rebuild. The Stitch
Tailwind export Chris originally pasted collapsed every grid into a single-column
flex stack — this is the corrected blueprint.

## Section map (top → bottom)

| # | Node | Section | Dimensions | Layout |
|---|---|---|---|---|
| 1 | `9:3145` | Hero | 1280 × 614 | Background image, breadcrumb + H1 + subhead overlay |
| 2 | `9:3163` | Service Overview | 1216 × 624 | 2-col split: text-left (576) / image-right (576×432) |
| 3 | `9:3181` | Benefits Grid ("Why Choose TPO?") | 1280 × 876 | **3-col × 2-row grid**, 6 cards @ 384×~245 |
| 4 | `9:3225` | Applications ("Perfect For Every Structure") | 1280 × 480 | **3 columns**, 373px each, icon-circle + heading + body |
| 5 | `9:3253` | Quality Process | 1280 × 540 | 2-col: dual-image stack (280×256 + 280×256 offset) / 3-step list |
| 6 | `9:3287` | Photo Gallery (Bento) | 1280 × 876 | **Bento**: 600×600 hero + 600×292 banner + 292×292 + 292×292 |
| 7 | `9:3299` | Case Studies | 1280 × 612 | **2 cards side-by-side**, 592×296 each — image-left / content-right |
| 8 | `9:3340` | FAQ Accordion | 768 × 668 (centered) | Vertical stack, 4 accordion items |
| 9 | `9:3366` | Related Services | 1280 × 494 | **4-column** card grid, 286px each |
| 10 | `9:3411` | CTA Banner | 1216 × 248 | Heading-left + button-right, dark background |

## Hero (9:3145)

- Background: full-bleed commercial flat-roof photo
- Container at y=164, padded 32px horizontal
- Breadcrumb (Home › Services › TPO Roofing Systems): white/80, 14px Inter, dot separators
- H1: "TPO Roofing Systems in Dallas" — 60px / 60px line / 800 weight, white, max-width 768px
- Subhead: 20px / 32.5px line / 400, white/90, max-width 672px (3 lines)

## Service Overview (9:3163)

- Two-column at 1216 wide
- Left column (576): "Engineered for Performance" H2 + 2 paragraphs + 2 badge chips ("Energy Star Certified" / "20-Year Warranty")
- Right column (576): single image at 576×432, rounded-xl, soft shadow
- Vertical centering on row

## Benefits Grid — Why Choose TPO? (9:3181)

- Dark surface (`slate-900` in original — replace with `deep-navy-200/300`)
- Centered heading + indigo-200 supporting line
- 6 benefit cards in **3-col × 2-row grid**, each 384×~245
- Each card: red icon (32×32) + H3 (20px bold white) + body (16px, slate-300)
- Cards: white/5 background, white/10 outline, rounded-xl, padding-8

| Card | Icon size | Heading | Body |
|---|---|---|---|
| 1 | 33×33 | Reflective Efficiency | Bright white surfaces reflect UV rays, significantly reducing cooling costs during Texas summers. |
| 2 | 24×30 | Puncture Resistant | Reinforced membrane structure provides superior resistance against debris, foot traffic, and hail. |
| 3 | 33×24 | Cost-Effective | Lower installation costs compared to PVC, with comparable durability and lifecycle performance. |
| 4 | 27×27 | 25-Year Lifespan | Engineered to remain flexible and functional for decades under intense environmental stress. |
| 5 | 25.5×25.5 | Eco-Friendly | 100% recyclable material at the end of its life cycle, reducing landfill waste. |
| 6 | 24×30 | Leak-Proof Seams | Hot-air welded seams are up to 4x stronger than taped EPDM seams. |

## Applications — Perfect For Every Structure (9:3225)

- Centered H2
- 3 equal columns, 373px each
- Each column: 80×80 gray-200 circle (with 25×25 dark icon) + H3 (20px bold) + body (16px, slate-600)

| Column | Heading | Body |
|---|---|---|
| 1 | Industrial Units | Warehouses, manufacturing plants, and distribution centers with large roof areas. |
| 2 | Retail Centers | Shopping malls, standalone stores, and mixed-use commercial developments. |
| 3 | Residential Complexes | Multi-family apartments and modern flat-roof residential architectures. |

## Quality Process (9:3253)

- Stone-100 background
- 2-col: left = dual stacked images (280×256 + 280×256 with 32px top offset on second), right = 3-step process
- Each step: 32×32 red-700 numbered circle + H4 + body

| # | Heading | Body |
|---|---|---|
| 1 | Pre-Install Assessment | Detailed structural analysis and moisture scanning of existing substrate. |
| 2 | Precision Engineering | Custom-cut membranes and flashings to ensure zero-gap integration with HVAC and vents. |
| 3 | Third-Party Verification | Rigorous 20-point final inspection ensuring compliance with manufacturer specifications. |

## Photo Gallery — Bento (9:3287)

- H2 "Completed TPO Projects"
- 1216×600 bento grid, 16px gutter
- Top-left: 600×600 hero square
- Top-right band: 600×292 wide
- Bottom-right pair: two 292×292 squares
- All rounded-xl, full bleed image fills

## Case Studies (9:3299)

- Dark `slate-900` surface (use `deep-navy-200/300`)
- 2-col header: "Case Studies" H2 + indigo-200 sub-line / "View All Stories" button right-aligned
- 2 case study cards side-by-side, 592×296
- Each card: 296×296 image-left / 296×296 content-right (industry tag + H3 + body + 2 stat tags)

| Card | Industry tag | Heading | Body | Stats |
|---|---|---|---|---|
| 1 | INDUSTRIAL | TechPark Logistics Center | Reduced annual energy costs by 22% with 150,000 sq ft TPO retrofit. | SIZE: 150k SQ FT / ROI: 3.5 YEARS |
| 2 | RETAIL | Dallas North Mall | Complete overlay project completed during off-hours with zero store downtime. | PHASED INSTALL / 100% WATERPROOF |

**⚠️ Both case studies are unsourced placeholders. Mark `[REPRESENTATIVE — NOT YET SOURCED]` in the rebuild per Chris's call (2026-05-03).**

## FAQ Accordion (9:3340)

- 768px wide, centered
- 4 accordion items (only first one shown expanded in the design)
- Each item: question (16px bold) + 12×7 chevron + (when open) answer body (16px slate-600)

| Q | A |
|---|---|
| How long does a TPO roof last? | With proper installation and maintenance, a high-quality TPO system typically lasts between 20 to 30 years. Regular inspections are recommended twice yearly. |
| Can TPO be installed over an existing roof? | (collapsed in design — needs answer) |
| Is TPO the same as PVC? | (collapsed) |
| What color options are available? | (collapsed) |

## Related Services (9:3366)

- Gray-200 background
- H2 "Other Commercial Solutions"
- **4 equal columns**, 286px each
- Each card: white surface, rounded-lg, soft shadow, icon + H4 + body + "Learn more" link with chevron

| # | Heading | Body |
|---|---|---|
| 1 | EPDM Systems | Durable synthetic rubber roofing for extreme weather resilience. |
| 2 | Metal Roofing | High-performance standing seam metal for architectural aesthetics. |
| 3 | Roof Coatings | Silicone and acrylic coatings to extend the life of existing roofs. |
| 4 | Gutter Systems | Commercial grade water management and heavy-duty downspouts. |

## CTA Banner (9:3411)

- 1216×248, dark `slate-900` (replace with `deep-navy-200`), rounded-2xl
- Decorative outline element top-right (10% opacity)
- Heading-left: "Ready to optimize your building's performance?" (36px, max-width 672)
- Sub-line: "Book a complimentary TPO efficiency assessment and thermal moisture scan today."
- Button-right: "Get a TPO Assessment", flag-red, 280×60

## Brand-token mapping (replace generic Tailwind)

The original Stitch dump used generic Tailwind. Replace with our DESIGN.md tokens:

| Original | Replace with | Role |
|---|---|---|
| `bg-slate-900` | `bg-[var(--color-secondary)]` (deep-navy-500 or deep-navy-200) | Dark surfaces |
| `bg-red-700` | `bg-[var(--color-tertiary)]` (flag-red-500) | Sole CTA color — used sparingly |
| `bg-blue-100` | `bg-[var(--color-accent-soft)]` (golden-orange-900) | Badge chips |
| `text-indigo-200` | `text-[var(--color-on-primary-container)]` or hunter-green-800 | Sub-headings on dark |
| `text-slate-900` / `text-stone-900` | `text-[var(--color-on-neutral)]` (deep-navy-500) | Body headings |
| `text-slate-600` | `text-muted` (#374151, only on white/off-white) | Body copy |
| Generic Inter font | Archivo (DESIGN.md primary) | Everything except Property Cards |

The page also sets the eyebrow "INDUSTRIAL" / "RETAIL" tags on case study cards in `text-red-700` —
those should switch to `text-[var(--color-accent)]` (golden-orange-500), since eyebrows are an
accent role in our system, not a CTA role.

## Hard gates owed before this ships

- Lighthouse mobile ≥95 / 100 / 100 / 100
- WCAG 2.2 AA contrast on every surface (token system already validates this)
- Schema: `RoofingContractor`, `Service`, `FAQPage`, `BreadcrumbList`
- Analytics events for: hero CTA, badge tap, FAQ open, case-study click, "View All Stories", related-service click, CTA-banner click
- Conversion goal: `tpo_assessment_request` from CTA banner
- Hypothesis (write before ship): "Adding the bento gallery + sourced case studies will lift TPO-page → assessment-request conversion by ≥30% vs. the thin current page."
