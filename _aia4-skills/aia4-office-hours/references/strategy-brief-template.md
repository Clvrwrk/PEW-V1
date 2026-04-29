# Strategy Brief Template

This is the Phase 5 output of the office-hours diagnostic. The brief is the durable artifact — the thing downstream skills (`aia4-client-report`, `marketing:campaign-plan`, design work) read to understand what was decided and why.

Adapted from the gstack `/office-hours` design-doc structure. Sections, order, and rationale are derived from that template, then trimmed and reframed for AIA4 client engagement work.

## File location and naming

Save to: `/strategy/YYYY-MM-DD-<short-slug>.md`

- `YYYY-MM-DD` is the date the diagnostic ran.
- `<short-slug>` is 3–5 lowercase words separated by hyphens that name the initiative — not the deliverable. *Good:* `commercial-rfq-flow.md`, `homeowner-leak-urgency-page.md`, `property-history-dashboard-wedge.md`. *Bad:* `report.md`, `meeting-notes.md`, `chris-asked-about-this.md`.

## Length

Target 1–2 pages. Hard ceiling: 3 pages. If the brief is longer than 3 pages, the diagnostic was undisciplined — either the initiative is actually two initiatives that need to be split, or sections are padded with context that belongs in `/discovery/` instead of in a strategy brief.

## Voice

Maren-coded. Director-level. The voice & tone rules in `/_aia4-skills/aia4-client-report/references/voice-and-tone.md` apply in full — same forbidden words, same anti-slop checklist, same revenue-anchored framing. The brief is an internal-facing document, but it gets read by Chris, by future-Maren, and (in most cases) eventually by the client. Write it so it survives all three audiences.

## Required sections

Every brief contains every section below in this order. Sections marked OPTIONAL can be omitted only if explicitly noted as N/A — never silently dropped.

### 1. Title and metadata

```
# <Initiative name in plain language>

**Date:** YYYY-MM-DD
**Asker:** <name and role of who raised the initiative>
**Diagnostician:** Maren Castellan-Reyes
**Status:** <Recommended | Recommended with conditions | Recommend against | Park for later>
**Decision needed by:** <date or "no hard deadline">
```

### 2. The ask, in one sentence

A single sentence stating what the asker proposed. If you couldn't write the ask in one sentence during Phase 1, that goes here as the first finding.

### 3. The reframe

What we actually think this is about, after Phase 1. If the reframe matched the original ask, write *"The original framing held."* If it didn't, write the new framing here in one or two sentences.

### 4. Demand evidence

What we know about whether anyone actually wants this. Cite sources. Search volume with a tool name. Sales-call quotes with a date. Heatmap behavior with a session-replay link. Internal stakeholder requests counted and named. If demand evidence is thin, say so explicitly — *"Demand evidence is currently thin: the initiative rests on the CEO's intuition. The Phase 5 assignment includes specific actions to test demand before committing."*

### 5. Status quo

What users / stakeholders / the sales team currently do to handle this need, even badly. Quantify the cost where possible. The status-quo section is the strongest predictor of whether the initiative is urgent.

### 6. Target user and narrowest wedge

The specific human (Q3) and the smallest version (Q4) we'd ship first. Both must be specific. *"Vincent, VP of Facilities at a 400,000-sqft regional distribution center, evaluating roof systems on a 10-year capital cycle"* — yes. *"Procurement officers"* — no.

### 7. Premises

The two or three load-bearing assumptions the initiative depends on. For each premise: state it, and state whether it's verified, partially verified, or unverified. Unverified premises become assignments in section 11.

### 8. Approaches considered

Three alternative approaches generated in Phase 4. For each: name, scope, effort estimate (in days, honest), what we learn, what we don't.

| Approach | Scope | Days | What we learn | What we don't |
|---|---|---|---|---|
| A — Narrowest wedge | … | … | … | … |
| B — Full thing as proposed | … | … | … | … |
| C — Boil-the-lake completeness | … | … | … | … |

### 9. Recommended approach

One of the three. State the recommendation. Defend it in two or three sentences. State what evidence would change the recommendation. If the answer is "do nothing right now," say that — "park for later" is a legitimate recommendation and should not be dressed up as something else.

### 10. Success criteria

How we'll know it worked. Tied to numbers wherever possible — conversion rate, organic sessions, pipeline created, sales-team hours saved, page-level KPI. CLAUDE.md section 4 requires every page to ship with a written hypothesis; this section satisfies that requirement at the strategy level.

### 11. Open questions and assignments

The unverified premises from section 7, plus any other questions surfaced during the diagnostic, converted into specific actions with owners. Format:

- [ ] **Action.** Owner: <name>. Due: <date or "before next pass">.

There should always be at least one assignment. The diagnostic that produces zero assignments either nailed everything (rare) or skipped the hard questions (more common).

### 12. Decision log entry

Two sentences referencing the decision and pointing to where it's logged. If the recommendation in section 9 is consequential enough to warrant a `/decisions/` entry per CLAUDE.md section 6, create that file and link to it here. If not, write *"Strategy-level decision; no separate decision log entry required."*

### 13. OPTIONAL — Distribution / handoff plan

If the initiative produces something that gets handed to another skill or another team, name the handoff explicitly. *"This brief feeds into `aia4-client-report` for the May 2 client readout."* / *"Handoff to Sanity content modeling once the wedge is approved."* If the initiative is closed-loop and produces nothing for downstream, mark this section *N/A*.

### 14. Provenance

Always:

> Methodology: AIA4 office-hours diagnostic, adapted from Garry Tan's gstack `/office-hours`. See `/_aia4-skills/aia4-office-hours/SKILL.md` for the workflow.

## Closing message format

When the brief is delivered, the chat-side closing message contains exactly three things:

1. The one-line recommendation from section 9.
2. The one specific next action (the highest-priority assignment from section 11).
3. A `computer://` link to the brief.

Example closing:

> Recommend Approach A (single-page wedge, 4 days) over the full property dashboard build. Next action: pull session-replay data from the existing /residential page for the last 30 days and identify the top three points where homeowners drop off — that's what tells us whether the wedge is on the right path. Brief: [computer:///path/to/brief.md]

No paragraph paragraph of summary. No reiteration of the diagnostic. Three things, in that order, then stop.
