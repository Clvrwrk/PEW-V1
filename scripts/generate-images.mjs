/**
 * scripts/generate-images.mjs
 *
 * Iterates a prompt library JSON file, generates each image via OpenRouter
 * (routed to google/gemini-2.5-flash-image), optimizes per PRD §12.1 LCP
 * budgets via scripts/optimize-image.mjs, and writes to the spec'd
 * public/images/... target paths.
 *
 * CLI:
 *   node --env-file=.env scripts/generate-images.mjs scripts/image-prompts/services-commercial.json
 *   node --env-file=.env scripts/generate-images.mjs scripts/image-prompts/services-commercial.json --only commercial-tpo-hero
 *
 * Concurrency: 2 in flight at a time (OpenRouter handles parallelism well,
 * but Gemini's upstream image quota benefits from a small queue).
 */

import { readFile, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { optimizeAndWrite } from './optimize-image.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..');

const ARGS = process.argv.slice(2);
const promptFile = ARGS.find((a) => !a.startsWith('--'));
if (!promptFile) {
  console.error('Usage: node --env-file=.env scripts/generate-images.mjs <prompt-library.json> [--only <id>] [--concurrency N]');
  process.exit(2);
}
const ONLY = ARGS.includes('--only') ? ARGS[ARGS.indexOf('--only') + 1] : null;
const CONCURRENCY = ARGS.includes('--concurrency')
  ? Number(ARGS[ARGS.indexOf('--concurrency') + 1])
  : 2;

function getKey() {
  const k = process.env.OPENROUTER_API_KEY;
  if (!k) {
    console.error('OPENROUTER_API_KEY missing. Run with --env-file=.env');
    process.exit(2);
  }
  return k;
}

/**
 * Generate one image via OpenRouter -> google/gemini-2.5-flash-image.
 * Returns { bytes: Buffer, mime: string }.
 */
async function generateOneImage(prompt, model = 'google/gemini-2.5-flash-image') {
  const key = getKey();
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
      'HTTP-Referer': 'https://pc-demo.cleverwork.io',
      'X-Title': 'AIA4 Pro Exteriors image gen',
    },
    body: JSON.stringify({
      model,
      modalities: ['image', 'text'],
      messages: [{ role: 'user', content: prompt }],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter image ${res.status}: ${text.slice(0, 300)}`);
  }
  const json = await res.json();
  const msg = json.choices?.[0]?.message;
  const imagePart = msg?.images?.[0]?.image_url?.url ?? msg?.images?.[0]?.url;
  if (!imagePart) {
    throw new Error(`No image in OpenRouter response. Full message: ${JSON.stringify(msg).slice(0, 200)}`);
  }
  const m = imagePart.match(/^data:(image\/[a-z]+);base64,(.+)$/);
  if (!m) {
    throw new Error(`Unexpected image url shape: ${imagePart.slice(0, 80)}`);
  }
  return { bytes: Buffer.from(m[2], 'base64'), mime: m[1] };
}

async function processOne(entry, defaults, lib) {
  const targetPath = resolve(REPO_ROOT, entry.target_path);
  const targetDir = dirname(targetPath);
  await mkdir(targetDir, { recursive: true });

  // Resolve effective spec: per-entry override key "_aspect_override" can
  // point at e.g. "_blog_default" in the library to swap dimensions/aspect.
  let spec = defaults;
  if (entry._aspect_override) {
    const key = entry._aspect_override.startsWith('_') ? entry._aspect_override : `_${entry._aspect_override}_default`;
    if (lib[key]) spec = lib[key];
  }

  const startedAt = Date.now();
  console.log(`[${entry.id}] generating (${spec.target_dimensions.width}x${spec.target_dimensions.height})...`);

  let raw;
  try {
    raw = await generateOneImage(entry.prompt, spec.model);
  } catch (err) {
    console.error(`[${entry.id}] generation failed: ${err.message}`);
    return { id: entry.id, ok: false, error: err.message };
  }
  const genMs = Date.now() - startedAt;
  console.log(`[${entry.id}] generated ${raw.bytes.byteLength} bytes (${raw.mime}) in ${genMs}ms`);

  // Sanitize: ensure parent dir of target exists
  await mkdir(targetDir, { recursive: true });

  const result = await optimizeAndWrite({
    input: raw.bytes,
    outPath: targetPath,
    width: spec.target_dimensions.width,
    height: spec.target_dimensions.height,
    maxBytes: spec.max_bytes,
    format: spec.format,
  });

  console.log(
    `[${entry.id}] -> ${entry.target_path} ${result.bytes} bytes (budget ${spec.max_bytes}: ${result.withinBudget ? 'OK' : 'OVER'})`,
  );

  return { id: entry.id, ok: true, ...result };
}

async function main() {
  const lib = JSON.parse(await readFile(promptFile, 'utf8'));
  const defaults = lib._default;
  let entries = lib.prompts;
  if (ONLY) {
    entries = entries.filter((e) => e.id === ONLY);
    if (entries.length === 0) {
      console.error(`--only ${ONLY} matched no entries in ${promptFile}`);
      process.exit(2);
    }
  }

  console.log(`Generating ${entries.length} image(s) at concurrency=${CONCURRENCY}`);

  const results = [];
  let cursor = 0;
  async function worker() {
    while (cursor < entries.length) {
      const i = cursor++;
      const r = await processOne(entries[i], defaults, lib);
      results.push(r);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const failed = results.filter((r) => !r.ok);
  console.log(`\nDone. ${results.length - failed.length}/${results.length} succeeded.`);
  if (failed.length) {
    for (const f of failed) console.error(`  FAIL ${f.id}: ${f.error}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
