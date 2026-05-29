# 2026-05-29 — audit:images: referenced image not committed to git

- **Commit:** `bc277ea07da69c543bd2bdda6778aa53388248cb`
- **Stage that failed:** `audit:images`
- **Failure class:** missing-committed-image
- **Auto-fixable:** no — the file must exist locally and be staged before commit

## Raw error (trimmed to the signal)

```
Image audit failed with 1 issue(s):
- src/pages/locations/index.astro: referenced image does not exist: /images/richardson-hero.webp
```

## Root cause

`locations/index.astro` was edited to reference `/images/richardson-hero.webp`
(a rename from `locations-hero.webp`). The new file existed on the local
filesystem under `public/images/` but was **never staged** (`git add`) before
the commit. The audit resolves image references against the files present in the
deployed container, which only contains what git committed — so the file appeared
missing to Coolify even though it was fine locally.

The local `audit:images --no-dist` preflight passed because it resolves against
`public/` on disk, not against what is git-tracked. That's the detection gap.

## Fix applied

`git add public/images/richardson-hero.webp` and a follow-up commit (`93b30fe`).

## Guard added (so it never recurs)

Added **Stage 2b** to `scripts/deploy-preflight.mjs`: after the image audit
passes on disk, a second check runs `git ls-files --error-unmatch` against every
image file referenced in `public/images/` and `public/Logos/` that is present
on disk. Any file that is tracked in source code (`.astro`, `.ts`, `.mdx` etc.)
but **not committed to git** is reported as a pre-push blocker.

The guard is: if a `.webp` exists in `public/images/` but is not in the git
index, and at least one source file references it, block the push and tell the
user to `git add` it.
