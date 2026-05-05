'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { Elements, useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import type { StripePaymentElementOptions } from '@stripe/stripe-js';
import type { AppDispatch } from '@/store/store';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { placeOrder } from '@/store/slices/orderSlice';
import { privateApi } from '@/lib/api';
import stripePromise from '@/lib/stripe';
import PaymentStep, { PaymentMethod } from '@/components/CheckoutPage/PaymentStep';
import styles from '@/components/CheckoutPage/CheckoutPage.module.css';
import { toast } from 'sonner';

const DELIVERY_FEE = 2.99;
const COD_CHARGE   = 20.00;

// Persists the order payload across a Stripe redirect so the success page can
// create the order after the user returns from Revolut / bank redirect / etc.
export const PENDING_ORDER_KEY = 'cocospice_pending_order';

// ─── Stripe appearance — Cocospice emerald theme ──────────────────────────────
const STRIPE_APPEARANCE = {
  theme: 'stripe' as const,
  variables: {
    colorPrimary:       '#059669',
    colorBackground:    '#ffffff',
    colorText:          '#111827',
    colorTextSecondary: '#6b7280',
    colorDanger:        '#ef4444',
    colorSuccess:       '#10b981',
    fontFamily:         'inherit',
    borderRadius:       '12px',
    spacingUnit:        '4px',
    fontSizeBase:       '0.9rem',
    fontWeightNormal:   '500',
    fontWeightMedium:   '600',
    fontWeightBold:     '700',
  },
  rules: {
    '.Input': {
      border:     '1.5px solid #e5e7eb',
      boxShadow:  'none',
      padding:    '12px 14px',
      fontSize:   '0.9rem',
      fontWeight: '600',
      color:      '#111827',
    },
    '.Input:focus': {
      border:    '1.5px solid #059669',
      boxShadow: '0 0 0 3px rgba(5,150,105,0.15)',
      outline:   'none',
    },
    '.Input--invalid': {
      border:    '1.5px solid #ef4444',
      boxShadow: '0 0 0 3px rgba(239,68,68,0.12)',
    },
    '.Label': {
      fontSize:   '0.8rem',
      fontWeight: '600',
      color:      '#374151',
    },
    '.Tab': {
      border:       '1.5px solid #e5e7eb',
      borderRadius: '10px',
      boxShadow:    'none',
      padding:      '10px 16px',
    },
    '.Tab:hover': {
      border:    '1.5px solid #059669',
      boxShadow: '0 0 0 2px rgba(5,150,105,0.1)',
      color:     '#059669',
    },
    '.Tab--selected': {
      border:          '1.5px solid #059669',
      boxShadow:       '0 0 0 2px rgba(5,150,105,0.2)',
      backgroundColor: '#f0fdf4',
      color:           '#059669',
    },
    '.TabIcon--selected':  { fill:  '#059669' },
    '.TabLabel--selected': { color: '#059669' },
    '.AccordionItem': {
      border:       '1.5px solid #e5e7eb',
      borderRadius: '10px',
    },
    '.AccordionItem--selected': {
      border:          '1.5px solid #059669',
      backgroundColor: '#f0fdf4',
    },
  },
};

// ─── Payment element options ──────────────────────────────────────────────────
const PAYMENT_ELEMENT_OPTIONS: StripePaymentElementOptions = {
  layout: {
    type:                 'accordion',
    defaultCollapsed:     false,
    radios:               'always',
    spacedAccordionItems: true,
  },
  paymentMethodOrder: ['google_pay', 'apple_pay', 'card'],
};

// ─── Inner Stripe form (must live inside <Elements>) ─────────────────────────

