import type { Request, Response, NextFunction } from 'express';
import { User } from '../../models/User.model.js';
import bcrypt from 'bcrypt';

export const userProfileController = {
  /**
   * GET /api/user/profile
   * Get user profile
   */
  getProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId; // Set by auth middleware

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const user = await User.findById(userId).select('-password -refreshToken').exec();

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      res.status(200).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          profileImage: user.profileImage,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * PATCH /api/user/profile
   * Update user profile
   */
  updateProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).userId; // Set by auth middleware

      if (!userId) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { name, email, phone, profileImage, password } = req.body as {
        name?: string;
        email?: string;
        phone?: string;
        profileImage?: string;
        password?: string;
      };

      // Find user
      const user = await User.findById(userId).select('+password').exec();

      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }

      // Validate and update fields
      if (name !== undefined) {
        if (!name.trim()) {
          res.status(400).json({ message: 'Name cannot be empty' });
          return;
        }
        user.name = name.trim();
      }

      if (email !== undefined) {
        if (!email.trim()) {
          res.status(400).json({ message: 'Email cannot be empty' });
          return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          res.status(400).json({ message: 'Invalid email format' });
          return;
        }

        // Check if email is already taken by another user
        const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: userId } });
        if (existingUser) {
          res.status(409).json({ message: 'Email already in use' });
          return;
        }

        user.email = email.toLowerCase().trim();
      }

      if (phone !== undefined) {
        user.phone = phone.trim();
      }

      if (profileImage !== undefined) {
        user.profileImage = profileImage;
      }

      if (password !== undefined) {
        if (password.length < 6) {
          res.status(400).json({ message: 'Password must be at least 6 characters' });
          return;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
      }

      // Save updated user
      await user.save();

      // Return updated user (without password)
      const updatedUser = await User.findById(userId).select('-password -refreshToken').exec();

      res.status(200).json({
        message: 'Profile updated successfully',
        user: {
          _id: updatedUser!._id,
          name: updatedUser!.name,
          email: updatedUser!.email,
          phone: updatedUser!.phone,
          profileImage: updatedUser!.profileImage,
          role: updatedUser!.role,
          createdAt: updatedUser!.createdAt,
          updatedAt: updatedUser!.updatedAt,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};
