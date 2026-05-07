import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types';
import { publicApi, privateApi, setAccessToken, getAccessToken } from '../../lib/api';

// Re-export for backward compatibility
export { getAccessToken, setAccessToken };

// ─── Thunks ───────────────────────────────────────────────────────────────────

/** Called on app mount — uses HttpOnly cookie to restore session */
export const checkAuth = createAsyncThunk(
  'userAuth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await publicApi.get('/auth/me');
      setAccessToken(data.accessToken);
      return data.user as User;
    } catch (err: unknown) {
      setAccessToken(null);
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
      // Blocked accounts: reject with a specific code so the reducer can handle it
      if (code === 'USER_BLOCKED') return rejectWithValue('USER_BLOCKED');
      return rejectWithValue(null); // silent — user is just not logged in
    }
  }
);

/** Refresh access token using HttpOnly refresh cookie */
export const refreshToken = createAsyncThunk(
  'userAuth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await publicApi.post('/auth/refresh');
      setAccessToken(data.accessToken);
      return { user: data.user as User, accessToken: data.accessToken };
    } catch (err: unknown) {
      setAccessToken(null);
      const code = (err as { response?: { data?: { code?: string } } })?.response?.data?.code;
      if (code === 'USER_BLOCKED') return rejectWithValue('USER_BLOCKED');
      return rejectWithValue(err instanceof Error ? err.message : 'Session expired');
    }
  }
);

export const loginUser = createAsyncThunk(
  'userAuth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const { data } = await publicApi.post('/auth/login', { email, password });
      setAccessToken(data.accessToken);
      return data.user as User;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
      return rejectWithValue(message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'userAuth/register',
  async (
    { name, email, password, phone }: { name: string; email: string; password: string; phone?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await publicApi.post('/auth/register', { name, email, password, phone });
      setAccessToken(data.accessToken);
      return data.user as User;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
      return rejectWithValue(message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'userAuth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await publicApi.post('/auth/logout');
      setAccessToken(null);
    } catch (err: unknown) {
      setAccessToken(null);
      return rejectWithValue(err instanceof Error ? err.message : 'Logout failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'userAuth/updateProfile',
  async (
    profileData: { name?: string; email?: string; phone?: string; profileImage?: string; password?: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await privateApi.patch('/profile', profileData);
      return data.user as User;
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Profile update failed';
      return rejectWithValue(message);
    }
  }
);

// ─── State ────────────────────────────────────────────────────────────────────

interface UserAuthState {
  user:            User | null;
  isAuthenticated: boolean;
  isLoading:       boolean;   // initial checkAuth
  isSubmitting:    boolean;   // login / register in progress
  isUpdating:      boolean;   // profile update in progress
  isInitialized:   boolean;   // true after first auth check completes
  error:           string | null;
  /** Path to redirect to after successful login */
  intendedPath:    string | null;
}

const initialState: UserAuthState = {
  user:            null,
  isAuthenticated: false,
  isLoading:       true,  // true until checkAuth resolves
  isSubmitting:    false,
  isUpdating:      false,
  isInitialized:   false, // becomes true after first checkAuth/refresh attempt
  error:           null,
  intendedPath:    null,
};

// ─── Slice ────────────────────────────────────────────────────────────────────

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {
    setIntendedPath(state, action: PayloadAction<string | null>) {
      state.intendedPath = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    /** Called by the axios interceptor when a USER_BLOCKED 403 is received */
    forceLogout(state) {
      state.user            = null;
      state.isAuthenticated = false;
      state.isInitialized   = true;
      state.intendedPath    = null;
      state.error           = null;
    },
  },
  extraReducers: (builder) => {
    // ── checkAuth ──
    builder
      .addCase(checkAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading       = false;
        state.isInitialized   = true;
        state.user            = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.isLoading       = false;
        state.isInitialized   = true;
        state.user            = null;
        state.isAuthenticated = false;
        // USER_BLOCKED: keep isInitialized true, clear everything
        if (action.payload === 'USER_BLOCKED') {
          state.error = null; // toast is shown by the caller
        }
      });

    // ── refreshToken ──
    builder
      .addCase(refreshToken.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
        state.isLoading       = false;
        state.isInitialized   = true;
        state.user            = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.isLoading       = false;
        state.isInitialized   = true;
        state.user            = null;
        state.isAuthenticated = false;
        if (action.payload === 'USER_BLOCKED') {
          state.error = null;
        }
      });

    // ── login ──
    builder
      .addCase(loginUser.pending, (state) => {
        state.isSubmitting = true;
        state.error        = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isSubmitting    = false;
        state.user            = action.payload;
        state.isAuthenticated = true;
        state.error           = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error        = action.payload as string;
      });

    // ── register ──
    builder
      .addCase(registerUser.pending, (state) => {
        state.isSubmitting = true;
        state.error        = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.isSubmitting    = false;
        state.user            = action.payload;
        state.isAuthenticated = true;
        state.error           = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error        = action.payload as string;
      });

    // ── logout ──
    builder
      .addCase(logoutUser.fulfilled, (state) => {
        state.user            = null;
        state.isAuthenticated = false;
        state.intendedPath    = null;
        state.error           = null;
      });

    // ── updateProfile ──
    builder
      .addCase(updateProfile.pending, (state) => {
        state.isUpdating = true;
        state.error      = null;
      })
      .addCase(updateProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isUpdating = false;
        state.user       = action.payload; // persist latest user data in Redux
        state.error      = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error      = action.payload as string;
      });
  },
});

export const { setIntendedPath, clearError, forceLogout } = userAuthSlice.actions;
export default userAuthSlice.reducer;
