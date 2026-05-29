/**
 * scripts/deploy-preflight.mjs
 *
 * Runs the SAME gate chain Coolify runs on deploy — locally, before you push —
 * and auto-remediates the mechanically-fixable failure classes so a deploy
 * never dies on something we could have caught at the keyboard.
 *
 * Mirrors the Dockerfile build step `npm run build`, which is:
 *   astro build && audit:contrast && audit:schema && audit:silo
 *     && audit:orphans && audit:gbp-plan && audit:images && audit:pagebuilder
 * plus the `npm ci` lockfile check that runs before it.
 *
 * Stages (each maps to a logged failure class in docs/deploy-failures/):
 *   0. lockfile sync     — `npm ci --dry-run`     (2026-05-03 EUSAGE desync)
 *   1. image autofix     — optimize-public-images (2026-05-28 raster/format, 2026-05-29 budget)
 *   2. image gate        — audit:images
 *   3. full build + audits — npm run build         (2026-05-04 FAQ undefined.map crash)
 *
 * Usage:
 *   node scripts/deploy-preflight.mjs              # full chain incl. astro build
 *   node scripts/deploy-preflight.mjs --fast       # skip the heavy astro build; run static audits only
 *   node scripts/deploy-preflight.mjs --no-fix     # report failures, do not auto-remediate
 *
 * Exit 0 = safe to commit/push. Non-zero = a gate would fail on deploy; the
 * output tells you which and what (if anything) was auto-fixed. When a NEW
 * failure type slips through to Coolify anyway, log it in docs/deploy-failures/
 * and add a stage here so it is caught next time (see the skill SKILL.md).
 */

import { spawnSync } from 'node:child_process';

const FAST = process.argv.includes('--fast');
const NO_FIX = process.argv.includes('--no-fix');

function run(cmd, args, label) {
  process.stdout.write(`\n▶ ${label}\n  $ ${cmd} ${args.join(' ')}\n`);
  const res = spawnSync(cmd, args, { stdio: 'inherit', encoding: 'utf8' });
  return res.status === 0;
}

const results = [];
function record(stage, ok, note = '') {
  results.push({ stage, ok, note });
}

// ── Stage 0: lockfile sync (npm ci would EUSAGE on deploy if out of sync) ──
{
  const ok = run('npm', ['ci', '--dry-run', '--ignore-scripts', '--no-audit', '--no-fund'], 'Stage 0 · lockfile sync (npm ci --dry-run)');
  if (!ok && !NO_FIX) {
    console.log('  ↳ lockfile out of sync — running `npm install --package-lock-only` to resync…');
    run('npm', ['install', '--package-lock-only', '--no-audit', '--no-fund'], 'Stage 0 · autofix lockfile');
    const reok = run('npm', ['ci', '--dry-run', '--ignore-scripts', '--no-audit', '--no-fund'], 'Stage 0 · re-check lockfile');
    record('lockfile sync', reok, reok ? 'resynced package-lock.json' : 'still out of sync — run `npm install` and inspect');
  } else {
    record('lockfile sync', ok);
  }
}

// ── Stage 1+2: image autofix, then the image gate ──
{
  if (!NO_FIX) {
    run('node', ['scripts/optimize-public-images.mjs'], 'Stage 1 · image autofix (convert rasters + recompress over-budget)');
  }
  // In --fast mode dist/ may be stale or absent; audit public/ only. The full
  // build in Stage 3 re-runs audit:images against a fresh dist/.
  const ok = run('node', ['scripts/audit-images.mjs', '--no-dist'], 'Stage 2 · image gate (audit:images --no-dist)');
  record('image gate', ok, ok ? '' : 're-source over-budget images flagged above');
}

// ── Stage 3: full build + every audit (the real Coolify gate) ──
if (FAST) {
  console.log('\n▶ Stage 3 · full build — SKIPPED (--fast). Runtime crashes (e.g. component data) are NOT covered.');
  record('full build (astro + audits)', true, 'SKIPPED via --fast — not deploy-safe on its own');
} else {
  const ok = run('npm', ['run', 'build'], 'Stage 3 · full build + all audits (npm run build)');
  record('full build (astro + audits)', ok, ok ? '' : 'see build output above — fix before pushing');
}

// ── Summary ──
console.log('\n──────── deploy-preflight summary ────────');
let failed = false;
for (const { stage, ok, note } of results) {
  console.log(`  ${ok ? '✅' : '❌'} ${stage}${note ? ` — ${note}` : ''}`);
  if (!ok) failed = true;
}
if (failed) {
  console.error('\n❌ Preflight FAILED — do NOT push. Fix the above (some may have been auto-remediated; re-run to confirm).');
  process.exit(1);
}
console.log(`\n✅ Preflight passed${FAST ? ' (FAST mode — run without --fast before the real push)' : ''} — safe to commit and push.`);
