---
version: alpha
name: Pro Exteriors
description: |
  Canonical visual identity for the Pro Exteriors website. Five-color brand
  palette (hunter green primary, flag red interaction, deep navy authority,
  golden orange warmth, smart blue links) paired with Archivo as the primary
  typeface and IBM Plex Mono as the Property Card secondary. This file is the
  source of truth for tokens; Tailwind theme, CSS variables, and component
  classes regenerate from it on every build.

  Phase 1 ships with this file as-is — real brand colors, real fonts. Phase 2
  brand pass (formerly the largest deliverable cycle) is now scoped to font-file
  delivery and component-variant refinement only. Brand identity has landed.

# ─── COLOR PALETTE — Pro Exteriors brand colors with full 9-step shade scales ───
# Naming convention: shade scale runs 100 (darkest) → 500 (DEFAULT) → 900 (lightest)
# This is OPPOSITE the standard Tailwind direction; the build helper handles
# the inversion when emitting Tailwind tokens.
colors:
  # ── Hunter Green — primary brand voice color ──
  # Heritage, growth, place-memory. The "Pro Exteriors" color. Hero overlays,
  # primary brand surfaces, secondary CTAs (button-secondary).
  hunter-green-100: "#0c160f"
  hunter-green-200: "#182b1f"
  hunter-green-300: "#24412e"
  hunter-green-400: "#30573d"
  hunter-green-500: "#3b6b4c"   # DEFAULT
  hunter-green-600: "#54996c"
  hunter-green-700: "#7bb690"
  hunter-green-800: "#a7ceb5"
  hunter-green-900: "#d3e7da"

  # ── Flag Red — interaction (sole CTA color) ──
  # button-primary. Bold, decisive, fits Texas-headquartered identity.
  # The single color that earns clicks. Used sparingly — if it appears in
  # every section it stops being interaction.
  flag-red-100: "#270708"
  flag-red-200: "#4e0e0f"
  flag-red-300: "#741517"
  flag-red-400: "#9b1c1f"        # button-primary hover state
  flag-red-500: "#c22326"        # DEFAULT — primary CTA background
  flag-red-600: "#dc4144"
  flag-red-700: "#e57173"
  flag-red-800: "#eea0a1"
  flag-red-900: "#f6d0d0"

  # ── Deep Navy — B2B authority + body text ──
  # Body copy, dark surfaces, footer, secondary headings. Procurement-officer
  # gravitas for the commercial vertical.
  deep-navy-100: "#03040d"
  deep-navy-200: "#07081a"
  deep-navy-300: "#0a0c27"
  deep-navy-400: "#0e1034"
  deep-navy-500: "#11133f"        # DEFAULT — body text, secondary headings
  deep-navy-600: "#232884"
  deep-navy-700: "#353cc8"
  deep-navy-800: "#787ddb"
  deep-navy-900: "#bbbeed"

  # ── Golden Orange — warmth, eyebrows, warnings ──
  # Eyebrow tags above section headlines, stat callout backgrounds,
  # status-warning. Community-color for Pro Ministries section.
  # Black text on golden_orange passes AA at ~10:1.
  golden-orange-100: "#312105"
  golden-orange-200: "#614209"
  golden-orange-300: "#92630e"
  golden-orange-400: "#c28412"
  golden-orange-500: "#eaa221"    # DEFAULT
  golden-orange-600: "#eeb54c"
  golden-orange-700: "#f3c879"
  golden-orange-800: "#f7daa5"
  golden-orange-900: "#fbedd2"    # Used as soft tint background for stat-callout

  # ── Smart Blue — links + info status ──
  # Inline body links, "learn more" secondary actions, info status.
  # Distinct in role from deep_navy: smart_blue = action/link; deep_navy = surface/authority.
  smart-blue-100: "#001429"
  smart-blue-200: "#002952"
  smart-blue-300: "#003d7a"
  smart-blue-400: "#0052a3"
  smart-blue-500: "#0066cc"       # DEFAULT
  smart-blue-600: "#0a85ff"
  smart-blue-700: "#47a3ff"
  smart-blue-800: "#85c2ff"
  smart-blue-900: "#c2e0ff"

  # ─── Semantic role tokens — components reference THESE, not the raw palette ───
  # Phase 2 brand refinement changes only the values on the right; component
  # definitions stay stable. If a component needs a brand color directly, it's
  # a sign that color should be promoted to a semantic role.

  primary: "#3b6b4c"              # hunter-green-500
  on-primary: "#FFFFFF"           # contrast 5.6:1 — passes WCAG AA
  primary-container: "#24412e"    # hunter-green-300 — hover/active state
  on-primary-container: "#FFFFFF"
  primary-soft: "#d3e7da"         # hunter-green-900 — light tint background

  secondary: "#11133f"            # deep-navy-500 — B2B authority + body text dark
  on-secondary: "#FFFFFF"         # contrast 16.8:1
  secondary-container: "#0a0c27"  # deep-navy-300 — darker hover state
  on-secondary-container: "#FFFFFF"

  tertiary: "#c22326"             # flag-red-500 — sole interaction CTA color
  on-tertiary: "#FFFFFF"          # contrast 5.0:1 — passes WCAG AA
  tertiary-container: "#9b1c1f"   # flag-red-400 — hover state, darker
  on-tertiary-container: "#FFFFFF"

  accent: "#eaa221"               # golden-orange-500
  on-accent: "#000000"            # contrast 10.0:1 — passes WCAG AA (black on orange)
  accent-soft: "#fbedd2"          # golden-orange-900 — soft warm background
  on-accent-soft: "#11133f"       # deep-navy on accent-soft — high contrast

  info: "#0066cc"                 # smart-blue-500
  on-info: "#FFFFFF"              # contrast 5.4:1 — passes WCAG AA
  info-soft: "#c2e0ff"            # smart-blue-900 — soft blue background
  on-info-soft: "#11133f"

  # Status semantic tokens (reuse brand palette to avoid color sprawl)
  success: "#3b6b4c"              # hunter-green-500 — completed, approved
  on-success: "#FFFFFF"
  warning: "#eaa221"              # golden-orange-500 — attention needed
  on-warning: "#000000"
  error: "#c22326"                # flag-red-500 — same as tertiary; context disambiguates
  on-error: "#FFFFFF"

  # Neutrals (not pulled from brand palette — kept neutral by design)
  neutral: "#F9FAFB"              # off-white background
  on-neutral: "#11133f"           # deep-navy body text on off-white — contrast ~16:1
  surface: "#FFFFFF"              # card/panel background
  on-surface: "#11133f"
  surface-alt: "#F3F4F6"          # alt panel for subtle separation
  on-surface-alt: "#11133f"

  border: "#E5E7EB"
  border-strong: "#D1D5DB"

  muted: "#374151"                # muted text — use ONLY on white surface (10.4:1) or off-white (9.3:1)
                                  # NEVER on surface-alt — fails contrast there

