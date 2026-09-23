import { useState, useEffect } from 'react';
import { fetchTicket } from '@/lib/api';
import { X, Search, Ticket, Clock, Building2, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

interface TrackTicketProps {
  initialTicketNumber?: string;
  onClose: () => void;
}

export default function TrackTicket({ initialTicketNumber = '', onClose }: TrackTicketProps) {
  const [ticketNumber, setTicketNumber] = useState(initialTicketNumber);
  const [ticketData, setTicketData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticketNumber.trim()) return;

    setIsLoading(true);
    setError(null);
    setTicketData(null);

    try {
      const data = await fetchTicket(ticketNumber);
      setTicketData(data);
    } catch (err) {
      setError('Ticket not found. Please check the number and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialTicketNumber) {
      handleSearch();
    }
  }, [initialTicketNumber]);

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 text-lg">Track Ticket</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          <form onSubmit={handleSearch} className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Ticket Number</label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="e.g. CF-1042"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono uppercase"
                  value={ticketNumber}
                  onChange={(e) => setTicketNumber(e.target.value.toUpperCase())}
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading || !ticketNumber.trim()}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 rounded-xl font-bold transition-colors"
              >
                {isLoading ? <span className="animate-pulse">...</span> : 'Track'}
              </button>
            </div>
          </form>

          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm flex items-center">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </div>
          )}

          {ticketData && (
            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-xs uppercase font-bold text-blue-600 mb-1">Status</p>
                  <p className="font-bold text-lg text-blue-900 capitalize flex items-center">
                    <span className="w-2.5 h-2.5 bg-blue-600 rounded-full mr-2 animate-pulse"></span>
                    {ticketData.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase font-bold text-blue-600 mb-1">Priority</p>
                  <p className={`font-bold capitalize ${ticketData.priority === 'high' ? 'text-red-600' : 'text-orange-600'}`}>
                    {ticketData.priority}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl overflow-hidden text-sm">
                <div className="p-4 border-b border-gray-200">
                  <p className="text-gray-500 mb-1">Facility</p>
                  <p className="font-semibold text-gray-900">{ticketData.facilityName || 'Unknown Facility'}</p>
                </div>
                <div className="p-4 border-b border-gray-200">
                  <p className="text-gray-500 mb-1">Reported Issue</p>
                  <p className="font-semibold text-gray-900 capitalize">{ticketData.issueType.replace('_', ' ')}</p>
                </div>
                <div className="p-4 border-b border-gray-200 bg-white">
                  <p className="text-gray-500 mb-1 flex items-center"><Building2 className="w-4 h-4 mr-1"/> Assigned to</p>
                  <p className="font-semibold text-gray-900">{ticketData.department}</p>
                  <p className="text-gray-600">{ticketData.localBodyName} • {ticketData.localBodyWard}</p>
                </div>
                <div className="p-4 flex justify-between items-center text-gray-600 bg-gray-100">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1.5" />
                    <span className="text-xs">
                      Reported {format(new Date(ticketData.createdAt), 'MMM d, h:mm a')}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-center text-xs text-gray-500">
                Expected response: <span className="font-semibold text-gray-700">{ticketData.expectedResponse}</span>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
