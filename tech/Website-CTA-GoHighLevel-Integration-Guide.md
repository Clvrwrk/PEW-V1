# Website CTA → GoHighLevel Integration Guide

**Audience:** Web development team
**Purpose:** Build every website CTA form/survey so it maps cleanly into the
client's GoHighLevel (GHL) intake structure — selecting the correct
`contact.type`, creating/updating the contact, creating a routed opportunity, and
firing the right notifications — consistently across all clients.

> **Repo note (AIA4 Pro Exteriors):** This is the agency's canonical house guide,
> committed here because the code (`src/lib/integrations/ghl.ts`, `src/pages/api/lead.ts`,
> `src/components/islands/CtaLeadModal.tsx`) was built against it. **Appendix A**
> (bottom) records live-verification corrections from 2026-05-30 that override the
> body where noted — read it before implementing. Most important: the custom-field
> payload shape in §5/§7 is wrong against the live v2 API.

---

## 1. How it fits together

```
Custom CTA form (your build)
      │  submit (HTTPS, client-side validation)
      ▼
Your backend / serverless function   ← holds the GHL token (NEVER in the browser)
      │  REST calls (Bearer PIT)
      ▼
GoHighLevel REST API
   1) upsert Contact         (sets contact.type + person fields + tags)
   2) search Opportunities   (dedupe check)
   3) create Opportunity     (routed pipeline + stage + job fields)
      │
      ▼  tags + pipeline stage
GHL Workflows  →  notify the right users (handled in GHL, not by the website)
```

**Key rules**
- The form is **custom-built and styled by you**; it does **not** post directly
  from the browser to GHL. It posts to **your backend**, which calls GHL.
- The **Private Integration Token (PIT) lives server-side only.** Never ship it
  to the browser or commit it to the repo.
- The website's job is: collect → validate → upsert contact → create opportunity
  → apply tags. **Notifications are GHL's job** (tag/stage-triggered workflows).
  Do not hardcode "email rep X" in the website.
- **Field IDs are per-client.** Field *keys* (e.g. `opportunity.service_type`)
  and dropdown *option values* (e.g. `residential_lead`) are stable across
  clients that use our standard template; the numeric/hash **IDs are not**. Pull
  the per-client values from that client's `ghl-account-map.json` (produced by our
  `setup_account.py`) or `GET /locations/{id}/customFields`.

---

## 2. The four intake lanes

Everything routes into one of four lanes. The lane is determined by **two
inputs**: the contact's lead type and the property type.

| Lane | `contact.type` | `property_type` | Opportunity pipeline | Entry stage |
| ---- | -------------- | --------------- | -------------------- | ----------- |
| Residential Lead | `residential_lead` | Residential | **Residential Lead** | New Inquiry |
| Commercial Lead | `commercial_lead` | Commercial | **Commercial Lead** | New Inquiry |
| Residential Service | `service_lead` | Residential | **Residential Service Ticket** | New Request |
| Commercial Service | `service_lead` | Commercial | **Commercial Service Ticket** | New Request |

> Note the asymmetry: **three** contact types feed **four** pipelines. Service
> leads share one `contact.type` (`service_lead`); the `property_type` field is
> what splits them into the Residential vs Commercial service pipeline.

---

## 3. The Contact Type field — what forms may set

Contact Type is a **standard** GHL field (key `contact.type`, set via the
top-level `type` param) whose dropdown options have been customized to ten values.
**CTA forms may only ever set the three lead types.** The remaining seven are
operational contacts (added manually or by other systems) and must never be
assigned by a public web form.

| Label | Value | Web forms may set? |
| ----- | ----- | ------------------ |
| Residential Lead | `residential_lead` | ✅ |
| Commercial Lead | `commercial_lead` | ✅ |
| Service Lead | `service_lead` | ✅ |
| Vendor | `vendor` | ❌ |
| Staff | `staff` | ❌ |
| Adjuster | `adjuster` | ❌ |
| Insurance Agent | `insurance_agent` | ❌ |
| Insurance Company Adjuster | `insurance_company_adjuster` | ❌ |
| Code Compliance | `code_compliance` | ❌ |
| Permit Office Staff | `permit_office_staff` | ❌ |

