/**
 * HQ Master Data API Client
 *
 * HTTP client for the Revenue Infrastructure API.
 * No authentication required - endpoints are publicly accessible.
 */

const DEFAULT_BASE_URL = 'https://api.revenueinfra.com';
const DEFAULT_TIMEOUT_MS = 30_000;

export interface ClientConfig {
  baseUrl?: string;
  timeoutMs?: number;
  debug?: boolean;
}

export interface RequestOptions {
  params?: Record<string, string | number | boolean | undefined>;
  timeoutMs?: number;
}

export function createHQClient(config: ClientConfig = {}) {
  const {
    baseUrl = process.env.HQ_DATA_API_URL || DEFAULT_BASE_URL,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    debug = process.env.NODE_ENV === 'development',
  } = config;

  const log = debug ? console.log.bind(console, '[HQ-Data]') : () => {};

  async function request<T>(
    method: string,
    path: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const effectiveTimeout = options.timeoutMs ?? timeoutMs;
    const url = buildUrl(baseUrl, path, options.params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), effectiveTimeout);

    try {
      log(`${method} ${url}`);
      const startTime = Date.now();

      const response = await fetch(url, {
        method,
        headers: {
          'Accept': 'application/json',
        },
        signal: controller.signal,
      });

      const duration = Date.now() - startTime;

      if (!response.ok) {
        const errorBody = await safeParseJson(response);
        log(`${method} ${url} failed: ${response.status} (${duration}ms)`);
        throw new HQDataError(
          extractErrorMessage(errorBody, response.status),
          response.status,
          errorBody
        );
      }

      const data = await response.json();
      log(`${method} ${url} succeeded: ${response.status} (${duration}ms)`);
      return data as T;

    } catch (error) {
      if (error instanceof HQDataError) {
        throw error;
      }
      if (error instanceof Error && error.name === 'AbortError') {
        throw new HQDataError(`Request timed out after ${effectiveTimeout}ms`, 0);
      }
      if (error instanceof TypeError) {
        throw new HQDataError(`Network error: ${error.message}`, 0);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    get<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>('GET', path, options);
    },
  };
}

// =============================================================================
// ERROR CLASS
// =============================================================================

export class HQDataError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'HQDataError';
  }
}

// =============================================================================
// SINGLETON
// =============================================================================

let defaultClient: ReturnType<typeof createHQClient> | null = null;

export function getHQClient(): ReturnType<typeof createHQClient> {
  if (!defaultClient) {
    defaultClient = createHQClient();
  }
  return defaultClient;
}

export function resetHQClient(): void {
  defaultClient = null;
}

// =============================================================================
// HELPERS
// =============================================================================

function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(path, baseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return url.toString();
}

async function safeParseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function extractErrorMessage(body: unknown, statusCode: number): string {
  if (body && typeof body === 'object') {
    const obj = body as Record<string, unknown>;
    if (obj.error && typeof obj.error === 'object') {
      const err = obj.error as Record<string, unknown>;
      if (typeof err.message === 'string') return err.message;
    }
    if (typeof obj.message === 'string') return obj.message;
  }
  return `HTTP ${statusCode}`;
}

export type HQDataClient = ReturnType<typeof createHQClient>;

