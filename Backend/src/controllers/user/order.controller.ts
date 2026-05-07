import type { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { orderService } from '../../services/user/order.service.js';
import type { IOrderItem, IShippingAddress } from '../../models/Order.model.js';
import { checkDeliveryRadius, DELIVERY_RADIUS_KM } from '../../utils/deliveryRadius.js';

export const userOrderController = {
  /**
   * POST /api/user/orders
   */
  createOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId;

      const {
        items,
        orderType,
        orderNote,
        subtotal,
        codCharge,
        totalAmount,
        paymentMethod,
        paymentStatus,
        stripePaymentIntentId,
        shippingAddress,
      } = req.body as {
        items: Array<{ productId: string } & Omit<IOrderItem, 'productId'>>;
        orderType: 'delivery' | 'collection';
        orderNote?: string;
        subtotal: number;
        codCharge: number;
        totalAmount: number;
        paymentMethod: 'Cash on Delivery' | 'Card' | 'Online';
        paymentStatus?: 'Pending' | 'Paid' | 'Failed';
        stripePaymentIntentId?: string;
        shippingAddress?: IShippingAddress;
      };

      // ── Validation ──────────────────────────────────────────────────────
      if (!items || items.length === 0) {
        res.status(400).json({ message: 'Order must have at least one item' });
        return;
      }

      // Validate every item has a non-empty, valid ObjectId productId
      for (let i = 0; i < items.length; i++) {
        const pid = items[i].productId;
        if (!pid) {
          res.status(400).json({ message: `items[${i}].productId is required` });
          return;
        }
        if (!Types.ObjectId.isValid(pid)) {
          res.status(400).json({ message: `items[${i}].productId is not a valid ID` });
          return;
        }
      }

      if (!orderType || !['delivery', 'collection'].includes(orderType)) {
        res.status(400).json({ message: 'Invalid order type' });
        return;
      }

      if (!paymentMethod) {
        res.status(400).json({ message: 'Payment method is required' });
        return;
      }

      if (orderType === 'delivery' && !shippingAddress) {
        res.status(400).json({ message: 'Shipping address is required for delivery orders' });
        return;
      }

      // ── Delivery radius check (backend security layer) ──────────────────
      // Only runs when the user provided GPS coordinates. If no coordinates
      // are present (e.g. manually typed address) we skip the check — the
      // frontend already enforces this for GPS-confirmed locations.
      if (
        orderType === 'delivery' &&
        shippingAddress?.lat != null &&
        shippingAddress?.lng != null
      ) {
        const { allowed, distanceKm } = checkDeliveryRadius(
          shippingAddress.lat,
          shippingAddress.lng
        );
        if (!allowed) {
          res.status(422).json({
            message: `Delivery Unavailable: We only deliver within ${DELIVERY_RADIUS_KM} km of our shop. Your location is ${distanceKm} km away.`,
            code:        'OUTSIDE_DELIVERY_RADIUS',
            distanceKm,
            radiusKm:    DELIVERY_RADIUS_KM,
          });
          return;
        }
      }

      // ── Idempotency: prevent duplicate orders for the same payment ──────────
      // If a stripePaymentIntentId is provided, check whether an order already
      // exists for it (e.g. webhook created it before the redirect return did).
      if (stripePaymentIntentId) {
        const existing = await orderService.findByPaymentIntent(stripePaymentIntentId);
        if (existing) {
          // Return the existing order as if it were just created — idempotent 201
          res.status(201).json({ message: 'Order placed successfully', order: existing });
          return;
        }
      }

      // ── Create order ─────────────────────────────────────────────────────
      const order = await orderService.createOrder({
        userId,
        items: items as unknown as IOrderItem[],
        orderType,
        orderNote,
        subtotal,
        codCharge,
        totalAmount,
        paymentMethod,
        paymentStatus,
        stripePaymentIntentId,
        shippingAddress,
      });

      res.status(201).json({ message: 'Order placed successfully', order });
    } catch (err: unknown) {
      next(err);
    }
  },

  /**
   * GET /api/user/orders
   * Get all orders for the logged-in user
   */
  getUserOrders: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId; // Set by auth middleware
      
      const orders = await orderService.getUserOrders(userId);

      res.status(200).json({ orders });
    } catch (err: unknown) {
      next(err);
    }
  },

  /**
   * GET /api/user/orders/:id
   * Get a specific order by ID
   */
  getOrderById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId; // Set by auth middleware
      const id = String(req.params.id);

      const order = await orderService.getOrderById(id, userId);

      res.status(200).json({ order });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Order not found') {
        res.status(404).json({ message: err.message });
        return;
      }
      next(err);
    }
  },
};
