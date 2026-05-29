# 2026-05-04 — FAQ component crash: Cannot read properties of undefined (reading 'map')

- **Commit:** `698c039b70c182085e45c0930b420d0df0fc5540`
- **Stage that failed:** `astro build` (static route generation)
- **Failure class:** build-runtime
- **Auto-fixable:** no — must be fixed by hand

## Raw error (trimmed to the signal)

```
▶ src/pages/residential/asphalt-shingles/index.astro
[SEO WARNING] Title exceeds 60 characters: "...| Pro Exteriors" (75 chars)
[SEO WARNING] Description should be 70-160 characters: "..." (166 chars)
[Icon WARNING] Icon "certificate" not found in lucide.
Cannot read properties of undefined (reading 'map')
  Stack trace:
    at file:///app/dist/chunks/FAQ_CGiJKnpf.mjs:13:24
```

## Root cause

The `asphalt-shingles` page rendered the `FAQ` component without passing the
prop the component maps over (it called `.map()` on an `undefined` `faqs`/items
prop). Astro builds every static route at deploy time, so a render-time crash on
one page fails the entire build. The SEO and missing-`certificate`-icon lines
were **warnings** (non-fatal); the `undefined.map()` was the fatal error.

## Fix applied

Supplied the missing FAQ data to the component (and made the component defensive
with a default empty array), corrected the lucide icon name, and tightened the
over-length title/description.

## Guard added (so it never recurs)

`scripts/deploy-preflight.mjs` **Stage 3** runs the full `npm run build` —
identical to Coolify's build step — so any render-time crash surfaces locally
before push. This class cannot be auto-fixed; the preflight's job is to catch it
at the keyboard instead of in the deploy. Defensive prop defaults
(`const items = props.faqs ?? []`) in shared components are the durable fix.
