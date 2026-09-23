'use client';

import { useState, useEffect } from 'react';
import useSWR from 'swr';
import CivicMap from '@/components/map/Map';
import FiltersPanel, { FilterState } from '@/components/filters/FiltersPanel';
import FacilityDetails from '@/components/facilities/FacilityDetails';
import FacilityList from '@/components/facilities/FacilityList';
import TrackTicket from '@/components/reports/TrackTicket';
import { fetchFacilities } from '@/lib/api';
import { useLocation } from '@/hooks/useLocation';
import { Facility } from '@/types';
import { AlertCircle, MapPin, Ticket } from 'lucide-react';

export default function Home() {
  const { location, requestLocation, isRequesting } = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTrackTicket, setShowTrackTicket] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: 'all',
    condition: 'all',
    availability: 'all',
    wheelchairAccessible: false,
    radius: 1000,
  });
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Use SWR for data fetching
  const { data: facilities, error, isLoading } = useSWR(
    ['facilities', filters.type, filters.condition, filters.availability, filters.wheelchairAccessible, filters.radius, location.latitude, location.longitude, searchQuery],
    () => fetchFacilities(filters.type, filters.condition, filters.wheelchairAccessible, filters.availability, location, filters.radius, searchQuery),
    { refreshInterval: 10000 } // Auto-refresh to pick up new reports
  );

  return (
    <main className="flex h-screen w-full flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white shadow-sm z-20 p-4 shrink-0 flex items-center justify-between border-b relative">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-blue-600">CIVICLENS</h1>
            <p className="text-sm text-gray-500 font-medium hidden sm:block">See. Verify. Access.</p>
          </div>
          <button 
            onClick={() => setShowTrackTicket(true)}
            className="hidden sm:flex items-center text-sm font-semibold text-gray-600 hover:text-blue-600 ml-4 transition-colors"
          >
            <Ticket className="w-4 h-4 mr-1.5" />
            Track Ticket
          </button>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowTrackTicket(true)}
            className="sm:hidden flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            aria-label="Track Ticket"
          >
            <Ticket className="w-5 h-5" />
          </button>
          {!location.permissionGranted && !location.permissionDenied && (
            <button 
              onClick={requestLocation}
              disabled={isRequesting}
              className="flex items-center px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-full text-sm font-semibold transition disabled:opacity-50"
            >
              <MapPin className="w-4 h-4 mr-2" />
              {isRequesting ? 'Locating...' : 'Find facilities near me'}
            </button>
          )}
          {location.permissionDenied && (
            <span className="text-sm text-orange-600 font-medium flex items-center bg-orange-50 px-3 py-1.5 rounded-full">
              <AlertCircle className="w-4 h-4 mr-1.5" />
              Location access denied
            </span>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative w-full h-full flex flex-col md:flex-row">
        
        {/* Left Side: Facility List (Desktop) or Bottom Sheet (Mobile) */}
        <div className="h-1/3 md:h-full md:w-96 shrink-0 order-2 md:order-1 z-20">
          <FacilityList 
            facilities={facilities || []} 
            selectedFacility={selectedFacility}
            onSelectFacility={setSelectedFacility}
          />
        </div>

        {/* Right Side: Map */}
        <div className="flex-1 relative h-2/3 md:h-full order-1 md:order-2">
          {isLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="bg-white p-4 rounded-xl shadow-lg flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-medium text-gray-700">Loading facilities...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="bg-red-50 text-red-700 p-6 rounded-xl shadow-lg max-w-sm text-center">
                <AlertCircle className="w-10 h-10 mx-auto mb-3 text-red-500" />
                <h3 className="font-bold mb-1">Unable to load facilities</h3>
                <p className="text-sm mb-4">There was a problem connecting to the server.</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Map */}
          <CivicMap 
            facilities={facilities || []} 
            selectedFacility={selectedFacility}
            onSelectFacility={setSelectedFacility}
            userLocation={location.permissionGranted ? {lat: location.latitude!, lng: location.longitude!} : undefined}
          />

          {/* Floating Components over Map */}
          <FiltersPanel 
            filters={filters} 
            onFilterChange={setFilters} 
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
          
          {/* Detail Panel overlay */}
          <FacilityDetails 
            facility={selectedFacility} 
            onClose={() => setSelectedFacility(null)} 
          />
        </div>
      </div>

      {showTrackTicket && (
        <TrackTicket onClose={() => setShowTrackTicket(false)} />
      )}
    </main>
  );
}
