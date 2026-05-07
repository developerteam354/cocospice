'use client';

/**
 * AuthInitializer — restores user session on app load.
 *
 * On every app load / browser refresh:
 * 1. Attempts to restore session via /auth/me (uses HttpOnly refresh cookie)
 * 2. If that fails, tries explicit refresh via /auth/refresh
 * 
 * Placed inside ReduxProvider but OUTSIDE PersistGate so it runs
 * as early as possible, before the cart rehydration spinner even shows.
 *
 * This ensures the auth state is populated before any page renders,
 * preventing the "logged out flash" on page refresh.
 */

import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { toast } from 'sonner';
import type { AppDispatch } from './store';
import { checkAuth, refreshToken, getAccessToken } from './slices/userAuthSlice';

const BLOCKED_MSG = 'Your account has been blocked by the Administrator. Please contact support.';

export default function AuthInitializer() {
  const dispatch = useDispatch<AppDispatch>();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = getAccessToken();

    const handleBlocked = () => {
      toast.error(BLOCKED_MSG, { duration: 8000 });
    };

    if (token) {
      dispatch(checkAuth()).unwrap().catch((reason: unknown) => {
        if (reason === 'USER_BLOCKED') { handleBlocked(); return; }
        dispatch(refreshToken()).unwrap().catch((r: unknown) => {
          if (r === 'USER_BLOCKED') handleBlocked();
        });
      });
    } else {
      dispatch(refreshToken()).unwrap().catch((reason: unknown) => {
        if (reason === 'USER_BLOCKED') handleBlocked();
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
