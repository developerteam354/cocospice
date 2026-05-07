import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import authService, { tokenCookie } from '@/services/authService';
import type {
  IAdmin,
  IAuthState,
  ILoginCredentials,
  IAuthResponse,
  IRefreshResponse,
} from '@/types/auth';

// ─── Thunks ──────────────────────────────────────────────────────────────────

export const loginAdmin = createAsyncThunk<IAuthResponse, ILoginCredentials>(
  'auth/loginAdmin',
  async (credentials, { rejectWithValue }) => {
    try {
      return await authService.login(credentials); // sets cookie internally
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Login failed');
    }
  }
);

export const refreshToken = createAsyncThunk<IRefreshResponse>(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      return await authService.refresh(); // sets cookie internally
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Session expired');
    }
  }
);

export const getMe = createAsyncThunk<IAdmin>(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const { admin } = await authService.getMe();
      return admin;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to get user');
    }
  }
);

export const logoutAdmin = createAsyncThunk<void>(
  'auth/logoutAdmin',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout(); // removes cookie internally
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Logout failed');
    }
  }
);

export const updateProfile = createAsyncThunk<
  IAdmin,
  { fullName?: string; profileImage?: string }
>(
  'auth/updateProfile',
  async (updates, { rejectWithValue }) => {
    try {
      const { admin } = await authService.updateProfile(updates);
      return admin;
    } catch (err: unknown) {
      return rejectWithValue(err instanceof Error ? err.message : 'Failed to update profile');
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const initialState: IAuthState = {
  admin: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
  isRefreshing: false,
  isInitialized: false, // becomes true after first getMe/refresh attempt
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.isRefreshing = false;
      state.isInitialized = true;
      state.error = null;
      tokenCookie.remove();
    },
    clearError(state) {
      state.error = null;
    },
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
  },
  extraReducers: (builder) => {
    // ── loginAdmin ───────────────────────────────────────────────────────────
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action: PayloadAction<IAuthResponse>) => {
        state.loading = false;
        state.isInitialized = true;
        state.admin = action.payload.admin;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      });

    // ── getMe ────────────────────────────────────────────────────────────────
    builder
      .addCase(getMe.pending, (state) => {
        state.isRefreshing = true;
      })
      .addCase(getMe.fulfilled, (state, action: PayloadAction<IAdmin>) => {
        state.isRefreshing = false;
        state.isInitialized = true;
        state.admin = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getMe.rejected, (state) => {
        state.isRefreshing = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        tokenCookie.remove();
      });

    // ── refreshToken ─────────────────────────────────────────────────────────
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isRefreshing = true;
        state.error = null;
      })
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<IRefreshResponse>) => {
        state.isRefreshing = false;
        state.isInitialized = true;
        state.admin = action.payload.admin;
        state.token = action.payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isRefreshing = false;
        state.isInitialized = true;
        state.admin = null;
        state.token = null;
        state.isAuthenticated = false;
      });

    // ── logoutAdmin ──────────────────────────────────────────────────────────
    builder.addCase(logoutAdmin.fulfilled, (state) => {
      state.admin = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    });

    // ── updateProfile ────────────────────────────────────────────────────────
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<IAdmin>) => {
        state.loading = false;
        state.admin = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
