'use client';

import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { ThreeDot } from 'react-loading-indicators';

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
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '1rem',
        background: 'var(--bg-color, #fff)',
      }}>
        <ThreeDot color="#ff6b35" size="medium" />
        <p style={{ color: '#666', fontSize: '14px' }}>Loading...</p>
      </div>
    );
  }

  return <>{children}</>;
}
