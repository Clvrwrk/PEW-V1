# Pro Exteriors — Client Asset Inventory

> Local mirror of client-supplied assets from the shared Drive folder. **Drive is the source of truth; this folder is a working copy.** Never modify, recolor, recompress, or rename original files. If a file needs to be edited (cropped, optimized, exported), copy it to a sibling folder and edit the copy — keep the original byte-identical to Drive.
>
> **Source of truth:** [Pro Exteriors — Website / Website Assets (Drive)](https://drive.google.com/drive/folders/1MNWinYGhhVpjiTq-z4cd1_Ump9_PDJco)
>
> **Maintainer:** Maren Castellan-Reyes · **Last updated:** 2026-04-11

---

## How this inventory works

Every file in `/brand-assets/client/` gets one row in the table below. When Chris drops a new file into `_inbox/`, Maren classifies it, moves it into the correct subfolder, and adds a row here. When Chris confirms a file is final, Maren marks it with status `confirmed`. When a file is superseded by a newer version, the old row stays but gets status `archived` and a `replaced_by` pointer.

**Subfolders:**

| Folder | What goes here |
|---|---|
| `_inbox/` | Anything Chris just dropped in and hasn't been classified yet. Should be empty most of the time. |
| `logos/` | Pro Exteriors logos in any format (PNG, SVG, EPS, AI). Include all variants — primary, mark-only, mono, reverse, etc. |
| `brand/` | Brand color palettes, typography specs, brand guideline PDFs, style guides, mood boards. |
| `photography/` | Real Pro Exteriors photography — crews, trucks, equipment, headshots, lifestyle. **No stock.** |
| `projects/` | Project gallery photos — completed roofs, jobsite progress, before/after pairs. Organize by project name when possible. |
| `copy/` | Any client-supplied written content — service descriptions, about-us copy, value propositions, mission/vision statements, testimonial text. |
| `testimonials/` | Customer testimonial source material — review screenshots, video files, written quotes, attribution permissions. |
| `misc/` | Anything that doesn't fit the categories above. Should be small. If `misc/` grows, we add a real category. |

**File naming:** Preserve the original filename exactly when mirroring from Drive. Do not rename. If a file has a useless name (`Outlook-2cqf4gde.jpg`, `IMG_4521.heic`, `Untitled.pdf`), note a *display name* in the `notes` column of the inventory below — but the actual filename on disk stays as-is so it can be matched against Drive 1:1.

---

## Inventory

| # | Filename | Category | Drive file ID | Drive link | Status | Confirmed by Chris | Use case | Notes |
|---|---|---|---|---|---|---|---|---|
| 1 | `Outlook-2cqf4gde.jpg` | misc | `1B6goc47Ty6tcyPcLqDdovTuKcS965lSx` | [link](https://drive.google.com/file/d/1B6goc47Ty6tcyPcLqDdovTuKcS965lSx/view) | pending download | — | TBD | 173 bytes — likely Outlook email forwarding residue, not a real asset. Confirm with Chris whether to discard or keep. |
| 2 | _(pending)_ | | | | | | | |
| 3 | _(pending)_ | | | | | | | |
| 4 | _(pending)_ | | | | | | | |
| 5 | _(pending)_ | | | | | | | |
| 6 | _(pending)_ | | | | | | | |
| 7 | _(pending)_ | | | | | | | |
| 8 | _(pending)_ | | | | | | | |
| 9 | _(pending)_ | | | | | | | |
| 10 | _(pending)_ | | | | | | | |
| 11 | _(pending)_ | | | | | | | |
| 12 | _(pending)_ | | | | | | | |
| 13 | _(pending)_ | | | | | | | |
| 14 | _(pending)_ | | | | | | | |
| 15 | _(pending)_ | | | | | | | |
| 16 | _(pending)_ | | | | | | | |

**Status values:** `pending download` · `mirrored` · `classified` · `confirmed` · `superseded` · `archived`

---

## Open questions for Chris (asset-related)

- [ ] Is `Outlook-2cqf4gde.jpg` a real asset or email-forward residue? At 173 bytes it can't be a meaningful image.
- [ ] What categories should we expect among the 16 files? (Logos? Project photos? A brand PDF?)
- [ ] Are there brand colors / fonts beyond what's in the Drive folder, or are the 16 files comprehensive?
- [ ] Photography rights: are all client-supplied photos owned by Pro Exteriors and cleared for web use, or do any need release forms before they ship?
- [ ] Are the two loose Google Docs in your Drive root (the home page build requirements doc and the GHL technical grimoire) meant to live inside `Website Assets`, or do they belong in `/discovery/` instead?

---

## Sync rules (read before any update)

1. **Drive is source of truth.** Local copies exist for read-access only. If a file changes on Drive, the local copy must be re-mirrored — local edits are forbidden on originals.
2. **Re-sync cadence:** Pull fresh from Drive at the start of any deliverable that depends on client material. Don't trust this inventory to be current if it's more than ~7 days stale.
3. **Naming integrity:** Filenames on disk must match Drive exactly. The inventory is the only place display names and human-friendly labels live.
4. **Audit trail:** When a file is superseded, do not delete the old row. Mark it `archived` and add `replaced_by: <new filename>` in the notes column. We need the audit trail for the conversion-attribution case we'll have to make in year 5.
