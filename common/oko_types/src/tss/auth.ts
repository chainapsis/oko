export interface UserTokenPayload {
  email?: string;
  wallet_id: string;
  type: "user";
}

export interface GenerateUserTokenArgs {
  wallet_id: string;
  email?: string;
  jwt_config: {
    secret: string;
    expires_in: string;
  };
}

export interface UserTokenPayloadV2 {
  email?: string;
  wallet_id_secp256k1: string;
  wallet_id_ed25519: string;
  type: "user";
}

export interface GenerateUserTokenArgsV2 {
  wallet_id_secp256k1: string;
  wallet_id_ed25519: string;
  email?: string;
  jwt_config: {
    secret: string;
    expires_in: string;
  };
}
