import { Schema, model, type Document } from 'mongoose';

export interface ICategory extends Document {
  name:         string;
  description:  string;
  categoryImage: string;
  isListed:     boolean;
  createdAt:    Date;
  updatedAt:    Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name:         { type: String, required: true, trim: true, unique: true },
    description:  { type: String, default: '', trim: true },
    categoryImage: { type: String, default: '' },
    isListed:     { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.index({ name: 'text' });

export const Category = model<ICategory>('Category', categorySchema);
