import type { AuthType } from "@oko-wallet/oko-types/auth";

export interface OAuthUser {
  type: AuthType;
  user_identifier: string;
}

export type OAuthValidationFail =
  | {
      type: "client_id_not_same";
      message: string;
    }
  | {
      type: "invalid_token";
      message: string;
    }
  | {
      type: "email_not_verified";
      message: string;
    }
  | {
      type: "invalid_issuer";
      message: string;
    }
  | {
      type: "token_expired";
      message: string;
    }
  | {
      type: "unknown";
      message: string;
    };
