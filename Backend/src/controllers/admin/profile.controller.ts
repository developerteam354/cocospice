import type { Request, Response, NextFunction } from 'express';
import { Admin } from '../../models/Admin.model.js';

export const profileController = {
  getProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Admin ID is attached to req by the protect middleware
      const adminId = req.admin?.id;

      if (!adminId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const admin = await Admin.findById(adminId).select('-password -refreshToken').exec();

      if (!admin) {
        res.status(404).json({ message: 'Admin not found' });
        return;
      }

      res.status(200).json({
        admin: {
          _id: admin._id,
          fullName: admin.fullName,
          email: admin.email,
          role: admin.role,
          profileImage: admin.profileImage,
          createdAt: admin.createdAt,
          updatedAt: admin.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
