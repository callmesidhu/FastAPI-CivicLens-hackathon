import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Facility } from '@/types';

interface CivicLensDB extends DBSchema {
  facilities: {
    key: string;
    value: Facility;
  };
  metadata: {
    key: string;
    value: { id: string; value: any };
  };
  pendingReports: {
    key: string;
    value: {
      localReportId: string;
      facilityId: string;
      condition: string;
      description?: string;
      imageUrl?: string;
      createdAt: string;
      status: 'pending' | 'syncing' | 'synced' | 'failed';
      idempotencyKey: string;
      ticketNumber: string | null;
    };
    indexes: { 'by-status': string };
  };
  tickets: {
    key: string;
    value: any; // The full ticket object
  };
}

let dbPromise: Promise<IDBPDatabase<CivicLensDB>> | null = null;

export async function getDB() {
  if (typeof window === 'undefined') return null; // Prevent SSR errors
  
  if (!dbPromise) {
    dbPromise = openDB<CivicLensDB>('civiclens-db', 1, {
      upgrade(db) {
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
      },
    });
  }
  return dbPromise;
}

// Facilities
export async function cacheFacilities(facilities: Facility[]) {
  const db = await getDB();
  if (!db) return;
  const tx = db.transaction('facilities', 'readwrite');
  await Promise.all([
    ...facilities.map((f) => tx.store.put(f)),
    tx.done
  ]);
  
  await setMetadata('lastFacilitySyncAt', new Date().toISOString());
}

export async function getCachedFacilities(): Promise<Facility[]> {
  const db = await getDB();
  if (!db) return [];
  return db.getAll('facilities');
}

// Metadata
export async function setMetadata(id: string, value: any) {
  const db = await getDB();
  if (!db) return;
  await db.put('metadata', { id, value });
}

export async function getMetadata(id: string) {
  const db = await getDB();
  if (!db) return null;
  const data = await db.get('metadata', id);
  return data ? data.value : null;
}

// Reports
export async function savePendingReport(report: any) {
  const db = await getDB();
  if (!db) return;
  await db.put('pendingReports', report);
}

export async function getPendingReports() {
  const db = await getDB();
  if (!db) return [];
  return db.getAllFromIndex('pendingReports', 'by-status', 'pending');
}

export async function updateReportStatus(localReportId: string, status: 'pending' | 'syncing' | 'synced' | 'failed', ticketNumber: string | null = null) {
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

// Tickets
export async function cacheTicket(ticket: any) {
  const db = await getDB();
  if (!db) return;
  await db.put('tickets', ticket);
}

export async function getCachedTicket(ticketNumber: string) {
  const db = await getDB();
  if (!db) return null;
  return db.get('tickets', ticketNumber);
}
