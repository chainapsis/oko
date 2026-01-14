import type {
  UserTokenPayload,
  UserTokenPayloadV2,
} from "@oko-wallet/oko-types/tss";
import type { JwtPayload } from "jsonwebtoken";

export type UserTokenJWTPayload = UserTokenPayload & JwtPayload;
export type UserTokenJWTPayloadV2 = UserTokenPayloadV2 & JwtPayload;

export type VerifyUserTokenResult =
  | { type: "invalid_token"; msg: string }
  | {
      type: "expired";
      payload: UserTokenJWTPayload | UserTokenJWTPayloadV2;
    }
  | {
      type: "unknown_error";
      msg: string;
    };
