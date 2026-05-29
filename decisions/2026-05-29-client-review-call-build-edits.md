# Decision: Build edits from the 2026-05-29 client review call

**Date:** 2026-05-29
**Author:** Maren Castellan-Reyes
**Status:** Approved by Chris (this commit) — executing against the pre-launch review
**Reversal cost:** Low–Medium (markup + asset swaps; git-reversible)

## Context

Chris ran a website review call with Pro Exteriors (Chandler Milliken, Tabatha
Milliken, plus Ryan and Lonnie). The transcript produced a task list; Chris
narrowed it twice and approved the final scope below. Operational/human tasks
(DNS, lead-form routing to Madison/Crystal, phone consolidation, financing copy,
locations/map, launch sequence) were explicitly pulled OUT of this build scope
and will be handled by humans / a later workflow. What remains is the on-site
build work.

## Approved build scope

**Navigation & page architecture**
- Split "About" into three top-level nav items: About Us (`/about/`), Team
  (`/team/`), Pro Ministries (`/pro-ministries/`).
- About Us copy from `content/Client Docs/Pro Ministries/Option 1.pdf`.
- Pro Ministries page copy from `content/Client Docs/Pro Ministries/Pro Ministries Outreach.pdf`.
- Pro Ministries collage: remove `485111221_*` and `500468406_*`.
- Remove the two legacy flyer graphics from About.
- Hide Resources and Projects from nav.
- Rename "Operations & Leadership" → "Executive and Management Team."

**Hero & trust row (homepage)**
- National hero language; keep "16 states."
- Remove Malarkey Emerald Premium badge → replace with Pro Ministry logo
  (`Logos/476481143_*`, as is), far left, "Faith Based" label.
- Founding-year badge "Roofing since 2021."
- Remove the "one of five contractors in DFW with Emerald Premium" line.
- Replace "10M+ Sq Ft Installed" stat with "100+ Roofs Protected."

**Homepage service-division cards (three across)**
- Roof Asset Management — bg `Service/Photos/Screenshot 2026-02-11 061405 (1).png`
- Commercial — bg `Commercial Photos/TPO/Screenshot 2026-02-06 073056.png`
- Residential — bg `Residential/Photos/IMG_4079 (1).jpg`

**Residential Services page**
- Strip generic AI images + static video poster; use `Residential/Photos`.
- Apply `Residential/Pro_Exteriors_Residential_Services.docx` copy.

**Commercial Services page**
- Strip generic AI images; feature EPDM/Metal/Shingles/TPO from `Commercial Photos`.
- Add a Multi-Family section using `Multi-Family Photos`.
- Apply `Pro_Exteriors_Commercial_Services.docx` copy.

**Team section**
- "Meet the Team" / "Executive and Management Team" heading, grid centered,
  static cards (no click-to-message).

## Asset pipeline

Client photos were converted from `content/Client Docs/**` to web-optimized
webp under `/public/images/clients/**`, `/public/images/home/**`, and
`/public/Logos/pro-ministries-logo.webp` (max 1600px, q82, EXIF-corrected).
Drive remains source of truth per CLAUDE.md §11a.

## Known gaps (flagged to Chris, do not invent)

- **Sean Hillard headshot** — not present in `Company Headshots` or `Team Photos`.
  The transcript notes it was being AI-generated and uploaded; the asset has not
  landed. Team grid is built to absorb it as a one-line add once supplied.
- **Real vanity metrics** beyond "100+ Roofs Protected" still pending.
- Residential client photo set is small (7); they are mapped to the highest-
  visibility slots and reused across the service grid rather than leaving any
  generic AI image in place.

## Hard gates (CLAUDE.md §4)

- **Trust:** removes unsourceable/representative AI imagery and the unverifiable
  "10M+ sq ft" stat; replaces with real client photos and a conservative
  "100+ Roofs Protected." "1 of 5 Emerald Premium" claim removed at client request.
- **Performance:** all swapped imagery served as resized webp.
- **Accessibility/Schema/Measurement:** preserved on edited pages; full Lighthouse
  + form end-to-end checks remain a human launch-gate (out of this scope).

## Rollback

`git revert` this commit. Converted assets are inert if unreferenced.
