/**
 * scripts/huewrite-humanize.mjs
 *
 * Reads each MDX file listed in page-keywords.json, extracts the body copy,
 * sends it through HueWrite's humanizer API (Professional, HueV3.5, Ultra),
 * and writes the humanized body back into the MDX file — preserving frontmatter,
 * markdown structure, and keyword placement.
 *
 * CLI:
 *   node --env-file=.env scripts/huewrite-humanize.mjs
 *   node --env-file=.env scripts/huewrite-humanize.mjs --only /commercial-roofing/tpo/
 *   node --env-file=.env scripts/huewrite-humanize.mjs --dry-run
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const ARGS = process.argv.slice(2);
const DRY_RUN = ARGS.includes('--dry-run');
const ONLY = ARGS.includes('--only') ? ARGS[ARGS.indexOf('--only') + 1] : null;

const HUEWRITE_URL = 'https://huewrite.com/api/v1/humanize';

function getKey() {
  const k = process.env.HUEWRITE_API_KEY;
  if (!k) throw new Error('HUEWRITE_API_KEY missing. Add to .env.');
  return k;
}

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── MDX parsing ─────────────────────────────────────────────────────────────

function splitMDX(raw) {
  const m = raw.match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/);
  if (!m) return { frontmatter: '', body: raw };
  return { frontmatter: m[1], body: m[2] };
}

// ─── Markdown structure preservation ─────────────────────────────────────────
// We strip markdown links, headers, and images into numbered placeholders
// before sending to HueWrite, then re-inject them after humanization.

function extractStructure(body) {
  const placeholders = [];
  let idx = 0;

  // Preserve markdown links: [anchor](url) -> anchor %%LINK_N%%
  let processed = body.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, anchor, url) => {
    const ph = `%%LINK_${idx}%%`;
    placeholders.push({ ph, type: 'link', anchor, url, original: match });
    idx++;
    return `${anchor} ${ph}`;
  });

  // Preserve headers: ## Text -> %%HDR_N%% Text
  processed = processed.replace(/^(#{1,6}\s+)/gm, (match) => {
    const ph = `%%HDR_${idx}%%`;
    placeholders.push({ ph, type: 'header', original: match });
    idx++;
    return `${ph} `;
  });

  // Preserve images: ![alt](src) -> %%IMG_N%%
  processed = processed.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match) => {
    const ph = `%%IMG_${idx}%%`;
    placeholders.push({ ph, type: 'image', original: match });
    idx++;
    return ph;
  });

  return { text: processed, placeholders };
}

function restoreStructure(humanized, placeholders) {
  let result = humanized;

  for (const p of placeholders) {
    if (p.type === 'link') {
      // Reconstruct the markdown link
      result = result.replace(new RegExp(`${p.anchor}\\s*${p.ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'g'), p.original);
      // Fallback: if the humanizer rewrote the anchor text, just restore the placeholder
      result = result.replace(new RegExp(p.ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), p.original);
    } else if (p.type === 'header') {
      result = result.replace(new RegExp(`${p.ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*`, 'g'), p.original);
    } else if (p.type === 'image') {
      result = result.replace(new RegExp(p.ph.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), p.original);
    }
  }

  return result;
}

// ─── HueWrite API ────────────────────────────────────────────────────────────

async function humanizeText(text) {
  const key = getKey();

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(HUEWRITE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${key}`,
        },
        body: JSON.stringify({
          text,
          tone: 'professional',
          ultraMode: true,
          modelVersion: 'v3.5',
        }),
      });

      if (res.status === 429) {
        console.log('  Rate limited, waiting 10s...');
        await delay(10000);
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`HueWrite ${res.status}: ${errText.slice(0, 200)}`);
      }

      // Response is streaming text/plain
      const humanized = await res.text();
      if (!humanized || humanized.length < 20) {
        throw new Error('HueWrite returned empty/short response');
      }

      return humanized;
    } catch (err) {
      if (attempt === 3) throw err;
      console.log(`  Attempt ${attempt} failed: ${err.message}. Retrying...`);
      await delay(2000 * attempt);
    }
  }
}

// ─── Keyword patch-back ──────────────────────────────────────────────────────
// After humanization, the keyword might get displaced from the lede.
// This patches it back into the first sentence if missing.

function patchKeywordInLede(body, keyword) {
  const lines = body.split('\n');
  // Find first non-empty, non-header line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line || line.startsWith('#') || line.startsWith('!')) continue;

    const first5 = line.split(/\s+/).slice(0, 5).join(' ').toLowerCase();
    if (first5.includes(keyword.toLowerCase())) return body; // Already present

    // Prepend keyword to the sentence
    lines[i] = `${keyword} ${lines[i].charAt(0).toLowerCase()}${lines[i].slice(1)}`;
    return lines.join('\n');
  }
  return body;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const cfgPath = resolve(REPO_ROOT, 'scripts/data/page-keywords.json');
  const cfg = JSON.parse(await readFile(cfgPath, 'utf8'));
  let pages = cfg.pages;

  if (ONLY) {
    pages = pages.filter(p => p.canonicalPath === ONLY);
    if (!pages.length) { console.error(`--only ${ONLY} matched no pages`); process.exit(2); }
  }

  console.log(`Humanizing ${pages.length} page(s) via HueWrite (Professional, HueV3.5, Ultra)`);
  console.log('============================================================');

  let ok = 0, failed = 0, skipped = 0;

  for (const page of pages) {
    const mdxPath = resolve(REPO_ROOT, page.mdxPath);
    let raw;
    try {
      raw = await readFile(mdxPath, 'utf8');
    } catch (err) {
      console.error(`[${page.canonicalPath}] cannot read: ${err.message}`);
      failed++;
      continue;
    }

    const { frontmatter, body } = splitMDX(raw);
    const wordCount = body.trim().split(/\s+/).filter(Boolean).length;

    if (wordCount < 50) {
      console.log(`[${page.canonicalPath}] skipping (${wordCount} words < 50 minimum)`);
      skipped++;
      continue;
    }

    console.log(`[${page.canonicalPath}] ${wordCount} words...`);

    if (DRY_RUN) {
      console.log(`  [dry-run] would humanize ${wordCount} words`);
      skipped++;
      continue;
    }

    try {
      // Extract structure, humanize plain text, restore structure
      const { text: plainText, placeholders } = extractStructure(body.trim());
      const humanized = await humanizeText(plainText);
      let restored = restoreStructure(humanized, placeholders);

      // Patch keyword back into lede if displaced
      restored = patchKeywordInLede(restored, page.keyword);

      // Write back
      const newMDX = frontmatter + '\n' + restored.trim() + '\n';
      await writeFile(mdxPath, newMDX);

      const newWordCount = restored.trim().split(/\s+/).filter(Boolean).length;
      console.log(`  ✅ humanized (${wordCount} -> ${newWordCount} words)`);
      ok++;

      // Rate limit: 1s between requests
      await delay(1000);
    } catch (err) {
      console.error(`  ❌ ${err.message}`);
      failed++;
    }
  }

  console.log('\n============================================================');
  console.log(`Humanization complete: ${ok} ok, ${failed} failed, ${skipped} skipped`);
  if (failed > 0) process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => { console.error(err); process.exit(1); });
}
