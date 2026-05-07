import { Router } from 'express';
import { profileController } from '../../controllers/admin/profile.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(protect);

router.get('/', profileController.getProfile);

export default router;
