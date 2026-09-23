'use client';

import React, { useState } from 'react';
import { useAuth, UserRole } from '@/lib/authContext';
import { X, User, ShieldCheck, CheckCircle2, ArrowRight, Building2, MapPin } from 'lucide-react';

export default function LoginModal() {
  const { isLoginModalOpen, closeLoginModal, loginAs } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('citizen');
  const [customName, setCustomName] = useState('');

  if (!isLoginModalOpen) return null;

  const handleLogin = (role: UserRole) => {
    loginAs(role, customName);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-gray-950 flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900">CivicLens Authentication</h2>
              <p className="text-xs text-gray-500">Select a dummy profile to experience role-based civic workflows</p>
            </div>
          </div>
          <button
            onClick={closeLoginModal}
            className="p-1.5 rounded-full hover:bg-gray-200/70 text-gray-400 hover:text-gray-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Role Switcher Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Citizen Role */}
            <div
              onClick={() => setSelectedRole('citizen')}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col justify-between ${
                selectedRole === 'citizen'
                  ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-100'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  {selectedRole === 'citizen' && (
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  )}
                </div>
                <h3 className="font-black text-sm text-gray-900 mb-0.5">Citizen / Reporter</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                  Report broken amenities, track tickets, and upload resolution feedback.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100/80 text-[10px] text-gray-600">
                <span className="font-bold text-gray-800">Demo User:</span> Arun Kumar (Ward 14)
              </div>
            </div>

            {/* Admin Role */}
            <div
              onClick={() => setSelectedRole('admin')}
              className={`cursor-pointer rounded-2xl border-2 p-4 transition-all flex flex-col justify-between ${
                selectedRole === 'admin'
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <Building2 className="w-5 h-5" />
                  </div>
                  {selectedRole === 'admin' && (
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                  )}
                </div>
                <h3 className="font-black text-sm text-gray-900 mb-0.5">Government Authority</h3>
                <p className="text-[11px] text-gray-500 leading-relaxed mb-3">
                  Dispatch field crews, update ticket status, and verify resolution evidence.
                </p>
              </div>

              <div className="pt-2 border-t border-gray-100/80 text-[10px] text-gray-600">
                <span className="font-bold text-gray-800">Demo Official:</span> Kochi Municipal Corp
              </div>
            </div>
          </div>

          {/* Optional Name Override */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-gray-600 uppercase tracking-wider">
              Custom Name (Optional)
            </label>
            <input
              type="text"
              placeholder={selectedRole === 'citizen' ? 'e.g. Arun Kumar' : 'e.g. Ward 14 Sanitation Inspector'}
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 outline-none focus:border-amber-500 focus:bg-white transition"
            />
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              onClick={() => handleLogin(selectedRole)}
              className={`w-full py-3 px-4 rounded-xl font-bold text-xs text-white shadow-md transition transform active:scale-98 flex items-center justify-center space-x-2 ${
                selectedRole === 'admin' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-amber-400 hover:bg-amber-500 text-gray-950 font-black'
              }`}
            >
              <span>Sign In as {selectedRole === 'citizen' ? 'Citizen Reporter' : 'Government Authority (Admin)'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                loginAs(selectedRole === 'citizen' ? 'admin' : 'citizen');
              }}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-gray-600 hover:bg-gray-100 transition flex items-center justify-center"
            >
              Quick switch &amp; sign in as {selectedRole === 'citizen' ? 'Admin' : 'Citizen'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
