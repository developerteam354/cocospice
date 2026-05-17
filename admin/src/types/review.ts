export interface IReviewUser {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
}

export interface IReviewProduct {
  _id: string;
  name: string;
  thumbnail?: {
    url: string;
    key: string;
  };
}

export interface IReviewOrder {
  _id: string;
  orderId: string;
}

export interface IReview {
  _id: string;
  userId: IReviewUser;
  productId: IReviewProduct;
  orderId: IReviewOrder;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingDistribution: Record<number, number>;
}

export interface IReviewOverallStats {
  total: number;
  approved: number;
  pending: number;
}
