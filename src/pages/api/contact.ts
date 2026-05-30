/**
 * POST /api/contact — fast, visitor-facing lead intake (SSR).
 *
 * 1. Parse JSON (CtaLeadModal) or form-encoded (legacy /contact/* fallbacks).
 * 2. Honeypot + minimal validation (firstName + email-or-phone), normalize.
 * 3. Insert a durable row into Supabase `website_crm_contacts` (sync_status:
 *    "pending") — the visitor's experience never waits on GoHighLevel.
 * 4. Fire-and-forget POST to /api/contact-sync (guarded by RETRY_SECRET). NOT
 *    awaited — awaiting it would reintroduce the latency this design avoids.
 * 5. Respond: JSON { success, redirectTo } for AJAX, else 303 to /thank-you/*.
 *
 * Redirects + the sync call use SITE_URL, not request.url: behind the Coolify
 * reverse proxy request.url resolves to localhost.
 *
 * Requires SSR — astro.config is output:"hybrid"; this route opts out of
 * prerender so it runs on the Node server. Marketing pages stay static.
 */
import type { APIRoute } from "astro";
import { createAdminClient, supabaseConfigured, WEBSITE_CONTACTS_TABLE } from "../../lib/supabase";
import { resolveLane, type Intent, type PropertyType } from "../../lib/integrations/ghl";

export const prerender = false;

const CONSENT_TEXT =
  "I agree that Pro Exteriors may contact me about my request by phone, text, or email. " +
  "Message/data rates may apply. Consent is not a condition of purchase.";

function envVar(key: string): string {
  const g = globalThis as unknown as { process?: { env?: Record<string, string | undefined> } };
  return (
    g.process?.env?.[key] ??
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[key] ??
    ""
  );
}

const SITE_URL = () => envVar("SITE_URL") || "https://pc-demo.cleverwork.io";

const normEmail = (v?: string) => (v ? v.trim().toLowerCase() : null);
function toE164(v?: string): string | null {
  if (!v) return null;
  const d = v.replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return v.trim();
}

type Raw = Record<string, unknown>;
const str = (v: unknown) => (typeof v === "string" ? v.trim() : v == null ? "" : String(v).trim());

/** Resolve { intent, property } from either the new or legacy payload shape. */
function deriveLane(p: Raw): { intent: Intent; property: PropertyType } {
  const intent = str(p.intent);
  if (intent === "lead" || intent === "service") {
    const property: PropertyType = str(p.propertyType) === "Commercial" ? "Commercial" : "Residential";
    return { intent, property };
  }
  const v = str(p.vertical).toLowerCase();
  const formType = str(p.formType).toLowerCase();
  if (v === "commercial") return { intent: "lead", property: "Commercial" };
  if (v === "emergency" || formType.includes("emergency")) return { intent: "service", property: "Residential" };
  return { intent: "lead", property: "Residential" };
}

const thankYouFor = (property: PropertyType) =>
  property === "Commercial" ? "/thank-you/commercial/" : "/thank-you/residential/";

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const contentType = request.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const isAjax = isJson || request.headers.get("X-Requested-With") === "fetch";

  let raw: Raw;
  try {
    if (isJson) {
      raw = (await request.json()) as Raw;
    } else if (
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data")
    ) {
      const fd = await request.formData();
      raw = Object.fromEntries(fd.entries());
    } else {
      return json({ error: "Unsupported Content-Type" }, 415);
    }
  } catch {
    return json({ error: "Bad request" }, 400);
  }

  const { intent, property } = deriveLane(raw);

  // Honeypot — pretend success, insert nothing.
  if (str(raw.company_website)) {
    return isAjax
      ? json({ success: true, redirectTo: thankYouFor(property) }, 200)
      : Response.redirect(new URL(thankYouFor(property), SITE_URL()), 303);
  }

  // Name: accept split or single "name".
  const rawName = str(raw.name);
  const firstName = str(raw.firstName) || (rawName ? rawName.split(" ")[0] : "");
  const lastName = str(raw.lastName) || (rawName ? rawName.split(" ").slice(1).join(" ") : "");
  const email = normEmail(str(raw.email));
  const phone = toE164(str(raw.phone));

  if (!firstName) return json({ error: "First name is required." }, 400);
  if (!email && !phone) return json({ error: "Provide an email or phone number." }, 400);

  const { contactType } = resolveLane(intent, property);
  const consent = str(raw.marketingConsent) === "Yes" || str(raw.consent) === "true";

  const row = {
    contact_type: contactType,
    intent,
    property_type: property,
    first_name: firstName,
    last_name: lastName || null,
    email,
    phone,
    address: str(raw.address) || null,
    preferred_contact: str(raw.preferredContact) || null,
    marketing_consent: consent,
    consent_text: consent ? CONSENT_TEXT : null,
    service_type: str(raw.serviceType) || null,
    project_timeline: str(raw.projectTimeline) || null,
    insurance_claim: str(raw.insuranceClaim) || null,
    note: str(raw.note) || str(raw.projectDetails) || null,
    cta_id: str(raw.ctaId) || str(raw.formType) || null,
    source: str(raw.source) || `Website – ${str(raw.formType) || str(raw.ctaId) || "CTA"}`,
    intake_cta: str(raw.intake_cta) || str(raw.ctaId) || null,
    utm_source: str(raw.utm_source) || null,
    utm_medium: str(raw.utm_medium) || null,
    utm_campaign: str(raw.utm_campaign) || null,
    ad_click_id: str(raw.ad_click_id) || null,
    ghl_location_id: envVar("GHL_LOCATION_ID") || "uLuRBd8yQ9R64WLUxYGd",
    sync_status: "pending",
    sync_attempts: 0,
  } as Record<string, unknown>;

  if (!supabaseConfigured()) {
    // No DB configured (e.g. local dev before secrets land). Don't 500 — accept
    // the lead so the UX works; flag loudly for the operator.
    console.warn("[contact] Supabase not configured — lead accepted but NOT persisted:", {
      lane: contactType,
      cta: row.cta_id,
    });
    return isAjax
      ? json({ success: true, redirectTo: thankYouFor(property) }, 200)
      : Response.redirect(new URL(thankYouFor(property), SITE_URL()), 303);
  }

  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from(WEBSITE_CONTACTS_TABLE)
      .insert([row])
      .select("id")
      .single();

    if (error || !data) {
      console.error("[contact] Supabase insert failed:", error?.message);
      // Still respond success — never expose DB errors to visitors.
    } else {
      // Fire-and-forget GHL sync (non-blocking).
      const syncUrl = new URL("/api/contact-sync", SITE_URL());
      void fetch(syncUrl.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-retry-secret": envVar("RETRY_SECRET") },
        body: JSON.stringify({ contactRowId: (data as { id: string }).id }),
      }).catch((err) => console.error("[contact] Failed to fire contact-sync:", err));
    }
  } catch (err) {
    console.error("[contact] error:", err);
  }

  return isAjax
    ? json({ success: true, redirectTo: thankYouFor(property) }, 200)
    : Response.redirect(new URL(thankYouFor(property), SITE_URL()), 303);
};
