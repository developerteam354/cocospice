export type OrderStatus = 'Pending' | 'Confirmed' | 'On the Way' | 'Delivered' | 'Ready for Collection' | 'Collected' | 'Cancelled';
export type PaymentMethod = 'Cash on Delivery' | 'Card' | 'Online';

export interface IOrderUser {
  name: string;
  email: string;
  phone: string;
  avatar: string;
}

export interface IOrderItem {
  _id: string;
  name: string;
  thumbnail: string;
  quantity: number;
  price: number;
  spiceLevel?: string;
  subtotal: number;
}

export interface IShippingAddress {
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
}

export interface IOrderTimeline {
  status: string;
  timestamp: string;
  completed: boolean;
}

export interface IOrder {
  _id: string;
  orderId: string;
  user: IOrderUser;
  item: string; // For backward compatibility with list view
  items?: IOrderItem[]; // Detailed items for details page
  price: number; // Total price
  status: OrderStatus;
  orderType: 'delivery' | 'collection';
  paymentMethod?: PaymentMethod;
  orderNote?: string;           // "Your Instructions" from checkout review
  cancellationReason?: string;  // Admin's reason for cancellation
  shippingAddress?: IShippingAddress;
  expectedDelivery?: string;
  timeline?: IOrderTimeline[];
  date: string;
  createdAt: string;
  updatedAt?: string;
}

export interface IOrderStats {
  total: number;
  pending: number;
  confirmed: number;
  onTheWay: number;
  delivered: number;
  cancelled: number;
  active: number;
}

export interface IOrderFilters {
  search?: string;
  status?: OrderStatus | 'All';
}
