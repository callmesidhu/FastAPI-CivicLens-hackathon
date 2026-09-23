'use client';

import { useState, useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import * as maplibregl from 'maplibre-gl';
import Map, { Marker, NavigationControl, GeolocateControl, MapRef, Source, Layer } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Facility } from '@/types';
import { Droplet, MapPin, LocateFixed, AlertCircle, X, Flame, Users, Satellite, Map as MapIcon, Navigation } from 'lucide-react';

export interface MapRoute {
  coordinates: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  destinationName: string;
}

interface CivicMapProps {
  facilities: Facility[];
  onSelectFacility: (facility: Facility | null) => void;
  selectedFacility: Facility | null;
  userLocation?: { lat: number; lng: number };
  locationDenied?: boolean;
  onRequestLocation?: () => void;
  showHotspots?: boolean;
  radius?: number; // metres — drives auto-zoom + circle
  is3D?: boolean;
  activeRoute?: MapRoute | null;
  onClearRoute?: () => void;
}

export interface CivicMapHandle {
  findMe: () => void;
  isLocating: boolean;
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

/** Map radius → zoom level so the full circle fits the viewport */
function radiusToZoom(metres: number): number {
  if (metres <= 1000)  return 13;
  if (metres <= 5000)  return 11;
  if (metres <= 10000) return 10;
  return 8; // 50 km
}

/**
 * Build a GeoJSON polygon that approximates a circle.
 * @param lng  centre longitude
 * @param lat  centre latitude
 * @param radiusM  radius in metres
 * @param steps  number of polygon vertices (more = smoother)
 */
function generateCircleGeoJSON(
  lng: number, lat: number, radiusM: number, steps = 64
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const earthRadius = 6371000; // metres
  const angularDist = radiusM / earthRadius;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;

  for (let i = 0; i <= steps; i++) {
    const bearing = (2 * Math.PI * i) / steps;
    const pLat = Math.asin(
      Math.sin(latRad) * Math.cos(angularDist) +
      Math.cos(latRad) * Math.sin(angularDist) * Math.cos(bearing)
    );
    const pLng = lngRad + Math.atan2(
      Math.sin(bearing) * Math.sin(angularDist) * Math.cos(latRad),
      Math.cos(angularDist) - Math.sin(latRad) * Math.sin(pLat)
    );
    coords.push([
      (pLng * 180) / Math.PI,
      (pLat * 180) / Math.PI,
    ]);
  }

  return {
    type: 'Feature',
    geometry: { type: 'Polygon', coordinates: [coords] },
    properties: {},
  };
}

const CivicMap = forwardRef<CivicMapHandle, CivicMapProps>(function CivicMap({
  facilities,
  onSelectFacility,
  selectedFacility,
  userLocation,
  locationDenied,
  onRequestLocation,
  showHotspots = true,
  radius,
  is3D = false,
  activeRoute = null,
  onClearRoute,
}, ref) {
  const mapRef = useRef<MapRef>(null);
  const [mapMode, setMapMode] = useState<'satellite' | 'street'>('satellite');
  const [dismissAlert, setDismissAlert] = useState(false);
  const [locating, setLocating] = useState(false);

  // Auto-fit camera when navigation route is set
  useEffect(() => {
    if (activeRoute && activeRoute.coordinates.length > 1 && mapRef.current) {
      const lngs = activeRoute.coordinates.map((c) => c[0]);
      const lats = activeRoute.coordinates.map((c) => c[1]);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);
      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);

      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
        { padding: { top: 130, bottom: 220, left: 60, right: 60 }, duration: 1000 }
      );
    }
  }, [activeRoute]);

  const [viewState, setViewState] = useState({
    longitude: userLocation?.lng || 76.3656, // Default around Jain University, Kakkanad, Kochi
    latitude: userLocation?.lat || 10.0070,
    zoom: radius ? radiusToZoom(radius) : 14,
    pitch: is3D ? 65 : 0,
    bearing: is3D ? -25 : 0,
  });

  // Auto-zoom when the radius filter changes
  useEffect(() => {
    if (radius == null) return;
    const zoom = radiusToZoom(radius);
    const lng = userLocation?.lng || 76.3656;
    const lat = userLocation?.lat || 10.0070;
    if (mapRef.current) {
      mapRef.current.flyTo({ center: [lng, lat], zoom, duration: 900, essential: true });
    } else {
      setViewState((prev) => ({ ...prev, longitude: lng, latitude: lat, zoom }));
    }
  }, [radius]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle 2D vs 3D camera pitch and bearing
  useEffect(() => {
    const targetPitch = is3D ? 65 : 0;
    const targetBearing = is3D ? -25 : 0;

    setViewState((prev) => ({
      ...prev,
      pitch: targetPitch,
      bearing: targetBearing,
    }));

    if (mapRef.current) {
      mapRef.current.easeTo({
        pitch: targetPitch,
        bearing: targetBearing,
        duration: 800,
        essential: true,
      });
    }
  }, [is3D]);

  // Fly to user — called both on button click and when location resolves
  const flyToUser = useCallback((loc: { lat: number; lng: number }) => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [loc.lng, loc.lat],
        zoom: 16,
        pitch: is3D ? 65 : 0,
        bearing: is3D ? -25 : 0,
        duration: 1200,
        essential: true,
      });
    }
    setLocating(false);
  }, [is3D]);

  // "Find Me" button handler
  const handleFindMe = useCallback(() => {
    if (userLocation) {
      flyToUser(userLocation);
    } else {
      setLocating(true);
      onRequestLocation?.();
    }
  }, [userLocation, flyToUser, onRequestLocation]);

  // Expose findMe() and isLocating to parent via ref
  useImperativeHandle(ref, () => ({
    findMe: handleFindMe,
    isLocating: locating,
  }), [handleFindMe, locating]);

  // When location resolves (after requesting), fly there
  useEffect(() => {
    if (userLocation) {
      flyToUser(userLocation);
    }
  }, [userLocation]);

  // Center map when selected facility changes from outside
  useEffect(() => {
    if (selectedFacility && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedFacility.longitude, selectedFacility.latitude],
        zoom: 16,
        pitch: is3D ? 65 : 0,
        bearing: is3D ? -25 : 0,
        duration: 800
      });
    }
  }, [selectedFacility, is3D]);

  // Marker condition dot
  const getConditionDot = (condition: string) => {
    switch (condition) {
      case 'clean':
      case 'usable':
        return 'bg-emerald-500';
      case 'broken':
        return 'bg-red-500';
      case 'locked':
        return 'bg-amber-500';
      case 'no_water':
        return 'bg-orange-500';
      default:
        return 'bg-gray-400';
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
        pitch={viewState.pitch}
        bearing={viewState.bearing}
        maxPitch={85}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle={activeMapStyle}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />

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

                {/* Marker Body — Theme Squircle Badge */}
                <div 
                  className={`
                    relative p-2 rounded-2xl bg-[#F5EDF7] border-2 border-[#BB99CD] transition-all shadow-md flex items-center justify-center
                    ${isSelected ? 'scale-125 ring-4 ring-[#643579]/40 z-50 shadow-2xl' : 'hover:scale-115'}
                  `}
                  title={facility.name}
                >
                  {/* Status Indicator Dot */}
                  <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ring-2 ring-white ${getConditionDot(facility.condition)}`} />

                  {facility.type === 'toilet' ? (
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D1860]" />
                  ) : (
                    <Droplet className="w-4 h-4 sm:w-5 sm:h-5 text-[#3D1860] fill-[#643579]/20" />
                  )}
                </div>

                {/* Tiny Pin Pointer Stem */}
                <div className="w-2 h-2 bg-[#BB99CD] rotate-45 -mt-1 rounded-2xs shadow-2xs" />
              </div>
            </Marker>
          );
        })}

        {/* Radius circle layer */}
        {radius && (() => {
          const lng = userLocation?.lng || 76.3656;
          const lat = userLocation?.lat || 10.0070;
          const circleData = generateCircleGeoJSON(lng, lat, radius);
          return (
            <Source id="radius-circle" type="geojson" data={circleData}>
              {/* Translucent fill */}
              <Layer
                id="radius-fill"
                type="fill"
                paint={{
                  'fill-color': '#643579',
                  'fill-opacity': 0.07,
                }}
              />
              {/* Dashed outline stroke */}
              <Layer
                id="radius-outline"
                type="line"
                paint={{
                  'line-color': '#643579',
                  'line-width': 2,
                  'line-opacity': 0.6,
                  'line-dasharray': [4, 3],
                }}
              />
            </Source>
          );
        })()}

        {/* Active In-App Navigation Route Layer */}
        {activeRoute && activeRoute.coordinates.length > 1 && (
          <Source
            id="active-route"
            type="geojson"
            data={{
              type: 'FeatureCollection',
              features: [
                {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'LineString',
                    coordinates: activeRoute.coordinates,
                  },
                },
                {
                  type: 'Feature',
                  properties: {},
                  geometry: {
                    type: 'MultiPoint',
                    coordinates: activeRoute.coordinates,
                  },
                },
              ],
            }}
          >
            {/* Outer route casing / glow */}
            <Layer
              id="route-casing"
              type="line"
              filter={['==', '$type', 'LineString']}
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
              paint={{
                'line-color': '#1d4ed8',
                'line-width': 10,
                'line-opacity': 0.6,
              }}
            />
            {/* Main vibrant navigation route line */}
            <Layer
              id="route-line"
              type="line"
              filter={['==', '$type', 'LineString']}
              layout={{
                'line-join': 'round',
                'line-cap': 'round',
              }}
              paint={{
                'line-color': '#2563eb',
                'line-width': 6,
              }}
            />
            {/* White waypoint dot markers along turn corners (like user screenshot) */}
            <Layer
              id="route-points"
              type="circle"
              filter={['==', '$type', 'Point']}
              paint={{
                'circle-radius': 4.5,
                'circle-color': '#ffffff',
                'circle-stroke-width': 2.5,
                'circle-stroke-color': '#1d4ed8',
              }}
            />
          </Source>
        )}

        {/* Floating ETA Badge at Destination (pixel-matched to user screenshot) */}
        {activeRoute && activeRoute.coordinates.length > 0 && (
          <Marker
            longitude={activeRoute.coordinates[activeRoute.coordinates.length - 1][0]}
            latitude={activeRoute.coordinates[activeRoute.coordinates.length - 1][1]}
            anchor="bottom"
            offset={[0, -50]}
            style={{ zIndex: 25 }}
          >
            <div className="bg-white/98 backdrop-blur-md rounded-xl shadow-2xl border-2 border-gray-800/80 px-3 py-1.5 flex flex-col items-center animate-in zoom-in-95 pointer-events-auto select-none">
              <div className="text-xs font-black text-gray-900 leading-tight">
                {activeRoute.durationSeconds > 60
                  ? `${Math.round(activeRoute.durationSeconds / 60)} min`
                  : '1 min'}
              </div>
              <div className="text-[11px] text-gray-600 font-bold leading-tight">
                {activeRoute.distanceMeters >= 1000
                  ? `${(activeRoute.distanceMeters / 1000).toFixed(1)} km`
                  : `${Math.round(activeRoute.distanceMeters)}m`}
              </div>
              {/* Pointer beak */}
              <div className="w-2.5 h-2.5 bg-white border-r-2 border-b-2 border-gray-800/80 rotate-45 -mb-2 mt-0.5" />
            </div>
          </Marker>
        )}

        {/* User Location Marker — Rendered on map canvas with zIndex 20 (below bottom sheet z-30) */}
        {userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="center"
            style={{ zIndex: 20 }}
          >
            <div
              className="relative flex items-center justify-center cursor-pointer pointer-events-auto"
              title="My Location"
            >
              <div className="absolute w-8 h-8 rounded-full bg-[#643579]/30 animate-ping" />
              <div className="relative w-7 h-7 rounded-full bg-[#643579]/35 border-2 border-white shadow-xl flex items-center justify-center">
                <div className="w-4 h-4 rounded-full bg-[#3D1860] border-2 border-white shadow-md flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
            </div>
          </Marker>
        )}
      </Map>

      {/* Floating Active Navigation Header Bar */}
      {activeRoute && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 bg-[#3D1860] text-white px-4 py-2.5 rounded-full shadow-2xl border border-[#BB99CD]/50 animate-in slide-in-from-top-4 duration-200">
          <Navigation className="w-4 h-4 fill-current text-[#BB99CD] animate-pulse shrink-0" />
          <div className="text-xs font-bold truncate max-w-[180px] sm:max-w-xs">
            {activeRoute.destinationName}
          </div>
          <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-extrabold text-[#F5EDF7] shrink-0">
            {activeRoute.durationSeconds > 60
              ? `${Math.round(activeRoute.durationSeconds / 60)} min`
              : '1 min'}
          </span>
          {onClearRoute && (
            <button
              onClick={onClearRoute}
              className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer text-white/80 hover:text-white shrink-0 ml-1"
              title="End Navigation"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Floating "My Location" Floating Action Button */}
      <div className="absolute bottom-24 right-4 z-20">
        <button
          onClick={handleFindMe}
          disabled={locating}
          className="flex items-center gap-2 bg-white/95 backdrop-blur-md text-[#3D1860] hover:bg-[#F5EDF7] border border-[#BB99CD]/50 shadow-xl px-4 py-2.5 rounded-full text-xs font-extrabold transition transform active:scale-95 cursor-pointer"
          title="Recenter Map to My Location"
        >
          {locating ? (
            <span className="w-4 h-4 border-2 border-[#3D1860] border-t-transparent rounded-full animate-spin" />
          ) : (
            <Navigation className="w-4 h-4 fill-[#643579] text-[#643579]" />
          )}
          <span>{locating ? 'Locating…' : 'My Location'}</span>
        </button>
      </div>

      {/* Top-Right Map Controls: Satellite/Street Switcher */}
      <div className="absolute top-4 right-4 z-20">
        {/* View Toggle */}
        <div className="bg-white/95 backdrop-blur-xs p-1 rounded-full shadow-xl border border-[#BB99CD]/40 flex items-center space-x-1">
          <button
            onClick={() => setMapMode('satellite')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
              mapMode === 'satellite'
                ? 'bg-[#3D1860] text-white shadow-xs'
                : 'text-gray-700 hover:text-[#3D1860]'
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite</span>
          </button>
          <button
            onClick={() => setMapMode('street')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition ${
              mapMode === 'street'
                ? 'bg-[#3D1860] text-white shadow-xs'
                : 'text-gray-700 hover:text-[#3D1860]'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Street</span>
          </button>
        </div>
      </div>

      {/* Top-Left Location Denied / Status Notification */}
      {locationDenied && !dismissAlert && (
        <div className="absolute top-4 left-4 z-20 max-w-xs sm:max-w-sm bg-[#3D1860] border border-[#BB99CD]/40 text-white px-4 py-3 rounded-2xl shadow-xl flex items-start space-x-3">
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
});

export default CivicMap;