If a form has no business setting one of the three lead types, it should not be
creating leads at all.

---

## 4. CTA placement → lane

How each placement decides the lane. Where the page context makes the lane
obvious, set **hidden fields** (no user choice). Where it's ambiguous, present a
**selector** that resolves the lane.

| Placement | How lane is set | `contact.type` | `property_type` | Intent |
| --------- | --------------- | -------------- | --------------- | ------ |
| **Residential pages** | Hidden | `residential_lead` | `Residential` | Lead |
| **Commercial pages** | Hidden | `commercial_lead` | `Commercial` | Lead |
| **Service pages (residential)** | Hidden | `service_lead` | `Residential` | Service |
| **Service pages (commercial)** | Hidden | `service_lead` | `Commercial` | Service |
| **Landing pages (campaign)** | Hidden, per campaign | set by campaign | set by campaign | set by campaign |
| **Home page** | Selector | derived | derived | derived |
| **Contact Us** | Selector | derived | derived | derived |

### Selector logic for ambiguous pages (Home, Contact Us)

Present two small questions and derive the lane:

1. **"What do you need?"** → New project/estimate = **Lead**; Repair/service/
   warranty = **Service**.
2. **"Property type?"** → Residential / Commercial.

Resolve:
- Lead + Residential → `residential_lead`, Residential Lead pipeline
- Lead + Commercial → `commercial_lead`, Commercial Lead pipeline
- Service + Residential → `service_lead`, Residential Service Ticket pipeline
- Service + Commercial → `service_lead`, Commercial Service Ticket pipeline

For **landing pages**, bake the answers in as hidden fields tied to the campaign
(a storm-damage residential landing page hardcodes `service_lead` +
`Residential` + the `storm-damage` tag).

---

## 5. Master field map

Person-level data → **Contact**. Job/property data → **Opportunity**. Keys are
stable; confirm IDs per client.

> ⚠️ **See Appendix A.1 — the `customFields` payload shape below (`{key:"contact.x", value}`)
> is SILENTLY DROPPED by the live v2 API.** Use the bare key (`{key:"preferred_contact", value}`)
> or the field ID (`{id, value}`). The `model.` prefix breaks the write.

> **Standard vs custom — how they're sent.** GHL **standard** fields (First/Last
> name, Email, Phone, Company, City, Source, **Contact Type**, etc.) are
> **top-level** params on the contact object. **Custom** fields (the `contact.*`
> "Additional Info" ones below) go inside the `customFields[]` array. Sending a
> standard field inside `customFields` will silently fail. **`contact.type` is a
> standard field** — set it as top-level `type` (verified: the API accepts the
> custom dropdown value, e.g. `"type": "residential_lead"`).

### Standard contact fields (top-level params)

| Form field | GHL field | Notes |
| ---------- | --------- | ----- |
| Contact type (lane) | `type` | `residential_lead` / `commercial_lead` / `service_lead` — **top-level, not customFields** |
| First name | `firstName` | Split full name if one field. |
| Last name | `lastName` | |
| Email | `email` | Lowercase, trim. Dedupe key. |
| Phone | `phone` | E.164 (`+1XXXXXXXXXX`). Dedupe key. |
| Company (commercial) | `companyName` | |
| Street / City / State / Zip | `address1` / `city` / `state` / `postalCode` | Optional but useful. |
| Source | `source` | Human-readable, e.g. "Website – Free Estimate CTA". |

### Contact custom fields (`contact.*`, "Additional Info") — person-level, in `customFields[]`

| Form field | Key | Type / values |
| ---------- | --- | ------------- |
| Preferred contact | `contact.preferred_contact` | Phone / Email / Text |
| Best time | `contact.best_time_to_contact` | text |
| How did you hear | `contact.lead_source_detail` | Google / Facebook / Referral / Yard Sign / Door Knock / Repeat Customer / Other |
| Marketing opt-in | `contact.marketing_consent` | Yes / No (see compliance) |
| CTA / page | `contact.intake_cta` | text (page or CTA identifier) |
| UTM source | `contact.utm_source` | text (hidden) |
| UTM medium | `contact.utm_medium` | text (hidden) |
| UTM campaign | `contact.utm_campaign` | text (hidden) |
| Ad click id | `contact.ad_click_id` | text (hidden; gclid/fbclid) |

