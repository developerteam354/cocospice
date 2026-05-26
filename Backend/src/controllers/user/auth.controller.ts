import type { Request, Response, NextFunction } from 'express';
import { userAuthService } from '../../services/user/auth.service.js';

const isProduction = process.env.NODE_ENV === 'production';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   isProduction,
  sameSite: isProduction ? 'none' as const : 'lax' as const,
  path:     '/',
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days
};

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate', Pragma: 'no-cache' };

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

      console.log('[USER AUTH CONTROLLER] Login attempt for:', email);
      const { user, accessToken, refreshToken } = await userAuthService.login(email, password);
      
      console.log('[USER AUTH CONTROLLER] Login successful, setting cookie with options:', REFRESH_COOKIE_OPTIONS);
      res.cookie('userRefreshToken', refreshToken, REFRESH_COOKIE_OPTIONS);
      console.log('[USER AUTH CONTROLLER] Cookie set, sending response');
      
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
      // Log all cookies for debugging
      if (process.env.NODE_ENV === 'development') {
        console.log('═══════════════════════════════════════════════════════');
        console.log('[USER AUTH CONTROLLER] Refresh endpoint called');
        console.log('[USER AUTH CONTROLLER] Request URL:', req.originalUrl);
        console.log('[USER AUTH CONTROLLER] Request path:', req.path);
        console.log('[USER AUTH CONTROLLER] Cookies received:', Object.keys(req.cookies || {}));
        console.log('[USER AUTH CONTROLLER] userRefreshToken present:', !!req.cookies?.userRefreshToken);
        console.log('═══════════════════════════════════════════════════════');
      }

      const token = req.cookies?.userRefreshToken as string | undefined;
      if (!token) {
        res.status(401).json({ message: 'No refresh token' });
        return;
      }

      const { user, accessToken, refreshToken: newRefreshToken } = await userAuthService.refresh(token);
      res.cookie('userRefreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
      res.set(NO_CACHE).status(200).json({ user, accessToken });
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
      // Enhanced logging for debugging
      console.log('═══════════════════════════════════════════════════════');
      console.log('[USER AUTH CONTROLLER] getMe endpoint called');
      console.log('[USER AUTH CONTROLLER] Request URL:', req.originalUrl);
      console.log('[USER AUTH CONTROLLER] Request path:', req.path);
      console.log('[USER AUTH CONTROLLER] Request origin:', req.headers.origin);
      console.log('[USER AUTH CONTROLLER] Cookie header:', req.headers.cookie);
      console.log('[USER AUTH CONTROLLER] All cookies:', req.cookies);
      console.log('[USER AUTH CONTROLLER] Cookies received:', Object.keys(req.cookies || {}));
      console.log('[USER AUTH CONTROLLER] userRefreshToken present:', !!req.cookies?.userRefreshToken);
      if (req.cookies?.userRefreshToken) {
        console.log('[USER AUTH CONTROLLER] Token preview:', req.cookies.userRefreshToken.substring(0, 20) + '...');
      }
      console.log('═══════════════════════════════════════════════════════');

      const token = req.cookies?.userRefreshToken as string | undefined;
      if (!token) {
        console.log('[USER AUTH CONTROLLER] ❌ No refresh token found - returning 401');
        res.status(401).json({ message: 'Not authenticated' });
        return;
      }

      console.log('[USER AUTH CONTROLLER] ✅ Token found, calling refresh service...');
      const { user, accessToken, refreshToken: newRefreshToken } = await userAuthService.refresh(token);
      res.cookie('userRefreshToken', newRefreshToken, REFRESH_COOKIE_OPTIONS);
      console.log('[USER AUTH CONTROLLER] ✅ Session refreshed successfully for:', user.email);
      res.set(NO_CACHE).status(200).json({ user, accessToken });
    } catch (err: unknown) {
      console.log('[USER AUTH CONTROLLER] ❌ Error in getMe:', err);
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
