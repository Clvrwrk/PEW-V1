#!/usr/bin/env node
/**
 * validate-schema.mjs
 * Post-build: walks dist/, extracts all JSON-LD script blocks, validates structure.
 * Phase 1 stub — passes when no dist/ pages exist yet, and when pages have valid JSON-LD.
 * Full schema.org validation wired in Step 7.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const DIST_DIR = new URL('../dist', import.meta.url).pathname;

function walkDir(dir) {
  const results = [];
  try {
    const entries = readdirSync(dir);
    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);
      if (stat.isDirectory()) {
        results.push(...walkDir(fullPath));
      } else if (entry.endsWith('.html')) {
        results.push(fullPath);
      }
    }
  } catch {
    // dist/ may not exist during CI dry runs
  }
  return results;
}

const files = walkDir(DIST_DIR);
let errors = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const matches = content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  for (const match of matches) {
    try {
      JSON.parse(match[1]);
    } catch (e) {
      console.error(`[schema-audit] Invalid JSON-LD in ${file}: ${e.message}`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`[schema-audit] ${errors} schema error(s) found. Build blocked.`);
  process.exit(1);
}

console.log(`[schema-audit] ✓ ${files.length} page(s) validated — no JSON-LD errors`);
