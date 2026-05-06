'use client';

import React, { useState, useEffect } from 'react';
import { MenuItem, ExtraOption } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchProducts, fetchProductsByCategory } from '../../store/slices/productSlice';
import { fetchCategories } from '../../store/slices/categorySlice';
import { toast } from 'sonner';
import Header from '../Header/Header';
import MainContent from '../MainContent/MainContent';
import CartSidebar from '../CartSidebar/CartSidebar';
import SplashScreen from '../SplashScreen/SplashScreen';
import AuthModal from '../AuthModal/AuthModal';
import ItemDetailModal from '../ItemDetailModal/ItemDetailModal';
import OrderTypeModal from '../OrderTypeModal/OrderTypeModal';
import ExtrasModal from '../ExtrasModal/ExtrasModal';

import styles from './ClientApp.module.css';
import { useRouter } from 'next/navigation';
import { ThreeDot } from 'react-loading-indicators';

// Global to track splash screen across internal navigations (resets on refresh)
let hasShownSplashGlobal = false;

export default function ClientApp() {
  const dispatch = useAppDispatch();
  const { user, setIntended } = useAuth();
  const { cart, addToCart: addItemToCart, updateQuantity: handleUpdateQuantity, clearCart, cartTotal, totalItems: totalItemsInCart, orderType, setOrderType } = useCart();
  const router = useRouter();
  
  // Redux state
  const { items: menuItems, loading: productsLoading, error: productsError } = useAppSelector((state) => state.products);
  const { items: categories, loading: categoriesLoading, error: categoriesError } = useAppSelector((state) => state.categories);
  
  const [showSplash, setShowSplash] = useState(!hasShownSplashGlobal);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [toastKey, setToastKey] = useState(0);

  // Auth modal state — single unified modal
  const [showAuthModal,  setShowAuthModal]  = useState(false);
  const [authModalMode,  setAuthModalMode]  = useState<'login' | 'signup'>('login');
  // 'checkout' → show OrderTypeModal after login; 'header' → just close modal
  const [loginOrigin,    setLoginOrigin]    = useState<'header' | 'checkout'>('header');

  // Checkout page
  const [showOrderTypeModal, setShowOrderTypeModal] = useState(false);
  // Extras customisation modal
  const [extrasItem, setExtrasItem] = useState<MenuItem | null>(null);

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchCategories(true));   // withProductCount=true — $project now includes categoryImage
    dispatch(fetchProducts());
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (productsError) {
      toast.error(productsError);
    }
    if (categoriesError) {
      toast.error(categoriesError);
    }
  }, [productsError, categoriesError]);

  useEffect(() => {
    if (!hasShownSplashGlobal) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        hasShownSplashGlobal = true;
      }, 2500);
      return () => clearTimeout(timer);
    } else {
      setShowSplash(false);
    }
  }, []);

  /**
   * Central "Add to Cart" handler.
   * - Called from product cards (no extras arg) and from ItemDetailModal.
   * - If the product has extras AND no extras have been chosen yet → open ExtrasModal.
   * - Otherwise add directly.
   */
  const handleAddToCart = (item: MenuItem, selectedExtras?: ExtraOption[], spiceLevel?: 'Low' | 'Medium' | 'Very Spicy') => {
    // If spice level selection is enabled and none is provided → open modal
    if (item.hasSpiceLevel && !spiceLevel) {
      setExtrasItem(item);
      setSelectedItem(null); // close detail modal if open
      return;
    }

    // Add to cart
    addItemToCart(item, selectedExtras, spiceLevel);

    if (spiceLevel) {
      toast.success(`${item.name} added to cart (${spiceLevel})`);
    } else {
      toast.success(`${item.name} added to cart`);
    }
  };

  /** Called when user confirms selection inside SpiceLevelModal */
  const handleSpiceLevelConfirm = (item: MenuItem, spiceLevel: 'Low' | 'Medium' | 'Very Spicy') => {
    addItemToCart(item, undefined, spiceLevel);
    toast.success(`${item.name} added to cart (${spiceLevel})`);
    setExtrasItem(null);
  };

  // Checkout handler — checks auth before proceeding
  const handleCheckout = () => {
    if (!user) {
      setLoginOrigin('checkout');
      setIntended(null); // no page navigation needed — just open OrderTypeModal after login
      setAuthModalMode('login');
      setShowAuthModal(true);
      return;
    }
    setIsCartOpen(false);
    setShowOrderTypeModal(true);
  };

  const handleOrderTypeSelected = (type: 'delivery' | 'collection') => {
    setOrderType(type);
    setShowOrderTypeModal(false);
    router.push('/checkout/review');
  };

  // Open auth modal from header — no checkout flow, just sign in
  const handleOpenAuth = (mode: 'login' | 'signup') => {
    setLoginOrigin('header');
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  // Handle category selection
  const handleSelectCategory = (id: string) => {
    setSelectedCategoryId(id);
    dispatch(fetchProductsByCategory(id));
  };

  const handleSelectAllCategories = () => {
    setSelectedCategoryId(null);
    dispatch(fetchProducts());
  };

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (showSplash) {
    return <SplashScreen />;
  }

  // Show loading state
  if ((productsLoading || categoriesLoading) && menuItems.length === 0) {
    return (
      <div className={styles.appContainer}>
        <Header
          cartCount={totalItemsInCart}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAuth={handleOpenAuth}
        />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '60vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <ThreeDot color="#ff6b35" size="medium" />
          <p style={{ color: '#666', fontSize: '1.1rem' }}>Loading menu...</p>
        </div>
      </div>
    );
  }

  const filteredItems = menuItems;

  const selectedCategoryName = selectedCategoryId === null
    ? 'All Categories'
    : categories.find(c => c.id === selectedCategoryId)?.name || 'Menu';

  return (
    <div className={styles.appContainer}>
      <Header
        cartCount={totalItemsInCart}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={handleOpenAuth}
      />

      {/* Floating Cart Bouncing Banner */}
      {cart.length > 0 && !isCartOpen && (
        <div key={toastKey} className={styles.floatingCartBanner} onClick={() => setIsCartOpen(true)}>
          {/* Item Thumbnails */}
          <div className={styles.floatingCartThumbsWrap}>
            {cart.slice(0, 3).map((item, i) => (
              <React.Fragment key={`${item.id}-${i}`}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    width={36}
                    height={36}
                    className={styles.floatingCartThumb}
                    style={{ zIndex: 3 - i, marginLeft: i === 0 ? 0 : -10 }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div
                    className={styles.floatingCartThumb}
                    style={{ zIndex: 3 - i, marginLeft: i === 0 ? 0 : -10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f0f0', fontSize: 18 }}
                  >
                    🍽️
                  </div>
                )}
              </React.Fragment>
            ))}
            {cart.length > 3 && (
              <div className={styles.floatingCartThumbMore}>+{cart.length - 3}</div>
            )}
          </div>
 
          {/* Item count + total */}
          <div className={styles.floatingCartInfo}>
            <span className={styles.floatingCartCount}>{totalItemsInCart} item{totalItemsInCart > 1 ? 's' : ''}</span>
            <span className={styles.floatingCartTotal}>£{cartTotal.toFixed(2)}</span>
          </div>
 
          {/* Order Now CTA */}
          <button className={styles.floatingCheckoutBtn}>
            Order Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
      )}

      <main className={styles.mainLayout}>
        <div className={`${styles.sidebarWrapper} ${isSidebarOpen ? '' : styles.sidebarClosed}`}>
          <div className={styles.sidebarHeader}>
            <h3 className={styles.sidebarTitle} style={{ color: '#ffffff', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Menu</h3>
            <div className={styles.sidebarBadge} style={{ background: '#ffffff', color: 'var(--primary-color)' }}>{categories.length + 1}</div>
          </div>
          <div className={styles.categoryScrollContainer}>
            <button
              className={`${styles.categoryPill} ${selectedCategoryId === null ? styles.activePill : ''}`}
              onClick={handleSelectAllCategories}
            >
              <span className={styles.categoryIcon}>🍽️</span>
              <span className={styles.categoryText}>All Categories</span>
            </button>
            {categories.map((c, index) => {
              return (
                <button
                  key={c.id}
                  className={`${styles.categoryPill} ${selectedCategoryId === c.id ? styles.activePill : ''}`}
                  onClick={() => handleSelectCategory(c.id)}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {c.categoryImage ? (
                    <img
                      src={c.categoryImage}
                      alt={c.name}
                      width={36}
                      height={36}
                      className={styles.categoryImg}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        const sibling = (e.currentTarget as HTMLImageElement).nextElementSibling as HTMLElement | null;
                        if (sibling) sibling.style.display = 'inline';
                      }}
                    />
                  ) : null}
                  {(!c.categoryImage) && (
                    <span className={styles.categoryIcon}>🍽️</span>
                  )}
                  {c.categoryImage && (
                    <span className={styles.categoryIcon} style={{ display: 'none' }}>🍽️</span>
                  )}
                  <span className={styles.categoryText}>{c.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.contentWrapper}>
          <div className={styles.contentHeader}>
            <button
              className={`${styles.sidebarToggle} ${!isSidebarOpen ? styles.toggleClosed : ''}`}
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label="Toggle Categories"
              title="Toggle Sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                {isSidebarOpen ? (
                  <>
                    <path d="M9 18l-6-6 6-6" />
                    <path d="M21 12H3" />
                  </>
                ) : (
                  <>
                    <path d="M15 18l6-6-6-6" />
                    <path d="M3 12h18" />
                  </>
                )}
              </svg>
            </button>
          </div>

          {productsLoading ? (
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center', 
              minHeight: '40vh',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              <ThreeDot color="#ff6b35" size="small" />
              <p style={{ color: '#666' }}>Loading products...</p>
            </div>
          ) : (
            <MainContent
              categoryTitle={selectedCategoryName}
              items={filteredItems}
              onAddToCart={handleAddToCart}
              onSelectItem={setSelectedItem}
            />
          )}
        </div>
      </main>

      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddToCart}
        />
      )}

      {isCartOpen && (
        <CartSidebar
          cart={cart}
          onUpdateQuantity={handleUpdateQuantity}
          onClearCart={clearCart}
          onClose={() => setIsCartOpen(false)}
          onCheckout={handleCheckout}
        />
      )}

      {showOrderTypeModal && (
        <OrderTypeModal 
          onSelectType={handleOrderTypeSelected}
          onClose={() => setShowOrderTypeModal(false)}
        />
      )}

      {/* Auth Modal (Login/Signup form) */}
      {showAuthModal && (
        <AuthModal
          initialMode={authModalMode}
          onClose={() => { setShowAuthModal(false); setIntended(null); }}
          onSuccess={() => {
            setShowAuthModal(false);
            // Only open the delivery/collection modal when coming from checkout
            if (loginOrigin === 'checkout') {
              setIsCartOpen(false);
              setShowOrderTypeModal(true);
            }
            // If from header — just close the modal, stay on current page
          }}
        />
      )}

      {/* Extras Customisation Modal */}
      {extrasItem && (
        <ExtrasModal
          item={extrasItem}
          onConfirm={handleSpiceLevelConfirm as any}
          onClose={() => setExtrasItem(null)}
        />
      )}


    </div>
  );
}
