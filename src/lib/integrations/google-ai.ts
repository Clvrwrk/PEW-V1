/**
 * src/lib/integrations/google-ai.ts
 *
 * Thin REST wrapper around the Google AI Studio (Gemini) generateContent API.
 * Used for both text generation and image generation ("nano banana" via
 * gemini-2.5-flash-image / gemini-2.5-flash-image-preview).
 *
 * Auth: API key in `X-goog-api-key` header (per the curl example shipped
 * with the project key).
 * Docs: https://ai.google.dev/gemini-api/docs/ai-studio-quickstart
 */

const GOOGLE_AI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

export const GEMINI_MODELS = {
  /** Latest fast text model. Used for short-form drafts and brief expansions. */
  FLASH_LATEST: 'gemini-flash-latest',
  /** Premium image generation (nano banana). Primary for hero/architectural shots. */
  FLASH_IMAGE: 'gemini-2.5-flash-image',
  /** Image preview alias — used as fallback if the stable slug 404s. */
  FLASH_IMAGE_PREVIEW: 'gemini-2.5-flash-image-preview',
} as const;

function getKey(): string {
  const key = process.env.GOOGLE_AI_API_KEY;
  if (!key) {
    throw new Error(
      'GOOGLE_AI_API_KEY missing. Add it to .env (gitignored) per .env.example.',
    );
  }
  return key;
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface GenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        inlineData?: {
          mimeType: string;
          data: string; // base64
        };
      }>;
    };
    finishReason?: string;
    safetyRatings?: Array<{ category: string; probability: string }>;
  }>;
  promptFeedback?: {
    blockReason?: string;
    safetyRatings?: Array<{ category: string; probability: string }>;
  };
}

async function generateContent(
  model: string,
  body: Record<string, unknown>,
): Promise<GenerateContentResponse> {
  const apiKey = getKey();
  const headers = {
    'Content-Type': 'application/json',
    'X-goog-api-key': apiKey,
  };
  const url = `${GOOGLE_AI_BASE}/models/${model}:generateContent`;

  const maxAttempts = 3;
  let lastErr: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      });

      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`Google AI ${res.status} on ${model}`);
        await delay(1000 * 2 ** (attempt - 1));
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Google AI ${res.status} on ${model}: ${text.slice(0, 600)}`);
      }

      return (await res.json()) as GenerateContentResponse;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt === maxAttempts) break;
      await delay(1000 * 2 ** (attempt - 1));
    }
  }

  throw lastErr ?? new Error(`Google AI call to ${model} failed.`);
}

/**
 * Generate plain text from Gemini. Useful for FAQ pass / short rewrites.
 */
export async function generateText(args: {
  prompt: string;
  model?: string;
  systemInstruction?: string;
  temperature?: number;
  maxOutputTokens?: number;
}): Promise<string> {
  const body: Record<string, unknown> = {
    contents: [{ parts: [{ text: args.prompt }] }],
    generationConfig: {
      temperature: args.temperature ?? 0.6,
      maxOutputTokens: args.maxOutputTokens ?? 2048,
    },
  };
  if (args.systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: args.systemInstruction }],
    };
  }

  const json = await generateContent(args.model ?? GEMINI_MODELS.FLASH_LATEST, body);

  if (json.promptFeedback?.blockReason) {
    throw new SafetyBlockedError(
      `Gemini blocked prompt: ${json.promptFeedback.blockReason}`,
    );
  }

  const text = json.candidates?.[0]?.content?.parts?.find((p) => p.text)?.text;
  if (!text) {
    throw new Error('Gemini text response missing candidates[0].content.parts[].text');
  }
  return text;
}

/**
 * Generate an image from Gemini ("nano banana"). Returns the raw PNG/JPEG bytes
 * plus the mime type. Caller is responsible for writing to disk and optimizing.
 */
export async function generateImage(args: {
  prompt: string;
  model?: string;
  /** Aspect ratio hint baked into the prompt suffix. Gemini does not enforce. */
  aspect?: '1:1' | '16:9' | '4:3' | '3:2' | '9:16';
}): Promise<{ bytes: Buffer; mimeType: string }> {
  const aspectSuffix = args.aspect
    ? `\n\nComposition: ${args.aspect} aspect ratio.`
    : '';
  const fullPrompt = args.prompt + aspectSuffix;

  const body = {
    contents: [{ parts: [{ text: fullPrompt }] }],
    generationConfig: {
      // Gemini image models require both modalities to be requested.
      responseModalities: ['IMAGE', 'TEXT'],
    },
  };

  const tryModels = [
    args.model ?? GEMINI_MODELS.FLASH_IMAGE,
    GEMINI_MODELS.FLASH_IMAGE_PREVIEW,
  ];

  let lastErr: Error | null = null;
  for (const model of tryModels) {
    try {
      const json = await generateContent(model, body);

      if (json.promptFeedback?.blockReason) {
        throw new SafetyBlockedError(
          `Gemini blocked image prompt: ${json.promptFeedback.blockReason}`,
        );
      }

      const part = json.candidates?.[0]?.content?.parts?.find(
        (p) => p.inlineData?.data,
      );
      if (!part?.inlineData) {
        // Fall through to next model in list.
        lastErr = new Error(
          `Gemini ${model} returned no inlineData; trying fallback model.`,
        );
        continue;
      }

      const bytes = Buffer.from(part.inlineData.data, 'base64');
      return { bytes, mimeType: part.inlineData.mimeType };
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (err instanceof SafetyBlockedError) throw err; // do not silently retry safety blocks
    }
  }

  throw lastErr ?? new Error('Google AI image generation failed across all model fallbacks.');
}

/**
 * Distinct error so callers can route to the OpenRouter image fallback
 * without retrying Gemini with the same prompt.
 */
export class SafetyBlockedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SafetyBlockedError';
  }
}
