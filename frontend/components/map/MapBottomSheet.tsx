'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Facility } from '@/types';
import { DashboardFilterState } from '@/components/facilities/CivicDashboardCard';
import {
  ChevronUp, ChevronDown, Flag, Navigation, Flame, AlertTriangle,
  CheckCircle2, Lock, DropletOff, Info, Droplet, Users, MapPin,
  Clock, ShieldCheck, X, Accessibility, Ruler, Eye, EyeOff,
  Check, RotateCcw, Sparkles
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MapBottomSheetProps {
  facilities: Facility[];
  allFacilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (f: Facility | null) => void;
  onReportIssue: (f: Facility) => void;
  filters: DashboardFilterState;
  onFilterChange: (f: DashboardFilterState) => void;
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
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${badge.color}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
          {badge.label}
        </span>
        <span className="text-[11px] text-gray-400 font-medium">{facility.confidenceScore || 100}% conf.</span>
      </div>
    </button>
  );
}

function SelectedFacilityCard({ facility, onClose, onReportIssue }: {
  facility: Facility;
  onClose: () => void;
  onReportIssue: (f: Facility) => void;
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
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
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

      {/* Navigate button (secondary) */}
      <button
        onClick={openNavigation}
        className="w-full flex items-center justify-center gap-2 bg-[#F5EDF7] hover:bg-[#BB99CD]/30 text-[#3D1860] border border-[#BB99CD]/40 font-semibold text-xs py-2.5 rounded-xl transition mb-2"
      >
        <Navigation className="w-3.5 h-3.5" />
        Directions in Google Maps
      </button>
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
}: MapBottomSheetProps) {
  const [expanded, setExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'condition' | 'availability' | 'radius' | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpenDropdown(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const conditionOpts = [
    { value: 'all', label: 'All Conditions', icon: null },
    { value: 'usable', label: 'Clean / Usable', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> },
    { value: 'broken', label: 'Critical', icon: <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> },
    { value: 'locked', label: 'In Progress', icon: <Lock className="w-3.5 h-3.5 text-amber-500" /> },
    { value: 'no_water', label: 'No Water', icon: <DropletOff className="w-3.5 h-3.5 text-orange-500" /> },
  ];

  const availOpts = [
    { value: 'all', label: 'All Status', icon: null },
    { value: 'available', label: 'Available', icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> },
    { value: 'unavailable', label: 'Unavailable', icon: <span className="text-xs">🚫</span> },
  ];

  const radiusOpts = [
    { value: 50000, label: '50 km', desc: 'Citywide' },
    { value: 10000, label: '10 km', desc: 'District' },
    { value: 5000, label: '5 km', desc: 'Neighborhood' },
    { value: 1000, label: '1 km', desc: 'Walking' },
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
    <div
      className={`absolute bottom-0 left-0 right-0 z-20 bg-white rounded-t-3xl shadow-2xl border-t border-gray-100 flex flex-col transition-all duration-300 ease-in-out ${
        expanded ? 'max-h-[70vh]' : 'max-h-64'
      }`}
      style={{ minHeight: '180px' }}
    >
      {/* Drag handle + toggle */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex flex-col items-center pt-3 pb-2 shrink-0 w-full"
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

      {/* ── Filter Dropdowns Strip ── */}
      <div className="px-4 pb-3 shrink-0 relative z-30">
        {/* Backdrop for click outside dismissal */}
        {openDropdown && (
          <div
            className="fixed inset-0 z-40 bg-transparent"
            onClick={() => setOpenDropdown(null)}
          />
        )}

        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap sm:flex-nowrap">
          {/* ─ Condition Dropdown ─ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'condition' ? null : 'condition')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs shrink-0 select-none ${
                filters.condition !== 'all'
                  ? 'bg-[#3D1860] text-white shadow-sm border border-[#3D1860]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#BB99CD] hover:bg-[#F5EDF7]/40'
              }`}
            >
              {activeCondition.icon}
              <span>{filters.condition === 'all' ? 'Condition' : activeCondition.label}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  openDropdown === 'condition' ? 'rotate-180' : ''
                } ${filters.condition !== 'all' ? 'text-white/80' : 'text-gray-400'}`}
              />
            </button>

            {openDropdown === 'condition' && (
              <div className="absolute top-full left-0 mt-1.5 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Condition
                </div>
                {conditionOpts.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onFilterChange({ ...filters, condition: opt.value });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-left transition ${
                      filters.condition === opt.value
                        ? 'bg-[#F5EDF7] text-[#3D1860] font-bold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {opt.icon}
                      <span>{opt.label}</span>
                    </span>
                    {filters.condition === opt.value && (
                      <Check className="w-3.5 h-3.5 text-[#643579]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─ Availability Dropdown (with dynamic changing emoji) ─ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'availability' ? null : 'availability')}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs shrink-0 select-none ${
                filters.availability !== 'all'
                  ? 'bg-[#3D1860] text-white shadow-sm border border-[#3D1860]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#BB99CD] hover:bg-[#F5EDF7]/40'
              }`}
            >
              {activeAvailability.icon}
              <span>{filters.availability === 'all' ? 'Availability' : activeAvailability.label}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  openDropdown === 'availability' ? 'rotate-180' : ''
                } ${filters.availability !== 'all' ? 'text-white/80' : 'text-gray-400'}`}
              />
            </button>

            {openDropdown === 'availability' && (
              <div className="absolute top-full left-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Availability
                </div>
                {availOpts.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onFilterChange({ ...filters, availability: opt.value });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-left transition ${
                      filters.availability === opt.value
                        ? 'bg-[#F5EDF7] text-[#3D1860] font-bold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {opt.icon}
                      <span>{opt.label}</span>
                    </span>
                    {filters.availability === opt.value && (
                      <Check className="w-3.5 h-3.5 text-[#643579]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─ Distance Dropdown ─ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdown(openDropdown === 'radius' ? null : 'radius')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs shrink-0 select-none ${
                filters.radius !== 50000
                  ? 'bg-[#3D1860] text-white shadow-sm border border-[#3D1860]'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#BB99CD] hover:bg-[#F5EDF7]/40'
              }`}
            >
              <Ruler className="w-3 h-3" />
              <span>{activeRadius.label}</span>
              <ChevronDown
                className={`w-3 h-3 transition-transform duration-200 ${
                  openDropdown === 'radius' ? 'rotate-180' : ''
                } ${filters.radius !== 50000 ? 'text-white/80' : 'text-gray-400'}`}
              />
            </button>

            {openDropdown === 'radius' && (
              <div className="absolute top-full left-0 sm:left-auto sm:right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                  Search Radius
                </div>
                {radiusOpts.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onFilterChange({ ...filters, radius: opt.value });
                      setOpenDropdown(null);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl text-left transition ${
                      filters.radius === opt.value
                        ? 'bg-[#F5EDF7] text-[#3D1860] font-bold'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-bold">{opt.label}</span>
                      <span className="text-[10px] text-gray-400 font-normal">{opt.desc}</span>
                    </div>
                    {filters.radius === opt.value && (
                      <Check className="w-3.5 h-3.5 text-[#643579]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─ Wheelchair Accessible Toggle ─ */}
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, wheelchair: !filters.wheelchair })}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shadow-xs shrink-0 select-none ${
              filters.wheelchair
                ? 'bg-[#3D1860] text-white shadow-sm border border-[#3D1860]'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#BB99CD] hover:bg-[#F5EDF7]/40'
            }`}
          >
            <Accessibility className="w-3 h-3" />
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
      <div className="flex-1 overflow-y-auto min-h-0">
        {/* Selected facility detail card (top of list) */}
        {selectedFacility && (
          <SelectedFacilityCard
            facility={selectedFacility}
            onClose={() => onSelectFacility(null)}
            onReportIssue={onReportIssue}
          />
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
              }}
            />
          ))
        )}
      </div>

      {/* Primary CTA — Rapido "Book Bike" equivalent */}
      <div className="px-4 pb-6 pt-3 shrink-0 bg-white border-t border-gray-100">
        <button
          onClick={() => {
            if (selectedFacility) onReportIssue(selectedFacility);
            else if (facilities.length > 0) {
              onSelectFacility(facilities[0]);
              onReportIssue(facilities[0]);
            }
          }}
          className="w-full bg-[#3D1860] hover:bg-[#643579] active:scale-[0.98] text-white font-black text-sm py-4 rounded-2xl shadow-lg transition flex items-center justify-center gap-2"
        >
          <Flag className="w-4 h-4" />
          {selectedFacility ? `Report Issue — ${selectedFacility.name}` : 'Select a Facility to Report Issue'}
        </button>
      </div>
    </div>
  );
}
