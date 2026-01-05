export interface UserTokenPayload {
  email: string;
  wallet_id: string;
  wallet_id_ed25519?: string;
  type: "user";
}

export interface GenerateUserTokenArgs {
  wallet_id: string;
  wallet_id_ed25519?: string;
  email: string;
  jwt_config: {
    secret: string;
    expires_in: string;
  };
}
