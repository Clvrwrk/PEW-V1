/**
 * scripts/smoke-test-integrations.mjs
 *
 * One minimal call against each provider:
 *   1) OpenRouter chat-completion (claude-3.5-sonnet, 60 tokens)
 *   2) DataForSEO keyword volume (1 keyword in DFW)
 *   3) Google AI text generation (gemini-flash-latest)
 *   4) Google AI image generation (nano banana — gemini-2.5-flash-image)
 *
 * Logs pass/fail per integration. Never echoes key material.
 * Writes the smoke-test image to scratch/smoke-test-image.png.
 */

// Run with: node --env-file=.env scripts/smoke-test-integrations.mjs
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const SCRATCH_DIR = join(REPO_ROOT, 'scratch');
if (!existsSync(SCRATCH_DIR)) mkdirSync(SCRATCH_DIR, { recursive: true });

const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail });
  const icon = ok ? '✅' : '❌';
  console.log(`${icon} ${name}: ${detail}`);
}

// ── 1. OpenRouter ───────────────────────────────────────────────────────────
async function testOpenRouter() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return record('OpenRouter', false, 'OPENROUTER_API_KEY not set');

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://pc-demo.cleverwork.io',
        'X-Title': 'AIA4 Pro Exteriors smoke test',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [{ role: 'user', content: 'Reply with the single word: ok' }],
        max_tokens: 32,
        temperature: 0,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return record('OpenRouter', false, `${res.status} ${text.slice(0, 150)}`);
    }
    const json = await res.json();
    const reply = json.choices?.[0]?.message?.content?.trim() ?? '';
    record(
      'OpenRouter',
      true,
      `model=${json.model} reply="${reply}" usage=${JSON.stringify(json.usage ?? {})}`,
    );
  } catch (err) {
    record('OpenRouter', false, err.message);
  }
}

// ── 2. DataForSEO ───────────────────────────────────────────────────────────
async function testDataForSEO() {
  const b64 = process.env.DATAFORSEO_AUTH_B64;
  if (!b64) return record('DataForSEO', false, 'DATAFORSEO_AUTH_B64 not set');

  try {
    const res = await fetch(
      'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${b64}`,
        },
        body: JSON.stringify([
          {
            keywords: ['commercial roofing contractors dallas tx'],
            location_code: 1003854, // DFW
            language_code: 'en',
          },
        ]),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      return record('DataForSEO', false, `${res.status} ${text.slice(0, 150)}`);
    }
    const json = await res.json();
    if (json.status_code !== 20000) {
      return record('DataForSEO', false, `status=${json.status_code} ${json.status_message}`);
    }
    const row = json.tasks?.[0]?.result?.[0];
    record(
      'DataForSEO',
      true,
      `keyword="${row?.keyword}" volume=${row?.search_volume} cpc=${row?.cpc} comp=${row?.competition_level}`,
    );
  } catch (err) {
    record('DataForSEO', false, err.message);
  }
}

// ── 3. Google AI text ───────────────────────────────────────────────────────
async function testGoogleText() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return record('Google AI text', false, 'GOOGLE_AI_API_KEY not set');

  try {
    const res = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': key,
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: 'Reply with the single token "ok". No reasoning, no preamble.',
                },
              ],
            },
          ],
          // Gemini 2.5 Flash uses internal "thinking" tokens that consume the
          // maxOutputTokens budget before any visible text is emitted. Bump the
          // budget high enough that real output survives.
          generationConfig: { temperature: 0, maxOutputTokens: 1024 },
        }),
      },
    );
    if (!res.ok) {
      const text = await res.text();
      return record('Google AI text', false, `${res.status} ${text.slice(0, 150)}`);
    }
    const json = await res.json();
    const cand = json.candidates?.[0];
    const reply = cand?.content?.parts?.find((p) => p.text)?.text?.trim() ?? '';
    if (!reply) {
      return record(
        'Google AI text',
        false,
        `empty reply finishReason=${cand?.finishReason} usage=${JSON.stringify(json.usageMetadata ?? {})}`,
      );
    }
    record('Google AI text', true, `reply="${reply}"`);
  } catch (err) {
    record('Google AI text', false, err.message);
  }
}

