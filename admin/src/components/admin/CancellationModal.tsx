'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  orderNumber: string;
  isLoading?: boolean;
}

export default function CancellationModal({
  isOpen,
  onClose,
  onConfirm,
  orderNumber,
  isLoading = false,
}: CancellationModalProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    if (reason.trim()) {
      onConfirm(reason.trim());
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setReason('');
      onClose();
    }
  };

  const quickReasons = [
    'Item Out of Stock',
    'Kitchen Busy',
    'Invalid Address',
    'Customer Request',
    'Payment Issue',
    'Delivery Area Not Covered',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-[32px] shadow-2xl max-w-lg w-full overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative bg-gradient-to-br from-red-500 to-red-600 px-8 py-6">
                <button
                  onClick={handleClose}
                  disabled={isLoading}
                  className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors disabled:opacity-50"
                >
                  <X size={24} strokeWidth={2.5} />
                </button>
                
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <AlertTriangle size={28} className="text-white" strokeWidth={2.5} />
                  </div>
                  <div>
                    <h2 className="text-[1.5rem] font-black text-white tracking-tight">
                      Cancel Order
                    </h2>
                    <p className="text-white/90 text-[0.9rem] font-medium mt-0.5">
                      Order #{orderNumber}
                    </p>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 space-y-6">
                {/* Warning Message */}
                <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
                  <p className="text-[0.9rem] font-semibold text-red-800 leading-relaxed">
                    ⚠️ This action cannot be undone. Please provide a clear reason for cancellation that will be visible to the customer.
                  </p>
                </div>

                {/* Quick Reasons */}
                <div>
                  <label className="block text-[0.75rem] font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Quick Select
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {quickReasons.map((quickReason) => (
                      <button
                        key={quickReason}
                        type="button"
                        onClick={() => setReason(quickReason)}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-xl text-[0.85rem] font-bold transition-all border-2 disabled:opacity-50 ${
                          reason === quickReason
                            ? 'bg-red-500 text-white border-red-500'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50'
                        }`}
                      >
                        {quickReason}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reason Input */}
                <div>
                  <label className="block text-[0.75rem] font-bold text-gray-500 uppercase tracking-widest mb-3">
                    Cancellation Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    disabled={isLoading}
                    placeholder="Type the reason for cancellation (e.g., 'Item Out of Stock', 'Kitchen Busy', 'Invalid Address')..."
                    rows={4}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 text-[0.95rem] font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all resize-none disabled:opacity-50 disabled:bg-gray-50"
                  />
                  <p className="text-[0.8rem] text-gray-500 mt-2 font-medium">
                    {reason.trim().length} / 200 characters
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 px-6 py-4 rounded-2xl bg-gray-100 text-gray-700 font-bold text-[0.95rem] hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Keep Order
                  </button>
                  <button
                    onClick={handleConfirm}
                    disabled={!reason.trim() || isLoading}
                    className="flex-1 px-6 py-4 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 text-white font-bold text-[0.95rem] hover:from-red-600 hover:to-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30"
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Cancelling...
                      </span>
                    ) : (
                      'Confirm Cancellation'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
