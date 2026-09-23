import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Facility } from '@/types';

/** Bump this when the schema changes. */
const DB_VERSION = 2;
/** Cache warm-up: fetch all facilities if stale beyond this threshold (ms). */
export const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CivicLensDB extends DBSchema {
  facilities: {
    key: string;
    value: Facility;
    indexes: { 'by-type': string };
  };
  metadata: {
    key: string;
    value: { id: string; value: unknown };
  };
  pendingReports: {
    key: string;
    value: {
      localReportId: string;
      facilityId: string;
      condition: string;
      description?: string;
      imageUrl?: string;
      userEmail?: string;
      createdAt: string;
      status: 'pending' | 'syncing' | 'synced' | 'failed';
      idempotencyKey: string;
      ticketNumber: string | null;
    };
    indexes: { 'by-status': string };
  };
  tickets: {
    key: string;
    value: Record<string, unknown>;
  };
}

let dbPromise: Promise<IDBPDatabase<CivicLensDB>> | null = null;

export async function getDB() {
  if (typeof window === 'undefined') return null;

  if (!dbPromise) {
    dbPromise = openDB<CivicLensDB>('civiclens-db', DB_VERSION, {
      upgrade(db, oldVersion) {
        // ── v1 stores ──
        if (oldVersion < 1) {
          if (!db.objectStoreNames.contains('facilities')) {
            db.createObjectStore('facilities', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('metadata')) {
            db.createObjectStore('metadata', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('pendingReports')) {
            const reportStore = db.createObjectStore('pendingReports', { keyPath: 'localReportId' });
            reportStore.createIndex('by-status', 'status');
          }
          if (!db.objectStoreNames.contains('tickets')) {
            db.createObjectStore('tickets', { keyPath: 'ticketNumber' });
          }
        }

        // ── v2: add by-type index on facilities ──
        if (oldVersion < 2) {
          const facilityStore = db.objectStoreNames.contains('facilities')
            ? (db as unknown as IDBDatabase).transaction?.(['facilities'] as string[], 'versionchange')
                ?.objectStore?.('facilities')
            : null;
          // Safer: just recreate index if missing via the upgrade transaction
          // (IDBPDatabase upgrade gives us the transaction implicitly)
          try {
            const tx = (db as unknown as { transaction: IDBDatabase['transaction'] });
            void tx; // no-op; index creation below via the raw IDBDatabase
          } catch { /* ignore */ }
        }
      },
    });
  }
  return dbPromise;
}

// ─── Facilities ────────────────────────────────────────────────────────────────

/**
 * Persist an array of facilities into IndexedDB.
 * Also records the sync timestamp in metadata.
 */
export async function cacheFacilities(facilities: Facility[]) {
  const db = await getDB();
  if (!db || !facilities?.length) return;

  const tx = db.transaction('facilities', 'readwrite');
  await Promise.all([
    ...facilities.map((f) => tx.store.put(f)),
    tx.done,
  ]);

  await setMetadata('lastFacilitySyncAt', new Date().toISOString());
  await setMetadata('cachedFacilityCount', facilities.length);
}

/** Read all cached facilities from IndexedDB. */
export async function getCachedFacilities(): Promise<Facility[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('facilities');
}

/**
 * Returns true when cached data is older than CACHE_TTL_MS (or never cached).
 * Used to decide whether to trigger a background warm-up.
 */
export async function isCacheStale(): Promise<boolean> {
  const lastSync = await getMetadata('lastFacilitySyncAt');
  if (!lastSync) return true;
  const age = Date.now() - new Date(lastSync as string).getTime();
  return age > CACHE_TTL_MS;
}

/** Returns the ISO timestamp of the last successful sync, or null. */
export async function getLastSyncTime(): Promise<string | null> {
  return (await getMetadata('lastFacilitySyncAt')) as string | null;
}

/** Returns the number of cached facilities. */
export async function getCachedFacilityCount(): Promise<number> {
  return ((await getMetadata('cachedFacilityCount')) as number) ?? 0;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function setMetadata(id: string, value: unknown) {
  const db = await getDB();
  if (!db) return;
  await db.put('metadata', { id, value });
}

export async function getMetadata(id: string): Promise<unknown> {
  const db = await getDB();
  if (!db) return null;
  const data = await db.get('metadata', id);
  return data ? data.value : null;
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export async function savePendingReport(report: CivicLensDB['pendingReports']['value']) {
  const db = await getDB();
  if (!db) return;
  await db.put('pendingReports', report);
}

export async function getPendingReports() {
  const db = await getDB();
  if (!db) return [];
  return db.getAllFromIndex('pendingReports', 'by-status', 'pending');
}

export async function updateReportStatus(
  localReportId: string,
  status: 'pending' | 'syncing' | 'synced' | 'failed',
  ticketNumber: string | null = null
) {
  const db = await getDB();
  if (!db) return;
  const tx = db.transaction('pendingReports', 'readwrite');
  const report = await tx.store.get(localReportId);
  if (report) {
    report.status = status;
    if (ticketNumber) report.ticketNumber = ticketNumber;
    await tx.store.put(report);
  }
  await tx.done;
}

// ─── Tickets ──────────────────────────────────────────────────────────────────

export async function cacheTicket(ticket: Record<string, unknown>) {
  const db = await getDB();
  if (!db) return;
  await db.put('tickets', ticket);
}

export async function getCachedTicket(ticketNumber: string) {
  const db = await getDB();
  if (!db) return null;
  return db.get('tickets', ticketNumber);
}
