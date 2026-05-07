'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem, ExtraOption } from '../../types';

interface ItemDetailModalProps {
  item: MenuItem;
  onClose: () => void;
  /** Called when user confirms — passes selected extras (may be empty array) */
  onAddToCart: (item: MenuItem, selectedExtras?: ExtraOption[]) => void;
}

export default function ItemDetailModal({ item, onClose, onAddToCart }: ItemDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Normalize extraOptions
  const extraOptions: ExtraOption[] = (item.extraOptions ?? []).map((opt) =>
    typeof opt === 'string' ? { name: opt as string, price: 0 } : opt
  );

  const hasExtras = extraOptions.length > 0;

  const validImages = [item.image, ...(item.images || [])].filter(
    (img) => img && img.trim() !== ''
  );
  const images = validImages.length > 0 ? validImages : [];

  useEffect(() => {
    if (images.length <= 1) return;
    const interval = setInterval(
      () => setCurrentImageIndex((prev) => (prev + 1) % images.length),
      4000
    );
    return () => clearInterval(interval);
  }, [images.length]);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((p) => (p + 1) % images.length);
  };
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);
  };

  const handleAddToCartClick = () => {
    onAddToCart(item, undefined);
    if (!hasExtras) onClose();
  };

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4">
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-[rgba(15,23,42,0.6)] backdrop-blur-[6px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        />

        {/* Modal Card */}
        <motion.div
          className="relative w-full max-w-lg bg-white sm:rounded-[32px] rounded-t-[32px] shadow-[0_24px_80px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh]"
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button overlay on image */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 hover:scale-105 transition-all shadow-lg"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>

          {/* ── Image Carousel ── */}
          <div className="relative w-full aspect-[4/3] sm:aspect-video bg-[#f8fafc] shrink-0 overflow-hidden group">
            {images.length > 0 && !imageError ? (
              <>
                <img
                  src={images[currentImageIndex]}
                  alt={`${item.name} ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover transition-opacity duration-300"
                  onError={() => setImageError(true)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                
                {images.length > 1 && (
                  <>
                    <button
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md z-10"
                      onClick={handlePrev}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md text-white flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-md z-10"
                      onClick={handleNext}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {images.map((_, idx) => (
                        <div
                          key={idx}
                          className={`h-2 rounded-full transition-all duration-300 ${
                            idx === currentImageIndex ? 'w-6 bg-[#10b981]' : 'w-2 bg-white/60 hover:bg-white/90 cursor-pointer'
                          }`}
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#f1f5f9] to-[#e2e8f0]">
                <span className="text-[4rem] drop-shadow-md">🍽️</span>
              </div>
            )}
          </div>

          {/* ── Details ── */}
          <div className="flex-1 overflow-y-auto px-6 py-6 [scrollbar-width:thin]">
            <div className="flex justify-between items-start gap-4 mb-3">
              <h2 className="text-[1.7rem] font-black text-[#111827] leading-[1.15] m-0 tracking-[-0.02em]">
                {item.name}
              </h2>
              <span className="text-[1.4rem] font-black text-[#10b981] whitespace-nowrap pt-1">
                £{item.price.toFixed(2)}
              </span>
            </div>

            <p className="text-[0.95rem] font-medium text-[#475569] leading-[1.6] m-0">
              {item.description}
            </p>

            {/* Ingredients */}
            {item.ingredients && item.ingredients.length > 0 && (
              <div className="mt-6">
                <h3 className="text-[0.8rem] font-bold text-[#64748b] uppercase tracking-[0.05em] mb-3">
                  Ingredients
                </h3>
                <div className="flex flex-wrap gap-2">
                  {item.ingredients.map((ing, idx) => (
                    <span
                      key={idx}
                      className="px-[12px] py-[6px] rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-[0.85rem] font-bold text-[#334155]"
                    >
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Extra Options — VIEW ONLY */}
            {hasExtras && (
              <div className="mt-8 pt-6 border-t border-[#f1f5f9]">
                <h3 className="text-[0.8rem] font-bold text-[#64748b] uppercase tracking-[0.05em] mb-3">
                  Available Extras
                </h3>
                <div className="flex flex-col gap-2.5 mb-4">
                  {extraOptions.map((opt) => (
                    <div key={opt.name} className="flex justify-between items-center text-[0.95rem]">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#cbd5e1]" />
                        <span className="font-semibold text-[#475569]">{opt.name}</span>
                      </div>
                      <span className="font-bold text-[#10b981]">+£{opt.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-3 bg-[rgba(16,185,129,0.08)] border-[1.5px] border-[rgba(16,185,129,0.2)] rounded-2xl">
                  <p className="text-[0.85rem] font-bold text-[#059669] m-0 leading-snug">
                    ✨ You can customise this item with the extras listed above after clicking Add to Cart.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 py-5 bg-white border-t border-[#f1f5f9] shrink-0 sm:rounded-b-[32px]">
            <button
              onClick={handleAddToCartClick}
              className="w-full flex items-center justify-center gap-2 py-[16px] rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-extrabold text-[1.1rem] shadow-[0_8px_20px_rgba(16,185,129,0.3)] hover:-translate-y-[2px] hover:shadow-[0_12px_24px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all"
            >
              {hasExtras ? (
                <>
                  <span>Customise &amp; Add</span>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </>
              ) : (
                `Add to Cart — £${item.price.toFixed(2)}`
              )}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
