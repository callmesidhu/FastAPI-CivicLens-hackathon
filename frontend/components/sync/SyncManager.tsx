'use client';

import { useEffect, useState, useCallback } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getPendingReports, updateReportStatus, cacheTicket } from '@/lib/db';
import { uploadImage, getApiBaseUrl } from '@/lib/api';
import { RefreshCw } from 'lucide-react';

/**
 * SyncManager — handles offline report queue sync.
 * Offline/online UI is handled by OfflineStatusBar; this only shows when
 * there are pending reports to upload.
 */
export default function SyncManager() {
  const { isOnline } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');

  const checkPending = useCallback(async () => {
    const reports = await getPendingReports();
    setPendingCount(reports.length);
  }, []);

  useEffect(() => {
    checkPending();
  }, [checkPending, isOnline]);

  // Register Background Sync tag when coming back online
  useEffect(() => {
    if (!isOnline || typeof window === 'undefined') return;
    navigator.serviceWorker?.ready
      .then((reg) => {
        if ('sync' in reg) {
          return (reg as unknown as { sync: { register: (tag: string) => Promise<void> } }).sync
            .register('sync-offline-reports');
        }
      })
      .catch(() => {
        // Browser doesn't support Background Sync — fall back to inline sync
      });
  }, [isOnline]);

  // Listen for SW message to trigger sync
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type === 'SW_SYNC_TRIGGER') {
        syncNow();
      }
    };
    navigator.serviceWorker?.addEventListener('message', handler);
    return () => navigator.serviceWorker?.removeEventListener('message', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncNow = async () => {
    if (!navigator.onLine || isSyncing) return;

    setIsSyncing(true);
    setSyncStatus('Starting sync...');

    const reports = await getPendingReports();

    for (let i = 0; i < reports.length; i++) {
      const report = reports[i];
      setSyncStatus(`Syncing ${i + 1} of ${reports.length}...`);

      try {
        await updateReportStatus(report.localReportId, 'syncing');

        let finalImageUrl = report.imageUrl;

        // If it's a base64 image (offline cache), upload it first
        if (finalImageUrl && finalImageUrl.startsWith('data:image/')) {
          setSyncStatus(`Uploading image ${i + 1} of ${reports.length}...`);
          try {
            const response = await fetch(finalImageUrl);
            const blob = await response.blob();
            finalImageUrl = await uploadImage(blob, `offline-${report.localReportId}.jpg`);
          } catch {
            finalImageUrl = undefined;
          }
        }

        const res = await fetch(`${getApiBaseUrl()}/reports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Idempotency-Key': report.idempotencyKey,
          },
          body: JSON.stringify({
            facilityId: report.facilityId,
            condition: report.condition,
            description: report.description,
            imageUrl: finalImageUrl,
            userEmail: report.userEmail,
          }),
        });

        if (res.ok) {
          const data = await res.json();
          await updateReportStatus(report.localReportId, 'synced', data.ticketNumber);
          await cacheTicket(data);

          // Notify SW that a sync completed
          navigator.serviceWorker?.controller?.postMessage({
            type: 'CACHE_WARMUP_DONE',
            count: reports.length - i - 1,
          });
        } else {
          await updateReportStatus(report.localReportId, 'pending');
        }
      } catch {
        await updateReportStatus(report.localReportId, 'pending');
      }
    }

    setSyncStatus('');
    setIsSyncing(false);
    checkPending();
  };

  // Auto-sync when online with pending reports
  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      syncNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline, pendingCount]);

  // Hide widget entirely when nothing to show
  if (pendingCount === 0 && !syncStatus) return null;

  return (
    <div className="fixed bottom-32 md:bottom-4 right-4 z-[200] flex justify-end pointer-events-none">
      <div className="bg-[#3D1860] border border-[#BB99CD]/40 text-[#F5EDF7] shadow-xl rounded-2xl px-4 py-3 flex items-center gap-3 text-sm font-medium pointer-events-auto max-w-xs">
        {isSyncing ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-[#BB99CD] shrink-0" />
            <span className="text-xs">{syncStatus}</span>
          </>
        ) : (
          <>
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse shrink-0" />
            <span className="text-xs">
              {pendingCount} report{pendingCount > 1 ? 's' : ''} waiting to sync
            </span>
            <button
              onClick={syncNow}
              className="ml-1 bg-[#643579] hover:bg-[#BB99CD] hover:text-[#3D1860] px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              Sync
            </button>
          </>
        )}
      </div>
    </div>
  );
}
