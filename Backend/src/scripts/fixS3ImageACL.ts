import { PutObjectAclCommand } from '@aws-sdk/client-s3';
import { getS3Client, getS3Bucket } from '../config/s3.config.js';
import { Admin } from '../models/Admin.model.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/cocospice';

async function fixS3ImageACL() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get all admins with profile images
    const admins = await Admin.find({ profileImage: { $ne: null } });
    console.log(`\nFound ${admins.length} admin(s) with profile images\n`);

    const bucket = getS3Bucket();
    const s3Client = getS3Client();

    for (const admin of admins) {
      if (!admin.profileImage) continue;

      // Extract the S3 key from the URL
      const url = admin.profileImage;
      const match = url.match(/\.com\/(.+)$/);
      
      if (!match) {
        console.log(`⚠️  Could not extract key from URL: ${url}`);
        continue;
      }

      const key = match[1];
      console.log(`📋 Admin: ${admin.fullName}`);
      console.log(`   Key: ${key}`);

      try {
        // Set the ACL to public-read
        await s3Client.send(
          new PutObjectAclCommand({
            Bucket: bucket,
            Key: key,
            ACL: 'public-read',
          })
        );
        console.log(`   ✅ ACL updated to public-read\n`);
      } catch (error: any) {
        console.error(`   ❌ Failed to update ACL: ${error.message}\n`);
      }
    }

    console.log('✅ Done!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

fixS3ImageACL();
