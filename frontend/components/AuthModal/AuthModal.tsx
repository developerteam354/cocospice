'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import styles from './AuthModal.module.css';

interface AuthModalProps {
  initialMode?: 'login' | 'signup';
  onClose: () => void;
  onSuccess?: () => void;
  /** If set, navigate here after successful auth instead of /profile */
  intendedPath?: string | null;
}

export default function AuthModal({ initialMode = 'login', onClose, onSuccess, intendedPath }: AuthModalProps) {
  const { login, signup, setIntended } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [phone,    setPhone]    = useState('');

  const resetForm = () => {
    setName(''); setEmail(''); setPassword(''); setPhone('');
    setError(''); setShowPassword(false);
  };

  const switchMode = () => { setMode(m => m === 'login' ? 'signup' : 'login'); resetForm(); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      let result: { success: boolean; error?: string };

      if (mode === 'login') {
        result = await login(email, password);
      } else {
        if (!name.trim()) { setError('Please enter your name'); setIsSubmitting(false); return; }
        result = await signup(name, email, password, phone || undefined);
      }

      if (result.success) {
        // Clear intended path after successful login
        setIntended(null);
        
        // Call onSuccess callback
        onSuccess?.();
        
        // Close modal
        onClose();
        
        // Navigate to intended path if provided and onSuccess didn't handle it
        if (intendedPath && !onSuccess) {
          router.push(intendedPath);
        }
      } else {
        setError(result.error || 'Something went wrong');
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    // Clear intended path when modal is closed without logging in
    setIntended(null);
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) handleClose();
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        {/* Close Button */}
        <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.brandIcon}>🍛</div>
          <h2 className={styles.title}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className={styles.subtitle}>
            {mode === 'login'
              ? 'Sign in to your Cocospice account'
              : 'Join Cocospice for a premium dining experience'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className={styles.tabSwitcher}>
          <button
            className={`${styles.tab} ${mode === 'login' ? styles.activeTab : ''}`}
            onClick={() => { setMode('login'); resetForm(); }}
          >
            Sign In
          </button>
          <button
            className={`${styles.tab} ${mode === 'signup' ? styles.activeTab : ''}`}
            onClick={() => { setMode('signup'); resetForm(); }}
          >
            Sign Up
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBanner}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 5v3.5M8 10.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className={styles.form}>
          {mode === 'signup' && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="auth-name">Full Name</label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <circle cx="9" cy="5.5" r="3" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M2.5 15.5c0-3 2.9-5 6.5-5s6.5 2 6.5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  id="auth-name"
                  type="text"
                  className={styles.input}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="auth-email">Email Address</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M2 6l7 4.5L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                id="auth-email"
                type="email"
                className={styles.input}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="auth-password">Password</label>
            <div className={styles.inputWrapper}>
              <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 18 18" fill="none">
                <rect x="3" y="8" width="12" height="8" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M6 8V5.5a3 3 0 016 0V8" stroke="currentColor" strokeWidth="1.5"/>
                <circle cx="9" cy="12" r="1" fill="currentColor"/>
              </svg>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                className={styles.input}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                className={styles.togglePassword}
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2.5 9s2.5-4.5 6.5-4.5S15.5 9 15.5 9s-2.5 4.5-6.5 4.5S2.5 9 2.5 9z" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M3 15L15 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M2.5 9s2.5-4.5 6.5-4.5S15.5 9 15.5 9s-2.5 4.5-6.5 4.5S2.5 9 2.5 9z" stroke="currentColor" strokeWidth="1.5"/>
                    <circle cx="9" cy="9" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {mode === 'signup' && (
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="auth-phone">
                Phone <span className={styles.optional}>(optional)</span>
              </label>
              <div className={styles.inputWrapper}>
                <svg className={styles.inputIcon} width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="4" y="1" width="10" height="16" rx="2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="9" cy="14" r="1" fill="currentColor"/>
                </svg>
                <input
                  id="auth-phone"
                  type="tel"
                  className={styles.input}
                  placeholder="+44 7700 900000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  autoComplete="tel"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className={styles.spinner} />
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        {/* Footer */}
        <div className={styles.footer}>
          <span className={styles.footerText}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button className={styles.switchBtn} onClick={switchMode}>
            {mode === 'login' ? 'Sign Up' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
}
