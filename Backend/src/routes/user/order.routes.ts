import { Router } from 'express';
import { userOrderController } from '../../controllers/user/order.controller.js';
import { authenticateUser } from '../../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

router.post('/',     userOrderController.createOrder);    // POST /api/user/orders
router.get('/',      userOrderController.getUserOrders);  // GET  /api/user/orders
router.get('/:id',   userOrderController.getOrderById);   // GET  /api/user/orders/:id

export default router;
