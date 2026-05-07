import type { Request, Response, NextFunction } from 'express';
import { Cart } from '../../models/Cart.model.js';

/**
 * GET /api/user/cart?sessionId=xxx
 * Returns the saved cart for a given sessionId.
 */
export const getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const sessionId = req.query.sessionId as string;
    if (!sessionId) {
      res.status(400).json({ message: 'sessionId is required' });
      return;
    }

    const cart = await Cart.findOne({ sessionId }).exec();
    res.status(200).json({
      cart:      cart?.items      ?? [],
      orderType: cart?.orderType  ?? 'delivery',
      orderNote: cart?.orderNote  ?? '',
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/user/cart/sync
 * Body: { sessionId, items, orderType?, orderNote? }
 * Upserts the cart for the given sessionId.
 */
export const syncCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { sessionId, items, orderType, orderNote } = req.body as {
      sessionId: string;
      items: unknown[];
      orderType?: 'delivery' | 'collection';
      orderNote?: string;
    };

    if (!sessionId) {
      res.status(400).json({ message: 'sessionId is required' });
      return;
    }

    await Cart.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          items:     items     ?? [],
          orderType: orderType ?? 'delivery',
          orderNote: orderNote ?? '',
        },
      },
      { upsert: true, new: true }
    ).exec();

    res.status(200).json({ message: 'Cart synced successfully' });
  } catch (err) {
    next(err);
  }
};
