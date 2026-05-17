/**
 * Script to check a specific order and see its shippingAddress data
 */

import mongoose from 'mongoose';
import { Order } from '../models/Order.model.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cocospice';

async function checkSpecificOrder() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Get the order ID from command line argument
    const orderId = process.argv[2] || 'ORD-202605-0052';

    console.log(`🔍 Looking for order: ${orderId}\n`);

    const order = await Order.findOne({ orderId })
      .populate('userId', 'name email phone')
      .exec();

    if (!order) {
      console.log('❌ Order not found');
      return;
    }

    console.log('📦 Order Found:');
    console.log('   Order ID:', order.orderId);
    console.log('   Order Type:', order.orderType);
    console.log('   Created:', order.createdAt);
    console.log('\n👤 User Info:');
    console.log('   Name:', (order.userId as any)?.name);
    console.log('   Email:', (order.userId as any)?.email);
    console.log('   Phone:', (order.userId as any)?.phone);
    
    console.log('\n📍 Shipping Address:');
    if (order.shippingAddress) {
      console.log('   Full Name:', order.shippingAddress.fullName);
      console.log('   Line 1:', order.shippingAddress.line1);
      console.log('   Line 2:', order.shippingAddress.line2 || '(empty)');
      console.log('   City:', order.shippingAddress.city);
      console.log('   Postcode:', order.shippingAddress.postcode);
      console.log('   📞 PHONE:', order.shippingAddress.phone || '❌ MISSING');
      console.log('   Instructions:', order.shippingAddress.instructions || '(none)');
      if (order.shippingAddress.lat && order.shippingAddress.lng) {
        console.log('   GPS:', `${order.shippingAddress.lat}, ${order.shippingAddress.lng}`);
        console.log('   Formatted Address:', order.shippingAddress.formattedAddress || '(none)');
      }
    } else {
      console.log('   ❌ No shipping address');
    }

    console.log('\n📊 Raw shippingAddress object:');
    console.log(JSON.stringify(order.shippingAddress, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

checkSpecificOrder();
