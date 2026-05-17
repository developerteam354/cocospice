import type { Request, Response, NextFunction } from 'express';
import { adminOrderService } from '../../services/admin/order.service.js';
import type { OrderStatus } from '../../models/Order.model.js';

export const adminOrderController = {
  /**
   * GET /api/admin/orders
   * Get all orders (optionally filter by status)
   */
  getAllOrders: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status } = req.query as { status?: OrderStatus };
      
      const orders = await adminOrderService.getAllOrders(status);

      res.status(200).json({ orders });
    } catch (err: unknown) {
      next(err);
    }
  },

  /**
   * GET /api/admin/orders/active
   * Get orders that are NOT delivered (Pending, Confirmed, On the Way)
   */
  getActiveOrders: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = await adminOrderService.getActiveOrders();

      res.status(200).json({ orders });
    } catch (err: unknown) {
      next(err);
    }
  },

  /**
   * GET /api/admin/orders/delivered
   * Get delivered orders
   */
  getDeliveredOrders: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const orders = await adminOrderService.getDeliveredOrders();

      res.status(200).json({ orders });
    } catch (err: unknown) {
      next(err);
    }
  },

  /**
   * GET /api/admin/orders/:id
   * Get a specific order by ID
   */
  getOrderById: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);

      const order = await adminOrderService.getOrderById(id);

      // Debug logging to verify phone number is in the response
      if (process.env.NODE_ENV === 'development') {
        console.log('📦 [Admin] Sending order to frontend:', {
          orderId: order.orderId,
          shippingPhone: order.shippingAddress?.phone,
          userPhone: (order.userId as any)?.phone,
        });
      }

      res.status(200).json({ order });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Order not found') {
        res.status(404).json({ message: err.message });
        return;
      }
      next(err);
    }
  },

  /**
   * PATCH /api/admin/orders/:id/status
   * Update order status
   */
  updateOrderStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { status, cancellationReason } = req.body as { status: OrderStatus; cancellationReason?: string };

      if (!status) {
        res.status(400).json({ message: 'Status is required' });
        return;
      }

      const validStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'On the Way', 'Delivered', 'Ready for Collection', 'Collected', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }

      // If status is Cancelled, cancellationReason is mandatory
      if (status === 'Cancelled' && (!cancellationReason || cancellationReason.trim() === '')) {
        res.status(400).json({ message: 'Cancellation reason is required when cancelling an order' });
        return;
      }

      const order = await adminOrderService.updateOrderStatus(id, status, cancellationReason);

      res.status(200).json({
        message: 'Order status updated successfully',
        order,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Order not found') {
        res.status(404).json({ message: err.message });
        return;
      }
      next(err);
    }
  },

  /**
   * GET /api/admin/orders/stats
   * Get order statistics
   */
  getOrderStats: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await adminOrderService.getOrderStats();

      res.status(200).json({ stats });
    } catch (err: unknown) {
      next(err);
    }
  },
};
