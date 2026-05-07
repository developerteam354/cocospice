import { Router } from 'express';
import multer from 'multer';
import { uploadController } from '../../controllers/admin/upload.controller.js';
import { authenticateUser } from '../../middlewares/auth.middleware.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

const router = Router();

// Public image proxy — no auth needed (key is an unguessable UUID path)
// GET /api/user/upload/image?key=user/profiles/uuid.jpg
router.get('/image', uploadController.proxyImage);

// Upload requires authentication
router.post('/', authenticateUser, upload.single('image'), uploadController.uploadImage);

export default router;
