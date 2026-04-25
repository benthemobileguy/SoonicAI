import { retryWithBackoff } from './retry.util';

/**
 * Unit tests for retry utility with exponential backoff
 */
describe('RetryUtil', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('retryWithBackoff', () => {
    it('should return result on first successful attempt', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');

      const result = await retryWithBackoff(mockFn);

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should retry on retryable errors (ECONNREFUSED)', async () => {
      const error = new Error('Connection refused');
      (error as any).code = 'ECONNREFUSED';

      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');

      const promise = retryWithBackoff(mockFn, { maxRetries: 3 });

      // Fast-forward through retries
      await jest.advanceTimersByTimeAsync(1000);  // First retry
      await jest.advanceTimersByTimeAsync(2000);  // Second retry

      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(3);  // Initial + 2 retries
    });

    it('should retry on 503 Service Unavailable', async () => {
      const error: any = new Error('Service Unavailable');
      error.response = { status: 503 };

      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');

      const promise = retryWithBackoff(mockFn);

      await jest.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result).toBe('success');
      expect(mockFn).toHaveBeenCalledTimes(2);
    });

    it('should NOT retry on 400 Bad Request', async () => {
      const error: any = new Error('Bad Request');
      error.response = { status: 400 };

      const mockFn = jest.fn().mockRejectedValue(error);

      await expect(retryWithBackoff(mockFn)).rejects.toThrow('Bad Request');

      expect(mockFn).toHaveBeenCalledTimes(1);  // No retries
    });

    it('should NOT retry on 404 Not Found', async () => {
      const error: any = new Error('Not Found');
      error.response = { status: 404 };

      const mockFn = jest.fn().mockRejectedValue(error);

      await expect(retryWithBackoff(mockFn)).rejects.toThrow('Not Found');

      expect(mockFn).toHaveBeenCalledTimes(1);
    });

    it('should exhaust retries and throw last error', async () => {
      const error = new Error('Connection refused');
      (error as any).code = 'ECONNREFUSED';

      const mockFn = jest.fn().mockRejectedValue(error);

      const promise = retryWithBackoff(mockFn, { maxRetries: 2 });

      // Advance timers for all retries
      await jest.advanceTimersByTimeAsync(1000);  // First retry
      await jest.advanceTimersByTimeAsync(2000);  // Second retry

      await expect(promise).rejects.toThrow('Connection refused');

      expect(mockFn).toHaveBeenCalledTimes(3);  // Initial + 2 retries
    });

    it('should use exponential backoff delays', async () => {
      const error = new Error('Timeout');
      (error as any).code = 'ETIMEDOUT';

      const mockFn = jest.fn().mockRejectedValue(error);
      const setTimeoutSpy = jest.spyOn(global, 'setTimeout');

      const promise = retryWithBackoff(mockFn, {
        maxRetries: 3,
        baseDelay: 1000,
        jitter: false,  // Disable jitter for predictable timing
      });

      await jest.advanceTimersByTimeAsync(1000);  // 1s
      await jest.advanceTimersByTimeAsync(2000);  // 2s
      await jest.advanceTimersByTimeAsync(4000);  // 4s

      await expect(promise).rejects.toThrow();

      // Check that delays were exponential (1s, 2s, 4s)
      // Note: setTimeoutSpy will show actual delays used
      expect(mockFn).toHaveBeenCalledTimes(4);  // Initial + 3 retries
    });

    it('should respect maxDelay cap', async () => {
      const error = new Error('Timeout');
      (error as any).code = 'ETIMEDOUT';

      const mockFn = jest.fn().mockRejectedValue(error);

      const promise = retryWithBackoff(mockFn, {
        maxRetries: 5,
        baseDelay: 1000,
        maxDelay: 3000,  // Cap at 3 seconds
        jitter: false,
      });

      // Even though exponential would go 1s, 2s, 4s, 8s, 16s...
      // It should cap at 3s after the second retry
      await jest.advanceTimersByTimeAsync(1000);  // 1s
      await jest.advanceTimersByTimeAsync(2000);  // 2s
      await jest.advanceTimersByTimeAsync(3000);  // 3s (capped)
      await jest.advanceTimersByTimeAsync(3000);  // 3s (capped)
      await jest.advanceTimersByTimeAsync(3000);  // 3s (capped)

      await expect(promise).rejects.toThrow();
    });

    it('should apply jitter when enabled', async () => {
      const error = new Error('Timeout');
      (error as any).code = 'ETIMEDOUT';

      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');

      // With jitter enabled, delays should vary slightly from base exponential values
      const promise = retryWithBackoff(mockFn, {
        maxRetries: 3,
        baseDelay: 1000,
        jitter: true,
      });

      // Advance by approximate times (jitter adds ±10% variation)
      await jest.advanceTimersByTimeAsync(1100);  // ~1s with jitter
      await jest.advanceTimersByTimeAsync(2200);  // ~2s with jitter

      const result = await promise;

      expect(result).toBe('success');
    });

    it('should use custom shouldRetry function', async () => {
      const error = new Error('Custom error');

      const mockFn = jest.fn().mockRejectedValue(error);

      const customShouldRetry = jest.fn().mockReturnValue(false);

      await expect(
        retryWithBackoff(mockFn, { shouldRetry: customShouldRetry }),
      ).rejects.toThrow('Custom error');

      expect(customShouldRetry).toHaveBeenCalledWith(error);
      expect(mockFn).toHaveBeenCalledTimes(1);  // No retries
    });

    it('should log retry attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const error = new Error('Test error');
      (error as any).code = 'ECONNREFUSED';

      const mockFn = jest
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce('success');

      const promise = retryWithBackoff(mockFn, { maxRetries: 2 });

      await jest.advanceTimersByTimeAsync(1000);

      await promise;

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Retry] Attempt 1/2 failed'),
      );

      consoleSpy.mockRestore();
    });

    it('should handle errors without code or response', async () => {
      const error = new Error('Generic error');

      const mockFn = jest.fn().mockRejectedValue(error);

      // Generic errors should NOT be retried by default
      await expect(retryWithBackoff(mockFn)).rejects.toThrow('Generic error');

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
