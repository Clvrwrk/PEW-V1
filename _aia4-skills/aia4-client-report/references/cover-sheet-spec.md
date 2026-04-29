# Cover Sheet Specification

Every client-facing AIA4 deliverable starts with a cover sheet. This file is the exact spec for what that cover sheet contains, how it's laid out, and which assets it uses. There are no valid exceptions unless Chris explicitly requests a no-coversheet draft.

## Why the cover sheet matters more than it seems

The cover sheet is the first ~3 seconds of the client's experience with the report, and it's the single strongest brand touch in any deliverable. A polished cover sheet tells the client: this is finished, this is professional, this was built by a team that cares about craft. A sloppy cover sheet — misaligned logo, wrong date format, missing engagement lockup — kills the credibility of the work behind it before the client has read a word.

Cover sheets also travel. The client forwards the report internally. The cover sheet is what other people in their org see first, often without any context. It has to stand alone as a document that communicates what this is, who made it, and for whom.

## Required fields

Every cover sheet contains these seven fields. No exceptions.

1. **AIA4 logo** (see asset rules below)
2. **Engagement lockup** — the specific "AIA4 [Client Identifier]" string confirmed for this engagement. For the Pro Exteriors Website project, this is always "AIA4 Pro Exteriors" unless Chris explicitly approves a variant. Other engagements will have their own confirmed lockup.
3. **Report title** — the specific title of this deliverable. Not "Quarterly Report" — "Q2 2026 Commercial Conversion Audit." Specific enough that someone finding this PDF in their email a year later can tell what it is without opening it.
4. **Report subtitle or descriptor** (optional) — one line of supporting context. Examples: "Competitive landscape and organic opportunity map" or "Discovery synthesis and strategic recommendations."
5. **Client name** — the full formal client name as they use it. "Pro Exteriors" not "Pro Ext" or "ProExteriors."
6. **Date** — in full, unambiguous format: "April 11, 2026" not "4/11/26" or "11/4/26." Month spelled out, four-digit year, no ordinal suffixes ("April 11" not "April 11th").
7. **Author line** — "Prepared by Maren Castellan-Reyes, Senior Director, Website & Application Experience, AIA4." For other practice leads, substitute accordingly.

## Optional fields

Include when relevant:

- **Confidentiality notice** — for sensitive reports that contain proprietary client data, strategy, or third-party research that isn't meant to circulate. Short line at the bottom: "Confidential — prepared for [Client Name]. Not for external distribution."
- **Version number** — for reports that will go through multiple revisions. "Version 1.0 — initial" or "Version 2.1 — post-stakeholder review."
- **Engagement phase tag** — for multi-phase engagements where it's useful to mark which phase this report belongs to. "Discovery Phase" / "Strategy Phase" / "Build Phase" / "Post-Launch."

## Asset rules

### Logo file choice

**Always prefer the SVG** for any format that supports vector graphics. SVG renders cleanly at any scale, doesn't pixelate on zoom, and produces smaller file sizes in the final deliverable.

Current asset locations (Pro Exteriors project):
- SVG: `/sessions/gifted-sharp-davinci/mnt/Pro Exteriors Website/brand-assets/logos/agency-logo-transparent.svg`
- PNG fallback: `/sessions/gifted-sharp-davinci/mnt/Pro Exteriors Website/brand-assets/logos/agency-logo-transparent.png`

**Use the PNG only when:**
- The target format is DOCX, PPTX, or PDF and the rendering pipeline doesn't handle SVG embedding reliably (most Office pipelines fall into this category)
- A specific pixel resolution is needed and the PNG hits it without scaling artifacts
- An image editing operation (compositing, shadow, overlay) requires a raster asset

### Logo placement

