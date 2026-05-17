import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import settingsService from '@/services/settingsService';
import type { IShopStatus } from '@/services/settingsService';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchShopStatus = createAsyncThunk<IShopStatus>(
  'settings/fetchShopStatus',
  async (_, { rejectWithValue }) => {
    try {
      return await settingsService.getShopStatus();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch shop status';
      return rejectWithValue(message);
    }
  }
);

export const setShopStatus = createAsyncThunk<
  IShopStatus,
  { isOpen: boolean; closingReason?: string }
>(
  'settings/setShopStatus',
  async ({ isOpen, closingReason }, { rejectWithValue }) => {
    try {
      return await settingsService.updateShopStatus(isOpen, closingReason);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update shop status';
      return rejectWithValue(message);
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface SettingsState {
  shopStatus:  IShopStatus | null;
  loading:     boolean;
  saving:      boolean;
  error:       string | null;
}

const initialState: SettingsState = {
  shopStatus: null,
  loading:    false,
  saving:     false,
  error:      null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    // fetchShopStatus
    builder
      .addCase(fetchShopStatus.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(fetchShopStatus.fulfilled, (state, action: PayloadAction<IShopStatus>) => {
        state.loading    = false;
        state.shopStatus = action.payload;
      })
      .addCase(fetchShopStatus.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });

    // setShopStatus
    builder
      .addCase(setShopStatus.pending, (state) => {
        state.saving = true;
        state.error  = null;
      })
      .addCase(setShopStatus.fulfilled, (state, action: PayloadAction<IShopStatus>) => {
        state.saving     = false;
        state.shopStatus = action.payload;
      })
      .addCase(setShopStatus.rejected, (state, action) => {
        state.saving = false;
        state.error  = action.payload as string;
      });
  },
});

export const { clearError } = settingsSlice.actions;
export default settingsSlice.reducer;
