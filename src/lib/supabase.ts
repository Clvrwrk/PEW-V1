/**
 * src/lib/supabase.ts — Supabase clients for the lead-intake flow.
 *
 * Only `createAdminClient()` (service-role) is used by the two API routes —
 * /api/contact inserts the lead row, /api/contact-sync reads it and updates the
 * sync status. The service-role key bypasses RLS and is SERVER-ONLY; it must
 * never be PUBLIC_-prefixed or reach the browser.
 *
 * Table: public.website_crm_contacts (RLS on, service_role-only) in the PE
 * Supabase project. See tech/Website-CTA-GoHighLevel-Integration-Guide.md.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function env(key: string, required = true): string {
  const value =
    (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[key] ??
    (typeof process !== "undefined" ? process.env?.[key] : undefined);
  if (required && !value) {
    throw new Error(`[supabase] Missing required env var "${key}". See .env.example.`);
  }
  return value ?? "";
}

/** Server-only privileged client (service-role; bypasses RLS). */
export function createAdminClient(): SupabaseClient {
  return createClient(env("PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
    global: { headers: { "x-supabase-client": "pe-web-admin" } },
  });
}

/** True only when both Supabase admin credentials are present (else dev mode). */
export function supabaseConfigured(): boolean {
  return Boolean(
    env("PUBLIC_SUPABASE_URL", false) && env("SUPABASE_SERVICE_ROLE_KEY", false),
  );
}

export const WEBSITE_CONTACTS_TABLE = "website_crm_contacts";
