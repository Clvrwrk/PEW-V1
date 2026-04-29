/**
 * scripts/audit-keyword-placement.mjs
 *
 * Validates the 5-slot keyword placement rules locked in plan §3.1:
 *   1. Keyword in <title> / frontmatter `title`
 *   2. Keyword in meta description / frontmatter `description`
 *   3. All keyword tokens present in canonicalPath
 *   4. Keyword in H1 / frontmatter `h1`
 *   5. Keyword within the first 5 words of the body lede
 *
 * Reads scripts/data/page-keywords.json for per-page keyword assignments.
 * Reads each MDX file from src/content/ and extracts frontmatter + body.
 * Writes scripts/data/audit-keyword-placement.report.json.
 *
 * Exits 0 on full pass, 1 on any failure (so CI can chain via npm run build).
 *
 * CLI:
 *   node scripts/audit-keyword-placement.mjs
 *   node scripts/audit-keyword-placement.mjs --only /commercial-roofing/tpo/
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const ARGS = process.argv.slice(2);
const ONLY = ARGS.includes('--only') ? ARGS[ARGS.indexOf('--only') + 1] : null;

// ─── Frontmatter parsing (no external deps) ──────────────────────────────────
function parseFrontmatter(raw) {
  const m = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { frontmatter: {}, body: raw };
  const fm = {};
  // Very small subset of YAML: top-level scalar key: "value" pairs.
  // Multi-line / nested fields are ignored for the purposes of this audit.
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    // Strip wrapping quotes if present
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    fm[kv[1]] = value;
  }
  return { frontmatter: fm, body: m[2] };
}

function normalize(s) {
  return (s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function tokens(s) {
  return normalize(s).split(' ').filter(Boolean);
}

/**
 * Slot 1 / 2 / 4: keyword phrase appears in the field (case-insensitive,
 * punctuation-flexible).
 */
function fieldContainsKeyword(field, keyword) {
  if (!field) return false;
  const haystack = normalize(field);
  const needle = normalize(keyword);
  return haystack.includes(needle);
}

/**
 * Slot 3: every non-trivial token from the keyword appears somewhere in the URL.
 * Stop-words skipped because URLs strip them.
 */
const URL_STOPWORDS = new Set(['the', 'a', 'an', 'for', 'of', 'in', 'and', 'with', 'on', 'to']);
function urlContainsKeywordTokens(canonicalPath, keyword) {
  if (!canonicalPath) return false;
  const url = canonicalPath.toLowerCase();
  const t = tokens(keyword).filter((w) => !URL_STOPWORDS.has(w));
  if (t.length === 0) return true;
  return t.every((tok) => url.includes(tok));
}

/**
 * Slot 5: keyword appears within the first 5 words of the body lede.
 * Body is the MDX body after frontmatter. We strip Astro/MDX comments and
 * find the first sentence-like chunk.
 */
function ledeContainsKeyword(body, keyword) {
  if (!body) return false;
  // Strip MDX comments {/* ... */}
  let text = body.replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
  // Strip JSX tags
  text = text.replace(/<[^>]+>/g, ' ');
  // Strip leading/trailing whitespace
  text = text.replace(/^\s+/, '').trim();
  if (!text) return false;
  // First "sentence" — up to the first period, exclamation, question mark, newline.
  const firstSentence = text.split(/[.!?\n]/)[0];
  const firstFiveWords = firstSentence.split(/\s+/).slice(0, 5).join(' ');
  return fieldContainsKeyword(firstFiveWords, keyword);
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  const cfgPath = resolve(REPO_ROOT, 'scripts/data/page-keywords.json');
  const cfg = JSON.parse(await readFile(cfgPath, 'utf8'));

  let pages = cfg.pages;
  if (ONLY) {
    pages = pages.filter((p) => p.canonicalPath === ONLY);
    if (pages.length === 0) {
      console.error(`--only ${ONLY} matched no pages in page-keywords.json`);
      process.exit(2);
    }
  }

  const results = [];
  for (const page of pages) {
    const mdxPath = resolve(REPO_ROOT, page.mdxPath);
    let mdxRaw;
    try {
      mdxRaw = await readFile(mdxPath, 'utf8');
    } catch (err) {
      results.push({
        canonicalPath: page.canonicalPath,
        keyword: page.keyword,
        ok: false,
        slots: {},
        error: `Cannot read ${page.mdxPath}: ${err.message}`,
      });
      continue;
    }

    const { frontmatter, body } = parseFrontmatter(mdxRaw);

    const slots = {
      title: fieldContainsKeyword(frontmatter.title, page.keyword),
      description: fieldContainsKeyword(frontmatter.description, page.keyword),
      url: urlContainsKeywordTokens(frontmatter.canonicalPath ?? page.canonicalPath, page.keyword),
      h1: fieldContainsKeyword(frontmatter.h1, page.keyword),
      ledeFirst5Words: ledeContainsKeyword(body, page.keyword),
    };

    const ok = Object.values(slots).every(Boolean);
    results.push({
      canonicalPath: page.canonicalPath,
      keyword: page.keyword,
      ok,
      slots,
      title: frontmatter.title ?? '',
      description: frontmatter.description ?? '',
      h1: frontmatter.h1 ?? '',
    });
  }

  const reportPath = resolve(REPO_ROOT, 'scripts/data/audit-keyword-placement.report.json');
  await writeFile(
    reportPath,
    JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
  );

  console.log('Keyword placement audit');
  console.log('========================');
  for (const r of results) {
    if (r.error) {
      console.log(`❌ ${r.canonicalPath}  (${r.keyword})  -- ${r.error}`);
      continue;
    }
    const failed = Object.entries(r.slots)
      .filter(([, v]) => !v)
      .map(([k]) => k);
    const icon = r.ok ? '✅' : '❌';
    console.log(`${icon} ${r.canonicalPath}  (${r.keyword})  ${r.ok ? '' : `MISSED: ${failed.join(', ')}`}`);
  }
  console.log('========================');
  console.log(`Report: ${reportPath}`);
  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.error(`\n${failed.length} page(s) failed the 5-slot keyword placement audit.`);
    process.exit(1);
  }
  console.log('\nAll pages pass the 5-slot keyword placement rules.');
}

// Export pure-function helpers for the copy generator's inline validation.
export { parseFrontmatter, fieldContainsKeyword, urlContainsKeywordTokens, ledeContainsKeyword, normalize, tokens };

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
