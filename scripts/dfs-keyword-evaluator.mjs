/**
 * scripts/dfs-keyword-evaluator.mjs
 *
 * For every page in page-keywords.json, generates candidate keyword variations,
 * queries DataForSEO for DFW-local search volume, and picks the best keyword
 * by volume × (1 - competition). Writes updated page-keywords.json with the
 * winning keyword + volume/CPC metadata.
 *
 * CLI:
 *   node --env-file=.env scripts/dfs-keyword-evaluator.mjs
 *   node --env-file=.env scripts/dfs-keyword-evaluator.mjs --dry-run
 *   node --env-file=.env scripts/dfs-keyword-evaluator.mjs --only /commercial-roofing/tpo/
 */

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');
const DFS_BASE = 'https://api.dataforseo.com/v3';
const DFW_LOCATION = 1003854; // Dallas-Fort Worth, Texas

const ARGS = process.argv.slice(2);
const DRY_RUN = ARGS.includes('--dry-run');
const ONLY = ARGS.includes('--only') ? ARGS[ARGS.indexOf('--only') + 1] : null;

// ─── Auth ────────────────────────────────────────────────────────────────────

function getAuthHeader() {
  const b64 = process.env.DATAFORSEO_AUTH_B64;
  if (b64) return `Basic ${b64}`;
  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (login && password) return `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
  throw new Error('DataForSEO credentials missing. Set DATAFORSEO_AUTH_B64 or DATAFORSEO_LOGIN+PASSWORD in .env');
}

// ─── DFS API ─────────────────────────────────────────────────────────────────

async function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

async function batchKeywordVolume(keywords) {
  const auth = getAuthHeader();
  const payload = [{ keywords, location_code: DFW_LOCATION, language_code: 'en' }];

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${DFS_BASE}/keywords_data/google_ads/search_volume/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: auth },
        body: JSON.stringify(payload),
      });
      if (res.status === 429 || res.status >= 500) {
        await delay(1000 * 2 ** (attempt - 1));
        continue;
      }
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`DFS ${res.status}: ${text.slice(0, 300)}`);
      }
      const json = await res.json();
      if (json.status_code !== 20000) throw new Error(`DFS error: ${json.status_message}`);

      const rows = [];
      for (const task of json.tasks ?? []) {
        for (const r of task.result ?? []) {
          rows.push({
            keyword: r.keyword,
            search_volume: r.search_volume ?? 0,
            cpc: r.cpc ?? 0,
            competition: r.competition ?? 0,
            competition_level: r.competition_level ?? null,
          });
        }
      }
      return rows;
    } catch (err) {
      if (attempt === 3) throw err;
      await delay(1000 * 2 ** (attempt - 1));
    }
  }
}

// ─── Candidate Generation ────────────────────────────────────────────────────

function generateCandidates(page) {
  const kw = page.keyword;
  const candidates = new Set([kw]);

  // Add common variations
  const vertical = page.vertical;
  const words = kw.toLowerCase().split(/\s+/);

  // City extraction from canonicalPath
  const cityMatch = page.canonicalPath.match(/\/([\w-]+)\/$/);
  const citySlug = cityMatch ? cityMatch[1] : null;
  const cityName = citySlug ? citySlug.split('-').map(w => w[0].toUpperCase() + w.slice(1)).join(' ') : null;

  if (page.pageType === 'transactional') {
    // Service variations
    if (vertical === 'commercial') {
      candidates.add(`${kw} contractor`);
      candidates.add(`${kw} company`);
      candidates.add(`${kw} services`);
      if (cityName) {
        candidates.add(`${kw} ${cityName}`);
        candidates.add(`${kw} contractor ${cityName}`);
        candidates.add(`${kw} company ${cityName}`);
      } else {
        candidates.add(`${kw} Dallas`);
        candidates.add(`${kw} DFW`);
        candidates.add(`${kw} near me`);
      }
    } else if (vertical === 'residential') {
      candidates.add(`${kw} contractor`);
      candidates.add(`${kw} company`);
      candidates.add(`${kw} near me`);
      candidates.add(`${kw} cost`);
      if (cityName) {
        candidates.add(`${kw} ${cityName}`);
        candidates.add(`${kw} contractor ${cityName}`);
      } else {
        candidates.add(`${kw} Dallas`);
        candidates.add(`${kw} Texas`);
      }
    }
  } else if (page.pageType === 'office') {
    candidates.add(`roofing company ${cityName ?? 'Dallas'}`);
    candidates.add(`roofer ${cityName ?? 'Dallas'}`);
    candidates.add(`roofing contractor ${cityName ?? 'Dallas'}`);
    candidates.add(`${kw} roofing`);
  } else if (page.pageType === 'subdivision') {
    const subName = words.filter(w => w !== 'roofing').join(' ');
    candidates.add(`roofing ${subName}`);
    candidates.add(`roofer ${subName}`);
    candidates.add(`roof replacement ${subName}`);
  } else if (page.pageType === 'blog-supporter') {
    // Long-tail variations
    candidates.add(`${kw} guide`);
    candidates.add(`${kw} comparison`);
    candidates.add(`${kw} 2026`);
  } else if (page.pageType === 'pillar') {
    candidates.add(`${kw} guide`);
    candidates.add(`${kw} Dallas`);
    candidates.add(`${kw} Texas`);
  }

  return [...candidates].slice(0, 8);
}

// ─── Scoring ─────────────────────────────────────────────────────────────────

function scoreCandidates(volumeRows, originalKeyword) {
  if (!volumeRows.length) return null;

  const scored = volumeRows.map(r => {
    const vol = r.search_volume ?? 0;
    const comp = r.competition ?? 0;
    // Score: volume × (1 - competition), with a small bonus for the original keyword (stability)
    const isOriginal = r.keyword.toLowerCase() === originalKeyword.toLowerCase();
    const score = vol * (1 - comp) * (isOriginal ? 1.1 : 1.0);
    return { ...r, score };
  });

  scored.sort((a, b) => b.score - a.score);
  return scored;
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

  console.log(`Evaluating keywords for ${pages.length} page(s) against DFW (location ${DFW_LOCATION})`);
  console.log('============================================================');

  const results = [];
  // Process in batches of 5 pages to batch DFS queries efficiently
  const BATCH_SIZE = 5;

  for (let i = 0; i < pages.length; i += BATCH_SIZE) {
    const batch = pages.slice(i, i + BATCH_SIZE);

    // Collect all unique candidates across this batch
    const allCandidates = new Map(); // keyword -> page indices
    const pageCandidates = [];

    for (const page of batch) {
      const cands = generateCandidates(page);
      pageCandidates.push(cands);
      for (const c of cands) {
        if (!allCandidates.has(c.toLowerCase())) {
          allCandidates.set(c.toLowerCase(), c);
        }
      }
    }

    const uniqueKeywords = [...allCandidates.values()];
    console.log(`\nBatch ${Math.floor(i / BATCH_SIZE) + 1}: ${uniqueKeywords.length} unique keywords for ${batch.length} pages`);

    let volumeRows = [];
    if (!DRY_RUN) {
      try {
        volumeRows = await batchKeywordVolume(uniqueKeywords);
        console.log(`  DFS returned ${volumeRows.length} rows`);
      } catch (err) {
        console.error(`  DFS query failed: ${err.message}`);
        // Fallback: keep existing keywords
        for (const page of batch) {
          results.push({ page: page.canonicalPath, keyword: page.keyword, changed: false, reason: 'dfs-error' });
        }
        continue;
      }
      await delay(500); // Rate limit courtesy
    }

    // Score candidates per page
    for (let j = 0; j < batch.length; j++) {
      const page = batch[j];
      const myCandidates = pageCandidates[j];

      if (DRY_RUN) {
        console.log(`  [${page.canonicalPath}] candidates: ${myCandidates.join(', ')}`);
        results.push({ page: page.canonicalPath, keyword: page.keyword, candidates: myCandidates, changed: false, reason: 'dry-run' });
        continue;
      }

      // Filter volume rows to this page's candidates
      const myRows = volumeRows.filter(r => myCandidates.some(c => c.toLowerCase() === r.keyword.toLowerCase()));
      const scored = scoreCandidates(myRows, page.keyword);

      if (!scored || !scored.length) {
        console.log(`  [${page.canonicalPath}] no volume data — keeping "${page.keyword}"`);
        results.push({ page: page.canonicalPath, keyword: page.keyword, changed: false, reason: 'no-data' });
        continue;
      }

      const winner = scored[0];
      const changed = winner.keyword.toLowerCase() !== page.keyword.toLowerCase();
      const original = myRows.find(r => r.keyword.toLowerCase() === page.keyword.toLowerCase());

      console.log(`  [${page.canonicalPath}]`);
      console.log(`    current:  "${page.keyword}" (vol=${original?.search_volume ?? '?'}, comp=${original?.competition ?? '?'})`);
      console.log(`    winner:   "${winner.keyword}" (vol=${winner.search_volume}, comp=${winner.competition}, score=${winner.score.toFixed(1)})`);
      if (changed) console.log(`    → UPGRADING keyword`);

      // Update the page object in-place
      page.keyword = winner.keyword;
      page._dfs = {
        search_volume: winner.search_volume,
        cpc: winner.cpc,
        competition: winner.competition,
        competition_level: winner.competition_level,
        evaluated_at: new Date().toISOString().slice(0, 10),
        candidates_evaluated: scored.length,
      };

      results.push({
        page: page.canonicalPath,
        keyword: winner.keyword,
        volume: winner.search_volume,
        competition: winner.competition,
        changed,
      });
    }
  }

  // Write back
  if (!DRY_RUN) {
    cfg.pages = cfg.pages; // pages were updated in-place
    cfg._evaluated_at = new Date().toISOString();
    await writeFile(cfgPath, JSON.stringify(cfg, null, 2) + '\n');
    console.log(`\nWrote updated page-keywords.json`);
  }

  // Summary
  console.log('\n============================================================');
  console.log('Keyword evaluation summary');
  const changed = results.filter(r => r.changed);
  const kept = results.filter(r => !r.changed);
  console.log(`  ${changed.length} keyword(s) upgraded`);
  console.log(`  ${kept.length} keyword(s) kept`);
  for (const r of changed) {
    console.log(`  ↑ ${r.page} → "${r.keyword}" (vol=${r.volume})`);
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(err => { console.error(err); process.exit(1); });
}
