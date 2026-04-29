/**
 * scripts/optimize-image.mjs
 *
 * Takes a raw 1024x1024 PNG (or any input image) and produces an optimized
 * JPEG at the spec'd dimensions and under the spec'd byte cap. Used by
 * scripts/generate-images.mjs to enforce PRD §12.1 LCP budgets.
 *
 * Importable: `import { optimizeImage } from './optimize-image.mjs'`
 * CLI: `node scripts/optimize-image.mjs --in raw.png --out hero.jpg --w 1200 --h 900 --max-bytes 300000`
 */

import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';

/**
 * @param {object} opts
 * @param {Buffer} opts.input              Raw image bytes
 * @param {number} opts.width              Target width in px
 * @param {number} opts.height             Target height in px
 * @param {number} opts.maxBytes           Hard cap on output file size
 * @param {('jpeg'|'avif'|'webp')} [opts.format='jpeg']
 * @returns {Promise<Buffer>}
 */
export async function optimizeImage({ input, width, height, maxBytes, format = 'jpeg' }) {
  if (!input || !Buffer.isBuffer(input)) {
    throw new Error('optimizeImage: `input` must be a Buffer');
  }
  if (!Number.isFinite(width) || !Number.isFinite(height)) {
    throw new Error('optimizeImage: `width` and `height` must be numbers');
  }

  // Cover-crop to the target aspect ratio, then progressively re-encode
  // dropping quality until we slip under maxBytes (or hit a quality floor).
  const base = sharp(input).resize(width, height, { fit: 'cover', position: 'attention' });

  const qualitySteps = [85, 78, 72, 66, 60, 54, 48, 42, 36];
  let last = null;

  for (const q of qualitySteps) {
    let pipeline;
    if (format === 'jpeg') {
      pipeline = base.clone().jpeg({ quality: q, mozjpeg: true, progressive: true });
    } else if (format === 'avif') {
      pipeline = base.clone().avif({ quality: q, effort: 4 });
    } else if (format === 'webp') {
      pipeline = base.clone().webp({ quality: q });
    } else {
      throw new Error(`optimizeImage: unknown format "${format}"`);
    }
    const out = await pipeline.toBuffer();
    last = { buffer: out, quality: q };
    if (out.byteLength <= maxBytes) {
      return out;
    }
  }

  // Couldn't slip under cap even at lowest quality. Return the smallest we got
  // and let the caller decide whether to warn or fail.
  return last.buffer;
}

/**
 * Convenience: optimize and write to disk.
 */
export async function optimizeAndWrite({ input, outPath, width, height, maxBytes, format = 'jpeg' }) {
  const out = await optimizeImage({ input, width, height, maxBytes, format });
  await writeFile(outPath, out);
  return { bytes: out.byteLength, outPath, withinBudget: out.byteLength <= maxBytes };
}

// CLI entry point
import { pathToFileURL } from 'node:url';
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { readFile } = await import('node:fs/promises');
  const args = Object.fromEntries(
    process.argv
      .slice(2)
      .reduce((acc, cur, i, arr) => {
        if (cur.startsWith('--')) acc.push([cur.slice(2), arr[i + 1]]);
        return acc;
      }, [])
      .filter(([, v]) => v !== undefined),
  );
  if (!args.in || !args.out) {
    console.error('Usage: node scripts/optimize-image.mjs --in raw.png --out hero.jpg --w 1200 --h 900 --max-bytes 300000');
    process.exit(2);
  }
  const input = await readFile(args.in);
  const result = await optimizeAndWrite({
    input,
    outPath: args.out,
    width: Number(args.w),
    height: Number(args.h),
    maxBytes: Number(args['max-bytes']),
    format: args.format ?? 'jpeg',
  });
  console.log(`${args.out} -> ${result.bytes} bytes (budget ${args['max-bytes']}: ${result.withinBudget ? 'OK' : 'OVER'})`);
}
