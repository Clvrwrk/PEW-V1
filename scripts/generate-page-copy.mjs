/**
 * scripts/generate-page-copy.mjs
 *
 * Generates body copy + frontmatter updates for the pages listed in
 * scripts/data/page-keywords.json. Enforces:
 *   - Plan §3.1 5-slot keyword placement (title, description, URL, h1, lede)
 *   - Bottom-of-funnel Title formula: [Keyword] | [Benefit] | Pro Exteriors
 *   - Title ≤60 chars (Zod schema constraint); collapses to 2-part formula
 *     when the 3-part variant overflows
 *   - Description 70-160 chars
 *   - Word count ≥800
 *   - Brand voice rules (no "leverage", "synergy", etc. per CLAUDE.md §2)
 *
 * Inline validation runs after each generation; up to 3 regenerations on
 * rule miss. Pages that fail 3x are flagged for hand-review and NOT written.
 *
 * CLI:
 *   node --env-file=.env scripts/generate-page-copy.mjs
 *   node --env-file=.env scripts/generate-page-copy.mjs --only /commercial-roofing/tpo/
 *   node --env-file=.env scripts/generate-page-copy.mjs --model anthropic/claude-sonnet-4
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import {
  parseFrontmatter,
  fieldContainsKeyword,
  urlContainsKeywordTokens,
  ledeContainsKeyword,
  normalize,
  tokens,
} from './audit-keyword-placement.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const ARGS = process.argv.slice(2);
const ONLY = ARGS.includes('--only') ? ARGS[ARGS.indexOf('--only') + 1] : null;
const MODEL = ARGS.includes('--model')
  ? ARGS[ARGS.indexOf('--model') + 1]
  : 'anthropic/claude-sonnet-4';
const MAX_REGEN = 5;

function getKey() {
  const k = process.env.OPENROUTER_API_KEY;
  if (!k) {
    console.error('OPENROUTER_API_KEY missing. Run with --env-file=.env');
    process.exit(2);
  }
  return k;
}

// ─── Title formula machinery ─────────────────────────────────────────────────

/** Title-Cases the keyword for use in titles/H1s, preserving acronym words like TPO/EPDM. */
function titleCaseKeyword(keyword) {
  const ACRONYMS = new Set(['tpo', 'epdm', 'pvc', 'bur', 'hoa', 'rfq', 'roi', 'sla', 'gaf', 'usa', 'tx', 'ok', 'co', 'mo', 'ks', 'ga']);
  return keyword
    .split(/\s+/)
    .map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()))
    .join(' ');
}

/** Pick a benefit phrase that hasn't been used by an adjacent sibling page. */
function pickBenefit(corpus, vertical, usedSet) {
  const segment = corpus[vertical] ?? corpus.commercial;
  for (const phrase of segment) {
    if (!usedSet.has(phrase)) return phrase;
  }
  // All used — wrap around.
  return segment[Math.floor(Math.random() * segment.length)];
}

/**
 * Build the title per formula. Falls back to 2-part variant when the
 * 3-part variant exceeds 60 chars.
 */
function buildTitle({ keyword, benefit, brand = 'Pro Exteriors' }) {
  const kw = titleCaseKeyword(keyword);
  const threePart = `${kw} | ${benefit} | ${brand}`;
  if (threePart.length <= 60) return { title: threePart, formula: 'three-part', benefitMigrated: false };
  const twoPart = `${kw} | ${brand}`;
  return {
    title: twoPart.length <= 60 ? twoPart : kw.slice(0, 60),
    formula: 'two-part',
    benefitMigrated: true,
  };
}

// ─── Frontmatter serialization (preserves nested faqs/arrays) ────────────────

