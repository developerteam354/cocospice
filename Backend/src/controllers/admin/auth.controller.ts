import type { Request, Response, NextFunction } from 'express';
import { authService } from '../../services/admin/auth.service.js';

const isProduction = process.env.NODE_ENV === 'production';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   isProduction,  // true in production (HTTPS), false in development
  sameSite: isProduction ? 'none' as const : 'lax' as const,  // 'none' for cross-domain in production
  path:     '/api/admin',      // Restrict cookie to admin routes only
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

export const authController = {
  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('[Auth] Login attempt:', (req.body as { email?: string }).email);
      const { email, password } = req.body as { email: string; password: string };
      const { admin, accessToken, refreshToken, message } =
        await authService.login(email, password);

      res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ admin, accessToken, message });
    } catch (err) {
      next(err);
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('═══════════════════════════════════════════════════════');
        console.log('[ADMIN AUTH CONTROLLER] Refresh endpoint called');
        console.log('[ADMIN AUTH CONTROLLER] Request URL:', req.originalUrl);
        console.log('[ADMIN AUTH CONTROLLER] Request path:', req.path);
        console.log('[ADMIN AUTH CONTROLLER] Cookies received:', Object.keys(req.cookies));
        console.log('═══════════════════════════════════════════════════════');
      }
      const token = req.cookies?.refreshToken as string | undefined;

      if (!token) {
        res.status(401).json({ message: 'No refresh token' });
        return;
      }

      const { accessToken, admin, refreshToken: newRefreshToken } =
        await authService.refresh(token);

      // Rotate the refreshToken — always re-set with same options
      res.cookie('refreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ accessToken, admin });
    } catch (err) {
      next(err);
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.admin) {
        await authService.logout(req.admin._id.toString());
      }
      // path must match exactly what was used when setting the cookie
      res.clearCookie('refreshToken', { path: '/api/admin' });
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  getMe: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('═══════════════════════════════════════════════════════');
        console.log('[ADMIN AUTH CONTROLLER] getMe endpoint called');
        console.log('[ADMIN AUTH CONTROLLER] Request URL:', req.originalUrl);
        console.log('[ADMIN AUTH CONTROLLER] Request path:', req.path);
        console.log('[ADMIN AUTH CONTROLLER] Cookies received:', Object.keys(req.cookies));
        console.log('═══════════════════════════════════════════════════════');
      }
      const { password: _, refreshToken: __, ...adminData } =
        (req.admin as any).toObject();
      res.status(200).json({ admin: adminData });
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      console.log('[Auth] updateProfile — Request body:', req.body);
      console.log('[Auth] updateProfile — Admin ID:', req.admin?._id);
      
      const adminId = req.admin?._id.toString();
      if (!adminId) {
        console.error('[Auth] updateProfile — No admin ID found');
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }

      const { fullName, profileImage } = req.body as { fullName?: string; profileImage?: string };
      
      console.log('[Auth] updateProfile — Updating with:', { fullName, profileImage });
      
      const updatedAdmin = await authService.updateProfile(adminId, { fullName, profileImage });
      
      if (!updatedAdmin) {
        console.error('[Auth] updateProfile — Admin not found');
        res.status(404).json({ message: 'Admin not found' });
        return;
      }

      const { password: _, refreshToken: __, ...adminData } = updatedAdmin.toObject();
      console.log('[Auth] updateProfile — Success, returning:', adminData);
      res.status(200).json({ admin: adminData, message: 'Profile updated successfully' });
    } catch (err) {
      console.error('[Auth] updateProfile — Error:', err);
      next(err);
    }
  },
};