### Opportunity custom fields (`opportunity.*`) — job/ticket-level

| Form field | Key | Type / values |
| ---------- | --- | ------------- |
| Service type | `opportunity.service_type` | Roof Replacement / Roof Repair / Siding / Gutters / Windows / Storm Damage / Inspection / Other |
| Property type | `opportunity.property_type` | Residential / Commercial |
| Property address | `opportunity.property_address` | text |
| Roof age | `opportunity.roof_age` | text |
| Roof type | `opportunity.roof_type` | Asphalt Shingle / Metal / Tile / Flat / TPO / Wood Shake / Other |
| Stories | `opportunity.stories` | 1 / 2 / 3+ |
| Square footage | `opportunity.square_footage` | number |
| Insurance claim | `opportunity.insurance_claim` | Yes / No / Unsure |
| Insurance carrier | `opportunity.insurance_carrier` | text |
| Claim number | `opportunity.claim_number` | text |
| Project timeline | `opportunity.project_timeline` | ASAP / 1-3 months / 3-6 months / Just researching |
| Estimated value | `opportunity.estimated_value` | number (monetary) |
| Message / details | `opportunity.intake_message` | long text |

> **Dropdown values:** for single-select fields, send the option's stored
> **Value** exactly as configured in GHL (visible in the field editor's *Value*
> column). For the standard template fields above, the value equals the label
> shown (e.g. send `Roof Replacement`). For `contact.type`, send the lowercase
> value (`residential_lead`).

---

## 6. Required fields, validation & normalization

**Minimum to create a record:** `firstName`, one of `email`/`phone`,
`contact.type`, `opportunity.property_type`, and `opportunity.service_type`.

Server-side before any GHL call:

- **Email:** lowercase, trim, validate format. Reject if both email and phone
  missing.
- **Phone:** strip formatting, convert to E.164 (US default `+1` + 10 digits).
- **Name:** split a single "full name" into first/last.
- **Consent:** capture an explicit opt-in checkbox → `contact.marketing_consent`
  = `Yes`/`No`. Default `No` if unchecked (see §10).
