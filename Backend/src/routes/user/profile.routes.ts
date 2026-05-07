import { Router } from 'express';
import { userProfileController } from '../../controllers/user/profile.controller.js';
import { authenticateUser } from '../../middlewares/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// GET /api/user/profile - Get user profile
router.get('/', userProfileController.getProfile);

// PATCH /api/user/profile - Update user profile
router.patch('/', userProfileController.updateProfile);

export default router;
