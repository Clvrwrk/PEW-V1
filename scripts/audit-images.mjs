import { access, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');
const SRC_DIR = path.join(ROOT, 'src');
const DIST_DIR = path.join(ROOT, 'dist');
const SKIP_DIST = process.argv.includes('--no-dist');

const SOURCE_EXTENSIONS = new Set(['.astro', '.css', '.mdx', '.ts', '.tsx']);
const FORBIDDEN_RASTER_EXTENSIONS = new Set(['.avif', '.gif', '.jpeg', '.jpg', '.png']);
const ALLOWED_PUBLIC_EXTENSIONS = new Set(['.webp']);
const REFERENCE_PATTERN = /(?:https?:\/\/[^"'\s)<>]+)?\/(?:images|Logos)\/[^"'\s)<>]+/g;

const failures = [];
const warnings = [];

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walk(dir) {
  if (!(await exists(dir))) return [];
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(fullPath)));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join('/');
}

function budgetFor(relativePath) {
  const file = relativePath.toLowerCase();
  if (file.includes('/logos/')) return 80_000;
  if (file.endsWith('/og-default.webp')) return 120_000;
  if (file.includes('hero')) return 225_000;
  if (file.includes('/blog/') || file.includes('featured')) return 100_000;
  return 130_000;
}

async function auditPublicTree(dir, label) {
  const files = await walk(dir);
  for (const filePath of files) {
    const relativePath = toPosix(path.relative(ROOT, filePath));
    const lower = relativePath.toLowerCase();
    const ext = path.extname(lower);

    if (lower.includes('/.original/')) {
      failures.push(`${label}: source master leaked into deployable assets: ${relativePath}`);
      continue;
    }

    const isImageAsset =
      lower.startsWith('public/images/') ||
      lower.startsWith('public/logos/') ||
      lower.startsWith('dist/images/') ||
      lower.startsWith('dist/logos/');

    if (!isImageAsset) continue;

    if (FORBIDDEN_RASTER_EXTENSIONS.has(ext)) {
      failures.push(`${label}: non-WebP raster asset found: ${relativePath}`);
      continue;
    }

    if (!ALLOWED_PUBLIC_EXTENSIONS.has(ext)) {
      failures.push(`${label}: unsupported deployable image format found: ${relativePath}`);
      continue;
    }

    const size = (await stat(filePath)).size;
    const maxBytes = budgetFor(relativePath);
    if (size > maxBytes) {
      failures.push(`${label}: ${relativePath} is ${size} bytes; budget is ${maxBytes} bytes`);
    }
  }
}

function cleanReference(rawReference) {
  const withoutTrailingPunctuation = rawReference.replace(/[.,;:]+$/g, '');
  try {
    const url = new URL(withoutTrailingPunctuation);
    return decodeURI(url.pathname);
  } catch {
    return decodeURI(withoutTrailingPunctuation.split(/[?#]/)[0]);
  }
}

async function auditRuntimeReferences() {
  const files = (await walk(SRC_DIR)).filter((file) => SOURCE_EXTENSIONS.has(path.extname(file)));
  for (const filePath of files) {
    const relativePath = toPosix(path.relative(ROOT, filePath));
    const contents = await import('node:fs/promises').then(({ readFile }) => readFile(filePath, 'utf8'));
    const matches = contents.match(REFERENCE_PATTERN) ?? [];

    for (const rawReference of matches) {
      const reference = cleanReference(rawReference);
      const ext = path.extname(reference).toLowerCase();

      if (reference.startsWith('/images/') && ext !== '.webp') {
        failures.push(`${relativePath}: local raster reference must be WebP: ${reference}`);
      }

      if (reference.startsWith('/Logos/') && ext !== '.webp') {
        failures.push(`${relativePath}: logo/favicon reference must be WebP: ${reference}`);
      }

      if (!reference.startsWith('/images/') && !reference.startsWith('/Logos/')) continue;

      const publicPath = path.join(PUBLIC_DIR, reference.slice(1));
      if (!(await exists(publicPath))) {
        failures.push(`${relativePath}: referenced image does not exist: ${reference}`);
      }
    }
  }
}

await auditPublicTree(path.join(PUBLIC_DIR, 'images'), 'public/images');
await auditPublicTree(path.join(PUBLIC_DIR, 'Logos'), 'public/Logos');
await auditRuntimeReferences();

if (SKIP_DIST) {
  warnings.push('dist image audit skipped by --no-dist.');
} else if (await exists(DIST_DIR)) {
  await auditPublicTree(path.join(DIST_DIR, 'images'), 'dist/images');
  await auditPublicTree(path.join(DIST_DIR, 'Logos'), 'dist/Logos');
} else {
  warnings.push('dist/ does not exist yet; dist image audit will run after astro build.');
}

if (warnings.length) {
  console.warn(`Image audit warnings:\n${warnings.map((warning) => `- ${warning}`).join('\n')}`);
}

if (failures.length) {
  console.error(`Image audit failed with ${failures.length} issue(s):\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
  process.exit(1);
}

console.log('Image audit passed: runtime image references resolve, deployable image assets are WebP, and size budgets hold.');
