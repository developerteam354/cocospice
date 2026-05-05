import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { CartItem, MenuItem, ExtraOption } from '../../types';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Effective unit price = base price + sum of selected extra option prices */
export function calcItemUnitPrice(item: CartItem): number {
  return item.price + (item.selectedExtraOptions ?? []).reduce((s, e) => s + e.price, 0);
}

/** Serialise extras for uniqueness comparison */
const extrasKey = (extras?: ExtraOption[]) => JSON.stringify(extras ?? []);

// ─── Async Thunks ─────────────────────────────────────────────────────────────

/**
 * Fetch saved cart from backend.
 * Uses sessionId (userId or guestId) — no JWT required.
 */
export const fetchCartFromServer = createAsyncThunk(
  'cart/fetchFromServer',
  async (sessionId: string, { rejectWithValue }) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/user/cart?sessionId=${encodeURIComponent(sessionId)}`
      );
      if (!res.ok) throw new Error('Failed to fetch cart');
      const data = await res.json();
      // Resolve productId from whichever field exists, then discard items with none
      const rawItems = (data.cart ?? []) as any[];
      const validItems = rawItems
        .map(item => ({
          ...item,
          id: item.id || item.productId || item._id || '',
        }))
        .filter(item => !!item.id) as CartItem[];

      return {
        items: validItems,
        orderType: (data.orderType ?? 'delivery') as 'delivery' | 'collection',
        orderNote: (data.orderNote ?? '') as string,
      };
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch cart');
    }
  }
);

/**
 * Sync current cart to backend.
 * Uses sessionId — no JWT required.
 */
export const syncCartToServer = createAsyncThunk(
  'cart/syncToServer',
  async (
    {
      sessionId,
      items,
      orderType,
      orderNote,
    }: {
      sessionId: string;
      items: CartItem[];
      orderType: 'delivery' | 'collection';
      orderNote: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const res = await fetch(`${API_BASE_URL}/user/cart/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          // Only sync items that have a valid productId
          items: items
            .filter(item => !!(item.id || (item as any).productId))
            .map(item => ({ ...item, productId: item.id || (item as any).productId })),
          orderType,
          orderNote,
        }),
      });
      if (!res.ok) throw new Error('Failed to sync cart');
      return true;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to sync cart');
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface CartState {
  items: CartItem[];
  orderType: 'delivery' | 'collection';
  orderNote: string;
  syncing: boolean;
}

const initialState: CartState = {
  items: [],
  orderType: 'delivery',
  orderNote: '',
  syncing: false,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    /** Add item to cart. Same product + same extras → increment quantity */
    addToCart: (
      state,
      action: PayloadAction<{ item: MenuItem; selectedExtraOptions?: ExtraOption[] }>
    ) => {
      const { item, selectedExtraOptions } = action.payload;
      const key = extrasKey(selectedExtraOptions);
      const existing = state.items.find(
        (c) => c.id === item.id && extrasKey(c.selectedExtraOptions) === key
      );
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ ...item, quantity: 1, selectedExtraOptions });
      }
    },

    /** Update quantity by delta (+1 / -1). Removes item when quantity reaches 0 */
    updateQuantity: (state, action: PayloadAction<{ index: number; delta: number }>) => {
      const { index, delta } = action.payload;
      const item = state.items[index];
      if (!item) return;
      item.quantity = Math.max(0, item.quantity + delta);
      if (item.quantity === 0) state.items.splice(index, 1);
    },

    /** Remove a single item by index */
    removeItem: (state, action: PayloadAction<number>) => {
      state.items.splice(action.payload, 1);
    },

    /** Wipe the entire cart */
    clearCart: (state) => {
      state.items = [];
    },

    /** Replace cart wholesale (used after server fetch) */
    setCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;
    },

    setOrderType: (state, action: PayloadAction<'delivery' | 'collection'>) => {
      state.orderType = action.payload;
    },

    setOrderNote: (state, action: PayloadAction<string>) => {
      state.orderNote = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // When server cart loads, replace local state (server is source of truth for logged-in users)
      .addCase(fetchCartFromServer.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.orderType = action.payload.orderType;
        state.orderNote = action.payload.orderNote;
      })
      .addCase(syncCartToServer.pending, (state) => {
        state.syncing = true;
      })
      .addCase(syncCartToServer.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(syncCartToServer.rejected, (state) => {
        state.syncing = false;
      });
  },
});

export const {
  addToCart,
  updateQuantity,
  removeItem,
  clearCart,
  setCart,
  setOrderType,
  setOrderNote,
} = cartSlice.actions;

export default cartSlice.reducer;
