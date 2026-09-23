import { useState, useEffect } from 'react';
import { Facility } from '@/types';
import { X, Navigation2, Clock, CheckCircle2, AlertTriangle, Lock, DropletOff, Accessibility, ShieldCheck, Flag, WifiOff, Droplet, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ReportForm from '@/components/reports/ReportForm';
import TicketSuccess from '@/components/reports/TicketSuccess';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { getMetadata } from '@/lib/db';

interface FacilityDetailsProps {
  facility: Facility | null;
  onClose: () => void;
}

export default function FacilityDetails({ facility, onClose }: FacilityDetailsProps) {
  const [showReportForm, setShowReportForm] = useState(false);
  const [ticketData, setTicketData] = useState<any>(null);
  const { isOnline } = useNetworkStatus();
  const [lastSync, setLastSync] = useState<string | null>(null);

  useEffect(() => {
    if (!isOnline) {
      getMetadata('lastFacilitySyncAt').then(val => {
        if (val) {
          try {
            setLastSync(formatDistanceToNow(new Date(val)));
          } catch(e) {}
        }
      });
    }
  }, [isOnline]);

  if (!facility) return null;

  const getConditionConfig = (condition: string) => {
    switch(condition) {
      case 'clean': return { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, text: 'Clean', color: 'text-green-700' };
      case 'usable': return { icon: <CheckCircle2 className="w-5 h-5 text-green-500" />, text: 'Usable', color: 'text-green-700' };
      case 'broken': return { icon: <AlertTriangle className="w-5 h-5 text-red-500" />, text: 'Broken', color: 'text-red-700' };
      case 'locked': return { icon: <Lock className="w-5 h-5 text-orange-500" />, text: 'Locked', color: 'text-orange-700' };
      case 'no_water': return { icon: <DropletOff className="w-5 h-5 text-orange-500" />, text: 'No Water', color: 'text-orange-700' };
      default: return { icon: <CheckCircle2 className="w-5 h-5 text-gray-500" />, text: 'Unknown', color: 'text-gray-700' };
    }
  };

  const config = getConditionConfig(facility.condition);
  
  let formattedDate = 'Unknown';
  let isStale = false;
  try {
    const date = new Date(facility.lastUpdated);
    formattedDate = `${formatDistanceToNow(date)} ago`;
    isStale = (facility.confidenceScore || 100) < 60;
  } catch (e) {}

  const getDistanceText = (meters?: number) => {
    if (meters === undefined) return '';
    if (meters < 1000) return `${Math.round(meters)} m away`;
    return `${(meters / 1000).toFixed(1)} km away`;
  };

  const handleNavigate = () => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`;
    window.open(url, '_blank');
  };

  return (
    <>
      <div className="absolute bottom-0 left-0 right-0 md:bottom-auto md:top-4 md:right-4 md:left-auto md:w-96 bg-white rounded-t-2xl md:rounded-2xl shadow-2xl z-40 transition-transform transform">
        <div className="p-5">
          {!isOnline && (
            <div className="mb-4 bg-gray-100 border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm flex items-start">
              <WifiOff className="w-5 h-5 mr-2 shrink-0 text-gray-500" />
              <div>
                <p className="font-bold">Viewing Cached Data</p>
                <p className="text-gray-600 mt-0.5 text-xs">Last synced {lastSync || 'recently'}. Information may be outdated.</p>
              </div>
            </div>
          )}

          {facility.isUserReported ? (
            <div className="mb-4 bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-lg text-sm flex items-start">
              <Flag className="w-5 h-5 mr-2 shrink-0 text-blue-500" />
              <div>
                <p className="font-semibold">Recent User Report</p>
                <p className="text-blue-700/80 mt-0.5 text-xs">A user recently reported a change in condition. Not yet verified.</p>
              </div>
            </div>
          ) : isStale && (
            <div className="mb-4 bg-orange-50 border border-orange-200 text-orange-800 px-3 py-2 rounded-lg text-sm flex items-start">
              <AlertTriangle className="w-5 h-5 mr-2 shrink-0 text-orange-500" />
              <div>
                <p className="font-semibold">Information may be outdated</p>
                <p className="text-orange-700/80 mt-0.5 text-xs">Please verify before relying on this facility.</p>
              </div>
            </div>
          )}
        
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 pr-2">{facility.name}</h2>
              <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500 mt-2">
                <span className="font-medium text-gray-700 inline-flex items-center">
                  {facility.type === 'toilet' ? (
                    <>
                      <Users className="w-4 h-4 mr-1 text-blue-600" />
                      <span>Public Toilet</span>
                    </>
                  ) : (
                    <>
                      <Droplet className="w-4 h-4 mr-1 text-blue-600 fill-blue-600" />
                      <span>Drinking Water</span>
                    </>
                  )}
                </span>
                {facility.distanceMeters !== undefined && (
                  <>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{getDistanceText(facility.distanceMeters)}</span>
                  </>
                )}
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
              aria-label="Close details"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Status</p>
                <div className="flex items-center space-x-2">
                  {config.icon}
                  <p className={`font-semibold text-sm ${config.color}`}>{config.text}</p>
                </div>
              </div>
              
              <div className="flex flex-col p-3 bg-gray-50 rounded-lg">
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Availability</p>
                <p className={`font-semibold text-sm capitalize ${facility.availability === 'available' ? 'text-gray-800' : 'text-red-600'}`}>
                  {facility.availability || 'Unknown'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {facility.accessibility.wheelchairAccessible && (
                <div className="flex flex-col p-3 bg-blue-50 rounded-lg">
                  <p className="text-[10px] text-blue-600/80 uppercase font-bold tracking-wider mb-1">Accessibility</p>
                  <div className="flex items-center space-x-2">
                    <Accessibility className="w-4 h-4 text-blue-600" />
                    <p className="font-semibold text-sm text-blue-800">Wheelchair</p>
                  </div>
                </div>
              )}
              
              <div className={`flex flex-col p-3 rounded-lg ${isStale ? 'bg-orange-50' : 'bg-green-50'}`}>
                <p className={`text-[10px] uppercase font-bold tracking-wider mb-1 ${isStale ? 'text-orange-600/80' : 'text-green-600/80'}`}>Confidence</p>
                <div className="flex items-center space-x-2">
                  <ShieldCheck className={`w-4 h-4 ${isStale ? 'text-orange-600' : 'text-green-600'}`} />
                  <p className={`font-semibold text-sm capitalize ${isStale ? 'text-orange-800' : 'text-green-800'}`}>
                    {facility.confidenceScore}% — {facility.confidenceLevel}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-1">Address</p>
              <p className="text-sm text-gray-800 leading-relaxed">{facility.address}</p>
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1.5" />
                <span>Last updated: {formattedDate}</span>
              </div>
            </div>
            
            <div className="pt-2 flex gap-3">
              <button 
                onClick={handleNavigate}
                className="flex-1 flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors"
              >
                <Navigation2 className="w-4 h-4 mr-2" />
                Navigate
              </button>
              <button 
                onClick={() => setShowReportForm(true)}
                className="flex-1 flex items-center justify-center bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 rounded-xl font-medium transition-colors"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Report Issue
              </button>
            </div>
          </div>
        </div>
      </div>

      {showReportForm && (
        <ReportForm 
          facility={facility} 
          onClose={() => setShowReportForm(false)} 
          onSuccess={(data) => {
            setShowReportForm(false);
            setTicketData(data);
          }}
        />
      )}

      {ticketData && (
        <TicketSuccess 
          ticketData={ticketData} 
          facility={facility}
          onClose={() => setTicketData(null)} 
          onTrack={(ticketNumber) => {
            setTicketData(null);
          }}
        />
      )}
    </>
  );
}
