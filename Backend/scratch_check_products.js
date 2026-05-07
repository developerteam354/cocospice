import mongoose from 'mongoose';
import { Product } from './src/models/Product.model.js';
import dotenv from 'dotenv';
dotenv.config();

async function checkProducts() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/cocospice';
    console.log(`Connecting to: ${uri.split('@')[1] || uri}`);
    await mongoose.connect(uri);
    const products = await Product.find({});
    console.log(`Total Products: ${products.length}`);
    products.forEach(p => {
      console.log(`- ${p.name} (hasSpiceLevel: ${p.hasSpiceLevel})`);
    });
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkProducts();
