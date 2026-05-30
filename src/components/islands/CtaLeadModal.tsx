/**
 * CtaLeadModal.tsx
 *
 * Pro Exteriors — dynamic popup CTA form / survey (React island)
 * AIA4 / Maren Castellan-Reyes — 2026-05-29
 *
 * A reusable CTA button that opens an accessible modal lead form. Two modes:
 *   • form   — single-screen: name, email, phone (+ optional address / note)
 *   • survey — multi-step wizard when we ask >4 questions (qualifying fields
 *              first, contact details last), per the brief's progressive-
 *              disclosure form strategy.
 *
 * Lane routing (per the Website CTA → GoHighLevel guide §4): the page context
 * sets the intake lane via hidden fields. Where the lane is obvious (residential
 * / commercial / service pages) it's hardcoded; where it's ambiguous (home,
 * contact) the form presents a small selector that resolves the lane. The
 * resolved `contactType` + `propertyType` ride along in the POST so the backend
 * (/api/contact → Supabase → /api/contact-sync) can route to the correct
 * pipeline. The form NEVER talks to GHL directly and never holds a token — it
 * posts to our own endpoint, which persists the lead then syncs to GHL.
 *
 * Design: DESIGN.md tokens — inputs 48px / rounded-md, primary CTA flag red
 * (#C22326), modal rounded-lg + shadow-xl, navy (#11133F) header accent.
 * a11y: role=dialog, aria-modal, focus trap, ESC + overlay close, focus return,
 * error summary with aria-live, ≥44px targets, visible focus rings.
 *
 * Anti-spam: hidden honeypot field (`company_website`); a real human never fills
 * it. Server still validates + should add Turnstile/rate-limit (see guide §11).
 */

