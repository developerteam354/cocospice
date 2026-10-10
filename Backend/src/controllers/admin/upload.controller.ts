import type { Request, Response, NextFunction } from 'express';
import { uploadRepository } from '../../repositories/admin/upload.repository.js';
import { getCloudinaryUrl } from '../../utils/cloudinary.utils.js';

export const uploadController = {
  uploadImage: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('[UploadController] Request received');
      console.log('[UploadController] Query params:', req.query);
      console.log('[UploadController] File present:', !!req.file);

      const file = req.file;
      if (!file) {
        console.error('[UploadController] No file in request. Multer may have rejected it.');
        res.status(400).json({ message: 'No image file provided' });
        return;
      }

      const folder = (req.query.folder as string) ?? 'products';
      console.log('[UploadController] Uploading to folder:', folder);

      const result = await uploadRepository.uploadImage(file, folder);
      console.log('[UploadController] Upload successful:', result);

      res.status(200).json(result);
    } catch (err) {
      console.error('[UploadController] uploadImage error:', err);
      next(err);
    }
  },

  /**
   * Image proxy / redirect — Cloudinary assets are public HTTPS URLs.
   * Route: GET /api/admin/upload/image?key=cocospice/products/...
   * Also accepts a full URL via ?key= or ?url=
   */
  proxyImage: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = (req.query.key as string) || (req.query.url as string);
      if (!key) {
        res.status(400).json({ message: 'Image key is required' });
        return;
      }

      const url = getCloudinaryUrl(key);
      if (!url) {
        res.status(404).json({ message: 'Image not found' });
        return;
      }

      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');
      res.redirect(302, url);
    } catch (err) {
      console.error('[UploadController] proxyImage error:', err);
      next(err);
    }
  },

  deleteImage: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.body as { key: string };
      if (!key) {
        res.status(400).json({ message: 'Image key is required' });
        return;
      }
      await uploadRepository.deleteImage(key);
      res.status(200).json({ message: 'Image deleted' });
    } catch (err) {
      next(err);
    }
  },
};
