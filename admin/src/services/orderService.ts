import { privateApi } from './api';
import type { IOrder, IOrderStats } from '@/types/order';

// Backend response type (userId is populated with user data)
interface BackendOrder {
  _id: string;
  orderId: string;
  userId: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productId: string | {
      _id: string;
      name: string;
      thumbnail: {
        url: string;
        key: string;
      };
    };
    name: string;
    price: number;
    quantity: number;
    selectedExtraOptions?: Array<{ name: string; price: number }>;
    spiceLevel?: string;
    subtotal: number;
  }>;
  orderType: 'delivery' | 'collection';
  orderNote: string;
  subtotal: number;
  codCharge: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  shippingAddress?: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    phone: string;
    instructions?: string;
    lat?: number;
    lng?: number;
    formattedAddress?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Transform backend order to frontend format
const transformOrder = (backendOrder: BackendOrder): IOrder => {
  return {
    _id: backendOrder._id,
    orderId: backendOrder.orderId,
    user: {
      name: backendOrder.userId.name,
      email: backendOrder.userId.email,
      phone: backendOrder.userId.phone,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(backendOrder.userId.name)}&background=6366f1&color=fff`,
    },
    item: backendOrder.items.map(item => item.name).join(', '), // For list view
    items: backendOrder.items.map(item => {
      // Get product image if populated
      let thumbnail = '/placeholder-product.jpg';
      if (typeof item.productId === 'object' && item.productId.thumbnail) {
        thumbnail = item.productId.thumbnail.url;
      }
      
      return {
        _id: typeof item.productId === 'string' ? item.productId : item.productId._id,
        name: item.name,
        thumbnail,
        quantity: item.quantity,
        price: item.price,
        spiceLevel: item.spiceLevel,
        subtotal: item.subtotal,
      };
    }),
    price: backendOrder.totalAmount,
    status: backendOrder.orderStatus as any,
    paymentMethod: backendOrder.paymentMethod as any,
    orderNote: backendOrder.orderNote || '',
    shippingAddress: backendOrder.shippingAddress ? {
      street:          backendOrder.shippingAddress.line1,
      city:            backendOrder.shippingAddress.city,
      state:           '',
      zipCode:         backendOrder.shippingAddress.postcode,
      country:         'UK',
      instructions:    backendOrder.shippingAddress.instructions || '',
      lat:             backendOrder.shippingAddress.lat,
      lng:             backendOrder.shippingAddress.lng,
      formattedAddress: backendOrder.shippingAddress.formattedAddress || '',
    } : undefined,
    date: backendOrder.createdAt,
    createdAt: backendOrder.createdAt,
    timeline: generateTimeline(backendOrder),
  };
};

// Generate timeline based on order status
const generateTimeline = (order: BackendOrder) => {
  const statuses = ['Pending', 'Confirmed', 'On the Way', 'Delivered'];
  const currentStatusIndex = statuses.indexOf(order.orderStatus);
  
  return statuses.map((status, index) => ({
    status,
    timestamp: index <= currentStatusIndex ? order.createdAt : '',
    completed: index <= currentStatusIndex,
  }));
};

const orderService = {
  // Get all orders
  getAll: async (): Promise<IOrder[]> => {
    const { data } = await privateApi.get<{ orders: BackendOrder[] }>('/orders');
    return data.orders.map(transformOrder);
  },

  // Get active orders (not delivered)
  getActive: async (): Promise<IOrder[]> => {
    const { data } = await privateApi.get<{ orders: BackendOrder[] }>('/orders/active');
    return data.orders.map(transformOrder);
  },

  // Get delivered orders
  getDelivered: async (): Promise<IOrder[]> => {
    const { data } = await privateApi.get<{ orders: BackendOrder[] }>('/orders/delivered');
    return data.orders.map(transformOrder);
  },

  // Get order by ID
  getById: async (id: string): Promise<IOrder> => {
    const { data } = await privateApi.get<{ order: BackendOrder }>(`/orders/${id}`);
    return transformOrder(data.order);
  },

  // Update order status
  updateStatus: async (id: string, status: string): Promise<IOrder> => {
    const { data } = await privateApi.patch<{ order: BackendOrder }>(`/orders/${id}/status`, { status });
    return transformOrder(data.order);
  },

  // Get order statistics
  getStats: async (): Promise<IOrderStats> => {
    const { data } = await privateApi.get<{ stats: IOrderStats }>('/orders/stats');
    return data.stats;
  },
};

export default orderService;
