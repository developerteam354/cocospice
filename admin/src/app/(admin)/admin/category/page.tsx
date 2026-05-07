'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Pencil, Eye, EyeOff, Trash2, Search, Tag } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCategories,
  addCategory,
  updateCategory,
  toggleCategoryStatus,
  deleteCategory,
  resetCategoryState,
} from '@/store/slices/categorySlice';
import type { ICategory } from '@/types/category';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import CategoryModal from '@/components/admin/category/CategoryModal';

const rowVariants = {
  hidden:   { opacity: 0, y: 8 },
  visible:  (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.04, duration: 0.3 } }),
  exit:     { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

// ─── Category Card Component ──────────────────────────────────────────────────

interface CategoryCardProps {
  cat: ICategory;
  index: number;
  onEdit: (cat: ICategory) => void;
  onToggle: (cat: ICategory) => void;
  onDelete: (cat: ICategory) => void;
}

function CategoryCard({ cat, index, onEdit, onToggle, onDelete }: CategoryCardProps) {
  return (
    <motion.div
      variants={rowVariants}
      custom={index}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="group relative flex flex-col h-full rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.04)] transition-all duration-500 overflow-hidden"
    >
      {/* ── Background Accent ── */}
      <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-emerald-50/40 blur-2xl group-hover:bg-emerald-100/50 transition-all duration-500" />
      
      <div className="relative z-10 flex flex-col h-full">
        {/* Header: Image + Status */}
        <div className="flex items-start justify-between mb-5">
          <div className="relative h-16 w-16 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
            {cat.categoryImage ? (
              <img 
                src={cat.categoryImage} 
                alt={cat.name} 
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-2xl">🏷️</div>';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-600">
                <Tag size={28} strokeWidth={2} />
              </div>
            )}
          </div>
          <Badge variant={cat.isListed ? 'green' : 'slate'}>
            {cat.isListed ? 'Active' : 'Hidden'}
          </Badge>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-2">
          <h3 className="text-[1.3rem] font-bold text-gray-900 tracking-tight group-hover:text-emerald-700 transition-colors">
            {cat.name}
          </h3>
          <p className="text-[0.9rem] font-medium text-gray-500 line-clamp-2 leading-relaxed">
            {cat.description || 'No description provided for this category.'}
          </p>
        </div>

        {/* Footer: Actions */}
        <div className="mt-6 flex items-center gap-2 pt-5 border-t border-gray-50">
          <button 
            onClick={() => onEdit(cat)}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gray-50 px-4 py-3 text-[0.85rem] font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 transition-all active:scale-95 border border-transparent hover:border-emerald-100"
          >
            <Pencil size={16} strokeWidth={2.5} />
            Edit
          </button>
          
          <div className="flex gap-1.5">
            <button 
              onClick={() => onToggle(cat)}
              title={cat.isListed ? 'Hide Category' : 'List Category'}
              className={`rounded-2xl p-3 border transition-all active:scale-95 shadow-sm ${
                cat.isListed 
                  ? 'border-gray-100 bg-white text-gray-400 hover:bg-gray-100 hover:text-gray-900' 
                  : 'border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              {cat.isListed ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
            </button>
            <button 
              onClick={() => onDelete(cat)}
              title="Delete Category"
              className="rounded-2xl p-3 border border-gray-100 bg-white text-gray-400 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95 shadow-sm"
            >
              <Trash2 size={18} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function CategoryPage() {
  const dispatch = useAppDispatch();
  const { categories, loading, error } = useAppSelector((state) => state.category);
  
  const [filtered,   setFiltered]   = useState<ICategory[]>([]);
  const [search,     setSearch]     = useState('');
  const [modalOpen,  setModalOpen]  = useState(false);
  const [editing,    setEditing]    = useState<ICategory | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Filter by search
  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(q ? categories.filter((c) => c.name.toLowerCase().includes(q)) : categories);
  }, [search, categories]);

  const openCreate = () => { 
    dispatch(resetCategoryState()); 
    setEditing(null); 
    setModalOpen(true); 
  };
  
  const openEdit = (cat: ICategory) => { 
    dispatch(resetCategoryState()); 
    setEditing(cat); 
    setModalOpen(true); 
  };

  const handleCloseModal = () => {
    dispatch(resetCategoryState());
    setModalOpen(false);
  };

  const handleSave = async (data: { name: string; description: string; categoryImage?: File }) => {
    const tid = toast.loading(editing ? 'Updating...' : 'Creating...');
    try {
      if (editing) {
        await dispatch(updateCategory({ id: editing._id, payload: data })).unwrap();
        toast.success('Category updated', { id: tid });
        setModalOpen(false);
      } else {
        await dispatch(addCategory(data)).unwrap();
        toast.success('Category created', { id: tid });
        setModalOpen(false);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save category';
      toast.error(errorMessage, { id: tid });
    }
  };

  const handleToggle = async (cat: ICategory) => {
    try {
      const result = await dispatch(toggleCategoryStatus(cat._id)).unwrap();
      toast.success(result.isListed ? 'Category listed' : 'Category unlisted');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status');
    }
  };

  const handleDelete = async (cat: ICategory) => {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    const tid = toast.loading('Deleting...');
    try {
      await dispatch(deleteCategory(cat._id)).unwrap();
      toast.success('Category deleted', { id: tid });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete', { id: tid });
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#ffffff', color: '#111827', border: '1px solid #f3f4f6', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
      }} />

      <CategoryModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        initial={editing}
      />

      <div className="space-y-8">
        {/* Header Area */}
        <div className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">Category Manager</h1>
              <p className="text-[0.95rem] font-medium text-gray-500 mt-1">
                Manage how your menu items are grouped and displayed
              </p>
            </div>
            <Button onClick={openCreate} className="h-14 px-8 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Plus size={20} strokeWidth={3} />
              <span>New Category</span>
            </Button>
          </motion.div>

          {/* Search & Stats Bar */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row items-center gap-4 bg-white p-3 rounded-[28px] border border-gray-100 shadow-sm"
          >
            <div className="relative flex-1 w-full">
              <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Find a category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-14 rounded-[22px] border-none bg-gray-50 pl-14 pr-6 text-[1rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all"
              />
            </div>
            <div className="hidden md:flex items-center gap-6 px-6 border-l border-gray-100">
               <div className="text-center">
                  <p className="text-[1.1rem] font-bold text-gray-900">{categories.length}</p>
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">Total</p>
               </div>
               <div className="text-center">
                  <p className="text-[1.1rem] font-bold text-emerald-600">{categories.filter(c => c.isListed).length}</p>
                  <p className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">Active</p>
               </div>
            </div>
          </motion.div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-[32px] bg-gray-50 border border-gray-100" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 rounded-[40px] border-2 border-dashed border-gray-100 bg-gray-50/30">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Tag size={40} className="text-gray-200" />
              </div>
              <h3 className="text-[1.2rem] font-bold text-gray-900">No categories found</h3>
              <p className="text-gray-500 font-medium mt-1">
                {search ? 'Try a different search term' : 'Start by adding your first menu category'}
              </p>
              {!search && (
                <Button onClick={openCreate} variant="ghost" className="mt-6">
                  Create Category
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <AnimatePresence mode="popLayout">
                {filtered.map((cat, i) => (
                  <CategoryCard 
                    key={cat._id} 
                    cat={cat} 
                    index={i} 
                    onEdit={openEdit}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
