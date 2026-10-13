/**
 * Lightweight Client-Side SWR (Stale-While-Revalidate) Cache Utility
 * Leverages browser sessionStorage to enable 0ms instant data hydration
 * when users browse, navigate back from product detail pages, or search.
 */

interface CacheEnvelope<T> {
  data: T;
  timestamp: number;
}

export function getSessionCache<T>(key: string, maxAgeMs = 1000 * 60 * 15): T | null {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return null;
    const raw = sessionStorage.getItem(`rj:swr:${key}`);
    if (!raw) return null;
    const envelope: CacheEnvelope<T> = JSON.parse(raw);
    // If not expired
    if (Date.now() - envelope.timestamp < maxAgeMs) {
      return envelope.data;
    }
    sessionStorage.removeItem(`rj:swr:${key}`);
    return null;
  } catch {
    return null;
  }
}

export function setSessionCache<T>(key: string, data: T): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    const envelope: CacheEnvelope<T> = {
      data,
      timestamp: Date.now(),
    };
    sessionStorage.setItem(`rj:swr:${key}`, JSON.stringify(envelope));
  } catch {
    // Gracefully ignore quota limit or storage exceptions
  }
}

export function clearSessionCache(pattern?: string): void {
  try {
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    if (!pattern) {
      sessionStorage.clear();
      return;
    }
    const keysToRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const k = sessionStorage.key(i);
      if (k && k.includes(pattern)) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach((k) => sessionStorage.removeItem(k));
  } catch {
    // Ignore storage exceptions
  }
}
