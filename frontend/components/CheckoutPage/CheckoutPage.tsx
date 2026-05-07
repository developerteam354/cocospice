'use client';

import React, { useState } from 'react';
import { CartItem } from '../../types';
import styles from './CheckoutPage.module.css';

import OrderReview from './OrderReview';
import AddressForm, { Address, EMPTY_ADDRESS } from './AddressForm';
import PaymentStep, { PaymentMethod } from './PaymentStep';

/* ─── Types ─────────────────────────────────── */
interface CheckoutPageProps {
  cart: CartItem[];
  onClose: () => void;
  onOrderPlaced: () => void;
  userName: string;
  orderType?: 'delivery' | 'collection';
}

const DELIVERY_FEE = 2.99;

/* ─── Main Component (orchestrator) ─────────── */
export default function CheckoutPage({ cart, onClose, onOrderPlaced, userName, orderType = 'delivery' }: CheckoutPageProps) {
  const [step, setStep]                     = useState(0);
  const [address, setAddress]               = useState<Address>({ ...EMPTY_ADDRESS, fullName: userName });
  const [addressErrors, setAddressErrors]   = useState<Partial<Address>>({});
  const [payment, setPayment]               = useState<PaymentMethod>('card');
  const [placing, setPlacing]               = useState(false);
  const [placed, setPlaced]                 = useState(false);
  const [orderNote, setOrderNote]           = useState('');

  const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const total    = subtotal + (orderType === 'delivery' ? DELIVERY_FEE : 0);

  const stepsList = orderType === 'delivery' 
    ? ['Order Review', 'Delivery', 'Payment'] 
    : ['Order Review', 'Payment'];

  /* ── Address validation ── */
  const validateAddress = (): boolean => {
    const errors: Partial<Address> = {};
    if (!address.fullName.trim())  errors.fullName  = 'Required';
    if (!address.line1.trim())     errors.line1     = 'Required';
    if (!address.city.trim())      errors.city      = 'Required';
    if (!address.postcode.trim())  errors.postcode  = 'Required';
    if (!address.phone.trim())     errors.phone     = 'Required';
    setAddressErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddressChange = (field: keyof Address, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    if (addressErrors[field]) setAddressErrors(prev => ({ ...prev, [field]: '' }));
  };

  /* ── Navigation ── */
  const goNext = () => {
    if (orderType === 'delivery' && step === 1 && !validateAddress()) return;
    setStep(s => s + 1);
  };

  /* ── Place order ── */
  const handlePlaceOrder = async () => {
    setPlacing(true);
    await new Promise(r => setTimeout(r, 1800));
    setPlacing(false);
    setPlaced(true);
    setTimeout(onOrderPlaced, 3200);
  };

  /* ─────────────── Success screen ─────────────── */
  if (placed) {
    return (
      <div className={styles.overlay}>
        <div className={styles.successWrap}>
          <div className={styles.successBowl}>🍛</div>
          <div className={styles.successRings}>
            <span /><span /><span />
          </div>
          <h2 className={styles.successTitle}>Order Placed! 🎉</h2>
          <p className={styles.successSub}>
            Thanks, {userName.split(' ')[0]}! Your delicious food is being prepared and will arrive shortly.
          </p>
          <div className={styles.successEta}>⏱ Estimated delivery: <strong>30–45 min</strong></div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.page}>

        {/* ── Header ── */}
        <header className={styles.pageHeader}>
          <button
            className={styles.backBtn}
            onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
          </button>

          <div className={styles.stepIndicator}>
            {stepsList.map((label, i) => (
              <React.Fragment key={label}>
                <div className={`${styles.stepDot} ${i <= step ? styles.stepDotActive : ''} ${i < step ? styles.stepDotDone : ''}`}>
                  {i < step ? '✓' : i + 1}
                </div>
                {i < stepsList.length - 1 && (
                  <div className={`${styles.stepLine} ${i < step ? styles.stepLineDone : ''}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          <div className={styles.stepLabel}>{stepsList[step]}</div>
        </header>

        {/* ── Body — each step is its own component ── */}
        <div className={styles.body}>
          {step === 0 && <OrderReview cart={cart} note={orderNote} onNoteChange={setOrderNote} />}

          {orderType === 'delivery' && step === 1 && (
            <AddressForm
              address={address}
              errors={addressErrors}
              onChange={handleAddressChange}
            />
          )}

          {(orderType === 'delivery' ? step === 2 : step === 1) && (
            <PaymentStep
              cart={cart}
              address={address}
              payment={payment}
              onPaymentChange={setPayment}
            />
          )}
        </div>

        {/* ── Footer CTA ── */}
        <footer className={styles.footer}>
          {step < stepsList.length - 1 ? (
            <button className={styles.ctaBtn} onClick={goNext}>
              {step === 0 && orderType === 'delivery' ? 'Choose Delivery Address' : 'Continue to Payment'}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          ) : (
            <button
              className={`${styles.ctaBtn} ${styles.ctaBtnGold}`}
              onClick={handlePlaceOrder}
              disabled={placing}
            >
              {placing
                ? <><span className={styles.spinner} /> Placing Order…</>
                : <>Place Order · £{total.toFixed(2)}</>
              }
            </button>
          )}
        </footer>

      </div>
    </div>
  );
}
