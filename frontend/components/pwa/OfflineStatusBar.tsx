'use client';

import { WifiOff, RefreshCw, Database } from 'lucide-react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useCacheWarmUp } from '@/hooks/useCacheWarmUp';
import { formatDistanceToNow } from 'date-fns';

export default function OfflineStatusBar() {
  const { isOnline } = useNetworkStatus();
  const { lastSyncAt, cachedCount, syncing } = useCacheWarmUp();

  // Show syncing banner while warm-up is in progress (online)
  if (isOnline && syncing) {
    return (
      <div className="fixed top-0 inset-x-0 z-[10000] bg-[#3D1860] transition-all duration-500">
        <div className="flex items-center justify-center gap-2 py-1.5 px-4">
          <RefreshCw className="w-3.5 h-3.5 text-white animate-spin" />
          <span className="text-white text-[11px] font-semibold">Syncing map data…</span>
        </div>
      </div>
    );
  }

  // Nothing to show when online and stable
  if (isOnline) return null;

  const syncedAgo = lastSyncAt
    ? formatDistanceToNow(new Date(lastSyncAt), { addSuffix: true })
    : null;

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
