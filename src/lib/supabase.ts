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
  // Runtime process.env FIRST (Coolify injects it at container start; it is the
  // source of truth on the SSR server). import.meta.env is a BUILD-frozen object
  // — under a Dockerfile build pack the PUBLIC_ vars may be absent/empty there,
  // and `??` would not fall through an empty string. Treat blanks as missing.
  const fromProcess = typeof process !== "undefined" ? process.env?.[key] : undefined;
  const fromMeta = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[key];
  const pick = (v?: string) => (v && String(v).trim() ? v : undefined);
  const value = pick(fromProcess) ?? pick(fromMeta);
  if (required && !value) {
    throw new Error(`[supabase] Missing required env var "${key}". See .env.example.`);
  }
  return value ?? "";
}

/** Which Supabase credentials the running container can actually see. */
export function supabaseDiag(): { hasUrl: boolean; hasServiceKey: boolean } {
  return {
    hasUrl: Boolean(env("PUBLIC_SUPABASE_URL", false)),
    hasServiceKey: Boolean(env("SUPABASE_SERVICE_ROLE_KEY", false)),
  };
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
