'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { updateTicketStatus, uploadImage, getFullImageUrl, fetchAllTickets } from '@/lib/api';
import {
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Truck,
  User,
  ArrowRight,
  RefreshCw,
  Search,
  Camera,
  Upload,
  Check,
  RotateCcw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  LogOut,
  MapPin,
  Map,
  X,
  FileText,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

const PRESET_RESOLUTION_NOTES = [
  'Water tap leak repaired, valve replaced and water tested safe.',
  'Municipal sanitation crew cleared and deep-cleaned the facility.',
  'Drainage blockage fully removed, disinfected, and flow restored.',
  'Damaged plumbing fittings replaced with new municipal hardware.',
  'Water supply pressure restored and verified operational.',
  'Routine municipal inspection and maintenance successfully concluded.',
];

export default function AdminPage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  // Route protection: Only admin@civiclens.com (or role === 'admin')
  useEffect(() => {
    if (user !== undefined && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, router]);

  // Data state strictly from backend
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(null);

  // Resolution modal state
  const [resolvingTicket, setResolvingTicket] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvedImageUrl, setResolvedImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Lightbox preview
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Load strictly backend tickets
  const loadBackendTickets = async (showFullLoading = false) => {
    if (showFullLoading) setIsLoading(true);
    setFetchError(null);
    try {
      const data = await fetchAllTickets();
      if (Array.isArray(data)) {
        setTickets(data);
      } else {
        setTickets([]);
      }
    } catch (err: any) {
      console.error('Failed to load tickets from backend', err);
      setFetchError(err.message || 'Failed to connect to backend server');
    } finally {
      if (showFullLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadBackendTickets(true);
    }
  }, [user?.role]);

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4500);
  };

  // Metrics calculated strictly from backend tickets
  const openCount = useMemo(() => {
    return tickets.filter(
      (t) => t.status === 'open' || t.status === 'submitted' || t.status === 'pending'
    ).length;
  }, [tickets]);

  const inProgressCount = useMemo(() => {
    return tickets.filter(
      (t) => t.status === 'in_progress' || t.status === 'dispatched'
    ).length;
  }, [tickets]);

  const resolvedCount = useMemo(() => {
    return tickets.filter((t) => t.status === 'resolved').length;
  }, [tickets]);

  // Filter and search
  const filteredTickets = useMemo(() => {
    let result = tickets;

    // Filter by status tab
    if (statusFilter === 'open') {
      result = result.filter(
        (t) => t.status === 'open' || t.status === 'submitted' || t.status === 'pending'
      );
    } else if (statusFilter === 'in_progress') {
      result = result.filter(
        (t) => t.status === 'in_progress' || t.status === 'dispatched'
      );
    } else if (statusFilter === 'resolved') {
      result = result.filter((t) => t.status === 'resolved');
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (t) =>
          (t.ticketNumber && t.ticketNumber.toLowerCase().includes(q)) ||
          (t.facilityName && t.facilityName.toLowerCase().includes(q)) ||
          (t.localBodyWard && t.localBodyWard.toLowerCase().includes(q)) ||
          (t.department && t.department.toLowerCase().includes(q)) ||
          (t.issueType && t.issueType.toLowerCase().includes(q)) ||
          (t.userEmail && t.userEmail.toLowerCase().includes(q))
      );
    }

    return result;
  }, [tickets, statusFilter, searchQuery]);

  // Handle Dispatch Crew
  const handleDispatchCrew = async (ticketNumber: string) => {
    setUpdatingTicket(ticketNumber);
    try {
      await updateTicketStatus(
        ticketNumber,
        'in_progress',
        `Field crew dispatched by Kochi Municipal Authority (${user?.department || 'Sanitation & Public Works'})`,
        undefined,
        user?.name || 'Kochi Municipal Authority',
        user?.department || 'Health & Municipal Sanitation Dept',
        user?.email || 'admin@civiclens.com'
      );
      await loadBackendTickets();
      showNotification(`Field crew successfully dispatched for Ticket ${ticketNumber}!`);
    } catch (e: any) {
      console.error('Failed to dispatch crew', e);
      alert(e.message || 'Failed to dispatch crew. Please check backend connection.');
    } finally {
      setUpdatingTicket(null);
    }
  };

  // Open Resolve Modal
  const handleOpenResolveModal = (ticket: any) => {
    setResolvingTicket(ticket);
    setResolutionNotes(
      ticket.issueType === 'water' || ticket.issueType === 'no_water'
        ? 'Water tap leak repaired, valve replaced and water tested safe.'
        : 'Municipal sanitation crew cleared and deep-cleaned the facility.'
    );
    setResolvedImageUrl('');
  };

  // Handle Image Upload for Resolution
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadImage(file, file.name);
      setResolvedImageUrl(url);
    } catch (err) {
      console.error('Failed to upload resolution image', err);
      alert('Failed to upload image. Please try again or provide an image link.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Confirm Resolution
  const handleConfirmResolve = async () => {
    if (!resolvingTicket) return;
    setUpdatingTicket(resolvingTicket.ticketNumber);

    try {
      const notes =
        resolutionNotes.trim() ||
        `Verified & resolved by Kochi Municipal Authority (${user?.name || 'Admin'})`;

      await updateTicketStatus(
        resolvingTicket.ticketNumber,
        'resolved',
        notes,
        resolvedImageUrl.trim() || undefined,
        user?.name || 'Kochi Municipal Authority',
        user?.department || 'Health & Municipal Sanitation Dept',
        user?.email || 'admin@civiclens.com'
      );

      await loadBackendTickets();
      showNotification(`Ticket ${resolvingTicket.ticketNumber} marked as RESOLVED by admin@civiclens.com!`);
      setResolvingTicket(null);
    } catch (e: any) {
      console.error('Failed to resolve ticket', e);
      alert(e.message || 'Failed to update ticket status on backend.');
    } finally {
      setUpdatingTicket(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F5EDF7] flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 text-center max-w-md">
          <Building2 className="w-12 h-12 text-[#643579] mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authenticating Municipal Authority...</h2>
          <p className="text-sm text-gray-500 mb-6">Verifying administrator credentials for CivicLens portal.</p>
          <Link
            href="/login"
            className="inline-flex items-center space-x-2 bg-[#3D1860] hover:bg-[#643579] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition"
          >
            <span>Go to Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5EDF7] flex flex-col font-sans">
      {/* Top Admin Navigation Header */}
      <header className="bg-white border-b border-gray-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Brand & Authority Info */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#3D1860] flex items-center justify-center text-white shadow-md shadow-[#3D1860]/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-black text-gray-900 tracking-tight">Municipal Authority Portal</h1>
                <span className="bg-[#3D1860] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Admin Access
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium">
                Logged in as <strong className="text-[#3D1860]">Kochi Municipal Authority</strong> (Health &amp; Municipal Sanitation Dept)
              </p>
            </div>
          </div>

          {/* Action Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => loadBackendTickets()}
              disabled={isLoading}
              className="flex items-center space-x-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
              title="Refresh tickets from backend"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#643579]' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/map"
              className="flex items-center space-x-1.5 bg-[#F5EDF7] hover:bg-[#BB99CD]/20 text-[#3D1860] border border-[#BB99CD]/60 font-bold text-xs px-3.5 py-2 rounded-xl transition"
            >
              <Map className="w-3.5 h-3.5 text-[#643579]" />
              <span className="hidden sm:inline">Public Map</span>
            </Link>

            <button
              onClick={() => {
                logout();
                router.push('/login');
              }}
              className="flex items-center space-x-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-xs px-3.5 py-2 rounded-xl transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Dashboard */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex-1 space-y-6">
        {/* Floating Notification */}
        {actionSuccessMsg && (
          <div className="bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="flex items-center space-x-2.5 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button
              onClick={() => setActionSuccessMsg(null)}
              className="text-emerald-200 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Backend Error Banner */}
        {fetchError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Backend Connection Notice: {fetchError}. Ensure FastAPI is running on port 8000.</span>
            </div>
            <button
              onClick={() => loadBackendTickets()}
              className="text-xs font-bold text-rose-700 underline hover:text-rose-900"
            >
              Retry
            </button>
          </div>
        )}

        {/* Metric Cards (Image 2 style) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Pending Action */}
          <div
            onClick={() => setStatusFilter('open')}
            className={`bg-white rounded-3xl p-6 border shadow-xs transition hover:shadow-md cursor-pointer ${
              statusFilter === 'open' ? 'ring-2 ring-rose-500 border-rose-200' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600">
                Pending Action
              </span>
              <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {isLoading ? '...' : openCount}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">Submitted reports</p>
          </div>

          {/* Card 2: Crews Dispatched */}
          <div
            onClick={() => setStatusFilter('in_progress')}
            className={`bg-white rounded-3xl p-6 border shadow-xs transition hover:shadow-md cursor-pointer ${
              statusFilter === 'in_progress' ? 'ring-2 ring-amber-500 border-amber-200' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-amber-600">
                Crews Dispatched
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {isLoading ? '...' : inProgressCount}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">Under active repair</p>
          </div>

          {/* Card 3: Resolved Facilities */}
          <div
            onClick={() => setStatusFilter('resolved')}
            className={`bg-white rounded-3xl p-6 border shadow-xs transition hover:shadow-md cursor-pointer ${
              statusFilter === 'resolved' ? 'ring-2 ring-emerald-500 border-emerald-200' : 'border-gray-100'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">
                Resolved Facilities
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-black text-gray-900 tracking-tight">
              {isLoading ? '...' : resolvedCount}
            </div>
            <p className="text-xs text-gray-500 font-medium mt-1">Verified &amp; cleaned</p>
          </div>
        </div>

        {/* Filters & Search Toolbar (Image 2 style) */}
        <div className="bg-white rounded-3xl p-4 shadow-xs border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Status Filter Pills */}
          <div className="flex items-center space-x-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-xs font-bold text-gray-400 mr-1 shrink-0">Filter:</span>
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-black transition shrink-0 cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-[#3D1860] text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              All Tickets ({tickets.length})
            </button>
            <button
              onClick={() => setStatusFilter('open')}
              className={`px-4 py-2 rounded-full text-xs font-black transition shrink-0 cursor-pointer ${
                statusFilter === 'open'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Pending Action ({openCount})
            </button>
            <button
              onClick={() => setStatusFilter('in_progress')}
              className={`px-4 py-2 rounded-full text-xs font-black transition shrink-0 cursor-pointer ${
                statusFilter === 'in_progress'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter('resolved')}
              className={`px-4 py-2 rounded-full text-xs font-black transition shrink-0 cursor-pointer ${
                statusFilter === 'resolved'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Resolved ({resolvedCount})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ticket, facility, ward..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-xs bg-gray-50 border border-gray-200 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#643579]/30 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Tickets Grid / List */}
        {isLoading ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-xs">
            <RefreshCw className="w-8 h-8 text-[#643579] animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">Loading live tickets from CivicLens backend...</p>
            <p className="text-xs text-gray-400 mt-1">Fetching real data from MongoDB repository</p>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-xs">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Check className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-gray-800">No tickets found</h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              There are no reports matching this filter at the moment. All civic reports will appear here live when filed by citizens.
            </p>
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="mt-4 text-xs font-bold text-[#643579] hover:underline cursor-pointer"
              >
                Show all tickets
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredTickets.map((ticket) => {
              const isResolved = ticket.status === 'resolved';
              const isInProgress = ticket.status === 'in_progress' || ticket.status === 'dispatched';
              const isPending = !isResolved && !isInProgress;
              const hasTicketImage = Boolean(ticket.imageUrl);
              const displayImageUrl = hasTicketImage ? getFullImageUrl(ticket.imageUrl) : null;
              const displayResolvedImg = ticket.resolvedImageUrl ? getFullImageUrl(ticket.resolvedImageUrl) : null;

              return (
                <div
                  key={ticket._id || ticket.ticketNumber}
                  className={`bg-white rounded-3xl p-6 border shadow-xs transition hover:shadow-md ${
                    isResolved
                      ? 'border-emerald-100 hover:border-emerald-200'
                      : isInProgress
                      ? 'border-amber-100 hover:border-amber-200'
                      : 'border-rose-100 hover:border-rose-200'
                  }`}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left Details */}
                    <div className="space-y-3 flex-1">
                      {/* Badge bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Ticket Number */}
                        <span className="font-mono text-xs font-black bg-[#3D1860] text-white px-3 py-1 rounded-full shadow-2xs">
                          {ticket.ticketNumber}
                        </span>

                        {/* Status Badge */}
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                            isResolved
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : isInProgress
                              ? 'bg-amber-100 text-amber-800 border border-amber-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}
                        >
                          {isResolved ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              <span>RESOLVED</span>
                            </>
                          ) : isInProgress ? (
                            <>
                              <Truck className="w-3 h-3" />
                              <span>IN PROGRESS</span>
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              <span>PENDING ACTION</span>
                            </>
                          )}
                        </span>

                        {/* Priority Badge */}
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                          Priority: {ticket.priority || 'Medium'}
                        </span>

                        {/* Issue Type */}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F5EDF7] text-[#3D1860]">
                          {ticket.issueType ? ticket.issueType.replace('_', ' ') : 'Civic Issue'}
                        </span>
                      </div>

                      {/* Facility & Department */}
                      <div>
                        <h2 className="text-base font-bold text-gray-900 flex items-center space-x-2">
                          <span>{ticket.facilityName || 'Public Facility'}</span>
                        </h2>
                        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-gray-500 mt-1">
                          <span className="flex items-center space-x-1 text-[#643579] font-semibold">
                            <Building2 className="w-3.5 h-3.5" />
                            <span>{ticket.department || 'Kerala Water Authority (KWA)'}</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" />
                            <span>{ticket.localBodyWard || ticket.localBodyName || 'Greater Kochi Civic Zone'}</span>
                          </span>
                        </div>
                      </div>

                      {/* Citizen and Admin Attribution Box */}
                      <div className="bg-[#F5EDF7]/60 border border-[#BB99CD]/40 rounded-2xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-[#3D1860] text-white flex items-center justify-center text-[10px] font-black">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-gray-500">Raised by Citizen: </span>
                            <strong className="text-gray-900 font-mono font-bold">
                              {ticket.userEmail || 'user@civiclens.com'}
                            </strong>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-gray-500">Admin Solver: </span>
                            <strong className="text-[#3D1860] font-bold font-mono">
                              admin@civiclens.com
                            </strong>
                          </div>
                        </div>
                      </div>

                      {/* Resolution Details (if resolved) */}
                      {isResolved && (
                        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-900 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1.5 font-black text-emerald-900">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Solved &amp; Verified by admin@civiclens.com (Municipal Authority)</span>
                            </div>
                            {ticket.resolvedAt && (
                              <span className="text-[10px] text-emerald-700 font-medium">
                                {format(new Date(ticket.resolvedAt), 'MMM d, yyyy h:mm a')}
                              </span>
                            )}
                          </div>

                          {ticket.resolutionNotes && (
                            <p className="text-emerald-800 font-medium bg-white/70 p-2.5 rounded-xl border border-emerald-200/60">
                              {ticket.resolutionNotes}
                            </p>
                          )}

                          {displayResolvedImg && (
                            <div className="flex items-center space-x-2 pt-1">
                              <span className="text-[11px] font-bold text-emerald-800">Resolution Proof:</span>
                              <button
                                onClick={() => setPreviewImage(displayResolvedImg)}
                                className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 underline hover:text-emerald-900 cursor-pointer"
                              >
                                <Eye className="w-3 h-3" />
                                <span>View Verified Photo</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right Action / Media Panel */}
                    <div className="flex flex-col sm:flex-row lg:flex-col items-end justify-between gap-4 shrink-0 lg:w-64 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                      {/* Ticket Citizen Photo Preview */}
                      {displayImageUrl ? (
                        <div className="relative group rounded-2xl overflow-hidden border border-gray-200 w-full h-32 bg-gray-100">
                          <img
                            src={displayImageUrl}
                            alt="Reported problem"
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300 cursor-pointer"
                            onClick={() => setPreviewImage(displayImageUrl)}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <button
                            onClick={() => setPreviewImage(displayImageUrl)}
                            className="absolute bottom-2 right-2 bg-black/60 hover:bg-black/80 text-white p-1.5 rounded-lg text-xs backdrop-blur-xs flex items-center space-x-1 font-bold cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span className="text-[10px]">Photo</span>
                          </button>
                        </div>
                      ) : (
                        <div className="w-full h-24 rounded-2xl bg-gray-50 border border-gray-200/70 flex flex-col items-center justify-center text-gray-400 text-xs">
                          <Camera className="w-6 h-6 mb-1 opacity-50" />
                          <span>No Citizen Photo</span>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="w-full space-y-2">
                        {isPending && (
                          <>
                            <button
                              onClick={() => handleDispatchCrew(ticket.ticketNumber)}
                              disabled={updatingTicket === ticket.ticketNumber}
                              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-2.5 px-4 rounded-xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                            >
                              <Truck className="w-3.5 h-3.5" />
                              <span>{updatingTicket === ticket.ticketNumber ? 'Dispatching...' : 'Dispatch Field Crew'}</span>
                            </button>

                            <button
                              onClick={() => handleOpenResolveModal(ticket)}
                              disabled={updatingTicket === ticket.ticketNumber}
                              className="w-full bg-[#3D1860] hover:bg-[#643579] text-white font-black text-xs py-2.5 px-4 rounded-xl transition shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Mark as Resolved</span>
                            </button>
                          </>
                        )}

                        {isInProgress && (
                          <button
                            onClick={() => handleOpenResolveModal(ticket)}
                            disabled={updatingTicket === ticket.ticketNumber}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs py-2.5 px-4 rounded-xl transition shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Mark as Resolved</span>
                          </button>
                        )}

                        {isResolved && (
                          <div className="w-full text-center py-2 px-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center space-x-1.5">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            <span>Action Completed</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Resolution Dialog Modal */}
      {resolvingTicket && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-5 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs font-black bg-[#3D1860] text-white px-2.5 py-0.5 rounded-full">
                    {resolvingTicket.ticketNumber}
                  </span>
                  <h3 className="text-base font-black text-gray-900">Mark Ticket as Resolved</h3>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Facility: <strong className="text-gray-800">{resolvingTicket.facilityName}</strong>
                </p>
              </div>
              <button
                onClick={() => setResolvingTicket(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Templates */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Quick Resolution Notes Template:
              </label>
              <div className="grid grid-cols-1 gap-1.5 max-h-32 overflow-y-auto pr-1">
                {PRESET_RESOLUTION_NOTES.map((note, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setResolutionNotes(note)}
                    className="text-left text-[11px] p-2 rounded-xl bg-gray-50 hover:bg-[#F5EDF7] hover:text-[#3D1860] border border-gray-200/80 transition cursor-pointer"
                  >
                    • {note}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Notes */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Resolution Report / Notes:
              </label>
              <textarea
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                rows={3}
                placeholder="Describe repairs conducted, sanitation actions taken, and facility verification..."
                className="w-full text-xs p-3 rounded-2xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#643579]"
              />
            </div>

            {/* Proof Photo Upload */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                Resolution Proof Photo (Optional):
              </label>
              <div className="flex items-center space-x-3">
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs px-3.5 py-2 rounded-xl border border-gray-300 flex items-center space-x-1.5 transition">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingImage ? 'Uploading...' : 'Upload Proof Photo'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={resolvedImageUrl}
                  onChange={(e) => setResolvedImageUrl(e.target.value)}
                  placeholder="Or paste photo URL..."
                  className="flex-1 text-xs px-3 py-2 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-1 focus:ring-[#643579]"
                />
              </div>

              {resolvedImageUrl && (
                <div className="mt-2 flex items-center space-x-2 bg-emerald-50 text-emerald-800 p-2 rounded-xl border border-emerald-200 text-xs">
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">Photo attached: {resolvedImageUrl}</span>
                </div>
              )}
            </div>

            {/* Attribution Notice */}
            <div className="bg-[#F5EDF7] p-3 rounded-2xl border border-[#BB99CD]/40 text-xs text-[#3D1860]">
              <span className="font-bold">Attribution: </span>
              This resolution will be recorded as verified and solved by{' '}
              <strong className="font-mono">admin@civiclens.com</strong> (Kochi Municipal Authority).
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setResolvingTicket(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                disabled={updatingTicket === resolvingTicket.ticketNumber}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-xs font-black transition shadow-md flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {updatingTicket === resolvingTicket.ticketNumber
                    ? 'Updating...'
                    : 'Confirm Resolution'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Image Preview Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-2xl max-h-[85vh] overflow-hidden rounded-3xl bg-black">
            <img
              src={previewImage}
              alt="Preview"
              className="max-w-full max-h-[85vh] object-contain mx-auto"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 bg-black/60 text-white p-2 rounded-full hover:bg-black/90 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
