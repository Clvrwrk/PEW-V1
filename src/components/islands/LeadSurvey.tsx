/**
 * LeadSurvey.tsx
 *
 * Pro Exteriors — inline progressive lead survey (React island).
 * AIA4 / Maren Castellan-Reyes — 2026-05-30
 *
 * The CtaLeadModal wizard, rendered INLINE on the contact hub instead of in a
 * popup overlay. Low-cognitive progressive disclosure across three steps that
 * ROUTE THE GHL LANE from the client's own answers:
 *   1) lane     — "What do you need?" (lead/service) × "Property type" (Res/Com)
 *   2) qualify  — service type / timeline / insurance, options ADAPT to the lane
 *   3) contact  — name, email, phone, address, consent
 *
 * Shares the modal's exact design language (DESIGN.md canon): deep-navy #11133F
 * header + selected segments, flag-red #C22326 sole CTA (hover #9B1C1F), 48px
 * inputs @ 8px radius. Posts JSON to /api/contact (Supabase → GHL four-lane
 * intake). Honeypot + consent + UTM attribution, same as the modal.
 *
 * Rendered client:only on /contact/ with a <noscript> fallback to the no-JS
 * LeadCaptureForm, so JS-off users still get a working form.
 */

import React, { useCallback, useId, useMemo, useRef, useState } from "react";

/* ── DESIGN.md tokens (mirror CtaLeadModal for visual consistency) ────────── */
const NAVY = "#11133F";        // deep-navy-500 — primary anchor
const FLAG_RED = "#C22326";    // flag-red-500 — sole CTA
const FLAG_RED_HOVER = "#9B1C1F";
const BORDER = "#CBD2DD";

type Intent = "lead" | "service";
type Property = "Residential" | "Commercial";

export interface LeadSurveyProps {
  ctaId: string;
  source: string;
  heading?: string;
  subheading?: string;
  endpoint?: string;
}

/** GHL opportunity.service_type allowed values (verified live). Display subsets
 *  adapt to the lane, but every value below is in the GHL picklist. */
const SERVICE_OPTIONS: Record<Property, string[]> = {
  Residential: ["Roof Replacement", "Roof Repair", "Storm Damage", "Inspection", "Siding", "Gutters", "Other"],
  Commercial: ["Roof Replacement", "Roof Repair", "Storm Damage", "Inspection", "Other"],
};
const TIMELINE_OPTIONS = ["ASAP", "1-3 months", "3-6 months", "Just researching"];
const INSURANCE_OPTIONS = ["Yes", "No", "Unsure"];
const PREFERRED_CONTACT = ["Phone", "Email", "Text"];

interface FormState {
  selIntent: Intent | "";
  selProperty: Property | "";
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  note: string;
  preferredContact: string;
  consent: boolean;
  serviceType: string;
  timeline: string;
  insuranceClaim: string;
  company_website: string; // honeypot
}

const EMPTY: FormState = {
  selIntent: "", selProperty: "",
  firstName: "", lastName: "", email: "", phone: "", address: "", note: "",
  preferredContact: "Phone", consent: false,
  serviceType: "", timeline: "", insuranceClaim: "",
  company_website: "",
};

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const phoneDigits = (v: string) => v.replace(/\D/g, "");
const phoneOk = (v: string) => phoneDigits(v).length >= 10;
function toE164(v: string): string {
  const d = phoneDigits(v);
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return v.trim();
}

function readAttribution(ctaId: string) {
  if (typeof window === "undefined") {
    return { intake_cta: ctaId, utm_source: "", utm_medium: "", utm_campaign: "", ad_click_id: "" };
  }
  const qs = new URLSearchParams(window.location.search);
  const pick = (k: string) => qs.get(k) || "";
  return {
    intake_cta: ctaId || window.location.pathname,
    utm_source: pick("utm_source"),
    utm_medium: pick("utm_medium"),
    utm_campaign: pick("utm_campaign"),
    ad_click_id: pick("gclid") || pick("fbclid"),
  };
}

function pushDataLayer(event: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as { dataLayer?: Record<string, unknown>[] };
  if (Array.isArray(w.dataLayer)) w.dataLayer.push({ event, ...payload });
}

