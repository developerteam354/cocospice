'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import styles from '@/components/CheckoutPage/CheckoutPage.module.css';

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { orderType } = useCart();

  const stepsList = orderType === 'delivery' 
    ? [
        { label: 'Order Review', path: '/checkout/review' },
        { label: 'Delivery', path: '/checkout/address' },
        { label: 'Payment', path: '/checkout/payment' }
      ] 
    : [
        { label: 'Order Review', path: '/checkout/review' },
        { label: 'Payment', path: '/checkout/payment' }
      ];

  const currentStepIndex = stepsList.findIndex(step => pathname.includes(step.path));

  const isSuccessPage = pathname === '/checkout/success';

  return (
    <div className={styles.overlay}>
      <div className={styles.page}>
        {/* ── Header (Hidden on Success) ── */}
        {!isSuccessPage && (
          <header className={styles.pageHeader}>
            <button
              className={styles.backBtn}
              onClick={() => router.back()}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M19 12H5M12 5l-7 7 7 7" />
              </svg>
            </button>

            <div className={styles.stepIndicator}>
              {stepsList.map((step, i) => (
                <React.Fragment key={step.label}>
                  <div 
                    className={`${styles.stepDot} ${i <= currentStepIndex ? styles.stepDotActive : ''} ${i < currentStepIndex ? styles.stepDotDone : ''}`}
                    onClick={() => router.push(step.path)}
                    style={{ cursor: 'pointer' }}
                  >
                    {i < currentStepIndex ? '✓' : i + 1}
                  </div>
                  {i < stepsList.length - 1 && (
                    <div className={`${styles.stepLine} ${i < currentStepIndex ? styles.stepLineDone : ''}`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className={styles.stepLabel}>{stepsList[currentStepIndex]?.label}</div>
          </header>
        )}

        {/* ── Body ── */}
        <div className={styles.body}>
          {children}
        </div>
      </div>
    </div>
  );
}
