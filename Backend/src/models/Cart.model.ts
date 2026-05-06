import { Schema, model, type Document } from 'mongoose';

// ─── Sub-document interfaces ──────────────────────────────────────────────────

export interface IExtraOption {
  name: string;
  price: number;
}

export interface ICartItem {
  productId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  quantity: number;
  selectedExtraOptions: IExtraOption[];
  spiceLevel?: string;
}

// ─── Main interface ───────────────────────────────────────────────────────────

export interface ICart extends Document {
  /** Unique identifier — userId for logged-in users, guestId for guests */
  sessionId: string;
  items: ICartItem[];
  orderType: 'delivery' | 'collection';
  orderNote: string;
  updatedAt: Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const extraOptionSchema = new Schema<IExtraOption>(
  { name: { type: String, required: true }, price: { type: Number, default: 0 } },
  { _id: false }
);

const cartItemSchema = new Schema<ICartItem>(
  {
    productId:           { type: String, required: true },
    name:                { type: String, required: true },
    description:         { type: String, default: '' },
    price:               { type: Number, required: true },
    image:               { type: String, default: '' },
    categoryId:          { type: String, default: '' },
    quantity:            { type: Number, required: true, min: 1 },
    selectedExtraOptions: { type: [extraOptionSchema], default: [] },
    spiceLevel:           { type: String },
  },
  { _id: false }
);

// ─── Main schema ──────────────────────────────────────────────────────────────

const cartSchema = new Schema<ICart>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    items:     { type: [cartItemSchema], default: [] },
    orderType: { type: String, enum: ['delivery', 'collection'], default: 'delivery' },
    orderNote: { type: String, default: '' },
  },
  { timestamps: true }
);

// Auto-expire carts after 30 days of inactivity
cartSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const Cart = model<ICart>('Cart', cartSchema);
