export interface CustomerTokenPayload {
  type: "customer";
  sub: string; // customer_user_id(uuid)
}

export interface CustomerVerifyResult {
  success: boolean;
  payload?: CustomerTokenPayload;
  error?: string;
}

export interface GenerateCustomerTokenArgs {
  user_id: string;
  jwt_config: {
    secret: string;
    expires_in: string;
  };
}

export interface VerifyCustomerTokenArgs {
  token: string;
  jwt_config: {
    secret: string;
  };
}
