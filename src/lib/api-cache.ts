"use client";

import { useCallback, useEffect, useState } from "react";

// Module-level cache shared across screens: navigating back to a screen
// renders instantly from cache while revalidating in the background.
const cache = new Map<string, unknown>();
const inflight = new Map<string, Promise<unknown>>();

export function invalidateApiCache(prefix = "") {
  for (const key of [...cache.keys()]) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

function fetchJson<T>(url: string): Promise<T> {
  const pending = inflight.get(url);
  if (pending) return pending as Promise<T>;

  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: unknown = await res.json();
      cache.set(url, data);
      return data;
    } finally {
      inflight.delete(url);
    }
  })();

  inflight.set(url, promise);
  return promise as Promise<T>;
}

interface ApiQueryResult<T> {
  data: T | null;
  error: boolean;
  reload: () => Promise<void>;
}

/**
 * Fetches `url` with stale-while-revalidate semantics. Pass `null` to skip
 * fetching. Returns cached data immediately when available; `error` is only
 * true when there is no cached data to show.
 */
export function useApiQuery<T>(url: string | null): ApiQueryResult<T> {
  const [data, setData] = useState<T | null>(() =>
    url !== null && cache.has(url) ? (cache.get(url) as T) : null
  );
  const [error, setError] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(url);

  // Reset derived state during render when the url prop changes.
  if (url !== currentUrl) {
    setCurrentUrl(url);
    setData(url !== null && cache.has(url) ? (cache.get(url) as T) : null);
    setError(false);
  }

  const reload = useCallback(async () => {
    if (url === null) return;
    try {
      const fresh = await fetchJson<T>(url);
      setData(fresh);
      setError(false);
    } catch {
      if (!cache.has(url)) setError(true);
    }
  }, [url]);

  useEffect(() => {
    if (url === null) return;
    let cancelled = false;
    fetchJson<T>(url)
      .then((fresh) => {
        if (!cancelled) {
          setData(fresh);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled && !cache.has(url)) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, [url]);

  return { data, error, reload };
}
