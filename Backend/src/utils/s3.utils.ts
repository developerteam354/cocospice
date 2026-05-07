import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, getS3Bucket } from '../config/s3.config.js';
import { randomUUID } from 'crypto';
import path from 'path';

export interface IS3UploadResult {
  url: string;
  key: string;
}

export const uploadToS3 = async (
  file: Express.Multer.File,
  folder: string = 'products'
): Promise<IS3UploadResult> => {
  const bucket = getS3Bucket();
  const region = process.env.AWS_REGION!;
  const ext    = path.extname(file.originalname).toLowerCase();
  const key    = `${folder}/${randomUUID()}${ext}`;

  console.log(`[S3] Uploading → bucket=${bucket} key=${key} size=${file.size} mime=${file.mimetype}`);

  try {
    await getS3Client().send(
      new PutObjectCommand({
        Bucket:      bucket,
        Key:         key,
        Body:        file.buffer,
        ContentType: file.mimetype,
      })
    );
  } catch (err) {
    console.error('[S3] Upload failed:', err);
    throw err;
  }

  // Virtual-hosted style URL (works for all regions including eu-north-1)
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  console.log(`[S3] Upload success → ${url}`);
  return { url, key };
};

/**
 * Generate a short-lived pre-signed URL for a private S3 object.
 * Default expiry: 1 hour (3600 seconds).
 */
export const getSignedImageUrl = async (
  key: string,
  expiresIn = 3600
): Promise<string> => {
  const bucket = getS3Bucket();
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(getS3Client(), command, { expiresIn });
};

/**
 * Stream an S3 object directly — used by the image-proxy endpoint.
 * Returns the raw GetObjectCommandOutput so the controller can pipe Body.
 */
export const getS3Object = async (key: string) => {
  const bucket = getS3Bucket();
  const command = new GetObjectCommand({ Bucket: bucket, Key: key });
  return getS3Client().send(command);
};

export const deleteFromS3 = async (key: string): Promise<void> => {
  const bucket = getS3Bucket();
  console.log(`[S3] Deleting → bucket=${bucket} key=${key}`);
  try {
    await getS3Client().send(
      new DeleteObjectCommand({ Bucket: bucket, Key: key })
    );
    console.log(`[S3] Delete success → ${key}`);
  } catch (err) {
    console.error('[S3] Delete failed:', err);
    throw err;
  }
};
