import { uploadImage, deleteImage } from '../../utils/cloudinary.utils.js';
import type { IUploadResult } from '../../utils/cloudinary.utils.js';

export const uploadRepository = {
  uploadImage: async (
    file: Express.Multer.File,
    folder: string = 'products'
  ): Promise<IUploadResult> => {
    return uploadImage(file, folder);
  },

  deleteImage: async (key: string): Promise<void> => {
    return deleteImage(key);
  },
};
