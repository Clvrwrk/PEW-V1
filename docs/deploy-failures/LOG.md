# Deploy Failure Log

Newest first. One row per incident. Detail lives in the linked per-incident file.

| Date | Commit | Stage | Class | Auto-fixable | Guard | Detail |
|------|--------|-------|-------|--------------|-------|--------|
| 2026-05-29 | `a78668b` | `audit:images` | image-budget | yes | Stage 1 autofix + Stage 2 gate | [link](./2026-05-29-image-budget.md) |
| 2026-05-28 | `f2edae4`, `707edf4` | `audit:images` | image-format + image-budget | yes | Stage 1 autofix + Stage 2 gate | [link](./2026-05-28-image-format-and-budget.md) |
| 2026-05-04 | `698c039` | `astro build` | build-runtime | no (build catches it) | Stage 3 full build | [link](./2026-05-04-faq-undefined-map.md) |
| 2026-05-03 | `40954fc` | `npm ci` | lockfile-desync | yes | Stage 0 lockfile sync | [link](./2026-05-03-npm-lock-desync.md) |

## Failure classes & their guards

| Class | Guard in `scripts/deploy-preflight.mjs` | Auto-fix |
|-------|------------------------------------------|----------|
| lockfile-desync | Stage 0 — `npm ci --dry-run` | `npm install --package-lock-only` |
| image-format (non-WebP raster) | Stage 1 + Stage 2 | convert→webp, drop original (`optimize-public-images.mjs`) |
| image-budget (over byte cap) | Stage 1 + Stage 2 | recompress / downscale under budget |
| build-runtime (crash in a component/page) | Stage 3 — full `npm run build` | none — must be fixed by hand |
| schema / contrast / silo / orphans / gbp-plan / pagebuilder | Stage 3 — full `npm run build` | none yet — caught, not fixed |
