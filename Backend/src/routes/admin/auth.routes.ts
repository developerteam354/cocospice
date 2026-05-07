import { Router } from 'express';
import { authController } from '../../controllers/admin/auth.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post('/login',   authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout',  protect, authController.logout);
router.get('/me',       protect, authController.getMe);
router.patch('/profile', protect, authController.updateProfile);

export default router;
