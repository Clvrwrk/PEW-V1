# TPO build decisions

Source-of-truth log of decisions made during the TPO Roofing Systems build.
Specialists read this alongside `brief.yaml` to know what's been resolved.

---

## 2026-05-03 — Phase 1 resolution decisions

After PageBuilder Phase 1 surfaced three blockers, Chris ruled:

### 1. Slug rename → `tpo-roofing-systems.mdx`

Existing thin file at `src/content/services/commercial/tpo.mdx` (slug `/commercial-roofing/tpo`) gets renamed to `tpo-roofing-systems.mdx` (slug `/commercial-roofing/tpo-roofing-systems`).

A 301 redirect goes into the redirects file (location TBD by code-qc) from old slug → new slug. The keyword-slug match is a Kyle-Roof-confirmed ranking lever — worth the rename + redirect overhead.

PageBuilder Phase 4 (assembly) executes the rename. Phase 5 (code-qc) validates the redirect.

### 2. "Other Commercial Solutions" section → existing services only

Figma design shows 4 cards: EPDM, Metal, Coatings, Gutters. Coatings and Gutters service pages don't exist yet.

Resolved: replace Coatings + Gutters cards with **Repair** + **Replacement** (both already shipped at `/commercial-roofing/repair` and `/commercial-roofing/replacement`).

Final card set on TPO page: **EPDM, Metal, Repair, Replacement.**

When Coatings + Gutters service pages ship in a future sprint, the TPO page's "Other Commercial Solutions" section gets updated to include them. That's a small targeted edit, not a rebuild.

### 3. Final CTA banner — moisture scan

CTA copy keeps "thermal moisture scan" as a differentiator phrase. Action target points to `/contact?service=tpo-assessment+moisture-scan` (existing contact form with service hint pre-filled).

When `/services/diagnostics/moisture-scan` ships as its own page, the CTA target updates. That's a 1-line edit.

---

## Specialist effects

- **aia4-copywriter (Phase 2):** Drop "Coatings" and "Gutters" copy from the related-services section; substitute Repair + Replacement copy. CTA copy can keep the "thermal moisture scan" mention.
- **aia4-layout (Phase 3):** Build 4 cards in the Other Commercial Solutions grid using EPDM / Metal / Repair / Replacement metadata. CTA button `href="/contact?service=tpo-assessment+moisture-scan"`.
- **aia4-image-gen (Phase 3):** No effect — same 4 card icons regardless of which services they represent.
- **aia4-page-link (re-run):** Update outbound link manifest — replace Coatings/Gutters entries with Repair/Replacement (both `target_status: live`). Removes 2 of 3 unresolved warning flags.
- **aia4-page-qc (Phase 5a):** Verify CTA action target string matches the decision above.
- **aia4-code-qc (Phase 5b):** Validate 301 redirect from `/commercial-roofing/tpo` → `/commercial-roofing/tpo-roofing-systems` is wired.

---

*Authored by Maren via PageBuilder Phase 1 resolution. Decisions confirmed by Chris on 2026-05-03.*
