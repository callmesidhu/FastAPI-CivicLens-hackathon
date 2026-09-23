'use client';

import { useState, useEffect, useRef } from 'react';
import * as maplibregl from 'maplibre-gl';
import Map, { Marker, NavigationControl, GeolocateControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Facility } from '@/types';
import { Droplet, MapPin, LocateFixed, Navigation, AlertTriangle, AlertCircle, X, Flame, Users, Satellite, Map as MapIcon } from 'lucide-react';

interface CivicMapProps {
  facilities: Facility[];
  onSelectFacility: (facility: Facility | null) => void;
  selectedFacility: Facility | null;
  userLocation?: { lat: number; lng: number };
  locationDenied?: boolean;
  onRequestLocation?: () => void;
  showHotspots?: boolean;
}

// Fix for Turbopack worker issue
if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}

// High-resolution Esri World Imagery raster style definition
const SATELLITE_STYLE: any = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      attribution: 'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community'
    }
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 19
    }
  ]
};

const STREET_STYLE = process.env.NEXT_PUBLIC_MAP_STYLE_URL || 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

export default function CivicMap({
  facilities,
  onSelectFacility,
  selectedFacility,
  userLocation,
  locationDenied,
  onRequestLocation,
  showHotspots = true,
}: CivicMapProps) {
  const mapRef = useRef<MapRef>(null);
  const [mapMode, setMapMode] = useState<'satellite' | 'street'>('satellite');
  const [dismissAlert, setDismissAlert] = useState(false);

  const [viewState, setViewState] = useState({
    longitude: userLocation?.lng || 76.2673, // Default around Kochi / Kerala
    latitude: userLocation?.lat || 9.9312,
    zoom: 13
  });

  // Recentering logic
  const handleRecenter = () => {
    if (onRequestLocation && !userLocation) {
      onRequestLocation();
    }
    if (userLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 15,
        duration: 1000
      });
    }
  };

  useEffect(() => {
    if (userLocation) {
      handleRecenter();
    }
  }, [userLocation]);

  // Center map when selected facility changes from outside
  useEffect(() => {
    if (selectedFacility && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedFacility.longitude, selectedFacility.latitude],
        zoom: 16,
        duration: 800
      });
    }
  }, [selectedFacility]);

  // Marker colors
  const getMarkerColor = (condition: string) => {
    switch (condition) {
      case 'clean':
      case 'usable':
        return 'text-emerald-600';
      case 'broken':
        return 'text-red-600';
      case 'locked':
      case 'no_water':
        return 'text-amber-500';
      default:
        return 'text-gray-500';
    }
  };

  const getMarkerBg = (condition: string) => {
    switch (condition) {
      case 'clean':
      case 'usable':
        return 'bg-emerald-50 border-emerald-400';
      case 'broken':
        return 'bg-red-50 border-red-500';
      case 'locked':
      case 'no_water':
        return 'bg-amber-50 border-amber-400';
      default:
        return 'bg-gray-100 border-gray-300';
    }
  };

  const isHotspot = (facility: Facility) => {
    return facility.condition === 'broken' || (facility.confidenceScore || 100) < 60;
  };

  const activeMapStyle = mapMode === 'satellite' ? SATELLITE_STYLE : STREET_STYLE;

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-inner">
      <Map
        ref={mapRef}
        mapLib={maplibregl}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={activeMapStyle}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />

        {/* User Location Pulse Marker */}
        {userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="center"
          >
            <div className="relative flex items-center justify-center">
              <div className="absolute w-8 h-8 bg-amber-400 rounded-full animate-ping opacity-75"></div>
              <div className="relative w-4 h-4 bg-white border-4 border-amber-500 rounded-full shadow-xl"></div>
            </div>
          </Marker>
        )}

        {/* Facility Markers */}
        {facilities.map((facility) => {
          const isSelected = selectedFacility?.id === facility.id;
          const hotspotActive = showHotspots && isHotspot(facility);

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
              <div className="relative flex flex-col items-center group cursor-pointer">
                {/* Hotspot Outer Halo */}
                {hotspotActive && (
                  <div className="absolute -inset-2 bg-red-500/25 rounded-full animate-pulse blur-xs" />
                )}

                {/* Marker Body */}
                <div 
                  className={`
                    relative p-2 rounded-full border-2 transition-all shadow-lg
                    ${getMarkerBg(facility.condition)}
                    ${isSelected ? 'scale-125 ring-4 ring-amber-400 ring-opacity-80 z-50 shadow-2xl' : 'hover:scale-115'}
                  `}
                  title={facility.name}
                >
                  {facility.type === 'toilet' ? (
                    <Users className={`w-4 h-4 sm:w-5 sm:h-5 ${getMarkerColor(facility.condition)}`} />
                  ) : (
                    <Droplet className={`w-4 h-4 sm:w-5 sm:h-5 ${getMarkerColor(facility.condition)} fill-current`} />
                  )}
                </div>

                {/* Tiny Pin Pointer Stem */}
                <div className="w-1.5 h-1.5 bg-gray-700 rotate-45 -mt-1 rounded-2xs" />
              </div>
            </Marker>
          );
        })}
      </Map>

      {/* Top-Right Map Controls: Satellite/Street Switcher & Use My Location */}
      <div className="absolute top-4 right-4 z-20 flex flex-col items-end space-y-2">
        {/* View Toggle */}
        <div className="bg-white/95 backdrop-blur-xs p-1 rounded-full shadow-xl border border-gray-200/90 flex items-center space-x-1">
          <button
            onClick={() => setMapMode('satellite')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
              mapMode === 'satellite'
                ? 'bg-amber-400 text-gray-950 font-black shadow-xs'
                : 'text-gray-700 hover:text-amber-600'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>
          <button
            onClick={() => setMapMode('street')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
              mapMode === 'street'
                ? 'bg-amber-400 text-gray-950 font-black shadow-xs'
                : 'text-gray-700 hover:text-amber-600'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Street</span>
          </button>
        </div>

        {/* Use My Location Button */}
        <button
          onClick={handleRecenter}
          className="flex items-center space-x-1.5 bg-white/95 backdrop-blur-xs hover:bg-white text-amber-700 border border-gray-200/90 shadow-lg px-4 py-2 rounded-full text-xs font-bold transition transform active:scale-95"
        >
          <Navigation className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span>Use My Location</span>
        </button>
      </div>

      {/* Top-Left Location Denied / Status Notification */}
      {locationDenied && !dismissAlert && (
        <div className="absolute top-4 left-4 z-20 max-w-xs sm:max-w-sm bg-blue-600 text-white px-4 py-3 rounded-2xl shadow-xl flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-white shrink-0 mt-0.5" />
          <div className="text-xs">
            <div className="font-extrabold text-sm mb-0.5">Location access was denied.</div>
            <div className="opacity-95 leading-relaxed">
              Click anywhere on the map or use the search bar to locate facilities manually.
            </div>
          </div>
          <button
            onClick={() => setDismissAlert(true)}
            className="text-white/80 hover:text-white p-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
