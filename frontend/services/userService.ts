import { Order, SavedAddress, User } from '../types';

const mockUser: User = {
  id: 'u1',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '07123456789'
};

const mockAddresses: SavedAddress[] = [
  {
    id: 'a1',
    label: 'Home',
    fullName: 'John Doe',
    line1: '123 Curry Lane',
    city: 'London',
    postcode: 'E1 6AN',
    phone: '07123456789',
    isDefault: true
  },
  {
    id: 'a2',
    label: 'Office',
    fullName: 'John Doe',
    line1: '45 Spice Street',
    city: 'London',
    postcode: 'EC1 2BB',
    phone: '07123456789',
    isDefault: false
  }
];

const mockOrders: Order[] = [
  {
    id: 'ORD-8291',
    date: '2026-04-25T19:30:00Z',
    status: 'delivered',
    total: 24.50,
    orderType: 'delivery',
    paymentMethod: 'card',
    address: '123 Curry Lane, London, E1 6AN',
    items: [
      { id: 'm4', name: 'Chicken Tikka', description: '', price: 4.50, quantity: 2, image: '/images/starters.png', categoryId: 'c2' },
      { id: 'm6', name: 'Chicken Balti', description: '', price: 8.90, quantity: 1, image: '/images/balti.png', categoryId: 'c3' }
    ]
  },
  {
    id: 'ORD-9102',
    date: '2026-04-28T12:15:00Z',
    status: 'preparing',
    total: 12.80,
    orderType: 'collection',
    paymentMethod: 'cash',
    items: [
      { id: 'm10', name: 'Somosa', description: '', price: 3.80, quantity: 2, image: '/images/starters.png', categoryId: 'c2' },
      { id: 'm1', name: 'Plain Poppadom', description: '', price: 0.90, quantity: 3, image: '/images/poppadom.png', categoryId: 'c1' }
    ]
  }
];

export const getUserProfile = async (): Promise<User> => {
  return mockUser;
};

export const getSavedAddresses = async (): Promise<SavedAddress[]> => {
  return mockAddresses;
};

export const getUserOrders = async (): Promise<Order[]> => {
  return mockOrders;
};
