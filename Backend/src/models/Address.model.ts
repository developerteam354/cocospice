import { Schema, model, type Document, type Types } from 'mongoose';

// ─── Interface ────────────────────────────────────────────────────────────────

export interface IAddress extends Document {
  sessionId: string;       // userId or guestId — same pattern as Cart
  label: string;           // e.g. "Home", "Office"
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  phone: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schema ───────────────────────────────────────────────────────────────────

const addressSchema = new Schema<IAddress>(
  {
    sessionId: { type: String, required: true, index: true },
    label:     { type: String, required: true, trim: true },
    fullName:  { type: String, required: true, trim: true },
    line1:     { type: String, required: true, trim: true },
    line2:     { type: String, default: '', trim: true },
    city:      { type: String, required: true, trim: true },
    postcode:  { type: String, required: true, trim: true },
    phone:     { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-expire addresses after 1 year of inactivity
addressSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 });

export const Address = model<IAddress>('Address', addressSchema);
