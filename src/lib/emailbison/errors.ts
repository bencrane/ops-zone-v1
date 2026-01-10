/**
 * EmailBison API Error Classes
 *
 * Typed error hierarchy for predictable error handling across the application.
 * Each error type corresponds to a specific failure mode.
 */

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'AUTH_ERROR'
  | 'FORBIDDEN_ERROR'
  | 'NOT_FOUND_ERROR'
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'SERVER_ERROR'
  | 'UNKNOWN_ERROR';

/**
 * Base error class for all EmailBison API errors.
 */
export class EmailBisonError extends Error {
  readonly code: ErrorCode;
  readonly statusCode?: number;
  readonly details?: unknown;
  readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode,
    statusCode?: number,
    details?: unknown
  ) {
    super(message);
    this.name = 'EmailBisonError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = new Date();

    // Maintains proper stack trace in V8 environments
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
      timestamp: this.timestamp.toISOString(),
    };
  }
}

/**
 * Network-level failures (DNS, connection refused, etc.)
 */
export class NetworkError extends EmailBisonError {
  constructor(message: string = 'Network request failed') {
    super(message, 'NETWORK_ERROR');
    this.name = 'NetworkError';
  }
}

/**
 * Request exceeded timeout threshold.
 */
export class TimeoutError extends EmailBisonError {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Request timed out after ${timeoutMs}ms`, 'TIMEOUT_ERROR');
    this.name = 'TimeoutError';
    this.timeoutMs = timeoutMs;
  }
}

/**
 * 401 Unauthorized - Invalid or missing API key.
 */
export class AuthenticationError extends EmailBisonError {
  constructor(message: string = 'Invalid or expired API key') {
    super(message, 'AUTH_ERROR', 401);
    this.name = 'AuthenticationError';
  }
}

/**
 * 403 Forbidden - Valid auth but insufficient permissions.
 */
export class ForbiddenError extends EmailBisonError {
  constructor(message: string = 'Access denied') {
    super(message, 'FORBIDDEN_ERROR', 403);
    this.name = 'ForbiddenError';
  }
}

/**
 * 404 Not Found - Resource doesn't exist.
 */
export class NotFoundError extends EmailBisonError {
  readonly resource?: string;
  readonly resourceId?: string;

  constructor(resource?: string, resourceId?: string) {
    const message = resource
      ? `${resource}${resourceId ? ` (${resourceId})` : ''} not found`
      : 'Resource not found';
    super(message, 'NOT_FOUND_ERROR', 404);
    this.name = 'NotFoundError';
    this.resource = resource;
    this.resourceId = resourceId;
  }
}

/**
 * 400/422 Validation errors - Request payload invalid.
 */
export class ValidationError extends EmailBisonError {
  readonly fieldErrors?: Record<string, string[]>;

  constructor(
    message: string = 'Validation failed',
    fieldErrors?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', 400, fieldErrors);
    this.name = 'ValidationError';
    this.fieldErrors = fieldErrors;
  }
}

/**
 * 429 Too Many Requests - Rate limit exceeded.
 */
export class RateLimitError extends EmailBisonError {
  readonly retryAfterMs?: number;

  constructor(retryAfterMs?: number) {
    const message = retryAfterMs
      ? `Rate limit exceeded. Retry after ${Math.ceil(retryAfterMs / 1000)}s`
      : 'Rate limit exceeded';
    super(message, 'RATE_LIMIT_ERROR', 429);
    this.name = 'RateLimitError';
    this.retryAfterMs = retryAfterMs;
  }
}

/**
 * 5xx Server errors - Something went wrong on EmailBison's side.
 */
export class ServerError extends EmailBisonError {
  constructor(message: string = 'Internal server error', statusCode: number = 500) {
    super(message, 'SERVER_ERROR', statusCode);
    this.name = 'ServerError';
  }
}

/**
 * Convert an HTTP response to the appropriate error type.
 */
export function httpErrorFromResponse(
  statusCode: number,
  body?: unknown
): EmailBisonError {
  const message = extractErrorMessage(body);

  switch (statusCode) {
    case 400:
    case 422:
      return new ValidationError(message, extractFieldErrors(body));
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new ForbiddenError(message);
    case 404:
      return new NotFoundError();
    case 429:
      return new RateLimitError(extractRetryAfter(body));
    default:
      if (statusCode >= 500) {
        return new ServerError(message, statusCode);
      }
      return new EmailBisonError(
        message || `HTTP ${statusCode}`,
        'UNKNOWN_ERROR',
        statusCode,
        body
      );
  }
}

/**
 * Type guard to check if an error is an EmailBisonError.
 */
export function isEmailBisonError(error: unknown): error is EmailBisonError {
  return error instanceof EmailBisonError;
}

/**
 * Type guard for retryable errors (network issues, rate limits, server errors).
 */
export function isRetryableError(error: unknown): boolean {
  if (!isEmailBisonError(error)) {
    return false;
  }
  return (
    error.code === 'NETWORK_ERROR' ||
    error.code === 'TIMEOUT_ERROR' ||
    error.code === 'RATE_LIMIT_ERROR' ||
    error.code === 'SERVER_ERROR'
  );
}

// --- Internal helpers ---

function extractErrorMessage(body: unknown): string {
  if (!body || typeof body !== 'object') {
    return 'Request failed';
  }

  const obj = body as Record<string, unknown>;

  // Common error message field patterns
  if (typeof obj.message === 'string') return obj.message;
  if (typeof obj.error === 'string') return obj.error;
  if (typeof obj.detail === 'string') return obj.detail;
  
  // EmailBison pattern: { data: { success: false, message: "..." } }
  if (obj.data && typeof obj.data === 'object') {
    const data = obj.data as Record<string, unknown>;
    if (typeof data.message === 'string') return data.message;
  }
  
  if (obj.errors && Array.isArray(obj.errors) && obj.errors.length > 0) {
    const first = obj.errors[0];
    if (typeof first === 'string') return first;
    if (typeof first === 'object' && first && 'message' in first) {
      return String((first as { message: unknown }).message);
    }
  }

  return 'Request failed';
}

function extractFieldErrors(body: unknown): Record<string, string[]> | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const obj = body as Record<string, unknown>;

  // Laravel-style validation errors: { errors: { field: ["msg1", "msg2"] } }
  if (obj.errors && typeof obj.errors === 'object' && !Array.isArray(obj.errors)) {
    return obj.errors as Record<string, string[]>;
  }

  return undefined;
}

function extractRetryAfter(body: unknown): number | undefined {
  if (!body || typeof body !== 'object') {
    return undefined;
  }

  const obj = body as Record<string, unknown>;

  if (typeof obj.retry_after === 'number') {
    return obj.retry_after * 1000; // Convert seconds to ms
  }

  return undefined;
}

