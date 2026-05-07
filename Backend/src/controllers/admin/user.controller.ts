import type { Request, Response, NextFunction } from 'express';
import { User } from '../../models/User.model.js';

export const adminUserController = {
  /**
   * GET /api/admin/users
   * Returns all registered users (no passwords, no refresh tokens)
   */
  getAllUsers: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const users = await User.find()
        .select('-password -refreshToken')
        .sort({ createdAt: -1 })
        .exec();

      res.status(200).json({
        users: users.map(u => ({
          _id:          u._id,
          name:         u.name,
          email:        u.email,
          phone:        u.phone,
          profileImage: u.profileImage,
          isActive:     u.isActive,
          createdAt:    u.createdAt,
        })),
        total: users.length,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/admin/users/stats
   * Returns aggregate user counts
   */
  getUserStats: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const [total, active, blocked] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.countDocuments({ isActive: false }),
      ]);

      res.status(200).json({ total, active, blocked });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/admin/users/:id/toggle-status
   * Toggle isActive for a user — blocks or unblocks them
   * Also clears their refresh token so they are forced to re-authenticate
   */
  toggleUserStatus: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;

      const user = await User.findById(id).select('+refreshToken').exec();
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      user.isActive = !user.isActive;

      // If blocking: revoke refresh token so the next /auth/me or /auth/refresh
      // call fails immediately, forcing the frontend to log them out
      if (!user.isActive) {
        user.refreshToken = null;
      }

      await user.save();

      res.status(200).json({
        message: user.isActive ? 'User unblocked successfully' : 'User blocked successfully',
        user: {
          _id:      user._id,
          isActive: user.isActive,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
