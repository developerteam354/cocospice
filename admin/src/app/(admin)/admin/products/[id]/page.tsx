'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Edit2, Package, Leaf, 
  ShoppingCart, Tag, ChefHat, Loader2, Plus, Eye, EyeOff
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';
import { fetchProductById, toggleProductAvailability } from '@/store/slices/productSlice';
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

  // Fetch product data
  useEffect(() => {
    if (productId) {
      dispatch(fetchProductById(productId));
    }
  }, [dispatch, productId]);

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
      </div>
    </>
  );
}
