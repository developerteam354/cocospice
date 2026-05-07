'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import OrderReview from '@/components/CheckoutPage/OrderReview';
import styles from '@/components/CheckoutPage/CheckoutPage.module.css';

export default function ReviewPage() {
  const { cart, orderType, orderNote, setOrderNote } = useCart();
  const router = useRouter();

  const handleNext = () => {
    if (orderType === 'delivery') {
      router.push('/checkout/address');
    } else {
      router.push('/checkout/payment');
    }
  };

  return (
    <>
      <OrderReview cart={cart} note={orderNote} onNoteChange={setOrderNote} />
      
      <footer className={styles.footer}>
        <button className={styles.ctaBtn} onClick={handleNext}>
          {orderType === 'delivery' ? 'Choose Delivery Address' : 'Continue to Payment'}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </footer>
    </>
  );
}
