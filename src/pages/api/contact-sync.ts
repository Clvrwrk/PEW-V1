/**
 * POST /api/contact-sync — internal, out-of-band CRM sync (SSR).
 *
 * Fired (not awaited) by /api/contact after a successful Supabase insert.
 * Guarded by the shared RETRY_SECRET header (401 otherwise).
 *
 * Flow:
 *   1. Fetch the website_crm_contacts row by id.
 *   2. Upsert the GHL contact (PUT if ghl_contact_id exists, else POST upsert) —
 *      3 retries, 15s apart.
 *   3. Dedupe + create the routed opportunity (four-lane pipeline/stage).
 *   4. Add a summary note.
 *   5a. Success → row sync_status='synced' + ghl ids + synced_at.
 *   5b. Contact upsert fails after max retries → sync_status='needs_attention'
 *       + sync_last_error. (Alert email is intentionally deferred — see the
 *       integration guide; failures are visible via sync_status.)
 *
 * NOTE: custom fields are written by id (not key) — the v2 API drops key-based
 * custom fields. See src/lib/integrations/ghl.ts.
 */
import type { APIRoute } from "astro";
import { createAdminClient, WEBSITE_CONTACTS_TABLE } from "../../lib/supabase";
import {
  upsertContact,
  findOpenOpportunity,
  createOpportunity,
  addNote,
  resolveLane,
  isConfigured,
  type IntakePayload,
  type ContactType,
  type Intent,
  type PropertyType,
} from "../../lib/integrations/ghl";

export const prerender = false;

const MAX_RETRIES = 3;
const RETRY_DELAY = 15_000;
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function envVar(key: string): string {
  const g = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };
  return (
    g.process?.env?.[key] ??
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[key] ??
    ""
  );
}

interface ContactRow {
  id: string;
  contact_type: ContactType;
  intent: Intent;
  property_type: PropertyType;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  preferred_contact: string | null;
  marketing_consent: boolean | null;
  service_type: string | null;
  project_timeline: string | null;
  insurance_claim: string | null;
  note: string | null;
  cta_id: string | null;
  source: string | null;
  intake_cta: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  ad_click_id: string | null;
  ghl_contact_id: string | null;
  sync_attempts: number | null;
}

function rowToPayload(row: ContactRow): IntakePayload {
  return {
    contactType: row.contact_type,
    propertyType: row.property_type,
    intent: row.intent,
    firstName: row.first_name,
    lastName: row.last_name ?? undefined,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    address: row.address ?? undefined,
    preferredContact: row.preferred_contact ?? undefined,
    marketingConsent: row.marketing_consent ? "Yes" : "No",
    serviceType: row.service_type ?? undefined,
    projectTimeline: row.project_timeline ?? undefined,
    insuranceClaim: row.insurance_claim ?? undefined,
    note: row.note ?? undefined,
    ctaId: row.cta_id ?? undefined,
    source: row.source ?? undefined,
    intake_cta: row.intake_cta ?? undefined,
    utm_source: row.utm_source ?? undefined,
    utm_medium: row.utm_medium ?? undefined,
    utm_campaign: row.utm_campaign ?? undefined,
    ad_click_id: row.ad_click_id ?? undefined,
  };
}

async function upsertWithRetry(p: IntakePayload, existingId: string | null, attempt = 1): Promise<string | null> {
  try {
    return await upsertContact(p, existingId);
  } catch (err) {
    console.error(`[contact-sync] GHL upsert attempt ${attempt} failed:`, (err as Error).message);
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_DELAY);
      return upsertWithRetry(p, existingId, attempt + 1);
    }
    return null;
  }
}

export const POST: APIRoute = async ({ request }) => {
  // Internal-only — require the shared secret.
  const retrySecret = envVar("RETRY_SECRET");
  if (retrySecret && request.headers.get("x-retry-secret") !== retrySecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: { contactRowId?: string };
  try {
    body = (await request.json()) as { contactRowId?: string };
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const contactRowId = body.contactRowId;
  if (!contactRowId) return new Response("contactRowId required", { status: 400 });

  const supabase = createAdminClient();
  const { data: rawRow, error: fetchError } = await supabase
    .from(WEBSITE_CONTACTS_TABLE)
    .select("*")
    .eq("id", contactRowId)
    .single();

  const row = rawRow as ContactRow | null;
  if (fetchError || !row) {
    console.error("[contact-sync] Could not fetch row:", fetchError?.message);
    return new Response("Row not found", { status: 404 });
  }

  if (!isConfigured()) {
    console.warn("[contact-sync] GHL token not configured — skipping (dev mode)");
    return new Response("OK (dev mode)", { status: 200 });
  }

  const payload = rowToPayload(row);

  // 1. Upsert contact (retried).
  const ghlContactId = await upsertWithRetry(payload, row.ghl_contact_id);

  if (!ghlContactId) {
    const newAttempts = (row.sync_attempts ?? 0) + 1;
    const status = newAttempts >= MAX_RETRIES ? "needs_attention" : "pending";
    await supabase
      .from(WEBSITE_CONTACTS_TABLE)
      .update({
        sync_attempts: newAttempts,
        sync_status: status,
        sync_last_error: "GHL contact upsert failed after max retries",
      })
      .eq("id", contactRowId);
    return new Response("Sync failed", { status: 500 });
  }

  // 2. Dedupe + create the routed opportunity (best-effort; logged on failure).
  let ghlOpportunityId: string | null = null;
  let ghlPipelineId: string | null = null;
  try {
    const { config } = resolveLane(payload.intent, payload.propertyType);
    ghlPipelineId = config.pipelineId;
    const existing = await findOpenOpportunity(ghlContactId, config.pipelineId);
    if (existing) {
      ghlOpportunityId = existing;
    } else {
      const opp = await createOpportunity(ghlContactId, payload);
      ghlOpportunityId = opp.id;
    }
  } catch (err) {
    console.error("[contact-sync] opportunity error:", (err as Error).message);
  }

  // 3. Add a summary note (best-effort).
  const noteLines = [
    payload.note ? `Details: ${payload.note}` : null,
    payload.serviceType ? `Service: ${payload.serviceType}` : null,
    payload.projectTimeline ? `Timeline: ${payload.projectTimeline}` : null,
    payload.insuranceClaim ? `Insurance claim: ${payload.insuranceClaim}` : null,
    payload.address ? `Address: ${payload.address}` : null,
    payload.preferredContact ? `Prefers: ${payload.preferredContact}` : null,
    `Lane: ${payload.contactType} (${payload.propertyType})`,
    payload.source ? `Source: ${payload.source}` : null,
  ].filter(Boolean) as string[];
  try {
    await addNote(ghlContactId, noteLines.join("\n"));
  } catch (err) {
    console.error("[contact-sync] note error:", (err as Error).message);
  }

  // 4. Mark synced.
  await supabase
    .from(WEBSITE_CONTACTS_TABLE)
    .update({
      sync_status: "synced",
      ghl_contact_id: ghlContactId,
      ghl_opportunity_id: ghlOpportunityId,
      ghl_pipeline_id: ghlPipelineId,
      sync_attempts: (row.sync_attempts ?? 0) + 1,
      sync_last_error: null,
      synced_at: new Date().toISOString(),
    })
    .eq("id", contactRowId);

  return new Response("OK", { status: 200 });
};
