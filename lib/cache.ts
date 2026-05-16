/**
 * Server-side in-memory TTL cache.
 * Prevents duplicate upstream API calls across concurrent Next.js requests.
 * Resets on server restart — acceptable for live sports data.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

// Module-level singleton (persists across requests in the same Node process)
const store = new Map<string, CacheEntry<unknown>>();

/**
 * Returns cached data if still fresh, otherwise calls `fn` and caches the result.
 * @param key  Cache key
 * @param ttlMs  Time-to-live in milliseconds
 * @param fn  Async function that fetches fresh data
 */
export async function cached<T>(
  key: string,
  ttlMs: number,
  fn: () => Promise<T>
): Promise<T> {
  const entry = store.get(key) as CacheEntry<T> | undefined;
  if (entry && Date.now() < entry.expiresAt) {
    return entry.data;
  }
  const data = await fn();
  store.set(key, { data, expiresAt: Date.now() + ttlMs });
  return data;
}

/** Manually invalidate a cache entry (e.g. after a mutation). */
export function invalidate(key: string) {
  store.delete(key);
}

/** Clear entire cache (useful in tests). */
export function clearAll() {
  store.clear();
}
