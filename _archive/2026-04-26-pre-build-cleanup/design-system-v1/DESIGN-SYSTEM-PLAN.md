# Pro Exteriors — Design System Master Plan

**Version:** 1.0 — April 12, 2026
**Author:** Maren Solveig Castellan-Reyes, Senior Director, Website & Application Experience
**Pipeline:** Claude → Google Stitch → Figma → Claude Code → GPT Codex → GitHub → Supabase → Coolify (KVM V4)
**North Star:** Quad-100 PageSpeed on mobile. Desktop-first design, mobile-first performance.
**Skill Deliverable:** A Claude skill that encodes the entire system so every future conversation produces on-system output.

---

## 0. What Already Exists (Don't Rebuild This)

The color system is done. Another agent produced a Pantone-anchored, CIE Delta-E 2000–verified color system with five primaries, full tint/shade scales (50–950), and tokens in three formats. This plan builds *on top of* that work, not around it.

| Asset | Location | Status |
|---|---|---|
| Pantone Vendor Card | `brand/Color/PANTONE-VENDOR-CARD.md` | v1.0 — complete |
| CSS Custom Properties | `brand/Color/tokens/_variables.css` | v1.0 — complete |
| SCSS Variables | `brand/Color/tokens/_variables.scss` | v1.0 — complete |
| Tailwind Color Config | `brand/Color/tokens/tailwind-colors.js` | v1.0 — complete |
| Interactive Color Reference | `brand/Color/pro-exteriors-color-system.html` | v1.0 — complete |
| Color PDF (print-ready) | `brand/Color/Pro Exteriors.pdf` | v1.0 — complete |
| Competitor SEO Crawl Data | `brand-assets/client/Competitor Data/` | 10+ competitors crawled |
| Pro Exteriors Logo | Existing mark retained — system wraps around it | Hybrid approach confirmed |

**What's missing and what this plan produces:**

1. Typography system (the `Typography/` folder is empty)
2. Spacing architecture (margin, padding, gap, white space)
3. Layout grid system
4. Component library spec
5. Motion & interaction language
6. Cross-media output profiles (digital ads, TV, print, large-format, merch)
7. The Claude skill that encodes all of the above
8. The pipeline that turns the skill's output into deployed code

---

## 1. Typography System

### 1A. The Problem with "What Everybody Else Is Using"

Every roofing website in the competitive set uses one of three stacks: Roboto, Open Sans, or Montserrat paired with a system serif nobody paid attention to. This uniformity is why they all look the same and why none of them project authority. A procurement officer evaluating a $2M commercial re-roof doesn't trust a brand that looks like every other brand. Typography is the fastest way to create distance from the competitive set without touching a single pixel of layout.

### 1B. Type Selection Criteria

The typeface stack for Pro Exteriors must satisfy all of the following simultaneously:

**Performance gate:** Every font file that ships to the browser counts against LCP. The system allows a maximum of four font files on initial load (two weights of the primary, two of the secondary). Variable fonts are preferred because one file covers all weights. Any typeface that doesn't ship as a variable font must justify its inclusion with a weight-count budget.

**Legibility at extremes:** The residential audience skews older and is often on a phone outdoors in Texas sun. The commercial audience reads dense spec tables on a laptop. The type system needs to work at 14px on a 375px viewport in bright light AND at 12px in a data table on a 1440px viewport.

**Brand distance:** The chosen stack should not appear on any of the top 10 competitors crawled in `Competitor Data/`. If a prospect visits Pro Exteriors and a competitor in the same session, the typography should feel different enough to register as higher-quality without feeling unfamiliar.

**Cross-media fidelity:** The typefaces must be licensable for web, app, digital ads, print (brochures, yard signs, vehicle wraps), and broadcast. A typeface that's web-only or requires per-impression licensing for ads is disqualified.

**Pantone-system harmony:** The type must hold its structure against the five brand colors at full saturation. Some geometric sans-serifs collapse visually when set in deep navy on white at small sizes. The chosen primary must maintain optical weight across the full color palette.

### 1C. Type Stack Recommendation Process

This plan does NOT lock in specific typefaces — that's a design phase deliverable with specimen testing. What it locks in is the evaluation framework:

1. **Audit:** Pull typeface stacks from all 10+ competitors via the crawl data CSVs
2. **Long-list:** Generate 8–10 candidates that pass the performance and licensing gates
3. **Specimen test:** Set the Pro Exteriors tagline, a commercial headline, a residential headline, and a data table row in each candidate across all five brand colors
4. **Narrow:** Cut to 3 finalists based on legibility, brand distance, and cross-media licensing
5. **Render test:** Build a test page with each finalist at real content lengths, measure CLS and LCP on a Moto G Power over 3G (the floor device)
6. **Select:** Chris + Maren sign off

