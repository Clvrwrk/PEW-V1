/**
 * scripts/optimize-public-images.mjs
 *
 * Deploy-preflight AUTOFIXER for the image hard gate (scripts/audit-images.mjs).
 *
 * Walks public/images and public/Logos and makes every deployable raster pass
 * the audit BEFORE it can fail a Coolify build:
 *   1. Converts any non-WebP raster (.jpg/.jpeg/.png/.gif/.avif) to .webp,
 *      then deletes the original raster (the audit fails on its mere presence).
 *   2. Re-encodes any over-budget .webp down under its per-path byte budget
 *      (scripts/lib/image-budget.mjs) by stepping quality, then — only if
 *      quality alone won't fit — progressively downscaling.
 *
 * It NEVER touches src/ or content/ (Drive masters stay byte-identical per
 * CLAUDE.md §11a). It only rewrites the deployable copies under public/.
 *
 * Usage:
 *   node scripts/optimize-public-images.mjs            # fix in place
 *   node scripts/optimize-public-images.mjs --dry-run  # report only, change nothing
 *
 * Exit code 0 always on success (it is a fixer, not a gate). Run
 * `npm run audit:images -- --no-dist` afterwards to confirm the gate is green.
 *
 * History: born from the repeated Coolify deploy failures in
 * docs/deploy-failures/ (2026-05-28 raster-format, 2026-05-29 size-budget).
 */

import { readdir, stat, readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { budgetFor, FORBIDDEN_RASTER_EXTENSIONS } from './lib/image-budget.mjs';

const ROOT = process.cwd();
const TARGETS = [path.join(ROOT, 'public', 'images'), path.join(ROOT, 'public', 'Logos')];
const DRY_RUN = process.argv.includes('--dry-run');
const SAFETY = 0.95; // aim a little under budget so a re-save never tips back over

const QUALITY_STEPS = [82, 78, 74, 70, 66, 62, 58, 54, 50, 46, 42, 38];
const MAX_DIM_STEPS = [null, 1600, 1500, 1400, 1280, 1152, 1024, 960, 896];

const changed = [];
const stillOver = [];

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (entry.isFile()) files.push(full);
  }
  return files;
}

const rel = (p) => path.relative(ROOT, p).split(path.sep).join('/');

/** Encode a sharp pipeline to a webp buffer under maxBytes, returning the smallest attempt. */
async function encodeUnderBudget(inputBuffer, maxBytes) {
  const meta = await sharp(inputBuffer).metadata();
  const longEdge = Math.max(meta.width ?? 0, meta.height ?? 0);
  let best = null;
  for (const maxDim of MAX_DIM_STEPS) {
    const base = sharp(inputBuffer).rotate(); // honor EXIF orientation
    const sized =
      maxDim && longEdge > maxDim
        ? base.resize({ width: meta.width >= meta.height ? maxDim : null, height: meta.height > meta.width ? maxDim : null, fit: 'inside', withoutEnlargement: true })
        : base;
    for (const q of QUALITY_STEPS) {
      const out = await sized.clone().webp({ quality: q, effort: 6 }).toBuffer();
      best = best && best.byteLength <= out.byteLength ? best : out;
      if (out.byteLength <= maxBytes) return { buffer: out, fit: true, quality: q, maxDim };
    }
  }
  return { buffer: best, fit: false };
}

for (const targetDir of TARGETS) {
  for (const filePath of await walk(targetDir)) {
    const r = rel(filePath);
    const ext = path.extname(filePath).toLowerCase();

    // 1. Non-WebP raster → convert to .webp under budget, drop the original.
    if (FORBIDDEN_RASTER_EXTENSIONS.has(ext)) {
      const outPath = filePath.slice(0, -ext.length) + '.webp';
      const outRel = rel(outPath);
      const budget = Math.floor(budgetFor(outRel) * SAFETY);
      if (DRY_RUN) {
        changed.push(`convert ${r} → ${outRel} (budget ${budget})`);
        continue;
      }
      const { buffer, fit } = await encodeUnderBudget(await readFile(filePath), budget);
      await writeFile(outPath, buffer);
      await unlink(filePath);
      changed.push(`converted ${r} → ${outRel} @ ${buffer.byteLength}b${fit ? '' : ' (OVER budget — re-source smaller)'}`);
      if (!fit) stillOver.push(`${outRel}: ${buffer.byteLength}b > ${budgetFor(outRel)}b after max compression`);
      continue;
    }

    // 2. Over-budget .webp → re-encode under budget.
    if (ext === '.webp') {
      const size = (await stat(filePath)).size;
      const hardBudget = budgetFor(r);
      if (size <= hardBudget) continue;
      const target = Math.floor(hardBudget * SAFETY);
      if (DRY_RUN) {
        changed.push(`recompress ${r} (${size}b > ${hardBudget}b)`);
        continue;
      }
      const { buffer, fit } = await encodeUnderBudget(await readFile(filePath), target);
      await writeFile(filePath, buffer);
      changed.push(`recompressed ${r} ${size}b → ${buffer.byteLength}b${fit ? '' : ' (OVER budget — re-source smaller)'}`);
      if (!fit) stillOver.push(`${r}: ${buffer.byteLength}b > ${hardBudget}b after max compression`);
    }
  }
}

if (!changed.length) {
  console.log('Image autofixer: nothing to fix — all public images are WebP and within budget.');
} else {
  console.log(`Image autofixer: ${DRY_RUN ? 'would change' : 'changed'} ${changed.length} file(s):`);
  for (const line of changed) console.log(`  - ${line}`);
}
if (stillOver.length) {
  console.warn(
    `\n⚠ ${stillOver.length} image(s) could not be squeezed under budget by compression alone — ` +
      `re-source a smaller/tighter crop:\n${stillOver.map((s) => `  - ${s}`).join('\n')}`,
  );
}
