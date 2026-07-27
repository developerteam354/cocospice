import { privateApi } from './api';

export interface IShopStatus {
  isOpen:              boolean;
  closingReason:       string;
  isCollectionEnabled: boolean;
  isDeliveryEnabled:   boolean;
  updatedAt:           string;
}

const settingsService = {
  getShopStatus: async (): Promise<IShopStatus> => {
    const { data } = await privateApi.get<{ shopStatus: IShopStatus }>('/settings/shop-status');
    return data.shopStatus;
  },

  updateShopStatus: async (isOpen: boolean, closingReason?: string): Promise<IShopStatus> => {
    const { data } = await privateApi.patch<{ shopStatus: IShopStatus }>('/settings/shop-status', {
      isOpen,
      closingReason: closingReason ?? '',
    });
    return data.shopStatus;
  },

  updateServiceToggles: async (isCollectionEnabled?: boolean, isDeliveryEnabled?: boolean): Promise<IShopStatus> => {
    const { data } = await privateApi.patch<{ shopStatus: IShopStatus }>('/settings/shop-status', {
      isCollectionEnabled,
      isDeliveryEnabled,
    });
    return data.shopStatus;
  },
};

export default settingsService;
