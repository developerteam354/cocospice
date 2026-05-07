import { Router } from 'express';
import { userAuthController } from '../../controllers/user/auth.controller.js';

const router = Router();

router.post('/register', userAuthController.register); // POST /api/user/auth/register
router.post('/login',    userAuthController.login);    // POST /api/user/auth/login
router.post('/refresh',  userAuthController.refresh);  // POST /api/user/auth/refresh
router.post('/logout',   userAuthController.logout);   // POST /api/user/auth/logout
router.get('/me',        userAuthController.getMe);    // GET  /api/user/auth/me

export default router;
