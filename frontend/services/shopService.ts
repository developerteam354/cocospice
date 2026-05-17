import { publicApi } from '../lib/api';

export interface ShopStatusResponse {
  isOpen:          boolean;  // raw admin toggle — for header display
  effectivelyOpen: boolean;  // isOpen AND within trading hours — for checkout blocking
  manuallyOpen:    boolean;  // alias for isOpen
  withinHours:     boolean;
  closingReason:   string;
  openFrom:        string;
  openUntil:       string;
}

export async function fetchShopStatus(): Promise<ShopStatusResponse> {
  const { data } = await publicApi.get<{ shopStatus: ShopStatusResponse }>('/settings/shop-status');
  return data.shopStatus;
}
