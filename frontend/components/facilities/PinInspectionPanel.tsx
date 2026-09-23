'use client';

import React from 'react';
import { Facility } from '@/types';
import { Info, MapPin, CheckCircle2, AlertTriangle, Lock, DropletOff, Accessibility, Navigation, ShieldCheck, Flag, Clock, Droplet, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface PinInspectionPanelProps {
  facility: Facility | null;
  onReportIssue: (facility: Facility) => void;
  onClose?: () => void;
}

export default function PinInspectionPanel({
  facility,
  onReportIssue,
  onClose,
}: PinInspectionPanelProps) {
  if (!facility) {
    return (
      <div className="w-full lg:w-96 bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 flex flex-col items-center justify-center text-center min-h-[420px]">
        <div className="w-full flex items-center space-x-2 text-gray-800 font-bold text-base mb-12">
          <Info className="w-5 h-5 text-blue-600" />
          <span>Transparency Pin Inspection</span>
        </div>

        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4 shadow-2xs">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>

        <p className="text-sm text-gray-500 font-medium max-w-xs leading-relaxed">
          Click any incident pin or hotspot zone on the map to inspect verified municipal maintenance details.
        </p>
      </div>
    );
  }

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'clean':
        return { label: 'Clean & Verified', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> };
      case 'usable':
        return { label: 'Usable', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> };
      case 'broken':
        return { label: 'Critical / Broken', bg: 'bg-red-50 text-red-700 border-red-200', icon: <AlertTriangle className="w-4 h-4 text-red-600" /> };
      case 'locked':
        return { label: 'Locked / Dispatched', bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: <Lock className="w-4 h-4 text-amber-600" /> };
      case 'no_water':
        return { label: 'No Water Supply', bg: 'bg-orange-50 text-orange-700 border-orange-200', icon: <DropletOff className="w-4 h-4 text-orange-600" /> };
      default:
        return { label: 'Unknown', bg: 'bg-gray-50 text-gray-700 border-gray-200', icon: <Info className="w-4 h-4 text-gray-500" /> };
    }
  };

  const badge = getConditionBadge(facility.condition);

  let formattedDate = 'Recently';
  try {
    formattedDate = `${formatDistanceToNow(new Date(facility.lastUpdated))} ago`;
  } catch (e) {}

  const openNavigation = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`,
      '_blank'
    );
  };

  return (
    <div className="w-full lg:w-96 bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <div className="flex items-center space-x-2 text-gray-900 font-bold text-base">
            <Info className="w-5 h-5 text-blue-600" />
            <span>Transparency Pin Inspection</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-xs text-gray-400 hover:text-gray-600 font-medium px-2 py-1 rounded"
            >
              Clear
            </button>
          )}
        </div>

        {/* Facility Name & Type */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {facility.type === 'toilet' ? (
                <>
                  <Users className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  <span>Public Sanitation</span>
                </>
              ) : (
                <>
                  <Droplet className="w-3.5 h-3.5 mr-1 text-blue-600 fill-blue-600" />
                  <span>Drinking Water</span>
                </>
              )}
            </span>
            {facility.accessibility?.wheelchairAccessible && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 flex items-center space-x-1">
                <Accessibility className="w-3 h-3" />
                <span>Accessible</span>
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-gray-900 leading-snug">
            {facility.name}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            Ward Lat: {facility.latitude.toFixed(4)}, Lng: {facility.longitude.toFixed(4)}
          </p>
        </div>

        {/* Status Badge */}
        <div className={`flex items-center space-x-2 px-3 py-2 rounded-xl border mb-4 ${badge.bg}`}>
          {badge.icon}
          <div className="flex flex-col">
            <span className="text-xs font-bold leading-tight">{badge.label}</span>
            <span className="text-[10px] opacity-80">Verified Municipal Status</span>
          </div>
        </div>

        {/* Facility Image Thumbnail (if available) */}
        {facility.imageUrl && (
          <div className="mb-4 rounded-xl overflow-hidden border border-gray-200 relative h-36 bg-gray-100">
            <img
              src={facility.imageUrl}
              alt={facility.name}
              className="w-full h-full object-cover"
            />
            <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded font-medium backdrop-blur-xs">
              Resolution Evidence
            </span>
          </div>
        )}

        {/* Verification & Confidence Metrics */}
        <div className="bg-gray-50 rounded-2xl p-3.5 space-y-2 mb-4 border border-gray-100">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-500 font-medium">Confidence Score</span>
            <span className="font-bold text-gray-800">{facility.confidenceScore || 100}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                (facility.confidenceScore || 100) >= 70 ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
              style={{ width: `${facility.confidenceScore || 100}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-xs pt-1 border-t border-gray-200/60">
            <span className="text-gray-500 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Last Reported</span>
            </span>
            <span className="font-semibold text-gray-700">{formattedDate}</span>
          </div>

          {facility.verifiedByMunicipal && (
            <div className="flex items-center space-x-1.5 text-xs text-blue-700 font-medium pt-1">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Official Municipal Inspection Cleared</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2 pt-2">
        <button
          onClick={() => onReportIssue(facility)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-xs transition flex items-center justify-center space-x-2"
        >
          <Flag className="w-3.5 h-3.5" />
          <span>Report Issue / Update Condition</span>
        </button>

        <button
          onClick={openNavigation}
          className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs py-2.5 px-4 rounded-xl transition flex items-center justify-center space-x-2"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Directions in Google Maps</span>
        </button>
      </div>
    </div>
  );
}
