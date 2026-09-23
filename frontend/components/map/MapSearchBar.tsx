'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Droplet, Users, X, Navigation, Box, Building2, ChevronRight, Satellite, Map as MapIcon } from 'lucide-react';
import { DashboardFilterState } from '@/components/facilities/CivicDashboardCard';
import type { MapRoute } from '@/components/map/Map';

interface MapSearchBarProps {
  filters: DashboardFilterState;
  onFilterChange: (filters: DashboardFilterState) => void;
  totalCount: number;
  displayedCount: number;
  onFindMe: () => void;
  locating?: boolean;
  onToggle3D?: () => void;
  is3D?: boolean;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  activeRoute?: MapRoute | null;
  onClearRoute?: () => void;
  mapMode?: 'satellite' | 'street';
  onToggleMapMode?: () => void;
}

export default function MapSearchBar({
  filters,
  onFilterChange,
  totalCount,
  displayedCount,
  onFindMe,
  locating = false,
  onToggle3D,
  is3D = false,
  isSidebarCollapsed = false,
  onToggleSidebar,
  activeRoute = null,
  onClearRoute,
  mapMode = 'satellite',
  onToggleMapMode,
}: MapSearchBarProps) {
  return (
    <div
      className={`absolute top-0 left-0 right-0 z-40 px-3 pt-3 pb-2 pointer-events-none transition-all duration-300 ease-in-out ${
        isSidebarCollapsed ? 'md:left-0' : 'md:left-[390px] lg:left-[416px]'
      }`}
    >
      <div className="pointer-events-auto flex flex-col gap-2">
        {/* Main pill bar */}
        <div className="flex items-center gap-2 bg-white/97 backdrop-blur-md rounded-2xl shadow-xl border border-gray-100 px-3 py-2.5">
          {/* Back arrow */}
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 hover:bg-[#F5EDF7] text-gray-700 hover:text-[#3D1860] transition shrink-0"
            title="Back to Home"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* When sidebar is collapsed on laptop, show inline Facilities button */}
          {isSidebarCollapsed && onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F5EDF7] hover:bg-[#BB99CD]/30 text-[#3D1860] border border-[#BB99CD]/40 text-xs font-bold transition shrink-0 cursor-pointer shadow-2xs"
              title="Open Civic Facilities Sidebar"
            >
              <Building2 className="w-3.5 h-3.5 text-[#643579]" />
              <span>{totalCount} Facilities</span>
              <ChevronRight className="w-3 h-3 text-[#643579]" />
            </button>
          )}

          <div className="w-px h-6 bg-gray-200 shrink-0" />

          {/* Search input */}
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Search facilities, landmarks…"
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 outline-none font-medium min-w-0"
            />
            {filters.searchQuery && (
              <button
                onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Row 2: Type chips + Satellite/Street + 2D/3D & Find Me pinned right */}
        <div className="flex items-center gap-2">
          {/* Scrollable type chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar flex-1 min-w-0">
            {[
              { value: 'all', label: 'All', icon: null },
              { value: 'drinking_water', label: 'Water', icon: <Droplet className="w-3.5 h-3.5 fill-current" /> },
              { value: 'toilet', label: 'Toilets', icon: <Users className="w-3.5 h-3.5" /> },
            ].map((opt) => {
              const isActive =
                filters.type === opt.value ||
                (opt.value === 'drinking_water' && filters.type === 'water');
              return (
                <button
                  key={opt.value}
                  onClick={() => onFilterChange({ ...filters, type: opt.value })}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm shrink-0 ${
                    isActive
                      ? 'bg-[#3D1860] text-white shadow-md'
                      : 'bg-white/95 backdrop-blur-sm text-gray-700 border border-gray-200 hover:border-[#BB99CD]'
                  }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Action buttons pinned to the right */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Satellite / Street Switcher */}
            {onToggleMapMode && (
              <button
                type="button"
                onClick={onToggleMapMode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm shrink-0 cursor-pointer bg-white/95 backdrop-blur-sm text-gray-700 border border-gray-200 hover:border-[#BB99CD] hover:bg-[#F5EDF7]"
                title={`Switch to ${mapMode === 'satellite' ? 'Street' : 'Satellite'} view`}
              >
                {mapMode === 'satellite' ? (
                  <>
                    <Satellite className="w-3.5 h-3.5 text-[#643579]" />
                    <span className="hidden sm:inline">Satellite</span>
                  </>
                ) : (
                  <>
                    <MapIcon className="w-3.5 h-3.5 text-[#643579]" />
                    <span className="hidden sm:inline">Street</span>
                  </>
                )}
              </button>
            )}

            {/* 2D / 3D Mode Toggle Button */}
            {onToggle3D && (
              <button
                type="button"
                onClick={onToggle3D}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm shrink-0 cursor-pointer ${
                  is3D
                    ? 'bg-[#3D1860] text-white shadow-md ring-2 ring-[#BB99CD]'
                    : 'bg-white/95 backdrop-blur-sm text-[#3D1860] border border-[#BB99CD] hover:bg-[#F5EDF7]'
                }`}
                title="Toggle 2D / 3D Map View"
              >
                <Box className={`w-3.5 h-3.5 ${is3D ? 'text-white' : 'text-[#643579]'}`} />
                <span>{is3D ? '3D View' : '2D View'}</span>
              </button>
            )}

            {/* Find Me */}
            <button
              onClick={onFindMe}
              disabled={locating}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition shadow-sm shrink-0 ${
                locating
                  ? 'bg-[#3D1860] text-white cursor-wait opacity-80'
                  : 'bg-white/95 backdrop-blur-sm text-[#3D1860] border border-[#BB99CD] hover:bg-[#F5EDF7]'
              }`}
            >
              {locating ? (
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Navigation className="w-3 h-3 fill-[#643579] text-[#643579]" />
              )}
              {locating ? 'Locating…' : 'Find Me'}
            </button>
          </div>
        </div>

        {/* Row 3: Active Route Pill (Never overlaps row 2 or row 1) */}
        {activeRoute && (
          <div className="flex justify-center w-full pointer-events-auto animate-in slide-in-from-top-2 duration-200">
            <div className="inline-flex items-center gap-2.5 bg-[#3D1860] text-white px-4 py-2 rounded-full shadow-2xl border border-[#BB99CD]/50 max-w-full">
              <Navigation className="w-4 h-4 fill-[#BB99CD] text-[#BB99CD] animate-pulse shrink-0" />
              <div className="text-xs font-bold truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                {activeRoute.destinationName}
              </div>
              <span className="text-[11px] bg-white/20 px-2 py-0.5 rounded-full font-extrabold text-[#F5EDF7] shrink-0">
                {activeRoute.durationSeconds > 60
                  ? `${Math.round(activeRoute.durationSeconds / 60)} min`
                  : '1 min'}
              </span>
              {onClearRoute && (
                <button
                  type="button"
                  onClick={onClearRoute}
                  className="p-1 hover:bg-white/20 rounded-full transition cursor-pointer text-white/80 hover:text-white shrink-0 ml-0.5"
                  title="End Navigation"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
