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
    profileImage?: string; // ✅ Add profileImage field
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
  cancellationReason?: string;
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
  console.log('🔄 Transforming order:', {
    orderId: backendOrder.orderId,
    userName: backendOrder.userId.name,
    userProfileImage: backendOrder.userId.profileImage,
    hasProfileImage: !!backendOrder.userId.profileImage,
    backendPhone: backendOrder.shippingAddress?.phone,
    backendFullName: backendOrder.shippingAddress?.fullName,
  });

  // ✅ Use actual profile image if available, otherwise fallback to avatar
  const userAvatar = backendOrder.userId.profileImage && backendOrder.userId.profileImage.trim() !== ''
    ? backendOrder.userId.profileImage 
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(backendOrder.userId.name)}&background=6366f1&color=fff`;

  console.log('👤 Avatar URL:', userAvatar);

  return {
    _id: backendOrder._id,
    orderId: backendOrder.orderId,
    user: {
      name: backendOrder.userId.name,
      email: backendOrder.userId.email,
      phone: backendOrder.userId.phone,
      avatar: userAvatar, // ✅ Use actual profile image or fallback
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
    orderType: backendOrder.orderType,
    paymentMethod: backendOrder.paymentMethod as any,
    orderNote: backendOrder.orderNote || '',
    cancellationReason: backendOrder.cancellationReason,
    shippingAddress: backendOrder.shippingAddress ? {
      fullName:         backendOrder.shippingAddress.fullName,
      line1:            backendOrder.shippingAddress.line1,
      line2:            backendOrder.shippingAddress.line2 || '',
      city:             backendOrder.shippingAddress.city,
      postcode:         backendOrder.shippingAddress.postcode,
      phone:            backendOrder.shippingAddress.phone, // ✅ CRITICAL: Include phone number
      instructions:     backendOrder.shippingAddress.instructions || '',
      lat:              backendOrder.shippingAddress.lat,
      lng:              backendOrder.shippingAddress.lng,
      formattedAddress: backendOrder.shippingAddress.formattedAddress || '',
    } : undefined,
    date: backendOrder.createdAt,
    createdAt: backendOrder.createdAt,
    updatedAt: backendOrder.updatedAt,
    timeline: generateTimeline(backendOrder),
  };
};

// Generate timeline based on order status and type
const generateTimeline = (order: BackendOrder) => {
  const isCollection = order.orderType === 'collection';
  const statuses = isCollection
    ? ['Pending', 'Confirmed', 'Ready for Collection', 'Collected']
    : ['Pending', 'Confirmed', 'On the Way', 'Delivered'];

  // Map collection-specific statuses to their index
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
  updateStatus: async (id: string, status: string, cancellationReason?: string): Promise<IOrder> => {
    const payload: { status: string; cancellationReason?: string } = { status };
    if (cancellationReason) {
      payload.cancellationReason = cancellationReason;
    }
    const { data } = await privateApi.patch<{ order: BackendOrder }>(`/orders/${id}/status`, payload);
    return transformOrder(data.order);
  },

  // Get order statistics
  getStats: async (): Promise<IOrderStats> => {
    const { data } = await privateApi.get<{ stats: IOrderStats }>('/orders/stats');
    return data.stats;
  },
};

export default orderService;
