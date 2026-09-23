'use client';

import React from 'react';
import { ShieldCheck, Flame, Search, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { Facility } from '@/types';

export interface DashboardFilterState {
  status: string;
  type: string;
  radius: number;
  dateRange: string;
  searchQuery: string;
  hotspotsOnly: boolean;
}

interface CivicDashboardCardProps {
  facilities: Facility[];
  filters: DashboardFilterState;
  onFilterChange: (filters: DashboardFilterState) => void;
  onToggleHotspots: () => void;
}

export default function CivicDashboardCard({
  facilities,
  filters,
  onFilterChange,
  onToggleHotspots,
}: CivicDashboardCardProps) {
  // Compute KPI Counts
  const criticalCount = facilities.filter(f => f.condition === 'broken' || f.condition === 'no_water').length;
  const inProgressCount = facilities.filter(f => f.condition === 'locked').length;
  const resolvedCount = facilities.filter(f => f.condition === 'clean' || f.condition === 'usable').length;
  const hotspotCount = facilities.filter(f => (f.confidenceScore || 100) < 60 || f.condition === 'broken').length;

  return (
    <div className="w-full bg-white rounded-3xl border border-[#BB99CD]/40 shadow-xs p-6 md:p-8 mb-6">
      {/* Card Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#F5EDF7] border border-[#BB99CD] text-[#3D1860] text-xs font-black px-3 py-1 rounded-full mb-3">
            <span className="w-2 h-2 rounded-full bg-[#643579] animate-pulse"></span>
            <span>OPEN CIVIC DATA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Public Infrastructure &amp; Civic Map
          </h2>
          <p className="text-sm text-gray-500 font-normal mt-1">
            Explore real-time facility reports, resolution evidence, and detected hotspot clusters across Keralam.
          </p>
        </div>

        <div className="self-start lg:self-center">
          <div className="inline-flex items-center space-x-2 bg-emerald-50/60 border border-emerald-200/70 text-gray-700 text-xs font-semibold px-3.5 py-1.5 rounded-full shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Citizen Privacy Protected • Red/Amber/Green Status</span>
          </div>
        </div>
      </div>

      {/* Inner Banner */}
      <div className="bg-[#F5EDF7] border border-[#BB99CD]/40 rounded-2xl p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-white border border-[#BB99CD]/40 flex items-center justify-center shadow-2xs overflow-hidden p-1">
            <img src="/logo.png" alt="CivicLens" className="w-full h-full object-contain" />
          </div>
          <div>
            <h3 className="font-bold text-[#3D1860] text-sm sm:text-base">
              Keralam Civic Transparency &amp; Facility Awareness Map
            </h3>
            <p className="text-xs text-gray-500">
              Real-time municipal tracking of water points, toilets, active repairs, and maintenance zones
            </p>
          </div>
        </div>

        <div className="shrink-0">
          <span className="inline-flex items-center space-x-1.5 bg-[#3D1860] border border-[#3D1860] text-[#F5EDF7] text-xs font-bold px-3 py-1.5 rounded-full">
            <ShieldCheck className="w-3.5 h-3.5 text-[#BB99CD]" />
            <span>Public Civic Oversight</span>
          </span>
        </div>
      </div>

      {/* 4 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Critical Unresolved */}
        <div 
          onClick={() => onFilterChange({ ...filters, status: filters.status === 'broken' ? 'all' : 'broken' })}
          className={`cursor-pointer border rounded-2xl p-4 transition-all bg-white hover:shadow-md ${
            filters.status === 'broken' ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold tracking-wider text-red-600 uppercase">
              CRITICAL UNRESOLVED
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
          </div>
          <div className="text-3xl font-black text-gray-900 mb-1">{criticalCount}</div>
          <p className="text-xs text-gray-500 font-medium">Urgent repairs / issues (Red)</p>
        </div>

        {/* Active / In Progress */}
        <div 
          onClick={() => onFilterChange({ ...filters, status: filters.status === 'locked' ? 'all' : 'locked' })}
          className={`cursor-pointer border rounded-2xl p-4 transition-all bg-white hover:shadow-md ${
            filters.status === 'locked' ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold tracking-wider text-amber-600 uppercase">
              ACTIVE / IN PROGRESS
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
          <div className="text-3xl font-black text-gray-900 mb-1">{inProgressCount}</div>
          <p className="text-xs text-gray-500 font-medium">Crews dispatched (Amber)</p>
        </div>

        {/* Resolved / Usable */}
        <div 
          onClick={() => onFilterChange({ ...filters, status: filters.status === 'usable' ? 'all' : 'usable' })}
          className={`cursor-pointer border rounded-2xl p-4 transition-all bg-white hover:shadow-md ${
            filters.status === 'usable' ? 'border-emerald-500 ring-2 ring-emerald-200' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold tracking-wider text-emerald-600 uppercase">
              RESOLVED &amp; CLEAN
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          </div>
          <div className="text-3xl font-black text-gray-900 mb-1">{resolvedCount}</div>
          <p className="text-xs text-gray-500 font-medium">Evidence cleared (Green)</p>
        </div>

        {/* Monitored Hotspots */}
        <div 
          onClick={onToggleHotspots}
          className={`cursor-pointer border rounded-2xl p-4 transition-all bg-white hover:shadow-md ${
            filters.hotspotsOnly ? 'border-red-400 bg-red-50/30 ring-2 ring-red-100' : 'border-red-100'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold tracking-wider text-red-500 uppercase">
              MONITORED HOTSPOTS
            </span>
            <Flame className="w-4 h-4 text-red-500" />
          </div>
          <div className="text-3xl font-black text-gray-900 mb-1">{hotspotCount}</div>
          <p className="text-xs text-gray-500 font-medium">
            {filters.hotspotsOnly ? 'Filtered: Hotspots only' : 'Layer visible (Click to toggle)'}
          </p>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-gray-100">
        {/* Status Category */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] font-extrabold tracking-wider text-gray-500 uppercase">
            STATUS CATEGORY
          </label>
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ ...filters, status: e.target.value })}
            className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-[#643579] focus:bg-white transition"
          >
            <option value="all">All Statuses</option>
            <option value="clean">Clean (Verified)</option>
            <option value="usable">Usable</option>
            <option value="broken">Broken (Critical)</option>
            <option value="locked">Locked (In Maintenance)</option>
            <option value="no_water">No Water</option>
          </select>
        </div>

        {/* Municipal Ward / Radius */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] font-extrabold tracking-wider text-gray-500 uppercase">
            MUNICIPAL WARD / RADIUS
          </label>
          <select
            value={filters.radius}
            onChange={(e) => onFilterChange({ ...filters, radius: parseInt(e.target.value, 10) })}
            className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-[#643579] focus:bg-white transition"
          >
            <option value="50000">All Wards (50 km)</option>
            <option value="1000">Within 1 km</option>
            <option value="3000">Within 3 km</option>
            <option value="5000">Within 5 km</option>
            <option value="10000">Within 10 km</option>
          </select>
        </div>

        {/* Severity / Facility Type */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] font-extrabold tracking-wider text-gray-500 uppercase">
            FACILITY TYPE
          </label>
          <select
            value={filters.type}
            onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
            className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-[#643579] focus:bg-white transition"
          >
            <option value="all">All Facilities</option>
            <option value="water">Drinking Water Points</option>
            <option value="toilet">Public Sanitation / Toilets</option>
          </select>
        </div>

        {/* Date Logged */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] font-extrabold tracking-wider text-gray-500 uppercase">
            DATE LOGGED
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => onFilterChange({ ...filters, dateRange: e.target.value })}
            className="w-full bg-gray-50/70 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 outline-none focus:border-[#643579] focus:bg-white transition"
          >
            <option value="all">All Time</option>
            <option value="24h">Past 24 Hours</option>
            <option value="7d">Past 7 Days</option>
            <option value="30d">Past 30 Days</option>
          </select>
        </div>

        {/* Search Map Pins */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] font-extrabold tracking-wider text-gray-500 uppercase">
            SEARCH MAP PINS
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ ...filters, searchQuery: e.target.value })}
              placeholder="Search landmark, facility..."
              className="w-full bg-gray-50/70 border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium text-gray-800 outline-none focus:border-[#643579] focus:bg-white transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