/** Serialize a value to YAML-ish form for frontmatter. */
function yamlString(s) {
  if (s === undefined || s === null) return '""';
  // Use double quotes; escape inner double quotes.
  return `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function serializeFrontmatter(fm) {
  const order = [
    'title',
    'description',
    'canonicalPath',
    'vertical',
    'slug',
    'name',
    'h1',
    'heroImage',
    'partnerFulfilled',
    'noindex',
    'ogImage',
  ];
  const lines = [];
  for (const key of order) {
    if (fm[key] === undefined) continue;
    if (typeof fm[key] === 'boolean') {
      lines.push(`${key}: ${fm[key]}`);
    } else {
      lines.push(`${key}: ${yamlString(fm[key])}`);
    }
  }
  if (Array.isArray(fm.faqs) && fm.faqs.length) {
    lines.push('faqs:');
    for (const faq of fm.faqs) {
      lines.push(`  - question: ${yamlString(faq.question)}`);
      lines.push(`    answer: ${yamlString(faq.answer)}`);
    }
  }
  if (Array.isArray(fm.relatedServices) && fm.relatedServices.length) {
    lines.push('relatedServices:');
    for (const r of fm.relatedServices) lines.push(`  - ${yamlString(r)}`);
  }
  return lines.join('\n');
}

/** Parse the existing MDX, including faqs (nested) — uses a small YAML reader. */
function parseFullFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: raw };
  const fm = {};
  const lines = m[1].split('\n');
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const kv = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (!kv) {
      i++;
      continue;
    }
    const key = kv[1];
    let value = kv[2].trim();
    // Nested faqs?
    if (key === 'faqs' && value === '') {
      const arr = [];
      i++;
      while (i < lines.length && /^\s+-\s/.test(lines[i])) {
        // Each item starts with "  - question: ..."
        const qLine = lines[i].match(/^\s+-\s+question:\s+(.*)$/);
        if (!qLine) {
          i++;
          continue;
        }
        const aLine = lines[i + 1]?.match(/^\s+answer:\s+(.*)$/);
        const stripQuotes = (v) =>
          v.startsWith('"') && v.endsWith('"') ? v.slice(1, -1) : v;
        arr.push({
          question: stripQuotes(qLine[1].trim()),
          answer: stripQuotes((aLine?.[1] ?? '').trim()),
        });
        i += 2;
      }
      fm.faqs = arr;
      continue;
    }
    // Strip wrapping quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (value === 'true') value = true;
    else if (value === 'false') value = false;
    fm[key] = value;
    i++;
  }
  return { frontmatter: fm, body: m[2] };
}

// ─── Generation ──────────────────────────────────────────────────────────────

const VOICE_BLOCK = `VOICE: confident, specific, unsentimental. Director-level. Strong opinions, loosely held. No hedging ("maybe," "perhaps," "I think"). No marketing fluff.

FORBIDDEN WORDS: "synergy", "best-in-class", "leverage" (as a verb), "world-class", "next-gen", "robust solution", "delight the user", any sentence starting with "In today's fast-paced world".`;

const FIVE_SLOT_BLOCK = `NON-NEGOTIABLE 5-SLOT KEYWORD PLACEMENT:
The primary target keyword MUST appear in:
  1. The PAGE TITLE (frontmatter "title").
  2. The META DESCRIPTION (frontmatter "description"). Description must START with the keyword.
  3. The URL — already enforced by canonicalPath; you don't change this.
  4. The H1 (frontmatter "h1"). H1 must START with the keyword.
  5. The FIRST 5 WORDS of the body lede. The first sentence of the body MUST start with the keyword.`;

const OUTPUT_BLOCK = `OUTPUT: a single JSON object only — no markdown fences, no commentary. Schema:
{
  "title":       string,        // ≤60 chars, follows the title formula provided
  "description": string,        // STRICT 130-160 chars (count them). STARTS with the keyword.
  "h1":          string,        // STARTS with the keyword
  "body":        string,        // MDX body. Word count target stated in the user prompt.
  "faqs": [ { "question": string, "answer": string }, ... ]   // 3-6 entries
}`;

// ─── Page-type system prompts ──────────────────────────────────────────────

const TRANSACTIONAL_SYSTEM = `You are Maren Castellan-Reyes, Senior Director of Website & Application Experience at AIA4 Pro Exteriors. You write SEO-disciplined, conversion-aware body copy for a 80% commercial / 20% residential roofing company headquartered in Texas.

${VOICE_BLOCK}

${FIVE_SLOT_BLOCK}

${OUTPUT_BLOCK}

WORD COUNT IS HARD: Body must be at least 850 words. Validators reject pages under 800 words. Hit the per-section minimums below; if you finish early, expand each section to its upper bound rather than ending short.

BODY STRUCTURE — hit each section at the upper end of its range so total clears 850 words:
  - Lede paragraph (80-100 words). FIRST SENTENCE STARTS WITH THE KEYWORD. Then 2-3 more sentences.
  - ## Why Pro Exteriors for [topic] (180-220 words, 3 substantial paragraphs)
  - ## What [topic] actually involves (250-300 words covering scope, materials, partners, project sequence)
  - ## How we serve [primary geography] (130-170 words, mentions Dallas-Fort Worth + 2-3 service-area cities + service-area specifics)
  - ## Our process (140-180 words, numbered 4-6 step list with substantive description per step, ends with a CTA hook)
  - ## Closing — Request a quote (70-90 words, ends with explicit CTA appropriate to vertical)

Mention real material partners by name where relevant: GAF, Carlisle, Versico, CertainTeed, Atlas, Soprema, Duro-Last, FiberTite, McElroy Metal, Sentrigard, Manta. Don't invent partners.

Cross-link discipline (CONTAINMENT): links inside the body MUST stay within the same vertical. Commercial pages link only to other commercial pages. Residential pages link only to other residential pages. Use descriptive keyword-rich anchor text — never "click here" or "learn more".`;

const OFFICE_SYSTEM = `You are Maren Castellan-Reyes, Senior Director of Website & Application Experience at AIA4 Pro Exteriors. You write GBP-aligned office/location pages for a roofing company.

${VOICE_BLOCK}

${FIVE_SLOT_BLOCK}

${OUTPUT_BLOCK}

Word count: 600-750 words — office pages are GBP destinations, not editorial. Be specific to this office's metro and service area.

BODY STRUCTURE:
  - Lede (60-80 words). FIRST SENTENCE STARTS WITH THE KEYWORD.
  - ## Service area from this office (140-180 words; reference real neighborhoods/sub-markets the metro covers)
  - ## Two doors, one office — commercial + residential (140-180 words; explain how this office serves both verticals with descriptive links to /commercial-roofing/ and /residential-roofing/)
  - ## What we install and repair from here (120-160 words; mention 4-6 services)
  - ## Visit or call (60-90 words; closes with the office address + a CTA to /contact/)

Do NOT alter the office's address/hours/phone — those are in frontmatter elsewhere and must remain canonical.`;

const SUBDIVISION_SYSTEM = `You are Maren Castellan-Reyes, Senior Director of Website & Application Experience at AIA4 Pro Exteriors. You write Property First, place-memory subdivision pages.

${VOICE_BLOCK}

${FIVE_SLOT_BLOCK}

${OUTPUT_BLOCK}

Word count: 850-1100 words. This is the strongest place-memory expression in the IA — every paragraph should signal that we know this specific subdivision intimately.

BODY STRUCTURE:
  - Lede (80-100 words). FIRST SENTENCE STARTS WITH THE KEYWORD. Establishes specific local knowledge.
  - ## HOA-aware roofing in [subdivision] (180-220 words; reference architectural review, approved colors, contractor approval timelines)
  - ## Storm + hail history (140-180 words; reference recent storm events, neighborhood-level damage patterns)
  - ## Homes we have already served here (140-180 words; reference Pro Exteriors job markers anonymously, no addresses)
  - ## Materials we recommend for [subdivision] homes (160-200 words; mention 2-3 real partners + product lines)
  - ## Closing CTA (70-90 words; closes with /contact/?vertical=residential and /property-card/)`;

const PILLAR_SYSTEM = `You are Maren Castellan-Reyes, Senior Director of Website & Application Experience at AIA4 Pro Exteriors. You write topical pillar pages that anchor a Reverse Silo of supporting blog posts.

${VOICE_BLOCK}

${FIVE_SLOT_BLOCK}

${OUTPUT_BLOCK}

Word count: 350-500 words — a pillar page introduces a topic cluster; the supporters are where the long-form depth lives.

BODY STRUCTURE:
  - Lede (80-120 words). FIRST SENTENCE STARTS WITH THE KEYWORD. Frames the topic cluster.
  - ## What this pillar covers (140-180 words; outline the 3-5 topics the supporters address)
  - ## How to use this pillar (90-120 words; signal who this is for — commercial buyers vs homeowners — and what they should read first)`;

const BLOG_SUPPORTER_SYSTEM = `You are Maren Castellan-Reyes, Senior Director of Website & Application Experience at AIA4 Pro Exteriors. You write Kyle Roof Reverse Silo supporter blog posts.

${VOICE_BLOCK}

${FIVE_SLOT_BLOCK}

${OUTPUT_BLOCK}

Word count: 850-1100 words. AIM FOR 900+ WORDS. Validators reject pages under 700 words.

KYLE ROOF SILO DISCIPLINE — NON-NEGOTIABLE:
- The body MUST contain EXACTLY ONE link UP to the silo_target URL provided. The anchor text for that link MUST be the silo_target_anchor provided exactly (case-insensitive). Place this link mid-body in a substantive paragraph.
- The body MUST contain EXACTLY ONE link to each silo_sibling URL provided, using the sibling anchor text given. Place sibling links contextually — never as a "related posts" list.
- The body MUST NOT contain ANY other internal links. ZERO. NO EXCEPTIONS. No links to /contact/, no /about/, no /residential-roofing/*, no /commercial-roofing/*, no other /blog/* posts not in silo_siblings. The ONLY links allowed are silo_target and silo_siblings. A closing CTA sentence is fine but must NOT be a markdown link — just text like "Contact Pro Exteriors for...".
- Anchor discipline: descriptive, keyword-rich. NEVER "click here", "learn more", "read more", or bare URLs.
- Use markdown link syntax exactly: [anchor text](URL).

BODY STRUCTURE:
  - Lede (80-100 words). FIRST SENTENCE STARTS WITH THE KEYWORD.
  - ## [topic-specific H2] (180-220 words)
  - ## [topic-specific H2] (180-220 words; place the silo_target link inside this section with the silo_target_anchor)
  - ## [topic-specific H2] (180-220 words; place each silo_sibling link inside this section)
  - ## Closing recommendation (90-120 words)`;

function systemPromptForPageType(pageType) {
  switch (pageType) {
    case 'office': return OFFICE_SYSTEM;
    case 'subdivision': return SUBDIVISION_SYSTEM;
    case 'pillar': return PILLAR_SYSTEM;
    case 'blog-supporter': return BLOG_SUPPORTER_SYSTEM;
    case 'transactional':
    default: return TRANSACTIONAL_SYSTEM;
  }
}

function buildUserPrompt({ page, benefit, formulaPreview, existingFaqs, geography, formulaResult }) {
  const { keyword, vertical, canonicalPath, pageType } = page;
  const ctaUrl = vertical === 'commercial' ? '/contact/?vertical=commercial' : vertical === 'residential' ? '/contact/?vertical=residential' : '/contact/';
  const linkAllowance =
    pageType === 'blog-supporter'
      ? `LINKS ALLOWED: ONLY the silo_target and silo_siblings listed below. Nothing else.`
      : pageType === 'office'
        ? `LINKS ALLOWED: /commercial-roofing/, /residential-roofing/, /contact/, /locations/. Use descriptive anchors.`
        : pageType === 'pillar'
          ? `LINKS ALLOWED: only the parent vertical hub (/${vertical}-roofing/) plus a single CTA to /contact/. The pillar's supporter list is rendered automatically by the page template — do NOT include supporter links manually.`
          : `LINKS ALLOWED: same-vertical siblings (/${vertical}-roofing/[sibling]/), /contact/, /proplan/, /projects/. NO cross-vertical body links.`;

  let siloBlock = '';
  if (pageType === 'blog-supporter' && page.silo_target) {
    const siblings = (page.silo_siblings ?? [])
      .map((s) => `  - URL: ${s.url}  (anchor: "${s.anchor}")`)
      .join('\n');
    siloBlock = `\nKYLE ROOF SILO WIRING
----------------------
silo_target URL:    ${page.silo_target}
silo_target_anchor: "${page.silo_target_anchor}"
silo_siblings:
${siblings}

The body MUST place EXACTLY ONE link to silo_target with the silo_target_anchor as the anchor text. Place it mid-body. The body MUST also contain EXACTLY ONE link to each sibling URL above with the given anchor. NO other internal links of any kind.`;
  }

  return `PAGE BRIEF
==========
Primary target keyword: "${keyword}"
Page type: ${pageType}
Vertical: ${vertical}
Canonical URL: ${canonicalPath}
Service / page name: ${page.name ?? canonicalPath}
Service area / geography: ${geography}

TITLE FORMULA (must result in title ≤60 chars; if longer, drop the benefit slot and migrate it to the description):
  ${formulaPreview}

CONSTRAINTS RECAP
- Title: must contain "${keyword}", ≤60 chars total.
- Description: must START with "${keyword}", 70-160 chars total. If the title was forced to drop the benefit slot, work the benefit "${benefit}" into the description's lede.
- H1: must START with "${keyword}".
- Body lede first sentence: must START with "${keyword}".
- ${linkAllowance}
- 3-6 FAQs that address realistic buyer objections for this page type and vertical.
- Closing CTA goes to ${ctaUrl}.
${siloBlock}

EXISTING FAQS TO IMPROVE OR REPLACE (you may keep, rewrite, or replace):
${existingFaqs?.length ? existingFaqs.map((f, i) => `  ${i + 1}. Q: ${f.question}\n     A: ${f.answer}`).join('\n') : '  (none — generate fresh)'}

OUTPUT: a single JSON object matching the schema in the system prompt. No markdown fences. No commentary.`;
}

async function callOpenRouter({ system, user, model = MODEL, maxTokens = 8000 }) {
  const key = getKey();
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://pc-demo.cleverwork.io',
      'X-Title': 'AIA4 Pro Exteriors copy gen',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: user },
      ],
      max_tokens: maxTokens,
      temperature: 0.55,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 400)}`);
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error('OpenRouter: empty content');
  return { content, model: json.model, usage: json.usage };
}

/** Strip code fences and parse JSON, lenient. */
function parseModelJSON(content) {
  let cleaned = content.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  // Some models still emit "Here's the JSON:" prefixes
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace > 0) cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  return JSON.parse(cleaned);
}

// ─── Validation ──────────────────────────────────────────────────────────────

const FORBIDDEN_BRAND_WORDS = [
  /\bsynergy\b/i,
  /\bbest-in-class\b/i,
  /\bworld-class\b/i,
  /\bnext-gen\b/i,
  /\brobust solution\b/i,
  /\bdelight the user\b/i,
  /\bin today's fast-paced world/i,
];

const FORBIDDEN_LINK_ANCHORS = ['click here', 'learn more', 'read more', 'more info'];

/** Trim the description to 160 chars at the last sentence boundary if possible. */
function smartTrimDescription(desc, maxLen = 160) {
  if (desc.length <= maxLen) return desc;
  const cut = desc.slice(0, maxLen);
  // Prefer ending on a period within the last 40 chars; otherwise on a space.
  const lastPeriod = cut.lastIndexOf('.');
  if (lastPeriod >= maxLen - 40) return cut.slice(0, lastPeriod + 1);
  const lastSpace = cut.lastIndexOf(' ');
  if (lastSpace > 60) return cut.slice(0, lastSpace).replace(/[,;:\-\s]+$/, '') + '.';
  return cut;
}

/** Page-type-aware word-count limits. Keep tied to system prompt ranges. */
function wordCountLimits(pageType) {
  switch (pageType) {
    case 'office':         return { min: 480, max: 850 };
    case 'pillar':         return { min: 320, max: 600 };
    case 'subdivision':    return { min: 800, max: 1300 };
    case 'blog-supporter': return { min: 700, max: 1300 };
    case 'transactional':
    default:               return { min: 750, max: 1300 };
  }
}

function validateGenerated({ generated, page, benefit, formulaResult }) {
  const issues = [];
  // Auto-trim over-length description before validating (post-process step).
  if (generated.description && generated.description.length > 160) {
    generated.description = smartTrimDescription(generated.description, 160);
  }
  const { title, description, h1, body, faqs } = generated;

  // Schema sanity
  if (!title || !description || !h1 || !body) {
    issues.push('Missing required field (title/description/h1/body).');
    return { ok: false, issues };
  }

  // Title length
  if (title.length > 60) issues.push(`Title length ${title.length} exceeds 60 chars.`);
  if (title.length < 10) issues.push(`Title length ${title.length} below 10 chars.`);

  // Description length
  if (description.length < 70) issues.push(`Description length ${description.length} below 70 chars.`);
  if (description.length > 160) issues.push(`Description length ${description.length} exceeds 160 chars.`);

  // 5-slot keyword placement
  if (!fieldContainsKeyword(title, page.keyword)) issues.push('Slot 1 MISS: keyword not in title.');
  if (!fieldContainsKeyword(description, page.keyword)) issues.push('Slot 2 MISS: keyword not in description.');
  // Slot 3: skip for office/brand pages where keyword is brand-name ("Pro Exteriors X") and URL is /locations/x/
  const skipSlot3 = page.pageType === 'office' || page.vertical === 'brand';
  if (!skipSlot3 && !urlContainsKeywordTokens(page.canonicalPath, page.keyword)) issues.push('Slot 3 MISS: keyword tokens not in URL.');
  if (!fieldContainsKeyword(h1, page.keyword)) issues.push('Slot 4 MISS: keyword not in h1.');
  if (!ledeContainsKeyword(body, page.keyword)) issues.push('Slot 5 MISS: keyword not in first 5 words of body lede.');

  // Title formula compliance
  if (formulaResult.formula === 'three-part') {
    const parts = title.split('|').map((p) => p.trim());
    if (parts.length !== 3) issues.push(`Title formula MISS: expected 3-part, got "${title}".`);
    else if (parts[2].toLowerCase() !== 'pro exteriors') issues.push(`Title formula MISS: brand suffix not "Pro Exteriors", got "${parts[2]}".`);
  } else if (formulaResult.formula === 'two-part') {
    if (!title.includes('|')) issues.push(`Title formula MISS: expected 2-part with pipe, got "${title}".`);
  }

  // Body word count (page-type aware)
  const wordCount = body.split(/\s+/).filter(Boolean).length;
  const wcLimits = wordCountLimits(page.pageType);
  if (wordCount < wcLimits.min) issues.push(`Body word count ${wordCount} below ${wcLimits.min} for ${page.pageType}.`);
  if (wordCount > wcLimits.max) issues.push(`Body word count ${wordCount} above ${wcLimits.max} for ${page.pageType}.`);

  // Forbidden brand words
  for (const re of FORBIDDEN_BRAND_WORDS) {
    if (re.test(body) || re.test(description) || re.test(title)) {
      issues.push(`Forbidden brand word matched: ${re}`);
    }
  }

  // Forbidden link anchors
  for (const anchor of FORBIDDEN_LINK_ANCHORS) {
    const re = new RegExp(`\\[${anchor}\\]\\(`, 'i');
    if (re.test(body)) issues.push(`Forbidden link anchor: "${anchor}"`);
  }

  // Cross-vertical containment (commercial pages must not link to /residential-roofing/)
  if (page.vertical === 'commercial' && /\]\(\s*\/residential-roofing\//i.test(body)) {
    issues.push('Containment MISS: commercial page links to /residential-roofing/ in body.');
  }
  if (page.vertical === 'residential' && /\]\(\s*\/commercial-roofing\//i.test(body)) {
    issues.push('Containment MISS: residential page links to /commercial-roofing/ in body.');
  }

  // Kyle Roof silo discipline for blog supporters
  if (page.pageType === 'blog-supporter') {
    const silo = countMarkdownLinks(body, page.silo_target);
    if (silo !== 1) issues.push(`Kyle Roof MISS: expected exactly 1 link to silo_target ${page.silo_target}, found ${silo}.`);
    for (const sib of page.silo_siblings ?? []) {
      const cnt = countMarkdownLinks(body, sib.url);
      if (cnt !== 1) issues.push(`Kyle Roof MISS: expected exactly 1 link to sibling ${sib.url}, found ${cnt}.`);
    }
    // Anchor for silo_target must match (loosely) the silo_target_anchor
    const anchorRe = new RegExp(`\\[([^\\]]+)\\]\\(\\s*${page.silo_target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\)`, 'i');
    const am = body.match(anchorRe);
    if (am && !normalize(am[1]).includes(normalize(page.silo_target_anchor))) {
      issues.push(`Kyle Roof MISS: silo_target anchor was "${am[1]}", expected to contain "${page.silo_target_anchor}".`);
    }
    // Forbid any other internal links (paths starting with /) on supporter pages
    const allLinkUrls = [...body.matchAll(/\]\(\s*([^)\s]+)\s*\)/g)].map((m) => m[1]).filter((u) => u.startsWith('/'));
    const allowed = new Set([page.silo_target, ...(page.silo_siblings ?? []).map((s) => s.url)]);
    for (const u of allLinkUrls) {
      const norm = u.endsWith('/') ? u : u + '/';
      const aWithSlash = u.endsWith('/') ? u : u + '/';
      if (!allowed.has(u) && !allowed.has(norm) && !allowed.has(aWithSlash)) {
        issues.push(`Kyle Roof MISS: forbidden body link on supporter — ${u}`);
      }
    }
  }

  // FAQs
  if (!Array.isArray(faqs) || faqs.length < 3) {
    issues.push(`FAQ count ${faqs?.length ?? 0} below 3.`);
  }

  return { ok: issues.length === 0, issues, wordCount };
}

/** Count markdown link occurrences pointing at a specific path (with or without trailing slash). */
function countMarkdownLinks(body, url) {
  const norm = url.replace(/\/$/, '');
  const re = new RegExp(`\\]\\(\\s*${norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/?\\s*\\)`, 'g');
  return (body.match(re) ?? []).length;
}

// ─── MDX writing ─────────────────────────────────────────────────────────────

function buildMDX({ frontmatter, body }) {
  return `---\n${serializeFrontmatter(frontmatter)}\n---\n\n${body.trim()}\n`;
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const cfgPath = resolve(REPO_ROOT, 'scripts/data/page-keywords.json');
  const cfg = JSON.parse(await readFile(cfgPath, 'utf8'));

  const corpusPath = resolve(REPO_ROOT, 'scripts/data/title-benefit-phrases.json');
  const corpus = JSON.parse(await readFile(corpusPath, 'utf8'));

  let pages = cfg.pages;
  if (ONLY) {
    pages = pages.filter((p) => p.canonicalPath === ONLY);
    if (pages.length === 0) {
      console.error(`--only ${ONLY} matched no pages`);
      process.exit(2);
    }
  }

  console.log(`Generating copy for ${pages.length} page(s) via ${MODEL}`);
  console.log('============================================================');

  // Track used benefit phrases per vertical so adjacent siblings differ.
  const usedBenefits = {};
  const summary = [];

  for (const page of pages) {
    const mdxPath = resolve(REPO_ROOT, page.mdxPath);
    let mdxRaw;
    try {
      mdxRaw = await readFile(mdxPath, 'utf8');
    } catch (err) {
      console.error(`[${page.canonicalPath}] cannot read MDX: ${err.message}`);
      summary.push({ page: page.canonicalPath, ok: false, reason: 'read-error' });
      continue;
    }
    const { frontmatter: existingFM, body: _existingBody } = parseFullFrontmatter(mdxRaw);

    // Pick a benefit not used yet on adjacent siblings. For city pages, draw
    // from the city-{vertical} segment so phrasing fits the city context.
    const corpusKey =
      page.pageType === 'subdivision' ? 'subdivision'
      : page.pageType === 'office' ? page.vertical
      : page.pageType === 'blog-supporter' ? page.vertical
      : page.pageType === 'pillar' ? page.vertical
      : page.canonicalPath.includes('/commercial-roofing/') && /[a-z]+-?[a-z]*\/$/.test(page.canonicalPath) && !['/commercial-roofing/tpo/', '/commercial-roofing/epdm/', '/commercial-roofing/metal/', '/commercial-roofing/flat-roof-systems/', '/commercial-roofing/repair/', '/commercial-roofing/replacement/'].includes(page.canonicalPath)
        ? 'city-commercial'
      : page.canonicalPath.includes('/residential-roofing/') && /[a-z]+-?[a-z]*\/$/.test(page.canonicalPath) && !['/residential-roofing/asphalt-shingles/', '/residential-roofing/replacement/', '/residential-roofing/inspection/', '/residential-roofing/emergency/', '/residential-roofing/metal/', '/residential-roofing/storm-damage/'].includes(page.canonicalPath)
        ? 'city-residential'
      : page.vertical;
    const usedSet = (usedBenefits[corpusKey] ??= new Set());
    const benefit = pickBenefit(corpus, corpusKey, usedSet);
    usedSet.add(benefit);

    const formulaResult = buildTitle({ keyword: page.keyword, benefit });
    const formulaPreview =
      formulaResult.formula === 'three-part'
        ? `${titleCaseKeyword(page.keyword)} | ${benefit} | Pro Exteriors`
        : `${titleCaseKeyword(page.keyword)} | Pro Exteriors  (benefit "${benefit}" must appear in description instead because the 3-part variant exceeded 60 chars)`;

    const sysPrompt = systemPromptForPageType(page.pageType ?? 'transactional');
    const userPrompt = buildUserPrompt({
      page: { ...page, name: existingFM.name ?? page.canonicalPath },
      benefit,
      formulaPreview,
      existingFaqs: existingFM.faqs,
      geography: 'Dallas-Fort Worth (HQ Richardson TX); plus Denver CO, Wichita KS, Kansas City MO, and Atlanta GA service areas',
      formulaResult,
    });

    let attempt = 0;
    let generated = null;
    let validation = null;
    while (attempt < MAX_REGEN) {
      attempt++;
      console.log(`[${page.canonicalPath}] attempt ${attempt}/${MAX_REGEN}...`);
      try {
        const { content, usage } = await callOpenRouter({ system: sysPrompt, user: userPrompt });
        generated = parseModelJSON(content);
        validation = validateGenerated({ generated, page, benefit, formulaResult });
        if (validation.ok) {
          console.log(
            `[${page.canonicalPath}] ✅ valid on attempt ${attempt} (${validation.wordCount} words, usage=${usage?.total_tokens ?? '?'} tokens)`,
          );
          break;
        }
        console.log(`[${page.canonicalPath}] attempt ${attempt} failed:\n   - ${validation.issues.join('\n   - ')}`);
      } catch (err) {
        console.error(`[${page.canonicalPath}] attempt ${attempt} error: ${err.message}`);
      }
    }

    if (!validation?.ok) {
      console.error(`[${page.canonicalPath}] ❌ failed after ${MAX_REGEN} attempts; NOT writing.`);
      summary.push({ page: page.canonicalPath, ok: false, reason: 'validation', issues: validation?.issues });
      continue;
    }

    // Merge generated frontmatter back in (preserve existing meta we don't generate).
    const mergedFM = {
      ...existingFM,
      title: generated.title,
      description: generated.description,
      h1: generated.h1,
      heroImage: page.heroImage ?? existingFM.heroImage,
      faqs: generated.faqs,
    };
    const mdx = buildMDX({ frontmatter: mergedFM, body: generated.body });
    await writeFile(mdxPath, mdx);
    console.log(`[${page.canonicalPath}] -> ${page.mdxPath} (${mdx.length} bytes)`);
    summary.push({
      page: page.canonicalPath,
      ok: true,
      title: generated.title,
      titleLength: generated.title.length,
      titleFormula: formulaResult.formula,
      benefitUsed: benefit,
      wordCount: validation.wordCount,
    });
  }

  console.log('\n============================================================');
  console.log('Copy generation summary');
  for (const s of summary) {
    if (!s.ok) {
      console.log(`❌ ${s.page} — ${s.reason}`);
      continue;
    }
    console.log(`✅ ${s.page}`);
    console.log(`   title (${s.titleLength}/60, ${s.titleFormula}): ${s.title}`);
    console.log(`   benefit: ${s.benefitUsed}`);
    console.log(`   words:   ${s.wordCount}`);
  }

  const failed = summary.filter((s) => !s.ok);
  if (failed.length) process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
