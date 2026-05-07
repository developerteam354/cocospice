import mongoose from 'mongoose';
import { Admin } from '../models/Admin.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cocospice';

async function fixProfileImageUrls() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find all admins with profile images
    const admins = await Admin.find({ profileImage: { $ne: null } });
    
    console.log(`\nFound ${admins.length} admin(s) with profile images:`);
    
    for (const admin of admins) {
      console.log(`\n📋 Admin: ${admin.fullName} (${admin.email})`);
      console.log(`   Current URL: ${admin.profileImage}`);
      
      if (admin.profileImage) {
        // Check if URL has the malformed pattern
        if (admin.profileImage.includes('.amazonaws.aws.com')) {
          const fixedUrl = admin.profileImage.replace('.amazonaws.aws.com', '.amazonaws.com');
          console.log(`   ❌ Malformed URL detected!`);
          console.log(`   ✅ Fixed URL: ${fixedUrl}`);
          
          admin.profileImage = fixedUrl;
          await admin.save();
          console.log(`   💾 Updated in database`);
        } else if (admin.profileImage.includes('.amazonaws.com')) {
          console.log(`   ✅ URL is correct`);
        } else {
          console.log(`   ⚠️  Unknown URL format`);
        }
      }
    }
    
    console.log('\n✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixProfileImageUrls();
