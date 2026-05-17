import { privateApi, publicApi } from '../lib/api';

export interface IReview {
  _id: string;
  userId: {
    _id: string;
    name: string;
    profileImage?: string;
  };
  productId: {
    _id: string;
    name: string;
    thumbnail?: {
      url: string;
      key: string;
    };
  };
  orderId: {
    _id: string;
    orderId: string;
  };
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ISubmitReviewData {
  productId: string;
  orderId: string;
  rating: number;
  comment: string;
}

const reviewService = {
  // Submit a review
  submitReview: async (data: ISubmitReviewData): Promise<IReview> => {
    const { data: response } = await privateApi.post<{ message: string; review: IReview }>('/reviews', data);
    return response.review;
  },

  // Get approved reviews for a product (public)
  getApprovedReviews: async (productId: string): Promise<IReview[]> => {
    const { data } = await publicApi.get<{ reviews: IReview[] }>(`/reviews/product/${productId}`);
    return data.reviews;
  },

  // Get user's own reviews
  getMyReviews: async (): Promise<IReview[]> => {
    const { data } = await privateApi.get<{ reviews: IReview[] }>('/reviews/my-reviews');
    return data.reviews;
  },
};

export default reviewService;
