'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Facility } from '@/types';
import { submitReport, uploadImage } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import {
  X,
  AlertCircle,
  Camera,
  Image as ImageIcon,
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';

interface ReportFormProps {
  facility: Facility;
  onClose: () => void;
  onSuccess: (ticketData: any) => void;
}

export default function ReportForm({ facility, onClose, onSuccess }: ReportFormProps) {
  const router = useRouter();
  const { user, loginAs, openLoginModal } = useAuth();
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
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

  const handleQuickLoginCitizen = async () => {
    setIsLoggingIn(true);
    try {
      await loginAs('citizen');
      setError(null);
    } catch (e) {
      setError('Could not complete quick sign in.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Authentication required: You must be logged in to report a problem.');
      return;
    }

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
          finalImageUrl = imagePreview || undefined;
        }
      }

      const result = await submitReport(
        facility.id,
        condition,
        description,
        finalImageUrl,
        user.email
      );
      onSuccess(result);
    } catch (err: any) {
      setError(err.message || 'Your report could not be submitted. Please try again.');
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

  /* ------------------------------------------------------------------
     1. AUTHENTICATION REQUIRED VIEW (User not logged in)
     ------------------------------------------------------------------ */
  if (!user) {
    return (
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col border border-gray-100">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <div>
              <h3 className="font-bold text-gray-900 text-base">Sign In Required</h3>
              <p className="text-xs text-gray-500 truncate max-w-[280px]">{facility.name}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-[#F5EDF7] border border-[#BB99CD]/40 rounded-2xl flex items-center justify-center mx-auto text-[#3D1860] shadow-sm">
              <Lock className="w-7 h-7" />
            </div>

            <div>
              <h4 className="text-lg font-black text-gray-900">User must be logged in</h4>
              <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto leading-relaxed">
                To report a problem and track municipal repair tickets, you must be logged in as a citizen reporter.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={handleQuickLoginCitizen}
                disabled={isLoggingIn}
                className="w-full bg-[#3D1860] hover:bg-[#643579] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition shadow-md text-xs flex items-center justify-center space-x-2"
              >
                {isLoggingIn ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Quick Sign In as Citizen</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  router.push('/login');
                }}
                className="w-full bg-[#F5EDF7] hover:bg-[#BB99CD]/30 text-[#3D1860] border border-[#BB99CD]/50 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center space-x-1.5"
              >
                <span>Go to Login / Account Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full bg-white hover:bg-gray-100 text-gray-600 border border-gray-200 font-bold py-2 rounded-xl transition text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------
     2. REPORT FORM (User is authenticated)
     ------------------------------------------------------------------ */
  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50/70 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Report a problem</h3>
            <p className="text-xs text-gray-500 font-medium mt-0.5 max-w-[280px] truncate" title={facility.name}>
              {facility.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Identity Chip */}
        <div className="px-4 pt-3 pb-1">
          <div className="bg-[#F5EDF7] p-2.5 rounded-xl border border-[#BB99CD]/40 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-lg bg-[#3D1860] text-white flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#3D1860] leading-none">{user.name}</p>
                <p className="text-[10px] text-gray-500 font-mono mt-0.5">{user.email}</p>
              </div>
            </div>
            <span className="text-[9px] bg-white border border-[#BB99CD] text-[#3D1860] px-2 py-0.5 rounded-full font-extrabold uppercase">
              Logged In
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-start border border-red-200">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-800 text-xs mb-2">What is wrong?</label>
            <div className="space-y-2">
              {conditions.map((c) => (
                <label
                  key={c.id}
                  className={`flex items-start p-3 border rounded-xl cursor-pointer transition-colors ${
                    condition === c.id
                      ? 'border-[#3D1860] bg-[#F5EDF7]'
                      : 'border-gray-200 hover:bg-[#F5EDF7]/50'
                  }`}
                >
                  <input
                    type="radio"
                    name="condition"
                    value={c.id}
                    checked={condition === c.id}
                    onChange={(e) => setCondition(e.target.value)}
                    className="mt-0.5 w-4 h-4 text-[#3D1860] focus:ring-[#643579]"
                  />
                  <div className="ml-3">
                    <p
                      className={`font-semibold text-xs ${
                        condition === c.id ? 'text-[#3D1860]' : 'text-gray-800'
                      }`}
                    >
                      {c.label}
                    </p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        condition === c.id ? 'text-[#643579]' : 'text-gray-500'
                      }`}
                    >
                      {c.desc}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-bold text-gray-800 text-xs mb-1">
              Description <span className="font-normal text-gray-500 text-xs">(optional)</span>
            </label>
            <textarea
              rows={3}
              className="w-full border border-gray-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#BB99CD] focus:border-[#643579] outline-none"
              placeholder="Tell us what you observed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block font-bold text-gray-800 text-xs mb-1">
              Photo <span className="font-normal text-gray-500 text-xs">(optional)</span>
            </label>
            {imagePreview ? (
              <div className="relative rounded-xl overflow-hidden border border-gray-200 h-32 w-full">
                <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex flex-col items-center justify-center pt-4 pb-5">
                  <Camera className="w-5 h-5 text-gray-400 mb-1" />
                  <p className="text-xs text-gray-500">
                    <span className="font-semibold text-[#3D1860]">Click to upload</span> photo
                  </p>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-start">
            <ShieldCheck className="w-4 h-4 mr-2 text-emerald-600 shrink-0 mt-0.5" />
            <p className="text-[11px] text-gray-600 leading-relaxed">
              Ticket will be linked to your account (<span className="font-bold text-[#3D1860]">{user.email}</span>) and saved in your login dashboard for live tracking.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#3D1860] hover:bg-[#643579] disabled:opacity-70 text-white font-bold py-3 rounded-xl transition-colors mt-2 flex justify-center items-center shadow-md text-xs"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              `Submit Report as ${user.name}`
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
