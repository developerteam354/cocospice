import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import { privateApi } from '../../lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  selectedExtraOptions?: Array<{ name: string; price: number }>;
  subtotal: number;
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  phone: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'On the Way' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'Cash on Delivery' | 'Card' | 'Online';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';

export interface Order {
  _id: string;
  orderId: string;
  userId: string;
  items: OrderItem[];
  orderType: 'delivery' | 'collection';
  orderNote: string;
  subtotal: number;
  codCharge: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingAddress?: ShippingAddress;
  createdAt: string;
  updatedAt: string;
}

interface PlaceOrderData {
  items: OrderItem[];
  orderType: 'delivery' | 'collection';
  orderNote?: string;
  subtotal: number;
  codCharge: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus?: PaymentStatus;
  stripePaymentIntentId?: string;
  shippingAddress?: ShippingAddress;
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const placeOrder = createAsyncThunk<Order, PlaceOrderData>(
  'order/placeOrder',
  async (orderData, { rejectWithValue }) => {
    try {
      const { data } = await privateApi.post('/orders', orderData);
      return data.order;
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      const message = axiosErr?.response?.data?.message || 'Failed to place order';
      return rejectWithValue(message);
    }
  }
);

export const fetchUserOrders = createAsyncThunk<Order[]>(
  'order/fetchUserOrders',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await privateApi.get('/orders');
      return data.orders;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch orders';
      return rejectWithValue(message);
    }
  }
);

export const fetchOrderById = createAsyncThunk<Order, string>(
  'order/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      const { data } = await privateApi.get(`/orders/${orderId}`);
      return data.order;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch order';
      return rejectWithValue(message);
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface OrderState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  placing: boolean;
  error: string | null;
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  loading: false,
  placing: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearCurrentOrder(state) {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    // ── placeOrder ───────────────────────────────────────────────────────────
    builder
      .addCase(placeOrder.pending, (state) => {
        state.placing = true;
        state.error = null;
      })
      .addCase(placeOrder.fulfilled, (state, action: PayloadAction<Order>) => {
        state.placing = false;
        state.currentOrder = action.payload;
        state.orders.unshift(action.payload); // Add to beginning of list
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.placing = false;
        state.error = action.payload as string;
      });

    // ── fetchUserOrders ──────────────────────────────────────────────────────
    builder
      .addCase(fetchUserOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchUserOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── fetchOrderById ───────────────────────────────────────────────────────
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<Order>) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
