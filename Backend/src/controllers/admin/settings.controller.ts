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
    status = await ShopStatus.create({ isOpen: true, closingReason: '' });
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
    const { isOpen, closingReason } = req.body as { isOpen: boolean; closingReason?: string };

    if (typeof isOpen !== 'boolean') {
      res.status(400).json({ message: '`isOpen` must be a boolean' });
      return;
    }

    const status = await getOrCreateStatus();
    status.isOpen        = isOpen;
    status.closingReason = isOpen ? '' : (closingReason?.trim() ?? '');
    await status.save();

    res.status(200).json({ shopStatus: status });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update shop status' });
  }
};

// ─── Public: GET /api/user/settings/shop-status ──────────────────────────────
// No auth required — frontend polls this to show open/closed state.

export const getPublicShopStatus = async (_req: Request, res: Response): Promise<void> => {
  try {
    const status = await getOrCreateStatus();

    res.status(200).json({
      shopStatus: {
        isOpen:        status.isOpen,
        manuallyOpen:  status.isOpen,
        withinHours:   true,
        effectivelyOpen: status.isOpen,
        closingReason: status.closingReason,
        openFrom:      '9:00 AM',
        openUntil:     '10:00 PM',
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch shop status' });
  }
};
