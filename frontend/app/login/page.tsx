'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { registerUser } from '@/lib/api';
import TrackTicket from '@/components/reports/TrackTicket';
import {
  ShieldCheck,
  User,
  Building2,
  Lock,
  Mail,
  ArrowRight,
  LogOut,
  Ticket,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
} from 'lucide-react';
import { format } from 'date-fns';

export default function LoginPage() {
  const router = useRouter();
  const { user, login, logout, trackedTickets, claimTicketNumber, refreshTickets } = useAuth();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Register toggle state
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registerName, setRegisterName] = useState('');
  const [registerRole, setRegisterRole] = useState<'citizen' | 'admin'>('citizen');
  const [registerSuccess, setRegisterSuccess] = useState<string | null>(null);

  // Ticket tracking
  const [manualTicketInput, setManualTicketInput] = useState('');
  const [selectedTicketToTrack, setSelectedTicketToTrack] = useState<string | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  // If already logged in as admin, redirect to dedicated /admin page
  React.useEffect(() => {
    if (user?.role === 'admin') {
      router.push('/admin');
    }
  }, [user, router]);

  // Handle Login submission
  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const authUser = await login(email.trim(), password.trim());
      setErrorMessage(null);
      if (authUser.role === 'admin') {
        router.push('/admin');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Registration submission
  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !registerName.trim()) {
      setErrorMessage('Please complete all registration fields.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await registerUser(email.trim(), password.trim(), registerName.trim(), registerRole);
      setRegisterSuccess('Registration successful! Logging you in...');
      const authUser = await login(email.trim(), password.trim());
      if (authUser.role === 'admin') {
        router.push('/admin');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed. Email might already exist.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick fill helper
  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage(null);
  };

  // Handle manual ticket claim / track
  const handleAddTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = manualTicketInput.trim().toUpperCase();
    if (!clean) return;

    setIsClaiming(true);
    try {
      await claimTicketNumber(clean);
      setManualTicketInput('');
      setClaimSuccess(`Ticket ${clean} added to your tracker!`);
      setTimeout(() => setClaimSuccess(null), 4000);
    } catch (e) {
      setErrorMessage('Could not find or save this ticket.');
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5EDF7] flex flex-col justify-between">
      {/* Top Header */}
      <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#BB99CD]/30 py-3.5 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition">
            <div className="w-9 h-9 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="CivicLens Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[#3D1860]">CIVICLENS</span>
              <span className="text-[10px] text-gray-500 font-semibold block sm:inline sm:ml-2">
                Authentication &amp; Ticket Tracking
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-3">
            <Link
              href="/map"
              className="flex items-center space-x-1.5 text-xs sm:text-sm font-bold text-[#3D1860] bg-[#F5EDF7] hover:bg-[#BB99CD]/30 border border-[#BB99CD]/50 px-3.5 py-1.5 rounded-full transition shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-[#643579]" />
              <span>Public Map</span>
            </Link>

            {user && (
              <button
                onClick={logout}
                className="flex items-center space-x-1 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3 py-1.5 rounded-full transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto w-full px-4 py-8 flex-1 flex flex-col items-center">
        {user ? (
          /* ========================================================
             LOGGED IN DASHBOARD VIEW: Profile + Tracked Tickets
             ======================================================== */
          <div className="w-full max-w-4xl space-y-6 animate-in fade-in duration-300">
            {/* User Profile Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md ${
                    user.role === 'admin' ? 'bg-[#643579]' : 'bg-[#3D1860]'
                  }`}
                >
                  {user.role === 'admin' ? <Building2 className="w-7 h-7" /> : <User className="w-7 h-7" />}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-xl font-black text-gray-900">{user.name}</h1>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        user.role === 'admin'
                          ? 'bg-[#643579] text-white'
                          : 'bg-[#F5EDF7] text-[#3D1860] border border-[#BB99CD]'
                      }`}
                    >
                      {user.role === 'admin' ? 'Municipal Authority' : 'Citizen Reporter'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">{user.email}</p>
                  <p className="text-xs text-[#643579] font-semibold mt-1">
                    {user.ward || user.department || 'Fort Kochi / Kakkanad Civic Zone'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => refreshTickets()}
                  className="flex items-center space-x-1.5 text-xs font-bold text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-xl transition"
                  title="Sync latest ticket statuses"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh</span>
                </button>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1.5 text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 px-3.5 py-2 rounded-xl transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            {/* Quick Ticket Input */}
            <div className="bg-white rounded-3xl p-6 shadow-md border border-gray-100">
              <h2 className="text-sm font-bold text-gray-900 mb-1 flex items-center space-x-1.5">
                <Ticket className="w-4 h-4 text-[#643579]" />
                <span>Track or Add Any Ticket</span>
              </h2>
              <p className="text-xs text-gray-500 mb-4">
                Enter any CivicLens ticket number (e.g. <span className="font-mono font-bold text-[#3D1860]">CF-1043</span>) to link it to your account and track resolution live.
              </p>

              <form onSubmit={handleAddTicket} className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={manualTicketInput}
                    onChange={(e) => setManualTicketInput(e.target.value)}
                    placeholder="Enter Ticket Number, e.g. CF-1043"
                    className="w-full pl-10 pr-4 py-2.5 text-xs font-mono uppercase bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#643579] focus:bg-white transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isClaiming || !manualTicketInput.trim()}
                  className="bg-[#3D1860] hover:bg-[#643579] disabled:opacity-50 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center space-x-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{isClaiming ? 'Adding…' : 'Add Ticket'}</span>
                </button>
              </form>

              {claimSuccess && (
                <div className="mt-3 bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs p-2.5 rounded-xl flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{claimSuccess}</span>
                </div>
              )}
            </div>

            {/* Tracked Tickets List */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-black text-[#3D1860] flex items-center space-x-2">
                    <span>My Reported &amp; Tracked Tickets</span>
                    <span className="text-xs bg-[#F5EDF7] text-[#3D1860] font-black px-2.5 py-0.5 rounded-full border border-[#BB99CD]">
                      {trackedTickets.length}
                    </span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tickets you have filed or claimed are saved in your account and updated in real-time.
                  </p>
                </div>
              </div>

              {trackedTickets.length === 0 ? (
                <div className="text-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-2xl">
                  <Ticket className="w-12 h-12 text-[#BB99CD] mx-auto mb-3" />
                  <h3 className="font-bold text-gray-800 text-sm">No tickets tracked yet</h3>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto mt-1 mb-4">
                    When you report a facility problem on the public map or enter a ticket number above, it will appear here for easy tracking.
                  </p>
                  <Link
                    href="/map"
                    className="inline-flex items-center space-x-2 bg-[#3D1860] hover:bg-[#643579] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-md"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Go to Public Map to Report</span>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {trackedTickets.map((t) => (
                    <div
                      key={t.ticketNumber}
                      className="border border-gray-200 hover:border-[#BB99CD] rounded-2xl p-4 transition-all hover:shadow-md bg-gray-50/50 flex flex-col justify-between"
                    >
                      <div>
                        {/* Header: Ticket Number & Status */}
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-1.5 font-mono text-sm font-black text-[#3D1860]">
                            <Ticket className="w-4 h-4 text-[#643579]" />
                            <span>{t.ticketNumber}</span>
                          </div>
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full flex items-center space-x-1 ${
                              t.status === 'resolved'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : t.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-[#F5EDF7] text-[#3D1860] border border-[#BB99CD]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                t.status === 'resolved'
                                  ? 'bg-emerald-600'
                                  : t.status === 'in_progress'
                                  ? 'bg-amber-600 animate-ping'
                                  : 'bg-[#643579]'
                              }`}
                            />
                            <span>{t.status}</span>
                          </span>
                        </div>

                        {/* Facility Name & Department */}
                        <h4 className="font-bold text-xs text-gray-900 line-clamp-1 mb-1" title={t.facilityName}>
                          {t.facilityName || 'Public Facility'}
                        </h4>
                        <p className="text-[11px] text-gray-500 mb-1.5">
                          {t.department || 'Municipal Public Works'}
                        </p>

                        {/* Citizen and Admin Attribution Bar */}
                        <div className="flex items-center justify-between text-[10px] text-gray-500 mb-2 bg-white/80 p-1.5 rounded-xl border border-gray-200/60">
                          <span className="flex items-center space-x-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span>Citizen: <strong className="text-gray-800 font-mono">{t.userEmail || 'user@civiclens.com'}</strong></span>
                          </span>
                          {t.status === 'resolved' ? (
                            <span className="text-emerald-700 font-bold flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              <span>Solved by: <strong>admin@civiclens.com</strong></span>
                            </span>
                          ) : (
                            <span className="text-amber-700 font-medium">
                              Solver: <strong>admin@civiclens.com</strong>
                            </span>
                          )}
                        </div>

                        {/* Status stage / resolution details */}
                        {t.status === 'resolved' ? (
                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-xl p-2 mb-2 text-[11px]">
                            <div className="flex items-center space-x-1 font-bold mb-0.5 text-emerald-900">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>Resolution Verified by Municipal Admin</span>
                            </div>
                            {t.resolutionNotes && (
                              <p className="text-[10px] text-emerald-700 line-clamp-2">{t.resolutionNotes}</p>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1 text-[10px] text-gray-600 mb-2 bg-gray-100/70 px-2 py-1 rounded-lg">
                            <span className="font-semibold text-gray-700">Stage:</span>
                            <span>{t.status === 'in_progress' ? '⚡ Field Crew Dispatched' : '⏳ Logged & Pending Review'}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer Info & Track Button */}
                      <div className="pt-2 border-t border-gray-200/70 flex items-center justify-between text-[10px] text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-gray-400" />
                          <span>
                            {t.createdAt
                              ? format(new Date(t.createdAt), 'MMM d, h:mm a')
                              : 'Recently'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedTicketToTrack(t.ticketNumber)}
                            className="font-bold text-[#643579] hover:text-[#3D1860] hover:underline flex items-center space-x-1"
                          >
                            <span>Live Tracking</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ========================================================
             LOGGED OUT: Modern Login & Hackathon Demo Fill Form
             ======================================================== */
          <div className="w-full max-w-md space-y-5 animate-in fade-in duration-200">
            {/* Login Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-gray-100">
              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#3D1860] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
                  <ShieldCheck className="w-6 h-6 text-[#BB99CD]" />
                </div>
                <h1 className="text-xl font-black text-[#3D1860]">
                  {isRegisterMode ? 'Create CivicLens Account' : 'CivicLens Sign In'}
                </h1>
                <p className="text-xs text-gray-500 mt-1">
                  {isRegisterMode
                    ? 'Register to report facilities and maintain tracked tickets'
                    : 'Sign in to track your reported tickets and submit updates'}
                </p>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-xs p-3 rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success Message */}
              {registerSuccess && (
                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs p-3 rounded-xl flex items-start space-x-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>{registerSuccess}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={isRegisterMode ? handleSubmitRegister : handleSubmitLogin} className="space-y-4">
                {isRegisterMode && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={registerName}
                        onChange={(e) => setRegisterName(e.target.value)}
                        placeholder="e.g. Arun Kumar"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#643579] focus:bg-white transition"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@civiclens.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#643579] focus:bg-white transition"
                      required
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
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#643579] focus:bg-white transition"
                      required
                    />
                  </div>
                </div>

                {isRegisterMode && (
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                      Account Role
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRegisterRole('citizen')}
                        className={`p-2 rounded-xl text-xs font-bold border transition ${
                          registerRole === 'citizen'
                            ? 'bg-[#3D1860] text-white border-[#3D1860]'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        Citizen Reporter
                      </button>
                      <button
                        type="button"
                        onClick={() => setRegisterRole('admin')}
                        className={`p-2 rounded-xl text-xs font-bold border transition ${
                          registerRole === 'admin'
                            ? 'bg-[#643579] text-white border-[#643579]'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        Municipal Admin
                      </button>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#3D1860] hover:bg-[#643579] disabled:opacity-70 text-white font-bold text-xs py-3 rounded-xl transition shadow-md flex items-center justify-center space-x-2 mt-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>{isRegisterMode ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Mode Toggle */}
              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setErrorMessage(null);
                    setRegisterSuccess(null);
                  }}
                  className="text-xs text-[#643579] hover:text-[#3D1860] font-bold transition"
                >
                  {isRegisterMode
                    ? 'Already have an account? Sign in'
                    : 'Need an account? Register new user'}
                </button>
              </div>

              {/* 1-Click Demo Fillers for Evaluators */}
              {!isRegisterMode && (
                <div className="mt-5 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-2">
              
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                   
                  </div>
                </div>
              )}
            </div>

            {/* Quick Guest Ticket Tracking Section */}
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-gray-100">
              <h2 className="text-xs font-bold text-gray-800 flex items-center space-x-1.5 mb-1">
                <Ticket className="w-3.5 h-3.5 text-[#643579]" />
                <span>Track a Ticket Without Signing In</span>
              </h2>
              <p className="text-[11px] text-gray-500 mb-3">
                Have a ticket number like <span className="font-mono font-bold text-[#3D1860]">CF-1043</span>? Track its live municipal status instantly.
              </p>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={manualTicketInput}
                    onChange={(e) => setManualTicketInput(e.target.value)}
                    placeholder="Enter Ticket Number, e.g. CF-1043"
                    className="w-full pl-9 pr-3 py-2 text-xs font-mono uppercase bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#643579] focus:bg-white transition"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (manualTicketInput.trim()) {
                      setSelectedTicketToTrack(manualTicketInput.trim().toUpperCase());
                    }
                  }}
                  disabled={!manualTicketInput.trim()}
                  className="bg-[#643579] hover:bg-[#3D1860] disabled:opacity-50 text-white font-bold text-xs px-3.5 py-2 rounded-xl transition"
                >
                  Track
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Ticket Tracking Modal */}
      {selectedTicketToTrack && (
        <TrackTicket
          initialTicketNumber={selectedTicketToTrack}
          onClose={() => setSelectedTicketToTrack(null)}
        />
      )}

      {/* Footer */}
      <footer className="w-full text-center py-4 text-xs text-gray-500">
        CivicLens • Hackathon Edition • Normal Auth &amp; Live Ticket Tracking
      </footer>
    </div>
  );
}
