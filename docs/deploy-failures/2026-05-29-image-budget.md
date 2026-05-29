# 2026-05-29 — audit:images: 17 client photos over the 130KB budget

- **Commit:** `a78668b71ce196c374c8cacc6ff495310d469ada`
- **Stage that failed:** `audit:images`
- **Failure class:** image-budget
- **Auto-fixable:** yes

## Raw error (trimmed to the signal)

```
Image audit failed with 34 issue(s):
- public/images: public/images/clients/commercial/epdm-1.webp is 232586 bytes; budget is 130000 bytes
- public/images: public/images/clients/commercial/metal-1.webp is 280052 bytes; budget is 130000 bytes
- public/images: public/images/clients/residential/res-2.webp is 426386 bytes; budget is 130000 bytes
  ... (17 unique client photos, each counted twice once dist/ is built)
```

## Root cause

The 2026-05-29 client-review build added a commercial membrane gallery,
multi-family, and residential client photos converted at q82/1600px. They were
valid WebP but several still exceeded the 130KB cap. The build itself passed
(132 pages, all other audits green) — only the image-weight gate failed. The
in-sandbox build last session couldn't run the full audit chain (the `.vite`
cache bus-error documented in the handoff), so the budget violation slipped
through to Coolify.

## Fix applied

Recompressed all 17 under ~124KB via stepped quality + downscale: most held at
1152–1600px / q46–76; `res-2.webp` needed 960px @ q38 to fit (re-source a tighter
crop if it reads soft on the page).

## Guard added (so it never recurs)

Same guard as the 2026-05-28 incident: `scripts/deploy-preflight.mjs` **Stage 1**
(`optimize-public-images.mjs`) recompresses any over-budget WebP under its tier
budget before **Stage 2** re-runs the gate. The autofixer warns when an image
can't fit by compression alone (it's then a re-source decision, not a silent
crush). Always run `npm run preflight` before committing image additions —
don't rely on the sandbox build, which can't run the full chain.
