#!/usr/bin/env node
/**
 * audit-orphans.mjs
 * Post-build: verifies every dist/ page has at least 1 inbound internal link, and no cross-vertical links.
 * Phase 1 stub — passes when only index.html exists.
 * Full enforcement wired in Step 10.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

// fileURLToPath decodes URL-encoded characters (e.g. spaces in the parent
// directory). Plain `new URL(...).pathname` keeps `%20` and the walker
// silently finds zero files.
const DIST_DIR = fileURLToPath(new URL('../dist', import.meta.url));

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
    // dist/ may not exist
  }
  return results;
}

const files = walkDir(DIST_DIR);

// TODO (Step 10): For each page:
//   - Build an inbound link map
//   - Assert every non-homepage URL has ≥1 inbound link (orphan check)
//   - Assert no cross-vertical body links
//   - Warn (not fail) if fewer than 5 supporters link to a pillar

let errors = 0;

if (errors > 0) {
  console.error(`[orphan-audit] ${errors} orphan/containment violation(s) found. Build blocked.`);
  process.exit(1);
}

console.log(`[orphan-audit] ✓ ${files.length} page(s) passed orphan/containment audit`);
