/**
 * Migration script to add phone numbers to orders that are missing them
 * Copies the phone number from the user profile to shippingAddress.phone
 */

import mongoose from 'mongoose';
import { Order } from '../models/Order.model.js';
import { User } from '../models/User.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cocospice';

async function migrateOrderPhones() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all delivery orders without phone in shippingAddress
    const orders = await Order.find({
      orderType: 'delivery',
      $or: [
        { 'shippingAddress.phone': { $exists: false } },
        { 'shippingAddress.phone': '' },
        { 'shippingAddress.phone': null },
      ],
    }).populate('userId', 'name email phone');

    console.log(`📊 Found ${orders.length} orders missing phone numbers\n`);

    if (orders.length === 0) {
      console.log('✅ All orders already have phone numbers!');
      return;
    }

    let updatedCount = 0;
    let skippedCount = 0;

    for (const order of orders) {
      const user = order.userId as any;
      
      if (user?.phone && user.phone.trim() !== '') {
        // Update the order with user's phone
        order.shippingAddress!.phone = user.phone;
        await order.save();
        updatedCount++;
        console.log(`✅ Updated Order ${order.orderId}: Added phone ${user.phone}`);
      } else {
        skippedCount++;
        console.log(`⚠️  Skipped Order ${order.orderId}: User has no phone number`);
      }
    }

    console.log(`\n📈 Migration Summary:`);
    console.log(`   Orders updated: ${updatedCount}`);
    console.log(`   Orders skipped (no user phone): ${skippedCount}`);
    console.log(`   Total processed: ${orders.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

migrateOrderPhones();
