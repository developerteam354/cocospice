import { Schema, model, type Document } from 'mongoose';

export interface IAdmin extends Document {
  fullName: string;
  email: string;
  password: string;
  role: 'admin';
  profileImage: string | null;
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    fullName: { type: String, required: true, trim: true },
    email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role:     { type: String, enum: ['admin'], default: 'admin' },
    profileImage: { type: String, default: null },
    refreshToken: { type: String, default: null, select: false },
  },
  { timestamps: true }
);

export const Admin = model<IAdmin>('Admin', adminSchema);
