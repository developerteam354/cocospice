import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

// Minimal store shape — avoids circular import with store.ts
interface StoreShape {
  getState: () => { auth: { token: string | null } };
  dispatch: (action: unknown) => Promise<unknown>;
}

const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/admin`;

// ─── Public Instance ──────────────────────────────────────────────────────────
// Unauthenticated: login, refresh, register

export const publicApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, // sends HttpOnly refresh cookie
});

// ─── Private Instance ─────────────────────────────────────────────────────────
// Authenticated: all protected routes

export const privateApi: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// ─── Store Injection ──────────────────────────────────────────────────────────

let store: StoreShape;

export const injectStore = (appStore: StoreShape): void => {
  store = appStore;
};

// ─── Silent Refresh State ─────────────────────────────────────────────────────
// Prevents multiple simultaneous refresh calls (queue pattern)

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null): void => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token!);
  });
  failedQueue = [];
};

// ─── Request Interceptor ──────────────────────────────────────────────────────

privateApi.interceptors.request.use(
  (config) => {
    const token = store?.getState().auth.token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    
    // If sending FormData, remove Content-Type to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────

privateApi.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Queue subsequent 401s while a refresh is in progress
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return privateApi(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Dynamically import to avoid circular dependency at module load time
      const { refreshToken, logout } = await import('@/store/slices/authSlice');
      const result = await store.dispatch(refreshToken());

      if (refreshToken.fulfilled.match(result)) {
        const newToken = (result.payload as { accessToken: string }).accessToken;
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return privateApi(originalRequest);
      } else {
        // Refresh failed — clear state and redirect to login
        processQueue(new Error('Session expired'), null);
        store.dispatch(logout());
        if (typeof window !== 'undefined') window.location.href = '/admin/login';
        return Promise.reject(error);
      }
    } catch (refreshError) {
      processQueue(refreshError, null);
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
