'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import { CheckCircle2, Ticket, ArrowRight, BookmarkCheck } from 'lucide-react';
import { Facility } from '@/types';

interface TicketSuccessProps {
  ticketData: any;
  facility: Facility;
  onClose: () => void;
  onTrack: (ticketNumber: string) => void;
}

export default function TicketSuccess({ ticketData, facility, onClose, onTrack }: TicketSuccessProps) {
  const router = useRouter();
  const { user, saveUserTicket } = useAuth();

  // Auto-save ticket to user's account and local storage
  useEffect(() => {
    if (ticketData?.ticketNumber) {
      saveUserTicket({
        ticketNumber: ticketData.ticketNumber,
        facilityName: facility.name,
        department: ticketData.department,
        localBody: ticketData.localBody,
        status: ticketData.status || 'submitted',
        priority: ticketData.priority,
        expectedResponse: ticketData.expectedResponse,
        imageUrl: ticketData.imageUrl,
        createdAt: new Date().toISOString(),
      });
    }
  }, [ticketData, facility.name, saveUserTicket]);

  if (!ticketData) return null;

  const handleGoToLoginPage = () => {
    onClose();
    router.push('/login');
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 flex flex-col items-center text-center border-b border-gray-100 relative">
          <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-3">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-black text-gray-900">Report submitted</h2>
          <p className="text-xs text-gray-500 mt-1">Thank you for keeping CivicLens accurate.</p>
        </div>

        <div className="p-6 space-y-4 bg-gray-50/70">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-center">
            <p className="text-[10px] uppercase tracking-wider font-extrabold text-gray-400 mb-1">Ticket Number</p>
            <div className="flex items-center justify-center font-mono text-2xl font-black text-[#3D1860] tracking-tight">
              <Ticket className="w-5 h-5 mr-2 text-[#643579]" />
              {ticketData.ticketNumber}
            </div>
            <p className="text-[10px] text-emerald-700 font-bold mt-1.5 flex items-center justify-center gap-1">
              <BookmarkCheck className="w-3.5 h-3.5" />
              <span>Saved to your tracked tickets</span>
            </p>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-500">Facility</span>
              <span className="font-bold text-gray-900 text-right max-w-[170px] truncate" title={facility.name}>
                {facility.name}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-500">Assigned to</span>
              <span className="font-semibold text-gray-900 text-right">{ticketData.department}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-500">Local Body</span>
              <span className="font-semibold text-gray-900 text-right">{ticketData.localBody}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200/60 pb-2">
              <span className="text-gray-500">Status</span>
              <span className="font-bold text-[#3D1860] bg-[#F5EDF7] border border-[#BB99CD] px-2 py-0.5 rounded-full capitalize">
                ● {ticketData.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Expected response</span>
              <span className="font-semibold text-gray-900 text-right">{ticketData.expectedResponse}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col space-y-2">
            <button 
              onClick={() => onTrack(ticketData.ticketNumber)}
              className="w-full bg-[#3D1860] hover:bg-[#643579] text-white font-bold py-2.5 rounded-xl transition shadow-md text-xs"
            >
              Track Ticket
            </button>
            <button 
              onClick={handleGoToLoginPage}
              className="w-full bg-[#F5EDF7] hover:bg-[#BB99CD]/30 text-[#3D1860] border border-[#BB99CD]/50 font-bold py-2.5 rounded-xl transition text-xs flex items-center justify-center space-x-1"
            >
              <span>View in Account &amp; Login Page</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-200 font-bold py-2 rounded-xl transition text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
