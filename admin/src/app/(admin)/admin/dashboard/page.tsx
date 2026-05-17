'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  ArrowRight, TrendingUp, Clock, CheckCircle, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchProductStats } from '@/store/slices/productSlice';
import { fetchOrderStats, fetchNewOrders } from '@/store/slices/orderSlice';
import { fetchUserStats } from '@/store/slices/userSlice';
import { fetchShopStatus, setShopStatus } from '@/store/slices/settingsSlice';
import StatCard from '@/components/admin/products/StatCard';
import Badge from '@/components/ui/Badge';

// ─── Close-reason confirmation modal ─────────────────────────────────────────

interface CloseShopModalProps {
  onConfirm: (reason: string) => void;
  onCancel:  () => void;
  saving:    boolean;
}

function CloseShopModal({ onConfirm, onCancel, saving }: CloseShopModalProps) {
  const [reason, setReason] = useState('');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
        />
        <motion.div
          className="relative w-full max-w-md bg-white rounded-[28px] shadow-[0_24px_80px_rgba(0,0,0,0.2)] overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={{   opacity: 0, scale: 0.95, y: 16  }}
          transition={{ type: 'spring', damping: 26, stiffness: 260 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-4 p-6 border-b border-gray-100">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center shrink-0 text-2xl">
              🔒
            </div>
            <div>
              <h2 className="text-[1.1rem] font-bold text-gray-900 leading-tight">Close the Shop?</h2>
              <p className="text-[0.82rem] text-gray-500 font-medium mt-0.5">
                Customers will not be able to place orders while the shop is closed.
              </p>
            </div>
          </div>
          {/* Body */}
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-[0.78rem] font-bold text-gray-500 uppercase tracking-widest mb-2">
                Closing Reason <span className="text-gray-400 normal-case font-medium">(optional)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Emergency maintenance, Sold out for today…"
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-[0.9rem] text-gray-800 font-medium placeholder:text-gray-400 focus:outline-none focus:border-red-300 focus:bg-white resize-none transition-colors"
              />
              <p className="text-[0.75rem] text-gray-400 mt-1.5 font-medium">
                This message will be shown to customers on the ordering page.
              </p>
            </div>
          </div>
          {/* Actions */}
          <div className="flex gap-3 px-6 pb-6">
            <button
              onClick={onCancel}
              disabled={saving}
              className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-bold text-[0.9rem] hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={() => onConfirm(reason.trim())}
              disabled={saving}
              className="flex-1 py-3 rounded-2xl bg-red-500 text-white font-bold text-[0.9rem] hover:bg-red-600 transition-colors shadow-lg shadow-red-500/25 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {saving
                ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                : '🔒'
              }
              {saving ? 'Closing…' : 'Close Shop'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ─── Main Dashboard Page ──────────────────────────────────────────────────────

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const admin = useAppSelector((state: RootState) => state.auth.admin);

  const productStats = useAppSelector((state: RootState) => state.products.stats);
  const orderStats   = useAppSelector((state: RootState) => state.orders.stats);
  const userStats    = useAppSelector((state: RootState) => state.users.stats);
  const { newOrders, loading: ordersLoading } = useAppSelector((state: RootState) => state.orders);
  const { statsLoading: pLoading } = useAppSelector((state: RootState) => state.products);
  const { statsLoading: oLoading } = useAppSelector((state: RootState) => state.orders);
  const { statsLoading: uLoading } = useAppSelector((state: RootState) => state.users);
  const { shopStatus, saving: shopSaving } = useAppSelector((state: RootState) => state.settings);

  const [showCloseModal, setShowCloseModal] = useState(false);

  useEffect(() => {
    dispatch(fetchProductStats());
    dispatch(fetchOrderStats());
    dispatch(fetchUserStats());
    dispatch(fetchNewOrders());
    dispatch(fetchShopStatus());
  }, [dispatch]);

  const recentOrders = newOrders.slice(0, 5);

  const handleToggle = () => {
    if (shopStatus?.isOpen) {
      setShowCloseModal(true);
    } else {
      dispatch(setShopStatus({ isOpen: true, closingReason: '' }));
    }
  };

  const handleConfirmClose = (reason: string) => {
    dispatch(setShopStatus({ isOpen: false, closingReason: reason }))
      .unwrap()
      .then(() => setShowCloseModal(false))
      .catch(() => setShowCloseModal(false));
  };

  return (
    <>
      {showCloseModal && (
        <CloseShopModal
          onConfirm={handleConfirmClose}
          onCancel={() => setShowCloseModal(false)}
          saving={shopSaving}
        />
      )}

      <div className="w-full space-y-10">
        {/* ── Page Header ── */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight leading-tight">
              Greetings{admin?.fullName ? `, ${admin.fullName.split(' ')[0]}` : ''}
            </h1>
            <p className="text-[1rem] font-medium text-gray-500 mt-1">
              Real-time analytics and orchestration for <span className="font-bold text-emerald-600">Cocospice Admin</span>
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white p-2 rounded-[24px] border border-gray-100 shadow-sm">
            <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <TrendingUp size={20} strokeWidth={3} />
            </div>
            <div className="pr-4">
              <p className="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400">System Status</p>
              <p className="text-[0.85rem] font-bold text-emerald-600">All Nodes Operational</p>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:grid-cols-4">
          <StatCard label="Total Inventory" value={productStats.total}    icon={Package}      color="emerald" loading={pLoading} />
          <StatCard label="Active Orders"   value={orderStats.active}     icon={ShoppingCart} color="amber"   loading={oLoading} />
          <StatCard label="User Registry"   value={userStats.total}       icon={Users}        color="blue"    loading={uLoading} />
          <StatCard label="Completed"       value={orderStats.delivered}  icon={CheckCircle}  color="indigo"  loading={oLoading} />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* ── Recent Orders ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="xl:col-span-2 rounded-[40px] border border-gray-100 bg-white shadow-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-8 border-b border-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-900 flex items-center justify-center text-white">
                  <Clock size={20} strokeWidth={2.5} />
                </div>
                <h2 className="text-[1.2rem] font-bold text-gray-900 tracking-tight">Recent Orders</h2>
              </div>
              <button
                onClick={() => router.push('/admin/orders/new')}
                className="flex items-center gap-2 text-[0.85rem] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View Archive <ArrowRight size={16} strokeWidth={3} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="px-8 py-4 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Order Context</th>
                    <th className="px-6 py-4 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Customer</th>
                    <th className="px-6 py-4 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {ordersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}><td colSpan={3} className="px-8 py-5"><div className="h-12 animate-pulse rounded-2xl bg-gray-50" /></td></tr>
                    ))
                  ) : recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-20 text-center text-gray-400 font-bold">No recent activity detected</td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50/50 transition-colors cursor-pointer"
                        onClick={() => router.push(`/admin/orders/${order._id}`)}
                      >
                        <td className="px-8 py-5">
                          <span className="font-mono text-[0.75rem] font-bold text-emerald-600">#{order.orderId}</span>
                          <p className="text-[0.8rem] font-bold text-gray-400 mt-0.5">£{order.price}</p>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-[0.9rem] font-bold text-gray-900">{order.user.name}</p>
                          <p className="text-[0.75rem] font-medium text-gray-400">{new Date(order.date).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <Badge variant={order.status === 'Pending' ? 'amber' : 'green'}>{order.status}</Badge>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* ── Global Ops ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="rounded-[40px] border border-gray-100 bg-white p-8 shadow-sm space-y-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                <LayoutDashboard size={20} strokeWidth={2.5} />
              </div>
              <h2 className="text-[1rem] font-bold text-gray-900 uppercase tracking-widest">Global Ops</h2>
            </div>

            <div className="space-y-4">
              {/* ── Shop Open/Closed Toggle ── */}
              <div className={`w-full flex items-center justify-between p-5 rounded-[24px] border-2 transition-all duration-300 ${
                shopStatus?.isOpen
                  ? 'bg-emerald-50 border-emerald-200'
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    shopStatus?.isOpen ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {shopStatus?.isOpen ? '🟢' : '🔴'}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-[0.85rem] font-bold ${shopStatus?.isOpen ? 'text-emerald-800' : 'text-red-800'}`}>
                      Shop is {shopStatus === null ? '…' : shopStatus.isOpen ? 'Open' : 'Closed'}
                    </p>
                    {!shopStatus?.isOpen && shopStatus?.closingReason && (
                      <p className="text-[0.72rem] text-red-500 font-medium mt-0.5 truncate" title={shopStatus.closingReason}>
                        {shopStatus.closingReason}
                      </p>
                    )}
                  </div>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={handleToggle}
                  disabled={shopSaving || shopStatus === null}
                  aria-label={shopStatus?.isOpen ? 'Close shop' : 'Open shop'}
                  className={`relative w-14 h-7 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed ${
                    shopStatus?.isOpen
                      ? 'bg-emerald-500 focus:ring-emerald-400'
                      : 'bg-red-400 focus:ring-red-300'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-300 flex items-center justify-center ${
                    shopStatus?.isOpen ? 'translate-x-7' : 'translate-x-0'
                  }`}>
                    {shopSaving && (
                      <span className="w-3 h-3 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                    )}
                  </span>
                </button>
              </div>

              <button
                onClick={() => router.push('/admin/products/create')}
                className="w-full flex items-center justify-between p-5 rounded-[24px] bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
              >
                <span className="font-bold">Add New Product</span>
                <Plus size={20} strokeWidth={3} />
              </button>

              <button
                onClick={() => router.push('/admin/category')}
                className="w-full flex items-center justify-between p-5 rounded-[24px] bg-gray-900 text-white shadow-lg shadow-gray-900/20 hover:bg-black transition-all active:scale-95"
              >
                <span className="font-bold">Manage Categories</span>
                <Plus size={20} strokeWidth={3} />
              </button>

              <div className="pt-6 border-t border-gray-100">
                <p className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-widest mb-4">Quick Stats</p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[1.2rem] font-bold text-gray-900 leading-none">{orderStats.pending}</p>
                    <p className="text-[0.65rem] font-bold text-gray-400 mt-1 uppercase">Pending</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl">
                    <p className="text-[1.2rem] font-bold text-gray-900 leading-none">{productStats.outOfStock}</p>
                    <p className="text-[0.65rem] font-bold text-gray-400 mt-1 uppercase">Out Stock</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
