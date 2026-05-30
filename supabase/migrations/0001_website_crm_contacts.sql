-- ============================================================
-- website_crm_contacts — Pro Exteriors website lead capture
-- Applied to project rnhmvcpsvtqjlffpsayu on 2026-05-30 (committed here for parity).
--
-- Pattern: form -> /api/contact (insert, sync_status='pending')
--          -> /api/contact-sync (upsert GHL contact + routed opportunity + note)
-- Keeps ALL structured data + marketing consent.
-- Security: RLS ON, service_role only, NO anon/authenticated access (PII).
-- ============================================================

CREATE TABLE IF NOT EXISTS public.website_crm_contacts (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Lane (drives GHL pipeline routing)
  contact_type       TEXT        NOT NULL
    CHECK (contact_type IN ('residential_lead','commercial_lead','service_lead')),
  intent             TEXT        NOT NULL CHECK (intent IN ('lead','service')),
  property_type      TEXT        NOT NULL CHECK (property_type IN ('Residential','Commercial')),

  -- Person -> GHL contact
  first_name         TEXT        NOT NULL DEFAULT '',
  last_name          TEXT,
  email              TEXT,
  phone              TEXT        NOT NULL,
  address            TEXT,
  preferred_contact  TEXT,
  marketing_consent  BOOLEAN     NOT NULL DEFAULT false,
  consent_text       TEXT,

  -- Job / opportunity
  service_type       TEXT,
  project_timeline   TEXT,
  insurance_claim    TEXT,
  note               TEXT,

  -- Attribution / source
  cta_id             TEXT,
  source             TEXT        NOT NULL DEFAULT 'website-form',
  intake_cta         TEXT,
  utm_source         TEXT,
  utm_medium         TEXT,
  utm_campaign       TEXT,
  ad_click_id        TEXT,

  -- GHL sync linkage + status
  ghl_location_id    TEXT        NOT NULL,
  ghl_contact_id     TEXT,
  ghl_opportunity_id TEXT,
  ghl_pipeline_id    TEXT,
  sync_status        TEXT        NOT NULL DEFAULT 'pending'
    CHECK (sync_status IN ('pending','synced','needs_attention')),
  sync_attempts      INT         NOT NULL DEFAULT 0,
  sync_last_error    TEXT,
  synced_at          TIMESTAMPTZ
);

COMMENT ON TABLE public.website_crm_contacts IS
  'Pro Exteriors website CTA form submissions. Durable buffer before GHL sync (four-lane intake). RLS: service_role only — contains PII.';

ALTER TABLE public.website_crm_contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "website_crm_contacts_service_role_all"
  ON public.website_crm_contacts
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_wcc_sync_pending ON public.website_crm_contacts (sync_status)
  WHERE sync_status = 'pending';
CREATE INDEX IF NOT EXISTS idx_wcc_ghl_location ON public.website_crm_contacts (ghl_location_id);
CREATE INDEX IF NOT EXISTS idx_wcc_created_at   ON public.website_crm_contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_wcc_email        ON public.website_crm_contacts (email);
CREATE INDEX IF NOT EXISTS idx_wcc_phone        ON public.website_crm_contacts (phone);
