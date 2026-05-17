/**
 * Script to check orders and see which ones are missing phone numbers in shippingAddress
 */

import mongoose from 'mongoose';
import { Order } from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cocospice';

async function checkOrderPhones() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all delivery orders
    const orders = await Order.find({ orderType: 'delivery' })
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(20); // Check last 20 orders

    console.log(`📊 Checking ${orders.length} delivery orders...\n`);

    let missingCount = 0;
    let hasPhoneCount = 0;

    for (const order of orders) {
      const hasPhone = order.shippingAddress?.phone && order.shippingAddress.phone.trim() !== '';
      
      if (hasPhone) {
        hasPhoneCount++;
        console.log(`✅ Order ${order.orderId}: Has phone (${order.shippingAddress?.phone})`);
      } else {
        missingCount++;
        console.log(`❌ Order ${order.orderId}: Missing phone`);
        console.log(`   User phone: ${(order.userId as any)?.phone || 'N/A'}`);
        console.log(`   Address: ${order.shippingAddress?.line1}, ${order.shippingAddress?.city}`);
      }
    }

    console.log(`\n📈 Summary:`);
    console.log(`   Orders with phone: ${hasPhoneCount}`);
    console.log(`   Orders missing phone: ${missingCount}`);

    if (missingCount > 0) {
      console.log(`\n💡 Suggestion: Run the migration script to copy user phone to shippingAddress`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkOrderPhones();
