import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { SavedAddress } from '../../types';
import { getCurrentUser } from '../../services/authService';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api`;
const GUEST_ID_KEY = 'cocospice_guest_id';

// ─── Session ID helper (same as CartContext) ──────────────────────────────────

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

// ─── API response type ────────────────────────────────────────────────────────

interface ApiAddress {
  _id: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  phone: string;
  isDefault: boolean;
}

function toSavedAddress(a: ApiAddress): SavedAddress {
  return {
    id:        a._id,
    label:     a.label,
    fullName:  a.fullName,
    line1:     a.line1,
    line2:     a.line2 || '',
    city:      a.city,
    postcode:  a.postcode,
    phone:     a.phone,
    isDefault: a.isDefault,
  };
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAddresses = createAsyncThunk(
  'addresses/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const sessionId = getSessionId();
      const res = await fetch(
        `${API_BASE_URL}/user/addresses?sessionId=${encodeURIComponent(sessionId)}`
      );
      if (!res.ok) throw new Error('Failed to fetch addresses');
      const data = await res.json();
      return (data.addresses as ApiAddress[]).map(toSavedAddress);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch addresses');
    }
  }
);

export const addAddress = createAsyncThunk(
  'addresses/add',
  async (payload: Omit<SavedAddress, 'id'>, { rejectWithValue }) => {
    try {
      const sessionId = getSessionId();
      const res = await fetch(`${API_BASE_URL}/user/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...payload }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save address');
      }
      const data = await res.json();
      return toSavedAddress(data.address as ApiAddress);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to save address');
    }
  }
);

export const updateAddress = createAsyncThunk(
  'addresses/update',
  async (payload: SavedAddress, { rejectWithValue }) => {
    try {
      const sessionId = getSessionId();
      const { id, ...rest } = payload;
      const res = await fetch(`${API_BASE_URL}/user/addresses/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, ...rest }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to update address');
      }
      const data = await res.json();
      return toSavedAddress(data.address as ApiAddress);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update address');
    }
  }
);

export const deleteAddress = createAsyncThunk(
  'addresses/delete',
  async (id: string, { rejectWithValue }) => {
    try {
      const sessionId = getSessionId();
      const res = await fetch(
        `${API_BASE_URL}/user/addresses/${id}?sessionId=${encodeURIComponent(sessionId)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to delete address');
      }
      return id;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to delete address');
    }
  }
);

export const setDefaultAddress = createAsyncThunk(
  'addresses/setDefault',
  async (id: string, { rejectWithValue }) => {
    try {
      const sessionId = getSessionId();
      const res = await fetch(`${API_BASE_URL}/user/addresses/${id}/default`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to set default');
      }
      return id;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to set default');
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface AddressState {
  items: SavedAddress[];
  loading: boolean;
  saving: boolean;   // add / update in progress
  deleting: string | null; // id being deleted
  error: string | null;
}

const initialState: AddressState = {
  items:    [],
  loading:  false,
  saving:   false,
  deleting: null,
  error:    null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const addressSlice = createSlice({
  name: 'addresses',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    // ── Fetch ──
    builder
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action: PayloadAction<SavedAddress[]>) => {
        state.loading = false;
        state.items   = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // ── Add ──
    builder
      .addCase(addAddress.pending, (state) => {
        state.saving = true;
        state.error  = null;
      })
      .addCase(addAddress.fulfilled, (state, action: PayloadAction<SavedAddress>) => {
        state.saving = false;
        // If new address is default, unset others
        if (action.payload.isDefault) {
          state.items = state.items.map((a) => ({ ...a, isDefault: false }));
        }
        state.items.push(action.payload);
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.saving = false;
        state.error  = action.payload as string;
      });

    // ── Update ──
    builder
      .addCase(updateAddress.pending, (state) => {
        state.saving = true;
        state.error  = null;
      })
      .addCase(updateAddress.fulfilled, (state, action: PayloadAction<SavedAddress>) => {
        state.saving = false;
        if (action.payload.isDefault) {
          state.items = state.items.map((a) => ({ ...a, isDefault: false }));
        }
        const idx = state.items.findIndex((a) => a.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.saving = false;
        state.error  = action.payload as string;
      });

    // ── Delete ──
    builder
      .addCase(deleteAddress.pending, (state, action) => {
        state.deleting = action.meta.arg;
        state.error    = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action: PayloadAction<string>) => {
        const wasDefault = state.items.find((a) => a.id === action.payload)?.isDefault;
        state.items    = state.items.filter((a) => a.id !== action.payload);
        state.deleting = null;
        // Promote first remaining address to default if needed
        if (wasDefault && state.items.length > 0) {
          state.items[0].isDefault = true;
        }
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.deleting = null;
        state.error    = action.payload as string;
      });

    // ── Set Default ──
    builder
      .addCase(setDefaultAddress.fulfilled, (state, action: PayloadAction<string>) => {
        state.items = state.items.map((a) => ({
          ...a,
          isDefault: a.id === action.payload,
        }));
      });
  },
});

export const { clearError } = addressSlice.actions;
export default addressSlice.reducer;
