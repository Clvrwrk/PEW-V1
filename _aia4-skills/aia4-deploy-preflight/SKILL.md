---
name: aia4-deploy-preflight
description: >
  Run the Coolify deploy gate chain locally and auto-remediate the fixable
  failure classes BEFORE any commit or push to the Pro Exteriors site
  (Clvrwrk/PEW-V1). Use this every time you are about to `git commit` or
  `git push` this repo, or whenever a Coolify deploy fails. Maintains the
  deploy-failure archive and learns: each new failure class gets logged and
  the preflight extended so it can never reach Coolify twice.
---

# aia4-deploy-preflight

Coolify deploys PEW-V1 by running a Dockerfile whose build step is
`npm run build` (`astro build` + seven `audit:*` gates), preceded by `npm ci`.
**Any non-zero exit kills the deploy.** This skill runs that exact chain
locally first, fixes what can be fixed mechanically, and blocks the
push/commit until it is green.

## When to use (BLOCKING)

Invoke **before every `git commit` or `git push`** to this repo, and **after
any Coolify deploy failure**. This is a hard gate, not a suggestion — the whole
point is that nothing reaches Coolify without passing here first.

## What to do

1. **Run the preflight:**
   ```bash
   npm run preflight        # full chain incl. astro build (use before the real push)
   npm run preflight:fast   # static audits + image autofix only; skips astro build
   ```
   - Use the **full** `npm run preflight` before a real push — it is the only
     mode that catches build-runtime crashes (Stage 3).
   - `--fast` is acceptable only in a sandbox that can't run `astro build`
     (e.g. the FUSE-mount `.vite` bus-error noted in handoffs). It does **not**
     cover runtime crashes, so a clean `--fast` run is *not* deploy-safe on its
     own — a full build must pass somewhere before the push.

2. **Let it auto-remediate.** The preflight auto-fixes two classes in place:
   - **lockfile desync** → `npm install --package-lock-only` to resync.
   - **image format / budget** → `scripts/optimize-public-images.mjs` converts
     non-WebP rasters to WebP (dropping the original) and recompresses
     over-budget WebP under its tier budget.
   If it auto-fixed files, **stage them** (`git add`) and re-run to confirm green.

3. **If a stage can't be auto-fixed** (build-runtime crash, schema/contrast/etc.),
   the output names the failing gate and shows the error. Fix it by hand, re-run.

4. **On a NEW failure class** (something the preflight passed but Coolify still
   rejected): this is the learning step — see below.

5. **Only push when the summary shows all ✅.**

## The learning loop (do this on every new failure)

When a deploy fails — or you discover a class the preflight doesn't catch:

1. **Log it.** Add a row to `docs/deploy-failures/LOG.md` and create
   `docs/deploy-failures/YYYY-MM-DD-slug.md` from `_TEMPLATE.md`: raw error,
   root cause, the fix applied, and the guard.
2. **Teach the preflight.** Extend `scripts/deploy-preflight.mjs` with a stage
   that catches the class (and, if mechanically fixable, add a rule to
   `scripts/optimize-public-images.mjs` or a new autofixer). Update the
   "Known failure classes" table below and in `LOG.md`.
3. **Prove it.** Re-run `npm run preflight` and confirm the logged case is now
   caught (and auto-fixed where possible) before it can be pushed.

The archive is the institutional memory; the preflight is its enforcement. They
move together — never log a failure without strengthening the guard.

## Known failure classes (kept in sync with docs/deploy-failures/LOG.md)

| Class | Caught by | Auto-fix |
|-------|-----------|----------|
| lockfile-desync (`npm ci` EUSAGE) | Stage 0 | `npm install --package-lock-only` |
| image-format (non-WebP raster in `public/`) | Stage 1 → Stage 2 | convert to WebP, drop original |
| image-budget (over per-tier byte cap) | Stage 1 → Stage 2 | recompress / downscale |
| missing-committed-image (file on disk, not in git index) | Stage 2b — uncommitted image check | none — `git add` the file |
| build-runtime (component/page crash) | Stage 3 (`astro build`) | none — fix by hand |
| schema / contrast / silo / orphans / gbp-plan / pagebuilder | Stage 3 | none yet — caught, not fixed |

## Components

- `scripts/deploy-preflight.mjs` — the orchestrator (stages 0–3, summary, exit code).
- `scripts/optimize-public-images.mjs` — the image autofixer (`npm run fix:images`).
- `scripts/lib/image-budget.mjs` — shared byte budgets; imported by BOTH the
  autofixer and `scripts/audit-images.mjs` so they can never disagree.
- `docs/deploy-failures/` — the failure archive (`README.md`, `LOG.md`,
  `_TEMPLATE.md`, one file per incident).
- `scripts/install-git-hooks.sh` — optional: installs a `pre-push` hook that
  runs the preflight automatically (git hooks aren't committed, so this must be
  run once per clone).

## Enforce automatically (recommended)

Wire it into git so it runs on every push without anyone remembering:

```bash
bash scripts/install-git-hooks.sh
```

This installs `.git/hooks/pre-push` → `npm run preflight`. To bypass in an
emergency: `git push --no-verify` (and then explain yourself in the failure log).

## Budget tiers (from scripts/lib/image-budget.mjs)

- `/logos/` → 80 KB · `og-default.webp` → 120 KB · anything with `hero` → 225 KB
- `/blog/` or `featured` → 100 KB · everything else → 130 KB

Deployable images must be **WebP** — never `.jpg/.jpeg/.png/.gif/.avif` under
`public/images/` or `public/Logos/`. Source masters in `content/` and `src/`
are never touched (CLAUDE.md §11a: Drive masters stay byte-identical).
