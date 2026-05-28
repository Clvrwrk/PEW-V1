import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../src/styles/tokens.css', import.meta.url), 'utf8');

const blocks = {
  light: extractBlock(/:root,\s*html:not\(\.dark\)\s*\{([\s\S]*?)\n\}/),
  dark: extractBlock(/html\.dark\s*\{([\s\S]*?)\n\}/),
};

const pairs = [
  ['--color-text-primary', '--color-surface'],
  ['--color-text-primary', '--color-surface-elevated'],
  ['--color-text-primary', '--color-surface-inset'],
  ['--color-text-secondary', '--color-surface'],
  ['--color-text-secondary', '--color-surface-elevated'],
  ['--color-text-tertiary', '--color-surface'],
  ['--color-text-tertiary', '--color-surface-elevated'],
  ['--color-accent', '--color-surface'],
  ['--color-accent', '--color-surface-elevated'],
  ['--color-text-on-brand', '--color-brand-primary'],
  ['--color-text-on-brand', '--color-brand-accent'],
  ['--color-text-inverted', '--color-surface-inverted'],
  ['--color-text-inverted-secondary', '--color-surface-inverted'],
  ['--color-danger', '--color-surface'],
  ['--color-danger-text', '--color-danger-surface'],
  ['--color-success-text', '--color-success-surface'],
  ['--color-info-text', '--color-info-surface'],
  ['--color-warning-text', '--color-warning-surface'],
];

// ── Static brand color pairs (inline Tailwind hex classes not in tokens.css) ──
// These must be checked directly since audit-contrast only reads CSS variables.
// Root cause history: heading base rule used var(--color-text-primary) which
// overrides inherited text-white on dark sections. Fixed in global.css by
// changing headings to color:inherit. These pairs guard against regression.
const staticPairs = [
  { label: 'white text on deep-navy bg-[#11133F]',  fg: '#FFFFFF', bg: '#11133F' },
  { label: 'white text on flag-red bg-[#C22326]',   fg: '#FFFFFF', bg: '#C22326' },
  { label: 'white text on slate-900 bg-slate-900',  fg: '#FFFFFF', bg: '#111827' },
  { label: 'white text on slate-800 bg-slate-800',  fg: '#FFFFFF', bg: '#1e293b' },
  { label: 'near-black text on white bg-white',     fg: '#111827', bg: '#FFFFFF' },
  { label: 'near-black text on surface-inset',      fg: '#111827', bg: '#F9FAFB' },
];

let failed = false;

for (const [mode, tokens] of Object.entries(blocks)) {
  for (const [foreground, background] of pairs) {
    const fg = resolve(tokens, foreground);
    const bg = resolve(tokens, background);
    const ratio = contrast(fg, bg);

    if (ratio < 4.5) {
      failed = true;
      console.error(`${mode}: ${foreground} on ${background} is ${ratio.toFixed(2)}:1 (${fg} on ${bg})`);
    }
  }
}

// Check static brand pairs
for (const { label, fg, bg } of staticPairs) {
  const ratio = contrast(fg, bg);
  if (ratio < 4.5) {
    failed = true;
    console.error(`brand-static: ${label} is ${ratio.toFixed(2)}:1 (FAIL — WCAG AA requires 4.5:1)`);
  }
}

if (failed) {
  process.exit(1);
}

console.log(`Contrast audit passed: ${pairs.length} role pairs + ${staticPairs.length} brand static pairs.`);

function extractBlock(pattern) {
  const match = css.match(pattern);
  if (!match) {
    throw new Error(`Could not find token block: ${pattern}`);
  }

  const tokens = {};
  for (const line of match[1].split('\n')) {
    const declaration = line.match(/^\s*(--[a-z0-9-]+):\s*([^;]+);/i);
    if (declaration) {
      tokens[declaration[1]] = declaration[2].trim();
    }
  }
  return tokens;
}

function resolve(tokens, name, seen = new Set()) {
  if (seen.has(name)) {
    throw new Error(`Circular token reference: ${[...seen, name].join(' -> ')}`);
  }

  const value = tokens[name] ?? blocks.light[name];
  if (!value) {
    throw new Error(`Missing token: ${name}`);
  }

  const reference = value.match(/^var\((--[a-z0-9-]+)\)$/i);
  if (reference) {
    seen.add(name);
    return resolve(tokens, reference[1], seen);
  }

  const hex = value.match(/^#[0-9a-f]{6}$/i);
  if (!hex) {
    throw new Error(`Expected ${name} to resolve to a 6-digit hex color, got: ${value}`);
  }

  return value;
}

function contrast(a, b) {
  const lighter = Math.max(luminance(a), luminance(b));
  const darker = Math.min(luminance(a), luminance(b));
  return (lighter + 0.05) / (darker + 0.05);
}

function luminance(hex) {
  const [r, g, b] = hex
    .slice(1)
    .match(/.{2}/g)
    .map((channel) => {
      const value = parseInt(channel, 16) / 255;
      return value <= 0.03928
        ? value / 12.92
        : ((value + 0.055) / 1.055) ** 2.4;
    });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
