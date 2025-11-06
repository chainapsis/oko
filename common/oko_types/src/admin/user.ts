export interface EWalletAdminUser {
  user_id: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: boolean;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  admin: {
    user_id: string;
    role: string;
  };
  token: string;
}

export interface AdminLogoutResponse {
  message: string;
}
