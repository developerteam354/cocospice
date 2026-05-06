'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { 
  LayoutDashboard, Package, ShoppingCart, Users, 
  ArrowRight, TrendingUp, Clock, CheckCircle, Plus 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { fetchProductStats } from '@/store/slices/productSlice';
import { fetchOrderStats, fetchNewOrders } from '@/store/slices/orderSlice';
import { fetchUserStats } from '@/store/slices/userSlice';
import StatCard from '@/components/admin/products/StatCard';
import Badge from '@/components/ui/Badge';

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const admin = useAppSelector((state: RootState) => state.auth.admin);

  // Selectors
  const productStats = useAppSelector((state: RootState) => state.products.stats);
  const orderStats = useAppSelector((state: RootState) => state.orders.stats);
  const userStats = useAppSelector((state: RootState) => state.users.stats);
  const { newOrders, loading: ordersLoading } = useAppSelector((state: RootState) => state.orders);
  const { statsLoading: pLoading } = useAppSelector((state: RootState) => state.products);
  const { statsLoading: oLoading } = useAppSelector((state: RootState) => state.orders);
  const { statsLoading: uLoading } = useAppSelector((state: RootState) => state.users);

  const isLoading = pLoading || oLoading || uLoading;

  useEffect(() => {
    dispatch(fetchProductStats());
    dispatch(fetchOrderStats());
    dispatch(fetchUserStats());
    dispatch(fetchNewOrders());
  }, [dispatch]);

  const recentOrders = newOrders.slice(0, 5);

  return (
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

      {/* ── Intelligence Grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:grid-cols-4">
        <StatCard label="Total Inventory" value={productStats.total} icon={Package} color="emerald" loading={pLoading} />
        <StatCard label="Active Orders" value={orderStats.active} icon={ShoppingCart} color="amber" loading={oLoading} />
        <StatCard label="User Registry" value={userStats.total} icon={Users} color="blue" loading={uLoading} />
        <StatCard label="Completed" value={orderStats.delivered} icon={CheckCircle} color="indigo" loading={oLoading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* ── Recent Activity ── */}
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
                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/admin/orders/${order._id}`)}>
                      <td className="px-8 py-5">
                        <span className="font-mono text-[0.75rem] font-bold text-emerald-600">#{order.orderId}</span>
                        <p className="text-[0.8rem] font-bold text-gray-400 mt-0.5">₹{order.price}</p>
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

        {/* ── System Quick Actions ── */}
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
  );
}
