#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const planPath = path.resolve('src/data/phase0-url-plan.json');
const plan = JSON.parse(fs.readFileSync(planPath, 'utf8'));

const exists = (url) => {
  if (url === '/') return fs.existsSync(path.join(dist, 'index.html'));
  if (url === '/sitemap.xml') return fs.existsSync(path.join(dist, 'sitemap-index.xml'));
  if (url === '/404/') return fs.existsSync(path.join(dist, '404.html'));
  if (url.endsWith('/')) return fs.existsSync(path.join(dist, url, 'index.html'));
  return fs.existsSync(path.join(dist, url));
};

const missing = plan.filter((row) => !exists(row.url));

if (missing.length > 0) {
  console.error('[gbp-url-plan] Missing Phase 0 URLs:');
  for (const row of missing) console.error(`- ${row.url} (${row.role})`);
  process.exit(1);
}

console.log(`[gbp-url-plan] ${plan.length} Phase 0 URL(s) published.`);
