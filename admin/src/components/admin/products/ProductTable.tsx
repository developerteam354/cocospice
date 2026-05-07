'use client';

import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { IProduct } from '@/types/product';

interface ProductTableProps {
  products: IProduct[];
  loading: boolean;
  onToggle: (id: string, current: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

function StockBadge({ stock, isAvailable }: { stock: number; isAvailable: boolean }) {
  if (!isAvailable) return <Badge variant="slate">Unlisted</Badge>;
  if (stock === 0) return <Badge variant="red">Sold Out</Badge>;
  if (stock <= 5) return <Badge variant="orange">Low Stock</Badge>;
  return <Badge variant="green">In Stock</Badge>;
}

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.03, duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
  exit: { opacity: 0, x: -10, transition: { duration: 0.2 } },
};

export default function ProductTable({ products, loading, onToggle, onDelete, onEdit }: ProductTableProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[80px] animate-pulse rounded-[24px] bg-gray-50 border border-gray-100/50" />
        ))}
      </div>
    );
  }
  //
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 rounded-[32px] border border-dashed border-gray-200 bg-gray-50/30">
        <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-5 border border-gray-100 shadow-sm">
          <Eye size={40} className="text-gray-200" />
        </div>
        <p className="text-[1.1rem] font-bold text-gray-900">No products found</p>
        <p className="text-[0.9rem] font-medium text-gray-500 mt-1">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-50 bg-gray-50/30">
              <th className="px-8 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Product Info</th>
              <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Category</th>
              <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Pricing</th>
              <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 text-center">Inventory</th>
              <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 text-center">Status</th>
              <th className="px-8 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <AnimatePresence mode="popLayout">
              {products.map((product, i) => (
                <motion.tr
                  key={product._id}
                  custom={i}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="group hover:bg-emerald-50/30 transition-colors duration-300"
                >
                  {/* Thumbnail + Name */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-[18px] border border-gray-200 bg-gray-50 shadow-sm group-hover:shadow-md transition-shadow">
                        <Image
                          src={product.thumbnail.url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="56px"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 truncate leading-tight group-hover:text-emerald-700 transition-colors">{product.name}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {product.isVeg ? (
                            <span className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-widest text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Veg
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-widest text-red-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Non-Veg
                            </span>
                          )}
                          <span className="text-[0.65rem] font-bold text-gray-300">ID: {product.productCode || product._id.slice(-6).toUpperCase()}</span>
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="px-6 py-5">
                    <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-[0.75rem] font-bold text-gray-500 uppercase tracking-wider">
                      {product.category?.name ?? 'Standard'}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-[1.1rem] font-bold text-gray-900">
                        ₹{product.finalPrice.toFixed(2)}
                      </span>
                      {product.offerPercentage > 0 && (
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[0.75rem] font-bold text-gray-400 line-through">
                            ₹{product.price.toFixed(2)}
                          </span>
                          <span className="text-[0.7rem] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md">
                            -{product.offerPercentage}%
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Stock count */}
                  <td className="px-6 py-5 text-center">
                    <span className="text-[1.1rem] font-bold text-gray-900">{product.stock}</span>
                    <p className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest">Units</p>
                  </td>

                  {/* Status badge */}
                  <td className="px-6 py-5 text-center">
                    <StockBadge stock={product.stock} isAvailable={product.isAvailable} />
                  </td>

                  {/* Actions */}
                  <td className="px-8 py-5">
                    <div className="flex items-center justify-end gap-2.5">
                      <button
                        onClick={() => onToggle(product._id, product.isAvailable)}
                        title={product.isAvailable ? 'Hide product' : 'Show product'}
                        className={`rounded-[14px] p-2.5 transition-all active:scale-95 border ${product.isAvailable
                            ? 'bg-white text-gray-400 border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100'
                            : 'bg-emerald-500 text-white border-emerald-400 hover:bg-emerald-600 shadow-sm'
                          }`}
                      >
                        {product.isAvailable ? <EyeOff size={18} strokeWidth={2.5} /> : <Eye size={18} strokeWidth={2.5} />}
                      </button>
                      <button
                        onClick={() => onEdit(product._id)}
                        title="Edit product"
                        className="rounded-[14px] p-2.5 bg-white text-gray-400 border border-gray-100 hover:bg-gray-50 hover:text-gray-900 transition-all active:scale-95 shadow-sm"
                      >
                        <Pencil size={18} strokeWidth={2.5} />
                      </button>
                      <button
                        onClick={() => onDelete(product._id)}
                        title="Delete product"
                        className="rounded-[14px] p-2.5 bg-white text-gray-400 border border-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all active:scale-95 shadow-sm"
                      >
                        <Trash2 size={18} strokeWidth={2.5} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
  );
}
