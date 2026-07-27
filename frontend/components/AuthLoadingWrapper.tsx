'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import LogoPreloader from './LogoPreloader/LogoPreloader';

/**
 * AuthLoadingWrapper — shows a loading screen while auth is initializing.
 * 
 * This prevents the UI from flickering to a "Logged Out" state during
 * the initial auth check on page load/refresh.
 */
export default function AuthLoadingWrapper({ children }: { children: React.ReactNode }) {
  const { isInitialized, isLoading } = useSelector((s: RootState) => s.userAuth);

  // Show loading screen while auth is initializing
  if (!isInitialized && isLoading) {
    return <LogoPreloader />;
  }

  return <>{children}</>;
}
