import { Router } from 'express';
import { getPublicShopStatus } from '../../controllers/admin/settings.controller.js';

const router = Router();

// Public — no auth required
router.get('/shop-status', getPublicShopStatus);

export default router;
