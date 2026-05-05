import type { Request, Response, NextFunction } from 'express';
import { orderService } from '../../services/user/order.service.js';
import type { IOrderItem, IShippingAddress } from '../../models/Order.model.js';

export const userOrderController = {
  /**
   * POST /api/user/orders
   * Create a new order
   */
  createOrder: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId; // Set by auth middleware
      
      const {
        items,
        orderType,
        orderNote,
        subtotal,
        codCharge,
        totalAmount,
        paymentMethod,
        shippingAddress,
      } = req.body as {
        items: IOrderItem[];
        orderType: 'delivery' | 'collection';
        orderNote?: string;
        subtotal: number;
        codCharge: number;
        totalAmount: number;
        paymentMethod: 'Cash on Delivery' | 'Card' | 'Online';
        shippingAddress?: IShippingAddress;
      };

      // Validation
      if (!items || items.length === 0) {
        res.status(400).json({ message: 'Order must have at least one item' });
        return;
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

      // Create order
      const order = await orderService.createOrder({
        userId,
        items,
        orderType,
        orderNote,
        subtotal,
        codCharge,
        totalAmount,
        paymentMethod,
        shippingAddress,
      });

      res.status(201).json({
        message: 'Order placed successfully',
        order,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.startsWith('Invalid productId')) {
        res.status(400).json({ message: err.message });
        return;
      }
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
      const { id } = req.params;

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