### 1D. Type Scale Architecture

Regardless of which typeface is selected, the scale itself is defined now. This uses a modular scale anchored to the base size, with a ratio that produces enough differentiation between levels without creating jarring jumps.

**Scale ratio:** 1.250 (Major Third) — tested against roofing content where headlines are short and punchy but body copy runs long in service descriptions and case studies.

| Token | Size (rem) | Size (px @ 16px base) | Use |
|---|---|---|---|
| `--type-xs` | 0.75 | 12 | Legal text, fine print, table footnotes |
| `--type-sm` | 0.875 | 14 | Captions, metadata, breadcrumbs |
| `--type-base` | 1.0 | 16 | Body copy, form labels, nav items |
| `--type-md` | 1.125 | 18 | Lead paragraphs, card descriptions |
| `--type-lg` | 1.25 | 20 | H4, subheadings in content |
| `--type-xl` | 1.5625 | 25 | H3, section headers |
| `--type-2xl` | 1.953 | 31.25 | H2, page section titles |
| `--type-3xl` | 2.441 | 39.06 | H1, hero headlines (desktop) |
| `--type-4xl` | 3.052 | 48.83 | Display type, hero headlines (wide screens) |
| `--type-5xl` | 3.815 | 61.04 | Marketing display, landing page heroes only |

**Mobile overrides:** On viewports below 768px, `--type-3xl` through `--type-5xl` step down by one level. The hero headline at `--type-5xl` on desktop becomes `--type-3xl` on mobile. This is handled via `clamp()` in the tokens, not media queries, so the transition is fluid.

### 1E. Line Height, Letter Spacing, and Kerning

**Line height tokens:**

| Token | Value | Use |
|---|---|---|
| `--leading-tight` | 1.15 | Display type, hero headlines |
| `--leading-snug` | 1.3 | H1–H3, card titles |
| `--leading-normal` | 1.6 | Body copy, long-form content |
| `--leading-relaxed` | 1.75 | Small text (xs, sm) for readability |

**Letter spacing tokens:**

| Token | Value | Use |
|---|---|---|
| `--tracking-tight` | -0.025em | Display type above 2xl |
| `--tracking-normal` | 0 | Body copy, default |
| `--tracking-wide` | 0.025em | All-caps labels, eyebrow text |
| `--tracking-wider` | 0.05em | Button text, nav items |

**Kerning rule:** `font-kerning: normal` is set globally. Optical kerning (`font-feature-settings: "kern" 1`) is enforced on all text. The design system skill must flag any component that overrides kerning.

### 1F. Font Loading Strategy

This is a PageSpeed gate. The strategy:

1. **Critical subset:** Inline a WOFF2 subset of the primary typeface (Latin-only, regular weight, ~15KB) in the `<head>` as a base64 data URI. This eliminates the CLS flash for above-the-fold text.
2. **Full load:** The complete variable font files load via `<link rel="preload">` with `font-display: swap`.
3. **Fallback stack:** A carefully tuned system font stack with `size-adjust`, `ascent-override`, `descent-override`, and `line-gap-override` that matches the custom typeface's metrics to eliminate CLS.
4. **Budget:** Total font payload for initial page load must not exceed 80KB (compressed). This is a hard gate in the skill.

---

## 2. Spacing Architecture

### 2A. Base Unit and Scale

The spacing system uses a 4px base unit. Every spacing value in the system is a multiple of 4. This creates a rhythm that's perceptible but not mechanical.

| Token | Value | Use |
|---|---|---|
| `--space-0` | 0 | Reset |
| `--space-0.5` | 2px | Hairline gaps (icon-to-label) |
| `--space-1` | 4px | Minimum gap between related elements |
| `--space-2` | 8px | Tight padding (badges, chips, inline buttons) |
| `--space-3` | 12px | Standard padding (form inputs, small cards) |
| `--space-4` | 16px | Default gap / padding (cards, sections on mobile) |
| `--space-5` | 20px | Comfortable padding |
| `--space-6` | 24px | Standard section padding |
| `--space-8` | 32px | Content block separation |
| `--space-10` | 40px | Section breaks on mobile |
| `--space-12` | 48px | Major section separation |
| `--space-16` | 64px | Section padding on desktop |
| `--space-20` | 80px | Hero padding, major landmarks |
| `--space-24` | 96px | Page section separation (desktop) |
| `--space-32` | 128px | Maximum vertical breathing room |

