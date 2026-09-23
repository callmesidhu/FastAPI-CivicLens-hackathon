'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchTicket, getFullImageUrl } from '@/lib/api';
import { useAuth } from '@/lib/authContext';
import {
  X,
  Search,
  Ticket,
  Clock,
  Building2,
  AlertCircle,
  User,
  ArrowRight,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  ShieldCheck,
  Truck,
  ExternalLink,
  Check,
  MapPin,
  Camera,
} from 'lucide-react';
import { format } from 'date-fns';

interface TrackTicketProps {
  initialTicketNumber?: string;
  onClose: () => void;
}

export default function TrackTicket({ initialTicketNumber = '', onClose }: TrackTicketProps) {
  const router = useRouter();
  const { user, loginAs, trackedTickets, openLoginModal } = useAuth();

  const [activeTab, setActiveTab] = useState<'id' | 'account'>(initialTicketNumber ? 'id' : (user ? 'account' : 'id'));
  const [ticketNumber, setTicketNumber] = useState(initialTicketNumber);
  const [ticketData, setTicketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isQuickLoggingIn, setIsQuickLoggingIn] = useState(false);

  const handleSearchWithNumber = async (num: string) => {
    const cleanNum = num.trim().toUpperCase();
    if (!cleanNum) return;

    setIsLoading(true);
    setError(null);
    setTicketData(null);

    try {
      const data = await fetchTicket(cleanNum);
      setTicketData(data);
      setTicketNumber(cleanNum);
    } catch (err) {
      setError('Ticket not found. Please check the ticket number and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    handleSearchWithNumber(ticketNumber);
  };

  const handleQuickLogin = async () => {
    setIsQuickLoggingIn(true);
    try {
      await loginAs('citizen');
      setActiveTab('account');
    } catch (e) {
      setError('Quick sign in failed. Please try again.');
    } finally {
      setIsQuickLoggingIn(false);
    }
  };

  useEffect(() => {
    if (initialTicketNumber) {
      handleSearchWithNumber(initialTicketNumber);
    }
  }, [initialTicketNumber]);

  const cleanStatus = ticketData?.status ? String(ticketData.status).toLowerCase() : '';
  const isResolved = cleanStatus === 'resolved';
  const isInProgress = cleanStatus === 'in_progress' || cleanStatus === 'dispatched';
  const currentStep = isResolved ? 3 : (isInProgress ? 2 : 1);

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh] border border-gray-100">
        {/* Header */}
        <div className="p-4 border-b bg-gray-50/80 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#3D1860] text-white flex items-center justify-center shadow-xs">
              <Ticket className="w-4 h-4 text-[#BB99CD]" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-base leading-none">Civic Resolution Tracker</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">Real-time status from report to municipal verification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: By ID vs By Login/Account */}
        <div className="p-3 bg-gray-50/50 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-1.5 bg-gray-200/70 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setActiveTab('id');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'id'
                  ? 'bg-white text-[#3D1860] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Track by Ticket ID</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('account');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl transition flex items-center justify-center space-x-1.5 ${
                activeTab === 'account'
                  ? 'bg-white text-[#3D1860] shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{user ? 'My Tickets' : 'Sign In / Account'}</span>
              {user && trackedTickets.length > 0 && (
                <span className="ml-1 bg-[#3D1860] text-white text-[9px] px-1.5 py-0.2 rounded-full">
                  {trackedTickets.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* ========================================================
              TAB 1: TRACK BY TICKET ID
              ======================================================== */}
          {activeTab === 'id' && (
            <div>
              <form onSubmit={handleSearch} className="mb-3">
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  Enter Ticket Number
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="e.g. CF-1043 or TCK-KAK-7821"
                      className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#BB99CD] focus:border-[#643579] outline-none font-mono uppercase text-xs font-bold"
                      value={ticketNumber}
                      onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isLoading || !ticketNumber.trim()}
                    className="bg-[#3D1860] hover:bg-[#643579] disabled:opacity-50 text-white px-4 rounded-xl font-bold text-xs transition shadow-xs"
                  >
                    {isLoading ? <span className="animate-pulse">Searching…</span> : 'Track'}
                  </button>
                </div>
              </form>

              {/* Login Helper prompt */}
              {!user ? (
                <div className="bg-[#F5EDF7]/60 border border-[#BB99CD]/40 rounded-2xl p-2.5 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-[#643579]" />
                    <p className="text-[11px] text-gray-700">
                      Have an account? <span className="font-bold text-[#3D1860]">Sign in</span> to view all your tickets.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('account')}
                    className="text-[11px] font-bold text-[#643579] hover:text-[#3D1860] underline whitespace-nowrap ml-2"
                  >
                    Sign In
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-2.5 flex items-center justify-between">
                  <span className="text-[11px] text-gray-600">
                    Logged in as <span className="font-bold text-gray-900">{user.email}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('account')}
                    className="text-[11px] font-bold text-[#643579] hover:underline flex items-center gap-1"
                  >
                    <span>View All Tickets ({trackedTickets.length})</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================
              TAB 2: ACCOUNT / LOGIN TO VIEW TICKETS
              ======================================================== */}
          {activeTab === 'account' && (
            <div>
              {!user ? (
                <div className="text-center py-4 space-y-4">
                  <div className="w-12 h-12 bg-[#F5EDF7] rounded-2xl flex items-center justify-center mx-auto text-[#3D1860] border border-[#BB99CD]/50">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900">Sign in to view your tickets</h4>
                    <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
                      Log in to access your saved reports, track resolution progress, and verify municipal updates.
                    </p>
                  </div>

                  <div className="space-y-2 pt-2">
                    <button
                      type="button"
                      onClick={handleQuickLogin}
                      disabled={isQuickLoggingIn}
                      className="w-full bg-[#3D1860] hover:bg-[#643579] disabled:opacity-60 text-white font-bold py-2.5 rounded-xl transition shadow-md text-xs flex items-center justify-center space-x-2"
                    >
                      {isQuickLoggingIn ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <span>Quick Sign In as Citizen</span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        router.push('/login');
                      }}
                      className="w-full bg-[#F5EDF7] hover:bg-[#BB99CD]/30 text-[#3D1860] border border-[#BB99CD]/50 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center space-x-1"
                    >
                      <span>Open Full Login Page</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between pb-1">
                    <div>
                      <p className="text-xs font-bold text-[#3D1860]">
                        Tickets for {user.name}
                      </p>
                      <p className="text-[10px] text-gray-500">Select any ticket to view live resolution timeline</p>
                    </div>
                  </div>

                  {trackedTickets.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl">
                      <Ticket className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs font-bold text-gray-700">No tickets found on this account</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Submit an issue on the map or track by ID</p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('id')}
                        className="mt-3 text-xs font-bold text-[#643579] hover:underline"
                      >
                        Search by ticket number &rarr;
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {trackedTickets.map((t) => {
                        const isTikResolved = t.status === 'resolved';
                        const isTikInProgress = t.status === 'in_progress' || t.status === 'dispatched';

                        return (
                          <div
                            key={t.ticketNumber}
                            onClick={() => {
                              setActiveTab('id');
                              handleSearchWithNumber(t.ticketNumber);
                            }}
                            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                              ticketData?.ticketNumber === t.ticketNumber
                                ? 'border-[#3D1860] bg-[#F5EDF7] shadow-xs'
                                : 'border-gray-200 hover:border-[#BB99CD] bg-gray-50/70 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex-1 min-w-0 pr-2">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs font-black text-[#3D1860]">
                                  {t.ticketNumber}
                                </span>
                                <span
                                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                                    isTikResolved
                                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      : isTikInProgress
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : 'bg-[#3D1860] text-white'
                                  }`}
                                >
                                  {isTikResolved ? (
                                    <>
                                      <Check className="w-2.5 h-2.5 mr-0.5" />
                                      <span>Resolved</span>
                                    </>
                                  ) : (
                                    <span>{t.status.replace('_', ' ')}</span>
                                  )}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-700 font-semibold truncate mt-0.5">
                                {t.facilityName || 'Public Facility'}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs flex items-center border border-red-200">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* ========================================================
              LIVE TICKET DETAILS & VISUAL TRACKING STEPPER
              ======================================================== */}
          {ticketData && (
            <div className="space-y-4 pt-3 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-2 duration-200">
              {/* Stepper Header */}
              <div className="bg-gray-50/90 rounded-2xl p-4 border border-gray-200/90 shadow-2xs">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-200/60">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-black text-[#3D1860] bg-white border border-[#BB99CD] px-2.5 py-0.5 rounded-lg shadow-2xs">
                      {ticketData.ticketNumber}
                    </span>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      Live Resolution Tracking
                    </span>
                  </div>
                  <span
                    className={`text-xs font-black uppercase px-2.5 py-0.5 rounded-full ${
                      isResolved
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : isInProgress
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-[#F5EDF7] text-[#3D1860] border border-[#BB99CD]'
                    }`}
                  >
                    {isResolved ? 'Resolved & Verified' : ticketData.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Visual 3-Stage Progress Timeline */}
                <div className="relative flex items-center justify-between pt-1 pb-1 px-2">
                  {/* Connecting Line */}
                  <div className="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-gray-200 -z-0">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isResolved ? 'w-full bg-emerald-500' : isInProgress ? 'w-1/2 bg-amber-500' : 'w-0'
                      }`}
                    />
                  </div>

                  {/* Stage 1: Submitted */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs ${
                        currentStep >= 1
                          ? 'bg-[#3D1860] text-white ring-4 ring-purple-100'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-800 mt-1.5">Logged</span>
                    <span className="text-[9px] text-gray-400">Citizen Report</span>
                  </div>

                  {/* Stage 2: Dispatched */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all ${
                        currentStep >= 2
                          ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      {currentStep > 2 ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Truck className={`w-3.5 h-3.5 ${isInProgress ? 'animate-bounce' : ''}`} />
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-1.5 ${
                        isInProgress ? 'text-amber-800' : currentStep > 2 ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      Dispatched
                    </span>
                    <span className="text-[9px] text-gray-400">Field Crew</span>
                  </div>

                  {/* Stage 3: Resolved */}
                  <div className="flex flex-col items-center z-10">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-xs transition-all ${
                        isResolved
                          ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-1.5 ${
                        isResolved ? 'text-emerald-800 font-extrabold' : 'text-gray-400'
                      }`}
                    >
                      Resolved
                    </span>
                    <span className="text-[9px] text-gray-400">Verified Clean</span>
                  </div>
                </div>
              </div>

              {/* ====================================================
                  RESOLUTION HIGHLIGHT CARD (When Resolved)
                  ==================================================== */}
              {isResolved && (
                <div className="bg-emerald-50/90 border border-emerald-200 rounded-2xl p-4 space-y-3 animate-in fade-in duration-300">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-950 leading-tight">
                        Issue Verified &amp; Resolved
                      </h4>
                      <p className="text-[11px] text-emerald-700">
                        {ticketData.resolvedAt
                          ? `Completed on ${format(new Date(ticketData.resolvedAt), 'MMM d, yyyy • h:mm a')}`
                          : 'Municipal verification completed'}
                      </p>
                    </div>
                  </div>

                  {/* Solved By Admin Banner */}
                  <div className="bg-emerald-100/70 rounded-xl p-2.5 border border-emerald-300/80 flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                      <div>
                        <span className="text-[10px] uppercase font-black text-emerald-800 tracking-wider block">
                          Problem Solved &amp; Verified By:
                        </span>
                        <span className="font-bold text-emerald-950">
                          {ticketData.resolvedBy || 'admin@civiclens.com'}
                        </span>
                        <span className="text-emerald-700 text-[11px] ml-1.5 font-medium">
                          ({ticketData.resolvedByName || 'Municipal Authority Admin'})
                        </span>
                      </div>
                    </div>
                    <span className="bg-emerald-700 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-2xs shrink-0">
                      System Admin
                    </span>
                  </div>

                  {/* Resolution Notes from Officer */}
                  <div className="bg-white/80 rounded-xl p-3 border border-emerald-200/80 text-xs">
                    <p className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider mb-1">
                      Municipal Resolution Report:
                    </p>
                    <p className="text-gray-900 font-medium leading-relaxed">
                      {ticketData.resolutionNotes || 'Facility checked, repaired, and restored to clean status by municipal crew.'}
                    </p>
                  </div>

                  {/* Resolution Proof Photo (if provided by admin) */}
                  {ticketData.resolvedImageUrl && (
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider flex items-center space-x-1">
                        <Camera className="w-3 h-3 text-emerald-600" />
                        <span>Resolution Evidence Photo:</span>
                      </p>
                      <div className="relative w-full h-36 rounded-xl overflow-hidden border border-emerald-200 bg-gray-100 group">
                        <img
                          src={getFullImageUrl(ticketData.resolvedImageUrl)}
                          alt="Official Municipal Proof of Resolution"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <a
                          href={getFullImageUrl(ticketData.resolvedImageUrl)}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>View Full Proof</span>
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="pt-1 flex items-center justify-between text-[11px] text-emerald-800">
                    <span className="font-semibold">Facility Condition:</span>
                    <span className="bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-full text-[10px]">
                      Clean &amp; Operational
                    </span>
                  </div>
                </div>
              )}

              {/* Status Note (When In-Progress) */}
              {isInProgress && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start space-x-2 text-xs">
                  <Truck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
                  <div className="flex-1">
                    <p className="font-bold text-amber-900">Municipal Crew Dispatched to Site</p>
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      {ticketData.resolutionNotes || 'A field repair team is actively addressing the reported issue.'}
                    </p>
                  </div>
                </div>
              )}

              {/* Facility & Ticket Information */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl overflow-hidden text-xs">
                <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-white">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-bold">Facility</p>
                    <p className="font-bold text-gray-900 text-sm">{ticketData.facilityName || 'Civic Infrastructure Asset'}</p>
                  </div>
                  <span
                    className={`font-black text-[10px] uppercase px-2 py-0.5 rounded-full ${
                      ticketData.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
                    }`}
                  >
                    {ticketData.priority} Priority
                  </span>
                </div>

                {/* Citizen Who Raised Ticket */}
                <div className="p-3 border-b border-gray-200 flex justify-between items-center bg-gray-50/70">
                  <div className="flex items-center space-x-2">
                    <User className="w-3.5 h-3.5 text-gray-500" />
                    <div>
                      <p className="text-gray-400 text-[10px] uppercase font-bold">Raised by Citizen</p>
                      <p className="font-mono text-xs font-bold text-gray-900">
                        {ticketData.userEmail || 'user@civiclens.com'}
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#F5EDF7] text-[#3D1860] border border-[#BB99CD] text-[9px] font-extrabold px-2 py-0.5 rounded-full">
                    Citizen User
                  </span>
                </div>

                <div className="p-3 border-b border-gray-200">
                  <p className="text-gray-400 text-[10px] uppercase font-bold mb-0.5">Reported Condition</p>
                  <p className="font-semibold text-gray-800 capitalize">
                    {(ticketData.issueType || ticketData.condition || 'Issue').replace('_', ' ')}
                  </p>
                </div>

                {/* Citizen Evidence Photo */}
                {ticketData.imageUrl && (
                  <div className="p-3 border-b border-gray-200 bg-gray-50/40">
                    <p className="text-gray-400 text-[10px] uppercase font-bold mb-1.5 flex items-center space-x-1">
                      <Camera className="w-3.5 h-3.5 text-gray-500" />
                      <span>Citizen Field Evidence Photo:</span>
                    </p>
                    <div className="relative w-full h-36 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 group">
                      <img
                        src={getFullImageUrl(ticketData.imageUrl)}
                        alt="Citizen Report Evidence"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80';
                        }}
                      />
                      <a
                        href={getFullImageUrl(ticketData.imageUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>View Evidence</span>
                      </a>
                    </div>
                  </div>
                )}

                <div className="p-3 border-b border-gray-200 bg-white">
                  <p className="text-gray-400 text-[10px] uppercase font-bold mb-0.5 flex items-center">
                    <Building2 className="w-3.5 h-3.5 mr-1 text-[#643579]" /> Assigned Municipal Department
                  </p>
                  <p className="font-bold text-gray-900">{ticketData.department}</p>
                  <p className="text-gray-500 text-[11px] mt-0.5">
                    {ticketData.localBodyName || 'Kochi Municipal Corporation'} • {ticketData.localBodyWard || 'Civic Ward'}
                  </p>
                </div>

                <div className="p-3 flex justify-between items-center text-gray-600 bg-gray-100/70">
                  <div className="flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-gray-400" />
                    <span className="text-[11px]">
                      Filed {ticketData.createdAt ? format(new Date(ticketData.createdAt), 'MMM d, h:mm a') : 'Recently'}
                    </span>
                  </div>
                  <span className="text-[11px] text-gray-500">
                    SLA: <span className="font-bold text-gray-800">{ticketData.expectedResponse || 'Within 24 hours'}</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
