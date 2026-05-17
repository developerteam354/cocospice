import { Review, type IReview } from '../../models/Review.model.js';
import { Order } from '../../models/Order.model.js';
import type { Types } from 'mongoose';

export const userReviewService = {
  /**
   * Submit a review for a product in a delivered/collected order
   */
  submitReview: async (
    userId: Types.ObjectId,
    productId: Types.ObjectId,
    orderId: Types.ObjectId,
    rating: number,
    comment: string
  ): Promise<IReview> => {
    console.log('📝 Submitting review:', { userId, productId, orderId, rating });
    
    // Check if order exists and belongs to user
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
      console.log('❌ Order not found');
      throw new Error('Order not found');
    }

    // Check if order is delivered or collected
    if (order.orderStatus !== 'Delivered' && order.orderStatus !== 'Collected') {
      console.log('❌ Order not delivered/collected:', order.orderStatus);
      throw new Error('You can only review products from delivered or collected orders');
    }

    // Check if product exists in the order
    const productInOrder = order.items.find(
      (item) => item.productId.toString() === productId.toString()
    );
    if (!productInOrder) {
      console.log('❌ Product not found in order');
      throw new Error('Product not found in this order');
    }

    // Create review (multiple reviews per product per order are allowed)
    const review = await Review.create({
      userId,
      productId,
      orderId,
      rating,
      comment,
      isApproved: false, // Requires admin approval
    });

    console.log('✅ Review created:', review._id);

    await review.populate('userId', 'name email profileImage');
    await review.populate('productId', 'name thumbnail images');

    return review;
  },

  /**
   * Get approved reviews for a product (public) with proper population
   */
  getApprovedReviewsByProduct: async (productId: Types.ObjectId): Promise<IReview[]> => {
    const reviews = await Review.find({ productId, isApproved: true })
      .sort({ createdAt: -1 })
      .populate('userId', 'name profileImage')
      .populate('productId', 'name thumbnail images')
      .exec();

    return reviews;
  },

  /**
   * Get user's own reviews with proper population
   */
  getUserReviews: async (userId: Types.ObjectId): Promise<IReview[]> => {
    const reviews = await Review.find({ userId })
      .sort({ createdAt: -1 })
      .populate('productId', 'name thumbnail images')
      .populate('orderId', 'orderId')
      .exec();

    return reviews;
  },
};
