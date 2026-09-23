import { useEffect, useState, useCallback } from 'react';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getPendingReports, updateReportStatus, cacheTicket } from '@/lib/db';
import { uploadImage } from '@/lib/api';
import { RefreshCw, WifiOff, CheckCircle } from 'lucide-react';

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
    const interval = setInterval(checkPending, 5000);
    return () => clearInterval(interval);
  }, [checkPending]);

  const syncNow = async () => {
    if (!isOnline || isSyncing) return;
    
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
            // Convert base64 to Blob
            const response = await fetch(finalImageUrl);
            const blob = await response.blob();
            finalImageUrl = await uploadImage(blob, `offline-${report.localReportId}.jpg`);
          } catch (uploadErr) {
            console.error('Failed to upload offline image:', uploadErr);
            // Decide whether to fail the report or proceed without the image. Let's proceed without it.
            finalImageUrl = undefined;
          }
        }
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'X-Idempotency-Key': report.idempotencyKey
          },
          body: JSON.stringify({ 
            facilityId: report.facilityId, 
            condition: report.condition, 
            description: report.description,
            imageUrl: finalImageUrl
          })
        });

        if (res.ok) {
          const data = await res.json();
          await updateReportStatus(report.localReportId, 'synced', data.ticketNumber);
          await cacheTicket(data);
        } else {
          await updateReportStatus(report.localReportId, 'pending'); // Re-queue
        }
      } catch (err) {
        await updateReportStatus(report.localReportId, 'pending'); // Re-queue
      }
    }
    
    setSyncStatus('');
    setIsSyncing(false);
    checkPending();
  };

  useEffect(() => {
    if (isOnline && pendingCount > 0 && !isSyncing) {
      syncNow();
    }
  }, [isOnline, pendingCount, isSyncing]);

  if (isOnline && pendingCount === 0 && !syncStatus) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center pointer-events-none p-2">
      <div className="bg-gray-900 text-white shadow-xl rounded-full px-4 py-2 flex items-center space-x-3 text-sm font-medium animate-in slide-in-from-top-4 pointer-events-auto">
        {!isOnline && (
          <>
            <WifiOff className="w-4 h-4 text-orange-400" />
            <span>Offline mode — showing cached data</span>
          </>
        )}
        
        {isOnline && isSyncing && (
          <>
            <RefreshCw className="w-4 h-4 animate-spin text-blue-400" />
            <span>{syncStatus}</span>
          </>
        )}
        
        {isOnline && !isSyncing && pendingCount > 0 && (
          <>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            <span>{pendingCount} report{pendingCount > 1 ? 's' : ''} waiting to sync</span>
            <button 
              onClick={syncNow}
              className="ml-2 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs transition-colors"
            >
              Sync now
            </button>
          </>
        )}
      </div>
    </div>
  );
}
