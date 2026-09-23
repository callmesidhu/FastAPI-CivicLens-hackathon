'use client';

import React, { useState } from 'react';
import useSWR from 'swr';
import { useAuth } from '@/lib/authContext';
import { X, Building2, ShieldCheck, Clock, CheckCircle2, AlertTriangle, Truck, User, ArrowRight, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AdminPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function AdminPortalModal({ isOpen, onClose }: AdminPortalModalProps) {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');
  const [updatingTicket, setUpdatingTicket] = useState<string | null>(null);

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/tickets${
    statusFilter !== 'all' ? `?status=${statusFilter}` : ''
  }`;

  const { data: tickets, mutate, isLoading } = useSWR(isOpen ? apiUrl : null, fetcher, {
    refreshInterval: 6000,
  });

  if (!isOpen) return null;

  const handleUpdateStatus = async (ticketNumber: string, nextStatus: string) => {
    setUpdatingTicket(ticketNumber);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'}/tickets/${ticketNumber}/status`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: nextStatus,
            resolutionNotes: `Action taken by ${user?.name || 'Municipal Officer'} (${user?.department || 'Sanitation Dept'})`,
          }),
        }
      );
      if (res.ok) {
        mutate();
      }
    } catch (e) {
      console.error('Failed to update ticket status', e);
    } finally {
      setUpdatingTicket(null);
    }
  };

  const ticketList = Array.isArray(tickets) ? tickets : [];
  const openCount = ticketList.filter(t => t.status === 'open').length;
  const inProgressCount = ticketList.filter(t => t.status === 'in_progress').length;
  const resolvedCount = ticketList.filter(t => t.status === 'resolved').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-gray-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#3D1860] text-white flex items-center justify-center shadow-xs">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-black text-gray-900">Municipal Authority Portal</h2>
                <span className="bg-[#F5EDF7] border border-[#BB99CD] text-[#3D1860] text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase">
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
        <div className="grid grid-cols-3 gap-3 p-5 sm:p-6 border-b border-gray-100 bg-white">
          <div
            onClick={() => setStatusFilter('open')}
            className={`cursor-pointer rounded-2xl p-3 border transition ${
              statusFilter === 'open' ? 'border-red-400 bg-red-50/40' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-[10px] font-extrabold text-red-600 uppercase tracking-wider">Open Reports</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{openCount}</div>
          </div>

          <div
            onClick={() => setStatusFilter('in_progress')}
            className={`cursor-pointer rounded-2xl p-3 border transition ${
              statusFilter === 'in_progress' ? 'border-amber-400 bg-amber-50/40' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-[10px] font-extrabold text-amber-600 uppercase tracking-wider">Crews Dispatched</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{inProgressCount}</div>
          </div>

          <div
            onClick={() => setStatusFilter('resolved')}
            className={`cursor-pointer rounded-2xl p-3 border transition ${
              statusFilter === 'resolved' ? 'border-emerald-400 bg-emerald-50/40' : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase tracking-wider">Resolved Drains</span>
            <div className="text-2xl font-black text-gray-900 mt-0.5">{resolvedCount}</div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-6 py-2.5 bg-gray-50/50 border-b border-gray-100 flex items-center space-x-2 text-xs">
          <span className="text-gray-500 font-bold mr-1">Filter:</span>
          {(['all', 'open', 'in_progress', 'resolved'] as const).map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setStatusFilter(filterKey)}
              className={`px-3 py-1 rounded-full font-bold capitalize transition ${
                statusFilter === filterKey
                  ? 'bg-[#3D1860] text-[#F5EDF7] shadow-2xs'
                  : 'bg-white border border-[#BB99CD]/40 text-gray-600 hover:bg-[#F5EDF7]'
              }`}
            >
              {filterKey === 'all' ? 'All Tickets' : filterKey.replace('_', ' ')}
            </button>
          ))}
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
              const isOpenStatus = ticket.status === 'open';
              const isInProgress = ticket.status === 'in_progress';
              const isResolved = ticket.status === 'resolved';

              return (
                <div
                  key={ticket._id || ticket.ticketNumber}
                  className="bg-white rounded-2xl border border-gray-200/80 hover:border-gray-300 shadow-2xs p-4 sm:p-5 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-mono text-sm font-black text-[#3D1860] bg-[#F5EDF7] border border-[#BB99CD]/60 px-2.5 py-1 rounded-lg">
                        {ticket.ticketNumber}
                      </span>
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          isOpenStatus
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : isInProgress
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                        Priority: <span className="font-bold text-gray-800">{ticket.priority}</span>
                      </span>
                    </div>

                    <span className="text-xs text-gray-400 flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{ticket.createdAt ? `${formatDistanceToNow(new Date(ticket.createdAt))} ago` : 'Recently'}</span>
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 mb-4">
                    {ticket.imageUrl && (
                      <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-200 shrink-0 bg-gray-100">
                        <img
                          src={ticket.imageUrl}
                          alt="Citizen Report Evidence"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="flex-1 space-y-1">
                      <h4 className="font-bold text-gray-900 text-sm">
                        {ticket.facilityName || 'Public Infrastructure Asset'}
                      </h4>
                      <p className="text-xs text-gray-500">
                        Ward: <span className="font-medium text-gray-700">{ticket.localBodyWard || 'Central Ward'}</span> • Department: <span className="font-medium text-gray-700">{ticket.department}</span>
                      </p>
                      <p className="text-xs text-gray-600 bg-gray-50 rounded-lg p-2 border border-gray-100">
                        <span className="font-bold text-gray-700">Issue:</span> {ticket.issueType}
                      </p>
                      {ticket.resolutionNotes && (
                        <p className="text-xs text-emerald-700 bg-emerald-50 rounded-lg p-2 border border-emerald-100 font-medium">
                          ✓ {ticket.resolutionNotes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Municipal Actions */}
                  <div className="flex items-center justify-end space-x-2 pt-3 border-t border-gray-100">
                    {isOpenStatus && (
                      <button
                        onClick={() => handleUpdateStatus(ticket.ticketNumber, 'in_progress')}
                        disabled={updatingTicket === ticket.ticketNumber}
                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Field Crew</span>
                      </button>
                    )}

                    {isInProgress && (
                      <button
                        onClick={() => handleUpdateStatus(ticket.ticketNumber, 'resolved')}
                        disabled={updatingTicket === ticket.ticketNumber}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-xs transition flex items-center space-x-1.5 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Verify &amp; Mark Resolved</span>
                      </button>
                    )}

                    {isResolved && (
                      <span className="text-xs font-bold text-emerald-600 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Municipal Verification Complete</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
