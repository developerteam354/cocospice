'use client';

import { useEffect, useRef } from 'react';
import { useAppDispatch } from './hooks';
import { getMe, refreshToken } from './slices/authSlice';
import { tokenCookie } from '@/services/authService';

/**
 * On every app load / browser refresh:
 * 1. If accessToken cookie exists → call GET /auth/me to restore Redux state
 * 2. If no accessToken but refreshToken HttpOnly cookie may exist → call /auth/refresh
 *    which will issue a new accessToken and restore the session
 * Renders nothing — purely a side-effect component.
 */
export default function AuthInitializer() {
  const dispatch    = useAppDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = tokenCookie.get();

    if (token) {
      // Token in cookie — restore state via getMe
      dispatch(getMe()).unwrap().catch(() => {
        // getMe failed (expired token) — try silent refresh
        dispatch(refreshToken());
      });
    } else {
      // No access token — try silent refresh via HttpOnly refresh cookie
      dispatch(refreshToken());
    }
  }, [dispatch]);

  return null;
}
