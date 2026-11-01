const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Runs `task`; if it throws, waits for the next delay in `delays` and tries again.
 * Rethrows the last error once the delays are used up. Used for short network blips
 * on optional and checkout-critical backend reads; never for order submission.
 */
export async function withRetry<T>(task: () => Promise<T>, delays: number[] = [1000, 3000]): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await task();
    } catch (error) {
      if (attempt >= delays.length) throw error;
      await sleep(delays[attempt]);
    }
  }
}
