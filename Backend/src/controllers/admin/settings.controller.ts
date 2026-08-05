import type { Request, Response } from 'express';
import { ShopStatus } from '../../models/ShopStatus.model.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the single ShopStatus document, creating it with defaults if it
 * doesn't exist yet (first-run / fresh DB).
 */
async function getOrCreateStatus() {
  let status = await ShopStatus.findOne().exec();
  if (!status) {
    status = await ShopStatus.create({ 
      isOpen: true, 
      closingReason: '',
      isCollectionEnabled: true,
      isDeliveryEnabled: true
    });
  }
  return status;
}

// ─── Admin: GET /api/admin/settings/shop-status ───────────────────────────────

export const getShopStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const status = await getOrCreateStatus();
    res.status(200).json({ shopStatus: status });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch shop status' });
  }
};

// ─── Admin: PATCH /api/admin/settings/shop-status ────────────────────────────

export const updateShopStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { isOpen, closingReason, isCollectionEnabled, isDeliveryEnabled } = req.body as { 
      isOpen?: boolean; 
      closingReason?: string;
      isCollectionEnabled?: boolean;
      isDeliveryEnabled?: boolean;
    };

    console.log('🔧 [Admin Update Shop Status] Received:', { isOpen, closingReason, isCollectionEnabled, isDeliveryEnabled });

    const status = await getOrCreateStatus();
    console.log('📦 [Admin Update Shop Status] Current status before update:', {
      isOpen: status.isOpen,
      closingReason: status.closingReason,
      isCollectionEnabled: status.isCollectionEnabled,
      isDeliveryEnabled: status.isDeliveryEnabled
    });
    
    // Update shop open/closed status
    if (typeof isOpen === 'boolean') {
      status.isOpen = isOpen;
      status.closingReason = isOpen ? '' : (closingReason?.trim() ?? '');
    }
    
    // Update service toggles
    if (typeof isCollectionEnabled === 'boolean') {
      status.isCollectionEnabled = isCollectionEnabled;
    }
    
    if (typeof isDeliveryEnabled === 'boolean') {
      status.isDeliveryEnabled = isDeliveryEnabled;
    }
    
    await status.save();

    console.log('✅ [Admin Update Shop Status] Updated successfully:', {
      isOpen: status.isOpen,
      closingReason: status.closingReason,
      isCollectionEnabled: status.isCollectionEnabled,
      isDeliveryEnabled: status.isDeliveryEnabled
    });

    res.status(200).json({ shopStatus: status });
  } catch (err) {
    console.error('❌ [Admin Update Shop Status] Error:', err);
    res.status(500).json({ message: 'Failed to update shop status' });
  }
};

// ─── Public: GET /api/user/settings/shop-status ──────────────────────────────
// No auth required — frontend polls this to show open/closed state.

export const getPublicShopStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const status = await getOrCreateStatus();

    const response = {
      shopStatus: {
        isOpen:              status.isOpen,
        manuallyOpen:        status.isOpen,
        withinHours:         true,
        effectivelyOpen:     status.isOpen,
        closingReason:       status.closingReason,
        isCollectionEnabled: status.isCollectionEnabled,
        isDeliveryEnabled:   status.isDeliveryEnabled,
        openFrom:            '12:00 PM',
        openUntil:           '11:00 PM',
      },
    };

    console.log('📊 [Public Shop Status] Returning:', response.shopStatus);
    res.status(200).json(response);
  } catch (err) {
    console.error('❌ [Public Shop Status] Error:', err);
    res.status(500).json({ message: 'Failed to fetch shop status' });
  }
};
