# YYYY-MM-DD — <short title>

- **Commit:** `<sha>`
- **Stage that failed:** `npm ci` | `astro build` | `audit:<name>`
- **Failure class:** <lockfile-desync | image-format | image-budget | build-runtime | schema | contrast | silo | orphans | gbp-plan | pagebuilder | other>
- **Auto-fixable:** yes / partial / no

## Raw error (trimmed to the signal)

```
<paste the failing lines>
```

## Root cause

<one paragraph>

## Fix applied

<what was changed to make this specific deploy pass>

## Guard added (so it never recurs)

<which preflight stage / autofixer rule now catches this class; "already covered by Stage N" is fine>
