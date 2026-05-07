'use client';

import React from 'react';
import { CartItem } from '../../types';
import { Address as CartAddress } from '../../contexts/CartContext';
import { useCart } from '../../contexts/CartContext';
import styles from './CheckoutPage.module.css';

/* ─── Types ─────────────────────────────────── */
export type PaymentMethod = 'card' | 'cash';

const DELIVERY_FEE = 2.99;

interface PaymentStepProps {
  cart: CartItem[];
  address: CartAddress;
  payment: PaymentMethod;
  onPaymentChange: (method: PaymentMethod) => void;
  codCharge?: number;
}

export default function PaymentStep({
  cart,
  address,
  payment,
  onPaymentChange,
  codCharge = 0,
}: PaymentStepProps) {
  const { orderType } = useCart();

  const subtotal    = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const total       = subtotal + deliveryFee + codCharge;
  const itemCount   = cart.reduce((s, i) => s + i.quantity, 0);

  const METHODS: { id: PaymentMethod; icon: string; label: string; sub: string }[] = [
    { id: 'card', icon: '💳', label: 'Pay by Card',        sub: 'Visa, Mastercard, Google Pay, Apple Pay' },
    { id: 'cash', icon: '💵', label: 'Cash on Delivery',   sub: `+£${COD_CHARGE.toFixed(2)} charge applies` },
  ];

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Payment Method</h2>

      {/* ── Method selector ── */}
      <div className={styles.methodGrid}>
        {METHODS.map(m => (
          <button
            key={m.id}
            className={`${styles.methodCard} ${payment === m.id ? styles.methodCardActive : ''}`}
            onClick={() => onPaymentChange(m.id)}
          >
            <span className={styles.methodIcon}>{m.icon}</span>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div className={styles.methodLabel}>{m.label}</div>
              <div className={styles.methodSub}>{m.sub}</div>
            </div>
            {payment === m.id && <span className={styles.methodCheck}>✓</span>}
          </button>
        ))}
      </div>

      {/* ── Cash info ── */}
      {payment === 'cash' && (
        <div className={styles.cashInfo}>
          <span className={styles.cashIcon}>💵</span>
          <div>
            <p>
              Please have <strong>£{total.toFixed(2)}</strong> ready when{' '}
              {orderType === 'delivery' ? 'your rider arrives' : 'you arrive for collection'}.
              Exact change is appreciated!
            </p>
            {codCharge > 0 && (
              <div className={styles.codNotice}>
                <strong>Note:</strong> A £{codCharge.toFixed(2)} Cash on Delivery charge has been added.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Order mini-summary ── */}
      <div className={styles.miniSummary}>
        <div className={styles.miniRow}>
          <span>Items ({itemCount})</span>
          <span>£{subtotal.toFixed(2)}</span>
        </div>
        {orderType === 'delivery' && (
          <div className={styles.miniRow}>
            <span>Delivery</span>
            <span>£{DELIVERY_FEE.toFixed(2)}</span>
          </div>
        )}
        {codCharge > 0 && (
          <div className={styles.miniRow}>
            <span>COD Charge</span>
            <span>£{codCharge.toFixed(2)}</span>
          </div>
        )}
        <div className={`${styles.miniRow} ${styles.miniTotal}`}>
          <span>Total</span>
          <span>£{total.toFixed(2)}</span>
        </div>
      </div>

      {/* ── Deliver-to summary ── */}
      {orderType === 'delivery' && address?.line1 && (
        <div className={styles.addressSummary}>
          <span className={styles.addressIcon}>📍</span>
          <div>
            <div className={styles.addressName}>{address.fullName}</div>
            <div className={styles.addressText}>
              {[address.line1, address.line2, address.city, address.postcode]
                .filter(Boolean)
                .join(', ')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Exported so payment page can reference it
export const COD_CHARGE = 20.00;
