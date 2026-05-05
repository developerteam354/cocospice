import { Router } from 'express';
import { stripeWebhookHandler } from '../controllers/webhook/stripe.controller.js';

const router = Router();

/**
 * POST /api/webhooks/stripe
 *
 * The raw body parsing (express.raw) is applied at the app level in index.ts
 * BEFORE express.json(), so req.body here is already a Buffer.
 */
router.post('/stripe', stripeWebhookHandler);

export default router;
