import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import stripe from '../../config/stripe.js';

interface CreatePaymentIntentBody {
  amount: number;
}

export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { amount } = req.body as CreatePaymentIntentBody;

    if (amount === undefined || amount === null) {
      res.status(400).json({ message: 'amount is required' });
      return;
    }
    if (typeof amount !== 'number' || amount <= 0) {
      res.status(400).json({ message: 'amount must be a positive number' });
      return;
    }

    const amountInPence = Math.round(amount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount:   amountInPence,
      currency: 'gbp',   // always GBP — required for UK-only methods (Klarna, BACS, etc.)
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: (req as any).userId ?? '',
      },
    });

    res.status(200).json({
      clientSecret:    paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    next(err);
  }
};