- **Top-left** is the default position on all formats unless the layout specifically calls for something else
- **Centered at top** is acceptable for cover-heavy layouts where the title and logo are the only elements on the page
- **Clear space** around the logo equal to the logo's own cap-height (the height of an uppercase letter in the mark) on all four sides — no other elements, text, or decorative lines within this space
- **Minimum size** — no smaller than 120px wide on digital formats, no smaller than 1 inch wide on print formats. Below these sizes the brackets and the small detail elements become visually ambiguous
- **Maximum size** — no larger than 30% of the page width on cover pages. Larger than that and the logo dominates the title, which is wrong — the title is the subject, the logo is the frame

### Logo protection rules

The AIA4 mark is never:
- Recolored (don't change the red or the gold)
- Rotated (the corner brackets are orientation-specific)
- Stretched or squashed (horizontal and vertical proportions are locked)
- Cropped
- Placed on a busy background that reduces contrast below visual accessibility threshold
- Given a drop shadow, outer glow, or other decorative effect
- Combined with the client logo as a co-brand lockup without Chris's approval

If the background needs contrast help, place the logo on a solid dark fill (near-black, #0A0A0A or similar) sized to provide at least one cap-height of clear space on every side. A dark backplate is always better than recoloring the mark.

## Layout templates by format

### DOCX cover page

- Page 1 is the cover; main content starts on page 2
- Logo in the top-left, approximately 1.5 inches wide
- Vertical space equivalent to ~2 inches
- Report title in a display weight, left-aligned, 28–36pt
- Subtitle in a lighter weight, left-aligned, 14–16pt, directly below title with tight leading
- Vertical space equivalent to ~1 inch
- Client name, left-aligned, 12pt
- Date, left-aligned, 12pt, directly below client name
- Author line, left-aligned, 10pt, at the bottom of the page (~1 inch from bottom margin)
- Optional confidentiality notice, left-aligned, 8pt italic, directly below author line
- No page number on the cover page

### PPTX cover slide

- 16:9 aspect ratio (default); 4:3 only if the client's slide template explicitly uses it
- Logo in the top-left corner of the slide, approximately 15% of slide width
- Report title large, left-aligned or centered, occupying the visual middle of the slide
- Subtitle below title, smaller, same alignment
- Client name and date in the bottom-left, stacked
- Author line in the bottom-right, right-aligned
- Optional: a subtle background treatment (solid color, faint texture, brand-aligned photo at low opacity) — never a stock photo of roofs or hard hats

### PDF cover (for reports built directly as PDFs, not converted from DOCX)

- Same general layout as DOCX cover
- Higher-density typography if the PDF is meant for on-screen reading (14pt body instead of 12pt)
- Logo rendered from SVG if the PDF generator supports it (ReportLab, WeasyPrint, Chrome-to-PDF all handle SVG well)
- Vector logo is especially important for PDFs because PDFs get printed, and raster logos degrade visibly on print

### Markdown reports (for quick deliverables)

Markdown reports don't have "cover sheets" in the traditional sense, but they should still open with a consistent metadata block that plays the same role:

```markdown
# [Report Title]
## [Subtitle, if applicable]

**Prepared for:** [Client Name]
**Prepared by:** Maren Castellan-Reyes, Senior Director, Website & Application Experience, AIA4
**Engagement:** AIA4 Pro Exteriors (or as confirmed)
**Date:** April 11, 2026
**Version:** 1.0

---
```

For markdown reports that will be rendered to HTML or converted to PDF later, include a reference to the logo in an `![AIA4](/brand-assets/logos/agency-logo-transparent.svg)` at the very top so downstream rendering picks it up.

## Verification checklist

Before shipping any cover sheet, verify:

- Logo is present, vector-preferred, correctly sized, with adequate clear space
- Engagement lockup is exactly "AIA4 [Confirmed Identifier]" — no typos, no spacing errors
- Report title is specific enough to be identifiable out of context
- Client name is the full formal name
- Date is in "Month DD, YYYY" format
- Author line includes full title and agency
- No stray text, placeholder content, or "Lorem Ipsum" remnants
- No forbidden words (check against voice-and-tone.md)
- Optional confidentiality notice included if the report contains sensitive data

If any item fails, fix it before the cover sheet is rendered into the final file.
