'use client';

import { Search } from 'lucide-react';
import type { IProductFilters, IProductCategory } from '@/types/product';

interface ProductFiltersProps {
  filters: IProductFilters;
  categories: IProductCategory[];
  onChange: (filters: Partial<IProductFilters>) => void;
}

const inputBaseClass = 
  'rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[0.9rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all shadow-sm';

export default function ProductFilters({ filters, categories, onChange }: ProductFiltersProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-[24px] border border-gray-100 bg-white p-4 shadow-sm">
      {/* Search */}
      <div className="relative flex-1 min-w-[280px]">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products by name..."
          value={filters.search ?? ''}
          onChange={(e) => onChange({ search: e.target.value })}
          className={`${inputBaseClass} w-full pl-11`}
        />
      </div>

      {/* Status */}
      <select
        value={filters.status ?? 'all'}
        onChange={(e) => onChange({ status: e.target.value as IProductFilters['status'] })}
        className={`${inputBaseClass} cursor-pointer appearance-none pr-10`}
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
      >
        <option value="all">All Status</option>
        <option value="available">Listed</option>
        <option value="unavailable">Unlisted</option>
        <option value="outofstock">Out of Stock</option>
      </select>

      {/* Category */}
      <select
        value={filters.category ?? ''}
        onChange={(e) => onChange({ category: e.target.value || undefined })}
        className={`${inputBaseClass} cursor-pointer appearance-none pr-10`}
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
      >
        <option value="">All Categories</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>{cat.name}</option>
        ))}
      </select>

      {/* Price range */}
      <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-2xl border border-gray-100">
        <input
          type="number"
          placeholder="Min £"
          value={filters.minPrice ?? ''}
          onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
          className="w-20 bg-transparent border-none p-2 text-[0.9rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none"
        />
        <span className="text-gray-300 font-bold">/</span>
        <input
          type="number"
          placeholder="Max £"
          value={filters.maxPrice ?? ''}
          onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
          className="w-20 bg-transparent border-none p-2 text-[0.9rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none"
        />
      </div>

      {/* Sort */}
      <select
        value={filters.sortBy ?? 'newest'}
        onChange={(e) => onChange({ sortBy: e.target.value as IProductFilters['sortBy'] })}
        className={`${inputBaseClass} cursor-pointer appearance-none pr-10`}
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%239ca3af\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat', backgroundSize: '16px' }}
      >
        <option value="newest">Newest First</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
      </select>
    </div>
  );
}
