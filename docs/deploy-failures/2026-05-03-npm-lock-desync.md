# 2026-05-03 — npm ci lockfile out of sync

- **Commit:** `40954fc8e2cb10d3f48880999f380fe6f75e78a4`
- **Stage that failed:** `npm ci --ignore-scripts`
- **Failure class:** lockfile-desync
- **Auto-fixable:** yes

## Raw error (trimmed to the signal)

```
npm error code EUSAGE
npm error `npm ci` can only install packages when your package.json and
  package-lock.json or npm-shrinkwrap.json are in sync.
npm error Invalid: lock file's astro@4.16.19 does not satisfy astro@4.16.18
```

## Root cause

`package.json` pinned `astro@4.16.18` but `package-lock.json` had resolved
`astro@4.16.19` — the two drifted out of sync (a manual edit to package.json
without a matching `npm install`, or vice-versa). `npm ci` is strict by design:
it refuses to install from a lockfile that doesn't satisfy the manifest, so the
Docker build died at the very first dependency step.

## Fix applied

Re-ran `npm install` to bring `package-lock.json` back in line with
`package.json`, committed the updated lockfile.

## Guard added (so it never recurs)

`scripts/deploy-preflight.mjs` **Stage 0** runs `npm ci --dry-run` (the same
strict check Coolify does, without installing). On mismatch it auto-runs
`npm install --package-lock-only` to resync, then re-checks. Never edit
`package.json` dependency versions without committing the regenerated lockfile.
