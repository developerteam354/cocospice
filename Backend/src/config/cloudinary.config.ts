import { v2 as cloudinary } from 'cloudinary';

let configured = false;

export const getCloudinary = () => {
  if (configured) return cloudinary;

  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;

  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      `Missing Cloudinary credentials — CLOUDINARY_CLOUD_NAME=${cloud_name ? '✓' : '✗'}, ` +
        `CLOUDINARY_API_KEY=${api_key ? '✓' : '✗'}, ` +
        `CLOUDINARY_API_SECRET=${api_secret ? '✓' : '✗'}`
    );
  }

  cloudinary.config({
    cloud_name,
    api_key,
    api_secret,
    secure: true,
  });

  configured = true;
  return cloudinary;
};

export const getCloudinaryCloudName = (): string => {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloud_name) throw new Error('Missing CLOUDINARY_CLOUD_NAME env variable');
  return cloud_name;
};
