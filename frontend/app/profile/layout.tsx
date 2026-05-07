'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import Header from '@/components/Header/Header';
import CartSidebar from '@/components/CartSidebar/CartSidebar';
import OrderTypeModal from '@/components/OrderTypeModal/OrderTypeModal';
import { useRouter, usePathname } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute/ProtectedRoute';
import { useAppSelector } from '@/store/hooks';
import type { RootState } from '@/store/store';

// Proxy helper
const toProxyUrl = (urlOrKey: string): string => {
  if (!urlOrKey) return '';
  if (urlOrKey.includes('/upload/image')) return urlOrKey;
  const s3Match = urlOrKey.match(/amazonaws\.com\/(.+)$/);
  const key = s3Match ? s3Match[1] : urlOrKey;
  return `${process.env.NEXT_PUBLIC_API_URL}/api/user/upload/image?key=${encodeURIComponent(key)}`;
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const reduxUser = useAppSelector((s: RootState) => s.userAuth.user);
  const { totalItems, cart, updateQuantity, clearCart, setOrderType } = useCart();
  const router   = useRouter();
  const pathname = usePathname();

  const [isCartOpen,         setIsCartOpen]         = useState(false);
  const [showOrderTypeModal, setShowOrderTypeModal]  = useState(false);
  const [imgError,           setImgError]            = useState(false);

  const currentUser = reduxUser ?? user;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const profileImageUrl = currentUser?.profileImage
    ? toProxyUrl(currentUser.profileImage)
    : '';

  const handleOrderTypeSelected = (type: 'delivery' | 'collection') => {
    setOrderType(type);
    setShowOrderTypeModal(false);
    router.push('/checkout/review');
  };

  const activeTab = pathname === '/profile' ? 'profile'
    : pathname.includes('orders')  ? 'orders'
    : 'address';

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex flex-col bg-transparent text-gray-900">
        <Header
          cartCount={totalItems}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={(_mode) => {}}
        />

        {/* Main Layout */}
        <main className="w-full max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr] gap-6 lg:gap-10 p-4 pt-6 lg:p-10 lg:pt-10">

          {/* ── Sidebar (Desktop Only) ── */}
          <aside className="hidden lg:block bg-white/95 backdrop-blur-2xl border border-white/60 rounded-[32px] p-6 lg:p-8 h-fit shadow-[0_8px_32px_rgba(0,0,0,0.06)] sticky top-[100px] z-10">

            {/* Profile Brief */}
            <div className="flex flex-col items-center mb-8 text-center">
              <div className="w-[110px] h-[110px] rounded-[30px] overflow-hidden flex items-center justify-center text-[2.5rem] font-extrabold text-white bg-gradient-to-br from-[#10b981] to-[#059669] mb-4 shadow-[0_10px_24px_rgba(16,185,129,0.3)] border-[3px] border-white shrink-0">
                {profileImageUrl && !imgError ? (
                  <img
                    src={profileImageUrl}
                    alt={currentUser?.name ?? 'Profile'}
                    className="w-full h-full object-cover"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  currentUser ? getInitials(currentUser.name) : '?'
                )}
              </div>
              <h2 className="text-[1.3rem] font-black tracking-tight text-gray-900 mb-0.5">{currentUser?.name || 'Guest User'}</h2>
              <p className="text-[0.85rem] font-medium text-gray-500">{currentUser?.email || 'Sign in to see details'}</p>
            </div>

            {/* Navigation */}
            <nav className="flex flex-col gap-2">
              <button
                className={`flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[0.95rem] font-bold transition-all active:scale-95 ${
                  activeTab === 'profile'
                    ? 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-100'
                }`}
                onClick={() => router.push('/profile')}
              >
                <span className="text-[1.2rem]">👤</span>
                My Profile
              </button>

              <button
                className={`flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[0.95rem] font-bold transition-all active:scale-95 ${
                  activeTab === 'orders'
                    ? 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-100'
                }`}
                onClick={() => router.push('/profile/orders')}
              >
                <span className="text-[1.2rem]">📦</span>
                My Orders
              </button>

              <button
                className={`flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[0.95rem] font-bold transition-all active:scale-95 ${
                  activeTab === 'address'
                    ? 'bg-gradient-to-br from-[#10b981] to-[#059669] text-white shadow-[0_4px_16px_rgba(16,185,129,0.3)]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border border-transparent hover:border-gray-100'
                }`}
                onClick={() => router.push('/profile/address')}
              >
                <span className="text-[1.2rem]">📍</span>
                Manage Address
              </button>

              <div className="h-px bg-gray-100 my-4 mx-2" />

              <button
                className="flex items-center gap-3.5 px-5 py-3.5 rounded-2xl text-[0.95rem] font-bold transition-all active:scale-95 text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100"
                onClick={() => { logout(); router.push('/'); }}
              >
                <span className="text-[1.2rem]">🚪</span>
                Sign Out
              </button>
            </nav>

            {/* Back to Menu Footer Link */}
            <button
              className="mt-6 w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-[0.9rem] font-bold text-[#10b981] hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all"
              onClick={() => router.push('/')}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
              Back to Menu
            </button>
          </aside>

          {/* ── Content Area ── */}
          <section className="flex flex-col w-full min-w-0">
            {children}
          </section>
        </main>

        {/* Overlays */}
        {isCartOpen && (
          <CartSidebar
            cart={cart}
            onUpdateQuantity={updateQuantity}
            onClearCart={clearCart}
            onClose={() => setIsCartOpen(false)}
            onCheckout={() => { setIsCartOpen(false); setShowOrderTypeModal(true); }}
          />
        )}
        {showOrderTypeModal && (
          <OrderTypeModal onSelectType={handleOrderTypeSelected} onClose={() => setShowOrderTypeModal(false)} />
        )}
      </div>
    </ProtectedRoute>
  );
}