import React, {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";

/* ── Brand tokens (mirror DESIGN.md) ─────────────────────────────────────── */
const FLAG_RED = "#C22326";
const FLAG_RED_HOVER = "#9b1c1f";
const NAVY = "#11133F";

type Intent = "lead" | "service";
type Property = "Residential" | "Commercial";

export interface CtaLeadModalProps {
  /** Visible button label. */
  triggerLabel: string;
  /** Tailwind classes for the trigger button (match the surrounding CTA style). */
  triggerClass?: string;
  /** Fixed lane intent, or "select" to ask the user (home / contact). */
  intent: Intent | "select";
  /** Fixed property type, or "select" to ask the user. */
  propertyType?: Property | "select";
  /** Stable CTA identifier, e.g. "residential-pillar-final". */
  ctaId: string;
  /** Human-readable source, e.g. "Website – Free Inspection CTA". */
  source: string;
  /** Modal heading + subhead. */
  heading?: string;
  subheading?: string;
  /** Collect a property/home address field. Default true. */
  collectAddress?: boolean;
  /** Collect a free-text note/details field. Default true. */
  collectNote?: boolean;
  /**
   * Survey mode: ask qualifying questions (service type, timeline, insurance).
   * Renders as a multi-step wizard because total questions exceed 4.
   */
  survey?: boolean;
  /** Service-type choices for survey mode. */
  serviceTypeOptions?: string[];
  /** Fast intake endpoint (writes Supabase, fires GHL sync). Default "/api/contact". */
  endpoint?: string;
}

/* GHL opportunity.service_type allowed values (guide §5). */
const DEFAULT_SERVICE_TYPES = [
  "Roof Replacement",
  "Roof Repair",
  "Storm Damage",
  "Inspection",
  "Siding",
  "Gutters",
  "Other",
];
const TIMELINE_OPTIONS = ["ASAP", "1-3 months", "3-6 months", "Just researching"];
const INSURANCE_OPTIONS = ["Yes", "No", "Unsure"];
const PREFERRED_CONTACT = ["Phone", "Email", "Text"];

interface FormState {
  // selector (lane)
  selIntent: Intent | "";
  selProperty: Property | "";
  // contact
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  note: string;
  preferredContact: string;
  consent: boolean;
  // survey / opportunity
  serviceType: string;
  timeline: string;
  insuranceClaim: string;
  // honeypot
  company_website: string;
}

const EMPTY: FormState = {
  selIntent: "",
  selProperty: "",
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  note: "",
  preferredContact: "Phone",
  consent: false,
  serviceType: "",
  timeline: "",
  insuranceClaim: "",
  company_website: "",
};

const emailOk = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
const phoneDigits = (v: string) => v.replace(/\D/g, "");
const phoneOk = (v: string) => phoneDigits(v).length >= 10;

/** US-default E.164 normalization, mirrored server-side. */
function toE164(v: string): string {
  const d = phoneDigits(v);
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return v.trim();
}

/** Pull attribution from the URL + first-party storage at open time. */
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

export default function CtaLeadModal({
  triggerLabel,
  triggerClass = "",
  intent,
  propertyType = "Residential",
  ctaId,
  source,
  heading = "Request your free estimate",
  subheading = "Tell us a little about your project and we'll be in touch — usually same day.",
  collectAddress = true,
  collectNote = true,
  survey = false,
  serviceTypeOptions = DEFAULT_SERVICE_TYPES,
  endpoint = "/api/contact",
}: CtaLeadModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const titleId = useId();
  const descId = useId();

  const needsLaneSelect = intent === "select" || propertyType === "select";

  /* Step model. Survey → wizard. */
  const steps = useMemo(() => {
    const s: ("lane" | "qualify" | "contact")[] = [];
    if (needsLaneSelect) s.push("lane");
    if (survey) s.push("qualify");
    s.push("contact");
    return s;
  }, [needsLaneSelect, survey]);

  const resolvedIntent: Intent = intent === "select" ? (data.selIntent || "lead") : intent;
  const resolvedProperty: Property =
    propertyType === "select" ? (data.selProperty || "Residential") : propertyType;

  /* ── Open / close ──────────────────────────────────────────────────────── */
  const openModal = useCallback(() => {
    setData({ ...EMPTY });
    setStep(0);
    setErrors([]);
    setServerError(null);
    setOpen(true);
    pushDataLayer("cta_modal_open", { ctaId, intent, propertyType });
  }, [ctaId, intent, propertyType]);

  const closeModal = useCallback(() => {
    setOpen(false);
    setTimeout(() => triggerRef.current?.focus(), 0);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "Tab") trapFocus(e, dialogRef.current);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    // focus first field
    setTimeout(() => {
      dialogRef.current
        ?.querySelector<HTMLElement>("input,select,textarea,button")
        ?.focus();
    }, 30);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, closeModal, step]);

  const set = <K extends keyof FormState>(k: K, v: FormState[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  /* ── Validation per step ───────────────────────────────────────────────── */
  function validateStep(which: "lane" | "qualify" | "contact"): string[] {
    const e: string[] = [];
    if (which === "lane") {
      if (intent === "select" && !data.selIntent) e.push("Please choose what you need.");
      if (propertyType === "select" && !data.selProperty) e.push("Please choose a property type.");
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

  const next = () => {
    const e = validateStep(steps[step]);
    setErrors(e);
    if (e.length === 0) setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => {
    setErrors([]);
    setStep((s) => Math.max(s - 1, 0));
  };

  /* ── Submit ────────────────────────────────────────────────────────────── */
  async function submit() {
    const e = validateStep("contact");
    setErrors(e);
    if (e.length > 0) return;

    // Honeypot — silently succeed without sending (don't tip off bots).
    if (data.company_website.trim() !== "") {
      closeModal();
      return;
    }

    setSubmitting(true);
    setServerError(null);
    const attribution = readAttribution(ctaId);
    const contactType: "residential_lead" | "commercial_lead" | "service_lead" =
      resolvedIntent === "lead"
        ? resolvedProperty === "Commercial"
          ? "commercial_lead"
          : "residential_lead"
        : "service_lead";

    const payload = {
      // lane (drives backend pipeline routing — guide §2/§4)
      contactType,
      propertyType: resolvedProperty,
      intent: resolvedIntent,
      // person
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim() ? toE164(data.phone) : "",
      address: data.address.trim(),
      preferredContact: data.preferredContact,
      marketingConsent: data.consent ? "Yes" : "No",
      // opportunity / job
      serviceType:
        data.serviceType ||
        (survey ? "Other" : resolvedIntent === "service" ? "Roof Repair" : "Roof Replacement"),
      projectTimeline: data.timeline,
      insuranceClaim: data.insuranceClaim,
      note: data.note.trim(),
      // meta + attribution
      ctaId,
      source,
      ...attribution,
      // honeypot (server double-checks)
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
        json.redirectTo ||
        (resolvedProperty === "Commercial"
          ? "/thank-you/commercial/"
          : "/thank-you/residential/");
    } catch (err) {
      pushDataLayer("form_submit_error", { ctaId, message: (err as Error).message });
      setServerError(
        "We couldn't submit your request. Please call 844-336-PROS and we'll help right away.",
      );
      setSubmitting(false);
    }
  }

  const current = steps[step];
  const isLast = step === steps.length - 1;

  /* ── Render ────────────────────────────────────────────────────────────── */
  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={openModal}
        className={triggerClass}
        data-cta-name={ctaId}
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          style={S.overlay}
          onClick={closeModal}
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descId}
            style={S.card}
            onClick={(e) => e.stopPropagation()}
          >
            <style>{CSS}</style>

            {/* Header */}
            <header style={S.header}>
              <div>
                <h2 id={titleId} style={S.title}>{heading}</h2>
                <p id={descId} style={S.subtitle}>{subheading}</p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                style={S.close}
                className="pe-modal-close"
              >
                ×
              </button>
            </header>

            {/* Progress (wizard only) */}
            {steps.length > 1 && (
              <div style={S.progressWrap} aria-hidden="true">
                {steps.map((_, i) => (
                  <span
                    key={i}
                    style={{
                      ...S.progressDot,
                      background: i <= step ? FLAG_RED : "#E4E6EC",
                      flex: 1,
                    }}
                  />
                ))}
              </div>
            )}

            <div style={S.body}>
              {/* Error summary */}
              {errors.length > 0 && (
                <div role="alert" aria-live="assertive" style={S.errorBox}>
                  <strong style={{ display: "block", marginBottom: 4 }}>
                    Please fix the following:
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {errors.map((er, i) => <li key={i}>{er}</li>)}
                  </ul>
                </div>
              )}
              {serverError && (
                <div role="alert" aria-live="assertive" style={S.errorBox}>{serverError}</div>
              )}

              {/* Honeypot — visually hidden, off-screen, not tabbable */}
              <div aria-hidden="true" style={S.hp}>
                <label>
                  Company website
                  <input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={data.company_website}
                    onChange={(e) => set("company_website", e.target.value)}
                  />
                </label>
              </div>

              {/* STEP: lane selector */}
              {current === "lane" && (
                <fieldset style={S.fieldset}>
                  {intent === "select" && (
                    <Field label="What do you need?" required>
                      <Segmented
                        name="intent"
                        value={data.selIntent}
                        onChange={(v) => set("selIntent", v as Intent)}
                        options={[
                          { value: "lead", label: "New project / estimate" },
                          { value: "service", label: "Repair / service / warranty" },
                        ]}
                      />
                    </Field>
                  )}
                  {propertyType === "select" && (
                    <Field label="Property type" required>
                      <Segmented
                        name="property"
                        value={data.selProperty}
                        onChange={(v) => set("selProperty", v as Property)}
                        options={[
                          { value: "Residential", label: "Residential" },
                          { value: "Commercial", label: "Commercial" },
                        ]}
                      />
                    </Field>
                  )}
                </fieldset>
              )}

              {/* STEP: qualifying (survey) */}
              {current === "qualify" && (
                <fieldset style={S.fieldset}>
                  <Field label="What service do you need?" required>
                    <select
                      style={S.input}
                      value={data.serviceType}
                      onChange={(e) => set("serviceType", e.target.value)}
                    >
                      <option value="">Select a service…</option>
                      {serviceTypeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="When do you need it done?">
                    <select
                      style={S.input}
                      value={data.timeline}
                      onChange={(e) => set("timeline", e.target.value)}
                    >
                      <option value="">No preference</option>
                      {TIMELINE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </Field>
                  <Field label="Is this an insurance claim?">
                    <Segmented
                      name="insurance"
                      value={data.insuranceClaim}
                      onChange={(v) => set("insuranceClaim", v)}
                      options={INSURANCE_OPTIONS.map((o) => ({ value: o, label: o }))}
                    />
                  </Field>
                </fieldset>
              )}

              {/* STEP: contact */}
              {current === "contact" && (
                <fieldset style={S.fieldset}>
                  <div className="pe-row2" style={S.row2}>
                    <Field label="First name" required>
                      <input
                        style={S.input}
                        autoComplete="given-name"
                        value={data.firstName}
                        onChange={(e) => set("firstName", e.target.value)}
                      />
                    </Field>
                    <Field label="Last name">
                      <input
                        style={S.input}
                        autoComplete="family-name"
                        value={data.lastName}
                        onChange={(e) => set("lastName", e.target.value)}
                      />
                    </Field>
                  </div>
                  <div className="pe-row2" style={S.row2}>
                    <Field label="Email" required>
                      <input
                        style={S.input}
                        type="email"
                        autoComplete="email"
                        value={data.email}
                        onChange={(e) => set("email", e.target.value)}
                      />
                    </Field>
                    <Field label="Phone" required>
                      <input
                        style={S.input}
                        type="tel"
                        autoComplete="tel"
                        value={data.phone}
                        onChange={(e) => set("phone", e.target.value)}
                      />
                    </Field>
                  </div>
                  {collectAddress && (
                    <Field label={resolvedProperty === "Commercial" ? "Property address" : "Home address"}>
                      <input
                        style={S.input}
                        autoComplete="street-address"
                        value={data.address}
                        onChange={(e) => set("address", e.target.value)}
                      />
                    </Field>
                  )}
                  {collectNote && (
                    <Field label="Anything we should know?">
                      <textarea
                        style={{ ...S.input, height: "auto", minHeight: 88, paddingTop: 10 }}
                        rows={3}
                        value={data.note}
                        onChange={(e) => set("note", e.target.value)}
                      />
                    </Field>
                  )}
                  <Field label="Best way to reach you">
                    <Segmented
                      name="preferred"
                      value={data.preferredContact}
                      onChange={(v) => set("preferredContact", v)}
                      options={PREFERRED_CONTACT.map((o) => ({ value: o, label: o }))}
                    />
                  </Field>
                  <label style={S.consent}>
                    <input
                      type="checkbox"
                      checked={data.consent}
                      onChange={(e) => set("consent", e.target.checked)}
                      style={{ width: 18, height: 18, marginTop: 2, flexShrink: 0 }}
                    />
                    <span>
                      I agree that Pro Exteriors may contact me about my request by phone,
                      text, or email. Message/data rates may apply. Consent is not a
                      condition of purchase.
                    </span>
                  </label>
                </fieldset>
              )}
            </div>

            {/* Footer actions */}
            <footer style={S.footer}>
              {step > 0 ? (
                <button type="button" onClick={back} style={S.btnGhost} className="pe-btn">
                  Back
                </button>
              ) : <span />}
              {!isLast ? (
                <button type="button" onClick={next} style={S.btnPrimary} className="pe-btn">
                  Continue
                </button>
              ) : (
                <button
                  type="button"
                  onClick={submit}
                  disabled={submitting}
                  style={{ ...S.btnPrimary, opacity: submitting ? 0.7 : 1 }}
                  className="pe-btn"
                >
                  {submitting ? "Sending…" : "Submit request"}
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Small presentational helpers ─────────────────────────────────────────── */
function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label style={S.field}>
      <span style={S.label}>
        {label} {required && <span style={{ color: FLAG_RED }} aria-hidden="true">*</span>}
      </span>
      {children}
    </label>
  );
}

function Segmented({
  name,
  value,
  onChange,
  options,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div role="radiogroup" aria-label={name} style={S.segmented}>
      {options.map((o) => {
        const active = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(o.value)}
            className="pe-seg"
            style={{
              ...S.segBtn,
              background: active ? NAVY : "#fff",
              color: active ? "#fff" : NAVY,
              borderColor: active ? NAVY : "#CBD2DD",
              fontWeight: active ? 700 : 500,
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* Focus trap for Tab within the dialog. */
function trapFocus(e: KeyboardEvent, container: HTMLElement | null) {
  if (!container) return;
  const f = container.querySelectorAll<HTMLElement>(
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])',
  );
  if (f.length === 0) return;
  const first = f[0];
  const last = f[f.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
}

/* ── Styles (DESIGN.md tokens) ────────────────────────────────────────────── */
const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(17,19,63,0.55)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    padding: "1rem",
    animation: "pe-fade 160ms ease-out",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: 12,
    boxShadow: "0 20px 50px rgba(17,19,63,0.35)",
    width: "100%",
    maxWidth: 560,
    maxHeight: "92vh",
    overflowY: "auto",
    animation: "pe-scale 200ms cubic-bezier(0.2,0.8,0.2,1)",
  },
  header: {
    background: NAVY,
    color: "#fff",
    padding: "1.25rem 1.5rem",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: "1rem",
    borderBottom: `4px solid ${FLAG_RED}`,
  },
  title: { margin: 0, fontSize: "1.3rem", fontWeight: 800, letterSpacing: "-0.01em" },
  subtitle: { margin: "0.4rem 0 0", fontSize: "0.9rem", color: "rgba(255,255,255,0.8)", lineHeight: 1.4 },
  close: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.35)",
    color: "#fff",
    width: 36,
    height: 36,
    borderRadius: 18,
    fontSize: 24,
    lineHeight: 1,
    cursor: "pointer",
    flexShrink: 0,
  },
  progressWrap: { display: "flex", gap: 4, padding: "0.75rem 1.5rem 0" },
  progressDot: { height: 4, borderRadius: 2 },
  body: { padding: "1.25rem 1.5rem 0.5rem" },
  fieldset: { border: 0, margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.9rem" },
  row2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.9rem" },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: "0.85rem", fontWeight: 600, color: NAVY },
  input: {
    width: "100%",
    height: 48,
    borderRadius: 8,
    border: "1px solid #CBD2DD",
    padding: "0 12px",
    fontSize: "0.95rem",
    color: NAVY,
    background: "#fff",
    boxSizing: "border-box",
    fontFamily: "inherit",
  },
  segmented: { display: "flex", gap: 8, flexWrap: "wrap" },
  segBtn: {
    flex: "1 1 auto",
    minHeight: 44,
    padding: "0 14px",
    borderRadius: 8,
    border: "1px solid",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  consent: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    fontSize: "0.8rem",
    color: "#475569",
    lineHeight: 1.45,
    marginTop: 2,
  },
  errorBox: {
    background: "#FCE8E8",
    border: "1px solid #E7B4B4",
    color: "#8A1F1F",
    borderRadius: 8,
    padding: "0.75rem 0.9rem",
    fontSize: "0.85rem",
    marginBottom: "1rem",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "1rem",
    padding: "1rem 1.5rem 1.5rem",
    position: "sticky",
    bottom: 0,
    background: "#fff",
  },
  btnPrimary: {
    minHeight: 48,
    padding: "0 24px",
    borderRadius: 8,
    border: "none",
    background: FLAG_RED,
    color: "#fff",
    fontWeight: 700,
    fontSize: "0.95rem",
    cursor: "pointer",
    marginLeft: "auto",
  },
  btnGhost: {
    minHeight: 48,
    padding: "0 20px",
    borderRadius: 8,
    border: "1px solid #CBD2DD",
    background: "#fff",
    color: NAVY,
    fontWeight: 600,
    fontSize: "0.95rem",
    cursor: "pointer",
  },
  hp: { position: "absolute", left: "-9999px", width: 1, height: 1, overflow: "hidden" },
};

const CSS = `
  @keyframes pe-fade  { from { opacity: 0 } to { opacity: 1 } }
  @keyframes pe-scale { from { transform: scale(.96); opacity: 0 } to { transform: scale(1); opacity: 1 } }
  .pe-btn:focus-visible, .pe-seg:focus-visible, .pe-modal-close:focus-visible {
    outline: 2px solid ${FLAG_RED}; outline-offset: 2px;
  }
  @media (max-width: 480px) {
    .pe-row2 { grid-template-columns: 1fr !important; }
  }
  @media (prefers-reduced-motion: reduce) {
    [style*="animation"] { animation: none !important; }
  }
`;
