'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Search, Eye, CheckCircle, XCircle, Truck, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchNewOrders, updateOrderStatus, fetchOrderStats } from '@/store/slices/orderSlice';
import type { IOrder, OrderStatus } from '@/types/order';
import Badge from '@/components/ui/Badge';
import CancellationModal from '@/components/admin/CancellationModal';

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

export default function NewOrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { newOrders, loading, updating } = useAppSelector((state: RootState) => state.orders);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [selectedOrderForCancellation, setSelectedOrderForCancellation] = useState<{ id: string; orderId: string } | null>(null);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchNewOrders());
    dispatch(fetchOrderStats());
  }, [dispatch]);

  // Filter orders
  const filteredOrders = useMemo(() => {
    let result = [...newOrders];

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

    // Filter by status
    if (statusFilter !== 'All') {
      result = result.filter((order) => order.status === statusFilter);
    }

    return result;
  }, [newOrders, search, statusFilter]);

  // Handle status update
  const handleStatusUpdate = async (orderId: string, status: OrderStatus, orderNumber?: string) => {
    // If status is Cancelled, show modal instead
    if (status === 'Cancelled') {
      setSelectedOrderForCancellation({ id: orderId, orderId: orderNumber || orderId });
      setShowCancellationModal(true);
      return;
    }

    try {
      await dispatch(updateOrderStatus({ orderId, status })).unwrap();
      toast.success(`Order status updated to ${status}`);
      dispatch(fetchOrderStats());
      if (status === 'Delivered' || status === 'Collected') {
        dispatch(fetchNewOrders());
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  // Handle cancellation with reason
  const handleCancellation = async (reason: string) => {
    if (!selectedOrderForCancellation) return;
    
    try {
      await dispatch(updateOrderStatus({ 
        orderId: selectedOrderForCancellation.id, 
        status: 'Cancelled',
        cancellationReason: reason 
      })).unwrap();
      toast.success('Order cancelled successfully');
      setShowCancellationModal(false);
      setSelectedOrderForCancellation(null);
      dispatch(fetchOrderStats());
      dispatch(fetchNewOrders());
    } catch (error) {
      toast.error('Failed to cancel order');
    }
  };

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

  const safeBadgeVariant = (status: OrderStatus) => {
    switch(status) {
      case 'Pending': return 'amber';
      case 'Confirmed': return 'slate';
      case 'On the Way': return 'orange';
      case 'Ready for Collection': return 'orange';
      case 'Delivered': return 'green';
      case 'Collected': return 'green';
      case 'Cancelled': return 'red';
      default: return 'slate';
    }
  };

  return (
    <>
      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={showCancellationModal}
        onClose={() => {
          setShowCancellationModal(false);
          setSelectedOrderForCancellation(null);
        }}
        onConfirm={handleCancellation}
        orderNumber={selectedOrderForCancellation?.orderId || ''}
        isLoading={updating}
      />

      <div className="space-y-8">
      {/* ── Page Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl sm:text-[2.2rem] font-bold text-gray-900 tracking-tight leading-tight">Incoming Orders</h1>
          <p className="text-[0.95rem] font-medium text-gray-500 mt-1">
            Real-time management of your restaurant's active transactions
          </p>
        </div>
        <button
          onClick={() => router.push('/admin/orders/delivered')}
          className="group flex items-center justify-center gap-2 rounded-2xl bg-white border border-gray-100 px-6 py-4 text-[0.9rem] font-bold text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-100 transition-all shadow-sm active:scale-95"
        >
          <Package size={20} strokeWidth={2.5} className="text-gray-400 group-hover:text-emerald-500 transition-colors" />
          Archive & Delivered
        </button>
      </motion.div>

      {/* ── Stat Overview ── */}
      <motion.div
         initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
         className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
         {[
           { label: 'Active', value: newOrders.length, color: 'bg-amber-500', iconColor: 'text-white', icon: Clock },
           { label: 'Pending', value: newOrders.filter(o => o.status === 'Pending').length, color: 'bg-red-500', iconColor: 'text-white', icon: Package },
           { label: 'Revenue', value: `₹${newOrders.reduce((acc, o) => acc + o.price, 0).toFixed(0)}`, color: 'bg-emerald-500', iconColor: 'text-white', icon: CheckCircle },
           { label: 'Capacity', value: '84%', color: 'bg-blue-600', iconColor: 'text-white', icon: Truck },
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm transition-all hover:shadow-md">
             <div className="flex items-center gap-5">
                <div className={`h-14 w-14 rounded-2xl flex items-center justify-center ${stat.color} ${stat.iconColor} shadow-lg shadow-${stat.color.split('-')[1]}-500/20`}>
                   <stat.icon size={24} strokeWidth={2.5} />
                </div>
                <div>
                   <p className="text-[1.8rem] font-bold text-gray-900 leading-none">{stat.value}</p>
                   <p className="text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 mt-1.5">{stat.label}</p>
                </div>
             </div>
           </div>
         ))}
      </motion.div>

      {/* ── Toolbar ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row items-center gap-4 bg-white p-3 rounded-[28px] border border-gray-100 shadow-sm"
      >
        <div className="relative flex-1 w-full">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by order ID, customer name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-14 rounded-[22px] border-none bg-gray-50 pl-14 pr-6 text-[0.95rem] font-bold text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
          />
        </div>

        <div className="flex bg-gray-100/50 p-1.5 rounded-[22px] gap-1 shrink-0 overflow-x-auto max-w-full">
          {(['All', 'Pending', 'Confirmed', 'On the Way', 'Ready for Collection'] as const).map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-[18px] px-6 py-3 text-[0.8rem] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                statusFilter === f
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ── Orders Table ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-sm"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50/30">
                <th className="px-8 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Order Context</th>
                <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Customer Details</th>
                <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 hidden lg:table-cell">Temporal</th>
                <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Transaction</th>
                <th className="px-6 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400">Status</th>
                <th className="px-8 py-5 text-[0.7rem] font-bold uppercase tracking-widest text-gray-400 text-right">Fulfillment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
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
                      <p className="text-[1.1rem] font-bold text-gray-900">No active orders found</p>
                      <p className="text-[0.9rem] font-medium text-gray-500 mt-1">Ready and waiting for new business</p>
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
                      {/* Order Context */}
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-[14px] bg-gray-50 border border-gray-100 flex items-center justify-center shadow-sm group-hover:bg-white transition-colors">
                            <Clock size={20} className="text-gray-400" />
                          </div>
                          <div>
                            <span className="font-mono text-[0.75rem] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                              #{order.orderId}
                            </span>
                            <p className="text-[0.65rem] font-bold text-gray-400 mt-1 uppercase tracking-wider">Reference ID</p>
                          </div>
                        </div>
                      </td>

                      {/* Customer Details */}
                      <td className="px-6 py-5">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 leading-tight truncate">{order.user.name}</p>
                          <p className="text-[0.85rem] font-bold text-gray-400 truncate mt-1">{order.user.email}</p>
                        </div>
                      </td>

                      {/* Temporal */}
                      <td className="hidden px-6 py-5 lg:table-cell">
                        <p className="text-[0.9rem] font-bold text-gray-500">{formatDate(order.date)}</p>
                        <p className="text-[0.65rem] font-bold text-gray-300 uppercase mt-1 tracking-tighter">Order Timestamp</p>
                      </td>

                      {/* Transaction */}
                      <td className="px-6 py-5">
                        <p className="text-[1.1rem] font-bold text-gray-900">₹{order.price.toFixed(2)}</p>
                        <p className="text-[0.65rem] font-bold text-emerald-600/70 uppercase tracking-widest mt-1">Total Paid</p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5">
                        <Badge variant={safeBadgeVariant(order.status)}>
                          {order.status}
                        </Badge>
                      </td>

                      {/* Fulfillment Operations */}
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-2.5">
                          {/* View Detail */}
                          <button
                            onClick={() => router.push(`/admin/orders/${order._id}`)}
                            className="rounded-[14px] p-3 text-gray-400 hover:bg-gray-100 hover:text-gray-900 transition-all active:scale-95 border border-gray-100/50 shadow-sm"
                          >
                            <Eye size={18} strokeWidth={2.5} />
                          </button>

                          {/* Dynamic Workflow Controls */}
                          {order.status === 'Pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleStatusUpdate(order._id, 'Confirmed')}
                                disabled={updating}
                                className="rounded-[14px] p-3 bg-emerald-500 text-white hover:bg-emerald-600 transition-all active:scale-95 shadow-sm shadow-emerald-500/20"
                              >
                                <CheckCircle size={18} strokeWidth={2.5} />
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(order._id, 'Cancelled', order.orderId)}
                                disabled={updating}
                                className="rounded-[14px] p-3 bg-white text-red-400 border border-gray-100 hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-all active:scale-95 shadow-sm"
                              >
                                <XCircle size={18} strokeWidth={2.5} />
                              </button>
                            </div>
                          )}

                          {order.status === 'Confirmed' && order.orderType === 'delivery' && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'On the Way')}
                              disabled={updating}
                              className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-[0.8rem] font-bold text-white hover:bg-emerald-600 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
                            >
                              <Truck size={18} strokeWidth={2.5} />
                              <span>Dispatch</span>
                            </button>
                          )}

                          {order.status === 'Confirmed' && order.orderType === 'collection' && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'Ready for Collection')}
                              disabled={updating}
                              className="flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 text-[0.8rem] font-bold text-white hover:bg-emerald-600 transition-all active:scale-95 shadow-md shadow-emerald-500/20"
                            >
                              <Package size={18} strokeWidth={2.5} />
                              <span>Mark Ready</span>
                            </button>
                          )}

                          {order.status === 'On the Way' && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'Delivered')}
                              disabled={updating}
                              className="flex items-center gap-2 rounded-2xl bg-white border border-gray-100 px-5 py-3 text-[0.8rem] font-bold text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all active:scale-95 shadow-sm"
                            >
                              <CheckCircle size={18} strokeWidth={2.5} />
                              <span>Complete</span>
                            </button>
                          )}

                          {order.status === 'Ready for Collection' && (
                            <button
                              onClick={() => handleStatusUpdate(order._id, 'Collected')}
                              disabled={updating}
                              className="flex items-center gap-2 rounded-2xl bg-white border border-gray-100 px-5 py-3 text-[0.8rem] font-bold text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100 transition-all active:scale-95 shadow-sm"
                            >
                              <CheckCircle size={18} strokeWidth={2.5} />
                              <span>Mark Collected</span>
                            </button>
                          )}
                        </div>
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
    </>
  );
}