# ─── TYPOGRAPHY ───
# Primary: Archivo (variable font, full 100-900 weight range)
# Secondary: IBM Plex Mono (Property Card surfaces only)
typography:
  display-1:
    fontFamily: Archivo
    fontSize: 3.75rem             # 60px — hero H1 desktop
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.025em"
  display-2:
    fontFamily: Archivo
    fontSize: 3rem                # 48px — H1 standard, hero mobile
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  h1:
    fontFamily: Archivo
    fontSize: 2.25rem             # 36px
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  h2:
    fontFamily: Archivo
    fontSize: 1.875rem            # 30px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.015em"
  h3:
    fontFamily: Archivo
    fontSize: 1.5rem              # 24px
    fontWeight: 600
    lineHeight: 1.25
  h4:
    fontFamily: Archivo
    fontSize: 1.25rem             # 20px
    fontWeight: 600
    lineHeight: 1.3
  body-lg:
    fontFamily: Archivo
    fontSize: 1.125rem            # 18px — lead paragraphs
    fontWeight: 400
    lineHeight: 1.6
  body-md:
    fontFamily: Archivo
    fontSize: 1rem                # 16px — body
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: Archivo
    fontSize: 0.875rem            # 14px — secondary body
    fontWeight: 400
    lineHeight: 1.55
  label-md:
    fontFamily: Archivo
    fontSize: 0.875rem            # 14px — UI labels, button text
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.01em"
  label-caps:
    fontFamily: Archivo
    fontSize: 0.75rem             # 12px — eyebrow caps
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "0.1em"
  mono-md:
    fontFamily: IBM Plex Mono     # Property Card surfaces only — Selectric II aesthetic
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.5
  mono-sm:
    fontFamily: IBM Plex Mono
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.5

