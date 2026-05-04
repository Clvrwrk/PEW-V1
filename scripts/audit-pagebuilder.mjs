#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { buildRegistryIndex, normalizeRoutePath, readRegistry, validateRegistry } from './lib/pagebuilder-governance.mjs';

const registryPath = process.argv.find((arg) => arg.startsWith('--registry='))
  ?.replace('--registry=', '') ?? 'src/data/pagebuilder-audit.json';

function walkMdx(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkMdx(fullPath);
    return entry.name.endsWith('.mdx') ? [fullPath] : [];
  });
}

function frontmatterValue(source, key) {
  const match = source.match(new RegExp(`^${key}:\\\\s*['"]([^'"]+)['"]`, 'm'));
  return match?.[1] ?? null;
}

function expectedPageBuilderRoutes() {
  const routes = new Set(['/commercial-roofing/', '/residential-roofing/']);
  const files = [
    ...walkMdx('src/content/services'),
    ...walkMdx('src/content/cities'),
    ...walkMdx('src/content/subdivisions'),
  ];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const canonicalPath = frontmatterValue(source, 'canonicalPath');
    if (canonicalPath) routes.add(normalizeRoutePath(canonicalPath));
  }

  return [...routes].sort();
}

const registry = readRegistry(registryPath);
const validation = validateRegistry(registry);
const registryIndex = buildRegistryIndex(registry);
const missingRoutes = expectedPageBuilderRoutes().filter((route) => !registryIndex.has(route));

if (!validation.ok || missingRoutes.length > 0) {
  console.error('[pagebuilder-audit] PageBuilder governance failed.');
  for (const error of validation.errors) console.error(`- ${error}`);
  for (const route of missingRoutes) console.error(`- Registry missing PageBuilder-required route ${route}`);
  process.exit(1);
}

const routes = registry.routes?.length ?? 0;
const passCount = registry.routes?.filter((route) => route.pagebuilderStatus === 'pass').length ?? 0;
const pendingCount = registry.routes?.filter((route) => route.pagebuilderStatus === 'pending').length ?? 0;
const failCount = registry.routes?.filter((route) => route.pagebuilderStatus === 'fail').length ?? 0;

console.log(`[pagebuilder-audit] ${routes} route(s) registered: ${passCount} pass, ${pendingCount} pending, ${failCount} fail.`);
