import type { Request, Response, NextFunction } from 'express';
import { Readable } from 'stream';
import { uploadRepository } from '../../repositories/admin/upload.repository.js';
import { getS3Object } from '../../utils/s3.utils.js';

export const uploadController = {
  uploadImage: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('[UploadController] Request received');
      console.log('[UploadController] Query params:', req.query);
      console.log('[UploadController] File present:', !!req.file);
      console.log('[UploadController] Body:', req.body);
      
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
   * Image proxy — streams a private S3 object through the backend.
   * Route: GET /api/admin/upload/image?key=folder/file.jpg
   * The frontend stores the S3 key and requests images via this endpoint,
   * so the S3 bucket can remain private.
   */
  proxyImage: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const key = req.query.key as string;
      if (!key) {
        res.status(400).json({ message: 'Image key is required' });
        return;
      }

      console.log('[UploadController] Proxying image key:', key);

      const s3Response = await getS3Object(key);

      if (!s3Response.Body) {
        res.status(404).json({ message: 'Image not found' });
        return;
      }

      // Forward content-type and cache headers
      if (s3Response.ContentType) {
        res.setHeader('Content-Type', s3Response.ContentType);
      }
      if (s3Response.ContentLength) {
        res.setHeader('Content-Length', s3Response.ContentLength);
      }
      // Cache for 1 day in browser, 7 days in CDN
      res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=604800');

      // Pipe the S3 readable stream directly to the response
      const nodeStream = s3Response.Body.transformToWebStream
        ? Readable.fromWeb(s3Response.Body.transformToWebStream() as any)
        : (s3Response.Body as unknown as Readable);

      nodeStream.pipe(res);
    } catch (err: any) {
      if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
        res.status(404).json({ message: 'Image not found' });
        return;
      }
      console.error('[UploadController] proxyImage error:', err);
      next(err);
    }
  },

  deleteImage: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { key } = req.body as { key: string };
      if (!key) {
        res.status(400).json({ message: 'S3 key is required' });
        return;
      }
      await uploadRepository.deleteImage(key);
      res.status(200).json({ message: 'Image deleted' });
    } catch (err) {
      next(err);
    }
  },
};
