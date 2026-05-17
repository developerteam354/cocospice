import { Order, type IOrder, type OrderStatus } from '../../models/Order.model.js';

export const adminOrderService = {
  /**
   * Get all orders (optionally filter by status)
   */
  getAllOrders: async (status?: OrderStatus): Promise<IOrder[]> => {
    const query = status ? { orderStatus: status } : {};
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone profileImage')
      .populate('items.productId', 'name thumbnail')
      .exec();

    return orders;
  },

  /**
   * Get orders that are NOT delivered (for "New Orders" page)
   */
  getActiveOrders: async (): Promise<IOrder[]> => {
    const orders = await Order.find({
      orderStatus: { $in: ['Pending', 'Confirmed', 'On the Way', 'Ready for Collection'] },
    })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone profileImage')
      .populate('items.productId', 'name thumbnail')
      .exec();

    return orders;
  },

  /**
   * Get delivered/collected orders (for "Delivered Orders" page)
   */
  getDeliveredOrders: async (): Promise<IOrder[]> => {
    const orders = await Order.find({ orderStatus: { $in: ['Delivered', 'Collected'] } })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email phone profileImage')
      .populate('items.productId', 'name thumbnail')
      .exec();

    return orders;
  },

  /**
   * Get a single order by ID
   */
  getOrderById: async (orderId: string): Promise<IOrder> => {
    const order = await Order.findById(orderId)
      .populate('userId', 'name email phone profileImage')
      .populate('items.productId', 'name thumbnail')
      .exec();

    if (!order) throw new Error('Order not found');
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('📦 [Backend Service] Order fetched from DB:', {
        orderId: order.orderId,
        hasShippingAddress: !!order.shippingAddress,
        shippingPhone: order.shippingAddress?.phone,
        shippingFullName: order.shippingAddress?.fullName,
        shippingLine1: order.shippingAddress?.line1,
      });
    }
    
    return order;
  },

  /**
   * Update order status
   */
  updateOrderStatus: async (orderId: string, status: OrderStatus, cancellationReason?: string): Promise<IOrder> => {
    const order = await Order.findById(orderId);
    if (!order) throw new Error('Order not found');

    order.orderStatus = status;

    // If status is Cancelled, save the cancellation reason
    if (status === 'Cancelled' && cancellationReason) {
      order.cancellationReason = cancellationReason;
    }

    // If status is Delivered or Collected, mark payment as Paid (for COD orders)
    if ((status === 'Delivered' || status === 'Collected') && order.paymentMethod === 'Cash on Delivery') {
      order.paymentStatus = 'Paid';
    }

    await order.save();
    await order.populate('userId', 'name email phone profileImage');
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
      Order.countDocuments({ orderStatus: { $in: ['On the Way', 'Ready for Collection'] } }),
      Order.countDocuments({ orderStatus: { $in: ['Delivered', 'Collected'] } }),
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
