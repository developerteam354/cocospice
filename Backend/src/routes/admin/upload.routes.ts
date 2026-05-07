import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../../controllers/admin/upload.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();

// Public image proxy — no auth needed, key is an unguessable UUID
// e.g. GET /api/admin/upload/image?key=products%2Fuuid.jpg
router.get('/image', uploadController.proxyImage);

// All other upload routes require authentication
router.use(protect);
router.post('/',   upload.single('image'), uploadController.uploadImage);
router.delete('/', uploadController.deleteImage);

export default router;
