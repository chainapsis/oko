import jwt from "jsonwebtoken";
import type { TokenResult } from "@oko-wallet/ewallet-types/auth";
import type {
  CustomerTokenPayload,
  GenerateCustomerTokenArgs,
  VerifyCustomerTokenArgs,
  CustomerVerifyResult,
} from "@oko-wallet/ewallet-types/ct_dashboard";
import type { Result } from "@oko-wallet/stdlib-js";

import { CUSTOMER_ISSUER, CUSTOMER_AUDIENCE } from "../constants";

export function generateCustomerToken(
  args: GenerateCustomerTokenArgs,
): Result<TokenResult, string> {
  try {
    const payload: CustomerTokenPayload = {
      sub: args.user_id,
      type: "customer",
    };

    const token: string = jwt.sign(payload, args.jwt_config.secret, {
      algorithm: "HS256",
      expiresIn: args.jwt_config.expires_in as jwt.SignOptions["expiresIn"],
      issuer: CUSTOMER_ISSUER,
      audience: CUSTOMER_AUDIENCE,
    });

    return {
      success: true,
      data: {
        token,
      },
    };
  } catch (error) {
    console.error("Customer token generation error:", error);
    return {
      success: false,
      err: `Failed to generate token: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

export function verifyCustomerToken(
  args: VerifyCustomerTokenArgs,
): CustomerVerifyResult {
  try {
    const payload = jwt.verify(args.token, args.jwt_config.secret, {
      issuer: CUSTOMER_ISSUER,
      audience: CUSTOMER_AUDIENCE,
    }) as CustomerTokenPayload;

    if (payload.type !== "customer") {
      return {
        success: false,
        error: "Invalid token type",
      };
    }

    return {
      success: true,
      payload,
    };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return {
        success: false,
        error: `Invalid token: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
    if (error instanceof jwt.TokenExpiredError) {
      return {
        success: false,
        error: `Token expired: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
    console.error("Customer token verification error:", error);
    return {
      success: false,
      error: `Token verification failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
