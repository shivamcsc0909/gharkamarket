import React, { useEffect, useState } from 'react';
import { Star, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { adminApi } from '../services/adminApi';
import { AdminReview } from '../types';

export const Reviews: React.FC = () => {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getReviews();
      if (res.success && res.data) setReviews(res.data);
    } catch (e) {
      console.error('Failed to load reviews:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await adminApi.updateReviewStatus(id, status);
      fetchReviews();
    } catch (e) {
      console.error('Review update failed:', e);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this review permanently?')) return;
    try {
      await adminApi.deleteReview(id);
      fetchReviews();
    } catch (e) {
      console.error('Delete review failed:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Product Reviews Moderation</h1>
        <p className="text-xs text-stone-500">Approve or reject customer submitted reviews.</p>
      </div>

      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center text-stone-400 text-xs">
            No customer reviews pending moderation.
          </div>
        ) : (
          reviews.map((rev) => (
            <div key={rev.id} className="bg-white p-6 rounded-3xl border border-stone-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-stone-900">{rev.customer_name}</span>
                    <span className="text-[10px] text-stone-500 font-bold bg-stone-100 px-2 py-0.5 rounded-md">
                      Product: {rev.product_name}
                    </span>
                    {rev.is_verified_purchase === 1 && (
                      <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                        Verified Purchase
                      </span>
                    )}
                  </div>
                  <div className="flex text-amber-400 mt-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpdateStatus(rev.id, 'approved')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      rev.status === 'approved' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(rev.id, 'rejected')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      rev.status === 'rejected' ? 'bg-rose-600 text-white' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                    }`}
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleDelete(rev.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">{rev.comment}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
