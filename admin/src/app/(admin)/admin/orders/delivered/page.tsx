'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Eye, Package, Clock } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchDeliveredOrders } from '@/store/slices/orderSlice';
import Badge from '@/components/ui/Badge';

// ─── Row Animation Variants ───────────────────────────────────────────────────

const rowVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.03, duration: 0.3 },
  }),
  exit: { opacity: 0, x: -16, transition: { duration: 0.2 } },
};

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function DeliveredOrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { deliveredOrders, deliveredLoading } = useAppSelector((state: RootState) => state.orders);

  const [search, setSearch] = useState('');

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchDeliveredOrders());
  }, [dispatch]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = [...deliveredOrders];

    // Filter by search
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (order) =>
          order.user.name.toLowerCase().includes(q) ||
          order.orderId.toLowerCase().includes(q) ||
          order.user.email.toLowerCase().includes(q)
      );
    }

    return result;
  }, [deliveredOrders, search]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl sm:text-[2.2rem] font-bold text-gray-900 tracking-tight leading-tight">Order Archive</h1>
          <p className="text-[0.95rem] font-medium text-gray-500 mt-1">
            Historical records of completed and fulfilled restaurant transactions
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/orders/new')}
          className="flex items-center justify-center gap-2 rounded-2xl bg-white border border-gray-100 px-6 py-4 text-[0.9rem] font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
        >
          <Clock size={20} strokeWidth={2.5} className="text-gray-400" />
          Active Orders
        </button>
      </motion.div>

      {/* ── Toolbar ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="bg-white p-3 rounded-[28px] border border-gray-100 shadow-sm"
      >
        <div className="relative w-full">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search archive by Order ID or customer details..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 rounded-[22px] border-none bg-gray-50 pl-14 pr-6 text-[0.95rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
        </div>
      </motion.div>

      {/* ── Delivered Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30">
                <th className="px-8 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Order ID</th>
                <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Recipient</th>
                <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 hidden md:table-cell">Fulfilled On</th>
                <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Settlement</th>
                <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Method</th>
                <th className="px-8 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 text-right">Review</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {deliveredLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-8 py-5"><div className="h-16 animate-pulse rounded-2xl bg-gray-50" /></td></tr>
                ))
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-20 h-20 bg-gray-50 rounded-[24px] flex items-center justify-center mb-5 border border-gray-100">
                        <Package size={40} className="text-gray-200" />
                      </div>
                      <p className="text-[1.1rem] font-bold text-gray-900">No archived records</p>
                      <p className="text-[0.9rem] font-medium text-gray-500 mt-1">Completed orders will appear here</p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((order, i) => (
                    <motion.tr
                      key={order._id} custom={i} variants={rowVariants} initial="hidden" animate="visible" exit="exit"
                      className="group hover:bg-gray-50/50 transition-colors"
                    >
                      {/* ID */}
                      <td className="px-8 py-5">
                        <span className="font-mono text-[0.75rem] font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md group-hover:text-emerald-600 group-hover:bg-emerald-50 transition-colors">
                          #{order.orderId}
                        </span>
                      </td>

                      {/* Recipient */}
                      <td className="px-6 py-5">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 leading-tight truncate">{order.user.name}</p>
                          <p className="text-[0.85rem] font-bold text-gray-400 truncate mt-1">{order.user.email}</p>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="hidden px-6 py-5 md:table-cell">
                        <p className="text-[0.9rem] font-bold text-gray-500">{formatDate(order.updatedAt || order.date)}</p>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-5">
                        <p className="text-[1.1rem] font-bold text-emerald-600">₹{order.price.toFixed(2)}</p>
                      </td>

                      {/* Method */}
                      <td className="px-6 py-5">
                        <Badge variant={order.paymentMethod === 'Cash on Delivery' ? 'amber' : 'slate'}>
                          {order.paymentMethod}
                        </Badge>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-5 text-right">
                        <button
                          onClick={() => router.push(`/admin/orders/${order._id}`)}
                          className="rounded-[14px] p-3 text-gray-400 hover:bg-white hover:text-emerald-600 transition-all active:scale-95 border border-transparent hover:border-gray-100 hover:shadow-sm"
                        >
                          <Eye size={20} strokeWidth={2.5} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
