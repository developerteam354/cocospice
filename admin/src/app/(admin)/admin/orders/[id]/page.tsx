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
import CancellationModal from '@/components/admin/CancellationModal';
import { toProxyUrl } from '@/services/productService'; // ✅ Import toProxyUrl

export default function OrderDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const orderId = params.id as string;

  const { currentOrder, loading, updating } = useAppSelector((state: RootState) => state.orders);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('Pending');
  const [showCancellationModal, setShowCancellationModal] = useState(false);

  // Fetch order by ID
  useEffect(() => {
    dispatch(fetchOrderById(orderId));
  }, [dispatch, orderId]);

  // Debug: Log the order data to see what we're getting
  useEffect(() => {
    if (currentOrder) {
      console.log('📦 Order Data:', {
        orderId: currentOrder.orderId,
        orderType: currentOrder.orderType,
        shippingAddress: currentOrder.shippingAddress,
        user: currentOrder.user,
      });
      console.log('📞 Phone Numbers:', {
        'shippingAddress.phone': currentOrder.shippingAddress?.phone,
        'user.phone': currentOrder.user?.phone,
      });
    }
  }, [currentOrder]);

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
      case 'Pending':               return 'amber';
      case 'Confirmed':             return 'slate';
      case 'On the Way':            return 'orange';
      case 'Ready for Collection':  return 'orange';
      case 'Delivered':             return 'green';
      case 'Collected':             return 'green';
      case 'Cancelled':             return 'red';
      default:                      return 'slate';
    }
  };

  // Handle status change
  const handleStatusChange = async (newStatus: OrderStatus) => {
    if (!currentOrder) return;
    
    // If status is Cancelled, show modal instead of updating directly
    if (newStatus === 'Cancelled') {
      setShowCancellationModal(true);
      setSelectedStatus(currentOrder.status); // Reset dropdown to current status
      return;
    }
    
    try {
      const toastId = toast.loading('Updating order status...');
      await dispatch(updateOrderStatus({ orderId: currentOrder._id, status: newStatus })).unwrap();
      toast.success(`Status updated to ${newStatus}`, { id: toastId });
      
      if (newStatus === 'Delivered' || newStatus === 'Collected') {
        setTimeout(() => {
          router.push('/admin/orders/delivered');
        }, 1500);
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Handle cancellation with reason
  const handleCancellation = async (reason: string) => {
    if (!currentOrder) return;
    
    try {
      const toastId = toast.loading('Cancelling order...');
      await dispatch(updateOrderStatus({ 
        orderId: currentOrder._id, 
        status: 'Cancelled',
        cancellationReason: reason 
      })).unwrap();
      toast.success('Order cancelled successfully', { id: toastId });
      setShowCancellationModal(false);
    } catch (error) {
      toast.error('Failed to cancel order');
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
      
      {/* Cancellation Modal */}
      <CancellationModal
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
        onConfirm={handleCancellation}
        orderNumber={currentOrder?.orderId || ''}
        isLoading={updating}
      />

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
                <h1 className="text-2xl sm:text-[1.8rem] font-bold text-gray-900 tracking-tight">Order #{currentOrder.orderId}</h1>
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
              <h3 className="text-[0.8rem] font-bold uppercase tracking-widest text-gray-400">Customer</h3>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 rounded-2xl overflow-hidden border border-gray-100 bg-gradient-to-br from-blue-400 to-blue-600">
                {currentOrder.user.avatar && !currentOrder.user.avatar.includes('ui-avatars.com') ? (
                  <img
                    src={toProxyUrl(currentOrder.user.avatar)}
                    alt={currentOrder.user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback to letter avatar if image fails to load
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `<div style="width:100%;height:100%;display:flex;align-items:center;justify-center;color:white;font-size:1.2rem;font-weight:900">${currentOrder.user.name.charAt(0).toUpperCase()}</div>`;
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-[1.2rem] font-black">
                    {currentOrder.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <p className="text-[1.1rem] font-bold text-gray-900 leading-tight">{currentOrder.user.name}</p>
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
                <p className="text-[0.75rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Method</p>
                <p className="text-[1rem] font-bold text-gray-900">{currentOrder.paymentMethod}</p>
              </div>
              <div className="pt-4 border-t border-gray-50">
                <p className="text-[0.75rem] font-bold text-gray-400 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-[1.8rem] font-bold text-emerald-600 tracking-tight">£{currentOrder.price.toLocaleString()}</p>
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
              {/* Customer Name */}
              <div>
                <p className="text-[0.75rem] font-black text-gray-400 uppercase tracking-widest mb-1">Customer Name</p>
                <p className="text-[0.95rem] font-black text-gray-900 leading-snug">{currentOrder.shippingAddress?.fullName}</p>
              </div>
              
              {/* Address Line 1 */}
              <div>
                <p className="text-[0.75rem] font-black text-gray-400 uppercase tracking-widest mb-1">Address Line 1</p>
                <p className="text-[0.95rem] font-black text-gray-900 leading-snug">
                  {currentOrder.shippingAddress?.line1}
                </p>
              </div>
              
              {/* Address Line 2 (if exists) */}
              {currentOrder.shippingAddress?.line2 && (
                <div>
                  <p className="text-[0.75rem] font-black text-gray-400 uppercase tracking-widest mb-1">Address Line 2</p>
                  <p className="text-[0.95rem] font-black text-gray-900 leading-snug">
                    {currentOrder.shippingAddress.line2}
                  </p>
                </div>
              )}
              
              {/* City */}
              <div>
                <p className="text-[0.75rem] font-black text-gray-400 uppercase tracking-widest mb-1">City</p>
                <p className="text-[0.95rem] font-black text-gray-900 leading-snug">
                  {currentOrder.shippingAddress?.city}
                </p>
              </div>
              
              {/* Postcode */}
              <div>
                <p className="text-[0.75rem] font-black text-gray-400 uppercase tracking-widest mb-1">Postcode</p>
                <p className="text-[0.95rem] font-black text-gray-900 leading-snug">
                  {currentOrder.shippingAddress?.postcode}
                </p>
              </div>
              
              {/* Contact Number */}
              <div>
                <p className="text-[0.75rem] font-black text-gray-400 uppercase tracking-widest mb-1">Contact Number</p>
                {currentOrder.shippingAddress?.phone ? (
                  <a 
                    href={`tel:${currentOrder.shippingAddress.phone}`}
                    className="text-[1rem] font-black text-black hover:text-emerald-600 leading-snug inline-flex items-center gap-2 transition-colors"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {currentOrder.shippingAddress.phone}
                  </a>
                ) : currentOrder.user?.phone ? (
                  <div>
                    <a 
                      href={`tel:${currentOrder.user.phone}`}
                      className="text-[1rem] font-black text-amber-600 hover:text-amber-700 leading-snug inline-flex items-center gap-2 transition-colors"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                      {currentOrder.user.phone}
                    </a>
                    <p className="text-[0.7rem] text-amber-600 font-bold mt-1 italic">⚠️ Using customer profile number (delivery contact not provided)</p>
                  </div>
                ) : (
                  <p className="text-[0.9rem] font-bold text-gray-400 italic">Not provided</p>
                )}
              </div>
              {currentOrder.shippingAddress?.instructions && (
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-[0.75rem] font-black text-gray-400 uppercase tracking-widest mb-1">Delivery Instructions</p>
                  <p className="text-[0.9rem] font-bold text-gray-700 leading-relaxed bg-orange-50 rounded-xl px-4 py-3 border border-orange-100">
                    {currentOrder.shippingAddress.instructions}
                  </p>
                </div>
              )}
              {/* GPS location — shown when user used "Use Current Location" */}
              {currentOrder.shippingAddress?.lat && currentOrder.shippingAddress?.lng && (
                <div className="pt-4 border-t border-gray-50">
                  <p className="text-[0.75rem] font-black text-gray-400 uppercase tracking-widest mb-2">GPS Location</p>
                  {currentOrder.shippingAddress.formattedAddress && (
                    <p className="text-[0.85rem] font-bold text-gray-600 mb-3 leading-snug">
                      📍 {currentOrder.shippingAddress.formattedAddress}
                    </p>
                  )}
                  <a
                    href={`https://www.google.com/maps?q=${currentOrder.shippingAddress.lat},${currentOrder.shippingAddress.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white text-[0.82rem] font-black hover:bg-emerald-600 transition-colors shadow-sm shadow-emerald-200"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    View on Google Maps
                  </a>
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
                    {currentOrder.orderType === 'collection' ? (
                      <>
                        <option value="Ready for Collection">Ready for Collection</option>
                        <option value="Collected">Collected</option>
                      </>
                    ) : (
                      <>
                        <option value="On the Way">On the Way</option>
                        <option value="Delivered">Delivered</option>
                      </>
                    )}
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
                {currentOrder.items?.map((item, index) => (
                  <div key={`${item._id}-${index}`} className="flex items-center gap-5 p-4 rounded-2xl border border-gray-50 bg-gray-50/30">
                    <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-gray-100 bg-white">
                      {item.thumbnail ? (
                        <img src={item.thumbnail} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center bg-gray-50">🍽️</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[1rem] font-black text-gray-900 truncate">{item.name}</p>
                        {item.spiceLevel && (
                          <span className="px-2 py-0.5 rounded-lg bg-orange-100 text-orange-600 text-[0.65rem] font-black uppercase tracking-wider border border-orange-200">
                            🌶️ {item.spiceLevel}
                          </span>
                        )}
                      </div>
                      <p className="text-[0.85rem] font-bold text-gray-400 mt-0.5">£{item.price.toFixed(2)} × {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[1.1rem] font-black text-gray-900">£{item.subtotal.toLocaleString()}</p>
                    </div>
                  </div>
                ))}

                <div className="mt-8 pt-8 border-t border-gray-100 flex items-center justify-between">
                   <p className="text-[1.1rem] font-black text-gray-900">Total Amount</p>
                   <p className="text-[2rem] font-black text-emerald-600 tracking-tight">£{currentOrder.price.toLocaleString()}</p>
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

            {/* Cancellation Reason */}
            {currentOrder.status === 'Cancelled' && currentOrder.cancellationReason && (
              <div className="rounded-[32px] border border-red-100 bg-white p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
                    </svg>
                  </div>
                  <h3 className="text-[0.8rem] font-black uppercase tracking-widest text-gray-400">Cancellation Reason</h3>
                </div>
                <p className="text-[0.95rem] font-bold text-gray-700 leading-relaxed bg-red-50 rounded-xl px-5 py-4 border border-red-100">
                  {currentOrder.cancellationReason}
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
