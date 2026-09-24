'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Facility } from '@/types';
import { DashboardFilterState } from '@/components/facilities/CivicDashboardCard';
import {
  ChevronUp, ChevronDown, Flag, Navigation, Flame, AlertTriangle,
  CheckCircle2, Lock, DropletOff, Info, Droplet, Users, MapPin,
  ShieldCheck, X, Accessibility, Ruler, Check, RotateCcw, SlidersHorizontal, Filter,
  ChevronLeft, ChevronRight, Building2, Star
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import RatingsView from '@/components/facilities/RatingsView';

interface MapBottomSheetProps {
  facilities: Facility[];
  allFacilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (f: Facility | null) => void;
  onReportIssue: (f: Facility) => void;
  filters: DashboardFilterState;
  onFilterChange: (f: DashboardFilterState) => void;
  onFindMe?: () => void;
  onGetDirections?: (f: Facility) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

function conditionBadge(condition: string) {
  switch (condition) {
    case 'clean':
    case 'usable':
      return { label: 'Clean', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> };
    case 'broken':
      return { label: 'Critical', color: 'bg-red-100 text-red-700', dot: 'bg-red-500', icon: <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> };
    case 'locked':
      return { label: 'In Progress', color: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500', icon: <Lock className="w-3.5 h-3.5 text-amber-600" /> };
    case 'no_water':
      return { label: 'No Water', color: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500', icon: <DropletOff className="w-3.5 h-3.5 text-orange-600" /> };
    default:
      return { label: 'Unknown', color: 'bg-gray-100 text-gray-600', dot: 'bg-gray-400', icon: <Info className="w-3.5 h-3.5 text-gray-500" /> };
  }
}

function FacilityRow({ facility, isSelected, onClick }: { facility: Facility; isSelected: boolean; onClick: () => void }) {
  const badge = conditionBadge(facility.condition);
  const isHotspot = facility.condition === 'broken' || (facility.confidenceScore || 100) < 60;
  let formattedDate = 'Recently';
  try { formattedDate = formatDistanceToNow(new Date(facility.lastUpdated)) + ' ago'; } catch {}

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left border-b border-gray-100 last:border-0 ${
        isSelected ? 'bg-[#F5EDF7]' : 'hover:bg-gray-50/70'
      }`}
    >
      {/* Type icon */}
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border border-[#BB99CD]/40 bg-[#F5EDF7] shadow-2xs">
        {facility.type === 'toilet' ? (
          <Users className="w-5 h-5 text-[#3D1860]" />
        ) : (
          <Droplet className="w-5 h-5 text-[#3D1860] fill-[#643579]/20" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-sm font-bold text-gray-900 truncate">{facility.name}</span>
          {isHotspot && <Flame className="w-3.5 h-3.5 text-red-500 shrink-0" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span>{facility.type === 'toilet' ? 'Public Sanitation' : 'Water Point'}</span>
          <span>·</span>
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* Badge + score */}
      <div className="flex flex-col items-end gap-1 shrink-0">
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${badge.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
          {badge.label}
        </span>
        <span className="text-[11px] text-gray-400 font-medium">{facility.confidenceScore || 100}% conf.</span>
      </div>
    </button>
  );
}

function SelectedFacilityCard({ facility, onClose, onReportIssue, onGetDirections }: {
  facility: Facility;
  onClose: () => void;
  onReportIssue: (f: Facility) => void;
  onGetDirections?: (f: Facility) => void;
}) {
  const badge = conditionBadge(facility.condition);
  let formattedDate = 'Recently';
  try { formattedDate = formatDistanceToNow(new Date(facility.lastUpdated)) + ' ago'; } catch {}

  const openNavigation = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`, '_blank');
  };

  return (
    <div className="px-4 pt-3 pb-2 border-b border-gray-200 bg-white">
      {/* Header row */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center border border-[#BB99CD]/40 bg-[#F5EDF7] shadow-2xs">
            {facility.type === 'toilet' ? (
              <Users className="w-5 h-5 text-[#3D1860]" />
            ) : (
              <Droplet className="w-5 h-5 text-[#3D1860] fill-[#643579]/20" />
            )}
          </div>
          <div>
            <h3 className="font-black text-gray-900 text-sm leading-tight">{facility.name}</h3>
            <p className="text-[11px] text-gray-500">
              {facility.type === 'toilet' ? 'Public Sanitation' : 'Water Point'} · {formattedDate}
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Status + badges row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${badge.color}`}>
          {badge.icon} {badge.label}
        </span>
        {facility.accessibility?.wheelchairAccessible && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100">
            <Accessibility className="w-3 h-3" /> Accessible
          </span>
        )}
        {facility.verifiedByMunicipal && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-[#F5EDF7] text-[#3D1860] border border-[#BB99CD]/50">
            <ShieldCheck className="w-3 h-3" /> Verified
          </span>
        )}
      </div>

      {/* Confidence bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1 text-[11px] text-gray-500">
          <span>Confidence Score</span>
          <span className="font-bold text-gray-700">{facility.confidenceScore || 100}%</span>
        </div>
        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${(facility.confidenceScore || 100) >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`}
            style={{ width: `${facility.confidenceScore || 100}%` }}
          />
        </div>
      </div>

      {/* Facility image if available */}
      {facility.imageUrl && (
        <div className="mb-3 rounded-xl overflow-hidden h-28 relative bg-gray-100 border border-gray-200">
          <img src={facility.imageUrl} alt={facility.name} className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-medium">
            Resolution Evidence
          </span>
        </div>
      )}

      {/* Action Buttons row: In-App Directions + Report Issue + Rate */}
      <div className="flex gap-2 pt-1 pb-3">
        <button
          onClick={() => {
            if (onGetDirections) {
              onGetDirections(facility);
            } else {
              openNavigation();
            }
          }}
          className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-[#F5EDF7] hover:bg-[#BB99CD]/30 text-[#3D1860] border border-[#BB99CD]/40 font-bold text-[10px] sm:text-xs py-2 rounded-xl transition cursor-pointer active:scale-98"
        >
          <Navigation className="w-3.5 h-3.5 fill-[#643579] text-[#643579]" />
          <span>Directions</span>
        </button>
        <button
          onClick={() => onReportIssue(facility)}
          className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-[10px] sm:text-xs py-2 rounded-xl shadow-xs transition cursor-pointer active:scale-98"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report</span>
        </button>
        <button
          onClick={() => {
            // we will toggle a local state for showing ratings
            document.getElementById(`ratings-${facility.id}`)?.classList.toggle('hidden');
          }}
          className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 bg-[#3D1860] hover:bg-[#643579] text-white font-bold text-[10px] sm:text-xs py-2 rounded-xl shadow-xs transition cursor-pointer active:scale-98"
        >
          <Star className="w-3.5 h-3.5 fill-current" />
          <span>Rate</span>
        </button>
      </div>

      <div id={`ratings-${facility.id}`} className="pb-4 hidden">
        <RatingsView facilityId={facility.id} />
      </div>
    </div>
  );
}

export default function MapBottomSheet({
  facilities,
  allFacilities,
  selectedFacility,
  onSelectFacility,
  onReportIssue,
  filters,
  onFilterChange,
  onFindMe,
  onGetDirections,
  isSidebarCollapsed = false,
  onToggleSidebar,
}: MapBottomSheetProps) {
  const [expanded, setExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'condition' | 'availability' | 'radius' | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // When a facility is selected (even when scrolled down), expand sheet and scroll list to top
  useEffect(() => {
    if (selectedFacility) {
      setExpanded(true);
      listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      const timer = setTimeout(() => {
        listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [selectedFacility]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDropdown(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const conditionOpts = [
    { value: 'all', label: 'All Conditions', desc: 'Display facilities regardless of state', icon: null },
    { value: 'usable', label: 'Clean / Usable', desc: 'Verified functional & clean facilities', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
    { value: 'broken', label: 'Critical', desc: 'Broken or urgent municipal action required', icon: <AlertTriangle className="w-4 h-4 text-red-500" /> },
    { value: 'locked', label: 'In Progress', desc: 'Locked or active maintenance in progress', icon: <Lock className="w-4 h-4 text-amber-500" /> },
    { value: 'no_water', label: 'No Water', desc: 'Dry tap or disconnected water supply', icon: <DropletOff className="w-4 h-4 text-orange-500" /> },
  ];

  const availOpts = [
    { value: 'all', label: 'All Statuses', desc: 'Show both open and closed facilities', icon: null },
    { value: 'available', label: 'Available', desc: 'Open and accessible to the public', icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" /> },
    { value: 'unavailable', label: 'Unavailable', desc: 'Temporarily closed or out of service', icon: <Info className="w-4 h-4 text-red-500" /> },
  ];

  const radiusOpts = [
    { value: 0, label: 'All Facilities', desc: 'Show all facilities without radius limit' },
    { value: 100000, label: '100 km Radius', desc: 'Regional coverage (includes Kochi & Kakkanad)' },
    { value: 50000, label: '50 km Radius', desc: 'Citywide coverage around location' },
    { value: 10000, label: '10 km Radius', desc: 'District area around location' },
    { value: 5000, label: '5 km Radius', desc: 'Neighborhood vicinity' },
    { value: 1000, label: '1 km Radius', desc: 'Immediate walking distance' },
  ];

  const activeCondition = conditionOpts.find((o) => o.value === filters.condition) || conditionOpts[0];
  const activeAvailability = availOpts.find((o) => o.value === filters.availability) || availOpts[0];
  const activeRadius = radiusOpts.find((o) => o.value === filters.radius) || radiusOpts[0];

  const hasActiveFilters =
    filters.condition !== 'all' ||
    filters.availability !== 'all' ||
    filters.radius !== 50000 ||
    filters.wheelchair;

  const resetFilters = () => {
    onFilterChange({
      ...filters,
      condition: 'all',
      availability: 'all',
      radius: 50000,
      wheelchair: false,
    });
    setOpenDropdown(null);
  };

  return (
    <>
      {/* Main Panel Container: Bottom Sheet on Mobile, Left Sidebar on Laptop */}
      <aside
        className={`absolute z-30 bg-white shadow-2xl flex flex-col transition-all duration-300 ease-in-out overflow-hidden
          bottom-0 left-0 right-0 rounded-t-3xl border-t border-gray-100
          ${
            selectedFacility
              ? expanded ? 'h-[75vh]' : 'h-[370px]'
              : expanded ? 'h-[70vh]' : 'h-64'
          }
          md:top-0 md:bottom-0 md:left-0 md:right-auto md:w-[380px] lg:w-[400px] md:h-full md:rounded-none md:border-r md:border-t-0 md:border-gray-200
          ${isSidebarCollapsed ? 'md:-translate-x-full md:pointer-events-none md:invisible md:shadow-none' : 'md:translate-x-0 md:visible'}
        `}
      >
        {/* Mobile Header with Drag Handle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="md:hidden flex flex-col items-center pt-3 pb-2 shrink-0 w-full cursor-pointer"
        >
          <div className="w-10 h-1 bg-gray-300 rounded-full mb-2" />
          <div className="flex items-center justify-between w-full px-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-gray-900">
                {facilities.length} Civic Facilities
              </span>
              {filters.hotspotsOnly && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                  <Flame className="w-3 h-3" /> Hotspots
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400 font-medium">
              {expanded ? 'Collapse' : 'Show all'}
              {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
          </div>
        </button>

        {/* Laptop / Desktop Dedicated Header */}
        <div className="hidden md:flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-[#3D1860] flex items-center justify-center text-white shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-gray-900 tracking-tight">Civic Facilities</h2>
                <span className="bg-[#F5EDF7] text-[#3D1860] border border-[#BB99CD]/40 text-[10px] font-black px-2 py-0.5 rounded-full">
                  {facilities.length}
                </span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Verified local sanitation &amp; water points</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {filters.hotspotsOnly && (
              <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                <Flame className="w-3 h-3" /> Hotspots
              </span>
            )}
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-[#F5EDF7] text-gray-400 hover:text-[#3D1860] flex items-center justify-center transition cursor-pointer ml-1"
                title="Collapse sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ── Filter Dropdowns Strip ── */}
        <div className="px-4 py-2.5 shrink-0 relative z-30 border-b border-gray-100 bg-gray-50/70 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 flex-nowrap w-max pr-4">
            {/* ─ Condition Filter Pill ─ */}
            <button
              type="button"
              onClick={() => setOpenDropdown('condition')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs shrink-0 select-none ${
                filters.condition !== 'all'
                  ? 'bg-[#3D1860] text-white shadow-sm border border-[#3D1860]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#BB99CD] hover:bg-[#F5EDF7]/40'
              }`}
            >
              {activeCondition.icon || <Filter className="w-3 h-3" />}
              <span>{filters.condition === 'all' ? 'Condition' : activeCondition.label}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* ─ Availability Filter Pill ─ */}
            <button
              type="button"
              onClick={() => setOpenDropdown('availability')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs shrink-0 select-none ${
                filters.availability !== 'all'
                  ? 'bg-[#3D1860] text-white shadow-sm border border-[#3D1860]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#BB99CD] hover:bg-[#F5EDF7]/40'
              }`}
            >
              {activeAvailability.icon || <CheckCircle2 className="w-3 h-3" />}
              <span>{filters.availability === 'all' ? 'Availability' : activeAvailability.label}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* ─ Distance / Radius Filter Pill (Explicitly stating "from My Location") ─ */}
            <button
              type="button"
              onClick={() => setOpenDropdown('radius')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs shrink-0 select-none ${
                filters.radius !== 50000
                  ? 'bg-[#3D1860] text-white shadow-sm border border-[#3D1860]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#BB99CD] hover:bg-[#F5EDF7]/40'
              }`}
            >
              <Navigation className="w-3 h-3 fill-current text-[#643579]" />
              <span>{activeRadius.label}</span>
              <ChevronDown className="w-3 h-3 text-gray-400" />
            </button>

            {/* ─ Wheelchair Accessible Toggle ─ */}
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, wheelchair: !filters.wheelchair })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs shrink-0 select-none ${
                filters.wheelchair
                  ? 'bg-[#3D1860] text-white shadow-sm border border-[#3D1860]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#BB99CD] hover:bg-[#F5EDF7]/40'
              }`}
            >
              <Accessibility className="w-3.5 h-3.5" />
              <span>Accessible</span>
            </button>

            {/* ─ Reset Filters Button ─ */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 transition shrink-0 ml-auto"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Scrollable facility list (expanded area) */}
        <div ref={listRef} className="flex-1 overflow-y-auto min-h-0 scroll-smooth">
          {/* Selected facility detail card (sticky at top so it is always visible at the top) */}
          {selectedFacility && (
            <div className="sticky top-0 z-20 bg-white shadow-xs border-b border-[#BB99CD]/40 animate-in slide-in-from-top-2 duration-200">
              <SelectedFacilityCard
                facility={selectedFacility}
                onClose={() => onSelectFacility(null)}
                onReportIssue={onReportIssue}
                onGetDirections={onGetDirections}
              />
            </div>
          )}

          {/* Facility rows */}
          {facilities.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-6">
              <MapPin className="w-8 h-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-400 font-medium">No facilities match your current filters.</p>
            </div>
          ) : (
            facilities.map((facility) => (
              <FacilityRow
                key={facility.id}
                facility={facility}
                isSelected={selectedFacility?.id === facility.id}
                onClick={() => {
                  onSelectFacility(facility);
                  setExpanded(true);
                  listRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            ))
          )}
        </div>
      </aside>

      {/* ── CLEAN POPUP MODAL DIALOG FOR ALL FILTER DROPDOWNS ── */}
      {openDropdown && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          {/* Backdrop click dismiss */}
          <div
            className="fixed inset-0"
            onClick={() => setOpenDropdown(null)}
          />

          {/* Popup Card */}
          <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-[#F5EDF7]/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#3D1860] text-white flex items-center justify-center shadow-xs">
                  {openDropdown === 'condition' && <Filter className="w-4 h-4" />}
                  {openDropdown === 'availability' && <CheckCircle2 className="w-4 h-4" />}
                  {openDropdown === 'radius' && <Navigation className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900 text-sm">
                    {openDropdown === 'condition' && 'Filter by Condition'}
                    {openDropdown === 'availability' && 'Filter by Availability'}
                    {openDropdown === 'radius' && 'Location & Search Radius'}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-medium">
                    {openDropdown === 'condition' && 'Select facility operational state'}
                    {openDropdown === 'availability' && 'Select public accessibility status'}
                    {openDropdown === 'radius' && 'Distance measured from your current location'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setOpenDropdown(null)}
                className="p-1.5 rounded-full hover:bg-gray-200/60 text-gray-400 hover:text-gray-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2">
              {/* CONDITION OPTIONS */}
              {openDropdown === 'condition' &&
                conditionOpts.map((opt) => {
                  const isSelected = filters.condition === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onFilterChange({ ...filters, condition: opt.value });
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition text-left ${
                        isSelected
                          ? 'bg-[#F5EDF7] border-[#643579] ring-2 ring-[#643579]/20 shadow-xs'
                          : 'bg-white border-gray-100 hover:border-[#BB99CD] hover:bg-gray-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-[#3D1860] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {opt.icon || <SlidersHorizontal className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{opt.label}</div>
                          <div className="text-[11px] text-gray-500">{opt.desc}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#3D1860] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}

              {/* AVAILABILITY OPTIONS */}
              {openDropdown === 'availability' &&
                availOpts.map((opt) => {
                  const isSelected = filters.availability === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        onFilterChange({ ...filters, availability: opt.value });
                        setOpenDropdown(null);
                      }}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition text-left ${
                        isSelected
                          ? 'bg-[#F5EDF7] border-[#643579] ring-2 ring-[#643579]/20 shadow-xs'
                          : 'bg-white border-gray-100 hover:border-[#BB99CD] hover:bg-gray-50/80'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-[#3D1860] text-white' : 'bg-gray-100 text-gray-600'}`}>
                          {opt.icon || <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-gray-900">{opt.label}</div>
                          <div className="text-[11px] text-gray-500">{opt.desc}</div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-[#3D1860] text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </button>
                  );
                })}

              {/* RADIUS & LOCATION OPTIONS */}
              {openDropdown === 'radius' && (
                <>
                  {/* Location card inside popup */}
                  <div className="bg-[#F5EDF7] border border-[#BB99CD]/40 p-3.5 rounded-2xl mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <MapPin className="w-4 h-4 text-[#3D1860] shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-[#3D1860]">Current Location Center</div>
                        <div className="text-[10px] text-gray-600">Proximity radius measures outward from your position</div>
                      </div>
                    </div>
                    {onFindMe && (
                      <button
                        type="button"
                        onClick={() => {
                          onFindMe();
                          setOpenDropdown(null);
                        }}
                        className="bg-[#3D1860] hover:bg-[#643579] text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-xs transition shrink-0"
                      >
                        Recenter GPS
                      </button>
                    )}
                  </div>

                  {radiusOpts.map((opt) => {
                    const isSelected = filters.radius === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          onFilterChange({ ...filters, radius: opt.value });
                          setOpenDropdown(null);
                        }}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition text-left ${
                          isSelected
                            ? 'bg-[#F5EDF7] border-[#643579] ring-2 ring-[#643579]/20 shadow-xs'
                            : 'bg-white border-gray-100 hover:border-[#BB99CD] hover:bg-gray-50/80'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isSelected ? 'bg-[#3D1860] text-white' : 'bg-gray-100 text-gray-600'}`}>
                            <Ruler className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-900">{opt.label}</div>
                            <div className="text-[11px] text-gray-500">{opt.desc}</div>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[#3D1860] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex gap-2">
              <button
                type="button"
                onClick={() => setOpenDropdown(null)}
                className="w-full bg-[#3D1860] hover:bg-[#643579] text-white font-bold text-xs py-3 rounded-2xl shadow-sm transition"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

