'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Image as ImageIcon, Loader2, Save } from 'lucide-react';
import type { ICategory } from '@/types/category';
import { createPortal } from 'react-dom';

const schema = z.object({
  name:        z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface CategoryModalProps {
  open:     boolean;
  onClose:  () => void;
  onSave:   (data: { name: string; description: string; categoryImage?: File }) => Promise<void>;
  initial?: ICategory | null;
}

export default function CategoryModal({ open, onClose, onSave, initial }: CategoryModalProps) {
  const [mounted, setMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [existingImageUrl, setExistingImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (initial) {
      reset({ name: initial.name, description: initial.description });
      setExistingImageUrl(initial.categoryImage || '');
      setImagePreview('');
      setImageFile(null);
      setImageError(false);
    } else {
      reset({ name: '', description: '' });
      setExistingImageUrl('');
      setImagePreview('');
      setImageFile(null);
      setImageError(false);
    }
  }, [initial, open, reset]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImageError(false);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setSaving(true);
    try {
      await onSave({ 
        name: data.name, 
        description: data.description ?? '',
        categoryImage: imageFile || undefined
      });
      reset({ name: '', description: '' });
      setImagePreview('');
      setImageFile(null);
      setExistingImageUrl('');
      onClose();
    } catch (error) {
      console.error('Category save error:', error);
    } finally {
      setSaving(false);
    }
  };

  const displayImage = imagePreview || existingImageUrl;

  if (!mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
          {/* ── Standardized Backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[6px] transition-all"
          />

          {/* ── Standard Modal Architecture ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="relative w-full max-w-[500px] overflow-hidden rounded-[32px] border border-white/20 bg-white shadow-[0_50px_100px_rgba(0,0,0,0.3)]"
          >
            {/* Design Accents */}
            <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-50/50 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-blue-50/50 blur-3xl" />

            <div className="relative z-10">
              {/* Header Interface */}
              <div className="flex items-center justify-between border-b border-gray-100 px-8 py-6">
                <div>
                  <h2 className="text-[1.5rem] font-bold tracking-tight text-gray-900 leading-none">
                    {initial ? 'Edit Category' : 'Create Category'}
                  </h2>
                  <p className="mt-1 text-[0.75rem] font-bold text-gray-400 uppercase tracking-widest">
                    Standard Registry Manifest
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-90"
                >
                  <X size={20} strokeWidth={3} />
                </button>
              </div>

              {/* Form Terminal */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-7">
                {/* Visual Representation */}
                <div className="flex items-center gap-5 p-4 rounded-2xl bg-gray-50/80 border border-gray-100">
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
                    {displayImage ? (
                      <img src={displayImage} alt="Preview" className="h-full w-full object-cover" onError={() => setImageError(true)} />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-emerald-400">
                        <ImageIcon size={28} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-[0.8rem] font-bold text-gray-500 mb-2">Category Iconography</p>
                    <label className="cursor-pointer inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-[0.75rem] font-bold text-gray-700 shadow-sm border border-gray-100 hover:border-emerald-200 hover:text-emerald-600 transition-all">
                      <Upload size={14} strokeWidth={3} />
                      Choose File
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </label>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-5">
                   <div className="space-y-2">
                      <label className="px-1 text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Category Name</label>
                      <input 
                         {...register('name')}
                         placeholder="e.g. Traditional Starters"
                         className="w-full h-14 rounded-2xl border-none bg-gray-50 px-5 text-[1rem] font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
                      />
                      {errors.name && <p className="px-2 text-[0.7rem] font-bold text-red-500">{errors.name.message}</p>}
                   </div>

                   <div className="space-y-2">
                      <label className="px-1 text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest">Narrative</label>
                      <textarea 
                         {...register('description')}
                         rows={2}
                         placeholder="A brief description..."
                         className="w-full rounded-2xl border-none bg-gray-50 p-5 text-[0.9rem] font-bold text-gray-900 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none"
                      />
                   </div>
                </div>

                {/* Operations */}
                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button" onClick={onClose}
                    className="flex-1 h-14 rounded-2xl bg-gray-50 font-bold text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit" disabled={saving}
                    className="flex-[1.5] h-14 flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={18} strokeWidth={3} />}
                    {initial ? 'Update Manifest' : 'Confirm Category'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
