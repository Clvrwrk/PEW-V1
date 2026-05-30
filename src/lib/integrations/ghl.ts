/**
 * src/lib/integrations/ghl.ts
 *
 * Server-side GoHighLevel (LeadConnector v2) helper for the website lead-intake
 * sync (/api/contact-sync). Implements the four-lane flow from
 * tech/Website-CTA-GoHighLevel-Integration-Guide.md: upsert contact → (dedupe)
 * → routed opportunity → note → tags (GHL workflows do the notifying).
 *
 * SECURITY: server-only. The Private Integration Token is read from GHL_API_KEY
 * (or legacy GHL_PIT) and must never reach the browser or the repo.
 *
 * CUSTOM FIELDS — VERIFIED 2026-05-30: the v2 API SILENTLY DROPS custom fields
 * sent as `{ key: "contact.x", value }` (the `model.` prefix breaks the write).
 * They MUST be sent as `{ id: "<fieldId>", value }`. The verified PE field-ID
 * map lives in FIELD_IDS below. (See the guide, Appendix A.1.)
 *
 * Cloudflare note: GHL is behind Cloudflare, which 403s default programmatic
 * User-Agents — we send a normal UA header.
 *
 * Per-client config is read from env when present and falls back to the verified
 * Pro Exteriors IDs so the build is self-contained.
 */

const GHL_BASE = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
const UA = "ProExteriorsWeb/1.0 (+https://proexteriorsus.com)";

export type ContactType = "residential_lead" | "commercial_lead" | "service_lead";
export type PropertyType = "Residential" | "Commercial";
export type Intent = "lead" | "service";

type LaneKey = "residential_lead" | "commercial_lead" | "service_residential" | "service_commercial";

interface LaneConfig {
  pipelineId: string;
  stageId: string;
}

const env = (k: string): string | undefined => {
  const g = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };
  return (
    g.process?.env?.[k] ??
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[k]
  );
};

/** PE location (verified). Override per client via GHL_LOCATION_ID. */
export const LOCATION_ID = env("GHL_LOCATION_ID") || "uLuRBd8yQ9R64WLUxYGd";

/** Private Integration Token. GHL_API_KEY is the house-standard name; GHL_PIT legacy. */
const PIT = () => env("GHL_API_KEY") || env("GHL_PIT");

/** Four-lane pipeline/stage map — verified live 2026-05-30. Env overrides win. */
export const LANES: Record<LaneKey, LaneConfig> = {
  residential_lead: {
    pipelineId: env("GHL_PIPELINE_RES_LEAD") || "wgX8HNbjhYWMtjcgefNn",
    stageId: env("GHL_STAGE_RES_LEAD") || "d4457a88-d9db-4f3e-8240-f04302e8fdbf",
  },
  commercial_lead: {
    pipelineId: env("GHL_PIPELINE_COM_LEAD") || "F3Qes6CGurRcVMexypwT",
    stageId: env("GHL_STAGE_COM_LEAD") || "0c5c16f6-c70c-479e-bedd-158c5c86cc46",
  },
  service_residential: {
    pipelineId: env("GHL_PIPELINE_RES_SVC") || "ETGpXgkWttwJD4zuj9i7",
    stageId: env("GHL_STAGE_RES_SVC") || "58b7d128-4472-4077-8719-37d1578e1633",
  },
  service_commercial: {
    pipelineId: env("GHL_PIPELINE_COM_SVC") || "8hYIhGQU1rf2g1nlFy82",
    stageId: env("GHL_STAGE_COM_SVC") || "64370db8-a9ed-4d3a-ad7b-a9d7079fa829",
  },
};

/**
 * Verified PE custom-field IDs (2026-05-30). Sent as { id, value } — the only
 * shape the v2 API persists. For a new client, replace via ghl-account-map.json
 * or `GET /locations/{id}/customFields`.
 */
export const FIELD_IDS = {
  contact: {
    preferred_contact: "I8Z9WRRm9G4LbvZFtmMw",
    marketing_consent: "Ex6ujzU188A8i7uz6gJ2",
    intake_cta: "yipJJbHVwoDoZqnA8Eql",
    utm_source: "21VtCC3C7IeWbnkl6y8W",
    utm_medium: "78qccDsdBTMJ3grd0qrL",
    utm_campaign: "2tDSa2TodjkixLHHxhOh",
    ad_click_id: "08Kozwz92x3FxQUyPKRY",
  },
  opportunity: {
    service_type: "QvZG3A3bAfqeskpKjbue",
    property_type: "1LFkuENP6BCqiGDzSMG5",
    property_address: "q3ugLCnmnUtma8e6gmN6",
    project_timeline: "aCpHYPtwpN7tX6a5GzLD",
    insurance_claim: "ZHEIYo8nOtyY4bocobjn",
    intake_message: "GkaO7n7FlGPtoyQbe8LK",
  },
} as const;

export function resolveLane(intent: Intent, property: PropertyType): {
  contactType: ContactType;
  laneKey: LaneKey;
  config: LaneConfig;
} {
  const contactType: ContactType =
    intent === "lead"
      ? property === "Commercial" ? "commercial_lead" : "residential_lead"
      : "service_lead";
  const laneKey: LaneKey =
    intent === "lead"
      ? (contactType as LaneKey)
      : property === "Commercial" ? "service_commercial" : "service_residential";
  return { contactType, laneKey, config: LANES[laneKey] };
}

function headers(): Record<string, string> {
  const pit = PIT();
  if (!pit) throw new Error("GHL token (GHL_API_KEY) is not configured");
  return {
    Authorization: `Bearer ${pit}`,
    Version: GHL_VERSION,
    "Content-Type": "application/json",
    Accept: "application/json",
    "User-Agent": UA,
  };
}

