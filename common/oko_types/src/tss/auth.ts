export interface UserTokenPayload {
  email: string;
  wallet_id: string;
  type: "user";
}

export interface GenerateUserTokenArgs {
  wallet_id: string;
  email: string;
  jwt_config: {
    secret: string;
    expires_in: string;
  };
}
