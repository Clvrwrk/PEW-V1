# 2026-05-28 — audit:images: non-WebP rasters + team headshots over budget

- **Commit:** `f2edae4...` and `707edf4...` (two attempts, same root cause)
- **Stage that failed:** `audit:images`
- **Failure class:** image-format + image-budget
- **Auto-fixable:** yes

## Raw error (trimmed to the signal)

```
Image audit failed with 107 issue(s):
- public/images: non-WebP raster asset found: public/images/partners/Certainteed_logo_PNG7.png
- public/images: non-WebP raster asset found: public/images/partners/GAF-Logo_800x400.jpeg
  ... (16 partner logos as .png/.jpg/.jpeg)
- public/images: non-WebP raster asset found: public/images/pro-ministries/484510611_...jpg
  ... (14 pro-ministries .jpg)
- public/images: public/images/team/Lucinda Dunn - Director of Accounting.webp is 835546 bytes; budget is 130000 bytes
  ... (13 team headshots 450KB–835KB)
- src/pages/index.astro: local raster reference must be WebP: /images/partners/gaf.jpeg
  ... (.astro pages referencing the raster logos by literal path)
```

## Root cause

Two distinct problems landed together:
1. **Format** — partner logos and pro-ministries photos were committed to
   `public/images/**` as `.png/.jpg/.jpeg`. The audit forbids any non-WebP
   raster in deployable asset trees.
2. **Budget** — 13 team headshots were exported straight from source at
   450KB–835KB, far over the 130KB per-image cap.
The `.astro` "local raster reference must be WebP" and "referenced image does
not exist" lines were downstream symptoms of (1): pages pointed at the raster
filenames, and the dynamic `${...}` references can't be statically resolved.

## Fix applied

Converted every partner logo and pro-ministries photo to `.webp` (deleting the
originals), recompressed all team headshots under 130KB, and updated the page
references to the `.webp` filenames.

## Guard added (so it never recurs)

`scripts/deploy-preflight.mjs` **Stage 1** runs `scripts/optimize-public-images.mjs`,
which walks `public/images` + `public/Logos` and (a) converts any non-WebP raster
to WebP under budget and deletes the original, and (b) recompresses any
over-budget WebP. **Stage 2** then runs `audit:images --no-dist` to confirm.
Logos target the 80KB tier; general images the 130KB tier — enforced from the
shared `scripts/lib/image-budget.mjs` that the audit also imports, so the fixer
and the gate can never disagree.
