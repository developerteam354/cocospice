import { Schema, model, type Document, type Types } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IReview extends Document {
  userId: Types.ObjectId;
  productId: Types.ObjectId;
  orderId: Types.ObjectId;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const reviewSchema = new Schema<IReview>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    isApproved: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Index for fetching reviews by user+product+order (no unique constraint — multiple reviews allowed)
reviewSchema.index({ userId: 1, productId: 1, orderId: 1 });

// Index for fetching approved reviews by product
reviewSchema.index({ productId: 1, isApproved: 1 });

// ─── Export ───────────────────────────────────────────────────────────────────

export const Review = model<IReview>('Review', reviewSchema);
