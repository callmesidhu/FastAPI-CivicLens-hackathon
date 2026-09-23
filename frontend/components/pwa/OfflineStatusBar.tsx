'use client';

import { useEffect, useState } from 'react';
import { WifiOff, RefreshCw, CheckCircle2, Database } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useCacheWarmUp } from '@/hooks/useCacheWarmUp';
import { formatDistanceToNow } from 'date-fns';

export default function OfflineStatusBar() {
  const { isOnline } = useNetworkStatus();
  const { lastSyncAt, cachedCount, syncing } = useCacheWarmUp();

  // Show "back online" flash for 4 seconds after reconnecting
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    if (isOnline && lastSyncAt) {
      setJustReconnected(true);
      const t = setTimeout(() => setJustReconnected(false), 4000);
      return () => clearTimeout(t);
    }
  }, [isOnline, lastSyncAt]);

  // Nothing to show when online and stable
  if (isOnline && !justReconnected && !syncing) return null;

  const syncedAgo = lastSyncAt
    ? formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true })
    : null;

  // ── Back online / sync in progress banner ──
  if (isOnline) {
    return (
      <div
        className={`
          fixed top-0 inset-x-0 z-[10000]
          transition-all duration-500
          ${syncing ? 'bg-[#3D1860]' : 'bg-emerald-600'}
        `}
      >
        <div className="flex items-center justify-center gap-2 py-1.5 px-4">
          {syncing ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
              <span className="text-white text-[11px] font-semibold">Syncing map data…</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span className="text-white text-[11px] font-semibold">
                Back online — {cachedCount} facilities cached
              </span>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── Offline banner ──
  return (
    <div className="fixed top-0 inset-x-0 z-[10000] bg-amber-500">
      <div className="flex items-center justify-center gap-2 py-1.5 px-4 flex-wrap">
        <WifiOff className="w-3.5 h-3.5 text-white shrink-0" />
        <span className="text-white text-[11px] font-bold">Offline mode</span>
        {syncedAgo ? (
          <span className="text-amber-100 text-[10px] flex items-center gap-1">
            <Database className="w-3 h-3" />
            {cachedCount} facilities cached · synced {syncedAgo}
          </span>
        ) : (
          <span className="text-amber-100 text-[10px]">No cached data available</span>
        )}
      </div>
    </div>
  );
}
