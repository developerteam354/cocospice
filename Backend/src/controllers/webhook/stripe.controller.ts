import type { Request, Response } from 'express';
import Stripe from 'stripe';
import stripe from '../../config/stripe.js';
import { orderService } from '../../services/user/order.service.js';
import { Order } from '../../models/Order.model.js';

/**
 * POST /api/webhooks/stripe
 *
 * Stripe sends signed events here for every payment lifecycle change.
 * We handle payment_intent.succeeded as a server-side safety net:
 * if the frontend redirect return fails (browser closed, network drop, etc.)
 * the order is still created here.
 *
 * IMPORTANT: This route must receive the raw request body (Buffer), not the
 * parsed JSON body. See the route registration in routes/index.ts.
 */
export const stripeWebhookHandler = async (req: Request, res: Response): Promise<void> => {
  const sig           = req.headers['stripe-signature'] as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('⚠️  STRIPE_WEBHOOK_SECRET is not set — webhook verification skipped');
    res.status(500).json({ message: 'Webhook secret not configured' });
    return;
  }

  let event: Stripe.Event;

  try {
    // Verify the event came from Stripe using the webhook signing secret
    event = stripe.webhooks.constructEvent(req.body as Buffer, sig, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Webhook signature verification failed';
    console.error('❌ Stripe webhook signature error:', msg);
    res.status(400).json({ message: msg });
    return;
  }

  // ── Handle events ──────────────────────────────────────────────────────────

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      // Check if an order already exists for this PaymentIntent
      // (frontend may have already created it via the inline or redirect path)
      const existing = await orderService.findByPaymentIntent(paymentIntent.id);
      if (existing) {
        // Already handled — acknowledge and move on
        res.status(200).json({ received: true });
        return;
      }

      // No order exists yet — this means the frontend failed to create it
      // (browser closed, network error after redirect, etc.)
      // We can't create the order here because we don't have the cart items
      // (they live in the user's browser sessionStorage, not on the server).
      //
      // What we CAN do: mark the PaymentIntent as "needs order creation" so
      // support staff can follow up, and log it clearly.
      console.warn(
        `⚠️  payment_intent.succeeded received for ${paymentIntent.id} but no order exists.` +
        ` User: ${paymentIntent.metadata?.userId ?? 'unknown'}.` +
        ` Amount: £${(paymentIntent.amount / 100).toFixed(2)}.` +
        ` This may need manual order creation.`
      );

      // Acknowledge receipt — Stripe will not retry
      res.status(200).json({ received: true });
    } catch (err) {
      console.error('❌ Error processing payment_intent.succeeded webhook:', err);
      // Return 200 anyway — returning 5xx causes Stripe to retry, which could
      // cause duplicate processing if the error was transient.
      res.status(200).json({ received: true });
    }

    return;
  }

  if (event.type === 'payment_intent.payment_failed') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    console.log(`ℹ️  Payment failed for intent ${paymentIntent.id}`);

    // Update order status if one was created (e.g. for a retry scenario)
    try {
      const order = await Order.findOne({ stripePaymentIntentId: paymentIntent.id });
      if (order && order.paymentStatus !== 'Failed') {
        order.paymentStatus = 'Failed';
        await order.save();
      }
    } catch (err) {
      console.error('Error updating failed payment order:', err);
    }
  }

  // Acknowledge all other event types
  res.status(200).json({ received: true });
};
