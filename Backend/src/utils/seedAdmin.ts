import bcrypt from 'bcrypt';
import { Admin } from '../models/Admin.model.js';

/**
 * Seeds the initial admin user into MongoDB Atlas
 * This function is safe to call multiple times - it checks for existing admin first
 */
export const seedAdminUser = async (): Promise<void> => {
  try {
    const adminEmail = 'devteamadmin@gmail.com';
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log('ℹ️  Admin user already exists in Atlas');
      return;
    }

    // Hash the password using bcrypt (12 rounds for security)
    const hashedPassword = await bcrypt.hash('devadmin123', 12);

    // Create the admin document
    const newAdmin = await Admin.create({
      email: adminEmail,
      password: hashedPassword,
      fullName: 'Dev Team Admin',
      role: 'admin',
      profileImage: null,
      refreshToken: null,
    });

    console.log('✅ Admin user seeded successfully to Atlas');
    console.log(`   Email: ${newAdmin.email}`);
    console.log(`   Full Name: ${newAdmin.fullName}`);
    console.log(`   Role: ${newAdmin.role}`);
  } catch (error) {
    console.error('❌ Error seeding admin user:', (error as Error).message);
    throw error;
  }
};
