import { Schema, model, type Document, type Types } from 'mongoose';

// ─── Sub-document Interfaces ──────────────────────────────────────────────────

export interface IImageAsset {
  url: string;
  key: string; // S3 object key;
}

export interface IRatings {
  average: number;
  count: number;
}

export interface IMenuOption {
  name: string;
  choices: string[];
  required: boolean;
}

export interface IExtraOption {
  name: string;
  price: number;
}

// ─── Main Interface ───────────────────────────────────────────────────────────

export interface IProduct extends Document {
  // Basic Info
  name: string;
  description: string;
  ingredients: string[];
  isVeg: boolean;

  // Pricing & Inventory
  price: number;
  offerPercentage: number;
  finalPrice: number;
  stock: number;
  isAvailable: boolean;

  // Images
  thumbnail: IImageAsset;
  gallery: IImageAsset[];

  // Relationships
  category: Types.ObjectId;

  // Stats
  ratings: IRatings;
  soldCount: number;
  hasSpiceLevel: boolean;
  extraOptions: IExtraOption[];

  // Timestamps (injected by mongoose)
  createdAt: Date;
  updatedAt: Date;
}

// ─── Sub-schemas ──────────────────────────────────────────────────────────────

const imageAssetSchema = new Schema<IImageAsset>(
  {
    url: { type: String, required: true },
    key: { type: String, required: true },
  },
  { _id: false }
);

const ratingsSchema = new Schema<IRatings>(
  {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count:   { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const menuOptionSchema = new Schema<IMenuOption>(
  {
    name:     { type: String, required: true },
    choices:  { type: [String], required: true },
    required: { type: Boolean, default: false },
  },
  { _id: false }
);

const extraOptionSchema = new Schema<IExtraOption>(
  {
    name:  { type: String, required: true },
    price: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

// ─── Main Schema ──────────────────────────────────────────────────────────────

const productSchema = new Schema<IProduct>(
  {
    // Basic Info
    name:        { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    ingredients: { type: [String], default: [] },
    isVeg:       { type: Boolean, default: true },

    // Pricing & Inventory
    price:           { type: Number, required: true, min: 0 },
    offerPercentage: { type: Number, default: 0, min: 0, max: 100 },
    finalPrice:      { type: Number, min: 0 },
    stock:           { type: Number, default: 0, min: 0 },
    isAvailable:     { type: Boolean, default: true },

    // Images
    thumbnail: { type: imageAssetSchema, required: true },
    gallery:   { type: [imageAssetSchema], default: [] },

    // Relationships
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },

    // Stats
    ratings:      { type: ratingsSchema, default: () => ({ average: 0, count: 0 }) },
    soldCount:    { type: Number, default: 0, min: 0 },
    hasSpiceLevel: { type: Boolean, default: false },
    extraOptions: { type: [extraOptionSchema], default: [] },
  },
  { timestamps: true }
);

// ─── Auto-calculate finalPrice ────────────────────────────────────────────────

function calculateFinalPrice(doc: IProduct): void {
  if (doc.offerPercentage > 0) {
    doc.finalPrice = parseFloat(
      (doc.price - (doc.price * doc.offerPercentage) / 100).toFixed(2)
    );
  } else {
    doc.finalPrice = doc.price;
  }
}

productSchema.pre('save', function () {
  calculateFinalPrice(this);
});

productSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() as Partial<IProduct> | null;
  if (update && (update.price !== undefined || update.offerPercentage !== undefined)) {
    const price = update.price ?? 0;
    const offer = update.offerPercentage ?? 0;
    if (offer > 0) {
      update.finalPrice = parseFloat((price - (price * offer) / 100).toFixed(2));
    } else {
      update.finalPrice = price;
    }
  }
});

// ─── Indexes ──────────────────────────────────────────────────────────────────

productSchema.index({ name: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ isAvailable: 1, category: 1 });

// ─── Export ───────────────────────────────────────────────────────────────────

export const Product = model<IProduct>('Product', productSchema);