export default function LeadSurvey({
  ctaId,
  source,
  heading = "Request your free estimate",
  subheading = "A couple quick taps tell us who to route you to — then a few details. Most requests get a same-day response.",
  endpoint = "/api/contact",
}: LeadSurveyProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const bodyRef = useRef<HTMLDivElement | null>(null);
  const titleId = useId();

  const steps = useMemo(() => ["lane", "qualify", "contact"] as const, []);
  const resolvedProperty: Property = data.selProperty || "Residential";
  const resolvedIntent: Intent = data.selIntent || "lead";

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  function validateStep(which: (typeof steps)[number]): string[] {
    const e: string[] = [];
    if (which === "lane") {
      if (!data.selIntent) e.push("Please choose what you need.");
      if (!data.selProperty) e.push("Please choose a property type.");
    }
    if (which === "qualify") {
      if (!data.serviceType) e.push("Please select a service type.");
    }
    if (which === "contact") {
      if (!data.firstName.trim()) e.push("First name is required.");
      if (!data.email.trim() && !data.phone.trim())
        e.push("Enter an email or a phone number so we can reach you.");
      if (data.email.trim() && !emailOk(data.email)) e.push("Enter a valid email address.");
      if (data.phone.trim() && !phoneOk(data.phone)) e.push("Enter a valid phone number (10 digits).");
      if (!data.consent) e.push("Please agree to be contacted about your request.");
    }
    return e;
  }

  const focusBody = useCallback(() => {
    setTimeout(() => {
      bodyRef.current?.querySelector<HTMLElement>("input,select,textarea,button[role=radio]")?.focus();
    }, 30);
  }, []);

  const next = () => {
    const e = validateStep(steps[step]);
    setErrors(e);
    if (e.length === 0) { setStep((s) => Math.min(s + 1, steps.length - 1)); focusBody(); }
  };
  const back = () => { setErrors([]); setStep((s) => Math.max(s - 1, 0)); focusBody(); };

  async function submit() {
    const e = validateStep("contact");
    setErrors(e);
    if (e.length > 0) return;
    if (data.company_website.trim() !== "") { /* honeypot: silently stop */ return; }

    setSubmitting(true);
    setServerError(null);
    const attribution = readAttribution(ctaId);
    const contactType =
      resolvedIntent === "lead"
        ? resolvedProperty === "Commercial" ? "commercial_lead" : "residential_lead"
        : "service_lead";

    const payload = {
      contactType,
      propertyType: resolvedProperty,
      intent: resolvedIntent,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim() ? toE164(data.phone) : "",
      address: data.address.trim(),
      preferredContact: data.preferredContact,
      marketingConsent: data.consent ? "Yes" : "No",
      serviceType: data.serviceType || (resolvedIntent === "service" ? "Roof Repair" : "Roof Replacement"),
      projectTimeline: data.timeline,
      insuranceClaim: data.insuranceClaim,
      note: data.note.trim(),
      ctaId,
      source,
      ...attribution,
      company_website: data.company_website,
    };

    pushDataLayer("form_submit_attempt", { ctaId, contactType });
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Requested-With": "fetch" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = (await res.json().catch(() => ({}))) as { redirectTo?: string };
      pushDataLayer("form_submit_success", { ctaId, contactType });
      window.location.href =
        json.redirectTo || (resolvedProperty === "Commercial" ? "/thank-you/commercial/" : "/thank-you/residential/");
    } catch (err) {
      pushDataLayer("form_submit_error", { ctaId, message: (err as Error).message });
      setServerError("We couldn't submit your request. Please call 844-336-PROS and we'll help right away.");
      setSubmitting(false);
    }
  }

  const current = steps[step];
  const isLast = step === steps.length - 1;
  const serviceChoices = SERVICE_OPTIONS[resolvedProperty];

  return (
    <div style={S.card}>
      <style>{CSS}</style>
      <header style={S.header}>
        <h2 id={titleId} style={S.title}>{heading}</h2>
        <p style={S.subtitle}>{subheading}</p>
      </header>

      <div style={S.progressWrap} aria-hidden="true">
        {steps.map((_, i) => (
          <span key={i} style={{ ...S.progressDot, background: i <= step ? FLAG_RED : "#E4E6EC" }} />
        ))}
      </div>

      <div style={S.body} ref={bodyRef}>
        <p style={S.stepCount} aria-live="polite">Step {step + 1} of {steps.length}</p>

        {errors.length > 0 && (
          <div role="alert" aria-live="assertive" style={S.errorBox}>
            <strong style={{ display: "block", marginBottom: 4 }}>Please fix the following:</strong>
            <ul style={{ margin: 0, paddingLeft: 18 }}>{errors.map((er, i) => <li key={i}>{er}</li>)}</ul>
          </div>
        )}
        {serverError && <div role="alert" aria-live="assertive" style={S.errorBox}>{serverError}</div>}

        {/* honeypot */}
        <div aria-hidden="true" style={S.hp}>
          <label>Company website
            <input type="text" tabIndex={-1} autoComplete="off" value={data.company_website}
              onChange={(e) => set("company_website", e.target.value)} />
          </label>
        </div>

        {current === "lane" && (
          <fieldset style={S.fieldset}>
            <Field label="What do you need?" required>
              <Segmented name="intent" value={data.selIntent}
                onChange={(v) => set("selIntent", v as Intent)}
                options={[{ value: "lead", label: "New project / estimate" }, { value: "service", label: "Repair / service / warranty" }]} />
            </Field>
            <Field label="Property type" required>
              <Segmented name="property" value={data.selProperty}
                onChange={(v) => set("selProperty", v as Property)}
                options={[{ value: "Residential", label: "Residential" }, { value: "Commercial", label: "Commercial" }]} />
            </Field>
          </fieldset>
        )}

        {current === "qualify" && (
          <fieldset style={S.fieldset}>
            <Field label={resolvedIntent === "service" ? "What needs service?" : "What service do you need?"} required>
              <select style={S.input} value={data.serviceType} onChange={(e) => set("serviceType", e.target.value)}>
                <option value="">Select a service…</option>
                {serviceChoices.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label={resolvedIntent === "service" ? "How soon do you need help?" : "When do you want it done?"}>
              <select style={S.input} value={data.timeline} onChange={(e) => set("timeline", e.target.value)}>
                <option value="">No preference</option>
                {TIMELINE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </Field>
            <Field label="Is this an insurance claim?">
              <Segmented name="insurance" value={data.insuranceClaim}
                onChange={(v) => set("insuranceClaim", v)}
                options={INSURANCE_OPTIONS.map((o) => ({ value: o, label: o }))} />
            </Field>
          </fieldset>
        )}

        {current === "contact" && (
          <fieldset style={S.fieldset}>
            <div className="pe-row2" style={S.row2}>
              <Field label="First name" required>
                <input style={S.input} autoComplete="given-name" value={data.firstName} onChange={(e) => set("firstName", e.target.value)} />
              </Field>
              <Field label="Last name">
                <input style={S.input} autoComplete="family-name" value={data.lastName} onChange={(e) => set("lastName", e.target.value)} />
              </Field>
            </div>
            <div className="pe-row2" style={S.row2}>
              <Field label="Email" required>
                <input style={S.input} type="email" autoComplete="email" value={data.email} onChange={(e) => set("email", e.target.value)} />
              </Field>
              <Field label="Phone" required>
                <input style={S.input} type="tel" autoComplete="tel" value={data.phone} onChange={(e) => set("phone", e.target.value)} />
              </Field>
            </div>
            <Field label={resolvedProperty === "Commercial" ? "Property address" : "Home address"}>
              <input style={S.input} autoComplete="street-address" value={data.address} onChange={(e) => set("address", e.target.value)} />
            </Field>
            <Field label="Anything we should know?">
              <textarea style={{ ...S.input, height: "auto", minHeight: 88, paddingTop: 10 }} rows={3}
                value={data.note} onChange={(e) => set("note", e.target.value)} />
            </Field>
            <Field label="Best way to reach you">
              <Segmented name="preferred" value={data.preferredContact}
                onChange={(v) => set("preferredContact", v)}
                options={PREFERRED_CONTACT.map((o) => ({ value: o, label: o }))} />
            </Field>
            <label style={S.consent}>
              <input type="checkbox" checked={data.consent} onChange={(e) => set("consent", e.target.checked)}
                style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0 }} />
              <span>I agree that Pro Exteriors may contact me about my request by phone, text, or email. Message/data rates may apply. Consent is not a condition of purchase.</span>
            </label>
          </fieldset>
        )}
      </div>

      <footer style={S.footer}>
        {step > 0 ? (
          <button type="button" onClick={back} style={S.btnGhost} className="pe-btn">Back</button>
        ) : <span />}
        {!isLast ? (
          <button type="button" onClick={next} style={S.btnPrimary} className="pe-btn">Continue</button>
        ) : (
          <button type="button" onClick={submit} disabled={submitting} style={{ ...S.btnPrimary, opacity: submitting ? 0.7 : 1 }} className="pe-btn">
            {submitting ? "Sending…" : "Submit request"}
          </button>
        )}
      </footer>
    </div>
  );
}

