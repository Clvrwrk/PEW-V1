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

if (failed) {
  process.exit(1);
}

console.log(`Contrast audit passed: ${pairs.length} role pairs in light and dark mode.`);

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
