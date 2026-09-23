'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import useSWR from 'swr';
import CivicMap, { CivicMapHandle } from '@/components/map/Map';
import MapSearchBar from '@/components/map/MapSearchBar';
import MapBottomSheet from '@/components/map/MapBottomSheet';
import ReportForm from '@/components/reports/ReportForm';
import TicketSuccess from '@/components/reports/TicketSuccess';
import TrackTicket from '@/components/reports/TrackTicket';
import SyncManager from '@/components/sync/SyncManager';
import { fetchFacilities } from '@/lib/api';
import { useLocation } from '@/hooks/useLocation';
import { Facility } from '@/types';
import { AlertCircle } from 'lucide-react';
import { DashboardFilterState } from '@/components/facilities/CivicDashboardCard';

export default function MapPage() {
  const { location, requestLocation } = useLocation();
  const civicMapRef = useRef<CivicMapHandle>(null);
  const [locating, setLocating] = useState(false);

  const handleFindMe = useCallback(() => {
    setLocating(true);
    civicMapRef.current?.findMe();
    // Reset after 6 s max in case geolocation never resolves
    setTimeout(() => setLocating(false), 6000);
  }, []);

  const [filters, setFilters] = useState<DashboardFilterState>({
    status: 'all',
    type: 'all',
    radius: 50000,
    dateRange: 'all',
    searchQuery: '',
    hotspotsOnly: false,
    condition: 'all',
    availability: 'all',
    wheelchair: false,
  });

  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [reportingFacility, setReportingFacility] = useState<Facility | null>(null);
  const [showTrackTicket, setShowTrackTicket] = useState(false);
  const [ticketSuccessData, setTicketSuccessData] = useState<{ ticket: any; facility: Facility } | null>(null);

  const { data: rawFacilities, error, isLoading } = useSWR(
    ['facilities', filters.type, filters.status, filters.radius, location.latitude, location.longitude, filters.searchQuery],
    () => fetchFacilities(
      filters.type === 'all' ? undefined : (filters.type === 'water' ? 'drinking_water' : filters.type),
      filters.status === 'all' ? undefined : filters.status,
      undefined, undefined, location, filters.radius, filters.searchQuery
    ),
    { refreshInterval: 12000 }
  );

  const allFacilities = useMemo(() => rawFacilities || [], [rawFacilities]);

  const displayedFacilities = useMemo(() => {
    return allFacilities.filter((f) => {
      if (filters.type && filters.type !== 'all') {
        const targetType = filters.type === 'water' ? 'drinking_water' : filters.type;
        if (f.type !== targetType) return false;
      }
      if (filters.hotspotsOnly && !(f.condition === 'broken' || (f.confidenceScore || 100) < 60)) return false;
      if (filters.condition !== 'all' && f.condition !== filters.condition) return false;
      if (filters.availability !== 'all' && f.availability !== filters.availability) return false;
      if (filters.wheelchair && !(f.accessibility?.wheelchairAccessible || (f as any).wheelchairAccessible)) return false;
      return true;
    });
  }, [allFacilities, filters.type, filters.hotspotsOnly, filters.condition, filters.availability, filters.wheelchair]);

  const toggleHotspots = () => setFilters((prev) => ({ ...prev, hotspotsOnly: !prev.hotspotsOnly }));

  return (
    /* Full viewport — no navbar, no footer. Pure map experience like Rapido */
    <div className="fixed inset-0 overflow-hidden bg-gray-900">

      {/* ── BASE LAYER: Full-screen map ── */}
      <div className="absolute inset-0">
        <CivicMap
          ref={civicMapRef}
          facilities={displayedFacilities}
          selectedFacility={selectedFacility}
          onSelectFacility={setSelectedFacility}
          userLocation={
            location.permissionGranted && location.latitude && location.longitude
              ? { lat: location.latitude, lng: location.longitude }
              : undefined
          }
          locationDenied={location.permissionDenied}
          onRequestLocation={requestLocation}
          showHotspots={filters.hotspotsOnly}
          radius={filters.radius}
        />
      </div>

      {/* ── TOP OVERLAY: Rapido-style search/filter bar ── */}
      <MapSearchBar
        filters={filters}
        onFilterChange={setFilters}
        totalCount={allFacilities.length}
        displayedCount={displayedFacilities.length}
        onFindMe={handleFindMe}
        locating={locating}
      />

      {/* ── Loading toast ── */}
      {isLoading && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-lg border border-gray-100 flex items-center gap-2.5">
            <div className="w-3.5 h-3.5 border-2 border-[#3D1860] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-gray-700">Loading civic data…</span>
          </div>
        </div>
      )}

      {/* ── Error toast ── */}
      {error && (
        <div className="absolute top-36 left-1/2 -translate-x-1/2 z-40 max-w-xs w-full px-4">
          <div className="bg-white border border-red-100 shadow-xl rounded-2xl p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-900 mb-0.5">Backend unavailable</p>
              <p className="text-[11px] text-gray-500 mb-2">Operating with cached offline data if available.</p>
              <button onClick={() => window.location.reload()} className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition">Retry</button>
            </div>
          </div>
        </div>
      )}

      {/* ── BOTTOM OVERLAY: Rapido-style bottom sheet ── */}
      <MapBottomSheet
        facilities={displayedFacilities}
        allFacilities={allFacilities}
        selectedFacility={selectedFacility}
        onSelectFacility={setSelectedFacility}
        onReportIssue={(facility) => setReportingFacility(facility)}
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Offline sync widget */}
      <SyncManager />

      {/* Modals */}
      {reportingFacility && (
        <ReportForm
          facility={reportingFacility}
          onClose={() => setReportingFacility(null)}
          onSuccess={(ticketData) => {
            setTicketSuccessData({ ticket: ticketData, facility: reportingFacility });
            setReportingFacility(null);
          }}
        />
      )}

      {ticketSuccessData && (
        <TicketSuccess
          ticketData={ticketSuccessData.ticket}
          facility={ticketSuccessData.facility}
          onClose={() => setTicketSuccessData(null)}
          onTrack={() => { setTicketSuccessData(null); setShowTrackTicket(true); }}
        />
      )}

      {showTrackTicket && <TrackTicket onClose={() => setShowTrackTicket(false)} />}
    </div>
  );
}
