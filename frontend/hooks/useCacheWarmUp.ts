'use client';

import { useEffect, useRef, useState } from 'react';
import { isCacheStale, cacheFacilities, getLastSyncTime, getCachedFacilityCount } from '@/lib/db';
import { getApiBaseUrl } from '@/lib/api';

interface WarmUpState {
  /** ISO timestamp of last successful background sync, or null if never. */
  lastSyncAt: string | null;
  /** How many facilities are currently cached in IndexedDB. */
  cachedCount: number;
  /** True while a background sync is in progress. */
  syncing: boolean;
}

/**
 * useCacheWarmUp
 *
 * On mount (and whenever the app comes back online) this hook:
 *   1. Checks if the IDB facility cache is stale (> 30 min old or empty).
 *   2. If stale AND online: fetches ALL facilities from the backend and
 *      writes them into IndexedDB for offline use.
 *   3. Exposes `lastSyncAt` and `cachedCount` so the UI can show staleness.
 *
 * The fetch is intentionally fire-and-forget — it never blocks the UI.
 */
export function useCacheWarmUp(): WarmUpState {
  const [state, setState] = useState<WarmUpState>({
    lastSyncAt: null,
    cachedCount: 0,
    syncing: false,
  });

  // Prevent concurrent warm-up runs
  const warmingRef = useRef(false);

  const runWarmUp = async () => {
    if (warmingRef.current) return;
    if (typeof window === 'undefined' || !navigator.onLine) return;

    const stale = await isCacheStale();
    if (!stale) {
      // Cache is fresh — just refresh the displayed metadata
      const [lastSyncAt, cachedCount] = await Promise.all([
        getLastSyncTime(),
        getCachedFacilityCount(),
      ]);
      setState((prev) => ({ ...prev, lastSyncAt, cachedCount }));
      return;
    }

    warmingRef.current = true;
    setState((prev) => ({ ...prev, syncing: true }));

    try {
      // Fetch all facilities (no filters, large radius = all data)
      const url = new URL(`${getApiBaseUrl()}/facilities`);

      const res = await fetch(url.toString(), { cache: 'no-store' });
      if (!res.ok) throw new Error(`Warm-up fetch failed: ${res.status}`);

      const json = await res.json();
      const facilities = json.data ?? json ?? [];

      if (Array.isArray(facilities) && facilities.length > 0) {
        await cacheFacilities(facilities);
      }

      const [lastSyncAt, cachedCount] = await Promise.all([
        getLastSyncTime(),
        getCachedFacilityCount(),
      ]);

      setState({ lastSyncAt, cachedCount, syncing: false });
    } catch (err) {
      console.warn('[CacheWarmUp] Background sync failed:', err);
      setState((prev) => ({ ...prev, syncing: false }));
    } finally {
      warmingRef.current = false;
    }
  };

  useEffect(() => {
    // Run once on mount
    runWarmUp();

    // Re-run every time the browser comes back online
    window.addEventListener('online', runWarmUp);
    return () => window.removeEventListener('online', runWarmUp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
