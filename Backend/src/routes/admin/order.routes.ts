import { Router } from 'express';
import { adminOrderController } from '../../controllers/admin/order.controller.js';

const router = Router();

router.get('/stats',           adminOrderController.getOrderStats);       // GET   /api/admin/orders/stats
router.get('/active',          adminOrderController.getActiveOrders);     // GET   /api/admin/orders/active
router.get('/delivered',       adminOrderController.getDeliveredOrders);  // GET   /api/admin/orders/delivered
router.get('/:id',             adminOrderController.getOrderById);        // GET   /api/admin/orders/:id
router.patch('/:id/status',    adminOrderController.updateOrderStatus);   // PATCH /api/admin/orders/:id/status
router.get('/',                adminOrderController.getAllOrders);        // GET   /api/admin/orders

export default router;
