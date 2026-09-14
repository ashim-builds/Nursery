/**
 * In-Memory Memory-Bounded LRU + TTL Cache
 * Designed for high performance, zero memory leaks, and sub-millisecond lookups.
 */

interface CacheEntry<T> {
  value: T;
  expiresAt: number; // timestamp in ms
}

export class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();
  private readonly maxSize: number;
  private hits = 0;
  private misses = 0;

  constructor(maxSize = 1000) {
    this.maxSize = maxSize;

    // Background cleanup of expired keys every 60 seconds (unref prevents holding event loop open)
    const cleanupTimer = setInterval(() => this.pruneExpired(), 60000);
    if (typeof cleanupTimer.unref === 'function') {
      cleanupTimer.unref();
    }
  }

  /**
   * Prune expired entries to maintain a tight memory footprint
   */
  pruneExpired(): number {
    const now = Date.now();
    let pruned = 0;
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
        pruned++;
      }
    }
    return pruned;
  }

  /**
   * Retrieve a value from the cache if not expired.
   */
  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return null;
    }

    // Refresh LRU order (delete and re-insert)
    this.store.delete(key);
    this.store.set(key, entry);
    this.hits++;
    return entry.value as T;
  }

  /**
   * Store a value with a TTL (in seconds).
   */
  set<T>(key: string, value: T, ttlSeconds = 300): void {
    // If cache is at capacity, evict the oldest inserted key (first entry in Map)
    if (this.store.size >= this.maxSize) {
      const oldestKey = this.store.keys().next().value;
      if (oldestKey) {
        this.store.delete(oldestKey);
      }
    }

    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  /**
   * Delete a specific cache key.
   */
  del(key: string): boolean {
    return this.store.delete(key);
  }

  /**
   * Invalidate all keys matching a prefix or regex pattern.
   * e.g., clearPattern('products:*') or clearPattern('categories:*')
   */
  clearPattern(pattern: string | RegExp): number {
    let cleared = 0;
    const isRegex = pattern instanceof RegExp;
    const prefix = typeof pattern === 'string' && pattern.endsWith('*') ? pattern.slice(0, -1) : null;

    for (const key of this.store.keys()) {
      let match = false;
      if (isRegex) {
        match = pattern.test(key);
      } else if (prefix) {
        match = key.startsWith(prefix);
      } else {
        match = key.includes(pattern as string);
      }

      if (match) {
        this.store.delete(key);
        cleared++;
      }
    }
    return cleared;
  }

  /**
   * Clear all items.
   */
  clear(): void {
    this.store.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * Get cached value or fetch fresh from producer function.
   */
  async getOrSet<T>(key: string, fetcher: () => Promise<T>, ttlSeconds = 300): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    this.set(key, fresh, ttlSeconds);
    return fresh;
  }

  /**
   * Cache diagnostics and statistics.
   */
  getStats() {
    return {
      size: this.store.size,
      maxSize: this.maxSize,
      hits: this.hits,
      misses: this.misses,
      hitRatio: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(3) : '0.000',
    };
  }
}

// Global shared cache instances with distinct memory ceilings
export const appCache = new MemoryCache(1500);
export const siteSettingsCache = new MemoryCache(100);
export const catalogCache = new MemoryCache(800);
