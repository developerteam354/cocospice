import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, type IUser } from '../../models/User.model.js';

interface ITokenPayload { id: string; role: string; }
interface IAuthTokens  { accessToken: string; refreshToken: string; }

const generateTokens = (payload: ITokenPayload): IAuthTokens => ({
  accessToken:  jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' }),
});

export const userAuthService = {
  register: async (name: string, email: string, password: string, phone?: string) => {
    const exists = await User.findOne({ email }).exec();
    if (exists) throw new Error('An account with this email already exists');

    const hashed = await bcrypt.hash(password, 12);
    const user   = await User.create({ name, email, password: hashed, phone: phone || '' });

    const { accessToken, refreshToken } = generateTokens({ id: user._id.toString(), role: 'user' });
    await User.findByIdAndUpdate(user._id, { refreshToken }).exec();

    const { password: _, refreshToken: __, ...userData } = user.toObject();
    return { user: userData, accessToken, refreshToken };
  },

  login: async (email: string, password: string) => {
    const user = await User.findOne({ email }).select('+password +refreshToken').exec();
    if (!user) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Invalid email or password');

    // Block check — after password verification to avoid user enumeration
    if (!user.isActive) throw new Error('ACCOUNT_BLOCKED');

    const { accessToken, refreshToken } = generateTokens({ id: user._id.toString(), role: 'user' });
    await User.findByIdAndUpdate(user._id, { refreshToken }).exec();

    const { password: _, refreshToken: __, ...userData } = user.toObject();
    return { user: userData, accessToken, refreshToken };
  },

  refresh: async (token: string) => {
    let payload: ITokenPayload;
    try {
      payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET) as ITokenPayload;
    } catch {
      throw new Error('Invalid refresh token');
    }

    const user = await User.findOne({ refreshToken: token }).select('+refreshToken').exec();
    if (!user) throw new Error('Refresh token not found or revoked');

    // Block check on every token refresh
    if (!user.isActive) throw new Error('ACCOUNT_BLOCKED');

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({ id: payload.id, role: 'user' });
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken }).exec();

    const { password: _, refreshToken: __, ...userData } = user.toObject();
    return { user: userData, accessToken, refreshToken: newRefreshToken };
  },

  logout: async (userId: string) => {
    await User.findByIdAndUpdate(userId, { refreshToken: null }).exec();
  },

  getMe: async (userId: string) => {
    const user = await User.findById(userId).exec();
    if (!user) throw new Error('User not found');
    const { password: _, refreshToken: __, ...userData } = user.toObject();
    return userData;
  },
};
