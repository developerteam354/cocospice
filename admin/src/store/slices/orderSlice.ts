import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import orderService from '@/services/orderService';
import type { IOrder, OrderStatus } from '@/types/order';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchNewOrders = createAsyncThunk<IOrder[]>(
  'orders/fetchNewOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getActive();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch new orders';
      return rejectWithValue(message);
    }
  }
);

export const fetchDeliveredOrders = createAsyncThunk<IOrder[]>(
  'orders/fetchDeliveredOrders',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getDelivered();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch delivered orders';
      return rejectWithValue(message);
    }
  }
);

export const fetchOrderById = createAsyncThunk<IOrder, string>(
  'orders/fetchOrderById',
  async (orderId, { rejectWithValue }) => {
    try {
      return await orderService.getById(orderId);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch order';
      return rejectWithValue(message);
    }
  }
);

export const updateOrderStatus = createAsyncThunk<
  IOrder,
  { orderId: string; status: OrderStatus }
>(
  'orders/updateOrderStatus',
  async ({ orderId, status }, { rejectWithValue }) => {
    try {
      return await orderService.updateStatus(orderId, status);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      return rejectWithValue(message);
    }
  }
);

export const fetchOrderStats = createAsyncThunk<{
  total: number;
  pending: number;
  confirmed: number;
  onTheWay: number;
  delivered: number;
  cancelled: number;
  active: number;
}>(
  'orders/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await orderService.getStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stats';
      return rejectWithValue(message);
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface OrderState {
  newOrders: IOrder[];
  deliveredOrders: IOrder[];
  currentOrder: IOrder | null;
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    onTheWay: number;
    delivered: number;
    cancelled: number;
    active: number;
  };
  loading: boolean;
  deliveredLoading: boolean;
  statsLoading: boolean;
  updating: boolean;
  error: string | null;
}

const initialState: OrderState = {
  newOrders: [],
  deliveredOrders: [],
  currentOrder: null,
  stats: {
    total: 0,
    pending: 0,
    confirmed: 0,
    onTheWay: 0,
    delivered: 0,
    cancelled: 0,
    active: 0,
  },
  loading: false,
  deliveredLoading: false,
  statsLoading: false,
  updating: false,
  error: null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const orderSlice = createSlice({
  name: 'orders',
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
    // ── fetchNewOrders ───────────────────────────────────────────────────────
    builder
      .addCase(fetchNewOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchNewOrders.fulfilled, (state, action: PayloadAction<IOrder[]>) => {
        state.loading = false;
        state.newOrders = action.payload;
      })
      .addCase(fetchNewOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── fetchDeliveredOrders ─────────────────────────────────────────────────
    builder
      .addCase(fetchDeliveredOrders.pending, (state) => {
        state.deliveredLoading = true;
        state.error = null;
      })
      .addCase(fetchDeliveredOrders.fulfilled, (state, action: PayloadAction<IOrder[]>) => {
        state.deliveredLoading = false;
        state.deliveredOrders = action.payload;
      })
      .addCase(fetchDeliveredOrders.rejected, (state, action) => {
        state.deliveredLoading = false;
        state.error = action.payload as string;
      });

    // ── fetchOrderById ───────────────────────────────────────────────────────
    builder
      .addCase(fetchOrderById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderById.fulfilled, (state, action: PayloadAction<IOrder>) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // ── updateOrderStatus ────────────────────────────────────────────────────
    builder
      .addCase(updateOrderStatus.pending, (state) => {
        state.updating = true;
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action: PayloadAction<IOrder>) => {
        state.updating = false;
        const updatedOrder = action.payload;

        // Update current order if it's the one being updated
        if (state.currentOrder?._id === updatedOrder._id) {
          state.currentOrder = updatedOrder;
        }

        // If order is now delivered, remove from newOrders and add to deliveredOrders
        if (updatedOrder.status === 'Delivered') {
          state.newOrders = state.newOrders.filter((o) => o._id !== updatedOrder._id);
          // Add to delivered orders if not already there
          if (!state.deliveredOrders.find((o) => o._id === updatedOrder._id)) {
            state.deliveredOrders.unshift(updatedOrder);
          }
        } else {
          // Update in newOrders list
          const index = state.newOrders.findIndex((o) => o._id === updatedOrder._id);
          if (index !== -1) {
            state.newOrders[index] = updatedOrder;
          }
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.updating = false;
        state.error = action.payload as string;
      });

    // ── fetchOrderStats ──────────────────────────────────────────────────────
    builder
      .addCase(fetchOrderStats.pending, (state) => {
        state.statsLoading = true;
      })
      .addCase(
        fetchOrderStats.fulfilled,
        (
          state,
          action: PayloadAction<{
            total: number;
            pending: number;
            confirmed: number;
            onTheWay: number;
            delivered: number;
            cancelled: number;
            active: number;
          }>
        ) => {
          state.statsLoading = false;
          state.stats = action.payload;
        }
      )
      .addCase(fetchOrderStats.rejected, (state) => {
        state.statsLoading = false;
      });
  },
});

export const { clearError, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;
