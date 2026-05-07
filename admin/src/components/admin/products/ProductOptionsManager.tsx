'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import type { IMenuOption } from '@/types/product';

interface ProductOptionsManagerProps {
  options: IMenuOption[];
  onChange: (options: IMenuOption[]) => void;
}

export default function ProductOptionsManager({ options, onChange }: ProductOptionsManagerProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const optionNameRef = useRef<HTMLInputElement>(null);
  const choiceInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  const addOption = () => {
    const name = optionNameRef.current?.value.trim();
    if (!name) return;

    const newOption: IMenuOption = {
      name,
      choices: [],
      required: false,
    };

    onChange([...options, newOption]);
    if (optionNameRef.current) optionNameRef.current.value = '';
    setExpandedIndex(options.length); // Expand the newly added option
  };

  const removeOption = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
    if (expandedIndex === index) setExpandedIndex(null);
  };

  const updateOptionName = (index: number, name: string) => {
    const updated = [...options];
    updated[index] = { ...updated[index], name };
    onChange(updated);
  };

  const toggleRequired = (index: number) => {
    const updated = [...options];
    updated[index] = { ...updated[index], required: !updated[index].required };
    onChange(updated);
  };

  const addChoice = (optionIndex: number) => {
    const input = choiceInputRefs.current[optionIndex];
    const choice = input?.value.trim();
    if (!choice) return;

    const updated = [...options];
    updated[optionIndex] = {
      ...updated[optionIndex],
      choices: [...updated[optionIndex].choices, choice],
    };
    onChange(updated);
    if (input) input.value = '';
  };

  const removeChoice = (optionIndex: number, choiceIndex: number) => {
    const updated = [...options];
    updated[optionIndex] = {
      ...updated[optionIndex],
      choices: updated[optionIndex].choices.filter((_, i) => i !== choiceIndex),
    };
    onChange(updated);
  };

  const handleChoiceKeyDown = (e: React.KeyboardEvent, optionIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addChoice(optionIndex);
    }
  };

  const inputBaseClass = 
    'rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[0.95rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm';

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[1rem] font-bold text-gray-900 tracking-tight">
          Product Options
          <span className="ml-2 text-[0.8rem] font-bold text-gray-400 normal-case">
            (e.g., Spice Level, Size)
          </span>
        </h2>
      </div>

      {/* Add New Option */}
      <div className="flex gap-3 bg-white p-3 rounded-[24px] border border-gray-100 shadow-sm">
        <input
          ref={optionNameRef}
          type="text"
          placeholder="New option name (e.g., Sauce Type)"
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addOption())}
          className={`${inputBaseClass} flex-1`}
        />
        <button
          type="button"
          onClick={addOption}
          className="flex h-[52px] w-[52px] shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95 shadow-sm"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Options List */}
      <AnimatePresence>
        {options.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {options.map((option, optionIndex) => {
              const isExpanded = expandedIndex === optionIndex;

              return (
                <motion.div
                  key={optionIndex}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="rounded-[24px] border border-gray-100 bg-white overflow-hidden shadow-sm"
                >
                  {/* Option Header */}
                  <div className={`flex items-center justify-between p-5 transition-colors ${isExpanded ? 'bg-gray-50/50' : ''}`}>
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        type="button"
                        onClick={() => setExpandedIndex(isExpanded ? null : optionIndex)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:text-gray-900 transition-colors border border-gray-100"
                      >
                        {isExpanded ? <ChevronUp size={20} strokeWidth={2.5} /> : <ChevronDown size={20} strokeWidth={2.5} />}
                      </button>
                      <div className="flex-1 min-w-0">
                        <input
                          type="text"
                          value={option.name}
                          onChange={(e) => updateOptionName(optionIndex, e.target.value)}
                          className="w-full bg-transparent text-[1rem] font-bold text-gray-900 outline-none"
                          placeholder="Option name"
                        />
                        <p className="text-[0.8rem] font-bold text-gray-400 mt-0.5">
                          {option.choices.length} choice{option.choices.length !== 1 ? 's' : ''}
                          {option.required && (
                            <span className="ml-2 text-amber-600 font-bold uppercase tracking-tighter text-[0.7rem] bg-amber-50 px-1.5 py-0.5 rounded-md">Required</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => toggleRequired(optionIndex)}
                        className={`h-10 px-4 rounded-xl text-[0.8rem] font-bold uppercase tracking-wide transition-all border ${
                          option.required
                            ? 'bg-amber-50 text-amber-600 border-amber-100 shadow-sm'
                            : 'bg-white text-gray-400 border-gray-100'
                        }`}
                      >
                        {option.required ? 'Required' : 'Optional'}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeOption(optionIndex)}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-gray-400 border border-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95"
                      >
                        <X size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content - Choices */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-gray-100 bg-gray-50/30 p-6 space-y-4"
                      >
                        <p className="text-[0.75rem] font-bold text-gray-400 uppercase tracking-widest">
                          Manage Choices
                        </p>

                        {/* Add Choice Input */}
                        <div className="flex gap-3">
                          <input
                            ref={(el) => {
                              choiceInputRefs.current[optionIndex] = el;
                            }}
                            type="text"
                            placeholder="Add choice (e.g., Mild, Medium, Hot)"
                            onKeyDown={(e) => handleChoiceKeyDown(e, optionIndex)}
                            className={`${inputBaseClass} flex-1 h-11 py-0`}
                          />
                          <button
                            type="button"
                            onClick={() => addChoice(optionIndex)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 transition-all active:scale-95"
                          >
                            <Plus size={20} strokeWidth={2.5} />
                          </button>
                        </div>

                        {/* Choices List */}
                        {option.choices.length > 0 && (
                          <div className="flex flex-wrap gap-2.5 pt-2">
                            {option.choices.map((choice, choiceIndex) => (
                              <motion.span
                                key={choiceIndex}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                className="inline-flex items-center gap-2 rounded-xl border border-emerald-100 bg-white pl-4 pr-2 py-2 text-[0.9rem] font-bold text-gray-800 shadow-sm"
                              >
                                {choice}
                                <button
                                  type="button"
                                  onClick={() => removeChoice(optionIndex, choiceIndex)}
                                  className="h-7 w-7 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-all"
                                >
                                  <X size={14} strokeWidth={3} />
                                </button>
                              </motion.span>
                            ))}
                          </div>
                        )}

                        {option.choices.length === 0 && (
                          <div className="text-center py-6 rounded-2xl border-2 border-dashed border-gray-100">
                             <p className="text-[0.85rem] font-bold text-gray-400 italic">No choices added yet. Type one above!</p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {options.length === 0 && (
        <div className="text-center py-10 rounded-[32px] border-2 border-dashed border-gray-100 bg-gray-50/50">
          <p className="text-[0.95rem] font-bold text-gray-400">
            No product options added yet.
          </p>
          <p className="text-[0.8rem] font-medium text-gray-400 mt-1">
            Add options like "Spice Level" or "Extra Toppings" to your product.
          </p>
        </div>
      )}
    </section>
  );
}
