'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { privateApi } from '@/lib/api';
import toast from 'react-hot-toast';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  productId: string;
  productName: string;
  productImage?: string;
  orderId: string;
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSuccess,
  productId,
  productName,
  productImage,
  orderId,
}: ReviewModalProps) {
  const [rating, setRating]               = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment]             = useState('');
  const [submitting, setSubmitting]       = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoveredRating(0);
      setComment('');
    }
  }, [isOpen, productId]);

  const isFormValid = rating > 0 && comment.trim().length >= 10;

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!comment || comment.trim().length < 10) {
      toast.error('Feedback must be at least 10 characters');
      return;
    }

    setSubmitting(true);
    try {
      await privateApi.post('/reviews', {
        productId,
        orderId,
        rating,
        comment: comment.trim(),
      });

      toast.success('Thank you for your feedback! It will be visible after admin approval.');
      onSuccess();
    } catch (err: any) {
      const msg: string =
        err?.response?.data?.message ?? err?.message ?? 'Failed to submit review';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setRating(0);
      setHoveredRating(0);
      setComment('');
      onClose();
    }
  };

  const displayRating = hoveredRating || rating;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Premium Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9998]"
          />

          {/* Premium Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', duration: 0.6, bounce: 0.3 }}
              className="bg-white rounded-[28px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-w-xl w-full overflow-hidden my-8 border border-gray-100 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <div className="absolute top-5 right-5 z-10">
                <button
                  onClick={handleClose}
                  disabled={submitting}
                  className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>

              {/* Premium Body */}
              <div className="px-10 py-10 space-y-8">
                {/* Header Section - Product Info */}
                <div className="flex items-center gap-5 pb-6 border-b border-gray-100">
                  {productImage ? (
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50 shadow-sm shrink-0">
                      <img src={productImage} alt={productName} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] flex items-center justify-center shrink-0 shadow-md">
                      <span className="text-3xl">🍽️</span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="text-[1.5rem] font-black text-gray-900 tracking-tight mb-1.5 leading-tight">
                      {productName}
                    </h2>
                    <p className="text-[0.95rem] text-gray-600 font-medium leading-relaxed">
                      How was your meal? Your feedback helps us improve!
                    </p>
                  </div>
                </div>

                {/* Star Rating Section - Premium Centered */}
                <div className="flex flex-col items-center gap-4 py-4">
                  <div className="flex items-center justify-center gap-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        disabled={submitting}
                        className="transition-all duration-200 hover:scale-125 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Star
                          size={52}
                          className={`transition-all duration-200 ${
                            star <= displayRating
                              ? 'text-[#FBBF24] fill-[#FBBF24] drop-shadow-md'
                              : 'text-gray-300 hover:text-gray-400'
                          }`}
                          strokeWidth={1.5}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[1rem] font-bold text-gray-800"
                    >
                      {rating === 1 && '⭐ Poor'}
                      {rating === 2 && '⭐⭐ Fair'}
                      {rating === 3 && '⭐⭐⭐ Good'}
                      {rating === 4 && '⭐⭐⭐⭐ Very Good'}
                      {rating === 5 && '⭐⭐⭐⭐⭐ Excellent'}
                    </motion.p>
                  )}
                </div>

                {/* Feedback Field - REQUIRED */}
                <div>
                  <label className="block text-[0.85rem] font-bold text-gray-700 mb-3">
                    Your Feedback <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    disabled={submitting}
                    placeholder="Please share your experience with this food (required)..."
                    rows={5}
                    maxLength={1000}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 text-[0.95rem] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#FBBF24] focus:ring-4 focus:ring-[#FBBF24]/20 transition-all resize-none disabled:opacity-50 disabled:bg-gray-50 shadow-sm"
                  />
                  <div className="flex justify-between items-center mt-3">
                    <p className="text-[0.85rem] font-medium">
                      {comment.trim().length === 0 ? (
                        <span className="text-gray-500">Feedback is required</span>
                      ) : comment.trim().length < 10 ? (
                        <span className="text-amber-600">⚠️ At least 10 characters required</span>
                      ) : (
                        <span className="text-green-600">✓ Perfect!</span>
                      )}
                    </p>
                    <p className="text-[0.85rem] text-gray-500 font-medium">
                      {comment.length} / 1000
                    </p>
                  </div>
                </div>

                {/* Submit Button - Premium Disabled State */}
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid || submitting}
                  className={`w-full px-6 py-4 rounded-2xl font-bold text-[1rem] transition-all shadow-lg active:scale-[0.98] ${
                    isFormValid && !submitting
                      ? 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white hover:from-[#059669] hover:to-[#047857] shadow-[#10b981]/30 hover:shadow-xl hover:shadow-[#10b981]/40'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    'Submit Feedback'
                  )}
                </button>

                {!isFormValid && (
                  <p className="text-center text-[0.8rem] text-gray-500 -mt-4">
                    Please select a rating and provide feedback to continue
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
