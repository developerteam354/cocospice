import type { Request, Response, NextFunction } from 'express';
import { userReviewService } from '../../services/user/review.service.js';
import type { Types } from 'mongoose';

export const userReviewController = {
  /**
   * POST /api/user/reviews
   * Submit a review for a product
   */
  submitReview: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // authenticateUser middleware sets req.userId (string)
      const userId = (req as any).userId as string;
      
      if (!userId) {
        res.status(401).json({ message: 'Authentication required' });
        return;
      }

      const { productId: rawProductId, orderId, comment, rating: rawRating } = req.body;
      const rating = Number(rawRating);

      // productId may arrive as a plain string or as a populated object { _id, name, ... }
      const productId: string =
        rawProductId && typeof rawProductId === 'object' && rawProductId._id
          ? String(rawProductId._id)
          : String(rawProductId);

      console.log('📝 Review submission request:', { userId, productId, orderId, rating, commentLength: comment?.length });

      // Strict validation - ALL fields required
      if (!productId || !orderId || !rating || !comment) {
        res.status(400).json({ message: 'Product ID, Order ID, Rating, and Feedback are required' });
        return;
      }

      // Validate rating
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
        return;
      }

      // Strict comment validation - REQUIRED, minimum 10 characters
      if (!comment || comment.trim().length < 10) {
        res.status(400).json({ message: 'Feedback text is required (minimum 10 characters)' });
        return;
      }

      if (comment.trim().length > 1000) {
        res.status(400).json({ message: 'Feedback must not exceed 1000 characters' });
        return;
      }

      const review = await userReviewService.submitReview(
        userId as unknown as Types.ObjectId,
        productId as unknown as Types.ObjectId,
        orderId as unknown as Types.ObjectId,
        rating,
        comment.trim()
      );

      console.log('✅ Review submitted successfully:', review._id);

      res.status(201).json({
        message: 'Review submitted successfully. It will be visible after admin approval.',
        review,
      });
    } catch (err: unknown) {
      console.error('❌ Error submitting review:', err);
      
      if (err instanceof Error) {
        if (
          err.message === 'Order not found' ||
          err.message === 'Product not found in this order'
        ) {
          res.status(404).json({ message: err.message });
          return;
        }
        if (err.message === 'You can only review products from delivered or collected orders') {
          res.status(400).json({ message: err.message });
          return;
        }

        // Handle validation errors
        if (err.name === 'ValidationError') {
          res.status(400).json({ message: 'Invalid data provided', details: err.message });
          return;
        }
      }
      
      // Pass to error handler middleware
      next(err);
    }
  },

  /**
   * GET /api/user/reviews/product/:productId
   * Get approved reviews for a product
   */
  getApprovedReviewsByProduct: async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { productId } = req.params;

      const reviews = await userReviewService.getApprovedReviewsByProduct(
        productId as unknown as Types.ObjectId
      );

      res.status(200).json({ reviews });
    } catch (err: unknown) {
      next(err);
    }
  },

  /**
   * GET /api/user/reviews/my-reviews
   * Get user's own reviews
   */
  getMyReviews: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId as string;

      const reviews = await userReviewService.getUserReviews(userId as unknown as Types.ObjectId);

      res.status(200).json({ reviews });
    } catch (err: unknown) {
      next(err);
    }
  },
};
