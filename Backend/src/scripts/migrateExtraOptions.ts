/**
 * Migration: Convert old string[] extraOptions to {name, price}[] format
 *
 * Run with:  npx tsx src/scripts/migrateExtraOptions.ts
 */

import 'dotenv/config';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI || '';

async function migrate() {
  if (!MONGO_URI) {
    console.error('❌ MONGO_URI not set in .env');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB');

  const db = mongoose.connection.db!;
  const collection = db.collection('products');

  // Find all products where extraOptions contains strings (old format)
  const products = await collection.find({
    extraOptions: { $elemMatch: { $type: 'string' } },
  }).toArray();

  console.log(`🔍 Found ${products.length} products with old string[] extraOptions`);

  if (products.length === 0) {
    console.log('✅ No migration needed — all products already use the new format');
    await mongoose.disconnect();
    return;
  }

  let updated = 0;
  for (const product of products) {
    const oldOptions: unknown[] = product.extraOptions ?? [];
    const newOptions = oldOptions.map((opt) => {
      if (typeof opt === 'string') return { name: opt, price: 0 };
      // Already an object — keep as-is
      return opt;
    });

    await collection.updateOne(
      { _id: product._id },
      { $set: { extraOptions: newOptions } }
    );
    updated++;
    console.log(`  ✔ Migrated: ${product.name} (${oldOptions.length} options)`);
  }

  console.log(`\n✅ Migration complete — updated ${updated} products`);
  await mongoose.disconnect();
}

migrate().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
