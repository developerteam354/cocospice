import { Router } from 'express';
import { userReviewController } from '../../controllers/user/review.controller.js';
import { authenticateUser } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public — no auth required
router.get('/product/:productId', userReviewController.getApprovedReviewsByProduct);

// Protected — require authentication
router.post('/', authenticateUser, userReviewController.submitReview);
router.get('/my-reviews', authenticateUser, userReviewController.getMyReviews);

export default router;
