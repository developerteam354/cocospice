import { Review, type IReview } from '../../models/Review.model.js';
import type { Types } from 'mongoose';

export const adminReviewService = {
  /**
   * Get all reviews (approved and unapproved) with proper population
   */
  getAllReviews: async (): Promise<IReview[]> => {
    console.log('📊 Fetching all reviews for admin...');
    
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'name email profileImage')
      .populate('productId', 'name thumbnail images')
      .populate('orderId', 'orderId')
      .exec();

    console.log(`✅ Found ${reviews.length} reviews`);
    return reviews;
  },

  /**
   * Get reviews by product (all, not just approved) with proper population
   */
  getReviewsByProduct: async (productId: Types.ObjectId): Promise<IReview[]> => {
    console.log('📊 Fetching reviews for product:', productId);
    
    const reviews = await Review.find({ productId })
      .sort({ createdAt: -1 })
      .populate('userId', 'name email profileImage')
      .populate('productId', 'name thumbnail images')
      .populate('orderId', 'orderId')
      .exec();

    console.log(`✅ Found ${reviews.length} reviews for product`);
    return reviews;
  },

  /**
   * Get review statistics for a product — uses MongoDB aggregation for accuracy
   */
  getProductReviewStats: async (productId: Types.ObjectId) => {
    console.log('📊 Calculating review stats for product:', productId);
    
    // Use aggregation for mathematically accurate average
    const aggResult = await Review.aggregate([
      { $match: { productId, isApproved: true } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          r1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
          r2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
          r3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
          r4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
          r5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
        },
      },
    ]);

    if (!aggResult.length) {
      console.log('⚠️ No approved reviews found for product');
      return {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      };
    }

    const { totalReviews, averageRating, r1, r2, r3, r4, r5 } = aggResult[0];

    console.log(`✅ Stats: ${totalReviews} reviews, avg rating: ${averageRating.toFixed(1)}`);

    return {
      totalReviews,
      averageRating: parseFloat(averageRating.toFixed(1)),
      ratingDistribution: { 1: r1, 2: r2, 3: r3, 4: r4, 5: r5 },
    };
  },

  /**
   * Toggle review approval status
   */
  toggleReviewApproval: async (reviewId: string): Promise<IReview> => {
    const review = await Review.findById(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    review.isApproved = !review.isApproved;
    await review.save();

    console.log(`✅ Review ${reviewId} ${review.isApproved ? 'approved' : 'hidden'}`);

    await review.populate('userId', 'name email profileImage');
    await review.populate('productId', 'name thumbnail images');
    await review.populate('orderId', 'orderId');

    return review;
  },

  /**
   * Delete a review
   */
  deleteReview: async (reviewId: string): Promise<void> => {
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }
  },

  /**
   * Get review statistics (overall)
   */
  getOverallStats: async () => {
    const [total, approved, pending] = await Promise.all([
      Review.countDocuments(),
      Review.countDocuments({ isApproved: true }),
      Review.countDocuments({ isApproved: false }),
    ]);

    return {
      total,
      approved,
      pending,
    };
  },
};
