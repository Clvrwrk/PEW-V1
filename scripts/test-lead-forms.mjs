#!/usr/bin/env node
/**
 * test-lead-forms.mjs — end-to-end CTA form tester.
 *
 * POSTs realistic fills to the LIVE /api/contact endpoint, mirroring each form
 * surface (JSON for the CtaLeadModal popups, form-encoded for the inline
 * LeadCaptureForm pages), across all four GHL lanes. Leaves ALL records for
 * visual verification — it never deletes.
 *
 * Usage:
 *   SITE_URL=https://pc-demo.cleverwork.io node scripts/test-lead-forms.mjs [perForm]
 *   node scripts/test-lead-forms.mjs 10 https://pc-demo.cleverwork.io
 *
 * After it runs, verify:
 *   Supabase: select * from website_crm_contacts where source like 'TEST %' order by created_at;
 *   GHL:      search contacts by email domain '@cleverwork.io' / firstName 'ZZTest'
 *             and opportunities by pipeline (residential/commercial lead+service).
 */

const argN = process.argv.find((a) => /^\d+$/.test(a));
const argUrl = process.argv.find((a) => /^https?:\/\//.test(a));
const SITE = (argUrl || process.env.SITE_URL || 'https://pc-demo.cleverwork.io').replace(/\/$/, '');
const PER_FORM = Number(argN || process.env.PER_FORM || 10);
const ENDPOINT = `${SITE}/api/contact`;

// run id keeps a batch identifiable without a clock (stable across reruns is fine)
const RUN = process.env.RUN_TAG || 'batch1';

const LANES = [
  { intent: 'lead', propertyType: 'Residential' },
  { intent: 'lead', propertyType: 'Commercial' },
  { intent: 'service', propertyType: 'Residential' },
  { intent: 'service', propertyType: 'Commercial' },
];
const contactType = (intent, prop) =>
  intent === 'lead' ? (prop === 'Commercial' ? 'commercial_lead' : 'residential_lead') : 'service_lead';

const SERVICE_BY_LANE = {
  'lead|Residential': 'Roof Replacement',
  'lead|Commercial': 'Roof Replacement',
  'service|Residential': 'Storm Damage',
  'service|Commercial': 'Roof Repair',
};

// Form surfaces. laneCycle=true rotates through all four lanes across the N fills.
const FORMS = [
  { slug: 'home-modal',        method: 'json', ctaId: 'home-final-request-quote',     source: 'Website – Homepage Request Quote CTA', laneCycle: true },
  { slug: 'residential-modal', method: 'json', ctaId: 'residential-pillar-final',     source: 'Website – Residential Pillar CTA', lanesSubset: [LANES[0], LANES[2]] },
  { slug: 'contact-hub',       method: 'form', ctaId: 'contact-hub',                  source: 'Website – Contact Page', laneCycle: true },
  { slug: 'contact-commercial',method: 'form', ctaId: 'contact-commercial-rfq',       source: 'Website – Commercial RFQ', fixed: LANES[1] },
  { slug: 'contact-emergency', method: 'form', ctaId: 'contact-emergency',            source: 'Website – Emergency Roof Help', fixed: LANES[2] },
  { slug: 'contact-res-insp',  method: 'form', ctaId: 'contact-residential-inspection', source: 'Website – Residential Inspection', fixed: LANES[0] },
  { slug: 'ths-booking',       method: 'form', ctaId: 'ths-booking',                  source: 'Website – Total Home Shield Booking', fixed: LANES[0] },
  { slug: 'property-card',     method: 'form', ctaId: 'property-card',                source: 'Website – Property Card Request', fixed: LANES[0] },
];

function laneFor(form, i) {
  if (form.fixed) return form.fixed;
  if (form.lanesSubset) return form.lanesSubset[i % form.lanesSubset.length];
  if (form.laneCycle) return LANES[i % LANES.length];
  return LANES[0];
}

// Unique, findable, VALID 10-digit phone per (formIndex, n): +1 555 FFF NNNN
function phoneFor(fIdx, n) {
  return `+1555${String(fIdx).padStart(3, '0')}${String(n).padStart(4, '0')}`;
}

function buildFill(form, fIdx, n) {
  const lane = laneFor(form, n);
  const ct = contactType(lane.intent, lane.propertyType);
  const svc = SERVICE_BY_LANE[`${lane.intent}|${lane.propertyType}`];
  const slugN = `${form.slug}-${RUN}-${n}`;
  return {
    contactType: ct,
    intent: lane.intent,
    propertyType: lane.propertyType,
    firstName: 'ZZTest',
    lastName: `${form.slug}-${n}`,
    email: `leadtest+${slugN}@cleverwork.io`,
    phone: phoneFor(fIdx, n),
    address: `${100 + n} Test St, Dallas TX 7520${n % 10}`,
    preferredContact: ['Phone', 'Email', 'Text'][n % 3],
    marketingConsent: 'Yes',   // JSON (modal) field name
    consent: 'true',           // form-encoded field name
    serviceType: svc,
    projectTimeline: ['ASAP', '1-3 months', '3-6 months', 'Just researching'][n % 4],
    insuranceClaim: ['Yes', 'No', 'Unsure'][n % 3],
    note: `Automated test fill ${slugN} (lane ${ct}/${lane.propertyType}). Do not delete — visual verification.`,
    ctaId: form.ctaId,
    source: `TEST ${form.slug} | ${form.source}`,
    intake_cta: form.ctaId,
    company_website: '', // honeypot empty = real
  };
}

async function post(form, payload) {
  if (form.method === 'json') {
    return fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'fetch' },
      body: JSON.stringify(payload),
    });
  }
  const body = new URLSearchParams(payload);
  return fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
    redirect: 'manual', // capture the 303 instead of following it
  });
}

