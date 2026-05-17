'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchUserOrders } from '@/store/slices/orderSlice';
import { formatDate, mapOrderStatus } from '@/lib/utils';
import type { RootState } from '@/store/store';
import ReviewModal from '@/components/ReviewModal/ReviewModal';
import toast from 'react-hot-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderStatus = 'pending' | 'confirmed' | 'on-the-way' | 'delivered' | 'ready-for-collection' | 'collected' | 'cancelled';

interface OrderExtra { name: string; price: number; }
interface OrderItem  { name: string; quantity: number; price: number; spiceLevel?: string; selectedExtras?: OrderExtra[]; productId?: string | { _id: string; name: string; thumbnail?: { url: string; key: string } }; }
interface Order {
  id: string; date: string; status: OrderStatus; totalAmount: number;
  orderType: 'delivery' | 'collection'; paymentMethod: string;
  address?: string; items: OrderItem[]; cancellationReason?: string; _id: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending:      { label: 'Pending',    bg: 'bg-amber-100', text: 'text-amber-700' },
  confirmed:    { label: 'Confirmed',  bg: 'bg-blue-100',  text: 'text-blue-700' },
  'on-the-way': { label: 'On the Way', bg: 'bg-cyan-100',  text: 'text-cyan-700' },
  delivered:    { label: 'Delivered',  bg: 'bg-emerald-100', text: 'text-emerald-700' },
  'ready-for-collection': { label: 'Ready for Collection', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  collected:    { label: 'Collected',  bg: 'bg-emerald-100', text: 'text-emerald-700' },
  cancelled:    { label: 'Cancelled',  bg: 'bg-red-100',   text: 'text-red-700' },
};

const DELIVERY_STEPS: OrderStatus[] = ['pending', 'confirmed', 'on-the-way', 'delivered'];
const COLLECTION_STEPS: OrderStatus[] = ['pending', 'confirmed', 'ready-for-collection', 'collected'];

function getStepIndex(status: OrderStatus, orderType: 'delivery' | 'collection') {
  if (status === 'cancelled') return -1;
  const steps = orderType === 'collection' ? COLLECTION_STEPS : DELIVERY_STEPS;
  return steps.indexOf(status);
}

function getProgressSteps(orderType: 'delivery' | 'collection'): OrderStatus[] {
  return orderType === 'collection' ? COLLECTION_STEPS : DELIVERY_STEPS;
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[0.75rem] font-bold ${cfg.bg} ${cfg.text}`}>
      {cfg.label}
    </span>
  );
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

function ProgressBar({ status, orderType }: { status: OrderStatus; orderType: 'delivery' | 'collection' }) {
  if (status === 'cancelled') return null;
  
  const steps = getProgressSteps(orderType);
  const current = getStepIndex(status, orderType);

  return (
    <div className="mt-5 mb-2 px-2">
      <div className="relative flex justify-between">
        {/* Background Track */}
        <div className="absolute top-2.5 left-0 w-full h-[3px] bg-gray-100 rounded-full z-0" />
        
        {/* Active Track */}
        <div 
          className="absolute top-2.5 left-0 h-[3px] bg-[#10b981] rounded-full transition-all duration-700 ease-out z-0"
          style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const done = idx <= current;
          const active = idx === current;
          const stepLabel = STATUS_CONFIG[step].label;
          
          return (
            <div key={step} className="flex flex-col items-center gap-2.5 z-10">
              <div 
                className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 border-[2.5px] bg-white
                  ${done ? 'border-[#10b981]' : 'border-gray-200'}
                  ${active ? 'ring-4 ring-[#10b981]/10 scale-110 shadow-sm' : ''}
                `}
              >
                {done ? (
                  <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-200" />
                )}
              </div>
              <span className={`text-[0.65rem] font-bold uppercase tracking-widest text-center ${active ? 'text-gray-900' : done ? 'text-gray-600' : 'text-gray-400'}`}>
                {stepLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({ order, index, isAuthenticated, router }: { 
  order: Order; 
  index: number;
  isAuthenticated: boolean;
  router: ReturnType<typeof useRouter>;
}) {
  const [expanded, setExpanded] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string; image?: string } | null>(null);

  const itemsPreview = order.items.map(it => `${it.quantity}x ${it.name}`).join(', ');
  const canLeaveReview = order.status === 'delivered' || order.status === 'collected';

  const handleRateFood = (productId: string, productName: string, productImage?: string) => {
    if (!isAuthenticated) {
      toast.error('Please log in to submit a review');
      router.push('/login');
      return;
    }
    setSelectedProduct({ id: productId, name: productName, image: productImage });
    setShowReviewModal(true);
  };

  const handleReviewClose = () => {
    setShowReviewModal(false);
    setSelectedProduct(null);
  };

  const handleReviewSuccess = () => {
    setShowReviewModal(false);
    setSelectedProduct(null);
    toast.success('Review submitted! Thank you for your feedback.');
  };

  return (
    <>
      {/* Review Modal */}
      {selectedProduct && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={handleReviewClose}
          onSuccess={handleReviewSuccess}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          productImage={selectedProduct.image}
          orderId={order._id}
        />
      )}

      <motion.div
        className="bg-white rounded-[24px] p-5 sm:p-7 flex flex-col gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.03)] border border-[#f1f5f9] transition-all duration-300 hover:shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      >
        {/* Top Header */}
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h3 className="text-[1.15rem] font-black text-gray-900 mb-1 tracking-tight">Order #{order.id}</h3>
            <p className="text-[0.85rem] text-gray-500 font-medium">{order.date}</p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <StatusBadge status={order.status} />
            <span className="text-[1.3rem] font-black text-gray-900 tracking-tight">£{order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <div className="text-[0.9rem] font-medium text-gray-600 line-clamp-2 leading-relaxed mt-1">
          {itemsPreview}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <span className="px-3 py-1.5 rounded-xl bg-gray-50 text-[0.75rem] font-bold text-gray-600 border border-gray-100 flex items-center gap-1.5">
            {order.orderType === 'delivery' ? '🚚 Delivery' : '🏪 Collection'}
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-gray-50 text-[0.75rem] font-bold text-gray-600 border border-gray-100 flex items-center gap-1.5">
            💳 {order.paymentMethod}
          </span>
        </div>

        {/* Progress Stepper */}
        <ProgressBar status={order.status} orderType={order.orderType} />

        {/* Action Buttons */}
        <div className="mt-3 flex gap-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[0.85rem] font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100"
          >
            {expanded ? 'Hide Details' : 'View Details'}
            <motion.svg animate={{ rotate: expanded ? 180 : 0 }} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></motion.svg>
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-5 border-t border-gray-100 mt-2 flex flex-col gap-5">

                {/* Detailed Items with Rate Food Buttons */}
                <div className="space-y-3">
                  {order.items.map((item, idx) => {
                    const extrasTotal = (item.selectedExtras ?? []).reduce((s, e) => s + e.price, 0);
                    const lineTotal   = (item.price + extrasTotal) * item.quantity;

                    return (
                      <div key={idx} className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-gray-50/60 border border-gray-100">
                        <div className="flex gap-3.5 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[0.9rem] font-black text-gray-500 shrink-0">
                            {item.quantity}x
                          </div>
                          <div className="flex flex-col gap-1.5 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-bold text-gray-900 text-[1rem]">{item.name}</p>
                              {item.spiceLevel && (
                                <span className="px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 text-[0.65rem] font-bold uppercase tracking-wider border border-orange-100">
                                  🌶️ {item.spiceLevel}
                                </span>
                              )}
                            </div>
                            {item.selectedExtras && item.selectedExtras.length > 0 && (
                              <div className="flex flex-wrap gap-1.5">
                                {item.selectedExtras.map((ex, ei) => (
                                  <span key={ei} className="text-[0.75rem] font-medium text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-lg">
                                    + {ex.name}
                                  </span>
                                ))}
                              </div>
                            )}
                            <span className="font-bold text-gray-700 text-[0.95rem]">£{lineTotal.toFixed(2)}</span>
                          </div>
                        </div>

                        {/* Rate Food Button */}
                        {canLeaveReview && item.productId && (
                          <div className="shrink-0">
                            <button
                              onClick={() => {
                                const pid = typeof item.productId === 'object'
                                  ? item.productId._id
                                  : item.productId!;
                                const img = typeof item.productId === 'object'
                                  ? item.productId.thumbnail?.url
                                  : undefined;
                                handleRateFood(pid, item.name, img);
                              }}
                              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-500 text-gray-900 text-[0.85rem] font-bold hover:from-yellow-500 hover:to-yellow-600 transition-all shadow-md shadow-yellow-400/20 hover:shadow-lg hover:shadow-yellow-400/30 active:scale-95"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              Rate Food
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Address - Only show for delivery orders */}
                {order.orderType === 'delivery' && order.address && (
                  <div className="p-4 bg-gray-50 rounded-[16px] border border-gray-100">
                    <p className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Delivery Address</p>
                    <p className="text-[0.9rem] font-semibold text-gray-800 leading-snug">{order.address}</p>
                  </div>
                )}

                {/* Collection Notice */}
                {order.orderType === 'collection' && (
                  <div className="p-4 bg-blue-50 rounded-[16px] border border-blue-100">
                    <p className="text-[0.7rem] font-bold text-blue-600 uppercase tracking-widest mb-1.5">🏪 Collection Order</p>
                    <p className="text-[0.9rem] font-semibold text-blue-800 leading-snug">
                      Pick up from: 370 High Street, Lincoln LN5 7RU, UK
                    </p>
                  </div>
                )}

                {/* Cancellation Reason */}
                {order.status === 'cancelled' && order.cancellationReason && (
                  <div className="p-4 bg-red-50 rounded-[16px] border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-red-600 shrink-0">
                        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      <p className="text-[0.7rem] font-bold text-red-600 uppercase tracking-widest">Cancellation Reason</p>
                    </div>
                    <p className="text-[0.9rem] font-semibold text-red-800 leading-snug">{order.cancellationReason}</p>
                  </div>
                )}

                {/* Reorder */}
                <div className="pt-2">
                  {order.status !== 'cancelled' && (
                    <button className="w-full flex items-center justify-center gap-2 py-[16px] rounded-2xl bg-gradient-to-br from-[#10b981] to-[#059669] text-white font-extrabold text-[1rem] shadow-[0_8px_20px_rgba(16,185,129,0.25)] hover:-translate-y-[2px] hover:shadow-[0_12px_24px_rgba(16,185,129,0.35)] active:scale-[0.98] transition-all">
                      <span>Reorder</span>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────

function EmptyState() {
  const router = useRouter();
  return (
    <motion.div
      className="flex flex-col items-center justify-center py-[80px] px-6 text-center bg-white border border-[#e2e8f0] rounded-[32px] gap-4 shadow-[0_4px_24px_rgba(0,0,0,0.02)]"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-2">
        <span className="text-[2.5rem]">🛍️</span>
      </div>
      <h2 className="text-[1.4rem] font-black text-gray-900 m-0 tracking-tight">No orders yet</h2>
      <p className="text-[0.95rem] text-gray-500 m-0 max-w-[280px] leading-relaxed font-medium">
        Looks like you haven't placed any orders. Browse our menu and treat yourself!
      </p>
      <button
        className="mt-4 px-8 py-3.5 rounded-2xl bg-gray-900 text-white text-[0.95rem] font-bold transition-all hover:bg-gray-800 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
        onClick={() => router.push('/')}
      >
        Explore Menu
      </button>
    </motion.div>
  );
}

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-[#f1f5f9] rounded-[24px] p-6 flex flex-col gap-4 animate-pulse shadow-sm"
        >
          <div className="flex justify-between items-start gap-4">
            <div className="flex flex-col gap-2.5">
              <div className="h-5 w-28 bg-gray-200 rounded-md" />
              <div className="h-4 w-36 bg-gray-100 rounded-md" />
            </div>
            <div className="flex flex-col gap-2.5 items-end">
              <div className="h-6 w-24 bg-gray-200 rounded-full" />
              <div className="h-6 w-20 bg-gray-200 rounded-md" />
            </div>
          </div>
          <div className="h-4 w-full bg-gray-100 rounded-md mt-2" />
          <div className="flex gap-2 mt-2">
            <div className="h-8 w-24 bg-gray-100 rounded-xl" />
            <div className="h-8 w-20 bg-gray-100 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfileOrdersPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { orders: backendOrders, loading } = useAppSelector((state: RootState) => state.order);
  const { isAuthenticated } = useAppSelector((state: RootState) => state.userAuth);
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  useEffect(() => {
    dispatch(fetchUserOrders());
  }, [dispatch]);

  const transformedOrders: Order[] = backendOrders.map(order => ({
    _id: order._id,
    id: order.orderId,
    date: formatDate(order.createdAt),
    status: mapOrderStatus(order.orderStatus),
    totalAmount: order.totalAmount,
    orderType: order.orderType,
    paymentMethod: order.paymentMethod,
    cancellationReason: order.cancellationReason,
    address: order.shippingAddress 
      ? `${order.shippingAddress.line1}${order.shippingAddress.line2 ? ', ' + order.shippingAddress.line2 : ''}, ${order.shippingAddress.city}, ${order.shippingAddress.postcode}`
      : undefined,
    items: order.items.map(item => ({
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      spiceLevel: item.spiceLevel,
      selectedExtras: item.selectedExtraOptions,
      productId: item.productId, // keep as-is (may be populated object or string)
    })),
  }));

  const filtered = filter === 'all' ? transformedOrders : transformedOrders.filter(o => o.status === filter);

  const filterOptions: Array<{ value: OrderStatus | 'all'; label: string }> = [
    { value: 'all',        label: 'All Orders' },
    { value: 'pending',    label: 'Pending' },
    { value: 'confirmed',  label: 'Confirmed' },
    { value: 'on-the-way', label: 'On the Way' },
    { value: 'ready-for-collection', label: 'Ready' },
    { value: 'delivered',  label: 'Delivered' },
    { value: 'collected',  label: 'Collected' },
    { value: 'cancelled',  label: 'Cancelled' },
  ];

  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto pb-8">

      {/* Page Header */}
      <motion.div
        className="flex items-center gap-[14px]"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div>
          <h1 className="text-[1.8rem] font-black text-white m-0 tracking-tight max-sm:text-[1.5rem] drop-shadow-md">
            Order History
          </h1>
          <p className="text-[0.95rem] text-gray-200 mt-1 mb-0 font-medium drop-shadow">
            {loading ? 'Loading your orders...' : `Track and manage your ${transformedOrders.length} order${transformedOrders.length !== 1 ? 's' : ''}`}
          </p>
        </div>
      </motion.div>

      {/* Filter Pills - Modern iOS style */}
      <motion.div
        className="flex gap-2.5 flex-wrap"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.08 }}
      >
        {filterOptions.map(opt => {
          const isActive = filter === opt.value;
          const count = opt.value === 'all' ? transformedOrders.length : transformedOrders.filter(o => o.status === opt.value).length;
          
          if (count === 0 && opt.value !== 'all') return null; // Hide empty filters for cleaner UI

          return (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[0.85rem] font-bold transition-all active:scale-95
                ${isActive 
                  ? 'bg-white text-[#059669] shadow-[0_4px_16px_rgba(255,255,255,0.2)]' 
                  : 'bg-white/10 text-white hover:bg-white/20 border border-white/20 backdrop-blur-md'
                }`}
            >
              {opt.label}
              <span className={`px-2 py-[2px] rounded-lg text-[0.7rem] ${isActive ? 'bg-[#10b981]/20 text-[#059669]' : 'bg-white/20 text-white'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Order List */}
      <div className="flex flex-col gap-5">
        {loading ? (
          <LoadingSkeleton />
        ) : filtered.length === 0 ? (
          <EmptyState />
        ) : (
          filtered.map((order, i) => (
            <OrderCard key={order.id} order={order} index={i} isAuthenticated={isAuthenticated} router={router} />
          ))
        )}
      </div>

    </div>
  );
}
