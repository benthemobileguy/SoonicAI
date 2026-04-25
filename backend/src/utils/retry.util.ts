/**
 * Retry utility with exponential backoff and jitter
 *
 * Based on best practices from:
 * - https://dev.to/young_gao/retry-patterns-that-actually-work-exponential-backoff-jitter-and-dead-letter-queues-75
 * - https://jean-marc.io/blog/stop-breaking-your-apis-how-to-implement-proper-retry-and-exponential-backoff-in-nestjs
 */

export interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;  // milliseconds
  maxDelay?: number;   // milliseconds
  jitter?: boolean;
  shouldRetry?: (error: any) => boolean;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  baseDelay: 1000,  // 1 second
  maxDelay: 8000,   // 8 seconds
  jitter: true,
  shouldRetry: (error: any) => {
    // Retry on network errors and specific HTTP status codes
    if (error.code === 'ECONNREFUSED') return true;
    if (error.code === 'ETIMEDOUT') return true;
    if (error.code === 'ENOTFOUND') return true;

    // Retry on 503 (Service Unavailable) and 429 (Rate Limited)
    if (error.response?.status === 503) return true;
    if (error.response?.status === 429) return true;

    // Don't retry on client errors
    if (error.response?.status >= 400 && error.response?.status < 500) {
      return false;
    }

    return false;
  },
};

/**
 * Add jitter to delay to prevent thundering herd problem
 * Randomizes delay by ±10% to spread out retry attempts
 */
function addJitter(delay: number): number {
  const jitterRange = delay * 0.1;  // ±10%
  const jitterAmount = (Math.random() * 2 - 1) * jitterRange;
  return Math.floor(delay + jitterAmount);
}

/**
 * Calculate exponential backoff delay
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
  useJitter: boolean,
): number {
  // Exponential backoff: baseDelay * (2 ^ attempt)
  let delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

  if (useJitter) {
    delay = addJitter(delay);
  }

  return delay;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 *
 * @param fn - Async function to retry
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function result or rejects after all retries fail
 *
 * @example
 * ```typescript
 * const result = await retryWithBackoff(
 *   async () => axios.post('https://api.example.com/analyze', data),
 *   { maxRetries: 3, baseDelay: 1000 }
 * );
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const config = { ...DEFAULT_OPTIONS, ...options };
  let lastError: any;

  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      // First attempt or retry attempt
      return await fn();
    } catch (error) {
      lastError = error;

      // Check if we should retry this error
      if (!config.shouldRetry(error)) {
        console.log(`[Retry] Error not retryable: ${error.message}`);
        throw error;
      }

      // Check if we have retries left
      if (attempt >= config.maxRetries) {
        console.error(
          `[Retry] All ${config.maxRetries} retries exhausted for: ${error.message}`,
        );
        throw error;
      }

      // Calculate delay for this attempt
      const delay = calculateDelay(
        attempt,
        config.baseDelay,
        config.maxDelay,
        config.jitter,
      );

      console.log(
        `[Retry] Attempt ${attempt + 1}/${config.maxRetries} failed: ${error.message}. ` +
        `Retrying in ${delay}ms...`,
      );

      // Wait before retrying
      await sleep(delay);
    }
  }

  // This should never be reached due to throw in the loop, but TypeScript needs it
  throw lastError;
}