### 2B. Component Spacing Rules

**Cards:** `--space-4` padding on mobile, `--space-6` on tablet+. Gap between cards: `--space-4` on mobile, `--space-6` on desktop.

**Sections:** Vertical padding `--space-12` on mobile, `--space-20` on desktop. Horizontal: full-bleed containers use `--space-4` gutter on mobile, `--space-8` on tablet, content max-width on desktop.

**Forms:** Input padding `--space-3` vertical, `--space-4` horizontal. Gap between fields `--space-4`. Gap between field groups `--space-8`.

**Navigation:** Item padding `--space-2` vertical, `--space-4` horizontal on desktop. Mobile nav items: `--space-4` vertical (48px touch target minimum), `--space-6` horizontal.

### 2C. White Space Philosophy

White space is not empty — it's structural. The design system encodes these rules:

1. **Proximity principle:** Related elements are closer together than unrelated elements. The gap between a heading and its body copy (`--space-2`) is always smaller than the gap between the body copy and the next section heading (`--space-8`+).
2. **Breathing room scales with importance:** Hero sections get `--space-20`+ padding. Dense data tables get `--space-2` cell padding. The system never uses the same spacing value for both.
3. **Asymmetric vertical rhythm:** Top padding on a section is often different from bottom padding. This is intentional — it creates visual flow. The system tokens support this; the skill enforces it by requiring explicit top/bottom values rather than shorthand `padding-block`.

---

## 3. Layout Grid System

### 3A. Grid Architecture

**12-column grid** on desktop (1280px max-width), collapsing to 4-column on mobile (<768px) with a 6-column tablet breakpoint (768px–1024px).

| Breakpoint | Columns | Gutter | Margin (outer) | Max-width |
|---|---|---|---|---|
| `xs` (0–479px) | 4 | 16px | 16px | fluid |
| `sm` (480–767px) | 4 | 16px | 24px | fluid |
| `md` (768–1023px) | 6 | 24px | 32px | fluid |
| `lg` (1024–1279px) | 12 | 24px | 40px | fluid |
| `xl` (1280px+) | 12 | 24px | auto (centered) | 1280px |

### 3B. Content Width Tokens

Not all content should run to the grid edge. These tokens define common content widths:

| Token | Width | Use |
|---|---|---|
| `--w-prose` | 65ch | Long-form body copy, blog posts, case studies |
| `--w-content` | 800px | Standard content containers |
| `--w-wide` | 1024px | Wider content (comparison tables, galleries) |
| `--w-full` | 1280px | Full-width content within the grid |
| `--w-bleed` | 100vw | Edge-to-edge (hero images, full-bleed CTAs) |

### 3C. Responsive Behavior Rules

1. **Commercial content** (spec tables, project galleries, certification grids) uses the full 12-column grid on desktop. On mobile, spec tables become vertically stacked key-value pairs, not horizontally scrolling tables.
2. **Residential content** (service descriptions, testimonials, trust signals) uses a narrower `--w-content` container even on wide screens. White space on the sides reduces cognitive load for a homeowner in crisis mode.
3. **Navigation** collapses to a hamburger at `md` (768px). The mobile nav is the ultimate deliverable — see Section 8.

---

## 4. Color Application Rules (Extends Existing System)

The color tokens exist. What doesn't exist yet is the *application grammar* — which colors go where, in what proportions, and why.

### 4A. The 60-30-10 Distribution

| Proportion | Color | Where |
|---|---|---|
| 60% | White (`#FFFFFF`) + Navy-100 tints | Page backgrounds, card surfaces, body copy backgrounds |
| 30% | Prussian Blue (`--pe-navy`) | Headers, footers, section backgrounds, primary text |
| 10% | Golden Orange (`--pe-gold`) + Brown Red (`--pe-red`) | CTAs, accent elements, trust badges, highlights |
| Interactive | Smart Blue (`--pe-blue`) | Links, interactive states, focus rings |
| Trust/Secondary | Hunter Green (`--pe-green`) | Certifications, warranties, environmental claims |

### 4B. Contrast Requirements

Every color pairing in the system must pass WCAG 2.2 AA (4.5:1 for normal text, 3:1 for large text). The following pairings are pre-approved:

