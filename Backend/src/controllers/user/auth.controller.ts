import type { Request, Response, NextFunction } from 'express';
import { userAuthService } from '../../services/user/auth.service.js';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path:     '/',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

export const userAuthController = {
  register: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { name, email, password, phone } = req.body as {
        name: string; email: string; password: string; phone?: string;
      };

      if (!name?.trim() || !email?.trim() || !password?.trim()) {
        res.status(400).json({ message: 'Name, email and password are required' });
        return;
      }
      if (password.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters' });
        return;
      }

      const { user, accessToken, refreshToken } = await userAuthService.register(name, email, password, phone);
      res.cookie('userRefreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(201).json({ user, accessToken, message: 'Account created successfully' });
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('already exists')) {
        res.status(409).json({ message: err.message });
        return;
      }
      next(err);
    }
  },

  login: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body as { email: string; password: string };
      if (!email?.trim() || !password?.trim()) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
      }

      const { user, accessToken, refreshToken } = await userAuthService.login(email, password);
      res.cookie('userRefreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ user, accessToken, message: 'Login successful' });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'Invalid email or password') {
        res.status(401).json({ message: err.message });
        return;
      }
      if (err instanceof Error && err.message === 'ACCOUNT_BLOCKED') {
        res.status(403).json({
          code:    'USER_BLOCKED',
          message: 'Your account has been blocked by the Administrator. Please contact support.',
        });
        return;
      }
      next(err);
    }
  },

  refresh: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.userRefreshToken as string | undefined;
      if (!token) {
        res.status(401).json({ message: 'No refresh token' });
        return;
      }

      const { user, accessToken, refreshToken: newRefreshToken } = await userAuthService.refresh(token);
      res.cookie('userRefreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ user, accessToken });
    } catch (err: unknown) {
      res.clearCookie('userRefreshToken', { path: '/' });
      if (err instanceof Error && err.message === 'ACCOUNT_BLOCKED') {
        res.status(403).json({
          code:    'USER_BLOCKED',
          message: 'Your account has been blocked by the Administrator. Please contact support.',
        });
        return;
      }
      res.status(401).json({ message: 'Session expired. Please log in again.' });
    }
  },

  logout: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.userRefreshToken as string | undefined;
      if (token) {
        // Find user by refresh token and clear it
        const { User } = await import('../../models/User.model.js');
        const user = await User.findOne({ refreshToken: token }).select('+refreshToken').exec();
        if (user) await userAuthService.logout(user._id.toString());
      }
      res.clearCookie('userRefreshToken', { path: '/' });
      res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
      next(err);
    }
  },

  getMe: async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.userRefreshToken as string | undefined;
      if (!token) {
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      const { user, accessToken, refreshToken: newRefreshToken } = await userAuthService.refresh(token);
      res.cookie('userRefreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
      res.status(200).json({ user, accessToken });
    } catch (err: unknown) {
      res.clearCookie('userRefreshToken', { path: '/' });
      if (err instanceof Error && err.message === 'ACCOUNT_BLOCKED') {
        res.status(403).json({
          code:    'USER_BLOCKED',
          message: 'Your account has been blocked by the Administrator. Please contact support.',
        });
        return;
      }
      res.status(401).json({ message: 'Session expired' });
    }
  },
};
