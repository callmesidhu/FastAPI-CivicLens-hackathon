'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, UserRole } from '@/lib/authContext';
import { X, User, ShieldCheck, ArrowRight, Building2, Mail, Lock, AlertCircle, Ticket, Sparkles } from 'lucide-react';

export default function LoginModal() {
  const router = useRouter();
  const { isLoginModalOpen, closeLoginModal, login, loginAs } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLoginModalOpen) return null;

  const handleEmailPasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please provide email and password');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await login(email.trim(), password.trim());
      closeLoginModal();
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await loginAs(role);
      closeLoginModal();
    } catch (err: any) {
      setError(err.message || 'Quick login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoToFullLoginPage = () => {
    closeLoginModal();
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D1860] text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-[#BB99CD]" />
            </div>
            <div>
              <h2 className="text-base font-black text-[#3D1860]">CivicLens Sign In</h2>
              <p className="text-xs text-gray-500">Normal Email &amp; Password DB Auth</p>
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
        <div className="p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Select Buttons */}
          <div>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1">
              Select Account (Instant Login)
            </span>
            <div className="grid grid-cols-2 gap-2 mt-1">
              <button
                type="button"
                onClick={() => handleQuickLogin('citizen')}
                className="p-3 rounded-2xl border-2 border-[#3D1860]/30 hover:border-[#3D1860] bg-[#F5EDF7]/70 hover:bg-[#F5EDF7] transition text-left flex flex-col justify-between"
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <User className="w-3.5 h-3.5 text-[#3D1860]" />
                  <span className="text-xs font-black text-[#3D1860]">Citizen</span>
                </div>
                <p className="text-[10px] font-mono text-gray-600 truncate">user@civiclens.com</p>
                <span className="text-[9px] text-[#643579] font-semibold mt-1">For Reporting &amp; Tracking</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-3 rounded-2xl border-2 border-[#643579]/30 hover:border-[#643579] bg-[#643579]/10 hover:bg-[#643579]/20 transition text-left flex flex-col justify-between"
              >
                <div className="flex items-center space-x-1.5 mb-1">
                  <Building2 className="w-3.5 h-3.5 text-[#643579]" />
                  <span className="text-xs font-black text-[#643579]">Admin</span>
                </div>
                <p className="text-[10px] font-mono text-gray-600 truncate">admin@civiclens.com</p>
                <span className="text-[9px] text-[#643579] font-semibold mt-1">Municipal Authority</span>
              </button>
            </div>
          </div>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase font-bold text-gray-400">
              <span className="bg-white px-2">Or enter credentials</span>
            </div>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailPasswordLogin} className="space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@civiclens.com"
                  className="w-full pl-10 pr-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#643579] focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="password123"
                  className="w-full pl-10 pr-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#643579] focus:bg-white transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#3D1860] hover:bg-[#643579] disabled:opacity-60 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-md flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Full Page Link */}
          <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleGoToFullLoginPage}
              className="text-xs text-[#643579] hover:text-[#3D1860] font-bold flex items-center space-x-1.5 transition"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Open Full Account &amp; Ticket Tracking Page</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