/* ── Presentational helpers (mirror CtaLeadModal) ─────────────────────────── */
function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label style={S.field}>
      <span style={S.label}>{label} {required && <span style={{ color: FLAG_RED }} aria-hidden="true">*</span>}</span>
      {children}
    </label>
  );
}

function Segmented({ name, value, onChange, options }: {
  name: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div role="radiogroup" aria-label={name} style={S.segmented}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button key={o.value} type="button" role="radio" aria-checked={active} onClick={() => onChange(o.value)} className="pe-seg"
            style={{ ...S.segBtn, background: active ? NAVY : "#fff", color: active ? "#fff" : NAVY, borderColor: active ? NAVY : BORDER, fontWeight: active ? 700 : 500 }}>
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card: { background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(17,19,63,0.12)", border: `1px solid ${BORDER}`, overflow: "hidden", fontFamily: "inherit", maxWidth: 640 },
  header: { background: NAVY, color: "#fff", padding: "1.25rem 1.5rem", borderBottom: `4px solid ${FLAG_RED}` },
  title: { margin: 0, fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-0.01em" },
  subtitle: { margin: "0.4rem 0 0", fontSize: "0.92rem", color: "rgba(255,255,255,0.82)", lineHeight: 1.45 },
  progressWrap: { display: "flex", gap: 4, padding: "0.85rem 1.5rem 0" },
  progressDot: { height: 4, borderRadius: 2, flex: 1 },
  body: { padding: "1rem 1.5rem 0.5rem" },
  stepCount: { margin: "0 0 0.75rem", fontSize: "0.78rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#6B7280" },
  fieldset: { border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.9rem" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: "0.85rem", fontWeight: 600, color: NAVY },
  input: { width: "100%", height: 48, borderRadius: 8, border: `1px solid ${BORDER}`, padding: "0 12px", fontSize: "0.95rem", color: NAVY, background: "#fff", boxSizing: "border-box", fontFamily: "inherit" },
  segmented: { display: "flex", gap: 8, flexWrap: "wrap" },
  segBtn: { flex: "1 1 auto", minHeight: 48, padding: "0 14px", borderRadius: 8, border: "1px solid", cursor: "pointer", fontSize: "0.9rem" },
  consent: { display: "flex", gap: 10, alignItems: "flex-start", fontSize: "0.8rem", color: "#475569", lineHeight: 1.45, marginTop: 2 },
  errorBox: { background: "#FCE8E8", border: "1px solid #E7B4B4", color: "#8A1F1F", borderRadius: 8, padding: "0.75rem 0.9rem", fontSize: "0.85rem", marginBottom: "1rem" },
  footer: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", padding: "1rem 1.5rem 1.5rem" },
  btnPrimary: { minHeight: 48, padding: "0 24px", borderRadius: 8, border: "none", background: FLAG_RED, color: "#fff", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", marginLeft: "auto" },
  btnGhost: { minHeight: 48, padding: "0 20px", borderRadius: 8, border: `1px solid ${BORDER}`, background: "#fff", color: NAVY, fontWeight: 600, fontSize: "0.95rem", cursor: "pointer" },
  hp: { position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" },
};

const CSS = `
  .pe-btn:focus-visible, .pe-seg:focus-visible { outline: 2px solid ${FLAG_RED}; outline-offset: 2px; }
  .pe-btn[style*="${FLAG_RED}"]:hover { background: ${FLAG_RED_HOVER} !important; }
  @media (max-width: 480px) { .pe-row2 { grid-template-columns: 1fr !important; } }
`;
