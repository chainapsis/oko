import type { UserTokenPayload } from "@oko-wallet/ewallet-types/tss";
import type { JwtPayload } from "jsonwebtoken";

export type UserTokenJWTPayload = UserTokenPayload & JwtPayload;

export type VerifyUserTokenResult =
  | { type: "invalid_token"; msg: string }
  | {
      type: "expired";
      payload: UserTokenJWTPayload;
    }
  | {
      type: "unknown_error";
      msg: string;
    };
