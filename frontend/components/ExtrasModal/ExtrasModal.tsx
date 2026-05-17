'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuItem } from '../../types';

interface ExtrasModalProps {
  item: MenuItem;
  onConfirm: (item: MenuItem, spiceLevel: 'Normal' | 'Hot' | 'Extra Hot') => void;
  onClose: () => void;
}

export default function ExtrasModal({ item, onConfirm, onClose }: ExtrasModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<'Normal' | 'Hot' | 'Extra Hot'>('Normal');

  const spiceLevels: ('Normal' | 'Hot' | 'Extra Hot')[] = ['Normal', 'Hot', 'Extra Hot'];

  const handleConfirm = () => {
    onConfirm(item, selectedLevel);
    onClose();
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const getSpiceColor = (level: string) => {
    switch (level) {
      case 'Normal':    return '#10b981'; // Emerald
      case 'Hot':       return '#f59e0b'; // Amber
      case 'Extra Hot': return '#ef4444'; // Red
      default:          return '#10b981';
    }
  };

  const getSpiceIcon = (level: string) => {
    switch (level) {
      case 'Normal':    return '🌶️';
      case 'Hot':       return '🌶️🌶️';
      case 'Extra Hot': return '🌶️🌶️🌶️';
      default:          return '🌶️';
    }
  };

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

        {/* Modal Sheet / Card */}
        <motion.div
          className="relative w-full max-w-lg bg-white sm:rounded-[32px] rounded-t-[32px] shadow-[0_24px_80px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh]"
          initial={{ y: '100%', opacity: 0.8 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 26, stiffness: 220 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between px-6 pt-7 pb-5 bg-white z-10 shrink-0">
            <div className="flex flex-col gap-1.5 pr-4">
              <span className="text-[0.75rem] font-bold uppercase tracking-[0.1em] text-[#ff6b35]">
                How spicy would you like it?
              </span>
              <h2 className="text-[1.6rem] font-bold text-[#111827] leading-[1.1] m-0 tracking-[-0.02em]">
                {item.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-[14px] bg-[#f1f5f9] text-[#64748b] flex items-center justify-center hover:bg-[#e2e8f0] hover:text-[#0f172a] transition-colors shrink-0"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="h-px w-full bg-gradient-to-r from-transparent via-[#e2e8f0] to-transparent shrink-0" />

          {/* Options List */}
          <div className="flex-1 overflow-y-auto px-6 py-8 [scrollbar-width:thin]">
            <p className="text-[0.85rem] font-bold text-[#64748b] mb-6 uppercase tracking-[0.05em]">Choose spice level</p>
            <div className="flex flex-col gap-4">
              {spiceLevels.map((level) => {
                const checked = selectedLevel === level;
                const color = getSpiceColor(level);
                
                return (
                  <label
                    key={level}
                    className={`flex items-center gap-4 p-5 rounded-[24px] border-[2px] cursor-pointer transition-all duration-200 select-none ${
                      checked
                        ? `border-[${color}] bg-[rgba(255,107,53,0.04)] shadow-[0_8px_24px_rgba(0,0,0,0.06)]`
                        : 'border-[#f1f5f9] bg-white hover:border-[#e2e8f0] hover:bg-[#f8fafc]'
                    }`}
                    style={{ borderColor: checked ? color : '' }}
                    onClick={() => setSelectedLevel(level)}
                  >
                    {/* Radio */}
                    <div
                      className={`w-[26px] h-[26px] rounded-full border-[2px] flex items-center justify-center shrink-0 transition-all duration-200 ${
                        checked
                          ? 'border-transparent shadow-[0_0_0_4px_rgba(255,107,53,0.1)]'
                          : 'bg-white border-[#cbd5e1]'
                      }`}
                      style={{ backgroundColor: checked ? color : '' }}
                    >
                      {checked && (
                        <div className="w-[10px] h-[10px] rounded-full bg-white shadow-sm" />
                      )}
                    </div>

                    <div className="flex-1 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className={`text-[1.1rem] font-bold ${checked ? 'text-[#111827]' : 'text-[#334155]'}`}>
                          {level}
                        </span>
                        <span className="text-[0.8rem] text-[#64748b] font-medium">
                          {level === 'Normal' ? 'Mild and flavorful' : level === 'Hot' ? 'A noticeable spicy kick' : 'Intense heat for brave souls'}
                        </span>
                      </div>
                      <span className="text-[1.4rem] grayscale-[0.5] group-hover:grayscale-0 transition-all">
                        {getSpiceIcon(level)}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer Area */}
          <div className="bg-[#f8fafc] border-t border-[#e2e8f0] px-6 py-6 flex flex-col gap-4 shrink-0 sm:rounded-b-[32px]">
            <button
              onClick={handleConfirm}
              className="w-full py-[18px] rounded-[20px] bg-gradient-to-br from-[#ff6b35] to-[#f59e0b] text-white font-bold text-[1.1rem] shadow-[0_12px_28px_rgba(255,107,53,0.3)] hover:-translate-y-[2px] hover:shadow-[0_16px_32px_rgba(255,107,53,0.4)] active:scale-[0.98] transition-all"
            >
              Add to Cart
            </button>
            <p className="text-center text-[0.8rem] text-[#94a3b8] font-medium">
              You can change this later in your cart
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
