'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  CreditCard,
  MapPin,
  Package,
  Printer,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronRight,
  Phone,
  Mail,
  Clock,
  Truck
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchOrderById, updateOrderStatus } from '@/store/slices/orderSlice';
import type { IOrder, OrderStatus } from '@/types/order';
import Badge from '@/components/ui/Badge';

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orderId = params.id as string;

  const { currentOrder, loading, updating } = useAppSelector((state: RootState) => state.orders);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('Pending');

  // Fetch order by ID
  useEffect(() => {
    dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  // Update selected status when order loads
  useEffect(() => {
    if (currentOrder) {
      setSelectedStatus(currentOrder.status);
    }
  }, [currentOrder]);

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  // Format time
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const safeBadgeVariant = (status: OrderStatus) => {
    switch(status) {
      case 'Pending': return 'amber';
      case 'Confirmed': return 'slate';
      case 'On the Way': return 'orange';
      case 'Delivered': return 'green';
      case 'Cancelled': return 'red';
      default: return 'slate';
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!currentOrder) return;
    
    try {
      const toastId = toast.loading('Updating order status...');
      await dispatch(updateOrderStatus({ orderId: currentOrder._id, status: newStatus })).unwrap();
      toast.success(`Status updated to ${newStatus}`, { id: toastId });
      
      if (newStatus === 'Delivered') {
        setTimeout(() => {
          router.push('/admin/orders/delivered');
        }, 1500);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handlePrint = () => {
    toast.success('Generating invoice...');
  };

  if (loading || !currentOrder) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 size={40} className="animate-spin text-emerald-500 mb-4" />
        <p className="text-gray-500 font-bold">Loading order details...</p>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      <div className="space-y-8 pb-20">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="h-12 w-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-gray-900 transition-all active:scale-95"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-[1.8rem] font-black text-gray-900 tracking-tight">Order #{currentOrder.orderId}</h1>
                <Badge variant={safeBadgeVariant(currentOrder.status)}>{currentOrder.status}</Badge>
              </div>
              <p className="text-[0.9rem] font-medium text-gray-500 mt-0.5">
                Placed on {formatDate(currentOrder.date)} at {formatTime(currentOrder.date)}
              </p>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 rounded-2xl border border-gray-100 bg-white px-6 py-3.5 text-[0.9rem] font-black text-gray-600 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
          >
            <Printer size={18} strokeWidth={2.5} />
            Print Invoice
          </button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Customer */}
          <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <User size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-[0.8rem] font-black uppercase tracking-widest text-gray-400">Customer</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-gray-100">
                <Image src={currentOrder.user.avatar} alt={currentOrder.user.name} fill className="object-cover" />
              </div>
              <div>
                <p className="text-[1.1rem] font-black text-gray-900 leading-tight">{currentOrder.user.name}</p>
                <p className="text-[0.85rem] font-bold text-gray-400 mt-0.5">{currentOrder.user.email}</p>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-50 space-y-3">
               <div className="flex items-center gap-3 text-[0.9rem] font-bold text-gray-600">
                  <Phone size={16} className="text-gray-400" />
                  {currentOrder.user.phone}
               </div>
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CreditCard size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-[0.8rem] font-black uppercase tracking-widest text-gray-400">Payment</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[0.75rem] font-black text-gray-400 uppercase tracking-widest mb-1">Method</p>
                <p className="text-[1rem] font-black text-gray-900">{currentOrder.paymentMethod}</p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <p className="text-[0.75rem] font-black text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-[1.8rem] font-black text-emerald-600 tracking-tight">₹{currentOrder.price.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <MapPin size={20} strokeWidth={2.5} />
              </div>
              <h3 className="text-[0.8rem] font-black uppercase tracking-widest text-gray-400">Shipping</h3>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[0.75rem] font-black text-gray-400 uppercase tracking-widest mb-1">Address</p>
                <p className="text-[0.95rem] font-black text-gray-900 leading-snug">{currentOrder.shippingAddress?.street}</p>
                <p className="text-[0.85rem] font-bold text-gray-400 mt-1">
                  {currentOrder.shippingAddress?.city}, {currentOrder.shippingAddress?.zipCode}
                </p>
              </div>
              {currentOrder.shippingAddress?.instructions && (
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-[0.75rem] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Instructions</p>
                  <p className="text-[0.9rem] font-bold text-gray-700 leading-relaxed bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
                    {currentOrder.shippingAddress.instructions}
                  </p>
                </div>
              )}
              {currentOrder.expectedDelivery && (
                <div className="pt-4 border-t border-gray-50 flex items-center gap-2">
                   <Clock size={16} className="text-orange-500" />
                   <p className="text-[0.9rem] font-black text-gray-600">Expected by {formatTime(currentOrder.expectedDelivery)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action and Items */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {/* Status Update */}
            <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                   <h3 className="text-[0.8rem] font-black uppercase tracking-widest text-gray-400">Order Status</h3>
                   <p className="text-[1.1rem] font-black text-gray-900 mt-1">Update current fulfillment stage</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <select
                    value={selectedStatus}
                    onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                    disabled={updating}
                    className="flex-1 sm:w-64 h-12 rounded-xl border border-gray-200 bg-gray-50 px-4 text-[0.95rem] font-bold text-gray-900 outline-none focus:bg-white focus:border-emerald-500 transition-all cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="On the Way">On the Way</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  {updating && <Loader2 size={24} className="animate-spin text-emerald-500" />}
                </div>
              </div>
            </div>

            {/* Items */}
            <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                 <div className="h-10 w-10 rounded-xl bg-gray-50 text-gray-400 flex items-center justify-center">
                   <Package size={20} strokeWidth={2.5} />
                 </div>
                 <h3 className="text-[0.8rem] font-black uppercase tracking-widest text-gray-400">Order Items</h3>
              </div>

              <div className="space-y-4">
                {currentOrder.items?.map((item) => (
                  <div key={item._id} className="flex items-center gap-5 p-4 rounded-2xl border border-gray-50 bg-gray-50/30">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-gray-100 bg-white">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-50">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[1rem] font-black text-gray-900 truncate">{item.name}</p>
                      <p className="text-[0.85rem] font-bold text-gray-400 mt-0.5">₹{item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[1.1rem] font-black text-gray-900">₹{item.subtotal.toLocaleString()}</p>
                    </div>
                  </div>
                ))}

                <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                   <p className="text-[1.1rem] font-black text-gray-900">Total Amount</p>
                   <p className="text-[2rem] font-black text-emerald-600 tracking-tight">₹{currentOrder.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* Customer Instructions (orderNote) */}
            {currentOrder.orderNote && (
              <div className="rounded-[32px] border border-blue-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Package size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[0.8rem] font-black uppercase tracking-widest text-gray-400">Customer Instructions</h3>
                </div>
                <p className="text-[0.95rem] font-bold text-gray-700 leading-relaxed bg-blue-50 rounded-xl px-5 py-4 border border-blue-100">
                  {currentOrder.orderNote}
                </p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm h-fit">
            <h3 className="text-[0.8rem] font-black uppercase tracking-widest text-gray-400 mb-8">History</h3>
            <div className="space-y-8 relative">
              <div className="absolute left-[13px] top-4 bottom-4 w-0.5 bg-gray-50 rounded-full" />
              {currentOrder.timeline?.map((step, i) => (
                <div key={i} className="relative flex gap-4">
                  <div className="relative z-10 mt-1">
                    {step.completed ? (
                      <div className="h-7 w-7 rounded-full bg-emerald-500 flex items-center justify-center text-white border-4 border-white shadow-sm">
                        <CheckCircle2 size={14} strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-white border-2 border-gray-200" />
                    )}
                  </div>
                  <div>
                    <p className={`text-[1rem] font-black ${step.completed ? 'text-gray-900' : 'text-gray-300'}`}>{step.status}</p>
                    {step.timestamp && (
                      <p className="text-[0.75rem] font-bold text-gray-400 mt-0.5">{formatDate(step.timestamp)} • {formatTime(step.timestamp)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
