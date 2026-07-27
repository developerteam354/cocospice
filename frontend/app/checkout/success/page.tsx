'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { placeOrder } from '@/store/slices/orderSlice';
import stripePromise from '@/lib/stripe';
import type { AppDispatch, RootState } from '@/store/store';
import { PENDING_ORDER_KEY } from '@/app/checkout/payment/page';
import styles from './SuccessPage.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

type RedirectStatus = 'idle' | 'processing' | 'done' | 'failed';

export default function SuccessPage() {
  const { user }      = useAuth();
  const { orderType, clearCart } = useCart();
  const dispatch      = useDispatch<AppDispatch>();
  const searchParams  = useSearchParams();

  const [showDetails, setShowDetails]       = useState(false);
  const [redirectStatus, setRedirectStatus] = useState<RedirectStatus>('idle');
  const [redirectError, setRedirectError]   = useState<string | null>(null);
  const handledRef = useRef(false); // prevent double-fire in React StrictMode

  // Real order from Redux — set by placeOrder.fulfilled (both inline and redirect paths)
  const currentOrder = useSelector((state: RootState) => state.order.currentOrder);
  const orderId      = currentOrder?.orderId ?? '';

  // ── Handle Stripe redirect return ──────────────────────────────────────────
  // When a redirect-based payment method (Revolut, Amazon Pay, bank redirect)
  // completes, Stripe sends the user back to this URL with:
  //   ?payment_intent=pi_xxx&payment_intent_client_secret=pi_xxx_secret_xxx&redirect_status=succeeded
  //
  // We retrieve the PaymentIntent to confirm the status, then create the order
  // using the payload we saved to sessionStorage before the redirect.
  useEffect(() => {
    const clientSecret   = searchParams.get('payment_intent_client_secret');
    const redirectResult = searchParams.get('redirect_status');

    // No redirect params — this is a normal inline success, nothing to do
    if (!clientSecret) {
      setShowDetails(true); // skip animation delay for inline flow
      setTimeout(() => setShowDetails(true), 2500);
      return;
    }

    // Already handled (StrictMode double-invoke guard)
    if (handledRef.current) return;
    handledRef.current = true;

    if (redirectResult === 'failed') {
      setRedirectStatus('failed');
      setRedirectError('Your payment was not completed. Please try again.');
      return;
    }

    setRedirectStatus('processing');

    const handleRedirectReturn = async () => {
      try {
        const stripe = await stripePromise;
        if (!stripe) throw new Error('Stripe failed to load');

        // Retrieve the PaymentIntent to get the authoritative status
        const { paymentIntent, error } = await stripe.retrievePaymentIntent(clientSecret);

        if (error || !paymentIntent) {
          throw new Error(error?.message ?? 'Could not verify payment status');
        }

        if (paymentIntent.status !== 'succeeded') {
          throw new Error(`Payment status is "${paymentIntent.status}". Please contact support.`);
        }

        // Retrieve the order payload we saved before the redirect
        const raw = sessionStorage.getItem(PENDING_ORDER_KEY);
        if (!raw) {
          // Payload missing — order may have already been created by webhook,
          // or the user refreshed. Redirect to orders page to check.
          setRedirectStatus('done');
          setShowDetails(true);
          return;
        }

        const pendingPayload = JSON.parse(raw);
        sessionStorage.removeItem(PENDING_ORDER_KEY);

        // Dispatch placeOrder — backend is idempotent on stripePaymentIntentId
        const result = await dispatch(
          placeOrder({
            ...pendingPayload,
            stripePaymentIntentId: paymentIntent.id,
          })
        );

        if (placeOrder.fulfilled.match(result)) {
          clearCart();
          setRedirectStatus('done');
          setShowDetails(true);
        } else {
          const msg = (result.payload as string) || 'Order creation failed after payment.';
          // If it's a duplicate (already created by webhook), treat as success
          if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate')) {
            clearCart();
            setRedirectStatus('done');
            setShowDetails(true);
          } else {
            throw new Error(msg);
          }
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Something went wrong after payment.';
        setRedirectStatus('failed');
        setRedirectError(msg);
      }
    };

    handleRedirectReturn();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Animation timer for inline (non-redirect) success ─────────────────────
  useEffect(() => {
    if (redirectStatus !== 'idle') return; // redirect path handles its own timing
    const timer = setTimeout(() => setShowDetails(true), 2500);
    return () => clearTimeout(timer);
  }, [redirectStatus]);

  // ── Success sound ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!showDetails) return;
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/601/601-preview.mp3');
    audio.volume = 0.8;
    audio.play().catch(() => {/* autoplay blocked — silent fail */});
  }, [showDetails]);

  // ── Redirect-failed state ──────────────────────────────────────────────────
  if (redirectStatus === 'failed') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: 16 }}>⚠️</div>
            <h1 className={styles.title} style={{ color: '#ef4444' }}>Payment Issue</h1>
            <p className={styles.message}>{redirectError}</p>
            <div className={styles.actions} style={{ marginTop: 24 }}>
              <Link href="/checkout/payment" className={styles.continueBtn}>
                Try Again
              </Link>
              <Link href="/profile/orders" className={styles.viewOrderBtn}>
                Check My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Processing redirect state ──────────────────────────────────────────────
  if (redirectStatus === 'processing') {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <div className={styles.simpleAnimation}>
            <div className={styles.checkmarkWrapper}>
              <div className={styles.checkmarkRing} />
              <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none" />
                <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <div className={styles.loadingText}>Confirming your payment…</div>
          </div>
        </div>
      </div>
    );
  }

  // ── Normal success state ───────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {!showDetails && (
          <div className={styles.simpleAnimation}>
            <div className={styles.checkmarkWrapper}>
              <div className={styles.checkmarkRing} />
              <svg className={styles.checkmark} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                <circle className={styles.checkmarkCircle} cx="26" cy="26" r="25" fill="none" />
                <path className={styles.checkmarkCheck} fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
              </svg>
            </div>
            <div className={styles.loadingText}>Processing your order...</div>
          </div>
        )}

        <div className={`${styles.detailsReveal} ${showDetails ? styles.visible : ''}`}>
          {showDetails && (
            <div className={styles.confettiPopper}>
              {[...Array(40)].map((_, i) => (
                <div
                  key={i}
                  className={styles.popperPiece}
                  style={{
                    '--delay': `${Math.random() * 0.4}s`,
                    '--x':     `${(Math.random() - 0.5) * 800}px`,
                    '--y':     `${-Math.random() * 500}px`,
                    '--rot':   `${Math.random() * 360}deg`,
                    '--color': ['#10b981', '#fbbf24', '#3b82f6', '#f43f5e'][Math.floor(Math.random() * 4)],
                  } as React.CSSProperties}
                />
              ))}
            </div>
          )}

          <div>
            <div className={styles.successIcon}>✨</div>
            <h1 className={styles.title}>Order Confirmed!</h1>
            <p className={styles.message}>
              Thank you for choosing <strong>CocoSpice</strong>,{' '}
              {user?.name.split(' ')[0] || 'Guest'}!{' '}
              {orderType === 'delivery'
                ? 'Your order is now on its way to you.'
                : 'Your order is being prepared for pickup.'}
            </p>

            <div className={styles.orderInfo}>
              <div className={styles.infoRow}>
                <span>Order Number:</span>
                <strong>#{orderId || '...'}</strong>
              </div>
              <div className={styles.infoRow}>
                <span>{orderType === 'delivery' ? 'Estimated Time:' : 'Ready In:'}</span>
                <strong>{orderType === 'delivery' ? '30 – 45 Mins' : '15 – 20 Mins'}</strong>
              </div>
              {currentOrder && (
                <div className={styles.infoRow}>
                  <span>Total Paid:</span>
                  <strong>£{currentOrder.totalAmount.toFixed(2)}</strong>
                </div>
              )}
            </div>

            <div className={styles.actions}>
              <Link href="/menu" className={styles.continueBtn}>
                Continue Shopping
              </Link>
              <Link href="/profile/orders" className={styles.viewOrderBtn}>
                View My Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      {showDetails && (
        <p className={styles.support}>
          Need help? <Link href="/contact">Contact Support</Link>
        </p>
      )}
    </div>
  );
}