async function preflight() {
  try {
    const res = await fetch(`${SITE}/`, { method: 'GET' });
    if (res.status >= 500) {
      console.error(`\n⛔ ${SITE}/ returned ${res.status}. Site is not healthy — fix the deploy (build green + Coolify port 4321 + env) before testing.\n`);
      process.exit(2);
    }
  } catch (e) {
    console.error(`\n⛔ Cannot reach ${SITE}: ${e.message}\n`);
    process.exit(2);
  }
}

async function main() {
  console.log(`\nTesting ${ENDPOINT} — ${PER_FORM} valid fills/form, run="${RUN}". Records are NOT deleted.\n`);
  await preflight();

  const results = [];
  for (let f = 0; f < FORMS.length; f++) {
    const form = FORMS[f];
    let ok = 0, fail = 0;
    for (let n = 1; n <= PER_FORM; n++) {
      const payload = buildFill(form, f, n);
      try {
        const res = await post(form, payload);
        const good = form.method === 'json' ? res.status === 200 : (res.status === 303 || res.status === 302);
        if (good) ok++; else fail++;
        let extra = '';
        if (form.method === 'json') {
          const j = await res.json().catch(() => ({}));
          extra = j.redirectTo ? `→ ${j.redirectTo}` : JSON.stringify(j);
        } else {
          extra = `→ ${res.headers.get('location') || ''}`;
        }
        console.log(`  [${form.slug} ${n}/${PER_FORM}] ${payload.contactType}/${payload.propertyType} ${payload.email} HTTP ${res.status} ${good ? 'OK' : 'FAIL'} ${extra}`);
      } catch (e) {
        fail++;
        console.log(`  [${form.slug} ${n}/${PER_FORM}] ERROR ${e.message}`);
      }
    }
    results.push({ form: form.slug, ok, fail });
  }

  // Edge batch (no visible records expected)
  console.log(`\nEdge cases:`);
  const hp = buildFill(FORMS[2], 2, 99); hp.company_website = 'bot-filled';
  const hpRes = await post(FORMS[2], hp).catch(() => null);
  console.log(`  honeypot: HTTP ${hpRes?.status} (expect success response, NO Supabase row for email ${hp.email})`);
  const bad = buildFill(FORMS[2], 2, 98); bad.email = ''; bad.phone = '';
  const badRes = await post(FORMS[2], bad).catch(() => null);
  console.log(`  missing email+phone: HTTP ${badRes?.status} (expect 400)`);

  console.log(`\nSummary:`);
  for (const r of results) console.log(`  ${r.form}: ${r.ok} ok / ${r.fail} fail`);
  console.log(`\nNow verify in Supabase + GHL (see header comment). Nothing was deleted.\n`);
}

main();
