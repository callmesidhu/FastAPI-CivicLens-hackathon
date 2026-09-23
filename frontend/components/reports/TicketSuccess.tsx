import { CheckCircle2, Ticket } from 'lucide-react';
import { Facility } from '@/types';

interface TicketSuccessProps {
  ticketData: any;
  facility: Facility;
  onClose: () => void;
  onTrack: (ticketNumber: string) => void;
}

export default function TicketSuccess({ ticketData, facility, onClose, onTrack }: TicketSuccessProps) {
  if (!ticketData) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-6 flex flex-col items-center text-center border-b border-gray-100 relative">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">Report submitted</h2>
          <p className="text-sm text-gray-500 mt-1">Thank you for keeping CivicLens accurate.</p>
        </div>

        <div className="p-6 space-y-5 bg-gray-50">
          <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm text-center">
            <p className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-1">Ticket Number</p>
            <div className="flex items-center justify-center font-mono text-2xl font-black text-blue-700 tracking-tight">
              <Ticket className="w-5 h-5 mr-2" />
              {ticketData.ticketNumber}
            </div>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Facility</span>
              <span className="font-semibold text-gray-900 text-right max-w-[150px] truncate" title={facility.name}>{facility.name}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Assigned to</span>
              <span className="font-semibold text-gray-900 text-right">{ticketData.department}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Local Body</span>
              <span className="font-semibold text-gray-900 text-right">{ticketData.localBody}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500">Status</span>
              <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full capitalize">
                ● {ticketData.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Expected response</span>
              <span className="font-semibold text-gray-900 text-right">{ticketData.expectedResponse}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col space-y-3">
            <button 
              onClick={() => onTrack(ticketData.ticketNumber)}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-3 rounded-xl transition-colors"
            >
              Track Ticket
            </button>
            <button 
              onClick={onClose}
              className="w-full bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-bold py-3 rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
