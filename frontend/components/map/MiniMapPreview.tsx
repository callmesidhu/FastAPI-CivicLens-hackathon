'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import * as maplibregl from 'maplibre-gl';
import Map, { Marker, NavigationControl, MapRef } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Droplet, Users, ExternalLink, RotateCcw } from 'lucide-react';

if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}

// Satellite view style (Esri World Imagery)
const SATELLITE_STYLE: any = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      ],
      tileSize: 256,
      attribution: '&copy; Esri &mdash; Maxar, Earthstar Geographics',
    },
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite',
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export interface MiniAmenity {
  id: string;
  name: string;
  type: 'water' | 'toilet';
  condition: 'clean' | 'usable' | 'broken';
  latitude: number;
  longitude: number;
  district: string;
  ward: string;
  verifiedHoursAgo: number;
  isHotspot?: boolean;
}

// Curated statewide facilities spanning all major regions of Kerala
const KERALA_STATE_AMENITIES: MiniAmenity[] = [
  {
    id: 'amenity-tvm',
    name: 'Thiruvananthapuram Central Transit Restroom',
    type: 'toilet',
    condition: 'clean',
    latitude: 8.4900,
    longitude: 76.9530,
    district: 'Thiruvananthapuram',
    ward: 'Ward 42 • Central Terminal',
    verifiedHoursAgo: 2,
  },
  {
    id: 'amenity-alp',
    name: 'Alappuzha Boat Jetty RO Water Hub',
    type: 'water',
    condition: 'clean',
    latitude: 9.4981,
    longitude: 76.3388,
    district: 'Alappuzha',
    ward: 'Ward 18 • Port Canal',
    verifiedHoursAgo: 3,
  },
  {
    id: 'amenity-ktm',
    name: 'Kottayam Rail Junction Water Point',
    type: 'water',
    condition: 'usable',
    latitude: 9.5916,
    longitude: 76.5222,
    district: 'Kottayam',
    ward: 'Ward 31 • Railway Station',
    verifiedHoursAgo: 1,
  },
  {
    id: 'amenity-ekm',
    name: 'Kochi Marine Drive Safe Water Station',
    type: 'water',
    condition: 'clean',
    latitude: 9.9782,
    longitude: 76.2745,
    district: 'Ernakulam',
    ward: 'Ward 67 • Marine Central',
    verifiedHoursAgo: 1,
  },
  {
    id: 'amenity-tcr',
    name: 'Thrissur Swaraj Round Public Restroom',
    type: 'toilet',
    condition: 'clean',
    latitude: 10.5276,
    longitude: 76.2144,
    district: 'Thrissur',
    ward: 'Ward 24 • Round North',
    verifiedHoursAgo: 4,
  },
  {
    id: 'amenity-pkd',
    name: 'Palakkad Fort Promenade Water Station',
    type: 'water',
    condition: 'usable',
    latitude: 10.7667,
    longitude: 76.6548,
    district: 'Palakkad',
    ward: 'Ward 12 • Fort Corridor',
    verifiedHoursAgo: 5,
  },
  {
    id: 'amenity-kkd',
    name: 'Kozhikode Beach Sanitation Complex',
    type: 'toilet',
    condition: 'clean',
    latitude: 11.2588,
    longitude: 75.7804,
    district: 'Kozhikode',
    ward: 'Ward 15 • Coastal Walkway',
    verifiedHoursAgo: 2,
  },
  {
    id: 'amenity-knr',
    name: 'Kannur Payyambalam Eco-Facility',
    type: 'toilet',
    condition: 'usable',
    latitude: 11.8745,
    longitude: 75.3704,
    district: 'Kannur',
    ward: 'Ward 08 • Coastal Parks',
    verifiedHoursAgo: 3,
  },
];

const KERALA_CENTER = {
  longitude: 76.28,
  latitude: 10.45,
  zoom: 6.8,
};

interface MiniMapPreviewProps {
  activeFilter?: 'all' | 'water' | 'toilet';
  onFilterChange?: (filter: 'all' | 'water' | 'toilet') => void;
}

