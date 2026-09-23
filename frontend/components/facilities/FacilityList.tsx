import { Facility } from '@/types';
import { Droplet, CheckCircle2, AlertTriangle, Lock, DropletOff, Accessibility, Users, Search } from 'lucide-react';

interface FacilityListProps {
  facilities: Facility[];
  selectedFacility: Facility | null;
  onSelectFacility: (facility: Facility) => void;
}

export default function FacilityList({ facilities, selectedFacility, onSelectFacility }: FacilityListProps) {
  
  const getConditionConfig = (condition: string) => {
    switch(condition) {
      case 'clean': 
      case 'usable': return { icon: <CheckCircle2 className="w-4 h-4 text-green-500" />, text: 'Usable', color: 'text-green-700', bg: 'bg-green-50' };
      case 'broken': return { icon: <AlertTriangle className="w-4 h-4 text-red-500" />, text: 'Broken', color: 'text-red-700', bg: 'bg-red-50' };
      case 'locked': return { icon: <Lock className="w-4 h-4 text-orange-500" />, text: 'Locked', color: 'text-orange-700', bg: 'bg-orange-50' };
      case 'no_water': return { icon: <DropletOff className="w-4 h-4 text-orange-500" />, text: 'No Water', color: 'text-orange-700', bg: 'bg-orange-50' };
      default: return { icon: <CheckCircle2 className="w-4 h-4 text-gray-500" />, text: 'Unknown', color: 'text-gray-700', bg: 'bg-gray-50' };
    }
  };

  const getDistanceText = (meters?: number) => {
    if (meters === undefined) return '';
    if (meters < 1000) return `${Math.round(meters)} m away`;
    return `${(meters / 1000).toFixed(1)} km away`;
  };

  return (
    <div className="w-full md:w-96 bg-white border-l h-full flex flex-col shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.1)] z-30 relative">
      <div className="p-4 border-b bg-gray-50">
        <h2 className="font-bold text-gray-800">{facilities.length} facilities nearby</h2>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {facilities.map(facility => {
          const config = getConditionConfig(facility.condition);
          const isSelected = selectedFacility?.id === facility.id;
          
          return (
            <div 
              key={facility.id}
              onClick={() => onSelectFacility(facility)}
              className={`p-4 border-b cursor-pointer transition-colors hover:bg-[#F5EDF7]/50 ${isSelected ? 'bg-[#F5EDF7] border-l-4 border-l-[#3D1860]' : 'border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 text-base">{facility.name}</h3>
                {facility.distanceMeters !== undefined && (
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                    {getDistanceText(facility.distanceMeters)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center text-sm text-gray-600 mb-3">
                {facility.type === 'toilet' ? (
                  <>
                    <Users className="w-4 h-4 mr-1.5 text-[#643579]" />
                    <span>Public Toilet</span>
                  </>
                ) : (
                  <>
                    <Droplet className="w-4 h-4 mr-1.5 text-[#643579] fill-[#643579]" />
                    <span>Drinking Water</span>
                  </>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium ${config.bg} ${config.color}`}>
                  {config.icon}
                  <span>{config.text}</span>
                </span>
                
                {facility.accessibility.wheelchairAccessible && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F5EDF7] text-[#3D1860] border border-[#BB99CD]/40">
                    <Accessibility className="w-3.5 h-3.5" />
                    <span>Accessible</span>
                  </span>
                )}

                {facility.isUserReported && (
                  <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium bg-[#F5EDF7] text-[#643579] border border-[#BB99CD]/40">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>User Reported</span>
                  </span>
                )}
              </div>
              
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>{facility.confidenceScore}% confidence</span>
                {facility.confidenceScore && facility.confidenceScore < 60 && (
                  <span className="text-orange-600 flex items-center"><AlertTriangle className="w-3 h-3 mr-1"/> May be outdated</span>
                )}
              </div>
            </div>
          );
        })}
        
        {facilities.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Search className="w-8 h-8 mx-auto mb-2 text-gray-400" />
            <p>No facilities found.</p>
            <p className="text-sm mt-1">Try expanding your search radius or changing filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
