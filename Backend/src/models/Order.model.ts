import { Schema, model, type Document, type Types } from 'mongoose';

// ─── Interfaces ───────────────────────────────────────────────────────────────

export interface IOrderItem {
  productId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  selectedExtraOptions?: Array<{ name: string; price: number }>;
  subtotal: number;
}

export interface IShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  phone: string;
  instructions?: string;
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'On the Way' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'Cash on Delivery' | 'Card' | 'Online';
export type PaymentStatus = 'Pending' | 'Paid' | 'Failed';

export interface IOrder extends Document {
  orderId: string;
  userId: Types.ObjectId;
  items: IOrderItem[];
  orderType: 'delivery' | 'collection';
  orderNote: string;
  
  // Pricing
  subtotal: number;
  codCharge: number;
  totalAmount: number;
  
  // Payment
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  stripePaymentIntentId?: string;   // Stripe reference for card payments
  
  // Status
  orderStatus: OrderStatus;
  
  // Delivery
  shippingAddress?: IShippingAddress;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// ─── Schemas ──────────────────────────────────────────────────────────────────

const extraOptionSchema = new Schema({
  name:  { type: String, required: true },
  price: { type: Number, required: true },
}, { _id: false });

const orderItemSchema = new Schema({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name:      { type: String, required: true },
  price:     { type: Number, required: true },
  quantity:  { type: Number, required: true, min: 1 },
  selectedExtraOptions: { type: [extraOptionSchema], default: [] },
  subtotal:  { type: Number, required: true },
}, { _id: false });

const shippingAddressSchema = new Schema({
  fullName:     { type: String, required: true },
  line1:        { type: String, required: true },
  line2:        { type: String },
  city:         { type: String, required: true },
  postcode:     { type: String, required: true },
  phone:        { type: String, required: true },
  instructions: { type: String, default: '' },   // delivery instructions from checkout
}, { _id: false });

const orderSchema = new Schema<IOrder>(
  {
    orderId: { 
      type: String, 
      required: true, 
      unique: true,
      index: true,
    },
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true,
      index: true,
    },
    items: { 
      type: [orderItemSchema], 
      required: true,
      validate: {
        validator: (v: IOrderItem[]) => v.length > 0,
        message: 'Order must have at least one item',
      },
    },
    orderType: { 
      type: String, 
      enum: ['delivery', 'collection'], 
      required: true,
    },
    orderNote: { 
      type: String, 
      default: '',
    },
    
    // Pricing
    subtotal: { 
      type: Number, 
      required: true,
      min: 0,
    },
    codCharge: { 
      type: Number, 
      default: 0,
      min: 0,
    },
    totalAmount: { 
      type: Number, 
      required: true,
      min: 0,
    },
    
    // Payment
    paymentMethod: { 
      type: String, 
      enum: ['Cash on Delivery', 'Card', 'Online'], 
      required: true,
    },
    paymentStatus: { 
      type: String, 
      enum: ['Pending', 'Paid', 'Failed'], 
      default: 'Pending',
    },
    stripePaymentIntentId: {
      type: String,
      default: null,
    },
    
    // Status
    orderStatus: { 
      type: String, 
      enum: ['Pending', 'Confirmed', 'On the Way', 'Delivered', 'Cancelled'], 
      default: 'Pending',
      index: true,
    },
    
    // Delivery
    shippingAddress: { 
      type: shippingAddressSchema,
      required: function(this: IOrder) {
        return this.orderType === 'delivery';
      },
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

// ─── Static Methods ───────────────────────────────────────────────────────────

orderSchema.statics.generateOrderId = async function(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Find the last order for this month
  const lastOrder = await this.findOne({
    orderId: new RegExp(`^ORD-${year}${month}-`),
  }).sort({ orderId: -1 });
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderId.split('-')[2]);
    sequence = lastSequence + 1;
  }
  
  return `ORD-${year}${month}-${String(sequence).padStart(4, '0')}`;
};

// ─── Export ───────────────────────────────────────────────────────────────────

export const Order = model<IOrder>('Order', orderSchema);
