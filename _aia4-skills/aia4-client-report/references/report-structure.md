# Report Structure Reference

Every AIA4 client report follows a seven-section spine. This file explains each section, *why it exists*, and how to adapt it when the report type or audience calls for a variation. Read the "why" before you deviate — the structure is deliberate, not decorative.

## Why a fixed spine at all

Reports that reinvent their structure every time feel like bespoke artifacts — and bespoke is expensive to produce, inconsistent in quality, and impossible to compare across engagements. A consistent spine does three things for us simultaneously: it lets a returning client know exactly where to find what they need, it lets AIA4 produce reports faster without lowering quality, and it lets the brand accrete across deliverables (the third SEO audit a client reads from us should *feel* like the same voice as the first competitive brief).

The spine is not a straitjacket. Sections can shrink or expand, but the order and the intent behind each section should hold.

## The seven sections

### 1. Cover sheet

The cover sheet is not a section in the traditional sense — it's the first thing the client sees and it's where the brand impression is made. Full spec lives in `cover-sheet-spec.md`. Do not skip it.

**Why it exists:** A report without a cover sheet looks like a draft. A report *with* a well-built cover sheet signals the work is finished, the agency is serious, and the client can forward it internally without apologizing for the formatting. The AIA4 logo, the engagement lockup, the author line, and the date together create the frame that makes everything else feel credible.

### 2. Executive summary

One page maximum. The executive summary is a decision document, not a preview of the report. A CEO who reads only this section should be able to nod and approve the recommendation without reading another word. Everything that follows is evidence.

**Structure of the executive summary itself:**

- **Paragraph 1 — The situation in one sentence.** Where is the client, what are they trying to do, what's the constraint? No throat-clearing.
- **Paragraph 2 — The finding in two sentences.** What did the research reveal that matters? Lead with the most uncomfortable truth if there is one — uncomfortable truths earn trust faster than flattering ones.
- **Paragraph 3 — The recommendation with a number.** What should the client do? What will it cost? What will it return? Use ranges where specifics aren't available, but always include a number.
- **Paragraph 4 — The ask.** What decision does the client need to make, and by when? Reports that don't ask for a decision leave the client adrift.

**Why it exists:** The overwhelming majority of stakeholders who receive a report will read the executive summary and nothing else. Writing the summary as if it were a movie trailer ("here are the themes you'll encounter inside") is a waste of everyone's time. Writing it as a standalone decision document forces clarity on the entire report.

### 3. Situation

One page. Describes where the client stands today — the facts of the business, the facts of the market, the facts of their digital presence, whatever is relevant to the topic of the report. No opinions yet.

**Why it exists:** You can't prescribe without a diagnosis, and you can't diagnose without agreeing on the facts first. The situation section creates a shared factual baseline between AIA4 and the client so that later sections aren't arguing over whether the sky is blue.

**How to write it:** Past-tense or present-tense facts only. Numbers, dates, tools in use, revenue mix, conversion rate, traffic, team size, tech stack — whatever is load-bearing for the report topic. Cite every external number. If a fact is disputed or uncertain, say so explicitly.

### 4. Gap analysis

This is the most important section for most AIA4 reports, and it's the section where a generic report most obviously fails. The structure depends entirely on whether the client is chasing the category leader or IS the category leader. See `gap-analysis-framework.md` for the two-mode framework and worked examples.

**Why it exists:** The entire value proposition of an AIA4 report is that we tell the client where they stand relative to the competitive reality. A report that shows the client only their own numbers and not their competitors' numbers is a mirror, not a map. Clients can read their own analytics themselves — they hire AIA4 for the comparison.

**Length:** 2–4 pages depending on the report. Longer gap analyses tend to include more competitors; shorter ones focus on the two or three that matter most.

### 5. Brand-lens insights

The research produces data points. This section converts data points into insights by connecting them to the client's stated brand, vision, mission, and positioning. See `brand-lens-filter.md` for the filtering logic.

