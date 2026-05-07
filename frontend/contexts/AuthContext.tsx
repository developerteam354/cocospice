'use client';

/**
 * AuthContext — thin wrapper around userAuthSlice.
 *
 * Keeps the same public API so all existing consumers work unchanged.
 * Real auth now uses JWT (access token in memory, refresh token in HttpOnly cookie).
 */

import React, { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import {
  loginUser,
  registerUser,
  logoutUser,
  setIntendedPath,
} from '../store/slices/userAuthSlice';
import { persistUserSession } from '../services/authService';
import type { User } from '../types';

interface AuthContextType {
  user:            User | null;
  isLoading:       boolean;
  isAuthenticated: boolean;
  isInitialized:   boolean;
  login:   (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup:  (name: string, email: string, password: string, phone?: string) => Promise<{ success: boolean; error?: string }>;
  logout:  () => void;
  /** Store the path the user was trying to reach before being asked to log in */
  setIntended: (path: string | null) => void;
  intendedPath: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, isLoading, isInitialized, intendedPath } = useSelector(
    (s: RootState) => s.userAuth
  );

  // Keep sessionStorage in sync so addressSlice/cartSlice can read the user id
  useEffect(() => {
    persistUserSession(user);
  }, [user]);

  const login = async (email: string, password: string) => {
    const result = await dispatch(loginUser({ email, password }));
    if (loginUser.fulfilled.match(result)) return { success: true };
    return { success: false, error: result.payload as string };
  };

  const signup = async (name: string, email: string, password: string, phone?: string) => {
    const result = await dispatch(registerUser({ name, email, password, phone }));
    if (registerUser.fulfilled.match(result)) return { success: true };
    return { success: false, error: result.payload as string };
  };

  const logout = () => {
    dispatch(logoutUser());
  };

  const setIntended = (path: string | null) => {
    dispatch(setIntendedPath(path));
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      isInitialized,
      login,
      signup,
      logout,
      setIntended,
      intendedPath,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
