'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Edit2, Package, Leaf, 
  ShoppingCart, Tag, ChefHat, Loader2, Plus, Eye, EyeOff,
  Star, MessageSquare, CheckCircle, Clock, Trash2, TrendingUp,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchProductById, toggleProductAvailability } from '@/store/slices/productSlice';
import { fetchReviewsByProduct, fetchReviewOverallStats, toggleReviewApproval, deleteReview } from '@/store/slices/reviewSlice';
import adminReviewService from '@/services/reviewService';
import { toProxyUrl } from '@/services/productService';
import type { IReviewStats } from '@/types/review';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const productId = params.id as string;

  const { currentProduct, currentProductLoading, error } = useAppSelector(
    (state: RootState) => state.products
  );
  const { reviews, updating: reviewUpdating } = useAppSelector(
    (state: RootState) => state.reviews
  );

  const [productStats, setProductStats] = useState<IReviewStats | null>(null);

  // Fetch product and reviews
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
      dispatch(fetchReviewsByProduct(productId));
      adminReviewService.getProductStats(productId).then(setProductStats).catch(() => {});
    }
  }, [dispatch, productId]);

  // Refresh stats when reviews change
  useEffect(() => {
    if (productId) {
      adminReviewService.getProductStats(productId).then(setProductStats).catch(() => {});
    }
  }, [reviews, productId]);

  // Handle toggle list/unlist
  const handleToggleList = async () => {
    if (!currentProduct) return;
    
    const newStatus = !currentProduct.isAvailable;
    const result = await dispatch(toggleProductAvailability({ 
      id: productId, 
      isAvailable: newStatus 
    }));
    
    if (toggleProductAvailability.fulfilled.match(result)) {
      toast.success(
        newStatus 
          ? 'Product is now visible to customers' 
          : 'Product is now hidden from customers'
      );
    } else {
      toast.error('Failed to update product status');
    }
  };

  const handleToggleReview = async (reviewId: string) => {
    try {
      const result = await dispatch(toggleReviewApproval(reviewId)).unwrap();
      toast.success(result.isApproved ? 'Review approved' : 'Review hidden');
      adminReviewService.getProductStats(productId).then(setProductStats).catch(() => {});
    } catch {
      toast.error('Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await dispatch(deleteReview(reviewId)).unwrap();
      toast.success('Review deleted');
      adminReviewService.getProductStats(productId).then(setProductStats).catch(() => {});
    } catch {
      toast.error('Failed to delete review');
    }
  };

  // Loading state
  if (currentProductLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="relative mx-auto mb-6 h-20 w-20">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-100 opacity-75"></div>
            <div className="relative flex h-full w-full items-center justify-center rounded-full bg-white shadow-sm border border-emerald-50">
              <Loader2 size={32} className="animate-spin text-emerald-600" />
            </div>
          </div>
          <p className="text-[1.1rem] font-bold text-gray-900">Loading details...</p>
          <p className="text-[0.9rem] font-medium text-gray-400 mt-1">Gathering product information</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !currentProduct) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center max-w-md p-8 rounded-[32px] bg-white border border-gray-100 shadow-sm">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[24px] bg-red-50 border border-red-100">
            <Package size={40} className="text-red-600" />
          </div>
          <h2 className="mb-2 text-[1.4rem] font-black text-gray-900">Product Not Found</h2>
          <p className="mb-8 text-[0.95rem] font-medium text-gray-500 leading-relaxed">
            {error || 'The product you are looking for might have been removed or the link is broken.'}
          </p>
          <Button onClick={() => router.push('/admin/products')} className="w-full">
            <ArrowLeft size={18} strokeWidth={2.5} />
            Back to Products List
          </Button>
        </div>
      </div>
    );
  }

  const product = currentProduct;
  const categoryName = typeof product.category === 'object' 
    ? product.category.name 
    : 'Uncategorized';

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #f3f4f6',
            borderRadius: '16px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          },
        }}
      />

      <div className="space-y-8 pb-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="h-12 w-12 flex items-center justify-center rounded-2xl border border-gray-100 bg-white text-gray-400 hover:text-gray-900 hover:bg-gray-50 transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft size={20} strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-[1.8rem] font-black text-gray-900 tracking-tight">Product Details</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[0.9rem] font-bold text-gray-400">Manage visibility & settings</span>
                <span className="h-1 w-1 rounded-full bg-gray-300" />
                <span className="text-[0.9rem] font-black text-emerald-600">ID: {productId.slice(-6).toUpperCase()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleList}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl border px-6 py-3 text-[0.95rem] font-black transition-all active:scale-95 shadow-sm ${
                product.isAvailable
                  ? 'border-amber-100 bg-amber-50 text-amber-600 hover:bg-amber-100'
                  : 'border-emerald-100 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
              }`}
            >
              {product.isAvailable ? (
                <>
                  <EyeOff size={18} strokeWidth={2.5} />
                  Unlist Product
                </>
              ) : (
                <>
                  <Eye size={18} strokeWidth={2.5} />
                  List Product
                </>
              )}
            </button>
            <Button
              onClick={() => router.push(`/admin/products/${productId}/edit`)}
              className="flex-1 sm:flex-none shadow-[0_10px_25px_rgba(16,185,129,0.2)]"
            >
              <Edit2 size={18} strokeWidth={2.5} />
              Edit Product
            </Button>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 gap-8 lg:grid-cols-3"
        >
          {/* Left Column - Images */}
          <div className="space-y-6 lg:col-span-1">
            {/* Thumbnail */}
            <div className="relative overflow-hidden rounded-[40px] border border-gray-100 bg-white p-4 shadow-sm group">
              <div className="relative aspect-square overflow-hidden rounded-[32px] border-4 border-gray-50 bg-gray-50 shadow-inner">
                {product.thumbnail?.url ? (
                  <img
                    src={product.thumbnail.url}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package size={64} className="text-gray-200" />
                  </div>
                )}
                {/* Veg Badge Overlay */}
                <div className="absolute top-4 left-4">
                   {product.isVeg ? (
                      <div className="flex items-center gap-1.5 rounded-full border border-emerald-100 bg-white/90 backdrop-blur-md px-3 py-1.5 shadow-sm">
                        <Leaf size={14} className="text-emerald-500 fill-emerald-500" />
                        <span className="text-[0.75rem] font-black uppercase tracking-wider text-emerald-600">Pure Veg</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 rounded-full border border-red-100 bg-white/90 backdrop-blur-md px-3 py-1.5 shadow-sm">
                        <span className="text-[0.75rem] font-black uppercase tracking-wider text-red-600">Non-Veg</span>
                      </div>
                    )}
                </div>
              </div>
            </div>

            {/* Gallery */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="rounded-[32px] border border-gray-100 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-[0.8rem] font-black uppercase tracking-widest text-gray-400">
                  Product Gallery
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {product.gallery.map((img, idx) => (
                    <div
                      key={idx}
                      className="aspect-square overflow-hidden rounded-[18px] border-2 border-gray-50 bg-gray-50 hover:border-emerald-500 transition-colors cursor-pointer group"
                    >
                      <img
                        src={img.url}
                        alt={`Gallery ${idx + 1}`}
                        className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Details */}
          <div className="space-y-6 lg:col-span-2">
            {/* Identity Card */}
            <div className="rounded-[40px] border border-gray-100 bg-white p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                 <Package size={120} />
              </div>
              
              <div className="relative z-10">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <Badge variant="green" className="text-[0.85rem] px-4 py-1.5 rounded-full border-none bg-emerald-50 text-emerald-600 font-black">
                    {categoryName}
                  </Badge>
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="text-[0.75rem] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                      Low Stock
                    </span>
                  )}
                  {!product.isAvailable && (
                    <span className="text-[0.75rem] font-black uppercase tracking-wider text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                      Private
                    </span>
                  )}
                </div>

                <h2 className="text-[2.4rem] font-black text-gray-900 leading-tight mb-4 tracking-tight">
                  {product.name}
                </h2>
                
                <p className="text-[1.05rem] font-medium text-gray-500 leading-relaxed max-w-2xl">
                  {product.description || "No description provided for this product."}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pricing Card */}
              <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Tag size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[0.85rem] font-black uppercase tracking-widest text-gray-400">
                    Pricing Details
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.95rem] font-bold text-gray-500">Base Price</span>
                    <span className={`text-[1.2rem] font-black ${product.offerPercentage > 0 ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                      ₹{product.price.toFixed(2)}
                    </span>
                  </div>

                  {product.offerPercentage > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-[0.95rem] font-bold text-gray-500">Discount Offer</span>
                      <span className="text-[1rem] font-black text-orange-600 bg-orange-50 px-3 py-1 rounded-lg">
                        {product.offerPercentage}% OFF
                      </span>
                    </div>
                  )}

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[1.1rem] font-black text-gray-900">Selling Price</span>
                    <span className="text-[2.2rem] font-black text-emerald-600 tracking-tight">
                      ₹{product.finalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inventory Card */}
              <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
                <div className="mb-6 flex items-center gap-3">
                  <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <ShoppingCart size={20} strokeWidth={2.5} />
                  </div>
                  <h3 className="text-[0.85rem] font-black uppercase tracking-widest text-gray-400">
                    Inventory Status
                  </h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-[0.95rem] font-bold text-gray-500">In Stock</span>
                    <span className="text-[1.6rem] font-black text-gray-900">{product.stock} units</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-[0.95rem] font-bold text-gray-500">Total Sold</span>
                    <span className="text-[1.6rem] font-black text-blue-600">{product.soldCount || 0} units</span>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-[0.95rem] font-bold text-gray-500">Status</span>
                    {product.stock > 0 ? (
                      <Badge variant="green" className="font-black">AVAILABLE</Badge>
                    ) : (
                      <Badge variant="red" className="font-black">SOLD OUT</Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Ingredients & Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Ingredients */}
              {product.ingredients && product.ingredients.length > 0 && (
                <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 border border-gray-100">
                      <ChefHat size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-[0.85rem] font-black uppercase tracking-widest text-gray-400">
                      Ingredients
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.ingredients.map((ingredient, idx) => (
                      <span
                        key={idx}
                        className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-2 text-[0.85rem] font-bold text-gray-600"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Extra Options */}
              {product.extraOptions && product.extraOptions.length > 0 && (
                <div className="rounded-[32px] border border-gray-100 bg-white p-8 shadow-sm">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <Plus size={20} strokeWidth={2.5} />
                    </div>
                    <h3 className="text-[0.85rem] font-black uppercase tracking-widest text-gray-400">
                      Extra Add-ons
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.extraOptions.map((option, idx) => {
                      const name  = typeof option === 'string' ? option : option.name;
                      const price = typeof option === 'string' ? 0 : option.price;
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/30 pl-4 pr-3 py-2"
                        >
                          <span className="text-[0.85rem] font-bold text-gray-800">{name}</span>
                          {price > 0 && (
                            <span className="text-[0.8rem] font-black text-emerald-600 bg-white px-2 py-0.5 rounded-lg shadow-sm">
                              +₹{price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* ── Reviews Section ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Reviews Header + Stats */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-yellow-50 text-yellow-600 border border-yellow-100">
              <Star size={20} strokeWidth={2.5} />
            </div>
            <h2 className="text-[1.3rem] font-black text-gray-900">Customer Reviews</h2>
            {productStats && (
              <span className="ml-auto text-[0.85rem] font-bold text-gray-500">
                {productStats.totalReviews} approved review{productStats.totalReviews !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Rating Stats Card */}
          {productStats && productStats.totalReviews > 0 && (
            <div className="bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Big Average */}
                <div className="text-center shrink-0">
                  <p className="text-[4rem] font-black text-gray-900 leading-none">{productStats.averageRating}</p>
                  <div className="flex items-center justify-center gap-1 mt-2">
                    {[1,2,3,4,5].map(s => (
                      <svg key={s} width="20" height="20" viewBox="0 0 24 24"
                        fill={s <= Math.round(productStats.averageRating) ? '#facc15' : 'none'}
                        stroke={s <= Math.round(productStats.averageRating) ? '#facc15' : '#d1d5db'}
                        strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-[0.8rem] font-bold text-gray-400 mt-1">out of 5</p>
                </div>

                {/* Distribution Bars */}
                <div className="flex-1 w-full space-y-2">
                  {[5,4,3,2,1].map(star => {
                    const count = productStats.ratingDistribution[star] || 0;
                    const pct = productStats.totalReviews > 0 ? (count / productStats.totalReviews) * 100 : 0;
                    return (
                      <div key={star} className="flex items-center gap-3">
                        <span className="text-[0.8rem] font-bold text-gray-500 w-4 shrink-0">{star}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#facc15" stroke="#facc15" strokeWidth="2">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                        <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-400 rounded-full transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[0.8rem] font-bold text-gray-400 w-6 text-right shrink-0">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Reviews List */}
          <div className="space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-[32px] border border-gray-100 py-16 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-[20px] flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <MessageSquare size={32} className="text-gray-200" />
                </div>
                <p className="text-[1rem] font-bold text-gray-900">No reviews yet</p>
                <p className="text-[0.85rem] font-medium text-gray-400 mt-1">
                  Reviews will appear here once customers submit them
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {reviews.map((review) => (
                  <motion.div
                    key={review._id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -16 }}
                    className={`bg-white rounded-[24px] p-6 border shadow-sm ${
                      review.isApproved ? 'border-emerald-100' : 'border-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[0.85rem] font-black shrink-0 overflow-hidden">
                          {review.userId?.profileImage ? (
                            <img
                              src={toProxyUrl(review.userId.profileImage)}
                              alt={review.userId.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                const parent = e.currentTarget.parentElement;
                                if (parent) parent.innerHTML = `<span style="font-size:0.85rem;font-weight:900;color:white">${review.userId?.name?.charAt(0)?.toUpperCase() ?? 'U'}</span>`;
                              }}
                            />
                          ) : (
                            review.userId?.name?.charAt(0)?.toUpperCase() || 'U'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-[0.95rem]">{review.userId?.name || 'Unknown'}</p>
                          <p className="text-[0.75rem] text-gray-400 font-medium">
                            {new Date(review.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            {' · '}Order #{review.orderId?.orderId || 'N/A'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[0.75rem] font-bold ${
                          review.isApproved
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {review.isApproved ? <><CheckCircle size={11} /> Approved</> : <><Clock size={11} /> Pending</>}
                        </span>
                      </div>
                    </div>

                    {/* Stars + Comment */}
                    <div className="mt-4">
                      <div className="flex items-center gap-1.5 mb-2">
                        {[1,2,3,4,5].map(s => (
                          <svg key={s} width="16" height="16" viewBox="0 0 24 24"
                            fill={s <= review.rating ? '#facc15' : 'none'}
                            stroke={s <= review.rating ? '#facc15' : '#d1d5db'}
                            strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        ))}
                        <span className="text-[0.8rem] font-bold text-gray-500 ml-1">{review.rating}/5</span>
                      </div>
                      <p className="text-[0.9rem] text-gray-700 font-medium leading-relaxed">{review.comment}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                      <div className="flex items-center gap-3">
                        <span className="text-[0.8rem] font-bold text-gray-400">
                          {review.isApproved ? 'Visible to users' : 'Hidden from users'}
                        </span>
                        <button
                          onClick={() => handleToggleReview(review._id)}
                          disabled={reviewUpdating === review._id}
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-60 ${
                            review.isApproved ? 'bg-emerald-500' : 'bg-gray-200'
                          }`}
                        >
                          <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                            review.isApproved ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDeleteReview(review._id)}
                        disabled={reviewUpdating === review._id}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-red-500 text-[0.8rem] font-bold hover:bg-red-50 border border-transparent hover:border-red-100 transition-all disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
