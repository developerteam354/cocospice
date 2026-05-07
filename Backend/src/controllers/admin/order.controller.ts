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
      const { id } = req.params;

      const order = await adminOrderService.getOrderById(id);

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
      const { id } = req.params;
      const { status } = req.body as { status: OrderStatus };

      if (!status) {
        res.status(400).json({ message: 'Status is required' });
        return;
      }

      const validStatuses: OrderStatus[] = ['Pending', 'Confirmed', 'On the Way', 'Delivered', 'Cancelled'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ message: 'Invalid status' });
        return;
      }

      const order = await adminOrderService.updateOrderStatus(id, status);

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
