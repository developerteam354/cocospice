import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import userService from '@/services/userService';
import type { IUser, IUserStats } from '@/types/user';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchAllUsers = createAsyncThunk<IUser[]>(
  'users/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getAll();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch users');
    }
  }
);

export const fetchUserStats = createAsyncThunk<IUserStats>(
  'users/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getStats();
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to fetch stats');
    }
  }
);

export const toggleUserStatus = createAsyncThunk<{ _id: string; isActive: boolean }, string>(
  'users/toggleStatus',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.toggleStatus(userId);
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update status');
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface UserState {
  users:        IUser[];
  stats:        IUserStats;
  isLoading:    boolean;
  statsLoading: boolean;
  toggling:     string | null; // userId currently being toggled
  error:        string | null;
}

const initialState: UserState = {
  users:        [],
  stats:        { total: 0, active: 0, blocked: 0 },
  isLoading:    false,
  statsLoading: false,
  toggling:     null,
  error:        null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    // fetchAllUsers
    builder
      .addCase(fetchAllUsers.pending, (state) => {
        state.isLoading = true;
        state.error     = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action: PayloadAction<IUser[]>) => {
        state.isLoading = false;
        state.users     = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error     = action.payload as string;
      });

    // fetchUserStats
    builder
      .addCase(fetchUserStats.pending,   (state) => { state.statsLoading = true; })
      .addCase(fetchUserStats.fulfilled, (state, action: PayloadAction<IUserStats>) => {
        state.statsLoading = false;
        state.stats        = action.payload;
      })
      .addCase(fetchUserStats.rejected,  (state) => { state.statsLoading = false; });

    // toggleUserStatus — optimistic stat update
    builder
      .addCase(toggleUserStatus.pending, (state, action) => {
        state.toggling = action.meta.arg;
      })
      .addCase(toggleUserStatus.fulfilled, (state, action) => {
        state.toggling = null;
        const idx = state.users.findIndex(u => u._id === action.payload._id);
        if (idx !== -1) state.users[idx].isActive = action.payload.isActive;

        // Update stat counters
        if (action.payload.isActive) {
          // was blocked → now active
          state.stats.blocked = Math.max(0, state.stats.blocked - 1);
          state.stats.active  = state.stats.active + 1;
        } else {
          // was active → now blocked
          state.stats.active  = Math.max(0, state.stats.active - 1);
          state.stats.blocked = state.stats.blocked + 1;
        }
      })
      .addCase(toggleUserStatus.rejected, (state, action) => {
        state.toggling = null;
        state.error    = action.payload as string;
      });
  },
});

export const { clearError } = userSlice.actions;
export default userSlice.reducer;