- **Enums:** map UI choices to the exact option values in §5. Unknown → omit the
  field (don't send junk).
- **Attribution:** populate hidden UTM/click fields from the querystring/cookies
  at page load (see §9).

---

## 7. API call sequence

Base URL `https://services.leadconnectorhq.com`. Every request:

```
Authorization: Bearer <PIT>      # server-side secret
Version: 2021-07-28
Content-Type: application/json
Accept: application/json
```

> **Cloudflare note:** GHL is behind Cloudflare, which blocks default
> programmatic User-Agents (HTTP 403 / "Error 1010"). Set a normal `User-Agent`
> header on your server's requests.

### Step 1 — Upsert the contact (dedupe-safe)

`POST /contacts/upsert` — matches on email/phone and updates instead of
duplicating.

```json
{
  "locationId": "<CLIENT_LOCATION_ID>",
  "type": "residential_lead",
  "firstName": "Dana",
  "lastName": "Miller",
  "email": "dana.miller@example.com",
  "phone": "+12145550142",
  "source": "Website – Free Estimate CTA",
  "tags": ["web-intake", "cta-free-estimate", "service-roof-replacement"],
  "customFields": [
    { "key": "contact.preferred_contact", "value": "Phone" },
    { "key": "contact.marketing_consent", "value": "Yes" },
    { "key": "contact.lead_source_detail", "value": "Google" },
    { "key": "contact.intake_cta", "value": "/free-estimate" },
    { "key": "contact.utm_source", "value": "google" },
    { "key": "contact.utm_medium", "value": "cpc" },
    { "key": "contact.utm_campaign", "value": "spring-roof" }
  ]
}
```

> 🔴 **The `customFields` block above does NOT work as written** — see Appendix A.1.
> Send `{ "key": "preferred_contact", "value": "Phone" }` (bare key, no `contact.`
> prefix) or `{ "id": "<fieldId>", "value": "Phone" }`.

Keep the returned `contact.id`.

### Step 2 — Dedupe check (avoid duplicate opportunities)

`GET /opportunities/search?location_id=<loc>&contact_id=<contactId>` — if an
**open** opportunity already exists for this contact in the target pipeline,
update it (`PUT /opportunities/{id}`) instead of creating a new one. (The standard
account blocks duplicate opportunities.) **Verified:** param casing is
`location_id`/`contact_id` (snake_case); camelCase 422s.

### Step 3 — Create the routed opportunity

`POST /opportunities/` — pipeline + stage from the lane (§2), job fields on the
opportunity.

```json
{
  "locationId": "<CLIENT_LOCATION_ID>",
  "contactId": "<CONTACT_ID>",
  "pipelineId": "<RES_LEAD_PIPELINE_ID>",
  "pipelineStageId": "<NEW_INQUIRY_STAGE_ID>",
  "name": "Roof Replacement – Miller",
  "status": "open",
  "monetaryValue": 0,
  "source": "Website – Free Estimate CTA",
  "customFields": [
    { "key": "opportunity.service_type", "value": "Roof Replacement" },
    { "key": "opportunity.property_type", "value": "Residential" },
    { "key": "opportunity.property_address", "value": "1778 N Plano Rd, Richardson TX" },
    { "key": "opportunity.project_timeline", "value": "ASAP" },
    { "key": "opportunity.insurance_claim", "value": "Yes" },
    { "key": "opportunity.intake_message", "value": "Storm damage after last week's hail" }
  ]
}
```

> 🔴 Same custom-field caveat (Appendix A.1) applies to opportunities — strip the
> `opportunity.` prefix or use field IDs. Opportunity custom fields were verified
> to land via `{ "id", "value" }`.

Naming convention: `"<Service Type> – <Last Name>"` so the pipeline is scannable.

---

## 8. Per-lane configuration (worked example: Pro Exteriors)

These IDs are **specific to one client** (Pro Exteriors,
`uLuRBd8yQ9R64WLUxYGd`) and shown only to make the mapping concrete. Pull the
equivalent IDs for each new client from their `ghl-account-map.json`.
**Verified live 2026-05-30 — all four match.**

| Lane | `contact.type` | `property_type` | pipelineId | New-stage id |
| ---- | -------------- | --------------- | ---------- | ------------ |
| Residential Lead | `residential_lead` | Residential | `wgX8HNbjhYWMtjcgefNn` | `d4457a88-d9db-4f3e-8240-f04302e8fdbf` |
| Commercial Lead | `commercial_lead` | Commercial | `F3Qes6CGurRcVMexypwT` | `0c5c16f6-c70c-479e-bedd-158c5c86cc46` |
| Residential Service | `service_lead` | Residential | `ETGpXgkWttwJD4zuj9i7` | `58b7d128-4472-4077-8719-37d1578e1633` |
| Commercial Service | `service_lead` | Commercial | `8hYIhGQU1rf2g1nlFy82` | `64370db8-a9ed-4d3a-ad7b-a9d7079fa829` |

Store this as a small config map in your backend, keyed by client, e.g.:

```json
{
  "proexteriors": {
    "locationId": "uLuRBd8yQ9R64WLUxYGd",
    "lanes": {
      "residential_lead": { "pipelineId": "wgX8HNbjhYWMtjcgefNn", "stageId": "d4457a88-d9db-4f3e-8240-f04302e8fdbf" },
      "commercial_lead":  { "pipelineId": "F3Qes6CGurRcVMexypwT", "stageId": "0c5c16f6-c70c-479e-bedd-158c5c86cc46" },
      "service_residential": { "pipelineId": "ETGpXgkWttwJD4zuj9i7", "stageId": "58b7d128-4472-4077-8719-37d1578e1633" },
      "service_commercial":  { "pipelineId": "8hYIhGQU1rf2g1nlFy82", "stageId": "64370db8-a9ed-4d3a-ad7b-a9d7079fa829" }
    }
  }
}
```

---

## 9. Attribution capture (do this on every form)

Populate these hidden fields at page load so every lead is attributable to its
CTA path:

- `contact.intake_cta` — the page path or a CTA identifier (e.g. `/free-estimate`,
  `home-hero`, `lp-storm-2026`).
- `contact.utm_source` / `utm_medium` / `utm_campaign` — read from the URL
  querystring; persist in a first-party cookie so they survive navigation.
- `contact.ad_click_id` — `gclid` / `fbclid` from the querystring.

Also set a per-CTA tag `cta-<name>` (see §10) so campaign-specific workflows can
branch.

---

## 10. Tags & notifications

**The website sets tags; GHL workflows do the notifying.** Apply these tags on the
contact upsert so the client's workflows fire (speed-to-lead autoresponder,
office/rep notification, routing).

