# Decision: SSR endpoint + GoHighLevel intake for CTA popup forms

**Date:** 2026-05-29
**Author:** Maren Castellan-Reyes
**Status:** Code shipped · **activation gated** (SSR flip + live lane test pending)
**Decider:** Chris (chose "Astro SSR serverless function" + "core pages first" + "multi-step wizard" on 2026-05-29)

---

## Context

The task list asked for (8) dynamic popup CTA forms/surveys and (9) wiring them
to GoHighLevel using the four-lane intake structure in the *Website CTA → GHL
Integration Guide*. The guide is explicit and correct: the form must POST to a
server-side backend that holds the Private Integration Token (PIT); the token
must never reach the browser.

**The constraint:** this site is `output: "static"` (Astro → static HTML served
by nginx in a Coolify Docker container). A static site has no server runtime to
hold the PIT or call GHL.

## Options considered

1. **Make.com webhook** — form POSTs to a Make scenario holding the PIT. Zero
   hosted backend code; fits a static site; lane logic editable without redeploy.
2. **Astro SSR serverless function** — switch `output` to `hybrid` + `@astrojs/node`,
   make `src/pages/api/lead.ts` call GHL directly. Most control; changes the
   deploy model from nginx-static to a Node server.
3. **GHL native inbound webhook** — POST straight to GHL. Simplest, but loses the
   custom opportunity-dedupe and clean four-lane routing the guide requires.

## Decision

**Option 2 — Astro SSR serverless function** (Chris's call). All marketing pages
stay static; only `/api/lead` runs server-side (`export const prerender = false`).

## What shipped in code (this session)

- `src/components/islands/CtaLeadModal.tsx` — accessible popup form/survey island.
  Min fields name/email/phone; ideal first/last/email/phone/address/note; consent;
  honeypot; attribution capture (UTM/gclid + intake_cta); multi-step **survey
  wizard** when >4 questions; lane selector on ambiguous pages (home). DESIGN.md
  tokens; focus trap, ESC/overlay close, error summary, ≥44px targets.
- `src/lib/integrations/ghl.ts` — server-only GHL proxy: `resolveLane`,
  `upsertContact` → `findOpenOpportunity` (dedupe) → `createOpportunity` → tags.
  Four-lane config defaults to the Pro Exteriors IDs (guide §8), env-overridable.
- `src/pages/api/lead.ts` — SSR endpoint (`prerender = false`); validates +
  normalizes (email lc/trim, phone→E.164, honeypot), maps new **and** legacy
  (LeadForm) payloads, runs the intake when `GHL_PIT` is set, else accepts the
  lead and warns (no 500) so staging works before secrets land.
- `.env.example` — `GHL_PIT` + `GHL_LOCATION_ID` + the four pipeline/stage vars.
- Wired: residential pillar (5 CTAs — hero ×2 `client:load`, process/financing/
  final `client:idle`) and homepage "Request Quote Now" (`client:idle`, selector
  lane). `/contact/*` pages remain the no-JS fallback via header/footer.

## NOT done in code (deliberate — see Why gated)

- **Did not flip `output: static → hybrid`, add `@astrojs/node`, or rewrite the
  Dockerfile.** The sandbox can't run `astro build`/`tsc` (mount EPERM/deadlock),
  so flipping to an uninstalled adapter would risk a non-building repo right
  before launch. CLAUDE.md §4 blocks shipping forms untested against the real
  lead destination anyway.
- **Did not wire commercial + locations CTAs** — mechanical repeats of the
  residential pattern; left for the activation pass so they're tested together.

## Activation runbook (do on a real machine, then test before launch)

1. `npm i @astrojs/node`
2. `astro.config.mjs`: `output: "hybrid"`, add
   `adapter: node({ mode: "standalone" })` (import from `@astrojs/node`).
   (`/api/lead` already has `export const prerender = false`; all pages stay static.)
3. **Dockerfile**: replace the nginx runtime stage with a Node runtime that runs
   the standalone server entry (`node ./dist/server/entry.mjs`), or keep nginx
   for static assets and reverse-proxy `/api/*` to the Node server. Expose the
   Node port; set `HOST=0.0.0.0`, `PORT` per Coolify.
4. Set secrets in Coolify (runtime env, not build): `GHL_PIT` (least-privilege),
   and confirm the `GHL_LOCATION_ID` + pipeline/stage IDs match the live account
   (`GET /opportunities/pipelines`, `GET /locations/{id}/customFields`).
5. Add spam protection per guide §11: Cloudflare Turnstile/hCaptcha + server
   rate-limit on `/api/lead`. (Honeypot is in; CAPTCHA is not.)
6. **Test every lane** (guide §13) in the live account — residential/commercial
   lead + residential/commercial service — verify contact `type`, routed pipeline
   at the New stage, opportunity fields, tags, dedupe on re-submit, and that the
   notify workflow fires. **Delete test records after.**
7. Wire commercial + locations primary CTAs (copy the residential pattern).
8. Confirm `/thank-you/*` pages, then remove this from the gated state.

## Trade-offs / rollback

- SSR adds a Node runtime to ops vs. the current static/nginx simplicity. If the
  Node deploy proves fragile on Coolify, the fallback is Option 1 (Make.com
  webhook): point `CtaLeadModal endpoint` at the Make URL and move the
  `ghl.ts` lane logic into the scenario — the form contract is unchanged.
- Hero CTAs use `client:load` (immediate interactivity for the primary above-fold
  conversion path) at a small JS cost; below-fold CTAs use `client:idle` to
  protect LCP. Revisit if the CWV gate tightens.
```
