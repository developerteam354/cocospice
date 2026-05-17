import type { Request, Response, NextFunction } from 'express';
import { adminReviewService } from '../../services/admin/review.service.js';
import type { Types } from 'mongoose';

export const adminReviewController = {
  /**
   * GET /api/admin/reviews
   * Get all reviews (approved and unapproved)
   */
  getAllReviews: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const reviews = await adminReviewService.getAllReviews();

      res.status(200).json({ reviews });
    } catch (err: unknown) {
      next(err);
    }
  },

  /**
   * GET /api/admin/reviews/product/:productId
   * Get all reviews for a specific product
   */
  getReviewsByProduct: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;

      const reviews = await adminReviewService.getReviewsByProduct(
        productId as unknown as Types.ObjectId
      );

      res.status(200).json({ reviews });
    } catch (err: unknown) {
      next(err);
    }
  },

  /**
   * GET /api/admin/reviews/product/:productId/stats
   * Get review statistics for a product
   */
  getProductReviewStats: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { productId } = req.params;

      const stats = await adminReviewService.getProductReviewStats(
        productId as unknown as Types.ObjectId
      );

      res.status(200).json({ stats });
    } catch (err: unknown) {
      next(err);
    }
  },

  /**
   * PATCH /api/admin/reviews/:id/toggle-approval
   * Toggle review approval status
   */
  toggleReviewApproval: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ message: 'Invalid review ID' });
        return;
      }

      const review = await adminReviewService.toggleReviewApproval(id);

      res.status(200).json({
        message: `Review ${review.isApproved ? 'approved' : 'hidden'} successfully`,
        review,
      });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Review not found') {
        res.status(404).json({ message: err.message });
        return;
      }
      next(err);
    }
  },

  /**
   * DELETE /api/admin/reviews/:id
   * Delete a review
   */
  deleteReview: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id || typeof id !== 'string') {
        res.status(400).json({ message: 'Invalid review ID' });
        return;
      }

      await adminReviewService.deleteReview(id);

      res.status(200).json({ message: 'Review deleted successfully' });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Review not found') {
        res.status(404).json({ message: err.message });
        return;
      }
      next(err);
    }
  },

  /**
   * GET /api/admin/reviews/stats
   * Get overall review statistics
   */
  getOverallStats: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await adminReviewService.getOverallStats();

      res.status(200).json({ stats });
    } catch (err: unknown) {
      next(err);
    }
  },
};
