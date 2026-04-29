# Decision: Gstack adoption for the AIA4 Pro Exteriors engagement

**Date:** 2026-04-26
**Author:** Maren Castellan-Reyes, Senior Director, Website & Application Experience
**Status:** Recommendation pending Chris's call. Default is **do not install as-is**.

---

## Context

Chris asked me to clone https://github.com/garrytan/gstack.git, set it up, and decide whether to modify it for the Pro Exteriors engagement. I cloned it and read the README, AGENTS.md, ETHOS.md, package.json, and the setup script.

## What Gstack actually is

Gstack is **not a tech stack** in the Next.js / Tailwind / hosting sense. It's a Claude Code workflow framework from Garry Tan (President of YC) — roughly 30 slash-command skills that structure AI-assisted software delivery as a sprint: think → plan → build → review → test → ship → reflect.

Headline skills include `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, `/design-consultation`, `/design-shotgun`, `/design-html`, `/review`, `/cso`, `/qa`, `/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/retro`, `/document-release`, `/learn`. It also ships its own headless browser (`/browse`, `/open-gstack-browser`), its own optional memory layer (`/learn` + GBrain, a Postgres/PGLite-backed knowledge base with cross-machine sync), and its own design pipeline (`/design-shotgun` generates AI mockup variants → `/design-html` outputs production HTML).

MIT licensed. Free. Well-documented. Built by a credible operator.

## Why not install as-is

1. **Wrong phase.** Roughly 80% of Gstack's value (`/ship`, `/land-and-deploy`, `/canary`, `/benchmark`, `/qa`, `/review`) assumes a git repo with a remote, CI, and a deployed staging URL. We have none of those yet — we're in discovery/strategy. Installing now is setup tax for capability we won't draw against for 2–3 months.
2. **Persona collision.** CLAUDE.md section 2 makes the Maren persona non-negotiable. Gstack's whole framing is "20 specialists on call" (CEO reviewer, EM, designer, QA lead). The first time `/plan-ceo-review` roleplays a different CEO than the one Chris is paying for, we erode voice coherence in deliverables.
3. **Three competing memory systems.** Cowork's memory under `~/Library/Application Support/.../memory/`, the `productivity:memory-management` scheme under `CLAUDE.md`/`memory/`, and Gstack's `/learn` + GBrain. Stacking a third memory home on top is how project context fragments silently.
4. **Browser tool collision is unilateral.** Gstack's CLAUDE.md-injection step explicitly tells Claude to "never use `mcp__claude-in-chrome__*` tools" and route all browsing through `/browse`. That's a takeover of an MCP tool we've already configured, not a coexistence pattern.
5. **Cowork mode mismatch.** Setup is written for the Claude Code CLI: globals at `~/.claude/skills/gstack`, Bun on PATH, persistent browse daemons, MCP registration, optional Conductor parallelism. Cowork is built on Claude Code but the install assumes process lifecycles and globals that won't all behave the same in the Cowork sandbox. Untested.
6. **Skill overlap.** Gstack `/plan-design-review` overlaps `design:design-critique` + `design:accessibility-review`. `/cso` overlaps `operations:risk-assessment` + `operations:compliance-tracking`. `/retro` overlaps `operations:status-report`. `/office-hours` overlaps `aia4-agency:strategy` + `design:user-research`. Two skills fighting for the same trigger phrases is a known foot-gun.
7. **Client-engagement hygiene.** Gstack's opt-in telemetry is minimal (skill name, duration, success/fail, version, OS — explicitly never code or prompts), but on a performance-tied retainer with client material in the workspace, every new outbound data flow gets named and approved before shipping.

## What's worth taking from it

- **`/office-hours` methodology** — six forcing questions before any plan, plus a Confusion Protocol that forbids architectural guesses without asking. Directly portable to our discovery phase.
- **`/plan-ceo-review` modes** — Expansion / Selective Expansion / Hold Scope / Reduction. A clean framework for stakeholder pushback that I'd use verbatim.
- **`/benchmark` discipline** — baseline Core Web Vitals, compare on every change. Already aligned with CLAUDE.md section 4 hard gates; worth formalizing as a project-local skill once we have a staging URL.
- **ETHOS.md "Boil the Lake"** — the marginal cost of completeness is near-zero with AI, so do the complete thing every time. A stance worth writing into our delivery standards regardless of whether we install Gstack.

## Options

### Option A — Cherry-pick now, full install never (recommended)
Extract methodology from `/office-hours`, `/plan-ceo-review`, `/plan-eng-review`, `/plan-design-review`, and `/benchmark` and adapt them as project-local skills under `/_aia4-skills/`. AIA4-flavored, persona-coherent, no toolchain takeover, no memory collision. Estimated 2–3 days of focused work.

### Option B — Install for the engineering build phase only, in a separate dev environment
When we stand up the actual Next.js repo (~Q3), install Gstack into that repo's Claude Code environment (not Cowork) and use `/review`, `/qa`, `/ship`, `/cso`, `/canary`, `/benchmark`, `/document-release` against the live codebase. Strategy/discovery side stays untouched. Revisit at that decision point.

### Option C — Install as-is into this Cowork environment
Not recommended for the reasons above.

## Recommendation

**Option A now, with Option B revisited at engineering kickoff.** This gets us the methodology benefit (which is the part that matters in our current phase) without the toolchain, persona, memory, or browser collisions. We re-evaluate Gstack as a full install once we're in the build phase and on a Claude Code CLI in a code repo, not in Cowork against a strategy folder.

## Reversal cost

- **Option A** — Low. Project-local adapted skills can be deleted, rewritten, or replaced. No external dependencies.
- **Option B** — Low at decision time, moderate after install (uninstall script provided; cleanup is documented).
- **Option C** — Moderate to high. Three memory systems and a browser-tool override would take real work to disentangle once they've leaked into deliverables.

## References

- Repo: https://github.com/garrytan/gstack.git
- Local clone: `/tmp/gstack` (transient, will be cleared on session end)
- README, AGENTS.md, ETHOS.md, setup script reviewed 2026-04-26
- CLAUDE.md sections 2 (persona), 4 (hard gates), 7 (tech defaults), 8 (skill usage map), 9 (never do)
