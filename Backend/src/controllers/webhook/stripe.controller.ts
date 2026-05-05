import type { Request, Response } from 'express';
import Stripe from 'stripe';
import stripe from '../../config/stripe.js';
import { Order } from '../../models/Order.model.js';
import { Cart } from '../../models/Cart.model.js';

/**
 * POST /webhooks/stripe
 *
 * Stripe sends signed webhook events here for every payment lifecycle change.
 *
 * Architecture notes:
 * ─────────────────────────────────────────────────────────────────────────────
 * PRIMARY path  — inline payments (card, GPay, APay):
 *   Frontend calls placeOrder immediately after stripe.confirmPayment succeeds.
 *   Order is created with paymentStatus: 'Paid'. Webhook arrives shortly after
 *   and confirms/reconciles — no duplicate created.
 *
 * SECONDARY path — redirect payments (Revolut, bank redirect):
 *   Frontend saves payload to sessionStorage, Stripe redirects away.
 *   On return, success page calls placeOrder with the saved payload.
 *   Webhook may arrive before or after — idempotency handles both.
 *
 * FALLBACK path — browser closed / network failure after redirect:
 *   Frontend never calls placeOrder. Webhook is the only signal.
 *   We cannot create the order here (no cart items on server), but we
 *   log it clearly for manual follow-up.
 *
 * IMPORTANT: This route receives the raw Buffer body (not parsed JSON).
 *   express.raw({ type: 'application/json' }) is applied in index.ts
 *   BEFORE express.json(), so req.body is a Buffer here.
 */
export const stripeWebhookHandler = async (req: Request, res: Response): Promise<void> => {
  const sig           = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // ── Signature verification ─────────────────────────────────────────────────
  if (!webhookSecret) {
    console.error('❌ STRIPE_WEBHOOK_SECRET is not set');
    res.status(500).json({ message: 'Webhook secret not configured' });
    return;
  }

  if (!sig) {
    console.error('❌ Missing stripe-signature header');
    res.status(400).json({ message: 'Missing stripe-signature header' });
    return;
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Signature verification failed';
    console.error('❌ Stripe webhook signature error:', msg);
    res.status(400).json({ message: `Webhook signature verification failed: ${msg}` });
    return;
  }

  console.log(`✅ Stripe webhook received: ${event.type} [${event.id}]`);

  // ── Event handlers ─────────────────────────────────────────────────────────

  try {
    switch (event.type) {

      // ── payment_intent.succeeded ───────────────────────────────────────────
      // Fires when a payment is confirmed. This is the authoritative signal
      // that money has moved. We use it to:
      //   1. Ensure the order's paymentStatus is 'Paid' in MongoDB
      //   2. Clear the user's server-side cart document
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSucceeded(pi);
        break;
      }

      // ── payment_intent.payment_failed ──────────────────────────────────────
      // Fires when a payment attempt fails. Mark any existing order as Failed.
      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await handlePaymentFailed(pi);
        break;
      }

      // ── payment_intent.canceled ────────────────────────────────────────────
      case 'payment_intent.canceled': {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.log(`ℹ️  PaymentIntent canceled: ${pi.id}`);
        await Order.findOneAndUpdate(
          { stripePaymentIntentId: pi.id, paymentStatus: { $ne: 'Paid' } },
          { paymentStatus: 'Failed', orderStatus: 'Cancelled' }
        );
        break;
      }

      default:
        // Unhandled event type — acknowledge and ignore
        console.log(`ℹ️  Unhandled webhook event type: ${event.type}`);
    }
  } catch (err) {
    // Log but always return 200 — returning 5xx causes Stripe to retry,
    // which risks duplicate processing on transient errors.
    console.error(`❌ Error handling webhook event ${event.type}:`, err);
  }

  // Always acknowledge receipt
  res.status(200).json({ received: true });
};

// ─── Handler: payment_intent.succeeded ────────────────────────────────────────

async function handlePaymentSucceeded(pi: Stripe.PaymentIntent): Promise<void> {
  const order = await Order.findOne({ stripePaymentIntentId: pi.id });

  if (order) {
    // Order exists (created by frontend) — ensure paymentStatus is Paid
    if (order.paymentStatus !== 'Paid') {
      order.paymentStatus = 'Paid';
      await order.save();
      console.log(`✅ Webhook: order ${order.orderId} marked as Paid`);
    } else {
      console.log(`ℹ️  Webhook: order ${order.orderId} already Paid — no update needed`);
    }

    // Clear the user's server-side cart document.
    // The sessionId for logged-in users is `user_<userId>`.
    const userId = order.userId.toString();
    const sessionId = `user_${userId}`;
    const cartResult = await Cart.findOneAndUpdate(
      { sessionId },
      { $set: { items: [], orderNote: '' } }
    );
    if (cartResult) {
      console.log(`🛒 Webhook: server cart cleared for user ${userId}`);
    }

  } else {
    // No order found — frontend failed to create it (browser closed, network error).
    // We cannot create the order here (cart items are in the browser's sessionStorage).
    // Log clearly for manual follow-up.
    console.warn(
      `⚠️  Webhook: payment_intent.succeeded for ${pi.id} but NO order found in DB.\n` +
      `   User metadata: ${pi.metadata?.userId ?? 'unknown'}\n` +
      `   Amount: £${(pi.amount / 100).toFixed(2)}\n` +
      `   This payment needs manual order creation or investigation.`
    );
  }
}

// ─── Handler: payment_intent.payment_failed ───────────────────────────────────

async function handlePaymentFailed(pi: Stripe.PaymentIntent): Promise<void> {
  const lastError = pi.last_payment_error?.message ?? 'Unknown error';
  console.log(`❌ Webhook: payment failed for ${pi.id} — ${lastError}`);

  // Mark any existing order as Failed (e.g. retry scenario where order was pre-created)
  const result = await Order.findOneAndUpdate(
    { stripePaymentIntentId: pi.id, paymentStatus: { $ne: 'Paid' } },
    { paymentStatus: 'Failed' },
    { new: true }
  );

  if (result) {
    console.log(`ℹ️  Webhook: order ${result.orderId} marked as Failed`);
  }
}
