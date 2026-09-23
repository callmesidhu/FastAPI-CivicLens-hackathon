import { useState, useEffect } from 'react';
import { getRatings, submitRating } from '@/lib/api';
import { Star, Send } from 'lucide-react';

interface RatingsViewProps {
  facilityId: string;
}

export default function RatingsView({ facilityId }: RatingsViewProps) {
  const [ratings, setRatings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRatings();
  }, [facilityId]);

  const loadRatings = async () => {
    try {
      setLoading(true);
      const data = await getRatings(facilityId);
      setRatings(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      // Hardcode a mock user ID for the hackathon demo, or try to get from localStorage
      let userId = "demo_user_123";
      try {
        const stored = localStorage.getItem('civiclens_user');
        if (stored) {
          const user = JSON.parse(stored);
          userId = user.id || userId;
        }
      } catch(e) {}
      
      await submitRating(facilityId, rating, userId, feedback);
      setFeedback('');
      setRating(5);
      await loadRatings();
    } catch (err: any) {
      setError(err.message || 'Failed to submit rating');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-100 pt-4">
      <h3 className="text-sm font-bold text-gray-800 mb-3">Ratings & Feedback</h3>
      
      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div className="flex items-center mb-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 cursor-pointer ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
              onClick={() => setRating(star)}
            />
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Leave a review..."
            className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#BB99CD]"
          />
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#3D1860] hover:bg-[#643579] text-white px-3 py-2 rounded-lg disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </form>

      {/* Ratings List */}
      {loading ? (
        <p className="text-xs text-gray-500">Loading ratings...</p>
      ) : ratings.length === 0 ? (
        <p className="text-xs text-gray-500">No ratings yet. Be the first to review!</p>
      ) : (
        <div className="space-y-3 max-h-40 overflow-y-auto pr-2">
          {ratings.map((r) => (
            <div key={r._id} className="bg-gray-50 p-2 rounded-lg text-sm border border-gray-100">
              <div className="flex items-center justify-between mb-1">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-3 h-3 ${star <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              {r.feedback && <p className="text-gray-700 text-xs">{r.feedback}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
