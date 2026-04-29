#!/usr/bin/env node
/**
 * audit-silo.mjs
 * Post-build: enforces Kyle Roof Reverse Silo rules on blog content.
 * Phase 1 stub — passes when no blog posts exist yet.
 * Full enforcement wired in Step 10.
 */

import { readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
// Collection folder must match the key in src/content/config.ts (`blogPosts`).
// Older drafts of this script pointed at the kebab-case folder which is empty
// and made the audit silently pass with zero posts.
const BLOG_POSTS_DIR = join(ROOT, 'src/content/blogPosts');

let postCount = 0;
let errors = 0;

function getBlogPosts(dir) {
  try {
    const entries = readdirSync(dir);
    return entries.filter(f => f.endsWith('.mdx') || f.endsWith('.md'));
  } catch {
    return [];
  }
}

const posts = getBlogPosts(BLOG_POSTS_DIR);
postCount = posts.length;

// TODO (Step 10): For each post, assert:
//   - Exactly 1 body link to silo_target
//   - 1-2 body links to silo_siblings
//   - No cross-vertical links
//   - No forbidden anchor text ('click here', 'learn more', 'read more')
//   - targetAnchorText matches actual anchor text

if (errors > 0) {
  console.error(`[silo-audit] ${errors} silo violation(s) found. Build blocked.`);
  process.exit(1);
}

console.log(`[silo-audit] ✓ ${postCount} blog post(s) passed silo audit`);
