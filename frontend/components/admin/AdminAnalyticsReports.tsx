'use client';

import React, { useMemo } from 'react';
import { Facility } from '@/types';
import {
  BarChart3,
  PieChart,
  Download,
  Printer,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Droplet,
  Users,
  Building2,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';

interface AdminAnalyticsReportsProps {
  facilities: Facility[];
  tickets: any[];
}

export default function AdminAnalyticsReports({ facilities, tickets }: AdminAnalyticsReportsProps) {
  // Facility metrics
  const totalFacilities = facilities.length;
  const toilets = useMemo(() => facilities.filter((f) => f.type === 'toilet'), [facilities]);
  const waterPoints = useMemo(
    () => facilities.filter((f) => f.type === 'drinking_water' || (f.type as string) === 'water'),
    [facilities]
  );

  const cleanCount = useMemo(() => facilities.filter((f) => f.condition === 'clean').length, [facilities]);
  const usableCount = useMemo(() => facilities.filter((f) => f.condition === 'usable').length, [facilities]);
  const brokenCount = useMemo(() => facilities.filter((f) => f.condition === 'broken').length, [facilities]);
  const lockedCount = useMemo(() => facilities.filter((f) => f.condition === 'locked').length, [facilities]);
  const noWaterCount = useMemo(() => facilities.filter((f) => f.condition === 'no_water').length, [facilities]);

  const healthyCount = cleanCount + usableCount;
  const healthRate = totalFacilities > 0 ? Math.round((healthyCount / totalFacilities) * 100) : 100;

  // Ticket metrics
  const totalTickets = tickets.length;
  const openTickets = useMemo(
    () => tickets.filter((t) => t.status === 'open' || t.status === 'submitted' || t.status === 'pending').length,
    [tickets]
  );
  const inProgressTickets = useMemo(
    () => tickets.filter((t) => t.status === 'in_progress' || t.status === 'dispatched').length,
    [tickets]
  );
  const resolvedTickets = useMemo(
    () => tickets.filter((t) => t.status === 'resolved').length,
    [tickets]
  );

  const resolutionRate = totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 100;

  // Issue breakdown from tickets
  const issuesBreakdown = useMemo(() => {
    const map: Record<string, number> = {
      'No Water Supply': 0,
      'Damaged / Broken Fixtures': 0,
      'Sanitation & Hygiene': 0,
      'Facility Locked / Inaccessible': 0,
      'Other Civic Reports': 0,
    };

    tickets.forEach((t) => {
      const type = (t.issueType || '').toLowerCase();
      const desc = (t.description || '').toLowerCase();
      if (type.includes('no_water') || desc.includes('water') || desc.includes('tap')) {
        map['No Water Supply']++;
      } else if (type.includes('broken') || desc.includes('broken') || desc.includes('leak')) {
        map['Damaged / Broken Fixtures']++;
      } else if (type.includes('clean') || desc.includes('dirty') || desc.includes('smell')) {
        map['Sanitation & Hygiene']++;
      } else if (type.includes('locked') || desc.includes('locked')) {
        map['Facility Locked / Inaccessible']++;
      } else {
        map['Other Civic Reports']++;
      }
    });

    return map;
  }, [tickets]);

  // Ward / Area distribution
  const wardDistribution = useMemo(() => {
    const counts: Record<string, { facilities: number; tickets: number }> = {
      'Kakkanad / Infopark': { facilities: 0, tickets: 0 },
      'Marine Drive / Broadway': { facilities: 0, tickets: 0 },
      'Fort Kochi / Mattancherry': { facilities: 0, tickets: 0 },
      'Vyttila Mobility Hub': { facilities: 0, tickets: 0 },
      'Kaloor / Palarivattom': { facilities: 0, tickets: 0 },
      'Aluva Transit Corridor': { facilities: 0, tickets: 0 },
    };

    facilities.forEach((f) => {
      const addr = (f.address || f.name).toLowerCase();
      if (addr.includes('kakkanad') || addr.includes('infopark')) counts['Kakkanad / Infopark'].facilities++;
      else if (addr.includes('marine drive') || addr.includes('broadway')) counts['Marine Drive / Broadway'].facilities++;
      else if (addr.includes('fort kochi') || addr.includes('mattancherry')) counts['Fort Kochi / Mattancherry'].facilities++;
      else if (addr.includes('vyttila')) counts['Vyttila Mobility Hub'].facilities++;
      else if (addr.includes('kaloor') || addr.includes('palarivattom')) counts['Kaloor / Palarivattom'].facilities++;
      else counts['Aluva Transit Corridor'].facilities++;
    });

    tickets.forEach((t) => {
      const loc = (t.facilityName || t.localBodyWard || '').toLowerCase();
      if (loc.includes('kakkanad') || loc.includes('infopark')) counts['Kakkanad / Infopark'].tickets++;
      else if (loc.includes('marine drive') || loc.includes('broadway')) counts['Marine Drive / Broadway'].tickets++;
      else if (loc.includes('fort kochi') || loc.includes('mattancherry')) counts['Fort Kochi / Mattancherry'].tickets++;
      else if (loc.includes('vyttila')) counts['Vyttila Mobility Hub'].tickets++;
      else if (loc.includes('kaloor') || loc.includes('palarivattom')) counts['Kaloor / Palarivattom'].tickets++;
      else counts['Aluva Transit Corridor'].tickets++;
    });

    return counts;
  }, [facilities, tickets]);

  // Export Facilities CSV
  const handleExportFacilities = () => {
    const headers = ['ID', 'Name', 'Type', 'Latitude', 'Longitude', 'Address', 'Condition', 'Availability', 'Wheelchair', 'TrustScore'];
    const rows = facilities.map((f) => [
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
    ]);
    downloadCSV([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'), 'civiclens_facilities_audit.csv');
  };

  // Export Tickets CSV
  const handleExportTickets = () => {
    const headers = ['TicketNumber', 'FacilityName', 'IssueType', 'Status', 'Priority', 'Ward', 'Department', 'CreatedAt', 'ResolutionNotes'];
    const rows = tickets.map((t) => [
      `"${t.ticketNumber || ''}"`,
      `"${(t.facilityName || '').replace(/"/g, '""')}"`,
      `"${t.issueType || ''}"`,
      `"${t.status || ''}"`,
      `"${t.priority || 'medium'}"`,
      `"${(t.localBodyWard || '').replace(/"/g, '""')}"`,
      `"${(t.department || '').replace(/"/g, '""')}"`,
      `"${t.createdAt || ''}"`,
      `"${(t.resolutionNotes || '').replace(/"/g, '""')}"`,
    ]);
    downloadCSV([headers.join(','), ...rows.map((r) => r.join(','))].join('\n'), 'civiclens_tickets_audit.csv');
  };

  const downloadCSV = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Printable Audit Report
  const handlePrintAudit = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Header for Exports */}
      <div className="bg-gradient-to-r from-[#3D1860] to-[#643579] rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <BarChart3 className="w-5 h-5 text-purple-200" />
            <h2 className="text-xl font-black tracking-tight">Municipal Operations &amp; Welfare Analytics</h2>
          </div>
          <p className="text-xs text-purple-100 max-w-xl">
            Real-time public sanitation intelligence, citizen grievance velocity, and Right to Public Services Act audit records for Kochi Municipal Corporation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleExportFacilities}
            className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
            title="Download full CSV of all monitored locations"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Export Facilities CSV</span>
          </button>

          <button
            onClick={handleExportTickets}
            className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer"
            title="Download full CSV of citizen grievance tickets"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Tickets CSV</span>
          </button>

          <button
            onClick={handlePrintAudit}
            className="inline-flex items-center space-x-1.5 bg-white text-[#3D1860] hover:bg-gray-100 text-xs font-black px-4 py-2 rounded-xl shadow-md transition cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Audit Report</span>
          </button>
        </div>
      </div>

      {/* 4 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-purple-700">Total Amenities</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 tracking-tight">{totalFacilities}</div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium mt-1">
            <span>🚻 {toilets.length} Toilets</span>
            <span>•</span>
            <span>💧 {waterPoints.length} Water</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-emerald-700">Usability Index</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-600 tracking-tight">{healthRate}%</div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {healthyCount} of {totalFacilities} facilities operational
          </p>
        </div>

        {/* KPI 3 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-rose-700">Citizen Grievances</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-gray-900 tracking-tight">{totalTickets}</div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 font-medium mt-1">
            <span className="text-rose-600 font-bold">{openTickets} Open</span>
            <span>•</span>
            <span className="text-amber-600 font-bold">{inProgressTickets} Dispatched</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">Resolution Velocity</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-blue-600 tracking-tight">{resolutionRate}%</div>
          <p className="text-xs text-gray-500 font-medium mt-1">
            {resolvedTickets} resolved with photo proof
          </p>
        </div>
      </div>

      {/* Visual Analytics Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Graph 1: Facility Condition & Operational Breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900 tracking-tight">Facility Condition Breakdown</h3>
              <p className="text-[11px] text-gray-500">Live operational status across all 60+ locations</p>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {totalFacilities} Facilities
            </span>
          </div>

          {/* Stacked Visual Bar */}
          <div className="space-y-1.5 pt-2">
            <div className="h-6 w-full bg-gray-100 rounded-xl overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${(cleanCount / (totalFacilities || 1)) * 100}%` }}
                className="bg-emerald-500 transition-all duration-500"
                title={`Clean: ${cleanCount}`}
              />
              <div
                style={{ width: `${(usableCount / (totalFacilities || 1)) * 100}%` }}
                className="bg-blue-500 transition-all duration-500"
                title={`Usable: ${usableCount}`}
              />
              <div
                style={{ width: `${(brokenCount / (totalFacilities || 1)) * 100}%` }}
                className="bg-rose-500 transition-all duration-500"
                title={`Broken: ${brokenCount}`}
              />
              <div
                style={{ width: `${(lockedCount / (totalFacilities || 1)) * 100}%` }}
                className="bg-amber-500 transition-all duration-500"
                title={`Locked: ${lockedCount}`}
              />
              <div
                style={{ width: `${(noWaterCount / (totalFacilities || 1)) * 100}%` }}
                className="bg-orange-500 transition-all duration-500"
                title={`No Water: ${noWaterCount}`}
              />
            </div>

            {/* Legend & Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 text-xs">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
                <span className="text-gray-600 font-medium">Clean:</span>
                <span className="font-bold text-gray-900">{cleanCount} ({Math.round((cleanCount / (totalFacilities || 1)) * 100)}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                <span className="text-gray-600 font-medium">Usable:</span>
                <span className="font-bold text-gray-900">{usableCount} ({Math.round((usableCount / (totalFacilities || 1)) * 100)}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-rose-500 shrink-0" />
                <span className="text-gray-600 font-medium">Broken:</span>
                <span className="font-bold text-rose-600">{brokenCount} ({Math.round((brokenCount / (totalFacilities || 1)) * 100)}%)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 shrink-0" />
                <span className="text-gray-600 font-medium">Locked:</span>
                <span className="font-bold text-amber-600">{lockedCount}</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-orange-500 shrink-0" />
                <span className="text-gray-600 font-medium">No Water:</span>
                <span className="font-bold text-orange-600">{noWaterCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Graph 2: Grievance Resolution Lifecycle Gauge */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-gray-900 tracking-tight">Grievance Resolution Lifecycle</h3>
              <p className="text-[11px] text-gray-500">Dispatch &amp; field repair workflow health</p>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
              {totalTickets} Tickets
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            {/* Circular Gauge */}
            <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-100"
                  strokeWidth="3.8"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-500"
                  strokeDasharray={`${resolutionRate}, 100`}
                  strokeWidth="3.8"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-gray-900">{resolutionRate}%</span>
                <span className="text-[10px] font-bold text-emerald-600 uppercase">Resolved</span>
              </div>
            </div>

            {/* Stages */}
            <div className="flex-1 space-y-3 w-full text-xs">
              <div>
                <div className="flex justify-between font-bold text-gray-700 mb-1">
                  <span className="text-rose-600">Pending Action (Open)</span>
                  <span>{openTickets} tickets</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full rounded-full"
                    style={{ width: `${(openTickets / (totalTickets || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-gray-700 mb-1">
                  <span className="text-amber-600">Crew Dispatched (In Progress)</span>
                  <span>{inProgressTickets} tickets</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${(inProgressTickets / (totalTickets || 1)) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between font-bold text-gray-700 mb-1">
                  <span className="text-emerald-600">Verified &amp; Resolved</span>
                  <span>{resolvedTickets} tickets</span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${(resolvedTickets / (totalTickets || 1)) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graph 3 & 4: Common Problems & Ward Density */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Common Problems */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight">Reported Problem Categories</h3>
            <p className="text-[11px] text-gray-500">Citizen issue complaints categorized by frequency</p>
          </div>

          <div className="space-y-3 pt-2">
            {Object.entries(issuesBreakdown).map(([category, count]) => {
              const pct = totalTickets > 0 ? Math.round((count / totalTickets) * 100) : 0;
              return (
                <div key={category} className="space-y-1 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">{category}</span>
                    <span className="text-gray-500 font-semibold">{count} reports ({pct}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-[#643579] h-full rounded-full"
                      style={{ width: `${pct || 4}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ward Distribution */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-black text-gray-900 tracking-tight">Ward &amp; Zone Density Matrix</h3>
            <p className="text-[11px] text-gray-500">Facilities monitored vs citizen grievances reported</p>
          </div>

          <div className="overflow-x-auto pt-1">
            <table className="w-full text-left text-xs divide-y divide-gray-100">
              <thead className="bg-gray-50 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                <tr>
                  <th className="px-3 py-2">Municipal Zone</th>
                  <th className="px-3 py-2 text-center">Facilities</th>
                  <th className="px-3 py-2 text-center">Open Grievances</th>
                  <th className="px-3 py-2 text-right">Zone Health</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {Object.entries(wardDistribution).map(([zone, data]) => {
                  const zoneHealth = data.tickets === 0 ? 'Optimal' : data.tickets <= 2 ? 'Normal' : 'Attention';
                  return (
                    <tr key={zone} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 font-bold text-gray-800">{zone}</td>
                      <td className="px-3 py-2.5 text-center font-semibold text-gray-600">{data.facilities}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-rose-600">{data.tickets}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            zoneHealth === 'Optimal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : zoneHealth === 'Normal'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {zoneHealth}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
