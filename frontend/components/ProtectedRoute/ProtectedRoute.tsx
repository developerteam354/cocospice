'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../AuthModal/AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute — wraps pages that require authentication.
 *
 * Behaviour:
 * - While auth is loading → show loading spinner
 * - If authenticated → render children normally
 * - If NOT authenticated → show AuthModal with blurred background
 * - If modal is closed without login → redirect to home page
 *
 * The intended path is stored in Redux so after successful login,
 * the user can be redirected back to where they wanted to go.
 */
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, isInitialized, setIntended } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Only show modal after auth has been initialized
    if (isInitialized && !isLoading && !isAuthenticated) {
      setIntended(pathname);
      setShowModal(true);
    }
    if (isAuthenticated) {
      setShowModal(false);
      setIsRedirecting(false);
    }
  }, [isLoading, isAuthenticated, isInitialized, pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Show loading during initial auth check or subsequent auth operations
  if (!isInitialized || isLoading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid rgba(16,185,129,0.2)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Show redirecting state when user closes modal without logging in
  if (isRedirecting) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}>
        <div style={{
          width: 36,
          height: 36,
          border: '3px solid rgba(16,185,129,0.2)',
          borderTopColor: '#10b981',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <p style={{ color: '#666', fontSize: '14px' }}>Redirecting to home...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const handleModalClose = () => {
    // Clear intended destination
    setIntended(null);
    setShowModal(false);
    setIsRedirecting(true);
    
    // Redirect to home page
    router.push('/');
  };

  const handleLoginSuccess = () => {
    setShowModal(false);
    setIsRedirecting(false);
    // User is now authenticated, they'll stay on the protected route
  };

  return (
    <>
      {/* Always render children — modal sits on top when not authenticated */}
      <div style={{ 
        filter: showModal ? 'blur(3px)' : 'none', 
        pointerEvents: showModal ? 'none' : 'auto', 
        transition: 'filter 0.2s',
        opacity: showModal ? 0.6 : 1,
      }}>
        {children}
      </div>

      {showModal && (
        <AuthModal
          initialMode="login"
          onClose={handleModalClose}
          onSuccess={handleLoginSuccess}
          intendedPath={pathname}
        />
      )}
    </>
  );
}
