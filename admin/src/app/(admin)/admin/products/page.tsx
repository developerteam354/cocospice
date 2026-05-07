'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, CheckCircle, XCircle, EyeOff, Plus, Search, Edit2, Eye, Leaf } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import {
  fetchAllProducts,
  fetchProductStats,
  toggleProductAvailability,
} from '@/store/slices/productSlice';
import { fetchCategories } from '@/store/slices/categorySlice';
import type { IProduct } from '@/types/product';

import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';

// ─── Stat Card Component ──────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'indigo' | 'emerald' | 'red' | 'slate';
  loading?: boolean;
}

function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  const colorClasses = {
    indigo: 'from-indigo-50 to-indigo-100 text-indigo-600 border-indigo-100',
    emerald: 'from-emerald-50 to-emerald-100 text-emerald-600 border-emerald-100',
    red: 'from-red-50 to-red-100 text-red-600 border-red-100',
    slate: 'from-gray-50 to-gray-100 text-gray-600 border-gray-200',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[24px] border border-gray-100 bg-white p-6 shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[0.8rem] font-bold uppercase tracking-wider text-gray-500">{label}</p>
          {loading ? (
            <div className="mt-2 h-8 w-16 animate-pulse rounded bg-gray-100" />
          ) : (
            <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
          )}
        </div>
        <div className={`rounded-2xl bg-gradient-to-br p-3.5 border ${colorClasses[color]} shadow-sm`}>
          <Icon size={24} strokeWidth={2.5} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Product Card Component ───────────────────────────────────────────────────

interface ProductCardProps {
  product: IProduct;
  index: number;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onToggleList: (id: string, currentStatus: boolean) => void;
}

function ProductCard({ product, index, onView, onEdit, onToggleList }: ProductCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.04, duration: 0.5, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] }}
      className="group relative flex flex-col h-full rounded-[36px] border border-gray-100 bg-white p-4 shadow-sm hover:shadow-[0_30px_60px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer overflow-hidden"
      onClick={() => onView(product._id)}
    >
      {/* ── Visual Backdrop ── */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-50/30 blur-[80px] group-hover:bg-emerald-100/40 transition-all duration-700" />
      
      {/* ── Image Architecture ── */}
      <div className="relative mb-5 aspect-[4/3] w-full">
        <div className="absolute inset-0 rounded-[28px] bg-gray-50 overflow-hidden border border-gray-100 shadow-inner">
          {product.thumbnail?.url ? (
            <img
              src={product.thumbnail.url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-50">
              <Package size={48} className="text-gray-200" strokeWidth={1} />
            </div>
          )}
        </div>
        
        {/* Floating Intelligence */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.offerPercentage > 0 && (
            <div className="rounded-xl bg-red-500 px-3 py-1.5 text-[0.7rem] font-bold text-white shadow-lg shadow-red-500/20 uppercase tracking-tighter backdrop-blur-md">
              -{product.offerPercentage}%
            </div>
          )}
          {product.isVeg ? (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 border border-emerald-100 shadow-sm backdrop-blur-sm">
              <Leaf size={12} className="text-emerald-500 fill-emerald-500" />
            </div>
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/95 border border-red-100 shadow-sm backdrop-blur-sm">
              <div className="h-2 w-2 rounded-full bg-red-500" />
            </div>
          )}
        </div>
        
        <div className="absolute bottom-3 right-3">
           <Badge variant={product.isAvailable ? (product.stock > 0 ? 'green' : 'red') : 'slate'}>
              {product.isAvailable ? (product.stock > 0 ? 'In Stock' : 'Stock Out') : 'Hidden'}
           </Badge>
        </div>
      </div>

      {/* ── Content Narrative ── */}
      <div className="flex flex-1 flex-col justify-between relative z-10 px-1">
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.15em] text-emerald-600/80">
              {typeof product.category === 'object' ? product.category.name : 'Uncategorized'}
            </span>
            <div className="h-1 w-1 rounded-full bg-gray-200" />
            <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">
              #{product.productCode || product._id.slice(-4).toUpperCase()}
            </span>
          </div>
          
          <h3 className="text-[1.15rem] font-bold text-gray-900 line-clamp-1 leading-tight group-hover:text-emerald-700 transition-colors duration-300">
            {product.name}
          </h3>
          
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[1.4rem] font-bold text-gray-900 tracking-tight">₹{product.finalPrice}</span>
            {product.offerPercentage > 0 && (
              <span className="text-[0.85rem] font-bold text-gray-400 line-through decoration-gray-300">₹{product.price}</span>
            )}
          </div>
        </div>

        {/* ── Operations Toolbar ── */}
        <div className="mt-6 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(product._id);
            }}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gray-900 px-4 py-3.5 text-[0.8rem] font-bold text-white hover:bg-emerald-600 transition-all duration-300 active:scale-95 shadow-md shadow-gray-200 hover:shadow-emerald-500/20"
          >
            <Edit2 size={16} strokeWidth={3} />
            <span>Edit</span>
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleList(product._id, product.isAvailable);
            }}
            className={`flex h-[52px] w-[52px] items-center justify-center rounded-2xl border transition-all duration-300 active:scale-95 shadow-sm ${
              product.isAvailable
                ? 'border-gray-100 bg-white text-gray-400 hover:bg-red-50 hover:text-red-500 hover:border-red-100'
                : 'border-emerald-100 bg-emerald-500 text-white hover:bg-emerald-600'
            }`}
          >
            {product.isAvailable ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function ProductsPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const { products, loading, stats, statsLoading } = useAppSelector(
    (state: RootState) => state.products
  );
  const { categories } = useAppSelector((state: RootState) => state.category);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'unavailable' | 'outofstock'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAllProducts({}));
    dispatch(fetchProductStats());
    dispatch(fetchCategories());
  }, [dispatch]);

  // Filter products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'available') {
        result = result.filter((p) => p.isAvailable && p.stock > 0);
      } else if (statusFilter === 'unavailable') {
        result = result.filter((p) => !p.isAvailable);
      } else if (statusFilter === 'outofstock') {
        result = result.filter((p) => p.isAvailable && p.stock === 0);
      }
    }

    // Category filter
    if (categoryFilter) {
      result = result.filter((p) => 
        typeof p.category === 'object' ? p.category._id === categoryFilter : p.category === categoryFilter
      );
    }

    return result;
  }, [products, search, statusFilter, categoryFilter]);

  const handleToggleList = async (id: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    const result = await dispatch(toggleProductAvailability({ id, isAvailable: newStatus }));
    
    if (toggleProductAvailability.fulfilled.match(result)) {
      toast.success(
        newStatus 
          ? 'Product is now visible to customers' 
          : 'Product is now hidden from customers'
      );
      dispatch(fetchProductStats());
    } else {
      toast.error('Failed to update product status');
    }
  };

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #f3f4f6',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          },
        }}
      />

      <div className="space-y-10">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">Product Archive</h1>
            <p className="text-[0.95rem] font-medium text-gray-500 mt-1">
              Management and orchestration of the culinary inventory
            </p>
          </div>
          <button 
            onClick={() => router.push('/admin/products/create')}
            className="flex items-center justify-center gap-3 rounded-[22px] bg-emerald-500 px-8 py-4 text-[0.95rem] font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
          >
            <Plus size={20} strokeWidth={3} />
            Initialize Product
          </button>
        </motion.div>

        {/* Intelligence Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 lg:grid-cols-4">
          <StatCard label="Total Inventory" value={stats.total} icon={Package} color="emerald" loading={statsLoading} />
          <StatCard label="Active Status" value={stats.available} icon={CheckCircle} color="emerald" loading={statsLoading} />
          <StatCard label="Stock Depletion" value={stats.outOfStock} icon={XCircle} color="red" loading={statsLoading} />
          <StatCard label="Unlisted Items" value={stats.unlisted} icon={EyeOff} color="slate" loading={statsLoading} />
        </div>

        {/* Command Toolbar */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
          className="flex flex-col gap-4 lg:flex-row lg:items-center bg-white p-3 rounded-[32px] border border-gray-100 shadow-sm"
        >
          {/* Search Controller */}
          <div className="relative flex-1 group">
            <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
            <input
              type="text"
              placeholder="Query product database..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-14 rounded-[24px] border-none bg-gray-50 pl-14 pr-6 text-[0.95rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Status Selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
              className="w-full sm:w-auto h-14 px-6 rounded-[22px] border-none bg-gray-50 text-[0.9rem] font-bold text-gray-600 outline-none hover:bg-gray-100 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
            >
              <option value="all">All States</option>
              <option value="available">Available</option>
              <option value="unavailable">Unlisted</option>
              <option value="outofstock">Depleted</option>
            </select>

            {/* Category Selector */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full sm:w-auto h-14 px-6 rounded-[22px] border-none bg-gray-50 text-[0.9rem] font-bold text-gray-600 outline-none hover:bg-gray-100 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-[32px] border border-gray-100 bg-gray-50"
                />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex min-h-[400px] items-center justify-center rounded-[32px] border border-gray-100 bg-white shadow-sm">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center mb-5 border border-gray-100">
                  <Package size={40} className="text-gray-400" />
                </div>
                <p className="text-[1.2rem] font-bold text-gray-900 mb-1">
                  {search || statusFilter !== 'all' || categoryFilter
                    ? 'No products match filters'
                    : 'No products yet'}
                </p>
                <p className="text-[0.95rem] font-medium text-gray-500 mb-6">
                  {search || statusFilter !== 'all' || categoryFilter
                    ? 'Try adjusting your search or filters.'
                    : 'Get started by creating your first product.'}
                </p>
                {!search && statusFilter === 'all' && !categoryFilter && (
                  <Button onClick={() => router.push('/admin/products/create')}>
                    <Plus size={18} strokeWidth={2.5} />
                    Add Your First Product
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence>
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                    onView={(id) => router.push(`/admin/products/${id}`)}
                    onEdit={(id) => router.push(`/admin/products/${id}/edit`)}
                    onToggleList={handleToggleList}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>
    </>
  );
}
