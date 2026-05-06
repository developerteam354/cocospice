export interface MenuOption {
  name: string;
  choices: string[];
  required?: boolean;
}

export interface ExtraOption {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  images?: string[];
  ingredients?: string[];
  categoryId: string;
  extraOptions?: ExtraOption[];
  hasSpiceLevel?: boolean;
  // Additional fields from backend
  isVeg?: boolean;
  stock?: number;
  isAvailable?: boolean;
  ratings?: { average: number; count: number };
  soldCount?: number;
}

export interface Category {
  id: string;
  name: string;
  categoryImage?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedExtraOptions?: ExtraOption[]; // selected extras, each adds to price
  spiceLevel?: 'Low' | 'Medium' | 'Very Spicy';
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  token?: string; // JWT token for API calls (present when using real backend auth)
}

export interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  phone: string;
  isDefault?: boolean;
}

export interface Order {
  id: string;
  date: string;
  status: 'pending' | 'preparing' | 'on-the-way' | 'delivered' | 'cancelled';
  items: CartItem[];
  total: number;
  orderType: 'delivery' | 'collection';
  paymentMethod: string;
  address?: string;
  note?: string;
}
