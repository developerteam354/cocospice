import { Schema, model, type Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  profileImage: string;
  isActive: boolean;
  role: 'user';
  refreshToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true, trim: true },
    email:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    password:     { type: String, required: true, select: false },
    phone:        { type: String, default: '' },
    profileImage: { type: String, default: '' },
    isActive:     { type: Boolean, default: true },
    role:         { type: String, enum: ['user'], default: 'user' },
    refreshToken: { type: String, default: null, select: false },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);
