import { useState } from 'react';
import { createFacility } from '@/lib/api';
import { X, MapPin, Droplet, Users } from 'lucide-react';

interface AddFacilityFormProps {
  initialLat: number;
  initialLng: number;
  onClose: () => void;
  onSuccess: (facility: any) => void;
}

export default function AddFacilityForm({ initialLat, initialLng, onClose, onSuccess }: AddFacilityFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'toilet' | 'drinking_water'>('toilet');
  const [address, setAddress] = useState('');
  const [wheelchair, setWheelchair] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let userId = "demo_user_123";
      let userRole = "citizen";
      try {
        const stored = localStorage.getItem('civiclens_user');
        if (stored) {
          const user = JSON.parse(stored);
          userId = user.id || userId;
          userRole = user.role || userRole;
        }
      } catch(e) {}

      const facilityData = {
        name,
        type,
        address,
        location: {
          type: "Point",
          coordinates: [initialLng, initialLat]
        },
        accessibility: {
          wheelchairAccessible: wheelchair
        },
        availability: "available",
        condition: "clean",
        submittedBy: userId
      };

      const result = await createFacility(facilityData, userRole);
      onSuccess(result);
    } catch(err: any) {
      setError(err.message || 'Failed to submit facility');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#3D1860] p-6 text-white relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          
          <h2 className="text-xl font-black mb-1">Add Missing Facility</h2>
          <p className="text-sm text-purple-200/80">Help your community by mapping unlisted toilets and water points.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Facility Type</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setType('toilet')}
                className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 transition-all ${type === 'toilet' ? 'border-[#643579] bg-[#F5EDF7] text-[#3D1860]' : 'border-gray-200 text-gray-500 hover:border-[#BB99CD]'}`}
              >
                <Users className="w-6 h-6 mb-1" />
                <span className="text-sm font-semibold">Toilet</span>
              </button>
              <button
                type="button"
                onClick={() => setType('drinking_water')}
                className={`flex-1 flex flex-col items-center p-3 rounded-xl border-2 transition-all ${type === 'drinking_water' ? 'border-[#643579] bg-[#F5EDF7] text-[#3D1860]' : 'border-gray-200 text-gray-500 hover:border-[#BB99CD]'}`}
              >
                <Droplet className="w-6 h-6 mb-1" />
                <span className="text-sm font-semibold">Water Point</span>
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Name</label>
            <input 
              required
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MG Road Public Toilet"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#643579] transition-all"
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Address</label>
            <input 
              required
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nearest landmark or street"
              className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#643579] transition-all"
            />
          </div>
          
          <div className="flex items-center gap-3">
            <input 
              type="checkbox"
              id="wheelchair"
              checked={wheelchair}
              onChange={(e) => setWheelchair(e.target.checked)}
              className="w-5 h-5 text-[#643579] rounded border-gray-300 focus:ring-[#643579]"
            />
            <label htmlFor="wheelchair" className="text-sm font-semibold text-gray-700 cursor-pointer">
              Wheelchair Accessible
            </label>
          </div>
          
          <div className="pt-2">
            <button 
              type="submit"
              disabled={submitting}
              className="w-full bg-[#3D1860] hover:bg-[#643579] text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70"
            >
              <MapPin className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Add Facility'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
