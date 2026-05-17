'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OutOfRangeModalProps {
  distanceKm:      number;
  radiusKm:        number;
  shopClosed?:     boolean;   // true when shop is currently closed
  openFrom?:       string;    // e.g. "9:00 AM"
  openUntil?:      string;    // e.g. "10:00 PM"
  closingReason?:  string;
  onClose:         () => void;
  onSwitchToCollection: () => void;
}

export default function OutOfRangeModal({
  distanceKm,
  radiusKm,
  shopClosed,
  openFrom  = '9:00 AM',
  openUntil = '10:00 PM',
  closingReason,
  onClose,
  onSwitchToCollection,
}: OutOfRangeModalProps) {
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
          {/* Top accent bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-[#10b981] via-[#059669] to-[#047857]" />

          {/* Body */}
          <div className="px-7 pt-7 pb-5 flex flex-col items-center text-center gap-5">

            {/* Icon — delivery truck with strike-through */}
            <div className="relative w-20 h-20 rounded-[22px] bg-[#f0fdf4] border-2 border-[#d1fae5] flex items-center justify-center shrink-0">
              <svg
                width="40" height="40" viewBox="0 0 24 24"
                fill="none" stroke="#10b981" strokeWidth="1.8"
                strokeLinecap="round" strokeLinejoin="round"
              >
                <rect x="1" y="3" width="15" height="13" rx="1"/>
                <path d="M16 8h4l3 5v4h-7V8z"/>
                <circle cx="5.5" cy="18.5" r="2.5"/>
                <circle cx="18.5" cy="18.5" r="2.5"/>
              </svg>
              {/* Strike-through overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="w-[68px] h-[3px] bg-red-500 rounded-full rotate-[-38deg] shadow-sm"
                  style={{ boxShadow: '0 0 0 1.5px white' }}
                />
              </div>
            </div>

            {/* Heading */}
            <div className="space-y-1.5">
              <h2 className="text-[1.5rem] font-black text-gray-900 tracking-tight leading-tight">
                Out of Delivery Range
              </h2>
              <p className="text-[0.9rem] text-gray-500 font-medium leading-relaxed max-w-[320px] mx-auto">
                We currently deliver within <span className="font-bold text-[#059669]">{radiusKm} km</span> of our
                Lincoln shop to ensure your food arrives hot and fresh.
              </p>
            </div>

            {/* Distance pill */}
            <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-3.5 w-full">
              <div className="w-9 h-9 rounded-xl bg-white border border-red-100 flex items-center justify-center shrink-0 shadow-sm text-lg">
                📍
              </div>
              <div className="text-left">
                <p className="text-[0.72rem] font-bold text-red-400 uppercase tracking-widest">Your Distance</p>
                <p className="text-[1rem] font-black text-red-600 mt-0.5">
                  {distanceKm.toFixed(1)} km away
                </p>
                <p className="text-[0.75rem] text-red-400 font-medium">
                  {(distanceKm - radiusKm).toFixed(1)} km outside our delivery zone
                </p>
              </div>
            </div>

            {/* Shop closed notice (shown only when shop is also closed) */}
            {shopClosed && (
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4 w-full text-left">
                <span className="text-xl shrink-0 mt-0.5">🕘</span>
                <div>
                  <p className="text-[0.72rem] font-bold text-amber-700 uppercase tracking-widest mb-1">Shop Hours</p>
                  <p className="text-[0.88rem] font-bold text-amber-900">
                    {openFrom} – {openUntil}, Monday to Sunday
                  </p>
                  {closingReason && (
                    <p className="text-[0.8rem] text-amber-700 font-medium mt-1">
                      📢 {closingReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Collection suggestion */}
            <div className="flex items-start gap-3 bg-[#f0fdf4] border border-[#d1fae5] rounded-2xl px-5 py-4 w-full text-left">
              <span className="text-xl shrink-0 mt-0.5">🏪</span>
              <div>
                <p className="text-[0.72rem] font-bold text-[#065f46] uppercase tracking-widest mb-1">Collection Available</p>
                <p className="text-[0.85rem] font-semibold text-[#047857] leading-snug">
                  You can still place a <span className="font-black">Collection order</span> and pick it up from our shop at no extra charge.
                </p>
              </div>
            </div>

            {/* Call us */}
            <div className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <div className="flex-1 text-left">
                <p className="text-[0.72rem] font-bold text-gray-400 uppercase tracking-widest">Questions? Call Us</p>
                <a
                  href="tel:01522534202"
                  className="text-[1rem] font-black text-gray-900 hover:text-[#10b981] transition-colors"
                >
                  01522 534 202
                </a>
                <p className="text-[0.75rem] text-gray-400 font-medium mt-0.5">
                  {openFrom} – {openUntil} · Mon–Sun
                </p>
              </div>
              <a
                href="tel:01522534202"
                className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#10b981] text-white text-[0.82rem] font-bold hover:bg-[#059669] transition-colors shadow-md shadow-emerald-500/20"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                Call
              </a>
            </div>
          </div>

          {/* Footer actions */}
          <div className="px-7 pb-7 pt-2 flex flex-col gap-3">
            <button
              onClick={onSwitchToCollection}
              className="w-full py-[15px] rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-extrabold text-[1rem] shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-[1px] hover:shadow-[0_12px_24px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span className="text-lg">🏪</span>
              Switch to Collection
            </button>
            <button
              onClick={onClose}
              className="w-full py-[13px] rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-[0.95rem] hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all"
            >
              ← Change Address
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
