import { uploadToS3, deleteFromS3 } from '../../utils/s3.utils.js';
import type { IS3UploadResult } from '../../utils/s3.utils.js';

export const uploadRepository = {
  uploadImage: async (
    file: Express.Multer.File,
    folder: string
  ): Promise<IS3UploadResult> => {
    return uploadToS3(file, folder);
  },

  deleteImage: async (key: string): Promise<void> => {
    return deleteFromS3(key);
  },
};
