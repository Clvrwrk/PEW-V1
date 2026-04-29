/**
 * src/lib/integrations/dataforseo.ts
 *
 * Thin REST wrapper around the DataForSEO v3 API.
 * Used by `scripts/dfs-local-volume-pull.mjs` to anchor copy briefs to
 * actual local search volume in DFW / Denver / Wichita / KC / Atlanta.
 *
 * Auth: HTTP Basic — base64(login:password) in Authorization header.
 * Docs: https://docs.dataforseo.com/v3/
 */

const DFS_BASE = 'https://api.dataforseo.com/v3';

/** Location codes — see https://docs.dataforseo.com/v3/serp/google/locations/ */
export const LOCATION_CODES = {
  DFW: 1003854,           // Dallas-Fort Worth, Texas
  DENVER: 1014221,        // Denver, Colorado
  WICHITA: 1014834,       // Wichita, Kansas
  KANSAS_CITY: 1014904,   // Kansas City, Missouri
  ATLANTA: 1015254,       // Atlanta, Georgia
  US: 2840,               // United States (national fallback)
} as const;

export type LocationCode = (typeof LOCATION_CODES)[keyof typeof LOCATION_CODES];

export interface KeywordVolumeRow {
  keyword: string;
  search_volume: number | null;
  cpc: number | null;
  competition: number | null;
  competition_level: 'LOW' | 'MEDIUM' | 'HIGH' | null;
  location_code: number;
}

export interface SerpResultRow {
  rank_group: number;
  rank_absolute: number;
  domain: string;
  title: string;
  url: string;
  description: string;
}

function getAuthHeader(): string {
  const b64 = process.env.DATAFORSEO_AUTH_B64;
  if (b64) return `Basic ${b64}`;

  const login = process.env.DATAFORSEO_LOGIN;
  const password = process.env.DATAFORSEO_PASSWORD;
  if (login && password) {
    return `Basic ${Buffer.from(`${login}:${password}`).toString('base64')}`;
  }

  throw new Error(
    'DataForSEO credentials missing. Set DATAFORSEO_AUTH_B64 (preferred) or DATAFORSEO_LOGIN + DATAFORSEO_PASSWORD in .env.',
  );
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function postJson<T>(path: string, payload: unknown): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: getAuthHeader(),
  };

  const maxAttempts = 3;
  let lastErr: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${DFS_BASE}${path}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      if (res.status === 429 || res.status >= 500) {
        lastErr = new Error(`DataForSEO ${res.status} on ${path}`);
        await delay(800 * 2 ** (attempt - 1));
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`DataForSEO ${res.status} on ${path}: ${text.slice(0, 500)}`);
      }

      const json = (await res.json()) as T;
      return json;
    } catch (err) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      if (attempt === maxAttempts) break;
      await delay(800 * 2 ** (attempt - 1));
    }
  }

  throw lastErr ?? new Error(`DataForSEO call to ${path} failed.`);
}

/**
 * Pull search volume + CPC for a batch of keywords at a given location.
 * Uses the live (synchronous) endpoint so we don't need to poll.
 *
 * Endpoint: /keywords_data/google_ads/search_volume/live
 */
export async function keywordSearchVolume(args: {
  keywords: string[];
  location_code: number;
  language_code?: string;
}): Promise<KeywordVolumeRow[]> {
  const payload = [
    {
      keywords: args.keywords,
      location_code: args.location_code,
      language_code: args.language_code ?? 'en',
    },
  ];

  type ResponseShape = {
    status_code: number;
    status_message: string;
    tasks: Array<{
      status_code: number;
      status_message: string;
      result: Array<{
        keyword: string;
        search_volume: number | null;
        cpc: number | null;
        competition: number | null;
        competition_level: KeywordVolumeRow['competition_level'];
        location_code: number;
      }>;
    }>;
  };

  const json = await postJson<ResponseShape>(
    '/keywords_data/google_ads/search_volume/live',
    payload,
  );

  if (json.status_code !== 20000) {
    throw new Error(`DataForSEO error: ${json.status_message}`);
  }

  const rows: KeywordVolumeRow[] = [];
  for (const task of json.tasks ?? []) {
    if (task.status_code !== 20000) {
      // Surface the message but don't blow up the whole batch.
      console.warn(`DFS task warning: ${task.status_message}`);
      continue;
    }
    for (const r of task.result ?? []) {
      rows.push({
        keyword: r.keyword,
        search_volume: r.search_volume,
        cpc: r.cpc,
        competition: r.competition,
        competition_level: r.competition_level,
        location_code: r.location_code,
      });
    }
  }
  return rows;
}

/**
 * Pull live SERP results for one keyword at one location.
 *
 * Endpoint: /serp/google/organic/live/advanced
 */
export async function serpResults(args: {
  keyword: string;
  location_code: number;
  language_code?: string;
  depth?: number;
}): Promise<SerpResultRow[]> {
  const payload = [
    {
      keyword: args.keyword,
      location_code: args.location_code,
      language_code: args.language_code ?? 'en',
      depth: args.depth ?? 20,
    },
  ];

  type ResponseShape = {
    status_code: number;
    status_message: string;
    tasks: Array<{
      status_code: number;
      status_message: string;
      result: Array<{
        items?: Array<{
          type: string;
          rank_group: number;
          rank_absolute: number;
          domain: string;
          title: string;
          url: string;
          description: string;
        }>;
      }>;
    }>;
  };

  const json = await postJson<ResponseShape>(
    '/serp/google/organic/live/advanced',
    payload,
  );

  if (json.status_code !== 20000) {
    throw new Error(`DataForSEO SERP error: ${json.status_message}`);
  }

  const rows: SerpResultRow[] = [];
  for (const task of json.tasks ?? []) {
    for (const r of task.result ?? []) {
      for (const item of r.items ?? []) {
        if (item.type !== 'organic') continue;
        rows.push({
          rank_group: item.rank_group,
          rank_absolute: item.rank_absolute,
          domain: item.domain,
          title: item.title,
          url: item.url,
          description: item.description,
        });
      }
    }
  }
  return rows;
}
