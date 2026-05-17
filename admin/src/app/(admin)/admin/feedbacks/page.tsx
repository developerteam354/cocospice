'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Search, Star, Trash2, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchAllReviews, fetchReviewOverallStats, toggleReviewApproval, deleteReview } from '@/store/slices/reviewSlice';
import type { IReview } from '@/types/review';
import { toProxyUrl } from '@/services/productService';

// ─── Star Display ─────────────────────────────────────────────────────────────

function StarDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={star <= rating ? '#facc15' : 'none'}
          stroke={star <= rating ? '#facc15' : '#d1d5db'}
          strokeWidth="2"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

// ─── Approval Toggle ──────────────────────────────────────────────────────────

function ApprovalToggle({
  reviewId,
  isApproved,
  isUpdating,
  onToggle,
}: {
  reviewId: string;
  isApproved: boolean;
  isUpdating: boolean;
  onToggle: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onToggle(reviewId)}
      disabled={isUpdating}
      className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed ${
        isApproved ? 'bg-emerald-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
          isApproved ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isDeleting,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', duration: 0.4 }}
              className="bg-white rounded-[28px] shadow-2xl max-w-sm w-full p-8 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Trash2 size={28} className="text-red-600" />
              </div>
              <h3 className="text-[1.2rem] font-black text-gray-900 mb-2">Delete Review?</h3>
              <p className="text-[0.9rem] text-gray-500 font-medium mb-6 leading-relaxed">
                This action cannot be undone. The review will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-2xl bg-gray-100 text-gray-700 font-bold text-[0.9rem] hover:bg-gray-200 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-[0.9rem] hover:bg-red-600 transition-all disabled:opacity-50 shadow-lg shadow-red-500/25"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review,
  isUpdating,
  onToggle,
  onDelete,
}: {
  review: IReview;
  isUpdating: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {
          onDelete(review._id);
          setShowDeleteModal(false);
        }}
        isDeleting={isUpdating}
      />

      <motion.div
        layout
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, x: -16 }}
        className={`bg-white rounded-[24px] p-6 border shadow-sm transition-all hover:shadow-md ${
          review.isApproved ? 'border-emerald-100' : 'border-gray-100'
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Product Thumbnail */}
          <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 shrink-0">
            {review.productId?.thumbnail?.url ? (
              <img
                src={review.productId.thumbnail.url}
                alt={review.productId.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">🍽️</div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="font-black text-gray-900 text-[1rem] leading-tight">
                  {review.productId?.name || 'Unknown Product'}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[0.7rem] font-black shrink-0 overflow-hidden">
                    {review.userId?.profileImage ? (
                      <img
                        src={toProxyUrl(review.userId.profileImage)}
                        alt={review.userId.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) parent.innerHTML = `<span style="font-size:0.7rem;font-weight:900;color:white">${review.userId?.name?.charAt(0)?.toUpperCase() ?? 'U'}</span>`;
                        }}
                      />
                    ) : (
                      review.userId?.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  <p className="text-[0.85rem] font-bold text-gray-600">{review.userId?.name || 'Unknown User'}</p>
                  <span className="text-gray-300">·</span>
                  <p className="text-[0.8rem] text-gray-400 font-medium">{formatDate(review.createdAt)}</p>
                </div>
              </div>

              {/* Status Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.75rem] font-bold shrink-0 ${
                review.isApproved
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                {review.isApproved ? (
                  <><CheckCircle size={12} /> Approved</>
                ) : (
                  <><Clock size={12} /> Pending</>
                )}
              </span>
            </div>

            {/* Star Rating */}
            <div className="flex items-center gap-2 mt-3">
              <StarDisplay rating={review.rating} />
              <span className="text-[0.85rem] font-bold text-gray-700">{review.rating}/5</span>
            </div>

            {/* Comment */}
            <p className="text-[0.9rem] text-gray-700 font-medium leading-relaxed mt-3 line-clamp-3">
              {review.comment}
            </p>

            {/* Order Reference */}
            <p className="text-[0.75rem] text-gray-400 font-medium mt-2">
              Order: <span className="font-bold text-gray-500">#{review.orderId?.orderId || 'N/A'}</span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-[0.8rem] font-bold text-gray-500">
              {review.isApproved ? 'Visible to users' : 'Hidden from users'}
            </span>
            <ApprovalToggle
              reviewId={review._id}
              isApproved={review.isApproved}
              isUpdating={isUpdating}
              onToggle={onToggle}
            />
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            disabled={isUpdating}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-red-500 text-[0.8rem] font-bold hover:bg-red-50 border border-transparent hover:border-red-100 transition-all disabled:opacity-50"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeedbacksPage() {
  const dispatch = useAppDispatch();
  const { reviews, overallStats, loading, updating } = useAppSelector((state: RootState) => state.reviews);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    dispatch(fetchAllReviews());
    dispatch(fetchReviewOverallStats());
  }, [dispatch]);

  const filteredReviews = useMemo(() => {
    let result = [...reviews];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.userId?.name?.toLowerCase().includes(q) ||
          r.productId?.name?.toLowerCase().includes(q) ||
          r.comment?.toLowerCase().includes(q)
      );
    }

    if (filter === 'approved') result = result.filter((r) => r.isApproved);
    if (filter === 'pending')  result = result.filter((r) => !r.isApproved);

    return result;
  }, [reviews, search, filter]);

  const handleToggle = async (reviewId: string) => {
    try {
      const result = await dispatch(toggleReviewApproval(reviewId)).unwrap();
      toast.success(result.isApproved ? 'Review approved and visible to users' : 'Review hidden from users');
    } catch {
      toast.error('Failed to update review');
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      toast.success('Review deleted successfully');
    } catch {
      toast.error('Failed to delete review');
    }
  };

  const approvedReviews = reviews.filter(r => r.isApproved);
  const avgRating = approvedReviews.length > 0
    ? (approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl sm:text-[2.2rem] font-bold text-gray-900 tracking-tight leading-tight">
            Customer Feedbacks
          </h1>
          <p className="text-[0.95rem] font-medium text-gray-500 mt-1">
            Manage and moderate product reviews from your customers
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {[
          {
            label: 'Total Reviews',
            value: overallStats?.total ?? 0,
            icon: MessageSquare,
            color: 'bg-blue-500',
          },
          {
            label: 'Approved',
            value: overallStats?.approved ?? 0,
            icon: CheckCircle,
            color: 'bg-emerald-500',
          },
          {
            label: 'Pending',
            value: overallStats?.pending ?? 0,
            icon: Clock,
            color: 'bg-amber-500',
          },
          {
            label: 'Avg Rating',
            value: avgRating,
            icon: TrendingUp,
            color: 'bg-yellow-500',
          },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-5">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${stat.color} text-white shadow-lg`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[1.8rem] font-bold text-gray-900 leading-none">{stat.value}</p>
                <p className="text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 mt-1.5">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Toolbar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row items-center gap-4 bg-white p-3 rounded-[28px] border border-gray-100 shadow-sm"
      >
        <div className="relative flex-1 w-full">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by customer name, product, or review text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 rounded-[22px] border-none bg-gray-50 pl-14 pr-6 text-[0.95rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
        </div>
        <div className="flex bg-gray-100/50 p-1.5 rounded-[22px] gap-1 shrink-0">
          {(['all', 'approved', 'pending'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-[18px] px-6 py-3 text-[0.8rem] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                filter === f ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f === 'all' ? `All (${reviews.length})` : f === 'approved' ? `Approved (${overallStats?.approved ?? 0})` : `Pending (${overallStats?.pending ?? 0})`}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Reviews List */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="space-y-4"
      >
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-[24px] p-6 border border-gray-100 animate-pulse">
              <div className="flex gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gray-100" />
                <div className="flex-1 space-y-3">
                  <div className="h-5 w-48 bg-gray-100 rounded-lg" />
                  <div className="h-4 w-32 bg-gray-100 rounded-lg" />
                  <div className="h-4 w-full bg-gray-100 rounded-lg" />
                  <div className="h-4 w-3/4 bg-gray-100 rounded-lg" />
                </div>
              </div>
            </div>
          ))
        ) : filteredReviews.length === 0 ? (
          <div className="bg-white rounded-[32px] border border-gray-100 py-24 text-center">
            <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center mx-auto mb-5 border border-gray-100">
              <MessageSquare size={40} className="text-gray-200" />
            </div>
            <p className="text-[1.1rem] font-bold text-gray-900">No reviews found</p>
            <p className="text-[0.9rem] font-medium text-gray-500 mt-1">
              {filter !== 'all' ? 'Try changing the filter' : 'Reviews will appear here once customers submit them'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((review) => (
              <ReviewCard
                key={review._id}
                review={review}
                isUpdating={updating === review._id}
                onToggle={handleToggle}
                onDelete={handleDelete}
              />
            ))}
          </AnimatePresence>
        )}
      </motion.div>
    </div>
  );
}
