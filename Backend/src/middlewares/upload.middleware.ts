import multer from 'multer';
import type { Request } from 'express';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_SIZE_MB = 20;

const storage = multer.memoryStorage();

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (ALLOWED_MIME.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, WEBP and AVIF images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
});

// thumbnail (1) + gallery (up to 5)
export const uploadProductImages = upload.fields([
  { name: 'thumbnail', maxCount: 1 },
  { name: 'gallery',   maxCount: 5 },
]);

// Category image (1)
export const uploadCategoryImage = upload.single('categoryImage');
