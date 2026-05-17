import { Router } from 'express';
import { adminReviewController } from '../../controllers/admin/review.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

// All admin review routes require admin authentication
router.use(protect);

// Get all reviews
router.get('/', adminReviewController.getAllReviews);

// Get overall stats
router.get('/stats', adminReviewController.getOverallStats);

// Get reviews by product
router.get('/product/:productId', adminReviewController.getReviewsByProduct);

// Get product review stats
router.get('/product/:productId/stats', adminReviewController.getProductReviewStats);

// Toggle review approval
router.patch('/:id/toggle-approval', adminReviewController.toggleReviewApproval);

// Delete review
router.delete('/:id', adminReviewController.deleteReview);

export default router;
