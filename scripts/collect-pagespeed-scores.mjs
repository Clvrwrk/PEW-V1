#!/usr/bin/env node
import fs from 'node:fs';
import { applyPageSpeedResults, readRegistry, writeRegistry } from './lib/pagebuilder-governance.mjs';

const args = new Set(process.argv.slice(2));
const registryPath = process.argv.find((arg) => arg.startsWith('--registry='))
  ?.replace('--registry=', '') ?? 'src/data/pagebuilder-audit.json';
const scoresPath = process.argv.find((arg) => arg.startsWith('--scores='))
  ?.replace('--scores=', '');
const live = args.has('--live');
const dryRun = args.has('--dry-run');

async function fetchPageSpeedScore(url) {
  const apiKey = process.env.PAGESPEED_API_KEY;
  const requestUrl = new URL('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
  requestUrl.searchParams.set('url', url);
  requestUrl.searchParams.set('strategy', 'mobile');
  requestUrl.searchParams.set('category', 'performance');
  if (apiKey) requestUrl.searchParams.set('key', apiKey);

  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`PageSpeed request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  const score = payload?.lighthouseResult?.categories?.performance?.score;
  if (typeof score !== 'number') {
    throw new Error(`PageSpeed response did not include a performance score for ${url}.`);
  }
  return Math.round(score * 100);
}

async function collectScores(registry) {
  if (scoresPath) {
    const rawScores = JSON.parse(fs.readFileSync(scoresPath, 'utf8'));
    return Object.fromEntries(Object.entries(rawScores).map(([key, value]) => [key, Number(value)]));
  }

  if (!live) return {};

  const scores = {};
  for (const route of registry.routes ?? []) {
    if (route.pagebuilderRequired === false) continue;
    const url = route.canonicalUrl;
    if (!url) continue;
    scores[route.path] = await fetchPageSpeedScore(url);
    console.log(`[pagespeed] ${route.path} ${scores[route.path]}`);
  }
  return scores;
}

const registry = readRegistry(registryPath);
const scores = await collectScores(registry);
const updated = applyPageSpeedResults(registry, scores);

if (dryRun) {
  console.log(`[pagespeed] Dry run complete. ${Object.keys(scores).length} score(s) collected; registry was not written.`);
  process.exit(0);
}

writeRegistry(updated, registryPath);
console.log(`[pagespeed] Updated ${registryPath} with ${Object.keys(scores).length} score(s). Unmeasured routes remain pending.`);
