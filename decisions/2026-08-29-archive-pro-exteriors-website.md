# Archive leftover `Pro-Exteriors-Website` repo

**Status:** Decided — Chris asked to archive 2026-08-29
**Date:** 2026-08-29
**Author:** Maren Castellan-Reyes, Senior Director, Website & Application Experience
**Ticket:** [AIA-61](https://linear.app/cleverwork/issue/AIA-61/archive-leftover-pro-exteriors-website-repo-pew-v1-is-canonical)
**Decision class:** Cheap to reverse (GitHub unarchive). Expensive if agents keep writing to the leftover.

---

## Context

The Cursor cloud environment attached two GitHub remotes for one engagement:

- [`Clvrwrk/Pro-Exteriors-Website`](https://github.com/Clvrwrk/Pro-Exteriors-Website) — private, created 2026-04-29 01:49 UTC, 3 commits
- [`Clvrwrk/PEW-V1`](https://github.com/Clvrwrk/PEW-V1) — public, created 2026-04-29 01:55 UTC, 76 commits, Coolify/Docker, staging `pc-demo.cleverwork.io`

They share the first two commits. This repo (`PEW-V1`) is the working site. The original froze at the seed plus a 2026-06-19 CodeRabbit config.

## Options considered

1. **Keep both writable.** Agents will keep landing changes in the wrong tree.
2. **Delete the leftover.** Irreversible if anyone still had a unique file. Not justified.
3. **GitHub-archive the leftover, keep `PEW-V1` as the only working copy.** Read-only history, no more pushes.

## Choice

Option 3. Archive `Clvrwrk/Pro-Exteriors-Website`. This repo remains canonical.

## Follow-up (Chris)

The Cursor cloud environment still lists both remotes. Environment config is owner-restricted — detach `github.com/clvrwrk/pro-exteriors-website` from the environment so new runs only clone `pew-v1`.
