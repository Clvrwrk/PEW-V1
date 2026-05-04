# Image Performance Inventory — 2026-05-04

**Scope:** Runtime image assets referenced by the Astro site through `public/`, `src/pages`, `src/content`, and `src/lib/schema`.

## Pre-Change Runtime Inventory

- `public/images`: 39 JPG files and 19 WebP files.
- `public/Logos`: 10 SVG files.
- `src`: no raster image binaries; runtime images are string references to `/images/...` or `/Logos/...`.
- `public/images/**/.original`: source masters may exist locally, but are ignored and must not ship in `dist`.

## Largest Assets Found

| Asset | Format | Bytes | Dimensions |
| --- | --- | ---: | --- |
| `public/Logos/Horizontal 1200x650 lgt.svg` | SVG | 6,822,634 | 1201x650 |
| `public/Logos/Horizontal 1200x280 lgt.svg` | SVG | 4,374,172 | 1200x280 |
| `public/Logos/Favicon 500x500 lgt.svg` | SVG | 2,532,821 | 500x500 |
| `public/images/commercial-hero.webp` | WebP | 1,432,818 | 1088x608 |
| `public/images/residential-hero.jpg` | JPG | 1,353,085 | 2752x1536 |
| `public/images/locations-hero.jpg` | JPG | 1,270,551 | 2752x1536 |
| `public/images/home-hero.jpg` | JPG | 974,508 | 2752x1536 |
| `public/images/commercial-hero.jpg` | JPG | 936,519 | 2752x1536 |
| `public/images/blog-hero.jpg` | JPG | 647,862 | 2752x1536 |

## Broken Or Risky References Found

- `src/components/seo/BaseLayout.astro` defaults to missing `/images/og-default.jpg`.
- `src/pages/residential-roofing/index.astro` references missing `/images/placeholders/*.jpg` assets.
- `src/pages/residential-roofing/index.astro` schema references missing `/images/pro-exteriors-logo.svg` and JPG hero URLs.
- `src/content/subdivisions/twin-creeks-allen.mdx` references missing `/images/subdivisions/twin-creeks-allen-hero.jpg`.
- Residential service and city MDX files reference `/images/.../residential-roofing/...` folders, while the tracked assets live under `/images/.../residential/...`.
- `src/content/services/residential/asphalt-shingles.mdx` contains the typo `asphalt-shingles/-hero.jpg`.
- Schema helpers use remote `logo.png` fallbacks that should become a valid logo URL.

## Build-Gate Target

The optimized build should ship WebP for runtime raster images, keep SVG logos/favicons valid, prevent `.original` leakage, fail missing local image references, and reject oversized WebP assets that would threaten PageSpeed performance.