# ─── SHAPES ───
rounded:
  none: 0
  sm: 4px
  md: 8px
  lg: 12px
  xl: 16px
  full: 9999px

# ─── SPACING SCALE ───
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  4xl: 96px
  5xl: 128px

# ─── COMPONENTS ───
# Each component definition references semantic role tokens. The linter validates
# every backgroundColor / textColor pair against WCAG AA on every build.
components:
  button-primary:
    backgroundColor: "{colors.tertiary}"           # flag-red-500
    textColor: "{colors.on-tertiary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 48px
  button-primary-hover:
    backgroundColor: "{colors.tertiary-container}" # flag-red-400 — darker
    textColor: "{colors.on-tertiary-container}"
  button-secondary:
    backgroundColor: "{colors.primary}"            # hunter-green-500 — secondary CTA
    textColor: "{colors.on-primary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 48px
  button-secondary-hover:
    backgroundColor: "{colors.primary-container}"  # hunter-green-300
    textColor: "{colors.on-primary-container}"
  button-tertiary:
    backgroundColor: "{colors.secondary}"          # deep-navy-500 — B2B authoritative CTA
    textColor: "{colors.on-secondary}"
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 48px
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"                  # hunter-green text on white
    typography: "{typography.label-md}"
    rounded: "{rounded.md}"
    padding: 12px
    height: 48px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 24px
  card-alt:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface-alt}"
    rounded: "{rounded.md}"
    padding: 24px
  hero-overlay-primary:
    backgroundColor: "{colors.primary}"            # hunter-green hero overlay
    textColor: "{colors.on-primary}"
    typography: "{typography.display-1}"
  hero-overlay-secondary:
    backgroundColor: "{colors.secondary}"          # deep-navy hero overlay (B2B contexts)
    textColor: "{colors.on-secondary}"
    typography: "{typography.display-1}"
  stat-callout:
    backgroundColor: "{colors.accent-soft}"        # golden-orange-900 soft warm
    textColor: "{colors.on-accent-soft}"           # deep-navy on cream
    rounded: "{rounded.md}"
    padding: 16px
  testimonial-quote:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-lg}"
    rounded: "{rounded.md}"
    padding: 32px
  property-card-callout:
    backgroundColor: "{colors.accent-soft}"        # warm cream — Selectric II aesthetic
    textColor: "{colors.secondary}"                # deep-navy on cream
    typography: "{typography.mono-md}"
    rounded: "{rounded.md}"
    padding: 24px
  partner-disclosure:
    backgroundColor: "{colors.surface-alt}"
    textColor: "{colors.on-surface-alt}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: 12px
  faq-item:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    typography: "{typography.body-md}"
    rounded: "{rounded.sm}"
    padding: 16px
  service-tile:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 24px
  nav-link:
    textColor: "{colors.secondary}"                # deep-navy nav text
    typography: "{typography.label-md}"
  nav-link-active:
    textColor: "{colors.tertiary}"                 # flag-red — interaction signal
  footer:
    backgroundColor: "{colors.secondary}"          # deep-navy footer
    textColor: "{colors.on-secondary}"
    typography: "{typography.body-sm}"
  link-inline:
    textColor: "{colors.info}"                     # smart-blue — body link color
    typography: "{typography.body-md}"
---

## Overview

