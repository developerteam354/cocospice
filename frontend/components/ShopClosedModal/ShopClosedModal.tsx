'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShopClosedModalProps {
  closingReason?: string;
  onClose: () => void;
}

export default function ShopClosedModal({ closingReason, onClose }: ShopClosedModalProps) {
  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-[rgba(15,23,42,0.65)] backdrop-blur-[6px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
        />

        {/* Sheet */}
        <motion.div
          className="relative w-full max-w-md bg-white sm:rounded-[32px] rounded-t-[32px] shadow-[0_24px_80px_rgba(0,0,0,0.18)] overflow-hidden flex flex-col"
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0,      opacity: 1   }}
          exit={{   y: '100%', opacity: 0    }}
          transition={{ type: 'spring', damping: 28, stiffness: 240 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Red accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-red-400 via-red-500 to-orange-400" />

          {/* Body */}
          <div className="px-8 pt-8 pb-6 flex flex-col items-center text-center gap-5">
            {/* Icon */}
            <div className="w-20 h-20 rounded-[24px] bg-red-50 border-2 border-red-100 flex items-center justify-center">
              <span className="text-[2.6rem]" role="img" aria-label="Closed">🔒</span>
            </div>

            {/* Heading */}
            <div className="space-y-1.5">
              <h2 className="text-[1.55rem] font-black text-gray-900 tracking-tight leading-tight">
                We&apos;re Currently Closed
              </h2>
              <p className="text-[0.95rem] text-gray-500 font-medium leading-relaxed">
                Sorry, we&apos;re not accepting orders right now.
              </p>
            </div>

            {/* Hours card */}
            <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 text-xl shadow-sm">
                🕘
              </div>
              <div className="text-left">
                <p className="text-[0.72rem] font-bold text-gray-400 uppercase tracking-widest">Opening Hours</p>
                <p className="text-[0.95rem] font-bold text-gray-800 mt-0.5">12:00 PM – 11:00 PM</p>
                <p className="text-[0.78rem] text-gray-500 font-medium">Wednesday to Monday</p>
                <p className="text-[0.72rem] text-gray-400 font-medium mt-0.5">Closed on Tuesdays</p>
              </div>
            </div>

            {/* Admin closing reason (if provided) */}
            {closingReason && (
              <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 flex items-start gap-3">
                <span className="text-xl shrink-0 mt-0.5">📢</span>
                <div className="text-left">
                  <p className="text-[0.72rem] font-bold text-amber-700 uppercase tracking-widest mb-1">Notice</p>
                  <p className="text-[0.88rem] font-semibold text-amber-900 leading-snug">{closingReason}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-8 pb-8 pt-2">
            <button
              onClick={onClose}
              className="w-full py-[16px] rounded-2xl bg-gray-900 text-white font-extrabold text-[1rem] hover:bg-black active:scale-[0.98] transition-all shadow-[0_8px_20px_rgba(0,0,0,0.15)]"
            >
              Got it
            </button>
            <p className="text-center text-[0.78rem] text-gray-400 font-medium mt-3">
              You can still browse the menu and add items to your cart.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
