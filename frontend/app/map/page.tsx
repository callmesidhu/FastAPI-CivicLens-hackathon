'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import Navbar from '@/components/ui/Navbar';
import CivicDashboardCard, { DashboardFilterState } from '@/components/facilities/CivicDashboardCard';
import CivicMap from '@/components/map/Map';
import PinInspectionPanel from '@/components/facilities/PinInspectionPanel';
import ReportForm from '@/components/reports/ReportForm';
import TicketSuccess from '@/components/reports/TicketSuccess';
import TrackTicket from '@/components/reports/TrackTicket';
import SyncManager from '@/components/sync/SyncManager';
import Footer from '@/components/ui/Footer';
import { fetchFacilities } from '@/lib/api';
import { useLocation } from '@/hooks/useLocation';
import { Facility } from '@/types';
import { Flame, AlertCircle, ArrowLeft } from 'lucide-react';

export default function MapPage() {
  const { location, requestLocation } = useLocation();

  const [filters, setFilters] = useState<DashboardFilterState>({
    status: 'all',
    type: 'all',
    radius: 50000,
    dateRange: 'all',
    searchQuery: '',
    hotspotsOnly: false,
  });

  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [reportingFacility, setReportingFacility] = useState<Facility | null>(null);
  const [showTrackTicket, setShowTrackTicket] = useState(false);
  const [ticketSuccessData, setTicketSuccessData] = useState<{ ticket: any; facility: Facility } | null>(null);

  // SWR Data Fetching
  const { data: rawFacilities, error, isLoading } = useSWR(
    [
      'facilities',
      filters.type,
      filters.status,
      filters.radius,
      location.latitude,
      location.longitude,
      filters.searchQuery,
    ],
    () =>
      fetchFacilities(
        filters.type === 'all' ? undefined : filters.type,
        filters.status === 'all' ? undefined : filters.status,
        undefined,
        undefined,
        location,
        filters.radius,
        filters.searchQuery
      ),
    { refreshInterval: 12000 }
  );

  const allFacilities = useMemo(() => rawFacilities || [], [rawFacilities]);

  // Client-side Hotspots Filtering
  const displayedFacilities = useMemo(() => {
    return allFacilities.filter((f) => {
      if (filters.hotspotsOnly) {
        return f.condition === 'broken' || (f.confidenceScore || 100) < 60;
      }
      return true;
    });
  }, [allFacilities, filters.hotspotsOnly]);

  const toggleHotspots = () => {
    setFilters((prev) => ({ ...prev, hotspotsOnly: !prev.hotspotsOnly }));
  };

  const handleOpenReport = () => {
    if (selectedFacility) {
      setReportingFacility(selectedFacility);
    } else if (allFacilities.length > 0) {
      setSelectedFacility(allFacilities[0]);
      setReportingFacility(allFacilities[0]);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0f4f9]">
      {/* Top Navbar */}
      <Navbar
        onOpenTrackTicket={() => setShowTrackTicket(true)}
        onOpenReport={handleOpenReport}
      />

      {/* Breadcrumb / Back Link */}
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <Link
          href="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-gray-500 hover:text-amber-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home Overview</span>
        </Link>
      </div>

      {/* Main Map Portal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Civic Dashboard Card with KPI and Filters */}
        <CivicDashboardCard
          facilities={allFacilities}
          filters={filters}
          onFilterChange={setFilters}
          onToggleHotspots={toggleHotspots}
        />

        {/* Map Header Status & Hotspots Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 px-1">
          <div className="inline-flex items-center space-x-2 text-xs sm:text-sm font-bold text-gray-800">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>
              Displaying {displayedFacilities.length} of {allFacilities.length} Verified Civic Amenities
            </span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleHotspots}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition border shadow-2xs ${
                filters.hotspotsOnly
                  ? 'bg-red-500 text-white border-red-500 shadow-xs'
                  : 'bg-white text-red-600 border-red-200 hover:bg-red-50'
              }`}
            >
              <Flame className={`w-3.5 h-3.5 ${filters.hotspotsOnly ? 'text-white' : 'text-red-500'}`} />
              <span>Hotspots: {filters.hotspotsOnly ? 'ON' : 'OFF'}</span>
            </button>
          </div>
        </div>

        {/* Split Grid: Map View & Pin Inspection Panel */}
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">
          {/* Left: Map Container */}
          <div className="flex-1 bg-white rounded-3xl border border-gray-200/80 shadow-xs p-2 h-[560px] md:h-[640px] relative overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-xs z-30 flex items-center justify-center">
                <div className="bg-white px-5 py-3 rounded-2xl shadow-lg border border-gray-100 flex items-center space-x-3">
                  <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-bold text-gray-700">Loading civic infrastructure...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs z-30 flex items-center justify-center p-4">
                <div className="bg-white border border-red-100 shadow-xl rounded-2xl p-5 max-w-sm text-center">
                  <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
                  <div className="text-sm font-bold text-gray-900 mb-1">Failed to connect to backend</div>
                  <p className="text-xs text-gray-500 mb-3">Operating with cached offline civic data if available.</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                  >
                    Retry
                  </button>
                </div>
              </div>
            )}

            <CivicMap
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
            />
          </div>

          {/* Right: Transparency Pin Inspection Panel */}
          <div className="lg:w-96 shrink-0 flex">
            <PinInspectionPanel
              facility={selectedFacility}
              onReportIssue={(facility) => setReportingFacility(facility)}
              onClose={() => setSelectedFacility(null)}
            />
          </div>
        </div>
      </main>

      {/* Offline Sync Manager Widget */}
      <SyncManager />

      {/* Issue Report Form Modal */}
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

      {/* Ticket Success Confirmation Modal */}
      {ticketSuccessData && (
        <TicketSuccess
          ticketData={ticketSuccessData.ticket}
          facility={ticketSuccessData.facility}
          onClose={() => setTicketSuccessData(null)}
          onTrack={() => {
            setTicketSuccessData(null);
            setShowTrackTicket(true);
          }}
        />
      )}

      {/* Track Ticket Modal */}
      {showTrackTicket && (
        <TrackTicket onClose={() => setShowTrackTicket(false)} />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
