'use client';

import React, { useState, useMemo } from 'react';
import { Facility } from '@/types';
import {
  Search,
  Filter,
  Droplet,
  Users,
  Copy,
  Check,
  ExternalLink,
  Trash2,
  Upload,
  Download,
  CheckCircle2,
  AlertTriangle,
  Lock,
  DropletOff,
  RefreshCw,
  Plus,
  Accessibility,
  Compass,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { deleteFacility, updateFacilityCondition } from '@/lib/api';

interface FacilityDirectoryProps {
  facilities: Facility[];
  isLoading: boolean;
  onRefresh: () => void;
  onOpenBulkImport: () => void;
  onShowNotification: (msg: string) => void;
}

export default function FacilityDirectory({
  facilities,
  isLoading,
  onRefresh,
  onOpenBulkImport,
  onShowNotification,
}: FacilityDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'toilet' | 'drinking_water'>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [wheelchairOnly, setWheelchairOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Statistics
  const totalCount = facilities.length;
  const toiletCount = useMemo(() => facilities.filter((f) => f.type === 'toilet').length, [facilities]);
  const waterCount = useMemo(
    () => facilities.filter((f) => f.type === 'drinking_water' || (f.type as string) === 'water').length,
    [facilities]
  );
  const accessibleCount = useMemo(
    () => facilities.filter((f) => f.accessibility?.wheelchairAccessible || (f as any).wheelchairAccessible).length,
    [facilities]
  );
  const operationalCount = useMemo(
    () => facilities.filter((f) => f.condition === 'clean' || f.condition === 'usable').length,
    [facilities]
  );
  const operationalPct = totalCount > 0 ? Math.round((operationalCount / totalCount) * 100) : 100;

  // Filter facilities
  const filteredFacilities = useMemo(() => {
    return facilities.filter((f) => {
      // Type filter
      if (typeFilter !== 'all') {
        const target = typeFilter === 'drinking_water' ? 'drinking_water' : 'toilet';
        if (target === 'drinking_water' && f.type !== 'drinking_water' && (f.type as string) !== 'water') return false;
        if (target === 'toilet' && f.type !== 'toilet') return false;
      }

      // Condition filter
      if (conditionFilter !== 'all' && f.condition !== conditionFilter) {
        return false;
      }

      // Wheelchair filter
      if (wheelchairOnly && !(f.accessibility?.wheelchairAccessible || (f as any).wheelchairAccessible)) {
        return false;
      }

      // Search query (name, address, coordinates)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.name.toLowerCase().includes(q);
        const matchesAddress = f.address.toLowerCase().includes(q);
        const matchesCoords = `${f.latitude},${f.longitude}`.includes(q);
        if (!matchesName && !matchesAddress && !matchesCoords) return false;
      }

      return true;
    });
  }, [facilities, typeFilter, conditionFilter, wheelchairOnly, searchQuery]);

  // Copy coordinates
  const handleCopyCoords = (lat: number, lng: number, id: string) => {
    const text = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Delete facility
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove "${name}" from the municipal database?`)) {
      return;
    }
    setDeletingId(id);
    try {
      await deleteFacility(id);
      onShowNotification(`Facility "${name}" removed from database.`);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete facility');
    } finally {
      setDeletingId(null);
    }
  };

  // Change condition
  const handleConditionChange = async (id: string, newCondition: string) => {
    setUpdatingId(id);
    try {
      await updateFacilityCondition(id, newCondition);
      onShowNotification(`Facility condition updated to ${newCondition.toUpperCase()}`);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to update condition');
    } finally {
      setUpdatingId(null);
    }
  };

  // Export current list to CSV
  const handleExportCSV = () => {
    if (facilities.length === 0) {
      alert('No facilities to export.');
      return;
    }

    const headers = [
      'ID',
      'Name',
      'Type',
      'Latitude',
      'Longitude',
      'Address',
      'Condition',
      'Availability',
      'WheelchairAccessible',
      'ConfidenceScore',
      'LastUpdated',
      'Status',
    ];

    const rows = filteredFacilities.map((f) => [
      `"${f.id}"`,
      `"${(f.name || '').replace(/"/g, '""')}"`,
      `"${f.type}"`,
      f.latitude,
      f.longitude,
      `"${(f.address || '').replace(/"/g, '""')}"`,
      `"${f.condition}"`,
      `"${f.availability || '24/7'}"`,
      (f.accessibility?.wheelchairAccessible || (f as any).wheelchairAccessible) ? 'true' : 'false',
      f.confidenceScore || 100,
      `"${f.lastUpdated || ''}"`,
      `"${f.status || 'active'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `civiclens_facilities_directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-gray-600">Total Positions</span>
            <Compass className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-gray-900 tracking-tight">{totalCount}</div>
          <p className="text-[11px] text-gray-500 font-medium">Mapped locations</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700">Public Toilets</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-900 tracking-tight">{toiletCount}</div>
          <p className="text-[11px] text-gray-500 font-medium">Restroom facilities</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-700">Water Points</span>
            <Droplet className="w-4 h-4 text-cyan-600" />
          </div>
          <div className="text-2xl font-black text-cyan-900 tracking-tight">{waterCount}</div>
          <p className="text-[11px] text-gray-500 font-medium">Drinking fountains/taps</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">Accessible</span>
            <Accessibility className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-900 tracking-tight">{accessibleCount}</div>
          <p className="text-[11px] text-gray-500 font-medium">Wheelchair compliant</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">Operational</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 tracking-tight">{operationalPct}%</div>
          <p className="text-[11px] text-gray-500 font-medium">{operationalCount} active &amp; usable</p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, address, or coordinates (e.g. 10.012, 76.362)..."
              className="w-full bg-[#F5EDF7]/50 focus:bg-white border border-gray-200 focus:border-[#643579] rounded-2xl pl-10 pr-4 py-2.5 text-xs font-semibold text-gray-800 placeholder-gray-400 outline-none transition"
            />
          </div>

          {/* Action Buttons: Import & Export */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={onOpenBulkImport}
              className="inline-flex items-center space-x-1.5 bg-[#3D1860] hover:bg-[#643579] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Bulk Import CSV</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="inline-flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3.5 py-2.5 rounded-xl transition cursor-pointer"
              title="Export filtered facilities to CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition cursor-pointer"
              title="Refresh facility list"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#643579]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-100 text-xs">
          {/* Type filters */}
          <div className="flex items-center space-x-1 bg-gray-100/80 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1 rounded-lg font-bold transition ${
                typeFilter === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Types ({totalCount})
            </button>
            <button
              onClick={() => setTypeFilter('toilet')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                typeFilter === 'toilet' ? 'bg-purple-100 text-purple-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Users className="w-3 h-3 text-purple-600" />
              <span>Toilets ({toiletCount})</span>
            </button>
            <button
              onClick={() => setTypeFilter('drinking_water')}
              className={`px-3 py-1 rounded-lg font-bold transition flex items-center space-x-1 ${
                typeFilter === 'drinking_water' ? 'bg-cyan-100 text-cyan-900 shadow-2xs' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Droplet className="w-3 h-3 text-cyan-600" />
              <span>Water Points ({waterCount})</span>
            </button>
          </div>

          <div className="w-px h-5 bg-gray-200 hidden sm:block" />

          {/* Condition Select */}
          <div className="flex items-center space-x-1.5">
            <span className="text-[11px] font-bold text-gray-500">Condition:</span>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="bg-gray-100 border border-gray-200 text-gray-800 text-xs font-semibold rounded-xl px-2.5 py-1.5 outline-none cursor-pointer"
            >
              <option value="all">All Conditions</option>
              <option value="clean">Clean</option>
              <option value="usable">Usable</option>
              <option value="broken">Broken</option>
              <option value="locked">Locked</option>
              <option value="no_water">No Water</option>
            </select>
          </div>

          {/* Wheelchair Checkbox */}
          <label className="flex items-center space-x-1.5 text-xs font-bold text-gray-700 cursor-pointer ml-auto">
            <input
              type="checkbox"
              checked={wheelchairOnly}
              onChange={(e) => setWheelchairOnly(e.target.checked)}
              className="rounded text-[#3D1860] focus:ring-[#643579]"
            />
            <span className="flex items-center space-x-1">
              <Accessibility className="w-3.5 h-3.5 text-blue-600" />
              <span>Wheelchair Only</span>
            </span>
          </label>
        </div>
      </div>

      {/* Facilities Table (Without Map) */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight">
              Facility Inventory List (Non-Map Directory)
            </h3>
            <p className="text-[11px] text-gray-500">
              Showing {filteredFacilities.length} of {totalCount} monitored public positions
            </p>
          </div>
          {filteredFacilities.length > 0 && (
            <span className="text-[10px] font-black uppercase tracking-wider text-[#3D1860] bg-[#F5EDF7] px-2.5 py-1 rounded-full border border-[#BB99CD]/40">
              2dsphere Indexed
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="p-16 text-center">
            <RefreshCw className="w-8 h-8 text-[#643579] animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">Loading facility directory from MongoDB...</p>
          </div>
        ) : filteredFacilities.length === 0 ? (
          <div className="p-16 text-center">
            <Compass className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-gray-800">No facilities match your active criteria</h4>
            <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
              Try adjusting your search query, clearing filters, or importing new positions via CSV.
            </p>
            <button
              onClick={onOpenBulkImport}
              className="mt-4 inline-flex items-center space-x-1.5 bg-[#3D1860] hover:bg-[#643579] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md transition"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Import CSV Now</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-gray-100">
              <thead className="bg-[#F5EDF7]/60 text-[10px] font-black uppercase tracking-wider text-gray-600">
                <tr>
                  <th className="px-5 py-3.5">Type &amp; Facility Name</th>
                  <th className="px-4 py-3.5">Exact GPS Position</th>
                  <th className="px-4 py-3.5">Address &amp; Landmark</th>
                  <th className="px-4 py-3.5">Condition</th>
                  <th className="px-4 py-3.5">Availability</th>
                  <th className="px-4 py-3.5">Access</th>
                  <th className="px-4 py-3.5">Trust</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFacilities.map((f) => {
                  const isWater = f.type === 'drinking_water' || (f.type as string) === 'water';
                  const isWheelchair = f.accessibility?.wheelchairAccessible || (f as any).wheelchairAccessible;

                  return (
                    <tr key={f.id} className="hover:bg-[#F5EDF7]/20 transition-colors">
                      {/* Name & Type */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                              isWater ? 'bg-cyan-100 text-cyan-700' : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {isWater ? <Droplet className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 truncate max-w-[200px]" title={f.name}>
                              {f.name}
                            </p>
                            <span
                              className={`inline-block text-[10px] font-black uppercase tracking-wider ${
                                isWater ? 'text-cyan-700' : 'text-purple-700'
                              }`}
                            >
                              {isWater ? 'Drinking Water' : 'Public Restroom'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Exact GPS Position */}
                      <td className="px-4 py-3.5 font-mono">
                        <div className="flex items-center space-x-1.5">
                          <div className="text-[11px] text-gray-700 font-semibold">
                            {f.latitude.toFixed(5)}, {f.longitude.toFixed(5)}
                          </div>
                          <button
                            onClick={() => handleCopyCoords(f.latitude, f.longitude, f.id)}
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800 transition cursor-pointer"
                            title="Copy coordinates to clipboard"
                          >
                            {copiedId === f.id ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={`https://www.google.com/maps?q=${f.latitude},${f.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-800 transition"
                            title="View coordinates on Google Maps"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="px-4 py-3.5">
                        <p className="text-gray-600 text-xs truncate max-w-[200px]" title={f.address}>
                          {f.address || 'Kochi Municipal Area'}
                        </p>
                      </td>

                      {/* Operational Condition */}
                      <td className="px-4 py-3.5">
                        <select
                          value={f.condition}
                          disabled={updatingId === f.id}
                          onChange={(e) => handleConditionChange(f.id, e.target.value)}
                          className={`text-[11px] font-bold px-2 py-1 rounded-lg border outline-none cursor-pointer transition ${
                            f.condition === 'clean'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : f.condition === 'usable'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : f.condition === 'broken'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : f.condition === 'locked'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-orange-50 text-orange-800 border-orange-200'
                          }`}
                        >
                          <option value="clean">Clean</option>
                          <option value="usable">Usable</option>
                          <option value="broken">Broken</option>
                          <option value="locked">Locked</option>
                          <option value="no_water">No Water</option>
                        </select>
                      </td>

                      {/* Availability */}
                      <td className="px-4 py-3.5 text-gray-600 font-medium">
                        {f.availability || '24/7'}
                      </td>

                      {/* Accessibility */}
                      <td className="px-4 py-3.5">
                        {isWheelchair ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                            <Accessibility className="w-3 h-3" />
                            <span>Ramp / Access</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-gray-400 font-medium">Standard</span>
                        )}
                      </td>

                      {/* ML Trust Score */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center space-x-1.5">
                          <div className="w-7 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#643579] rounded-full"
                              style={{ width: `${f.confidenceScore || 85}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-bold text-gray-700">
                            {f.confidenceScore || 85}%
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleDelete(f.id, f.name)}
                          disabled={deletingId === f.id}
                          className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Delete facility from system"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
