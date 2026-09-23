'use client';

import { Filter, X, Search, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export interface FilterState {
  type: string;
  condition: string;
  availability: string;
  wheelchairAccessible: boolean;
  radius: number;
}

interface FiltersPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

function countActiveFilters(filters: FilterState) {
  let n = 0;
  if (filters.type !== 'all') n++;
  if (filters.condition !== 'all') n++;
  if (filters.availability !== 'all') n++;
  if (filters.wheelchairAccessible) n++;
  return n;
}

const selectCls =
  'w-full rounded-xl border border-gray-200 text-sm text-gray-800 focus:border-[#643579] focus:ring-2 focus:ring-[#BB99CD]/40 bg-white px-3 py-2.5 outline-none transition appearance-none cursor-pointer';

export default function FiltersPanel({
  filters,
  onFilterChange,
  searchQuery,
  onSearchChange,
}: FiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const activeCount = countActiveFilters(filters);

  const clearFilters = () =>
    onFilterChange({
      type: 'all',
      condition: 'all',
      availability: 'all',
      wheelchairAccessible: false,
      radius: 1000,
    });

  const filterPanel = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#3D1860]" />
          <span className="font-bold text-gray-800 text-base">Filters</span>
          {activeCount > 0 && (
            <span className="bg-[#3D1860] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {activeCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Close filters"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
        {/* Type + Distance */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Type
            </label>
            <div className="relative">
              <select
                value={filters.type}
                onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
                className={selectCls}
              >
                <option value="all">All</option>
                <option value="toilet">Toilets</option>
                <option value="drinking_water">Water</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Distance
            </label>
            <div className="relative">
              <select
                value={filters.radius}
                onChange={(e) =>
                  onFilterChange({ ...filters, radius: parseInt(e.target.value, 10) })
                }
                className={selectCls}
              >
                <option value="250">250 m</option>
                <option value="500">500 m</option>
                <option value="1000">1 km</option>
                <option value="2000">2 km</option>
                <option value="5000">5 km</option>
              </select>
            </div>
          </div>
        </div>

        {/* Condition + Availability */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Condition
            </label>
            <div className="relative">
              <select
                value={filters.condition}
                onChange={(e) =>
                  onFilterChange({ ...filters, condition: e.target.value })
                }
                className={selectCls}
              >
                <option value="all">Any</option>
                <option value="usable">Usable</option>
                <option value="broken">Broken</option>
                <option value="locked">Locked</option>
                <option value="no_water">No Water</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
              Availability
            </label>
            <div className="relative">
              <select
                value={filters.availability}
                onChange={(e) =>
                  onFilterChange({ ...filters, availability: e.target.value })
                }
                className={selectCls}
              >
                <option value="all">Any</option>
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>
          </div>
        </div>

        {/* Wheelchair toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none group">
          <div className="relative">
            <input
              id="wheelchair"
              type="checkbox"
              checked={filters.wheelchairAccessible}
              onChange={(e) =>
                onFilterChange({ ...filters, wheelchairAccessible: e.target.checked })
              }
              className="sr-only peer"
            />
            <div className="w-10 h-6 rounded-full border-2 border-gray-300 bg-gray-100 peer-checked:bg-[#3D1860] peer-checked:border-[#3D1860] transition-all" />
            <div className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all peer-checked:translate-x-4" />
          </div>
          <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 transition-colors">
            Wheelchair Accessible Only
          </span>
        </label>
      </div>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-gray-100 flex gap-3">
        <button
          onClick={clearFilters}
          className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition"
        >
          Clear
        </button>
        <button
          onClick={() => setIsOpen(false)}
          className="flex-1 py-2.5 rounded-xl bg-[#3D1860] hover:bg-[#643579] text-white text-sm font-bold transition"
        >
          Apply
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ── TRIGGER AREA ── */}
      <div className="absolute top-4 left-4 z-40 flex flex-col gap-3 w-[calc(100vw-7rem)] sm:w-auto max-w-sm">
        {/* Search bar */}
        <div className="bg-white rounded-2xl shadow-lg flex items-center px-4 py-2.5 border border-[#BB99CD]/30 focus-within:border-[#643579] focus-within:ring-2 focus-within:ring-[#BB99CD]/30 transition-all">
          <Search className="w-4 h-4 text-gray-400 shrink-0 mr-2" />
          <input
            type="text"
            placeholder="Search facility…"
            className="bg-transparent border-none outline-none flex-1 text-sm text-gray-800 min-w-0"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="p-1 hover:bg-gray-100 rounded-full ml-1 shrink-0"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filter trigger button */}
        <button
          onClick={() => setIsOpen(true)}
          className="self-start flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-2xl shadow-lg border border-gray-200 hover:border-[#BB99CD] text-sm font-semibold text-gray-700 hover:text-[#3D1860] transition-all"
          aria-label="Open filters"
        >
          <Filter className="w-4 h-4 text-[#3D1860] shrink-0" />
          <span>Filters</span>
          {activeCount > 0 && (
            <span className="bg-[#3D1860] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* ── PANEL — bottom sheet on mobile, floating card on desktop ── */}
      {isOpen && (
        <>
          {/* Backdrop (mobile only) */}
          <div
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setIsOpen(false)}
          />

          {/* Mobile: slide-up bottom sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden rounded-t-3xl bg-white shadow-2xl overflow-hidden"
            style={{ maxHeight: '85dvh' }}
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>
            {filterPanel}
          </div>

          {/* Desktop: floating card */}
          <div className="hidden md:block fixed top-20 left-4 z-50 w-80 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
            {filterPanel}
          </div>
        </>
      )}
    </>
  );
}
