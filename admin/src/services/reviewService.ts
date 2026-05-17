import { privateApi } from './api';
import type { IReview, IReviewStats, IReviewOverallStats } from '@/types/review';

const adminReviewService = {
  // Get all reviews
  getAll: async (): Promise<IReview[]> => {
    const { data } = await privateApi.get<{ reviews: IReview[] }>('/reviews');
    return data.reviews;
  },

  // Get reviews for a specific product
  getByProduct: async (productId: string): Promise<IReview[]> => {
    const { data } = await privateApi.get<{ reviews: IReview[] }>(`/reviews/product/${productId}`);
    return data.reviews;
  },

  // Get product review stats
  getProductStats: async (productId: string): Promise<IReviewStats> => {
    const { data } = await privateApi.get<{ stats: IReviewStats }>(`/reviews/product/${productId}/stats`);
    return data.stats;
  },

  // Toggle review approval
  toggleApproval: async (reviewId: string): Promise<IReview> => {
    const { data } = await privateApi.patch<{ review: IReview }>(`/reviews/${reviewId}/toggle-approval`);
    return data.review;
  },

  // Delete review
  deleteReview: async (reviewId: string): Promise<void> => {
    await privateApi.delete(`/reviews/${reviewId}`);
  },

  // Get overall stats
  getOverallStats: async (): Promise<IReviewOverallStats> => {
    const { data } = await privateApi.get<{ stats: IReviewOverallStats }>('/reviews/stats');
    return data.stats;
  },
};

export default adminReviewService;
