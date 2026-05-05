'use client';

/**
 * CartContext — thin wrapper around the Redux cartSlice.
 *
 * Persistence strategy:
 *  - redux-persist writes cart to localStorage on every change (works for guests too)
 *  - When a user is identified (logged-in or returning guest), the cart is also
 *    synced to the backend using a sessionId (userId or a stable guestId)
 *
 * All existing consumers keep the same API — no changes needed elsewhere.
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import {
  addToCart as addToCartAction,
  updateQuantity as updateQuantityAction,
  clearCart as clearCartAction,
  setOrderType as setOrderTypeAction,
  setOrderNote as setOrderNoteAction,
  fetchCartFromServer,
  syncCartToServer,
  calcItemUnitPrice,
} from '../store/slices/cartSlice';
import type { MenuItem, CartItem, ExtraOption } from '../types';
import { getCurrentUser } from '../services/authService';

// Re-export so existing imports of calcItemUnitPrice from CartContext still work
export { calcItemUnitPrice };

// ─── Address types (unchanged) ────────────────────────────────────────────────

export interface Address {
  id?: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  phone: string;
  instructions?: string;
}

export const EMPTY_ADDRESS: Address = {
  fullName: '',
  line1: '',
  line2: '',
  city: '',
  postcode: '',
  phone: '',
};

// ─── Session ID helpers ───────────────────────────────────────────────────────

const GUEST_ID_KEY = 'cocospice_guest_id';

/**
 * Returns a stable session identifier:
 * - Logged-in user → their user.id
 * - Guest → a UUID stored in localStorage (created once, persists across refreshes)
 */
function getSessionId(): string {
  const user = getCurrentUser();
  if (user?.id) return `user_${user.id}`;

  if (typeof window === 'undefined') return 'ssr_guest';

  let guestId = localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

// ─── Context type ─────────────────────────────────────────────────────────────

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: MenuItem, selectedExtraOptions?: ExtraOption[]) => void;
  updateQuantity: (index: number, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  totalItems: number;
  orderType: 'delivery' | 'collection';
  setOrderType: (type: 'delivery' | 'collection') => void;
  orderNote: string;
  setOrderNote: (note: string) => void;
  shippingAddress: Address;
  setShippingAddress: (address: Address) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function CartProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { items, orderType, orderNote } = useSelector((s: RootState) => s.cart);

  // Shipping address stays local (filled at checkout, not persisted)
  const [shippingAddress, setShippingAddress] = React.useState<Address>(EMPTY_ADDRESS);

  // ── On mount: fetch server cart (merges with / overrides localStorage) ──────
  useEffect(() => {
    const sessionId = getSessionId();
    dispatch(fetchCartFromServer(sessionId));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Debounced sync: push to server 1.5 s after any cart change ──────────────
  const syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => {
      const sessionId = getSessionId();
      dispatch(syncCartToServer({ sessionId, items, orderType, orderNote }));
    }, 1500);

    return () => {
      if (syncTimer.current) clearTimeout(syncTimer.current);
    };
  }, [items, orderType, orderNote, dispatch]);

  // ── Public API ─────────────────────────────────────────────────────────────

  const addToCart = (item: MenuItem, selectedExtraOptions?: ExtraOption[]) =>
    dispatch(addToCartAction({ item, selectedExtraOptions }));

  const updateQuantity = (index: number, delta: number) =>
    dispatch(updateQuantityAction({ index, delta }));

  const clearCart = () => {
    dispatch(clearCartAction());
    // Immediately sync the empty cart to the server so it doesn't repopulate
    // on the next page load (the debounced sync would be cancelled by the redirect).
    const sessionId = getSessionId();
    dispatch(syncCartToServer({ sessionId, items: [], orderType, orderNote }));
  };

  const setOrderType = (type: 'delivery' | 'collection') =>
    dispatch(setOrderTypeAction(type));

  const setOrderNote = (note: string) => dispatch(setOrderNoteAction(note));

  // ── Derived values ─────────────────────────────────────────────────────────

  const cartTotal  = items.reduce((sum, item) => sum + calcItemUnitPrice(item) * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart: items,
      addToCart,
      updateQuantity,
      clearCart,
      cartTotal,
      totalItems,
      orderType,
      setOrderType,
      orderNote,
      setOrderNote,
      shippingAddress,
      setShippingAddress,
    }}>
      {children}
    </CartContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
