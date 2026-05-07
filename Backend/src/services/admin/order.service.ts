import { Order, type IOrder, type OrderStatus } from '../../models/Order.model.js';

export const adminOrderService = {
  /**
   * Get all orders (optionally filter by status)
   */
  getAllOrders: async (status?: OrderStatus): Promise<IOrder[]> => {
    const query = status ? { orderStatus: status } : {};
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name thumbnail')
      .exec();

    return orders;
  },

  /**
   * Get orders that are NOT delivered (for "New Orders" page)
   */
  getActiveOrders: async (): Promise<IOrder[]> => {
    const orders = await Order.find({
      orderStatus: { $in: ['Pending', 'Confirmed', 'On the Way'] },
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name thumbnail')
      .exec();

    return orders;
  },

  /**
   * Get delivered orders (for "Delivered Orders" page)
   */
  getDeliveredOrders: async (): Promise<IOrder[]> => {
    const orders = await Order.find({ orderStatus: 'Delivered' })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name thumbnail')
      .exec();

    return orders;
  },

  /**
   * Get a single order by ID
   */
  getOrderById: async (orderId: string): Promise<IOrder> => {
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name thumbnail')
      .exec();

    if (!order) throw new Error('Order not found');
    return order;
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<IOrder> => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.orderStatus = status;

    // If status is Delivered, mark payment as Paid (for COD orders)
    if (status === 'Delivered' && order.paymentMethod === 'Cash on Delivery') {
      order.paymentStatus = 'Paid';
    }

    await order.save();
    await order.populate('userId', 'name email phone');
    await order.populate('items.productId', 'name thumbnail');

    return order;
  },

  /**
   * Get order statistics
   */
  getOrderStats: async () => {
    const [total, pending, confirmed, onTheWay, delivered, cancelled] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ orderStatus: 'Pending' }),
      Order.countDocuments({ orderStatus: 'Confirmed' }),
      Order.countDocuments({ orderStatus: 'On the Way' }),
      Order.countDocuments({ orderStatus: 'Delivered' }),
      Order.countDocuments({ orderStatus: 'Cancelled' }),
    ]);

    return {
      total,
      pending,
      confirmed,
      onTheWay,
      delivered,
      cancelled,
      active: pending + confirmed + onTheWay,
    };
  },
};