| Tag | When |
| --- | ---- |
| `web-intake` | Every web submission (always). |
| `cta-<name>` | One per CTA/landing page (e.g. `cta-free-estimate`). |
| `service-<type>` | From service type, e.g. `service-roof-replacement`. |
| `storm-damage` | Storm/hail intent (residential). |
| `insurance-claim` | Insurance claim indicated. |
| `commercial` | Any commercial-lane submission. |

Notification routing per lane (who gets pinged) is configured **inside GHL** on
those workflows, per client. If you need different routing, change the workflow —
not the website. Do **not** put rep emails/user IDs in form code.

---

## 11. Security, spam & compliance

- **Token server-side only.** Use a backend endpoint / serverless function; the
  PIT is an environment secret. Scope the token to least privilege.
- **Spam protection:** reCAPTCHA/hCaptcha or Cloudflare Turnstile on every form,
  plus a hidden honeypot field; rate-limit the backend endpoint per IP.
- **Validation server-side**, not just client-side.
- **Consent / TCPA:** include a clear opt-in checkbox for SMS/email; store the
  result in `contact.marketing_consent`. Workflows only message consented
  contacts. Keep consent language and timestamp.
- **PII:** transmit over HTTPS only; don't log full payloads with PII in plaintext.
- **Idempotency:** a double-submit must not create duplicates — rely on the
  upsert + the opportunity dedupe check (§7).

---

## 12. Per-client onboarding checklist

When a new client is added, before wiring their forms:

1. Confirm the account is provisioned: run our `setup_account.py` (creates the
   standard custom fields + values) → produces `ghl-account-map.json`.
2. Configure the **Contact Type** field's dropdown options. It's a *standard*
   field (always present), but its options are per-account — set them to the
   standard list (§3) so `residential_lead` / `commercial_lead` / `service_lead`
   exist. (UI: Settings → Custom Fields → Contact Type.)
3. Confirm the **four pipelines** exist; capture pipeline + New-stage IDs
   (`GET /opportunities/pipelines`).
4. Build the backend **lane config map** (§8) from that client's IDs.
5. Confirm the **workflows** (web-intake notify, service ack, etc.) are built and
   notification routing points at the right users.
6. Wire forms per placement (§4); set hidden lane + attribution fields.
7. **Test every lane** (§13) end-to-end in the client's account before launch.

---

## 13. Per-lane test checklist

For each of the four lanes, submit a test entry and verify:

- [ ] Contact created/updated (no duplicate on re-submit), correct `contact.type`.
- [ ] Person fields + attribution populated on the contact.
- [ ] Opportunity created in the **correct pipeline** at the New stage.
- [ ] Job fields populated on the opportunity (service type, property, etc.).
- [ ] Tags applied (`web-intake`, `cta-*`, `service-*`, flags).
- [ ] The expected workflow fired and the right user was notified.
- [ ] Re-submitting the same person updates rather than duplicates.

Delete test records after verification.

---

## 14. Appendix — quick reference

