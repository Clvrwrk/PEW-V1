/**
 * src/lib/integrations/openrouter.ts
 *
 * Thin REST wrapper around OpenRouter's chat-completions endpoint.
 * Used by `scripts/generate-page-copy.mjs` to draft Kyle Roof Reverse Silo
 * body copy across the Phase 0 cohort.
 *
 * Docs: https://openrouter.ai/docs/quickstart
 */

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GenerateCopyOptions {
  /** OpenRouter model slug, e.g. "anthropic/claude-3.5-sonnet" or "openai/gpt-5". */
  model: string;
  /** System prompt — voice, format, and Kyle Roof rules. */
  system: string;
  /** User prompt — page-specific brief. */
  user: string;
  /** Hard cap on output tokens. Defaults to 2400 (~1500 words). */
  max_tokens?: number;
  /** Temperature. Defaults to 0.6 — tight enough for SEO, loose enough to avoid robotic. */
  temperature?: number;
  /** Optional HTTP-Referer + X-Title (OpenRouter ranks by these). */
  referer?: string;
  title?: string;
}

export interface GenerateCopyResult {
  text: string;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

function getKey(): string {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) {
    throw new Error(
      'OPENROUTER_API_KEY missing. Add it to .env (gitignored) per .env.example.',
    );
  }
  return key;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Single chat-completion call with exponential-backoff retry on 429 / 5xx.
 */
export async function generateCopy(
  opts: GenerateCopyOptions,
): Promise<GenerateCopyResult> {
  const apiKey = getKey();
  const messages: ChatMessage[] = [
    { role: 'system', content: opts.system },
    { role: 'user', content: opts.user },
  ];

  const body = JSON.stringify({
    model: opts.model,
    messages,
    max_tokens: opts.max_tokens ?? 2400,
    temperature: opts.temperature ?? 0.6,
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
  if (opts.referer) headers['HTTP-Referer'] = opts.referer;
  if (opts.title) headers['X-Title'] = opts.title;

  const maxAttempts = 3;
  let lastErr: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
        method: 'POST',
        headers,
        body,
      });

      if (res.status === 429 || res.status >= 500) {
        const text = await res.text();
        lastErr = new Error(`OpenRouter ${res.status}: ${text.slice(0, 200)}`);
        await delay(500 * 2 ** (attempt - 1));
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenRouter ${res.status}: ${text.slice(0, 500)}`);
      }

      const json = (await res.json()) as {
        choices: Array<{ message: { content: string } }>;
        model: string;
        usage?: GenerateCopyResult['usage'];
      };

      const text = json.choices?.[0]?.message?.content;
      if (!text) {
        throw new Error('OpenRouter response missing choices[0].message.content');
      }

      return { text, model: json.model, usage: json.usage };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt === maxAttempts) break;
      await delay(500 * 2 ** (attempt - 1));
    }
  }

  throw lastErr ?? new Error('OpenRouter call failed for unknown reason.');
}

/**
 * Convenience wrapper: generate JSON output by appending a strict-JSON instruction.
 * Returns parsed JSON or throws.
 */
export async function generateJSON<T = unknown>(
  opts: GenerateCopyOptions,
): Promise<T> {
  const wrapped: GenerateCopyOptions = {
    ...opts,
    system:
      opts.system +
      '\n\nReturn ONLY valid JSON. No markdown fencing, no commentary.',
  };
  const { text } = await generateCopy(wrapped);
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned) as T;
}
