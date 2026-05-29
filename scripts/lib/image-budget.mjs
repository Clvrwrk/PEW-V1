/**
 * scripts/lib/image-budget.mjs
 *
 * Single source of truth for per-image byte budgets. Imported by BOTH:
 *   - scripts/audit-images.mjs        (the deploy hard gate that FAILS the build)
 *   - scripts/optimize-public-images.mjs (the autofixer that PREVENTS the failure)
 *
 * If these two ever disagree, the autofixer "fixes" an image to a size the
 * audit still rejects — the exact loop that caused the repeated Coolify
 * deploy failures logged in docs/deploy-failures/. Keep them sharing this file.
 */

/**
 * Byte budget for a deployable image, keyed off its repo-relative path.
 * Mirrors the tiers the original audit enforced.
 * @param {string} relativePath e.g. "public/images/clients/commercial/tpo-1.webp"
 * @returns {number} max bytes
 */
export function budgetFor(relativePath) {
  const file = relativePath.toLowerCase();
  if (file.includes('/logos/')) return 80_000;
  if (file.endsWith('/og-default.webp')) return 120_000;
  if (file.includes('hero')) return 225_000;
  if (file.includes('/blog/') || file.includes('featured')) return 100_000;
  return 130_000;
}

/**
 * The image formats that must never ship in public/ or dist/ — they have to be
 * converted to WebP first. Mirrors FORBIDDEN_RASTER_EXTENSIONS in the audit.
 */
export const FORBIDDEN_RASTER_EXTENSIONS = new Set([
  '.avif',
  '.gif',
  '.jpeg',
  '.jpg',
  '.png',
]);