**Why it exists:** A finding that isn't connected to what the client cares about strategically is just a fact. Insights are facts filtered through a point of view. The client's brand lens is the only point of view that matters in a client report — AIA4's opinions are relevant only insofar as they align with or productively challenge the client's.

**Structure of this section:** 3–5 insights maximum. Each insight is (a) the finding, (b) the brand-lens connection, (c) the strategic implication. Keep each insight to a paragraph or two. More than 5 insights means some of them aren't really insights.

### 6. Recommendations

Ordered by expected revenue impact, highest first. Each recommendation is phrased as an imperative with an owner, a timeline, and a quantified return.

**Why it exists:** The client hired AIA4 to tell them what to do, not to present a range of options and let them figure it out. A recommendation is a direction with conviction behind it. If there are genuine forks in the road, present them — but in each fork, say which way we'd go and why.

**Structure of each recommendation:**
1. The imperative verb + what to do (one sentence)
2. The expected revenue or profitability impact (one sentence with a number or range)
3. The cost to execute (money, time, team)
4. The owner and deadline
5. The dependency chain — what has to be true for this to work

**How many recommendations:** 3–7. Three is fine for a focused report; seven is the ceiling before the client gets analysis paralysis. If there are more than seven, the skill should fold smaller items into the appendix and leave only the top seven in the body.

### 7. Next steps & measurement

Two things live here: the immediate next actions (who does what this week), and the measurement plan (how we'll know in 30 / 90 / 180 days whether the recommendation is working).

**Why it exists:** Reports without next steps turn into shelfware. Reports without measurement plans let everyone involved forget what was promised. Neither is acceptable — AIA4 bills on performance, and the measurement plan is literally how we get paid.

**Structure:**
- **Next actions (this week):** A short list of specific commitments. Each one has an owner and a due date. Differentiate between AIA4 actions and client actions so nothing sits in the ambiguous middle.
- **Measurement plan:** The metrics that will tell us whether the recommendation is working. For each metric, include the baseline (today's number), the 30-day target, the 90-day target, and the 180-day target. If a metric doesn't have a baseline yet, name who's going to establish it and by when.

## Appendices

Optional, but common. Appendices hold the evidence that supports the body of the report — full competitor tables, keyword lists, ranking data, screenshots, survey verbatims, methodology notes, references.

**Rule for appendices:** Every claim in the body should point to its supporting evidence in the appendix. Every appendix item should be referenced from the body. Orphaned appendix content that nothing in the body points to should be cut — it's padding.

## Variations by report type

The spine holds for most reports, but these are the common variations:

**Short-form one-pagers and leave-behinds:** Collapse sections 2, 3, and 4 into a single "Situation & Gap" page. Keep sections 5, 6, and 7. Skip appendices. Cover sheet on its own page.

**Strategy briefs:** Expand section 5 (brand-lens insights) into two subsections — strategic implications and creative implications — because the downstream audience for a strategy brief is both strategists and creatives and they have different information needs.

**Audit reports (SEO, CRO, accessibility, performance):** Expand section 3 (situation) into a detailed findings section. Recommendations (section 6) should be organized by impact tier (quick wins / medium effort / strategic investments).

**Board-level decks:** Cover sheet, executive summary, and recommendations get the weight. Gap analysis and brand-lens insights compress into 2–3 slides each. Appendices become a dedicated "backup" section at the end.

**Performance reports (monthly or quarterly):** Sections 3 and 4 flip — situation becomes "what happened this period," gap analysis becomes "how we're tracking against plan and against competitors." Sections 6 and 7 merge into a single "what changes next period" section.

**Discovery readouts:** Section 2 (exec summary) compresses — discovery doesn't have a recommendation yet. Section 5 (brand-lens insights) expands substantially. Sections 6 and 7 become "recommended next-phase scope."

## One rule that never bends

Every report ends with a decision. Every report. If the report can't end with a decision the client needs to make — approve this, pick between A and B, fund this, kill this — then either the report isn't finished, or the report shouldn't exist yet. Reports without decisions become PDFs on a shared drive that nobody reads a second time, and that is the worst possible outcome for any deliverable AIA4 produces.
