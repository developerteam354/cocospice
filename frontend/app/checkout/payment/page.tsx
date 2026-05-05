'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/store/store';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { placeOrder } from '@/store/slices/orderSlice';
import PaymentStep, { PaymentMethod } from '@/components/CheckoutPage/PaymentStep';
import styles from '@/components/CheckoutPage/CheckoutPage.module.css';
import { toast } from 'sonner';

const DELIVERY_FEE = 2.99;
const COD_CHARGE = 20.00; // £20.00 for Cash on Delivery

export default function PaymentPage() {
  const { cart, orderType, orderNote, clearCart, cartTotal, shippingAddress } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const [payment, setPayment] = useState<PaymentMethod>('card');
  const [placing, setPlacing] = useState(false);

  // Calculate totals
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0;
  const codCharge = payment === 'cash' ? COD_CHARGE : 0;
  const total = cartTotal + deliveryFee + codCharge;

  const handlePlaceOrder = async () => {
    if (!user) {
      toast.error('Please log in to place an order');
      return;
    }

    if (cart.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    if (orderType === 'delivery' && !shippingAddress?.line1) {
      toast.error('Please select a delivery address');
      router.push('/checkout/address');
      return;
    }

    setPlacing(true);

    try {
      // Validate all cart items have a resolvable productId
      const resolveId = (item: typeof cart[0]) =>
        item.id || (item as any).productId || (item as any)._id || '';

      const invalidItems = cart.filter(item => !resolveId(item));
      if (invalidItems.length > 0) {
        toast.error(
          'Some cart items are missing product information. Please refresh the page and re-add them.',
        );
        setPlacing(false);
        return;
      }

      // Prepare order data
      const orderData = {
        items: cart.map(item => ({
          productId: item.id || (item as any).productId || (item as any)._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          selectedExtraOptions: item.selectedExtraOptions || [],
          subtotal: (item.price + (item.selectedExtraOptions?.reduce((sum, opt) => sum + opt.price, 0) || 0)) * item.quantity,
        })),
        orderType,
        orderNote: orderNote || '',
        subtotal: cartTotal,
        codCharge,
        totalAmount: total,
        paymentMethod: payment === 'cash' ? 'Cash on Delivery' as const : 'Card' as const,
        shippingAddress: orderType === 'delivery' ? {
          fullName: shippingAddress.fullName,
          line1: shippingAddress.line1,
          line2: shippingAddress.line2,
          city: shippingAddress.city,
          postcode: shippingAddress.postcode,
          phone: shippingAddress.phone,
        } : undefined,
      };

      // Place order
      const result = await dispatch(placeOrder(orderData));

      if (placeOrder.fulfilled.match(result)) {
        // Success
        toast.success('Order placed successfully!');
        clearCart();
        router.push('/checkout/success');
      } else {
        // Error
        toast.error(result.payload as string || 'Failed to place order');
      }
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <>
      <PaymentStep
        cart={cart}
        address={shippingAddress}
        payment={payment}
        onPaymentChange={setPayment}
        codCharge={codCharge}
      />

      <footer className={styles.footer}>
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
      </footer>
    </>
  );
}