**Dropdown values forms may send for Contact Type** (top-level `type` param, a
standard field): `residential_lead`, `commercial_lead`, `service_lead` (never the
operational types).

**Lane resolver (pseudocode):**

```
intent   = "lead" | "service"          // from page context or selector
property = "Residential" | "Commercial" // from page context or selector

contactType = intent == "lead"
  ? (property == "Commercial" ? "commercial_lead" : "residential_lead")
  : "service_lead"

laneKey = intent == "lead"
  ? contactType                          // residential_lead | commercial_lead
  : (property == "Commercial" ? "service_commercial" : "service_residential")

{ pipelineId, stageId } = config[client].lanes[laneKey]
```

**Error handling:** on `429` (rate limit: 100 req/10s, 200k/day per location),
back off and retry. On `4xx`, surface a friendly error to the user but log the
GHL response server-side (without PII) for debugging.

---

# Appendix A — Live verification & corrections (Pro Exteriors, 2026-05-30)

Verified by Maren against the live PE account (`uLuRBd8yQ9R64WLUxYGd`) via
PIT-authed REST calls, Version `2021-07-28`. Where this appendix conflicts with
the body above, **this appendix wins** and the body should be patched agency-wide.

## A.1 🔴 Custom-field payload shape — the body (§5/§7) is wrong

`POST /contacts/upsert` returns **201 but silently discards** custom fields sent
as `{ "key": "contact.<x>", "value": … }`. Probe matrix (one throwaway contact
per shape, read back, deleted):

| Payload shape | Persisted? |
| --- | --- |
| `{ key: "contact.preferred_contact", value }` (guide §5/§7 + current code) | ❌ dropped |
| `{ key: "contact.preferred_contact", field_value }` | ❌ dropped |
| `{ key: "preferred_contact", value }` (bare key, no model prefix) | ✅ lands |
| `{ id: "<fieldId>", value }` | ✅ lands |
| `{ id: "<fieldId>", field_value }` | ✅ lands |

**Root cause:** the `contact.` / `opportunity.` model prefix on the key breaks the
write. **Fix (pick one, apply to the master template):**
- **Minimal:** strip the model prefix → `{ key: "preferred_contact", value }`.
- **Robust:** resolve key→ID and send `{ id, value }`.

**Impact:** every client built to the §5/§7 shape is silently losing all
custom-field data (consent, attribution, qualifying answers) while contacts and
opportunities still create — so it looks healthy. **Audit existing client builds.**
In this repo the bug lives in `src/lib/integrations/ghl.ts` (`cf()` emits
`{ key, value }` with prefixed keys).

## A.2 ✅ Confirmed-correct in the body

- `type: "residential_lead"` (and the other lead types) is accepted and stored
  on the standard contact `type` field — §3/§5 are correct.
- All four pipeline + New-stage IDs (§8) match live.
- All 13 custom-field keys (§5) exist in the PE account; all picklist option
  values the form sends match the live options.
- Dedupe search param casing is `location_id` / `contact_id` (§7 step 2).
- Full create proven end-to-end (contact 201 + opportunity 201 in the right
  pipeline/stage), then test records deleted.

## A.3 Verified PE field-ID map (for the `{id, value}` fix / `ghl-account-map.json`)

Contact: `preferred_contact` I8Z9WRRm9G4LbvZFtmMw · `marketing_consent` Ex6ujzU188A8i7uz6gJ2 ·
`intake_cta` yipJJbHVwoDoZqnA8Eql · `utm_source` 21VtCC3C7IeWbnkl6y8W ·
`utm_medium` 78qccDsdBTMJ3grd0qrL · `utm_campaign` 2tDSa2TodjkixLHHxhOh ·
`ad_click_id` 08Kozwz92x3FxQUyPKRY · `best_time_to_contact` hYOsqYiAHGq9VSGjRada ·
`lead_source_detail` JBRizY3Mcsn2Q5BFzXU8

