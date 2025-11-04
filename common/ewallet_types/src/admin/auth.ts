export interface AdminTokenPayload {
  sub: string;
  role: string;
  type: "admin";
}

export interface GenerateAdminTokenArgs {
  user_id: string;
  role: string;
  jwt_config: {
    secret: string;
    expires_in: string;
  };
}

export interface VerifyAdminTokenArgs {
  token: string;
  jwt_config: {
    secret: string;
  };
}
