'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import OrderReview from '@/components/CheckoutPage/OrderReview';
import styles from '@/components/CheckoutPage/CheckoutPage.module.css';
import { fetchShopStatus, type ShopStatusResponse } from '@/services/shopService';
import { toast } from 'sonner';

export default function ReviewPage() {
  const { cart, orderType, orderNote, setOrderNote, setOrderType } = useCart();
  const router = useRouter();
  const [shopStatus, setShopStatus] = useState<ShopStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchShopStatus()
      .then(status => {
        setShopStatus(status);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleNext = () => {
    // Check if shop is closed
    if (shopStatus && !shopStatus.isOpen) {
      toast.error('We are currently not accepting any online orders at the moment.');
      router.push('/');
      return;
    }

    // Check if both services are disabled
    if (shopStatus && !shopStatus.isCollectionEnabled && !shopStatus.isDeliveryEnabled) {
      toast.error('We are currently not accepting any online orders at the moment.');
      router.push('/');
      return;
    }

    // Check if current order type is disabled
    if (orderType === 'delivery' && shopStatus && !shopStatus.isDeliveryEnabled) {
      if (shopStatus.isCollectionEnabled) {
        toast.info('Online Delivery is currently unavailable. Would you like to switch to Self-Collection?', {
          duration: 6000,
          action: {
            label: 'Switch to Collection',
            onClick: () => {
              setOrderType('collection');
              toast.success('Switched to Self-Collection');
              router.push('/checkout/payment');
            }
          }
        });
      } else {
        toast.error('Online Delivery is currently unavailable.');
        router.push('/');
      }
      return;
    }

    if (orderType === 'collection' && shopStatus && !shopStatus.isCollectionEnabled) {
      if (shopStatus.isDeliveryEnabled) {
        toast.info('Self-Collection is currently unavailable. Would you like to switch to Online Delivery?', {
          duration: 6000,
          action: {
            label: 'Switch to Delivery',
            onClick: () => {
              setOrderType('delivery');
              toast.success('Switched to Online Delivery');
              router.push('/checkout/address');
            }
          }
        });
      } else {
        toast.error('Self-Collection is currently unavailable.');
        router.push('/');
      }
      return;
    }

    // Proceed normally
    if (orderType === 'delivery') {
      router.push('/checkout/address');
    } else {
      router.push('/checkout/payment');
    }
  };

  if (loading) {
    return (
      <div className={styles.section}>
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #322511 0%, #504008 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            boxShadow: '0 10px 40px rgba(128, 45, 0, 0.3)',
            animation: 'pulse 2s ease-in-out infinite',
            margin: '0 auto 1rem',
          }}>
            <img 
              src="/coco__logo.png" 
              alt="Loading"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                borderRadius: '50%',
              }}
            />
          </div>
          <p style={{ color: '#322511', fontWeight: 600 }}>Loading...</p>
        </div>
      </div>
    );
  }

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