| Foreground | Background | Ratio | Pass |
|---|---|---|---|
| `--pe-navy` (#13294B) | White (#FFFFFF) | 13.9:1 | AAA |
| White | `--pe-navy` (#13294B) | 13.9:1 | AAA |
| `--pe-navy` | `--pe-gold` (#EAA221) | 5.1:1 | AA |
| `--pe-navy` | `--pe-navy-100` (#D5E2F5) | 8.2:1 | AAA |
| White | `--pe-red` (#A33327) | 5.4:1 | AA |
| White | `--pe-green` (#3B6B4C) | 5.2:1 | AA |
| White | `--pe-blue` (#0066CC) | 4.6:1 | AA |

**Banned pairings (fail contrast):** Gold text on white, green text on navy, red text on navy. The skill must reject these combinations.

### 4C. Saturation and Weight Rules

1. **No color at full saturation larger than 120px²** unless it's a primary background (hero section in navy, CTA button in gold). Full-saturation color in small UI elements creates visual noise.
2. **Tint scales for backgrounds:** When a section needs a colored background that isn't navy or white, use the 50 or 100 tint. Never the base color as a background with small text on it unless the contrast math clears AA.
3. **Dark mode:** Not in scope for v1. The design system defines the token layer so dark mode can be added later without rebuilding components.

---

## 5. Cross-Media Output Profiles

The color system tokens map to physical output through these profiles. This section bridges the digital design system to the print/merch/broadcast world.

### 5A. Profile Matrix

| Medium | Color Space | Source | DPI/PPI | Notes |
|---|---|---|---|---|
| Web / App | sRGB | CSS tokens / Tailwind | 72–96 PPI (device-dependent) | `_variables.css`, `tailwind-colors.js` |
| Digital display ads | sRGB | Same tokens | Per-platform spec | Google: 72 PPI; Meta: sRGB PNG/JPG |
| Print (brochures, yard signs) | CMYK (US Web Coated SWOP v2) | `PANTONE-VENDOR-CARD.md` CMYK values | 300 DPI minimum | Use Pantone spot colors when print run > 500 |
| Large format (banners, building wraps) | CMYK or Pantone | Vendor Card | 150 DPI at view distance | Request vendor proof |
| Screen printing (t-shirts, merch) | Pantone Coated | Vendor Card Pantone C values | N/A (vector) | Mix to Pantone; no CMYK process |
| Embroidery | Pantone Coated (closest thread match) | Vendor Card Pantone C values | N/A | Vendor matches thread; approve swatch |
| Vehicle wraps | Pantone or CMYK (3M/Avery profiles) | Vendor Card | 150 DPI at 50% scale | Requires ICC profile from wrap vendor |
| Broadcast / TV | Rec. 709 | Derived from HEX → Rec. 709 | N/A | Avoid super-saturated gold (clipping) |
| Aerial banner (plane-towed) | Pantone Coated | Vendor Card | N/A (sewn fabric) | 2-color max; navy + gold recommended |

### 5B. Color Conversion Chain

The authoritative color is always the Pantone swatch. Digital values (HEX/RGB/HSL) are derived with CIE Delta-E 2000 ≤ 3.0 tolerance. When a vendor asks "what color is this?", the answer is always the Pantone number first, then the output-specific value second.

```
Pantone (source of truth)
  ├── → HEX/RGB/HSL (web, app, digital ads)
  ├── → CMYK US Web Coated SWOP v2 (print)
  ├── → CMYK with vendor ICC profile (large format, wraps)
  ├── → Rec. 709 (broadcast)
  └── → Closest thread match (embroidery)
```

---

## 6. Component Library Spec

### 6A. Component Inventory (Phase 1 — Launch)

These are the components needed for the Pro Exteriors website launch. Each component will be defined with tokens from this design system.

**Atoms:**
- Button (primary/gold CTA, secondary/navy outline, ghost/text-only, disabled)
- Input (text, email, phone, textarea, select, checkbox, radio)
- Badge (certification, status, count)
- Icon (system icons only — no decorative illustration v1)
- Link (inline, standalone, nav)
- Divider (horizontal rule, section separator)
- Image (responsive with `loading="lazy"`, LQIP placeholder, aspect ratio lock)

**Molecules:**
- Card (service card, project card, testimonial card, team member card)
- Form field (label + input + help text + error state)
- Navigation item (desktop horizontal, mobile vertical)
- CTA block (headline + body + button, used at section ends)
- Trust badge group (manufacturer logos, certification marks)
- Breadcrumb trail

**Organisms:**
- Header / Navigation (desktop + mobile — the ultimate deliverable)
- Hero section (commercial variant, residential variant, urgent-leak variant)
- Service grid
- Project gallery (filterable by commercial/residential)
- Testimonial carousel (real quotes only, sourced and attributed)
- Contact form (commercial RFQ flow, residential urgent flow)
- Footer (sitemap, contact, certifications, legal)

### 6B. Component Token Mapping

Every component references design tokens, never raw values. The skill enforces this.

```
Button (Primary)
├── background: var(--color-cta-bg)           → --pe-gold
├── color: var(--color-cta-text)              → --pe-navy
├── padding: var(--space-3) var(--space-6)    → 12px 24px
├── border-radius: var(--radius-md)           → 6px
├── font-size: var(--type-base)               → 16px
├── font-weight: var(--font-semibold)         → 600
├── letter-spacing: var(--tracking-wider)     → 0.05em
├── hover:background: var(--color-cta-hover-bg) → --pe-gold-700
└── focus:ring: 2px solid var(--pe-blue)      → focus ring for a11y
```

### 6C. Border Radius Tokens

| Token | Value | Use |
|---|---|---|
| `--radius-none` | 0 | Tables, full-bleed elements |
| `--radius-sm` | 4px | Badges, chips, small interactive elements |
| `--radius-md` | 6px | Buttons, inputs, cards |
| `--radius-lg` | 12px | Modal dialogs, large cards |
| `--radius-xl` | 16px | Hero CTA blocks, featured content |
| `--radius-full` | 9999px | Avatar images, pill buttons |

### 6D. Shadow / Elevation Tokens

| Token | Value | Use |
|---|---|---|
| `--shadow-sm` | `0 1px 2px rgba(19,41,75,0.05)` | Subtle lift (cards at rest) |
| `--shadow-md` | `0 4px 6px rgba(19,41,75,0.07), 0 2px 4px rgba(19,41,75,0.06)` | Interactive hover |
| `--shadow-lg` | `0 10px 15px rgba(19,41,75,0.08), 0 4px 6px rgba(19,41,75,0.05)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(19,41,75,0.10), 0 10px 10px rgba(19,41,75,0.04)` | Elevated panels |

Note: Shadow color uses `--pe-navy` RGB values, not black. This keeps shadows warm and on-brand.

---

## 7. Motion & Interaction Language

### 7A. Motion Budget

Motion exists to communicate state change, not to decorate. The total motion budget for any page transition is 300ms. No single animation exceeds 200ms. No animation runs at page load — everything is triggered by user interaction or viewport intersection.

### 7B. Easing Tokens

| Token | Value | Use |
|---|---|---|
| `--ease-in` | `cubic-bezier(0.55, 0, 1, 0.45)` | Elements leaving the screen |
| `--ease-out` | `cubic-bezier(0, 0.55, 0.45, 1)` | Elements entering the screen |
| `--ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` | State changes (color, size) |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Micro-interactions (button press) |

### 7C. Duration Tokens

| Token | Value | Use |
|---|---|---|
| `--duration-instant` | 100ms | Hover states, focus rings |
| `--duration-fast` | 150ms | Button presses, toggle switches |
| `--duration-normal` | 200ms | Dropdown menus, accordion expand |
| `--duration-slow` | 300ms | Modal enter, page section transitions |

### 7D. Reduced Motion

`@media (prefers-reduced-motion: reduce)` removes all animation and transition. The site must be fully functional with motion disabled. The skill must verify this.

---

## 8. Mobile Navigation — The Ultimate Deliverable

### 8A. Why Mobile Nav Is the Hardest Component

The mobile navigation for Pro Exteriors has to solve a routing problem that most roofing sites ignore: two fundamentally different audiences need to self-select within 2 taps. A procurement officer evaluating a $2M commercial re-roof and a homeowner whose roof is leaking right now have nothing in common except that they're on the same domain, probably on a phone, probably outdoors.

### 8B. Mobile Nav Architecture

**Level 0 — Persistent bar:**
- Logo (tap → home)
- "Emergency? Call Now" persistent CTA (always visible, red background, tel: link)
- Hamburger icon (opens L1)

**Level 1 — Primary drawer:**
- Commercial Roofing (tap → L2 commercial)
- Residential Roofing (tap → L2 residential)
- About Pro Exteriors
- Projects & Case Studies
- Contact / Get a Quote

**Level 2 — Sub-navigation:**
- Commercial: Services, Manufacturers, Case Studies, Free Assessment
- Residential: Services, Emergency Repair, Planned Replacement, Free Inspection

**Interaction rules:**
- Drawer slides in from right, 200ms ease-out
- Backdrop overlay at 50% opacity navy
- Close on backdrop tap, swipe right, or X button
- Focus traps inside drawer when open (a11y requirement)
- Back button returns to L1, doesn't close drawer
- 48px minimum touch target on all nav items (WCAG 2.5.8)

### 8C. Mobile Nav Performance Budget

| Metric | Target | Why |
|---|---|---|
| LCP | < 1.2s | Hero image + nav must render fast |
| FID/INP | < 100ms | Hamburger tap must respond instantly |
| CLS | 0 | Nav opening must not shift content |
| Total JS for nav | < 5KB gzipped | Inline the nav JS, no framework dependency |
| Total CSS for nav | < 3KB gzipped | Critical CSS inlined in `<head>` |

---

## 9. Pipeline Architecture

### 9A. The Full Chain

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   CLAUDE      │────▶│ GOOGLE STITCH│────▶│    FIGMA      │
│ (Strategy +   │     │ (AI Wireframe│     │ (Design       │
│  System Def)  │     │  Exploration)│     │  Refinement)  │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                                                  ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   COOLIFY     │◀────│   GITHUB     │◀────│ CLAUDE CODE   │
│ (KVM V4 VPS   │     │ (Version      │     │ (Component    │
│  Deployment)  │     │  Control)     │     │  Build)       │
└──────────────┘     └──────────────┘     └──────────────┘
       ▲                    ▲                     │
       │                    │                     ▼
┌──────────────┐            │              ┌──────────────┐
│  SUPABASE     │────────────┘              │  GPT CODEX    │
│ (Backend,     │                           │ (Parallel     │
│  Auth, Data)  │                           │  Code Gen)    │
└──────────────┘                           └──────────────┘
```

### 9B. Stage-by-Stage Breakdown

**Stage 1: Claude (this environment)**
- Define the design system (this document)
- Produce design tokens in all three formats (CSS, SCSS, Tailwind)
- Generate component specs with token mappings
- Write the Claude skill that encodes the system
- Produce content briefs, microcopy specs, and CTA copy

**Stage 2: Google Stitch**
- Input: Design system tokens + component specs + wireframe prompts
- Output: Rapid wireframe exploration — 5–10 layout variants per key page
- Value: Speed. Stitch generates layout options in minutes that would take hours in Figma. We use it for divergent exploration, not convergent refinement.
- Handoff: Export wireframe screenshots + structure notes → Figma

**Stage 3: Figma**
- Input: Stitch wireframes + design system tokens + component library
- Output: Hi-fi mockups across all breakpoints, interactive prototype
- Process: Build the component library in Figma using tokens from Stage 1. Apply to wireframe layouts from Stage 2. Design desktop-first, then chisel down to mobile.
- Deliverables: Design file with all pages, component library, auto-layout components that map 1:1 to code components

**Stage 4: Claude Code**
- Input: Figma designs + design system tokens + component specs
- Output: Production-ready components in Next.js (or framework TBD per tech PRD)
- Process: Claude Code reads the design system skill, the Figma export, and builds each component with tokens. No raw values — everything references the token system.
- Quality gate: Every component must pass Lighthouse audit (all 4 scores ≥ 95 target, 100 goal)

**Stage 5: GPT Codex**
- Input: Component specs + partial implementations from Claude Code
- Output: Parallelized code generation for repetitive components (service page templates, case study layouts, form variants)
- Value: Codex handles the high-volume, lower-creativity code gen while Claude Code handles the architecturally complex components (mobile nav, hero system, form routing)
- Integration: Both push to the same GitHub repo, same branch strategy

**Stage 6: GitHub**
- Repository structure: Monorepo with `/src/components/`, `/src/tokens/`, `/src/pages/`
- Branch strategy: `main` (production) → `develop` (staging) → feature branches
- CI: Lighthouse CI on every PR. Any score below 95 blocks merge.
- The design system tokens live in `/src/tokens/` and are the single source of truth for the codebase

**Stage 7: Supabase**
- Backend for: Contact forms, lead routing, project gallery CMS, authentication (if admin panel needed)
- Edge functions for: Form submission processing, lead qualification routing, analytics event collection
- Database: Lead submissions, project gallery metadata, testimonial management
- Integration: GitHub Actions deploys edge functions on merge to `main`

**Stage 8: Coolify (KVM V4)**
- Deployment target: Self-hosted on KVM V4 VPS via Coolify
- Auto-deploy: Coolify watches the GitHub repo's `main` branch
- SSL: Let's Encrypt via Coolify
- CDN: Consider Cloudflare in front for static asset caching + WAF
- Performance: Server-side rendering on the VPS, static generation where possible
- Monitoring: Coolify's built-in monitoring + custom health check endpoint

### 9C. Pipeline Quality Gates

| Gate | Where | Blocks What | Threshold |
|---|---|---|---|
| Token compliance | Claude Code + Codex | PR merge | Zero raw color/spacing values |
| Lighthouse Performance | GitHub CI | PR merge | ≥ 95 (target 100) |
| Lighthouse Accessibility | GitHub CI | PR merge | ≥ 95 (target 100) |
| Lighthouse Best Practices | GitHub CI | PR merge | ≥ 95 (target 100) |
| Lighthouse SEO | GitHub CI | PR merge | ≥ 95 (target 100) |
| CLS | GitHub CI | PR merge | < 0.05 |
| LCP | GitHub CI | PR merge | < 1.2s |
| INP | GitHub CI | PR merge | < 100ms |
| Font payload | Build step | Build | ≤ 80KB compressed |
| Total JS (initial) | Build step | Build | ≤ 100KB compressed |
| Image optimization | Build step | Build | All images WebP/AVIF, responsive srcset |
| WCAG 2.2 AA | Automated + manual | Launch | Zero failures |
| Schema markup | Build step | Page deploy | Every page has valid JSON-LD |

---

## 10. The Claude Skill — Architecture

### 10A. Skill Purpose

The skill encodes the entire Pro Exteriors design system so that any Claude session — whether it's writing code, reviewing a PR, generating content, or producing a deliverable — automatically applies the system's rules. It's the enforcement mechanism that prevents drift.

### 10B. Skill Structure

```
pro-exteriors-design-system/
├── SKILL.md                          # Main skill file (~400 lines)
│   ├── Frontmatter (name, description, triggers)
│   ├── Quick reference (token cheat sheet)
│   ├── Decision rules (which token for which context)
│   ├── Component patterns (how to compose)
│   ├── Performance gates (what to check)
│   └── Pointers to reference files
├── references/
│   ├── color-tokens.md               # Full color system reference
│   ├── typography-tokens.md           # Type scale, line height, tracking
│   ├── spacing-tokens.md             # Spacing scale, component spacing
│   ├── layout-tokens.md              # Grid, breakpoints, content widths
│   ├── component-specs.md            # Component inventory with token mappings
│   ├── motion-tokens.md              # Easing, duration, reduced motion
│   ├── cross-media-profiles.md       # Print/broadcast/merch color profiles
│   ├── mobile-nav-spec.md            # The mobile nav component spec
│   ├── contrast-matrix.md            # Pre-approved and banned color pairings
│   └── pipeline-gates.md             # CI/CD quality gates reference
├── scripts/
│   ├── validate-tokens.js            # Checks code for raw values
│   ├── contrast-check.js             # Validates color pairings against WCAG
│   └── lighthouse-budget.js          # Lighthouse performance budget config
└── assets/
    ├── tokens/_variables.css          # Symlink or copy from brand/Color/tokens/
    ├── tokens/_variables.scss
    └── tokens/tailwind-colors.js
```

### 10C. Skill Trigger Description (Draft)

> Pro Exteriors Design System — the single source of truth for every visual, spatial, typographic, and interactive decision on the Pro Exteriors website. Use this skill whenever writing HTML, CSS, JS, React, or any front-end code for Pro Exteriors; when reviewing designs, components, or layouts; when generating content that will appear on the website; when producing any deliverable that references colors, typography, spacing, or layout; or when evaluating whether a page or component meets performance, accessibility, or brand standards. Also triggers on: "design tokens", "component spec", "PageSpeed", "Lighthouse", "mobile nav", "responsive", "brand colors", "type scale", "spacing", or any Pro Exteriors front-end discussion.

### 10D. What the Skill Enforces

1. **No raw values.** Every color, font-size, spacing value, border-radius, and shadow must reference a token. The skill flags `#13294B` in code and says "use `var(--pe-navy)` or `prussian_blue.DEFAULT`."
2. **Contrast compliance.** The skill checks any color pairing against the pre-approved matrix and rejects banned pairings.
3. **Performance budgets.** The skill knows the font budget (80KB), JS budget (100KB), and Lighthouse thresholds. It flags components that risk busting them.
4. **Mobile-first structure.** The skill checks that responsive behavior is defined for every component and that mobile touch targets are ≥ 48px.
5. **Component composition.** The skill knows which atoms compose into which molecules, which molecules compose into organisms. It prevents orphaned components.
6. **Cross-media awareness.** When producing print or merch output, the skill references the Pantone Vendor Card and the correct output profile.

---

## 11. Execution Phases

### Phase 1: Foundation (Now → Week 2)
- [x] Color system with Pantone anchors and digital tokens
- [ ] Typography audit (pull competitor type stacks from crawl data)
- [ ] Typography selection (long-list → specimens → finalists → select)
- [ ] Typography tokens (type scale, line height, tracking, kerning in CSS/SCSS/Tailwind)
- [ ] Font loading strategy implementation and performance test
- [ ] Spacing token system (CSS/SCSS/Tailwind)
- [ ] Layout grid system (breakpoints, columns, content widths)
- [ ] Write this plan (this document)

### Phase 2: Component Spec (Weeks 2–3)
- [ ] Component inventory with token mappings
- [ ] Contrast matrix with pre-approved and banned pairings
- [ ] Shadow and elevation system
- [ ] Motion and interaction tokens
- [ ] Border radius system
- [ ] Mobile navigation spec (the ultimate deliverable)
- [ ] Cross-media output profiles
- [ ] Interactive design system reference (HTML, like the color system reference)

### Phase 3: Skill Build (Weeks 3–4)
- [ ] Write SKILL.md
- [ ] Write all reference files
- [ ] Build validation scripts (token compliance, contrast check, Lighthouse budget)
- [ ] Write test cases (3 eval prompts minimum)
- [ ] Run skill through eval loop (with/without comparison)
- [ ] Optimize skill description for triggering
- [ ] Package and install skill

### Phase 4: Pipeline Wiring (Weeks 4–6)
- [ ] Claude → Stitch prompt templates for wireframe generation
- [ ] Stitch → Figma handoff workflow
- [ ] Figma component library built on design system tokens
- [ ] Claude Code → component build workflow
- [ ] GPT Codex integration for parallel code gen
- [ ] GitHub repo setup with CI/CD gates
- [ ] Supabase project setup (forms, gallery CMS, edge functions)
- [ ] Coolify deployment configuration
- [ ] End-to-end pipeline test (one component from Claude through to Coolify)

### Phase 5: Mobile Navigation Build (Weeks 6–8)
- [ ] Desktop navigation component (full-width, all states)
- [ ] Tablet navigation (collapsed, transition behavior)
- [ ] Mobile navigation (hamburger, drawer, L1/L2, all interaction states)
- [ ] Mobile nav performance audit (must hit all quad-100 targets)
- [ ] Mobile nav accessibility audit (focus trap, screen reader, keyboard)
- [ ] Cross-browser testing (Chrome, Safari, Firefox — mobile and desktop)
- [ ] Final Lighthouse audit on mobile nav page: Performance 100, Accessibility 100, Best Practices 100, SEO 100

---

## 12. Open Questions (Require Chris Input)

1. **Framework decision:** The tech PRD will determine Next.js vs. Astro vs. Remix. The design system is framework-agnostic at the token level, but the component implementations need a framework. When do we want to make this call?
2. **CMS decision:** Sanity, Strapi, or Supabase-native for content management? This affects how the project gallery and case studies are structured.
3. **Typography budget:** Is there budget for a commercial typeface license (e.g., Söhne, Untitled Sans, GT America), or are we working within open-source / Google Fonts? This significantly affects the brand distance we can create.
4. **Figma org:** Does AIA4 have a Figma team account, or do we need to set one up for the component library?
5. **Google Stitch access:** Is the Stitch beta available to you, or do we need to request access? This affects the timeline for Phase 4.

---

## Appendix A: Token File Locations (Current)

```
/Pro Exteriors Website/
├── brand-assets/
│   └── client/
│       └── brand/
│           ├── Color/
│           │   ├── PANTONE-VENDOR-CARD.md
│           │   ├── pro-exteriors-color-system.html
│           │   ├── Pro Exteriors.pdf
│           │   └── tokens/
│           │       ├── _variables.css
│           │       ├── _variables.scss
│           │       └── tailwind-colors.js
│           ├── Typography/               ← EMPTY — Phase 1 deliverable
│           └── Page Copy from SEO Team/  ← EMPTY — awaiting content
├── design-system/
│   └── DESIGN-SYSTEM-PLAN.md             ← THIS DOCUMENT
└── _aia4-skills/
    ├── aia4-client-report/               ← Existing skill
    └── pro-exteriors-design-system/      ← Phase 3 deliverable
```

---

*This plan is a living document. It will be updated as decisions are made on typography, framework, and CMS. The design system it describes is the single source of truth for every pixel that ships under the Pro Exteriors brand.*
