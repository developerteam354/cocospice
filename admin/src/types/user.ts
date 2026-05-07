export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profileImage: string;
  isActive: boolean;
  createdAt: string;
}

export interface IUserStats {
  total: number;
  active: number;
  blocked: number;
}
