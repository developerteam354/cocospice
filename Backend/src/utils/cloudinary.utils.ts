import { Readable } from 'stream';
import { getCloudinary, getCloudinaryCloudName } from '../config/cloudinary.config.js';

export interface IUploadResult {
  url: string;
  key: string; // Cloudinary public_id
}

const ROOT_FOLDER = 'cocospice';

/**
 * Upload a multer memory file to Cloudinary.
 * `key` is the Cloudinary public_id (used for deletes).
 * `url` is the HTTPS delivery URL.
 */
export const uploadImage = async (
  file: Express.Multer.File,
  folder: string = 'products'
): Promise<IUploadResult> => {
  const cloudinary = getCloudinary();
  const targetFolder = `${ROOT_FOLDER}/${folder}`.replace(/\/+/g, '/');

  console.log(
    `[Cloudinary] Uploading → folder=${targetFolder} size=${file.size} mime=${file.mimetype}`
  );

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: targetFolder,
        resource_type: 'image',
        overwrite: false,
      },
      (error, result) => {
        if (error || !result) {
          console.error('[Cloudinary] Upload failed:', error);
          reject(error ?? new Error('Cloudinary upload returned no result'));
          return;
        }

        console.log(`[Cloudinary] Upload success → ${result.secure_url}`);
        resolve({
          url: result.secure_url,
          key: result.public_id,
        });
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
};

/** Build a public Cloudinary delivery URL from a public_id */
export const getCloudinaryUrl = (publicId: string): string => {
  if (!publicId) return '';
  if (/^https?:\/\//i.test(publicId)) return publicId;
  if (publicId.includes('res.cloudinary.com')) return publicId;

  const cloud = getCloudinaryCloudName();
  return `https://res.cloudinary.com/${cloud}/image/upload/${publicId}`;
};

export const deleteImage = async (publicId: string): Promise<void> => {
  if (!publicId || publicId.startsWith('placeholder/') || publicId.startsWith('import/')) {
    return;
  }

  // Skip legacy S3 keys — they are not Cloudinary assets
  if (publicId.includes('amazonaws.com')) return;

  console.log(`[Cloudinary] Deleting → ${publicId}`);
  try {
    const cloudinary = getCloudinary();
    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    console.log(`[Cloudinary] Delete success → ${publicId}`);
  } catch (err) {
    console.error('[Cloudinary] Delete failed:', err);
    throw err;
  }
};

// Aliases so existing imports keep compiling during migration
export const uploadToS3 = uploadImage;
export const deleteFromS3 = deleteImage;
export type IS3UploadResult = IUploadResult;
