'use client';

import { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X } from 'lucide-react';

interface ProductFillingManagerProps {
  filling: string[];
  onChange: (filling: string[]) => void;
}

export default function ProductFillingManager({ filling, onChange }: ProductFillingManagerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFilling = () => {
    const value = inputRef.current?.value.trim() ?? '';
    if (!value) return;
    
    // Check for duplicates (case-insensitive)
    if (filling.some(f => f.toLowerCase() === value.toLowerCase())) {
      inputRef.current!.value = '';
      return;
    }
    
    onChange([...filling, value]);
    inputRef.current!.value = '';
    inputRef.current?.focus();
  };

  const removeFilling = (index: number) => {
    onChange(filling.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addFilling();
    }
  };

  const inputBaseClass = 
    'rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[0.95rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm';

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-[1rem] font-bold text-gray-900 tracking-tight">
          Product Filling
          <span className="ml-2 text-[0.8rem] font-bold text-gray-400 normal-case">
            (e.g., Veg, Chicken, Beef)
          </span>
        </h2>
      </div>

      {/* Input row */}
      <div className="flex gap-3 bg-white p-3 rounded-[24px] border border-gray-100 shadow-sm">
        <input
          ref={inputRef}
          type="text"
          placeholder="Type filling (e.g., Chicken) and press Enter"
          onKeyDown={handleKeyDown}
          className={`${inputBaseClass} flex-1`}
        />
        <button
          type="button"
          onClick={addFilling}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95 shadow-sm"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Filling list */}
      <AnimatePresence>
        {filling.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2.5 pt-1"
          >
            {filling.map((item, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/30 pl-4 pr-2 py-2 text-[0.9rem] font-bold text-emerald-700"
              >
                {item}
                <button
                  type="button"
                  onClick={() => removeFilling(i)}
                  className="h-7 w-7 flex items-center justify-center rounded-lg bg-emerald-100/50 text-emerald-600 hover:bg-red-50 hover:text-red-600 transition-all"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {filling.length === 0 && (
        <div className="text-center py-8 rounded-[24px] border-2 border-dashed border-gray-100 bg-gray-50/50">
          <p className="text-[0.85rem] font-bold text-gray-400 italic">
            No filling options added. Leave empty if not applicable.
          </p>
        </div>
      )}
    </section>
  );
}
