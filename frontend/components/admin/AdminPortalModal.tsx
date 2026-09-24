'use client';

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/lib/authContext';
import {
  X,
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
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { updateTicketStatus, uploadImage, getFullImageUrl, getApiBaseUrl } from '@/lib/api';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PRESET_RESOLUTION_NOTES = [
  'Water tap leak repaired, valve replaced and water tested safe.',
  'Municipal sanitation crew cleared and deep-cleaned the facility.',
  'Drainage blockage fully removed, disinfected, and flow restored.',
  'Damaged plumbing fittings replaced with new municipal hardware.',
  'Water supply pressure restored and verified operational.',
  'Routine municipal inspection and maintenance successfully concluded.',
];

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminPortalModal({ isOpen, onClose }: AdminPortalModalProps) {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(null);

  // Resolution modal state
  const [resolvingTicket, setResolvingTicket] = useState<any | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolvedImageUrl, setResolvedImageUrl] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const apiUrl = `${getApiBaseUrl()}/tickets${
    statusFilter !== 'all' ? `?status=${statusFilter}` : ''
  }`;

  const { data: tickets, mutate, isLoading } = useSWR(isOpen ? apiUrl : null, fetcher, {
    revalidateOnFocus: false,
  });

  const ticketList = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    if (!searchQuery.trim()) return tickets;
    const q = searchQuery.toLowerCase().trim();
    return tickets.filter((t: any) =>
      (t.ticketNumber && t.ticketNumber.toLowerCase().includes(q)) ||
      (t.facilityName && t.facilityName.toLowerCase().includes(q)) ||
      (t.localBodyWard && t.localBodyWard.toLowerCase().includes(q)) ||
      (t.department && t.department.toLowerCase().includes(q)) ||
      (t.issueType && t.issueType.toLowerCase().includes(q))
    );
  }, [tickets, searchQuery]);

  // Overall counts regardless of filter
  const allTickets = Array.isArray(tickets) ? tickets : [];
  const openCount = allTickets.filter(t => t.status === 'open' || t.status === 'submitted' || t.status === 'pending').length;
  const inProgressCount = allTickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = allTickets.filter(t => t.status === 'resolved').length;

  if (!isOpen) return null;

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleDispatchCrew = async (ticketNumber: string) => {
    setUpdatingTicket(ticketNumber);
    try {
      await updateTicketStatus(
        ticketNumber,
        'in_progress',
        `Field crew dispatched by ${user?.name || 'Municipal Officer'} (${user?.department || 'Sanitation & Public Works'})`,
        undefined,
        user?.name,
        user?.department
      );
      await mutate();
      showNotification(`Crew dispatched for ${ticketNumber}`);
    } catch (e) {
      console.error('Failed to dispatch crew', e);
    } finally {
      setUpdatingTicket(null);
    }
  };

  const handleOpenResolveModal = (ticket: any) => {
    setResolvingTicket(ticket);
    setResolutionNotes(
      ticket.issueType === 'water' || ticket.issueType === 'no_water'
        ? 'Water tap leak repaired, valve replaced and water tested safe.'
        : 'Municipal sanitation crew cleared and deep-cleaned the facility.'
    );
    setResolvedImageUrl('');
  };

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

  const handleConfirmResolve = async () => {
    if (!resolvingTicket) return;
    setUpdatingTicket(resolvingTicket.ticketNumber);

    try {
      const notes = resolutionNotes.trim() || `Verified & resolved by ${user?.name || 'Municipal Officer'}`;
      await updateTicketStatus(
        resolvingTicket.ticketNumber,
        'resolved',
        notes,
        resolvedImageUrl.trim() || undefined,
        user?.name || 'Municipal Authority Admin',
        user?.department || 'Municipal Public Works',
        user?.email || 'admin@civiclens.com'
      );
      await mutate();
      showNotification(`Ticket ${resolvingTicket.ticketNumber} marked as resolved!`);
      setResolvingTicket(null);
    } catch (e) {
      console.error('Failed to resolve ticket', e);
      alert('Error marking ticket resolved. Please try again.');
    } finally {
      setUpdatingTicket(null);
    }
  };

  const handleReopenTicket = async (ticketNumber: string) => {
    if (!confirm(`Are you sure you want to reopen ticket ${ticketNumber}?`)) return;
    setUpdatingTicket(ticketNumber);
    try {
      await updateTicketStatus(
        ticketNumber,
        'open',
        `Ticket reopened for municipal re-investigation by ${user?.name || 'Municipal Officer'}`,
        undefined,
        user?.name,
        user?.department
      );
      await mutate();
      showNotification(`Ticket ${ticketNumber} reopened.`);
    } catch (e) {
      console.error('Failed to reopen ticket', e);
    } finally {
      setUpdatingTicket(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col relative">
        {/* Toast Notification */}
        {actionSuccessMsg && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-lg flex items-center space-x-2 animate-in slide-in-from-top duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D1860] text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-gray-900">Municipal Authority Portal</h2>
                <span className="bg-[#F5EDF7] border border-[#BB99CD] text-[#3D1860] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  Admin Access
                </span>
              </div>
              <p className="text-xs text-gray-500">
                Logged in as <span className="font-semibold text-gray-700">{user?.name}</span> ({user?.department || 'Municipal Officer'})
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => mutate()}
              className="p-2 rounded-full hover:bg-gray-200/70 text-gray-500 transition"
              title="Refresh tickets"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-200/70 text-gray-400 hover:text-gray-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 p-4 sm:p-5 border-b border-gray-100 bg-white">
          <div
            onClick={() => setStatusFilter('open')}
            className={`cursor-pointer rounded-2xl p-3 border transition ${
              statusFilter === 'open' ? 'border-red-400 bg-red-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">Pending Action</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{openCount}</div>
            <p className="text-[10px] text-gray-400 mt-0.5">Submitted reports</p>
          </div>

          <div
            onClick={() => setStatusFilter('in_progress')}
            className={`cursor-pointer rounded-2xl p-3 border transition ${
              statusFilter === 'in_progress' ? 'border-amber-400 bg-amber-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Crews Dispatched</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{inProgressCount}</div>
            <p className="text-[10px] text-gray-400 mt-0.5">Under active repair</p>
          </div>

          <div
            onClick={() => setStatusFilter('resolved')}
            className={`cursor-pointer rounded-2xl p-3 border transition ${
              statusFilter === 'resolved' ? 'border-emerald-400 bg-emerald-50/40 shadow-xs' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Resolved Facilities</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{resolvedCount}</div>
            <p className="text-[10px] text-gray-400 mt-0.5">Verified & cleaned</p>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="px-5 py-3 bg-gray-50/60 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-1.5 w-full sm:w-auto overflow-x-auto">
            <span className="text-gray-500 font-bold mr-1 shrink-0">Filter:</span>
            {[
              { key: 'all', label: 'All Tickets' },
              { key: 'open', label: 'Pending Action' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'resolved', label: 'Resolved' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key as any)}
                className={`px-3 py-1 rounded-full font-bold transition shrink-0 ${
                  statusFilter === key
                    ? 'bg-[#3D1860] text-[#F5EDF7] shadow-2xs'
                    : 'bg-white border border-[#BB99CD]/40 text-gray-600 hover:bg-[#F5EDF7]'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search ticket, facility, ward..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-xl text-xs outline-none focus:border-[#643579] focus:ring-1 focus:ring-[#BB99CD]"
            />
          </div>
        </div>

        {/* Ticket List */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {ticketList.length === 0 ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center">
              <CheckCircle2 className="w-10 h-10 text-gray-300 mb-2" />
              <p className="font-bold text-sm text-gray-700">No tickets found</p>
              <p className="text-xs text-gray-400 mt-1">There are no reports matching this filter at the moment.</p>
            </div>
          ) : (
            ticketList.map((ticket: any) => {
              const isOpenStatus = ticket.status === 'open' || ticket.status === 'submitted' || ticket.status === 'pending';
              const isInProgress = ticket.status === 'in_progress' || ticket.status === 'dispatched';
              const isResolved = ticket.status === 'resolved';

              return (
                <div
                  key={ticket._id || ticket.ticketNumber}
                  className={`rounded-2xl border transition-all shadow-2xs p-4 sm:p-5 ${
                    isResolved
                      ? 'bg-emerald-50/20 border-emerald-200/80 hover:border-emerald-300'
                      : isInProgress
                      ? 'bg-amber-50/15 border-amber-200 hover:border-amber-300'
                      : 'bg-white border-gray-200/80 hover:border-gray-300'
                  }`}
                >
                  {/* Top Bar: Ticket Number, Status, Priority, Date */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-3">
                    <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
                      <span className="font-mono text-xs font-black text-[#3D1860] bg-[#F5EDF7] border border-[#BB99CD]/60 px-2.5 py-1 rounded-lg">
                        {ticket.ticketNumber}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize flex items-center space-x-1 ${
                          isOpenStatus
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : isInProgress
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-300 font-extrabold'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isOpenStatus ? 'bg-red-500' : isInProgress ? 'bg-amber-500 animate-ping' : 'bg-emerald-600'
                          }`}
                        />
                        <span>{isResolved ? 'Resolved & Verified' : ticket.status.replace('_', ' ')}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Priority: <span className="font-bold text-gray-800">{ticket.priority || 'Medium'}</span>
                      </span>
                    </div>

                    <span className="text-xs text-gray-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ticket.createdAt ? `${formatDistanceToNow(new Date(ticket.createdAt))} ago` : 'Recently'}</span>
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    {ticket.imageUrl && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100 relative group cursor-pointer">
                        <img
                          src={getFullImageUrl(ticket.imageUrl)}
                          alt="Citizen Report Evidence"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80';
                          }}
                        />
                        <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[9px] px-1 rounded">
                          Evidence
                        </span>
                      </div>
                    )}

                    <div className="flex-1 space-y-1.5">
                      <h4 className="font-bold text-gray-900 text-sm">
                        {ticket.facilityName || 'Public Infrastructure Asset'}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Ward: <span className="font-medium text-gray-700">{ticket.localBodyWard || 'Central Ward'}</span> • Department: <span className="font-medium text-gray-700">{ticket.department || 'Municipal Works'}</span>
                      </p>
                      <p className="text-xs text-gray-700 bg-gray-50/80 rounded-lg p-2 border border-gray-100">
                        <span className="font-bold text-gray-900">Reported Condition:</span>{' '}
                        <span className="capitalize">{ticket.issueType ? ticket.issueType.replace('_', ' ') : 'Reported issue'}</span>
                        {ticket.userEmail && (
                          <span className="text-gray-400 ml-2 font-mono text-[10px]">
                            by {ticket.userEmail}
                          </span>
                        )}
                      </p>

                      {/* Display Resolution Report when resolved */}
                      {isResolved && (
                        <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 text-xs space-y-1.5 mt-2">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-emerald-900 flex items-center space-x-1">
                              <ShieldCheck className="w-4 h-4 text-emerald-600" />
                              <span>Municipal Resolution Completed</span>
                            </span>
                            {ticket.resolvedAt && (
                              <span className="text-[10px] text-emerald-700 font-medium">
                                {format(new Date(ticket.resolvedAt), 'MMM d, yyyy • h:mm a')}
                              </span>
                            )}
                          </div>
                          {ticket.resolutionNotes && (
                            <p className="text-emerald-800 leading-relaxed font-medium">
                              {ticket.resolutionNotes}
                            </p>
                          )}
                          {ticket.resolvedImageUrl && (
                            <div className="pt-1 flex items-center space-x-2">
                              <a
                                href={getFullImageUrl(ticket.resolvedImageUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center space-x-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>View Resolution Inspection Photo</span>
                              </a>
                            </div>
                          )}
                        </div>
                      )}

                      {/* In-progress note if exists */}
                      {isInProgress && ticket.resolutionNotes && (
                        <p className="text-xs text-amber-800 bg-amber-50 rounded-lg p-2 border border-amber-200 font-medium">
                          ⚡ {ticket.resolutionNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Municipal Actions Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100 flex-wrap gap-2">
                    <div className="text-[11px] text-gray-400">
                      Expected Response: <span className="font-semibold text-gray-700">{ticket.expectedResponse || 'Within 24 hours'}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      {/* Action for Open / Pending: Dispatch Crew */}
                      {isOpenStatus && (
                        <button
                          onClick={() => handleDispatchCrew(ticket.ticketNumber)}
                          disabled={updatingTicket === ticket.ticketNumber}
                          className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Dispatch Field Crew</span>
                        </button>
                      )}

                      {/* Primary Mark as Resolved button (available on Open and In Progress) */}
                      {!isResolved && (
                        <button
                          onClick={() => handleOpenResolveModal(ticket)}
                          disabled={updatingTicket === ticket.ticketNumber}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-4 py-1.5 rounded-xl shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark as Resolved</span>
                        </button>
                      )}

                      {/* If Resolved: allow Reopening if citizen feedback requests inspection */}
                      {isResolved && (
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-emerald-700 flex items-center space-x-1 bg-emerald-100/70 border border-emerald-200 px-3 py-1 rounded-xl">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Facility Clean &amp; Operational</span>
                          </span>

                          <button
                            onClick={() => handleReopenTicket(ticket.ticketNumber)}
                            disabled={updatingTicket === ticket.ticketNumber}
                            className="text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 px-2.5 py-1 rounded-xl transition flex items-center space-x-1 border border-gray-200"
                            title="Re-open ticket for follow-up repair"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Reopen</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ========================================================
            RESOLUTION MODAL / DRAWER
            ======================================================== */}
        {resolvingTicket && (
          <div className="fixed inset-0 z-60 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in duration-150">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 space-y-4 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 text-base">Complete Municipal Resolution</h3>
                    <p className="text-[11px] font-mono text-[#3D1860] font-bold">
                      Ticket: {resolvingTicket.ticketNumber}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setResolvingTicket(null)}
                  className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Target info preview */}
              <div className="bg-gray-50 rounded-2xl p-3 border border-gray-200 text-xs">
                <p className="font-bold text-gray-900">{resolvingTicket.facilityName || 'Public Facility'}</p>
                <p className="text-gray-500 text-[11px]">
                  Ward: {resolvingTicket.localBodyWard || 'Central Ward'} • Issue:{' '}
                  <span className="font-semibold text-gray-800 capitalize">
                    {resolvingTicket.issueType ? resolvingTicket.issueType.replace('_', ' ') : 'Reported issue'}
                  </span>
                </p>
              </div>

              {/* Quick Preset Tags */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#643579]" />
                  <span>Quick Resolution Templates:</span>
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_RESOLUTION_NOTES.map((note) => (
                    <button
                      key={note}
                      type="button"
                      onClick={() => setResolutionNotes(note)}
                      className={`text-[11px] px-2.5 py-1 rounded-xl text-left border transition ${
                        resolutionNotes === note
                          ? 'bg-[#3D1860] text-white border-[#3D1860]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#BB99CD] hover:bg-[#F5EDF7]'
                      }`}
                    >
                      {note}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Resolution Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Resolution Notes &amp; Action Taken
                </label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Detail the repair work, cleaning, or verification conducted..."
                  className="w-full text-xs p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-emerald-600 focus:bg-white transition"
                />
              </div>

              {/* Optional Resolution Proof Photo */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1 flex items-center justify-between">
                  <span className="flex items-center space-x-1">
                    <Camera className="w-3.5 h-3.5 text-[#643579]" />
                    <span>Resolution Evidence Photo (Optional)</span>
                  </span>
                  {resolvedImageUrl && (
                    <button
                      type="button"
                      onClick={() => setResolvedImageUrl('')}
                      className="text-[10px] text-red-600 hover:underline"
                    >
                      Remove photo
                    </button>
                  )}
                </label>

                 {resolvedImageUrl ? (
                  <div className="relative w-full h-28 rounded-xl overflow-hidden border border-emerald-200 bg-gray-100">
                    <img
                      src={getFullImageUrl(resolvedImageUrl)}
                      alt="Resolution Proof"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-1 right-2 bg-emerald-800/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      ✓ Evidence Attached
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="border-2 border-dashed border-gray-200 hover:border-[#BB99CD] rounded-2xl p-4 flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-gray-50 transition">
                      <Upload className={`w-5 h-5 mb-1 ${isUploadingImage ? 'animate-bounce text-[#643579]' : 'text-gray-400'}`} />
                      <span className="text-xs font-bold text-gray-700">
                        {isUploadingImage ? 'Uploading photo…' : 'Upload Proof / After-Fix Photo'}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploadingImage}
                        className="hidden"
                      />
                    </label>

                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] text-gray-400">or link:</span>
                      <input
                        type="url"
                        placeholder="https://... image URL"
                        value={resolvedImageUrl}
                        onChange={(e) => setResolvedImageUrl(e.target.value)}
                        className="flex-1 text-[11px] px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-emerald-600"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Officer Sign-off Badge */}
              <div className="bg-[#F5EDF7] rounded-xl p-2.5 border border-[#BB99CD]/50 flex items-center justify-between text-xs">
                <span className="text-[#3D1860] font-semibold">
                  Signing Officer: <span className="font-bold">{user?.name}</span>
                </span>
                <span className="text-[#643579] font-medium text-[11px]">
                  {user?.department || 'Municipal Authority'}
                </span>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setResolvingTicket(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmResolve}
                  disabled={updatingTicket === resolvingTicket.ticketNumber || isUploadingImage}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition shadow-md flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{updatingTicket ? 'Saving…' : 'Verify & Mark as Resolved'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
