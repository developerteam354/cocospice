import Cookies from 'js-cookie';
import { publicApi, privateApi } from './api';
import type { ILoginCredentials, IAuthResponse, IRefreshResponse, IAdmin } from '@/types/auth';

const COOKIE_KEY = 'accessToken';
const COOKIE_OPTS: Cookies.CookieAttributes = {
  expires:  7,
  path:     '/',
  sameSite: 'lax',  // must match backend — 'strict' blocks cross-port on localhost
  // secure: true   // enable in production
};

export const tokenCookie = {
  set: (token: string) => Cookies.set(COOKIE_KEY, token, COOKIE_OPTS),
  get: ()              => Cookies.get(COOKIE_KEY),
  remove: ()           => Cookies.remove(COOKIE_KEY, { path: '/' }),
};

const authService = {
  login: async (credentials: ILoginCredentials): Promise<IAuthResponse> => {
    const { data } = await publicApi.post<IAuthResponse>('/auth/login', credentials);
    tokenCookie.set(data.accessToken);
    return data;
  },

  refresh: async (): Promise<IRefreshResponse> => {
    const { data } = await publicApi.post<IRefreshResponse>('/auth/refresh');
    tokenCookie.set(data.accessToken);
    return data;
  },

  getMe: async (): Promise<{ admin: IAdmin }> => {
    const { data } = await privateApi.get<{ admin: IAdmin }>('/auth/me');
    return data;
  },

  logout: async (): Promise<void> => {
    await privateApi.post('/auth/logout');
    tokenCookie.remove();
  },

  updateProfile: async (updates: { fullName?: string; profileImage?: string }): Promise<{ admin: IAdmin; message: string }> => {
    console.log('[AuthService] updateProfile called with:', updates);
    const { data } = await privateApi.patch<{ admin: IAdmin; message: string }>('/auth/profile', updates);
    console.log('[AuthService] updateProfile response:', data);
    return data;
  },
};

export default authService;
