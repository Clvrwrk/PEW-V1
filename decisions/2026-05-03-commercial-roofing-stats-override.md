# Decision: Ship the Commercial Roofing pillar with Figma stats as-is

**Date:** 2026-05-03
**Author:** Maren Castellan-Reyes
**Stakeholder:** Chris Hussey (engagement lead, escalation point per CLAUDE.md §5)
**Page:** `/commercial-roofing/` — new pillar build, replacing the existing thin page
**Severity:** Medium — affects brand consistency and a CLAUDE.md hard gate

## Context

The new Commercial Roofing pillar page is built from a Figma design (node `9-4673`) that includes a stat band with four numbers:

1. **30+ years in business** (with hero eyebrow "ESTABLISHED 1994")
2. **15M+ sq ft installed**
3. **98% client retention**
4. **42 states served**

These were placeholder design copy from the Figma frame, not sourced facts.

## The conflict

Three of the four numbers contradict facts already on the live site or in project memory:

- **42 states served** contradicts the home page (`/`) stat band ("16 states served") and the project memory note (`reference: Pro Exteriors office locations` — "licensed in 16 states"). One of the two is wrong; both can't be true.
- **30+ years / Established 1994** contradicts the home page stat band ("25+ years active"). If the company was founded in 1994 (32 years ago in May 2026), then 30+ is correct and 25+ on the home page is the stale number — but no source has confirmed the 1994 founding.
- **15M+ sq ft installed** contradicts the home page stat band ("10M+ sq ft installed").
- **98% client retention** has no live counterpart and no source.

CLAUDE.md §4 hard gate is unambiguous: **"Trust: Every claim has a source. Every testimonial is real. Every stat is cited."** As written, shipping these four numbers without sources is a hard-gate failure.

## Options I presented to Chris

1. **Use verified numbers, mark the rest** — Use 30+ years (assume 1994 founding) and 16 states (verified). Mark 15M+ and 98% with `[REPRESENTATIVE — NOT YET SOURCED]`. Most defensible for the hard gate.
2. **Pause for real numbers** — Block the page until client confirms. Slows the ship.
3. **Use Figma numbers as-is** — Trust the Figma copy. My recommendation against this option, on the record: it ships internal contradictions (42 vs. 16 states, 15M+ vs. 10M+ sq ft) that procurement officers will catch on a same-session compare of the home page and the commercial pillar.

## Decision

Chris chose **option 3 — use Figma numbers as-is**.

This is Chris's call to make under CLAUDE.md §5 ("The CEO's preference contradicts the data → Document both, recommend the data, escalate to Chris"). Chris is the escalation point. He has chosen.

## What I'm doing about it

To minimize the brand-consistency damage while honoring the decision:

1. **Inline HTML comments** in the rebuilt page mark each unsourced stat with a `TODO source` comment so the next editor sees the gap immediately.
2. **The QC report** for this page logs all four numbers in the "unsourced claims" register, status "approved-by-stakeholder-override (see /decisions/2026-05-03-commercial-roofing-stats-override.md)."
3. **The delivery manifest** for this page sets `every_claim_sourced_or_marked: override` rather than the usual `pass`, and links to this decision file.
4. **A follow-up task** for the next time we pull real data from the client: reconcile home page (16 states / 25+ yrs / 10M+ sq ft) with commercial pillar (42 states / 30+ yrs / 15M+ sq ft). Whichever set is correct, both pages get the same set on the next pass. Track in the build backlog.

## What I'm NOT doing

I am **not** silently aligning the home page to the new numbers. That would be doing the same hard-gate violation in two places instead of one and would also make today's ship look like a "stats refresh" when it's actually an unverified copy carryover from a Figma comp.

## Reversal cost

Low if caught quickly. The four stats live in one component on one page. A single PR replaces them. The reputational cost of a procurement officer noticing the contradiction is harder to undo, but it's an information-asymmetry risk, not a structural one.

## Trigger for re-review

When Chris obtains the client's actual operating numbers (sq ft installed, client retention, founding year, states licensed), this decision is superseded by whatever those numbers say. Update both the home page and the commercial pillar in the same PR. Delete this file when both are reconciled.
