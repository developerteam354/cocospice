import { Schema, model, type Document } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IShopStatus extends Document {
  isOpen:        boolean;
  closingReason: string;
  updatedAt:     Date;
  createdAt:     Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const shopStatusSchema = new Schema<IShopStatus>(
  {
    isOpen:        { type: Boolean, default: true },
    closingReason: { type: String,  default: '',   trim: true },
  },
  { timestamps: true }
);

// ─── Export ───────────────────────────────────────────────────────────────────

export const ShopStatus = model<IShopStatus>('ShopStatus', shopStatusSchema);
