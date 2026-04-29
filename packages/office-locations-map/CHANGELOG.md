# Changelog

All notable changes to `@proexteriors/office-locations-map` will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] — 2026-04-18

Initial package cut. Drop-in React component for the Pro Exteriors "Where We Work" surface.

### Added
- `OfficeLocationsMap` React component with:
  - Three-tier US state model (active / licensed / not serviced)
  - `geoAlbersUsa` projection via `d3-geo` + `topojson-client`, loading `us-atlas` 10m states TopoJSON from the jsdelivr CDN
  - Brick-and-mortar and satellite pin glyphs placed at real lat/lng
  - Contact-card modal with address, phone, email, hours, and accreditation rows
  - Full keyboard + screen-reader support (Tab / Enter / Space / Esc, ARIA labels, focus management)
  - `prefers-reduced-motion` respected
  - Hover lift on active/licensed states, twist animation on hovered pins
- Bundled Pro Exteriors roster (Richardson TX, Euless TX, Wichita KS, Greenwood Village CO, Kansas City MO, Valdosta GA, North Carolina, GA satellite)
- Bundled state tiers: 6 active (TX, KS, CO, GA, NC, MO), 10 licensed (LA, SC, OK, NE, MN, MS, AL, AR, TN, KY)
- ESM + CJS builds in `dist/` via esbuild, with sourcemaps
- Raw JSX source exposed via the `./source` subpath for fork/copy use
- Hand-written TypeScript declarations in `dist/index.d.ts`

### Known stubs
- GA satellite office is pinned at the Atlanta city centroid (`33.7490, -84.3880`) as a placeholder. Replace with the confirmed address when it lands.
- MO promoted to active because the bundled roster includes a Kansas City, MO brick & mortar — original "located in" list omitted MO. Confirm with Chris.

### Peer dependencies
- `react` `>=17`
- `react-dom` `>=17`
- `d3-geo` `^3`
- `topojson-client` `^3`
