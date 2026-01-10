/**
 * EmailBison HTTP Client
 *
 * Low-level HTTP client with:
 * - Automatic Bearer token injection
 * - Configurable timeouts
 * - Retry logic with exponential backoff
 * - Error normalization to typed errors
 */

import {
  EmailBisonError,
  NetworkError,
  TimeoutError,
  httpErrorFromResponse,
  isRetryableError,
} from './errors';

// --- Configuration ---

const DEFAULT_BASE_URL = 'https://app.outboundsolutions.com';
const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY_MS = 1_000;
const MAX_RETRY_DELAY_MS = 30_000;

export interface ClientConfig {
  /** API key for Bearer authentication */
  apiKey: string;
  /** Base URL (defaults to production) */
  baseUrl?: string;
  /** Request timeout in milliseconds (default: 30000) */
  timeoutMs?: number;
  /** Max retry attempts for retryable errors (default: 3) */
  maxRetries?: number;
  /** Enable debug logging (default: false) */
  debug?: boolean;
}

export interface RequestOptions {
  /** Override timeout for this request */
  timeoutMs?: number;
  /** Disable retries for this request */
  noRetry?: boolean;
  /** Additional headers */
  headers?: Record<string, string>;
  /** Query parameters */
  params?: Record<string, string | number | boolean | undefined>;
}

interface RequestContext {
  method: string;
  url: string;
  attempt: number;
  startTime: number;
}

// --- Client Factory ---

export function createClient(config: ClientConfig) {
  const {
    apiKey,
    baseUrl = DEFAULT_BASE_URL,
    timeoutMs = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    debug = false,
  } = config;

  if (!apiKey) {
    throw new Error('EmailBison API key is required');
  }

  const log = debug ? console.log.bind(console, '[EmailBison]') : () => {};

  // --- Core request function ---

  async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const effectiveTimeout = options.timeoutMs ?? timeoutMs;
    const shouldRetry = !options.noRetry;
    const maxAttempts = shouldRetry ? maxRetries : 1;

    const url = buildUrl(baseUrl, path, options.params);
    const ctx: RequestContext = {
      method,
      url,
      attempt: 0,
      startTime: Date.now(),
    };

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      ctx.attempt = attempt;

      try {
        log(`${method} ${url} (attempt ${attempt}/${maxAttempts})`);

        const response = await fetchWithTimeout(
          url,
          {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${apiKey}`,
              ...options.headers,
            },
            body: body ? JSON.stringify(body) : undefined,
          },
          effectiveTimeout
        );

        const duration = Date.now() - ctx.startTime;

        if (!response.ok) {
          const errorBody = await safeParseJson(response);
          const error = httpErrorFromResponse(response.status, errorBody);

          log(`${method} ${url} failed: ${response.status} (${duration}ms) body: ${JSON.stringify(errorBody)}`);

          // Don't retry non-retryable errors
          if (!shouldRetry || !isRetryableError(error)) {
            throw error;
          }

          lastError = error;
          await delay(getRetryDelay(attempt));
          continue;
        }

        // Handle 204 No Content
        if (response.status === 204) {
          log(`${method} ${url} succeeded: 204 (${duration}ms)`);
          return undefined as T;
        }

        const data = await response.json();
        log(`${method} ${url} succeeded: ${response.status} (${duration}ms)`);
        return data as T;

      } catch (error) {
        const duration = Date.now() - ctx.startTime;

        // Already an EmailBisonError - rethrow if not retryable
        if (error instanceof EmailBisonError) {
          if (!shouldRetry || !isRetryableError(error)) {
            throw error;
          }
          lastError = error;
          await delay(getRetryDelay(attempt));
          continue;
        }

        // Timeout error
        if (error instanceof Error && error.name === 'AbortError') {
          log(`${method} ${url} timed out after ${effectiveTimeout}ms`);
          const timeoutErr = new TimeoutError(effectiveTimeout);
          if (!shouldRetry) {
            throw timeoutErr;
          }
          lastError = timeoutErr;
          await delay(getRetryDelay(attempt));
          continue;
        }

        // Network error (DNS, connection refused, etc.)
        if (error instanceof TypeError && error.message.includes('fetch')) {
          log(`${method} ${url} network error: ${error.message} (${duration}ms)`);
          const networkErr = new NetworkError(error.message);
          if (!shouldRetry) {
            throw networkErr;
          }
          lastError = networkErr;
          await delay(getRetryDelay(attempt));
          continue;
        }

        // Unknown error - don't retry
        throw error;
      }
    }

    // All retries exhausted
    throw lastError ?? new NetworkError('Request failed after retries');
  }

  // --- HTTP method shortcuts ---

  return {
    get<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>('GET', path, undefined, options);
    },

    post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>('POST', path, body, options);
    },

    put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>('PUT', path, body, options);
    },

    patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
      return request<T>('PATCH', path, body, options);
    },

    delete<T>(path: string, options?: RequestOptions): Promise<T> {
      return request<T>('DELETE', path, undefined, options);
    },
  };
}

// --- Singleton client instance ---

let defaultClient: ReturnType<typeof createClient> | null = null;

/**
 * Get the default client instance.
 * Lazily initialized on first call using environment variables.
 * 
 * Environment variables:
 * - EMAILBISON_API_KEY (required): Your API key
 * - EMAILBISON_BASE_URL (optional): Custom base URL (defaults to app.outboundsolutions.com)
 */
export function getClient(): ReturnType<typeof createClient> {
  if (!defaultClient) {
    const apiKey = process.env.EMAILBISON_API_KEY;
    const baseUrl = process.env.EMAILBISON_BASE_URL;

    if (!apiKey) {
      throw new Error(
        'EMAILBISON_API_KEY environment variable is not set. ' +
        'Add it to your .env.local file.'
      );
    }

    defaultClient = createClient({
      apiKey,
      baseUrl,
      debug: process.env.NODE_ENV === 'development',
    });
  }

  return defaultClient;
}

/**
 * Reset the default client (useful for testing).
 */
export function resetClient(): void {
  defaultClient = null;
}

// --- Helpers ---

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

function buildUrl(
  baseUrl: string,
  path: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(path, baseUrl);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) {
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

function getRetryDelay(attempt: number): number {
  // Exponential backoff with jitter: 1s, 2s, 4s, etc. (capped at 30s)
  const exponentialDelay = INITIAL_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
  const cappedDelay = Math.min(exponentialDelay, MAX_RETRY_DELAY_MS);
  // Add 0-25% jitter to prevent thundering herd
  const jitter = cappedDelay * Math.random() * 0.25;
  return cappedDelay + jitter;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// --- Type export for client instance ---

export type EmailBisonClient = ReturnType<typeof createClient>;