**Place-Memory Heritage meets Texas-Bold Trade-Tech.** Pro Exteriors operates with the visual gravitas of a heritage trades company that has been on the same streets long enough to remember every roof — but moves with the precision and bold confidence of a modern construction-technology company servicing 16 states from Texas. The identity has to read "the contractor who already knows your street" before it reads "roofer," and it has to do so across two distinct verticals: commercial procurement audiences (deep navy authority, flat-roof systems, ROI calculators) and premium residential homeowners (hunter green warmth, planned replacement, Property Card lead magnets).

Five colors, two typefaces, one interaction CTA. That discipline is the brand.

The five colors carry distinct meanings:

**Hunter Green** is the brand voice color. It signals heritage, growth, place-memory — it's the color that distinguishes Pro Exteriors from generic-roofer red and signals "we know your neighborhood." Hero overlays, primary brand surfaces, secondary CTAs.

**Flag Red** is the sole interaction CTA color. Bold, patriotic-craft, decisive — fits a Texas-headquartered identity. The only color that earns clicks. If it appears in every section, it stops being interaction.

**Deep Navy** is the B2B authority color. Body text, dark surfaces, footer, the procurement-officer gravitas that earns commercial RFQs.

**Golden Orange** is warmth and attention. Eyebrow tags above section headlines, stat callout soft backgrounds, status-warning, the community-color for Pro Ministries.

**Smart Blue** is the link / info color. Inline body links, "learn more" secondary actions, info status. Distinct from deep_navy in role: smart_blue = action; deep_navy = surface.

## Colors

The full 5-color × 9-shade brand palette is exposed as raw tokens (`hunter-green-500`, `flag-red-400`, etc.) so engineering can reach for specific shades when needed — chart data viz, status badge gradients, hover state derivations. The semantic tokens (`primary`, `secondary`, `tertiary`, `accent`, `info`) reference the DEFAULT (500) values and are what components use day-to-day.

The shade scale runs **100 (darkest) → 500 (DEFAULT) → 900 (lightest)**, opposite the standard Tailwind direction. The build helper handles the inversion when emitting `.design-tokens.tailwind.json` so Tailwind utilities like `bg-hunter-green-100` give you the darkest shade and `bg-hunter-green-900` gives you the lightest, matching the source palette intuitively.

Contrast pairings — verified WCAG AA-passing on every component definition:

- White on hunter_green-500 (#3b6b4c): **5.6:1** — passes
- White on flag_red-500 (#c22326): **5.0:1** — passes
- White on deep_navy-500 (#11133f): **16.8:1** — easy pass
- Black on golden_orange-500 (#eaa221): **10.0:1** — passes
- White on smart_blue-500 (#0066cc): **5.4:1** — passes
- Deep_navy on golden_orange-900 (#fbedd2): **15+:1** — easy pass

Every component definition's backgroundColor / textColor pair is verified by `npx @google/design.md lint DESIGN.md` on every build. Build fails on any violation. The accessibility hard gate from CLAUDE.md §4 is now mechanical, not operational.

## Typography

**Archivo for everything except Property Card surfaces, which are IBM Plex Mono.**

Archivo is a variable typeface in the Grotesque family, with weight range 100–900 and italic support. Modern but not trendy, geometric but readable, with a slight architectural feel that fits "trades-tech" positioning. Supports small-caps and alternate glyphs for label-caps tokens. Available via `@fontsource-variable/archivo`.

The display-to-body ratio favors hierarchy: display-1 at 60px on the hero (weight 800), body-md at 16px in the article body (weight 400), with deliberate spacing between. Letter-spacing tightens on display sizes (-0.025em / -0.02em) for editorial gravity; widens on label-caps (0.1em) for eyebrow tags above section headlines.

The mono token is reserved for Property Card components per Property First doc §6.1 (Selectric II / Rolodex aesthetic). The mono surface is the visual signal of "this is the place-memory artifact, not the marketing surface." Components using `mono-md` do not migrate to sans-serif — the mono signal is part of the brand thesis.

Self-hosted via `@fontsource-variable/archivo` and `@fontsource/ibm-plex-mono` in `/public/fonts/` — no Google Fonts CDN dependency, no render-blocking external requests that cost LCP.

## Layout & Spacing

The spacing scale is the standard four-base progression — 4px / 8px / 16px / 24px / 32px / 48px / 64px / 96px / 128px — exposed as named tokens (xs / sm / md / lg / xl / 2xl / 3xl / 4xl / 5xl) so component styles read intent rather than magic numbers.

Layout grids: 12-column desktop, 6-column tablet, 4-column mobile. Component padding uses md (16px) by default, lg (24px) for card surfaces, xl (32px) for hero/testimonial. Section vertical rhythm uses 4xl (96px) on desktop, 2xl (48px) on mobile. These rhythms apply via Tailwind utility classes generated from this file's spacing tokens.

## Shapes

Rounded corners use a tight scale (sm / md / lg / xl / full). Most components use `md` (8px) — premium-but-not-soft. Buttons and CTAs use `md`. Cards use `md`. Pills and badges use `full`. Hero overlays and modal panels use `lg` (12px). The only `xl` (16px) usage is the Property Card callout, which leans warmer/softer to match the analog Selectric II aesthetic.

## Components

Twenty component definitions cover the core surfaces: three button variants (primary flag-red CTA, secondary hunter-green, tertiary deep-navy for B2B authority), button-ghost and button hover states, two card variants, two hero-overlay variants (primary hunter-green for residential warmth, secondary deep-navy for commercial gravitas), stat-callout with golden-orange-soft background, testimonial-quote, property-card-callout (mono + warm cream), partner-disclosure (Path C), faq-item, service-tile, nav-link with active state, footer, and link-inline (smart-blue body links).

**The component layer is where DESIGN.md becomes operational.** Engineering reads `components.button-primary.backgroundColor` to style every primary CTA on the site. If Phase 2 brings a brand refinement that changes flag_red from #c22326 to a slightly different value, every primary CTA inherits the change. No find-and-replace through the codebase.

**Interaction states** (hover, active, pressed) are expressed as separate component entries with a related key suffix. The linter recognizes the relationship and runs contrast checks on each state independently.

## Do's and Don'ts

**DO** define interaction with a single color (tertiary / flag_red). Resist introducing a secondary accent for CTAs. The brand has more authority with one tightly-deployed accent than with three loosely-deployed ones. Hunter green is brand voice, not interaction; deep navy is authority, not interaction; golden orange is warmth, not interaction.

**DO** use mono typography only on Property Card surfaces. The mono token is the visual signal of "this is the place-memory artifact, not the marketing surface." If another surface starts using mono, the Property Card stops being the unique place-memory expression.

**DO** validate every new component definition by running `npx @google/design.md lint DESIGN.md` before committing. Catches broken token references, missing primary, contrast violations, orphaned tokens, section order issues.

**DO** prefer semantic tokens (`primary`, `tertiary`, `accent`) over raw palette tokens (`hunter-green-500`, `flag-red-400`) in component definitions. Raw tokens are fine for chart data viz and one-off shade needs; semantic tokens are required for components.

**DON'T** use `muted` (#374151) on `surface-alt` (#F3F4F6). Contrast falls below 4.5:1 in some browser color profiles. Use `secondary` (#11133f) instead — it's the body-text default and passes contrast everywhere.

**DON'T** introduce a CSS variable that bypasses the token system (e.g., `--brand-pe-red`). The whole point of DESIGN.md is that the brand changes by editing this file, not by editing the codebase. If you find yourself wanting a brand-specific variable, promote the value to a token here.

**DON'T** ship a Phase 2 brand refinement that doesn't pass `npx @google/design.md diff DESIGN.md DESIGN-v2.md` without a regression flag. If diff says regression: true, the contrast got worse or a token went orphaned. Fix before merge.

**DON'T** use flag_red for anything that isn't an interaction trigger. Errors and status-error reuse flag_red because errors *are* interaction triggers ("fix this thing"). Decorative red — even brand-aligned — is forbidden.

**DON'T** put hunter_green on surfaces that aren't brand-voice surfaces. It's the rarest of the five colors by intent. If hunter_green appears on every page section, it stops being brand voice.