function StripePaymentForm({ total, cartTotal }: { total: number; cartTotal: number }) {
  const stripe   = useStripe();
  const elements = useElements();

  const { cart, orderType, orderNote, clearCart, shippingAddress } = useCart();
  const router   = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [placing, setPlacing] = useState(false);

  const buildItems = () =>
    cart.map(item => {
      const pid         = item.id || (item as any).productId || '';
      const extrasTotal = (item.selectedExtraOptions ?? []).reduce((s, o) => s + o.price, 0);
      return {
        productId:            pid,
        name:                 item.name,
        price:                item.price,
        quantity:             item.quantity,
        selectedExtraOptions: item.selectedExtraOptions ?? [],
        subtotal:             (item.price + extrasTotal) * item.quantity,
      };
    });

  const buildShippingAddress = () => {
    if (!shippingAddress?.line1) return undefined;
    return {
      fullName: shippingAddress.fullName,
      line1:    shippingAddress.line1,
      line2:    shippingAddress.line2 ?? '',
      city:     shippingAddress.city,
      postcode: shippingAddress.postcode,
      phone:    shippingAddress.phone,
    };
  };

  const handlePay = async () => {
    if (!stripe || !elements) {
      toast.error('Stripe is not ready. Please wait a moment.');
      return;
    }

    // Pre-flight: ensure every cart item has a valid productId
    const items   = buildItems();
    const badItem = items.find(i => !i.productId);
    if (badItem) {
      toast.error(`"${badItem.name}" is missing a product ID. Remove it and re-add from the menu.`);
      return;
    }

    setPlacing(true);

    // Persist the order payload to sessionStorage BEFORE Stripe redirects away.
    // Redirect-based methods (Revolut, bank transfers) navigate the browser to
    // Stripe's hosted page; when the user returns, the success page reads this
    // to create the order.
    const pendingPayload = {
      items,
      orderType,
      orderNote:       orderNote || '',
      subtotal:        cartTotal,
      codCharge:       0,
      totalAmount:     total,
      paymentMethod:   'Card' as const,
      paymentStatus:   'Paid'  as const,
      shippingAddress: orderType === 'delivery' ? buildShippingAddress() : undefined,
    };
    sessionStorage.setItem(PENDING_ORDER_KEY, JSON.stringify(pendingPayload));

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: `${window.location.origin}/checkout/success` },
      redirect: 'if_required',
    });

    if (error) {
      sessionStorage.removeItem(PENDING_ORDER_KEY);
      // Redirect to the dedicated failure page with the error message
      router.push(
        `/checkout/payment-failed?message=${encodeURIComponent(error.message ?? 'Payment failed.')}`
      );
      setPlacing(false);
      return;
    }

    // Redirect-based method: browser is navigating to return_url.
    // The success page handles order creation on return — nothing to do here.
    if (!paymentIntent || paymentIntent.status !== 'succeeded') {
      setPlacing(false);
      return;
    }

    // Inline success (card / GPay / APay) — create the order now
    sessionStorage.removeItem(PENDING_ORDER_KEY);
    const result = await dispatch(
      placeOrder({ ...pendingPayload, stripePaymentIntentId: paymentIntent.id })
    );

    setPlacing(false);

    if (placeOrder.fulfilled.match(result)) {
      toast.success('Payment successful! Your order has been placed.');
      clearCart();
      router.push('/checkout/success');
    } else {
      toast.error(
        (result.payload as string) ||
        'Payment taken but order creation failed. Please contact support.'
      );
    }
  };

  return (
    <>
      <div className={styles.stripeCardWrap}>
        <PaymentElement options={PAYMENT_ELEMENT_OPTIONS} />
        <p className={styles.stripeNote}>
          🔒 Payments are secured by Stripe. We never store your card details.
        </p>
      </div>

      <footer className={styles.footer}>
        <button
          className={`${styles.ctaBtn} ${styles.ctaBtnGold}`}
          onClick={handlePay}
          disabled={placing || !stripe}
        >
          {placing
            ? <><span className={styles.spinner} /> Processing Payment…</>
            : <>Pay Now · £{total.toFixed(2)}</>}
        </button>
      </footer>
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PaymentPage() {
  const { cart, orderType, orderNote, clearCart, cartTotal, shippingAddress } = useCart();
  const { user }   = useAuth();
  const router     = useRouter();
  const dispatch   = useDispatch<AppDispatch>();

  const [payment, setPayment]             = useState<PaymentMethod>('card');
  const [clientSecret, setClientSecret]   = useState<string | null>(null);
  const [intentLoading, setIntentLoading] = useState(false);
  const [placing, setPlacing]             = useState(false);

  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const codCharge   = payment === 'cash'       ? COD_CHARGE   : 0;
  const total       = cartTotal + deliveryFee + codCharge;

  // Create a PaymentIntent whenever the user selects card payment
  useEffect(() => {
    if (payment !== 'card' || cart.length === 0) return;

    let cancelled = false;
    setIntentLoading(true);
    setClientSecret(null);

    privateApi
      .post<{ clientSecret: string }>('/payment/create-intent', {
        amount: cartTotal + deliveryFee,
      })
      .then(({ data }) => { if (!cancelled) setClientSecret(data.clientSecret); })
      .catch((err: unknown) => {
        if (!cancelled) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
            'Could not initialise payment. Please try again.';
          toast.error(msg);
        }
      })
      .finally(() => { if (!cancelled) setIntentLoading(false); });

    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment, cartTotal, deliveryFee]);

  const buildShippingAddress = () => {
    if (!shippingAddress?.line1) return undefined;
    return {
      fullName: shippingAddress.fullName,
      line1:    shippingAddress.line1,
      line2:    shippingAddress.line2 ?? '',
      city:     shippingAddress.city,
      postcode: shippingAddress.postcode,
      phone:    shippingAddress.phone,
    };
  };

  const buildItems = () =>
    cart.map(item => {
      const pid         = item.id || (item as any).productId || '';
      const extrasTotal = (item.selectedExtraOptions ?? []).reduce((s, o) => s + o.price, 0);
      return {
        productId:            pid,
        name:                 item.name,
        price:                item.price,
        quantity:             item.quantity,
        selectedExtraOptions: item.selectedExtraOptions ?? [],
        subtotal:             (item.price + extrasTotal) * item.quantity,
      };
    });

  const handleCOD = async () => {
    if (!user)              { toast.error('Please log in to place an order'); return; }
    if (cart.length === 0)  { toast.error('Your cart is empty'); return; }
    if (orderType === 'delivery' && !shippingAddress?.line1) {
      toast.error('Please select a delivery address');
      router.push('/checkout/address');
      return;
    }

    const items   = buildItems();
    const badItem = items.find(i => !i.productId);
    if (badItem) {
      toast.error(`"${badItem.name}" is missing a product ID. Remove it and re-add from the menu.`);
      return;
    }

    setPlacing(true);
    const result = await dispatch(
      placeOrder({
        items,
        orderType,
        orderNote:       orderNote || '',
        subtotal:        cartTotal,
        codCharge:       COD_CHARGE,
        totalAmount:     total,
        paymentMethod:   'Cash on Delivery',
        paymentStatus:   'Pending',
        shippingAddress: orderType === 'delivery' ? buildShippingAddress() : undefined,
      })
    );
    setPlacing(false);

    if (placeOrder.fulfilled.match(result)) {
      toast.success('Order placed! Pay on delivery.');
      clearCart();
      router.push('/checkout/success');
    } else {
      toast.error((result.payload as string) || 'Failed to place order');
    }
  };

  if (!user) {
    return (
      <div className={styles.loadingState}>
        <p>Please log in to continue.</p>
      </div>
    );
  }

  return (
    <>
      <PaymentStep
        cart={cart}
        address={shippingAddress}
        payment={payment}
        onPaymentChange={setPayment}
        codCharge={codCharge}
      />

      {payment === 'card' && (
        <>
          {intentLoading || !clientSecret ? (
            <div className={styles.stripeCardWrap}>
              <div className={styles.stripeLoadingBox}>
                <span
                  className={styles.spinner}
                  style={{ borderTopColor: '#059669', borderColor: 'rgba(5,150,105,0.2)' }}
                />
                <span style={{ fontSize: '0.85rem', color: '#6b7280', marginLeft: 10 }}>
                  Preparing secure payment…
                </span>
              </div>
            </div>
          ) : (
            <Elements stripe={stripePromise} options={{ clientSecret, appearance: STRIPE_APPEARANCE }}>
              <StripePaymentForm total={cartTotal + deliveryFee} cartTotal={cartTotal} />
            </Elements>
          )}
        </>
      )}

      {payment === 'cash' && (
        <footer className={styles.footer}>
          <button
            className={`${styles.ctaBtn} ${styles.ctaBtnGold}`}
            onClick={handleCOD}
            disabled={placing}
          >
            {placing
              ? <><span className={styles.spinner} /> Placing Order…</>
              : <>Place Order · £{total.toFixed(2)}</>}
          </button>
        </footer>
      )}
    </>
  );
}
