import { Facility } from '@/types';
import { cacheFacilities, getCachedFacilities, savePendingReport, cacheTicket, getCachedTicket } from './db';
import { v4 as uuidv4 } from 'uuid';

export interface LocationState {
  latitude: number | null;
  longitude: number | null;
  permissionGranted: boolean;
  permissionDenied: boolean;
}

export async function fetchFacilities(
  type?: string,
  condition?: string,
  wheelchairAccessible?: boolean,
  availability?: string,
  location?: LocationState,
  radius?: number,
  searchQuery?: string
): Promise<Facility[]> {
  const isOnline = typeof window !== 'undefined' && navigator.onLine;

  if (!isOnline) {
    console.log("Offline mode: Fetching facilities from IndexedDB");
    let facilities = await getCachedFacilities();
    
    // Perform simple filtering on cached data
    if (searchQuery) {
      facilities = facilities.filter(f => 
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.address.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (type && type !== 'all') {
      const targetType = type === 'water' ? 'drinking_water' : type;
      facilities = facilities.filter(f => f.type === targetType || (targetType === 'drinking_water' && (f.type as string) === 'water'));
    }
    if (condition && condition !== 'all') {
      facilities = facilities.filter(f => f.condition === condition);
    }
    if (availability && availability !== 'all') {
      facilities = facilities.filter(f => f.availability === availability);
    }
    if (wheelchairAccessible) {
      facilities = facilities.filter(f => f.accessibility?.wheelchairAccessible);
    }
    
    return facilities;
  }

  let url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/facilities`);
  
  const userLat = location?.latitude ?? 10.0070408;
  const userLng = location?.longitude ?? 76.3656069;

  if (searchQuery) {
    url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/facilities/search`);
    url.searchParams.append('q', searchQuery);
  } else if (userLat && userLng) {
    url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/facilities/nearby`);
    url.searchParams.append('lat', userLat.toString());
    url.searchParams.append('lng', userLng.toString());
    if (radius) url.searchParams.append('radius', radius.toString());
  }
  
  if (!searchQuery) {
    if (type && type !== 'all') {
      const queryType = type === 'water' ? 'drinking_water' : type;
      url.searchParams.append('type', queryType);
    }
    if (condition && condition !== 'all') url.searchParams.append('condition', condition);
    if (availability && availability !== 'all') url.searchParams.append('availability', availability);
    if (wheelchairAccessible) url.searchParams.append('wheelchairAccessible', 'true');
  }

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch facilities');
  }
  const json = await res.json();
  await cacheFacilities(json.data);
  return json.data;
}

export async function uploadImage(file: File | Blob, filename: string = "image.jpg"): Promise<string> {
  const isOnline = typeof window !== 'undefined' && navigator.onLine;
  if (!isOnline) {
    throw new Error('Cannot upload image while offline');
  }

  const formData = new FormData();
  // Ensure we have a File object or at least a Blob with a filename
  formData.append('file', file, filename);

  const url = `${process.env.NEXT_PUBLIC_API_URL}/uploads/`;
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Failed to upload image');
  }
  const data = await res.json();
  return data.imageUrl;
}

export async function submitReport(facilityId: string, condition: string, description?: string, imageUrl?: string) {
  const isOnline = typeof window !== 'undefined' && navigator.onLine;
  const idempotencyKey = uuidv4();
  
  if (!isOnline) {
    console.log("Offline mode: Queueing report locally");
    const localReportId = `OFF-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const reportData = {
      localReportId,
      facilityId,
      condition,
      description,
      imageUrl,
      createdAt: new Date().toISOString(),
      status: 'pending' as const,
      idempotencyKey,
      ticketNumber: null
    };
    
    await savePendingReport(reportData);
    
    return {
      reportId: localReportId,
      ticketNumber: localReportId,
      status: 'pending sync',
      priority: 'calculated on sync',
      localBody: 'Pending Sync',
      department: 'Pending Sync',
      expectedResponse: 'When online'
    };
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/reports`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'X-Idempotency-Key': idempotencyKey
    },
    body: JSON.stringify({ facilityId, condition, description, imageUrl })
  });
  
  if (!res.ok) {
    throw new Error('Failed to submit report');
  }
  const data = await res.json();
  await cacheTicket(data);
  return data;
}

export async function fetchTicket(ticketNumber: string) {
  const isOnline = typeof window !== 'undefined' && navigator.onLine;
  
  if (!isOnline) {
    console.log("Offline mode: Fetching ticket from IndexedDB");
    const cached = await getCachedTicket(ticketNumber);
    if (cached) return cached;
    throw new Error('Ticket not found in local cache');
  }

  const url = `${process.env.NEXT_PUBLIC_API_URL}/tickets/${ticketNumber}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    throw new Error('Failed to fetch ticket');
  }
  const data = await res.json();
  await cacheTicket(data);
  return data;
}
