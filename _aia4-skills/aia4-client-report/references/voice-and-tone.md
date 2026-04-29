# Voice & Tone Reference

Read this before finalizing any prose in an AIA4 client report. This file is the anti-slop gate. If a paragraph fails any check here, rewrite it.

## The voice in one line

An AIA4 report reads like a confident senior director handing a client a decision, not a consultant handing a client a menu.

## The five tone anchors

**Confident without being cocky.** State the finding. Explain the reasoning. Don't hedge with "perhaps" and "might" unless you're flagging genuine uncertainty. Hedging reads as cover-your-ass behavior, and clients smell it.

**Specific without being jargon-heavy.** Use concrete numbers, named competitors, named tools, real percentages. Avoid consultant vocabulary ("synergy," "leverage," "best-in-class") and tech vocabulary that obscures instead of informs. A CFO should be able to read the report and a head of marketing should be able to read the report — both should feel it was written for them.

**Unsentimental about tradeoffs.** Every recommendation has a cost. Name it. A recommendation that pretends to have no downside is not a recommendation, it's a sales pitch, and clients know the difference.

**Revenue-anchored, not activity-anchored.** Measure everything by the number at the bottom of the client's P&L. "Increase organic sessions 40%" is activity. "Add an estimated $820K in qualified pipeline per year based on the conversion model below" is revenue. Both might be true. Only the second one matters in a report.

**Short where possible, long only where it pays for itself.** Every sentence earns its place. Delete the ones that don't. A 12-page report the client actually reads is worth more than a 40-page report they skim.

## Forbidden words and phrases

Cut these on sight. If any of them appear in a draft, rewrite the sentence.

**Consultant clichés:**
- "synergy" / "synergies"
- "best-in-class" / "world-class" / "next-gen"
- "leverage" as a verb (use "use," "apply," "exploit," "turn into")
- "robust solution"
- "delight the user" / "delight the customer"
- "holistic approach"
- "actionable insights" (say what the action is instead)
- "at the end of the day"
- "move the needle"
- "low-hanging fruit"
- "game-changer" / "game-changing"
- "paradigm shift"
- "circle back"
- "boil the ocean"
- "in the weeds"
- "north star" is permitted ONLY when naming a specific strategic north star — never as a generic "guiding principle"

**Opening phrases that betray AI authorship:**
- Any sentence beginning with "In today's fast-paced world"
- Any sentence beginning with "In an increasingly [anything]"
- "It's important to note that..."
- "It's worth mentioning that..."
- "As we all know..."
- "In recent years..."
- "Amidst the ever-evolving landscape of..."

**Vague value claims:**
- "Significant improvement" (quantify it)
- "Enhanced performance" (name the metric)
- "Streamlined workflow" (say which steps go away)
- "Strategic alignment" (with what, to what end?)
- "Unlock value" (what value, how much, by when?)

**Hedging language (unless flagging real uncertainty):**
- "It may be beneficial to consider..."
- "One could argue that..."
- "There is potential for..."
- "Consider exploring..."
- "It might be worth looking into..."

## Anti-slop checklist

Run every draft against this before shipping. These are the patterns that betray AI authorship and destroy the credibility of the work.

1. **No restating the question.** If the report is about SEO, don't open by explaining what SEO is. The client already knows.

2. **No summarizing the summary.** Don't end with "In conclusion, we have found that..." — the reader just read it.

3. **No "on one hand, on the other hand" balance where a decision is needed.** Pick a side. If both sides genuinely matter, say which one wins and why.

4. **No em-dash abuse.** Em dashes are fine — one per paragraph, maximum. Three em dashes in a paragraph is the single loudest tell of AI authorship in 2026.

5. **No tricolon abuse.** "Clear, concise, and compelling." "Plan, build, and measure." "Research, analyze, and recommend." A tricolon is a rhetorical device; it loses power when used more than once per page.

6. **No bullet lists where prose works.** Bullets are for genuine lists (features, steps, options). They're not for hiding the fact that you didn't want to write a paragraph. If a "bullet" is three full sentences long, it wanted to be a paragraph. Let it.

7. **No citation theater.** Don't cite sources that don't actually support the claim. Don't link to a source the reader can't verify. Don't fabricate statistics. If you don't have the number, say you don't have the number.

8. **No passive voice where an actor matters.** "Mistakes were made" tells the reader nothing. "The previous agency missed the Core Web Vitals regression in May" tells them everything.

9. **No consultant-speak substitutes for actual thinking.** "Align stakeholders around a shared vision" usually means "run a meeting." Say what the meeting is for and who's in it.

10. **No sentences that could appear in any report for any client.** If a paragraph would work as-is for a roofing company, a law firm, and a SaaS startup, it's too generic. Rewrite it with details that could only apply to *this* client.

## Do / don't examples

### Executive summary opener

**Don't:**
> In today's rapidly evolving digital landscape, Pro Exteriors faces both unprecedented challenges and significant opportunities. This comprehensive report leverages our extensive research and best-in-class competitive analysis to deliver actionable insights that will move the needle on key business outcomes.

Why it fails: four consultant clichés, no specifics, no decision, no number, opens with a forbidden phrase, restates the fact that this is a report.

**Do:**
> Pro Exteriors has a website that costs roughly $14K/year to maintain and returns almost no qualified leads. Three of the top four commercial roofing competitors in the DFW metro rank for buyer-intent keywords Pro Exteriors doesn't even show up for. The recommendation in this report is a full rebuild on Next.js with an organic-first content strategy, a projected 18-month payback, and a conservative Year-1 uplift of $620K in qualified pipeline. The rest of the report is the evidence and the plan.

Why it works: opens with a concrete cost, names the competitive reality, states the recommendation up front, gives a number, tells the reader what the rest of the document is for.

### Recommendation phrasing

**Don't:**
> Consider exploring the implementation of a comprehensive SEO strategy to unlock significant organic traffic growth and drive meaningful business impact.

Why it fails: hedges ("consider exploring"), vague verbs ("implementation of"), buzzwords ("comprehensive," "meaningful"), unquantified value ("significant growth"), no owner, no timeline.

**Do:**
> Ship the 12 commercial-intent pillar pages identified in Appendix B by end of Q3. Based on current ranking positions and search volume, this should add ~4,100 monthly organic sessions and ~62 qualified leads per month within 6 months of launch. Owner: marketing team (content) + AIA4 (technical SEO + measurement).

Why it works: imperative verb ("ship"), specific deliverable ("12 pillar pages"), a deadline, a number, owners, and a reference to the supporting appendix.

### Competitor callout

**Don't:**
> Several competitors in the space are making strategic investments in their digital presence, which may present a competitive threat over time.

Why it fails: vague ("several," "making investments," "over time"), no names, no specifics, no threat a CFO could act on.

**Do:**
> Two competitors matter here. Baker Roofing rebuilt their site on Webflow in Q2 and now ranks in the top 3 for "commercial roofing Dallas" — a keyword that drives an estimated 2,400 searches/month. Jackson Commercial Roofing added a 40-page resource center in January and their domain authority jumped from 22 to 38 in six months. Both are still behind Pro Exteriors on brand recognition, but neither of them is now behind on search.

Why it works: names two specific competitors, cites specific moves with dates, includes real metrics, ends with a framing that acknowledges where Pro Exteriors is still ahead while being honest about where they're now behind.

## One final rule

Read the draft out loud. If a sentence makes you cringe, the client will cringe too. If a paragraph has five adjectives and no verbs, it's decoration, not communication. If a recommendation doesn't tell the reader what to do on Monday morning, it isn't a recommendation. Fix it before shipping.