export function isConfigured(): boolean {
  return Boolean(PIT());
}

/* ── Normalized payload (from the website_crm_contacts row) ─────────────────── */
export interface IntakePayload {
  contactType: ContactType;
  propertyType: PropertyType;
  intent: Intent;
  firstName: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  preferredContact?: string;
  marketingConsent?: "Yes" | "No";
  serviceType?: string;
  projectTimeline?: string;
  insuranceClaim?: string;
  note?: string;
  ctaId?: string;
  source?: string;
  intake_cta?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  ad_click_id?: string;
}

/** Build a { id, value } custom-field entry, skipping empties. */
type CF = { id: string; value: string };
const cf = (id: string, value?: string): CF[] =>
  value && String(value).trim() ? [{ id, value: String(value).trim() }] : [];

const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function buildTags(p: IntakePayload): string[] {
  const tags = ["web-intake"];
  if (p.ctaId) tags.push(`cta-${slug(p.ctaId)}`);
  if (p.serviceType) tags.push(`service-${slug(p.serviceType)}`);
  if (p.insuranceClaim === "Yes") tags.push("insurance-claim");
  if (p.propertyType === "Commercial") tags.push("commercial");
  if (/storm|hail/i.test(`${p.serviceType ?? ""} ${p.note ?? ""}`)) tags.push("storm-damage");
  return tags;
}

function contactCustomFields(p: IntakePayload): CF[] {
  const F = FIELD_IDS.contact;
  return [
    ...cf(F.preferred_contact, p.preferredContact),
    ...cf(F.marketing_consent, p.marketingConsent),
    ...cf(F.intake_cta, p.intake_cta || p.ctaId),
    ...cf(F.utm_source, p.utm_source),
    ...cf(F.utm_medium, p.utm_medium),
    ...cf(F.utm_campaign, p.utm_campaign),
    ...cf(F.ad_click_id, p.ad_click_id),
  ];
}

function opportunityCustomFields(p: IntakePayload, svc: string): CF[] {
  const F = FIELD_IDS.opportunity;
  return [
    ...cf(F.service_type, svc),
    ...cf(F.property_type, p.propertyType),
    ...cf(F.property_address, p.address),
    ...cf(F.project_timeline, p.projectTimeline),
    ...cf(F.insurance_claim, p.insuranceClaim),
    ...cf(F.intake_message, p.note),
  ];
}

/* ── REST calls (each throws on non-2xx; the caller handles retries) ────────── */

/**
 * Upsert contact. If existingContactId is set, PUT updates it; otherwise
 * POST /contacts/upsert dedupes on email/phone. Returns the contactId.
 */
export async function upsertContact(p: IntakePayload, existingContactId?: string | null): Promise<string> {
  const body = {
    locationId: LOCATION_ID,
    type: p.contactType, // standard field — the customized lead-type value (verified accepted)
    firstName: p.firstName,
    lastName: p.lastName || "",
    email: p.email || undefined,
    phone: p.phone || undefined,
    source: p.source || "Website Form",
    tags: buildTags(p),
    customFields: contactCustomFields(p),
  };
  const url = existingContactId ? `${GHL_BASE}/contacts/${existingContactId}` : `${GHL_BASE}/contacts/upsert`;
  const method = existingContactId ? "PUT" : "POST";
  const res = await fetch(url, { method, headers: headers(), body: JSON.stringify(body) });
  if (!res.ok) throw new Error(`contacts ${method} ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { contact?: { id?: string }; id?: string };
  const id = json.contact?.id || json.id;
  if (!id) throw new Error("contacts upsert returned no contact id");
  return id;
}

/** Find an existing OPEN opportunity for this contact in the lane's pipeline. */
export async function findOpenOpportunity(contactId: string, pipelineId: string): Promise<string | null> {
  const url = `${GHL_BASE}/opportunities/search?location_id=${encodeURIComponent(LOCATION_ID)}&contact_id=${encodeURIComponent(contactId)}`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) return null; // non-fatal — fall through to create
  const json = (await res.json()) as { opportunities?: { id: string; pipelineId?: string; status?: string }[] };
  const match = (json.opportunities || []).find((o) => o.pipelineId === pipelineId && o.status === "open");
  return match?.id || null;
}

/** Create the routed opportunity. Returns the opportunityId. */
export async function createOpportunity(contactId: string, p: IntakePayload): Promise<{ id: string; pipelineId: string }> {
  const { config } = resolveLane(p.intent, p.propertyType);
  const lastName = p.lastName?.trim() || p.firstName;
  const svc = p.serviceType || (p.intent === "service" ? "Roof Repair" : "Roof Replacement");
  const body = {
    locationId: LOCATION_ID,
    contactId,
    pipelineId: config.pipelineId,
    pipelineStageId: config.stageId,
    name: `${svc} – ${lastName}`,
    status: "open",
    monetaryValue: 0,
    source: p.source || "Website Form",
    customFields: opportunityCustomFields(p, svc),
  };
  const res = await fetch(`${GHL_BASE}/opportunities/`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`opportunities/ ${res.status}: ${await res.text()}`);
  const json = (await res.json()) as { opportunity?: { id?: string }; id?: string };
  return { id: json.opportunity?.id || json.id || "", pipelineId: config.pipelineId };
}

/** Add a human-readable note to the contact summarizing the submission. */
export async function addNote(contactId: string, body: string): Promise<void> {
  if (!body.trim()) return;
  const res = await fetch(`${GHL_BASE}/contacts/${contactId}/notes`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error(`contacts/notes ${res.status}: ${await res.text()}`);
}
