#!/usr/bin/env node
/**
 * validate-schema.mjs
 * Post-build: walks dist/, extracts all JSON-LD script blocks, validates structure.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const DIST_DIR = fileURLToPath(new URL('../dist', import.meta.url));
console.log(`[schema-audit] Searching in: ${DIST_DIR}`);

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
let totalSchemas = 0;

console.log(`[schema-audit] Auditing ${files.length} pages in dist/...`);

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  const matches = content.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
  
  for (const match of matches) {
    totalSchemas++;
    try {
      const json = JSON.parse(match[1]);
      
      // Basic structural validation
      if (!json['@type'] && !json['@graph']) {
        console.error(`[schema-audit] Error in ${file}: Missing @type or @graph`);
        errors++;
      }
      
      // Check for common required fields on certain types if present
      if (json['@type'] === 'Organization' && !json.name) {
        console.error(`[schema-audit] Error in ${file}: Organization missing name`);
        errors++;
      }
      
    } catch (e) {
      console.error(`[schema-audit] Invalid JSON-LD in ${file}: ${e.message}`);
      errors++;
    }
  }
}

if (errors > 0) {
  console.error(`[schema-audit] ❌ ${errors} schema error(s) found across ${totalSchemas} blocks. Build blocked.`);
  process.exit(1);
}

if (totalSchemas === 0 && files.length > 0) {
  console.warn(`[schema-audit] ⚠️ No JSON-LD blocks found in ${files.length} pages.`);
} else {
  console.log(`[schema-audit] ✅ ${totalSchemas} schema block(s) validated across ${files.length} page(s).`);
}
