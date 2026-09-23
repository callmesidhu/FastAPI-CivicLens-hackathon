import { useState } from 'react';
import { Facility } from '@/types';
import { submitReport, uploadImage } from '@/lib/api';
import { X, AlertCircle, Camera, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ReportFormProps {
  facility: Facility;
  onClose: () => void;
  onSuccess: (ticketData: any) => void;
}

export default function ReportForm({ facility, onClose, onSuccess }: ReportFormProps) {
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image must be less than 5MB');
        return;
      }
      setImageFile(file);
      setError(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition) {
      setError('Please select a condition');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      let finalImageUrl: string | undefined = undefined;
      const isOnline = typeof window !== 'undefined' && navigator.onLine;

      if (imageFile) {
        if (isOnline) {
          finalImageUrl = await uploadImage(imageFile, imageFile.name);
        } else {
          // If offline, save the base64 preview string. SyncManager will convert it back to blob later.
          finalImageUrl = imagePreview || undefined;
        }
      }

      const result = await submitReport(facility.id, condition, description, finalImageUrl);
      onSuccess(result);
    } catch (err) {
      setError('Your report could not be submitted. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const conditions = [
    { id: 'usable', label: 'Clean & Usable', desc: 'Facility is in good condition' },
    { id: 'broken', label: 'Broken', desc: 'Infrastructure is damaged' },
    { id: 'locked', label: 'Locked', desc: 'Cannot access the facility' },
    { id: 'no_water', label: 'No Water', desc: 'Taps are dry' },
  ];

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Report a problem</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5">{facility.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm flex items-start">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div>
            <label className="block font-bold text-gray-800 mb-2">What is wrong?</label>
            <div className="space-y-2">
              {conditions.map(c => (
                <label 
                  key={c.id} 
                  className={`flex items-start p-3 border rounded-xl cursor-pointer transition-colors ${condition === c.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                >
                  <input 
                    type="radio" 
                    name="condition" 
                    value={c.id} 
                    checked={condition === c.id}
                    onChange={(e) => setCondition(e.target.value)}
                    className="mt-0.5 w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="ml-3">
                    <p className={`font-semibold text-sm ${condition === c.id ? 'text-blue-900' : 'text-gray-800'}`}>{c.label}</p>
                    <p className={`text-xs mt-0.5 ${condition === c.id ? 'text-blue-700' : 'text-gray-500'}`}>{c.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block font-bold text-gray-800 mb-2">Description <span className="font-normal text-gray-500 text-sm">(optional)</span></label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="Tell us what you observed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 mb-2">Photo <span className="font-normal text-gray-500 text-sm">(optional)</span></label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 h-32 w-full">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                <button 
                  type="button" 
                  onClick={() => { setImageFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Camera className="w-6 h-6 text-gray-400 mb-1" />
                  <p className="text-sm text-gray-500"><span className="font-semibold text-blue-600">Click to upload</span> or drag</p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>
          
          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start">
            <span className="text-xl mr-2 mt-[-2px]">🛡️</span>
            <p className="text-xs text-gray-600 leading-relaxed">
              This report is completely <span className="font-bold">anonymous</span>. We do not store your name or track your personal history. Help keep facility information accurate for everyone.
            </p>
          </div>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-bold py-3 rounded-xl transition-colors mt-4 flex justify-center items-center"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              'Submit Anonymously'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
