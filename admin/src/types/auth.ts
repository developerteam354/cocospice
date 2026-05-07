export interface IAdmin {
  id: string;
  fullName: string;
  email: string;
  role: 'admin';
  profileImage: string | null;
}

export interface IAuthResponse {
  admin: IAdmin;
  accessToken: string;
  message: string;
}

export interface IRefreshResponse {
  admin: IAdmin;
  accessToken: string;
}

export interface IAuthState {
  admin: IAdmin | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isRefreshing: boolean;
  isInitialized: boolean; // true once the first auth check has completed
}

export interface ILoginCredentials {
  email: string;
  password: string;
}