export default function MiniMapPreview({
  activeFilter = 'all',
}: MiniMapPreviewProps) {
  const mapRef = useRef<MapRef>(null);
  const [selectedAmenity, setSelectedAmenity] = useState<MiniAmenity | null>(null);

  const filteredAmenities = KERALA_STATE_AMENITIES.filter((a) => {
    if (activeFilter === 'water') return a.type === 'water';
    if (activeFilter === 'toilet') return a.type === 'toilet';
    return true;
  });

  const handleSelectAmenity = (amenity: MiniAmenity) => {
    setSelectedAmenity(amenity);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [amenity.longitude, amenity.latitude],
        zoom: 12,
        duration: 700,
      });
    }
  };

  const handleResetKerala = () => {
    setSelectedAmenity(null);
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: [KERALA_CENTER.longitude, KERALA_CENTER.latitude],
        zoom: KERALA_CENTER.zoom,
        duration: 700,
      });
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#240D37] rounded-2xl border border-[#BB99CD]/30 overflow-hidden">
      {/* ── Interactive Map Canvas Container (Edge-to-edge, No Top Bar) ── */}
      <div className="relative flex-1 min-h-[380px] sm:min-h-[440px] w-full">
        <Map
          ref={mapRef}
          mapLib={maplibregl}
          initialViewState={KERALA_CENTER}
          mapStyle={SATELLITE_STYLE}
          attributionControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <NavigationControl position="bottom-right" showCompass={false} />

          {/* Active amenity markers across Kerala */}
          {filteredAmenities.map((amenity) => {
            const isSelected = selectedAmenity?.id === amenity.id;

            return (
              <Marker
                key={amenity.id}
                longitude={amenity.longitude}
                latitude={amenity.latitude}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  handleSelectAmenity(amenity);
                }}
              >
                <div className="relative flex flex-col items-center cursor-pointer">
                  {/* Clean flat marker */}
                  <div
                    className={`p-1.5 sm:p-2 rounded-full border-2 transition-transform ${
                      amenity.type === 'water'
                        ? 'bg-blue-50 border-[#3D1860] text-[#3D1860]'
                        : 'bg-purple-50 border-[#643579] text-[#643579]'
                    } ${
                      isSelected
                        ? 'scale-125 border-[#BB99CD] z-30'
                        : 'hover:scale-110'
                    }`}
                  >
                    {amenity.type === 'toilet' ? (
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    ) : (
                      <Droplet className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
                    )}
                  </div>

                  {/* Pin Needle Base */}
                  <div className="w-1.5 h-1.5 bg-[#3D1860] rotate-45 -mt-1" />
                </div>
              </Marker>
            );
          })}
        </Map>

        {/* ── Overlay Pop-up Card when an amenity is tapped ── */}
        {selectedAmenity && (
          <div className="absolute top-3 left-3 right-3 sm:right-auto sm:max-w-xs z-20 bg-[#1F0B33] text-white p-3.5 rounded-xl border border-[#BB99CD]/50">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#BB99CD]">
                {selectedAmenity.district} • {selectedAmenity.ward}
              </span>
              <button
                type="button"
                onClick={() => setSelectedAmenity(null)}
                className="text-gray-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>

            <h4 className="text-sm font-bold text-white mb-2 leading-tight">
              {selectedAmenity.name}
            </h4>

            <div className="flex items-center space-x-2 text-[11px] mb-3">
              <span
                className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                  selectedAmenity.condition === 'clean'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                    : 'bg-amber-950 text-amber-300 border border-amber-700'
                }`}
              >
                {selectedAmenity.condition === 'clean' ? 'Verified Clean' : 'Usable'}
              </span>
              <span className="text-[#BB99CD] text-[10px]">
                Updated {selectedAmenity.verifiedHoursAgo}h ago
              </span>
            </div>

            <Link
              href="/map"
              className="w-full flex items-center justify-center space-x-1.5 bg-[#F5EDF7] hover:bg-white text-[#3D1860] text-xs font-black py-2 rounded-lg transition"
            >
              <span>Inspect on Live Map</span>
              <ExternalLink className="w-3 h-3 text-[#3D1860]" />
            </Link>
          </div>
        )}

        {/* ── Top-Left: Whole State Reset Control (Floating inside map) ── */}
        <button
          type="button"
          onClick={handleResetKerala}
          title="Reset to whole Kerala view"
          className="absolute top-3 left-3 z-10 inline-flex items-center space-x-1 bg-[#240D37]/90 hover:bg-[#3D1860] border border-[#BB99CD]/40 text-[#F5EDF7] text-[11px] font-bold px-2.5 py-1 rounded transition backdrop-blur-xs"
        >
          <RotateCcw className="w-3 h-3 text-[#BB99CD]" />
          <span>Whole State</span>
        </button>

        {/* ── Top-Right: Expand Fullscreen Link ── */}
        <Link
          href="/map"
          className="absolute top-3 right-3 z-10 inline-flex items-center space-x-1 bg-[#3D1860] hover:bg-[#643579] border border-[#BB99CD]/40 text-white text-[11px] font-bold px-2.5 py-1 rounded transition"
        >
          <span>Open Full Map</span>
          <ExternalLink className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
