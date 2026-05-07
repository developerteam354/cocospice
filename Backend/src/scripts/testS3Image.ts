import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { getS3Client, getS3Bucket } from '../config/s3.config.js';
import dotenv from 'dotenv';

dotenv.config();

async function testS3Image() {
  try {
    const bucket = getS3Bucket();
    const key = 'admin/profiles/3fac5e5f-0a29-43ec-9fbf-268b036ff633.jpeg';
    
    console.log(`\n🔍 Checking S3 object:`);
    console.log(`   Bucket: ${bucket}`);
    console.log(`   Key: ${key}`);
    console.log(`   Region: ${process.env.AWS_REGION}`);
    
    const command = new HeadObjectCommand({
      Bucket: bucket,
      Key: key,
    });
    
    const response = await getS3Client().send(command);
    
    console.log(`\n✅ Object exists in S3!`);
    console.log(`   Content-Type: ${response.ContentType}`);
    console.log(`   Content-Length: ${response.ContentLength} bytes`);
    console.log(`   Last-Modified: ${response.LastModified}`);
    console.log(`   ETag: ${response.ETag}`);
    
    const url = `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
    console.log(`\n📎 Public URL: ${url}`);
    console.log(`\n⚠️  Note: If the image doesn't load in browser, check:`);
    console.log(`   1. S3 bucket public access settings`);
    console.log(`   2. S3 bucket CORS configuration`);
    console.log(`   3. Object ACL permissions`);
    
  } catch (error: any) {
    if (error.name === 'NotFound') {
      console.error(`\n❌ Object does not exist in S3!`);
      console.error(`   The image was probably not uploaded successfully.`);
    } else if (error.name === 'Forbidden') {
      console.error(`\n❌ Access denied!`);
      console.error(`   Check your AWS credentials and bucket permissions.`);
    } else {
      console.error(`\n❌ Error:`, error.message);
    }
  }
}

testS3Image();
