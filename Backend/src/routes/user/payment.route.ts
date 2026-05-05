import { Router } from 'express';
import { createPaymentIntent } from '../../controllers/user/payment.controller.js';
import { authenticateUser } from '../../middlewares/auth.middleware.js';

const router = Router();

// POST /api/user/payment/create-intent — protected, requires valid user JWT
router.post('/create-intent', authenticateUser, createPaymentIntent);

export default router;