Opportunity: `service_type` QvZG3A3bAfqeskpKjbue · `property_type` 1LFkuENP6BCqiGDzSMG5 ·
`property_address` q3ugLCnmnUtma8e6gmN6 · `project_timeline` aCpHYPtwpN7tX6a5GzLD ·
`insurance_claim` ZHEIYo8nOtyY4bocobjn · `intake_message` GkaO7n7FlGPtoyQbe8LK ·
`roof_age` ZbyVTpTUEGaqai4QfrlD · `roof_type` NmKfoLEpEYFxfaCtGrGI ·
`square_footage` LD58j0oh43Uy6a4pbz5V · `stories` IalSqk9WUWvKtyIVtLVu ·
`claim_number` fXM1xWQWH5cjTbWy8iV8 · `insurance_carrier` vZanXUZsipyIpzUm3NSD ·
`estimated_value` whedTc7f8gc6cUHCwqwN

## A.4 Runtime + architecture as built (2026-05-30)

We adopted the **HAWC General Contracting pattern** (repo `Clvrwrk/hawc-general-contracting`)
— the proven house design — rather than the browser→GHL webhook (non-compliant
with §1/§11) or a Cloudflare Worker. Flow:

```
CtaLeadModal / contact-form  →  POST /api/contact
   • validate + normalize, insert Supabase row (sync_status='pending'), respond fast
   • fire-and-forget → POST /api/contact-sync  (x-retry-secret guarded)
        • upsert GHL contact (3 retries, 15s) → dedupe → routed opportunity → note
        • row → 'synced' (+ ghl ids) | after max retries → 'needs_attention'
```

- **Durable buffer:** Supabase table `public.website_crm_contacts` (RLS on,
  service_role only) in project `rnhmvcpsvtqjlffpsayu`. Migration committed at
  `supabase/migrations/0001_website_crm_contacts.sql`. Keeps ALL structured data
  + marketing consent.
- **Runtime:** Astro `output: "hybrid"` + `@astrojs/node` (standalone). Every
  marketing page stays prerendered/static (Lighthouse gate intact); only
  `/api/contact` + `/api/contact-sync` (`prerender = false`) run on the Node
  server. Dockerfile runtime stage swapped from nginx → `node ./dist/server/entry.mjs`,
  **port 80 → 4321** (update Coolify).
- **Files:** `src/pages/api/contact.ts`, `src/pages/api/contact-sync.ts`,
  `src/lib/supabase.ts`, `src/lib/integrations/ghl.ts` (four-lane + `{id,value}`
  custom-field fix). Old `src/pages/api/lead.ts` and dead `LeadForm.tsx` removed.
- **Custom fields:** sent by **field ID** (A.1 fix) — verified to persist.
- `decisions/2026-05-29-ssr-ghl-forms.md` is superseded by this section.

## A.5 Activation punch list (remaining)
1. **Set secrets** in Coolify/`.env`: `SUPABASE_SERVICE_ROLE_KEY` (REQUIRED — the
   publishable/anon key is not enough for the admin client), `PUBLIC_SUPABASE_ANON_KEY`,
   `RETRY_SECRET`, `GHL_API_KEY` (the PE PIT), `SITE_URL`. `PUBLIC_SUPABASE_URL`
   + `GHL_LOCATION_ID` defaulted.
2. `npm install` (adds `@astrojs/node`, `@supabase/supabase-js`) + `npm run preflight`
   on a real machine (sandbox can't build).
3. **Coolify:** change the container port mapping 80 → 4321.
4. Confirm the PE **Contact Type** dropdown lists the 3 lead values (§12.2).
5. Wire commercial + locations primary CTAs (still TODO from the build).
6. Run the §13 per-lane test live (row `pending → synced`, contact+opportunity in
   the right pipeline, custom fields populated, dedupe on resubmit); delete test
   records.
7. Rotate the PIT used for verification (Chris flagged this).
8. **DEFERRED (per Chris):** sync-failure alert email + operator contact ID
   (Madison/Crystal) + PIT `conversations` scope. Failures currently surface via
   `sync_status='needs_attention'` (query the table).
9. **SECURITY (separate workstream):** 79 tables in the Supabase project have RLS
   disabled — exposed to the anon key. Remediate with policies before that key is
   used anywhere public.