// ── 5. OpenRouter image-gen probe (fallback for nano-banana quota) ──────────
async function testOpenRouterImage() {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) return record('OpenRouter image', false, 'OPENROUTER_API_KEY not set');

  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        'HTTP-Referer': 'https://pc-demo.cleverwork.io',
        'X-Title': 'AIA4 Pro Exteriors smoke test',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image',
        modalities: ['image', 'text'],
        messages: [
          {
            role: 'user',
            content:
              'A close-up architectural photograph of a clean white TPO commercial roof membrane with a precision-welded seam, late-afternoon light. Photorealistic, no humans, no signage.',
          },
        ],
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      return record('OpenRouter image', false, `${res.status} ${text.slice(0, 200)}`);
    }
    const json = await res.json();
    const msg = json.choices?.[0]?.message;
    const imagePart = msg?.images?.[0]?.image_url?.url ?? msg?.images?.[0]?.url;
    if (!imagePart) {
      return record(
        'OpenRouter image',
        false,
        `no image in response: ${JSON.stringify(json).slice(0, 250)}`,
      );
    }
    // image_url is a data: URL — strip header and persist
    const m = imagePart.match(/^data:(image\/[a-z]+);base64,(.+)$/);
    if (!m) {
      return record('OpenRouter image', false, `unexpected image url shape: ${imagePart.slice(0, 80)}`);
    }
    const bytes = Buffer.from(m[2], 'base64');
    const ext = m[1].split('/')[1];
    writeFileSync(join(SCRATCH_DIR, `smoke-or-image.${ext}`), bytes);
    record(
      'OpenRouter image',
      true,
      `via=${json.model} mime=${m[1]} bytes=${bytes.length} -> scratch/smoke-or-image.${ext}`,
    );
  } catch (err) {
    record('OpenRouter image', false, err.message);
  }
}

// ── 4. Google AI image (nano banana) ────────────────────────────────────────
async function testGoogleImage() {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) return record('Google AI image', false, 'GOOGLE_AI_API_KEY not set');

  const tryModels = ['gemini-2.5-flash-image', 'gemini-2.5-flash-image-preview'];

  for (const model of tryModels) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': key,
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text:
                      'A close-up architectural photograph of a clean white TPO commercial roof membrane with a precision-welded seam, late-afternoon light. Photorealistic, no humans, no signage.',
                  },
                ],
              },
            ],
            generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
          }),
        },
      );
      if (!res.ok) {
        const text = await res.text();
        // Try the next model if this slug doesn't exist on the project.
        if (res.status === 404 || text.includes('not found')) continue;
        return record('Google AI image', false, `${model} ${res.status} ${text.slice(0, 150)}`);
      }
      const json = await res.json();
      if (json.promptFeedback?.blockReason) {
        return record(
          'Google AI image',
          false,
          `${model} blocked: ${json.promptFeedback.blockReason}`,
        );
      }
      const part = json.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data);
      if (!part?.inlineData) {
        // Try next model.
        continue;
      }
      const bytes = Buffer.from(part.inlineData.data, 'base64');
      const ext = part.inlineData.mimeType.split('/')[1] || 'png';
      const outPath = join(SCRATCH_DIR, `smoke-test-image.${ext}`);
      writeFileSync(outPath, bytes);
      return record(
        'Google AI image',
        true,
        `${model} mime=${part.inlineData.mimeType} bytes=${bytes.length} -> scratch/smoke-test-image.${ext}`,
      );
    } catch (err) {
      record('Google AI image', false, `${model} ${err.message}`);
      return;
    }
  }

  record('Google AI image', false, 'No image returned from any candidate model.');
}

// ── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('AIA4 sprint integrations — smoke test');
  console.log('======================================');
  await testOpenRouter();
  await testDataForSEO();
  await testGoogleText();
  await testGoogleImage();
  await testOpenRouterImage();
  console.log('======================================');
  const failed = results.filter((r) => !r.ok);
  if (failed.length) {
    console.error(`\n${failed.length} integration(s) failed.`);
    process.exit(1);
  }
  console.log('\nAll integrations passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
