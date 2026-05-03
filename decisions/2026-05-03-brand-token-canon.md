# Brand-token canon for the website build

**Date:** 2026-05-03
**Decided by:** Chris Hussey
**Authored:** Maren Castellan-Reyes
**Status:** Accepted — supersedes any conflicting role assignment in `/brand-assets/client/brand/Color/tokens/_variables.css` and any older draft in `/tech/DESIGN.md`.

---

## Context

Two token files claimed canonical status with conflicting role assignments:

- `/tech/DESIGN.md` — described in CLAUDE.md §8 as the build's design source-of-truth. Treated hunter-green as primary, flag-red as the sole CTA color, deep-navy as body/authority, golden-orange as eyebrows, smart-blue as links.
- `/brand-assets/client/brand/Color/tokens/_variables.css` — Pantone-anchored "Master Color System v1.0" generated from the brand guidebook. Treated navy as the primary anchor, gold as CTA, red as secondary, green as secondary anchor, blue as links.

Hex values largely matched, but role assignments diverged. With the TPO pillar-page rebuild blocked on this decision, escalated to Chris.

## Decision

Canonical role-to-hex mapping for the website build:

| Role | Hex | Token name | Notes |
|---|---|---|---|
| Primary | `#11133f` | `--color-primary` | Deep navy. Dark surfaces, body text on light surfaces, B2B authority. The procurement-officer color. |
| Secondary | `#3b6b4c` | `--color-secondary` | Hunter green. Secondary surfaces, brand voice color, place-memory. Used where we need warmth + heritage without authority weight. |
| Tertiary (CTA) | `#C22326` | `--color-tertiary` | Flag red. Sole interaction color. Used sparingly — if it appears in every section it stops being interaction. |
| Accent | `#eaa221` | `--color-accent` | Golden orange. Eyebrow tags, stat callouts, badges. Black-on-gold passes AA at ~10:1. |
| Info / links | `#0066cc` | `--color-info` | Smart blue. Inline body links, "learn more" secondary actions. Distinct in role from primary: blue = action, navy = surface/authority. |

## Why this split

1. **Primary = navy** anchors the B2B credibility — 80% of the engagement is commercial procurement, where navy reads "established roofing contractor" faster than any other color.
2. **Secondary = green** keeps the heritage/warmth tone present (residential trust, environmental positioning) without forcing it into every primary surface.
3. **CTA = red** stays scarce by design. One color earns clicks. Gold-as-CTA was the alternative path; it lost because `#C22326` against either `#11133f` or `#FFFFFF` produces the highest interaction-action contrast in the palette.
4. **Accent = gold** keeps gold in its strongest role: eyebrows, callout backgrounds, scarcity moments. Promoting gold to CTA would dilute its eyebrow utility and weaken the visual hierarchy.
5. **Info = blue** preserves the universal "this is a link" affordance without clashing with navy primary surfaces.

## Implementation consequences

The DESIGN.md role table previously listed green=primary, navy=secondary. That ordering must invert. The shade scales themselves (100–900) stay as-is; only the semantic role tokens at the bottom of DESIGN.md change.

The `_variables.css` file's stated role labels in comments (Pantone 2767 C "Primary Anchor", Pantone 711 C "Secondary", Pantone 7409 C "Accent / CTA") are now wrong relative to canon. Comments in that file must be updated to match the new canon. The variable names themselves (`--pe-navy`, `--pe-red`, `--pe-gold`, `--pe-green`, `--pe-blue`) are descriptive and stay; only the role-mapping comments change.

Hex value `#C22328` in `_variables.css` line 24 is one digit pair off from canon `#C22326`. Treat canon as source-of-truth and update `_variables.css`. ΔE difference is below human perception threshold; this is a hygiene fix, not a brand color change.

## Where this gets enforced

- `/tech/DESIGN.md` — semantic role tokens at lines 76–139 must be re-mapped. Pending.
- `/brand-assets/client/brand/Color/tokens/_variables.css` — role comments + line 24 hex. Pending.
- `/brand-assets/client/brand/Color/tokens/_variables.scss` — same updates as the .css. Pending.
- `/brand-assets/client/brand/Color/tokens/tailwind-colors.js` — confirm role keys reflect canon. Pending.
- `/brand-assets/client/brand/Color/PANTONE-VENDOR-CARD.md` — Pantone numbers don't change, but if it lists role names ("Primary," "CTA," etc.), those need updating. Pending.

These updates happen as part of the TPO rebuild — every component touched gets the new tokens, and the source files are corrected when first encountered.

## Reversal cost

Inverting primary/secondary post-launch would require: re-rendering every dark-surface and brand-voice-section component; updating Tailwind theme; rebuilding the design-system Storybook; re-shooting any photography that was art-directed against the wrong primary. Estimated 40–60 hours of rework. Hence the decision-log entry.
