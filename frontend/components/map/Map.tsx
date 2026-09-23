'use client';

import { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Facility } from '@/types';
import { Droplet, MapPin, LocateFixed } from 'lucide-react';

interface CivicMapProps {
  facilities: Facility[];
  onSelectFacility: (facility: Facility | null) => void;
  selectedFacility: Facility | null;
  userLocation?: { lat: number; lng: number };
}

// Fix for Turbopack worker issue
if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}

export default function CivicMap({ facilities, onSelectFacility, selectedFacility, userLocation }: CivicMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] = useState({
    longitude: userLocation?.lng || 76.9366,
    latitude: userLocation?.lat || 8.5241,
    zoom: 12
  });

  // Recentering logic
  const handleRecenter = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        duration: 1000
      });
    }
  };

  useEffect(() => {
    if (userLocation) {
      handleRecenter();
    }
  }, [userLocation]);

  // Calculate icon colors based on condition
  const getMarkerColor = (condition: string) => {
    switch (condition) {
      case 'clean':
      case 'usable':
        return 'text-green-600';
      case 'broken':
        return 'text-red-600';
      case 'locked':
      case 'no_water':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  const getMarkerBg = (condition: string) => {
    switch (condition) {
      case 'clean':
      case 'usable':
        return 'bg-green-100 border-green-300';
      case 'broken':
        return 'bg-red-100 border-red-300';
      case 'locked':
      case 'no_water':
        return 'bg-orange-100 border-orange-300';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  // Center map when selected facility changes from outside (e.g. search list)
  useEffect(() => {
    if (selectedFacility) {
      setViewState((prev) => ({
        ...prev,
        longitude: selectedFacility.longitude,
        latitude: selectedFacility.latitude,
        zoom: 15
      }));
    }
  }, [selectedFacility]);

  const mapStyleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

  return (
    <div className="w-full h-full relative">
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={mapStyleUrl}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />

        {userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="center"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute w-6 h-6 bg-blue-500 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-4 h-4 bg-white border-4 border-blue-600 rounded-full shadow-lg"></div>
            </div>
          </Marker>
        )}

        {facilities.map((facility) => {
          const isSelected = selectedFacility?.id === facility.id;
          
          return (
            <Marker
              key={facility.id}
              longitude={facility.longitude}
              latitude={facility.latitude}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                onSelectFacility(facility);
              }}
            >
              <div 
                className={`
                  p-2 rounded-full border-2 cursor-pointer transition-all shadow-md
                  ${getMarkerBg(facility.condition)}
                  ${isSelected ? 'scale-125 ring-4 ring-blue-500 ring-opacity-50 z-50' : 'hover:scale-110'}
                `}
                title={facility.name}
              >
                {facility.type === 'toilet' ? (
                  <div className={`font-bold ${getMarkerColor(facility.condition)}`} style={{fontSize: '18px'}}>🚻</div>
                ) : (
                  <Droplet className={`w-5 h-5 ${getMarkerColor(facility.condition)}`} />
                )}
              </div>
            </Marker>
          );
        })}
      </Map>

      {userLocation && (
        <button
          onClick={handleRecenter}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-lg font-medium text-sm text-gray-700 flex items-center hover:bg-gray-50 transition-colors z-10"
        >
          <LocateFixed className="w-4 h-4 mr-2 text-blue-600" />
          Recenter
        </button>
      )}
    </div>
  );
}
