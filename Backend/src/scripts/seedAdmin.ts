import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { Admin } from '../models/Admin.model.js';

const SEED_ADMIN = {
  fullName: 'Dev Team Admin',
  email:    'devteamadmin@gmail.com',
  password: 'devadmin123',
  role:     'admin' as const,
};

const seed = async (): Promise<void> => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('❌ MONGO_URI is not defined in .env');
    process.exit(1);
  }

  console.log('🔌 Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('✅ Connected');

  // Check if admin already exists
  const existing = await Admin.findOne({ email: SEED_ADMIN.email });
  if (existing) {
    console.log(`⚠️  Admin already exists: ${SEED_ADMIN.email}`);
    await mongoose.disconnect();
    process.exit(0);
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(SEED_ADMIN.password, 12);

  // Create admin
  await Admin.create({
    fullName:     SEED_ADMIN.fullName,
    email:        SEED_ADMIN.email,
    password:     hashedPassword,
    role:         SEED_ADMIN.role,
    profileImage: null,
    refreshToken: null,
  });

  console.log(`✅ Admin seeded successfully!`);
  console.log(`   Email   : ${SEED_ADMIN.email}`);
  console.log(`   Password: ${SEED_ADMIN.password}`);

  await mongoose.disconnect();
  console.log('🔌 Disconnected');
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
