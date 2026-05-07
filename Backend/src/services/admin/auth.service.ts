import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authRepository } from '../../repositories/admin/auth.repository.js';
import type { IAdmin } from '../../models/Admin.model.js';

interface ITokenPayload {
  id: string;
  role: string;
}

interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

interface ILoginResult {
  admin: Omit<IAdmin, 'password' | 'refreshToken'>;
  accessToken: string;
  refreshToken: string;
  message: string;
}

const generateTokens = (payload: ITokenPayload): IAuthTokens => {
  const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: '7d',
  });
  return { accessToken, refreshToken };
};

export const authService = {
  login: async (email: string, password: string): Promise<ILoginResult> => {
    const admin = await authRepository.findByEmail(email);
    if (!admin) throw new Error('Invalid credentials');

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) throw new Error('Invalid credentials');

    const { accessToken, refreshToken } = generateTokens({
      id: admin._id.toString(),
      role: admin.role,
    });

    await authRepository.updateRefreshToken(admin._id.toString(), refreshToken);

    const { password: _, refreshToken: __, ...adminData } = admin.toObject();

    return {
      admin: adminData as Omit<IAdmin, 'password' | 'refreshToken'>,
      accessToken,
      refreshToken,
      message: 'Login successful',
    };
  },

  refresh: async (token: string): Promise<{ accessToken: string; refreshToken: string; admin: IAdmin }> => {
    let payload: ITokenPayload;
    try {
      payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET) as ITokenPayload;
    } catch {
      throw new Error('Invalid refresh token');
    }

    const admin = await authRepository.findByRefreshToken(token);
    if (!admin) throw new Error('Refresh token not found');

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({
      id: payload.id,
      role: payload.role,
    });

    await authRepository.updateRefreshToken(admin._id.toString(), newRefreshToken);

    return { accessToken, refreshToken: newRefreshToken, admin };
  },

  logout: async (adminId: string): Promise<void> => {
    await authRepository.updateRefreshToken(adminId, null);
  },

  updateProfile: async (
    adminId: string,
    updates: { fullName?: string; profileImage?: string }
  ): Promise<IAdmin | null> => {
    return authRepository.updateProfile(adminId, updates);
  },
};
