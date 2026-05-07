import { Router } from 'express';
import { adminUserController } from '../../controllers/admin/user.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

// All routes require admin authentication
router.use(protect);

router.get('/',                  adminUserController.getAllUsers);      // GET   /api/admin/users
router.get('/stats',             adminUserController.getUserStats);     // GET   /api/admin/users/stats
router.patch('/:id/toggle-status', adminUserController.toggleUserStatus); // PATCH /api/admin/users/:id/toggle-status

export default router;
