import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { getShopStatus, updateShopStatus } from '../../controllers/admin/settings.controller.js';

const router = Router();

// All admin settings routes require admin auth
router.use(protect);

router.get('/shop-status',   getShopStatus);
router.patch('/shop-status', updateShopStatus);

export default router;
