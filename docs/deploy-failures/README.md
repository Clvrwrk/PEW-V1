# Deploy Failure Archive

Every Coolify deploy failure for **Clvrwrk/PEW-V1** gets logged here, then the
preflight that runs before every commit/push is extended so the *same class* of
failure can never reach Coolify again. This is the institutional memory behind
`_aia4-skills/aia4-deploy-preflight/`.

## How it works

1. **A deploy fails.** Coolify runs the Dockerfile, whose build step is
   `npm run build` (`astro build` + the seven `audit:*` gates), preceded by
   `npm ci`. Any non-zero exit kills the deploy.
2. **Log it.** Add a one-line row to [`LOG.md`](./LOG.md) and a per-incident
   file `YYYY-MM-DD-short-slug.md` (use [`_TEMPLATE.md`](./_TEMPLATE.md)) with the
   raw error, root cause, the fix applied, and the **guard** that now prevents it.
3. **Teach the preflight.** If the class isn't already caught by
   `scripts/deploy-preflight.mjs`, add a stage (or extend the autofixer
   `scripts/optimize-public-images.mjs`) so it is. Update the skill's SKILL.md
   "Known failure classes" table.
4. **Verify.** `npm run preflight` must now catch (and where possible auto-fix)
   the logged case before it can be pushed.

## The gate chain (what Coolify actually runs)

```
npm ci                       # lockfile must be in sync with package.json
└─ npm run build
   ├─ astro build            # 132 static pages — runtime crashes surface here
   ├─ audit:contrast         # WCAG contrast role pairs
   ├─ audit:schema           # JSON-LD validity across all pages
   ├─ audit:silo             # blog reverse-silo internal-link integrity
   ├─ audit:orphans          # no orphaned / uncontained pages
   ├─ audit:gbp-plan         # GBP Phase-0 URL plan published
   ├─ audit:images           # WebP-only + per-image byte budgets  ← most frequent failure
   └─ audit:pagebuilder      # PageBuilder governance invariants
```

## Run the preflight

```bash
npm run preflight        # full chain incl. astro build — run before the real push
npm run preflight:fast   # static audits + image autofix only (skips astro build)
npm run fix:images       # just the image autofixer (convert rasters + recompress)
```

See [`LOG.md`](./LOG.md) for the running history.
