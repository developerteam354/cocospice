import { Router } from 'express';
import { getCart, syncCart } from '../../controllers/user/cart.controller.js';

const router = Router();

router.get('/',        getCart);   // GET  /api/user/cart?sessionId=xxx
router.post('/sync',   syncCart);  // POST /api/user/cart/sync

export default router;
