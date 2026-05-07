import { Admin, type IAdmin } from '../../models/Admin.model.js';
import { BaseRepository } from '../base.repository.js';

export class AuthRepository extends BaseRepository<IAdmin> {
  constructor() {
    super(Admin);
  }

  async findByEmail(email: string): Promise<IAdmin | null> {
    return Admin.findOne({ email }).select('+password +refreshToken').exec();
  }

  async updateRefreshToken(id: string, token: string | null): Promise<void> {
    await Admin.findByIdAndUpdate(id, { refreshToken: token }).exec();
  }

  async findByRefreshToken(token: string): Promise<IAdmin | null> {
    return Admin.findOne({ refreshToken: token }).exec();
  }

  async updateProfile(
    id: string,
    updates: { fullName?: string; profileImage?: string }
  ): Promise<IAdmin | null> {
    const updateData: Record<string, unknown> = {};
    if (updates.fullName !== undefined) updateData.fullName = updates.fullName;
    if (updates.profileImage !== undefined) updateData.profileImage = updates.profileImage;

    return Admin.findByIdAndUpdate(id, updateData, { new: true }).exec();
  }
}

export const authRepository = new AuthRepository();
